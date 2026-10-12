import { MapPin, Phone, Clock, Navigation, Mail } from 'lucide-react'
import { InstagramIcon } from '../components/BrandIcons.jsx'
import Reveal from '../components/Reveal.jsx'
import { BRANCHES } from '../data/catalog.js'

const mapsUrl = (b) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`First Nutrition ${b.city} Lebanon`)}`

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
            {BRANCHES.map((b, i) => (
              <Reveal className="branch-card" key={b.city} delay={i * 80}>
                <span className="branch-pin"><MapPin size={22} /></span>
                <div className="branch-body">
                  <span className="branch-num">0{i + 1}</span>
                  <h3>{b.city}</h3>
                  <p>{b.address}</p>
                  <p className="ico-line"><Clock size={15} /> Mon–Sat · 9:00 – 20:00</p>
                  <div className="branch-actions">
                    <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-ghost btn-sm"><Phone size={15} /> {b.phone}</a>
                    <a href={mapsUrl(b)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><Navigation size={15} /> Directions</a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="scale" className="panel-cta">
            <h3>Can't make it in store?</h3>
            <p className="text-muted">
              We deliver across all of Lebanon. Order online or reach us directly and our team will help you find the right supplements for your goals.
            </p>
            <div className="panel-cta-actions">
              <a href="mailto:info@firstnutrition.com" className="btn btn-primary"><Mail size={17} /> info@firstnutrition.com</a>
              <a href="https://www.instagram.com/firstnutritionlebanon/" target="_blank" rel="noreferrer" className="btn btn-ghost"><InstagramIcon size={16} /> @firstnutritionlebanon</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
