import { useId } from 'react'

// First Nutrition's own category marks: solid stencil pictograms on a 48-unit
// grid. Each shape is cut by stencil bridges (the gaps a spray stencil needs),
// the same device as the plate lettering. They take currentColor.
const ICONS = {
  // tub with a scoop resting on the lid
  protein: {
    shapes: <>
      <rect x="11" y="15" width="26" height="6" rx="2" />
      <path d="M10 22h28v15a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" />
      <path d="M18 5h8a3 3 0 0 1 0 6h-2v2h-4v-2a3 3 0 0 1-2-6z" />
      <rect x="27" y="7" width="12" height="2.6" rx="1.3" />
    </>,
    bridges: <><rect x="8" y="29" width="32" height="2.4" /><rect x="22.8" y="20" width="2.4" height="25" /></>,
  },
  // a bigger tub with a plus: mass
  gainers: {
    shapes: <>
      <rect x="9" y="8" width="30" height="6" rx="2" />
      <path d="M7 15h34v20a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8z" />
    </>,
    bridges: <>
      <rect x="21.5" y="20" width="5" height="17" />
      <rect x="15.5" y="26" width="17" height="5" />
      <rect x="5" y="14.2" width="38" height="1.6" />
    </>,
  },
  // three creatine crystals
  creatine: {
    shapes: <>
      <path d="M17 5l8 4.6v9.2L17 23.4 9 18.8V9.6z" />
      <path d="M33 17l8 4.6v9.2l-8 4.6-8-4.6v-9.2z" />
      <path d="M17 26l8 4.6v9.2L17 44.4 9 39.8v-9.2z" />
    </>,
    bridges: <><rect x="8" y="13.4" width="18" height="2" /><rect x="24" y="25.4" width="18" height="2" /><rect x="8" y="34.4" width="18" height="2" /></>,
  },
  // lightning bolt
  preworkout: {
    shapes: <path d="M28 3L10 27h11l-4 18 21-26H26z" />,
    bridges: <rect x="6" y="23.2" width="36" height="2.2" transform="rotate(-8 24 24)" />,
  },
  // capsule with an amino chain
  aminos: {
    shapes: <>
      <rect x="6" y="15" width="26" height="12" rx="6" transform="rotate(-35 19 21)" />
      <circle cx="34" cy="30" r="4.5" />
      <circle cx="40" cy="40" r="3.5" />
      <circle cx="27" cy="40" r="3" />
      <rect x="35" y="33" width="2.4" height="5" transform="rotate(-30 36 35)" />
      <rect x="29" y="35.5" width="2.2" height="5" transform="rotate(55 30 38)" />
    </>,
    bridges: <rect x="17.8" y="9" width="2.4" height="24" transform="rotate(-35 19 21)" />,
  },
  // bathroom scale with its dial
  weight: {
    shapes: <path fillRule="evenodd" d="M12 6h24a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6zm4 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3z" />,
    bridges: <><rect x="22.8" y="13" width="2.4" height="6" /><rect x="4" y="30" width="40" height="2.4" /></>,
  },
  // leaf with its vein
  wellness: {
    shapes: <path d="M40 6C22 6 8 15 8 30c0 5 2 9 5 12 3-11 10-18 20-23-8 6-14 13-17 24 3 1 6 2 9 2 15 0 18-17 15-39z" />,
    bridges: <rect x="4" y="27" width="40" height="2.2" transform="rotate(-38 24 28)" />,
  },
  // protein bar in its wrapper
  snacks: {
    shapes: <>
      <rect x="10" y="17" width="28" height="14" rx="2" transform="rotate(-20 24 24)" />
      <path d="M4 22l6-2 1 3-1 3 1 3-6 2z" transform="rotate(-20 24 24)" />
      <path d="M44 26l-6 2-1-3 1-3-1-3 6-2z" transform="rotate(-20 24 24)" />
    </>,
    bridges: <><rect x="17" y="12" width="2.2" height="24" transform="rotate(-20 24 24)" /><rect x="29" y="12" width="2.2" height="24" transform="rotate(-20 24 24)" /></>,
  },
  // shaker bottle with spout
  accessories: {
    shapes: <>
      <rect x="21" y="3" width="6" height="5" rx="1.5" />
      <path d="M15 9h18l1 6H14z" />
      <path d="M13 16h22l-2 24a4 4 0 0 1-4 3.6H19a4 4 0 0 1-4-3.6z" />
    </>,
    bridges: <><rect x="10" y="24" width="28" height="2.2" /><rect x="10" y="31.5" width="28" height="2.2" /></>,
  },
  // two tubs tied as one deal
  bundles: {
    shapes: <>
      <rect x="5" y="14" width="18" height="4" rx="1.5" />
      <path d="M4 19h20v17a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <rect x="25" y="14" width="18" height="4" rx="1.5" />
      <path d="M24 19h20v17a5 5 0 0 1-5 5H29a5 5 0 0 1-5-5z" />
      <path d="M17 4l7 6 7-6 3 3-7 6H21l-7-6z" />
    </>,
    bridges: <><rect x="2" y="28" width="44" height="3.4" /><rect x="22.9" y="12" width="2.2" height="32" /></>,
  },
}

export default function CategoryIcon({ id, size = 48, className = '' }) {
  const mask = `cat-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const icon = ICONS[id]
  if (!icon) return null
  return (
    <svg className={`cat-icon ${className}`} width={size} height={size} viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
      <mask id={mask}>
        <rect width="48" height="48" fill="#fff" />
        <g fill="#000">{icon.bridges}</g>
      </mask>
      <g mask={`url(#${mask})`}>{icon.shapes}</g>
    </svg>
  )
}
