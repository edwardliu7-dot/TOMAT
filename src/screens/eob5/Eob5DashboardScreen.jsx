import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const COLOR = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  primaryDim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  textSub: '#92400e',
  card: 'rgba(255,255,255,0.04)',
}

const MENU = [
  { key: 'eob5-absensi',   label: 'Absensi',    emoji: '📋', desc: 'Input & rekap kehadiran' },
  { key: 'eob5-nilai',     label: 'Nilai',       emoji: '📊', desc: 'Nilai akademik siswa' },
  { key: 'eob5-jadwal',    label: 'Jadwal',      emoji: '📅', desc: 'Jadwal pelajaran' },
  { key: 'eob5-prosem',    label: 'Prosem',      emoji: '📝', desc: 'Program semester' },
  { key: 'eob5-materi',    label: 'Materi',      emoji: '📚', desc: 'Modul & bahan ajar' },
  { key: 'eob5-soal-ai',   label: 'Soal AI',     emoji: '🤖', desc: 'Generate soal otomatis' },
  { key: 'eob5-siswa',     label: 'Siswa',       emoji: '👥', desc: 'Manajemen data siswa' },
  { key: 'eob5-rekap',     label: 'Rekap',       emoji: '📈', desc: 'Rekap kelas & periode' },
  { key: 'eob5-inbox',     label: 'Inbox',       emoji: '📬', desc: 'Pengumuman resmi' },
]

export default function Eob5DashboardScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({ siswa: 0, absensiHariIni: 0, materi: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (user?.role !== 'guru') return
    Promise.all([
      fetch('/api/eob5/kelas/list', { credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch('/api/eob5/absensi/hari-ini', { credentials: 'include' }).then(r => r.json()).catch(() => ({ absensi: [] })),
      fetch('/api/eob5/materi', { credentials: 'include' }).then(r => r.json()).catch(() => []),
    ]).then(([kelas, hariIni, materi]) => {
      const totalSiswa = Array.isArray(kelas) ? kelas.reduce((s, k) => s + (k.jumlahSiswa || 0), 0) : 0
      setStats({
        siswa: totalSiswa,
        absensiHariIni: Array.isArray(hariIni?.absensi) ? hariIni.absensi.length : 0,
        materi: Array.isArray(materi) ? materi.length : 0,
      })
      setLoadingStats(false)
    })
  }, [])

  const STATS = [
    { label: 'Total Siswa',       value: loadingStats ? '…' : stats.siswa,          emoji: '👥' },
    { label: 'Absensi Hari Ini',  value: loadingStats ? '…' : stats.absensiHariIni, emoji: '📋' },
    { label: 'Materi Tersimpan',  value: loadingStats ? '…' : stats.materi,         emoji: '📚' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: COLOR.bg,
      fontFamily: 'system-ui, sans-serif', color: COLOR.text,
      padding: '0 0 40px',
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${COLOR.border}`,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {goBack && (
          <button onClick={goBack} style={{
            background: 'none', border: 'none', color: COLOR.primary,
            fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
          }}>←</button>
        )}
        <div>
          <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Dashboard</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: COLOR.textSub }}>Selamat datang,</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.primary }}>{user?.name}</div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: COLOR.primaryDim, border: `1px solid ${COLOR.border}`,
              borderRadius: 14, padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: COLOR.primary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: COLOR.textSub, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>
          MENU UTAMA
        </div>

        {/* Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {MENU.map(m => (
            <button key={m.key} onClick={() => navigate(m.key)} style={{
              background: COLOR.card, border: `1px solid ${COLOR.border}`,
              borderRadius: 16, padding: '16px 14px',
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLOR.primaryDim; e.currentTarget.style.borderColor = COLOR.primary }}
            onMouseLeave={e => { e.currentTarget.style.background = COLOR.card; e.currentTarget.style.borderColor = COLOR.border }}
            onTouchStart={e => { e.currentTarget.style.background = COLOR.primaryDim }}
            onTouchEnd={e => { e.currentTarget.style.background = COLOR.card }}
            >
              <div style={{ fontSize: 28 }}>{m.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: COLOR.textSub, lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
