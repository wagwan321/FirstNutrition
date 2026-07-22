import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import ProteinTub from '../components/ProteinTub.jsx'
import { CATEGORIES, BRANDS, PRODUCTS } from '../data/catalog.js'

export default function Home() {
  const bestSellers = PRODUCTS.filter(p => p.tag === 'Best Seller').slice(0, 4)
  const featured = PRODUCTS.slice(0, 8)

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">Your Ultimate Supplement Provider</span>
            <h1>FUEL YOUR<br /><span className="text-accent">STRENGTH.</span><br /><span className="stroke">START THE CHANGE.</span></h1>
            <p>Lebanon's leading distributor of premium sports nutrition. 100% authentic proteins, pre-workouts and supplements from the world's top brands — delivered to your door.</p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary">Shop Now</Link>
              <Link to="/about" className="btn btn-ghost">Why First Nutrition</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><b>12+</b><span>Global Brands</span></div>
              <div className="stat"><b>4</b><span>Lebanon Branches</span></div>
              <div className="stat"><b>19K+</b><span>Community</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-glow" />
            <ProteinTub mark="FN" uid="hero" label="WHEY GOLD" className="tub-float" />
            <div className="floating f1"><small>100% Authentic</small><b>Certified Stock</b></div>
            <div className="floating f2"><small>Fast Delivery</small><b>All Lebanon</b></div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          {[...BRANDS, ...BRANDS].map((b, i) => <span key={i}>★ {b}</span>)}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="cats-head">
            <div>
              <span className="eyebrow">Shop by Goal</span>
              <h2 className="section-title">Find Your Formula</h2>
            </div>
            <p className="text-muted cats-sub">
              Focused ranges built around how you train — from your first scoop to the final rep.
            </p>
          </div>
          <div className="cat-list">
            {CATEGORIES.map((c, i) => {
              const count = PRODUCTS.filter(p => p.category === c.id).length
              return (
                <Link to={`/shop/${c.id}`} key={c.id} className="cat-row">
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="name">{c.name}</span>
                  <span className="desc">{c.blurb}</span>
                  <span className="count">{count} product{count === 1 ? '' : 's'}</span>
                  <span className="go" aria-hidden="true">→</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="shop-head">
            <div>
              <span className="eyebrow">Trending Now</span>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost">View All</Link>
          </div>
          <div className="grid product-grid">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* MEDIA SPLIT BAND */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="split-band">
            <div className="split-media" style={{ backgroundImage: 'url(/images/training.jpg)' }}>
              <span className="badge">Athlete-Trusted</span>
            </div>
            <div className="split-copy">
              <span className="eyebrow">Built For The Grind</span>
              <h2 className="section-title">Fuel Every Rep,<br />Recover Every Session</h2>
              <p className="text-muted">From your first scoop of whey to your post-workout aminos, First Nutrition stocks only 100% authentic supplements — the same brands trusted by athletes across Lebanon. Real results start with real nutrition.</p>
              <ul className="split-list">
                <li>Certified genuine stock — zero imitations</li>
                <li>Expert supplement guidance in every branch</li>
                <li>Fast delivery, nationwide</li>
              </ul>
              <Link to="/shop" className="btn btn-primary">Shop The Range</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="section-sm" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid feature-grid">
            <div className="feature"><div className="ico">✅</div><h4>100% Authentic</h4><p>Genuine stock, direct from official brands</p></div>
            <div className="feature"><div className="ico">🚚</div><h4>Delivery Nationwide</h4><p>Fast shipping across all of Lebanon</p></div>
            <div className="feature"><div className="ico">🏬</div><h4>4 Retail Branches</h4><p>Beirut, Saida & Tripoli</p></div>
            <div className="feature"><div className="ico">💬</div><h4>Expert Advice</h4><p>Personalized supplement guidance</p></div>
          </div>
        </div>
      </section>

      {/* FEATURED GRID */}
      <section className="section">
        <div className="container">
          <div className="shop-head">
            <div>
              <span className="eyebrow">The Full Range</span>
              <h2 className="section-title">Featured Supplements</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost">Shop All</Link>
          </div>
          <div className="grid product-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 34 }}>
            <span className="eyebrow">Trusted Worldwide</span>
            <h2 className="section-title">The Brands We Carry</h2>
          </div>
          <div className="grid brand-grid">
            {BRANDS.map(b => <div className="brand-chip" key={b}>{b}</div>)}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-photo">
            <h2>Ready To Start The Change?</h2>
            <p style={{ maxWidth: 560, margin: '12px auto 24px', color: 'rgba(255,255,255,.92)' }}>
              Join thousands of athletes across Lebanon fueling their goals with First Nutrition.
            </p>
            <Link to="/shop" className="btn" style={{ background: '#0D0D0F', color: '#fff' }}>Shop The Range →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
