import React from 'react'
import { PlayerHeader } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { useTask } from '../TaskContext'

const zones = [
  {
    id: 'grade7', label: 'Kelas 7', title: 'Zona Penjelajah Pemula', subtitle: 'Lautan Dalam',
    emoji: '🌊', missions: 20,
    bg: 'linear-gradient(135deg, #0A2647, #144272)',
    accent: '#67E8F9', stats: '20 Misi · Bilangan Bulat, Rasional & Rasio',
    babs: ['BAB I: Bilangan Bulat', 'BAB II: Bilangan Rasional', 'BAB III: Rasio'],
  },
  {
    id: 'grade8', label: 'Kelas 8', title: 'Zona Pejuang Abad Pertengahan', subtitle: 'Kerajaan Api',
    emoji: '⚔️', missions: 0,
    bg: 'linear-gradient(135deg, #2d1400, #4a1f00)',
    accent: '#FDBA74', stats: 'Segera Hadir · Fungsi & Aljabar',
    locked: true,
  },
  {
    id: 'grade9', label: 'Kelas 9', title: 'Zona Penjelajah Luar Angkasa', subtitle: 'Antariksa',
    emoji: '🚀', missions: 0,
    bg: 'linear-gradient(135deg, #0F172A, #1E293B)',
    accent: '#34D399', stats: 'Segera Hadir · Geometri & Akar',
    locked: true,
  },
]

export default function HomeScreen({ navigate }) {
  const { player } = usePlayer()
  const { tasks, grades } = useTask()
  const pendingTaskCount = tasks.filter(t => t.status === 'active').length

  return (
    <div style={{ minHeight: '100vh', background: '#0F1115' }}>
      <PlayerHeader />

      {/* Hero Banner */}
      <div style={{
        margin: '20px 16px 0', borderRadius: 20,
        background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
        border: '1px solid rgba(99,102,241,0.3)', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 100, opacity: 0.08 }}>🧠</div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          TANTANGAN OTAK MATEMATIKA
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: -1 }}>TOMAT</div>
        <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 6, lineHeight: 1.5 }}>
          Selesaikan 20 misi matematika Kelas 7, kumpulkan koin &amp; EXP untuk naik level!
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <div style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#EAB308' }}>🪙 {player.coins}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Koin</div>
          </div>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#818CF8' }}>⭐ Lv {player.level}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Level</div>
          </div>
          <div style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#34D399' }}>📚 {player.exp}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>EXP</div>
          </div>
        </div>
      </div>

      {/* Nilai Saya shortcut */}
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 10 }}>
        <button
          onClick={() => navigate('grades')}
          style={{
            flex: 1, background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            border: '1px solid rgba(167,139,250,0.3)', borderRadius: 16,
            padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 12, position: 'relative',
          }}
        >
          <div style={{ fontSize: 24 }}>📊</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Nilai Akademik Saya</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
              {grades.length > 0 ? `${grades.length} nilai tersimpan` : 'Belum ada nilai'}
            </div>
          </div>
          {pendingTaskCount > 0 && (
            <div style={{
              position: 'absolute', top: 10, right: 12,
              background: '#EF4444', color: '#fff', borderRadius: 20,
              fontSize: 11, fontWeight: 800, padding: '2px 8px',
              minWidth: 20, textAlign: 'center',
            }}>
              {pendingTaskCount} tugas
            </div>
          )}
        </button>
      </div>

      {/* Zone Cards */}
      <div style={{ padding: '16px 16px' }}>
        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Pilih Zona Petualangan
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {zones.map(z => (
            <div key={z.id} onClick={() => !z.locked && navigate(z.id)} style={{
              background: z.bg, borderRadius: 20, padding: '20px',
              border: `1px solid ${z.accent}33`, cursor: z.locked ? 'default' : 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              position: 'relative', overflow: 'hidden',
              opacity: z.locked ? 0.65 : 1,
            }}
              onMouseEnter={e => { if (!z.locked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${z.accent}22` } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ position: 'absolute', right: -10, top: -10, fontSize: 80, opacity: 0.15 }}>{z.emoji}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                {z.locked && <span style={{ background: `${z.accent}22`, color: z.accent, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: 1 }}>🔒 SEGERA HADIR</span>}
                <div style={{ fontSize: 11, color: z.accent, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{z.label} · {z.subtitle}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontStyle: 'italic', marginTop: 4 }}>{z.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{z.stats}</div>
              {z.babs && (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {z.babs.map((b, i) => (
                    <span key={i} style={{ background: `${z.accent}18`, color: z.accent, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 }}>{b}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ height: 4, width: i === 0 ? 32 : 8, background: i === 0 ? z.accent : `${z.accent}44`, borderRadius: 2 }} />
                  ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 16px' }}>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{z.locked ? 'Terkunci 🔒' : 'Masuki Zona ▶'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#374151' }}>TOMAT · Tantangan Otak MATematika · Game RPG Edukasi Kelas 7</div>
      </div>
    </div>
  )
}
