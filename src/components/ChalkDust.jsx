import { useEffect, useRef } from 'react'

// Chalk dust hanging in the air: slow motes drifting up through a section.
// Fills its positioned parent; only animates while on screen.
export default function ChalkDust({ density = 1 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    let w = 0, h = 0, motes = [], raf = 0, last = 0, visible = false

    const seed = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      const n = Math.round(Math.min(60, (w * h) / 16000) * density)
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.6 + Math.random() * 1.9, s: 6 + Math.random() * 14,
        drift: Math.random() * Math.PI * 2, a: 0.18 + Math.random() * 0.42,
      }))
    }
    const frame = (now) => {
      const dt = Math.min(48, now - (last || now)) / 1000
      last = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const m of motes) {
        m.drift += dt * 0.6
        m.y -= m.s * dt
        m.x += Math.sin(m.drift) * 6 * dt + 3 * dt
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w }
        if (m.x > w + 4) m.x = -4
        ctx.fillStyle = `rgba(255,255,255,${m.a})`
        ctx.beginPath(); ctx.arc(m.x * dpr, m.y * dpr, m.r * dpr, 0, Math.PI * 2); ctx.fill()
      }
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame) }
    })
    seed()
    io.observe(canvas)
    window.addEventListener('resize', seed)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', seed)
    }
  }, [density])

  return <canvas ref={ref} className="chalk-dust" aria-hidden="true" />
}
