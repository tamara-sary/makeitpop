// The 30-Day AI UI Challenge — prompts come from the original tracker.
// Fill in figmaUrl / preview per day as kits get published.

export type Day = {
  n: number
  title: string
  week: number
  brief: string
  figmaUrl?: string // Figma Community file link
  preview?: string // e.g. "/days/day-04.png"
  live?: string // the code kit rendered live (synced into public/ by scripts/sync-days.mjs): sharp at any zoom
  handoff?: Handoff // brief written like a design handoff; falls back to `brief` when missing
}

// The brief as a designer gets it at work: who, when, what they need to answer, how to judge it.
export type Handoff = {
  job: string // one line, shown on the design's section tab so the brief is never far away
  who: string
  when: string
  questions: string[] // become the audit checklist
  failsIf: string
  notes: string[]
}

export const TODAY = 1 // prototype: which day is "today"
export const REPO = 'tamara-sary/makeitpop/challenges'

const PROMPTS = [
  'Finance dashboard: spend overview for a small team',
  'Health app dashboard: daily vitals + trends',
  'Dev tools dashboard: CI/CD pipeline status',
  'Analytics dashboard: funnel + retention view',
  'CRM dashboard: pipeline by deal stage',
  'Ecommerce dashboard: orders + inventory alerts',
  'Free pick: remix your favorite day 1-6 dashboard in a new style',
  'Landing page: AI scheduling tool',
  'Landing page: B2B analytics SaaS',
  'Landing page: developer API product',
  'Landing page: wellness/health app',
  'Landing page: fintech for freelancers',
  'Landing page: AI writing assistant',
  'Free pick: rebuild a landing page you liked, in your own style',
  'Onboarding flow: first-run setup for a SaaS tool',
  'Empty state: no data yet, guide the user to act',
  'Settings page: account + billing + team',
  'Mobile view: adapt one of your dashboards',
  'Notification center / inbox pattern',
  'Pricing page: 3-tier SaaS pricing',
  'Free pick: your weakest day this week, redone',
  "Pick your best dashboard: write the 'why' behind 3 decisions",
  'Pick your best landing page: write the problem it solves',
  "Turn day 15-21's flow into a mini case study",
  'Polish visual details: spacing, type scale, color consistency',
  'Write and design a LinkedIn carousel from your best week',
  'Consolidate: pick your 3 strongest pieces for your portfolio',
  'Reflect + plan: what to keep doing after day 30',
]

const PREVIEWS: Record<number, string> = { 1: '/days/day-01.png' }
const LIVE: Record<number, string> = { 1: '/days/day-01/index.html' }

const HANDOFFS: Record<number, Handoff> = {
  1: {
    job: 'Maya, 5 min on Monday: on track? where did it go? what needs me?',
    who: 'Maya, ops lead at Brightloop, a 22-person startup with no finance team. Not a finance person.',
    when: 'Every Monday, 5 minutes, before the founders\' meeting.',
    questions: ['Are we on track?', 'Where did the money go?', 'What needs my action?'],
    failsIf: 'If she has to think about what a number means, the dashboard failed.',
    notes: ['Desktop screen', 'Sample data is real: every number adds up'],
  },
}

export const WEEKS = ['Dashboards', 'Landing pages', 'Mix & flows', 'Case studies']

const BRIEFS: Record<number, string> = {
  1: 'Maya runs operations at a 22-person startup with no finance team. Every Monday she has 5 minutes to check spending before the founders\' meeting. She needs to know: are we on track, where did the money go, and what needs her action? She isn\'t a finance person. If she has to think about what a number means, the dashboard failed.',
  4: 'A growth team checks this every Monday. They need to see where people drop out of signup and whether the ones who stay come back. Today\'s version shows the numbers, but does it tell the story?',
}

export const DAYS: Day[] = PROMPTS.map((title, i) => {
  const n = i + 1
  return {
    n,
    title,
    week: n <= 7 ? 0 : n <= 14 ? 1 : n <= 21 ? 2 : 3,
    brief: BRIEFS[n] ?? 'Brief coming with the kit. Start from the prompt above and the top crits.',
    preview: PREVIEWS[n],
    live: LIVE[n],
    handoff: HANDOFFS[n],
  }
})
// 30-day tracker has 28 prompts; days 29-30 are open
DAYS.push(
  { n: 29, title: 'Open day: remix any day you skipped', week: 3, brief: 'Pick any day you missed and remix it.' },
  { n: 30, title: 'Open day: your best remix, polished', week: 3, brief: 'Take your strongest remix and finish it properly.' },
)

export const dayByN = (n: number) => DAYS.find((d) => d.n === n)

export type Crit = {
  id: string
  name: string
  level: 'Mid' | 'Senior'
  tag: string
  text: string
  agrees: number
  sample?: boolean
  x?: number // sticky position on the design, % of width
  y?: number // % of height
  color?: StickyColor
}

export type StickyColor = 'sun' | 'mint' | 'pink' | 'sky'

export const CRIT_TAGS = ['Hierarchy', 'Data viz', 'Spacing', 'Copy', 'Accessibility', 'Other']

