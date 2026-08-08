import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { getGradeNumber } from '../kelasUtils'
import { UserAvatar } from './shared'
import AudioPanel from './AudioPanel'

// Screens where sidebar is shown
const SAFE_SCREENS = new Set([
  'home', 'grade7', 'grade8', 'grade9',
  'grades', 'papanperingkat', 'toko', 'lencana',
  'komunikasi', 'profile',
  'guruDashboard', 'guruHafalan',
])

function getZoneKey(user) {
  const grade = getGradeNumber(user?.kelas)
  if (grade === 9) return 'grade9'
  if (grade === 8) return 'grade8'
  return 'grade7'
}

const SISWA_NAV = (zoneKey) => [
  { key: 'home',          emoji: '🏠', label: 'Beranda' },
  { key: zoneKey,         emoji: '🎮', label: 'Zona Belajar' },
  { key: 'grades',        emoji: '📊', label: 'Nilai & Tugas' },
  { key: 'papanperingkat',emoji: '🏆', label: 'Papan Peringkat' },
  { key: 'toko',          emoji: '🛒', label: 'Toko' },
  { key: 'lencana',       emoji: '🏅', label: 'Lencana' },
  { key: 'komunikasi',    emoji: '💬', label: 'Chat' },
]

// Full nav for guru mapel terdaftar (jabatan=guru_mapel + has subjects entry)
const GURU_NAV_FULL = [
  { key: 'guruDashboard',  emoji: '🏠', label: 'Dashboard' },
  { key: 'guruTugas',      emoji: '📋', label: 'Tugas' },
  { key: 'guruVideo',      emoji: '🎬', label: 'Video Materi' },
  { key: 'guruPantau',     emoji: '👥', label: 'Pantau Kelas' },
  { key: 'guruNilai',      emoji: '📊', label: 'Nilai Siswa' },
  { key: 'guruHafalan',    emoji: '🎯', label: 'Hafalan' },
  { key: 'guruInsight',    emoji: '🎮', label: 'Insight Siswa' },
  { key: 'guruRaid',       emoji: '⚔️', label: 'Boss Raid' },
  { key: 'guruTurnamen',   emoji: '🏆', label: 'Turnamen' },
  { key: 'guruKunci',      emoji: '🔒', label: 'Kunci Bab' },
  { key: 'guruMengajar',   emoji: '🖥️', label: 'Mode Mengajar' },
]

// Read-only nav for guru without a registered Matematika subject
const GURU_NAV_READONLY = [
  { key: 'guruDashboard',  emoji: '🏠', label: 'Dashboard' },
  { key: 'guruPantau',     emoji: '👥', label: 'Pantau Kelas' },
  { key: 'guruNilai',      emoji: '📊', label: 'Nilai Siswa' },
  { key: 'guruInsight',    emoji: '🎮', label: 'Insight Siswa' },
  { key: 'guruMengajar',   emoji: '🖥️', label: 'Mode Mengajar' },
]

function NavItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => onClick(item.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 44, padding: '0 16px', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', fontSize: 14,
        borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
        background: isActive
          ? 'rgba(99,102,241,0.12)'
          : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: isActive ? '#fff' : '#94A3B8',
        fontWeight: isActive ? 600 : 400,
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</span>
      <span>{item.label}</span>
    </button>
  )
}

export default function Sidebar({ user, navigate, currentScreen, onLogout }) {
  const [visible, setVisible] = useState(window.innerWidth >= 1024)
  const [activeGuruKey, setActiveGuruKey] = useState('guruDashboard')

  useEffect(() => {
    const onResize = () => setVisible(window.innerWidth >= 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (user?.role !== 'guru') return undefined
    const tabToKey = {
      tugas: 'guruTugas',
      video: 'guruVideo',
      hafalan: 'guruHafalan',
      nilai: 'guruNilai',
      siswa: 'guruPantau',
      kunci: 'guruKunci',
      raid: 'guruRaid',
      turnamen: 'guruTurnamen',
      insight: 'guruInsight',
    }
    const onTabActive = event => {
      const key = tabToKey[event.detail]
      if (key) setActiveGuruKey(key)
    }
    window.addEventListener('tomat:guru-tab-active', onTabActive)
    return () => window.removeEventListener('tomat:guru-tab-active', onTabActive)
  }, [user?.role])

  // Hide conditions
  if (!visible) return null
  if (!user) return null
  if (!SAFE_SCREENS.has(currentScreen)) return null

  const isGuru = user.role === 'guru'
  const zoneKey = getZoneKey(user)
  const navItems = isGuru ? (user.hasMateriTerdaftar ? GURU_NAV_FULL : GURU_NAV_READONLY) : SISWA_NAV(zoneKey)

  const handleNav = (key) => {
    // Guru tab items dispatch custom events; main screens use navigate
    if (isGuru) {
      setActiveGuruKey(key)
      window.dispatchEvent(new CustomEvent('tomat:guru-nav', { detail: { key } }))
      return
    }
    navigate(key)
  }

  return (
    <div className="tomat-sidebar" style={{
      position: 'fixed', top: 0, left: 0,
      width: 220, height: '100vh',
      background: '#111318',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px',
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4, marginBottom: 20 }}>
        <img src={logo} alt="SMARTISA" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>SMARTISA</div>
          <div style={{ fontSize: 9, color: '#475569', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Mendidik Anak TISA</div>
        </div>
      </div>

      {/* User info */}
       <div style={{
         display: 'flex', alignItems: 'center', gap: 10,
         padding: '10px 8px', marginBottom: 16,
         background: 'rgba(255,255,255,0.04)', borderRadius: 10,
       }}>
         <UserAvatar user={user} size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || user.username}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {Array.isArray(user.kelas) ? user.kelas.join(', ') : (user.kelas || (isGuru ? 'Guru' : ''))}
          </div>
        </div>
      </div>

      {/* Nav section */}
      <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', paddingLeft: 8, marginBottom: 6 }}>
        Navigasi
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
        {navItems.map(item => (
          <NavItem
            key={item.key}
            item={item}
            isActive={isGuru ? activeGuruKey === item.key : currentScreen === item.key}
            onClick={handleNav}
          />
        ))}
      </div>

      {/* Akun section */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', paddingLeft: 8, marginBottom: 6 }}>
          Akun
        </div>
        {!isGuru && (
          <NavItem
            item={{ key: 'profile', emoji: '👤', label: 'Profil' }}
            isActive={currentScreen === 'profile'}
            onClick={handleNav}
          />
        )}
        {/* Audio panel */}
        <AudioPanel
          placement="up-left"
          buttonStyle={{
            height: 44, padding: '0 16px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', fontSize: 14,
            background: 'transparent',
            color: '#94A3B8',
            fontWeight: 400,
          }}
        />
        <button
          onClick={onLogout}
          style={{
            height: 44, padding: '0 16px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', fontSize: 14,
            borderLeft: '3px solid transparent',
            background: 'transparent',
            color: '#EF4444',
            fontWeight: 400,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}
