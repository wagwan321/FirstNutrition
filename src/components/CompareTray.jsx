import { Link, useLocation } from 'react-router-dom'
import { X, Scale } from 'lucide-react'
import { useCompare, COMPARE_MAX } from '../context/CompareContext.jsx'
import { productById } from '../data/catalog.js'
import { useLocale } from '../i18n.jsx'

// Floating tray with the products picked for comparison; hidden on the
// Compare page itself.
export default function CompareTray() {
  const { ids, remove, clear } = useCompare()
  const { t } = useLocale()
  const { pathname } = useLocation()
  if (!ids.length || pathname === '/compare') return null

  return (
    <div className="ctray" role="region" aria-label={t('Compare')}>
      <ul className="ctray-items">
        {ids.map(id => {
          const p = productById(id)
          return (
            <li key={id}>
              <img src={p.img} alt="" />
              <button type="button" onClick={() => remove(id)} aria-label={t('Remove {name}', { name: p.name })}><X size={12} /></button>
            </li>
          )
        })}
        {Array.from({ length: COMPARE_MAX - ids.length }, (_, i) => <li key={`e${i}`} className="empty" aria-hidden="true" />)}
      </ul>
      <Link to="/compare" className={`btn btn-primary ctray-go${ids.length < 2 ? ' is-off' : ''}`}
        aria-disabled={ids.length < 2} onClick={(e) => { if (ids.length < 2) e.preventDefault() }}>
        <Scale size={17} /> {ids.length < 2 ? t('Pick one more') : t('Compare ({n})', { n: ids.length })}
      </Link>
      <button type="button" className="ctray-clear" onClick={clear}>{t('Clear')}</button>
    </div>
  )
}
