import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const inShop = (path) => path === '/shop' || path.startsWith('/shop/')

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const prev = useRef(pathname)

  useEffect(() => {
    // Switching categories inside the shop keeps your place on the page.
    const stay = inShop(prev.current) && inShop(pathname)
    prev.current = pathname
    if (!stay) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
