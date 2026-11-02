import Fuse from 'fuse.js'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'

// Product search that forgives typos ("wey", "creatin", "glod standard") and
// understands Arabic: Arabic words are mapped to the English catalog terms
// first, then every word must fuzzy-match the product somewhere.

// Arabic spelling variants folded together before lookup.
const normAr = (s) => s
  .replace(/[ً-ْـ]/g, '')        // harakat, tatweel
  .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/^ال(?=\S{3,})/g, '')                  // leading "al-"
  .replace(/\s+ال(?=\S{3,})/g, ' ')

const AR_TERMS = [
  ['واي', 'whey'], ['وي', 'whey'], ['بروتين', 'protein'], ['بروتينات', 'protein'],
  ['كرياتين', 'creatine'], ['ايزو', 'iso'], ['ايزوليت', 'isolate'], ['معزول', 'isolate'],
  ['جينر', 'gainer'], ['جينير', 'gainer'], ['ماس', 'mass'], ['زياده وزن', 'gainer'], ['تضخيم', 'mass'],
  ['حارق', 'burner'], ['حرق', 'burner'], ['تنحيف', 'burner'], ['كارنيتين', 'carnitine'],
  ['امينو', 'amino'], ['بي سي اي اي', 'bcaa'], ['بسيا', 'bcaa'],
  ['بري ورك اوت', 'pre-workout'], ['بريورك', 'pre-workout'], ['قبل التمرين', 'pre-workout'], ['طاقه', 'energy'],
  ['اوميغا', 'omega'], ['اوميجا', 'omega'], ['كولاجين', 'collagen'], ['فيتامين', 'vitamin'], ['فيتامينات', 'vitamin'],
  ['جلوتامين', 'glutamine'], ['كازين', 'casein'], ['هيدرو', 'hydro'],
  ['شيكر', 'shaker'], ['خلاط', 'shaker'], ['بار', 'bar'], ['لوح', 'bar'], ['الواح', 'bar'],
  ['شوكولا', 'chocolate'], ['شوكولاته', 'chocolate'], ['فانيلا', 'vanilla'], ['فراوله', 'strawberry'],
  ['قهوه', 'coffee'], ['كوكيز', 'cookies'], ['موز', 'banana'], ['كراميل', 'caramel'], ['بطيخ', 'watermelon'],
  ['اوبتيموم', 'optimum'], ['اوبتمم', 'optimum'], ['ماسل تك', 'muscletech'], ['مسل تك', 'muscletech'],
  ['دايماتايز', 'dymatize'], ['سيلوكور', 'cellucor'], ['سي فور', 'c4'], ['سي4', 'c4'],
  ['نيترو تك', 'nitro tech'], ['جولد ستاندرد', 'gold standard'], ['كارنيفور', 'carnivor'],
  ['اكستند', 'xtend'], ['ليبو', 'lipo'], ['عرض', 'offer'], ['عروض', 'offer'],
].map(([ar, en]) => [normAr(ar), en]).sort((a, b) => b[0].length - a[0].length)

function toEnglish(query) {
  if (!/[؀-ۿ]/.test(query)) return query
  let s = ` ${normAr(query)} `
  for (const [ar, en] of AR_TERMS) s = s.replaceAll(` ${ar} `, ` ${en} `)
  return s.trim()
}

const docs = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  brand: p.brand,
  type: p.type,
  category: CATEGORIES.find(c => c.id === p.category)?.name || '',
  options: [...(p.options.flavor || []), ...(p.options.size || [])].join(' '),
  highlights: p.highlights.join(' '),
}))
const fuse = new Fuse(docs, {
  keys: [
    { name: 'name', weight: 0.45 }, { name: 'brand', weight: 0.2 }, { name: 'type', weight: 0.12 },
    { name: 'category', weight: 0.12 }, { name: 'options', weight: 0.06 }, { name: 'highlights', weight: 0.05 },
  ],
  threshold: 0.34, ignoreLocation: true, includeScore: true, minMatchCharLength: 2,
})

// id -> score (lower is better) for products matching every word.
const cache = new Map()
function scores(query) {
  const q = toEnglish(query.trim().toLowerCase())
  if (cache.has(q)) return cache.get(q)
  const terms = q.split(/\s+/).filter(w => w.length > 1 || /\d/.test(w))
  let result = null
  for (const term of terms) {
    const hits = new Map(fuse.search(term).map(r => [r.item.id, r.score]))
    // also try the word with two neighbouring letters swapped ("glod" -> "gold")
    if (term.length >= 4) {
      for (let i = 0; i < term.length - 1; i++) {
        const swapped = term.slice(0, i) + term[i + 1] + term[i] + term.slice(i + 2)
        for (const r of fuse.search(swapped)) {
          const sc = r.score + 0.1
          if (!hits.has(r.item.id) || hits.get(r.item.id) > sc) hits.set(r.item.id, sc)
        }
      }
    }
    result = result
      ? new Map([...result].filter(([id]) => hits.has(id)).map(([id, s]) => [id, s + hits.get(id)]))
      : hits
  }
  // a whole-name hit ranks first
  if (result) for (const d of docs) if (result.has(d.id) && d.name.toLowerCase().includes(q)) result.set(d.id, -1)
  const out = result || new Map()
  if (cache.size > 200) cache.clear()
  cache.set(q, out)
  return out
}

export function matchesQuery(product, query) {
  return !query.trim() || scores(query).has(product.id)
}

export function searchProducts(products, query, limit = Infinity) {
  if (!query.trim()) return []
  const s = scores(query)
  return products.filter(p => s.has(p.id)).sort((a, b) => s.get(a.id) - s.get(b.id)).slice(0, limit)
}
