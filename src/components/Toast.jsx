import { CircleCheck } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'

export default function Toast() {
  const { toast } = useCart()
  const { t } = useLocale()
  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      <CircleCheck size={18} aria-hidden="true" />
      {toast && <span>{t('Added to cart:')} <b>{toast}</b></span>}
    </div>
  )
}
