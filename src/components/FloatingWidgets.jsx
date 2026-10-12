import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import { waUrl } from '../utils/whatsapp.js'

const RING = 2 * Math.PI * 21 // circumference of the back-to-top progress ring

// Page-level widgets: top scroll-progress bar, back-to-top button with a
// progress ring, and a floating "chat on WhatsApp" button.
export default function FloatingWidgets() {
  const barRef = useRef(null)
  const ringRef = useRef(null)
  const [showTop, setShowTop] = useState(false)

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
  }, [])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><span ref={barRef} /></div>

      <div className="fab-stack">
        <button type="button" className={`fab fab-top${showTop ? ' show' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top" tabIndex={showTop ? 0 : -1}>
          <svg className="fab-ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="21" />
            <circle ref={ringRef} cx="24" cy="24" r="21" className="fab-ring-fill"
              strokeDasharray={RING} strokeDashoffset={RING} />
          </svg>
          <ArrowUp size={18} strokeWidth={2.4} />
        </button>

        <a className="fab fab-wa" target="_blank" rel="noopener noreferrer"
          href={waUrl("Hi First Nutrition! I'd like some help choosing supplements.")}
          aria-label="Chat with us on WhatsApp">
          <WhatsAppIcon size={26} />
          <span className="fab-label">Need help? Chat with us</span>
        </a>
      </div>
    </>
  )
}
