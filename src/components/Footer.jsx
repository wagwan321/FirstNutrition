import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Banknote, Truck, ShieldCheck } from 'lucide-react'
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from './BrandIcons.jsx'
import { CATEGORIES } from '../data/catalog.js'
import { SHOP } from '../config.js'
import { waUrl } from '../utils/whatsapp.js'
import { useLocale } from '../i18n.jsx'
import { CountrySwitch, LangSwitch } from './Navbar.jsx'
import Reveal from './Reveal.jsx'

const CERTS = [
  { src: '/images/fn/site/tuv-iso-9001.svg', label: 'ISO 9001' },
  { src: '/images/fn/site/tuv-iso-22000.svg', label: 'ISO 22000' },
  { src: '/images/fn/site/tuv-iso-45001.svg', label: 'ISO 45001' },
]

export default function Footer() {
  const { t, region, country } = useLocale()
  return (
    <footer className="footer">
      <div className="footer-perks">
        <div className="container footer-perks-inner">
          <span><ShieldCheck size={20} /> {t('100% authentic products')}</span>
          <span><Truck size={20} /> {t('Delivery across {country}', { country: t(region.name) })}</span>
          <span><Banknote size={20} /> {t('Cash on delivery')}</span>
          <span><WhatsAppIcon size={18} /> {t('Order on WhatsApp')}</span>
        </div>
      </div>

      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" aria-label="First Nutrition — home">
              <img src="/images/fn/site/logo-light.svg" alt="First Nutrition" className="footer-logo" />
            </Link>
            <p>{t('Official distributor of the world’s leading sports nutrition brands. 100% authentic, always.')}</p>
            <div className="socials">
              <a href={SHOP.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={17} /></a>
              <a href={SHOP.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon size={17} /></a>
              <a href={waUrl('Hi First Nutrition!', country)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon size={17} /></a>
              <a href={`mailto:${SHOP.email}`} aria-label={t('Email')}><Mail size={17} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('Shop')}</h4>
            {CATEGORIES.slice(0, 7).map(c => <Link key={c.id} to={`/shop/${c.id}`}>{t(c.name)}</Link>)}
          </div>

          <div className="footer-col">
            <h4>{t('Company')}</h4>
            <Link to="/about">{t('About us')}</Link>
            <Link to="/brands">{t('Our brands')}</Link>
            <Link to="/branches">{t('Branches')}</Link>
            <Link to="/shop/bundles">{t('Offers & Bundles')}</Link>
          </div>

          <div className="footer-col">
            <h4>{t('{country} head office', { country: t(region.name) })}</h4>
            <p className="ico-line"><MapPin size={16} /> <span>{region.hq}</span></p>
            <p className="ico-line"><Phone size={16} /> <a href={`tel:${region.phone.replace(/\s/g, '')}`} dir="ltr">{region.phone}</a></p>
            <p className="ico-line"><Mail size={16} /> <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></p>
          </div>
        </div>

        <Reveal className="footer-certs" variant="up">
          <span>{t('Proudly certified')}</span>
          {CERTS.map(c => <img key={c.label} src={c.src} alt={`TÜV ${c.label}`} />)}
        </Reveal>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} First Nutrition. {t('All rights reserved.')}</span>
          <div className="footer-switches">
            <CountrySwitch />
            <LangSwitch />
          </div>
        </div>
      </div>
    </footer>
  )
}
