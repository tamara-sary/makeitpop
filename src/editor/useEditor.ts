import { useCallback, useRef, useState } from 'react'
import { load, save } from '../lib/store'
import { applyEdit, elAt, pathOf, type Edit } from './model'

// Editor state shared by the editable design (inside the canvas), the inspector (screen overlay)
// and the agent bridge (Claude via MCP). Edits persist per day in this browser and are replayed on load.
// The edit list lives in a ref (source of truth) so rapid agent edits never overwrite each other;
// React state just mirrors it for rendering.
export function useEditor(day: number) {
  const key = `edits:${day}`
  const [doc, setDoc] = useState<Document | null>(null)
  const docRef = useRef<Document | null>(null)
  const [sel, setSel] = useState<HTMLElement | null>(null)
  const list = useRef<Edit[]>(load<Edit[]>(key, []))
  const [edits, setEdits] = useState<Edit[]>(list.current)
  const redo = useRef<Edit[]>([])

  const commit = useCallback((next: Edit[]) => { list.current = next; setEdits(next); save(key, next) }, [key])

  // Called by the iframe once loaded: replay saved edits so the remix looks like you left it.
  const attach = useCallback((d: Document) => {
    for (const e of list.current) applyEdit(d, e)
    docRef.current = d
    setDoc(d)
  }, [])

  const push = useCallback((e: Edit) => {
    const d = docRef.current
    if (!d || e.value === e.prev) return false
    applyEdit(d, e)
    redo.current = []
    commit([...list.current, e])
    return true
  }, [commit])

  const undo = useCallback((): Edit | null => {
    const d = docRef.current
    const last = list.current[list.current.length - 1]
    if (!d || !last) return null
    applyEdit(d, last, true)
    redo.current.push(last)
    commit(list.current.slice(0, -1))
    return last
  }, [commit])

  const redoOne = useCallback(() => {
    const d = docRef.current
    const next = redo.current.pop()
    if (!d || !next) return
    applyEdit(d, next)
    commit([...list.current, next])
  }, [commit])

  const reset = useCallback(() => {
    const d = docRef.current
    const n = list.current.length
    if (!d) return 0
    for (const e of [...list.current].reverse()) applyEdit(d, e, true)
    redo.current = []
    commit([])
    setSel(null)
    return n
  }, [commit])

  const select = useCallback((el: HTMLElement | null) => {
    const d = docRef.current
    setSel(d && el ? elAt(d, pathOf(el)) : null)
  }, [])

  return { doc, sel, select, edits, push, undo, redo: redoOne, canRedo: redo.current.length > 0, reset, attach }
}

export type EditorApi = ReturnType<typeof useEditor>
