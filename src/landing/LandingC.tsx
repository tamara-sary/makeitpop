import { Sticky } from '../components/Stickies'
import { Burst, HERO_STICKIES, PopButton, Ticker, WhatCards } from './parts'

// C · COLOUR SLABS: the three verbs stacked as tilted slabs of flat pop colour, like stickers on a laptop lid.
// The real product shot rises out from under them.

const SLABS = [
  { t: 'Critique it', cls: 'bg-pop-mint text-ink -rotate-2 ml-[2%]' },
  { t: 'Remix it', cls: 'bg-pop-blue text-paper rotate-[1.5deg] ml-[14%]' },
  { t: 'Make it pop', cls: 'bg-pop-pink text-ink -rotate-1 ml-[5%]' },
]

const FACTS = [
  { n: '30', l: 'designs, one a day, each with a real brief', c: 'bg-pop-sun' },
  { n: '4', l: 'themes: dashboards, landing pages, flows, case studies', c: 'bg-pop-mint' },
  { n: '2', l: 'ways to remix: a Figma file or a code kit', c: 'bg-pop-pink' },
  { n: '€0', l: 'to join. Credit Make It Pop when you post', c: 'bg-sky' },
]

export default function LandingC() {
  return (
    <div className="lab overflow-x-clip bg-desk">
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <p className="mb-8 font-pixel text-ui uppercase">For mid + senior product designers who are job-hunting</p>
        <h1 className="relative m-0 grid justify-items-start gap-3">
          {SLABS.map((s) => (
            <span key={s.t} className={'cond inline-block border-2 border-ink px-[0.18em] pb-[0.06em] pt-[0.1em] text-[clamp(64px,12vw,184px)] uppercase shadow-pop-lg ' + s.cls}>{s.t}</span>
          ))}
          <Burst className="absolute right-[2%] top-[38%] h-[clamp(120px,15vw,210px)] w-[clamp(120px,15vw,210px)] rotate-12 max-md:hidden" spikes={16}>
            <span className="cond text-center text-[clamp(26px,2.8vw,40px)] uppercase leading-[0.9]">Free<br />+ daily</span>
          </Burst>
        </h1>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-[40ch] text-lead font-medium">
            One real design a day. Pin what's off, unlock what everyone else spotted, fix it in Figma or with your AI, post the before/after.
          </p>
          <PopButton />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
        <div className="win relative z-[1]">
          <div className="tbar"><span className="title">makeitpop.work / today</span></div>
          <img src="/landing/stick.webp" alt="The challenge canvas: a finance dashboard with stickies pinned on it" className="block w-full" width={1600} height={946} />
        </div>
        <Sticky crit={HERO_STICKIES[1]} i={0} big className="absolute -left-[1%] -top-[4%] z-[2] w-[min(240px,34vw)] p-4 max-sm:hidden" />
        <Sticky crit={HERO_STICKIES[0]} i={3} big className="absolute -bottom-[1%] right-[3%] z-[2] w-[min(240px,34vw)] p-4 max-sm:hidden" />
        <div className="halftone absolute inset-x-[8%] bottom-6 top-[18%] z-0 translate-x-6 translate-y-6" style={{ ['--dot-alpha' as string]: '45%', ['--dot-size' as string]: '9px' }} />
      </section>

      <Ticker className="cond bg-pop-sun text-[clamp(28px,4vw,48px)] uppercase text-ink" words={['Your eye first', 'One design a day', 'Figma or code', 'Steam room for the bad days', 'Credit-back on every remix']} />

      <WhatCards title="What's inside" />

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f, i) => (
            <div key={f.n} className={'relative overflow-hidden border-2 border-ink p-6 shadow-pop-md ' + f.c} style={{ rotate: `${[-1, 0.8, -0.6, 1.1][i]}deg` }}>
              <div className="halftone halftone-fade pointer-events-none absolute inset-0" />
              <p className="cond relative text-[clamp(72px,8vw,112px)]">{f.n}</p>
              <p className="relative mt-2 text-body font-semibold">{f.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-20 sm:px-6">
          <h2 className="cond text-[clamp(56px,8vw,120px)] uppercase text-paper">Today's design<br />is <span className="text-pop-pink">waiting</span></h2>
          <PopButton tone="sun" />
        </div>
      </section>
    </div>
  )
}
