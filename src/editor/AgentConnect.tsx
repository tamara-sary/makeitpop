import { useEffect, useRef, useState } from 'react'
import { CopyButton } from '../components/ui'
import type { AgentStatus } from './agentBridge'

// "Connect your AI": pair this editor tab with the Make It Pop MCP server running next to the user's agent.
// A popover (not a modal): the canvas stays visible, so the user can watch the agent's edits arrive.
export const INSTALL_CMD = 'claude mcp add makeitpop -- npx -y makeitpop-mcp-server'

export function AgentConnect({ status, error, onConnect, onDisconnect, seg, chatOpen, onToggleChat }: {
  status: AgentStatus; error: string; onConnect: (code: string) => void; onDisconnect: () => void; seg: (on: boolean) => string
  chatOpen: boolean; onToggleChat: () => void
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const on = status === 'connected'
  // once paired, get out of the way so the user watches the canvas, not the dialog
  useEffect(() => { if (on) { const t = setTimeout(() => setOpen(false), 1200); return () => clearTimeout(t) } }, [on])
  // Esc or a click outside closes it, like every other card on the canvas
  const box = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    // clicks inside the design iframe never reach this document; the window losing focus to it is the signal
    const onBlur = () => setTimeout(() => { if (document.activeElement?.tagName === 'IFRAME') setOpen(false) })
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('blur', onBlur)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); window.removeEventListener('blur', onBlur) }
  }, [open])
  const close = () => { setOpen(false); btn.current?.focus() }
  return (
    <div ref={box} className="relative">
      <button ref={btn} type="button" className={seg(on || open)} aria-expanded={on ? chatOpen : open} aria-controls={on ? undefined : 'agent-connect'}
        title={on ? (chatOpen ? 'Hide chat' : 'Chat with your AI') : undefined} onClick={() => (on ? onToggleChat() : setOpen(!open))}>
        <span className={'h-2 w-2 rounded-full ' + (on ? 'bg-leaf' : 'bg-chrome-border')} aria-hidden="true" />
        {on ? 'AI connected' : 'Connect your AI'}
      </button>
      {open && !on && (
        <div id="agent-connect" role="dialog" aria-label="Connect your AI agent"
          className="absolute right-0 top-[calc(100%+8px)] z-40 grid w-[360px] gap-4 rounded-chrome-lg border border-chrome-border bg-chrome-bg p-4 text-chrome-text shadow-pop-sm">
          {on ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-body font-semibold">Your AI is connected.</p>
                <button type="button" className="inline-grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-chrome border-0 bg-transparent text-chrome-text hover:bg-chrome-subtle" aria-label="Close" onClick={close}><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" /></svg></button>
              </div>
              <p className="text-body-sm text-muted">Ask it to remix today's design. Its changes appear live in "Your remix", marked as agent changes, and you can undo any of them.</p>
              <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => { onDisconnect(); setOpen(false) }}>Disconnect</button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-body font-semibold">Remix with Claude Code, Cursor or any MCP agent</p>
                <button type="button" className="inline-grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-chrome border-0 bg-transparent text-chrome-text hover:bg-chrome-subtle" aria-label="Close" onClick={close}><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" /></svg></button>
              </div>
              <ol className="m-0 grid list-none gap-3 p-0 text-body-sm">
                <li className="grid gap-1.5">
                  <span><b>1.</b> Add Make It Pop to your agent (once):</span>
                  <code className="block overflow-x-auto whitespace-nowrap rounded-chrome bg-chrome-subtle px-2 py-1.5 text-caption">{INSTALL_CMD}</code>
                  <CopyButton text={INSTALL_CMD} label="Copy command" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-caption font-semibold underline" />
                </li>
                <li><b>2.</b> Ask your agent: <i>“Connect to Make It Pop and listen”</i>. It shows a 6-digit code.</li>
                <li className="grid gap-1.5">
                  <label htmlFor="agent-code"><b>3.</b> Enter the code:</label>
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim().length === 6) onConnect(code) }}>
                    <input id="agent-code" inputMode="numeric" autoComplete="off" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-28 rounded-chrome border border-chrome-border bg-chrome-bg px-2 py-1.5 text-body tracking-widest text-chrome-text" placeholder="123456" />
                    <button type="submit" className="btn btn-sm" disabled={code.length !== 6 || status === 'connecting'}>{status === 'connecting' ? 'Connecting…' : 'Connect'}</button>
                  </form>
                </li>
              </ol>
              {status === 'error' && <p role="alert" className="border-2 border-ink bg-sun p-2 text-body-sm">{error}</p>}
              <p className="text-caption text-muted">Runs on your computer: the agent talks to this tab only, nothing goes through our servers. Your browser may ask to allow access to local devices.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
