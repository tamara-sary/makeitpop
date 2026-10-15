import { useCallback, useEffect, useRef, useState } from 'react'
import { load, save } from '../lib/store'
import { contrast, effectiveBg, elAt, isTextLeaf, labelOf, parseColor, pathOf, readPalette, describeEdit } from './model'
import { buildHtml, saveAsShot } from './export'
import type { EditorApi } from './useEditor'

// Browser half of the Make It Pop MCP bridge: connects this editor tab to the local MCP server
// (ws://127.0.0.1:PORT) after the user types the pairing code, then executes the agent's requests
// with the same edit records a human makes (live, undoable, autosaved).

export type AgentStatus = 'off' | 'connecting' | 'connected' | 'error'
export type StickyOut = { name: string; level: string; text: string; agrees: number; x?: number; y?: number; mine?: boolean }

const STYLE_PROPS = new Set(['color', 'background-color', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'padding', 'gap', 'margin', 'border-radius', 'text-transform'])
const toPath = (s: string) => s.split('.').map(Number)

export function useAgentBridge({ ed, day, title, liveUrl, stickies, locked, hiddenCount }: {
  ed: EditorApi; day: number; title: string; liveUrl?: string; stickies: StickyOut[]; locked: boolean; hiddenCount: number
}) {
  const [status, setStatus] = useState<AgentStatus>('off')
  const [error, setError] = useState('')
  const ws = useRef<WebSocket | null>(null)
  const ctx = useRef({ ed, stickies, locked, hiddenCount, liveUrl })
  ctx.current = { ed, stickies, locked, hiddenCount, liveUrl }
  const port = load<number>('agent-port', 4917)

  const handle = useCallback(async (method: string, p: Record<string, unknown>): Promise<unknown> => {
    const { ed, stickies, locked, hiddenCount, liveUrl } = ctx.current
    const doc = ed.doc
    if (method === 'list_stickies') {
      // Blind audit applies to agents too: others' stickies stay hidden until the user adds one.
      return locked ? stickies.filter((s) => s.mine).concat(hiddenCount ? [{ name: 'Hidden', level: '', text: `${hiddenCount} other stickies stay hidden until the user pins their own.`, agrees: 0 }] : []) : stickies
    }
    if (!doc) throw new Error('The remix copy is still loading. Retry in a moment.')
    const need = (path: unknown) => {
      const el = typeof path === 'string' ? elAt(doc, toPath(path)) : null
      if (!el) throw new Error(`No element at path "${path}". Call makeitpop_get_design to get valid paths.`)
      return el
    }
    const win = doc.defaultView!
    switch (method) {
      case 'get_design': {
        const root = p.path ? need(p.path) : ((doc.querySelector('.app') as HTMLElement | null) ?? doc.body)
        const maxDepth = Number(p.depth ?? 3)
        const out: unknown[] = []
        const walk = (el: Element, depth: number) => {
          const cs = win.getComputedStyle(el)
          if (cs.display === 'none') return
          const styles: Record<string, string> = { color: cs.color, 'font-size': cs.fontSize, 'font-weight': cs.fontWeight }
          if (parseColor(cs.backgroundColor)?.[3]) styles['background-color'] = cs.backgroundColor
          if (cs.padding !== '0px') styles.padding = cs.padding
          if (/flex|grid/.test(cs.display) && cs.rowGap !== 'normal') styles.gap = cs.gap
          out.push({ path: pathOf(el).join('.'), label: labelOf(el), tag: el.tagName.toLowerCase(), ...(isTextLeaf(el) ? { text: (el.textContent ?? '').trim().slice(0, 120) } : {}), styles, children: el.children.length, depth })
          if (depth < maxDepth) for (const c of Array.from(el.children)) walk(c, depth + 1)
        }
        walk(root, 0)
        return out
      }
      case 'get_palette': return readPalette(doc)
      case 'check_contrast': {
        const el = need(p.path)
        const fg = parseColor(win.getComputedStyle(el).color)!
        const bg = effectiveBg(el)
        const ratio = contrast(fg, bg)
        const css = (c: number[]) => `rgb(${c.slice(0, 3).map(Math.round).join(', ')})`
        return { label: labelOf(el), ratio, fg: css(fg), bg: css(bg), aa: ratio >= 4.5, aaLarge: ratio >= 3 }
      }
      case 'select': { const el = need(p.path); ed.select(el); el.scrollIntoView?.({ block: 'nearest' }); return { label: labelOf(el) } }
      case 'edit_text': {
        const el = need(p.path)
        if (!isTextLeaf(el)) throw new Error(`${labelOf(el)} contains other elements, so its text can't be replaced. Pick a child that only holds text.`)
        const prev = el.textContent ?? ''
        ed.push({ kind: 'text', path: pathOf(el), value: String(p.text), prev, by: 'agent' })
        ed.select(el)
        return { label: labelOf(el), prev }
      }
      case 'set_style': {
        const el = need(p.path)
        const prop = String(p.property)
        if (!STYLE_PROPS.has(prop)) throw new Error(`"${prop}" isn't an allowed property.`)
        const value = String(p.value)
        if (!win.CSS.supports(prop, value)) throw new Error(`"${value}" isn't a valid value for ${prop}.`)
        const prev = el.style.getPropertyValue(prop)
        ed.push({ kind: 'style', path: pathOf(el), prop, value, prev, by: 'agent' })
        ed.select(el)
        return { label: labelOf(el), prev }
      }
      case 'set_palette': {
        const name = String(p.name)
        if (!readPalette(doc).some((c) => c.name === name)) throw new Error(`No palette colour "${name}". Call makeitpop_get_palette for the names.`)
        const prev = win.getComputedStyle(doc.documentElement).getPropertyValue(name).trim()
        ed.push({ kind: 'var', prop: name, value: String(p.value), prev: doc.documentElement.style.getPropertyValue(name), by: 'agent' })
        return { prev }
      }
      case 'undo': { const e = ed.undo(); return { undone: e ? describeEdit(e, doc) : null, remaining: Math.max(0, ed.edits.length - (e ? 1 : 0)) } }
      case 'reset': return { discarded: ed.reset() }
      case 'export_code': return { html: await buildHtml(doc, liveUrl ?? location.href), changes: ed.edits.length }
      case 'save_shot': {
        const saved = await saveAsShot(doc, day)
        return { saved, size: saved ? 'saved' : 'storage full' }
      }
      default: throw new Error(`Unknown request "${method}". Update the Make It Pop MCP server.`)
    }
  }, [day])

  const connect = useCallback((code: string) => {
    ws.current?.close()
    setStatus('connecting'); setError('')
    let sock: WebSocket
    try { sock = new WebSocket(`ws://127.0.0.1:${port}`) } catch { setStatus('error'); setError("This browser blocked the local connection. Try Chrome, Edge or Firefox."); return }
    ws.current = sock
    sock.onopen = () => sock.send(JSON.stringify({ type: 'hello', code: code.trim(), day, title, url: location.href }))
    sock.onmessage = async (ev) => {
      let msg: { type?: string; reason?: string; id?: number; method?: string; params?: Record<string, unknown> }
      try { msg = JSON.parse(String(ev.data)) } catch { return }
      if (msg.type === 'paired') { setStatus('connected'); save('agent-last', Date.now()); return }
      if (msg.type === 'rejected') { setStatus('error'); setError('Wrong pairing code. Ask your agent for the current code (it changes each time the server starts).'); return }
      if (typeof msg.id === 'number' && msg.method) {
        try { sock.send(JSON.stringify({ id: msg.id, result: await handle(msg.method, msg.params ?? {}) })) }
        catch (e) { sock.send(JSON.stringify({ id: msg.id, error: e instanceof Error ? e.message : String(e) })) }
      }
    }
    sock.onerror = () => { setStatus('error'); setError(`Can't reach the Make It Pop MCP server on this computer (port ${port}). Is it installed and is your agent running?`) }
    sock.onclose = () => { if (ws.current === sock) { setStatus((s) => (s === 'error' ? s : 'off')); ws.current = null } }
  }, [day, title, port, handle])

  const disconnect = useCallback(() => { ws.current?.close(); ws.current = null; setStatus('off') }, [])
  useEffect(() => () => ws.current?.close(), [])

  return { status, error, connect, disconnect }
}
