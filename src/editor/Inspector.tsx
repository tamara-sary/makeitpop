import { useState, type ReactNode } from 'react'
import { contrast, effectiveBg, isTextLeaf, labelOf, parseColor, pathOf, readPalette, toHex } from './model'
import type { EditorApi } from './useEditor'

// Right-hand inspector for Editor V1: text, colour (with live WCAG contrast), spacing and size.
// Design-tool chrome (tokens: chrome-*), not brand neubrutalism, so it reads as "the tool", not the challenge.

const btn = 'inline-flex min-h-7 cursor-pointer items-center justify-center gap-1 rounded-chrome border border-chrome-border bg-chrome-bg px-2 text-ui font-semibold text-chrome-text hover:bg-chrome-subtle disabled:cursor-not-allowed disabled:opacity-40'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-caption font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </div>
  )
}

function Stepper({ label, value, step, min = 0, onChange }: { label: string; value: number; step: number; min?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ui text-chrome-text">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" className={btn + ' w-7'} aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}>−</button>
        <span className="w-12 text-center text-ui tabular-nums text-chrome-text">{Math.round(value)}px</span>
        <button type="button" className={btn + ' w-7'} aria-label={`Increase ${label}`} onClick={() => onChange(value + step)}>+</button>
      </div>
    </div>
  )
}

function ContrastBadge({ fg, bg }: { fg: string; bg: [number, number, number, number] }) {
  const c = parseColor(fg)
  if (!c) return null
  const ratio = contrast(c, bg)
  const pass = ratio >= 4.5
  const large = ratio >= 3
  return (
    <span className={'inline-flex w-fit items-center gap-1.5 rounded-chrome border px-2 py-1 text-caption font-bold ' + (pass ? 'border-leaf text-leaf' : 'border-ink bg-sun text-ink')}
      title="WCAG contrast of this text against what's behind it">
      {pass ? '✓' : '!'} {ratio.toFixed(1)}:1 {pass ? 'AA' : large ? 'AA large text only' : 'fails AA'}
    </span>
  )
}

