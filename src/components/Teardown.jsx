import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Gauge, GlassWater } from 'lucide-react'
import { TubBody, TubLid, Scoop } from './ProteinTub.jsx'
import { useLocale } from '../i18n.jsx'

// Pinned, scroll-driven exploded view of a protein tub. While the section is
// pinned, its scroll progress (0 → 1) is written to the CSS variable --t and
// each part maps its own slice of that range to a transform (see .td-* in
// index.css). Scrolling back reassembles the tub.

// Powder particles: [x%, y%, dx px, dy px, size px]
const POWDER = [
  [50, 30, -120, -160, 7], [52, 29, 90, -190, 5], [48, 31, -60, -230, 4], [55, 30, 150, -120, 6],
  [45, 31, -170, -90, 5], [50, 28, 20, -250, 6], [57, 31, 200, -60, 4], [43, 30, -210, -40, 4],
  [51, 30, 120, -230, 3], [47, 29, -140, -200, 3], [53, 31, 60, -140, 8], [49, 31, -30, -170, 9],
  [54, 29, 230, -150, 3], [46, 30, -240, -130, 3], [50, 32, 170, -20, 5], [48, 32, -190, 10, 5],
]

const STEPS = [
  { icon: ShieldCheck, title: 'Sealed at the source', text: 'Every tub ships sealed from the official brand — that is how we guarantee 100% authentic.' },
  { icon: Gauge, title: 'Real numbers in every scoop', text: 'A typical 30 g scoop of premium whey delivers about 24 g of protein and 5.5 g of BCAAs.' },
  { icon: GlassWater, title: 'Mix, drink, recover', text: 'Shake one scoop with 200–250 ml of water or milk after training, or whenever you need a protein boost.' },
]

const CALLOUTS = [
  { cls: 'c1', value: '100%', label: 'Authentic, sealed lid', o: 0 },
  { cls: 'c2', value: '24 g', label: 'Protein per scoop', o: 0.04 },
  { cls: 'c3', value: '5.5 g', label: 'BCAAs per scoop', o: 0.08 },
  { cls: 'c4', value: '~120', label: 'kcal · 1–2 g sugar', o: 0.12 },
]

export default function Teardown() {
  const { t } = useLocale()
  const ref = useRef(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--t', '1')
      setStep(2)
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1
      el.style.setProperty('--t', p.toFixed(4))
      const s = p < 0.34 ? 0 : p < 0.62 ? 1 : 2
      setStep(prev => (prev === s ? prev : s))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className="teardown" ref={ref} aria-labelledby="td-title">
      <div className="td-sticky">
        <div className="container td-grid">
          <div className="td-copy">
            <span className="eyebrow">{t('Inside the tub')}</span>
            <h2 id="td-title" className="section-title">{t('Everything that goes into one scoop.')}</h2>
            <ol className="td-steps">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className={i === step ? 'on' : i < step ? 'done' : ''}>
                  <span className="td-step-ico"><Icon size={18} /></span>
                  <div>
                    <b>{t(title)}</b>
                    <p>{t(text)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="td-cta">
              <Link to="/shop/protein" className="btn btn-primary">{t('Shop protein')} <ArrowRight size={17} className="flip-rtl" /></Link>
              <small>{t('Typical values for premium whey. Always check each product’s label.')}</small>
            </div>
          </div>

          <div className="td-stage-wrap">
            <div className="td-stage">
              <div className="td-glow" aria-hidden="true" />
              <div className="td-shadow" aria-hidden="true" />
              <div className="td-part td-scoop"><Scoop uid="td" /></div>
              <div className="td-part td-body"><TubBody uid="td" open /></div>
              <div className="td-powder" aria-hidden="true">
                {POWDER.map(([x, y, dx, dy, s], i) => (
                  <span key={i} style={{ left: `${x}%`, top: `${y}%`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--s': `${s}px` }} />
                ))}
              </div>
              <div className="td-part td-lid"><TubLid uid="td" /></div>
              {CALLOUTS.map(c => (
                <div key={c.cls} className={`td-call ${c.cls}`} style={{ '--o': c.o }}>
                  <b>{c.value}</b><span>{t(c.label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="td-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
