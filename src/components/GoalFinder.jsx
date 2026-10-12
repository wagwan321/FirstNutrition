import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dumbbell, Flame, Zap, Activity, HeartPulse, Cookie, ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import { PRODUCTS } from '../data/catalog.js'

const GOALS = [
  { id: 'muscle', label: 'Build Muscle', icon: Dumbbell, cat: 'protein',
    blurb: 'Quality protein and creatine to grow, repair and get stronger.',
    match: p => p.category === 'protein' || /creatine/i.test(p.name) },
  { id: 'lean', label: 'Lose Fat', icon: Flame, cat: 'burners',
    blurb: 'Thermogenics and lean-friendly support for your cut.',
    match: p => p.category === 'burners' },
  { id: 'energy', label: 'Energy & Focus', icon: Zap, cat: 'preworkout',
    blurb: 'Pre-workouts for explosive sessions and laser focus.',
    match: p => p.category === 'preworkout' },
  { id: 'recover', label: 'Recover Faster', icon: Activity, cat: 'aminos',
    blurb: 'Aminos, glutamine and minerals to bounce back between sessions.',
    match: p => p.category === 'aminos' || /zma/i.test(p.name) },
  { id: 'health', label: 'Daily Health', icon: HeartPulse, cat: 'vitamins',
    blurb: 'Multivitamins and omega-3s to cover the basics every day.',
    match: p => p.category === 'vitamins' },
  { id: 'snack', label: 'Snack Smart', icon: Cookie, cat: 'bars',
    blurb: 'High-protein bars and shakes for busy days on the go.',
    match: p => p.category === 'bars' },
]

// "What's your goal?" — tabbed product recommendations.
export default function GoalFinder() {
  const [active, setActive] = useState(GOALS[0].id)
  const goal = GOALS.find(g => g.id === active)
  // best sellers first, then the rest in catalog order
  const picks = PRODUCTS.filter(goal.match)
    .sort((a, b) => (b.tag === 'Best Seller') - (a.tag === 'Best Seller'))
    .slice(0, 4)

  return (
    <div className="goal-finder">
      <div className="goal-tabs" role="tablist" aria-label="Choose your goal">
        {GOALS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={active === id}
            className={`goal-tab${active === id ? ' active' : ''}`} onClick={() => setActive(id)}>
            <Icon size={18} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="goal-panel" role="tabpanel" key={goal.id}>
        <div className="goal-intro">
          <span className="goal-icon"><goal.icon size={26} /></span>
          <div>
            <h3>{goal.label}</h3>
            <p>{goal.blurb}</p>
          </div>
          <Link to={`/shop/${goal.cat}`} className="btn btn-ghost btn-sm">
            Shop all <ArrowRight size={16} />
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
