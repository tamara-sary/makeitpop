import { useCallback, useRef, useState } from 'react'
import { load, save } from '../lib/store'
import { applyEdit, elAt, pathOf, type Edit } from './model'

// Editor state shared by the editable design (inside the canvas) and the inspector (screen overlay).
// Edits persist per day in this browser and are replayed onto the fresh design whenever it loads.
export function useEditor(day: number) {
  const key = `edits:${day}`
  const [doc, setDoc] = useState<Document | null>(null)
  const [sel, setSel] = useState<HTMLElement | null>(null)
  const [edits, setEdits] = useState<Edit[]>(() => load<Edit[]>(key, []))
  const redo = useRef<Edit[]>([])
  const [, bump] = useState(0) // re-render after DOM-only changes (e.g. selection styles)

  const commit = useCallback((list: Edit[]) => { setEdits(list); save(key, list) }, [key])

  // Called by the iframe once loaded: replay saved edits so the remix looks like you left it.
  const attach = useCallback((d: Document) => {
    for (const e of load<Edit[]>(key, [])) applyEdit(d, e)
    setDoc(d)
  }, [key])

  const push = useCallback((e: Edit) => {
    if (!doc || e.value === e.prev) return
    applyEdit(doc, e)
    redo.current = []
    commit([...edits, e])
    bump((n) => n + 1)
  }, [doc, edits, commit])

  const undo = useCallback(() => {
    const last = edits[edits.length - 1]
    if (!doc || !last) return
    applyEdit(doc, last, true)
    redo.current.push(last)
    commit(edits.slice(0, -1))
  }, [doc, edits, commit])

  const redoOne = useCallback(() => {
    const next = redo.current.pop()
    if (!doc || !next) return
    applyEdit(doc, next)
    commit([...edits, next])
  }, [doc, edits, commit])

  const reset = useCallback(() => {
    if (!doc) return
    for (const e of [...edits].reverse()) applyEdit(doc, e, true)
    redo.current = []
    commit([])
    setSel(null)
  }, [doc, edits, commit])

  // Selection survives undo/redo of text (the element stays), but re-find it by path to be safe.
  const select = useCallback((el: HTMLElement | null) => {
    if (doc && el) {
      const again = elAt(doc, pathOf(el))
      setSel(again)
    } else setSel(null)
  }, [doc])

  return { doc, sel, select, edits, push, undo, redo: redoOne, canRedo: redo.current.length > 0, reset, attach, refresh: () => bump((n) => n + 1) }
}

export type EditorApi = ReturnType<typeof useEditor>
