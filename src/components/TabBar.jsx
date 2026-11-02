import { NavLink, useLocation } from 'react-router-dom'
import { House, LayoutGrid, Search, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import CategoryIcon from './CategoryIcon.jsx'

// Phone tab bar, like a native app: Home, Shop, Coach, Search, Cart.
// Search opens the header's search row; Cart opens the cart sheet.
export const openSearch = () => window.dispatchEvent(new Event('fn:open-search'))

export default function TabBar() {
  const { count, drawerOpen, setDrawerOpen } = useCart()
  const { t } = useLocale()
  const { pathname } = useLocation()

  return (
    <nav className="tabbar" aria-label={t('App navigation')}>
      <NavLink to="/" end className="tab"><House size={22} strokeWidth={1.9} /><span>{t('Home')}</span></NavLink>
      <NavLink to="/shop" className={() => `tab${/^\/(shop|product|compare)/.test(pathname) ? ' active' : ''}`}>
        <LayoutGrid size={22} strokeWidth={1.9} /><span>{t('Shop')}</span>
      </NavLink>
      <NavLink to="/coach" className="tab tab-coach">
        <span className="tab-plate"><CategoryIcon id="coach" size={20} /></span><span>{t('Coach')}</span>
      </NavLink>
      <button type="button" className="tab" onClick={openSearch}><Search size={22} strokeWidth={1.9} /><span>{t('Search')}</span></button>
      <button type="button" className={`tab${drawerOpen ? ' active' : ''}`} onClick={() => setDrawerOpen(true)}
        aria-label={t('Open cart ({n} items)', { n: count })}>
        <span className="tab-ico">
          <ShoppingCart size={22} strokeWidth={1.9} />
          {count > 0 && <em>{count}</em>}
        </span>
        <span aria-hidden="true">{t('Cart')}</span>
      </button>
    </nav>
  )
}
