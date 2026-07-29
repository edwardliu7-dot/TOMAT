import React, { useState, useEffect } from 'react'
import { APP_VERSION } from '../version'

const STORAGE_KEY = `tomat_seen_whats_new_v${APP_VERSION}`

const CHANGES = [
  {
    icon: '🌟',
    title: 'Bonus Keistimewaan Pet',
    body: 'Setiap pet & skin kini punya keistimewaan unik yang aktif saat bermain: Tomi menambah Koin, Kelinsay menambah EXP, Monyang menambah keduanya, dan Nananaga membuat makanan lebih awet. Semakin tinggi skin, semakin besar bonusnya!',
    highlight: true,
  },
  {
    icon: '📖',
    title: 'Kisah Pet di Toko',
    body: 'Buka toko dan temukan cerita unik di balik setiap pet dan skin — dari Tomi si pahlawan emas, Kelinsay sahabat setia, Monyang raja usil, hingga Nananaga sang legenda Negeri TOMAT!',
  },
  {
    icon: '🐾',
    title: 'Sistem HP Pet Diperbaiki',
    body: 'Mengganti skin Tomi tidak lagi mereset HP-nya. Semua skin dalam satu pet berbagi HP yang sama — HP Tomi tetap, hanya penampilannya yang berubah.',
  },
  {
    icon: '🎨',
    title: 'Skin Dasar Bisa Dipakai Kembali',
    body: 'Kamu bisa kembali ke Golden Marmut kapan saja lewat toko pet.',
  },
  {
    icon: '🔧',
    title: 'Perbaikan & Penyempurnaan',
    body: 'Perbaikan koneksi jaringan Android, penyempurnaan performa, dan berbagai peningkatan stabilitas.',
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
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            boxShadow: '0 4px 18px rgba(99,102,241,0.45)',
          }}>🎉</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.2 }}>
              Yang Baru di TOMAT
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
              background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 20, padding: '2px 10px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: 0.5 }}>
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
                background: c.highlight
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.10))'
                  : 'rgba(255,255,255,0.04)',
                border: c.highlight
                  ? '1px solid rgba(99,102,241,0.28)'
                  : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.highlight ? '#c4b5fd' : '#e2e8f0', marginBottom: 4 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pet bonus quick-ref */}
        <div style={{
          marginTop: 16,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: '12px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, marginBottom: 10 }}>
            RINGKASAN BONUS PET
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { pet: 'Tomi', bonus: 'Koin ↑',       color: '#F5A623', icon: '🐹' },
              { pet: 'Kelinsay', bonus: 'EXP ↑',    color: '#34D399', icon: '🐰' },
              { pet: 'Monyang', bonus: 'Koin+EXP ↑', color: '#C084FC', icon: '🐒' },
              { pet: 'Nananaga', bonus: 'Stamina ↑', color: '#FB923C', icon: '🐉' },
            ].map(({ pet, bonus, color, icon }) => (
              <div key={pet} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: `${color}22`, border: `1px solid ${color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
                }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{pet}</div>
                  <div style={{ fontSize: 10, color, fontWeight: 600 }}>{bonus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 20,
            padding: '14px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(99,102,241,0.40)',
          }}
        >
          Siap Bermain! 🎮
        </button>
      </div>
    </div>
  )
}
