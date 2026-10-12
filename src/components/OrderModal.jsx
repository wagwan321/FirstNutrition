import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { SHOP } from '../config.js'
import { WhatsAppIcon } from './BrandIcons.jsx'

// Lightweight popup that collects name / phone / area (+ optional address,
// notes) then hands the customer object back to the parent, which builds the
// WhatsApp message. Used on the product page for single-item orders.
export default function OrderModal({ open, onClose, onConfirm, title, summary }) {
  const [form, setForm] = useState({
    name: '', phone: '', area: SHOP.areas[0], address: '', notes: '',
  })

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    onConfirm(form)
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title || 'Order on WhatsApp'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {summary && <p className="modal-summary">{summary}</p>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Full Name *</label>
            <input required value={form.name} onChange={update('name')} placeholder="e.g. Karim Haddad" />
          </div>
          <div className="field">
            <label>Phone *</label>
            <input required value={form.phone} onChange={update('phone')} placeholder="+961 …" />
          </div>
          <div className="field">
            <label>Delivery Area *</label>
            <select value={form.area} onChange={update('area')}>
              {SHOP.areas.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Building / Street</label>
            <input value={form.address} onChange={update('address')} placeholder="Street, building, floor" />
          </div>
          <div className="field">
            <label>Order Notes</label>
            <textarea rows="2" value={form.notes} onChange={update('notes')} placeholder="Landmark, delivery instructions…" />
          </div>

          <button type="submit" className="btn btn-wa btn-block">
            <WhatsAppIcon size={18} /> Continue on WhatsApp
          </button>
          <p className="modal-note">
            Payment is <strong>Cash on Delivery</strong>. We'll open WhatsApp with your order — just press send.
            No WhatsApp? Message us at <strong>{SHOP.whatsappDisplay}</strong>.
          </p>
        </form>
      </div>
    </div>
  )
}
