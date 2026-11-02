import { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { InstagramIcon } from './BrandIcons.jsx'
import { useLocale } from '../i18n.jsx'

// Full-screen vertical viewer for the store's Instagram reels: plays the reel
// in Instagram's own embed, with previous / next and Escape to close.
export default function ReelViewer({ reels, index, onIndex, onClose }) {
  const { t } = useLocale()
  const closeRef = useRef(null)
  const reel = reels[index]

  useEffect(() => {
    if (!reel) return
    closeRef.current?.focus()
    document.body.classList.add('no-scroll')
    const rtl = document.documentElement.dir === 'rtl'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + (rtl ? -1 : 1) + reels.length) % reels.length)
      if (e.key === 'ArrowLeft') onIndex((index + (rtl ? 1 : -1) + reels.length) % reels.length)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('no-scroll') }
  }, [reel, index, reels.length, onIndex, onClose])

  if (!reel) return null
  return (
    <div className="rv" role="dialog" aria-modal="true" aria-label={reel.title} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rv-frame">
        <iframe key={reel.code} src={`https://www.instagram.com/p/${reel.code}/embed/`} title={reel.title}
          allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
      </div>
      <div className="rv-bar">
        <button type="button" className="rv-btn" onClick={() => onIndex((index - 1 + reels.length) % reels.length)} aria-label={t('Previous')}>
          <ChevronLeft size={22} className="flip-rtl" />
        </button>
        <a className="rv-open" href={reel.url} target="_blank" rel="noopener noreferrer"><InstagramIcon size={16} /> {t('Open in Instagram')}</a>
        <button type="button" className="rv-btn" onClick={() => onIndex((index + 1) % reels.length)} aria-label={t('Next')}>
          <ChevronRight size={22} className="flip-rtl" />
        </button>
      </div>
      <button type="button" className="rv-close" ref={closeRef} onClick={onClose} aria-label={t('Close')}><X size={22} /></button>
    </div>
  )
}
