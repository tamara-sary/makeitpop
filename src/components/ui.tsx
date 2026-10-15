import { createContext, useCallback, useContext, useState, type HTMLAttributes, type ReactNode } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { TODAY } from '../data/days'
import { copyText } from '../lib/store'
import { useProfile } from '../lib/profile'
import { useStored } from '../lib/store'
import { setSoundOn } from '../lib/sound'

// `animated` (landing hero only): the "pop" sticker springs in with comic burst lines, then hops now and then.
export function Logo({ size = 34, animated = false }: { size?: number | string; animated?: boolean }) {
  return (
    <Link to="/" className={'inline-flex items-center gap-[0.14em] whitespace-nowrap font-display font-extrabold tracking-[-0.035em] no-underline text-ink' + (animated ? ' pop-anim' : '')} style={{ fontSize: size, lineHeight: 1 }} aria-label="Make It Pop, home" data-sound="pop">
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
        <SoundToggle />
        <NavLink to="/me" className={link}>{profile ? profile.name : 'Join'}</NavLink>
      </nav>
    </header>
  )
}

// Sound on/off, remembered per browser. Uses the same stored key as lib/sound.
function SoundToggle() {
  const [on, setOn] = useStored<boolean>('sound-on', false)
  return (
    <button type="button" data-sound="none" aria-pressed={on} aria-label={on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'} title={on ? 'Sound on' : 'Sound off'}
      onClick={() => { setOn(!on); setSoundOn(!on) }}
      className="grid h-8 w-8 cursor-pointer place-items-center border-0 bg-transparent text-ink hover:bg-sun">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? <><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
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
  // the landing draws its own footer (which includes this note)
  if (useLocation().pathname === '/') return null
  return (
    <p className="text-center text-[13px] text-muted">
      Prototype v1 · sample content is marked "sample" · anything you add is saved on this device only
    </p>
  )
}
