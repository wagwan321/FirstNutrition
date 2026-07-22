import { useCart } from '../context/CartContext.jsx'

export default function Toast() {
  const { toast } = useCart()
  return (
    <div className={`toast ${toast ? 'show' : ''}`}>
      <span>✅</span>{toast}
    </div>
  )
}