// Sample crits so the prototype isn't empty. Marked as samples in the UI.
export const SAMPLE_CRITS: Record<number, Crit[]> = {
  1: [
    { id: 's1', name: 'Marta', level: 'Senior', tag: 'Copy', text: 'Reads like good news, but for a budget "ahead of pace" means overspending. Say "€5,498 over pace".', agrees: 11, sample: true, x: 3, y: 33, color: 'sun' },
    { id: 's2', name: 'Jon', level: 'Mid', tag: 'Hierarchy', text: 'Maya has 5 minutes. "Needs your attention" is the actual job, so why is it below the fold?', agrees: 7, sample: true, x: 20, y: 70, color: 'mint' },
    { id: 's3', name: 'Priya', level: 'Senior', tag: 'Data viz', text: 'Only Eng is blue. Is that an alert or just the biggest? Highlight means something, or nothing.', agrees: 5, sample: true, x: 74, y: 40, color: 'pink' },
    { id: 's4', name: 'Leo', level: 'Mid', tag: 'Accessibility', text: '74% sits in "Watch", but only the arc says so. Put the word next to the number.', agrees: 3, sample: true, x: 58, y: 78, color: 'sky' },
  ],
  4: [
    { id: 's1', name: 'Marta', level: 'Senior', tag: 'Hierarchy', text: 'Drop-off is the story. Make step 4 the hero and annotate why people leave there. Everything else is noise.', agrees: 12, sample: true, x: 52, y: 58, color: 'sun' },
    { id: 's2', name: 'Jon', level: 'Mid', tag: 'Copy', text: 'KPI labels need units and a time frame. 38% of what, retained after week 1?', agrees: 8, sample: true, x: 70, y: 16, color: 'mint' },
    { id: 's3', name: 'Priya', level: 'Senior', tag: 'Data viz', text: 'A funnel as equal-width bars hides the size of each drop. Show the % lost between steps.', agrees: 5, sample: true, x: 6, y: 52, color: 'pink' },
    { id: 's4', name: 'Leo', level: 'Mid', tag: 'Accessibility', text: 'The highlighted bar is the only signal. Add a label so it works without color.', agrees: 3, sample: true, x: 76, y: 66, color: 'sky' },
  ],
}

export const SAMPLE_RANTS = [
  { id: 'r1', text: 'Round 4 of interviews. Then a 3-day unpaid design test. Then "we went with an internal candidate".', same: 41, hugs: 17, sample: true },
  { id: 'r2', text: 'Recruiter asked if I could "make the portfolio pop more". I have never felt so seen by a product name.', same: 28, hugs: 9, sample: true },
  { id: 'r3', text: 'Applied to 60 roles this month. 2 replies. Both automated.', same: 63, hugs: 30, sample: true },
]

export type Comment = {
  id: string
  name: string
  level: 'Mid' | 'Senior'
  text: string
  at: number // ms timestamp
  likes: number
  replies: Comment[]
  sample?: boolean
}

const H = 3600_000
export const SAMPLE_COMMENTS: Record<number, Comment[]> = {
  1: [
    { id: 'c1', name: 'Priya', level: 'Senior', at: Date.now() - 2 * H, likes: 12, sample: true, text: 'Nice brief. Maya is not a finance person, so every number should answer "is this good or bad?" on its own. "12 months" + "Healthy" does that. The spend card doesn\'t yet.', replies: [
      { id: 'c1r1', name: 'Jon', level: 'Mid', at: Date.now() - 1 * H, likes: 3, sample: true, text: 'Same feeling. In my remix the chip says "Over pace" in red and the tooltip explains it. Way faster to read.', replies: [] },
    ] },
    { id: 'c2', name: 'Marta', level: 'Senior', at: Date.now() - 5 * H, likes: 8, sample: true, text: 'Hot take: the 1M/3M/6M/1Y toggle doesn\'t belong here. It\'s a Monday check of this month. Remove it and give the space to the attention list.', replies: [] },
    { id: 'c3', name: 'Leo', level: 'Mid', at: Date.now() - 7 * H, likes: 2, sample: true, text: 'Posted my remix on LinkedIn: moved "Needs your attention" to the top and made the share button send a summary. Feedback welcome!', replies: [] },
  ],
  4: [
    { id: 'c1', name: 'Priya', level: 'Senior', at: Date.now() - 2 * H, likes: 14, sample: true, text: 'Interesting one. The real question is who reads this on Monday. A growth lead wants "what changed since last week", not totals. I would add a week-over-week delta to every number.', replies: [
      { id: 'c1r1', name: 'Jon', level: 'Mid', at: Date.now() - 1 * H, likes: 3, sample: true, text: 'Agree. Tried it in my remix, deltas made the drop at step 4 jump out without any extra color.', replies: [] },
    ] },
    { id: 'c2', name: 'Marta', level: 'Senior', at: Date.now() - 5 * H, likes: 9, sample: true, text: 'Hot take: delete the KPI cards. The funnel already shows visitors and signups. Use the space to explain the drop.', replies: [] },
    { id: 'c3', name: 'Leo', level: 'Mid', at: Date.now() - 7 * H, likes: 2, sample: true, text: 'First remix posted on LinkedIn. Went with a horizontal funnel so labels fit. Feedback welcome!', replies: [] },
  ],
}
