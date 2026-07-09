import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'

export default function Grade9ZoneScreen({ navigate, goBack }) {
  const accent = '#34D399'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Zona Penjelajah Luar Angkasa" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ marginTop: 16, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🌌</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Kelas 9 — Sedang Dibangun</div>
          <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, marginBottom: 16 }}>
            Zona Antariksa sedang dalam pembangunan.<br />
            Materi berikutnya akan mencakup:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            {[
              { emoji: '📦', title: 'Aljabar & Faktorisasi', desc: 'Sederhanakan dan faktorkan ekspresi aljabar' },
              { emoji: '🌀', title: 'Akar & Bilangan Irasional', desc: 'Sederhanakan akar dan bilangan irasional' },
              { emoji: '📐', title: 'Kesebangunan & Kekongruenan', desc: 'Proporsi dan transformasi bangun datar' },
              { emoji: '🛡️', title: 'Lingkaran', desc: 'Luas, keliling, busur, dan juring lingkaran' },
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
            🚀 Selesaikan semua misi Kelas 7 & 8 terlebih dahulu untuk membuka zona ini!
          </div>
        </div>
      </div>
    </div>
  )
}
