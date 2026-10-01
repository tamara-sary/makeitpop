import { useState } from 'react'
import { REPO, type Crit, type Day } from '../data/days'
import { CopyButton, useToast } from './ui'

// Three plain steps, same for every tool. Tool-specific detail lives inside the tool
// (the Figma file explains itself; the code kit has CLAUDE.md).
export function RemixSteps({ day, topCrit, onSeeCrits }: { day: Day; topCrit?: Crit; onSeeCrits: () => void }) {
  const [showCode, setShowCode] = useState(false)
  const toast = useToast()
  const slug = `day-${String(day.n).padStart(2, '0')}`
  const command = `npx degit ${REPO}/${slug} my-${slug}-remix`
  const prompt = `I'm remixing Day ${day.n} of the Make It Pop 30-day UI challenge: "${day.title}".\n\nBrief: ${day.brief}\n\nTop crit: ${topCrit?.text ?? '(none yet)'}\n\nPropose 3 improvements, explain why, then make them. Keep it accessible (WCAG AA).`
  const caption = `Remixed Day ${day.n} of the Make It Pop 30-day UI challenge: ${day.title}.\n\nOriginal → makeitpop.work/day/${day.n}\nWhat I changed:\n1) \n2) \n3) \n\n#MakeItPop #UIChallenge #ProductDesign`

  const num = (n: number) => (
    <span className="grid h-7 w-7 flex-none place-items-center border-2 border-ink bg-ink font-display text-[15px] font-extrabold text-cream" aria-hidden="true">{n}</span>
  )

  return (
    <div className="grid gap-5">
      <h3 className="text-[22px]">Make it better in 3 steps</h3>

      <ol className="m-0 grid list-none gap-5 p-0">
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
                <p className="text-[13px]">Run this, then open the folder in Claude Code or Cursor. The brief and crits are already inside.</p>
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
            <strong>Fix what the crits found</strong>
            {topCrit && <blockquote className="m-0 border-l-4 border-pink pl-3 text-[14px]">"{topCrit.text}"<br /><span className="text-[12px] text-muted">Top crit · {topCrit.name}</span></blockquote>}
            <button type="button" className="w-fit cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold underline" onClick={onSeeCrits}>See all crits</button>
          </div>
        </li>

        <li className="grid grid-cols-[auto_1fr] gap-3">
          {num(3)}
          <div className="note tilt bg-sun shadow-[3px_3px_0_#161616]">
            <strong className="font-display text-lg">Post it on LinkedIn</strong>
            <p className="text-[14px]">Caption with credit, ready to paste.</p>
            <div><CopyButton text={caption} label="Copy caption" /></div>
          </div>
        </li>
      </ol>

      <p className="text-[12px] text-muted">Free to remix. Just credit Make It Pop when you post.</p>
    </div>
  )
}
