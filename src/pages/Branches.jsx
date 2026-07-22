import { BRANCHES } from '../data/catalog.js'

export default function Branches() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Visit Us</span>
          <h1>Our Branches</h1>
          <p>Find genuine supplements and expert advice at any of our First Nutrition stores across Lebanon.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid branch-grid">
            {BRANCHES.map(b => (
              <div className="branch-card" key={b.city}>
                <div className="pin">📍</div>
                <div>
                  <h3>{b.city}</h3>
                  <p>{b.address}</p>
                  <a href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a>
                  <p style={{ marginTop: 8 }}>🕘 Mon–Sat · 9:00 – 20:00</p>
                </div>
              </div>
            ))}
          </div>

          <div className="form-card" style={{ marginTop: 32, textAlign: 'center' }}>
            <h3>Can't Make It In Store?</h3>
            <p className="text-muted" style={{ maxWidth: 520, margin: '10px auto 18px' }}>
              We deliver across all of Lebanon. Order online or reach us directly and our team will help you find the right supplements for your goals.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:info@firstnutrition.com" className="btn btn-primary">✉️ info@firstnutrition.com</a>
              <a href="https://www.instagram.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" className="btn btn-ghost">📷 @firstnutritionlebanon</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
