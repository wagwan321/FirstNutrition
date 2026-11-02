import { useEffect, useState } from 'react'
import { X, Share } from 'lucide-react'
import { useLocale } from '../i18n.jsx'

// "Get the app" card on phones: the site installs to the home screen and works
// offline. Android/Chrome get a real Install button; iPhone gets the two-tap
// Share > Add to Home Screen hint. Dismissed for two weeks at a time.
const KEY = 'fn_install_dismissed'
const SNOOZE = 14 * 864e5

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
const snoozed = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < SNOOZE } catch { return true } }

export default function InstallPrompt() {
  const { t } = useLocale()
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (standalone() || snoozed() || !window.matchMedia('(max-width: 760px)').matches) return
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    // give the visitor a moment with the shop before asking
    const id = setTimeout(() => setShow(true), 15000)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); clearTimeout(id) }
  }, [])

  const dismiss = () => { setShow(false); try { localStorage.setItem(KEY, String(Date.now())) } catch { /* private mode */ } }
  const install = async () => {
    deferred.prompt()
    await deferred.userChoice.catch(() => null)
    setDeferred(null)
    dismiss()
  }

  if (!show || (!deferred && !isIos())) return null
  return (
    <div className="install" role="dialog" aria-label={t('Get the First Nutrition app')}>
      <img src="/pwa-192.png" alt="" width="48" height="48" />
      <div className="install-text">
        <b>{t('Get the First Nutrition app')}</b>
        {deferred
          ? <small>{t('One tap from your home screen, and it works offline.')}</small>
          : <small>{t('Tap')} <Share size={14} aria-label={t('Share')} /> {t('then “Add to Home Screen”.')}</small>}
      </div>
      {deferred && <button type="button" className="btn btn-primary" onClick={install}>{t('Install')}</button>}
      <button type="button" className="install-x" onClick={dismiss} aria-label={t('Not now')}><X size={18} /></button>
    </div>
  )
}
