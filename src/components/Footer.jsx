import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from './BrandIcons.jsx'
import { CATEGORIES } from '../data/catalog.js'
import { waUrl } from '../utils/whatsapp.js'
import Reveal from './Reveal.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="logo">
              <span className="logo-mark">FN</span>
              <span className="logo-word">FIRST<small>NUTRITION</small></span>
            </Link>
            <p className="tag">Your Ultimate Supplement Provider. Lebanon's leading distributor of premium sports nutrition brands.</p>
            <div className="socials">
              <a href="https://www.instagram.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={17} /></a>
              <a href="https://www.facebook.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon size={17} /></a>
              <a href={waUrl('Hi First Nutrition!')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon size={17} /></a>
              <a href="mailto:info@firstnutrition.com" aria-label="Email"><Mail size={17} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            {CATEGORIES.map(c => <Link key={c.id} to={`/shop/${c.id}`}>{c.name}</Link>)}
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/branches">Our Branches</Link>
            <a href="mailto:info@firstnutrition.com">Careers</a>
            <a href="mailto:info@firstnutrition.com">Partnership</a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <p className="ico-line"><Mail size={16} /> info@firstnutrition.com</p>
            <p className="ico-line"><Phone size={16} /> +961 1 745 136</p>
            <p className="ico-line"><MapPin size={16} /> Hamra · Achrafieh · Saida · Tripoli</p>
            <p className="ico-line"><Clock size={16} /> Mon–Sat, 9:00 – 20:00</p>
          </div>
        </div>

        <Reveal variant="clip-up" className="footer-mega" aria-hidden="true">START THE CHANGE</Reveal>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} First Nutrition Lebanon. All rights reserved.</span>
          <span>Prices in USD · Cash on delivery · Delivery across Lebanon</span>
        </div>
      </div>
    </footer>
  )
}
