// Bundles (combo products) have no variants; the advertised price is list_price
// (min_price adds tax again). Patch products.json with listPrice for those.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fetchPage, findValue } from './rsc.mjs'

const dataDir = process.argv[2]
const file = join(dataDir, 'products.json')
const products = JSON.parse(readFileSync(file, 'utf8'))
const odooSlug = (s) => s.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/[-\s]+/g, '-')

for (const p of products.filter(x => x.variants.length === 0)) {
  const text = await fetchPage(`https://new-website.firstnutrition.com/product/${odooSlug(p.name)}-${p.id}`)
  const json = findValue(text, 'product', `"id":${p.id},"name"`)
  p.listPrice = Math.round(json.list_price * 2) / 2
  console.log(p.id, p.name, '| list', json.list_price, '| min', json.min_price)
}
writeFileSync(file, JSON.stringify(products, null, 1))
