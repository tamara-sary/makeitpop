// Finds styling that bypasses the design tokens: raw hex colours and one-off text-[Npx] sizes.
// Run: npm run tokens:check   (exits 1 if any raw hex colour is found, so it can gate a deploy later)
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
// Allowed to hold raw values: the generated token files, DesignPreview (it draws the sample
// design members critique, so its colours belong to that design, not to Make It Pop)
// and GoogleG (Google's official logo colours are content, like DesignPreview).
const ALLOW = ['src/styles/tokens.css', 'src/styles/tokens.theme.css', 'src/components/DesignPreview.tsx', 'src/components/GoogleG.tsx']

const files = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(f)) files.push(p)
  }
}
walk(join(root, 'src'))

let hexCount = 0
let sizeCount = 0
for (const file of files) {
  const rel = relative(root, file)
  if (ALLOW.includes(rel)) continue
  readFileSync(file, 'utf8').split('\n').forEach((text, i) => {
    for (const m of text.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])/g)) {
      console.log(`${rel}:${i + 1}  colour ${m[0]}`)
      hexCount++
    }
    for (const m of text.matchAll(/text-\[\d+px\]/g)) {
      console.log(`${rel}:${i + 1}  size ${m[0]}`)
      sizeCount++
    }
  })
}
console.log(`\n${hexCount} raw colours, ${sizeCount} one-off text sizes. Use tokens from tokens/tokens.json.`)
process.exit(hexCount ? 1 : 0)
