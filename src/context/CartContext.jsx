import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { productById } from '../data/catalog.js'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

// v2: lines are product + variant ids only; prices are always looked up from
// the catalog (in JOD) so they follow catalog updates and the country switch.
const STORAGE_KEY = 'fn_cart_v2'

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter(i => productById(i.id)) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* private mode */ }
  }, [items])

  const showToast = useCallback((name) => {
    setToast(name)
    setTimeout(() => setToast(null), 2400)
  }, [])

  // variant may be undefined for products without options (bundles)
  const addItem = useCallback((product, variant, qty = 1) => {
    const variantId = variant?.id ?? 0
    const key = `${product.id}:${variantId}`
    setItems(prev => {
      const found = prev.find(i => i.key === key)
      if (found) return prev.map(i => (i.key === key ? { ...i, qty: i.qty + qty } : i))
      return [...prev, { key, id: product.id, variantId, qty }]
    })
    showToast(product.name)
    setDrawerOpen(true)
  }, [showToast])

  const setQty = useCallback((key, qty) => {
    setItems(prev => prev.map(i => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)))
  }, [])
  const removeItem = useCallback((key) => setItems(prev => prev.filter(i => i.key !== key)), [])
  const clearCart = useCallback(() => setItems([]), [])

  // Resolved lines: product, variant and unit price (JOD).
  const lines = useMemo(() => items.map(i => {
    const product = productById(i.id)
    if (!product) return null
    const variant = product.variants.find(v => v.id === i.variantId)
    return { ...i, product, variant, unit: variant?.price ?? product.price }
  }).filter(Boolean), [items])

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines])
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.unit, 0), [lines])

  const value = {
    lines, count, subtotal,
    addItem, setQty, removeItem, clearCart,
    drawerOpen, setDrawerOpen, toast,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// "5 lbs. · Double Rich Chocolate"
export const variantLabel = (variant) =>
  variant ? ['size', 'flavor', 'color'].map(k => variant[k]).filter(Boolean).join(' · ') : ''
