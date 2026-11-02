import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import { useLocale } from '../i18n.jsx'

// Lightweight popup that collects name / phone / area (+ optional address,
// notes) then hands the customer object back to the parent, which builds the
// WhatsApp message. Used on the product page for single-item orders.
export default function OrderModal({ open, onClose, onConfirm, title, summary }) {
  const { t, region } = useLocale()
  const [form, setForm] = useState({ name: '', phone: '', area: region.areas[0], address: '', notes: '' })

  // keep the area valid when the country changes
  useEffect(() => {
    setForm(f => (region.areas.includes(f.area) ? f : { ...f, area: region.areas[0] }))
  }, [region])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = (e) => { e.preventDefault(); onConfirm(form) }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="order-title" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 id="order-title">{title || t('Order on WhatsApp')}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('Close')}><X size={18} /></button>
        </div>
        {summary && <p className="modal-summary">{summary}</p>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="om-name">{t('Full name')} *</label>
            <input id="om-name" required value={form.name} onChange={update('name')} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="om-phone">{t('Phone')} *</label>
            <input id="om-phone" required type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" dir="ltr" />
          </div>
          <div className="field">
            <label htmlFor="om-area">{t('Delivery area')} *</label>
            <select id="om-area" value={form.area} onChange={update('area')}>
              {region.areas.map(a => <option key={a} value={a}>{t(a)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="om-address">{t('Building / street')}</label>
            <input id="om-address" value={form.address} onChange={update('address')} autoComplete="street-address" />
          </div>
          <div className="field">
            <label htmlFor="om-notes">{t('Order notes')}</label>
            <textarea id="om-notes" rows="2" value={form.notes} onChange={update('notes')} />
          </div>

          <button type="submit" className="btn btn-wa btn-block">
            <WhatsAppIcon size={18} /> {t('Continue on WhatsApp')}
          </button>
          <p className="modal-note">
            {t('Payment is cash on delivery. We’ll open WhatsApp with your order — just press send.')}
          </p>
        </form>
      </div>
    </div>
  )
}
