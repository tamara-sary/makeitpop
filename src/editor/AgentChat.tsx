import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { CopyButton } from '../components/ui'
import type { ChatLine } from './agentBridge'

// Chat with the user's OWN agent (Claude Code, Cursor…) from inside the editor.
// This panel only relays text over the local MCP bridge: the agent on the user's machine does the thinking
// and the edits, on their own plan. Make It Pop never calls an AI itself, so it costs us nothing per message.

export const LISTEN_CMD = 'Listen to Make It Pop'
const SUGGESTIONS = ['Make the headline clearer for Maya', 'Fix any text that fails contrast', 'Apply the top sticky’s idea']

const iconBtn = 'inline-grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-chrome border-0 bg-transparent text-chrome-text hover:bg-chrome-subtle'

export function AgentChat({ chat, listening, working, onSend, onClose, onDisconnect }: {
  chat: ChatLine[]; listening: boolean; working: boolean; onSend: (text: string) => boolean; onClose: () => void; onDisconnect: () => void
}) {
  const [text, setText] = useState('')
  const list = useRef<HTMLOListElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  // keep the newest message in view
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }) }, [chat.length, working])
  useEffect(() => { input.current?.focus() }, [])

  const send = (t: string) => { if (onSend(t)) setText('') }
  const submit = (e: FormEvent) => { e.preventDefault(); send(text) }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(text) }
    if (e.key === 'Escape') onClose()
  }
  const waiting = chat.filter((l) => l.from === 'you' && !l.picked).length

  return (
    <aside aria-label="Chat with your AI" className="pointer-events-auto flex max-h-full w-[320px] flex-col overflow-hidden rounded-chrome-lg border border-chrome-border bg-chrome-bg text-chrome-text shadow-pop-sm">
      <header className="flex items-center gap-2 border-b border-chrome-border px-3 py-2">
        <span className={'h-2 w-2 shrink-0 rounded-full ' + (listening || working ? 'bg-leaf' : 'bg-chrome-border')} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold">Your AI</p>
          <p className="text-caption text-muted" role="status">{working ? 'Working on it…' : listening ? 'Listening' : 'Connected, not listening yet'}</p>
        </div>
        <button type="button" className={iconBtn} aria-label="Close chat" title="Close (Esc)" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </header>

      {!listening && !working && (
        <div className="grid gap-1.5 border-b border-chrome-border bg-chrome-subtle px-3 py-2.5 text-ui">
          <span>To chat from here, tell your agent once:</span>
          <code className="w-fit rounded-chrome bg-chrome-bg px-2 py-1 text-caption">{LISTEN_CMD}</code>
          <CopyButton text={LISTEN_CMD} label="Copy" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-caption font-semibold underline" />
          {waiting > 0 && <span className="text-caption text-muted">{waiting} message{waiting === 1 ? '' : 's'} waiting. Your AI picks them up when it starts listening.</span>}
        </div>
      )}

      <ol ref={list} className="m-0 grid min-h-24 flex-1 list-none content-start gap-2 overflow-y-auto p-3" aria-live="polite" aria-label="Messages">
        {chat.length === 0 && (
          <li className="grid gap-2">
            <p className="text-body-sm text-muted">Ask for a change. It shows up live in “Your remix”, and you can undo it.</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="cursor-pointer rounded-chrome border border-chrome-border bg-chrome-bg px-2 py-1 text-left text-caption font-semibold text-chrome-text hover:bg-chrome-subtle" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </li>
        )}
        {chat.map((l) => (
          <li key={l.id} className={'grid max-w-[85%] gap-0.5 ' + (l.from === 'you' ? 'justify-self-end' : 'justify-self-start')}>
            <span className="sr-only">{l.from === 'you' ? 'You:' : 'Your AI:'}</span>
            <p className={'m-0 whitespace-pre-wrap rounded-chrome px-2.5 py-1.5 text-body-sm ' + (l.from === 'you' ? 'bg-chrome-selected text-paper' : 'bg-chrome-subtle text-chrome-text')}>{l.text}</p>
            {l.from === 'you' && !l.picked && <span className="justify-self-end text-micro text-muted">Waiting for your AI</span>}
          </li>
        ))}
        {working && <li className="text-caption text-muted">Your AI is editing…</li>}
      </ol>

      <form onSubmit={submit} className="grid gap-2 border-t border-chrome-border p-2">
        <label htmlFor="agent-chat-input" className="sr-only">Message your AI</label>
        <textarea id="agent-chat-input" ref={input} rows={2} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey}
          placeholder="Ask for a change…" className="w-full resize-none rounded-chrome border border-chrome-border bg-chrome-bg px-2 py-1.5 text-body-sm text-chrome-text" />
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-caption text-muted underline" onClick={onDisconnect}>Disconnect</button>
          <span className="text-micro text-muted">Enter to send</span>
          <button type="submit" className="btn btn-sm" disabled={!text.trim()}>Send</button>
        </div>
      </form>
    </aside>
  )
}
