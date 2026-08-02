/**
 * Eob5Sidebar.jsx — Navigasi sidebar modul GURU
 * Menampilkan semua 24 route eob5-* dalam 3 grup: Utama / Jabatan / Admin.
 * Props: { navigate, currentScreen, onClose? }
 * - navigate: fungsi navigasi dari App.jsx (guruNavigate)
 * - currentScreen: route key aktif untuk highlight
 * - onClose: dipanggil saat item diklik di mobile (untuk menutup drawer)
 */
import { useState } from 'react'
import logo from '../../assets/logo.png'
import { UserAvatar } from '../shared'

const C = {
  bg: '#1a1200',
  primary: '#f59e0b',
  dim: 'rgba(245,158,11,0.18)',
  dimHover: 'rgba(245,158,11,0.28)',
  border: 'rgba(245,158,11,0.22)',
  text: '#fef3c7',
  sub: '#92400e',
  activeBg: 'rgba(245,158,11,0.22)',
  activeBorder: '#f59e0b',
}

const MENU_GROUPS = [
  {
    label: 'Utama',
    items: [
      { key: 'eob5-dashboard',    emoji: '🏫', label: 'Dashboard' },
      { key: 'eob5-absensi',      emoji: '📋', label: 'Absensi' },
      { key: 'eob5-nilai',        emoji: '📊', label: 'Nilai' },
      { key: 'eob5-jurnal',       emoji: '📖', label: 'Jurnal Mengajar' },
      { key: 'eob5-jadwal',       emoji: '📅', label: 'Jadwal' },
      { key: 'eob5-prosem',       emoji: '📝', label: 'Prosem' },
      { key: 'eob5-materi',       emoji: '📚', label: 'Modul Ajar' },
      { key: 'eob5-soal-ai',      emoji: '🤖', label: 'Soal AI' },
      { key: 'eob5-rekap',        emoji: '📈', label: 'Rekap' },
      { key: 'eob5-inbox',        emoji: '💬', label: 'Pesan Siswa' },
    ],
  },
  {
    label: 'Jabatan',
    items: [
      { key: 'eob5-kepsek',       emoji: '📊', label: 'Kinerja Guru' },
      { key: 'eob5-kesiswaan',    emoji: '🏫', label: 'Kesiswaan' },
      { key: 'eob5-walikelas',    emoji: '👨‍👩‍👧', label: 'Wali Kelas' },
      { key: 'eob5-kurikulum',    emoji: '📐', label: 'Supervisi Kurikulum' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { key: 'eob5-siswa',            emoji: '👥', label: 'Manajemen Siswa' },
      { key: 'eob5-poin',             emoji: '📌', label: 'Poin Siswa' },
      { key: 'eob5-akun-siswa',       emoji: '🔑', label: 'Akun Siswa' },
      { key: 'eob5-direktori-guru',   emoji: '👨‍🏫', label: 'Direktori Guru' },
      { key: 'eob5-direktori-siswa',  emoji: '📚', label: 'Direktori Siswa' },
      { key: 'eob5-kalender',         emoji: '🗓️', label: 'Kalender' },
      { key: 'eob5-info-pekanan',     emoji: '📊', label: 'Info Pekan' },
      { key: 'eob5-administrasi',     emoji: '🗂️', label: 'Administrasi' },
      { key: 'eob5-feedback',         emoji: '📥', label: 'Feedback' },
      { key: 'eob5-pengaturan',       emoji: '⚙️', label: 'Pengaturan' },
    ],
  },
]

function NavItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit', fontSize: 12.5,
        borderRadius: 8, padding: '7px 10px',
        borderLeft: isActive ? `3px solid ${C.activeBorder}` : '3px solid transparent',
        background: isActive ? C.activeBg : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: isActive ? C.primary : hovered ? C.text : '#d6b47a',
        fontWeight: isActive ? 700 : 400,
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
    </button>
  )
}

export default function Eob5Sidebar({ navigate, currentScreen, onClose, user, onLogout }) {
  const handleNav = (key) => {
    navigate(key)
    onClose?.()
  }

  const kelasList = Array.isArray(user?.kelas) ? user.kelas.join(', ') : (user?.kelas || 'Guru')

  return (
    <div style={{
      width: 210,
      height: '100%',
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo/brand */}
      <div style={{ padding: '16px 14px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <img src={logo} alt="SMARTISA" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, lineHeight: 1.2 }}>GURU</div>
            <div style={{ fontSize: 9, color: C.sub, letterSpacing: 1, textTransform: 'uppercase' }}>SMARTISA</div>
          </div>
        </div>

        {/* User info card */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            background: 'rgba(245,158,11,0.07)',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
          }}>
            <UserAvatar user={user} size={30} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || user.username}
              </div>
              <div style={{ fontSize: 10, color: '#d6b47a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {kelasList}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav section label */}
      <div style={{ fontSize: 9, fontWeight: 800, color: C.sub, letterSpacing: 2, textTransform: 'uppercase', padding: '0 18px 6px' }}>
        Navigasi
      </div>

      {/* Menu groups */}
      <div style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {MENU_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 14 }}>
            {/* Group header */}
            <div style={{
              fontSize: 9, fontWeight: 800, color: C.sub,
              letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '2px 10px 6px',
            }}>
              {group.label}
            </div>
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map(item => (
                <NavItem
                  key={item.key}
                  item={item}
                  isActive={currentScreen === item.key}
                  onClick={() => handleNav(item.key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      {onLogout && (
        <div style={{ padding: '10px 8px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit', fontSize: 12.5,
              borderRadius: 8, padding: '7px 10px',
              background: 'transparent', color: '#EF4444',
              borderLeft: '3px solid transparent',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 14 }}>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  )
}
