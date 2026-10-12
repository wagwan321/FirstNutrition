import { CircleCheck } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

export default function Toast() {
  const { toast } = useCart()
  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      <CircleCheck size={18} aria-hidden="true" />{toast}
    </div>
  )
}
