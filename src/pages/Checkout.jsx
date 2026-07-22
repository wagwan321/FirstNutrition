import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { money } from '../data/catalog.js'

const DELIVERY_FEE = 3

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const [pay, setPay] = useState('cod')
  const [placed, setPlaced] = useState(false)
  const [orderNo, setOrderNo] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: 'Beirut', address: '', notes: '',
  })

  const shipping = subtotal > 80 ? 0 : DELIVERY_FEE
  const total = subtotal + shipping

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    // Generate a simple pseudo order number from cart + name length (no Date/random needed)
    const n = 'FN-' + (10000 + items.length * 137 + form.name.length * 7 + Math.floor(subtotal))
    setOrderNo(n)
    setPlaced(true)
    clearCart()
    window.scrollTo(0, 0)
  }

  if (placed) {
    return (
      <div className="container section">
        <div className="success-box">
          <div className="check">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="text-muted" style={{ maxWidth: 480, margin: '12px auto 4px' }}>
            Thank you, {form.name.split(' ')[0] || 'athlete'}! Your order <strong className="text-accent">{orderNo}</strong> has been received.
            Our team will call you on {form.phone || 'your number'} to confirm delivery.
          </p>
          <p className="text-muted" style={{ fontSize: 14, marginBottom: 24 }}>
            Payment method: {pay === 'cod' ? 'Cash on Delivery' : 'Card on Delivery'}
          </p>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container section center">
        <h1>Your cart is empty</h1>
        <p className="text-muted" style={{ margin: '12px 0 20px' }}>Add some supplements before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
    )
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Almost There</span>
          <h1>Checkout</h1>
          <p>Fill in your delivery details — we deliver across all of Lebanon.</p>
        </div>
      </section>

      <section className="section">
        <form className="container checkout-layout" onSubmit={submit}>
          <div>
            <div className="form-card" style={{ marginBottom: 24 }}>
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
                  <label>City *</label>
                  <select value={form.city} onChange={update('city')}>
                    <option>Beirut</option><option>Mount Lebanon</option><option>Saida</option>
                    <option>Tripoli</option><option>Zahle</option><option>Jounieh</option>
                    <option>Tyre</option><option>Byblos</option><option>Other</option>
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
            </div>

            <div className="form-card">
              <h3>Payment Method</h3>
              <label className={`pay-option ${pay === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="pay" checked={pay === 'cod'} onChange={() => setPay('cod')} />
                <div>
                  <strong>💵 Cash on Delivery</strong>
                  <div className="text-muted" style={{ fontSize: 13 }}>Pay in cash when your order arrives.</div>
                </div>
              </label>
              <label className={`pay-option ${pay === 'card' ? 'active' : ''}`}>
                <input type="radio" name="pay" checked={pay === 'card'} onChange={() => setPay('card')} />
                <div>
                  <strong>💳 Card on Delivery</strong>
                  <div className="text-muted" style={{ fontSize: 13 }}>Our courier brings a card machine to your door.</div>
                </div>
              </label>
              <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                🔒 We never ask for card numbers online. Payment is handled securely on delivery.
              </p>
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
              <span>{shipping === 0 ? <span className="text-accent">FREE</span> : money(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-muted" style={{ fontSize: 12 }}>Free delivery on orders over {money(80)}.</p>
            )}
            <div className="summary-line total"><span>Total</span><span>{money(total)}</span></div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              Place Order · {money(total)}
            </button>
            <Link to="/shop" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>Continue Shopping</Link>
          </aside>
        </form>
      </section>
    </>
  )
}
