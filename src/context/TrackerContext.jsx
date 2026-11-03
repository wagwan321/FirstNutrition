import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { totals } from '../utils/foodLog.js'

// The food diary: entries (what was eaten, when, which meal, an optional photo
// thumbnail) and water per day, kept on this device only.
const TrackerContext = createContext(null)
export const useTracker = () => useContext(TrackerContext)

const KEY = 'fn_tracker_v1'
const PHOTO_DAYS = 21     // photo thumbnails older than this are dropped
const KEEP_DAYS = 180

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const shiftDay = (key, n) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() + n); return dayKey(d) }
const age = (key) => Math.round((Date.now() - new Date(`${key}T12:00:00`).getTime()) / 864e5)

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY)) || {}
    const days = {}
    for (const [k, day] of Object.entries(raw.days || {})) {
      if (age(k) > KEEP_DAYS) continue
      days[k] = {
        water: day.water || 0,
        entries: (day.entries || []).map(e => (age(k) > PHOTO_DAYS ? { ...e, photo: undefined } : e)),
      }
    }
    return days
  } catch { return {} }
}

function save(days) {
  try { localStorage.setItem(KEY, JSON.stringify({ days })) } catch {
    // storage full: keep the numbers, drop the photos
    try {
      const slim = Object.fromEntries(Object.entries(days).map(([k, d]) => [k, { ...d, entries: d.entries.map(e => ({ ...e, photo: undefined })) }]))
      localStorage.setItem(KEY, JSON.stringify({ days: slim }))
    } catch { /* private mode */ }
  }
}

export function TrackerProvider({ children }) {
  const [days, setDays] = useState(load)
  const [lastAdded, setLastAdded] = useState(null)   // { id, kcal } for the "+N kcal" pop
  useEffect(() => { save(days) }, [days])

  const addEntry = useCallback((day, entry) => {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
    const full = { id, time: Date.now(), ...entry }
    setDays(d => ({ ...d, [day]: { water: d[day]?.water || 0, entries: [...(d[day]?.entries || []), full] } }))
    setLastAdded({ id, kcal: totals(entry.items).kcal })
    return id
  }, [])
  const removeEntry = useCallback((day, id) => {
    setDays(d => ({ ...d, [day]: { ...d[day], entries: (d[day]?.entries || []).filter(e => e.id !== id) } }))
  }, [])
  const setWater = useCallback((day, n) => {
    setDays(d => ({ ...d, [day]: { entries: d[day]?.entries || [], water: Math.max(0, Math.min(16, n)) } }))
  }, [])

  const value = useMemo(() => {
    const dayOf = (k) => days[k] || { entries: [], water: 0 }
    const totalsFor = (k) => totals(dayOf(k).entries.flatMap(e => e.items))
    // most recent distinct foods, for one-tap re-logging
    const recents = []
    for (const k of Object.keys(days).sort().reverse()) {
      for (const e of [...days[k].entries].reverse()) {
        for (const i of e.items) {
          if (i.manual || i.ai || recents.some(r => r.id === i.id && r.grams === i.grams)) continue
          recents.push(i)
        }
      }
      if (recents.length >= 8) break
    }
    // days in a row with something logged, ending today (or yesterday, before today's first log)
    let streak = 0
    let k = dayKey()
    if (!dayOf(k).entries.length) k = shiftDay(k, -1)
    while (dayOf(k).entries.length && streak < 366) { streak++; k = shiftDay(k, -1) }
    return { days, dayOf, totalsFor, recents: recents.slice(0, 8), streak, lastAdded, addEntry, removeEntry, setWater }
  }, [days, lastAdded, addEntry, removeEntry, setWater])

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>
}
