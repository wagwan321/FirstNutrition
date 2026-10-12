import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { PRODUCTS, CATEGORIES, money } from '../data/catalog.js'
import { matchesQuery } from '../utils/search.js'

const POPULAR = ['Whey', 'Creatine', 'C4', 'BCAA', 'Mass Gainer', 'Protein Bar']

// Full-screen quick search with live product results.
export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setQ('')
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [open, onClose])

  const results = useMemo(
    () => (q.trim() ? PRODUCTS.filter(p => matchesQuery(p, q)).slice(0, 6) : []),
    [q],
  )

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
    onClose()
  }

  return (
    <div className={`search-overlay${open ? ' open' : ''}`} onClick={onClose} aria-hidden={!open}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search products"
           onClick={e => e.stopPropagation()}>
        <form className="search-bar" onSubmit={submit}>
          <Search size={22} aria-hidden="true" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search proteins, brands, flavors…" aria-label="Search" tabIndex={open ? 0 : -1} />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search" tabIndex={open ? 0 : -1}>
            <X size={20} />
          </button>
        </form>

        {!q.trim() && (
          <div className="search-popular">
            <span>Popular</span>
            {POPULAR.map(term => (
              <button type="button" key={term} className="chip" onClick={() => setQ(term)} tabIndex={open ? 0 : -1}>{term}</button>
            ))}
          </div>
        )}

        {q.trim() && (
          <div className="search-results">
            {results.length === 0 && <p className="text-muted">No products match “{q}”.</p>}
            {results.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="search-hit" onClick={onClose}>
                <img src={p.img} alt="" />
                <span>
                  <small>{p.brand} · {CATEGORIES.find(c => c.id === p.category)?.name}</small>
                  <b>{p.name}</b>
                </span>
                <em>{money(p.price)}</em>
              </Link>
            ))}
            {results.length > 0 && (
              <button type="button" className="search-all" onClick={submit}>
                See all results for “{q.trim()}” <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
