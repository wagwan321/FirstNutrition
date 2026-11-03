// Sports-nutrition maths shared by the Coach and the Compare table.
// Per-serving facts come from each product's own "Nutritional Facts" section;
// anything estimated (servings from tub weight, typical scoop size) is flagged
// `approx` so the UI can show it with "≈".

const LB = 453.6

// First number in a string; a range like "3–4 g" gives its midpoint.
function num(s) {
  const m = String(s).match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?/)
  if (!m) return null
  return m[2] ? (parseFloat(m[1]) + parseFloat(m[2])) / 2 : parseFloat(m[1])
}

const FACT_KEYS = [
  [/^protein$/i, 'protein'],
  [/^calories$/i, 'calories'],
  [/^(total )?carbohydrates$/i, 'carbs'],
  [/^(total )?fat$/i, 'fat'],
  [/^(total )?sugars?$/i, 'sugar'],
  [/^(micronized )?creatine (monohydrate|blend)$/i, 'creatine'],
  [/^caffeine( anhydrous)?$/i, 'caffeine'],
  [/^(total )?bcaas?$/i, 'bcaa'],
]

const factsCache = new Map()
export function servingFacts(product) {
  if (factsCache.has(product.id)) return factsCache.get(product.id)
  const facts = {}
  const section = product.sections?.find(s => /nutrition|facts/i.test(s.title))
  for (const block of section?.blocks || []) {
    for (const line of block.ul || []) {
      const m = line.match(/^([^:]+):\s*(.+)$/)
      if (!m) continue
      const label = m[1].trim()
      if (/^serving size$/i.test(label)) {
        const g = m[2].match(/(\d+(?:\.\d+)?)\s*g\b/)
        if (g) facts.servingG = parseFloat(g[1])
        continue
      }
      const key = FACT_KEYS.find(([re]) => re.test(label))?.[1]
      if (key && facts[key] == null) facts[key] = key === 'creatine' && /mg/i.test(m[2]) ? num(m[2]) / 1000 : num(m[2])
    }
  }
  factsCache.set(product.id, facts)
  return facts
}

// Typical scoop weight when the label does not state one.
function typicalServingG(product, facts) {
  if (facts.servingG) return { g: facts.servingG, approx: false }
  switch (product.category) {
    case 'protein': return { g: facts.protein ? Math.round(facts.protein / 0.78) : 30, approx: true }
    case 'gainers': return { g: facts.calories ? Math.round(facts.calories / 3.8) : 150, approx: true }
    case 'creatine': return { g: facts.creatine || 5, approx: true }
    case 'preworkout': return { g: 10, approx: true }
    case 'aminos': return { g: 12, approx: true }
    default: return null
  }
}

// Servings in one tub of this variant: stated ("90 Servings"), or the tub
// weight divided by the serving size.
export function servingsPer(product, variant) {
  const size = variant?.size || product.options?.size?.[0] || ''
  const stated = size.match(/(\d+)\s*servings?/i) || product.name.match(/(\d+)\s*servings?/i)
  if (stated) return { n: Number(stated[1]), approx: false }
  const lbs = size.match(/(\d+(?:\.\d+)?)\s*lbs?/i) || product.name.match(/(\d+(?:\.\d+)?)\s*lbs?\b/i)
  const kg = size.match(/(\d+(?:\.\d+)?)\s*kg/i)
  const grams = lbs ? parseFloat(lbs[1]) * LB : kg ? parseFloat(kg[1]) * 1000 : null
  const serving = typicalServingG(product, servingFacts(product))
  if (!grams || !serving) return null
  return { n: Math.round(grams / serving.g), approx: true }
}

export function costPerServing(product, variant) {
  const s = servingsPer(product, variant)
  const unit = variant?.price ?? product.price
  return s ? { value: unit / s.n, approx: s.approx } : null
}

// What 25 g of protein costs from this tub: the honest way to compare proteins.
export function costPer25gProtein(product, variant) {
  const f = servingFacts(product)
  const c = costPerServing(product, variant)
  if (!c || !f.protein) return null
  return { value: (c.value * 25) / f.protein, approx: c.approx }
}

