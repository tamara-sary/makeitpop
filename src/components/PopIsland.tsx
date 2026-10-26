import { useEffect, useRef, useState, type ReactNode } from 'react'
import { load, save } from '../lib/store'
import { soundOn, setSoundOn } from '../lib/sound'

// Pop Island: an auto-running arcade smasher. The apple mascot hops along an island,
// smashes job-hunt clichés with a mallet, jumps the boulders it can't break, and drinks
// cafés con leche to keep its energy up (energy drains, Adventure Island style).
// Jokes punch at the process, never at people.

const KOFI_URL = 'https://ko-fi.com/tamarasary'

const CRATES = ['Make it pop?', 'Unpaid test', 'Round 5', 'Culture fit', 'Logo bigger', '8+ yrs (mid)', 'On file', 'Auto-reply', 'Great, but…', 'Filled inside']
const QUIPS = ['POP!', 'Gone!', 'Next!', 'Bye!', 'Kerning fixed', 'Smashed', 'Ahh', 'Detached']

const GH = 270 // virtual screen height; everything below is in these units
const GROUND = 222
const GRAVITY = 1500
const JUMP_V = -580
const PLAYER_X = 70
const PW = 30, PH = 40 // player hitbox

type Kind = 'crate' | 'ghost' | 'boulder' | 'cup'
type Ent = { kind: Kind; x: number; y: number; w: number; h: number; text?: string; accent?: string; t: number; dead?: boolean }
type Shard = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; color: string; life: number }
type Pop = { x: number; y: number; text: string; life: number }
type Phase = 'title' | 'play' | 'paused' | 'over'
type Result = { score: number; best: number; smashed: number; cups: number; newBest: boolean }

type Palette = Record<'ink' | 'paper' | 'cream' | 'desk' | 'sky' | 'sun' | 'mint' | 'leaf' | 'pink' | 'blue' | 'muted', string>
function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return {
    ink: v('--color-ink'), paper: v('--color-paper'), cream: v('--color-cream'), desk: v('--color-desk'),
    sky: v('--color-sky'), sun: v('--color-sun'), mint: v('--color-mint'), leaf: v('--color-leaf'),
    pink: v('--color-pink'), blue: v('--color-pop-blue'), muted: v('--color-muted'),
  }
}

