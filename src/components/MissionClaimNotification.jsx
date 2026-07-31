import React, { useState } from 'react'

/**
 * MissionClaimNotification
 *
 * Modal yang muncul ketika misi baru selesai dan reward belum diklaim.
 * Menampilkan satu misi per modal (FIFO). Modal hilang setelah klaim berhasil
 * atau siswa menekan "Nanti Saja".
 *
 * Props:
 *   missions  — Array<{ missionId, nama, emoji, goal, newProgress }>
 *   onDismiss — (missionId: string) => void
 *   onClaim   — async (missionId: string) => void   ← sudah termasuk fetch + dismiss
 */
export default function MissionClaimNotification({ missions = [], onDismiss, onClaim }) {
  const [loading, setLoading] = useState(false)
  const current = missions[0]

  if (!current) return null

  const handleClaim = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onClaim(current.missionId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      zIndex:     10005,
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding:    '0 20px',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      animation: 'missionClaimBgIn 0.2s ease both',
    }}>
      <style>{`
        @keyframes missionClaimBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes missionClaimCardIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>

      <div style={{
        width:        '100%',
        maxWidth:     360,
        background:   'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)',
        border:       '1.5px solid rgba(251,191,36,0.45)',
        borderRadius: 20,
        padding:      '28px 24px 24px',
        boxShadow:    '0 24px 60px rgba(0,0,0,0.6)',
        fontFamily:   'system-ui, sans-serif',
        textAlign:    'center',
        animation:    'missionClaimCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Emoji besar */}
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 14 }}>
          {current.emoji}
        </div>

        {/* Badge "Misi Selesai!" */}
        <div style={{
          display:        'inline-block',
          background:     'rgba(34,197,94,0.15)',
          border:         '1px solid rgba(34,197,94,0.4)',
          borderRadius:   99,
          padding:        '3px 12px',
          fontSize:       11,
          fontWeight:     800,
          color:          '#4ADE80',
          letterSpacing:  '0.04em',
          marginBottom:   10,
          textTransform:  'uppercase',
        }}>
          ✅ Misi Selesai!
        </div>

        {/* Nama misi */}
        <div style={{
          fontSize:   20,
          fontWeight: 900,
          color:      '#F1F5F9',
          marginBottom: 8,
          lineHeight: 1.25,
        }}>
          {current.nama}
        </div>

        {/* Deskripsi */}
        <div style={{
          fontSize:     13,
          color:        '#94A3B8',
          lineHeight:   1.55,
          marginBottom: 22,
        }}>
          Kamu berhasil menyelesaikan misi ini!
          <br />Klaim hadiahmu sekarang sebelum event berakhir.
        </div>

        {/* Tombol Klaim */}
        <button
          onClick={handleClaim}
          disabled={loading}
          style={{
            width:        '100%',
            padding:      '13px 0',
            borderRadius: 12,
            border:       'none',
            background:   loading
              ? 'rgba(225,29,72,0.5)'
              : 'linear-gradient(135deg,#E11D48,#BE123C)',
            color:        '#fff',
            fontSize:     15,
            fontWeight:   800,
            cursor:       loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            marginBottom: 10,
            boxShadow:    loading ? 'none' : '0 4px 16px rgba(225,29,72,0.4)',
            transition:   'opacity 0.15s',
          }}
        >
          {loading ? 'Mengklaim…' : '🎁 Klaim Hadiah'}
        </button>

        {/* Tombol Nanti Saja */}
        <button
          onClick={() => onDismiss(current.missionId)}
          disabled={loading}
          style={{
            width:        '100%',
            padding:      '11px 0',
            borderRadius: 12,
            border:       '1px solid rgba(148,163,184,0.25)',
            background:   'transparent',
            color:        '#64748B',
            fontSize:     13,
            fontWeight:   600,
            cursor:       loading ? 'not-allowed' : 'pointer',
          }}
        >
          Nanti Saja
        </button>
      </div>
    </div>
  )
}
