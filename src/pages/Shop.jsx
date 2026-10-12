import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, SlidersHorizontal, ChevronDown, Check, LayoutGrid, SearchX, RotateCcw, ArrowDownUp,
} from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { PRODUCTS, CATEGORIES, BRANDS } from '../data/catalog.js'
import { matchesQuery } from '../utils/search.js'

const PRICES = PRODUCTS.map(p => p.price)
const PRICE_MIN = Math.floor(Math.min(...PRICES) / 5) * 5
const PRICE_MAX = Math.ceil(Math.max(...PRICES) / 5) * 5

const HIGHLIGHTS = ['Best Seller', 'New']

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'best', label: 'Best sellers first' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'discount', label: 'Biggest discount' },
  { id: 'name', label: 'Name: A–Z' },
]

const discount = (p) => (p.oldPrice ? 1 - p.price / p.oldPrice : 0)

// Apply every active filter except the one named in `skip` — used both for the
// results and for the live counts next to each category / brand option.
function applyFilters(f, skip) {
  return PRODUCTS.filter(p =>
    (skip === 'cat' || f.cat === 'all' || p.category === f.cat) &&
    (skip === 'brand' || !f.brands.length || f.brands.includes(p.brand)) &&
    (!f.q || matchesQuery(p, f.q)) &&
    (!f.sale || p.oldPrice) &&
    (!f.tags.length || f.tags.includes(p.tag)) &&
    p.price >= f.min && p.price <= f.max,
  )
}

