import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, CircleCheck } from 'lucide-react'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { RevealText } from '../components/Reveal.jsx'
import { useCart, variantLabel } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp.js'

export default function Checkout() {
  const { lines, subtotal, clearCart } = useCart()
  const { t, price, region, country } = useLocale()
  const [placed, setPlaced] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', area: region.areas[0], address: '', notes: '' })

  // keep the delivery area valid when the country changes
  useEffect(() => {
    setForm(f => (region.areas.includes(f.area) ? f : { ...f, area: region.areas[0] }))
  }, [region])

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const text = buildOrderMessage({ lines, subtotal, customer: form, country })
    // Open WhatsApp now (inside the click handler so it isn't blocked) and keep
    // the URL for a reliable fallback link on the confirmation screen.
    setWaLink(openWhatsApp(text, country))
    setPlaced(true)
    window.scrollTo(0, 0)
  }

  if (placed) {
    return (
      <div className="container section">
        <div className="success-box">
          <div className="check"><CircleCheck size={40} /></div>
          <h1>{t('Your order is ready')}</h1>
          <p className="text-muted">
            {t('Thanks, {name}! We opened WhatsApp with your full order — just press send and our team will confirm delivery and the fee.', { name: form.name.split(' ')[0] || t('athlete') })}
          </p>
          <p className="text-muted small">{t('Payment')}: <strong>{t('Cash on delivery')}</strong></p>
          <div className="success-actions">
            {waLink && (
              <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={18} /> {t('Open WhatsApp again')}
              </a>
            )}
            <Link to="/shop" className="btn btn-ghost">{t('Continue shopping')}</Link>
          </div>
          <p className="text-muted small">
            {t('Didn’t go through? Message us on {number}.', { number: region.whatsappDisplay })}{' '}
            <button className="link-btn" onClick={clearCart}>{t('Clear my cart')}</button>
          </p>
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container section center">
        <h1>{t('Your cart is empty')}</h1>
        <p className="text-muted" style={{ margin: '12px 0 20px' }}>{t('Add some supplements before checking out.')}</p>
        <Link to="/shop" className="btn btn-primary">{t('Shop now')}</Link>
      </div>
    )
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <RevealText as="h1" text={t('Complete your order')} delay={100} />
          <p>{t('Add your delivery details and send the order on WhatsApp — cash on delivery across {country}.', { country: t(region.name) })}</p>
        </div>
      </section>

      <section className="section">
        <form className="container checkout-layout" onSubmit={submit}>
          <div className="form-card">
            <h3>{t('Delivery details')}</h3>
            <div className="field-row">
              <div className="field">
                <label htmlFor="co-name">{t('Full name')} *</label>
                <input id="co-name" required value={form.name} onChange={update('name')} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="co-phone">{t('Phone')} *</label>
                <input id="co-phone" required type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" dir="ltr" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-email">{t('Email')}</label>
              <input id="co-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="co-area">{t('Delivery area')} *</label>
                <select id="co-area" value={form.area} onChange={update('area')}>
                  {region.areas.map(a => <option key={a} value={a}>{t(a)}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="co-address">{t('Building / street')} *</label>
                <input id="co-address" required value={form.address} onChange={update('address')} autoComplete="street-address" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-notes">{t('Order notes')}</label>
              <textarea id="co-notes" rows="3" value={form.notes} onChange={update('notes')} />
            </div>
            <div className="cod-note">
              <Banknote size={20} aria-hidden="true" />
              <span><strong>{t('Cash on delivery')}</strong> — {t('pay in cash when your order arrives. The delivery fee is confirmed by the store on WhatsApp.')}</span>
            </div>
          </div>

          <aside className="form-card summary-card">
            <h3>{t('Order summary')}</h3>
            <div className="order-items">
              {lines.map(l => (
                <div className="order-item" key={l.key}>
                  <img src={(l.variant?.img || l.product.img)} alt="" />
                  <span className="oi-name">
                    <b>{l.product.name}</b>
                    <small>{[variantLabel(l.variant), `× ${l.qty}`].filter(Boolean).join(' · ')}</small>
                  </span>
                  <span className="oi-price">{price(l.unit * l.qty)}</span>
                </div>
              ))}
            </div>
            <div className="summary-line"><span>{t('Subtotal')}</span><span>{price(subtotal)}</span></div>
            <div className="summary-line"><span>{t('Delivery')}</span><span className="text-muted">{t('Confirmed by store')}</span></div>
            <div className="summary-line total"><span>{t('Total')}</span><span>{price(subtotal)}</span></div>
            <button type="submit" className="btn btn-wa btn-block">
              <WhatsAppIcon size={18} /> {t('Send order on WhatsApp')}
            </button>
            <Link to="/shop" className="btn btn-link btn-block">{t('Continue shopping')}</Link>
          </aside>
        </form>
      </section>
    </>
  )
}
