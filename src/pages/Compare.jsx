import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Plus, ShoppingBag, ArrowRight, Scale } from 'lucide-react'
import { useCompare } from '../context/CompareContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useLocale } from '../i18n.jsx'
import { productById, categoryById, PRODUCTS } from '../data/catalog.js'
import { servingFacts, servingsPer, costPerServing, costPer25gProtein } from '../utils/nutrition.js'
import { searchProducts } from '../utils/search.js'

// Side by side, without sideways scrolling: each row is a label line with the
// products' values under it in equal columns, so three fit on a phone.
export default function Compare() {
  const { ids, remove, toggle } = useCompare()
  const { t, price } = useLocale()
  const { addItem } = useCart()
  const products = ids.map(productById).filter(Boolean)
  // the size each column is compared at (defaults to the first variant)
  const [sizes, setSizes] = useState({})
  const variantOf = (p) => p.variants.find(v => v.id === sizes[p.id]) || p.variants[0]

  const cols = products.map(p => {
    const v = variantOf(p)
    return {
      p, v,
      facts: servingFacts(p),
      servings: servingsPer(p, v),
      perServing: costPerServing(p, v),
      per25: costPer25gProtein(p, v),
      unit: v?.price ?? p.price,
    }
  })
  // the cheapest 25 g of protein gets the "best value" mark
  const best = cols.filter(c => c.per25).sort((a, b) => a.per25.value - b.per25.value)[0]
  const approx = (x) => (x?.approx ? '≈ ' : '')
  const dash = <span className="cmp-na">—</span>

  const rows = [
    { label: t('Price'), cell: c => price(c.unit) },
    { label: t('Category'), cell: c => t(categoryById(c.p.category)?.name || '') },
    { label: t('Servings per tub'), cell: c => (c.servings ? `${approx(c.servings)}${c.servings.n}` : dash) },
    { label: t('Price per serving'), cell: c => (c.perServing ? `${approx(c.perServing)}${price(c.perServing.value, { decimals: true })}` : dash) },
    { label: t('Price per 25 g protein'), cell: c => (c.per25 ? <>{approx(c.per25)}{price(c.per25.value, { decimals: true })}{c === best && cols.length > 1 && <em className="cmp-best">{t('Best value')}</em>}</> : dash) },
    { label: t('Protein per serving'), cell: c => (c.facts.protein != null ? `${c.facts.protein} g` : dash) },
    { label: t('Calories per serving'), cell: c => (c.facts.calories != null ? c.facts.calories : dash) },
    { label: t('Carbs per serving'), cell: c => (c.facts.carbs != null ? `${c.facts.carbs} g` : dash) },
    { label: t('Fat per serving'), cell: c => (c.facts.fat != null ? `${c.facts.fat} g` : dash) },
    { label: t('Sugar per serving'), cell: c => (c.facts.sugar != null ? `${c.facts.sugar} g` : dash) },
    { label: t('Creatine'), cell: c => (c.facts.creatine ? `${c.facts.creatine} g` : dash), only: cols.some(c => c.facts.creatine) },
    { label: t('Caffeine'), cell: c => (c.facts.caffeine ? `${c.facts.caffeine} mg` : dash), only: cols.some(c => c.facts.caffeine) },
    { label: t('Flavours'), cell: c => (c.p.options.flavor?.length || dash) },
  ].filter(r => r.only !== false)

  return (
    <section className="section cmp">
      <div className="container">
        <h1 className="section-title">{t('Compare')}</h1>
        <p className="section-sub">{t('Prices are per tub; servings and per-serving costs come from each label (≈ means estimated from the tub weight).')}</p>

        {products.length === 0 ? (
          <div className="cmp-empty">
            <Scale size={34} />
            <p>{t('Nothing to compare yet. Tap the scale on any product to add it.')}</p>
            <Link to="/shop" className="btn btn-primary">{t('Browse products')} <ArrowRight size={17} className="flip-rtl" /></Link>
          </div>
        ) : (
          <div className="cmp-table" style={{ '--n': Math.max(2, cols.length) }}>
            <div className="cmp-heads">
              {cols.map(c => (
                <div className="cmp-head" key={c.p.id}>
                  <button type="button" className="cmp-x" onClick={() => remove(c.p.id)} aria-label={t('Remove {name}', { name: c.p.name })}><X size={14} /></button>
                  <Link to={`/product/${c.p.id}`} className="cmp-img"><img src={c.v?.img || c.p.img} alt="" /></Link>
                  <small>{c.p.brand}</small>
                  <b><Link to={`/product/${c.p.id}`}>{c.p.name}</Link></b>
                  {c.p.options.size?.length > 1 && (
                    <select value={c.v?.id} aria-label={t('Size')}
                      onChange={(e) => setSizes(s => ({ ...s, [c.p.id]: Number(e.target.value) }))}>
                      {c.p.options.size.map(size => {
                        const v = c.p.variants.find(x => x.size === size)
                        return <option key={size} value={v.id}>{size}</option>
                      })}
                    </select>
                  )}
                  <button type="button" className="btn btn-primary cmp-add" onClick={() => addItem(c.p, c.v)}>
                    <ShoppingBag size={15} /> {t('Add')}
                  </button>
                </div>
              ))}
              {cols.length === 1 && <AddSlot exclude={ids} onPick={toggle} />}
            </div>

            {rows.map(r => (
              <div className="cmp-row" key={r.label}>
                <div className="cmp-label">{r.label}</div>
                <div className="cmp-vals">
                  {cols.map(c => <div key={c.p.id}>{r.cell(c)}</div>)}
                  {cols.length === 1 && <div />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Second column when only one product is picked: search for another.
function AddSlot({ exclude, onPick }) {
  const { t } = useLocale()
  const [q, setQ] = useState('')
  const results = q ? searchProducts(PRODUCTS, q, 5).filter(p => !exclude.includes(p.id)) : []
  return (
    <div className="cmp-head cmp-slot">
      <span className="cmp-slot-ico"><Plus size={20} /></span>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Add a product…')} aria-label={t('Add a product to compare')} />
      {results.length > 0 && (
        <ul>
          {results.map(p => (
            <li key={p.id}><button type="button" onClick={() => { onPick(p.id); setQ('') }}><img src={p.img} alt="" /> {p.name}</button></li>
          ))}
        </ul>
      )}
    </div>
  )
}