function Swatches({ doc, current, onPick }: { doc: Document; current: string; onPick: (v: string) => void }) {
  const palette = readPalette(doc)
  const cur = toHex(current).toLowerCase()
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {palette.map((p) => (
        <button key={p.name} type="button" title={p.name.replace('--', '')} aria-label={`Use ${p.name.replace('--', '')}`}
          aria-pressed={toHex(p.value).toLowerCase() === cur}
          onClick={() => onPick(`var(${p.name})`)}
          className="h-6 w-6 cursor-pointer rounded-full border border-chrome-border aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-chrome-selected"
          style={{ background: p.value }} />
      ))}
      <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-dashed border-chrome-border" title="Custom colour">
        <span className="sr-only">Custom colour</span>
        <input type="color" value={cur} onChange={(e) => onPick(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </label>
    </div>
  )
}

export function Inspector({ ed, onExportCode, onUseAsShot, busy, onClose }: { ed: EditorApi; onExportCode: () => void; onUseAsShot: () => void; busy: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'element' | 'palette'>('element')
  const el = ed.sel
  const doc = ed.doc
  const win = doc?.defaultView

  const style = (prop: string, value: string) => {
    if (!el) return
    ed.push({ kind: 'style', path: pathOf(el), prop, value, prev: el.style.getPropertyValue(prop) })
  }

  const cs = el && win ? win.getComputedStyle(el) : null
  const px = (v: string | undefined) => parseFloat(v ?? '0') || 0
  const pad = cs ? [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)] : [0, 0, 0, 0]
  const isLayout = !!cs && /flex|grid/.test(cs.display)

  return (
    <aside aria-label="Inspector" className="pointer-events-auto flex max-h-full w-[300px] flex-col overflow-hidden rounded-chrome-lg border border-chrome-border bg-chrome-bg text-chrome-text shadow-pop-sm">
      <div className="flex items-center gap-1 border-b border-chrome-border p-1.5" role="tablist" aria-label="Inspector">
        {(['element', 'palette'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={'cursor-pointer rounded-chrome border-0 px-2.5 py-1.5 text-ui font-semibold ' + (tab === t ? 'bg-chrome-selected text-paper' : 'bg-transparent text-chrome-text hover:bg-chrome-subtle')}>
            {t === 'element' ? 'Element' : 'Palette'}
          </button>
        ))}
        <span className="ml-auto flex gap-1">
          <button type="button" className={btn + ' w-7'} onClick={ed.undo} disabled={!ed.edits.length} title="Undo (⌘Z)" aria-label="Undo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg></button>
          <button type="button" className={btn + ' w-7'} onClick={ed.redo} disabled={!ed.canRedo} title="Redo (⇧⌘Z)" aria-label="Redo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 14l5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" /></svg></button>
          <button type="button" className={btn + ' w-7'} onClick={onClose} title="Close (your edits stay)" aria-label="Close inspector and stop editing"><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" /></svg></button>
        </span>
      </div>

      <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto p-3">
        {tab === 'palette' && doc && (
          <Row label="Design palette · changes it everywhere">
            <ul className="m-0 grid list-none gap-1.5 p-0">
              {readPalette(doc).map((p) => (
                <li key={p.name} className="flex items-center gap-2">
                  <label className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-chrome border border-chrome-border" style={{ background: p.value }}>
                    <span className="sr-only">Change {p.name}</span>
                    <input type="color" value={toHex(p.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={(e) => ed.push({ kind: 'var', prop: p.name, value: e.target.value, prev: doc.documentElement.style.getPropertyValue(p.name) })} />
                  </label>
                  <span className="min-w-0 flex-1 truncate text-ui">{p.name.replace('--', '')}</span>
                  <span className="text-caption tabular-nums text-muted">{toHex(p.value)}</span>
                </li>
              ))}
            </ul>
          </Row>
        )}

        {tab === 'element' && !el && (
          <p className="text-body-sm text-muted">Click anything in your copy to select it. Double-click text to rewrite it. ↑ ↓ move to the parent or child.</p>
        )}

        {tab === 'element' && el && cs && (
          <>
            <div className="flex items-center justify-between gap-2">
              <strong className="min-w-0 truncate text-body-sm">{labelOf(el)}</strong>
              <button type="button" className={btn} onClick={() => el.parentElement && el.parentElement !== doc?.body && ed.select(el.parentElement)} title="Select parent (↑)">Parent ↑</button>
            </div>

            {isTextLeaf(el) && (
              <Row label="Text">
                <textarea key={pathOf(el).join('.') + (el.textContent ?? '')} defaultValue={el.textContent ?? ''} rows={2}
                  className="w-full resize-y rounded-chrome border border-chrome-border bg-chrome-bg p-2 text-body-sm text-chrome-text"
                  onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== el.textContent) ed.push({ kind: 'text', path: pathOf(el), value: v, prev: el.textContent ?? '' }) }} />
              </Row>
            )}

            <Row label="Text colour">
              <Swatches doc={doc!} current={cs.color} onPick={(v) => style('color', v)} />
              <ContrastBadge fg={cs.color} bg={effectiveBg(el)} />
            </Row>

            <Row label="Background">
              <Swatches doc={doc!} current={cs.backgroundColor} onPick={(v) => style('background-color', v)} />
            </Row>

            <Row label="Size & spacing">
              <div className="grid gap-1.5">
                <Stepper label="Font size" value={px(cs.fontSize)} step={1} min={8} onChange={(v) => style('font-size', v + 'px')} />
                <Stepper label="Padding" value={Math.max(...pad)} step={4} onChange={(v) => {
                  const d = v - Math.max(...pad)
                  style('padding', pad.map((p) => Math.max(0, p + d) + 'px').join(' '))
                }} />
                {isLayout && <Stepper label="Gap" value={px(cs.rowGap === 'normal' ? '0' : cs.rowGap)} step={4} onChange={(v) => style('gap', v + 'px')} />}
              </div>
            </Row>
          </>
        )}
      </div>

      <div className="grid gap-1.5 border-t border-chrome-border p-2">
        <div className="flex gap-1.5">
          <button type="button" className={btn + ' flex-1'} onClick={onExportCode}>Download code</button>
          <button type="button" className={btn + ' flex-1 border-chrome-selected bg-chrome-selected text-paper hover:bg-chrome-selected'} onClick={onUseAsShot} disabled={busy}>
            {busy ? 'Saving…' : 'Use as my remix shot'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-caption text-muted">{ed.edits.length} change{ed.edits.length === 1 ? '' : 's'}{ed.edits.some((e) => e.by === 'agent') ? ` (${ed.edits.filter((e) => e.by === 'agent').length} by your AI)` : ''} · saved here</span>
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-caption font-semibold text-chrome-text underline" onClick={ed.reset} disabled={!ed.edits.length}>Reset to original</button>
        </div>
      </div>
    </aside>
  )
}
