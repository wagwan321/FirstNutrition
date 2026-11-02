// Realistic black & red protein tub, drawn as a lit cylinder seen slightly from
// above: every horizontal edge is an ellipse arc, the printing follows the curve
// of the label, and a fixed shading layer sits over the print so the edges roll
// off into shadow like glossy plastic.
//
// The tub is split into parts that share one 240×320 coordinate space, so they
// can be stacked exactly and animated apart (see Teardown.jsx):
//   <TubBody open />  body with an open rim and powder inside
//   <TubLid />        screw lid
//   <Scoop />         red scoop with a powder mound (starts inside the tub)
// The default export draws the closed tub (body + lid) as one image.

const CX = 120
const LR = 76, LRY = 14, LID_TOP = 30, LID_BOT = 80          // lid
const BR = 70, BRY = 13, BODY_TOP = 84, BODY_BOT = 268        // body
const LAB_TOP = 116, LAB_BOT = 230                            // label band
const L = CX - LR, R = CX + LR
const bl = CX - BR, br = CX + BR
const FONT = "'Plus Jakarta Sans', 'Arial', sans-serif"

const band = (x0, x1, rx, ry, y0, y1) =>
  `M${x0} ${y0} A${rx} ${ry} 0 0 0 ${x1} ${y0} V${y1} A${rx} ${ry} 0 0 1 ${x0} ${y1} Z`
const arc = (y) => `M${bl} ${y} A${BR} ${BRY} 0 0 0 ${br} ${y}`
const bodyPath = `M${bl} ${BODY_TOP} V${BODY_BOT} A${BR} ${BRY} 0 0 0 ${br} ${BODY_BOT} V${BODY_TOP} A${BR} ${BRY} 0 0 1 ${bl} ${BODY_TOP} Z`
const lidPath = `M${L} ${LID_TOP} V${LID_BOT} A${LR} ${LRY} 0 0 0 ${R} ${LID_BOT} V${LID_TOP} Z`

// Shared lighting: dark edges, specular band left of centre, rim light right.
function Shade({ id }) {
  return (
    <>
      <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
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
      {/* soft vertical light streak (a gradient, not a blur filter, so
          animated parts stay cheap to repaint) */}
      <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity="1" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </>
  )
}

function PowderGradient({ id }) {
  return (
    <radialGradient id={`${id}-powder`} cx=".45" cy=".4" r=".75">
      <stop offset="0" stopColor="#F3E7D3" />
      <stop offset=".55" stopColor="#E2CFAF" />
      <stop offset="1" stopColor="#C9B08A" />
    </radialGradient>
  )
}

