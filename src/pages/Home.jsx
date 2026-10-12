import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Truck, Store, MessageCircle, BadgeCheck, Check,
} from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import HeroTub from '../components/HeroTub.jsx'
import Reveal from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import GoalFinder from '../components/GoalFinder.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'
import { boot } from '../boot.js'

const TICKER = [
  '100% Authentic', 'Official Distributor', 'Delivery All Over Lebanon',
  'Cash On Delivery', 'Expert Advice In Store', 'Start The Change',
]

const FEATURES = [
  { icon: ShieldCheck, title: '100% Authentic', text: 'Genuine stock sourced directly from the official brands. Zero imitations.' },
  { icon: Truck, title: 'Nationwide Delivery', text: 'Fast shipping to every corner of Lebanon, paid cash on delivery.' },
  { icon: Store, title: '4 Retail Branches', text: 'Visit us in Hamra, Achrafieh, Saida and Tripoli.' },
  { icon: MessageCircle, title: 'Expert Advice', text: 'Real people who train, helping you pick what fits your goal.' },
]

export default function Home() {
  // Wait for the first-load splash screen before playing the hero intro.
  const [intro] = useState(() => boot.introDelay)
  const bestSellers = PRODUCTS.filter(p => p.tag === 'Best Seller').slice(0, 4)

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ '--intro': `${intro}ms` }}>
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow hero-in" style={{ '--i': 0 }}>
              <span className="dot" /> Your Ultimate Supplement Provider
            </span>
            <h1 className="hero-title">
              <span className="line"><span style={{ '--i': 1 }}>Fuel your</span></span>
              <span className="line"><span style={{ '--i': 2 }} className="text-accent">strength.</span></span>
              <span className="line"><span style={{ '--i': 3 }} className="stroke">Start the change.</span></span>
            </h1>
            <p className="hero-in" style={{ '--i': 4 }}>
              Lebanon's leading distributor of premium sports nutrition. 100% authentic proteins,
              pre-workouts and supplements from the world's top brands — delivered to your door.
            </p>
            <div className="hero-cta hero-in" style={{ '--i': 5 }}>
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/about" className="btn btn-ghost btn-lg">Why First Nutrition</Link>
            </div>
            <div className="hero-stats hero-in" style={{ '--i': 6 }}>
              <div className="stat"><b><CountUp end={12} suffix="+" delay={intro + 500} /></b><span>Global Brands</span></div>
              <div className="stat"><b><CountUp end={4} delay={intro + 500} /></b><span>Lebanon Branches</span></div>
              <div className="stat"><b><CountUp end={19} suffix="K+" delay={intro + 500} /></b><span>Community</span></div>
            </div>
          </div>

          <div className="hero-visual hero-in-scale">
            <HeroTub>
              <div className="float-card fc1">
                <span className="fc-ico"><BadgeCheck size={18} /></span>
                <span><small>100% Authentic</small><b>Certified Stock</b></span>
              </div>
              <div className="float-card fc2">
                <span className="fc-ico"><Truck size={18} /></span>
                <span><small>Fast Delivery</small><b>All Lebanon</b></span>
              </div>
            </HeroTub>
          </div>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span /></div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-label="Why shop with us">
        <div className="ticker-track">
          {[0, 1].map(copy => (
            <ul key={copy} aria-hidden={copy === 1 || undefined}>
              {TICKER.map(t => <li key={t}>{t}<i aria-hidden="true" /></li>)}
            </ul>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Shop by Goal</span>
              <h2 className="section-title">Find Your Formula</h2>
            </div>
            <p className="section-sub">
              Focused ranges built around how you train — from your first scoop to the final rep.
            </p>
          </Reveal>
          <div className="cat-list">
            {CATEGORIES.map((c, i) => {
              const count = PRODUCTS.filter(p => p.category === c.id).length
              return (
                <Reveal key={c.id} delay={i * 70}>
                  <Link to={`/shop/${c.id}`} className="cat-row">
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="cat-ico"><c.icon size={22} /></span>
                    <span className="name">{c.name}</span>
                    <span className="desc">{c.blurb}</span>
                    <span className="count">{count} product{count === 1 ? '' : 's'}</span>
                    <span className="go" aria-hidden="true"><ArrowUpRight size={22} /></span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section pt-0">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Trending Now</span>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost">View All <ArrowRight size={16} /></Link>
          </Reveal>
          <div className="grid product-grid">
            {bestSellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MEDIA SPLIT BAND */}
      <section className="section pt-0">
        <div className="container">
          <div className="split-band">
            <Reveal variant="left" className="split-media">
              <img src="/images/training.jpg" alt="Athlete training with heavy weights" loading="lazy" />
              <span className="badge">Athlete-Trusted</span>
            </Reveal>
            <Reveal variant="right" className="split-copy">
              <span className="eyebrow">Built For The Grind</span>
              <h2 className="section-title">Fuel every rep.<br />Recover every session.</h2>
              <p className="text-muted">From your first scoop of whey to your post-workout aminos, First Nutrition stocks only 100% authentic supplements — the same brands trusted by athletes across Lebanon. Real results start with real nutrition.</p>
              <ul className="check-list">
                <li><Check size={16} /> Certified genuine stock — zero imitations</li>
                <li><Check size={16} /> Expert supplement guidance in every branch</li>
                <li><Check size={16} /> Fast delivery, nationwide</li>
              </ul>
              <Link to="/shop" className="btn btn-primary">Shop The Range <ArrowRight size={18} /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* GOAL FINDER */}
      <section className="section surface-band">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">Supplement Finder</span>
              <h2 className="section-title">What's Your Goal?</h2>
            </div>
            <p className="section-sub">Pick what you're training for and we'll show you where to start.</p>
          </Reveal>
          <Reveal delay={100}><GoalFinder /></Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <div className="grid feature-grid">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90} className="feature">
                <span className="feature-ico"><Icon size={22} /></span>
                <h4>{title}</h4>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="section pt-0 brands-section">
        <div className="container">
          <Reveal className="center brands-head">
            <span className="eyebrow">Trusted Worldwide</span>
            <h2 className="section-title">The Brands We Carry</h2>
            <p className="section-sub">Official stock from the biggest names in sports nutrition. Tap a brand to shop it.</p>
          </Reveal>
        </div>
        <Reveal variant="scale"><BrandMarquee /></Reveal>
      </section>

      {/* CTA BANNER */}
      <section className="section-sm">
        <div className="container">
          <Reveal variant="scale" className="cta-photo">
            <span className="eyebrow light">Your next level starts here</span>
            <h2>Ready to start the change?</h2>
            <p>Join thousands of athletes across Lebanon fueling their goals with First Nutrition.</p>
            <Link to="/shop" className="btn btn-dark btn-lg">Shop The Range <ArrowRight size={18} /></Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
