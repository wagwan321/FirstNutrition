import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { count, setDrawerOpen } = useCart()
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop' },
    { to: '/branches', label: 'Branches' },
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">FN</span>
          <span>FIRST<small>NUTRITION</small></span>
        </Link>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <button className="cart-btn" onClick={() => setDrawerOpen(true)} aria-label="Open cart">
            🛒
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  )
}
