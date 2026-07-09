import React from 'react'

// Shared numeric keypad used by numeric-entry minigames.
export default function NumpadAnswer({ digits, setDigits, negative, setNegative, allowNegative = false, maxLen = 6, disabled = false }) {
  const pressKey = (k) => {
    if (disabled) return
    if (k === '⌫') { setDigits(p => p.slice(0, -1)); return }
    if (k === '+/−') { setNegative(p => !p); return }
    if (digits.length >= maxLen) return
    setDigits(p => p + k)
  }

  const keys = allowNegative
    ? ['7', '8', '9', '4', '5', '6', '1', '2', '3', '+/−', '0', '⌫']
    : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {keys.map((k, i) => k === '' ? <div key={i} /> : (
        <button key={i} onClick={() => pressKey(k)} disabled={disabled} style={{
          background: k === '+/−' && negative ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '14px 0', color: '#fff', fontSize: 18, fontWeight: 700,
          cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
        }}>{k}</button>
      ))}
    </div>
  )
}
