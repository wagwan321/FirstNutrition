import { Link } from 'react-router-dom'
import { Target, ShieldCheck, Dumbbell, Check, ArrowRight } from 'lucide-react'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import ScrollScene from '../components/ScrollScene.jsx'
import SectionHead from '../components/SectionHead.jsx'
import KineticBand from '../components/KineticBand.jsx'
import BrandMarquee from '../components/BrandMarquee.jsx'
import { useLocale } from '../i18n.jsx'

const VALUES = [
  { icon: Target, title: 'Our mission', text: 'To help active people across the region reach their goals with authentic, high-quality nutrition — from the first scoop to elite performance.' },
  { icon: ShieldCheck, title: '100% authentic', text: 'As an official distributor, every product we sell is genuine and sourced directly from the brands. No imitations, no compromises.' },
  { icon: Dumbbell, title: 'Built for athletes', text: 'Powders, bars, capsules and ready-to-drink products covering protein, strength, recovery, weight management and wellness.' },
]
const VALUE_VARIANTS = ['tilt-left', 'flip', 'tilt-right']

const CERTS = [
  { src: '/images/fn/site/tuv-iso-9001.svg', code: 'ISO 9001', label: 'Quality management' },
  { src: '/images/fn/site/tuv-iso-22000.svg', code: 'ISO 22000', label: 'Food safety management' },
  { src: '/images/fn/site/tuv-iso-45001.svg', code: 'ISO 45001', label: 'Occupational health & safety' },
]

export default function About() {
  const { t } = useLocale()
  return (
    <>
      <section className="page-head has-photo" style={{ backgroundImage: 'url(/images/shake.jpg)' }}>
        <div className="container">
          <RevealText as="h1" text={t('Your ultimate supplement provider')} delay={150} />
          <p>{t('First Nutrition is a leading regional distributor of the world’s top sports nutrition brands — bringing authentic, result-driven products to athletes of every level.')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid about-grid">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal className="value-card" key={title} variant={VALUE_VARIANTS[i]} delay={i * 110}>
                <span className="feature-ico"><Icon size={22} /></span>
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </Reveal>
            ))}
          </div>

          <div className="split-band">
            <div className="split-copy">
              <RevealText className="section-title" text={t('Only the real thing.')} delay={100} />
              <Reveal as="p" variant="left" delay={250} className="text-muted">
                {t('Every tub, bar and capsule on our shelves comes directly from official brand partners. When you buy from First Nutrition, you know exactly what you are putting in your body.')}
              </Reveal>
              <ul className="check-list">
                {['Direct-from-brand sourcing', 'Powders, bars, capsules & ready-to-drink', 'Guidance tailored to your goals'].map((item, i) => (
                  <Reveal as="li" key={item} variant="left" delay={350 + i * 110}><Check size={16} /> {t(item)}</Reveal>
                ))}
              </ul>
            </div>
            <Reveal variant="clip-right" className="split-media curtain from-right">
              <ScrollScene className="parallax-img">
                <img src="/images/protein.jpg" alt={t('Protein shake and supplements')} loading="lazy" />
              </ScrollScene>
              <span className="badge">{t('100% authentic')}</span>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <SectionHead center title={t('Held to international standards')}
            sub={t('Our operations are certified by TÜV Austria for quality, food safety and workplace safety.')} />
          <div className="cert-grid">
            {CERTS.map((c, i) => (
              <Reveal key={c.code} className="cert-card" variant={i === 0 ? 'left' : i === 2 ? 'right' : 'up'} delay={i * 90}>
                <img src={c.src} alt={`TÜV ${c.code}`} />
                <b>{c.code}</b>
                <span>{t(c.label)}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <KineticBand top={[t('Authentic'), t('Official'), t('Certified'), t('Trusted')]}
                   bottom={[t('Only the real thing'), t('Start the change')]} />

      <section className="section pt-0">
        <div className="container">
          <SectionHead center title={t('World-class brands')}
            sub={t('Available in our stores and delivered nationwide.')} />
        </div>
        <BrandMarquee />
      </section>

      <section className="section-sm">
        <div className="container">
          <ScrollScene className="cta-band cta-expand">
            <div className="cta-copy">
              <RevealText text={t('Start the change today.')} delay={100} />
              <Reveal as="p" variant="left" delay={250}>
                {t('Building muscle, losing fat or chasing performance — we’ve got the fuel.')}
              </Reveal>
              <Reveal variant="scale" delay={400} className="cta-actions">
                <Link to="/shop" className="btn btn-white btn-lg">{t('Explore the shop')} <ArrowRight size={18} className="flip-rtl" /></Link>
              </Reveal>
            </div>
          </ScrollScene>
        </div>
      </section>
    </>
  )
}
