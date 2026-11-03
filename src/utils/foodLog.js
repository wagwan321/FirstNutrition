// Turns what people type ("2 eggs, 200g chicken and a cup of rice",
// "بيضتين وصحن حمص") into foods, portions and macros from data/foods.js.
// Pieces it can't match come back in `unknown`; "pizza 300 kcal" is taken as a
// manual entry.
import Fuse from 'fuse.js'
import { FOODS } from '../data/foods.js'

export const norm = (s) => s.toLowerCase()
  .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/½/g, ' 0.5 ').replace(/¼/g, ' 0.25 ').replace(/(\d)\s*\/\s*(\d)/g, (_, a, b) => ` ${(a / b).toFixed(2)} `)
  .replace(/\s+/g, ' ').trim()

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, couple: 2,
  واحد: 1, وحده: 1, اثنين: 2, اتنين: 2, ثنتين: 2, تنين: 2, ثلاث: 3, ثلاثه: 3, تلات: 3, اربع: 4, اربعه: 4, خمس: 5, خمسه: 5, نص: 0.5, نصف: 0.5,
}
const UNITS = {
  g: ['g', 'gr', 'gram', 'grams', 'gm', 'غ', 'غرام', 'جرام', 'جم', 'غم'],
  kg: ['kg', 'kilo', 'كيلو', 'كغ'],
  ml: ['ml', 'مل'],
  cup: ['cup', 'cups', 'كوب', 'اكواب'],
  glass: ['glass', 'glasses', 'كاسه', 'كاس'],
  tbsp: ['tbsp', 'tablespoon', 'tablespoons', 'spoon', 'spoons', 'ملعقه', 'معلقه', 'ملاعق'],
  tsp: ['tsp', 'teaspoon', 'teaspoons'],
  scoop: ['scoop', 'scoops', 'سكوب', 'مغرفه'],
  slice: ['slice', 'slices', 'شريحه', 'شرائح'],
  piece: ['piece', 'pieces', 'pc', 'pcs', 'حبه', 'حبات', 'قطعه', 'قطع'],
  plate: ['plate', 'plates', 'صحن', 'صحون'],
  bowl: ['bowl', 'bowls', 'زبديه', 'وعاء'],
  sandwich: ['sandwich', 'sandwiches', 'wrap', 'سندويش', 'ساندويش', 'ساندويشه', 'سندويشه'],
  can: ['can', 'cans', 'علبه', 'تنكه'],
  handful: ['handful', 'حفنه', 'كمشه'],
  loaf: ['loaf', 'loaves', 'رغيف', 'ارغفه'],
  bar: ['bar', 'bars', 'لوح'],
  serving: ['serving', 'servings', 'portion', 'حصه'],
}
const UNIT_OF = new Map(Object.entries(UNITS).flatMap(([u, words]) => words.map(w => [w, u])))
const FILLER = new Set(['of', 'some', 'the', 'my', 'with', 'i', 'ate', 'had', 'have', 'eat', 'eating', 'just', 'and', 'for', 'about', 'x',
  'اكلت', 'تناولت', 'شويه', 'شوية', 'من', 'على', 'ع', 'كمان', 'بس', 'حوالي', 'تقريبا'])
const MEAL_WORDS = {
  breakfast: ['breakfast', 'فطور', 'الفطور', 'فطوري', 'ترويقه'],
  lunch: ['lunch', 'غدا', 'الغدا', 'غداء', 'غدائي'],
  dinner: ['dinner', 'supper', 'عشا', 'العشا', 'عشاء', 'عشائي'],
  snack: ['snack', 'snacks', 'سناك', 'تصبيره'],
}

const aliases = FOODS.flatMap(f => [...f.en, ...f.ar].map(a => ({ id: f.id, name: norm(a) })))
const fuse = new Fuse(aliases, { keys: ['name'], threshold: 0.34, includeScore: true, ignoreLocation: true, minMatchCharLength: 2 })
const foodOf = new Map(FOODS.map(f => [f.id, f]))

// Words that start with و but aren't "and" + a word.
const WAW_WORDS = /^(ورق|واي|وجب|وافل|وعاء)/

export function mealForTime(date = new Date()) {
  const h = date.getHours()
  return h >= 5 && h < 11 ? 'breakfast' : h >= 11 && h < 16 ? 'lunch' : h >= 16 && h < 22 ? 'dinner' : 'snack'
}

// Arabic duals ("بيضتين", "رغيفين"): two of the word's stem.
function dual(word) {
  if (!/^[؀-ۿ]+$/.test(word) || word.length < 4) return null
  for (const cut of [3, 2]) {
    if (!word.endsWith(cut === 3 ? 'تين' : 'ين')) continue
    const stem = word.slice(0, -cut)
    for (const s of [stem, `${stem}ه`]) {
      if (UNIT_OF.has(s) || aliases.some(a => a.name === s)) return s
    }
  }
  return null
}

