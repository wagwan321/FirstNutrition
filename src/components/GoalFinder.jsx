import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import Reveal from './Reveal.jsx'
import { GOALS, PRODUCTS } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'

// "Shop by goal": photo tiles work as tabs; the picks below follow the goal.
export default function GoalFinder() {
  const { t } = useLocale()
  const [active, setActive] = useState(GOALS[0].id)
  const goal = GOALS.find(g => g.id === active)
  const picks = PRODUCTS
    .filter(p => goal.cats.includes(p.category))
    .sort((a, b) => (b.bestseller - a.bestseller) || (goal.cats.indexOf(a.category) - goal.cats.indexOf(b.category)))
    .slice(0, 4)

  return (
    <div className="goal-finder">
      <div className="goal-tiles" role="tablist" aria-label={t('Choose your goal')}>
        {GOALS.map((g, i) => (
          <Reveal key={g.id} variant={i % 2 ? 'right' : 'left'} delay={i * 80}>
            <button type="button" role="tab" aria-selected={active === g.id}
              className={`goal-tile${active === g.id ? ' active' : ''}`} onClick={() => setActive(g.id)}>
              <img src={g.img} alt="" loading="lazy" />
              <span className="goal-tile-txt">
                <b>{t(g.name)}</b>
                <small>{t(g.blurb)}</small>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <div className="goal-panel" role="tabpanel" key={goal.id}>
        <div className="goal-panel-head">
          <h3><small>{t('Top picks')}</small>{t(goal.name)}</h3>
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