export function TubBody({ uid = 'b', mark = 'FN', label = 'WHEY GOLD', subLabel = 'PREMIUM SERIES',
  netWt = 'NET WT 2.27 KG · 5 LB', open = false, sway = false, shadow = true, className = '' }) {
  const id = `tb-${uid}`
  const url = (s) => `url(#${id}-${s})`
  const text = (y, size, props, content) => (
    <text fontFamily={FONT} fontSize={size} textAnchor="middle" {...props}>
      <textPath href={`#${id}-a${y}`} startOffset="50%">{content}</textPath>
    </text>
  )
  return (
    <svg className={`tub-svg ${className}`} viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <Shade id={id} />
        <PowderGradient id={id} />
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2C31" /><stop offset=".45" stopColor="#141518" /><stop offset="1" stopColor="#09090B" />
        </linearGradient>
        <linearGradient id={`${id}-label`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0302D" /><stop offset=".55" stopColor="#CF1F1C" /><stop offset="1" stopColor="#9E1210" />
        </linearGradient>
        <linearGradient id={`${id}-neck`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".75" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-ground`}>
          <stop offset="0" stopColor="#000" stopOpacity=".45" /><stop offset=".6" stopColor="#000" stopOpacity=".16" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-bodyclip`}><path d={bodyPath} /></clipPath>
        <clipPath id={`${id}-labelclip`}><path d={band(bl, br, BR, BRY, LAB_TOP, LAB_BOT)} /></clipPath>
        <clipPath id={`${id}-powderclip`}><ellipse cx={CX} cy={BODY_TOP + 4} rx={BR - 6} ry={BRY - 2.5} /></clipPath>
        {[101, 136, 187, 208, 244].map(y => <path key={y} id={`${id}-a${y}`} d={arc(y)} />)}
      </defs>

      {shadow && <ellipse cx={CX} cy={BODY_BOT + BRY} rx="88" ry="15" fill={url('ground')} />}

      {/* open top: dark inner wall + powder surface */}
      {open && (
        <g>
          <ellipse cx={CX} cy={BODY_TOP} rx={BR} ry={BRY} fill="#0B0B0D" />
          <ellipse cx={CX} cy={BODY_TOP + 4} rx={BR - 6} ry={BRY - 2.5} fill={url('powder')} />
          <g clipPath={url('powderclip')} fill="#B89C74" opacity=".55">
            <circle cx="92" cy="88" r="1.6" /><circle cx="108" cy="84" r="1.2" /><circle cx="131" cy="90" r="1.4" />
            <circle cx="150" cy="86" r="1.1" /><circle cx="118" cy="93" r="1.3" /><circle cx="160" cy="91" r="1" />
            <circle cx="78" cy="92" r="1.1" /><circle cx="140" cy="81" r="1" />
          </g>
          <ellipse cx={CX - 14} cy={BODY_TOP + 1} rx="30" ry="4" fill="#fff" opacity=".35" />
        </g>
      )}

      <path d={bodyPath} fill={url('body')} />
      <g clipPath={url('bodyclip')}>
        <path d={band(bl, br, BR, BRY, LAB_TOP, LAB_BOT)} fill={url('label')} />
        <g className="tub-turn">
          <g className={sway ? 'tub-sway' : undefined}>
            <g clipPath={url('labelclip')}>
              <polygon points="122,110 156,110 116,240 82,240" fill="#000" opacity=".16" />
              <polygon points="162,110 170,110 130,240 122,240" fill="#fff" opacity=".1" />
            </g>
            {text(101, 10.5, { fontWeight: 800, letterSpacing: 2.2, fill: '#F0302D' }, 'FIRST NUTRITION')}
            {text(136, 9, { fontWeight: 700, letterSpacing: 2.6, fill: 'rgba(255,255,255,.85)' }, subLabel)}
            {text(187, 54, { fontWeight: 800, fill: '#fff', letterSpacing: -1 }, mark)}
            {text(208, 12, { fontWeight: 800, letterSpacing: 2.2, fill: '#fff' }, label)}
            {text(244, 8, { fontWeight: 600, letterSpacing: 1.4, fill: 'rgba(255,255,255,.42)' }, netWt)}
          </g>
        </g>
        <path d={band(bl, br, BR, BRY, LAB_TOP, LAB_TOP + 3)} fill="#fff" opacity=".22" />
        <path d={band(bl, br, BR, BRY, LAB_BOT - 3, LAB_BOT)} fill="#000" opacity=".3" />
        {!open && <path d={band(bl, br, BR, BRY, BODY_TOP - 4, BODY_TOP + 20)} fill={url('neck')} />}
        <path d={band(bl, br, BR, BRY, BODY_BOT - 10, BODY_BOT)} fill="#000" opacity=".38" />
        <rect x={bl} y={BODY_TOP - 16} width={BR * 2} height={BODY_BOT - BODY_TOP + 40} fill={url('shade')} />
        <rect x="60" y="80" width="38" height="200" fill={url('streak')} opacity=".12" />
        <rect x="75" y="80" width="14" height="200" fill={url('streak')} opacity=".38" />
        <rect x="177" y="80" width="8" height="200" fill={url('streak')} opacity=".15" />
      </g>
      {/* rim lip catches the light when the lid is off */}
      {open && <path d={`M${bl} ${BODY_TOP} A${BR} ${BRY} 0 0 0 ${br} ${BODY_TOP}`} fill="none" stroke="#5A5D64" strokeWidth="2.2" />}
      <path d={`M${bl + 3} ${BODY_BOT - 1} A${BR} ${BRY} 0 0 0 ${br - 3} ${BODY_BOT - 1}`} fill="none"
            stroke="#fff" strokeOpacity=".12" strokeWidth="1" />
    </svg>
  )
}

export function TubLid({ uid = 'l', sway = false, className = '' }) {
  const id = `tl-${uid}`
  const url = (s) => `url(#${id}-${s})`
  return (
    <svg className={`tub-svg ${className}`} viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <Shade id={id} />
        <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8302C" /><stop offset="1" stopColor="#A6130F" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#FF6A66" /><stop offset=".45" stopColor="#E0251F" /><stop offset="1" stopColor="#A00D0A" />
        </radialGradient>
        <radialGradient id={`${id}-sheen`}>
          <stop offset="0" stopColor="#fff" stopOpacity=".32" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-ridges`} width="4.4" height="10" patternUnits="userSpaceOnUse">
          <rect width="1.7" height="10" fill="#000" opacity=".34" />
          <rect x="1.7" width=".8" height="10" fill="#fff" opacity=".1" />
        </pattern>
        <clipPath id={`${id}-clip`}><path d={lidPath} /></clipPath>
      </defs>
      <path d={lidPath} fill={url('lid')} />
      <g clipPath={url('clip')}>
        <g className="tub-turn">
          <g className={sway ? 'tub-sway' : undefined}>
            <rect x={L - 24} y={LID_TOP + 10} width={LR * 2 + 48} height={LID_BOT - LID_TOP + 6} fill={url('ridges')} />
          </g>
        </g>
        <path d={band(L, R, LR, LRY, LID_BOT - 8, LID_BOT)} fill="#000" opacity=".32" />
        <rect x={L} y={LID_TOP} width={LR * 2} height={LID_BOT - LID_TOP + LRY} fill={url('shade')} />
        <rect x="70" y={LID_TOP} width="14" height={LID_BOT - LID_TOP + LRY} fill={url('streak')} opacity=".34" />
      </g>
      <ellipse cx={CX} cy={LID_TOP} rx={LR} ry={LRY} fill={url('top')} />
      <ellipse cx={CX} cy={LID_TOP + 1} rx="61" ry="10.6" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="1" />
      <ellipse cx={CX} cy={LID_TOP} rx="61" ry="10.6" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.4" />
      <ellipse cx="98" cy={LID_TOP - 4} rx="34" ry="6" fill={url('sheen')} />
      <path d={`M${L} ${LID_TOP} A${LR} ${LRY} 0 0 0 ${R} ${LID_TOP}`} fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="1.2" />
    </svg>
  )
}

// Red plastic scoop heaped with powder. Drawn around y 120–205 so it starts
// hidden inside the tub body.
export function Scoop({ uid = 's', className = '' }) {
  const id = `sc-${uid}`
  const url = (s) => `url(#${id}-${s})`
  return (
    <svg className={`tub-svg ${className}`} viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <PowderGradient id={id} />
        <linearGradient id={`${id}-cup`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9E1210" /><stop offset=".3" stopColor="#F2403C" />
          <stop offset=".45" stopColor="#FF7A75" /><stop offset=".7" stopColor="#D42420" /><stop offset="1" stopColor="#8E0F0D" />
        </linearGradient>
        <linearGradient id={`${id}-handle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF5A55" /><stop offset="1" stopColor="#B01814" />
        </linearGradient>
      </defs>
      {/* handle — angled up so it rests hidden inside the closed tub */}
      <rect x="144" y="150" width="62" height="13" rx="6.5" fill={url('handle')} transform="rotate(-58 144 156)" />
      <rect x="150" y="152" width="50" height="3" rx="1.5" fill="#fff" opacity=".3" transform="rotate(-58 144 156)" />
      {/* cup */}
      <path d="M90 150 L97 198 A23 6.5 0 0 0 143 198 L150 150 Z" fill={url('cup')} />
      <ellipse cx="120" cy="198" rx="23" ry="6.5" fill="#7A0C0A" opacity=".5" />
      {/* heaped powder + rim */}
      <path d="M90 150 C92 136 104 124 120 123 C136 124 148 136 150 150 Z" fill={url('powder')} />
      <circle cx="108" cy="137" r="1.4" fill="#B89C74" /><circle cx="128" cy="131" r="1.2" fill="#B89C74" />
      <circle cx="138" cy="142" r="1.1" fill="#B89C74" /><circle cx="116" cy="145" r="1.2" fill="#B89C74" />
      <path d="M90 150 A30 7.5 0 0 0 150 150" fill="none" stroke="#FF8A85" strokeWidth="2" />
      <path d="M90 150 A30 7.5 0 0 1 150 150" fill="none" stroke="#9E1210" strokeWidth="1.5" opacity=".6" />
    </svg>
  )
}

// Closed tub as a single image.
export default function ProteinTub({ uid = 'x', className = '', ...props }) {
  return (
    <div className={`tub-stack ${className}`} role="img" aria-label="First Nutrition protein tub">
      <TubBody uid={uid} {...props} />
      <TubLid uid={uid} sway={props.sway} />
    </div>
  )
}
