import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Truck, Store, MessageCircle, BadgeCheck, Check,
} from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import HeroTub from '../components/HeroTub.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import ScrollScene from '../components/ScrollScene.jsx'
import SectionHead from '../components/SectionHead.jsx'
import KineticBand from '../components/KineticBand.jsx'
import CountUp from '../components/CountUp.jsx'
import GoalFinder from '../components/GoalFinder.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'
import { CATEGORIES, PRODUCTS } from '../data/catalog.js'
import { boot } from '../boot.js'

const TAPE_RED = [
  '100% Authentic', 'Official Distributor', 'Delivery All Over Lebanon',
  'Cash On Delivery', 'Expert Advice In Store',
]
const TAPE_DARK = ['Start The Change', 'Fuel Your Strength', 'Train Hard', 'Recover Faster']

const FEATURES = [
  { icon: ShieldCheck, title: '100% Authentic', text: 'Genuine stock sourced directly from the official brands. Zero imitations.' },
  { icon: Truck, title: 'Nationwide Delivery', text: 'Fast shipping to every corner of Lebanon, paid cash on delivery.' },
  { icon: Store, title: '4 Retail Branches', text: 'Visit us in Hamra, Achrafieh, Saida and Tripoli.' },
  { icon: MessageCircle, title: 'Expert Advice', text: 'Real people who train, helping you pick what fits your goal.' },
]

// One scrolling strip of the crossed "tapes" under the hero.
const Tape = ({ items, className, reverse }) => (
  <div className={`tape ${className}`}>
    <div className="tape-shift">
      <div className={`ticker-track${reverse ? ' reverse' : ''}`}>
        {[0, 1].map(copy => (
          <ul key={copy} aria-hidden={copy === 1 || undefined}>
            {items.map(t => <li key={t}>{t}<i aria-hidden="true" /></li>)}
          </ul>
        ))}
      </div>
    </div>
  </div>
)

export default function Home() {
  // Wait for the first-load splash screen before playing the hero intro.
  const [intro] = useState(() => boot.introDelay)
  const bestSellers = PRODUCTS.filter(p => p.tag === 'Best Seller').slice(0, 4)

  return (
    <>
      {/* HERO — copy drifts up and the tub tilts/turns as you scroll away */}
      <ScrollScene as="section" className="hero" style={{ '--intro': `${intro}ms` }}>
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
            <p className="hero-in from-left" style={{ '--i': 4 }}>
              Lebanon's leading distributor of premium sports nutrition. 100% authentic proteins,
              pre-workouts and supplements from the world's top brands — delivered to your door.
            </p>
            <div className="hero-cta hero-in" style={{ '--i': 5 }}>
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/about" className="btn btn-ghost btn-lg">Why First Nutrition</Link>
            </div>
            <div className="hero-stats hero-in from-right" style={{ '--i': 6 }}>
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
      </ScrollScene>

      {/* CROSSED TAPES — run in opposite directions and get nudged by scroll */}
      <ScrollScene className="tapes" aria-label="Why shop with us">
        <Tape items={TAPE_DARK} className="tape-dark" reverse />
        <Tape items={TAPE_RED} className="tape-red" />
      </ScrollScene>

      {/* CATEGORIES — rows alternate in from the left and right */}
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Shop by Goal"
            title="Find Your Formula"
            sub="Focused ranges built around how you train — from your first scoop to the final rep."
          />
          <div className="cat-list">
            {CATEGORIES.map((c, i) => {
              const count = PRODUCTS.filter(p => p.category === c.id).length
              return (
                <Reveal key={c.id} variant={i % 2 ? 'right' : 'left'} delay={60}>
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

      {/* BEST SELLERS — cards flip up, then drift in a staggered wave on scroll */}
      <section className="section pt-0">
        <div className="container">
          <SectionHead eyebrow="Trending Now" title="Best Sellers">
            <Link to="/shop" className="btn btn-ghost">View All <ArrowRight size={16} /></Link>
          </SectionHead>
          <ScrollScene className="grid product-grid drift">
            {bestSellers.map((p, i) => (
              <Reveal key={p.id} variant="flip" delay={i * 110}><ProductCard product={p} /></Reveal>
            ))}
          </ScrollScene>
        </div>
      </section>

      {/* MEDIA SPLIT BAND — photo wipes in from the left, copy from the right */}
      <section className="section pt-0">
        <div className="container">
          <div className="split-band">
            <Reveal variant="clip-left" className="split-media curtain">
              <ScrollScene className="parallax-img">
                <img src="/images/training.jpg" alt="Athlete training with battle ropes" loading="lazy" />
              </ScrollScene>
              <span className="badge">Athlete-Trusted</span>
            </Reveal>
            <div className="split-copy">
              <Reveal as="span" variant="right" className="eyebrow">Built For The Grind</Reveal>
              <RevealText className="section-title" text={'Fuel every rep.\nRecover every session.'} delay={100} />
              <Reveal as="p" variant="right" delay={250} className="text-muted">
                From your first scoop of whey to your post-workout aminos, First Nutrition stocks only 100% authentic
                supplements — the same brands trusted by athletes across Lebanon. Real results start with real nutrition.
              </Reveal>
              <ul className="check-list">
                {['Certified genuine stock — zero imitations', 'Expert supplement guidance in every branch', 'Fast delivery, nationwide']
                  .map((t, i) => (
                    <Reveal as="li" key={t} variant="right" delay={350 + i * 110}><Check size={16} /> {t}</Reveal>
                  ))}
              </ul>
              <Reveal variant="scale" delay={700} className="split-cta">
                <Link to="/shop" className="btn btn-primary">Shop The Range <ArrowRight size={18} /></Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* KINETIC TYPE */}
      <KineticBand />

      {/* GOAL FINDER */}
      <section className="section surface-band">
        <div className="container">
          <SectionHead
            eyebrow="Supplement Finder"
            title="What's Your Goal?"
            sub="Pick what you're training for and we'll show you where to start."
          />
          <GoalFinder />
        </div>
      </section>

      {/* FEATURES — cards swing in from alternating sides */}
      <section className="section">
        <div className="container">
          <div className="grid feature-grid">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} variant={i % 2 ? 'tilt-right' : 'tilt-left'} delay={i * 100} className="feature">
                <span className="feature-ico"><Icon size={22} /></span>
                <h4>{title}</h4>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS — the two logo rows slide in from opposite edges */}
      <section className="section pt-0 brands-section">
        <div className="container">
          <SectionHead
            center
            eyebrow="Trusted Worldwide"
            title="The Brands We Carry"
            sub="Official stock from the biggest names in sports nutrition. Tap a brand to shop it."
          />
        </div>
        <BrandMarquee />
      </section>

      {/* CTA — the banner widens to full size as it scrolls in */}
      <section className="section-sm">
        <div className="container">
          <ScrollScene className="cta-photo cta-expand">
            <Reveal as="span" variant="up" className="eyebrow light">Your next level starts here</Reveal>
            <RevealText text="Ready to start the change?" delay={100} />
            <Reveal as="p" variant="up" delay={300}>
              Join thousands of athletes across Lebanon fueling their goals with First Nutrition.
            </Reveal>
            <Reveal variant="scale" delay={450}>
              <Link to="/shop" className="btn btn-dark btn-lg">Shop The Range <ArrowRight size={18} /></Link>
            </Reveal>
          </ScrollScene>
        </div>
      </section>
    </>
  )
}
