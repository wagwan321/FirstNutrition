// Turns what people type ("I ate a waffle, drank a cup of milk and 4 Prince
// biscuits", "بيضتين وصحن حمص") into foods, portions and macros from
// data/foods.js. The sentence is cut at verbs and joiners, then read word by
// word: numbers and units wait for the next food, the longest food name wins,
// small typos are forgiven, and a brand takes over from its generic word.
// Words it can't place come back in `unknown` with close suggestions;
// "pizza 300 kcal" is taken as a manual entry.
import Fuse from 'fuse.js'
import { FOODS, GROUPS } from '../data/foods.js'

export const norm = (s) => s.toLowerCase()
  .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/½/g, ' 0.5 ').replace(/¼/g, ' 0.25 ').replace(/(\d)\s*\/\s*(\d)/g, (_, a, b) => ` ${(a / b).toFixed(2)} `)
  .replace(/[’`]/g, "'").replace(/[!?.؟"()]/g, ' ')
  .replace(/(\d)(g|gr|grams?|kg|ml|غ|غرام|جرام|مل|كغ)(?![a-z؀-ۿ])/g, '$1 $2')   // "200g" -> "200 g"
  .replace(/(\d)x(?![a-z])|x(\d)/g, (_, a, b) => ` ${a || b} `)                            // "2x" / "x2"
  .replace(/\s+/g, ' ').trim()

const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10, half: 0.5, couple: 2, few: 3,
  واحد: 1, وحده: 1, اثنين: 2, اتنين: 2, ثنتين: 2, تنين: 2, ثلاث: 3, ثلاثه: 3, تلات: 3, تلاته: 3, اربع: 4, اربعه: 4,
  خمس: 5, خمسه: 5, ست: 6, سته: 6, نص: 0.5, نصف: 0.5,
}
const SIZE_WORDS = { small: 0.7, little: 0.7, medium: 1, regular: 1, large: 1.4, big: 1.4, huge: 1.8, double: 2, صغير: 0.7, صغيره: 0.7, وسط: 1, كبير: 1.4, كبيره: 1.4, دبل: 2 }
const UNITS = {
  g: ['g', 'gr', 'gram', 'grams', 'gm', 'غ', 'غرام', 'جرام', 'جم', 'غم'],
  kg: ['kg', 'kilo', 'كيلو', 'كغ'],
  ml: ['ml', 'مل'],
  cup: ['cup', 'cups', 'mug', 'كوب', 'اكواب', 'فنجان'],
  glass: ['glass', 'glasses', 'bottle', 'كاسه', 'كاس', 'قنينه'],
  tbsp: ['tbsp', 'tablespoon', 'tablespoons', 'spoon', 'spoons', 'ملعقه', 'معلقه', 'ملاعق'],
  tsp: ['tsp', 'teaspoon', 'teaspoons'],
  scoop: ['scoop', 'scoops', 'سكوب', 'مغرفه'],
  slice: ['slice', 'slices', 'شريحه', 'شرائح'],
  piece: ['piece', 'pieces', 'pc', 'pcs', 'حبه', 'حبات', 'قطعه', 'قطع'],
  plate: ['plate', 'plates', 'صحن', 'صحون'],
  bowl: ['bowl', 'bowls', 'زبديه', 'وعاء'],
  sandwich: ['sandwich', 'sandwiches', 'سندويش', 'ساندويش', 'ساندويشه', 'سندويشه'],
  can: ['can', 'cans', 'علبه', 'تنكه'],
  handful: ['handful', 'حفنه', 'كمشه'],
  loaf: ['loaf', 'loaves', 'رغيف', 'ارغفه'],
  bar: ['bar', 'bars', 'لوح'],
  serving: ['serving', 'servings', 'portion', 'pack', 'packet', 'bag', 'حصه', 'كيس', 'باكيت'],
}
const UNIT_OF = new Map(Object.entries(UNITS).flatMap(([u, words]) => words.map(w => [w, u])))
// words that carry no food: skipped quietly
const STOP = new Set(['of', 'some', 'the', 'my', 'i', 'just', 'for', 'about', 'around', 'like', 'from', 'brand', 'by', 'its', 'it', 'was', 'were', 'is',
  'in', 'on', 'at', 'to', 'today', 'yesterday', 'morning', 'night', 'evening', 'kind', 'type', 'flavor', 'flavour', 'size', 'more', 'another',
  'شويه', 'شوية', 'من', 'على', 'ع', 'بس', 'حوالي', 'تقريبا', 'نوع', 'ماركه', 'اليوم', 'الصبح', 'بالليل', 'كمان',
  // how it was cooked (only skipped when no food name starts with it, so "fried chicken" still matches)
  'grilled', 'fried', 'boiled', 'baked', 'roasted', 'steamed', 'raw', 'fresh', 'homemade', 'plain', 'cooked', 'mashed',
  'مشوي', 'مشويه', 'مقلي', 'مقليه', 'مسلوق', 'مسلوقه', 'بالفرن', 'طازج', 'بيتي'])
// verbs and joiners that start a new food
const JOINERS = ['and then', 'after that', 'i ate', 'i had', 'i drank', 'i have eaten', 'ate', 'had', 'drank', 'drink', 'drinking', 'eat', 'eating',
  'have', 'having', 'then', 'also', 'plus', 'later', 'and', 'with', 'اكلت', 'شربت', 'تناولت', 'وبعدين', 'بعدين', 'ثم', 'بعدها', 'وكمان', 'مع']
const MEAL_WORDS = {
  breakfast: ['breakfast', 'فطور', 'الفطور', 'فطوري', 'ترويقه'],
  lunch: ['lunch', 'غدا', 'الغدا', 'غداء', 'غدائي'],
  dinner: ['dinner', 'supper', 'عشا', 'العشا', 'عشاء', 'عشائي'],
  snack: ['snack', 'snacks', 'سناك', 'تصبيره'],
}

const foodOf = new Map(FOODS.map(f => [f.id, f]))
const aliases = FOODS.flatMap(f => [...f.en, ...f.ar].map(a => ({ id: f.id, name: norm(a) })))
const exact = new Map()
for (const a of aliases) if (!exact.has(a.name)) exact.set(a.name, a.id)
const fuse = new Fuse(aliases, { keys: ['name'], threshold: 0.4, includeScore: true, ignoreLocation: true, minMatchCharLength: 3 })
const groupOf = new Map(Object.values(GROUPS).flatMap(g => [[g.generic, g], ...g.members.map(m => [m, g])]))

// Words that start with و but aren't "and" + a word.
const WAW_WORDS = /^(ورق|واي|وجب|وافل|وعاء|وينغز)/

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
    for (const s of [stem, `${stem}ه`]) if (UNIT_OF.has(s) || exact.has(s)) return s
  }
  return null
}

// Spelling variants to try for one word: plurals, Arabic "al-", "bi-", "wa-".
function variants(w) {
  const out = [w]
  if (/^[a-z]/.test(w)) {
    if (w.endsWith('ies')) out.push(`${w.slice(0, -3)}y`)
    if (w.endsWith('es')) out.push(w.slice(0, -2))
    if (w.endsWith('s')) out.push(w.slice(0, -1))
  } else {
    for (const pre of ['بال', 'ال', 'وال', 'و', 'ب', 'لل']) if (w.startsWith(pre) && w.length - pre.length >= 2) out.push(w.slice(pre.length))
  }
  return out
}

// The food starting at word i: the longest exact name first, then a close spelling.
function matchAt(words, i) {
  for (let len = Math.min(4, words.length - i); len >= 1; len--) {
    const phrase = words.slice(i, i + len)
    const last = phrase.length - 1
    for (const v of variants(phrase[last])) {
      const key = [...phrase.slice(0, last), v].join(' ')
      if (exact.has(key)) return { id: exact.get(key), len }
    }
    if (len === 1) for (const v of variants(phrase[0])) if (exact.has(v)) return { id: exact.get(v), len }
  }
  for (let len = Math.min(3, words.length - i); len >= 1; len--) {
    const phrase = words.slice(i, i + len).join(' ')
    if (phrase.length < 4 || STOP.has(phrase) || UNIT_OF.has(phrase)) continue
    const hit = fuse.search(phrase)[0]
    const close = hit && hit.score <= (len === 1 ? 0.28 : 0.34) && Math.abs(hit.item.name.length - phrase.length) <= Math.max(2, phrase.length * 0.34)
    if (close) return { id: hit.item.id, len, fuzzy: true }
  }
  return null
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

const gramsFor = (food, { qty, unit, grams, size }) => {
  if (grams) return grams
  const n = qty ?? 1
  const base = unit && food.units[unit] ? food.units[unit] : food.g
  return Math.max(1, Math.round(n * base * (size || 1)))
}

// One piece of the sentence -> foods, plus the words it couldn't place.
function readPiece(piece) {
  const manual = ` ${piece} `.match(/ (\d+(?:\.\d+)?)\s*(kcal|cal|cals|calories|سعره|سعرات|كالوري)( |$)/)
  if (manual) {
    const name = ` ${piece} `.replace(manual[0], ' ').replace(/\s+/g, ' ').trim()
    return { items: [{ id: 'manual', name: name || 'Food', nameAr: name || 'Food', kcal: Math.round(Number(manual[1])), p: 0, c: 0, f: 0, manual: true }], unknown: [] }
  }
  const words = piece.split(' ').filter(Boolean).map(w => dual(w) ? { w: dual(w), two: true } : { w }).flatMap(x => (x.two ? ['2', x.w] : [x.w]))
  const found = []
  const unknown = []
  let pending = {}
  let stray = []
  const flushStray = () => { if (stray.length) unknown.push(stray.join(' ')); stray = [] }
  for (let i = 0; i < words.length;) {
    const w = words[i]
    const next = words[i + 1]
    if (/^\d+(\.\d+)?$/.test(w) && next && /^(g|gr|grams?|gm|غ|غرام|جرام|جم|غم|ml|مل|kg|kilo|كيلو|كغ)$/.test(next)) {
      pending.grams = Number(w) * (/^(kg|kilo|كيلو|كغ)$/.test(next) ? 1000 : 1); i += 2; continue
    }
    // a name of two words or more wins over reading its first word as a size or unit ("big mac")
    const long = matchAt(words, i)
    const isLong = long && long.len > 1 && !long.fuzzy
    if (!isLong && /^\d+(\.\d+)?$/.test(w)) { if (pending.qty == null) pending.qty = Number(w); i++; continue }
    if (!isLong && w in NUMBER_WORDS && !(w === 'a' && found.length && !pending.qty && next == null)) { if (pending.qty == null) pending.qty = NUMBER_WORDS[w]; i++; continue }
    if (!isLong && w in SIZE_WORDS) { pending.size = SIZE_WORDS[w]; i++; continue }
    // a word that is both a measure and a food ("رغيف خبز", "loaf of bread") measures the food after it
    if (!isLong && UNIT_OF.has(w)) {
      let j = i + 1
      while (j < words.length && STOP.has(words[j])) j++
      if (j < words.length && matchAt(words, j)) { if (!pending.unit) pending.unit = UNIT_OF.get(w); i = j; continue }
    }
    const m = long
    if (m) {
      flushStray()
      found.push({ id: m.id, fuzzy: m.fuzzy, ...pending })
      pending = {}
      i += m.len
      // words that are part of the same food's other names ("grilled chicken breast")
      const own = new Set(aliases.filter(a => a.id === m.id).flatMap(a => a.name.split(' ')))
      while (i < words.length && own.has(words[i]) && !(matchAt(words, i)?.len > 1)) i++
      // a quantity after the food ("ورق عنب 6 حبات", "chicken 150 g") belongs to it
      const prev = found[found.length - 1]
      if (prev.qty == null && !prev.grams && /^\d+(\.\d+)?$/.test(words[i] || '') && UNIT_OF.has(words[i + 1] || '')) {
        const u = UNIT_OF.get(words[i + 1])
        if (u === 'g' || u === 'ml' || u === 'kg') prev.grams = Number(words[i]) * (u === 'kg' ? 1000 : 1)
        else { prev.qty = Number(words[i]); prev.unit = prev.unit || u }
        i += 2
      }
      continue
    }
    if (UNIT_OF.has(w)) { if (!pending.unit) pending.unit = UNIT_OF.get(w); i++; continue }
    if (STOP.has(w)) { i++; continue }
    stray.push(w)
    i++
  }
  flushStray()
  // a brand or specific kind takes over its generic word ("biscuits ... prince")
  for (const f of [...found]) {
    const g = groupOf.get(f.id)
    if (!g || g.generic !== f.id) continue
    const specific = found.find(x => x !== f && g.members.includes(x.id))
    if (specific) {
      specific.qty ??= f.qty; specific.unit ??= f.unit; specific.grams ??= f.grams; specific.size ??= f.size
      found.splice(found.indexOf(f), 1)
    }
  }
  const items = found.map(f => {
    const food = foodOf.get(f.id)
    const unit = f.unit === 'g' || f.unit === 'kg' || f.unit === 'ml' ? null : f.unit
    return { ...itemFrom({ food, qty: f.grams ? null : (f.qty ?? 1), grams: gramsFor(food, { ...f, unit }) }), guessed: !!f.fuzzy }
  })
  return { items, unknown: unknown.filter(u => u.replace(/\s/g, '').length > 1) }
}

export function parseFoods(input) {
  let text = norm(input)
  let meal = null
  for (const [m, words] of Object.entries(MEAL_WORDS)) {
    if (words.some(w => new RegExp(`(^| )${norm(w)}( |:|$)`).test(text))) { meal = m; text = text.replace(new RegExp(`(^| )(for )?(${words.map(norm).join('|')})( |:|$)`, 'g'), ' ') }
  }
  // cut at punctuation, verbs and joiners ("and", "with", Arabic "و")
  text = text.replace(/ و(?=\S)/g, (m0, i) => (WAW_WORDS.test(text.slice(i + 1)) ? m0 : ' , '))
    .replace(/^و(?=\S)/, (m0) => (WAW_WORDS.test(text) ? m0 : ''))
  for (const j of JOINERS) text = text.replace(new RegExp(`(^| )${norm(j)}(?= |$)`, 'g'), ' , ')
  const pieces = text.split(/,|\+|&|\n|;|،| و /).map(s => s.trim()).filter(Boolean)
  const items = []
  const unknown = []
  for (const piece of pieces) {
    const r = readPiece(piece)
    items.push(...r.items)
    unknown.push(...r.unknown)
  }
  return { items, unknown, meal }
}

// Close matches for a word the reader couldn't place ("did you mean…").
export function suggestFor(phrase, n = 3) {
  const seen = new Set()
  return fuse.search(norm(phrase), { limit: 12 })
    .filter(r => r.score < 0.5 && !seen.has(r.item.id) && seen.add(r.item.id))
    .slice(0, n)
    .map(r => { const food = foodOf.get(r.item.id); return itemFrom({ food, qty: 1, grams: food.g }) })
}

// Scale an item's portion (the steppers on a log card).
export function scaleItem(item, factor) {
  if (item.manual || item.ai) {
    const k = factor
    return { ...item, kcal: Math.round(item.kcal * k), p: Math.round(item.p * k * 10) / 10, c: Math.round(item.c * k * 10) / 10, f: Math.round(item.f * k * 10) / 10, grams: item.grams ? Math.round(item.grams * k) : item.grams }
  }
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
