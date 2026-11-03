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
import ChalkDust from './ChalkDust.jsx'
import giantPlate from '../assets/hero/giant-plate.webp'
import changePlates from '../assets/hero/change-plates.webp'
import barSleeve from '../assets/hero/bar-sleeve.webp'
import chalk from '../assets/hero/floor-chalk.webp'
import chalkPuff from '../assets/hero/chalk-puff.webp'

// The change plates show the goals that are not loaded, always in this order.
const SIDE_ORDER = ['perform', 'cut', 'bulk', 'muscle']
const ROLL_OUT_MS = 430     // the loaded plate rolls off the bar
const SETTLE_MS = 1250      // the new one rolls in, lands and settles

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function LoadedBar() {
  const { t, lang, region, country, price } = useLocale()
  const [goalId, setGoalId] = useState('muscle')   // what was picked
  const [loaded, setLoaded] = useState('muscle')   // what the bar and floor show
  const [phase, setPhase] = useState('idle')       // idle | out | in
  const [ordering, setOrdering] = useState(false)
  const timers = useRef([])
  const stageRef = useRef(null)

  const goal = GOAL_STACKS.find(g => g.id === loaded)
  const sides = SIDE_ORDER.filter(id => id !== loaded).slice(0, 3)
    .map(id => GOAL_STACKS.find(g => g.id === id))

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Scroll and pointer drive two sets of CSS variables on the stage:
  // --sp (0..1, how far the hero has scrolled away) and --mx/--my (-1..1,
  // pointer position, eased). Each layer moves by its own depth in CSS.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || reducedMotion()) return
    let raf = 0
    let mx = 0, my = 0, tx = 0, ty = 0
    const fine = window.matchMedia('(pointer: fine)').matches
    const frame = () => {
      raf = 0
      const h = stage.offsetHeight || 1
      const sp = Math.min(1, Math.max(0, window.scrollY / h))
      stage.style.setProperty('--sp', sp.toFixed(4))
      mx += (tx - mx) * 0.12
      my += (ty - my) * 0.12
      stage.style.setProperty('--mx', mx.toFixed(4))
      stage.style.setProperty('--my', my.toFixed(4))
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width) * 2 - 1
      ty = ((e.clientY - r.top) / r.height) * 2 - 1
      kick()
    }
    const onLeave = () => { tx = 0; ty = 0; kick() }
    window.addEventListener('scroll', kick, { passive: true })
    if (fine) {
      stage.addEventListener('pointermove', onMove)
      stage.addEventListener('pointerleave', onLeave)
    }
    kick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Load another goal: the big plate rolls off the end of the bar, the tubs
  // drop out, then the new plate rolls in, lands with a bounce and kicks up chalk.
  const load = (id) => {
    if (id === goalId) return
    timers.current.forEach(clearTimeout)
    setGoalId(id)
    if (reducedMotion()) { setLoaded(id); setPhase('idle'); return }
    setPhase('out')
    timers.current = [
      setTimeout(() => { setLoaded(id); setPhase('in') }, ROLL_OUT_MS),
      setTimeout(() => setPhase('idle'), ROLL_OUT_MS + SETTLE_MS),
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
      <div className="lb-stage" data-phase={phase} dir="ltr" ref={stageRef}>
        {/* wall and floor run the full width; the composition sits centred on
            them in .lb-canvas, so wide, short screens get no bare strip */}
        <div className="lb-floor" aria-hidden="true" />
        <ChalkDust />
        <div className="lb-canvas">
        <div className="lb-floor-marks" aria-hidden="true"><img className="lb-chalk" src={chalk} alt="" draggable="false" /></div>

        <div className="lb-copy">
          <h1 id="lb-title" className="lb-headline" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <span>{t('Load your')}</span> <span>{t('goal.')}</span>
          </h1>
          <p className="lb-trust" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {t('Official distributor')} · {t('{n} brands', { n: ALL_BRANDS.length })} · <span className="nowrap">ISO 9001 / 22000 / 45001</span><br />
            {t('Cash on delivery across {country}', { country: t(region.name) })}
          </p>
        </div>

        {/* The bar runs from the sleeve through the change plates and on behind
            the big plate's hub. */}
        <div className="lb-rig">
          <span className="lb-bar" aria-hidden="true" />
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
        </div>

        {/* The loaded goal: one big 25 kg plate, total on the hub. */}
        <div className="lb-plate">
          <div className="lb-plate-roll" key={loaded}>
            <img src={giantPlate} alt="" draggable="false" fetchpriority="high" />
            <svg className="lb-rim" viewBox="0 0 1798 1815" aria-hidden="true">
              <defs><path id="lb-arc" d="M 394 907 A 505 505 0 0 1 1404 907" /></defs>
              <text style={{ fontSize: rimSize }}><textPath href="#lb-arc" startOffset="50%" textAnchor="middle">{goalName}</textPath></text>
            </svg>
            <p className="lb-hub" aria-live="polite">
              <span className="sr-only">{t('{goal} stack total', { goal: t(goal.name) })}: </span>
              <b>{price(goal.total).replace(/\s*(JOD|د\.أ)$/, '')}</b>
              <small>{region.currency === 'USD' ? 'USD' : t('JOD')}</small>
            </p>
          </div>
          <img className="lb-puff" key={`puff-${loaded}`} src={chalkPuff} alt="" aria-hidden="true" draggable="false" />
        </div>

        {/* The stack stands on the platform, each tub named on the floor below it. */}
        <ul className="lb-stack" aria-label={t('{goal} stack', { goal: t(goal.name) })}>
          {goal.items.map((item, i) => (
            <li key={`${loaded}-${item.product.id}`} className={`lb-slot lb-slot-${i}`} style={{ '--i': i }}>
              <Link to={`/product/${item.product.id}`} className="lb-tub" tabIndex={-1} aria-hidden="true">
                <img src={item.img} alt="" draggable="false" />
              </Link>
              <Link to={`/product/${item.product.id}`} className="lb-label">
                <small>{item.product.brand}</small>
                <b>{item.label}</b>
                <em>{price(item.unit)}</em>
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
