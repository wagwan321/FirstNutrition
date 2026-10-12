import { Link } from 'react-router-dom'
import { Target, ShieldCheck, Dumbbell, Check, ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'

const VALUES = [
  { icon: Target, title: 'Our Mission', text: 'To inspire and empower active people across Lebanon and the region to reach their goals with authentic, high-quality nutrition — from the beginner to the elite athlete.' },
  { icon: ShieldCheck, title: '100% Authentic', text: 'As an official distributor, every product we sell is genuine and sourced directly from the brands — no imitations, no compromises on quality.' },
  { icon: Dumbbell, title: 'Built For Athletes', text: 'A comprehensive line of powdered, bar, tablet, capsule and ready-to-drink products covering protein, strength, recovery, diet and wellness.' },
]

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
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal className="value-card" key={title} delay={i * 90}>
                <span className="feature-ico"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>

          {/* LIFESTYLE BAND */}
          <div className="split-band" style={{ marginTop: 72 }}>
            <Reveal variant="left" className="split-copy">
              <span className="eyebrow">Quality You Can Trust</span>
              <h2 className="section-title">Only the real thing</h2>
              <p className="text-muted">Every tub, bar and capsule on our shelves is sourced directly from official brand partners. When you buy from First Nutrition, you know exactly what you're putting in your body — pure, potent and proven.</p>
              <ul className="check-list">
                <li><Check size={16} /> Direct-from-brand sourcing</li>
                <li><Check size={16} /> Full range: powders, bars, capsules & RTDs</li>
                <li><Check size={16} /> Guidance tailored to your goals</li>
              </ul>
            </Reveal>
            <Reveal variant="right" className="split-media">
              <img src="/images/protein.jpg" alt="Protein shake and supplements" loading="lazy" />
              <span className="badge">100% Authentic</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section pt-0 brands-section">
        <div className="container">
          <Reveal className="center brands-head">
            <span className="eyebrow">Our Portfolio</span>
            <h2 className="section-title">World-Class Brands</h2>
            <p className="section-sub">
              We proudly represent and distribute the most trusted names in sports nutrition, available in our stores, gyms and pharmacies nationwide.
            </p>
          </Reveal>
        </div>
        <Reveal variant="scale"><BrandMarquee /></Reveal>
      </section>

      <section className="section-sm">
        <div className="container">
          <Reveal variant="scale" className="cta-photo">
            <span className="eyebrow light">Whatever your goal</span>
            <h2>Start the change today</h2>
            <p>Whether you're building muscle, losing fat or leveling up your performance — we've got the fuel.</p>
            <Link to="/shop" className="btn btn-dark btn-lg">Explore The Shop <ArrowRight size={18} /></Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
