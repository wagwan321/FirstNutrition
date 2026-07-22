import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { money } from '../data/catalog.js'
import ProteinTub from './ProteinTub.jsx'

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, setQty, removeItem } = useCart()
  const navigate = useNavigate()

  const goCheckout = () => {
    setDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <div className={`overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <h3>Your Cart</h3>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="ico">🛒</div>
            <p>Your cart is empty.</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setDrawerOpen(false)}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {items.map(i => (
                <div className="cart-line" key={i.key}>
                  <div className="thumb">
                    {i.img
                      ? <img src={i.img} alt={i.name} />
                      : <ProteinTub mark={i.mark} uid={`c-${i.key}`} label="" />}
                  </div>
                  <div>
                    <h4>{i.name}</h4>
                    <div className="brand">{i.brand}{i.flavor ? ` · ${i.flavor}` : ''}</div>
                    <div className="mini-qty">
                      <button onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                      <button className="remove-x" onClick={() => removeItem(i.key)}>Remove</button>
                    </div>
                  </div>
                  <div className="lp">{money(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="row">
                <span className="text-muted">Subtotal</span>
                <span className="total">{money(subtotal)}</span>
              </div>
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
                Shipping & delivery calculated at checkout.
              </p>
              <button className="btn btn-primary btn-block" onClick={goCheckout}>
                Checkout →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
