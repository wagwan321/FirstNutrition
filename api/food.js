// Vercel serverless function: estimates the foods, portions and macros in a meal
// photo (or a description the built-in food list couldn't match) for the
// Coach's calorie tracker.
//
// Off until the Vercel project has ANTHROPIC_API_KEY set (returns 503; the
// tracker then asks the visitor to type what's on the plate). COACH_MODEL picks
// the model (default claude-opus-5-5).
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.COACH_MODEL || 'claude-opus-5-5'
const FALLBACK_MODELS = ['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']
const MAX_IMAGE_B64 = 2_000_000   // ~1.5 MB JPEG; the site sends ~150 KB

const SYSTEM = `You estimate nutrition for a calorie tracker on the website of First Nutrition, a sports-supplement store in Jordan and Lebanon.

Given a photo of a meal (and/or a short description), list each distinct food you can see with a realistic portion in grams and its calories, protein, carbs and fat for that portion. Use typical portions for the region (for example: one Arabic bread loaf about 60 g; one chicken shawarma sandwich about 300 g; one cup of cooked rice about 158 g). Include visible oils, sauces and drinks. Values should match standard nutrition tables for the food as it appears (fried, grilled, with sauce).

Give English names in "name" and Arabic names in "name_ar". If the image is not food, set is_food to false and leave items empty. Put one short sentence in "note" (in the language requested) about the meal or about anything uncertain, such as a hidden filling or an unclear portion. Never give medical advice.`

const SCHEMA = {
  type: 'object',
  properties: {
    is_food: { type: 'boolean' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          name_ar: { type: 'string' },
          grams: { type: 'number' },
          kcal: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
        required: ['name', 'name_ar', 'grams', 'kcal', 'protein', 'carbs', 'fat'],
        additionalProperties: false,
      },
    },
    note: { type: 'string' },
  },
  required: ['is_food', 'items', 'note'],
  additionalProperties: false,
}

// Best-effort limit per instance: 15 estimates per visitor per 10 minutes.
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(at => now - at < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 15
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
  const image = typeof body.image === 'string' && /^[A-Za-z0-9+/=]+$/.test(body.image.slice(0, 200)) ? body.image : null
  const text = String(body.text || '').slice(0, 400).trim()
  // the pieces the site's own food list couldn't match (the rest is already counted)
  const only = (Array.isArray(body.only) ? body.only : []).map(x => String(x).slice(0, 60).trim()).filter(Boolean).slice(0, 8)
  if (!image && !text) return res.status(400).json({ error: 'nothing_to_analyse' })
  if (image && image.length > MAX_IMAGE_B64) return res.status(413).json({ error: 'image_too_large' })

  const content = []
  if (image) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } })
  content.push({
    type: 'text',
    text: `${image ? 'Estimate the foods in this meal photo.' : 'Estimate the foods in this description.'}${text ? `\nDescription from the visitor: ${text}` : ''}${only.length ? `\nOnly list these foods: ${only.join('; ')}` : ''}\nWrite the note in ${body.lang === 'ar' ? 'Arabic' : 'English'}.`,
  })

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      ...(FALLBACK_MODELS.includes(MODEL) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content }],
    })
    if (response.stop_reason === 'refusal') return res.status(200).json({ is_food: false, items: [], note: '' })
    if (response.stop_reason === 'max_tokens') return res.status(502).json({ error: 'bad_output' })
    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('')
    let data
    try { data = JSON.parse(raw) } catch { return res.status(502).json({ error: 'bad_output' }) }
    return res.status(200).json(data)
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'busy' })
    if (error instanceof Anthropic.AuthenticationError) return res.status(503).json({ error: 'not_configured' })
    if (error instanceof Anthropic.APIError) return res.status(502).json({ error: 'upstream_error' })
    return res.status(500).json({ error: 'server_error' })
  }
}
