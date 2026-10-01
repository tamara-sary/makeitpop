import { useState } from 'react'
import { REPO, type Crit, type Day } from '../data/days'
import { CopyButton, Win, useToast } from './ui'

type Tab = 'figma' | 'code' | 'ai'
const TABS: { id: Tab; label: string }[] = [
  { id: 'figma', label: 'Figma' },
  { id: 'code', label: 'Claude Code' },
  { id: 'ai', label: 'Any AI tool' },
]

export function RemixKit({ day, topCrits }: { day: Day; topCrits: Crit[] }) {
  const [tab, setTab] = useState<Tab>('figma')
  const toast = useToast()
  const dd = String(day.n).padStart(2, '0')
  const slug = `day-${dd}`
  const command = `npx degit ${REPO}/${slug} my-${slug}-remix\ncd my-${slug}-remix && npm i && claude`
  const critLines = topCrits.slice(0, 3).map((c, i) => `${i + 1}. ${c.text}`).join('\n')
  const prompt = `I'm remixing Day ${day.n} of the Make It Pop 30-day UI challenge: "${day.title}".\n\nBrief: ${day.brief}\n\nTop crits from the community:\n${critLines || '(none yet)'}\n\nPropose 3 improvements that address these crits, explain the reasoning for each, then implement them one at a time. Keep it accessible (WCAG AA).`
  const caption = `Remixed Day ${day.n} of the Make It Pop 30-day UI challenge: ${day.title}.\n\nOriginal → makeitpop.work/day/${day.n}\nWhat I changed:\n1) \n2) \n3) \n\n#MakeItPop #UIChallenge #ProductDesign`

  return (
    <Win title="Remix kit" bodyClass="p-4 grid gap-4">
      <div>
        <h3 className="text-xl">Grab it. Fix it. Post it.</h3>
        <p className="text-[14px] text-muted">Pick your tool. Your remix goes on LinkedIn, credit is already in the template.</p>
      </div>

      <div role="tablist" aria-label="Remix in" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={'chip cursor-pointer ' + (tab === t.id ? 'bg-ink text-cream' : 'hover:bg-sun')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'figma' && (
        <div role="tabpanel" id="panel-figma" aria-labelledby="tab-figma" className="grid gap-3">
          <ol className="m-0 grid list-decimal gap-1 pl-5 text-[14px]">
            <li>Open the file and hit <strong>Duplicate</strong>. It lands in your drafts.</li>
            <li>Edit the <strong>Your remix</strong> page. Top crits are on a sticky.</li>
            <li>Export the <strong>Share</strong> page: a before/after carousel with credit built in.</li>
          </ol>
          {day.figmaUrl ? (
            <a className="btn" href={day.figmaUrl} target="_blank" rel="noreferrer">Open in Figma ↗</a>
          ) : (
            <button className="btn" type="button" onClick={() => toast(`Day ${day.n} Figma file isn't published yet`)}>Open in Figma ↗</button>
          )}
        </div>
      )}

      {tab === 'code' && (
        <div role="tabpanel" id="panel-code" aria-labelledby="tab-code" className="grid gap-3">
          <p className="text-[14px]">Gets the working code with a <code>CLAUDE.md</code> (brief + crits) and <code>REMIX.md</code> (starter prompt + caption). Works with Cursor too.</p>
          <pre className="code m-0">{command}</pre>
          <CopyButton text={command} label="Copy command" className="btn" />
        </div>
      )}

      {tab === 'ai' && (
        <div role="tabpanel" id="panel-ai" aria-labelledby="tab-ai" className="grid gap-3">
          <p className="text-[14px]">Brief + top crits as one prompt. Paste it with a screenshot into any AI design or coding tool.</p>
          <pre className="code m-0 max-h-40 whitespace-pre-wrap">{prompt}</pre>
          <CopyButton text={prompt} label="Copy remix prompt" className="btn" />
        </div>
      )}

      <div className="note bg-sun">
        <strong className="font-display text-lg">Done? Share it.</strong>
        <p className="text-[14px]">Caption with credit, ready to paste on LinkedIn.</p>
        <div><CopyButton text={caption} label="Copy caption" /></div>
      </div>
      <p className="text-[12px] text-muted">Free to remix under CC BY 4.0. Please credit Make It Pop.</p>
    </Win>
  )
}
