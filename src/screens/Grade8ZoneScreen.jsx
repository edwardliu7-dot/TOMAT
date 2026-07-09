import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'

export default function Grade8ZoneScreen({ navigate, goBack }) {
  const accent = '#FDBA74'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚔️ Zona Pejuang Abad Pertengahan" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ marginTop: 16, background: 'rgba(253,186,116,0.08)', border: '1px solid rgba(253,186,116,0.2)', borderRadius: 20, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏗️</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Kelas 8 — Sedang Dibangun</div>
          <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 16 }}>
            Zona Pejuang sedang dalam pembangunan.<br />
            Materi berikutnya akan mencakup:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {[
              { emoji: '🗿', title: 'Pola Bilangan', desc: 'Aritmetika, geometri, dan barisan bilangan' },
              { emoji: '⚙️', title: 'Fungsi & Pemetaan', desc: 'Nilai fungsi f(x) linear & kuadrat' },
              { emoji: '📐', title: 'Gradien & Garis Lurus', desc: 'Kemiringan dan persamaan garis' },
              { emoji: '⚔️', title: 'Sistem Persamaan Linear', desc: 'Dua variabel dan metode eliminasi' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: 24 }}>{m.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>🔒 {m.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: accent }}>
            ✨ Selesaikan semua misi Kelas 7 terlebih dahulu untuk membuka zona ini!
          </div>
        </div>
      </div>
    </div>
  )
}
