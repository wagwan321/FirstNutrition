import { useEffect, useRef, useState } from 'react'
import { MessageCircle, UtensilsCrossed } from 'lucide-react'
import CoachChat from './CoachChat.jsx'
import TrackerView from './TrackerView.jsx'
import { useLocale } from '../i18n.jsx'
import { useTracker, dayKey } from '../context/TrackerContext.jsx'

// The Coach has two sides: the chat, and "Today", the food diary. The last
// side used is remembered; /coach?view=today opens the diary directly.
const KEY = 'fn_coach_view'

export default function CoachHub({ compact = false }) {
  const { t, lang } = useLocale()
  const tracker = useTracker()
  const [view, setView] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('view')
    if (fromUrl === 'today' || fromUrl === 'chat') return fromUrl
    try { return localStorage.getItem(KEY) || 'chat' } catch { return 'chat' }
  })
  useEffect(() => { try { localStorage.setItem(KEY, view) } catch { /* private mode */ } }, [view])
  const todayKcal = Math.round(tracker.totalsFor(dayKey()).kcal)
  const ref = useRef(null)

  // Switch sides and bring the top of the Coach into view (on the page the
  // window would otherwise stay at the bottom of a long chat).
  const open = (next) => {
    setView(next)
    // the chat keeps scrolling to its newest message; Today starts at its top
    if (compact || next !== 'today') return
    requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr')) || 76
      const top = el.getBoundingClientRect().top + window.scrollY - hdr - 12
      if (window.scrollY > top) window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }

  return (
    <div className={`chub${compact ? ' is-compact' : ''}`} ref={ref}>
      <div className="chub-tabs" role="tablist" aria-label={t('Coach')}>
        <button type="button" role="tab" aria-selected={view === 'chat'} className={view === 'chat' ? 'on' : ''} onClick={() => open('chat')}>
          <MessageCircle size={16} /> {t('Coach')}
        </button>
        <button type="button" role="tab" aria-selected={view === 'today'} className={view === 'today' ? 'on' : ''} onClick={() => open('today')}>
          <UtensilsCrossed size={16} /> {t('Today')}
          {todayKcal > 0 && <em>{todayKcal.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</em>}
        </button>
        <span className="chub-ink" style={{ '--x': view === 'chat' ? 0 : 1 }} aria-hidden="true" />
      </div>
      {view === 'chat'
        ? <CoachChat compact={compact} onOpenToday={() => open('today')} />
        : <TrackerView compact={compact} onOpenChat={() => open('chat')} />}
    </div>
  )
}
