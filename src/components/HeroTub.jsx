import { useEffect, useRef } from 'react'
import ProteinTub from './ProteinTub.jsx'

// Fixed pseudo-random dust motes drifting up through the light beam.
const PARTICLES = [
  [18, 3, 7.5, 0], [27, 2, 9, 2.4], [34, 4, 8, 5.1], [41, 2, 10, 1.2],
  [58, 3, 8.5, 3.6], [63, 2, 11, 6.2], [70, 4, 9.5, .6], [76, 2, 7, 4.4],
  [49, 2, 12, 7.3], [83, 3, 10, 2.9], [22, 2, 11, 8.1], [66, 3, 8, 9],
]

// Hero product display: the tub floats over a lit platform, its shadow
// breathes in sync, and on desktop it leans/turns toward the pointer.
export default function HeroTub({ children }) {
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
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
      const x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2))
      const y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2))
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
    <div className="stage" ref={stageRef}>
      <div className="stage-beam" aria-hidden="true" />
      <div className="stage-glow" aria-hidden="true" />
      <div className="stage-platform" aria-hidden="true"><span /></div>
      <div className="stage-particles" aria-hidden="true">
        {PARTICLES.map(([x, s, d, delay], i) => (
          <span key={i} style={{ '--x': `${x}%`, '--s': `${s}px`, '--d': `${d}s`, '--delay': `${delay}s` }} />
        ))}
      </div>
      <div className="stage-shadow-wrap" aria-hidden="true"><div className="stage-shadow" /></div>
      <div className="stage-tub">
        <div className="stage-bob">
          <ProteinTub mark="FN" label="WHEY GOLD" uid="hero" shadow={false} sway />
        </div>
      </div>
      {children}
    </div>
  )
}
