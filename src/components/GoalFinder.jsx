import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import { GOALS, PRODUCTS } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'
import collar from '../assets/hero/collar.webp'

// "Shop by goal": the goals are plates threaded on one bar. The loaded goal is
// the red plate with the collar locked against it; the picks below follow it.
export default function GoalFinder() {
  const { t } = useLocale()
  const [active, setActive] = useState(GOALS[0].id)
  const index = GOALS.findIndex(g => g.id === active)
  const goal = GOALS[index]
  const picks = PRODUCTS
    .filter(p => goal.cats.includes(p.category))
    .sort((a, b) => (b.bestseller - a.bestseller) || (goal.cats.indexOf(a.category) - goal.cats.indexOf(b.category)))
    .slice(0, 4)

  // Arrow keys move along the bar (mirrored in RTL), as a tablist should.
  const onKey = (e) => {
    const rtl = document.documentElement.dir === 'rtl'
    const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = GOALS[(index + step + GOALS.length) % GOALS.length]
    setActive(next.id)
    document.getElementById(`goal-tab-${next.id}`)?.focus()
  }

  return (
    <div className="goal-finder">
      <div className="goal-bar" style={{ '--slot': index, '--slots': GOALS.length }}>
        <span className="goal-rod" aria-hidden="true" />
        <div className="goal-plates" role="tablist" aria-label={t('Choose your goal')} onKeyDown={onKey}>
          {GOALS.map(g => (
            <button key={g.id} id={`goal-tab-${g.id}`} type="button" role="tab"
              aria-selected={active === g.id} aria-controls="goal-panel" tabIndex={active === g.id ? 0 : -1}
              className={`goal-plate${active === g.id ? ' is-loaded' : ''}`} onClick={() => setActive(g.id)}>
              <b>{t(g.name)}</b>
              <small>{t(g.blurb)}</small>
            </button>
          ))}
        </div>
        <img className="goal-collar" src={collar} alt="" aria-hidden="true" draggable="false" />
      </div>

      <div className="goal-panel" id="goal-panel" role="tabpanel" aria-labelledby={`goal-tab-${goal.id}`} key={goal.id}>
        <div className="goal-panel-head">
          <div>
            <h3>{t(goal.name)}</h3>
            <p className="goal-panel-blurb">{t(goal.blurb)}</p>
          </div>
          <Link to={`/shop?goal=${goal.id}`} className="link-arrow">
            {t('Shop all')} <ArrowRight size={16} className="flip-rtl" />
          </Link>
        </div>
        <div className="grid product-grid goal-grid">
          {picks.map((p, i) => (
            <div key={p.id} style={{ '--i': i }}><ProductCard product={p} /></div>
          ))}
        </div>
      </div>
    </div>
  )
}
