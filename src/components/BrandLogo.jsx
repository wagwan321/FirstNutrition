import { BRAND_LOGOS } from '../data/catalog.js'

// Monochrome wordmarks so the brand strip reads as one consistent logo wall.
// If an official logo file is registered in BRAND_LOGOS it is used instead.
const WORDMARKS = {
  'Optimum Nutrition':   { kind: 'stack', main: 'OPTIMUM', sub: 'NUTRITION', badge: 'ON' },
  'BSN':                 { kind: 'solo', main: 'BSN', mod: 'wide italic' },
  'MuscleTech':          { kind: 'solo', main: 'MUSCLETECH', mod: 'italic' },
  'Universal Nutrition': { kind: 'stack', main: 'UNIVERSAL', sub: 'NUTRITION' },
  'MusclePharm':         { kind: 'split', main: 'MUSCLE', sub: 'PHARM' },
  'Cellucor':            { kind: 'solo', main: 'CELLUCOR', mod: 'wide tracked' },
  'BPI Sports':          { kind: 'boxed', main: 'BPI', sub: 'SPORTS' },
  'Scivation':           { kind: 'solo', main: 'SCIVATION', mod: 'light tracked' },
  'Quest Nutrition':     { kind: 'stack', main: 'QUEST', sub: 'NUTRITION', mod: 'wide' },
  'Gaspari':             { kind: 'stack', main: 'GASPARI', sub: 'NUTRITION', mod: 'italic' },
  'ABB':                 { kind: 'boxed', main: 'ABB', sub: 'PERFORMANCE' },
  'Oh Yeah!':            { kind: 'script', main: 'Oh Yeah!' },
}

export default function BrandLogo({ name }) {
  const file = BRAND_LOGOS[name]
  if (file) return <img className="wm-img" src={file} alt={name} loading="lazy" />

  const w = WORDMARKS[name] || { kind: 'solo', main: name.toUpperCase() }
  const mod = w.mod ? ` ${w.mod.split(' ').map(m => `wm-${m}`).join(' ')}` : ''

  return (
    <span className={`wm wm-${w.kind}${mod}`} role="img" aria-label={name}>
      {w.badge && <span className="wm-badge" aria-hidden="true">{w.badge}</span>}
      {w.kind === 'boxed' && <span className="wm-box" aria-hidden="true">{w.main}</span>}
      {w.kind !== 'boxed' && <span className="wm-main" aria-hidden="true">{w.main}</span>}
      {w.sub && <span className="wm-sub" aria-hidden="true">{w.sub}</span>}
    </span>
  )
}
