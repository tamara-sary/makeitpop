import { domToWebp } from 'modern-screenshot'
import { save } from '../lib/store'
import { shotKey, type Shot } from '../lib/profile'

// "Download code": the edited design as ONE self-contained HTML file (its stylesheet inlined),
// ready to open in Cursor / Claude Code. Editor-only marks (outlines, contenteditable) are stripped.
export async function buildHtml(doc: Document, baseUrl: string) {
  const root = doc.documentElement.cloneNode(true) as HTMLElement
  root.querySelectorAll('[data-mip-editor]').forEach((n) => n.remove())
  root.querySelectorAll('[data-mip-sel],[data-mip-hover],[contenteditable]').forEach((n) => {
    n.removeAttribute('data-mip-sel'); n.removeAttribute('data-mip-hover'); n.removeAttribute('contenteditable')
  })
  for (const link of Array.from(root.querySelectorAll('link[rel="stylesheet"]'))) {
    const href = link.getAttribute('href') ?? ''
    if (/^https?:/.test(href)) continue // keep Google Fonts etc. as links
    try {
      const css = await (await fetch(new URL(href, new URL(baseUrl, location.href)).href)).text()
      const style = doc.createElement('style')
      style.textContent = css
      link.replaceWith(style)
    } catch { /* leave the link; the file still opens */ }
  }
  return '<!doctype html>\n<!-- Remixed on Make It Pop · makeitpop.work · free to remix, credit Make It Pop -->\n' + root.outerHTML
}

export async function downloadCode(doc: Document, dayN: number, baseUrl: string) {
  const html = await buildHtml(doc, baseUrl)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  a.download = `makeitpop-day-${String(dayN).padStart(2, '0')}-remix.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

// "Use as my remix shot": render the edited design to an image and drop it into the Your-remix frame + profile.
export async function saveAsShot(doc: Document, dayN: number): Promise<boolean> {
  const target = (doc.querySelector('.app') as HTMLElement | null) ?? doc.body
  const sel = Array.from(doc.querySelectorAll('[data-mip-sel]'))
  doc.querySelectorAll('[data-mip-sel],[data-mip-hover]').forEach((n) => { n.removeAttribute('data-mip-sel'); n.removeAttribute('data-mip-hover') })
  try {
    const w = Math.min(1600, target.scrollWidth)
    const src = await domToWebp(target, { scale: w / target.scrollWidth, quality: 0.86 })
    const img = new Image()
    await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = src })
    const shot: Shot = { src, at: Date.now(), w: img.naturalWidth, h: img.naturalHeight, name: `day-${dayN}-remix.webp` }
    return save(shotKey(dayN), shot)
  } finally {
    sel.forEach((n) => n.setAttribute('data-mip-sel', '')) // selection outline comes back
  }
}
