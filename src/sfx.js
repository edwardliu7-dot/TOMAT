/**
 * TOMAT SFX — procedurally synthesised sound effects via Web Audio API.
 * No audio files needed; all sounds are generated in real-time.
 *
 * Usage:
 *   import { playSfx, toggleSfx, isSfxEnabled, skinToSfxKey } from '../sfx'
 *   playSfx('correct') | playSfx('buy') | playSfx('feed_kelinsay') | playSfx('happy_nananaga')
 */

const SFX_KEY = 'tomat_sfx_enabled'

let _ctx = null
let _enabled = (() => {
  try { return localStorage.getItem(SFX_KEY) !== 'false' } catch { return true }
})()

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {})
  return _ctx
}

export function isSfxEnabled() { return _enabled }
export function setSfxEnabled(val) {
  _enabled = Boolean(val)
  try { localStorage.setItem(SFX_KEY, _enabled ? 'true' : 'false') } catch {}
}
export function toggleSfx() { setSfxEnabled(!_enabled); return _enabled }

// ── Core helpers ─────────────────────────────────────────────────────────────

/** One-shot tone with attack + exponential decay */
function tone(ctx, type, freq, t0, dur, peak = 0.26) {
  const osc = ctx.createOscillator(), g = ctx.createGain()
  osc.connect(g); g.connect(ctx.destination)
  osc.type = type; osc.frequency.value = freq
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.start(t0); osc.stop(t0 + dur + 0.02)
}

/** Pitch-sliding tone (glide) */
function glide(ctx, type, f0, f1, t0, dur, peak = 0.22) {
  const osc = ctx.createOscillator(), g = ctx.createGain()
  osc.connect(g); g.connect(ctx.destination)
  osc.type = type
  osc.frequency.setValueAtTime(f0, t0)
  osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur * 0.8)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.start(t0); osc.stop(t0 + dur + 0.02)
}

// ── Skin → SFX key mapping ────────────────────────────────────────────────────
/**
 * Maps an equipped pet skinId to a base key used for feed_* and happy_* sounds.
 * Returns one of: 'tomi' | 'tomi_silver' | 'tomi_cosmic' | 'tomi_void' |
 *                 'kelinsay' | 'monyang' | 'nananaga'
 */
export function skinToSfxKey(skinId) {
  if (!skinId || skinId === 'golden')    return 'tomi'
  if (skinId === 'pet_skin_silver')      return 'tomi_silver'
  if (skinId === 'pet_skin_cosmic')      return 'tomi_cosmic'
  if (skinId === 'pet_skin_void')        return 'tomi_void'
  if (skinId.startsWith('pet_kelinsay')) return 'kelinsay'
  if (skinId.startsWith('pet_monyong'))  return 'monyang'
  if (skinId.startsWith('pet_nananaga')) return 'nananaga'
  return 'tomi'
}

