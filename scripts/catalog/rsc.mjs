// Helpers to read the Next.js RSC ("flight") payload embedded in a
// server-rendered page. The payload arrives as many
//   self.__next_f.push([1,"<escaped string>"])
// calls; concatenated, they form rows like  `5c:T26c3,<text>`  (length-prefixed
// text, length in UTF-8 bytes, hex) or  `4:I[...]` / `5:{...}`  (newline-ended).
// Values such as "$5c" refer to row 0x5c.

export function rscText(html) {
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g
  let out = ''
  for (const m of html.matchAll(re)) out += JSON.parse(m[1])
  return out
}

// Split the flight text into a Map of rowId -> row text.
export function rscRows(text) {
  const buf = Buffer.from(text, 'utf8')
  const rows = new Map()
  let pos = 0
  while (pos < buf.length) {
    const colon = buf.indexOf(0x3a, pos) // ':'
    if (colon < 0) break
    const id = buf.toString('utf8', pos, colon).trim()
    if (buf[colon + 1] === 0x54) { // 'T' length-prefixed text row
      const comma = buf.indexOf(0x2c, colon) // ','
      const len = parseInt(buf.toString('utf8', colon + 2, comma), 16)
      rows.set(id, buf.toString('utf8', comma + 1, comma + 1 + len))
      pos = comma + 1 + len
    } else {
      let nl = buf.indexOf(0x0a, colon)
      if (nl < 0) nl = buf.length
      rows.set(id, buf.toString('utf8', colon + 1, nl))
      pos = nl + 1
    }
  }
  return rows
}

// Resolve a "$xx" reference to its row text (or return the value unchanged).
export const deref = (rows, v) =>
  (typeof v === 'string' && /^\$[0-9a-f]+$/.test(v) ? rows.get(v.slice(1)) ?? null : v)

// Parse the JSON value (object or array) that starts at index `start`.
export function readJsonAt(text, start) {
  let depth = 0, inStr = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inStr) {
      if (c === '\\') i++
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth === 0) return JSON.parse(text.slice(start, i + 1))
    }
  }
  throw new Error('unbalanced JSON at ' + start)
}

// Find `"key":` followed by an object/array whose JSON contains `mustInclude`.
export function findValue(text, key, mustInclude = '') {
  const needle = `"${key}":`
  let from = 0
  while (true) {
    const i = text.indexOf(needle, from)
    if (i < 0) return null
    const start = i + needle.length
    if (text[start] === '{' || text[start] === '[') {
      try {
        const v = readJsonAt(text, start)
        if (!mustInclude || JSON.stringify(v).includes(mustInclude)) return v
      } catch { /* keep looking */ }
    }
    from = start
  }
}

export async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return rscText(await res.text())
}
