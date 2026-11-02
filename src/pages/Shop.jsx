import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, SlidersHorizontal, ChevronDown, Check, LayoutGrid, SearchX, RotateCcw, ArrowDownUp,
} from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import Reveal, { RevealText } from '../components/Reveal.jsx'
import { PRODUCTS, CATEGORIES, BRAND_NAMES, GOALS, convert } from '../data/catalog.js'
import { matchesQuery } from '../utils/search.js'
import { useLocale } from '../i18n.jsx'

// cards in the 3-column grid enter from the left / bottom / right by column
const COLUMN_VARIANTS = ['left', 'up', 'right']

const TAGS = [
  { id: 'best', label: 'Best sellers', test: p => p.bestseller },
  { id: 'new', label: 'New arrivals', test: p => p.isNew },
]

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'name', label: 'Name: A–Z' },
]

// Apply every active filter except the one named in `skip` — used both for the
// results and for the live counts next to each category / brand option.
function applyFilters(f, skip) {
  const goal = GOALS.find(g => g.id === f.goal)
  return PRODUCTS.filter(p =>
    (skip === 'cat' || f.cat === 'all' || p.category === f.cat) &&
    (skip === 'brand' || !f.brands.length || f.brands.includes(p.brand)) &&
    (!goal || goal.cats.includes(p.category)) &&
    (!f.q || matchesQuery(p, f.q)) &&
    f.tags.every(id => TAGS.find(t => t.id === id)?.test(p)) &&
    f.local(p.price) >= f.min && f.local(p.price) <= f.max,
  )
}

