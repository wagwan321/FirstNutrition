// ---------------------------------------------------------------------------
// Goal stacks for the homepage "Loaded Bar". Each goal loads three real
// catalog products onto the bar; `variant` picks the size/flavour the packshot
// shows, so the ticket price is the price of the tub in the picture.
// Packshots are made from the store's own catalog photos (see assets/plates).
// ---------------------------------------------------------------------------
import { productById } from './catalog.js'
import whey from '../assets/hero/tub-whey.webp'
import creatine from '../assets/hero/tub-creatine.webp'
import xtend from '../assets/hero/tub-xtend.webp'
import carnivor from '../assets/hero/stack-450.webp'
import karbolyn from '../assets/hero/stack-484.webp'
import iso100 from '../assets/hero/stack-471.webp'
import carnitine from '../assets/hero/stack-494.webp'
import lipo6 from '../assets/hero/stack-489.webp'
import c4 from '../assets/hero/stack-443.webp'

// Short names for the paper tickets
const LABELS = { 466: 'Gold Standard 100% Whey', 511: 'Platinum Creatine', 565: 'Xtend BCAA', 450: 'Carnivor Mass', 484: 'Karbolyn Fuel', 471: 'ISO 100', 494: 'L-Carnitine 3000', 489: 'Lipo-6 Black', 443: 'C4 Original' }
const SHOTS = { 466: whey, 511: creatine, 565: xtend, 450: carnivor, 484: karbolyn, 471: iso100, 494: carnitine, 489: lipo6, 443: c4 }

// [productId, variantId]
const RAW = [
  { id: 'muscle',  name: 'Build muscle', items: [[466, 637], [511, 7885], [565, 926]] },
  { id: 'bulk',    name: 'Bulk',         items: [[450, 600], [484, 716], [511, 7885]] },
  { id: 'cut',     name: 'Cut',          items: [[471, null], [494, 7650], [489, 489]] },
  { id: 'perform', name: 'Perform',      items: [[443, 443], [565, 926], [511, 7885]] },
]

function resolve([pid, vid]) {
  const product = productById(pid)
  // ISO 100 shot is the 1.3 lb Fudge Brownie tub
  const variant = vid
    ? product.variants.find(v => v.id === vid)
    : product.variants.find(v => v.size === '1.3 lbs.' && /Fudge/.test(v.flavor)) || product.variants.find(v => v.size === '1.3 lbs.')
  return { product, variant, unit: variant?.price ?? product.price, img: SHOTS[pid], label: LABELS[pid] }
}

export const GOAL_STACKS = RAW.map(g => {
  const items = g.items.map(resolve)
  return { ...g, items, total: items.reduce((s, i) => s + i.unit, 0) }
})
