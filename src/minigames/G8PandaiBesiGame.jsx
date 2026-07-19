import React from 'react'

export default function G8PandaiBesiGame({ goBack }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A2647', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <div style={{ color: '#94A3B8', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>Segera Hadir!</div>
      <div style={{ color: '#64748B', fontSize: 13, textAlign: 'center' }}>Game ini sedang dalam pengembangan.</div>
      <button onClick={goBack} style={{ marginTop: 8, background: '#6366F1', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        ← Kembali
      </button>
    </div>
  )
}
