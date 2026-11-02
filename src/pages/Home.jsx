import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, Truck, BadgeCheck, Award, Store, Play, ChevronLeft, ChevronRight,
} from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import HeroStage from '../components/HeroStage.jsx'
import Teardown from '../components/Teardown.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import ScrollScene from '../components/ScrollScene.jsx'
import SectionHead from '../components/SectionHead.jsx'
import KineticBand from '../components/KineticBand.jsx'
import CountUp from '../components/CountUp.jsx'
import GoalFinder from '../components/GoalFinder.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'
import { InstagramIcon } from '../components/BrandIcons.jsx'
import { CATEGORIES, PRODUCTS, ALL_BRANDS, REELS } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'
import { boot } from '../boot.js'

const TICKER = [
  'Official distributor', '100% authentic', 'ISO certified', 'Cash on delivery',
  'Expert advice in store', 'Start the change',
]

// Horizontal, swipeable row with arrow buttons on desktop.
function Carousel({ children, label }) {
  const { t, lang } = useLocale()
  const [el, setEl] = useState(null)
  const scroll = (dir) => {
    if (!el) return
    const sign = lang === 'ar' ? -1 : 1
    el.scrollBy({ left: dir * sign * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="carousel">
      <button type="button" className="car-btn prev" onClick={() => scroll(-1)} aria-label={t('Previous')}><ChevronLeft size={20} className="flip-rtl" /></button>
      <div className="car-track" ref={setEl} role="list" aria-label={label}>{children}</div>
      <button type="button" className="car-btn next" onClick={() => scroll(1)} aria-label={t('Next')}><ChevronRight size={20} className="flip-rtl" /></button>
    </div>
  )
}

export default function Home() {
  const { t, region } = useLocale()
  // Wait for the first-load splash screen before playing the hero intro.
  const [intro] = useState(() => boot.introDelay)
  const bestSellers = PRODUCTS.filter(p => p.bestseller).slice(0, 8)
  const offers = PRODUCTS.filter(p => p.category === 'bundles')
  const counts = Object.fromEntries(CATEGORIES.map(c => [c.id, PRODUCTS.filter(p => p.category === c.id).length]))

  return (
    <>
      {/* HERO */}
      <ScrollScene as="section" className="hero" style={{ '--intro': `${intro}ms` }}>
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-pill hero-in" style={{ '--i': 0 }}>
              <BadgeCheck size={15} /> {t('Official distributor · {n}+ global brands', { n: ALL_BRANDS.length })}
            </span>
            <h1 className="hero-title">
              <span className="line"><span style={{ '--i': 1 }}>{t('Fuel your')}</span></span>
              <span className="line"><span style={{ '--i': 2 }} className="text-accent">{t('strength.')}</span></span>
              <span className="line"><span style={{ '--i': 3 }}>{t('Start the change.')}</span></span>
            </h1>
            <p className="hero-lead hero-in from-left" style={{ '--i': 4 }}>
              {t('100% authentic supplements from Optimum Nutrition, MuscleTech, Dymatize and more — delivered across {country}.', { country: t(region.name) })}
            </p>
            <div className="hero-cta hero-in" style={{ '--i': 5 }}>
              <Link to="/shop" className="btn btn-primary btn-lg">{t('Shop now')} <ArrowRight size={18} className="flip-rtl" /></Link>
              <Link to="/shop/bundles" className="btn btn-ghost btn-lg">{t('See offers')}</Link>
            </div>
            <ul className="hero-trust hero-in from-right" style={{ '--i': 6 }}>
              <li><ShieldCheck size={18} /> {t('100% authentic')}</li>
              <li><Award size={18} /> {t('ISO certified')}</li>
              <li><Truck size={18} /> {t('Fast delivery')}</li>
            </ul>
          </div>
          <div className="hero-visual hero-in-scale">
            <HeroStage />
          </div>
        </div>
      </ScrollScene>

      {/* TRUST TICKER */}
      <div className="ticker" aria-label={t('Why shop with us')}>
        <div className="ticker-track">
          {[0, 1].map(copy => (
            <ul key={copy} aria-hidden={copy === 1 || undefined}>
              {TICKER.map(item => <li key={item}>{t(item)}<i aria-hidden="true" /></li>)}
            </ul>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t('Shop by category')} title={t('Find your formula')}>
            <Link to="/shop" className="link-arrow">{t('All products')} <ArrowRight size={16} className="flip-rtl" /></Link>
          </SectionHead>
          <div className="cat-grid">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} variant={i < 5 ? 'left' : 'right'} delay={(i % 5) * 60}>
                <Link to={`/shop/${c.id}`} className={`cat-tile${c.id === 'bundles' ? ' hot' : ''}`}>
                  <span className="cat-tile-img"><img src={c.img} alt="" loading="lazy" /></span>
                  <b>{t(c.name)}</b>
                  <small>{t(counts[c.id] === 1 ? '{n} product' : '{n} products', { n: counts[c.id] })}</small>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section pt-0">
        <div className="container">
          <SectionHead eyebrow={t('Trending now')} title={t('Best sellers')}>
            <Link to="/shop?tag=best" className="link-arrow">{t('View all')} <ArrowRight size={16} className="flip-rtl" /></Link>
          </SectionHead>
          <ScrollScene className="grid product-grid drift">
            {bestSellers.map((p, i) => (
              <Reveal key={p.id} variant="flip" delay={(i % 4) * 100}><ProductCard product={p} /></Reveal>
            ))}
          </ScrollScene>
        </div>
      </section>

      {/* TEARDOWN */}
      <Teardown />

      {/* HOT OFFERS */}
      <section className="section offers-band">
        <div className="container">
          <SectionHead eyebrow={t('Hottest offers')} title={t('Bundles that save you more')}>
            <Link to="/shop/bundles" className="link-arrow">{t('All offers')} <ArrowRight size={16} className="flip-rtl" /></Link>
          </SectionHead>
          <Reveal variant="right">
            <Carousel label={t('Offers')}>
              {offers.map(p => <div className="car-item" role="listitem" key={p.id}><ProductCard product={p} /></div>)}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* SHOP BY GOAL */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow={t('Shop by goal')} title={t('What are you training for?')}
            sub={t('Pick a goal and we’ll show you where to start.')} />
          <GoalFinder />
        </div>
      </section>

      <KineticBand top={[t('Fuel'), t('Train'), t('Recover'), t('Repeat')]}
                   bottom={[t('Start the change'), t('100% authentic')]} />

      {/* BRANDS */}
      <section className="section pt-0">
        <div className="container">
          <SectionHead center eyebrow={t('Official partner brands')} title={t('The brands we carry')}
            sub={t('We are the official distributor for the biggest names in sports nutrition. Tap a brand to shop it.')} />
        </div>
        <BrandMarquee />
        <div className="center" style={{ marginTop: 28 }}>
          <Link to="/brands" className="btn btn-ghost">{t('Explore all brands')}</Link>
        </div>
      </section>

      {/* TRUST NUMBERS + CERTIFICATIONS */}
      <section className="section-sm">
        <div className="container">
          <div className="trust-panel">
            <Reveal variant="left" className="trust-stats">
              <div><b><CountUp end={ALL_BRANDS.length} suffix="+" /></b><span>{t('Global brands')}</span></div>
              <div><b><CountUp end={PRODUCTS.length} /></b><span>{t('Products in store')}</span></div>
              <div><b><CountUp end={3} /></b><span>{t('ISO certifications')}</span></div>
            </Reveal>
            <Reveal variant="right" className="trust-certs">
              <p>{t('Certified for quality, food safety and workplace safety by TÜV Austria.')}</p>
              <div>
                <img src="/images/fn/site/tuv-iso-9001.svg" alt="TÜV ISO 9001" />
                <img src="/images/fn/site/tuv-iso-22000.svg" alt="TÜV ISO 22000" />
                <img src="/images/fn/site/tuv-iso-45001.svg" alt="TÜV ISO 45001" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REELS */}
      {REELS.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead eyebrow={t('Learn with us')} title={t('Watch on Instagram')}
              sub={t('Short, honest answers to the questions we hear in store every day.')} />
            <div className="reels">
              {REELS.map((r, i) => (
                <Reveal key={r.id} variant={i % 2 ? 'right' : 'left'} delay={i * 80}>
                  <a href={r.url} target="_blank" rel="noreferrer" className={`reel reel-${i % 4}`}>
                    <span className="reel-play"><Play size={20} fill="currentColor" /></span>
                    <span className="reel-title" dir="rtl" lang="ar">{r.title}</span>
                    <span className="reel-src"><InstagramIcon size={14} /> {t('Watch reel')}</span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — widens as it scrolls in */}
      <section className="section-sm">
        <div className="container">
          <ScrollScene className="cta-band cta-expand">
            <div className="cta-copy">
              <Reveal as="span" variant="left" className="eyebrow light">{t('Visit us')}</Reveal>
              <RevealText text={t('Expert advice in every branch.')} delay={100} />
              <Reveal as="p" variant="left" delay={250}>
                {t('Talk to people who train. We’ll help you build the right stack for your goal and budget.')}
              </Reveal>
              <Reveal variant="scale" delay={400} className="cta-actions">
                <Link to="/branches" className="btn btn-white btn-lg"><Store size={18} /> {t('Find a branch')}</Link>
                <Link to="/shop" className="btn btn-outline-white btn-lg">{t('Shop online')}</Link>
              </Reveal>
            </div>
          </ScrollScene>
        </div>
      </section>
    </>
  )
}
