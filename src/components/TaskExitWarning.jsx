import React from 'react'

/**
 * Full-screen warning shown when the student returns to the app after having
 * switched tabs / backgrounded the app during an active task session.
 *
 * Props:
 *   onDismiss — called when the student acknowledges and wants to continue
 */
export default function TaskExitWarning({ onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.93)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 20 }}>⚠️</div>

      {/* Title */}
      <div style={{
        fontSize: 22, fontWeight: 900, color: '#EF4444',
        letterSpacing: '-0.01em', marginBottom: 12,
      }}>
        Kamu Meninggalkan Aplikasi!
      </div>

      {/* Body */}
      <div style={{
        fontSize: 15, color: '#CBD5E1', lineHeight: 1.6,
        maxWidth: 340, marginBottom: 8,
      }}>
        Soal tugas telah <strong style={{ color: '#fff' }}>direset dari awal</strong> karena kamu
        berpindah tab atau keluar dari aplikasi saat mode tugas aktif.
      </div>

      {/* Guru notified */}
      <div style={{
        marginTop: 16, marginBottom: 32,
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: 12, padding: '10px 18px',
        fontSize: 13, color: '#FCA5A5', fontWeight: 700,
      }}>
        📢 Guru sudah mendapatkan laporan tentang ini.
      </div>

      {/* Continue button */}
      <button
        onClick={onDismiss}
        style={{
          background: 'linear-gradient(135deg,#6366F1,#818CF8)',
          color: '#fff', border: 'none', borderRadius: 14,
          padding: '14px 40px', fontSize: 16, fontWeight: 900,
          cursor: 'pointer', letterSpacing: '-0.01em',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}
      >
        Mengerti, Lanjutkan
      </button>

      <div style={{ marginTop: 16, fontSize: 12, color: '#475569' }}>
        Tetap di aplikasi sampai semua soal selesai dijawab.
      </div>
    </div>
  )
}