// ---- daily targets ----
// Activity multipliers for people who train but otherwise sit most of the day.
// (The textbook "very / extra active" values of 1.725 and 1.9 assume a
// physical job as well, and overstate what a gym-goer burns.)
export const ACTIVITY = {
  light: { factor: 1.375, label: '1–2 days' },
  moderate: { factor: 1.465, label: '3–4 days' },
  hard: { factor: 1.55, label: '5–6 days' },
  daily: { factor: 1.65, label: 'Every day' },
}

// Calorie change as a share of maintenance, and protein in g per kg, for each
// goal and combination. Build muscle + gain weight is a bulk; build muscle +
// lose fat a recomp (smaller deficit, more protein); performance adds carbs.
// Gaining and losing weight can't be picked together.
const TARGETS = {
  muscle: { pct: 0.07, protein: 2.0 },
  gain: { pct: 0.15, protein: 1.8 },
  lose: { pct: -0.2, protein: 2.2 },
  performance: { pct: 0, protein: 1.6 },
  'gain+muscle': { pct: 0.12, protein: 2.0 },
  'muscle+lose': { pct: -0.15, protein: 2.3 },
  'muscle+performance': { pct: 0.05, protein: 2.0 },
  'gain+performance': { pct: 0.12, protein: 1.8 },
  'lose+performance': { pct: -0.15, protein: 2.2 },
  'gain+muscle+performance': { pct: 0.12, protein: 2.0 },
  'muscle+lose+performance': { pct: -0.12, protein: 2.3 },
}

// The visitor's goals as a list (older saved plans have a single `goal`).
export const goalsOf = (a) => {
  const list = Array.isArray(a?.goals) && a.goals.length ? a.goals : a?.goal ? [a.goal] : ['muscle']
  return ['gain', 'muscle', 'lose', 'performance'].filter(g => list.includes(g))
}
const targetsFor = (goals) => TARGETS[goals.join('+')] || TARGETS[goals[0]] || TARGETS.muscle

// Protein and fat follow lean mass, so above a BMI of 27 only a quarter of the
// extra weight counts (otherwise a 105 kg person would be told to eat 230 g).
function referenceWeight(weight, height) {
  const h2 = (height / 100) ** 2
  const cap = 27 * h2
  return weight > cap ? cap + 0.25 * (weight - cap) : weight
}

// Mifflin-St Jeor resting energy x activity, then the goal's surplus or
// deficit (a share of maintenance, capped); protein and fat from body weight,
// carbs fill the rest.
export function dailyPlan({ goal, goals, sex, age, height, weight, activity }) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'female' ? -161 : 5)
  const maintenance = bmr * (ACTIVITY[activity]?.factor || 1.465)
  const list = goalsOf({ goal, goals })
  const g = targetsFor(list)
  const change = Math.max(-750, Math.min(500, maintenance * g.pct))
  const floor = sex === 'female' ? 1300 : 1600
  const calories = Math.max(floor, Math.round((maintenance + change) / 10) * 10)
  const ref = referenceWeight(weight, height)
  const protein = Math.round(ref * g.protein)
  const fatShare = list.includes('performance') ? 0.22 : 0.25
  const fat = Math.round(Math.max(ref * (g.pct < 0 ? 0.8 : 0.7), (calories * fatShare) / 9))
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  const delta = calories - maintenance
  return {
    maintenance: Math.round(maintenance / 10) * 10,
    calories, protein, fat, carbs,
    water: Math.round(weight * 0.035 * 10 + (activity === 'light' ? 0 : 5)) / 10,
    creatine: 5,
    // weekly change from the daily surplus or deficit (7,700 kcal is about 1 kg)
    paceKg: Math.round(((delta * 7) / 7700) * 20) / 20,
    recomp: list.includes('muscle') && list.includes('lose'),
  }
}

// "+0.25 kg a week", "−0.45 kg a week, keeping muscle" or "hold your weight".
export function paceText(plan, t = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v?.[k] ?? '')) {
  const kg = plan.paceKg || 0
  if (Math.abs(kg) < 0.05) return t('hold your weight')
  const n = `${kg > 0 ? '+' : '−'}${Math.abs(kg).toFixed(2).replace(/0$/, '')}`
  return plan.recomp ? t('{n} kg a week, keeping muscle', { n }) : t('{n} kg a week', { n })
}
