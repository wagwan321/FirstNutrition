import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, ShieldCheck, Truck, Banknote, Phone, Search, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { CATEGORIES } from '../data/catalog.js'
import { COUNTRIES } from '../config.js'
import { WhatsAppIcon } from './BrandIcons.jsx'
import { waUrl } from '../utils/whatsapp.js'
import HeaderSearch from './HeaderSearch.jsx'

const ANNOUNCEMENTS = [
  { icon: ShieldCheck, text: '100% authentic — official distributor of 20+ global brands' },
  { icon: Truck, text: 'Fast delivery across {country}' },
  { icon: Banknote, text: 'Cash on delivery · order in seconds on WhatsApp' },
]

export function CountrySwitch({ className = '' }) {
  const { country, setCountry, t } = useLocale()
  return (
    <div className={`seg ${className}`} role="group" aria-label={t('Country')}>
      {Object.values(COUNTRIES).map(c => (
        <button key={c.code} type="button" aria-pressed={country === c.code}
          className={country === c.code ? 'on' : ''} onClick={() => setCountry(c.code)}>
          {t(c.name)}
        </button>
      ))}
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
  const { count, subtotal, setDrawerOpen } = useCart()
  const { t, price, region, country } = useLocale()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [msg, setMsg] = useState(0)
  const [bump, setBump] = useState(false)
  const { pathname, search } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setMsg(m => (m + 1) % ANNOUNCEMENTS.length), 4500)
    return () => clearInterval(id)
  }, [])

  // close menus whenever the route changes
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname, search])

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

  const pages = [
    { to: '/brands', label: t('Brands') },
    { to: '/branches', label: t('Branches') },
    { to: '/about', label: t('About') },
  ]

  return (
    <>
      {/* red utility bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-msg" aria-live="polite">
            {ANNOUNCEMENTS.map(({ icon: Icon, text }, i) => (
              <p key={text} className={i === msg ? 'on' : ''} aria-hidden={i !== msg}>
                <Icon size={14} aria-hidden="true" /> {t(text, { country: t(region.name) })}
              </p>
            ))}
          </div>
          <div className="topbar-tools">
            <a href={`tel:${region.phone.replace(/\s/g, '')}`} className="topbar-phone">
              <Phone size={13} aria-hidden="true" /> <span dir="ltr">{region.phone}</span>
            </a>
            <CountrySwitch />
            <LangSwitch />
          </div>
        </div>
      </div>

      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="container header-inner">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label={t('Open menu')}>
            <Menu size={21} />
          </button>

          <Link to="/" className="brand-logo" aria-label="First Nutrition — home">
            <img src="/images/fn/site/logo.svg" alt="First Nutrition" width="211" height="111" />
          </Link>

          <HeaderSearch className="hsearch-desktop" />

          <div className="header-actions">
            <button className="icon-btn search-btn" onClick={() => setSearchOpen(s => !s)} aria-label={t('Search products')}>
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <a className="hdr-help" href={waUrl(t('Hi First Nutrition! I need help choosing supplements.'), country)}
              target="_blank" rel="noopener noreferrer">
              <span className="hdr-ico wa"><WhatsAppIcon size={18} /></span>
              <span className="hdr-txt"><small>{t('Need advice?')}</small><b>{t('Chat with us')}</b></span>
            </a>
            <button className="hdr-cart" onClick={() => setDrawerOpen(true)} aria-label={t('Open cart ({n} items)', { n: count })}>
              <span className="hdr-ico">
                <ShoppingBag size={19} />
                {count > 0 && <span className={`cart-count${bump ? ' bump' : ''}`}>{count}</span>}
              </span>
              <span className="hdr-txt"><small>{t('Cart')}</small><b>{price(subtotal)}</b></span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="container hsearch-mobile-row">
            <HeaderSearch autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}

        <nav className="catnav" aria-label={t('Categories')}>
          <div className="container catnav-inner">
            <NavLink to="/shop" end className="catnav-all">{t('All products')}</NavLink>
            {CATEGORIES.map(c => (
              <NavLink key={c.id} to={`/shop/${c.id}`} className={c.id === 'bundles' ? 'hot' : undefined}>
                {t(c.name)}
              </NavLink>
            ))}
            <span className="catnav-sep" aria-hidden="true" />
            {pages.map(p => <NavLink key={p.to} to={p.to}>{p.label}</NavLink>)}
          </div>
        </nav>
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
          <p className="mmenu-label">{t('Categories')}</p>
          {CATEGORIES.map(c => (
            <Link key={c.id} to={`/shop/${c.id}`} className="mmenu-cat">
              <img src={c.img} alt="" /> {t(c.name)}
            </Link>
          ))}
          <p className="mmenu-label">{t('Company')}</p>
          {pages.map(p => <Link key={p.to} to={p.to} className="mmenu-link">{p.label}</Link>)}
        </div>
        <div className="mmenu-foot">
          <CountrySwitch />
          <LangSwitch />
        </div>
      </aside>
    </>
  )
}
