import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { CATEGORIES, money } from '../data/catalog.js'
import ProteinTub from './ProteinTub.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const cat = CATEGORIES.find(c => c.id === product.category)

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb">
        {product.tag && <span className={`badge cat-tag ${product.tag === 'New' ? 'lime' : ''}`}>{product.tag}</span>}
        {product.img
          ? <img className="product-photo" src={product.img} alt={product.name} loading="lazy" />
          : <ProteinTub mark={product.mark} uid={product.id} label={cat?.name?.toUpperCase() || 'SUPPLEMENT'} />}
      </Link>
      <div className="product-info">
        <span className="brand">{product.brand}</span>
        <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
        <div className="stars">{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)} <span className="text-muted" style={{ fontSize: 12 }}>{cat?.name}</span></div>
        <div className="foot">
          <div className="price">
            {product.oldPrice && <s>{money(product.oldPrice)}</s>}
            {money(product.price)}
          </div>
          <button className="add-btn" aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product, 1, product.flavors?.[0] || null)}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}
