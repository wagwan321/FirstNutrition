import { useEffect, useState } from 'react'
import { useInView } from './Reveal.jsx'

// Counts from 0 to `end` (ease-out) the first time it scrolls into view.
export default function CountUp({ end, suffix = '', duration = 1600, delay = 0 }) {
  const [ref, inView] = useInView('0px')
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(end)
      return
    }
    let raf
    let start
    const tick = (t) => {
      start ??= t
      const p = Math.min(1, (t - start) / duration)
      setValue(Math.round(end * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => { raf = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [inView, end, duration, delay])

  return <span ref={ref}>{value}{suffix}</span>
}
