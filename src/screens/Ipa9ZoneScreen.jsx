import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const ACCENT = '#a855f7'

const BABS = [
  {
    id: 'I',
    color: '#a855f7',
    label: 'BAB I: Sistem Koordinasi & Homeostasis',
    missions: [
      {
        key: 'ipa9koordinasi',
        emoji: '🧠',
        title: 'Homeostasis Balancer',
        desc: 'Kendalikan sistem saraf, hormon, dan homeostasis tubuh manusia sebagai pusat kontrol otak.',
      },
    ],
  },
  {
    id: 'II',
    color: '#f43f5e',
    label: 'BAB II: Zat Adiktif & Psikotropika',
    missions: [
      {
        key: 'ipa9adiktif',
        emoji: '🛡️',
        title: 'Body Defender: Say No to Drugs',
        desc: 'Klasifikasi zat adiktif, pelajari dampaknya pada organ tubuh, dan latih cara penolakan yang tepat.',
      },
    ],
  },
  {
    id: 'III',
    color: '#10b981',
    label: 'BAB III: Sistem Reproduksi',
    missions: [
      {
        key: 'ipa9reproduksi',
        emoji: '🌱',
        title: 'Life Cycle & Propagation Match',
        desc: 'Cocokkan organ reproduksi manusia, cara berkembang biak tumbuhan, dan jenis reproduksi hewan.',
      },
    ],
  },
]

function GameCard({ mission, babColor, onClick, desktop }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1E2128',
        borderRadius: 14,
        border: `1px solid rgba(255,255,255,0.08)`,
        padding: desktop ? '16px' : '14px',
        cursor: 'pointer',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = babColor; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: desktop ? 32 : 28, flexShrink: 0, lineHeight: 1 }}>{mission.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{mission.title}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{mission.desc}</div>
      </div>
      <div style={{ flexShrink: 0, color: babColor, fontSize: 16, paddingTop: 4 }}>▶</div>
    </div>
  )
}

export default function Ipa9ZoneScreen({ navigate, goBack }) {
  const isDesktop = useIsDesktop()
  const [selectedBab, setSelectedBab] = useState(null)
  const visibleBabs = selectedBab ? BABS.filter(b => b.id === selectedBab) : BABS

  if (!isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #150d25 100%)' }}>
        <PlayerHeader />
        <TopBar title="🧠 IPA Kelas 9 — Lab Sains Lanjut" onBack={goBack} accentColor={ACCENT} />
        <div style={{ padding: '0 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 9 · 3 GAME IPA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Pelajari sistem regulasi dan reproduksi makhluk hidup!</div>
          {BABS.map(bab => (
            <div key={bab.id}>
              <div style={{ marginTop: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 2 }}>{bab.label}</div>
                <div style={{ height: 2, background: `linear-gradient(90deg, ${bab.color}, transparent)`, borderRadius: 2, marginTop: 6 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bab.missions.map(m => (
                  <GameCard key={m.key} mission={m} babColor={bab.color} onClick={() => navigate(m.key)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a2e 0%, #150d25 100%)' }}>
      <TopBar title="🧠 IPA Kelas 9 — Lab Sains Lanjut" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 9 · 3 GAME IPA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Pelajari sistem regulasi dan reproduksi makhluk hidup!</div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setSelectedBab(null)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                background: selectedBab === null ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${selectedBab === null ? ACCENT : 'transparent'}`,
                color: selectedBab === null ? '#fff' : '#94A3B8',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>Semua Bab</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>3 game</div>
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
                  <div style={{ fontSize: 11, color: bab.color, marginTop: 3 }}>{bab.missions.length} game</div>
                </button>
              )
            })}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {visibleBabs.map(bab => (
              <div key={bab.id} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: bab.color, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{bab.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {bab.missions.map(m => (
                    <GameCard key={m.key} mission={m} babColor={bab.color} onClick={() => navigate(m.key)} desktop />
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
