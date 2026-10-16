import { useEffect, useState } from 'react'
import { track } from '../lib/analytics'
import { CopyButton } from '../components/ui'
import type { AgentStatus } from './agentBridge'

// "Connect your AI": pair this editor tab with the Make It Pop MCP server running next to the user's agent.
// A popover (not a modal): the canvas stays visible, so the user can watch the agent's edits arrive.
export const INSTALL_CMD = 'claude mcp add makeitpop -- npx -y makeitpop-mcp-server'

export function AgentConnect({ status, error, onConnect, onDisconnect, seg, onOpen }: {
  status: AgentStatus; error: string; onConnect: (code: string) => void; onDisconnect: () => void; seg: (on: boolean) => string; onOpen?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const on = status === 'connected'
  // once paired, get out of the way so the user watches the canvas, not the dialog
  useEffect(() => { if (on) track('ai_connected') }, [on])
  useEffect(() => { if (on) { const t = setTimeout(() => setOpen(false), 1200); return () => clearTimeout(t) } }, [on])
  return (
    <div className="relative">
      <button type="button" className={seg(on || open)} aria-expanded={open} aria-controls="agent-connect" onClick={() => { if (!open) onOpen?.(); setOpen(!open) }}>
        <span className={'h-2 w-2 rounded-full ' + (on ? 'bg-leaf' : 'bg-chrome-border')} aria-hidden="true" />
        {on ? 'AI connected' : 'Connect your AI'}
      </button>
      {open && (
        <div id="agent-connect" role="dialog" aria-label="Connect your AI agent"
          className="absolute right-0 top-[calc(100%+8px)] z-40 grid w-[360px] gap-4 rounded-chrome-lg border border-chrome-border bg-chrome-bg p-4 text-chrome-text shadow-pop-sm">
          {on ? (
            <>
              <p className="text-body font-semibold">Your AI is connected.</p>
              <p className="text-body-sm text-muted">Ask it to remix today's design. Its changes appear live in "Your remix", marked as agent changes, and you can undo any of them.</p>
              <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => { onDisconnect(); setOpen(false) }}>Disconnect</button>
            </>
          ) : (
            <>
              <p className="text-body font-semibold">Remix with Claude Code, Cursor or any MCP agent</p>
              <ol className="m-0 grid list-none gap-3 p-0 text-body-sm">
                <li className="grid gap-1.5">
                  <span><b>1.</b> Add Make It Pop to your agent (once):</span>
                  <code className="block overflow-x-auto whitespace-nowrap rounded-chrome bg-chrome-subtle px-2 py-1.5 text-caption">{INSTALL_CMD}</code>
                  <CopyButton text={INSTALL_CMD} label="Copy command" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-caption font-semibold underline" />
                </li>
                <li><b>2.</b> Ask your agent: <i>“Connect to Make It Pop”</i>. It shows a 6-digit code.</li>
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
