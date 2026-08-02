/**
 * BlpSidebar.jsx — Sidebar navigasi modul BLP Harian
 * Digunakan sebagai inline flex-child di dalam BlpLayout (bukan position:fixed).
 * Props: { user, navigate, currentScreen, onLogout }
 */
import { useState } from 'react'
import logo from '../../assets/logo.png'
import { UserAvatar } from '../shared'

const C = {
  bg:           '#071a10',
  primary:      '#10b981',
  border:       'rgba(16,185,129,0.18)',
  activeBg:     'rgba(16,185,129,0.15)',
  activeBorder: '#10b981',
  text:         '#d1fae5',
  mutedText:    '#6aaa82',
  subLabel:     '#065f46',
}

function NavItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => onClick(item.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5,
        borderRadius: 9, padding: '8px 12px', height: 42,
        borderLeft: isActive ? `3px solid ${C.activeBorder}` : '3px solid transparent',
        background: isActive ? C.activeBg : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: isActive ? C.primary : hovered ? C.text : C.mutedText,
        fontWeight: isActive ? 700 : 400,
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
    </button>
  )
}

function getSiswaNav(user) {
  const showHaid = user?.jenisKelamin !== 'L'
  return [
    { key: 'blp-home',          emoji: '🏠', label: 'Beranda' },
    { key: 'blp-isi-aktivitas', emoji: '✅', label: 'Isi Aktivitas' },
    { key: 'blp-riwayat',       emoji: '📋', label: 'Riwayat' },
    { key: 'blp-quran',         emoji: '📖', label: 'Al-Quran' },
    ...(showHaid ? [{ key: 'blp-haid', emoji: '🌸', label: 'Catatan Haid' }] : []),
  ]
}

const GURU_NAV = [
  { key: 'blp-guru-rekap',   emoji: '📊', label: 'Dashboard' },
  { key: 'blp-guru-periode', emoji: '📅', label: 'Periode BLP' },
]

export default function BlpSidebar({ user, navigate, currentScreen, onLogout }) {
  const isGuru = user?.role === 'guru'
  const navItems = isGuru ? GURU_NAV : getSiswaNav(user)
  const kelasList = Array.isArray(user?.kelas) ? user.kelas.join(', ') : (user?.kelas || '')

  return (
    <div style={{
      width: 220,
      height: '100%',
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 10px',
      flexShrink: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4, marginBottom: 20 }}>
        <img src={logo} alt="SMARTISA" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.primary, lineHeight: 1.2 }}>BLP Harian</div>
          <div style={{ fontSize: 9, color: C.subLabel, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>SMARTISA</div>
        </div>
      </div>

      {/* User info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 8px', marginBottom: 16,
        background: 'rgba(16,185,129,0.07)',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
      }}>
        <UserAvatar user={user} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || user?.username}
          </div>
          <div style={{ fontSize: 10, color: C.mutedText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {kelasList || (isGuru ? 'Guru BLP' : '')}
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ fontSize: 10, color: C.subLabel, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', paddingLeft: 8, marginBottom: 6 }}>
        Navigasi
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {navItems.map(item => (
          <NavItem
            key={item.key}
            item={item}
            isActive={currentScreen === item.key}
            onClick={navigate}
          />
        ))}
      </div>

      {/* Logout */}
      <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', border: 'none', cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5,
            borderRadius: 9, padding: '8px 12px', height: 42,
            background: 'transparent', color: '#EF4444',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 15 }}>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}
