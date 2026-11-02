import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import OrderModal from './OrderModal.jsx'
import { GOAL_STACKS } from '../data/stacks.js'
import { useLocale } from '../i18n.jsx'
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp.js'
import { variantLabel } from '../context/CartContext.jsx'
import { ALL_BRANDS } from '../data/catalog.js'
import giantPlate from '../assets/hero/giant-plate.webp'
import changePlates from '../assets/hero/change-plates.webp'
import barSleeve from '../assets/hero/bar-sleeve.webp'
import ticket1 from '../assets/hero/ticket-1.webp'
import ticket2 from '../assets/hero/ticket-2.webp'
import ticket3 from '../assets/hero/ticket-3.webp'
import chalk from '../assets/hero/floor-chalk.webp'

const TICKETS = [ticket1, ticket2, ticket3]
// The change plates show the goals that are not loaded, always in this order.
const SIDE_ORDER = ['perform', 'cut', 'bulk', 'muscle']
const SWAP_MS = 900

export default function LoadedBar() {
  const { t, lang, region, country, price } = useLocale()
  const [goalId, setGoalId] = useState('muscle')
  const [shown, setShown] = useState('muscle')     // stack currently on the floor
  const [phase, setPhase] = useState('idle')       // idle | out | in
  const [ordering, setOrdering] = useState(false)
  const timers = useRef([])

  const goal = GOAL_STACKS.find(g => g.id === goalId)
  const stack = GOAL_STACKS.find(g => g.id === shown)
  const sides = SIDE_ORDER.filter(id => id !== goalId).slice(0, 3)
    .map(id => GOAL_STACKS.find(g => g.id === id))

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Load another goal: the big plate rolls a full turn while the tubs on the
  // floor drop out and the new stack rises in behind them.
  const load = (id) => {
    if (id === goalId) return
    timers.current.forEach(clearTimeout)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setGoalId(id)
    if (reduce) { setShown(id); setPhase('idle'); return }
    setPhase('out')
    timers.current = [
      setTimeout(() => { setShown(id); setPhase('in') }, 280),
      setTimeout(() => setPhase('idle'), SWAP_MS),
    ]
  }

  const sendOrder = (customer) => {
    const lines = goal.items.map(i => ({ ...i, qty: 1 }))
    openWhatsApp(buildOrderMessage({ lines, subtotal: goal.total, customer, country }), country)
    setOrdering(false)
  }

  const goalName = t(goal.name).toUpperCase()
  // Long names set smaller so they stay on the upper rim, clear of the 25 KG marks.
  const rimSize = goalName.length > 9 ? 205 : 245

  return (
    <section className="lb" aria-labelledby="lb-title">
      <div className="lb-stage" data-phase={phase} dir="ltr">
        <div className="lb-floor" aria-hidden="true"><img className="lb-chalk" src={chalk} alt="" draggable="false" /></div>

        <h1 id="lb-title" className="lb-headline" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <span>{t('Load your')}</span> <span>{t('goal.')}</span>
        </h1>
        <p className="lb-trust" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {t('Official distributor')} · {t('{n} brands', { n: ALL_BRANDS.length })} · <span className="nowrap">ISO 9001 / 22000 / 45001</span><br />
          {t('Cash on delivery across {country}', { country: t(region.name) })}
        </p>

        <img className="lb-sleeve" src={barSleeve} alt="" draggable="false" />

        {/* The other three goals hang on the sleeve; pulling one loads it. */}
        <div className="lb-sides" role="group" aria-label={t('Choose your goal')}>
          <img className="lb-sides-img" src={changePlates} alt="" draggable="false" />
          {sides.map((g, i) => (
            <button key={g.id} type="button" className={`lb-side lb-side-${i}`} onClick={() => load(g.id)}
              aria-label={t('Load the {goal} stack', { goal: t(g.name) })}>
              <span style={{ '--len': t(g.name).length }}>{t(g.name).toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* The loaded goal: one big 25 kg plate, total on the hub. */}
        <div className="lb-plate">
          <div className="lb-plate-spin" key={goalId}>
            <img src={giantPlate} alt="" draggable="false" fetchPriority="high" />
            <svg className="lb-rim" viewBox="0 0 1798 1815" aria-hidden="true">
              <defs><path id="lb-arc" d="M 394 907 A 505 505 0 0 1 1404 907" /></defs>
              <text style={{ fontSize: rimSize }}><textPath href="#lb-arc" startOffset="50%" textAnchor="middle">{goalName}</textPath></text>
            </svg>
          </div>
          <p className="lb-hub" aria-live="polite">
            <span className="sr-only">{t('{goal} stack total', { goal: t(goal.name) })}: </span>
            <b>{price(goal.total).replace(/\s*(JOD|د\.أ)$/, '')}</b>
            <small>{region.currency === 'USD' ? 'USD' : t('JOD')}</small>
          </p>
        </div>

        {/* The stack stands on the platform, each tub with its paper ticket. */}
        <ul className="lb-stack" aria-label={t('{goal} stack', { goal: t(stack.name) })}>
          {stack.items.map((item, i) => (
            <li key={`${shown}-${item.product.id}`} className={`lb-slot lb-slot-${i}`} style={{ '--i': i }}>
              <Link to={`/product/${item.product.id}`} className="lb-tub" tabIndex={-1} aria-hidden="true">
                <img src={item.img} alt="" draggable="false" />
              </Link>
              <Link to={`/product/${item.product.id}`} className={`lb-ticket lb-ticket-${i}`}>
                <img src={TICKETS[i]} alt="" draggable="false" />
                <span className="lb-ticket-text">
                  <span className="lb-t-brand">{item.product.brand}</span>
                  <span className="lb-t-name">{item.label}</span>
                  {item.variant?.size && <span className="lb-t-size">{item.variant.size.replace(/\.$/, '')}</span>}
                  <b className="lb-t-price">{price(item.unit)}</b>
                  <span className="lb-t-stamp">{t('Official stock')}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <button type="button" className="lb-cta" onClick={() => setOrdering(true)}>
          <span className="lb-cta-ico"><WhatsAppIcon size={22} /></span>
          {t('Order this stack on WhatsApp')}
          <ArrowRight size={22} className="flip-rtl" aria-hidden="true" />
        </button>
      </div>

      <OrderModal
        open={ordering}
        onClose={() => setOrdering(false)}
        onConfirm={sendOrder}
        title={t('Order the {goal} stack', { goal: t(goal.name) })}
        summary={`${goal.items.map(i => `${i.product.name}${variantLabel(i.variant) ? ` (${variantLabel(i.variant)})` : ''}`).join(' + ')} = ${price(goal.total)}`}
      />
    </section>
  )
}
