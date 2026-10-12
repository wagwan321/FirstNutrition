import { useCallback, useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Menu, X, ShieldCheck, Truck, Banknote } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import SearchOverlay from './SearchOverlay.jsx'

const ANNOUNCEMENTS = [
  { icon: ShieldCheck, text: '100% authentic — direct from official brands' },
  { icon: Truck, text: 'Fast delivery across all of Lebanon' },
  { icon: Banknote, text: 'Cash on delivery · order in seconds on WhatsApp' },
]

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/branches', label: 'Branches' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const { count, setDrawerOpen } = useCart()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [msg, setMsg] = useState(0)
  const [bump, setBump] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setMsg(m => (m + 1) % ANNOUNCEMENTS.length), 4200)
    return () => clearInterval(t)
  }, [])

  // close the mobile menu whenever the route changes
  useEffect(() => { setOpen(false) }, [pathname])

  // little "pop" on the cart badge when the count changes
  useEffect(() => {
    if (!count) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(t)
  }, [count])

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  return (
    <>
      <div className="announce" role="region" aria-label="Store announcements">
        <div className="announce-viewport">
          {ANNOUNCEMENTS.map(({ icon: Icon, text }, i) => (
            <p key={text} className={i === msg ? 'on' : ''} aria-hidden={i !== msg}>
              <Icon size={14} aria-hidden="true" /> {text}
            </p>
          ))}
        </div>
      </div>

      <nav className={`nav${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="logo" aria-label="First Nutrition — home">
            <span className="logo-mark">FN</span>
            <span className="logo-word">FIRST<small>NUTRITION</small></span>
          </Link>

          <div className={`nav-links${open ? ' open' : ''}`}>
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => isActive ? 'active' : ''}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right">
            <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search products">
              <Search size={19} />
            </button>
            <button className="icon-btn cart-btn" onClick={() => setDrawerOpen(true)} aria-label={`Open cart (${count} items)`}>
              <ShoppingBag size={19} />
              {count > 0 && <span className={`cart-count${bump ? ' bump' : ''}`}>{count}</span>}
            </button>
            <button className="icon-btn nav-toggle" onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu" aria-expanded={open}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  )
}
