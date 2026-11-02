import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, ShoppingBag, CalendarPlus, ArrowRight, Info } from 'lucide-react'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import CategoryIcon from '../components/CategoryIcon.jsx'
import OrderModal from '../components/OrderModal.jsx'
import { useCart, variantLabel } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { productById } from '../data/catalog.js'
import { dailyPlan, servingsPer } from '../utils/nutrition.js'
import { buildOrderMessage, openWhatsApp, waUrl } from '../utils/whatsapp.js'

// The Coach: a guided chat that works out daily calories and macros for the
// visitor's goal (Mifflin-St Jeor), then builds a stack from real catalog
// products within their budget, with how long each tub lasts.
const STORAGE_KEY = 'fn_coach_v1'

const GOALS = [
  { id: 'muscle', label: 'Build muscle' },
  { id: 'gain', label: 'Gain weight' },
  { id: 'lose', label: 'Lose fat' },
  { id: 'performance', label: 'Perform better' },
]
const SEXES = [{ id: 'male', label: 'Male' }, { id: 'female', label: 'Female' }]
const DAYS = [
  { id: 'light', label: '1–2 days' }, { id: 'moderate', label: '3–4 days' },
  { id: 'hard', label: '5–6 days' }, { id: 'daily', label: 'Every day' },
]
const TRAINING_DAYS = { light: 2, moderate: 4, hard: 6, daily: 7 }
const BUDGETS = [
  { id: 50, label: 'Up to 50 JOD' }, { id: 100, label: 'Up to 100 JOD' },
  { id: 160, label: 'Up to 160 JOD' }, { id: 9999, label: 'No limit' },
]
const AVOID = [{ id: 'lactose', label: 'Lactose' }, { id: 'caffeine', label: 'Caffeine' }]

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

function buildStack({ goal, activity, budget, avoid, age, protein, weight }) {
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
    return { product, variant, unit, daily, per, lasts, approx: servings?.approx, monthly }
  })
  // Keep the most important items that fit the monthly budget.
  const kept = []
  let month = 0
  for (const item of items) {
    if (kept.length === 0 || month + item.monthly <= budget) { kept.push(item); month += item.monthly }
  }
  return { items: kept, later: items.filter(i => !kept.includes(i)), scoops, month }
}

function icsFile({ date, title, body }) {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//First Nutrition//Coach//EN', 'BEGIN:VEVENT',
    `UID:${stamp}-${Math.random().toString(36).slice(2)}@firstnutrition`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${title}`, `DESCRIPTION:${body.replace(/\n/g, '\\n')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

const loadSaved = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null } }

