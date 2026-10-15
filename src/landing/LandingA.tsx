import { Burst, DesignWithStickies, PopButton, SiteFooter, Ticker } from './parts'
import Showcase from './Showcase'
import { useIntro } from './Intro'

// A · POSTER: one loud pink field, condensed headline ending in a POP! burst, the real design slapped with stickies.
export default function LandingA() {
  const intro = useIntro()
  return (
    <div className={'lab overflow-x-clip ' + (intro.heroIn ? 'hero-in' : '')}>
      {intro.overlay}
      <section className="relative border-b-2 border-ink bg-pop-pink">
        <div className="halftone halftone-hero pointer-events-none absolute inset-0" style={{ ['--dot-size' as string]: '13px', ['--dot-alpha' as string]: '22%' }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
          <div>
            <p className="caption-box mb-6 inline-block">A daily design gym for mid + senior designers</p>
            <h1 className="cond grid text-[clamp(72px,11.5vw,176px)] uppercase leading-[0.86] text-ink">
              <span className="hero-line">Critique it.</span>
              <span className="hero-line">Remix it.</span>
              <span className="hero-line whitespace-nowrap">Make it{' '}
                <Burst className="ml-1 h-[1.25em] w-[1.6em] align-middle text-[0.62em] -rotate-6" spikes={16}>
                  <span className="text-ink">POP!</span>
                </Burst>
              </span>
            </h1>
            <p className="mt-8 max-w-[34ch] text-lead font-medium text-ink">
              One real design every day. Pin what's off, see what everyone else spotted, then fix it in Figma or with your AI.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <PopButton />
              <a href="#what" className="font-bold text-ink underline decoration-2 underline-offset-4">What is this?</a>
            </div>
          </div>
          <DesignWithStickies className="hero-design mx-auto w-full max-w-[620px]" />
        </div>
      </section>

      <Ticker className="cond bg-ink text-[clamp(28px,4vw,48px)] uppercase text-pop-sun" words={['Critique it', 'Remix it', 'Post it', 'One design a day', 'Your eye first', 'Make it pop']} />

      <Showcase />

      <section className="border-y-2 border-ink bg-pop-sun">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="cond text-[clamp(44px,6vw,80px)] uppercase">The market pays for top-level work. Getting there alone is hard.</h2>
            <p className="mt-6 max-w-[52ch] text-lead">
              Hundreds of applicants per role, design tests, ghosting. Practising alone gives you reps, but nobody tells you what's off. Here, people do.
            </p>
          </div>
          <div className="relative mx-auto w-[min(360px,80vw)]">
            <img src="/brand/apple.webp" alt="The Make It Pop apple, looking surprised" className="apple-hop relative w-full" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b-2 border-ink bg-pop-blue">
        <div className="halftone halftone-hero pointer-events-none absolute inset-y-0 right-0 w-1/3 max-lg:hidden" style={{ ['--dot-alpha' as string]: '30%' }} />
        <div className="relative mx-auto grid max-w-5xl justify-items-center gap-8 px-4 py-24 text-center sm:px-6">
          <h2 className="cond text-[clamp(56px,9vw,128px)] uppercase text-ink">Today's design<br />is waiting</h2>
          <p className="max-w-[40ch] text-lead text-ink">Pin your first sticky. It takes a minute and unlocks what everyone else saw.</p>
          <PopButton />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
