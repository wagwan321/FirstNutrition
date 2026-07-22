import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 14 }}>
              <span className="logo-mark">FN</span>
              <span>FIRST<small>NUTRITION</small></span>
            </div>
            <p className="tag">Your Ultimate Supplement Provider. Lebanon's leading distributor of premium sports nutrition brands. Start The Change.</p>
            <div className="socials">
              <a href="https://www.instagram.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
              <a href="https://www.facebook.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" aria-label="Facebook">👍</a>
              <a href="mailto:info@firstnutrition.com" aria-label="Email">✉️</a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <Link to="/shop/protein">Proteins</Link>
            <Link to="/shop/preworkout">Pre-Workout</Link>
            <Link to="/shop/aminos">Amino & Recovery</Link>
            <Link to="/shop/burners">Fat Burners</Link>
            <Link to="/shop/bars">Bars & Snacks</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/branches">Our Branches</Link>
            <a href="mailto:info@firstnutrition.com">Careers</a>
            <a href="mailto:info@firstnutrition.com">Partnership</a>
          </div>

          <div>
            <h4>Contact</h4>
            <p>📧 info@firstnutrition.com</p>
            <p>📞 +961 1 745 136</p>
            <p>📍 Hamra · Achrafieh · Saida · Tripoli</p>
            <p>🕘 Mon–Sat, 9:00 – 20:00</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {2026} First Nutrition Lebanon. All rights reserved.</span>
          <span>Prices in USD · Cash & card accepted · Delivery across Lebanon</span>
        </div>
      </div>
    </footer>
  )
}
