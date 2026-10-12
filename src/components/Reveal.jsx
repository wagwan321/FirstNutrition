import { useEffect, useRef, useState } from 'react'

// One IntersectionObserver per root margin, shared by every element using it.
const observers = new Map()
const callbacks = new WeakMap()

function getObserver(rootMargin) {
  if (typeof IntersectionObserver === 'undefined') return null
  if (!observers.has(rootMargin)) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        callbacks.get(entry.target)?.()
        io.unobserve(entry.target)
      })
    }, { rootMargin, threshold: 0.01 })
    observers.set(rootMargin, io)
  }
  return observers.get(rootMargin)
}

// Returns [ref, inView]. Flips to true once, the first time the element
// scrolls into view (older browsers without IO just show everything).
// The default margin waits until the element is 10% up from the bottom edge.
export function useInView(rootMargin = '0px 0px -10% 0px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    const io = getObserver(rootMargin)
    if (!el || !io) { setInView(true); return }
    callbacks.set(el, () => setInView(true))
    io.observe(el)
    return () => { io.unobserve(el); callbacks.delete(el) }
  }, [rootMargin])

  return [ref, inView]
}

// Fades/slides its children in when scrolled into view.
// variant: 'up' | 'left' | 'right' | 'scale' · delay in ms (for staggering)
export default function Reveal({
  as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest
}) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant}${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