export default function Shop() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [drawer, setDrawer] = useState(false)
  const { t, country, format } = useLocale()

  // price bounds in the local currency
  const local = (jod) => convert(jod, country)
  const bounds = useMemo(() => {
    const prices = PRODUCTS.map(p => convert(p.price, country))
    const step = country === 'jo' ? 5 : 10
    return { min: Math.floor(Math.min(...prices) / step) * step, max: Math.ceil(Math.max(...prices) / step) * step, step }
  }, [country])

  // ---- filter state lives in the URL so results are shareable ----
  const f = {
    cat: CATEGORIES.some(c => c.id === category) ? category : 'all',
    q: params.get('q') || '',
    brands: params.getAll('brand').filter(b => BRAND_NAMES.includes(b)),
    tags: params.getAll('tag').filter(id => TAGS.some(x => x.id === id)),
    goal: GOALS.some(g => g.id === params.get('goal')) ? params.get('goal') : '',
    min: Math.max(bounds.min, Number(params.get('min')) || bounds.min),
    max: Math.min(bounds.max, Number(params.get('max')) || bounds.max),
    sort: params.get('sort') || 'featured',
    local,
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
    min > bounds.min ? n.set('min', min) : n.delete('min')
    max < bounds.max ? n.set('max', max) : n.delete('max')
  })
  const goCategory = (id) => navigate({
    pathname: id === 'all' ? '/shop' : `/shop/${id}`,
    search: params.toString() ? `?${params}` : '',
  })
  const clearAll = () => navigate('/shop', { replace: true })

  // Price filters are per-currency: drop them when the country changes.
  const firstCountry = useRef(country)
  useEffect(() => {
    if (firstCountry.current === country) return
    firstCountry.current = country
    update(n => { n.delete('min'); n.delete('max') })
  }, [country]) // eslint-disable-line react-hooks/exhaustive-deps

  // Local text box so typing stays snappy; synced to the URL after a pause.
  // `committed` tells our own debounced writes apart from outside changes
  // (header search, chip removal, "clear all"), which overwrite the box.
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
    const id = setTimeout(() => { committed.current = q; setOne('q', q) }, 220)
    return () => clearTimeout(id)
  }, [qInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // lock page scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawer)
    return () => document.body.classList.remove('no-scroll')
  }, [drawer])

  const key = params.toString() + f.cat + country
  const products = useMemo(() => {
    const list = applyFilters(f)
    if (f.sort === 'price-low') list.sort((a, b) => a.price - b.price)
    if (f.sort === 'price-high') list.sort((a, b) => b.price - a.price)
    if (f.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    if (f.sort === 'featured') list.sort((a, b) => (b.bestseller - a.bestseller))
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
    return Object.fromEntries(BRAND_NAMES.map(b => [b, list.filter(p => p.brand === b).length]))
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCat = CATEGORIES.find(c => c.id === f.cat)
  const activeGoal = GOALS.find(g => g.id === f.goal)
  const title = activeCat ? t(activeCat.name) : activeGoal ? t(activeGoal.name) : t('All products')
  const priceActive = f.min > bounds.min || f.max < bounds.max

  const chips = [
    ...(activeCat ? [{ label: t(activeCat.name), clear: () => goCategory('all') }] : []),
    ...(activeGoal ? [{ label: t(activeGoal.name), clear: () => setOne('goal', '') }] : []),
    ...(f.q ? [{ label: `“${f.q}”`, clear: () => { setQInput(''); setOne('q', '') } }] : []),
    ...f.brands.map(b => ({ label: b, clear: () => toggleMulti('brand', b) })),
    ...f.tags.map(id => ({ label: t(TAGS.find(x => x.id === id).label), clear: () => toggleMulti('tag', id) })),
    ...(priceActive ? [{ label: `${format(f.min)} – ${format(f.max)}`, clear: () => setPrice(bounds.min, bounds.max) }] : []),
  ]

  const pct = (v) => ((v - bounds.min) / (bounds.max - bounds.min)) * 100

  return (
    <>
      <section className="page-head">
        <div className="container">
          <nav className="crumbs" aria-label={t('Breadcrumb')}>
            <Link to="/">{t('Home')}</Link><span>/</span>
            {activeCat ? <><Link to="/shop">{t('Shop')}</Link><span>/</span><b>{t(activeCat.name)}</b></> : <b>{t('Shop')}</b>}
          </nav>
          <RevealText as="h1" key={title} text={title} delay={100} />
          <p>{activeCat ? t(activeCat.blurb) : t('Authentic products from the world’s top sports nutrition brands.')}</p>
        </div>
      </section>

      <section className="section shop-section">
        <div className="container">
          {/* TOOLBAR */}
          <div className="shop-toolbar">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input value={qInput} onChange={e => setQInput(e.target.value)}
                placeholder={t('Search by name, brand or flavor…')} aria-label={t('Search products')} />
              {qInput && (
                <button type="button" className="clear" onClick={() => { setQInput(''); setOne('q', '') }} aria-label={t('Clear search')}>
                  <X size={16} />
                </button>
              )}
            </label>
            <button type="button" className="btn btn-ghost filters-toggle" onClick={() => setDrawer(true)}>
              <SlidersHorizontal size={17} /> {t('Filters')}
              {chips.length > 0 && <span className="pill-count">{chips.length}</span>}
            </button>
            <label className="select">
              <span className="sr-only">{t('Sort products')}</span>
              <ArrowDownUp size={16} className="select-ico" aria-hidden="true" />
              <select value={f.sort} onChange={e => setOne('sort', e.target.value === 'featured' ? '' : e.target.value)}>
                {SORTS.map(s => <option key={s.id} value={s.id}>{t(s.label)}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>

          {/* CATEGORY PILLS */}
          <div className="cat-pills" role="tablist" aria-label={t('Categories')}>
            <button role="tab" aria-selected={f.cat === 'all'}
              className={`cat-pill${f.cat === 'all' ? ' active' : ''}`} onClick={() => goCategory('all')}>
              <LayoutGrid size={16} /> {t('All')} <em>{catCounts.all}</em>
            </button>
            {CATEGORIES.map(c => (
              <button key={c.id} role="tab" aria-selected={f.cat === c.id}
                className={`cat-pill${f.cat === c.id ? ' active' : ''}${catCounts[c.id] ? '' : ' empty'}`}
                onClick={() => goCategory(c.id)}>
                <c.icon size={16} /> {t(c.name)} <em>{catCounts[c.id]}</em>
              </button>
            ))}
          </div>

          <div className="shop-layout">
            {/* FILTER SIDEBAR / MOBILE DRAWER */}
            <div className={`filters-scrim${drawer ? ' open' : ''}`} onClick={() => setDrawer(false)} />
            <aside className={`filters${drawer ? ' open' : ''}`} aria-label={t('Product filters')}>
              <div className="filters-head">
                <h3><SlidersHorizontal size={18} /> {t('Filters')}</h3>
                <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label={t('Close filters')}>
                  <X size={18} />
                </button>
              </div>

              <div className="filters-body">
                <div className="filter-group">
                  <h4>{t('Goal')}</h4>
                  <div className="goal-chips">
                    {GOALS.map(g => (
                      <button type="button" key={g.id} className={`chip${f.goal === g.id ? ' active' : ''}`}
                        aria-pressed={f.goal === g.id} onClick={() => setOne('goal', f.goal === g.id ? '' : g.id)}>
                        {t(g.name)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <h4>{t('Brand')}</h4>
                  <div className="check-list-box">
                    {BRAND_NAMES.map(b => {
                      const on = f.brands.includes(b)
                      if (!brandCounts[b] && !on) return null
                      return (
                        <label key={b} className={`check${on ? ' on' : ''}`}>
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
                  <h4>{t('Price')} <span className="text-muted">{format(f.min)} – {format(f.max)}</span></h4>
                  <div className="range">
                    <div className="range-track">
                      <span style={{ insetInlineStart: `${pct(f.min)}%`, insetInlineEnd: `${100 - pct(f.max)}%` }} />
                    </div>
                    <input type="range" min={bounds.min} max={bounds.max} step="1" value={f.min}
                      onChange={e => setPrice(Math.min(Number(e.target.value), f.max - bounds.step), f.max)}
                      aria-label={t('Minimum price')} />
                    <input type="range" min={bounds.min} max={bounds.max} step="1" value={f.max}
                      onChange={e => setPrice(f.min, Math.max(Number(e.target.value), f.min + bounds.step))}
                      aria-label={t('Maximum price')} />
                  </div>
                  <div className="range-labels"><span>{format(bounds.min)}</span><span>{format(bounds.max)}</span></div>
                </div>

                <div className="filter-group">
                  <h4>{t('Highlights')}</h4>
                  {TAGS.map(tag => (
                    <label key={tag.id} className="switch-row">
                      <span>{t(tag.label)}</span>
                      <input type="checkbox" className="switch" checked={f.tags.includes(tag.id)}
                        onChange={() => toggleMulti('tag', tag.id)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="filters-foot">
                <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={!chips.length}>
                  <RotateCcw size={16} /> {t('Reset')}
                </button>
                <button type="button" className="btn btn-primary drawer-only" onClick={() => setDrawer(false)}>
                  {t('Show {n} products', { n: products.length })}
                </button>
              </div>
            </aside>

            {/* RESULTS */}
            <div className="shop-results">
              <div className="results-bar">
                <span className="results-count">{t(products.length === 1 ? '{n} product' : '{n} products', { n: products.length })}</span>
                {chips.length > 0 && (
                  <div className="active-chips">
                    {chips.map(c => (
                      <button type="button" key={c.label} className="chip active" onClick={c.clear}
                        aria-label={t('Remove filter: {name}', { name: c.label })}>
                        {c.label} <X size={13} aria-hidden="true" />
                      </button>
                    ))}
                    <button type="button" className="link-btn" onClick={clearAll}>{t('Clear all')}</button>
                  </div>
                )}
              </div>

              {products.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-ico"><SearchX size={30} /></span>
                  <h3>{t('No products match')}</h3>
                  <p className="text-muted">{t('Try a different search, or loosen a filter or two.')}</p>
                  <button type="button" className="btn btn-primary" onClick={clearAll}>{t('Clear all filters')}</button>
                </div>
              ) : (
                <div className="grid product-grid shop-grid">
                  {products.map((p, i) => (
                    <Reveal key={p.id} variant={COLUMN_VARIANTS[i % 3]} delay={(i % 3) * 80}>
                      <ProductCard product={p} />
                    </Reveal>
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
