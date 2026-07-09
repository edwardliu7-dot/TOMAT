import React from 'react'
import { usePlayer } from '../PlayerContext'

export function TopBar({ title, onBack, accentColor = '#67E8F9' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: 12 }}>
      <button onClick={onBack} style={{
        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
        width: 40, height: 40, borderRadius: 10, cursor: 'pointer', fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>←</button>
      <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{title}</h2>
    </div>
  )
}

export function PlayerHeader() {
  const { player } = usePlayer()
  const expPct = Math.round((player.exp / player.maxExp) * 100)
  return (
    <div style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: 'linear-gradient(135deg, #6366F1, #A855F7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.15)',
      }}>{player.name[0].toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Elite Explorer</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#E2E2E6' }}>{player.name}</div>
        <div style={{ marginTop: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${expPct}%`, height: '100%', background: 'linear-gradient(90deg,#6366F1,#A855F7)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>EXP {player.exp}/{player.maxExp}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#EAB308' }}>🪙 {player.coins}</div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>Lv {player.level}</div>
      </div>
    </div>
  )
}

export function Card({ children, style = {}, border = 'rgba(255,255,255,0.08)' }) {
  return (
    <div style={{
      background: '#1E2128', borderRadius: 16, border: `1px solid ${border}`,
      padding: '16px', ...style
    }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, disabled, color = '#6366F1', textColor = '#fff', style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#374151' : color,
      color: disabled ? '#6B7280' : textColor,
      border: 'none', borderRadius: 12, padding: '14px 20px',
      fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', fontFamily: 'inherit', transition: 'opacity 0.2s',
      opacity: disabled ? 0.6 : 1, ...style,
    }}>{children}</button>
  )
}

export function OptionGrid({ options, onSelect, correct = null, disabled = false, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10 }}>
      {options.map((opt, i) => {
        const isCorrect = correct !== null && opt === correct
        const bg = correct !== null ? (isCorrect ? '#16a34a' : '#1E2128') : '#1E2128'
        const border = correct !== null ? (isCorrect ? '#22c55e' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.08)'
        return (
          <button key={i} onClick={() => !disabled && onSelect(opt)} style={{
            background: bg, border: `2px solid ${border}`, borderRadius: 12,
            padding: '14px 8px', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>{opt}</button>
        )
      })}
    </div>
  )
}

export function FeedbackBanner({ message, isCorrect, extras }) {
  if (!message) return null
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12, marginTop: 16,
      background: isCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
      border: `1px solid ${isCorrect ? '#16a34a' : '#dc2626'}`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: isCorrect ? '#4ade80' : '#f87171' }}>{message}</div>
      {isCorrect && extras && <div style={{ fontSize: 14, color: '#EAB308', marginTop: 4 }}>{extras}</div>}
    </div>
  )
}

export function MissionCard({ chapter, title, description, onClick, accentColor }) {
  return (
    <div onClick={onClick} style={{
      background: '#1E2128', borderRadius: 16, border: `1px solid rgba(255,255,255,0.08)`,
      padding: '16px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = accentColor }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >
      <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{chapter}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{description}</div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ background: `${accentColor}22`, color: accentColor, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Mulai Misi ▶</span>
      </div>
    </div>
  )
}
