import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { TODAY } from '../data/days'
import { copyText } from '../lib/store'

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link to="/" className="inline-flex items-center gap-[0.14em] font-display font-extrabold tracking-[-0.035em] no-underline text-ink" style={{ fontSize: size, lineHeight: 1 }} aria-label="Make It Pop, home">
      <span>Make it</span>
      <span className="pop-sticker">pop</span>
    </Link>
  )
}

export function MenuBar() {
  const link = ({ isActive }: { isActive: boolean }) =>
    'px-2 py-1 no-underline ' + (isActive ? 'bg-ink text-cream' : 'text-ink hover:bg-sun')
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-[15px] font-semibold" aria-label="Main">
        <span className="mr-1 h-4 w-4 rounded-full border-2 border-ink bg-pink" aria-hidden="true" />
        <NavLink to="/" end className={link}>Today</NavLink>
        <NavLink to="/archive" className={link}>Archive</NavLink>
        <NavLink to="/steam-room" className={link}>Steam room</NavLink>
        <NavLink to="/how-it-works" className={link}>How it works</NavLink>
        <span className="ml-auto font-pixel text-[12px]">DAY {String(TODAY).padStart(2, '0')} / 30</span>
      </nav>
    </header>
  )
}

export function Win({ title, children, className = '', bodyClass = 'p-4 sm:p-5' }: { title: string; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={'win ' + className} aria-label={title}>
      <div className="tbar"><span className="x" aria-hidden="true" /><span className="title">{title}</span></div>
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

/* ---------- toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout((show as unknown as { t?: number }).t)
    ;(show as unknown as { t?: number }).t = window.setTimeout(() => setMsg(null), 2400)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {msg && <div className="win px-4 py-3 font-bold">{msg}</div>}
      </div>
    </ToastCtx.Provider>
  )
}

export function CopyButton({ text, label, done = 'Copied', className = 'btn btn-ghost btn-sm' }: { text: string; label: string; done?: string; className?: string }) {
  const toast = useToast()
  return (
    <button
      type="button"
      className={className}
      onClick={async () => toast((await copyText(text)) ? done : 'Copy blocked. Select the text and copy it manually.')}
    >
      {label}
    </button>
  )
}

export function PrototypeNote() {
  return (
    <p className="text-center text-[13px] text-muted">
      Prototype v0 · sample content is marked "sample" · anything you add is saved on this device only
    </p>
  )
}
