// Reusable black & red protein-tub illustration (self-contained SVG).
// Used for product "photos" in the demo, the hero, and the loading screen.
export default function ProteinTub({
  mark = 'FN',
  label = 'WHEY PROTEIN',
  uid = 'x',
  className = '',
}) {
  const g = `tub-${uid}`
  const bar = "'Barlow Condensed', 'Arial Narrow', sans-serif"
  return (
    <svg className={`tub-svg ${className}`} viewBox="0 0 200 262" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label={`${mark} ${label} tub`}>
      <defs>
        <linearGradient id={`${g}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34363C" />
          <stop offset="0.45" stopColor="#141518" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={`${g}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF454E" />
          <stop offset="1" stopColor="#B70712" />
        </linearGradient>
        <linearGradient id={`${g}-label`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E11722" />
          <stop offset="1" stopColor="#9E0510" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="100" cy="252" rx="60" ry="9" fill="#000" opacity="0.35" />

      {/* lid */}
      <rect x="52" y="12" width="96" height="22" rx="10" fill={`url(#${g}-lid)`} />
      <rect x="60" y="17" width="34" height="6" rx="3" fill="#fff" opacity="0.28" />
      <rect x="45" y="30" width="110" height="20" rx="8" fill="#A00610" />

      {/* body */}
      <rect x="42" y="47" width="116" height="198" rx="20"
            fill={`url(#${g}-body)`} stroke="#000" strokeWidth="1" />
      <rect x="42" y="47" width="116" height="34" rx="20" fill="#fff" opacity="0.05" />

      {/* brand line */}
      <text x="100" y="98" textAnchor="middle" fontFamily={bar} fontWeight="700"
            fontSize="12" letterSpacing="2" fill="#E11722">FIRST NUTRITION</text>

      {/* label */}
      <rect x="42" y="106" width="116" height="104" fill={`url(#${g}-label)`} />
      <rect x="42" y="106" width="116" height="3" fill="#fff" opacity="0.18" />
      <rect x="42" y="207" width="116" height="3" fill="#000" opacity="0.25" />
      <text x="100" y="162" textAnchor="middle" fontFamily={bar} fontWeight="800"
            fontSize="48" fill="#fff">{mark}</text>
      <text x="100" y="192" textAnchor="middle" fontFamily={bar} fontWeight="600"
            fontSize="13" letterSpacing="2" fill="rgba(255,255,255,.9)">{label}</text>

      {/* scoop / weight note */}
      <text x="100" y="232" textAnchor="middle" fontFamily={bar} fontWeight="600"
            fontSize="11" letterSpacing="1" fill="rgba(255,255,255,.35)">NET WT · PREMIUM BLEND</text>

      {/* glossy shine */}
      <rect x="56" y="40" width="12" height="200" rx="6" fill="#fff" opacity="0.07" />
    </svg>
  )
}
