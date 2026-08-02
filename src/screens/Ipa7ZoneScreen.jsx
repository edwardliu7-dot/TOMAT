import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { GAMES_CATALOG } from '../gamesCatalog'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const ACCENT = '#22c55e'

const BABS = [
  { id: 'I',   color: '#22c55e', label: 'BAB I: Besaran dan Pengukuran',  keys: ['ipa7b1t1','ipa7b1t2','ipa7b1t3'] },
  { id: 'II',  color: '#4ade80', label: 'BAB II: Zat dan Perubahannya',   keys: ['ipa7b2t1','ipa7b2t2','ipa7b2t3','ipa7b2t4'] },
  { id: 'III', color: '#f97316', label: 'BAB III: Suhu, Pemuaian, dan Kalor', keys: ['ipa7b3t1','ipa7b3t2','ipa7b3t3'] },
  { id: 'IV',  color: '#facc15', label: 'BAB IV: Gaya dan Gerak',         keys: ['ipa7b4t1','ipa7b4t2','ipa7b4t3','ipa7b4t4','ipa7b4t5'] },
]

const CATALOG_MAP = Object.fromEntries(GAMES_CATALOG.map(g => [g.key, g]))
const TOTAL = BABS.reduce((s, b) => s + b.keys.length, 0)

function GameCard({ gameKey, babColor, onClick, desktop }) {
  const g = CATALOG_MAP[gameKey] || {}
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1E2128',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: desktop ? '16px' : '14px',
        cursor: 'pointer',
        display: 'flex', gap: 12, alignItems: 'center',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = babColor; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: desktop ? 30 : 26, flexShrink: 0, lineHeight: 1 }}>{g.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{g.name}</div>
        <div style={{ fontSize: 11, color: babColor, fontWeight: 600 }}>TP {g.tp}</div>
      </div>
      <div style={{ flexShrink: 0, color: babColor, fontSize: 16 }}>▶</div>
    </div>
  )
}

export default function Ipa7ZoneScreen({ navigate, goBack }) {
  const isDesktop = useIsDesktop()
  const [selectedBab, setSelectedBab] = useState(null)
  const visibleBabs = selectedBab ? BABS.filter(b => b.id === selectedBab) : BABS

  if (!isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #052e16 0%, #0d1f1a 100%)' }}>
        <PlayerHeader />
        <TopBar title="🌿 IPA Kelas 7 — Lab Sains" onBack={goBack} accentColor={ACCENT} />
        <div style={{ padding: '0 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 7 · {TOTAL} GAME IPA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Jelajahi dunia IPA lewat minigame seru!</div>
          {BABS.map(bab => (
            <div key={bab.id}>
              <div style={{ marginTop: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 2 }}>{bab.label}</div>
                <div style={{ height: 2, background: `linear-gradient(90deg, ${bab.color}, transparent)`, borderRadius: 2, marginTop: 6 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bab.keys.map(k => (
                  <GameCard key={k} gameKey={k} babColor={bab.color} onClick={() => navigate(k)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #052e16 0%, #0d1f1a 100%)' }}>
      <TopBar title="🌿 IPA Kelas 7 — Lab Sains" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 7 · {TOTAL} GAME IPA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Jelajahi dunia IPA lewat minigame seru!</div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setSelectedBab(null)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                background: selectedBab === null ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${selectedBab === null ? ACCENT : 'transparent'}`,
                color: selectedBab === null ? '#fff' : '#94A3B8',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>Semua Bab</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{TOTAL} game</div>
            </button>
            {BABS.map(bab => {
              const isActive = selectedBab === bab.id
              return (
                <button
                  key={bab.id}
                  onClick={() => setSelectedBab(bab.id)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    background: isActive ? `${bab.color}18` : 'rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${isActive ? bab.color : 'transparent'}`,
                    color: isActive ? '#fff' : '#94A3B8',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{bab.label}</div>
                  <div style={{ fontSize: 11, color: bab.color, marginTop: 3 }}>{bab.keys.length} game</div>
                </button>
              )
            })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {visibleBabs.map(bab => (
              <div key={bab.id} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: bab.color, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{bab.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bab.keys.map(k => (
                    <GameCard key={k} gameKey={k} babColor={bab.color} onClick={() => navigate(k)} desktop />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
