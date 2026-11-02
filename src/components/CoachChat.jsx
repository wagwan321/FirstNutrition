import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, CalendarPlus, RotateCcw, SendHorizontal, ChevronDown, Plus } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import CategoryIcon from './CategoryIcon.jsx'
import OrderModal from './OrderModal.jsx'
import { useCart, variantLabel } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { productById } from '../data/catalog.js'
import { GOALS, SEXES, DAYS, BUDGETS, AVOID, HOW_TO, planFor, icsFile } from '../utils/coachPlan.js'
import { answer, suggestions } from '../utils/coachBrain.js'
import { buildOrderMessage, openWhatsApp, waUrl } from '../utils/whatsapp.js'

// The Coach conversation: six quick answers, then the plan arrives in a few
// animated messages (calories ring, live goal / training controls, the stack),
// and the visitor can keep asking questions. Used by the floating chat panel
// and the /coach page; state is kept on this device.
const STORAGE_KEY = 'fn_coach_v2'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null } }
const wait = (ms) => new Promise(r => setTimeout(r, reduceMotion() ? 0 : ms))

// Animates a number towards `value` (eased), re-animating whenever it changes.
function useTween(value, ms = 900) {
  const [v, setV] = useState(() => (reduceMotion() ? value : 0))
  const from = useRef(v)
  useEffect(() => {
    if (reduceMotion()) { setV(value); from.current = value; return }
    const start = performance.now()
    const a = from.current
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms)
      const cur = a + (value - a) * (1 - Math.pow(1 - k, 3))
      from.current = cur
      setV(cur)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return Math.round(v)
}

export default function CoachChat({ compact = false }) {
  const { t, price, country, region, lang } = useLocale()
  const { addItem, setDrawerOpen } = useCart()
  const saved = useMemo(load, [])
  const [a, setA] = useState(() => saved?.a || { avoid: [] })
  const [step, setStep] = useState(() => (saved?.a?.done ? 6 : 0))
  const [stage, setStage] = useState(() => (saved?.a?.done ? 4 : 0))   // how much of the plan has arrived
  const [thread, setThread] = useState(() => saved?.thread || [])
  const [typing, setTyping] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ a, thread: thread.slice(-30) })) } catch { /* private mode */ }
  }, [a, thread])

  // keep the newest message in view
  useEffect(() => {
    if (step === 0 && !thread.length) return
    const box = scrollRef.current
    if (compact && box) box.scrollTo({ top: box.scrollHeight, behavior: reduceMotion() ? 'auto' : 'smooth' })
    else endRef.current?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'end' })
  }, [step, stage, thread.length, typing, compact])

  const { plan, stack } = step >= 6 ? planFor(a) : {}
  const label = (list, id) => t(list.find(x => x.id === id)?.label || '')

  // Intake: answer, then the coach "types" the next question.
  const answerStep = async (patch) => {
    const next = step + 1
    setA(prev => ({ ...prev, ...patch, done: next >= 6 }))
    setTyping(true)
    await wait(600)
    setTyping(false)
    setStep(next)
    if (next >= 6) {
      for (const s of [1, 2, 3, 4]) {
        setStage(s)
        if (s < 4) { setTyping(true); await wait(s === 1 ? 1500 : 900); setTyping(false) }
      }
    }
  }
  const restart = () => { setA({ avoid: [] }); setStep(0); setStage(0); setThread([]) }

  // English summary for WhatsApp (store staff read the messages).
  const en = (list, id) => list.find(x => x.id === id)?.label || ''
  const summary = plan && [
    `*Coach plan* (${en(GOALS, a.goal)})`,
    `${en(SEXES, a.sex)} · ${a.age} y · ${a.height} cm · ${a.weight} kg · trains ${en(DAYS, a.activity)} a week`,
    `Calories ${plan.calories} kcal · Protein ${plan.protein} g · Carbs ${plan.carbs} g · Fat ${plan.fat} g`,
  ].join('\n')

  // Follow-up questions: built-in answers first, then the AI endpoint (when
  // the site has one switched on), then a hand-off to a real coach.
  const ask = async (question, shown = question) => {
    if (!question.trim() || typing) return
    setThread(th => [...th, { id: Date.now(), from: 'me', text: shown.trim() }])
    setDraft('')
    setTyping(true)
    const branches = region.branches?.length || 0
    const res = answer(question, { t, plan, a, stack, region, price, branches })
    let reply
    if (res.fallback) {
      await wait(500)
      const ai = await askAI(question)
      reply = ai
        ? { text: ai, ai: true }
        : { text: t('That one is best answered by a real coach. Send it to our team on WhatsApp and they’ll reply:'), handoff: question }
    } else {
      const next = res.patch ? { ...a, ...res.patch } : a
      if (res.patch) setA(next)
      const snap = res.plan || res.stack ? planFor(next) : null
      reply = {
        text: res.text, list: res.list, after: res.after, products: res.products, actions: res.actions,
        handoff: res.handoff ? question : null, suggest: res.suggest,
        planSnap: res.plan ? snap.plan : null,
        stackSnap: res.stack ? snap.stack.items.map(i => ({ id: i.product.id, vid: i.variant?.id, lasts: i.lasts, approx: i.approx })) : null,
      }
      await wait(Math.min(1400, 450 + reply.text.length * 4))
    }
    setTyping(false)
    setThread(th => [...th, { id: Date.now() + 1, from: 'coach', ...reply }])
  }

  const askAI = async (question) => {
    try {
      const history = thread.filter(m => m.text).slice(-6).map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text.slice(0, 600) }))
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 25000)
      const res = await fetch('/api/coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ question: question.slice(0, 500), lang, country, history, profile: { ...a, done: undefined }, plan }),
      })
      clearTimeout(timer)
      if (!res.ok) return null
      const data = await res.json()
      return typeof data.text === 'string' && data.text.trim() ? data.text.trim() : null
    } catch { return null }
  }

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

  const asked = new Set(thread.filter(m => m.from === 'me').map(m => m.key || m.text))
  const lastCoach = [...thread].reverse().find(m => m.from === 'coach')
  const chips = [lastCoach?.suggest, ...suggestions(a)].filter(Boolean).filter((s, i, all) => all.indexOf(s) === i && !asked.has(t(s))).slice(0, 3)

  return (
    <div className={`cchat${compact ? ' is-compact' : ''}`}>
      <div className="cchat-scroll" ref={scrollRef}>
        <div className="chat" aria-live="polite">
          <Bubble>{t('Hi! I’m the First Nutrition coach. What are you training for?')}</Bubble>
          {step === 0 && <Chips options={GOALS} onPick={(id) => answerStep({ goal: id })} />}
          {step > 0 && <Bubble me>{label(GOALS, a.goal)}</Bubble>}

          {step >= 1 && <Bubble>{t('Got it. Are you male or female? (It changes the energy maths.)')}</Bubble>}
          {step === 1 && <Chips options={SEXES} onPick={(id) => answerStep({ sex: id })} />}
          {step > 1 && <Bubble me>{label(SEXES, a.sex)}</Bubble>}

          {step >= 2 && <Bubble>{t('Your age, height and weight?')}</Bubble>}
          {step === 2 && <BodyForm initial={a} onDone={(body) => answerStep(body)} />}
          {step > 2 && <Bubble me>{t('{age} y · {h} cm · {w} kg', { age: a.age, h: a.height, w: a.weight })}</Bubble>}

          {step >= 3 && <Bubble>{t('How many days a week do you train?')}</Bubble>}
          {step === 3 && <Chips options={DAYS} onPick={(id) => answerStep({ activity: id })} />}
          {step > 3 && <Bubble me>{label(DAYS, a.activity)}</Bubble>}

          {step >= 4 && <Bubble>{t('Monthly budget for supplements?')}</Bubble>}
          {step === 4 && <Chips options={BUDGETS.map(b => ({ ...b, label: region.currency === 'USD' && b.id < 9999 ? `≤ ${price(b.id)}` : b.label }))} onPick={(id) => answerStep({ budget: id })} />}
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
              <button type="button" className="chip chip-go" onClick={() => answerStep({})}>{t('Done')} <ArrowRight size={15} className="flip-rtl" /></button>
            </div>
          )}
          {step > 5 && <Bubble me>{a.avoid.length ? a.avoid.map(x => label(AVOID, x)).join(', ') : t('Nothing')}</Bubble>}

          {plan && stage >= 1 && (
            <>
              <Bubble>{t('Here’s your plan. Tap the ring or change your goal to see it adjust:')}</Bubble>
              <PlanCard plan={plan} a={a} onChange={(patch) => setA(p => ({ ...p, ...patch }))} />
            </>
          )}
          {plan && stage >= 2 && (
            <>
              <Bubble>{a.age < 18
                ? t('Under 18: build your plan on food first. Protein is the one supplement worth considering, and check with your doctor.')
                : t('Your stack from our shelves. Tap one to see how to take it:')}</Bubble>
              <StackCards items={stack.items} />
              <p className="stack-month">{t('About {m} a month', { m: price(Math.round(stack.month)) })}
                {stack.later.length > 0 && <small>{t('Over budget for now: {list}.', { list: stack.later.map(i => i.product.name).join(', ') })}</small>}
              </p>
            </>
          )}
          {plan && stage >= 3 && (
            <div className="plan-actions">
              <button type="button" className="btn btn-primary" onClick={addStack}><ShoppingBag size={17} /> {t('Add the stack to cart')}</button>
              <button type="button" className="btn btn-wa" onClick={() => setOrdering(true)}><WhatsAppIcon size={17} /> {t('Order on WhatsApp')}</button>
              <button type="button" className="btn btn-ghost" onClick={remind}><CalendarPlus size={16} /> {t('Remind me to re-order')}</button>
            </div>
          )}
          {plan && stage >= 4 && <Bubble>{t('Got questions? Ask me anything about your plan, your stack or how to take it.')}</Bubble>}

          {thread.map(m => (m.from === 'me'
            ? <Bubble me key={m.id}>{m.text}</Bubble>
            : <CoachReply key={m.id} m={m} summary={summary} onAddStack={addStack} onOrder={() => setOrdering(true)} />))}

          {typing && <div className="bubble typing" aria-label={t('Coach is typing')}><i /><i /><i /></div>}
          <span ref={endRef} />
        </div>
      </div>

      {plan && stage >= 4 && (
        <div className="cchat-foot">
          {!typing && chips.length > 0 && (
            <div className="cchat-suggest">
              {chips.map(s => <button key={s} type="button" className="chip" onClick={() => ask(s, t(s))}>{t(s)}</button>)}
            </div>
          )}
          <form className="composer" onSubmit={(e) => { e.preventDefault(); ask(draft) }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500}
              placeholder={t('Ask about your plan…')} aria-label={t('Ask the Coach a question')} />
            <button type="submit" className="composer-send" disabled={!draft.trim() || typing} aria-label={t('Send')}>
              <SendHorizontal size={19} className="flip-rtl" />
            </button>
          </form>
          <div className="cchat-meta">
            <a href={waUrl(`${summary}\n\nCan a coach check this plan for me?`, country)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={14} /> {t('Talk to a real coach')}
            </a>
            <button type="button" onClick={restart}><RotateCcw size={13} /> {t('Start over')}</button>
          </div>
        </div>
      )}

      {stack && (
        <OrderModal open={ordering} onClose={() => setOrdering(false)} onConfirm={sendOrder}
          title={t('Order my Coach stack')}
          summary={`${stack.items.map(i => i.product.name).join(' + ')} = ${price(stack.items.reduce((s, i) => s + i.unit, 0))}`} />
      )}
    </div>
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

// Calories in the middle of a ring split into protein / carbs / fat. The
// ring, the numbers and the stack re-animate when the goal or training days change.
const MACROS = [
  { id: 'protein', label: 'Protein', kcal: 4, tip: 'Builds and repairs muscle: about {n} palm-sized portions a day.' },
  { id: 'carbs', label: 'Carbs', kcal: 4, tip: 'Your training fuel: rice, oats, bread, potatoes and fruit.' },
  { id: 'fat', label: 'Fat', kcal: 9, tip: 'For hormones and health: olive oil, nuts, eggs and avocado.' },
]
const R = 52
const C = 2 * Math.PI * R

function PlanCard({ plan, a, onChange }) {
  const { t, lang } = useLocale()
  const [focus, setFocus] = useState('protein')
  const [drawn, setDrawn] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true))); return () => cancelAnimationFrame(id) }, [])
  const kcal = useTween(plan.calories, 1100)
  const grams = { protein: useTween(plan.protein), carbs: useTween(plan.carbs), fat: useTween(plan.fat) }
  const total = MACROS.reduce((s, m) => s + plan[m.id] * m.kcal, 0)
  let offset = 0
  const segs = MACROS.map(m => {
    const len = drawn ? Math.max(0, (plan[m.id] * m.kcal / total) * C - 3) : 0
    const seg = { ...m, len, offset }
    offset += drawn ? (plan[m.id] * m.kcal / total) * C : 0
    return seg
  })
  const fmt = (n) => n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')
  const active = MACROS.find(m => m.id === focus)

  return (
    <div className="plan-card">
      <div className="plan-top">
        <svg className="donut" viewBox="0 0 128 128" role="img" aria-label={t('{k} kcal a day', { k: plan.calories })}>
          <circle className="donut-track" cx="64" cy="64" r={R} />
          {segs.map(s => (
            <circle key={s.id} className={`donut-seg seg-${s.id}${focus === s.id ? ' on' : ''}`} cx="64" cy="64" r={R}
              strokeDasharray={`${s.len} ${C}`} strokeDashoffset={-s.offset} onClick={() => setFocus(s.id)} />
          ))}
        </svg>
        <div className="donut-mid" aria-hidden="true"><b>{fmt(kcal)}</b><span>{t('kcal a day')}</span></div>
      </div>

      <div className="macro-tabs" role="tablist" aria-label={t('Daily macros')}>
        {MACROS.map(m => (
          <button key={m.id} type="button" role="tab" aria-selected={focus === m.id} className={`macro-tab mt-${m.id}${focus === m.id ? ' on' : ''}`} onClick={() => setFocus(m.id)}>
            <i /><span>{t(m.label)}</span><b>{fmt(grams[m.id])} g</b>
          </button>
        ))}
      </div>
      <p className="macro-tip" key={focus}>{t(active.tip, { n: Math.max(1, Math.round(plan.protein / 30)) })}</p>

      <div className="tuner">
        <span>{t('Goal')}</span>
        <div className="seg">
          {GOALS.map(g => <button key={g.id} type="button" className={a.goal === g.id ? 'on' : ''} aria-pressed={a.goal === g.id} onClick={() => onChange({ goal: g.id })}>{t(g.short)}</button>)}
        </div>
        <span>{t('Training')}</span>
        <div className="seg">
          {DAYS.map(d => <button key={d.id} type="button" className={a.activity === d.id ? 'on' : ''} aria-pressed={a.activity === d.id} onClick={() => onChange({ activity: d.id })}>{t(d.label).replace(/ (days|أيام|يوم)$/, '')}</button>)}
        </div>
      </div>
      <details className="plan-about">
        <summary>{t('About these numbers')} <ChevronDown size={14} /></summary>
        <p>{t('Maintenance ≈ {m} kcal · aim for {pace}', { m: plan.maintenance, pace: t(plan.pace) })} · {plan.water} L {t('water a day')} · {plan.creatine} g {t('creatine a day')}</p>
        <p>{t('Estimates from standard sports-nutrition formulas, not medical advice. Pregnant, under 18 or managing a health condition? Talk to your doctor first.')}</p>
      </details>
    </div>
  )
}

