import { Link } from 'react-router-dom'
import { Sticky } from '../components/Stickies'
import { Burst, HERO_STICKIES, PopButton, WhatCards } from './parts'

// B · COMIC STRIP: the landing is a comic page. Ink gutters, caption boxes, a balloon, and a real morning in panels.
// The panels are a true sequence (one session, in order), so the timestamps carry information.

function Panel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={'relative overflow-hidden bg-paper ' + className}>{children}</div>
}

export default function LandingB() {
  return (
    <div className="lab overflow-x-clip bg-desk pb-16">
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 sm:pt-10">
        <div className="grid gap-[6px] border-[6px] border-ink bg-ink shadow-pop-lg lg:grid-cols-3">
          {/* splash panel */}
          <Panel className="bg-pop-sun lg:col-span-2">
            <div className="halftone halftone-fade pointer-events-none absolute inset-0" style={{ ['--dot-size' as string]: '12px', ['--dot-alpha' as string]: '24%' }} />
            <div className="relative px-6 pb-12 pt-6 sm:px-10">
              <p className="caption-box inline-block bg-paper">Meanwhile, somewhere in a job hunt…</p>
              <h1 className="cond mt-8 text-[clamp(80px,13vw,196px)] uppercase leading-[0.82]">
                Make it<br />
                <Burst fill="var(--color-pop-pink)" spikes={18} className="-ml-2 mt-2 h-[1.15em] w-[2.3em] -rotate-3">
                  <span className="outline-ink text-paper">POP!</span>
                </Burst>
              </h1>
              <p className="mt-8 max-w-[38ch] text-lead font-medium">
                A daily design gym for mid and senior product designers. One real design a day: critique it, remix it, post it.
              </p>
              <div className="mt-8"><PopButton /></div>
            </div>
          </Panel>

          {/* mascot panel */}
          <Panel className="grid min-h-[420px] place-items-end bg-pop-blue">
            <div className="halftone pointer-events-none absolute inset-0" style={{ ['--dot-alpha' as string]: '28%' }} />
            <div className="balloon absolute left-[8%] right-[8%] top-[9%] text-center font-display text-title-sm font-extrabold leading-tight" style={{ ['--tail-x' as string]: '58%' }}>
              38% of <em>what?!</em>
            </div>
            <img src="/brand/apple.webp" alt="The Make It Pop apple, shocked by a number without units" className="apple-hop relative mb-[-6%] w-[78%] justify-self-center" />
          </Panel>

          {/* the morning, in three panels */}
          <Panel className="min-h-[340px] p-5">
            <p className="caption-box absolute left-3 top-3 z-10">9:00 · Today's design drops</p>
            <div className="win mt-12 -rotate-2"><img src="/days/day-01.png" alt="Today's design: a finance dashboard" className="block w-full" /></div>
          </Panel>
          <Panel className="min-h-[340px] bg-pop-mint p-5">
            <div className="halftone halftone-fade pointer-events-none absolute inset-0" />
            <p className="caption-box absolute left-3 top-3 z-10">9:05 · You pin what's off. Theirs unlock.</p>
            <div className="relative mt-16 grid justify-items-center gap-1">
              <Sticky crit={HERO_STICKIES[2]} i={1} className="w-[64%]" />
              <Sticky crit={HERO_STICKIES[0]} i={0} className="-mt-4 ml-[24%] w-[58%]" />
              <Sticky crit={HERO_STICKIES[1]} i={3} className="-mt-3 mr-[20%] w-[58%]" />
            </div>
          </Panel>
          <Panel className="min-h-[340px] bg-pop-pink p-5">
            <div className="halftone halftone-fade pointer-events-none absolute inset-0" style={{ ['--fade-dir' as string]: '220deg' }} />
            <p className="caption-box absolute left-3 top-3 z-10">9:20 · Remix it. Post it.</p>
            <div className="relative mt-16 grid gap-3">
              <div className="balloon ml-auto w-fit rounded-2xl px-4 py-2.5 text-ui" style={{ ['--tail-x' as string]: '80%' }}>Make the KPI cards pop, add units</div>
              <div className="border-2 border-ink bg-ink p-3 font-mono text-caption leading-6 text-paper shadow-pop-sm">
                <span className="text-pop-mint">✓</span> Edited <b>index.html</b> · 3 changes<br />
                <span className="text-pop-mint">✓</span> Units on every KPI<br />
                <span className="text-pop-sun">→</span> Before/after ready for LinkedIn
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-16 border-y-[6px] border-ink bg-ink"><WhatCards dark title="So, what is it?" /></div>

      <div className="mx-auto mt-16 max-w-7xl px-3 sm:px-6">
        <div className="grid gap-[6px] border-[6px] border-ink bg-ink shadow-pop-lg md:grid-cols-[1.4fr_1fr]">
          <Panel className="bg-sky p-8 sm:p-10">
            <p className="caption-box inline-block">Later that week…</p>
            <h2 className="cond mt-6 text-[clamp(44px,6vw,84px)] uppercase">Ghosted after round 3?</h2>
            <p className="mt-4 max-w-[44ch] text-lead">Break stuff, rant anonymously, get a “same” from people who get it. Then back to work.</p>
            <Link to="/steam-room" className="btn mt-6">Open the steam room</Link>
          </Panel>
          <Panel className="grid place-items-center bg-pop-sun p-10 text-center">
            <div className="halftone pointer-events-none absolute inset-0" />
            <div className="relative grid justify-items-center gap-6">
              <h2 className="cond text-[clamp(44px,5vw,72px)] uppercase">Your turn</h2>
              <PopButton />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
