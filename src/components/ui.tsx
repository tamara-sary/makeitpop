import { createContext, useCallback, useContext, useState, type HTMLAttributes, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { TODAY } from '../data/days'
import { copyText } from '../lib/store'
import { useProfile } from '../lib/profile'

// `animated` (landing hero only): the "pop" sticker springs in with comic burst lines, then hops now and then.
export function Logo({ size = 34, animated = false }: { size?: number | string; animated?: boolean }) {
  return (
    <Link to="/" className={'inline-flex items-center gap-[0.14em] whitespace-nowrap font-display font-extrabold tracking-[-0.035em] no-underline text-ink' + (animated ? ' pop-anim' : '')} style={{ fontSize: size, lineHeight: 1 }} aria-label="Make It Pop, home">
      <span>Make it</span>
      <span className="pop-sticker">
        pop
        {animated && (
          <svg className="pop-burst" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M8 30 L2 38 M20 22 L20 4 M28 26 L38 16 M30 34 L40 34" stroke="#161616" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </span>
    </Link>
  )
}

export function MenuBar() {
  const [profile] = useProfile()
  const link = ({ isActive }: { isActive: boolean }) =>
    'px-2 py-1 no-underline ' + (isActive ? 'bg-ink text-cream' : 'text-ink hover:bg-sun')
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-[15px] font-semibold" aria-label="Main">
        <span className="mr-2"><Logo size={20} /></span>
        <NavLink to="/today" className={link}>Today</NavLink>
        <NavLink to="/archive" className={link}>Archive</NavLink>
        <NavLink to="/steam-room" className={link}>Steam room</NavLink>
        <span className="ml-auto font-pixel text-[12px]">DAY {String(TODAY).padStart(2, '0')} / 30</span>
        <NavLink to="/me" className={link}>{profile ? profile.name : 'Join'}</NavLink>
      </nav>
    </header>
  )
}

export function TitleBar({ title, onClose, className = '', ...rest }: { title: string; onClose?: () => void; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={'tbar ' + className} {...rest}>
      <span className="title">{title}</span>
      {onClose && (
        <button type="button" className="close" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label={`Close ${title}`}>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      )}
    </div>
  )
}

export function Win({ title, children, className = '', bodyClass = 'p-4 sm:p-5', onClose }: { title: string; children: ReactNode; className?: string; bodyClass?: string; onClose?: () => void }) {
  return (
    <section className={'win ' + className} aria-label={title}>
      <TitleBar title={title} onClose={onClose} />
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
      Prototype v1 · sample content is marked "sample" · anything you add is saved on this device only
    </p>
  )
}
