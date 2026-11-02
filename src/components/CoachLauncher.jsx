import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { X, Maximize2 } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons.jsx'
import CategoryIcon from './CategoryIcon.jsx'
import CoachChat from './CoachChat.jsx'
import { useLocale } from '../i18n.jsx'
import { waUrl } from '../utils/whatsapp.js'

// The Coach as a chat bubble on every page: a red plate button that says
// hello once per visit and opens the Coach in a panel (full screen on phones).
// A real person is one tap away on WhatsApp from the panel header.
const GREETED = 'fn_coach_greeted'

export default function CoachLauncher({ hidden }) {
  const { t, country } = useLocale()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [greet, setGreet] = useState(false)
  const onCoachPage = pathname === '/coach'

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    let seen = true
    try { seen = !!sessionStorage.getItem(GREETED) } catch { /* private mode */ }
    if (seen || onCoachPage) return
    const id = setTimeout(() => setGreet(true), 6000)
    return () => clearTimeout(id)
  }, [onCoachPage])
  const dismissGreet = () => { setGreet(false); try { sessionStorage.setItem(GREETED, '1') } catch { /* private mode */ } }
  const toggle = () => { dismissGreet(); setOpen(o => !o) }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('coach-open')
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('coach-open') }
  }, [open])

  if (onCoachPage) return null
  return (
    <>
      <div className={`coach-fab-wrap${hidden && !open ? ' is-hidden' : ''}`}>
        {greet && !open && (
          <div className="coach-greet" role="status">
            <button type="button" className="coach-greet-x" onClick={dismissGreet} aria-label={t('Close')}><X size={14} /></button>
            <button type="button" className="coach-greet-body" onClick={toggle}>
              <b>{t('Not sure what you need?')}</b>
              <span>{t('I’ll work out your calories and build your stack in six taps.')}</span>
            </button>
          </div>
        )}
        <button type="button" className={`fab coach-fab${open ? ' is-open' : ''}`} onClick={toggle}
          aria-expanded={open} aria-label={open ? t('Close the Coach') : t('Ask the Coach')}>
          <span className="coach-fab-plate">{open ? <X size={22} /> : <CategoryIcon id="coach" size={24} />}</span>
          <span className="fab-label">{t('Ask the Coach')}</span>
        </button>
      </div>

      {open && createPortal(
        <section className="coach-panel" role="dialog" aria-modal="false" aria-label={t('Coach')}>
          <header className="coach-panel-head">
            <span className="coach-avatar sm" aria-hidden="true"><CategoryIcon id="coach" size={20} /></span>
            <div>
              <b>{t('First Nutrition Coach')}</b>
              <small><i /> {t('Online · instant answers')}</small>
            </div>
            <a className="icon-btn" href={waUrl(t('Hi First Nutrition! I need help choosing supplements.'), country)} target="_blank" rel="noopener noreferrer"
              aria-label={t('Talk to a person on WhatsApp')} title={t('Talk to a person on WhatsApp')}><WhatsAppIcon size={18} /></a>
            <Link className="icon-btn hide-sm" to="/coach" aria-label={t('Open full screen')} title={t('Open full screen')}><Maximize2 size={17} /></Link>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t('Close the Coach')}><X size={20} /></button>
          </header>
          <CoachChat compact />
        </section>,
        document.body,
      )}
    </>
  )
}
