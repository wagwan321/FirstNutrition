import { Link, useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { t, price } = useLocale()
  const navigate = useNavigate()
  const url = `/product/${product.id}`
  // Products with several sizes/flavors go to the product page to choose.
  const hasChoice = product.variants.length > 1
  const ranged = product.maxPrice > product.price

  const onAdd = () => {
    if (hasChoice) navigate(url)
    else addItem(product, product.variants[0])
  }

  return (
    <article className="pcard">
      <Link to={url} className="pcard-media" aria-label={product.name}>
        <div className="pcard-badges">
          {product.category === 'bundles' && <span className="badge">{t('Offer')}</span>}
          {product.bestseller && <span className="badge">{t('Best seller')}</span>}
          {product.isNew && <span className="badge badge-dark">{t('New')}</span>}
        </div>
        <img src={product.img} alt="" loading="lazy" />
      </Link>
      <div className="pcard-body">
        <span className="pcard-brand">{product.brand}</span>
        <h3 className="pcard-name"><Link to={url}>{product.name}</Link></h3>
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
