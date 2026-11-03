// Photo (and hard-to-parse text) food estimates from the /api/food endpoint,
// plus the client-side photo shrinking that keeps uploads and storage small.

// Returns { items, note } on success, { off: true } when the site's AI isn't
// switched on (or there is no endpoint, as in local dev), { error: true } otherwise.
export async function analyzeFood({ image, text, lang }) {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 45000)
    const res = await fetch('/api/food', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
      body: JSON.stringify({ image: image ? image.split(',')[1] : undefined, text: text?.slice(0, 400), lang }),
    })
    clearTimeout(timer)
    if (res.status === 503 || res.status === 404 || res.status === 405) return { off: true }
    if (!res.ok) return { error: true }
    const data = await res.json()
    if (!data || data.is_food === false) return { items: [], note: data?.note || '', notFood: true }
    const items = (data.items || []).map(i => ({
      id: 'ai', ai: true, name: i.name, nameAr: i.name_ar || i.name, grams: Math.round(i.grams),
      kcal: Math.round(i.kcal), p: Math.round(i.protein * 10) / 10, c: Math.round(i.carbs * 10) / 10, f: Math.round(i.fat * 10) / 10,
    }))
    return { items, note: data.note || '' }
  } catch { return { error: true } }
}

// Draw the photo into a canvas no larger than `max` px and return a JPEG data URL.
export async function shrinkImage(file, max = 1024, quality = 0.78) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}
