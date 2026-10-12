import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, CircleCheck } from 'lucide-react'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { RevealText } from '../components/Reveal.jsx'
import { useCart } from '../context/CartContext.jsx'
import { money } from '../data/catalog.js'
import { SHOP } from '../config.js'
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp.js'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const [placed, setPlaced] = useState(false)
  const [waLink, setWaLink] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: SHOP.areas[0], address: '', notes: '',
  })

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const customer = {
      name: form.name, phone: form.phone, email: form.email,
      area: form.city, address: form.address, notes: form.notes,
    }
    const text = buildOrderMessage({ items, subtotal, customer })
    // Open WhatsApp now (must be inside the click handler so it isn't blocked),
    // and keep the URL for a reliable fallback link on the confirmation screen.
    const url = openWhatsApp(text)
    setWaLink(url)
    setPlaced(true)
    window.scrollTo(0, 0)
  }

  if (placed) {
    return (
      <div className="container section">
        <div className="success-box">
          <div className="check wa"><CircleCheck size={40} /></div>
          <h1>Your Order Is Ready</h1>
          <p className="text-muted" style={{ maxWidth: 500, margin: '12px auto 4px' }}>
            Thanks, {form.name.split(' ')[0] || 'athlete'}! We've opened <strong className="text-accent">WhatsApp</strong> with
            your full order — just press <strong>send</strong> and our team will confirm delivery and the fee.
          </p>
          <p className="text-muted" style={{ fontSize: 14, marginBottom: 22 }}>
            Payment: <strong>Cash on Delivery</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {waLink && (
              <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={18} /> Open WhatsApp Again
              </a>
            )}
            <Link to="/shop" className="btn btn-ghost">Continue Shopping</Link>
          </div>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 18 }}>
            Didn't go through? Message us directly on <strong>{SHOP.whatsappDisplay}</strong>.<br />
            <button className="link-btn" onClick={clearCart}>Clear my cart</button>
          </p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container section center">
        <h1>Your cart is empty</h1>
        <p className="text-muted" style={{ margin: '12px 0 20px' }}>Add some supplements before ordering.</p>
        <Link to="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Almost There</span>
          <RevealText as="h1" text="Complete Your Order" delay={100} />
          <p>Fill in your delivery details and send the order on WhatsApp — we deliver across all of Lebanon, cash on delivery.</p>
        </div>
      </section>

      <section className="section">
        <form className="container checkout-layout" onSubmit={submit}>
          <div>
            <div className="form-card">
              <h3>Delivery Details</h3>
              <div className="field-row">
                <div className="field">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={update('name')} placeholder="e.g. Karim Haddad" />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input required value={form.phone} onChange={update('phone')} placeholder="+961 …" />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@email.com" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Delivery Area *</label>
                  <select value={form.city} onChange={update('city')}>
                    {SHOP.areas.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Building / Street *</label>
                  <input required value={form.address} onChange={update('address')} placeholder="Street, building, floor" />
                </div>
              </div>
              <div className="field">
                <label>Order Notes</label>
                <textarea rows="3" value={form.notes} onChange={update('notes')} placeholder="Landmark, delivery instructions…" />
              </div>
              <div className="cod-note">
                <Banknote size={20} aria-hidden="true" />
                <span><strong>Cash on Delivery</strong> — pay in cash when your order arrives. The delivery fee is confirmed by the store on WhatsApp.</span>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <aside className="form-card">
            <h3>Order Summary</h3>
            <div style={{ marginBottom: 14 }}>
              {items.map(i => (
                <div className="order-item" key={i.key}>
                  <span><span className="q">{i.qty}×</span> {i.name}{i.flavor ? ` (${i.flavor})` : ''}</span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="summary-line"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="summary-line">
              <span className="text-muted">Delivery</span>
              <span className="text-muted">Confirmed by store</span>
            </div>
            <div className="summary-line total"><span>Total</span><span>{money(subtotal)}</span></div>
            <button type="submit" className="btn btn-wa btn-block" style={{ marginTop: 16 }}>
              <WhatsAppIcon size={18} /> Order on WhatsApp
            </button>
            <Link to="/shop" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>Continue Shopping</Link>
          </aside>
        </form>
      </section>
    </>
  )
}