// ── Sound definitions ─────────────────────────────────────────────────────────
const SOUNDS = {

  // ── Game events ──────────────────────────────────────────────────────────
  /** ✅ Correct answer — ascending C5→E5→G5 arpeggio */
  correct() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => tone(ctx, 'sine', f, n + i * 0.09, 0.22, 0.28))
  },
  /** ❌ Wrong answer — descending sawtooth growl */
  wrong() {
    const ctx = getCtx(), n = ctx.currentTime
    glide(ctx, 'sawtooth', 210, 75, n, 0.4, 0.16)
  },
  /** 🎉 Level up — triumphant C5→E5→G5→C6 fanfare */
  levelup() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[[523.25,0],[659.25,.13],[783.99,.26],[1046.5,.40]].forEach(([f,d],i) =>
      tone(ctx, 'triangle', f, n+d, i===3 ? 0.55 : 0.2, 0.30))
  },
  /** 🔥 Streak bonus — bright C5→E5→G5→B5 */
  streak() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[523.25, 659.25, 783.99, 987.77].forEach((f, i) => tone(ctx, 'sine', f, n + i * 0.07, 0.2, 0.24))
  },

  // ── UI events ────────────────────────────────────────────────────────────
  /** 🖱️ Button click — soft tick */
  click() {
    const ctx = getCtx(), n = ctx.currentTime
    tone(ctx, 'sine', 1100, n, 0.055, 0.10)
  },

  // ── Shop events ──────────────────────────────────────────────────────────
  /** 🪙 Buy — ka-ching two-tone */
  buy() {
    const ctx = getCtx(), n = ctx.currentTime
    tone(ctx, 'sine', 1046.5, n,        0.14, 0.22)   // C6
    tone(ctx, 'sine', 1318.5, n + 0.09, 0.20, 0.28)   // E6
  },
  /** ✨ Equip — magical ascending shimmer */
  equip() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[659.25, 783.99, 987.77, 1318.5].forEach((f, i) =>
      tone(ctx, 'sine', f, n + i * 0.055, 0.15, 0.18))
  },

  // ── Pet sounds: Tomi variants ─────────────────────────────────────────────
  /** 🐱 Tomi (golden) — warm friendly nom, C4→G4 glide */
  feed_tomi() {
    const ctx = getCtx(), n = ctx.currentTime
    glide(ctx, 'sine', 261.63, 392, n, 0.38, 0.24)
    tone(ctx, 'sine', 523.25, n + 0.22, 0.18, 0.12)
  },
  /** 🥈 Tomi Silver — metallic ping A5+C#6 */
  feed_tomi_silver() {
    const ctx = getCtx(), n = ctx.currentTime
    tone(ctx, 'triangle', 880,     n,       0.30, 0.20)
    tone(ctx, 'triangle', 1108.73, n + 0.1, 0.22, 0.14)
  },
  /** 🌌 Tomi Cosmic — spacey wobble with detune echo */
  feed_tomi_cosmic() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[523.25, 659.25, 523.25].forEach((f, i) => tone(ctx, 'sine', f, n + i * 0.11, 0.18, 0.18))
    tone(ctx, 'sine', 783.99, n + 0.06, 0.25, 0.07)  // ghost overtone
  },
  /** 🌑 Tomi Void — deep dark nom, low sawtooth */
  feed_tomi_void() {
    const ctx = getCtx(), n = ctx.currentTime
    glide(ctx, 'sawtooth', 130.81, 164.81, n, 0.45, 0.14)
    tone(ctx, 'sine', 261.63, n + 0.2, 0.2, 0.08)
  },

  // ── Pet sounds: Kelinsay ──────────────────────────────────────────────────
  /** 🐰 Kelinsay — cute high-pitched double yip B5+D6 */
  feed_kelinsay() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[987.77, 1174.66].forEach((f, i) => tone(ctx, 'triangle', f, n + i * 0.13, 0.15, 0.20))
  },

  // ── Pet sounds: Monyang ───────────────────────────────────────────────────
  /** 🐒 Monyang — playful boop glide A4→D5 */
  feed_monyang() {
    const ctx = getCtx(), n = ctx.currentTime
    glide(ctx, 'triangle', 440, 587.33, n, 0.28, 0.22)
    tone(ctx, 'sine', 440, n + 0.2, 0.15, 0.08)
  },

  // ── Pet sounds: Nananaga ──────────────────────────────────────────────────
  /** 🦎 Nananaga — exotic mystical three-tone shimmer F#5+A5+C#6 */
  feed_nananaga() {
    const ctx = getCtx(), n = ctx.currentTime
    ;[739.99, 880, 1108.73].forEach((f, i) => {
      tone(ctx, 'sine', f,          n + i * 0.10, 0.35, 0.16)
      tone(ctx, 'sine', f * 1.006,  n + i * 0.10 + 0.01, 0.30, 0.06)  // slight detune halo
    })
  },

  // ── Pet happy (tap) sounds ────────────────────────────────────────────────
  happy_tomi()       { const ctx=getCtx(),n=ctx.currentTime; [659.25,783.99].forEach((f,i)=>tone(ctx,'sine',f,n+i*.10,.14,.20)) },
  happy_tomi_silver(){ const ctx=getCtx(),n=ctx.currentTime; [880,1046.5].forEach((f,i)=>tone(ctx,'triangle',f,n+i*.08,.12,.16)) },
  happy_tomi_cosmic(){ const ctx=getCtx(),n=ctx.currentTime; [783.99,987.77,783.99].forEach((f,i)=>tone(ctx,'sine',f,n+i*.08,.11,.14)) },
  happy_tomi_void()  { const ctx=getCtx(),n=ctx.currentTime; glide(ctx,'sawtooth',196,261.63,n,.25,.14) },
  happy_kelinsay()   { const ctx=getCtx(),n=ctx.currentTime; [1174.66,1318.5].forEach((f,i)=>tone(ctx,'triangle',f,n+i*.07,.10,.18)) },
  happy_monyang()    { const ctx=getCtx(),n=ctx.currentTime; [523.25,659.25,523.25].forEach((f,i)=>tone(ctx,'triangle',f,n+i*.08,.10,.18)) },
  happy_nananaga()   { const ctx=getCtx(),n=ctx.currentTime; [739.99,1108.73,739.99].forEach((f,i)=>{ tone(ctx,'sine',f,n+i*.08,.12,.14); if(i===1)tone(ctx,'sine',f*1.005,n+i*.08+.01,.10,.05) }) },

  // ── Pet revive ────────────────────────────────────────────────────────────
  /** 💫 Revive — dramatic rising sweep + sparkle burst */
  pet_revive() {
    const ctx = getCtx(), n = ctx.currentTime
    glide(ctx, 'sine', 196, 1046.5, n, 0.55, 0.22)
    ;[783.99, 987.77, 1318.5, 1568].forEach((f, i) =>
      tone(ctx, 'triangle', f, n + 0.42 + i * 0.07, 0.18, 0.16))
  },
}

/**
 * Play a named sound effect. Silently ignored when muted or AudioContext unavailable.
 * @param {string} name — one of the SOUNDS keys
 */
export function playSfx(name) {
  if (!_enabled) return
  try { SOUNDS[name]?.() } catch (_) {}
}
