import { useEffect, useRef, useState } from 'react'
import { Camera, SendHorizontal, ChevronLeft, ChevronRight, Trash2, X, Minus, Plus, Sparkles, Info, Flame, SlidersHorizontal, RotateCcw } from 'lucide-react'
import { useLocale } from '../i18n.jsx'
import { useTracker, dayKey, shiftDay } from '../context/TrackerContext.jsx'
import { dailyPlan, paceText } from '../utils/nutrition.js'
import { parseFoods, scaleItem, totals, mealForTime, fitsRemaining, suggestFor } from '../utils/foodLog.js'
import { GOALS, SEXES, DAYS, toggleGoal, goalLabel, goalsOf } from '../utils/coachPlan.js'
import { analyzeFood, shrinkImage } from '../utils/foodAI.js'
import useTween from '../hooks/useTween.js'

// The Coach's food diary ("Today"): type what you ate or snap a photo, check
// the portions, log it, and watch the day fill up against your own plan.
// Tap any number for a detailed explanation.
export const MEALS = [
  { id: 'breakfast', label: 'Breakfast' }, { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' }, { id: 'snack', label: 'Snacks' },
]
const DEFAULT_TARGETS = { calories: 2000, protein: 120, carbs: 230, fat: 65, water: 2.5, maintenance: 2000 }
const EXAMPLES = ['2 eggs and toast', 'chicken shawarma', '1 scoop whey', 'plate of hummus']

const readCoach = () => { try { return JSON.parse(localStorage.getItem('fn_coach_v2'))?.a || null } catch { return null } }
// Save the plan where the Coach chat keeps it (its conversation stays).
const saveCoach = (a) => {
  try {
    const prev = JSON.parse(localStorage.getItem('fn_coach_v2')) || {}
    localStorage.setItem('fn_coach_v2', JSON.stringify({ ...prev, a }))
  } catch { /* private mode */ }
}
const snapshot = (t) => ({ calories: t.calories, protein: t.protein, carbs: t.carbs, fat: t.fat, water: t.water })
const fmt = (n, lang) => Math.round(n).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')
const itemName = (i, lang) => (lang === 'ar' ? i.nameAr || i.name : i.name)

export default function TrackerView({ compact = false, onOpenChat }) {
  const { t, lang } = useLocale()
  const tracker = useTracker()
  const [a, setA] = useState(readCoach)
  const plan = a?.done ? dailyPlan(a) : null
  const current = plan || DEFAULT_TARGETS
  const [editing, setEditing] = useState(false)
  const [day, setDay] = useState(dayKey)
  const [draft, setDraft] = useState(null)        // a log being checked before it's saved
  const [text, setText] = useState('')
  const [explain, setExplain] = useState(null)
  const [open, setOpen] = useState(null)          // expanded diary entry
  const [pop, setPop] = useState(null)            // "+N kcal" flying up from the ring
  const fileRef = useRef(null)
  const isToday = day === dayKey()
  // past days are scored against the plan they were logged with
  const target = (!isToday && tracker.dayOf(day).target) || current
  const entries = tracker.dayOf(day).entries
  const eaten = tracker.totalsFor(day)
  const water = tracker.dayOf(day).water
  const glasses = Math.max(6, Math.round((target.water || 2.5) * 4))
  const left = { kcal: target.calories - eaten.kcal, p: target.protein - eaten.p, c: target.carbs - eaten.c, f: target.fat - eaten.f }

  useEffect(() => {
    if (!tracker.lastAdded) return
    setPop(tracker.lastAdded)
    const id = setTimeout(() => setPop(null), 1700)
    return () => clearTimeout(id)
  }, [tracker.lastAdded])

  // ---- logging ----
  const startText = async (value) => {
    const input = value.trim()
    if (!input) return
    setText('')
    const parsed = parseFoods(input)
    let next = { items: parsed.items, unknown: parsed.unknown, meal: parsed.meal || mealForTime(), text: input }
    if (parsed.unknown.length) {
      setDraft({ ...next, status: 'scanning' })
      const ai = await analyzeFood({ text: input, only: parsed.unknown, lang })
      if (ai.items?.length) next = { ...next, items: [...next.items, ...ai.items], unknown: [], note: ai.note }
      else next = { ...next, aiOff: ai.off, suggest: parsed.unknown.map(phrase => ({ phrase, options: suggestFor(phrase) })) }
    }
    setDraft({ ...next, status: 'ready' })
  }
  const startPhoto = async (file) => {
    if (!file) return
    const [photo, thumb] = await Promise.all([shrinkImage(file, 1024, 0.78), shrinkImage(file, 260, 0.7)])
    setDraft({ items: [], unknown: [], meal: mealForTime(), photo: thumb, status: 'scanning' })
    const ai = await analyzeFood({ image: photo, lang })
    if (ai.items?.length) setDraft(d => ({ ...d, items: ai.items, note: ai.note, status: 'ready' }))
    else setDraft(d => ({ ...d, status: 'ask', notFood: ai.notFood, aiOff: ai.off }))
  }
  const describePhoto = (value) => {
    const parsed = parseFoods(value)
    setDraft(d => ({ ...d, items: parsed.items, unknown: parsed.unknown, text: value, status: 'ready', meal: parsed.meal || d.meal }))
  }
  const logDraft = () => {
    if (!draft?.items.length) return
    tracker.addEntry(day, { meal: draft.meal, items: draft.items, text: draft.text, photo: draft.photo }, snapshot(current))
    setDraft(null)
    setExplain(null)
  }

  const kcal = useTween(eaten.kcal, 1000)
  const ratio = eaten.kcal / Math.max(1, target.calories)
  const R = 54
  const C = 2 * Math.PI * R
  const status = ratio > 1.05 ? 'over' : ratio >= 0.9 ? 'close' : 'under'
  const week = Array.from({ length: 7 }, (_, i) => shiftDay(day, i - 6))
  const dayLabel = isToday ? t('Today') : day === shiftDay(dayKey(), -1) ? t('Yesterday')
    : new Date(`${day}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className={`trk${compact ? ' is-compact' : ''}`}>
      <div className="trk-scroll">
        {!plan && (
          <button type="button" className="trk-setup" onClick={() => setEditing(true)}>
            <Sparkles size={18} />
            <span><b>{t('Set your own targets')}</b><small>{t('Answer six quick questions in the Coach; until then we use 2,000 kcal.')}</small></span>
            <ChevronRight size={18} className="flip-rtl" />
          </button>
        )}

        <div className="trk-day">
          <button type="button" className="icon-btn" onClick={() => setDay(d => shiftDay(d, -1))} aria-label={t('Previous day')}><ChevronLeft size={20} className="flip-rtl" /></button>
          <b>{dayLabel}</b>
          <button type="button" className="icon-btn" onClick={() => setDay(d => shiftDay(d, 1))} disabled={isToday} aria-label={t('Next day')}><ChevronRight size={20} className="flip-rtl" /></button>
          {tracker.streak > 1 && <span className="trk-streak"><Flame size={14} /> {t('{n}-day streak', { n: tracker.streak })}</span>}
          <button type="button" className="trk-plan-btn" onClick={() => setEditing(e => !e)} aria-expanded={editing}>
            <SlidersHorizontal size={15} /> {t('My plan')}
          </button>
        </div>

        {editing && (
          <PlanEditor a={a} onClose={() => setEditing(false)}
            onSave={(next) => {
              saveCoach(next)
              setA(next)
              tracker.retarget(dayKey(), snapshot(dailyPlan(next)))
            }}
            onReset={() => { tracker.resetDiary(); setDay(dayKey()) }} />
        )}

        {/* the day at a glance: calories ring and macro bars, all tappable */}
        <div className={`trk-hero is-${status}`}>
          <button type="button" className="trk-ring" onClick={() => setExplain('calories')} aria-label={t('Explain my calories')}>
            <svg viewBox="0 0 128 128" aria-hidden="true">
              <circle className="ring-track" cx="64" cy="64" r={R} />
              {eaten.kcal > 0 && <circle className="ring-fill" cx="64" cy="64" r={R} strokeDasharray={`${Math.min(1, ratio) * C} ${C}`} />}
              {ratio > 1 && <circle className="ring-over" cx="64" cy="64" r={R} strokeDasharray={`${Math.min(0.5, ratio - 1) * C} ${C}`} />}
            </svg>
            <span className="ring-mid">
              <b>{fmt(kcal, lang)}</b>
              <small>{t('of {t} kcal', { t: fmt(target.calories, lang) })}</small>
              <em>{left.kcal >= 0 ? t('{n} left', { n: fmt(left.kcal, lang) }) : t('{n} over', { n: fmt(-left.kcal, lang) })}</em>
            </span>
            {pop && isToday && <span className="ring-pop" key={pop.id}>+{fmt(pop.kcal, lang)}</span>}
          </button>
          <div className="trk-macros">
            {[['protein', 'p', 'Protein'], ['carbs', 'c', 'Carbs'], ['fat', 'f', 'Fat']].map(([key, k, label]) => (
              <MacroBar key={key} id={key} label={t(label)} eaten={eaten[k]} target={target[key]} onExplain={() => setExplain(key)} />
            ))}
            <button type="button" className="trk-fits" onClick={() => setExplain('left')}><Sparkles size={15} /> {t('What can I still eat?')}</button>
          </div>
        </div>

        {explain && (
          <ExplainCard kind={explain} plan={plan} a={a} target={target} eaten={eaten} left={left} water={water} glasses={glasses}
            onClose={() => setExplain(null)}
            onPick={(item) => setDraft({ items: [item], unknown: [], meal: mealForTime(), status: 'ready' })} />
        )}

        {/* water: tap a glass to fill up to it */}
        <div className="trk-water">
          <button type="button" className="trk-water-head" onClick={() => setExplain('water')}>
            <b>{t('Water')}</b><span>{t('{n} of {t} glasses', { n: water, t: glasses })}</span>
          </button>
          <div className="glasses">
            {Array.from({ length: glasses }, (_, i) => (
              <button key={i} type="button" className={`glass${i < water ? ' full' : ''}`} style={{ '--i': i }}
                onClick={() => tracker.setWater(day, i < water && i === water - 1 ? i : i + 1)} aria-label={t('{n} glasses', { n: i + 1 })}>
                <i />
              </button>
            ))}
          </div>
        </div>

        {/* the diary */}
        <div className="trk-meals">
          {entries.length === 0 && (
            <div className="trk-empty">
              <p>{isToday ? t('Nothing logged yet. Type what you ate or snap a photo of your plate.') : t('Nothing was logged this day.')}</p>
              {isToday && <div className="chips">{EXAMPLES.map(x => <button key={x} type="button" className="chip" onClick={() => startText(t(x))}>{t(x)}</button>)}</div>}
            </div>
          )}
          {MEALS.map(m => {
            const list = entries.filter(e => e.meal === m.id)
            if (!list.length) return null
            const sum = totals(list.flatMap(e => e.items))
            return (
              <section key={m.id} className="meal">
                <header><b>{t(m.label)}</b><span>{t('{n} kcal', { n: fmt(sum.kcal, lang) })}</span></header>
                <ul>
                  {list.map(e => {
                    const tot = totals(e.items)
                    return (
                      <li key={e.id} className={open === e.id ? 'open' : ''}>
                        <button type="button" className="entry" onClick={() => setOpen(o => (o === e.id ? null : e.id))} aria-expanded={open === e.id}>
                          {e.photo ? <img src={e.photo} alt="" /> : <span className="entry-dot" aria-hidden="true">{fmt(tot.kcal, lang)}</span>}
                          <span className="entry-txt">
                            <b>{e.items.map(i => itemName(i, lang)).join(lang === 'ar' ? '، ' : ', ')}</b>
                            <small>{t('{p} g protein · {c} g carbs · {f} g fat', { p: Math.round(tot.p), c: Math.round(tot.c), f: Math.round(tot.f) })}</small>
                          </span>
                          <em>{fmt(tot.kcal, lang)}</em>
                        </button>
                        {open === e.id && (
                          <div className="entry-more">
                            {e.items.map((i, n) => (
                              <p key={n}><b>{itemName(i, lang)}</b> {i.grams ? `${i.grams} g` : ''} · {t('{n} kcal', { n: fmt(i.kcal, lang) })} · {t('P {p} · C {c} · F {f}', { p: i.p, c: i.c, f: i.f })}
                                {i.ai && <small> {t('(photo estimate)')}</small>}{i.manual && <small> {t('(your number)')}</small>}</p>
                            ))}
                            <button type="button" className="entry-del" onClick={() => tracker.removeEntry(day, e.id)}><Trash2 size={14} /> {t('Remove')}</button>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>

        {/* the last 7 days against target; tap a day to open it */}
        <div className="trk-week" aria-label={t('Last 7 days')}>
          {week.map((k, i) => {
            const v = tracker.totalsFor(k).kcal / Math.max(1, target.calories)
            const d = new Date(`${k}T12:00:00`)
            return (
              <button key={k} type="button" className={`wk${k === day ? ' on' : ''}${v > 1.05 ? ' over' : v >= 0.9 ? ' hit' : ''}`} onClick={() => setDay(k)}
                style={{ '--h': `${Math.min(1.15, v) * 100}%`, '--i': i }} aria-label={`${d.toDateString()}: ${Math.round(tracker.totalsFor(k).kcal)} kcal`}>
                <i />
                <span>{d.toLocaleDateString(lang === 'ar' ? 'ar' : 'en-GB', { weekday: 'narrow' })}</span>
              </button>
            )
          })}
        </div>
      </div>

      {draft && <LogPreview draft={draft} setDraft={setDraft} onLog={logDraft} onCancel={() => setDraft(null)} onDescribe={describePhoto} />}

      {!draft && (
        <div className="trk-foot">
          {tracker.recents.length > 0 && (
            <div className="cchat-suggest">
              {tracker.recents.slice(0, 4).map(i => (
                <button key={`${i.id}${i.grams}`} type="button" className="chip"
                  onClick={() => setDraft({ items: [i], unknown: [], meal: mealForTime(), status: 'ready' })}>
                  <Plus size={13} /> {itemName(i, lang)}
                </button>
              ))}
            </div>
          )}
          <form className="composer" onSubmit={(e) => { e.preventDefault(); startText(text) }}>
            <button type="button" className="composer-cam" onClick={() => fileRef.current?.click()} aria-label={t('Log a photo of your meal')}><Camera size={19} /></button>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300}
              placeholder={t('What did you eat?')} aria-label={t('What did you eat?')} />
            <button type="submit" className="composer-send" disabled={!text.trim()} aria-label={t('Log')}><SendHorizontal size={19} className="flip-rtl" /></button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { startPhoto(e.target.files?.[0]); e.target.value = '' }} />
          </form>
        </div>
      )}
    </div>
  )
}

function MacroBar({ id, label, eaten, target, onExplain }) {
  const { t, lang } = useLocale()
  const g = useTween(eaten, 900)
  const ratio = eaten / Math.max(1, target)
  return (
    <button type="button" className={`mbar mb-${id}${ratio >= 1 ? ' hit' : ''}`} onClick={onExplain}>
      <span className="mbar-top"><b>{label}</b><span>{t('{e} / {t} g', { e: fmt(g, lang), t: fmt(target, lang) })}</span></span>
      <i style={{ '--w': `${Math.min(1, ratio) * 100}%` }} />
    </button>
  )
}

// The check-before-saving card: portions with steppers, the meal, and what
// couldn't be matched. A photo shows a scan while it is being read.
export function LogPreview({ draft, setDraft, onLog, onCancel, onDescribe, inline = false }) {
  const { t, lang } = useLocale()
  const [desc, setDesc] = useState('')
  const sum = totals(draft.items)
  const step = (n, factor) => setDraft(d => ({ ...d, items: d.items.map((it, j) => (j === n ? scaleItem(it, factor) : it)) }))
  const drop = (n) => setDraft(d => ({ ...d, items: d.items.filter((_, j) => j !== n) }))

  return (
    <div className={`logp${inline ? ' is-inline' : ''}`} role="group" aria-label={t('Check and log')}>
      {!inline && <button type="button" className="logp-x" onClick={onCancel} aria-label={t('Cancel')}><X size={18} /></button>}
      {draft.photo && (
        <div className={`logp-photo${draft.status === 'scanning' ? ' scanning' : ''}`}>
          <img src={draft.photo} alt="" />
          {draft.status === 'scanning' && <span className="scanline" aria-hidden="true" />}
        </div>
      )}
      {draft.status === 'scanning' && <p className="logp-status"><span className="dots"><i /><i /><i /></span> {draft.photo ? t('Reading your plate…') : t('Working out the rest…')}</p>}
      {draft.status === 'ask' && (
        <form className="logp-ask" onSubmit={(e) => { e.preventDefault(); if (desc.trim()) onDescribe(desc) }}>
          <p>{draft.notFood ? t('That doesn’t look like food. What did you eat?') : draft.aiOff ? t('Photo saved. What’s on the plate? (For example: “chicken shawarma and fries”.)') : t('I couldn’t read that photo. What’s on the plate?')}</p>
          <div className="composer">
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t('What did you eat?')} aria-label={t('What did you eat?')} autoFocus />
            <button type="submit" className="composer-send" disabled={!desc.trim()} aria-label={t('Log')}><SendHorizontal size={19} className="flip-rtl" /></button>
          </div>
        </form>
      )}
      {draft.status === 'ready' && (
        <>
          {draft.items.length > 0 && (
            <ul className="logp-items">
              {draft.items.map((i, n) => (
                <li key={`${i.id}${n}`} style={{ '--n': n }}>
                  <span className="logp-name"><b>{itemName(i, lang)}</b>
                    <small>{i.manual ? t('your number') : i.grams ? `${i.grams} g` : ''}{i.ai ? ` · ${t('estimate')}` : ''}</small></span>
                  <span className="stepper">
                    <button type="button" onClick={() => (i.kcal < 30 && !i.manual ? drop(n) : step(n, 0.75))} aria-label={t('Less')}><Minus size={14} /></button>
                    <em>{Math.round(i.kcal)}</em>
                    <button type="button" onClick={() => step(n, 1.25)} aria-label={t('More')}><Plus size={14} /></button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {draft.unknown?.length > 0 && (draft.suggest || draft.unknown.map(phrase => ({ phrase, options: [] }))).map(({ phrase, options }) => (
            <div key={phrase} className="logp-unknown">
              <p><Info size={14} /> {options.length
                ? t('I don’t know “{x}” yet. Did you mean:', { x: phrase })
                : t('Couldn’t find “{x}”. Add it with its calories, like “{x} 300 kcal”.', { x: phrase })}</p>
              {options.length > 0 && (
                <div className="chips">
                  {options.map(o => (
                    <button key={o.id} type="button" className="chip" onClick={() => setDraft(d => ({
                      ...d, items: [...d.items, o], unknown: d.unknown.filter(u => u !== phrase), suggest: d.suggest?.filter(x => x.phrase !== phrase),
                    }))}>{itemName(o, lang)} <small>{Math.round(o.kcal)}</small></button>
                  ))}
                  <span className="logp-or">{t('or type “{x} 300 kcal”', { x: phrase })}</span>
                </div>
              )}
            </div>
          ))}
          {draft.note && <p className="logp-note">{draft.note}</p>}
          {draft.items.length > 0 && (
            <>
              <div className="logp-sum">
                <b>{t('{n} kcal', { n: Math.round(sum.kcal).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') })}</b>
                <span>{t('{p} g protein · {c} g carbs · {f} g fat', { p: Math.round(sum.p), c: Math.round(sum.c), f: Math.round(sum.f) })}</span>
              </div>
              <div className="logp-meal seg">
                {MEALS.map(m => <button key={m.id} type="button" className={draft.meal === m.id ? 'on' : ''} onClick={() => setDraft(d => ({ ...d, meal: m.id }))}>{t(m.label)}</button>)}
              </div>
              <button type="button" className="btn btn-primary btn-block logp-go" onClick={onLog}>{t('Log it')}</button>
            </>
          )}
        </>
      )}
    </div>
  )
}

// "My plan": change goals and body numbers any time (finished bulking? switch
// to a cut) and see the new targets before saving; or clear the diary and
// start fresh. Past days keep the targets they were logged with.
function PlanEditor({ a, onClose, onSave, onReset }) {
  const { t, lang } = useLocale()
  const [d, setD] = useState(() => ({
    goals: goalsOf(a || { goal: 'muscle' }), sex: a?.sex || 'male', age: a?.age || '', height: a?.height || '', weight: a?.weight || '',
    activity: a?.activity || 'moderate',
  }))
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [clash, setClash] = useState(false)
  const ok = Number(d.age) >= 14 && Number(d.age) <= 80 && Number(d.height) >= 130 && Number(d.height) <= 220 && Number(d.weight) >= 35 && Number(d.weight) <= 200
  const next = ok ? dailyPlan({ ...d, age: +d.age, height: +d.height, weight: +d.weight }) : null
  const now = a?.done ? dailyPlan(a) : null
  const kcal = useTween(next?.calories || 0, 700)
  const set = (patch) => { setD(x => ({ ...x, ...patch })); setSaved(false) }
  const n = (v) => Math.round(v).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')

  return (
    <div className="plan-edit" role="region" aria-label={t('My plan')}>
      <button type="button" className="explain-x" onClick={onClose} aria-label={t('Close')}><X size={16} /></button>
      <h3>{t('My plan')}</h3>
      <p className="plan-edit-sub">{t('Finished a phase? Change your goal or numbers and your targets update from today.')}</p>

      <span className="pe-label">{t('Goal')}</span>
      <div className="chips pe-goals">
        {GOALS.map(g => {
          const on = d.goals.includes(g.id)
          return (
            <button key={g.id} type="button" className={`chip${on ? ' on' : ''}`} aria-pressed={on} onClick={() => {
              setClash(!on && d.goals.includes(g.excludes))
              set({ goals: toggleGoal(d.goals, g.id) })
            }}>{t(g.label)}</button>
          )
        })}
      </div>
      {clash && <p className="goal-hint">{t('You can’t gain weight and lose fat at the same time. To lose fat and keep your muscle, pick Build muscle + Lose fat.')}</p>}
      <p className="goal-combo">{goalLabel(d.goals, t)}</p>

      <div className="seg pe-sex">
        {SEXES.map(x => <button key={x.id} type="button" className={d.sex === x.id ? 'on' : ''} onClick={() => set({ sex: x.id })}>{t(x.label)}</button>)}
      </div>
      <div className="pe-body">
        {[['age', t('Age'), ''], ['height', t('Height'), 'cm'], ['weight', t('Weight'), 'kg']].map(([k, label, unit]) => (
          <label key={k}><span>{label}</span>
            <span className="body-input"><input type="number" inputMode="decimal" value={d[k]} onChange={(e) => set({ [k]: e.target.value })} />{unit && <i>{unit}</i>}</span>
          </label>
        ))}
      </div>
      <span className="pe-label">{t('Training')}</span>
      <div className="seg pe-days">
        {DAYS.map(x => <button key={x.id} type="button" className={d.activity === x.id ? 'on' : ''} onClick={() => set({ activity: x.id })}>{t(x.label)}</button>)}
      </div>

      {next && (
        <div className="pe-preview">
          <b>{n(kcal)}</b><span>{t('kcal a day')}</span>
          {now && next.calories !== now.calories && <em>{next.calories > now.calories ? '+' : '−'}{n(Math.abs(next.calories - now.calories))}</em>}
          <small>{t('{p} g protein · {c} g carbs · {f} g fat', { p: next.protein, c: next.carbs, f: next.fat })} · {paceText(next, t)}</small>
        </div>
      )}
      <button type="button" className="btn btn-primary btn-block" disabled={!ok || saved}
        onClick={() => { onSave({ ...(a || {}), ...d, age: +d.age, height: +d.height, weight: +d.weight, goal: d.goals[0], avoid: a?.avoid || [], budget: a?.budget || 100, done: true }); setSaved(true) }}>
        {saved ? t('Saved. Your new targets start today.') : t('Save my plan')}
      </button>

      <div className="pe-reset">
        <b>{t('Start fresh')}</b>
        <p>{t('Clear every meal and glass of water you’ve logged. Your plan stays.')}</p>
        {confirm ? (
          <div className="pe-confirm">
            <button type="button" className="btn btn-primary" onClick={() => { onReset(); setConfirm(false) }}>{t('Yes, clear my diary')}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>{t('Cancel')}</button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirm(true)}><RotateCcw size={15} /> {t('Clear my food diary')}</button>
        )}
      </div>
    </div>
  )
}

// Detailed explanations, with the visitor's own numbers.
function ExplainCard({ kind, plan, a, target, eaten, left, water, glasses, onClose, onPick }) {
  const { t, lang } = useLocale()
  const n = (v) => fmt(v, lang)
  let title = ''
  let body = []
  let picks = null
  if (kind === 'calories') {
    title = t('Your calories today')
    body.push(left.kcal >= 0
      ? t('You’ve eaten {e} of {t} kcal, so {l} are left today.', { e: n(eaten.kcal), t: n(target.calories), l: n(left.kcal) })
      : t('You’ve eaten {e} kcal, {o} over your {t} kcal target. One day over is fine; balance it over the week.', { e: n(eaten.kcal), o: n(-left.kcal), t: n(target.calories) }))
    if (plan && a) {
      const bmr = Math.round(10 * a.weight + 6.25 * a.height - 5 * a.age + (a.sex === 'female' ? -161 : 5))
      const diff = target.calories - plan.maintenance
      body.push(t('Where {t} comes from: at rest your body burns about {b} kcal (the Mifflin-St Jeor formula, from your age, height, weight and sex). Your training raises that to about {m} kcal a day.', { t: n(target.calories), b: n(bmr), m: n(plan.maintenance) }))
      body.push(diff > 0 ? t('To build, you eat {d} kcal above that, aiming for {pace}.', { d: n(diff), pace: paceText(plan, t) })
        : diff < 0 ? t('To lose fat, you eat {d} kcal below that, aiming for {pace}.', { d: n(-diff), pace: paceText(plan, t) })
          : t('For performance you eat about what you burn, so your weight holds steady.'))
      body.push(t('Weigh yourself on the same morning each week. If nothing changes for two weeks, adjust by 150–200 kcal a day.'))
    } else body.push(t('Set your targets in the Coach to get a number made for your body and goal.'))
  } else if (kind === 'protein') {
    title = t('Protein')
    body.push(t('{e} of {t} g today, {l} g to go.', { e: n(eaten.p), t: n(target.protein), l: n(Math.max(0, left.p)) }))
    body.push(t('Protein builds and protects muscle, and keeps you full. Spread it over 3–4 meals of 25–40 g each.'))
    if (left.p > 10) body.push(t('Easy ways to close the gap: 1 scoop of whey (24 g), 150 g of chicken (46 g), 200 g of Greek yogurt (20 g), or a can of tuna (28 g).'))
  } else if (kind === 'carbs') {
    title = t('Carbs')
    body.push(t('{e} of {t} g today.', { e: n(eaten.c), t: n(target.carbs) }))
    body.push(t('Carbs are your training fuel and refill your muscles afterwards. Put most of them around your workout; rice, oats, bread, potatoes and fruit are all good sources.'))
  } else if (kind === 'fat') {
    title = t('Fat')
    body.push(t('{e} of {t} g today.', { e: n(eaten.f), t: n(target.fat) }))
    body.push(t('Fat supports your hormones and helps you absorb vitamins, so don’t cut it too low. It’s also the easiest place for hidden calories: a tablespoon of oil is about 120 kcal.'))
  } else if (kind === 'water') {
    title = t('Water')
    body.push(t('{n} of {t} glasses today (one glass is 250 ml).', { n: water, t: glasses }))
    body.push(t('Drink more on training days and in the heat. Creatine works best when you’re well hydrated.'))
  } else if (kind === 'left') {
    title = t('What fits the rest of your day')
    picks = fitsRemaining(left)
    body.push(left.kcal < 60
      ? t('You’ve reached your calories for today. If you’re hungry, go for vegetables, a salad or a protein shake with water.')
      : t('You have {k} kcal and {p} g of protein left. Tap one to log it:', { k: n(left.kcal), p: n(Math.max(0, left.p)) }))
  }

  return (
    <div className="explain" role="region" aria-label={title}>
      <button type="button" className="explain-x" onClick={onClose} aria-label={t('Close')}><X size={16} /></button>
      <h3>{title}</h3>
      {body.map((p, i) => <p key={i} style={{ '--i': i }}>{p}</p>)}
      {picks?.length > 0 && (
        <ul className="explain-picks">
          {picks.map(i => (
            <li key={i.id}><button type="button" onClick={() => onPick(i)}>
              <b>{lang === 'ar' ? i.nameAr : i.name}</b><small>{lang === 'ar' ? i.portionAr : i.portion} · {t('{n} kcal', { n: n(i.kcal) })} · {i.p} g {t('protein')}</small>
            </button></li>
          ))}
        </ul>
      )}
    </div>
  )
}