function StackCards({ items }) {
  const { t, price } = useLocale()
  const [open, setOpen] = useState(null)
  return (
    <ul className="stack-cards">
      {items.map((i, n) => {
        const id = i.product.id
        return (
          <li key={id} style={{ '--n': n }} className={open === id ? 'open' : ''}>
            <button type="button" className="stack-card" aria-expanded={open === id} onClick={() => setOpen(o => (o === id ? null : id))}>
              <img src={i.variant?.img || i.product.img} alt="" />
              <span className="stack-info">
                <small>{i.product.brand}</small>
                <b>{i.product.name}</b>
                {i.lasts && (
                  <span className="lasts">
                    <i style={{ '--w': `${Math.min(100, (i.lasts / 90) * 100)}%` }} />
                    {t('Lasts {approx}{d} days', { approx: i.approx ? '≈ ' : '', d: i.lasts })}
                  </span>
                )}
              </span>
              <em>{price(i.unit)}</em>
            </button>
            {open === id && (
              <div className="stack-more">
                <p>{t(HOW_TO[i.product.category] || 'As on the label.')}</p>
                <Link to={`/product/${id}`}>{t('View product')} <ArrowRight size={14} className="flip-rtl" /></Link>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function CoachReply({ m, summary, onAddStack, onOrder }) {
  const { t, price, country, lang } = useLocale()
  const { addItem } = useCart()
  return (
    <div className="reply">
      <Bubble>
        {m.text}
        {m.list && <span className="reply-list">{m.list.map(l => <span key={l}>• {l}</span>)}</span>}
        {m.after && <span className="reply-after">{m.after}</span>}
      </Bubble>
      {m.planSnap && (
        <div className="snap">
          <b>{m.planSnap.calories.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</b> {t('kcal a day')}
          <span>{t('Protein')} {m.planSnap.protein} g · {t('Carbs')} {m.planSnap.carbs} g · {t('Fat')} {m.planSnap.fat} g</span>
        </div>
      )}
      {m.stackSnap && (
        <ul className="mini-products">
          {m.stackSnap.map(s => {
            const p = productById(s.id)
            const v = p.variants.find(x => x.id === s.vid)
            return (
              <li key={s.id}>
                <Link to={`/product/${p.id}`}><img src={v?.img || p.img} alt="" /><span><b>{p.name}</b>{s.lasts && <small>{t('Lasts {approx}{d} days', { approx: s.approx ? '≈ ' : '', d: s.lasts })}</small>}</span></Link>
                <em>{price(v?.price ?? p.price)}</em>
              </li>
            )
          })}
        </ul>
      )}
      {m.products?.length > 0 && (
        <ul className="mini-products">
          {m.products.map(id => {
            const p = productById(id)
            if (!p) return null
            const single = p.variants.length <= 1
            return (
              <li key={id}>
                <Link to={`/product/${p.id}`}><img src={p.img} alt="" /><span><b>{p.name}</b><small>{p.brand}</small></span></Link>
                <em>{price(p.price)}</em>
                {single
                  ? <button type="button" className="mini-add" onClick={() => addItem(p, p.variants[0])} aria-label={t('Add {name} to cart', { name: p.name })}><Plus size={16} /></button>
                  : <Link className="mini-add" to={`/product/${p.id}`} aria-label={t('Choose options for {name}', { name: p.name })}><ArrowRight size={16} className="flip-rtl" /></Link>}
              </li>
            )
          })}
        </ul>
      )}
      {(m.actions?.length > 0 || m.handoff) && (
        <div className="reply-actions">
          {m.actions?.includes('cart') && <button type="button" className="chip" onClick={onAddStack}><ShoppingBag size={14} /> {t('Add the stack to cart')}</button>}
          {m.actions?.includes('order') && <button type="button" className="chip" onClick={onOrder}><WhatsAppIcon size={14} /> {t('Order on WhatsApp')}</button>}
          {m.actions?.includes('branches') && <Link className="chip" to="/branches">{t('See our branches')} <ArrowRight size={14} className="flip-rtl" /></Link>}
          {m.handoff && (
            <a className="chip chip-wa" href={waUrl(`${m.handoff}\n\n${summary || ''}`.trim(), country)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={14} /> {t('Ask a real coach')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
