/**
 * AudioPanel — speaker button that opens a popover with BGM + SFX volume sliders.
 * Works in both mobile floating mode and desktop sidebar mode.
 *
 * Props:
 *   placement: 'up-right' (mobile) | 'up-left' (sidebar)
 *   buttonStyle: style object for the trigger button
 */
import React, { useState, useEffect, useRef } from 'react'
import { isSfxEnabled, setSfxEnabled, getSfxVolume, setSfxVolume } from '../sfx'
import { isBgmEnabled, setBgmEnabled, getBgmVolume, setBgmVolume } from '../bgm'

const SLIDER_CSS = `
  .tomat-vol-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 99px;
    outline: none;
    cursor: pointer;
    background: linear-gradient(to right, var(--fill) 0%, var(--fill) var(--pct), rgba(255,255,255,0.12) var(--pct), rgba(255,255,255,0.12) 100%);
  }
  .tomat-vol-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    cursor: pointer;
  }
  .tomat-vol-slider::-moz-range-thumb {
    width: 14px; height: 14px;
    border: none; border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    cursor: pointer;
  }
`

function VolSlider({ value, onChange, color = '#818CF8' }) {
  const pct = Math.round(value * 100)
  return (
    <input
      type="range"
      min={0} max={100} step={1}
      value={pct}
      onChange={e => onChange(Number(e.target.value) / 100)}
      className="tomat-vol-slider"
      style={{ '--fill': color, '--pct': `${pct}%` }}
    />
  )
}

export default function AudioPanel({ placement = 'up-right', buttonStyle = {} }) {
  const [open, setOpen]       = useState(false)
  const [sfxOn,  setSfxOn]    = useState(() => isSfxEnabled())
  const [sfxVol, setSfxVolSt] = useState(() => getSfxVolume())
  const [bgmOn,  setBgmOn]    = useState(() => isBgmEnabled())
  const [bgmVol, setBgmVolSt] = useState(() => getBgmVolume())
  const wrapRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [open])

  const handleSfxToggle = () => {
    const next = !sfxOn
    setSfxEnabled(next)
    setSfxOn(next)
  }
  const handleSfxVol = (v) => {
    setSfxVolume(v)
    setSfxVolSt(v)
  }
  const handleBgmToggle = () => {
    const next = !bgmOn
    setBgmEnabled(next)
    setBgmOn(next)
  }
  const handleBgmVol = (v) => {
    setBgmVolume(v)
    setBgmVolSt(v)
  }

  // icon: muted only when both off
  const icon = (sfxOn || bgmOn) ? '🔊' : '🔇'

  // Popover position
  const panelPos = placement === 'up-left'
    ? { bottom: 'calc(100% + 10px)', left: 0 }
    : { bottom: 'calc(100% + 10px)', right: 0 }

  return (
    <>
      <style>{SLIDER_CSS}</style>
      <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={buttonStyle}
        >
          {icon}
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            ...panelPos,
            width: 220,
            background: '#1A1D27',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            zIndex: 500,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: 1.2 }}>
              PENGATURAN AUDIO
            </div>

            {/* BGM row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>🎵 Musik Latar</span>
                <button
                  type="button"
                  onClick={handleBgmToggle}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: bgmOn ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.07)',
                    color:      bgmOn ? '#818CF8'                 : '#475569',
                  }}
                >
                  {bgmOn ? 'Nyala' : 'Mati'}
                </button>
              </div>
              <VolSlider
                value={bgmOn ? bgmVol : 0}
                onChange={v => { if (!bgmOn) { setBgmEnabled(true); setBgmOn(true) } handleBgmVol(v) }}
                color="#818CF8"
              />
            </div>

            {/* SFX row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>🔔 Efek Suara</span>
                <button
                  type="button"
                  onClick={handleSfxToggle}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: sfxOn ? 'rgba(103,232,249,0.18)' : 'rgba(255,255,255,0.07)',
                    color:      sfxOn ? '#67E8F9'                 : '#475569',
                  }}
                >
                  {sfxOn ? 'Nyala' : 'Mati'}
                </button>
              </div>
              <VolSlider
                value={sfxOn ? sfxVol : 0}
                onChange={v => { if (!sfxOn) { setSfxEnabled(true); setSfxOn(true) } handleSfxVol(v) }}
                color="#67E8F9"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
