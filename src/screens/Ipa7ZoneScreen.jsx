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

const ACCENT = '#22c55e'

const BABS = [
  {
    id: 'I',
    color: '#22c55e',
    label: 'BAB I: Besaran dan Pengukuran',
    missions: [
      {
        key: 'ipa7pengukuran',
        emoji: '📏',
        title: 'Precision Measurement Lab',
        desc: 'Ukur objek fisik dan biologis dengan alat ukur yang tepat, lalu konversi satuan dengan cepat.',
      },
    ],
  },
  {
    id: 'II',
    color: '#4ade80',
    label: 'BAB II: Zat dan Perubahannya',
    missions: [
      {
        key: 'ipa7zat',
        emoji: '💧',
        title: 'Fluid & Molecular Quest',
        desc: 'Identifikasi wujud zat, perubahan wujud, kohesi, adhesi, dan kapilaritas melalui fenomena nyata.',
      },
    ],
  },
  {
    id: 'III',
    color: '#f97316',
    label: 'BAB III: Suhu, Pemuaian, dan Kalor',
    missions: [
      {
        key: 'ipa7suhu',
        emoji: '🌡️',
        title: 'Thermal Control Center',
        desc: 'Konversi suhu antar skala (Celsius, Fahrenheit, Kelvin, Reamur) dan pelajari pemuaian zat.',
      },
    ],
  },
  {
    id: 'IV',
    color: '#facc15',
    label: 'BAB IV: Gaya dan Gerak',
    missions: [
      {
        key: 'ipa7gaya',
        emoji: '⚡',
        title: 'Physics Arena: Motion & Force',
        desc: 'Hitung resultan gaya, pahami Hukum Newton, dan bedakan GLB dari GLBB.',
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
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 7 · 4 GAME IPA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Jelajahi dunia IPA lewat minigame seru!</div>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #052e16 0%, #0d1f1a 100%)' }}>
      <TopBar title="🌿 IPA Kelas 7 — Lab Sains" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 7 · 4 GAME IPA</div>
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
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>4 game</div>
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
