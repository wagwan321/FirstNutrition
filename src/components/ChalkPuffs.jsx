import { useEffect, useRef } from 'react'

// A small puff of chalk wherever you tap or click, site-wide. One fixed canvas
// that only animates while a puff is in the air.
export default function ChalkPuffs() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    let parts = []
    let raf = 0
    let last = 0

    const size = () => {
      canvas.width = Math.round(innerWidth * dpr)
      canvas.height = Math.round(innerHeight * dpr)
    }
    const frame = (now) => {
      const dt = Math.min(48, now - (last || now)) / 1000
      last = now
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      parts = parts.filter(p => (p.life -= dt) > 0)
      for (const p of parts) {
        p.vx *= 0.9; p.vy = p.vy * 0.9 - 14 * dt
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += 26 * dt
        const a = Math.min(1, p.life / p.max) * p.a
        const g = ctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, p.r * dpr)
        g.addColorStop(0, `rgba(${p.c},${a})`)
        g.addColorStop(1, `rgba(${p.c},0)`)
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x * dpr, p.y * dpr, p.r * dpr, 0, Math.PI * 2); ctx.fill()
      }
      raf = parts.length ? requestAnimationFrame(frame) : 0
      if (!raf) { last = 0; ctx.clearRect(0, 0, canvas.width, canvas.height) }
    }
    const puff = (e) => {
      if (e.button > 0 || e.target.closest('input, textarea, select, [contenteditable]')) return
      for (let i = 0; i < 12; i++) {
        const ang = Math.random() * Math.PI * 2
        const sp = 40 + Math.random() * 120
        const life = 0.45 + Math.random() * 0.4
        parts.push({
          x: e.clientX, y: e.clientY, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.7,
          r: 3 + Math.random() * 5, life, max: life, a: 0.28 + Math.random() * 0.22,
          // grey-white dust reads on both the white pages and the rubber floor
          c: Math.random() < 0.5 ? '255,255,255' : '176,179,186',
        })
      }
      if (!raf) raf = requestAnimationFrame(frame)
    }
    size()
    window.addEventListener('resize', size)
    document.addEventListener('pointerdown', puff, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      document.removeEventListener('pointerdown', puff)
    }
  }, [])

  return <canvas ref={ref} className="chalk-puffs" aria-hidden="true" />
}
