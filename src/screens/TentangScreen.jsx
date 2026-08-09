import React from 'react'
import { TopBar } from '../components/shared'
import { APP_VERSION } from '../version'

const ACCENT = '#F59E0B'
const BG = 'linear-gradient(180deg, #071321 0%, #0d1f3c 100%)'

const MODULES = [
  {
    emoji: '🍅',
    name: 'TOMAT',
    sub: 'Tools of Mathematics',
    desc: 'Aplikasi belajar utama siswa — game edukasi Matematika & IPA, pet, toko, duel, dan turnamen.',
    color: '#6366f1',
  },
  {
    emoji: '📋',
    name: 'BLP Harian',
    sub: 'Buku Laporan Pembelajaran',
    desc: 'Rekap aktivitas belajar harian siswa yang diisi dan dipantau oleh guru.',
    color: '#10b981',
  },
  {
    emoji: '🏫',
    name: 'GURU (EOB5)',
    sub: 'Education & Online Board',
    desc: 'Dashboard guru untuk absensi, nilai, jadwal, jurnal mengajar, dan soal berbantuan AI.',
    color: '#f59e0b',
  },
]

const FITUR = [
  { emoji: '🎮', label: '170+ Minigame', desc: 'Matematika & IPA Kelas 7–9 berbasis kurikulum nasional' },
  { emoji: '🐾', label: 'Sistem Pet', desc: 'Pelihara Tomi, Kelinsay, Monyong, atau Nananaga dengan bonus unik' },
  { emoji: '⚔️', label: 'Duel & Turnamen', desc: 'Kompetisi real-time 1v1 dan bracket antar siswa sekelas' },
  { emoji: '👾', label: 'Boss Raid', desc: 'Serang boss bersama seluruh kelas secara kooperatif' },
  { emoji: '💬', label: 'Komunikasi', desc: 'Chat privat dan forum kelas antara siswa dan guru' },
  { emoji: '🏆', label: 'Papan Peringkat', desc: 'Ranking koin dan XP antar kelas' },
  { emoji: '📖', label: 'Hafalan Interaktif', desc: 'Flash card dan kuis mandiri perkalian & pembagian' },
  { emoji: '🎓', label: 'Latihan Ujian', desc: 'Bank soal untuk persiapan ujian nasional dan TKA' },
]

const CREDITS = [
  { label: 'Dikembangkan oleh', value: 'AI Studio' },
  { label: 'Platform', value: 'SMARTISA' },
  { label: 'Versi Aplikasi', value: `v${APP_VERSION}` },
  { label: 'Database', value: 'PostgreSQL / Neon' },
  { label: 'Mobile', value: 'Capacitor Android' },
]

export default function TentangScreen({ goBack }) {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Tentang Aplikasi ✨" onBack={goBack} accent={ACCENT} />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 60px' }}>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          padding: '36px 24px 28px',
          background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 12, lineHeight: 1 }}>⭐</div>
          <div style={{
            fontSize: 26, fontWeight: 900, letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>
            SMARTISA
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 16 }}>
            Smart Integrated System for Academic Achievement
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 99, padding: '5px 14px',
            fontSize: 12, color: '#fcd34d', fontWeight: 700,
          }}>
            🍅 TOMAT v{APP_VERSION}
          </div>
        </div>

        {/* Deskripsi */}
        <div style={{ padding: '24px 20px 0' }}>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 24px', textAlign: 'center' }}>
            Platform pembelajaran gamifikasi untuk siswa dan guru SMP —
            belajar lebih seru dengan game, pet, kompetisi, dan reward nyata.
          </p>

          {/* Modul-modul */}
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            Modul Aplikasi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {MODULES.map(m => (
              <div key={m.name} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                background: `${m.color}0d`,
                border: `1px solid ${m.color}30`,
                borderRadius: 16, padding: '14px 16px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${m.color}20`,
                  border: `1px solid ${m.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {m.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.sub}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginTop: 3 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fitur unggulan */}
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            Fitur Unggulan
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {FITUR.map(f => (
              <div key={f.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 12px',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{f.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Kredit */}
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 800, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            Info Teknis
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, overflow: 'hidden', marginBottom: 28,
          }}>
            {CREDITS.map((c, i) => (
              <div key={c.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < CREDITS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{c.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{c.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌟</div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              Dibuat dengan ❤️ untuk pendidikan Indonesia<br />
              <span style={{ color: '#475569', fontSize: 12 }}>© 2024–2026 AI Studio · SMARTISA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
