import { useEffect, useRef, useState } from 'react'
import type { Day } from '../data/days'
import { isTextLeaf, labelOf, pathOf } from './model'
import type { EditorApi } from './useEditor'

// "Your remix": an editable copy of the day's design (the original section never changes).
// Edit mode: hover outlines an element, click selects it, double-click rewrites text in place,
// ↑ / ↓ walk to the parent / first child, Esc deselects. Outside edit mode it's look-only.
export function EditableDesign({ day, editing, ed }: { day: Day; editing: boolean; ed: EditorApi }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [h, setH] = useState(988)
  const [hoverLabel, setHoverLabel] = useState<{ text: string; x: number; y: number } | null>(null)
  const edRef = useRef(ed)
  edRef.current = ed
  const editingRef = useRef(editing)
  editingRef.current = editing

  // selection outline lives in the design document, so it scales with the canvas zoom
  useEffect(() => {
    const doc = ed.doc
    if (!doc) return
    doc.querySelectorAll('[data-mip-sel]').forEach((n) => n.removeAttribute('data-mip-sel'))
    if (editing && ed.sel) ed.sel.setAttribute('data-mip-sel', '')
  }, [ed.doc, ed.sel, editing])

  useEffect(() => {
    if (!editing && ed.doc) {
      ed.doc.querySelectorAll('[data-mip-hover]').forEach((n) => n.removeAttribute('data-mip-hover'))
      setHoverLabel(null)
    }
  }, [editing, ed.doc])

  const onLoad = () => {
    const f = frame.current
    const doc = f?.contentDocument
    if (!f || !doc) return
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-chrome-selected').trim()
    const st = doc.createElement('style')
    st.setAttribute('data-mip-editor', '')
    st.textContent = `html,body{background:transparent!important;padding:0!important;margin:0!important;overflow:hidden!important}
      [data-mip-hover]{outline:2px dashed ${accent};outline-offset:2px;cursor:pointer}
      [data-mip-sel]{outline:2px solid ${accent}!important;outline-offset:2px}
      [contenteditable="true"]{outline:2px solid ${accent}!important;outline-offset:2px;cursor:text;background:color-mix(in srgb, ${accent} 8%, transparent)}`
    doc.head.appendChild(st)
    edRef.current.attach(doc)
    const app = doc.querySelector('.app') as HTMLElement | null
    const fitH = () => setH(Math.ceil((app ?? doc.body).getBoundingClientRect().height))
    fitH()
    doc.fonts?.ready.then(fitH)

    let hovered: Element | null = null
    doc.addEventListener('mouseover', (e) => {
      if (!editingRef.current) return
      hovered?.removeAttribute('data-mip-hover')
      hovered = e.target as Element
      if (hovered === doc.body || hovered === doc.documentElement) { hovered = null; setHoverLabel(null); return }
      hovered.setAttribute('data-mip-hover', '')
      const r = hovered.getBoundingClientRect()
      setHoverLabel({ text: labelOf(hovered), x: r.left, y: r.top })
    })
    doc.addEventListener('mouseleave', () => { hovered?.removeAttribute('data-mip-hover'); hovered = null; setHoverLabel(null) })

    // clicks never trigger the design's own links/buttons while editing
    doc.addEventListener('click', (e) => {
      if (!editingRef.current) return
      const t = e.target as HTMLElement
      if (t.isContentEditable) return
      e.preventDefault()
      e.stopPropagation()
      edRef.current.select(t === doc.body ? null : t)
    }, true)

    // double-click a piece of text to rewrite it in place
    doc.addEventListener('dblclick', (e) => {
      if (!editingRef.current) return
      const t = e.target as HTMLElement
      if (!isTextLeaf(t)) return
      e.preventDefault()
      const prev = t.textContent ?? ''
      t.contentEditable = 'true'
      t.focus()
      const range = doc.createRange(); range.selectNodeContents(t)
      const s = doc.getSelection(); s?.removeAllRanges(); s?.addRange(range)
      const finish = (keep: boolean) => {
        t.contentEditable = 'false'
        t.removeAttribute('contenteditable')
        const value = (t.textContent ?? '').replace(/\s+/g, ' ').trim()
        t.textContent = prev // let the edit log apply it, so undo works
        if (keep && value && value !== prev) edRef.current.push({ kind: 'text', path: pathOf(t), value, prev })
        t.removeEventListener('blur', onBlur)
        t.removeEventListener('keydown', onKey)
      }
      const onBlur = () => finish(true)
      const onKey = (k: KeyboardEvent) => {
        if (k.key === 'Enter') { k.preventDefault(); t.blur() }
        if (k.key === 'Escape') { k.preventDefault(); finish(false) }
      }
      t.addEventListener('blur', onBlur)
      t.addEventListener('keydown', onKey)
    })

    // keyboard: walk the tree, deselect, undo/redo (events inside the iframe don't reach the page)
    doc.addEventListener('keydown', (e) => handleKeys(e, doc))

    // let pinch / ⌘-scroll / scroll over the design still drive the canvas camera
    doc.addEventListener('wheel', (e) => {
      const fr = frame.current
      if (!fr) return
      e.preventDefault()
      const r = fr.getBoundingClientRect()
      const k = r.width / fr.offsetWidth
      fr.dispatchEvent(new WheelEvent('wheel', {
        deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey,
        clientX: r.left + e.clientX * k, clientY: r.top + e.clientY * k, bubbles: true, cancelable: true,
      }))
    }, { passive: false })
  }

  const handleKeys = (e: KeyboardEvent, doc?: Document) => {
    const api = edRef.current
    if (!editingRef.current) return
    const t = e.target as HTMLElement | null
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) api.redo(); else api.undo(); return }
    const cur = api.sel
    if (!cur) return
    if (e.key === 'Escape') { e.preventDefault(); api.select(null) }
    if (e.key === 'ArrowUp' && cur.parentElement && cur.parentElement !== (doc ?? api.doc)?.body) { e.preventDefault(); api.select(cur.parentElement) }
    if (e.key === 'ArrowDown' && cur.firstElementChild) { e.preventDefault(); api.select(cur.firstElementChild as HTMLElement) }
  }
  // the same keys work when focus is on the page (e.g. after clicking the inspector)
  useEffect(() => {
    const k = (e: KeyboardEvent) => handleKeys(e)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  return (
    <div className="relative">
      <iframe
        ref={frame}
        src={day.live}
        title={`Your remix of Day ${day.n}: ${day.title}`}
        tabIndex={editing ? 0 : -1}
        scrolling="no"
        onLoad={onLoad}
        className={'block w-full border-0 bg-transparent ' + (editing ? '' : 'pointer-events-none')}
        style={{ height: h }}
      />
      {editing && hoverLabel && (
        // element name chip, like a design tool's hover label (sits in design coordinates, so it zooms with it)
        <span className="pointer-events-none absolute z-10 -translate-y-full bg-chrome-selected px-1.5 py-0.5 text-caption font-semibold text-paper"
          style={{ left: hoverLabel.x, top: hoverLabel.y - 4 }}>{hoverLabel.text}</span>
      )}
    </div>
  )
}
