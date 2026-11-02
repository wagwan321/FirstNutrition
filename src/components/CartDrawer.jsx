import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useCart, variantLabel } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { WhatsAppIcon } from './BrandIcons.jsx'

export default function CartDrawer() {
  const { lines, count, subtotal, drawerOpen, setDrawerOpen, setQty, removeItem } = useCart()
  const { t, price, region } = useLocale()
  const navigate = useNavigate()
  const close = () => setDrawerOpen(false)

  // On phones the cart is a bottom sheet: drag its handle (or header) down
  // to close it, like a native sheet.
  const sheetRef = useRef(null)
  const drag = useRef(null)
  const onDragStart = (e) => {
    if (!window.matchMedia('(max-width: 760px)').matches || e.target.closest('button')) return
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 }
    sheetRef.current.classList.add('dragging')
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e) => {
    if (!drag.current) return
    drag.current.dy = Math.max(0, e.clientY - drag.current.y)
    sheetRef.current.style.setProperty('--drag', `${drag.current.dy}px`)
  }
  const onDragEnd = () => {
    if (!drag.current) return
    const { dy, t: t0 } = drag.current
    const speed = dy / Math.max(1, performance.now() - t0)
    drag.current = null
    sheetRef.current.classList.remove('dragging')
    sheetRef.current.style.removeProperty('--drag')
    if (dy > 120 || speed > 0.6) close()
  }
  const dragProps = { onPointerDown: onDragStart, onPointerMove: onDragMove, onPointerUp: onDragEnd, onPointerCancel: onDragEnd }

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, setDrawerOpen])

  return (
    <>
      <div className={`scrim${drawerOpen ? ' open' : ''}`} onClick={close} />
      <aside ref={sheetRef} className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen} aria-label={t('Shopping cart')}>
        <div className="drawer-grab" aria-hidden="true" {...dragProps}><span /></div>
        <div className="drawer-head" {...dragProps}>
          <h3>{t('Your cart')} {count > 0 && <span className="pill-count">{count}</span>}</h3>
          <button className="icon-btn" onClick={close} aria-label={t('Close cart')}><X size={20} /></button>
        </div>

        {lines.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-ico"><ShoppingBag size={30} /></span>
            <p>{t('Your cart is empty.')}</p>
            <button className="btn btn-ghost" onClick={() => { close(); navigate('/shop') }}>{t('Start shopping')}</button>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {lines.map(l => (
                <div className="cart-line" key={l.key}>
                  <Link to={`/product/${l.id}`} className="thumb" onClick={close}><img src={(l.variant?.img || l.product.img)} alt="" /></Link>
                  <div className="cart-line-info">
                    <small>{l.product.brand}</small>
                    <h4><Link to={`/product/${l.id}`} onClick={close}>{l.product.name}</Link></h4>
                    {l.variant && variantLabel(l.variant) && <span className="cart-line-opts">{variantLabel(l.variant)}</span>}
                    <div className="mini-qty">
                      <button onClick={() => setQty(l.key, l.qty - 1)} aria-label={t('Decrease quantity')}><Minus size={14} /></button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.key, l.qty + 1)} aria-label={t('Increase quantity')}><Plus size={14} /></button>
                      <button className="remove-x" onClick={() => removeItem(l.key)} aria-label={t('Remove {name}', { name: l.product.name })}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="lp">{price(l.unit * l.qty)}</div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="row">
                <span>{t('Subtotal')}</span>
                <span className="total">{price(subtotal)}</span>
              </div>
              <p className="drawer-note"><Truck size={15} /> {t('Cash on delivery across {country} · delivery fee confirmed on WhatsApp.', { country: t(region.name) })}</p>
              <button className="btn btn-primary btn-block" onClick={() => { close(); navigate('/checkout') }}>
                <WhatsAppIcon size={18} /> {t('Checkout on WhatsApp')}
              </button>
              <button className="btn btn-link btn-block" onClick={close}>{t('Continue shopping')}</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
