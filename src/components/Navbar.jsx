import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search, ChevronDown, ChevronRight, Check } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { CATEGORIES } from '../data/catalog.js'
import { COUNTRIES } from '../config.js'
import HeaderSearch from './HeaderSearch.jsx'
import CategoryIcon from './CategoryIcon.jsx'

// Small authored flags (icon size only).
export function Flag({ code, size = 22 }) {
  const h = Math.round(size * 2 / 3)
  if (code === 'lb') {
    return (
      <svg className="flag" width={size} height={h} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#ED1C24" /><rect y="5" width="30" height="10" fill="#fff" />
        <path d="M15 6.2l1.6 2.4h-1l1.9 2.3h-1.2l2.1 2.4h-2.6v1.3h-1.6v-1.3h-2.6l2.1-2.4h-1.2l1.9-2.3h-1z" fill="#00A651" />
      </svg>
    )
  }
  return (
    <svg className="flag" width={size} height={h} viewBox="0 0 30 20" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" /><rect width="30" height="6.67" fill="#000" />
      <rect y="13.33" width="30" height="6.67" fill="#007A3D" /><path d="M0 0l15 10L0 20z" fill="#CE1126" />
      <path d="M5.2 8.6l.55 1.05 1.15-.2-.75.9.75.9-1.15-.2-.55 1.05-.55-1.05-1.15.2.75-.9-.75-.9 1.15.2z" fill="#fff" />
    </svg>
  )
}

export function CountrySwitch({ className = '' }) {
  const { country, setCountry, t } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  const current = COUNTRIES[country]
  return (
    <div className={`country ${className}`} ref={ref}>
      <button type="button" className="country-btn" aria-haspopup="listbox" aria-expanded={open}
        aria-label={t('Country: {c}', { c: t(current.name) })} onClick={() => setOpen(o => !o)}>
        <Flag code={country} /> <span>{t(current.name)} · {current.currency}</span> <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <ul className="country-menu" role="listbox" aria-label={t('Country')}>
          {Object.values(COUNTRIES).map(c => (
            <li key={c.code} role="option" aria-selected={c.code === country}>
              <button type="button" onClick={() => { setCountry(c.code); setOpen(false) }}>
                <Flag code={c.code} /> <span>{t(c.name)} · {c.currency}</span>
                {c.code === country && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLocale()
  return (
    <button type="button" className={`lang-btn ${className}`} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      lang={lang === 'ar' ? 'en' : 'ar'}>
      {lang === 'ar' ? 'English' : 'العربية'}
    </button>
  )
}

export default function Navbar() {
  const { count, setDrawerOpen } = useCart()
  const { t } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [bump, setBump] = useState(false)
  const { pathname, search } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close menus whenever the route changes
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname, search])

  // the phone tab bar's Search tab opens the search row
  useEffect(() => {
    const open = () => { setMenuOpen(false); setSearchOpen(true) }
    window.addEventListener('fn:open-search', open)
    return () => window.removeEventListener('fn:open-search', open)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [menuOpen])

  useEffect(() => {
    if (!count) return
    setBump(true)
    const id = setTimeout(() => setBump(false), 450)
    return () => clearTimeout(id)
  }, [count])

  const links = [
    { to: '/shop', label: t('Shop'), end: true },
    { to: '/coach', label: t('Coach') },
    { to: '/brands', label: t('Brands') },
    { to: '/shop/bundles', label: t('Offers') },
    { to: '/branches', label: t('Branches') },
    { to: '/about', label: t('About') },
  ]

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label={t('Open menu')}>
            <Menu size={22} />
          </button>

          <Link to="/" className="brand-logo" aria-label="First Nutrition — home">
            <img src="/images/fn/site/logo.svg" alt="First Nutrition" width="211" height="111" />
          </Link>

          <nav className="nav-links" aria-label={t('Main')}>
            {links.map(l => (l.to === '/coach'
              ? <NavLink key={l.to} to={l.to} className="nav-coach"><span className="nav-coach-ico" aria-hidden="true"><CategoryIcon id="coach" size={13} /></span>{l.label}</NavLink>
              : <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>))}
          </nav>

          <HeaderSearch className="hsearch-desktop" />

          <div className="header-actions">
            <button className="icon-btn search-btn" onClick={() => setSearchOpen(s => !s)} aria-label={t('Search products')}>
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>
            <CountrySwitch className="hide-sm" />
            <span className="hdr-rule hide-sm" aria-hidden="true" />
            <LangSwitch className="hide-sm" />
            <span className="hdr-rule hide-sm" aria-hidden="true" />
            <button className="hdr-cart" onClick={() => setDrawerOpen(true)} aria-label={t('Open cart ({n} items)', { n: count })}>
              <ShoppingCart size={26} strokeWidth={1.8} />
              <span className={`cart-count${bump ? ' bump' : ''}`}>{count}</span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="hsearch-mobile-row">
            <HeaderSearch autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      {/* mobile drawer */}
      <div className={`scrim${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mmenu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen} aria-label={t('Menu')}>
        <div className="mmenu-head">
          <img src="/images/fn/site/logo.svg" alt="First Nutrition" className="mmenu-logo" />
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label={t('Close menu')}><X size={20} /></button>
        </div>
        <div className="mmenu-body">
          <Link to="/shop" className="mmenu-cta">{t('Shop all products')} <ChevronRight size={18} className="flip-rtl" /></Link>
          <Link to="/coach" className="mmenu-coach">
            <span className="mmenu-cat-ico"><CategoryIcon id="coach" size={24} /></span>
            <span><b>{t('Coach')}</b><small>{t('Your calories, macros and stack in six taps')}</small></span>
            <ChevronRight size={18} className="flip-rtl" />
          </Link>
          <p className="mmenu-label">{t('Categories')}</p>
          {CATEGORIES.map(c => (
            <Link key={c.id} to={`/shop/${c.id}`} className="mmenu-cat">
              <span className="mmenu-cat-ico"><CategoryIcon id={c.id} size={24} /></span> {t(c.name)}
            </Link>
          ))}
          <p className="mmenu-label">{t('Company')}</p>
          {links.filter(l => l.to !== '/shop' && l.to !== '/coach').map(p => <Link key={p.to} to={p.to} className="mmenu-link">{p.label}</Link>)}
        </div>
        <div className="mmenu-foot">
          <CountrySwitch />
          <LangSwitch />
        </div>
      </aside>
    </>
  )
}
