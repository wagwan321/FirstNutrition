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
export const ACTIVITY = {
  light: { factor: 1.375, label: '1–2 days' },
  moderate: { factor: 1.55, label: '3–4 days' },
  hard: { factor: 1.725, label: '5–6 days' },
  daily: { factor: 1.9, label: 'Every day' },
}

// Calorie change and protein (g per kg) for each goal.
const GOAL_TARGETS = {
  muscle: { kcal: 250, protein: 2.0, pace: '+0.25 kg / week' },
  gain: { kcal: 450, protein: 1.8, pace: '+0.5 kg / week' },
  lose: { kcal: -500, protein: 2.2, pace: '−0.5 kg / week' },
  performance: { kcal: 0, protein: 1.7, pace: 'hold your weight' },
}

// Mifflin-St Jeor resting energy, times activity, adjusted for the goal.
export function dailyPlan({ goal, sex, age, height, weight, activity }) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'female' ? -161 : 5)
  const maintenance = bmr * (ACTIVITY[activity]?.factor || 1.55)
  const g = GOAL_TARGETS[goal] || GOAL_TARGETS.muscle
  const floor = sex === 'female' ? 1300 : 1600
  const calories = Math.max(floor, Math.round((maintenance + g.kcal) / 10) * 10)
  const protein = Math.round(weight * g.protein)
  const fat = Math.round(Math.max(weight * 0.7, (calories * 0.25) / 9))
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return {
    maintenance: Math.round(maintenance / 10) * 10,
    calories, protein, fat, carbs,
    water: Math.round(weight * 0.035 * 10 + (activity === 'light' ? 0 : 5)) / 10,
    creatine: 5,
    pace: g.pace,
  }
}
