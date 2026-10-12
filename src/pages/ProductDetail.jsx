import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck, Banknote } from 'lucide-react'
import ProductCard, { Stars } from '../components/ProductCard.jsx'
import ProteinTub from '../components/ProteinTub.jsx'
import OrderModal from '../components/OrderModal.jsx'
import Reveal from '../components/Reveal.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { PRODUCTS, CATEGORIES, money } from '../data/catalog.js'
import { buildSingleItemMessage, openWhatsApp } from '../utils/whatsapp.js'

export default function ProductDetail() {
  const { id } = useParams()
  const product = PRODUCTS.find(p => p.id === Number(id))
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [flavor, setFlavor] = useState(product?.flavors?.[0] || null)
  const [orderOpen, setOrderOpen] = useState(false)

  const confirmOrder = (customer) => {
    const text = buildSingleItemMessage({ product, flavor, qty, customer })
    openWhatsApp(text)
    setOrderOpen(false)
  }

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
  const off = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  return (
    <>
      <section className="section pd-section">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link><span>/</span>
            <Link to={`/shop/${product.category}`}>{cat?.name}</Link><span>/</span>
            <b>{product.name}</b>
          </nav>

          <div className="pd-layout">
            <Reveal variant="left" className="pd-visual">
              <div className="pc-badges">
                {product.tag && <span className={`badge${product.tag === 'New' ? ' gold' : ''}`}>{product.tag}</span>}
                {off > 0 && <span className="badge dark">−{off}%</span>}
              </div>
              {product.img
                ? <img className="pd-photo" src={product.img} alt={product.name} />
                : <ProteinTub mark={product.mark} uid={`pd-${product.id}`} label={cat?.name?.toUpperCase() || 'SUPPLEMENT'} sway />}
            </Reveal>

            <Reveal variant="right" className="pd-info">
              <span className="pd-brand">{product.brand}</span>
              <h1>{product.name}</h1>
              <div className="pd-rating">
                <Stars rating={product.rating} size={15} />
                <span className="in-stock"><i /> In stock</span>
              </div>

              <div className="price">
                {money(product.price)}
                {product.oldPrice && <s>{money(product.oldPrice)}</s>}
                {off > 0 && <span className="save">Save {money(product.oldPrice - product.price)}</span>}
              </div>

              <p className="pd-desc">{product.desc}</p>

              {product.flavors?.length > 1 && (
                <>
                  <span className="field-label">Flavor · <b>{flavor}</b></span>
                  <div className="flavors" role="radiogroup" aria-label="Flavor">
                    {product.flavors.map(fl => (
                      <button type="button" key={fl} role="radio" aria-checked={flavor === fl}
                        className={`flavor${flavor === fl ? ' active' : ''}`} onClick={() => setFlavor(fl)}>{fl}</button>
                    ))}
                  </div>
                </>
              )}

              <div className="pd-actions">
                <div className="qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
                </div>
                <button className="btn btn-primary" onClick={() => addItem(product, qty, flavor)}>
                  <ShoppingBag size={18} /> Add to Cart · {money(product.price * qty)}
                </button>
              </div>
              <button className="btn btn-wa btn-block" onClick={() => setOrderOpen(true)}>
                <WhatsAppIcon size={18} /> Order on WhatsApp
              </button>

              <div className="pd-perks">
                <span><ShieldCheck size={18} /> 100% genuine</span>
                <span><Truck size={18} /> Delivery all over Lebanon</span>
                <span><Banknote size={18} /> Cash on delivery</span>
              </div>

              <div className="pd-meta">
                <div><span>Brand</span><span>{product.brand}</span></div>
                <div><span>Category</span><span>{cat?.name}</span></div>
                <div><span>Size</span><span>{product.size}</span></div>
                <div><span>Servings</span><span>{product.servings}</span></div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <Reveal className="section-head">
              <div>
                <span className="eyebrow">Same category</span>
                <h2 className="section-title">You Might Also Like</h2>
              </div>
            </Reveal>
            <div className="grid product-grid">
              {related.map((p, i) => <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>)}
            </div>
          </div>
        </section>
      )}

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        onConfirm={confirmOrder}
        title="Order on WhatsApp"
        summary={`${qty} × ${product.name}${flavor ? ` · ${flavor}` : ''} — ${money(product.price * qty)}`}
      />
    </>
  )
}
