import React, { useState, useEffect } from 'react'
import { APP_VERSION } from '../version'

const STORAGE_KEY = `tomat_seen_whats_new_v${APP_VERSION}`

const CHANGES = [
  {
    icon: '🎓',
    title: 'Game IPA Kelas 7 & 8 Hadir!',
    body: 'Materi IPA kini tersedia di TOMAT! Kelas 7 BAB 4 (Gaya & Gerak) dan Kelas 8 BAB 1 (Pengenalan Sel) sudah bisa dimainkan — 7 game baru dengan tema warna berbeda, 10 soal per sesi, dan reward koin seperti biasa.',
    highlight: true,
  },
  {
    icon: '🎵',
    title: 'Musik Latar Default',
    body: 'Musik pengiring kini aktif otomatis di semua sesi. Atur volume BGM dan SFX secara terpisah lewat tombol 🔊 di pojok layar. Pengaturan tersimpan otomatis.',
  },
  {
    icon: '📳',
    title: 'Notifikasi Android Diperbaiki',
    body: 'Undangan duel dan notifikasi pertandingan turnamen kini muncul sebagai banner OS native di Android. Koneksi socket lebih stabil saat berpindah aplikasi dan kembali ke TOMAT.',
  },
  {
    icon: '🔧',
    title: 'Perbaikan & Penyempurnaan',
    body: 'Nama lengkap aplikasi diperbarui menjadi "Tantangan Otak Mendidik Anak TISA". Perbaikan minor pada tampilan dan stabilitas.',
  },
]

export function useWhatsNew() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true)
      }
    } catch {
      /* localStorage may be blocked in some contexts */
    }
  }, [])

  const dismiss = () => {
    setOpen(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
  }

  return { open, dismiss }
}

export default function WhatsNewModal({ onClose }) {
  // Merah Putih theme accent when kemerdekaan event is active (Aug)
  const now = new Date()
  const isAugust = now.getMonth() + 1 === 8 ||
    (now.getMonth() + 1 === 7 && now.getDate() >= 15)

  const accent      = isAugust ? '#DC2626' : '#6366f1'
  const accentSoft  = isAugust ? 'rgba(220,38,38,0.18)' : 'rgba(99,102,241,0.18)'
  const accentBorder= isAugust ? 'rgba(220,38,38,0.30)' : 'rgba(99,102,241,0.30)'
  const accentLight = isAugust ? '#fca5a5' : '#a5b4fc'
  const headerBg    = isAugust
    ? 'linear-gradient(135deg,#7f1d1d,#DC2626)'
    : 'linear-gradient(135deg,#6366f1,#a855f7)'
  const headerGlow  = isAugust
    ? '0 4px 18px rgba(220,38,38,0.45)'
    : '0 4px 18px rgba(99,102,241,0.45)'
  const hlBg        = isAugust
    ? 'linear-gradient(135deg,rgba(220,38,38,0.14),rgba(127,29,29,0.10))'
    : 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.10))'
  const hlBorder    = isAugust
    ? '1px solid rgba(220,38,38,0.28)'
    : '1px solid rgba(99,102,241,0.28)'
  const hlTitle     = isAugust ? '#fca5a5' : '#c4b5fd'
  const btnBg       = isAugust
    ? 'linear-gradient(135deg,#7f1d1d,#DC2626)'
    : 'linear-gradient(135deg,#6366f1,#8b5cf6)'
  const btnGlow     = isAugust
    ? '0 4px 20px rgba(220,38,38,0.40)'
    : '0 4px 20px rgba(99,102,241,0.40)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10050,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom,0)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: 'linear-gradient(160deg,#12151f,#0d1018)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 22px 32px',
          maxHeight: '92dvh', overflowY: 'auto',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: headerBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            boxShadow: headerGlow,
          }}>
            {isAugust ? '🇮🇩' : '🎉'}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.2 }}>
              Yang Baru di TOMAT
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
              background: accentSoft, border: `1px solid ${accentBorder}`,
              borderRadius: 20, padding: '2px 10px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: accentLight, letterSpacing: 0.5 }}>
                Versi {APP_VERSION}
              </span>
            </div>
          </div>
        </div>

        {/* Change list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHANGES.map((c, i) => (
            <div
              key={i}
              style={{
                background: c.highlight ? hlBg : 'rgba(255,255,255,0.04)',
                border: c.highlight ? hlBorder : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{c.icon}</div>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, marginBottom: 4,
                  color: c.highlight ? hlTitle : '#e2e8f0',
                }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Event misi quick-ref — only during kemerdekaan window */}
        {isAugust && (
          <div style={{
            marginTop: 16,
            background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.18)',
            borderRadius: 14, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 10 }}>
              MISI KEMERDEKAAN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { num: '1', label: '17 Soal Benar', reward: 'Bingkai Kemerdekaan', icon: '🏅' },
                { num: '2', label: '8 Duel Menang',  reward: 'Spanduk HUT RI ke-81', icon: '🎌' },
                { num: '3', label: 'Selesaikan keduanya', reward: 'Kelinsay Merah Putih', icon: '🐰' },
              ].map(m => (
                <div key={m.num} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.30)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                  }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#fca5a5', fontWeight: 600 }}>→ {m.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 20,
            padding: '14px', borderRadius: 14, border: 'none',
            background: btnBg,
            color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: btnGlow,
          }}
        >
          {isAugust ? 'Merdeka! 🇮🇩' : 'Siap Bermain! 🎮'}
        </button>
      </div>
    </div>
  )
}
