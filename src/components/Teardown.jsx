import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { useInView } from './Reveal.jsx'
import { useLocale } from '../i18n.jsx'

// Exploded "teardown" of a protein tub, in the clean isometric style of a
// product-anatomy diagram: the closed tub sits assembled, then each part lifts
// off in turn and a leader line draws out to a numbered spec callout.
//
// Everything shares one SVG coordinate space. Each layer is drawn at its
// exploded position; --asm is how far it moves down to sit inside / on the
// tub, so the closed state is just every layer translated by its --asm.

const CX = 230   // diagram centre line
const K = 0.42   // ellipse squash: how far we look down onto the tub

// Front-facing band of a cylinder between y and y+h (top & bottom are ellipses).
const side = (rx, y, h) =>
  `M${CX - rx} ${y} V${y + h} A${rx} ${rx * K} 0 0 0 ${CX + rx} ${y + h} V${y} A${rx} ${rx * K} 0 0 1 ${CX - rx} ${y} Z`
const frontArc = (rx, y) => `M${CX - rx} ${y} A${rx} ${rx * K} 0 0 0 ${CX + rx} ${y}`

const TUB = { rx: 124, top: 560, h: 200 }

// y = layer centre (where its callout lines up), asm = drop into the closed tub
const LAYERS = [
  { id: 'lid',    no: '01', y: 115, asm: 414, title: 'Screw cap',      spec: 'tamper-evident · twist-lock' },
  { id: 'seal',   no: '02', y: 248, asm: 315, title: 'Freshness seal', spec: 'peel-off foil · factory sealed' },
  { id: 'scoop',  no: '03', y: 352, asm: 262, title: 'Scoop',          spec: '1 level scoop ≈ 30 g' },
  { id: 'powder', no: '04', y: 441, asm: 145, title: 'Whey blend',     spec: '≈ 24 g protein · 5.5 g BCAA' },
  { id: 'tub',    no: '05', y: 650, asm: 0,   title: 'Tub',            spec: '5 lb · ≈ 74 servings' },
]
// right-hand edge of each part, where its leader line starts
const EDGE = { lid: 128, seal: 122, scoop: 52, powder: 116, tub: 124 }

