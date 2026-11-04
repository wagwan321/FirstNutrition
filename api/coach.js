// Vercel serverless function: AI answers for the Coach chat's follow-up
// questions that the built-in answers don't cover.
//
// Off until the Vercel project has ANTHROPIC_API_KEY set: until then it returns
// 503 and the chat hands the question to a real coach on WhatsApp instead.
// COACH_MODEL picks the model (default claude-opus-5-5).
import Anthropic from '@anthropic-ai/sdk'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const products = require('../src/data/products.json')

const MODEL = process.env.COACH_MODEL || 'claude-opus-5-5'
// models that accept the server-side refusal fallback
const FALLBACK_MODELS = ['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']

const CATALOG = products
  .filter(p => p.available)
  .map(p => `- ${p.name} (${p.brand}; ${p.category}; from ${p.price} JOD)`)
  .join('\n')

const SYSTEM = `You are the Coach on the website of First Nutrition, the official distributor of leading sports-supplement brands in Jordan and Lebanon. Customers order through the website and WhatsApp and pay cash on delivery; the store has branches with trained staff.

You answer a visitor's follow-up question after they received a daily plan (calories, protein, carbs, fat) and a supplement stack from the site.

How to answer:
- Keep it short: 2 to 5 sentences of plain text. A short list is fine; no headings, tables or markdown formatting.
- Reply in the language named in the visitor's message context (English or Arabic).
- Use the visitor's own plan numbers when they are relevant.
- Recommend products only from the catalog below, by their exact name. Never invent products, prices, stock, discounts or delivery promises. Prices are in JOD.
- You are not a doctor. Give general, label-level guidance only. Do not advise on prescription drugs, peptides, SARMs, steroids, hormones or banned substances; say you can't help with those and suggest a doctor. For pregnancy, anyone under 18, heart, kidney or liver conditions, or people on medication, recommend checking with a doctor first.
- If a question has nothing to do with training, nutrition, supplements or the store, say politely that you can only help with those.
- If you are unsure, say so and suggest asking the store's coaches on WhatsApp.

Catalog:
${CATALOG}`

// Best-effort limit per instance: 20 questions per visitor per 10 minutes.
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(at => now - at < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 20
}

const num = (v, min, max) => (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max ? Number(v) : null)
const pick = (v, allowed) => (allowed.includes(v) ? v : null)

function visitorContext(body) {
  const p = body.profile || {}
  const plan = body.plan || {}
  const facts = [
    `Reply language: ${body.lang === 'ar' ? 'Arabic' : 'English'}`,
    `Country: ${body.country === 'lb' ? 'Lebanon' : 'Jordan'}`,
    `Goals: ${(Array.isArray(p.goals) ? p.goals : [p.goal]).filter(g => ['muscle', 'gain', 'lose', 'performance'].includes(g)).join(' + ') || 'unknown'}`,
    `Sex: ${pick(p.sex, ['male', 'female']) || 'unknown'}`,
    `Age: ${num(p.age, 10, 100) ?? 'unknown'}`,
    `Height: ${num(p.height, 100, 250) ?? '?'} cm, weight: ${num(p.weight, 30, 300) ?? '?'} kg`,
    `Training: ${pick(p.activity, ['light', 'moderate', 'hard', 'daily']) || 'unknown'}`,
    `Avoids: ${(Array.isArray(p.avoid) ? p.avoid.filter(x => ['lactose', 'caffeine'].includes(x)) : []).join(', ') || 'nothing'}`,
    `Daily plan: ${num(plan.calories, 800, 8000) ?? '?'} kcal, protein ${num(plan.protein, 0, 500) ?? '?'} g, carbs ${num(plan.carbs, 0, 1500) ?? '?'} g, fat ${num(plan.fat, 0, 500) ?? '?'} g`,
  ]
  return facts.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'not_configured' })

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anonymous'
  if (limited(ip)) return res.status(429).json({ error: 'rate_limited' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  body = body || {}
  const question = String(body.question || '').slice(0, 500).trim()
  if (!question) return res.status(400).json({ error: 'empty_question' })

  // Earlier turns of the chat (text only), oldest first, starting with the visitor.
  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-6)
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 600) }))
  while (history.length && history[0].role !== 'user') history.shift()

  const messages = [
    ...history,
    { role: 'user', content: `<visitor_context>\n${visitorContext(body)}\n</visitor_context>\n\n${question}` },
  ]

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'low' },
      ...(FALLBACK_MODELS.includes(MODEL) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    })
    if (response.stop_reason === 'refusal') return res.status(200).json({ text: null })
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    return res.status(200).json({ text: text || null })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'busy' })
    if (error instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'not_configured' })
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: 'upstream_error' })
    return res.status(500).json({ error: 'server_error' })
  }
}
