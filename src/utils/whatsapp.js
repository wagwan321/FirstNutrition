// ---------------------------------------------------------------------------
// WhatsApp order helpers: build a plain-text order and open it in WhatsApp via
// the official wa.me scheme, using the selected country's store number.
// Order messages stay in English (they're read by store staff).
// ---------------------------------------------------------------------------
import { COUNTRIES, SHOP } from '../config.js'
import { convert, formatPrice } from '../data/catalog.js'
import { variantLabel } from '../context/CartContext.jsx'

export function waUrl(text, country = 'jo') {
  const number = (COUNTRIES[country] || COUNTRIES.jo).whatsapp
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

// Open in a new tab/app; returns the URL for a fallback link.
export function openWhatsApp(text, country) {
  const url = waUrl(text, country)
  window.open(url, '_blank', 'noopener,noreferrer')
  return url
}

const money = (jod, country) => formatPrice(convert(jod, country), country, 'en')

// WhatsApp renders *asterisks* as bold and _underscores_ as italic.
function customerBlock(customer) {
  const lines = ['*Delivery Details*', `Name: ${customer.name}`, `Phone: ${customer.phone}`]
  if (customer.area) lines.push(`Area: ${customer.area}`)
  if (customer.address) lines.push(`Address: ${customer.address}`)
  if (customer.email) lines.push(`Email: ${customer.email}`)
  if (customer.notes) lines.push(`Notes: ${customer.notes}`)
  return lines
}

const FOOTER = ['', '*Payment:* Cash on Delivery', '_Delivery fee confirmed by the store._', '']

// Full cart (checkout page). `lines` come from useCart().lines
export function buildOrderMessage({ lines, subtotal, customer, country }) {
  const out = [`*New Order · ${SHOP.name} ${COUNTRIES[country].name}*`, '', '*Items*']
  lines.forEach((l, i) => {
    out.push(`${i + 1}. ${l.product.name} (${l.product.brand})`)
    const opts = variantLabel(l.variant)
    if (opts) out.push(`    ${opts}`)
    out.push(`    Qty: ${l.qty} × ${money(l.unit, country)} = ${money(l.unit * l.qty, country)}`)
  })
  out.push('', `*Subtotal:* ${money(subtotal, country)}`, ...FOOTER, ...customerBlock(customer))
  return out.join('\n')
}

// Single product (product page "Order on WhatsApp").
export function buildSingleItemMessage({ product, variant, qty, customer, country }) {
  const unit = variant?.price ?? product.price
  const out = [`*New Order · ${SHOP.name} ${COUNTRIES[country].name}*`, '', '*Item*', `${product.name} (${product.brand})`]
  const opts = variantLabel(variant)
  if (opts) out.push(opts)
  out.push(`Qty: ${qty} × ${money(unit, country)} = ${money(unit * qty, country)}`, ...FOOTER, ...customerBlock(customer))
  return out.join('\n')
}
