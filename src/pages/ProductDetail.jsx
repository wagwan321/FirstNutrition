import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import ProteinTub from '../components/ProteinTub.jsx'
import { useCart } from '../context/CartContext.jsx'
import { PRODUCTS, CATEGORIES, money } from '../data/catalog.js'

export default function ProductDetail() {
  const { id } = useParams()
  const product = PRODUCTS.find(p => p.id === Number(id))
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [flavor, setFlavor] = useState(product?.flavors?.[0] || null)

  if (!product) {
    return (
      <div className="container section center">
        <h1>Product not found</h1>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Shop</Link>
      </div>
    )
  }

  const cat = CATEGORIES.find(c => c.id === product.category)
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="text-muted" style={{ marginBottom: 22, fontSize: 14 }}>
            <Link to="/shop">Shop</Link> / <Link to={`/shop/${product.category}`}>{cat?.name}</Link> / {product.name}
          </div>

          <div className="pd-layout">
            <div className="pd-visual">
              {product.tag && <span className={`badge cat-tag ${product.tag === 'New' ? 'lime' : ''}`} style={{ position: 'absolute', top: 18, left: 18, zIndex: 2 }}>{product.tag}</span>}
              {product.img
                ? <img className="pd-photo" src={product.img} alt={product.name} />
                : <ProteinTub mark={product.mark} uid={`pd-${product.id}`} label={cat?.name?.toUpperCase() || 'SUPPLEMENT'} className="tub-float" />}
            </div>

            <div className="pd-info">
              <span className="brand text-muted" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, fontSize: 13 }}>{product.brand}</span>
              <h1>{product.name}</h1>
              <div className="stars" style={{ color: 'var(--accent-2)', letterSpacing: 2 }}>
                {'★'.repeat(product.rating)} <span className="text-muted" style={{ fontSize: 13 }}>(In stock)</span>
              </div>

              <div className="price">
                {product.oldPrice && <s>{money(product.oldPrice)}</s>}
                {money(product.price)}
              </div>

              <p className="pd-desc">{product.desc}</p>

              {product.flavors?.length > 1 && (
                <>
                  <label className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Flavor</label>
                  <div className="flavors">
                    {product.flavors.map(f => (
                      <div key={f} className={`flavor ${flavor === f ? 'active' : ''}`} onClick={() => setFlavor(f)}>{f}</div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                <div className="qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <button className="btn btn-primary" onClick={() => addItem(product, qty, flavor)}>
                  Add to Cart · {money(product.price * qty)}
                </button>
              </div>

              <div className="pd-meta">
                <div><span>Brand</span><span>{product.brand}</span></div>
                <div><span>Category</span><span>{cat?.name}</span></div>
                <div><span>Size</span><span>{product.size}</span></div>
                <div><span>Servings</span><span>{product.servings}</span></div>
                <div><span>Authenticity</span><span className="text-accent">100% Genuine ✓</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="shop-head"><h2 className="section-title">You Might Also Like</h2></div>
            <div className="grid product-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
