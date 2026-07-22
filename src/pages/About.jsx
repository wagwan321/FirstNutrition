import { Link } from 'react-router-dom'
import { BRANDS } from '../data/catalog.js'

export default function About() {
  return (
    <>
      <section className="page-head has-photo" style={{ backgroundImage: 'url(/images/shake.jpg)' }}>
        <div className="container">
          <span className="eyebrow">About First Nutrition</span>
          <h1>Your Ultimate<br />Supplement Provider</h1>
          <p>First Nutrition is the leading regional distributor of top-selling sports nutrition brands — dedicated to providing dynamic, cutting-edge and result-producing products that drive athletes to achieve their true strength.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid about-grid">
            <div className="value-card">
              <div className="ico">🎯</div>
              <h3>Our Mission</h3>
              <p>To inspire and empower active people across Lebanon and the region to reach their goals with authentic, high-quality nutrition — from the beginner to the elite athlete.</p>
            </div>
            <div className="value-card">
              <div className="ico">🛡️</div>
              <h3>100% Authentic</h3>
              <p>As an official distributor, every product we sell is genuine and sourced directly from the brands — no imitations, no compromises on quality.</p>
            </div>
            <div className="value-card">
              <div className="ico">💪</div>
              <h3>Built For Athletes</h3>
              <p>A comprehensive line of powdered, bar, tablet, capsule and ready-to-drink products covering protein, strength, recovery, diet and wellness.</p>
            </div>
          </div>

          {/* LIFESTYLE BAND */}
          <div className="split-band" style={{ marginTop: 48 }}>
            <div className="split-copy">
              <span className="eyebrow">Quality You Can Trust</span>
              <h2 className="section-title">Only The Real Thing</h2>
              <p className="text-muted">Every tub, bar and capsule on our shelves is sourced directly from official brand partners. When you buy from First Nutrition, you know exactly what you're putting in your body — pure, potent and proven.</p>
              <ul className="split-list">
                <li>Direct-from-brand sourcing</li>
                <li>Full range: powders, bars, capsules & RTDs</li>
                <li>Guidance tailored to your goals</li>
              </ul>
            </div>
            <div className="split-media" style={{ backgroundImage: 'url(/images/protein.jpg)' }}>
              <span className="badge">100% Authentic</span>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <div className="center" style={{ marginBottom: 30 }}>
              <span className="eyebrow">Our Portfolio</span>
              <h2 className="section-title">World-Class Brands</h2>
              <p className="text-muted" style={{ maxWidth: 560, margin: '10px auto 0' }}>
                We proudly represent and distribute the most trusted names in sports nutrition, available in our stores, gyms and pharmacies nationwide.
              </p>
            </div>
            <div className="grid brand-grid">
              {BRANDS.map(b => <div className="brand-chip" key={b}>{b}</div>)}
            </div>
          </div>

          <div className="form-card" style={{ marginTop: 48, textAlign: 'center', background: 'linear-gradient(120deg, rgba(225,23,34,.12), var(--surface))' }}>
            <h2 style={{ fontSize: 32 }}>Start The Change Today</h2>
            <p className="text-muted" style={{ maxWidth: 500, margin: '12px auto 20px' }}>
              Whether you're building muscle, losing fat or leveling up your performance — we've got the fuel.
            </p>
            <Link to="/shop" className="btn btn-primary">Explore The Shop →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
