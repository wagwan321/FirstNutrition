import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLocale } from '../i18n.jsx'

export default function NotFound() {
  const { t } = useLocale()
  return (
    <div className="container section center not-found">
      <h1>404</h1>
      <h2>{t('Page not found')}</h2>
      <p className="text-muted">{t('Looks like this page skipped leg day. Let’s get you back on track.')}</p>
      <Link to="/" className="btn btn-primary"><ArrowLeft size={18} className="flip-rtl" /> {t('Back to home')}</Link>
    </div>
  )
}
