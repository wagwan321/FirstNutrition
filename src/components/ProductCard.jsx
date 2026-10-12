import { Link } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { CATEGORIES, money } from '../data/catalog.js'
import ProteinTub from './ProteinTub.jsx'

export function Stars({ rating = 5, size = 13 }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} className={i < rating ? 'on' : ''} aria-hidden="true" />
      ))}
    </span>
  )
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const cat = CATEGORIES.find(c => c.id === product.category)
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb" aria-label={product.name}>
        <div className="pc-badges">
          {product.tag && <span className={`badge${product.tag === 'New' ? ' gold' : ''}`}>{product.tag}</span>}
          {off > 0 && <span className="badge dark">−{off}%</span>}
        </div>
        {product.img
          ? <img className="product-photo" src={product.img} alt="" loading="lazy" />
          : <ProteinTub mark={product.mark} uid={product.id} label={cat?.name?.toUpperCase() || 'SUPPLEMENT'} />}
        <span className="pc-view">View product</span>
      </Link>
      <div className="product-info">
        <span className="brand">{product.brand}</span>
        <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="pc-meta">
          <Stars rating={product.rating} />
          <span>{cat?.name}</span>
        </div>
        <div className="foot">
          <div className="price">
            {money(product.price)}
            {product.oldPrice && <s>{money(product.oldPrice)}</s>}
          </div>
          <button className="add-btn" aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product, 1, product.flavors?.[0] || null)}>
            <Plus size={20} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </article>
  )
}
