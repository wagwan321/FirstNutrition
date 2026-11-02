import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BrandLogo from '../components/BrandLogo.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import { ALL_BRANDS, PRODUCTS } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'

// Partner brands: official logos, the brand story and a link to their products.
function BrandCard({ brand, index }) {
  const { t } = useLocale()
  const [more, setMore] = useState(false)
  const count = PRODUCTS.filter(p => p.brand === brand.name).length
  const long = brand.description.length > 180
  return (
    <Reveal className="brand-card" variant={index % 3 === 0 ? 'left' : index % 3 === 2 ? 'right' : 'up'} delay={(index % 3) * 80}>
      <div className="brand-card-logo"><BrandLogo name={brand.name} /></div>
      <h3>{brand.name}</h3>
      {brand.description && (
        <p className={more ? '' : 'clamp'}>
          {brand.description}
        </p>
      )}
      {long && (
        <button type="button" className="link-btn" onClick={() => setMore(m => !m)}>
          {more ? t('Show less') : t('Read more')}
        </button>
      )}
      <div className="brand-card-foot">
        {count > 0 ? (
          <Link to={`/shop?brand=${encodeURIComponent(brand.name)}`} className="link-arrow">
            {t('Shop {n} products', { n: count })} <ArrowRight size={16} className="flip-rtl" />
          </Link>
        ) : (
          <span className="text-muted small">{t('Available in store')}</span>
        )}
      </div>
    </Reveal>
  )
}

export default function Brands() {
  const { t } = useLocale()
  return (
    <>
      <section className="page-head">
        <div className="container">
          <RevealText as="h1" text={t('Our brands')} delay={100} />
          <p>{t('We partner with the world’s leading nutrition brands to bring you 100% authentic products.')}</p>
        </div>
      </section>
      <section className="section">
        <div className="container grid brand-grid">
          {ALL_BRANDS.map((b, i) => <BrandCard key={b.name} brand={b} index={i} />)}
        </div>
      </section>
    </>
  )
}
