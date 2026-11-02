import CategoryIcon from '../components/CategoryIcon.jsx'
import CoachChat from '../components/CoachChat.jsx'
import { useLocale } from '../i18n.jsx'

// Full-page Coach (the same conversation as the chat bubble's panel).
export default function Coach() {
  const { t } = useLocale()
  return (
    <section className="section coach">
      <div className="container coach-wrap">
        <header className="coach-head">
          <span className="coach-avatar" aria-hidden="true"><CategoryIcon id="coach" size={30} /></span>
          <div>
            <h1 className="section-title">{t('Coach')}</h1>
            <p>{t('Six quick taps: your daily calories and macros, and a stack from our shelves that fits your budget. Then ask me anything.')}</p>
          </div>
        </header>
        <CoachChat />
      </div>
    </section>
  )
}
