// First Nutrition catalog.
// products.json / brands.json are generated from the store's own catalog
// (names, brands, variants, Jordan JOD prices, descriptions, photos in
// public/images/fn/). Prices are stored in JOD; other countries convert via
// COUNTRIES[code].rate in src/config.js.
import {
  Dumbbell, Weight, FlaskConical, Zap, Atom, Flame, HeartPulse, Cookie, Package, BadgePercent,
} from 'lucide-react'
import productsData from './products.json'
import brandsData from './brands.json'
import reelsData from './reels.json'
import { COUNTRIES } from '../config.js'

export const CATEGORIES = [
  { id: 'protein',     name: 'Protein',           icon: Dumbbell,     img: '/images/fn/categories/23.webp', blurb: 'Whey, isolate, casein & plant' },
  { id: 'gainers',     name: 'Weight Gainers',    icon: Weight,       img: '/images/fn/categories/29.webp', blurb: 'Mass gainers & carb fuel' },
  { id: 'creatine',    name: 'Creatine',          icon: FlaskConical, img: '/images/fn/categories/30.webp', blurb: 'Strength, power & recovery' },
  { id: 'preworkout',  name: 'Pre-Workout',       icon: Zap,          img: '/images/fn/categories/36.webp', blurb: 'Energy, focus & pump' },
  { id: 'aminos',      name: 'Amino Acids',       icon: Atom,         img: '/images/fn/categories/31.webp', blurb: 'BCAA, EAA & glutamine' },
  { id: 'weight',      name: 'Weight Management', icon: Flame,        img: '/images/fn/categories/37.webp', blurb: 'Burners, carnitine & CLA' },
  { id: 'wellness',    name: 'Health & Wellness', icon: HeartPulse,   img: '/images/fn/categories/43.webp', blurb: 'Omega-3, collagen & joints' },
  { id: 'snacks',      name: 'Snacks',            icon: Cookie,       img: '/images/fn/categories/38.webp', blurb: 'High-protein bars' },
  { id: 'accessories', name: 'Accessories',       icon: Package,      img: '/images/fn/categories/39.webp', blurb: 'Shakers, belts & wraps' },
  { id: 'bundles',     name: 'Offers & Bundles',  icon: BadgePercent, img: '/images/fn/categories/46.webp', blurb: 'Stacks at a better price' },
]

export const GOALS = [
  { id: 'muscle', name: 'Build Muscle', cats: ['protein', 'creatine', 'aminos'], img: '/images/gym.jpg',
    blurb: 'Protein, creatine and aminos to grow and repair.' },
  { id: 'gain', name: 'Gain Weight', cats: ['gainers'], img: '/images/hero.jpg',
    blurb: 'High-calorie gainers and carbs for hard gainers.' },
  { id: 'lose', name: 'Lose Weight', cats: ['weight'], img: '/images/athlete.jpg',
    blurb: 'Burners, carnitine and CLA to support your cut.' },
  { id: 'performance', name: 'Performance', cats: ['preworkout', 'aminos', 'creatine'], img: '/images/training.jpg',
    blurb: 'Pre-workouts and aminos for harder sessions.' },
]

export const PRODUCTS = productsData
export const REELS = reelsData

const byId = new Map(PRODUCTS.map(p => [p.id, p]))
export const productById = (id) => byId.get(Number(id))

// All partner brands (logo wall), and the ones that currently have products
// (filters), plus "First Nutrition" for house bundles and merch.
export const ALL_BRANDS = brandsData
export const BRANDS = brandsData.filter(b => PRODUCTS.some(p => p.brand === b.name))
export const BRAND_NAMES = [...BRANDS.map(b => b.name), 'First Nutrition']
export const brandByName = (name) => brandsData.find(b => b.name === name)

export const categoryById = (id) => CATEGORIES.find(c => c.id === id)

// ---- prices ----
// Convert a JOD catalog price into the selected country's currency.
export function convert(jod, country) {
  const c = COUNTRIES[country] || COUNTRIES.jo
  return c.rate === 1 ? jod : Math.round(jod * c.rate)
}

export function formatPrice(amount, country, lang = 'en') {
  const c = COUNTRIES[country] || COUNTRIES.jo
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
  if (c.currency === 'USD') return `$${n}`
  return lang === 'ar' ? `${n} د.أ` : `${n} JOD`
}

// Variant helpers: options are e.g. { size: [...], flavor: [...] }.
export function findVariant(product, selection) {
  return product.variants.find(v =>
    Object.keys(product.options).every(k => !selection[k] || v[k] === selection[k]))
}

export function defaultSelection(product) {
  const first = product.variants[0]
  if (!first) return {}
  return Object.fromEntries(Object.keys(product.options).map(k => [k, first[k]]))
}
