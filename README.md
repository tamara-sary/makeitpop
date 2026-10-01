# Make It Pop — prototype v0

Local prototype for interviews. Vite + React + TypeScript + Tailwind v4.

```bash
npm install
npm run dev        # http://localhost:5173
```

## What's in it
| Route | Page |
|---|---|
| `/` | Today: day's design (window "day-04.fig"), brief, crits (sorted by agrees), crit form, Remix kit, steam-room alert |
| `/day/:n` | Any past day |
| `/archive` | All 30 days by week; future days locked |
| `/steam-room` | Break-stuff game (canvas) + anonymous rant wall |
| `/how-it-works` | 4 steps + remix rules |

## Where to edit
- **Days, briefs, today's number, sample crits/rants:** `src/data/days.ts` (`TODAY`, `BRIEFS`, `figmaUrl`, `preview`)
- **Day screenshots:** drop `public/days/day-04.png` etc. and set `preview: '/days/day-04.png'`
- **Brand tokens:** `src/index.css` (`@theme`)
- **Code kit repo name:** `REPO` in `src/data/days.ts`

## Prototype limits (on purpose)
- No backend: crits, rants, agrees and smash count save in this browser only (localStorage).
- Sample content is labelled SAMPLE.
- "Open in Figma" shows a toast until a real `figmaUrl` is set.
