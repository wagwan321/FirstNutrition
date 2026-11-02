import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { productById } from '../data/catalog.js'

// Up to three products picked for the side-by-side Compare page,
// remembered on this device.
const CompareContext = createContext(null)
export const useCompare = () => useContext(CompareContext)

const STORAGE_KEY = 'fn_compare_v1'
export const COMPARE_MAX = 3

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(raw) ? raw.filter(id => productById(id)).slice(0, COMPARE_MAX) : []
  } catch { return [] }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch { /* private mode */ }
  }, [ids])

  // Adding a fourth drops the oldest pick.
  const toggle = useCallback((id) => {
    setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(-COMPARE_MAX))
  }, [])
  const remove = useCallback((id) => setIds(prev => prev.filter(x => x !== id)), [])
  const clear = useCallback(() => setIds([]), [])

  return (
    <CompareContext.Provider value={{ ids, has: (id) => ids.includes(id), toggle, remove, clear }}>
      {children}
    </CompareContext.Provider>
  )
}
