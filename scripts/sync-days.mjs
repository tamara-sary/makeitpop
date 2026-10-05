// Copies each challenge's code kit (index.html + styles.css) into public/days/day-XX/
// so the day page can render the design live: sharp at any zoom, and always the same as the kit.
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'

for (const dir of readdirSync('challenges')) {
  if (!/^day-\d+$/.test(dir) || !existsSync(`challenges/${dir}/index.html`)) continue
  mkdirSync(`public/days/${dir}`, { recursive: true })
  for (const f of ['index.html', 'styles.css']) {
    if (existsSync(`challenges/${dir}/${f}`)) cpSync(`challenges/${dir}/${f}`, `public/days/${dir}/${f}`)
  }
  console.log(`synced ${dir}`)
}
