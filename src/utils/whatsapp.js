// ---------------------------------------------------------------------------
// WhatsApp order helpers.
// Builds a plain-text order message and opens it in WhatsApp (app on mobile,
// WhatsApp Web / desktop app on desktop) via the official wa.me scheme.
// ---------------------------------------------------------------------------
import { SHOP } from '../config.js'
import { money } from '../data/catalog.js'

// Build the wa.me URL. The full text is URL-encoded with encodeURIComponent,
// so Arabic area names, the "×" sign, emoji and newlines all survive intact.
export function waUrl(text) {
  return `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(text)}`
}

// Open WhatsApp in a new tab/app. Returns the URL so callers can also expose
// it as a plain link (a fallback that popup blockers can't stop).
export function openWhatsApp(text) {
  const url = waUrl(text)
  window.open(url, '_blank', 'noopener,noreferrer')
  return url
}

// WhatsApp renders *asterisks* as bold and _underscores_ as italic.
// Shared "who + where" block appended to every order.
function customerBlock(customer) {
  const lines = ['*Delivery Details*']
  lines.push(`Name: ${customer.name}`)
  lines.push(`Phone: ${customer.phone}`)
  if (customer.area) lines.push(`Area: ${customer.area}`)
  if (customer.address) lines.push(`Address: ${customer.address}`)
  if (customer.email) lines.push(`Email: ${customer.email}`)
  if (customer.notes) lines.push(`Notes: ${customer.notes}`)
  return lines
}

// Full-cart order (from the checkout page).
export function buildOrderMessage({ items, subtotal, customer }) {
  const lines = [
    `*New Order · ${SHOP.name}*`,
    '',
    '*Items*',
  ]

  items.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name}`)
    if (i.flavor) lines.push(`    Flavour: ${i.flavor}`)
    lines.push(`    Qty: ${i.qty} × ${money(i.price)} = ${money(i.price * i.qty)}`)
  })

  lines.push('')
  lines.push(`*Subtotal:* ${money(subtotal)}`)
  lines.push('*Payment:* Cash on Delivery')
  lines.push('_Delivery fee confirmed by the store._')
  lines.push('')
  lines.push(...customerBlock(customer))

  return lines.join('\n')
}

// Single-product order (from a product page).
export function buildSingleItemMessage({ product, flavor, qty, customer }) {
  const lineTotal = product.price * qty
  const lines = [
    `*New Order · ${SHOP.name}*`,
    '',
    '*Item*',
    product.name,
  ]
  if (flavor) lines.push(`Flavour: ${flavor}`)
  lines.push(`Qty: ${qty} × ${money(product.price)} = ${money(lineTotal)}`)
  lines.push('')
  lines.push('*Payment:* Cash on Delivery')
  lines.push('_Delivery fee confirmed by the store._')
  lines.push('')
  lines.push(...customerBlock(customer))

  return lines.join('\n')
}
