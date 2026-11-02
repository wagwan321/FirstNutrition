// The Coach's intake options and stack builder, shared by the chat panel and
// the /coach page.
import { productById } from '../data/catalog.js'
import { dailyPlan, servingsPer } from './nutrition.js'

export const GOALS = [
  { id: 'muscle', label: 'Build muscle', short: 'Build' },
  { id: 'gain', label: 'Gain weight', short: 'Gain' },
  { id: 'lose', label: 'Lose fat', short: 'Cut' },
  { id: 'performance', label: 'Perform better', short: 'Perform' },
]
export const SEXES = [{ id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }]
export const DAYS = [
  { id: 'light', label: '1–2 days' }, { id: 'moderate', label: '3–4 days' },
  { id: 'hard', label: '5–6 days' }, { id: 'daily', label: 'Every day' },
]
const TRAINING_DAYS = { light: 2, moderate: 4, hard: 6, daily: 7 }
export const BUDGETS = [
  { id: 50, label: 'Up to 50 JOD' }, { id: 100, label: 'Up to 100 JOD' },
  { id: 160, label: 'Up to 160 JOD' }, { id: 9999, label: 'No limit' },
]
export const AVOID = [{ id: 'lactose', label: 'Lactose' }, { id: 'caffeine', label: 'Caffeine' }]

// Candidate products per goal, most important first: [productId, variantId,
// servings per day ('scoops' = the protein gap, 'train' = on training days)].
const STACKS = {
  muscle:      [[466, 637, 'scoops'], [511, 7885, 1], [565, 926, 'train']],
  gain:        [[450, 600, 1], [511, 7885, 1], [484, 716, 'train']],
  lose:        [[471, null, 'scoops'], [494, 7650, 1], [489, 489, 1]],
  performance: [[443, 443, 'train'], [511, 7885, 1], [565, 926, 'train']],
}
const STIMULANTS = [443, 489]
const WHEY_TO_ISOLATE = { 466: 471 }

// How to take each item, by category (shown when a stack card is opened).
export const HOW_TO = {
  protein: 'One scoop in water or milk after training; the second between meals.',
  gainers: 'One serving a day between meals or after training.',
  creatine: '5 g every day, any time; with a meal is easiest.',
  aminos: 'One scoop in water, sipped during training.',
  preworkout: '20–30 minutes before training; not within 6 hours of bedtime.',
  weight: 'As on the label, earlier in the day.',
}

export function buildStack({ goal, activity, budget, avoid = [], age, weight }, protein) {
  const trainDays = TRAINING_DAYS[activity] || 4
  // Most people eat about 1.2 g/kg from food; shakes cover the gap (1–2 scoops).
  const scoops = Math.min(2, Math.max(1, Math.round((protein - weight * 1.2) / 24)))
  let picks = STACKS[goal] || STACKS.muscle
  if (avoid.includes('lactose')) picks = picks.map(([id, v, d]) => (WHEY_TO_ISOLATE[id] ? [WHEY_TO_ISOLATE[id], null, d] : [id, v, d]))
  if (avoid.includes('caffeine') || age < 18) picks = picks.filter(([id]) => !STIMULANTS.includes(id))
  if (age < 18) picks = picks.slice(0, 1)

  const items = picks.map(([id, vid, per]) => {
    const product = productById(id)
    const variant = (vid && product.variants.find(v => v.id === vid))
      || product.variants.find(v => v.size === '1.3 lbs.') || product.variants[0]
    const unit = variant?.price ?? product.price
    const daily = per === 'scoops' ? scoops : per === 'train' ? trainDays / 7 : per
    const servings = servingsPer(product, variant)
    const lasts = servings ? Math.max(1, Math.round(servings.n / daily)) : null
    const monthly = lasts ? (unit * 30) / lasts : unit
    return { product, variant, unit, lasts, approx: servings?.approx, monthly }
  })
  // Keep the most important items that fit the monthly budget.
  const kept = []
  let month = 0
  for (const item of items) {
    if (kept.length === 0 || month + item.monthly <= budget) { kept.push(item); month += item.monthly }
  }
  return { items: kept, later: items.filter(i => !kept.includes(i)), scoops, month }
}

export function planFor(a) {
  const plan = dailyPlan(a)
  return { plan, stack: buildStack(a, plan.protein) }
}

export function icsFile({ date, title, body }) {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//First Nutrition//Coach//EN', 'BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@firstnutrition`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${title}`, `DESCRIPTION:${body.replace(/\n/g, '\\n')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}
