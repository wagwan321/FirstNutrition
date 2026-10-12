import { CATEGORIES } from '../data/catalog.js'

// True when every word of `query` appears somewhere in the product's name,
// brand, category, flavors or description (case-insensitive).
export function matchesQuery(product, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return true
  const cat = CATEGORIES.find(c => c.id === product.category)
  const haystack = [
    product.name, product.brand, cat?.name,
    ...(product.flavors || []), product.desc,
  ].join(' ').toLowerCase()
  return terms.every(t => haystack.includes(t))
}
