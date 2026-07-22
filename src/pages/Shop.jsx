import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { PRODUCTS, CATEGORIES, BRANDS } from '../data/catalog.js'

export default function Shop() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [brand, setBrand] = useState('all')
  const [sort, setSort] = useState('featured')

  const activeCat = category || 'all'

  const products = useMemo(() => {
    let list = PRODUCTS.slice()
    if (activeCat !== 'all') list = list.filter(p => p.category === activeCat)
    if (brand !== 'all') list = list.filter(p => p.brand === brand)
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activeCat, brand, sort])

  const catName = activeCat === 'all'
    ? 'All Supplements'
    : CATEGORIES.find(c => c.id === activeCat)?.name

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Shop</span>
          <h1>{catName}</h1>
          <p>Browse {products.length} authentic products from the world's top sports nutrition brands.</p>
        </div>
      </section>

      <section className="section">
        <div className="container shop-layout">
          {/* FILTERS */}
          <aside className="filters">
            <div className="filter-group">
              <h4>Category</h4>
              <button className={`filter-btn ${activeCat === 'all' ? 'active' : ''}`}
                onClick={() => navigate('/shop')}>All Supplements</button>
              {CATEGORIES.map(c => (
                <button key={c.id}
                  className={`filter-btn ${activeCat === c.id ? 'active' : ''}`}
                  onClick={() => navigate(`/shop/${c.id}`)}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <h4>Brand</h4>
              <button className={`filter-btn ${brand === 'all' ? 'active' : ''}`}
                onClick={() => setBrand('all')}>All Brands</button>
              {BRANDS.map(b => (
                <button key={b}
                  className={`filter-btn ${brand === b ? 'active' : ''}`}
                  onClick={() => setBrand(b)}>{b}</button>
              ))}
            </div>
          </aside>

          {/* GRID */}
          <div>
            <div className="shop-head">
              <span className="text-muted">{products.length} products</span>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>
            {products.length === 0 ? (
              <p className="text-muted" style={{ padding: '40px 0' }}>No products match your filters.</p>
            ) : (
              <div className="grid product-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
