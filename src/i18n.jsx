import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { COUNTRIES, DEFAULT_COUNTRY } from './config.js'
import { convert, formatPrice } from './data/catalog.js'
import { AR } from './i18n-ar.js'

// Country (Jordan / Lebanon: currency, branches, WhatsApp) + language
// (English / Arabic, with right-to-left layout). English text doubles as the
// translation key: t('Shop now') returns the Arabic string when lang is 'ar'.
const LocaleContext = createContext(null)
export const useLocale = () => useContext(LocaleContext)

const stored = (key) => { try { return localStorage.getItem(key) } catch { return null } }
const store = (key, value) => { try { localStorage.setItem(key, value) } catch { /* private mode */ } }

export function LocaleProvider({ children }) {
  const [country, setCountry] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('country')
    const saved = fromUrl || stored('fn_country')
    return COUNTRIES[saved] ? saved : DEFAULT_COUNTRY
  })
  const [lang, setLang] = useState(() => {
    const initial = stored('fn_lang') === 'ar' ? 'ar' : 'en'
    // Set direction before the first paint, or off-canvas drawers would
    // animate from their LTR to their RTL hiding position on load.
    document.documentElement.lang = initial
    document.documentElement.dir = initial === 'ar' ? 'rtl' : 'ltr'
    return initial
  })

  useEffect(() => { store('fn_country', country) }, [country])
  useEffect(() => {
    store('fn_lang', lang)
    const html = document.documentElement
    // flip direction without letting off-canvas panels animate across the page
    html.classList.add('dir-switch')
    html.lang = lang
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
    const id = requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('dir-switch')))
    return () => cancelAnimationFrame(id)
  }, [lang])

  const t = useCallback((text, vars) => {
    let s = lang === 'ar' ? (AR[text] ?? text) : text
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
    return s
  }, [lang])

  const value = useMemo(() => ({
    country, setCountry, lang, setLang, t,
    region: COUNTRIES[country],
    // JOD catalog price -> number in the local currency
    amount: (jod) => convert(jod, country),
    // JOD catalog price -> formatted local price, e.g. "50 JOD" / "$71".
    // { decimals: true } keeps two decimals (per-serving costs).
    price: (jod, opts) => formatPrice(
      opts?.decimals ? Number((jod * (COUNTRIES[country]?.rate || 1)).toFixed(2)) : convert(jod, country), country, lang),
    // already-local amount -> formatted
    format: (amount) => formatPrice(amount, country, lang),
  }), [country, lang, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
