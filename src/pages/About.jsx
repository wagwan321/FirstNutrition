import { Link } from 'react-router-dom'
import { Target, ShieldCheck, Dumbbell, Check, ArrowRight } from 'lucide-react'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import ScrollScene from '../components/ScrollScene.jsx'
import SectionHead from '../components/SectionHead.jsx'
import KineticBand from '../components/KineticBand.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'

const VALUES = [
  { icon: Target, title: 'Our Mission', text: 'To inspire and empower active people across Lebanon and the region to reach their goals with authentic, high-quality nutrition — from the beginner to the elite athlete.' },
  { icon: ShieldCheck, title: '100% Authentic', text: 'As an official distributor, every product we sell is genuine and sourced directly from the brands — no imitations, no compromises on quality.' },
  { icon: Dumbbell, title: 'Built For Athletes', text: 'A comprehensive line of powdered, bar, tablet, capsule and ready-to-drink products covering protein, strength, recovery, diet and wellness.' },
]
const VALUE_VARIANTS = ['tilt-left', 'flip', 'tilt-right']

export default function About() {
  return (
    <>
      <section className="page-head has-photo" style={{ backgroundImage: 'url(/images/shake.jpg)' }}>
        <div className="container">
          <span className="eyebrow">About First Nutrition</span>
          <RevealText as="h1" text={'Your Ultimate\nSupplement Provider'} delay={150} />
          <p>First Nutrition is the leading regional distributor of top-selling sports nutrition brands — dedicated to providing dynamic, cutting-edge and result-producing products that drive athletes to achieve their true strength.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid about-grid">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal className="value-card" key={title} variant={VALUE_VARIANTS[i]} delay={i * 110}>
                <span className="feature-ico"><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>

          {/* LIFESTYLE BAND — copy from the left, photo wipes in from the right */}
          <div className="split-band" style={{ marginTop: 72 }}>
            <div className="split-copy">
              <Reveal as="span" variant="left" className="eyebrow">Quality You Can Trust</Reveal>
              <RevealText className="section-title" text="Only the real thing" delay={100} />
              <Reveal as="p" variant="left" delay={250} className="text-muted">
                Every tub, bar and capsule on our shelves is sourced directly from official brand partners. When you buy
                from First Nutrition, you know exactly what you're putting in your body — pure, potent and proven.
              </Reveal>
              <ul className="check-list">
                {['Direct-from-brand sourcing', 'Full range: powders, bars, capsules & RTDs', 'Guidance tailored to your goals']
                  .map((t, i) => (
                    <Reveal as="li" key={t} variant="left" delay={350 + i * 110}><Check size={16} /> {t}</Reveal>
                  ))}
              </ul>
            </div>
            <Reveal variant="clip-right" className="split-media curtain from-right">
              <ScrollScene className="parallax-img">
                <img src="/images/protein.jpg" alt="Protein shake and supplements" loading="lazy" />
              </ScrollScene>
              <span className="badge">100% Authentic</span>
            </Reveal>
          </div>
        </div>
      </section>

      <KineticBand top={['Authentic', 'Official', 'Trusted', 'Proven']} bottom={['Only the real thing', 'Start the change']} />

      <section className="section pt-0 brands-section">
        <div className="container">
          <SectionHead
            center
            eyebrow="Our Portfolio"
            title="World-Class Brands"
            sub="We proudly represent and distribute the most trusted names in sports nutrition, available in our stores, gyms and pharmacies nationwide."
          />
        </div>
        <BrandMarquee />
      </section>

      <section className="section-sm">
        <div className="container">
          <ScrollScene className="cta-photo cta-expand">
            <Reveal as="span" variant="up" className="eyebrow light">Whatever your goal</Reveal>
            <RevealText text="Start the change today" delay={100} />
            <Reveal as="p" variant="up" delay={300}>
              Whether you're building muscle, losing fat or leveling up your performance — we've got the fuel.
            </Reveal>
            <Reveal variant="scale" delay={450}>
              <Link to="/shop" className="btn btn-dark btn-lg">Explore The Shop <ArrowRight size={18} /></Link>
            </Reveal>
          </ScrollScene>
        </div>
      </section>
    </>
  )
}
