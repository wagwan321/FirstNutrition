import CategoryIcon from '../components/CategoryIcon.jsx'
import CoachHub from '../components/CoachHub.jsx'
import { useLocale } from '../i18n.jsx'

// Full-page Coach: the chat and the Today food diary (same as the chat bubble's panel).
export default function Coach() {
  const { t } = useLocale()
  return (
    <section className="section coach">
      <div className="container coach-wrap">
        <header className="coach-head">
          <span className="coach-avatar" aria-hidden="true"><CategoryIcon id="coach" size={30} /></span>
          <div>
            <h1 className="section-title">{t('Coach')}</h1>
            <p>{t('Your plan, your stack and your food diary: type what you eat or snap a photo, and watch your day add up.')}</p>
          </div>
        </header>
        <CoachHub />
      </div>
    </section>
  )
}
