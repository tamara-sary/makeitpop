// UI sounds, synthesised live with Web Audio (no files to load).
// Base "pop" recreated from recent.design: sine, pitch rising 420 -> 760 Hz, 2 ms attack, fast fade, ~0.22 s.
// Variants retune the same shape so every sound feels like one family.
import { load, save } from './store'

type Pop = { from: number; to: number; vol: number; len: number; type?: OscillatorType }
const SOUNDS = {
  pop: { from: 420, to: 760, vol: 0.39, len: 0.22 }, // the reference click
  cta: { from: 520, to: 980, vol: 0.34, len: 0.2 }, // brighter: "go"
  drop: { from: 300, to: 520, vol: 0.32, len: 0.2 }, // lower: a sticky landing
  stick: { from: 600, to: 1200, vol: 0.28, len: 0.18 }, // highest: your sticky is stuck
} satisfies Record<string, Pop>
export type SoundName = keyof typeof SOUNDS

let ctx: AudioContext | null = null
const KEY = 'sound-on'

export const soundOn = () => load<boolean>(KEY, false) // off until the visitor turns it on
export function setSoundOn(on: boolean) {
  save(KEY, on)
  if (on) play('pop') // confirm with a pop when turning sound on
}

export function play(name: SoundName = 'pop') {
  if (!soundOn()) return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const s: Pop = SOUNDS[name]
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = s.type ?? 'sine'
    osc.frequency.setValueAtTime(s.from, t)
    osc.frequency.exponentialRampToValueAtTime(s.to, t + s.len * 0.55)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(s.vol, t + 0.002)
    gain.gain.setTargetAtTime(0.0001, t + 0.002, 0.03)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + s.len)
  } catch {
    /* audio blocked or unsupported: stay silent */
  }
}

// Every CTA button (.btn) and anything marked data-sound plays on click, site-wide, without wiring each one.
export function installClickSounds() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-sound], .btn')
    if (!el || (el as HTMLButtonElement).disabled || el.dataset.sound === 'none') return
    play((el.dataset.sound as SoundName) || 'cta')
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}
