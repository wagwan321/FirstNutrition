import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck, Banknote, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import OrderModal from '../components/OrderModal.jsx'
import BrandLogo from '../components/BrandLogo.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import ScrollScene from '../components/ScrollScene.jsx'
import SectionHead from '../components/SectionHead.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { PRODUCTS, productById, categoryById, findVariant, defaultSelection } from '../data/catalog.js'
import { buildSingleItemMessage, openWhatsApp } from '../utils/whatsapp.js'

const OPTION_LABELS = { size: 'Size', flavor: 'Flavor', color: 'Color' }

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useLocale()
  const product = productById(id)

  if (!product) {
    return (
      <div className="container section center">
        <h1>{t('Product not found')}</h1>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>{t('Back to shop')}</Link>
      </div>
    )
  }
  // keyed so selections reset when moving between products
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  const { addItem } = useCart()
  const { t, price, country } = useLocale()
  const [sel, setSel] = useState(() => defaultSelection(product))
  const [qty, setQty] = useState(1)
  const [orderOpen, setOrderOpen] = useState(false)

  const optionNames = Object.keys(product.options)
  const variant = findVariant(product, sel)
  const unit = variant?.price ?? product.price
  const cat = categoryById(product.category)

  // Is `value` in stock together with the other current choices?
  const isAvailable = (name, value) => product.variants.some(v =>
    v[name] === value && optionNames.every(k => k === name || v[k] === sel[k]))

  // Picking an unavailable combination jumps to the first variant with that value.
  const pick = (name, value) => {
    const next = { ...sel, [name]: value }
    if (findVariant(product, next)) return setSel(next)
    const v = product.variants.find(x => x[name] === value)
    if (v) setSel(Object.fromEntries(optionNames.map(k => [k, v[k]])))
  }

  const related = product.related.map(productById).filter(Boolean)
  const together = product.together.map(productById).filter(Boolean)
  const similar = related.length ? related
    : PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const confirmOrder = (customer) => {
    openWhatsApp(buildSingleItemMessage({ product, variant, qty, customer, country }), country)
    setOrderOpen(false)
  }

  return (
    <>
      <section className="section pd-section">
        <div className="container">
          <nav className="crumbs" aria-label={t('Breadcrumb')}>
            <Link to="/shop">{t('Shop')}</Link><span>/</span>
            <Link to={`/shop/${product.category}`}>{t(cat.name)}</Link><span>/</span>
            <b>{product.name}</b>
          </nav>

          <div className="pd-layout">
            <Reveal variant="clip-left" className="pd-visual curtain">
              <div className="pc-badges">
                {product.category === 'bundles' && <span className="badge">{t('Offer')}</span>}
                {product.bestseller && <span className="badge">{t('Best seller')}</span>}
                {product.isNew && <span className="badge badge-dark">{t('New')}</span>}
              </div>
              {/* the chosen size/flavour's own photo when the store has one */}
              <img key={variant?.img || product.img} className="pd-photo" src={variant?.img || product.img}
                alt={variant?.flavor ? `${product.name} — ${variant.flavor}` : product.name} />
            </Reveal>

            <Reveal variant="right" className="pd-info">
              <Link to={`/shop?brand=${encodeURIComponent(product.brand)}`} className="pd-brand">
                <BrandLogo name={product.brand} />
                <span>{product.brand}</span>
              </Link>
              <RevealText as="h1" text={product.name} delay={120} stagger={60} />
              <div className="pd-sub">
                <span className="pd-type">{t(product.type)}</span>
                <span className="in-stock"><i /> {t('In stock')}</span>
              </div>

              <div className="pd-price">
                {price(unit * qty)}
                {qty > 1 && <small>{t('{price} each', { price: price(unit) })}</small>}
              </div>

              {product.highlights.length > 0 && (
                <ul className="pd-highlights">
                  {product.highlights.map(h => <li key={h}>{h}</li>)}
                </ul>
              )}

              {optionNames.map(name => (
                <div className="pd-option" key={name}>
                  <span className="field-label">{t(OPTION_LABELS[name] || name)} · <b>{sel[name]}</b></span>
                  <div className="opt-pills" role="radiogroup" aria-label={t(OPTION_LABELS[name] || name)}>
                    {product.options[name].map(value => {
                      const avail = isAvailable(name, value)
                      return (
                        <button type="button" key={value} role="radio" aria-checked={sel[name] === value}
                          className={`opt-pill${sel[name] === value ? ' active' : ''}${avail ? '' : ' unavailable'}`}
                          onClick={() => pick(name, value)}
                          title={avail ? undefined : t('Not available with the current choice')}>
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pd-actions">
                <div className="qty">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label={t('Decrease quantity')}><Minus size={16} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} aria-label={t('Increase quantity')}><Plus size={16} /></button>
                </div>
                <button className="btn btn-primary" onClick={() => addItem(product, variant, qty)}>
                  <ShoppingBag size={18} /> {t('Add to cart')}
                </button>
              </div>
              <button className="btn btn-wa btn-block" onClick={() => setOrderOpen(true)}>
                <WhatsAppIcon size={18} /> {t('Order now on WhatsApp')}
              </button>

              <div className="pd-perks">
                <span><ShieldCheck size={18} /> {t('100% authentic')}</span>
                <span><Truck size={18} /> {t('Fast delivery')}</span>
                <span><Banknote size={18} /> {t('Cash on delivery')}</span>
              </div>
            </Reveal>
          </div>

          {(product.intro.length > 0 || product.sections.length > 0) && (
            <Reveal className="pd-details" variant="up">
              <h2>{t('Product details')}</h2>
              {product.intro.map((b, i) => <Block key={i} block={b} />)}
              <div className="accordion">
                {product.sections.map((s, i) => (
                  <details key={s.title + i} open={i === 0}>
                    <summary>{s.title} <ChevronDown size={18} aria-hidden="true" /></summary>
                    <div className="acc-body">{s.blocks.map((b, j) => <Block key={j} block={b} />)}</div>
                  </details>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {together.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <SectionHead title={t('Frequently bought together')} />
            <ScrollScene className="grid product-grid drift">
              {together.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} variant={i % 2 ? 'right' : 'left'} delay={i * 90}><ProductCard product={p} /></Reveal>
              ))}
            </ScrollScene>
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="section pt-0">
          <div className="container">
            <SectionHead title={t('You might also like')} />
            <div className="grid product-grid">
              {similar.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} variant="flip" delay={i * 100}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        onConfirm={confirmOrder}
        title={t('Order on WhatsApp')}
        summary={`${qty} × ${product.name}${variant ? ` · ${optionNames.map(k => variant[k]).join(' · ')}` : ''} — ${price(unit * qty)}`}
      />
    </>
  )
}

function Block({ block }) {
  if (block.p) return <p>{block.p}</p>
  if (block.ul) return <ul>{block.ul.map((li, i) => <li key={i}>{li}</li>)}</ul>
  return null
}
