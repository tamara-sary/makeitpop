import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { DAYS, REPO, SAMPLE_CRITS, TODAY, WEEKS, type Crit, type Day } from './src/data/days.ts'

const SITE = 'https://www.makeitpop.work'

// Public, read-only challenge data for the Make It Pop MCP server (mcp/): /api/today.json.
// Generated from src/data/days.ts so it can never drift from what the site shows.
function todayApi(): Plugin {
  const json = () => {
    const d = (DAYS as Day[]).find((x: Day) => x.n === TODAY)!
    return JSON.stringify({
      day: d.n,
      title: d.title,
      week: WEEKS[d.week],
      url: `${SITE}/today`,
      brief: d.brief,
      handoff: d.handoff,
      files: { figma: d.figmaUrl, codeKit: `${REPO}/day-${String(d.n).padStart(2, '0')}`, live: d.live ? SITE + d.live : undefined },
      sampleStickies: ((SAMPLE_CRITS as Record<number, Crit[]>)[d.n] ?? []).map((c: Crit) => ({ name: c.name, level: c.level, text: c.text, agrees: c.agrees, x: c.x, y: c.y })),
    }, null, 2)
  }
  return {
    name: 'makeitpop-today-api',
    configureServer(server) {
      server.middlewares.use('/api/today.json', (_req, res) => { res.setHeader('content-type', 'application/json'); res.end(json()) })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'api/today.json', source: json() })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), todayApi()],
})
