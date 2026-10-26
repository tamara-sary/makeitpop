// Live bridge between this MCP server and an open Make It Pop editor tab.
// The server listens on 127.0.0.1 only. A tab must present the pairing code before any message is trusted,
// and only makeitpop.work / localhost origins may even open the socket.
import { randomInt } from 'node:crypto'
import { WebSocketServer, type WebSocket } from 'ws'

const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?makeitpop\.work$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/]

export type EditorInfo = { day: number; title: string; url: string; connectedAt: number }

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }
export type ChatMessage = { id: string; text: string; at: number }
const MAX_INBOX = 20
const MAX_CHAT = 2000

export class EditorBridge {
  readonly code = String(randomInt(100000, 1000000)) // 6 digits, new every server start
  readonly port: number
  private wss: WebSocketServer | null = null
  private socket: WebSocket | null = null
  private info: EditorInfo | null = null
  private pending = new Map<number, Pending>()
  private nextId = 1
  // Chat typed in the Make It Pop panel, waiting for the agent to pick it up (makeitpop_wait_for_message)
  private inbox: ChatMessage[] = []
  private waiter: { resolve: (m: ChatMessage | null) => void; timer: NodeJS.Timeout } | null = null
  listenError: string | null = null

  constructor(port: number) { this.port = port }

  start() {
    this.wss = new WebSocketServer({
      host: '127.0.0.1',
      port: this.port,
      verifyClient: ({ origin }: { origin: string }) => ALLOWED_ORIGINS.some((re) => re.test(origin ?? '')),
    })
    this.wss.on('error', (e: NodeJS.ErrnoException) => {
      this.listenError = e.code === 'EADDRINUSE'
        ? `Port ${this.port} is already in use (is another Make It Pop MCP server running?). Set MAKEITPOP_PORT to another port.`
        : e.message
      console.error('[makeitpop] bridge error:', this.listenError)
    })
    this.wss.on('connection', (ws) => this.onConnection(ws))
  }

  private onConnection(ws: WebSocket) {
    let paired = false
    const kick = setTimeout(() => { if (!paired) ws.close(4001, 'pairing timeout') }, 30_000)
    ws.on('message', (raw) => {
      let msg: { type?: string; code?: string; day?: number; title?: string; url?: string; id?: number; result?: unknown; error?: string; text?: unknown; chatId?: unknown }
      try { msg = JSON.parse(String(raw)) } catch { return }
      if (!paired) {
        if (msg.type === 'hello' && msg.code === this.code) {
          paired = true
          clearTimeout(kick)
          this.socket?.close(4000, 'replaced by a newer editor tab')
          this.socket = ws
          this.info = { day: Number(msg.day) || 0, title: String(msg.title ?? ''), url: String(msg.url ?? ''), connectedAt: Date.now() }
          ws.send(JSON.stringify({ type: 'paired' }))
          this.sendState()
          console.error(`[makeitpop] editor connected: Day ${this.info.day}`)
        } else {
          ws.send(JSON.stringify({ type: 'rejected', reason: 'wrong pairing code' }))
          ws.close(4003, 'wrong pairing code')
        }
        return
      }
      if (msg.type === 'chat' && typeof msg.text === 'string') {
        const text = msg.text.trim().slice(0, MAX_CHAT)
        if (!text) return
        const m: ChatMessage = { id: String(msg.chatId ?? Date.now()), text, at: Date.now() }
        if (this.waiter) { const w = this.waiter; this.waiter = null; clearTimeout(w.timer); this.ack(m); w.resolve(m) }
        else { this.inbox.push(m); if (this.inbox.length > MAX_INBOX) this.inbox.shift() }
        return
      }
      if (typeof msg.id === 'number' && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id)!
        this.pending.delete(msg.id)
        clearTimeout(p.timer)
        if (msg.error) p.reject(new Error(msg.error))
        else p.resolve(msg.result)
      }
    })
    ws.on('close', () => {
      clearTimeout(kick)
      if (this.socket === ws) { this.socket = null; this.info = null; this.inbox = []; console.error('[makeitpop] editor disconnected') }
    })
  }

  // ---- chat ----
  private sendState() { this.socket?.send(JSON.stringify({ type: 'agent_state', listening: !!this.waiter })) }
  private ack(m: ChatMessage) { this.socket?.send(JSON.stringify({ type: 'chat_ack', chatId: m.id })) }

  // Resolves with the next chat message, or null after timeoutMs (the agent should then call again).
  waitForMessage(timeoutMs: number): Promise<ChatMessage | null> {
    const next = this.inbox.shift()
    if (next) { this.ack(next); return Promise.resolve(next) }
    if (this.waiter) { clearTimeout(this.waiter.timer); this.waiter.resolve(null) }
    return new Promise((resolve) => {
      const timer = setTimeout(() => { if (this.waiter?.timer === timer) { this.waiter = null; this.sendState() } resolve(null) }, timeoutMs)
      this.waiter = { resolve, timer }
      this.sendState()
    })
  }

  reply(text: string): boolean {
    if (!this.socket) return false
    this.socket.send(JSON.stringify({ type: 'chat_reply', text: text.slice(0, MAX_CHAT) }))
    return true
  }

  status() { return { connected: !!this.socket, editor: this.info, code: this.code, port: this.port, listenError: this.listenError } }

  // Ask the editor tab to do something. Rejects with an actionable message when no tab is paired.
  call<T = unknown>(method: string, params: Record<string, unknown> = {}, timeoutMs = 15_000): Promise<T> {
    const ws = this.socket
    if (!ws) {
      return Promise.reject(new Error(
        `No Make It Pop editor is connected. Ask the user to open https://www.makeitpop.work/today on a laptop, ` +
        `click "Connect your AI" in the canvas bar and enter pairing code ${this.code}. Then retry.`))
    }
    const id = this.nextId++
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`The editor tab didn't answer "${method}" in time. Is the tab still open?`)) }, timeoutMs)
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
}
