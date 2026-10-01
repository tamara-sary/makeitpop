// The 30-Day AI UI Challenge — prompts come from the original tracker.
// Fill in figmaUrl / preview per day as kits get published.

export type Day = {
  n: number
  title: string
  week: number
  brief: string
  figmaUrl?: string // Figma Community file link
  preview?: string // e.g. "/days/day-04.png"
}

export const TODAY = 4 // prototype: which day is "today"
export const REPO = 'makeitpop/challenges'

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

export const WEEKS = ['Dashboards', 'Landing pages', 'Mix & flows', 'Case studies']

const BRIEFS: Record<number, string> = {
  4: 'A growth team checks this every Monday. They need to see where people drop out of signup and whether the ones who stay come back. Today\'s version shows the numbers, but does it tell the story?',
}

export const DAYS: Day[] = PROMPTS.map((title, i) => {
  const n = i + 1
  return {
    n,
    title,
    week: n <= 7 ? 0 : n <= 14 ? 1 : n <= 21 ? 2 : 3,
    brief: BRIEFS[n] ?? 'Brief coming with the kit. Start from the prompt above and the top crits.',
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
}

export const CRIT_TAGS = ['Hierarchy', 'Data viz', 'Spacing', 'Copy', 'Accessibility', 'Other']

// Sample crits so the prototype isn't empty. Marked as samples in the UI.
export const SAMPLE_CRITS: Record<number, Crit[]> = {
  4: [
    { id: 's1', name: 'Marta', level: 'Senior', tag: 'Hierarchy', text: 'Drop-off is the story. Make step 4 the hero and annotate why people leave there. Everything else is noise.', agrees: 12, sample: true },
    { id: 's2', name: 'Jon', level: 'Mid', tag: 'Copy', text: 'KPI labels need units and a time frame. 38% of what, retained after week 1?', agrees: 8, sample: true },
    { id: 's3', name: 'Priya', level: 'Senior', tag: 'Data viz', text: 'A funnel as equal-width bars hides the size of each drop. Show the % lost between steps.', agrees: 5, sample: true },
    { id: 's4', name: 'Leo', level: 'Mid', tag: 'Accessibility', text: 'The highlighted bar is the only signal. Add a label so it works without color.', agrees: 3, sample: true },
  ],
}

export const SAMPLE_RANTS = [
  { id: 'r1', text: 'Round 4 of interviews. Then a 3-day unpaid design test. Then "we went with an internal candidate".', same: 41, hugs: 17, sample: true },
  { id: 'r2', text: 'Recruiter asked if I could "make the portfolio pop more". I have never felt so seen by a product name.', same: 28, hugs: 9, sample: true },
  { id: 'r3', text: 'Applied to 60 roles this month. 2 replies. Both automated.', same: 63, hugs: 30, sample: true },
]
