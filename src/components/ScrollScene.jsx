import { useEffect, useRef } from 'react'

// Scroll-linked effects. Every registered element gets three CSS variables,
// updated once per frame from a single shared scroll listener:
//   --p      0 → 1 while the element travels from the bottom edge to the top edge
//   --enter  0 → 1 while its top edge travels from the bottom of the viewport to the top
//   --exit   0 → 1 while it scrolls out past the top (0 until its top reaches the top)
// CSS then drives transforms from those values, e.g.
//   translate: 0 calc((var(--p, .5) - .5) * -60px);
// With reduced motion the variables are never set, so CSS falls back to the
// neutral defaults given in each var().

const tracked = new Set()
let raf = 0

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function measure() {
  raf = 0
  const vh = window.innerHeight
  tracked.forEach(el => {
    const r = el.getBoundingClientRect()
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return
    el.style.setProperty('--p', clamp((vh - r.top) / (vh + r.height)).toFixed(4))
    el.style.setProperty('--enter', clamp((vh - r.top) / vh).toFixed(4))
    el.style.setProperty('--exit', clamp(-r.top / r.height).toFixed(4))
  })
}

const schedule = () => { if (!raf) raf = requestAnimationFrame(measure) }

export function useScrollVars(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    tracked.add(el)
    if (tracked.size === 1) {
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
    }
    schedule()
    return () => {
      tracked.delete(el)
      if (!tracked.size) {
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
      }
    }
  }, [ref])
}

export default function ScrollScene({ as: Tag = 'div', children, ...rest }) {
  const ref = useRef(null)
  useScrollVars(ref)
  return <Tag ref={ref} {...rest}>{children}</Tag>
}
