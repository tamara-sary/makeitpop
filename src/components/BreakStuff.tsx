import { useEffect, useRef, useState } from 'react'
import { load, save } from '../lib/store'

// "Break stuff": job-hunt clichés float around; click/tap (or press Smash) to shatter them.
// Jokes punch at the process, never at people.
const LINES = [
  'We\'ve decided to move forward with other candidates',
  'Can you make it pop?',
  '3-day design test (unpaid)',
  'We\'ll keep your CV on file',
  'Seen ✓✓',
  'Round 5: culture fit',
  'Position filled internally',
  'Great portfolio, but…',
  '8+ years for a mid role',
  'Just one more small change',
  'Make the logo bigger',
  'Auto-reply: thanks for applying!',
]
const QUIPS = ['Feels better?', 'Gone.', 'Next!', 'Smashed it.', 'Bye forever', 'Ahh, lovely', 'Kerning: fixed', 'Detached instance']
const ACCENTS = ['#ff7ac6', '#ffe14d', '#8fe3c1']
const INK = '#161616'

type Card = { x: number; y: number; vx: number; vy: number; w: number; h: number; rot: number; vr: number; text: string; accent: string }
type Shard = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; color: string; life: number }
type Pop = { x: number; y: number; text: string; life: number }

export function BreakStuff() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const smashRef = useRef<() => void>(() => {})
  const [count, setCount] = useState(() => load('smashed', 0))
  const [sound, setSound] = useState(false)
  const soundRef = useRef(false)
  soundRef.current = sound

  useEffect(() => { save('smashed', count) }, [count])

  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, dpr = 1, raf = 0, shake = 0
    let cards: Card[] = []
    const shards: Shard[] = []
    const pops: Pop[] = []
    let audio: AudioContext | null = null
    let lineIdx = Math.floor(Math.random() * LINES.length)

    const resize = () => {
      const r = wrap.current!.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width; H = r.height
      cv.width = W * dpr; cv.height = H * dpr
      cv.style.width = W + 'px'; cv.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const fontFor = () => `700 ${W < 520 ? 13 : 15}px Figtree, system-ui, sans-serif`
    const wrapText = (t: string, maxW: number) => {
      ctx.font = fontFor()
      const words = t.split(' '); const lines: string[] = []; let cur = ''
      for (const w of words) {
        const test = cur ? cur + ' ' + w : w
        if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w } else cur = test
      }
      if (cur) lines.push(cur)
      return lines
    }
    const spawn = (): Card => {
      const text = LINES[lineIdx++ % LINES.length]
      const w = W < 520 ? 150 : 200
      const lines = wrapText(text, w - 28)
      const h = 34 + lines.length * 19
      const sp = reduce ? 0.15 : 0.6 + Math.random() * 0.7
      const a = Math.random() * Math.PI * 2
      return {
        x: w / 2 + 10 + Math.random() * Math.max(1, W - w - 20),
        y: h / 2 + 10 + Math.random() * Math.max(1, H - h - 20),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w, h,
        rot: (Math.random() - 0.5) * 0.3, vr: reduce ? 0 : (Math.random() - 0.5) * 0.004,
        text, accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
      }
    }
    const crack = () => {
      if (!soundRef.current) return
      try {
        audio ??= new AudioContext()
        const len = audio.sampleRate * 0.25
        const buf = audio.createBuffer(1, len, audio.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
        const src = audio.createBufferSource(); src.buffer = buf
        const f = audio.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900
        const g = audio.createGain(); g.gain.value = 0.5
        src.connect(f).connect(g).connect(audio.destination); src.start()
      } catch { /* audio unavailable */ }
    }
    const smash = (i: number) => {
      const c = cards[i]
      for (let k = 0; k < 26; k++) {
        const a = Math.random() * Math.PI * 2, s = reduce ? 0.5 : 2 + Math.random() * 6
        shards.push({ x: c.x + (Math.random() - 0.5) * c.w * 0.8, y: c.y + (Math.random() - 0.5) * c.h * 0.8, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 6 + Math.random() * 14, color: k % 3 === 0 ? c.accent : k % 3 === 1 ? '#ffffff' : INK, life: 1 })
      }
      pops.push({ x: c.x, y: c.y, text: QUIPS[Math.floor(Math.random() * QUIPS.length)], life: 1 })
      if (!reduce) shake = 10
      crack()
      cards.splice(i, 1)
      setCount((n: number) => n + 1)
      window.setTimeout(() => cards.push(spawn()), 600)
    }
    smashRef.current = () => { if (cards.length) smash(Math.floor(Math.random() * cards.length)) }

    const hit = (px: number, py: number) => {
      for (let i = cards.length - 1; i >= 0; i--) {
        const c = cards[i]
        const dx = px - c.x, dy = py - c.y
        const lx = dx * Math.cos(-c.rot) - dy * Math.sin(-c.rot)
        const ly = dx * Math.sin(-c.rot) + dy * Math.cos(-c.rot)
        if (Math.abs(lx) <= c.w / 2 && Math.abs(ly) <= c.h / 2) { smash(i); return }
      }
    }
    const onDown = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      hit(e.clientX - r.left, e.clientY - r.top)
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.85; if (shake < 0.3) shake = 0 }
      for (const c of cards) {
        c.x += c.vx; c.y += c.vy; c.rot += c.vr
        if (c.x < c.w / 2 || c.x > W - c.w / 2) { c.vx *= -1; c.x = Math.min(Math.max(c.x, c.w / 2), W - c.w / 2) }
        if (c.y < c.h / 2 || c.y > H - c.h / 2) { c.vy *= -1; c.y = Math.min(Math.max(c.y, c.h / 2), H - c.h / 2) }
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot)
        ctx.fillStyle = INK; ctx.fillRect(-c.w / 2 + 5, -c.h / 2 + 5, c.w, c.h)
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
        ctx.fillStyle = c.accent; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, 10)
        ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h)
        ctx.beginPath(); ctx.moveTo(-c.w / 2, -c.h / 2 + 10); ctx.lineTo(c.w / 2, -c.h / 2 + 10); ctx.stroke()
        ctx.fillStyle = INK; ctx.font = fontFor(); ctx.textBaseline = 'top'
        wrapText(c.text, c.w - 28).forEach((l, i) => ctx.fillText(l, -c.w / 2 + 14, -c.h / 2 + 20 + i * 19))
        ctx.restore()
      }
      for (let i = shards.length - 1; i >= 0; i--) {
        const s = shards[i]
        s.vy += 0.35; s.x += s.vx; s.y += s.vy; s.r += s.vr; s.life -= 0.012
        if (s.life <= 0 || s.y > H + 40) { shards.splice(i, 1); continue }
        ctx.save(); ctx.globalAlpha = Math.max(0, s.life); ctx.translate(s.x, s.y); ctx.rotate(s.r)
        ctx.beginPath(); ctx.moveTo(0, -s.s / 2); ctx.lineTo(s.s / 2, s.s / 2); ctx.lineTo(-s.s / 2, s.s / 3); ctx.closePath()
        ctx.fillStyle = s.color; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore()
      }
      for (let i = pops.length - 1; i >= 0; i--) {
        const p = pops[i]; p.y -= 0.6; p.life -= 0.015
        if (p.life <= 0) { pops.splice(i, 1); continue }
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 1.5)
        ctx.font = '800 26px "Bricolage Grotesque", system-ui, sans-serif'; ctx.textAlign = 'center'
        ctx.lineWidth = 5; ctx.strokeStyle = '#ffffff'; ctx.strokeText(p.text, p.x, p.y)
        ctx.fillStyle = INK; ctx.fillText(p.text, p.x, p.y); ctx.restore()
      }
      ctx.restore()
      raf = requestAnimationFrame(draw)
    }

    resize()
    let alive = true
    // wait for Figtree so text wrapping is measured with the real font
    document.fonts.ready.then(() => { if (alive) cards = Array.from({ length: W < 520 ? 3 : 5 }, spawn) })
    const ro = new ResizeObserver(resize); ro.observe(wrap.current!)
    cv.addEventListener('pointerdown', onDown)
    raf = requestAnimationFrame(draw)
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener('pointerdown', onDown); audio?.close() }
  }, [])

  return (
    <div className="grid gap-3">
      <div ref={wrap} className="relative aspect-[4/3] w-full cursor-crosshair overflow-hidden border-2 border-ink bg-cream sm:aspect-[16/9]" style={{ backgroundImage: 'radial-gradient(rgba(22,22,22,.13) 1.2px, transparent 1.3px)', backgroundSize: '20px 20px' }}>
        <canvas ref={canvas} className="block touch-none" aria-label="Break stuff game: click the cards to smash them" role="img" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn" onClick={() => smashRef.current()}>Smash one</button>
        <button type="button" className="btn btn-ghost btn-sm" aria-pressed={sound} onClick={() => setSound((s) => !s)}>Sound: {sound ? 'on' : 'off'}</button>
        <p className="ml-auto font-display text-xl font-extrabold" aria-live="polite">{count} smashed</p>
      </div>
    </div>
  )
}
