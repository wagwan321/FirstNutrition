import { brandByName } from '../data/catalog.js'

// Official partner logo; the First Nutrition logo for house products.
export default function BrandLogo({ name, className = '' }) {
  const brand = brandByName(name)
  const src = brand?.logo || (name === 'First Nutrition' ? '/images/fn/site/logo.svg' : null)
  if (!src) return <span className={`blogo-text ${className}`}>{name}</span>
  return <img className={`blogo ${className}`} src={src} alt={name} loading="lazy" />
}