export function PopIsland() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const api = useRef({ start: () => {}, jump: () => {}, smash: () => {}, pause: () => {} })
  const [phase, setPhase] = useState<Phase>('title')
  const [result, setResult] = useState<Result | null>(null)
  const [sound, setSound] = useState(soundOn)
  const [best] = useState(() => load('island-best', 0))

  useEffect(() => {
    const cv = canvas.current!
    const box = wrap.current!
    const ctx = cv.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const C = readPalette()
    const apple = new Image()
    apple.src = '/brand/apple.webp'

    let W = 0, dpr = 1, scale = 1, VW = 480
    let raf = 0, last = 0
    let ph: Phase = 'title'
    let audio: AudioContext | null = null

    // run state
    let dist = 0, speed = 150, energy = 100, score = 0, smashed = 0, cups = 0
    let py = GROUND, vy = 0, onGround = true, swing = 0, swingCd = 0, hurt = 0, shake = 0, nextSpawn = 260
    let ents: Ent[] = []
    let shards: Shard[] = []
    let pops: Pop[] = []
    let crateIdx = Math.floor(Math.random() * CRATES.length)

    const resize = () => {
      const r = box.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      const H = r.height
      cv.width = W * dpr; cv.height = H * dpr
      cv.style.width = W + 'px'; cv.style.height = H + 'px'
      scale = H / GH
      VW = W / scale
      if (ph !== 'play') draw()
    }

    // --- sound: tiny synth blips, off unless the visitor turned sound on ---
    const tone = (from: number, to: number, len: number, type: OscillatorType = 'square', vol = 0.12) => {
      if (!soundOn()) return
      try {
        audio ??= new AudioContext()
        if (audio.state === 'suspended') void audio.resume()
        const t = audio.currentTime
        const o = audio.createOscillator(), g = audio.createGain()
        o.type = type
        o.frequency.setValueAtTime(from, t)
        o.frequency.exponentialRampToValueAtTime(to, t + len)
        g.gain.setValueAtTime(vol, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
        o.connect(g).connect(audio.destination)
        o.start(t); o.stop(t + len + 0.02)
      } catch { /* audio unavailable */ }
    }
    const crack = () => {
      if (!soundOn()) return
      try {
        audio ??= new AudioContext()
        const len = audio.sampleRate * 0.18
        const buf = audio.createBuffer(1, len, audio.sampleRate)
        const d = buf.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
        const src = audio.createBufferSource(); src.buffer = buf
        const g = audio.createGain(); g.gain.value = 0.35
        src.connect(g).connect(audio.destination); src.start()
      } catch { /* audio unavailable */ }
    }

    const reset = () => {
      dist = 0; speed = 150; energy = 100; score = 0; smashed = 0; cups = 0
      py = GROUND; vy = 0; onGround = true; swing = 0; swingCd = 0; hurt = 0; shake = 0; nextSpawn = 260
      ents = []; shards = []; pops = []
    }

    const spawn = () => {
      const x = VW + 40
      const r = Math.random()
      const accents = [C.pink, C.sun, C.mint, C.sky]
      if (r < 0.42) {
        ents.push({ kind: 'crate', x, y: GROUND, w: 74, h: 42, text: CRATES[crateIdx++ % CRATES.length], accent: accents[Math.floor(Math.random() * accents.length)], t: 0 })
      } else if (r < 0.62) {
        ents.push({ kind: 'ghost', x, y: GROUND - 14, w: 38, h: 40, t: Math.random() * 6 })
      } else if (r < 0.8) {
        ents.push({ kind: 'boulder', x, y: GROUND, w: 36, h: 36, t: 0 })
      } else {
        const high = Math.random() < 0.5
        ents.push({ kind: 'cup', x, y: high ? GROUND - 92 : GROUND - 20, w: 22, h: 26, t: Math.random() * 6 })
      }
      nextSpawn = 150 + Math.random() * 170 + speed * 0.25
    }

    const burst = (x: number, y: number, colors: string[], n: number) => {
      const k = reduce ? Math.ceil(n / 3) : n
      for (let i = 0; i < k; i++) {
        const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 260
        shards.push({ x, y, vx: Math.cos(a) * s + speed * 0.3, vy: Math.sin(a) * s - 180, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, s: 4 + Math.random() * 9, color: colors[i % colors.length], life: 1 })
      }
    }

    const jump = () => {
      if (ph !== 'play' || !onGround) return
      vy = JUMP_V; onGround = false
      tone(300, 700, 0.14)
    }
    const smash = () => {
      if (ph !== 'play' || swingCd > 0) return
      swing = 0.26; swingCd = 0.32
      tone(180, 90, 0.08, 'triangle', 0.15)
      // mallet reach: in front of the apple, from feet to a bit above the head
      const x1 = PLAYER_X + 6, x2 = PLAYER_X + 78, top = py - PH - 24, bot = py + 2
      for (const e of ents) {
        if (e.dead) continue
        const ex1 = e.x - e.w / 2, ex2 = e.x + e.w / 2, et = e.y - e.h, eb = e.y
        if (ex2 < x1 || ex1 > x2 || eb < top || et > bot) continue
        if (e.kind === 'boulder') { pops.push({ x: e.x, y: et - 6, text: 'CLONK! Jump it', life: 1 }); tone(120, 110, 0.12, 'square', 0.1); continue }
        if (e.kind === 'cup') continue
        e.dead = true
        const pts = e.kind === 'ghost' ? 150 : 100
        score += pts; smashed++
        save('smashed', load('smashed', 0) + 1)
        burst(e.x, e.y - e.h / 2, e.kind === 'ghost' ? [C.paper, C.sky, C.ink] : [C.paper, e.accent ?? C.sun, C.ink], 22)
        pops.push({ x: e.x, y: et - 4, text: QUIPS[Math.floor(Math.random() * QUIPS.length)], life: 1 })
        if (!reduce) shake = 6
        crack()
      }
    }

    const over = () => {
      ph = 'over'
      const prev = load('island-best', 0)
      const newBest = score > prev
      if (newBest) save('island-best', score)
      setResult({ score, best: Math.max(prev, score), smashed, cups, newBest })
      setPhase('over')
      tone(400, 80, 0.6, 'sawtooth', 0.08)
    }

    const update = (dt: number) => {
      dist += speed * dt
      speed = Math.min(330, 150 + dist * 0.012)
      energy -= (3.2 + speed * 0.008) * dt
      score += Math.round(speed * dt * 0.1)

      vy += GRAVITY * dt; py += vy * dt
      if (py >= GROUND) { py = GROUND; vy = 0; onGround = true }
      swing = Math.max(0, swing - dt); swingCd = Math.max(0, swingCd - dt); hurt = Math.max(0, hurt - dt)

      nextSpawn -= speed * dt
      if (nextSpawn <= 0) spawn()

      const pl = PLAYER_X - PW / 2, pr = PLAYER_X + PW / 2, pt = py - PH, pb = py
      for (const e of ents) {
        e.t += dt
        e.x -= (speed + (e.kind === 'ghost' ? 40 : e.kind === 'boulder' ? 70 : 0)) * dt
        if (e.dead) continue
        const bob = e.kind === 'ghost' || e.kind === 'cup' ? Math.sin(e.t * 4) * 5 : 0
        const el = e.x - e.w / 2 + 4, er = e.x + e.w / 2 - 4, et = e.y - e.h + bob + 4, eb = e.y + bob - 2
        if (er < pl || el > pr || eb < pt || et > pb) continue
        if (e.kind === 'cup') {
          e.dead = true; cups++; energy = Math.min(100, energy + 30); score += 50
          pops.push({ x: e.x, y: e.y - 34, text: '+café', life: 1 })
          tone(500, 1000, 0.18, 'sine', 0.14)
          continue
        }
        if (hurt > 0) continue
        energy -= 25; hurt = 1.1
        if (!reduce) shake = 10
        e.dead = true
        burst(e.x, e.y - e.h / 2, [C.ink, C.paper], 10)
        pops.push({ x: PLAYER_X, y: py - 60, text: 'Ouch', life: 1 })
        tone(220, 60, 0.3, 'sawtooth', 0.1)
      }
      ents = ents.filter((e) => e.x > -80 && !(e.dead && e.kind !== 'boulder'))

      for (const s of shards) { s.vy += GRAVITY * 0.7 * dt; s.x += s.vx * dt - speed * dt; s.y += s.vy * dt; s.r += s.vr * dt; s.life -= dt * 1.1 }
      shards = shards.filter((s) => s.life > 0 && s.y < GH + 20)
      for (const p of pops) { p.y -= 30 * dt; p.x -= speed * 0.4 * dt; p.life -= dt * 1.2 }
      pops = pops.filter((p) => p.life > 0)

      if (energy <= 0) { energy = 0; over() }
    }

    // --- drawing ---
    const outline = (w = 2) => { ctx.lineWidth = w; ctx.strokeStyle = C.ink; ctx.stroke() }
    const rect = (x: number, y: number, w: number, h: number, fill: string, shadow = 0) => {
      if (shadow) { ctx.fillStyle = C.ink; ctx.fillRect(x + shadow, y + shadow, w, h) }
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fillStyle = fill; ctx.fill(); outline()
    }

    const drawBackdrop = () => {
      ctx.fillStyle = C.sky; ctx.fillRect(0, 0, VW, GH)
      // sun
      ctx.beginPath(); ctx.arc(VW - 70, 52, 24, 0, Math.PI * 2); ctx.fillStyle = C.sun; ctx.fill(); outline()
      // clouds (slow parallax)
      const cx = reduce ? 0 : dist * 0.08
      for (let i = 0; i < 4; i++) {
        const x = ((i * 190 + 60 - cx) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = 30 + (i % 2) * 34
        ctx.beginPath(); ctx.ellipse(x, y, 30, 11, 0, 0, Math.PI * 2); ctx.ellipse(x + 18, y - 7, 18, 11, 0, 0, Math.PI * 2)
        ctx.fillStyle = C.paper; ctx.fill(); outline(1.5)
      }
      // sea
      ctx.fillStyle = C.blue; ctx.fillRect(0, 150, VW, GROUND - 150)
      ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(VW, 150); outline()
      // far islands
      const ix = dist * 0.18
      for (let i = 0; i < 3; i++) {
        const x = ((i * 260 + 120 - ix) % (VW + 300) + VW + 300) % (VW + 300) - 150
        ctx.beginPath(); ctx.ellipse(x, 152, 70, 22, 0, Math.PI, 0); ctx.fillStyle = C.mint; ctx.fill(); outline()
      }
      // palms (mid parallax)
      const px = dist * 0.45
      for (let i = 0; i < 4; i++) {
        const x = ((i * 170 + 40 - px) % (VW + 200) + VW + 200) % (VW + 200) - 60
        drawPalm(x, GROUND - 6, i % 2 ? 0.85 : 1)
      }
      // ground: grass lip + sand with scrolling tiles
      ctx.fillStyle = C.cream; ctx.fillRect(0, GROUND, VW, GH - GROUND)
      ctx.fillStyle = C.mint; ctx.fillRect(0, GROUND, VW, 9)
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(VW, GROUND); ctx.moveTo(0, GROUND + 9); ctx.lineTo(VW, GROUND + 9); outline()
      const off = dist % 40
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = C.muted
      for (let x = -off; x < VW + 40; x += 40) { ctx.fillRect(x + 6, GROUND + 22, 14, 4); ctx.fillRect(x + 26, GROUND + 36, 8, 4) }
      ctx.restore()
    }

    const drawPalm = (x: number, base: number, s: number) => {
      const h = 78 * s
      ctx.beginPath(); ctx.moveTo(x - 4, base); ctx.quadraticCurveTo(x + 8, base - h / 2, x + 4, base - h)
      ctx.lineTo(x + 11, base - h); ctx.quadraticCurveTo(x + 16, base - h / 2, x + 5, base); ctx.closePath()
      ctx.fillStyle = C.muted; ctx.fill(); outline(1.5)
      for (const a of [-2.8, -2.2, -1.6, -1.0, -0.35]) {
        const tx = x + 7 + Math.cos(a) * 46 * s, ty = base - h + Math.sin(a) * 8 * s + 24 * s
        ctx.beginPath(); ctx.moveTo(x + 7, base - h); ctx.quadraticCurveTo((x + 7 + tx) / 2, base - h - 22 * s, tx, ty)
        ctx.quadraticCurveTo((x + 7 + tx) / 2, base - h - 2 * s, x + 7, base - h)
        ctx.fillStyle = C.leaf; ctx.fill(); outline(1.5)
      }
    }

    const drawEnt = (e: Ent) => {
      const bob = e.kind === 'ghost' || e.kind === 'cup' ? Math.sin(e.t * 4) * 5 : 0
      ctx.save(); ctx.translate(e.x, e.y + bob)
      if (e.kind === 'crate') {
        rect(-e.w / 2, -e.h, e.w, e.h, C.paper, 3)
        ctx.fillStyle = e.accent!; ctx.fillRect(-e.w / 2 + 1, -e.h + 1, e.w - 2, 8)
        ctx.beginPath(); ctx.moveTo(-e.w / 2, -e.h + 9); ctx.lineTo(e.w / 2, -e.h + 9); outline(1.5)
        ctx.fillStyle = C.ink; ctx.font = '700 10px Figtree, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(e.text!, 0, -e.h / 2 + 4, e.w - 8)
      } else if (e.kind === 'ghost') {
        ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-17, -24); ctx.arc(0, -24, 17, Math.PI, 0); ctx.lineTo(17, 0)
        for (let i = 0; i < 4; i++) ctx.lineTo(17 - (i + 0.5) * 8.5, i % 2 ? 0 : -6)
        ctx.closePath(); ctx.fillStyle = C.paper; ctx.fill(); outline()
        ctx.fillStyle = C.ink; ctx.fillRect(-9, -30, 4, 6); ctx.fillRect(3, -30, 4, 6)
        ctx.font = '700 8px Figtree, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = C.blue
        ctx.fillText('Seen ✓✓', 0, -12)
      } else if (e.kind === 'boulder') {
        ctx.translate(0, -e.h / 2); ctx.rotate(-e.t * 6)
        ctx.beginPath(); ctx.arc(0, 0, e.h / 2, 0, Math.PI * 2); ctx.fillStyle = C.desk; ctx.fill(); outline()
        ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(2, -2); ctx.moveTo(4, 8); ctx.lineTo(10, 2); outline(1.5)
        ctx.rotate(e.t * 6)
        ctx.fillStyle = C.ink; ctx.font = '700 8px Figtree, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('1 more', 0, -3); ctx.fillText('change', 0, 6)
      } else {
        // café con leche: cup + steam
        rect(-10, -22, 20, 20, C.paper, 2)
        ctx.fillStyle = C.desk; ctx.fillRect(-9, -21, 18, 6)
        ctx.beginPath(); ctx.arc(12, -12, 5, -Math.PI / 2, Math.PI / 2); outline(2)
        ctx.beginPath(); ctx.moveTo(-3, -26); ctx.quadraticCurveTo(-7, -31, -3, -36); ctx.moveTo(4, -26); ctx.quadraticCurveTo(0, -31, 4, -36); outline(1.5)
      }
      ctx.restore()
    }

    const drawPlayer = (t: number) => {
      const running = ph === 'play'
      const step = running && onGround ? Math.abs(Math.sin(t * 14)) : 0
      const sq = !onGround ? (vy < 0 ? 1.08 : 0.95) : 1 - step * 0.05
      const blink = hurt > 0 && Math.floor(hurt * 12) % 2 === 0
      if (blink) return
      ctx.save(); ctx.translate(PLAYER_X, py - step * 4)
      // shadow on the ground
      ctx.save(); ctx.translate(0, GROUND - py + step * 4); ctx.beginPath(); ctx.ellipse(0, 1, 16, 3, 0, 0, Math.PI * 2); ctx.globalAlpha = 0.18; ctx.fillStyle = C.ink; ctx.fill(); ctx.restore()
      // mallet: rests on the back, swings over the top to the front
      const p = swing > 0 ? 1 - swing / 0.26 : 0
      const ang = swing > 0 ? -2.2 + p * 3.4 : -2.4
      ctx.save(); ctx.translate(4, -28); ctx.rotate(ang)
      ctx.fillStyle = C.desk; ctx.beginPath(); ctx.rect(-2, -2, 32, 5); ctx.fill(); outline(1.5)
      ctx.beginPath(); ctx.rect(26, -9, 14, 19); ctx.fillStyle = C.pink; ctx.fill(); outline(2)
      ctx.restore()
      ctx.scale(1 / Math.sqrt(sq), sq)
      if (apple.complete && apple.naturalWidth) ctx.drawImage(apple, -23, -52, 46, 54)
      else { ctx.beginPath(); ctx.arc(0, -22, 20, 0, Math.PI * 2); ctx.fillStyle = C.pink; ctx.fill(); outline() }
      ctx.restore()
      // swoosh
      if (swing > 0.05 && swing < 0.2 && !reduce) {
        ctx.beginPath(); ctx.arc(PLAYER_X + 8, py - 26, 46, -1.2, 0.9); ctx.lineWidth = 3; ctx.strokeStyle = C.paper; ctx.stroke()
      }
    }

    const drawHud = () => {
      ctx.font = '12px Silkscreen, ui-monospace, monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = C.ink
      ctx.fillText('ENERGY', 12, 10)
      const segs = 14, on = Math.ceil((energy / 100) * segs)
      for (let i = 0; i < segs; i++) {
        ctx.beginPath(); ctx.rect(70 + i * 9, 10, 7, 12)
        ctx.fillStyle = i < on ? (energy < 30 ? C.pink : C.sun) : C.paper; ctx.fill(); outline(1.5)
      }
      ctx.textAlign = 'right'; ctx.fillStyle = C.ink
      ctx.fillText(`SCORE ${String(score).padStart(6, '0')}`, VW - 12, 10)
    }

    const draw = (t = 0) => {
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0)
      ctx.save()
      if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.85; if (shake < 0.3) shake = 0 }
      drawBackdrop()
      for (const e of ents) if (!e.dead || e.kind === 'boulder') drawEnt(e)
      drawPlayer(t)
      for (const s of shards) {
        ctx.save(); ctx.globalAlpha = Math.max(0, s.life); ctx.translate(s.x, s.y); ctx.rotate(s.r)
        ctx.beginPath(); ctx.moveTo(0, -s.s / 2); ctx.lineTo(s.s / 2, s.s / 2); ctx.lineTo(-s.s / 2, s.s / 3); ctx.closePath()
        ctx.fillStyle = s.color; ctx.fill(); outline(1); ctx.restore()
      }
      for (const p of pops) {
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 1.5)
        ctx.font = '800 16px "Bricolage Grotesque", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
        ctx.lineWidth = 4; ctx.strokeStyle = C.paper; ctx.strokeText(p.text, p.x, p.y)
        ctx.fillStyle = C.ink; ctx.fillText(p.text, p.x, p.y); ctx.restore()
      }
      if (ph === 'play' || ph === 'paused') drawHud()
      ctx.restore()
    }

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000 || 0)
      last = now
      if (ph === 'play') update(dt)
      draw(now / 1000)
      if (ph === 'play') raf = requestAnimationFrame(loop)
    }
    const run = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop) }

    const start = () => { reset(); ph = 'play'; setPhase('play'); setResult(null); box.focus(); run() }
    const pause = () => {
      if (ph === 'play') { ph = 'paused'; setPhase('paused'); cancelAnimationFrame(raf); draw() }
      else if (ph === 'paused') { ph = 'play'; setPhase('play'); box.focus(); run() }
    }
    api.current = { start, jump, smash, pause }

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (ph === 'play' && [' ', 'arrowup', 'w'].includes(k)) { e.preventDefault(); jump() }
      else if (ph === 'play' && ['x', 'j', 'arrowright', 'enter'].includes(k)) { e.preventDefault(); smash() }
      else if (['p', 'escape'].includes(k) && (ph === 'play' || ph === 'paused')) { e.preventDefault(); pause() }
    }
    // touch: left half jumps, right half smashes
    const onDown = (e: PointerEvent) => {
      if (ph !== 'play') return
      const r = cv.getBoundingClientRect()
      if (e.clientX - r.left < r.width / 2) jump(); else smash()
    }
    const onHide = () => { if (document.hidden && ph === 'play') pause() }

    resize()
    apple.onload = () => { if (ph !== 'play') draw() }
    document.fonts.ready.then(() => { if (ph !== 'play') draw() })
    const ro = new ResizeObserver(resize); ro.observe(box)
    box.addEventListener('keydown', onKey)
    cv.addEventListener('pointerdown', onDown)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      box.removeEventListener('keydown', onKey); cv.removeEventListener('pointerdown', onDown)
      document.removeEventListener('visibilitychange', onHide)
      void audio?.close()
    }
  }, [])

  const toggleSound = () => { const next = !sound; setSound(next); setSoundOn(next) }

  return (
    <div className="grid gap-3">
      <div ref={wrap} tabIndex={0} aria-label="Pop Island game. Space to jump, X to smash, P to pause."
        className="relative aspect-[4/3] w-full overflow-hidden border-2 border-ink bg-sky sm:aspect-[16/9]">
        <canvas ref={canvas} className="block touch-none select-none" role="img" aria-label="An apple with a mallet runs along an island, smashing job-hunt clichés" />

        {phase === 'title' && (
          <Overlay>
            <p className="font-pixel text-ui">STEAM ROOM ARCADE</p>
            <h3 className="font-display text-title-sm leading-none sm:text-title">Pop Island</h3>
            <p className="hidden max-w-[36ch] text-body-sm sm:block">Smash the clichés. Jump the boulders you can't break. Drink cafés con leche before your energy runs out.</p>
            <button type="button" className="btn btn-sun" onClick={() => api.current.start()}>Start ▶</button>
            {best > 0 && <p className="font-pixel text-caption">BEST {best}</p>}
          </Overlay>
        )}
        {phase === 'paused' && (
          <Overlay>
            <h3 className="font-display text-title-sm">Paused</h3>
            <button type="button" className="btn" onClick={() => api.current.pause()}>Keep going ▶</button>
          </Overlay>
        )}
        {phase === 'over' && result && (
          <Overlay>
            <p className="hidden font-pixel text-ui sm:block">OUT OF ENERGY</p>
            <h3 className="font-display text-title-sm leading-none sm:text-title">{result.score}{result.newBest ? ' · new best!' : ''}</h3>
            <p className="text-body-sm">{result.smashed} smashed · {result.cups} {result.cups === 1 ? 'café' : 'cafés'} con leche · best {result.best}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className="btn btn-sun" onClick={() => api.current.start()}>Again ▶</button>
              <a className="btn btn-mint" href={KOFI_URL} target="_blank" rel="noreferrer">Buy me a café con leche ☕</a>
            </div>
            <p className="hidden max-w-[40ch] text-caption text-muted sm:block">You drank {result.cups}. Make It Pop is free and still being built. If it made your day lighter, one back keeps it going.</p>
          </Overlay>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn" disabled={phase !== 'play'} onPointerDown={(e) => { e.preventDefault(); api.current.jump() }} onClick={(e) => { if (e.detail === 0) api.current.jump() }}>Jump <span className="font-pixel text-caption">SPACE</span></button>
        <button type="button" className="btn btn-sun" disabled={phase !== 'play'} onPointerDown={(e) => { e.preventDefault(); api.current.smash() }} onClick={(e) => { if (e.detail === 0) api.current.smash() }}>Smash <span className="font-pixel text-caption">X</span></button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={phase !== 'play' && phase !== 'paused'} onClick={() => api.current.pause()}>{phase === 'paused' ? 'Resume' : 'Pause'}</button>
        <button type="button" className="btn btn-ghost btn-sm" aria-pressed={sound} onClick={toggleSound}>Sound: {sound ? 'on' : 'off'}</button>
        <p className="ml-auto text-ui text-muted">On a phone: tap left to jump, right to smash.</p>
      </div>
    </div>
  )
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-2 sm:p-4">
      <div className="win grid max-h-full max-w-md justify-items-center gap-2 overflow-auto p-3 text-center sm:gap-3 sm:p-5">{children}</div>
    </div>
  )
}
