import Reveal, { RevealText } from './Reveal.jsx'

// Section heading: the stencil title rises word by word, and the subtitle /
// action comes in from the other side. (No kicker above it: the heading
// carries its own weight.)
export default function SectionHead({ title, sub, children, center = false }) {
  return (
    <div className={`section-head${center ? ' is-center' : ''}`}>
      <div>
        <RevealText as="h2" className="section-title" text={title} delay={120} />
      </div>
      {sub && <Reveal as="p" variant={center ? 'up' : 'right'} delay={260} className="section-sub">{sub}</Reveal>}
      {children && <Reveal variant={center ? 'up' : 'right'} delay={300}>{children}</Reveal>}
    </div>
  )
}
