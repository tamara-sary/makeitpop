// Editor V1 core: edits are tiny records (where + what), so they can be undone, saved, replayed and exported.
// The design lives in a same-origin iframe; every edit changes that real HTML/CSS (the design IS code).

export type Edit = (
  | { kind: 'text'; path: number[]; value: string; prev: string }
  | { kind: 'style'; path: number[]; prop: string; value: string; prev: string }
  | { kind: 'var'; prop: string; value: string; prev: string } // a palette colour on :root, changes it everywhere
) & { by?: 'agent' } // made by an AI agent through the MCP bridge (shown in the change counter)

// One-line description of an edit, for undo messages and the agent
export function describeEdit(e: Edit, doc: Document | null) {
  if (e.kind === 'var') return `${e.prop} → ${e.value}`
  const el = doc ? elAt(doc, e.path) : null
  const who = el ? labelOf(el) : 'element'
  return e.kind === 'text' ? `${who} text "${e.prev}" → "${e.value}"` : `${who} ${e.prop} → ${e.value}`
}

// Element address = child indexes from <body>. The challenge markup is fixed, so this is stable and tiny.
export function pathOf(el: Element): number[] {
  const path: number[] = []
  let cur: Element | null = el
  while (cur && cur.parentElement && cur.tagName !== 'BODY') {
    path.unshift(Array.prototype.indexOf.call(cur.parentElement.children, cur))
    cur = cur.parentElement
  }
  return path
}

export function elAt(doc: Document, path: number[]): HTMLElement | null {
  let cur: Element | null = doc.body
  for (const i of path) cur = cur?.children[i] ?? null
  return cur as HTMLElement | null
}

export function applyEdit(doc: Document, e: Edit, undo = false) {
  const v = undo ? e.prev : e.value
  if (e.kind === 'var') { doc.documentElement.style.setProperty(e.prop, v); return }
  const el = elAt(doc, e.path)
  if (!el) return
  if (e.kind === 'text') el.textContent = v
  else if (v) el.style.setProperty(e.prop, v)
  else el.style.removeProperty(e.prop)
}

// Human label for the selected element: what it is + its class, e.g. "Text · kpi-value"
const KIND: Record<string, string> = {
  P: 'Text', SPAN: 'Text', STRONG: 'Text', EM: 'Text', SMALL: 'Text', LABEL: 'Label',
  H1: 'Heading', H2: 'Heading', H3: 'Heading', H4: 'Heading', H5: 'Heading', H6: 'Heading',
  BUTTON: 'Button', A: 'Link', IMG: 'Image', svg: 'Icon', SVG: 'Icon', LI: 'List item', UL: 'List', OL: 'List',
  TABLE: 'Table', TR: 'Row', TD: 'Cell', TH: 'Cell', NAV: 'Navigation', ASIDE: 'Sidebar', HEADER: 'Header',
  MAIN: 'Main', SECTION: 'Section', ARTICLE: 'Card', INPUT: 'Input', DIV: 'Box',
}
export function labelOf(el: Element) {
  const kind = KIND[el.tagName] ?? el.tagName.toLowerCase()
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : ''
  return cls ? `${kind} · ${cls}` : kind
}

// A "leaf" = text you can safely rewrite without destroying structure (no child elements).
export const isTextLeaf = (el: Element) => el.children.length === 0 && (el.textContent ?? '').trim().length > 0

// ---------- colour + WCAG contrast ----------
type RGBA = [number, number, number, number]
export function parseColor(s: string): RGBA | null {
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  return [p[0], p[1], p[2], p[3] ?? 1]
}
const lum = ([r, g, b]: RGBA) => {
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export function contrast(a: RGBA, b: RGBA) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
// The colour actually behind an element: first non-transparent background up the tree (white if none).
export function effectiveBg(el: Element): RGBA {
  let cur: Element | null = el
  while (cur) {
    const c = parseColor(getComputedStyle(cur).backgroundColor)
    if (c && c[3] > 0.5) return c
    cur = cur.parentElement
  }
  return [255, 255, 255, 1]
}
export function toHex(s: string) {
  const c = parseColor(s)
  if (!c) return s.startsWith('#') ? s : '#000000'
  return '#' + c.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
}

// The design's own palette: colour custom properties declared on :root in its stylesheet.
export function readPalette(doc: Document): { name: string; value: string }[] {
  const out: { name: string; value: string }[] = []
  const cs = getComputedStyle(doc.documentElement)
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    for (const r of Array.from(rules)) {
      // duck-typed: rules come from the iframe's realm, so `instanceof CSSStyleRule` is always false here
      const sr = r as CSSStyleRule
      if (sr.selectorText !== ':root' || !sr.style) continue
      for (let i = 0; i < sr.style.length; i++) {
        const name = sr.style[i]
        const v = cs.getPropertyValue(name).trim()
        if (/^#|^rgb|^hsl/.test(v)) out.push({ name, value: v })
      }
    }
  }
  return out
}
