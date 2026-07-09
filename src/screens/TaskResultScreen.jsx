import React, { useEffect, useRef } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'

function Confetti() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 3,
      color: ['#67E8F9', '#A78BFA', '#34D399', '#F59E0B', '#F472B6'][Math.floor(Math.random() * 5)],
      vy: Math.random() * 2 + 1.5,
      vx: (Math.random() - 0.5) * 1.5,
      rot: Math.random() * 360,
      rotv: (Math.random() - 0.5) * 4,
    }))

    let alive = true
    const tick = () => {
      if (!alive) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rotv
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2)
        ctx.restore()
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      })
      requestAnimationFrame(tick)
    }
    tick()
    const timer = setTimeout(() => { alive = false }, 4000)
    return () => { alive = false; clearTimeout(timer) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, height: '100%', pointerEvents: 'none', zIndex: 100 }} />
  )
}

export default function TaskResultScreen({ goBack, grade, navigateTo }) {
  if (!grade) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A2647', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🎯</div>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Tidak ada hasil tugas.</div>
        <button onClick={goBack} style={{ background: '#67E8F9', color: '#0A1628', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          ← Kembali
        </button>
      </div>
    )
  }

  const typeColor = TYPE_COLORS[grade.type]
  const typeLabel = TYPE_LABELS[grade.type]
  const typeIcon = TYPE_ICONS[grade.type]

  const completedDate = new Date(grade.completedAt)
  const dateStr = completedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = completedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const scoreLabel = grade.score >= 90 ? 'Sangat Baik' : grade.score >= 75 ? 'Baik' : grade.score >= 60 ? 'Cukup' : 'Perlu Latihan'
  const scoreEmoji = grade.score >= 90 ? '🏆' : grade.score >= 75 ? '⭐' : grade.score >= 60 ? '👍' : '💪'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <Confetti />
      <PlayerHeader />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Hero card */}
        <div style={{
          marginTop: 8, borderRadius: 24, overflow: 'hidden',
          background: `linear-gradient(135deg, ${typeColor}18, ${typeColor}08)`,
          border: `1.5px solid ${typeColor}44`, padding: 28, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{scoreEmoji}</div>
          <div style={{ fontSize: 13, color: typeColor, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            TUGAS SELESAI!
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            {grade.gameEmoji} {grade.gameName}
          </div>
          <div style={{ display: 'inline-block', background: `${typeColor}22`, color: typeColor, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 20 }}>
            {typeIcon} {typeLabel}
          </div>

          {/* Score display */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '20px 0',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: typeColor, lineHeight: 1 }}>{grade.score}</div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 4 }}>Nilai</div>
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginTop: 8 }}>{scoreEmoji} {scoreLabel}</div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 10px' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#34D399' }}>{grade.correctCount}/{grade.totalQuestions}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Soal Dijawab</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 10px' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#A78BFA' }}>✓ Terkirim</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Status Nilai</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Diselesaikan {dateStr}, {timeStr}
          </div>
        </div>

        {/* Info */}
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(52,211,153,0.06)', borderRadius: 14, border: '1px solid rgba(52,211,153,0.15)' }}>
          <div style={{ fontSize: 13, color: '#34D399', fontWeight: 700, marginBottom: 4 }}>✅ Nilai Tersimpan Otomatis</div>
          <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
            Nilai ini telah tersimpan di akun akademikmu sebagai <strong style={{ color: '#fff' }}>{typeLabel}</strong> dan dapat dilihat oleh gurumu.
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigateTo('grades')}
            style={{ background: typeColor, color: '#0A1628', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', width: '100%' }}
          >
            📊 Lihat Semua Nilai Saya
          </button>
          <button
            onClick={() => navigateTo('grade7')}
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}
          >
            ← Kembali ke Daftar Misi
          </button>
        </div>
      </div>
    </div>
  )
}
