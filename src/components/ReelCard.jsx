import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { InstagramIcon } from './BrandIcons.jsx'
import { useLocale } from '../i18n.jsx'

// A reel cover that previews itself: on hover (or, on touch screens, while it
// is the reel in the middle of the screen) the cover comes alive with a slow
// push-in and a running progress bar. When the reel has a `preview` clip (a
// short MP4 from the store), that clip plays muted instead.
export default function ReelCard({ reel, onOpen }) {
  const { t } = useLocale()
  const ref = useRef(null)
  const videoRef = useRef(null)
  const [live, setLive] = useState(false)

  // touch screens have no hover: preview the reel that reaches mid-screen,
  // one at a time (the latest to arrive takes over)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(hover: hover)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onClaim = (e) => setLive(e.detail === reel.id)
    window.addEventListener('fn:reel-live', onClaim)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) window.dispatchEvent(new CustomEvent('fn:reel-live', { detail: reel.id }))
      else setLive(false)
    }, { rootMargin: '-35% 0px -35% 0px' })
    io.observe(el)
    return () => { io.disconnect(); window.removeEventListener('fn:reel-live', onClaim) }
  }, [reel.id])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (live) v.play().catch(() => {})
    else { v.pause(); v.currentTime = 0 }
  }, [live])

  const hover = window.matchMedia?.('(hover: hover)').matches
  return (
    <a ref={ref} href={reel.url} target="_blank" rel="noreferrer" className={`reel${live ? ' is-live' : ''}`}
      onMouseEnter={hover ? () => setLive(true) : undefined} onMouseLeave={hover ? () => setLive(false) : undefined}
      onClick={(e) => { if (e.button === 0 && !e.metaKey && !e.ctrlKey) { e.preventDefault(); onOpen() } }}>
      <img className="reel-cover" src={reel.cover} alt="" loading="lazy" />
      {reel.preview && <video ref={videoRef} className="reel-video" src={reel.preview} muted loop playsInline preload="none" aria-hidden="true" />}
      <span className="reel-sweep" aria-hidden="true" />
      <span className="reel-play"><Play size={20} fill="currentColor" /></span>
      <span className="reel-bar" aria-hidden="true"><i /></span>
      <span className="reel-src"><InstagramIcon size={14} /> {live ? t('Previewing…') : t('Watch reel')}</span>
    </a>
  )
}
