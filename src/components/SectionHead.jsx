import Reveal, { RevealText } from './Reveal.jsx'

// Section heading with staggered, direction-varied entrances: the eyebrow
// slides in from the left, the title rises word by word, and the subtitle /
// action comes in from the right.
export default function SectionHead({ eyebrow, title, sub, children, center = false }) {
  return (
    <div className={`section-head${center ? ' is-center' : ''}`}>
      <div>
        {eyebrow && (
          <Reveal as="span" variant={center ? 'up' : 'left'} className="eyebrow">{eyebrow}</Reveal>
        )}
        <RevealText as="h2" className="section-title" text={title} delay={120} />
      </div>
      {sub && <Reveal as="p" variant={center ? 'up' : 'right'} delay={260} className="section-sub">{sub}</Reveal>}
      {children && <Reveal variant={center ? 'up' : 'right'} delay={300}>{children}</Reveal>}
    </div>
  )
}