export default function Coach() {
  const { t, price, country, region, lang } = useLocale()
  const { addItem, setDrawerOpen } = useCart()
  const saved = useMemo(loadSaved, [])
  const [a, setA] = useState(() => saved || { avoid: [] })
  const [step, setStep] = useState(() => (saved?.done ? 6 : 0))
  const [typing, setTyping] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const endRef = useRef(null)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)) } catch { /* private mode */ } }, [a])
  useEffect(() => {
    if (step > 0) endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' })
  }, [step, typing, reduce])

  // Answer, then the coach "types" the next question.
  const answer = (patch, next = step + 1) => {
    setA(prev => ({ ...prev, ...patch, done: next >= 6 }))
    if (reduce) return setStep(next)
    setTyping(true)
    setTimeout(() => { setTyping(false); setStep(next) }, 650)
  }
  const restart = () => { setA({ avoid: [] }); setStep(0) }

  const plan = step >= 6 ? dailyPlan(a) : null
  const stack = plan ? buildStack({ ...a, protein: plan.protein }) : null
  const label = (list, id) => t(list.find(x => x.id === id)?.label || '')

  // WhatsApp messages stay in English: store staff read them.
  const en = (list, id) => list.find(x => x.id === id)?.label || ''
  const summary = plan && [
    `*Coach plan* (${en(GOALS, a.goal)})`,
    `${en(SEXES, a.sex)} · ${a.age} y · ${a.height} cm · ${a.weight} kg · trains ${en(DAYS, a.activity)} a week`,
    `Calories ${plan.calories} kcal · Protein ${plan.protein} g · Carbs ${plan.carbs} g · Fat ${plan.fat} g`,
  ].join('\n')

  const addStack = () => { stack.items.forEach(i => addItem(i.product, i.variant)); setDrawerOpen(true) }
  const sendOrder = (customer) => {
    const lines = stack.items.map(i => ({ ...i, qty: 1 }))
    const subtotal = lines.reduce((s, l) => s + l.unit, 0)
    openWhatsApp(`${buildOrderMessage({ lines, subtotal, customer, country })}\n\n${summary}`, country)
    setOrdering(false)
  }
  const remind = () => {
    const first = stack.items.filter(i => i.lasts).sort((x, y) => x.lasts - y.lasts)[0]
    const date = new Date(Date.now() + Math.max(3, (first?.lasts || 30) - 4) * 864e5)
    const body = stack.items.map(i => `${i.product.name}${variantLabel(i.variant) ? ` (${variantLabel(i.variant)})` : ''}`).join('\n')
    const blob = new Blob([icsFile({ date, title: t('Re-order your stack – First Nutrition'), body })], { type: 'text/calendar' })
    const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'first-nutrition-reorder.ics' })
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 4000)
  }

  const kcal = plan ? [
    { id: 'protein', g: plan.protein, kcal: plan.protein * 4, label: t('Protein') },
    { id: 'carbs', g: plan.carbs, kcal: plan.carbs * 4, label: t('Carbs') },
    { id: 'fat', g: plan.fat, kcal: plan.fat * 9, label: t('Fat') },
  ] : []

  return (
    <section className="section coach">
      <div className="container coach-wrap">
        <header className="coach-head">
          <span className="coach-avatar" aria-hidden="true"><CategoryIcon id="coach" size={30} /></span>
          <div>
            <h1 className="section-title">{t('Coach')}</h1>
            <p>{t('Six quick taps: your daily calories and macros, and a stack from our shelves that fits your budget.')}</p>
          </div>
        </header>

        <div className="chat" aria-live="polite">
          <Bubble>{t('Hi! I’m the First Nutrition coach. What are you training for?')}</Bubble>
          {step === 0 && <Chips options={GOALS} onPick={(id) => answer({ goal: id })} />}
          {step > 0 && <Bubble me>{label(GOALS, a.goal)}</Bubble>}

          {step >= 1 && <Bubble>{t('Got it. Are you male or female? (It changes the energy maths.)')}</Bubble>}
          {step === 1 && <Chips options={SEXES} onPick={(id) => answer({ sex: id })} />}
          {step > 1 && <Bubble me>{label(SEXES, a.sex)}</Bubble>}

          {step >= 2 && <Bubble>{t('Your age, height and weight?')}</Bubble>}
          {step === 2 && <BodyForm initial={a} onDone={(body) => answer(body)} />}
          {step > 2 && <Bubble me>{t('{age} y · {h} cm · {w} kg', { age: a.age, h: a.height, w: a.weight })}</Bubble>}

          {step >= 3 && <Bubble>{t('How many days a week do you train?')}</Bubble>}
          {step === 3 && <Chips options={DAYS} onPick={(id) => answer({ activity: id })} />}
          {step > 3 && <Bubble me>{label(DAYS, a.activity)}</Bubble>}

          {step >= 4 && <Bubble>{t('Monthly budget for supplements?')}</Bubble>}
          {step === 4 && <Chips options={BUDGETS.map(b => ({ ...b, label: region.currency === 'USD' && b.id < 9999 ? `≤ ${price(b.id)}` : b.label }))} onPick={(id) => answer({ budget: id })} />}
          {step > 4 && <Bubble me>{a.budget >= 9999 ? t('No limit') : `≤ ${price(a.budget)}`}</Bubble>}

          {step >= 5 && <Bubble>{t('Anything you avoid? Pick any, then tap Done.')}</Bubble>}
          {step === 5 && (
            <div className="chips">
              {AVOID.map(o => (
                <button key={o.id} type="button" className={`chip${a.avoid.includes(o.id) ? ' on' : ''}`} aria-pressed={a.avoid.includes(o.id)}
                  onClick={() => setA(p => ({ ...p, avoid: p.avoid.includes(o.id) ? p.avoid.filter(x => x !== o.id) : [...p.avoid, o.id] }))}>
                  {t(o.label)}
                </button>
              ))}
              <button type="button" className="chip chip-go" onClick={() => answer({})}>{t('Done')} <ArrowRight size={15} className="flip-rtl" /></button>
            </div>
          )}
          {step > 5 && <Bubble me>{a.avoid.length ? a.avoid.map(x => label(AVOID, x)).join(', ') : t('Nothing')}</Bubble>}

          {typing && <div className="bubble typing" aria-label={t('Coach is typing')}><i /><i /><i /></div>}

          {plan && (
            <div className="plan">
              <Bubble>{t('Here’s your plan. Eat this much every day:')}</Bubble>
              <div className="plan-card">
                <div className="plan-kcal">
                  <b>{plan.calories.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</b>
                  <span>{t('kcal a day')}</span>
                  <small>{t('Maintenance ≈ {m} kcal · aim for {pace}', { m: plan.maintenance, pace: t(plan.pace) })}</small>
                </div>
                <div className="plan-macros">
                  {kcal.map(m => (
                    <div key={m.id} className={`macro macro-${m.id}`}>
                      <span>{m.label}</span>
                      <b>{m.g} g</b>
                      <i style={{ '--w': `${Math.round((m.kcal / plan.calories) * 100)}%` }} />
                    </div>
                  ))}
                </div>
                <ul className="plan-extra">
                  <li><b>{plan.water} L</b> {t('water a day')}</li>
                  <li><b>{plan.creatine} g</b> {t('creatine a day')}</li>
                  <li><b>{stack.scoops}</b> {t(stack.scoops === 1 ? 'protein scoop a day' : 'protein scoops a day')}</li>
                </ul>
              </div>

              <Bubble>{a.age < 18
                ? t('Under 18: build your plan on food first. Protein is the one supplement worth considering, and check with your doctor.')
                : t('Your stack from our shelves, and how long each tub lasts you:')}</Bubble>
              <ul className="plan-stack">
                {stack.items.map(i => (
                  <li key={i.product.id}>
                    <Link to={`/product/${i.product.id}`}><img src={i.variant?.img || i.product.img} alt="" /></Link>
                    <div>
                      <small>{i.product.brand}</small>
                      <b><Link to={`/product/${i.product.id}`}>{i.product.name}</Link></b>
                      <span>{variantLabel(i.variant)}</span>
                      {i.lasts && <span className="lasts">{t('Lasts {approx}{d} days', { approx: i.approx ? '≈ ' : '', d: i.lasts })}</span>}
                    </div>
                    <em>{price(i.unit)}</em>
                  </li>
                ))}
              </ul>
              {stack.later.length > 0 && (
                <p className="plan-later">{t('Over budget for now: {list}.', { list: stack.later.map(i => i.product.name).join(', ') })}</p>
              )}
              <p className="plan-month">{t('About {m} a month', { m: price(Math.round(stack.month)) })}</p>

              <div className="plan-actions">
                <button type="button" className="btn btn-primary" onClick={addStack}><ShoppingBag size={18} /> {t('Add the stack to cart')}</button>
                <button type="button" className="btn btn-wa" onClick={() => setOrdering(true)}><WhatsAppIcon size={18} /> {t('Order on WhatsApp')}</button>
                <a className="btn btn-ghost" href={waUrl(`${summary}\n\nCan a coach check this plan for me?`, country)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={17} /> {t('Ask a real coach')}
                </a>
                <button type="button" className="btn btn-ghost" onClick={remind}><CalendarPlus size={17} /> {t('Remind me to re-order')}</button>
                <button type="button" className="btn btn-link" onClick={restart}><RotateCcw size={16} /> {t('Start over')}</button>
              </div>
              <p className="plan-note"><Info size={15} /> {t('Estimates from standard sports-nutrition formulas, not medical advice. Pregnant, under 18 or managing a health condition? Talk to your doctor first.')}</p>
            </div>
          )}
          <span ref={endRef} />
        </div>
      </div>

      {stack && (
        <OrderModal open={ordering} onClose={() => setOrdering(false)} onConfirm={sendOrder}
          title={t('Order my Coach stack')}
          summary={`${stack.items.map(i => i.product.name).join(' + ')} = ${price(stack.items.reduce((s, i) => s + i.unit, 0))}`} />
      )}
    </section>
  )
}

function Bubble({ me, children }) {
  return (
    <div className={`bubble${me ? ' me' : ''}`}>
      {!me && <span className="bubble-avatar" aria-hidden="true"><CategoryIcon id="coach" size={16} /></span>}
      <p>{children}</p>
    </div>
  )
}

function Chips({ options, onPick }) {
  const { t } = useLocale()
  return (
    <div className="chips">
      {options.map(o => <button key={o.id} type="button" className="chip" onClick={() => onPick(o.id)}>{t(o.label)}</button>)}
    </div>
  )
}

function BodyForm({ initial, onDone }) {
  const { t } = useLocale()
  const [v, setV] = useState({ age: initial.age || '', height: initial.height || '', weight: initial.weight || '' })
  const fields = [
    { id: 'age', label: t('Age'), min: 14, max: 80, unit: '' },
    { id: 'height', label: t('Height'), min: 130, max: 220, unit: 'cm' },
    { id: 'weight', label: t('Weight'), min: 35, max: 200, unit: 'kg' },
  ]
  const ok = fields.every(f => Number(v[f.id]) >= f.min && Number(v[f.id]) <= f.max)
  return (
    <form className="body-form" onSubmit={(e) => { e.preventDefault(); if (ok) onDone({ age: +v.age, height: +v.height, weight: +v.weight }) }}>
      {fields.map(f => (
        <label key={f.id}>
          <span>{f.label}</span>
          <span className="body-input">
            <input type="number" inputMode="numeric" min={f.min} max={f.max} required value={v[f.id]}
              onChange={(e) => setV(s => ({ ...s, [f.id]: e.target.value }))} />
            {f.unit && <i>{f.unit}</i>}
          </span>
        </label>
      ))}
      <button type="submit" className="chip chip-go" disabled={!ok}>{t('Next')} <ArrowRight size={15} className="flip-rtl" /></button>
    </form>
  )
}
