// Realistic black & red protein tub, drawn as a lit cylinder seen slightly from
// above: every horizontal edge is an ellipse arc, the printing follows the
// curve of the label, and a fixed light/shading layer sits over the print so
// the edges roll off into shadow like real glossy plastic.
//
// The printed layer (label art + lid ridges) can slide sideways while the
// shading stays put, which reads as the tub turning on its axis:
//   - `sway`  adds a slow idle turn (CSS animation)
//   - `--turn` (a CSS variable from -1 to 1 set on any ancestor) turns it
//     interactively, e.g. following the pointer in the hero.

const CX = 120
// lid
const LR = 76, LRY = 14, LID_TOP = 30, LID_BOT = 80
// body
const BR = 70, BRY = 13, BODY_TOP = 78, BODY_BOT = 268
// label band
const LAB_TOP = 116, LAB_BOT = 230

const L = CX - LR, R = CX + LR // lid x-extent
const bl = CX - BR, br = CX + BR // body x-extent

// Band between two heights on a cylinder of radius rx (front faces only).
const band = (x0, x1, rx, ry, y0, y1) =>
  `M${x0} ${y0} A${rx} ${ry} 0 0 0 ${x1} ${y0} V${y1} A${rx} ${ry} 0 0 1 ${x0} ${y1} Z`
// Front-facing arc at height y — used as a baseline for curved text.
const arc = (y) => `M${bl} ${y} A${BR} ${BRY} 0 0 0 ${br} ${y}`

const FONT = "'Archivo', 'Arial Narrow', sans-serif"

