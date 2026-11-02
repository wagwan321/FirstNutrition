import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import Reveal from './Reveal.jsx'
import { ALL_BRANDS, PRODUCTS } from '../data/catalog.js'

const hasProducts = (name) => PRODUCTS.some(p => p.brand === name)

// One infinitely scrolling row. The list is rendered twice and the track
// slides by exactly one copy, so the loop is seamless.
function Row({ brands, reverse = false, speed = 40 }) {
  const copy = (hidden) => (
    <ul className="logo-set" aria-hidden={hidden || undefined}>
      {brands.map(b => (
        <li key={b.name}>
          {hasProducts(b.name) ? (
            <Link to={`/shop?brand=${encodeURIComponent(b.name)}`} className="logo-card"
                  tabIndex={hidden ? -1 : undefined} title={b.name}>
              <BrandLogo name={b.name} />
            </Link>
          ) : (
            <span className="logo-card" title={b.name}><BrandLogo name={b.name} /></span>
          )}
        </li>
      ))}
    </ul>
  )
  return (
    <div className={`logo-row${reverse ? ' reverse' : ''}`} style={{ '--speed': `${speed}s` }}>
      <div className="logo-track">
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  )
}

export default function BrandMarquee() {
  // Two rows run in opposite directions and each slides in from the side it
  // scrolls toward.
  const half = Math.ceil(ALL_BRANDS.length / 2)
  const rowA = ALL_BRANDS.slice(0, half)
  const rowB = ALL_BRANDS.slice(half)
  return (
    <div className="logo-marquee">
      <Reveal variant="right"><Row brands={rowA} speed={44} /></Reveal>
      <Reveal variant="left" delay={150}><Row brands={rowB} reverse speed={48} /></Reveal>
    </div>
  )
}
