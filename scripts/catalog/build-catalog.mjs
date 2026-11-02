// Turn the scraped data into the site's catalog files:
//   src/data/products.json, src/data/brands.json
//   node build-catalog.mjs <dataDir> <projectDir>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [dataDir, projectDir] = process.argv.slice(2)
const raw = JSON.parse(readFileSync(join(dataDir, 'products.json'), 'utf8'))
const home = JSON.parse(readFileSync(join(dataDir, 'home.json'), 'utf8'))

// ---- category: the owners' own 10 top-level categories ----
function categoryOf(p) {
  const pub = p.publicCategory, label = p.cardLabel
  if (pub === 'Bundles' || /\boffer\b/i.test(p.name)) return 'bundles'
  if (label === 'ACCESSORIES') return 'accessories'
  if (label === 'SNACKS') return 'snacks'
  if (pub === 'Weight Gainers' || label === 'WEIGHT GAINER' || label === 'CARBOHYDRATES') return 'gainers'
  if (label === 'PROTEIN') return 'protein'
  if (/^CREATINE/.test(label) || label === 'RECOVERY') return 'creatine'
  if (label === 'PRE-WORKOUT' || label === 'CAFFEINE') return 'preworkout'
  if (['AMINO ACID', 'BCAA', 'GLUTAMINE', 'L-ARGININE'].includes(label)) return 'aminos'
  if (label === 'WEIGHT MANAGEMENT' || label === 'FAT BURNER') return 'weight'
  if (['JOINT SUPPORT', 'COLLAGEN', 'FISH OIL'].includes(label)) return 'wellness'
  throw new Error(`no category for ${p.id} ${p.name} (${pub} | ${label})`)
}

// Sub-type shown on cards ("Isolate Protein", "BCAA", ...)
const title = (s) => s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())
function typeOf(p, cat) {
  if (cat === 'bundles') return 'Bundle offer'
  const pub = p.publicCategory
  if (pub && !['Bundles', 'Health & Wellness', 'Weight Management', 'Accessories', 'Snacks'].includes(pub)) {
    return { Bcaa: 'BCAA', Eaa: 'EAA' }[pub] || pub
  }
  const label = p.cardLabel.replace('CREATINE BLIND', 'CREATINE')
  return { BCAA: 'BCAA', 'L-ARGININE': 'L-Arginine', 'PRE-WORKOUT': 'Pre-Workout' }[label] || title(label)
}

// ---- description HTML -> safe structured sections ----
const decode = (s) => s
  .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&bull;/g, '•').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/\s+/g, ' ').trim()

function parseDescription(html) {
  if (!html) return { highlights: [], intro: [], sections: [] }
  const sections = []
  let current = { title: null, blocks: [] }
  const re = /<(h[1-6]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi
  for (const [, tag, inner] of html.matchAll(re)) {
    const t = tag.toLowerCase()
    if (t[0] === 'h') {
      if (current.title || current.blocks.length) sections.push(current)
      current = { title: decode(inner), blocks: [] }
    } else if (t === 'p') {
      const text = decode(inner)
      if (text) current.blocks.push({ p: text })
    } else {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m => decode(m[1])).filter(Boolean)
      if (items.length) current.blocks.push({ ul: items })
    }
  }
  if (current.title || current.blocks.length) sections.push(current)

  // Untitled lead section = intro. A leading "A • B • C" line becomes highlight chips.
  let intro = []
  if (sections[0] && !sections[0].title) intro = sections.shift().blocks
  let highlights = []
  if (intro[0]?.p && intro[0].p.includes('•')) {
    highlights = intro.shift().p.split('•').map(s => s.trim()).filter(Boolean)
  }
  // Paragraph headings like "Who Is It For?" sometimes arrive as <p><strong>…</strong></p>; fine as-is.
  return { highlights, intro, sections }
}

// ---- merchandising flags (from the owners' own "Top selling" / newest items) ----
const BEST = new Set([466, 502, 471, 514, 6209, 511, 443, 452, 565, 494, 501])
const NEW = new Set([6246, 6257, 6272])

const products = raw.map(p => {
  const category = categoryOf(p)
  const variants = p.variants
    .filter(v => v.available)
    .map(v => ({ id: v.id, ...v.attrs, price: v.price }))
  // option lists in the store's own order, keeping only values that are in stock
  const options = {}
  for (const a of p.attributes) {
    const inStock = a.values.filter(val => variants.some(v => v[a.name] === val))
    if (inStock.length) options[a.name] = inStock
  }
  // Combo bundles have no variants and the ERP stores them with 16% tax added;
  // the advertised price (e.g. "110 JD Offer") is that price without the tax.
  const prices = variants.length ? variants.map(v => v.price)
    : [Math.round(((p.listPrice ?? p.minPrice) / 1.16) * 2) / 2]
  const desc = parseDescription(p.descriptionHtml)
  const summary = (desc.intro.find(b => b.p)?.p || '').slice(0, 220)
  return {
    id: p.id,
    name: p.name.replace(/\s+/g, ' ').trim(),
    slug: p.slug,
    brand: p.brand === 'Muscle Tech' ? 'MuscleTech' : p.brand,
    category,
    type: typeOf(p, category),
    img: p.img,
    price: Math.min(...prices),
    maxPrice: Math.max(...prices),
    available: p.available && (variants.length > 0 || p.variants.length === 0),
    options,
    variants,
    related: p.related,
    together: p.boughtTogether,
    bestseller: BEST.has(p.id),
    isNew: NEW.has(p.id),
    summary,
    highlights: desc.highlights,
    intro: desc.intro,
    sections: desc.sections,
  }
})

// keep only references to products that exist
const ids = new Set(products.map(p => p.id))
for (const p of products) {
  p.related = p.related.filter(id => ids.has(id))
  p.together = p.together.filter(id => ids.has(id))
}

const brands = home.brands.map(b => ({
  name: b.name === 'Muscle Tech' ? 'MuscleTech' : b.name,
  slug: b.slug, logo: b.logo, description: b.description, featured: b.featured,
}))

writeFileSync(join(projectDir, 'src', 'data', 'products.json'), JSON.stringify(products))
writeFileSync(join(projectDir, 'src', 'data', 'brands.json'), JSON.stringify(brands))

const count = {}
products.forEach(p => { count[p.category] = (count[p.category] || 0) + 1 })
console.log('products', products.length, count)
console.log('no variants:', products.filter(p => !p.variants.length).map(p => p.name).join(', '))
console.log('unavailable:', products.filter(p => !p.available).map(p => p.name).join(', ') || 'none')
console.log('brands w/o logo:', [...new Set(products.map(p => p.brand))].filter(b => !brands.some(x => x.name === b)).join(', '))
console.log('sample', JSON.stringify({ ...products[0], intro: products[0].intro.length, sections: products[0].sections.map(s => s.title) }))