function useCompact() {
  const query = '(max-width: 640px)'
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setCompact(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return compact
}

export default function Teardown() {
  const { t } = useLocale()
  const [ref, inView] = useInView()
  const [run, setRun] = useState(0)       // bump to replay
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const compact = useCompact()

  // Explode shortly after the diagram scrolls into view. "Replay" first lets
  // the parts settle back into the tub (reverse animation), then explodes again.
  useEffect(() => {
    if (!inView) return
    setOpen(false)
    const id = setTimeout(() => setOpen(true), run ? 1500 : 300)
    return () => clearTimeout(id)
  }, [inView, run])

  const layerProps = (id, i) => ({
    className: `tdl tdl-${id}${active && active !== id ? ' dim' : ''}`,
    style: { '--asm': `${LAYERS[i].asm}px`, '--li': i },
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
  })

  return (
    <section className="section teardown" aria-labelledby="td-title">
      <div className="container td-grid">
        <div className="td-copy">
          <span className="eyebrow">{t('Inside the tub')}</span>
          <h2 id="td-title" className="section-title">{t('Anatomy of a protein tub.')}</h2>
          <p className="td-lead">
            {t('Every tub we sell arrives sealed from the official brand. Here is exactly what you get when you open one.')}
          </p>
          <div className="td-actions">
            <Link to="/shop/protein" className="btn btn-primary">{t('Shop protein')} <ArrowRight size={17} className="flip-rtl" /></Link>
            <button type="button" className="btn btn-ghost" onClick={() => setRun(r => r + 1)}>
              <RotateCcw size={16} /> {t('Replay')}
            </button>
          </div>
          <small className="td-note">{t('Typical values for premium whey. Always check each product’s label.')}</small>
        </div>

        <div className="td-panel" ref={ref}>
          <svg className={`td-svg${open ? ' is-open' : ''}`} role="img"
            aria-label={t('Exploded view of a protein tub: screw cap, freshness seal, scoop, whey blend and tub')}
            viewBox={compact ? '84 30 340 800' : '60 30 670 800'} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="td-body" x1="0" x2="1">
                <stop offset="0" stopColor="#09090B" /><stop offset=".22" stopColor="#34353C" />
                <stop offset=".5" stopColor="#1A1A1F" /><stop offset="1" stopColor="#060607" />
              </linearGradient>
              <linearGradient id="td-label" x1="0" x2="1">
                <stop offset="0" stopColor="#A9170F" /><stop offset=".25" stopColor="#F2423D" />
                <stop offset=".6" stopColor="#D8291F" /><stop offset="1" stopColor="#86100C" />
              </linearGradient>
              <linearGradient id="td-red" x1="0" x2="1">
                <stop offset="0" stopColor="#A9170F" /><stop offset=".28" stopColor="#F04A45" />
                <stop offset=".62" stopColor="#D42620" /><stop offset="1" stopColor="#8A110D" />
              </linearGradient>
              <radialGradient id="td-redtop" cx=".4" cy=".35" r=".8">
                <stop offset="0" stopColor="#FF7A75" /><stop offset=".55" stopColor="#E3302B" /><stop offset="1" stopColor="#B71C17" />
              </radialGradient>
              <linearGradient id="td-foil" x1="0" x2="1">
                <stop offset="0" stopColor="#8E929B" /><stop offset=".3" stopColor="#F2F3F6" />
                <stop offset=".65" stopColor="#B8BBC3" /><stop offset="1" stopColor="#7D818A" />
              </linearGradient>
              <radialGradient id="td-foiltop" cx=".38" cy=".3" r=".85">
                <stop offset="0" stopColor="#FFFFFF" /><stop offset=".5" stopColor="#DADCE1" /><stop offset="1" stopColor="#A9ACB4" />
              </radialGradient>
              <linearGradient id="td-powderside" x1="0" x2="1">
                <stop offset="0" stopColor="#B99C70" /><stop offset=".3" stopColor="#EADBC0" />
                <stop offset=".65" stopColor="#D6BF98" /><stop offset="1" stopColor="#A88B60" />
              </linearGradient>
              <radialGradient id="td-powdertop" cx=".42" cy=".38" r=".8">
                <stop offset="0" stopColor="#FBF4E7" /><stop offset=".6" stopColor="#EEDFC4" /><stop offset="1" stopColor="#DCC6A1" />
              </radialGradient>
              <radialGradient id="td-shadow">
                <stop offset="0" stopColor="#121216" stopOpacity=".22" /><stop offset="1" stopColor="#121216" stopOpacity="0" />
              </radialGradient>
              <pattern id="td-ridges" width="7" height="10" patternUnits="userSpaceOnUse">
                <rect width="2.4" height="10" fill="#000" opacity=".2" />
              </pattern>
              <clipPath id="td-lidclip"><path d={side(128, 90, 50)} /></clipPath>
              {/* everything above the tub's front rim, plus the opening: the
                  contents vanish behind the tub wall when they sink inside */}
              <clipPath id="td-inside">
                <path d={`M-200 -400 H900 V${TUB.top} H${CX + TUB.rx} A${TUB.rx} ${TUB.rx * K} 0 0 1 ${CX - TUB.rx} ${TUB.top} H-200 Z`} />
              </clipPath>
              <path id="td-arc1" d={frontArc(TUB.rx, TUB.top + 66)} />
              <path id="td-arc2" d={frontArc(TUB.rx, TUB.top + 112)} />
              <path id="td-arc3" d={frontArc(TUB.rx, TUB.top + 138)} />
            </defs>

            {/* ground shadow under the tub */}
            <ellipse cx={CX} cy={TUB.top + TUB.h + 62} rx="170" ry="40" fill="url(#td-shadow)" />

            {/* 05 — tub (drawn first: everything else sits on / in it) */}
            <g {...layerProps('tub', 4)}>
              <path d={side(TUB.rx, TUB.top, TUB.h)} fill="url(#td-body)" />
              <path d={side(TUB.rx, TUB.top + 40, 110)} fill="url(#td-label)" />
              <path d={frontArc(TUB.rx, TUB.top + 40)} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
              <text className="td-print sm"><textPath href="#td-arc1" startOffset="50%">FIRST NUTRITION</textPath></text>
              <text className="td-print lg"><textPath href="#td-arc2" startOffset="50%">WHEY GOLD</textPath></text>
              <text className="td-print xs"><textPath href="#td-arc3" startOffset="50%">5 LB · 2.27 KG</textPath></text>
              {/* open top: rim + dark interior */}
              <ellipse cx={CX} cy={TUB.top} rx={TUB.rx} ry={TUB.rx * K} fill="#3A3B42" />
              <ellipse cx={CX} cy={TUB.top + 2} rx={TUB.rx - 9} ry={(TUB.rx - 9) * K} fill="#0D0D10" />
              <path d={frontArc(TUB.rx, TUB.top)} fill="none" stroke="#5B5D66" strokeWidth="2" />
            </g>

            {/* contents: clipped by the (untransformed) wrapper so they hide inside the tub */}
            <g clipPath="url(#td-inside)">
            {/* 04 — whey powder */}
            <g {...layerProps('powder', 3)}>
              <path d={side(116, 430, 22)} fill="url(#td-powderside)" />
              <ellipse cx={CX} cy="430" rx="116" ry={116 * K} fill="url(#td-powdertop)" />
              <path d="M150 432 C178 404 206 392 234 393 C266 394 292 410 312 433 C282 444 182 446 150 432 Z" fill="#F7EEDD" opacity=".9" />
              <g fill="#C7AD82" opacity=".7">
                <circle cx="190" cy="428" r="1.8" /><circle cx="248" cy="418" r="1.5" /><circle cx="280" cy="438" r="1.6" />
                <circle cx="214" cy="446" r="1.4" /><circle cx="300" cy="452" r="1.3" /><circle cx="160" cy="447" r="1.3" />
              </g>
            </g>

            {/* 03 — scoop */}
            <g {...layerProps('scoop', 2)}>
              <line x1={CX - 18} y1="342" x2={CX - 104} y2="300" stroke="url(#td-red)" strokeWidth="13" strokeLinecap="round" />
              <line x1={CX - 30} y1="336" x2={CX - 98} y2="303" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeLinecap="round" />
              <path d={`M${CX - 34} 336 V376 A34 ${34 * K} 0 0 0 ${CX + 34} 376 V336 A34 ${34 * K} 0 0 1 ${CX - 34} 336 Z`} fill="url(#td-red)" />
              <ellipse cx={CX} cy="336" rx="34" ry={34 * K} fill="#B71C17" />
              <path d={`M${CX - 32} 337 C${CX - 26} 316 ${CX - 12} 306 ${CX} 306 C${CX + 13} 306 ${CX + 27} 316 ${CX + 32} 337 C${CX + 18} 346 ${CX - 18} 346 ${CX - 32} 337 Z`} fill="url(#td-powdertop)" />
              <path d={frontArc(34, 336)} fill="none" stroke="#FF8A85" strokeWidth="2" />
            </g>

            {/* 02 — foil freshness seal with pull tab */}
            <g {...layerProps('seal', 1)}>
              {/* pull tab — short enough to stay hidden under the cap when closed */}
              <path d={`M${CX + 112} 236 l12 -2 a5 5 0 0 1 5 5 l0 2 a5 5 0 0 1 -4 5 l-13 2 Z`} fill="#D9DBE0" />
              <path d={side(122, 240, 6)} fill="url(#td-foil)" />
              <ellipse cx={CX} cy="240" rx="122" ry={122 * K} fill="url(#td-foiltop)" />
              <ellipse cx={CX} cy="240" rx="96" ry={96 * K} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" />
              <ellipse cx={CX} cy="240" rx="40" ry={40 * K} fill="#E02D2A" />
              <text x={CX} y="245" className="td-print seal">FN</text>
            </g>
            </g>

            {/* 01 — screw cap */}
            <g {...layerProps('lid', 0)}>
              <path d={side(128, 90, 50)} fill="url(#td-red)" />
              <g clipPath="url(#td-lidclip)"><rect x={CX - 140} y="96" width="280" height="96" fill="url(#td-ridges)" /></g>
              <path d={frontArc(128, 140)} fill="none" stroke="#7E0F0B" strokeWidth="2" opacity=".6" />
              <ellipse cx={CX} cy="90" rx="128" ry={128 * K} fill="url(#td-redtop)" />
              <ellipse cx={CX} cy="91" rx="104" ry={104 * K} fill="none" stroke="#000" strokeOpacity=".14" strokeWidth="2" />
              <path d={frontArc(128, 90)} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" />
            </g>

            {/* leader lines + callouts (numbers only on small screens) */}
            {LAYERS.map((l, i) => {
              const x1 = CX + EDGE[l.id] + 10
              const x2 = compact ? x1 + 22 : 444
              return (
                <g key={l.id} className={`td-call${active && active !== l.id ? ' dim' : ''}`} style={{ '--li': i }}
                   onMouseEnter={() => setActive(l.id)} onMouseLeave={() => setActive(null)}>
                  <circle cx={x1} cy={l.y} r="3.5" className="td-dot" />
                  <line x1={x1} y1={l.y} x2={x2} y2={l.y} className="td-line" pathLength="1" />
                  {compact ? (
                    <>
                      <circle cx={x2 + 13} cy={l.y} r="13" className="td-badge" />
                      <text x={x2 + 13} y={l.y + 4.5} className="td-badge-no">{Number(l.no)}</text>
                    </>
                  ) : (
                    <>
                      <text x="458" y={l.y - 3} className="td-no">{l.no}</text>
                      <text x="490" y={l.y - 3} className="td-title">{t(l.title)}</text>
                      <text x="490" y={l.y + 18} className="td-spec">{t(l.spec)}</text>
                    </>
                  )}
                </g>
              )
            })}
          </svg>

          {compact && (
            <ol className={`td-list${open ? ' is-open' : ''}`}>
              {LAYERS.map((l, i) => (
                <li key={l.id} style={{ '--li': i }}>
                  <span>{Number(l.no)}</span>
                  <b>{t(l.title)}</b>
                  <small>{t(l.spec)}</small>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
