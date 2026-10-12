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
      // threshold 0 (not a small ratio): clip-path reveals start fully clipped,
      // which browsers report as a 0 intersection ratio
    }, { rootMargin, threshold: 0 })
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

// Headline that rises in word by word (each word slides up out of a mask).
// `text` may contain "\n" for line breaks. Screen readers get the plain text.
export function RevealText({ as: Tag = 'h2', text, className = '', delay = 0, stagger = 70 }) {
  const [ref, inView] = useInView()
  let n = 0
  return (
    <Tag ref={ref} className={`split${inView ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
         aria-label={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, li) => (
        <span className="split-line" key={li} aria-hidden="true">
          {line.split(' ').map((word, wi, words) => (
            <span key={wi}>
              <span className="split-word">
                <span style={{ '--wd': `${delay + n++ * stagger}ms` }}>{word}</span>
              </span>
              {wi < words.length - 1 && ' '}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}

// Fades/slides its children in when scrolled into view.
// variant: 'up' | 'down' | 'left' | 'right' | 'scale' | 'flip' | 'tilt-left'
//          | 'tilt-right' | 'clip-left' | 'clip-right' | 'clip-up' | 'blur'
// delay in ms (for staggering)
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
