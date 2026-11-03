import { useEffect, useRef, useState } from 'react'

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Animates a number towards `value` (eased), re-animating whenever it changes.
export default function useTween(value, ms = 900) {
  const [v, setV] = useState(() => (reduceMotion() ? value : 0))
  const from = useRef(v)
  useEffect(() => {
    if (reduceMotion()) { setV(value); from.current = value; return }
    const start = performance.now()
    const a = from.current
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - start) / ms)
      const cur = a + (value - a) * (1 - Math.pow(1 - k, 3))
      from.current = cur
      setV(cur)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return Math.round(v)
}
