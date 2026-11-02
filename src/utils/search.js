import { CATEGORIES } from '../data/catalog.js'

// Searchable text per product, built once.
const haystacks = new Map()
function haystack(p) {
  if (!haystacks.has(p.id)) {
    const cat = CATEGORIES.find(c => c.id === p.category)
    const flavors = [...(p.options.flavor || []), ...(p.options.size || [])]
    haystacks.set(p.id, [p.name, p.brand, p.type, cat?.name, ...flavors, ...p.highlights]
      .join(' ').toLowerCase())
  }
  return haystacks.get(p.id)
}

// True when every word of `query` appears in the product's name, brand,
// type, category, flavors/sizes or highlights (case-insensitive).
export function matchesQuery(product, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return !terms.length || terms.every(t => haystack(product).includes(t))
}

// Name matches first, then everything else.
export function searchProducts(products, query, limit = Infinity) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return products
    .filter(p => matchesQuery(p, q))
    .sort((a, b) => (b.name.toLowerCase().includes(q)) - (a.name.toLowerCase().includes(q)))
    .slice(0, limit)
}
