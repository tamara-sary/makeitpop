# Make It Pop

**Critique it. Remix it. Make it pop.**
A daily design gym for job-hunting product designers: one design a day from a 30-day UI challenge to critique and remix (in Figma or code), plus a steam room for the hard days.

Live: https://makeitpop.work · Status: prototype v0 · Built with Vite + React + TypeScript + Tailwind v4.

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

## Remix kits
Code kits for each day live in [`challenges/`](challenges/). Grab one with `npx degit tamara-sary/makeitpop/challenges/day-04 my-remix`.

## License
- Site code: [MIT](LICENSE)
- Challenge designs and kits in `challenges/`: CC BY 4.0 (credit Make It Pop)
