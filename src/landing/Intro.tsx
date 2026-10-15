import { useEffect, useState } from 'react'
import { Burst } from './parts'
import './intro.css'

// Plays once per browser session. Click / any key skips. Never shown with reduced motion.
const SEEN = 'mip-intro-seen'

export function useIntro() {
  const [state, setState] = useState<'off' | 'card' | 'zooming' | 'leaving'>(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off'
      if (sessionStorage.getItem(SEEN)) return 'off'
    } catch { /* storage blocked: just play it */ }
    return 'card'
  })
  const [heroIn] = useState(state !== 'off')

  useEffect(() => {
    if (state === 'off') return
    try { sessionStorage.setItem(SEEN, '1') } catch { /* ignore */ }
    // card is 240 x 320; after a 90deg turn it spans 320 wide x 240 tall
    document.documentElement.style.setProperty('--cover', String(Math.max(innerWidth / 320, innerHeight / 240) * 1.15))
    const t1 = setTimeout(() => setState('zooming'), 1350)
    const t2 = setTimeout(() => setState('leaving'), 2550)
    const t3 = setTimeout(() => setState('off'), 2950)
    const skip = () => setState('off')
    window.addEventListener('keydown', skip, { once: true })
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); window.removeEventListener('keydown', skip) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const overlay = state === 'off' ? null : (
    <div className={'intro ' + (state === 'zooming' ? 'zooming' : state === 'leaving' ? 'zooming leaving' : '')} aria-hidden="true" onClick={() => setState('off')}>
      <div className="intro-card relative overflow-hidden border-2 border-ink bg-pop-pink shadow-pop-lg">
        <div className="intro-card-inner relative grid h-full content-between p-4">
          <span className="caption-box w-fit text-micro">Day 01 / 30</span>
          <p className="cond text-[44px] uppercase leading-[0.86]">Critique it.<br />Remix it.<br />Make it</p>
          <Burst className="h-[88px] w-[120px] -rotate-6 justify-self-start" spikes={16}><span className="cond text-[34px]">POP!</span></Burst>
        </div>
      </div>
    </div>
  )
  return { overlay, heroIn: heroIn && (state === 'leaving' || state === 'off') }
}
