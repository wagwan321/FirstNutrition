// Pull the First Nutrition catalog (owner-approved reuse) from
// new-website.firstnutrition.com: products + variants + descriptions, brands
// (with logos), category tree, reels, plus logo/certification images.
//   node scripts/catalog/scrape.mjs . scripts/catalog/.data
// The product list to fetch is index.json ([id, name, card label]) next to
// this file. Then run build-catalog.mjs to regenerate src/data/*.json.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fetchPage, findValue, rscRows, deref } from './rsc.mjs'

const [projectDir, dataDir] = process.argv.slice(2)
const SITE = 'https://new-website.firstnutrition.com'
const ODOO = 'https://jdsjordan-first-nutirition-erp.odoo.com'
const imgDir = join(projectDir, 'public', 'images', 'fn')
for (const d of ['products', 'brands', 'categories', 'site']) mkdirSync(join(imgDir, d), { recursive: true })
mkdirSync(dataDir, { recursive: true })

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function download(url, file) {
  if (existsSync(file)) return 'cached'
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!res.ok) return `HTTP ${res.status}`
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(file, buf)
  return `${res.headers.get('content-type')} ${buf.length}`
}

// Download, naming the file by its content type. Returns the extension.
async function downloadAuto(url, fileNoExt) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!res.ok) return null
  const type = res.headers.get('content-type') || ''
  const ext = /webp/.test(type) ? 'webp' : /png/.test(type) ? 'png' : /jpe?g/.test(type) ? 'jpg' : /svg/.test(type) ? 'svg' : null
  if (!ext) return null
  writeFileSync(`${fileNoExt}.${ext}`, Buffer.from(await res.arrayBuffer()))
  return ext
}

function saveDataUrl(dataUrl, fileNoExt) {
  const m = /^data:image\/([a-z+]+);base64,(.*)$/s.exec(dataUrl || '')
  if (!m) return null
  const ext = m[1] === 'svg+xml' ? 'svg' : m[1] === 'jpeg' ? 'jpg' : m[1]
  writeFileSync(`${fileNoExt}.${ext}`, Buffer.from(m[2], 'base64'))
  return ext
}

// ---------- home page: categories, brands, reels ----------
const homeText = await fetchPage(SITE + '/')
const homeRows = rscRows(homeText)

const allCategories = findValue(homeText, 'allCategories') || []
const homeCategories = findValue(homeText, 'categories', 'image_1920') || []
const brandsRaw = findValue(homeText, 'brands', 'Optimum') || []
const videos = findValue(homeText, 'awarenessVideos') || []

const brands = brandsRaw.map(b => {
  const slug = slugify(b.name)
  const ext = saveDataUrl(deref(homeRows, b.image_1920) || deref(homeRows, b.image_url), join(imgDir, 'brands', slug))
  return { id: b.id, name: b.name, slug, logo: ext ? `/images/fn/brands/${slug}.${ext}` : null,
           description: b.description || '', productIds: b.product_template_ids || [], featured: !!b.is_on_slider }
})
console.log('brands', brands.length, 'logos', brands.filter(b => b.logo).length)

for (const c of homeCategories) {
  c.ext = await downloadAuto(`${ODOO}/web/image/product.public.category/${c.id}/image_512`, join(imgDir, 'categories', String(c.id)))
  console.log('category', c.id, c.name, c.ext)
}

writeFileSync(join(dataDir, 'home.json'), JSON.stringify({
  allCategories, homeCategories: homeCategories.map(({ id, name, ext }) => ({ id, name, img: ext ? `/images/fn/categories/${id}.${ext}` : null })), brands,
  videos: videos.map(v => ({ ...v, image_1920: undefined })),
}, null, 1))

// ---------- site images: logos, certifications, payments ----------
for (const [url, name] of [
  ['/_next/static/media/logo.5ae93bd9.svg', 'logo.svg'],
  ['/_next/static/media/light_logo.9e86f5c5.svg', 'logo-light.svg'],
  ['/_next/static/media/TUV%20logo-01.700f51d7.svg', 'tuv-iso-9001.svg'],
  ['/_next/static/media/TUV%20logo-02.6bd0af1b.svg', 'tuv-iso-22000.svg'],
  ['/_next/static/media/TUV%20logo-03.3aa5adf1.svg', 'tuv-iso-45001.svg'],
  ['/_next/static/media/payment_methods.017727c0.png', 'payment-methods.png'],
]) console.log(name, await download(SITE + url, join(imgDir, 'site', name)))

