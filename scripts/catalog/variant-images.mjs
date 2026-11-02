// Downloads each product variant's own photo from the store's Odoo backend
// (owner-approved reuse) so the product page can switch the picture with the
// chosen size/flavour. Variants whose photo is identical to the product's main
// photo are skipped. Writes public/images/fn/variants/<variantId>.webp and adds
// `img` to those variants in src/data/products.json.
//
//   node scripts/catalog/variant-images.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ODOO = 'https://jdsjordan-first-nutirition-erp.odoo.com'
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const dataFile = join(root, 'src', 'data', 'products.json')
const outDir = join(root, 'public', 'images', 'fn', 'variants')
mkdirSync(outDir, { recursive: true })

const sha = (buf) => createHash('sha1').update(buf).digest('hex')
const fetchBuf = async (url) => {
  const res = await fetch(url)
  if (!res.ok) return null
  const type = res.headers.get('content-type') || ''
  if (!type.startsWith('image/')) return null
  return Buffer.from(await res.arrayBuffer())
}

const products = JSON.parse(readFileSync(dataFile, 'utf8'))
let saved = 0
for (const p of products) {
  if (p.variants.length < 2) continue
  const main = existsSync(join(root, 'public', p.img)) ? sha(readFileSync(join(root, 'public', p.img))) : null
  const fileByHash = new Map()   // variants sharing one photo share one file
  for (const v of p.variants) {
    const buf = await fetchBuf(`${ODOO}/web/image/product.product/${v.id}/image_1024`)
    if (!buf) continue
    const h = sha(buf)
    // Odoo falls back to the template photo when a variant has none of its own
    if (h === main) continue
    if (!fileByHash.has(h)) {
      const file = `${v.id}.webp`
      writeFileSync(join(outDir, file), buf)
      fileByHash.set(h, file)
    }
    v.img = `/images/fn/variants/${fileByHash.get(h)}`
    saved++
  }
  console.log(p.id, p.name, '|', p.variants.filter(v => v.img).length, '/', p.variants.length, 'with own photo')
}
writeFileSync(dataFile, JSON.stringify(products, null, 2) + '\n')
console.log('variant photos:', saved)
