/**
 * TOMAT SFX — procedurally synthesised sound effects via Web Audio API.
 * No audio files needed; all sounds are generated in real-time.
 *
 * Usage:
 *   import { playSfx, toggleSfx, isSfxEnabled } from '../sfx'
 *   playSfx('correct') | playSfx('wrong') | playSfx('levelup') | playSfx('coin') | playSfx('click')
 */

const SFX_KEY = 'tomat_sfx_enabled'

let _ctx = null
let _enabled = (() => {
  try { return localStorage.getItem(SFX_KEY) !== 'false' } catch { return true }
})()

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {})
  return _ctx
}

export function isSfxEnabled() { return _enabled }

export function setSfxEnabled(val) {
  _enabled = Boolean(val)
  try { localStorage.setItem(SFX_KEY, _enabled ? 'true' : 'false') } catch {}
}

export function toggleSfx() {
  setSfxEnabled(!_enabled)
  return _enabled
}

/** Simple one-shot tone helper */
function tone(ctx, type, freq, t0, dur, peak = 0.28) {
  const osc = ctx.createOscillator()
  const g   = ctx.createGain()
  osc.connect(g)
  g.connect(ctx.destination)
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

const SOUNDS = {
  /** ✅ Correct answer — ascending C5 → E5 → G5 arpeggio */
  correct() {
    const ctx = getCtx(), now = ctx.currentTime
    ;[523.25, 659.25, 783.99].forEach((f, i) => tone(ctx, 'sine', f, now + i * 0.09, 0.22, 0.28))
  },

  /** ❌ Wrong answer — descending sawtooth growl */
  wrong() {
    const ctx = getCtx(), now = ctx.currentTime
    const osc = ctx.createOscillator(), g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(210, now)
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.38)
    g.gain.setValueAtTime(0.16, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    osc.start(now); osc.stop(now + 0.42)
  },

  /** 🎉 Level up — triumphant C5 → E5 → G5 → C6 fanfare */
  levelup() {
    const ctx = getCtx(), now = ctx.currentTime
    ;[[523.25, 0], [659.25, 0.13], [783.99, 0.26], [1046.5, 0.40]].forEach(([f, d], i) =>
      tone(ctx, 'triangle', f, now + d, i === 3 ? 0.55 : 0.2, 0.30)
    )
  },

  /** 🪙 Coin — quick clink G6 → C7 */
  coin() {
    const ctx = getCtx(), now = ctx.currentTime
    const osc = ctx.createOscillator(), g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1568, now)
    osc.frequency.exponentialRampToValueAtTime(2093, now + 0.06)
    g.gain.setValueAtTime(0.20, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    osc.start(now); osc.stop(now + 0.20)
  },

  /** 🖱️ Click — soft UI tick */
  click() {
    const ctx = getCtx(), now = ctx.currentTime
    tone(ctx, 'sine', 1100, now, 0.06, 0.11)
  },

  /** 🔥 Streak bonus — extra-bright C5→E5→G5→B5 */
  streak() {
    const ctx = getCtx(), now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 987.77].forEach((f, i) => tone(ctx, 'sine', f, now + i * 0.07, 0.2, 0.24))
  },
}

/**
 * Play a named sound effect. Silently ignored when muted or if AudioContext
 * is unavailable (e.g. SSR, restricted browser policies).
 * @param {'correct'|'wrong'|'levelup'|'coin'|'click'|'streak'} name
 */
export function playSfx(name) {
  if (!_enabled) return
  try {
    SOUNDS[name]?.()
  } catch (_) {
    // Ignore AudioContext errors (tab hidden, restricted context, etc.)
  }
}
