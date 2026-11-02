import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronsDown } from 'lucide-react'
import { useLocale } from '../i18n.jsx'
import tubImg from '../assets/hero/td-tub.webp'
import lidImg from '../assets/hero/td-lid.webp'
import sealImg from '../assets/hero/td-seal.webp'
import scoopImg from '../assets/hero/td-scoop.webp'
import powderImg from '../assets/hero/td-powder.webp'

// Scroll-driven teardown of a real tub (Optimum Nutrition Gold Standard 5 lb).
// The diagram pins while you scroll through its track: scrolling down lifts the
// cap, the seal, the scoop and a serving of powder out in turn and draws each
// callout; scrolling back up puts the tub together again.
//
// Everything is laid out in "tub pixels" (the tub photo is 1279 x 2090) inside
// one BOX_W x BOX_H diagram. Each part has its assembled top (on / inside the
// tub) and its exploded top; the scroll moves it between the two. The scoop and
// the powder start inside the tub, so they are clipped to the tub's opening and
// rise out through it.
const BOX_W = 2560
const BOX_H = 4120
const TUB_X = 40                       // tub top-left in the box
const TUB_Y = 1960
const TUB_W = 1279
const TUB_H = 2090
const CX = 641                         // centre line of the opening (tub px)
const MOUTH = { cy: 245, rx: 384, ry: 196 }   // inner opening ellipse (tub px)
const ASM_ZOOM = 1.7                   // closed tub fills the frame, then the camera pulls back
const TEXT_X = 1420                    // callout text column (tub px)

const PARTS = [
  { id: 'lid',    img: lidImg,    w: 960, ar: 1002 / 1326, cx: .5,   asm: -135, exp: -1900, win: [.04, .30], tilt: -5,
    call: { y: -1537, x: 1121 }, no: '01', title: 'Screw cap',      spec: 'tamper-evident · twist-lock' },
  { id: 'seal',   img: sealImg,   w: 941, ar: 941 / 1708,  cx: .468, asm: 10,   exp: -1270, win: [.14, .40], tilt: 3,
    call: { y: -1014, x: 1090 }, no: '02', title: 'Freshness seal', spec: 'peel-off foil · factory sealed' },
  { id: 'scoop',  img: scoopImg,  w: 564, ar: 1453 / 1839, cx: .706, asm: 460,  exp: -790,  win: [.24, .50], tilt: -8, inner: true,
    call: { y: -529, x: 820 },   no: '03', title: 'Scoop',          spec: '1 level scoop ≈ 30 g' },
  { id: 'powder', img: powderImg, w: 740, ar: 1203 / 1460, cx: .5,   asm: 450,  exp: -470,  win: [.34, .60], tilt: 0, inner: true,
    call: { y: -165, x: 1015 },  no: '04', title: 'Whey blend',     spec: '≈ 24 g protein · 5.5 g BCAA' },
]
const TUB_CALL = { y: 1300, x: 1285, win: [.58, .70], no: '05', title: 'Tub', spec: '5 lb · ≈ 74 servings' }

const px = (x) => `${((TUB_X + x) / BOX_W) * 100}%`   // tub x -> box %
const py = (y) => `${((TUB_Y + y) / BOX_H) * 100}%`   // tub y -> box %
const ease = (x) => 1 - Math.pow(1 - x, 3)
const clamp01 = (x) => Math.min(1, Math.max(0, x))

// What the inside parts can show through: everything above the opening's
// centre line, plus the opening's ellipse down to its front rim.
const INSIDE_MASK = [
  `linear-gradient(#000 0 0) 0 0 / 100% ${py(MOUTH.cy)} no-repeat`,
  `radial-gradient(${(MOUTH.rx / BOX_W) * 100}% ${(MOUTH.ry / BOX_H) * 100}% at ${px(CX)} ${py(MOUTH.cy)}, #000 99%, transparent 100%)`,
].join(', ')

function Part({ part }) {
  const h = part.w * part.ar
  return (
    <img src={part.img} alt="" draggable="false" data-win={part.win.join(',')}
      className={`td2-part td2-${part.id}`}
      style={{
        left: px(CX - part.cx * part.w), top: py(part.asm), width: `${(part.w / BOX_W) * 100}%`,
        '--lift': `${((part.exp - part.asm) / h) * 100}%`, '--tilt': `${part.tilt}deg`,
      }} />
  )
}