export default function Shop() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [drawer, setDrawer] = useState(false)

  // ---- filter state lives in the URL so results are shareable ----
  const f = {
    cat: category || 'all',
    q: params.get('q') || '',
    brands: params.getAll('brand').filter(b => BRANDS.includes(b)),
    tags: params.getAll('tag').filter(t => HIGHLIGHTS.includes(t)),
    sale: params.get('sale') === '1',
    min: Math.max(PRICE_MIN, Number(params.get('min')) || PRICE_MIN),
    max: Math.min(PRICE_MAX, Number(params.get('max')) || PRICE_MAX),
    sort: params.get('sort') || 'featured',
  }

  const update = (mutate) => setParams(prev => {
    const next = new URLSearchParams(prev)
    mutate(next)
    return next
  }, { replace: true })
  const setOne = (key, value) => update(n => (value ? n.set(key, value) : n.delete(key)))
  const toggleMulti = (key, value) => update(n => {
    const list = n.getAll(key)
    n.delete(key)
    const nextList = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
    nextList.forEach(v => n.append(key, v))
  })
  const setPrice = (min, max) => update(n => {
    min > PRICE_MIN ? n.set('min', min) : n.delete('min')
    max < PRICE_MAX ? n.set('max', max) : n.delete('max')
  })
  const goCategory = (id) => navigate({
    pathname: id === 'all' ? '/shop' : `/shop/${id}`,
    search: params.toString() ? `?${params}` : '',
  })
  const clearAll = () => navigate('/shop', { replace: true })

  // Local text box so typing stays snappy; synced to the URL after a pause.
  // `committed` tells our own debounced writes apart from outside changes
  // (navbar search, chip removal, "clear all"), which overwrite the box.
  const [qInput, setQInput] = useState(f.q)
  const committed = useRef(f.q)
  useEffect(() => {
    if (f.q === committed.current) return
    committed.current = f.q
    setQInput(f.q)
  }, [f.q])
  useEffect(() => {
    const q = qInput.trim()
    if (q === committed.current) return
    const t = setTimeout(() => { committed.current = q; setOne('q', q) }, 220)
    return () => clearTimeout(t)
  }, [qInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // lock page scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer)
    return () => document.body.classList.remove('no-scroll')
  }, [drawer])

  const key = params.toString() + f.cat
  const products = useMemo(() => {
    const list = applyFilters(f)
    if (f.sort === 'price-low') list.sort((a, b) => a.price - b.price)
    if (f.sort === 'price-high') list.sort((a, b) => b.price - a.price)
    if (f.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    if (f.sort === 'discount') list.sort((a, b) => discount(b) - discount(a))
    if (f.sort === 'best') list.sort((a, b) => (b.tag === 'Best Seller') - (a.tag === 'Best Seller'))
    return list
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const catCounts = useMemo(() => {
    const list = applyFilters(f, 'cat')
    const counts = { all: list.length }
    CATEGORIES.forEach(c => { counts[c.id] = list.filter(p => p.category === c.id).length })
    return counts
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const brandCounts = useMemo(() => {
    const list = applyFilters(f, 'brand')
    return Object.fromEntries(BRANDS.map(b => [b, list.filter(p => p.brand === b).length]))
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCat = CATEGORIES.find(c => c.id === f.cat)
  const title = activeCat ? activeCat.name : 'All Supplements'
  const priceActive = f.min > PRICE_MIN || f.max < PRICE_MAX

  const chips = [
    ...(activeCat ? [{ label: activeCat.name, clear: () => goCategory('all') }] : []),
    ...(f.q ? [{ label: `“${f.q}”`, clear: () => { setQInput(''); setOne('q', '') } }] : []),
    ...f.brands.map(b => ({ label: b, clear: () => toggleMulti('brand', b) })),
    ...f.tags.map(t => ({ label: t, clear: () => toggleMulti('tag', t) })),
    ...(f.sale ? [{ label: 'On sale', clear: () => setOne('sale', '') }] : []),
    ...(priceActive ? [{ label: `$${f.min} – $${f.max}`, clear: () => setPrice(PRICE_MIN, PRICE_MAX) }] : []),
  ]

  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  return (
    <>
      <section className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span>/</span>
            {activeCat ? <><Link to="/shop">Shop</Link><span>/</span><b>{activeCat.name}</b></> : <b>Shop</b>}
          </nav>
          <h1>{title}</h1>
          <p>{activeCat ? activeCat.blurb : 'Authentic products from the world’s top sports nutrition brands.'}</p>
        </div>
      </section>

      <section className="section shop-section">
        <div className="container">
          {/* TOOLBAR */}
          <div className="shop-toolbar">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input value={qInput} onChange={e => setQInput(e.target.value)}
                placeholder="Search by name, brand or flavor…" aria-label="Search products" />
              {qInput && (
                <button type="button" className="clear" onClick={() => { setQInput(''); setOne('q', '') }} aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </label>
            <button type="button" className="btn btn-ghost filters-toggle" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={17} /> Filters
              {chips.length > 0 && <span className="pill-count">{chips.length}</span>}
            </button>
            <label className="select">
              <span className="sr-only">Sort products</span>
              <ArrowDownUp size={16} className="select-ico" aria-hidden="true" />
              <select value={f.sort} onChange={e => setOne('sort', e.target.value === 'featured' ? '' : e.target.value)}>
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>

          {/* CATEGORY PILLS */}
          <div className="cat-pills" role="tablist" aria-label="Categories">
            <button role="tab" aria-selected={f.cat === 'all'}
              className={`cat-pill${f.cat === 'all' ? ' active' : ''}`} onClick={() => goCategory('all')}>
              <LayoutGrid size={16} /> All <em>{catCounts.all}</em>
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} role="tab" aria-selected={f.cat === c.id}
                className={`cat-pill${f.cat === c.id ? ' active' : ''}${catCounts[c.id] ? '' : ' empty'}`}
                onClick={() => goCategory(c.id)}>
                <c.icon size={16} /> {c.name} <em>{catCounts[c.id]}</em>
              </button>
            ))}
          </div>

          <div className="shop-layout">
            {/* FILTER SIDEBAR / MOBILE DRAWER */}
            <div className={`filters-scrim${drawer ? ' open' : ''}`} onClick={() => setDrawer(false)} />
            <aside className={`filters${drawer ? ' open' : ''}`} aria-label="Product filters">
              <div className="filters-head">
                <h3><SlidersHorizontal size={18} /> Filters</h3>
                <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters">
                  <X size={18} />
                </button>
              </div>

              <div className="filters-body">
                <div className="filter-group">
                  <h4>Brand</h4>
                  <div className="check-list-box">
                    {BRANDS.map(b => {
                      const on = f.brands.includes(b)
                      return (
                        <label key={b} className={`check${on ? ' on' : ''}${!brandCounts[b] && !on ? ' dim' : ''}`}>
                          <input type="checkbox" checked={on} onChange={() => toggleMulti('brand', b)} />
                          <span className="box" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
                          <span className="lbl">{b}</span>
                          <em>{brandCounts[b]}</em>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>Price <span className="text-muted">${f.min} – ${f.max}</span></h4>
                  <div className="range">
                    <div className="range-track">
                      <span style={{ left: `${pct(f.min)}%`, right: `${100 - pct(f.max)}%` }} />
                    </div>
                    <input type="range" min={PRICE_MIN} max={PRICE_MAX} step="1" value={f.min}
                      onChange={e => setPrice(Math.min(Number(e.target.value), f.max - 5), f.max)}
                      aria-label="Minimum price" />
                    <input type="range" min={PRICE_MIN} max={PRICE_MAX} step="1" value={f.max}
                      onChange={e => setPrice(f.min, Math.max(Number(e.target.value), f.min + 5))}
                      aria-label="Maximum price" />
                  </div>
                  <div className="range-labels"><span>${PRICE_MIN}</span><span>${PRICE_MAX}</span></div>
                </div>

                <div className="filter-group">
                  <h4>Highlights</h4>
                  <label className="switch-row">
                    <span>On sale</span>
                    <input type="checkbox" className="switch" checked={f.sale}
                      onChange={() => setOne('sale', f.sale ? '' : '1')} />
                  </label>
                  {HIGHLIGHTS.map(t => (
                    <label key={t} className="switch-row">
                      <span>{t === 'New' ? 'New arrivals' : 'Best sellers'}</span>
                      <input type="checkbox" className="switch" checked={f.tags.includes(t)}
                        onChange={() => toggleMulti('tag', t)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="filters-foot">
                <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={!chips.length}>
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="button" className="btn btn-primary drawer-only" onClick={() => setDrawer(false)}>
                  Show {products.length} product{products.length === 1 ? '' : 's'}
                </button>
              </div>
            </aside>

            {/* RESULTS */}
            <div className="shop-results">
              <div className="results-bar">
                <span className="results-count"><b>{products.length}</b> product{products.length === 1 ? '' : 's'}</span>
                {chips.length > 0 && (
                  <div className="active-chips">
                    {chips.map(c => (
                      <button type="button" key={c.label} className="chip active" onClick={c.clear}
                        aria-label={`Remove filter: ${c.label}`}>
                        {c.label} <X size={13} aria-hidden="true" />
                      </button>
                    ))}
                    <button type="button" className="link-btn" onClick={clearAll}>Clear all</button>
                  </div>
                )}
              </div>

              {products.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-ico"><SearchX size={30} /></span>
                  <h3>No supplements match</h3>
                  <p className="text-muted">Try a different search, or loosen a filter or two.</p>
                  <button type="button" className="btn btn-primary" onClick={clearAll}>Clear all filters</button>
                </div>
              ) : (
                <div className="grid product-grid shop-grid">
                  {products.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 70}><ProductCard product={p} /></Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
