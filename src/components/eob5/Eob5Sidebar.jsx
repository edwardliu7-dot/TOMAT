/**
 * Eob5Sidebar.jsx — Navigasi sidebar modul GURU
 * Menampilkan route eob5-* dalam 3 grup: Utama / Jabatan / Admin.
 * Item di grup Jabatan dan Admin disaring berdasarkan jabatan pengguna.
 *
 * Props: { navigate, currentScreen, onClose?, user, onLogout }
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

// Roles yang diizinkan per item.
// Jika `roles` tidak ada → semua guru dapat melihat.
// Jika `roles` ada → hanya guru dengan salah satu jabatan tersebut.
const MENU_GROUPS = [
  {
    label: 'Utama',
    items: [
      { key: 'eob5-dashboard',    label: 'Dashboard' },
      { key: 'eob5-absensi',      label: 'Absensi' },
      { key: 'eob5-nilai',        label: 'Nilai' },
      { key: 'eob5-jurnal',       label: 'Jurnal Mengajar' },
      { key: 'eob5-jadwal',       label: 'Jadwal' },
      { key: 'eob5-prosem',       label: 'Prosem' },
      { key: 'eob5-materi',       label: 'Modul Ajar' },
      { key: 'eob5-soal-ai',      label: 'Soal AI' },
      { key: 'eob5-rekap',        label: 'Rekap' },
      { key: 'eob5-inbox',        label: 'Pesan Siswa' },
    ],
  },
  {
    label: 'Jabatan',
    items: [
      { key: 'eob5-kepsek',    label: 'Kinerja Guru',         roles: ['kepala_sekolah', 'wakasek', 'admin'] },
      { key: 'eob5-kesiswaan', label: 'Kesiswaan',            roles: ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'] },
      { key: 'eob5-walikelas', label: 'Wali Kelas',           roles: ['wali_kelas', 'kepala_sekolah', 'wakasek', 'admin'] },
      { key: 'eob5-kurikulum', label: 'Supervisi Kurikulum',  roles: ['kepala_sekolah', 'wakasek', 'admin'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { key: 'eob5-siswa',           label: 'Manajemen Siswa',  roles: ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'] },
      { key: 'eob5-poin',            label: 'Poin Siswa',       roles: ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'] },
      { key: 'eob5-akun-siswa',      label: 'Akun Siswa',       roles: ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'] },
      { key: 'eob5-direktori-guru',  label: 'Direktori Guru',   roles: ['kepala_sekolah', 'wakasek', 'admin'] },
      { key: 'eob5-direktori-siswa', label: 'Direktori Siswa',  roles: ['kepala_sekolah', 'wakasek', 'wali_kelas', 'admin'] },
      { key: 'eob5-kalender',        label: 'Kalender' },
      { key: 'eob5-info-pekanan',    label: 'Info Pekan' },
      { key: 'eob5-administrasi',    label: 'Administrasi',     roles: ['kepala_sekolah', 'admin'] },
      { key: 'eob5-feedback',        label: 'Feedback' },
      { key: 'eob5-pengaturan',      label: 'Pengaturan' },
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
  const userJabatan = Array.isArray(user?.jabatan) ? user.jabatan : []

  // Filter item berdasarkan jabatan: item tanpa roles → semua bisa akses
  function filterItems(items) {
    return items.filter(item =>
      !item.roles || item.roles.some(r => userJabatan.includes(r))
    )
  }

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
        {MENU_GROUPS.map((group) => {
          const visibleItems = filterItems(group.items)
          if (visibleItems.length === 0) return null
          return (
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
                {visibleItems.map(item => (
                  <NavItem
                    key={item.key}
                    item={item}
                    isActive={currentScreen === item.key}
                    onClick={() => handleNav(item.key)}
                  />
                ))}
              </div>
            </div>
          )
        })}
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
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  )
}