// ---------- products ----------
// [id, name, card label] from the shop listing; the page URL needs Odoo's slug.
const index = JSON.parse(readFileSync(new URL('./index.json', import.meta.url), 'utf8'))
const only = process.argv[4] ? new Set(process.argv[4].split(',').map(Number)) : null
const entries = index.filter(([id]) => !only || only.has(id))
const odooSlug = (s) => s.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[-\s]+/g, '-')
const cardLabel = Object.fromEntries(index.map(([id, , label]) => [id, label]))

function parseVariant(v, lines) {
  const m = /\(([^()]*)\)\s*$/.exec(v.display_name || '')
  const attrs = {}
  if (m) for (const part of m[1].split(/,\s+/)) {
    const line = lines.find(l => l.values.some(x => x.name === part))
    attrs[(line?.attribute_name || 'option').toLowerCase()] = part
  }
  return { id: v.id, attrs, price: Math.round((v.price ?? v.lst_price) * 2) / 2, available: !!v.is_available, qty: v.available_qty ?? null }
}

const products = []
async function scrapeProduct([id, name]) {
  // Odoo transliterates symbols (™ -> tm, ® -> r) before slugifying; try both forms.
  const slugs = [...new Set([odooSlug(name), odooSlug(name.replace(/™/g, 'tm').replace(/®/g, 'r'))])]
  let text, p
  for (const slug of slugs) {
    text = await fetchPage(`${SITE}/product/${slug}-${id}`)
    p = findValue(text, 'product', `"id":${id},"name"`)
    if (p) break
  }
  if (!p) throw new Error('no product json')
  const rows = rscRows(text)
  const lines = (Array.isArray(p.attributeLines) ? p.attributeLines : []).map(l => ({
    attribute_name: l.attribute_name, values: l.values.map(x => ({ name: x.name })),
  }))
  const variants = (Array.isArray(p.variants) ? p.variants : []).map(v => parseVariant(v, lines))
  const descHtml = deref(rows, p.description_ecommerce) || deref(rows, p.website_description) || ''
  const prod = {
    id, name: p.name, slug: p.slug || slugify(p.name), brand: p.brand_name || '',
    publicCategory: p.public_categ_id?.[1] || '', publicCategoryId: p.public_categ_id?.[0] ?? null,
    internalCategory: p.categ_id?.[1] || '', cardLabel: cardLabel[id] || '',
    minPrice: Math.round(p.min_price * 2) / 2, maxPrice: Math.round(p.max_price * 2) / 2,
    available: !!p.is_available, qty: p.available_qty ?? null,
    attributes: lines.map(l => ({ name: l.attribute_name.toLowerCase(), values: l.values.map(x => x.name) })),
    variants, related: p.alternative_product_ids || [], boughtTogether: p.optional_product_ids || [],
    descriptionHtml: typeof descHtml === 'string' && descHtml.startsWith('<') ? descHtml : '',
  }
  products.push(prod)
  const ext = await downloadAuto(`${ODOO}/web/image/product.template/${id}/image_1024`, join(imgDir, 'products', String(id)))
  prod.img = ext ? `/images/fn/products/${id}.${ext}` : null
  console.log(id, p.name, '| variants', variants.length, '| desc', descHtml ? 'yes' : 'no', '| img', ext)
}

const queue = [...entries]
const failed = []
async function worker() {
  while (queue.length) {
    const entry = queue.shift()
    try { await scrapeProduct(entry) } catch (e) { failed.push(entry[0]); console.log('FAIL', entry[0], entry[1], e.message) }
    await sleep(250)
  }
}
await Promise.all([worker(), worker(), worker()])
writeFileSync(join(dataDir, 'products.json'), JSON.stringify(products, null, 1))
console.log('done', products.length, 'products; failed:', failed.join(',') || 'none')
