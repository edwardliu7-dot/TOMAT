import React, { useEffect, useRef } from 'react'

/**
 * MissionProgressToast
 *
 * Menampilkan antrian toast misi satu per satu (FIFO).
 * Setiap toast muncul dari bawah, auto-dismiss setelah 2500ms.
 *
 * Props:
 *   toasts    — Array<{ id, missionId, nama, emoji, delta, newProgress, goal, completed }>
 *   onDismiss — (id: string) => void
 */
export default function MissionProgressToast({ toasts = [], onDismiss }) {
  const timerRef = useRef(null)
  const current  = toasts[0]

  useEffect(() => {
    if (!current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onDismiss(current.id)
    }, 2500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current?.id]) // re-arm timer when a new toast becomes first in queue

  if (!current) return null

  const pct = Math.min(100, Math.round((current.newProgress / current.goal) * 100))

  return (
    <div style={{
      position:  'fixed',
      bottom:    80,
      left:      '50%',
      transform: 'translateX(-50%)',
      zIndex:    10004,
      maxWidth:  340,
      width:     'calc(100% - 32px)',
      background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.97))',
      border:    `1.5px solid ${current.completed ? 'rgba(34,197,94,0.7)' : 'rgba(99,102,241,0.6)'}`,
      borderRadius: 14,
      padding:   '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      fontFamily: 'system-ui, sans-serif',
      animation: 'missionToastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <style>{`
        @keyframes missionToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);   }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{current.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Baris utama: "+1 Nama Misi" */}
          <div style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', lineHeight: 1.3 }}>
            <span style={{ color: current.completed ? '#4ADE80' : '#818CF8', marginRight: 4 }}>
              +{current.delta}
            </span>
            {current.nama}
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop: 5,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              flex: 1, height: 5, borderRadius: 99,
              background: 'rgba(255,255,255,0.12)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 99,
                background: current.completed
                  ? 'linear-gradient(90deg,#22C55E,#4ADE80)'
                  : 'linear-gradient(90deg,#6366F1,#818CF8)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {current.newProgress}/{current.goal}
            </span>
          </div>

          {/* Label selesai */}
          {current.completed && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#4ADE80', fontWeight: 700 }}>
              ✅ Misi selesai! Klaim hadiahmu.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