export default function ProteinTub({
  mark = 'FN',
  label = 'WHEY PROTEIN',
  subLabel = 'PREMIUM SERIES',
  netWt = 'NET WT 2.27 KG · 5 LB',
  uid = 'x',
  className = '',
  shadow = true,
  sway = false,
}) {
  const g = `tub-${uid}`
  const id = (s) => `${g}-${s}`
  const url = (s) => `url(#${g}-${s})`

  const bodyPath = `M${bl} ${BODY_TOP} V${BODY_BOT} A${BR} ${BRY} 0 0 0 ${br} ${BODY_BOT} V${BODY_TOP} Z`
  const lidPath = `M${L} ${LID_TOP} V${LID_BOT} A${LR} ${LRY} 0 0 0 ${R} ${LID_BOT} V${LID_TOP} Z`
  const text = (y, size, props, content) => (
    <text fontFamily={FONT} fontSize={size} textAnchor="middle" style={{ fontStretch: '75%' }} {...props}>
      <textPath href={`#${id(y)}`} startOffset="50%">{content}</textPath>
    </text>
  )
  const TEXT_ARCS = [101, 136, 187, 208, 244]

  return (
    <svg className={`tub-svg ${className}`} viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label={`${mark} ${label} protein tub`}>
      <defs>
        {/* cylinder shading — dark edges, specular band left of centre, rim light right */}
        <linearGradient id={id('shade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".78" />
          <stop offset=".07" stopColor="#000" stopOpacity=".42" />
          <stop offset=".19" stopColor="#fff" stopOpacity="0" />
          <stop offset=".27" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".34" stopColor="#fff" stopOpacity=".04" />
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset=".8" stopColor="#000" stopOpacity=".3" />
          <stop offset=".93" stopColor="#000" stopOpacity=".62" />
          <stop offset=".965" stopColor="#fff" stopOpacity=".07" />
          <stop offset="1" stopColor="#000" stopOpacity=".72" />
        </linearGradient>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2C31" />
          <stop offset=".45" stopColor="#141518" />
          <stop offset="1" stopColor="#09090B" />
        </linearGradient>
        <linearGradient id={id('label')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0212D" />
          <stop offset=".55" stopColor="#C8101B" />
          <stop offset="1" stopColor="#980912" />
        </linearGradient>
        <linearGradient id={id('lid')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E5222D" />
          <stop offset="1" stopColor="#A50A14" />
        </linearGradient>
        <radialGradient id={id('lidtop')} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#FF6A72" />
          <stop offset=".45" stopColor="#E01822" />
          <stop offset="1" stopColor="#A00811" />
        </radialGradient>
        <linearGradient id={id('neck')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".75" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('ground')}>
          <stop offset="0" stopColor="#000" stopOpacity=".7" />
          <stop offset=".6" stopColor="#000" stopOpacity=".25" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern id={id('ridges')} width="4.4" height="10" patternUnits="userSpaceOnUse">
          <rect width="1.7" height="10" fill="#000" opacity=".34" />
          <rect x="1.7" width=".8" height="10" fill="#fff" opacity=".1" />
        </pattern>
        {/* soft vertical light streak (gradient instead of a blur filter, so
            the animated tub stays cheap to repaint) */}
        <linearGradient id={id('streak')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('sheen')}>
          <stop offset="0" stopColor="#fff" stopOpacity=".32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('bodyclip')}><path d={bodyPath} /></clipPath>
        <clipPath id={id('labelclip')}><path d={band(bl, br, BR, BRY, LAB_TOP, LAB_BOT)} /></clipPath>
        <clipPath id={id('lidclip')}><path d={lidPath} /></clipPath>
        {TEXT_ARCS.map(y => <path key={y} id={id(y)} d={arc(y)} />)}
      </defs>

      {shadow && <ellipse cx={CX} cy={BODY_BOT + BRY} rx="88" ry="15" fill={url('ground')} />}

      {/* ---------- BODY ---------- */}
      <path d={bodyPath} fill={url('body')} />
      <g clipPath={url('bodyclip')}>
        {/* red label band */}
        <path d={band(bl, br, BR, BRY, LAB_TOP, LAB_BOT)} fill={url('label')} />

        {/* printed artwork — slides sideways to fake the tub turning */}
        <g className="tub-turn">
          <g className={sway ? 'tub-sway' : undefined}>
            <g clipPath={url('labelclip')}>
              <polygon points="122,110 156,110 116,240 82,240" fill="#000" opacity=".16" />
              <polygon points="162,110 170,110 130,240 122,240" fill="#fff" opacity=".1" />
            </g>
            {text(101, 11, { fontWeight: 800, letterSpacing: 2.6, fill: '#E5222D' }, 'FIRST NUTRITION')}
            {text(136, 9.5, { fontWeight: 700, letterSpacing: 3, fill: 'rgba(255,255,255,.82)' }, subLabel)}
            {text(187, 58, { fontWeight: 900, fill: '#fff' }, mark)}
            {text(208, 12.5, { fontWeight: 800, letterSpacing: 2.4, fill: '#fff' }, label)}
            {text(244, 8.5, { fontWeight: 600, letterSpacing: 1.6, fill: 'rgba(255,255,255,.4)' }, netWt)}
          </g>
        </g>

        {/* thin label trims */}
        <path d={band(bl, br, BR, BRY, LAB_TOP, LAB_TOP + 3)} fill="#fff" opacity=".22" />
        <path d={band(bl, br, BR, BRY, LAB_BOT - 3, LAB_BOT)} fill="#000" opacity=".3" />

        {/* shadow cast by the lid onto the neck */}
        <path d={band(bl, br, BR, BRY, BODY_TOP + 2, BODY_TOP + 26)} fill={url('neck')} />
        {/* moulded base ring */}
        <path d={band(bl, br, BR, BRY, BODY_BOT - 10, BODY_BOT)} fill="#000" opacity=".38" />

        {/* fixed lighting: cylinder shading + glossy highlights */}
        <rect x={bl} y={BODY_TOP - 8} width={BR * 2} height={BODY_BOT - BODY_TOP + 30} fill={url('shade')} />
        <rect x="60" y="84" width="38" height="200" fill={url('streak')} opacity=".12" />
        <rect x="75" y="84" width="14" height="200" fill={url('streak')} opacity=".38" />
        <rect x="177" y="84" width="8" height="200" fill={url('streak')} opacity=".15" />
      </g>
      {/* floor bounce light on the bottom edge */}
      <path d={`M${bl + 3} ${BODY_BOT - 1} A${BR} ${BRY} 0 0 0 ${br - 3} ${BODY_BOT - 1}`} fill="none"
            stroke="#fff" strokeOpacity=".12" strokeWidth="1" />

      {/* ---------- LID ---------- */}
      <path d={lidPath} fill={url('lid')} />
      <g clipPath={url('lidclip')}>
        <g className="tub-turn">
          <g className={sway ? 'tub-sway' : undefined}>
            <rect x={L - 24} y={LID_TOP + 10} width={LR * 2 + 48} height={LID_BOT - LID_TOP + 6} fill={url('ridges')} />
          </g>
        </g>
        <path d={band(L, R, LR, LRY, LID_BOT - 8, LID_BOT)} fill="#000" opacity=".32" />
        <rect x={L} y={LID_TOP} width={LR * 2} height={LID_BOT - LID_TOP + LRY} fill={url('shade')} />
        <rect x="70" y={LID_TOP} width="14" height={LID_BOT - LID_TOP + LRY} fill={url('streak')} opacity=".34" />
      </g>
      {/* lid top face */}
      <ellipse cx={CX} cy={LID_TOP} rx={LR} ry={LRY} fill={url('lidtop')} />
      <ellipse cx={CX} cy={LID_TOP + 1} rx="61" ry="10.6" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="1" />
      <ellipse cx={CX} cy={LID_TOP} rx="61" ry="10.6" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.4" />
      <ellipse cx="98" cy={LID_TOP - 4} rx="34" ry="6" fill={url('sheen')} />
      {/* crisp highlight where the top face meets the side */}
      <path d={`M${L} ${LID_TOP} A${LR} ${LRY} 0 0 0 ${R} ${LID_TOP}`} fill="none"
            stroke="#fff" strokeOpacity=".42" strokeWidth="1.2" />
    </svg>
  )
}
