import { Link, useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { Plus, ArrowRight, Scale } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useCompare } from '../context/CompareContext.jsx'
import { useLocale } from '../i18n.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const compare = useCompare()
  const { t, price } = useLocale()
  const navigate = useNavigate()
  const url = `/product/${product.id}`
  // Products with several sizes/flavors go to the product page to choose.
  const hasChoice = product.variants.length > 1
  const ranged = product.maxPrice > product.price
  const comparing = compare.has(product.id)

  const onAdd = () => {
    if (hasChoice) navigate(url)
    else addItem(product, product.variants[0])
  }

  // Where the browser supports view transitions, the card's photo flies into
  // place as the product page's photo.
  const open = (e) => {
    if (!document.startViewTransition || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.preventDefault()
    const img = e.currentTarget.closest('.pcard')?.querySelector('.pcard-media img')
    document.querySelectorAll('.pd-photo').forEach(el => { el.style.viewTransitionName = '' })
    if (img) img.style.viewTransitionName = 'pd-hero'
    const vt = document.startViewTransition(() => {
      flushSync(() => navigate(url, { state: { vt: true } }))
      window.scrollTo(0, 0)
    })
    vt.finished.finally(() => { if (img) img.style.viewTransitionName = '' })
  }

  return (
    <article className="pcard">
      <Link to={url} className="pcard-media" aria-label={product.name} onClick={open}>
        <div className="pcard-badges">
          {product.category === 'bundles' && <span className="badge">{t('Offer')}</span>}
          {product.bestseller && <span className="badge">{t('Best seller')}</span>}
          {product.isNew && <span className="badge badge-dark">{t('New')}</span>}
        </div>
        <img src={product.img} alt="" loading="lazy" />
      </Link>
      <button type="button" className={`pcard-cmp${comparing ? ' on' : ''}`} aria-pressed={comparing}
        onClick={() => compare.toggle(product.id)} aria-label={t('Compare {name}', { name: product.name })}
        title={comparing ? t('Remove from compare') : t('Add to compare')}>
        <Scale size={16} />
      </button>
      <div className="pcard-body">
        <span className="pcard-brand">{product.brand}</span>
        <h3 className="pcard-name"><Link to={url} onClick={open}>{product.name}</Link></h3>
        <span className="pcard-type">{t(product.type)}</span>
        <div className="pcard-foot">
          <div className="pcard-price">
            {ranged && <small>{t('From')}</small>}
            <b>{price(product.price)}</b>
          </div>
          <button type="button" className="pcard-add" onClick={onAdd}
            aria-label={hasChoice ? t('Choose options for {name}', { name: product.name }) : t('Add {name} to cart', { name: product.name })}>
            {hasChoice ? <ArrowRight size={18} className="flip-rtl" /> : <Plus size={19} />}
            <span>{hasChoice ? t('Options') : t('Add')}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
