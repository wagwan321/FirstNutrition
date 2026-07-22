import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

const STORAGE_KEY = 'fn_cart_v1'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  const addItem = useCallback((product, qty = 1, flavor = null) => {
    const key = `${product.id}__${flavor || 'default'}`
    setItems(prev => {
      const found = prev.find(i => i.key === key)
      if (found) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, {
        key, id: product.id, name: product.name, brand: product.brand,
        price: product.price, mark: product.mark, img: product.img, flavor, qty,
      }]
    })
    showToast(`Added ${product.name} to cart`)
    setDrawerOpen(true)
  }, [showToast])

  const setQty = useCallback((key, qty) => {
    setItems(prev => prev
      .map(i => i.key === key ? { ...i, qty: Math.max(1, qty) } : i))
  }, [])

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items])

  const value = {
    items, count, subtotal,
    addItem, setQty, removeItem, clearCart,
    drawerOpen, setDrawerOpen, toast,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
