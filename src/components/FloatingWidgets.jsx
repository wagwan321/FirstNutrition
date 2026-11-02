import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import { waUrl } from '../utils/whatsapp.js'
import { useLocale } from '../i18n.jsx'

const RING = 2 * Math.PI * 21 // circumference of the back-to-top progress ring

// Page-level widgets: top scroll-progress bar, back-to-top button with a
// progress ring, and a floating "chat on WhatsApp" button.
export default function FloatingWidgets() {
  const { t, country } = useLocale()
  const barRef = useRef(null)
  const ringRef = useRef(null)
  const [showTop, setShowTop] = useState(false)
  const [heroCta, setHeroCta] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (ringRef.current) ringRef.current.style.strokeDashoffset = `${RING * (1 - p)}`
      setShowTop(window.scrollY > 640)
      // The homepage hero has its own WhatsApp order button: keep the floating
      // one out of the way while that button is on screen.
      const cta = document.querySelector('.lb-cta')?.getBoundingClientRect()
      setHeroCta(!!cta && cta.top < window.innerHeight && cta.bottom > 0)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><span ref={barRef} /></div>

      <div className="fab-stack">
        <button type="button" className={`fab fab-top${showTop ? ' show' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t('Back to top')} tabIndex={showTop ? 0 : -1}>
          <svg className="fab-ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="21" />
            <circle ref={ringRef} cx="24" cy="24" r="21" className="fab-ring-fill"
              strokeDasharray={RING} strokeDashoffset={RING} />
          </svg>
          <ArrowUp size={18} strokeWidth={2.4} />
        </button>

        {/* the Coach page has its own "Ask a real coach" WhatsApp button */}
        <a className={`fab fab-wa${heroCta || pathname === '/coach' ? ' is-hidden' : ''}`} target="_blank" rel="noopener noreferrer" tabIndex={heroCta || pathname === '/coach' ? -1 : undefined}
          href={waUrl(t('Hi First Nutrition! I need help choosing supplements.'), country)}
          aria-label={t('Chat with us on WhatsApp')}>
          <WhatsAppIcon size={26} />
          <span className="fab-label">{t('Need advice? Chat with us')}</span>
        </a>
      </div>
    </>
  )
}
