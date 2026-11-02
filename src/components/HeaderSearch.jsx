import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { PRODUCTS } from '../data/catalog.js'
import { searchProducts } from '../utils/search.js'
import { useLocale } from '../i18n.jsx'

const POPULAR = ['Whey', 'Creatine', 'C4', 'Isolate', 'Mass Gainer', 'BCAA']

// Inline header search with a live results dropdown.
export default function HeaderSearch({ className = '', autoFocus = false, onDone }) {
  const { t, price } = useLocale()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  const results = useMemo(() => searchProducts(PRODUCTS, q, 6), [q])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() } }
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey) }
  }, [open])

  const finish = () => { setOpen(false); setQ(''); onDone?.() }
  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
    finish()
  }

  return (
    <div className={`hsearch${open ? ' open' : ''} ${className}`} ref={boxRef}>
      <form onSubmit={submit} role="search">
        <Search size={18} aria-hidden="true" />
        <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={t('Search proteins, brands, flavors…')} aria-label={t('Search products')} />
        {q && (
          <button type="button" className="hsearch-clear" onClick={() => { setQ(''); inputRef.current?.focus() }}
            aria-label={t('Clear search')}><X size={15} /></button>
        )}
      </form>

      {open && (
        <div className="hsearch-panel">
          {!q.trim() ? (
            <div className="hsearch-popular">
              <span>{t('Popular searches')}</span>
              <div>
                {POPULAR.map(term => (
                  <button type="button" key={term} className="chip" onClick={() => setQ(term)}>{term}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {results.length === 0 && <p className="hsearch-empty">{t('No products match “{q}”.', { q })}</p>}
              {results.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="hsearch-hit" onClick={finish}>
                  <span className="hsearch-img"><img src={p.img} alt="" /></span>
                  <span className="hsearch-txt"><small>{p.brand}</small><b>{p.name}</b></span>
                  <em>{price(p.price)}</em>
                </Link>
              ))}
              {results.length > 0 && (
                <button type="button" className="hsearch-all" onClick={submit}>
                  {t('See all results for “{q}”', { q: q.trim() })} <ArrowRight size={15} className="flip-rtl" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
