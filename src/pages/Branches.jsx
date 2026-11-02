import { MapPin, Phone, Clock, Navigation, Mail } from 'lucide-react'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import { COUNTRIES, SHOP } from '../config.js'
import { useLocale } from '../i18n.jsx'
import { waUrl } from '../utils/whatsapp.js'

const mapsUrl = (b, countryName) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`First Nutrition ${b.city} ${countryName}`)}`

export default function Branches() {
  const { t, country, setCountry, region } = useLocale()

  return (
    <>
      <section className="page-head">
        <div className="container">
          <RevealText as="h1" text={t('Our branches')} delay={100} />
          <p>{t('Genuine supplements and expert advice in store — or order online with delivery across the country.')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="seg seg-lg branch-tabs" role="tablist" aria-label={t('Country')}>
            {Object.values(COUNTRIES).map(c => (
              <button key={c.code} role="tab" aria-selected={country === c.code}
                className={country === c.code ? 'on' : ''} onClick={() => setCountry(c.code)}>
                {t(c.name)} <small>{t('{n} branches', { n: c.branches.length })}</small>
              </button>
            ))}
          </div>

          <div className="grid branch-grid" key={country}>
            {region.branches.map((b, i) => (
              <Reveal className="branch-card" key={b.city} variant={i % 2 ? 'right' : 'left'} delay={Math.floor(i / 2) * 120}>
                <span className="branch-pin"><MapPin size={22} /></span>
                <div className="branch-body">
                  <span className="branch-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{t(b.city)}</h3>
                  {b.confirmed
                    ? <p>{t(b.address)}</p>
                    : <p className="text-muted">{t('Contact us for the exact address.')}</p>}
                  {b.hours && <p className="ico-line"><Clock size={15} /> {t(b.hours)}</p>}
                  <div className="branch-actions">
                    <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-ghost btn-sm"><Phone size={15} /> <span dir="ltr">{b.phone}</span></a>
                    <a href={mapsUrl(b, region.name)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm"><Navigation size={15} /> {t('Directions')}</a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal variant="scale" className="panel-cta">
            <h3>{t('Can’t make it in store?')}</h3>
            <p className="text-muted">
              {t('We deliver across {country}. Message us and our team will help you pick the right supplements for your goal.', { country: t(region.name) })}
            </p>
            <div className="panel-cta-actions">
              <a href={waUrl(t('Hi First Nutrition! I need help choosing supplements.'), country)} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                <WhatsAppIcon size={17} /> {t('Chat on WhatsApp')}
              </a>
              <a href={`mailto:${SHOP.email}`} className="btn btn-ghost"><Mail size={17} /> {SHOP.email}</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