function parseChunk(raw) {
  let text = ` ${raw} `
  const manual = text.match(/ (\d+(?:\.\d+)?)\s*(kcal|cal|cals|calories|سعره|سعرات|كالوري)/)
  if (manual) {
    const name = text.replace(manual[0], ' ').replace(/\s+/g, ' ').trim()
    return { manual: true, name: name || 'Food', kcal: Math.round(Number(manual[1])) }
  }
  let grams = null
  const g = text.match(/ (\d+(?:\.\d+)?)\s*(kg|kilo|كيلو|كغ|g|gr|grams?|gm|غ|غرام|جرام|جم|غم|ml|مل)(?= )/)
  if (g) {
    grams = Number(g[1]) * (/^(kg|kilo|كيلو|كغ)$/.test(g[2]) ? 1000 : 1)
    text = text.replace(g[0], ' ')
  }
  let qty = null
  let unit = null
  const words = []
  for (let w of text.trim().split(' ')) {
    if (!w) continue
    const d = dual(w)
    if (d) { qty = qty ?? 2; w = d }
    if (/^\d+(\.\d+)?$/.test(w)) { qty = qty ?? Number(w); continue }
    if (w in NUMBER_WORDS) { qty = qty ?? NUMBER_WORDS[w]; continue }
    if (UNIT_OF.has(w) && !unit) { unit = UNIT_OF.get(w); if (unit === 'g' || unit === 'kg' || unit === 'ml') unit = null; continue }
    if (FILLER.has(w)) continue
    words.push(w)
  }
  const name = words.join(' ').trim()
  if (!name) return null
  const hit = fuse.search(name)[0]
  if (!hit) return { unknown: raw.trim() }
  const food = foodOf.get(hit.item.id)
  const n = qty ?? 1
  const portionGrams = grams ?? (unit && food.units[unit] ? n * food.units[unit] : n * food.g)
  return { food, qty: grams ? null : n, unit, grams: Math.round(portionGrams) }
}

export function itemFrom({ food, qty, grams }) {
  const k = grams / 100
  const r = (v) => Math.round(v * k * 10) / 10
  return {
    id: food.id, name: food.en[0], nameAr: food.ar[0], grams, qty,
    portion: food.portion, portionAr: food.portionAr,
    kcal: Math.round(food.per100.kcal * k), p: r(food.per100.p), c: r(food.per100.c), f: r(food.per100.f),
  }
}

export function parseFoods(input) {
  let text = norm(input)
  let meal = null
  for (const [m, words] of Object.entries(MEAL_WORDS)) {
    if (words.some(w => new RegExp(`(^| )${norm(w)}( |:|$)`).test(text))) { meal = m; text = text.replace(new RegExp(`(^| )(for )?(${words.map(norm).join('|')})( |:|$)`, 'g'), ' ') }
  }
  // split into one food per piece: commas, "and", "with", "+", Arabic "و"
  text = text.replace(/ و(?=\S)/g, (m0, i) => (WAW_WORDS.test(text.slice(i + 1)) ? m0 : ' , '))
    .replace(/^و(?=\S)/, (m0) => (WAW_WORDS.test(text) ? m0 : ''))
  const chunks = text.split(/,|\+|&|\n| and | with | مع | و |;|،/).map(s => s.trim()).filter(Boolean)
  const items = []
  const unknown = []
  for (const chunk of chunks) {
    const r = parseChunk(chunk)
    if (!r) continue
    if (r.unknown) unknown.push(r.unknown)
    else if (r.manual) items.push({ id: 'manual', name: r.name, nameAr: r.name, kcal: r.kcal, p: 0, c: 0, f: 0, manual: true })
    else items.push(itemFrom(r))
  }
  return { items, unknown, meal }
}

// Scale an item's portion (the steppers on a log card).
export function scaleItem(item, factor) {
  if (item.manual) return { ...item, kcal: Math.round(item.kcal * factor), factor: (item.factor || 1) * factor }
  const food = foodOf.get(item.id)
  if (!food) return item
  const grams = Math.max(5, Math.round(item.grams * factor))
  return { ...itemFrom({ food, qty: item.qty ? item.qty * factor : null, grams }) }
}

export const totals = (items) => items.reduce((t, i) => ({
  kcal: t.kcal + (i.kcal || 0), p: t.p + (i.p || 0), c: t.c + (i.c || 0), f: t.f + (i.f || 0),
}), { kcal: 0, p: 0, c: 0, f: 0 })

// Foods that fit what's left today, highest protein for the calories first.
export function fitsRemaining(left, n = 3) {
  if (left.kcal < 60) return []
  const picks = ['chicken', 'tawook', 'greek-yogurt', 'tuna', 'whey', 'egg', 'cottage', 'shawarma-chicken', 'hummus', 'salmon', 'oats', 'banana', 'rice', 'foul', 'protein-bar']
    .map(id => foodOf.get(id))
    .map(food => itemFrom({ food, qty: 1, grams: food.g }))
    .filter(i => i.kcal <= left.kcal + 40)
  const needProtein = left.p > 15
  return picks.sort((a, b) => (needProtein ? (b.p / b.kcal) - (a.p / a.kcal) : b.kcal - a.kcal)).slice(0, n)
}
