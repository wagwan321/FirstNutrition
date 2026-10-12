import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { money } from '../data/catalog.js'
import ProteinTub from './ProteinTub.jsx'
import { WhatsAppIcon } from './BrandIcons.jsx'

export default function CartDrawer() {
  const { items, count, subtotal, drawerOpen, setDrawerOpen, setQty, removeItem } = useCart()
  const navigate = useNavigate()

  const goCheckout = () => {
    setDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <div className={`overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen} aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your Cart {count > 0 && <span className="pill-count">{count}</span>}</h3>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close cart"><X size={20} /></button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-ico"><ShoppingBag size={30} /></span>
            <p>Your cart is empty.</p>
            <button className="btn btn-ghost" onClick={() => setDrawerOpen(false)}>
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
                      <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                      <button className="remove-x" onClick={() => removeItem(i.key)} aria-label={`Remove ${i.name}`}>
                        <Trash2 size={15} />
                      </button>
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
                Cash on delivery · delivery fee confirmed on WhatsApp.
              </p>
              <button className="btn btn-wa btn-block" onClick={goCheckout}>
                <WhatsAppIcon size={18} /> Order on WhatsApp
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