function Callout({ c, win }) {
  const { t, lang } = useLocale()
  return (
    <div className="td2-call" data-win={win.join(',')}
      style={{ top: py(c.y), left: px(c.x + 30), width: `${((TEXT_X - c.x - 30) / BOX_W) * 100}%` }}>
      <span className="td2-line" />
      <span className="td2-text" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <b><i>{c.no}</i> {t(c.title)}</b>
        {/* break lines only between the spec's parts, never inside one */}
        <small>{t(c.spec).split(' · ').map((part, i) => <span key={i}>{i > 0 && ' · '}<span className="nowrap">{part}</span></span>)}</small>
      </span>
    </div>
  )
}

export default function Teardown() {
  const { t } = useLocale()
  const trackRef = useRef(null)
  const sceneRef = useRef(null)

  // Scroll progress through the track (0..1) -> each part's own eased --t
  // inside its window, and --zo (1 = zoomed on the closed tub, 0 = whole diagram).
  useEffect(() => {
    const track = trackRef.current
    const scene = sceneRef.current
    if (!track || !scene) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = [...scene.querySelectorAll('[data-win]')].map(el => ({ el, win: el.dataset.win.split(',').map(Number) }))
    const pin = track.firstElementChild
    let pinTop = 0
    const measure = () => { pinTop = parseFloat(getComputedStyle(pin).top) || 0 }
    const update = () => {
      const travel = track.offsetHeight - pin.offsetHeight
      const p = reduce || travel <= 0 ? 1 : clamp01((pinTop - track.getBoundingClientRect().top) / travel)
      for (const { el, win: [a, b] } of els) el.style.setProperty('--t', ease(clamp01((p - a) / (b - a))).toFixed(4))
      scene.style.setProperty('--zo', (1 - ease(clamp01(p / 0.3))).toFixed(4))
    }
    const onResize = () => { measure(); update() }
    measure()
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section className="td2" aria-labelledby="td-title">
      <div className="container td2-grid">
        <div className="td2-copy">
          <h2 id="td-title" className="section-title">{t('Anatomy of a protein tub.')}</h2>
          <p className="td-lead">
            {t('Every tub we sell arrives sealed from the official brand. Here is exactly what you get when you open one.')}
          </p>
          <div className="td-actions">
            <Link to="/shop/protein" className="btn btn-primary">{t('Shop protein')} <ArrowRight size={17} className="flip-rtl" /></Link>
          </div>
          <p className="td2-hint"><ChevronsDown size={18} aria-hidden="true" /> {t('Scroll to take it apart')}</p>
          <small className="td-note">{t('Typical values for premium whey. Always check each product’s label.')}</small>
          <ol className="sr-only">
            {[...PARTS, TUB_CALL].map(c => <li key={c.no}>{t(c.title)}: {t(c.spec)}</li>)}
          </ol>
        </div>

        <div className="td2-track" ref={trackRef}>
          <div className="td2-pin">
            <div className="td2-sheet">
              <div className="td2-box" role="img" dir="ltr" style={{ aspectRatio: `${BOX_W} / ${BOX_H}` }}
                aria-label={t('Exploded view of a protein tub: screw cap, freshness seal, scoop, whey blend and tub')}>
                <div className="td2-scene" ref={sceneRef}
                  style={{ transformOrigin: `${px(CX)} ${py(TUB_H)}`, '--pan': `${50 - ((TUB_X + CX) / BOX_W) * 100}%`, '--zoom': ASM_ZOOM - 1 }}>
                  <span className="td2-shadow" aria-hidden="true"
                    style={{ left: px(-60), width: `${((TUB_W + 120) / BOX_W) * 100}%`, top: py(TUB_H - 190), height: `${(250 / BOX_H) * 100}%` }} />
                  <img src={tubImg} alt="" draggable="false" className="td2-part td2-tub"
                    style={{ left: px(0), top: py(0), width: `${(TUB_W / BOX_W) * 100}%` }} />
                  <div className="td2-inside" style={{ mask: INSIDE_MASK, WebkitMask: INSIDE_MASK }}>
                    {PARTS.filter(p => p.inner).reverse().map(p => <Part key={p.id} part={p} />)}
                  </div>
                  {PARTS.filter(p => !p.inner).reverse().map(p => <Part key={p.id} part={p} />)}

                  {PARTS.map(p => <Callout key={p.id} c={{ ...p.call, no: p.no, title: p.title, spec: p.spec }} win={[p.win[1] - .1, p.win[1] + .03]} />)}
                  <Callout c={TUB_CALL} win={TUB_CALL.win} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
