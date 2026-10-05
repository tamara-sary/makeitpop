import { useState } from 'react'
import { REPO, type Crit, type Day } from '../data/days'
import { CopyButton, useToast } from './ui'
import { DropShot } from './DropShot'

// The remix flow, split the same way as the Figma Remix Kit (Original / Your remix / Share),
// so what you see on the canvas is what you get in the file.
// Tool-specific detail lives inside the tool (the Figma file explains itself; the code kit has CLAUDE.md).

const num = (n: number) => (
  <span className="grid h-8 w-8 flex-none place-items-center border-2 border-ink bg-ink font-display text-[16px] font-extrabold text-cream" aria-hidden="true">{n}</span>
)

// 1b · Your remix: grab the design, fix what the crits found.
// topCrit is undefined while crits are locked, so the remix step can't bias your own audit either.
export function RemixSteps({ day, topCrit, locked }: { day: Day; topCrit?: Crit; locked: boolean }) {
  const [showCode, setShowCode] = useState(false)
  const toast = useToast()
  const slug = `day-${String(day.n).padStart(2, '0')}`
  const command = `npx degit ${REPO}/${slug} my-${slug}-remix`
  const prompt = `I'm remixing Day ${day.n} of the Make It Pop 30-day UI challenge: "${day.title}".\n\nBrief: ${day.brief}\n\nTop sticky: ${topCrit?.text ?? '(none yet)'}\n\nPropose 3 improvements, explain why, then make them. Keep it accessible (WCAG AA).`

  return (
    <div className="grid gap-6">
      <h2 className="text-[30px]">Make it better</h2>
      <ol className="m-0 grid list-none gap-6 p-0 text-[17px]">
        <li className="grid grid-cols-[auto_1fr] gap-3">
          {num(1)}
          <div className="grid gap-2">
            <strong>Grab the design</strong>
            <div className="flex flex-wrap gap-2">
              {day.figmaUrl ? (
                <a className="btn btn-sm" href={day.figmaUrl} target="_blank" rel="noreferrer">Figma file ↗</a>
              ) : (
                <button className="btn btn-sm" type="button" onClick={() => toast(`Day ${day.n} Figma file is coming soon`)}>Figma file ↗</button>
              )}
              <button className="btn btn-ghost btn-sm" type="button" aria-expanded={showCode} onClick={() => setShowCode((v) => !v)}>Code</button>
            </div>
            {showCode && (
              <div className="grid gap-2">
                <p className="text-[14px]">Run this, then open the folder in Claude Code or Cursor. The brief and stickies are already inside.</p>
                <pre className="code m-0">{command}</pre>
                <div className="flex flex-wrap items-center gap-3">
                  <CopyButton text={command} label="Copy command" />
                  <CopyButton text={prompt} label="Another AI tool? Copy prompt" className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold underline" />
                </div>
              </div>
            )}
          </div>
        </li>
        <li className="grid grid-cols-[auto_1fr] gap-3">
          {num(2)}
          <div className="grid gap-2">
            <strong>Fix what the stickies found</strong>
            {locked || !topCrit ? (
              <p className="border-l-4 border-ink/30 pl-3 text-[15px] text-muted">The top sticky shows here after you add your own. Audit first, so you see it with fresh eyes.</p>
            ) : (
              <blockquote className="m-0 border-l-4 border-pink pl-3 text-[15px]">"{topCrit.text}"<br /><span className="text-[13px] text-muted">Top sticky · {topCrit.name}</span></blockquote>
            )}
          </div>
        </li>
      </ol>
      {/* Mirrors the "Your remix" frame in the Figma kit: drop your finished shot here */}
      <DropShot n={day.n} />
    </div>
  )
}

// 1c · Share: post it with credit (the growth loop lives off-platform, on LinkedIn).
export function ShareStep({ day }: { day: Day }) {
  const caption = `Remixed Day ${day.n} of the Make It Pop 30-day UI challenge: ${day.title}.\n\nOriginal → makeitpop.work/day/${day.n}\nWhat I changed:\n1) \n2) \n3) \n\n#MakeItPop #UIChallenge #ProductDesign`
  return (
    <div className="grid gap-6">
      <h2 className="text-[30px]">Post it</h2>
      <div className="note tilt bg-sun shadow-[4px_4px_0_#161616]">
        <strong className="font-display text-[22px]">Post it on LinkedIn</strong>
        <p className="text-[16px]">Caption with credit, ready to paste. Add the 3 things you changed.</p>
        <pre className="m-0 whitespace-pre-wrap border-2 border-ink bg-paper p-3 font-sans text-[13px] leading-snug">{caption}</pre>
        <div><CopyButton text={caption} label="Copy caption" /></div>
      </div>
      <p className="text-[14px] text-muted">Free to remix. Just credit Make It Pop when you post.</p>
    </div>
  )
}
