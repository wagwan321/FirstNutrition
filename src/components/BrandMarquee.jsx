import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { BRANDS } from '../data/catalog.js'

// One infinitely scrolling row. The list is rendered twice and the track
// slides by exactly one copy, so the loop is seamless.
function Row({ brands, reverse = false, speed = 40 }) {
  const copy = (hidden) => (
    <ul className="logo-set" aria-hidden={hidden || undefined}>
      {brands.map(b => (
        <li key={b}>
          <Link to={`/shop?brand=${encodeURIComponent(b)}`} className="logo-card"
                tabIndex={hidden ? -1 : undefined} title={`Shop ${b}`}>
            <BrandLogo name={b} />
          </Link>
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

export default function BrandMarquee({ rows = 2 }) {
  // Two rows run in opposite directions; each row still shows every brand,
  // the second one rotated so the same logos don't line up vertically.
  const half = Math.ceil(BRANDS.length / 2)
  const rowB = [...BRANDS.slice(half), ...BRANDS.slice(0, half)].reverse()

  return (
    <div className="logo-marquee">
      <Row brands={BRANDS} speed={46} />
      {rows > 1 && <Row brands={rowB} reverse speed={52} />}
    </div>
  )
}
