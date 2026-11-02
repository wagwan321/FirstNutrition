import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { productById } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'

// Three real product shots layered with depth. They float gently, lean toward
// the pointer on desktop (--px/--py) and drift apart as the hero scrolls away
// (--exit from the surrounding <ScrollScene>).
const SHOTS = [
  { id: 471, cls: 'hs-back-l' },
  { id: 443, cls: 'hs-back-r' },
  { id: 466, cls: 'hs-front' },
]

export default function HeroStage() {
  const { t, price } = useLocale()
  const ref = useRef(null)
  const hero = productById(466)

  useEffect(() => {
    const stage = ref.current
    const zone = stage?.closest('section') || stage
    if (!stage || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const set = (x, y) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--px', x.toFixed(3))
        stage.style.setProperty('--py', y.toFixed(3))
      })
    }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
    }
    const onLeave = () => set(0, 0)
    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="hstage" ref={ref}>
      <div className="hstage-disc" aria-hidden="true" />
      <div className="hstage-ring" aria-hidden="true" />
      {SHOTS.map(({ id, cls }) => {
        const p = productById(id)
        return (
          <Link key={id} to={`/product/${id}`} className={`hs-shot ${cls}`} aria-label={p.name}>
            <span className="hs-float"><img src={p.img} alt={p.name} /></span>
          </Link>
        )
      })}
      <Link to={`/product/${hero.id}`} className="hs-tag">
        <small>{hero.brand}</small>
        <b>{hero.name}</b>
        <span>{t('From')} <strong>{price(hero.price)}</strong></span>
      </Link>
    </div>
  )
}
