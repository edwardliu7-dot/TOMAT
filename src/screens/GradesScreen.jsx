import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'

function GradeCard({ grade }) {
  const color = TYPE_COLORS[grade.type]
  const label = TYPE_LABELS[grade.type]
  const icon = TYPE_ICONS[grade.type]
  const date = new Date(grade.completedAt)
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

  const scoreColor = grade.score >= 90 ? '#34D399' : grade.score >= 75 ? '#67E8F9' : grade.score >= 60 ? '#F59E0B' : '#F87171'

  return (
    <div style={{
      background: '#1A1D27', borderRadius: 16,
      border: `1px solid ${color}33`, padding: 16,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{grade.gameEmoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{grade.gameName}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
            {icon} {label}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          {grade.correctCount}/{grade.totalQuestions} soal · {dateStr}
        </div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: scoreColor }}>{grade.score}</div>
        <div style={{ fontSize: 10, color: '#6B7280' }}>Nilai</div>
      </div>
    </div>
  )
}

function SectionHeader({ icon, label, color, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>{label}</div>
      <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
        {count} nilai
      </span>
    </div>
  )
}

function PendingTaskCard({ task }) {
  const color = TYPE_COLORS[task.type]
  const label = TYPE_LABELS[task.type]
  const icon = TYPE_ICONS[task.type]

  return (
    <div style={{
      background: '#1A1D27', borderRadius: 16,
      border: `1px dashed ${color}55`, padding: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: 0.75,
    }}>
      <div style={{ fontSize: 26 }}>{task.gameEmoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{task.gameName}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
            {icon} {label}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>
            📚 {task.totalQuestions} soal
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Tenggat {task.dueAt}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>⏳ BELUM</div>
        <div style={{ fontSize: 10, color: '#F59E0B' }}>DIKERJAKAN</div>
      </div>
    </div>
  )
}

export default function GradesScreen({ goBack }) {
  const { grades, tasks } = useTask()

  const pendingTasks = tasks.filter(t => t.status === 'active')
  const completedByType = {
    harian: grades.filter(g => g.type === 'harian'),
    formatif: grades.filter(g => g.type === 'formatif'),
    sumatif: grades.filter(g => g.type === 'sumatif'),
  }

  const hasAnyGrade = grades.length > 0
  const avgScore = hasAnyGrade ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="📊 Nilai Akademik Saya" onBack={goBack} accentColor="#A78BFA" />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Summary card */}
        {hasAnyGrade && (
          <div style={{
            background: 'linear-gradient(135deg, #2d1b69, #1a1a3e)',
            border: '1.5px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: 20, marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, color: '#A78BFA', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>RINGKASAN NILAI</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{avgScore}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Rata-rata</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#34D399' }}>{grades.length}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Tugas Selesai</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#F59E0B' }}>{pendingTasks.length}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Tugas Aktif</div>
              </div>
            </div>
          </div>
        )}

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
              <div style={{ fontSize: 18 }}>⏳</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F59E0B' }}>Tugas Belum Dikerjakan</div>
              <span style={{ background: '#F59E0B22', color: '#F59E0B', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
                {pendingTasks.length} tugas
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingTasks.map(t => <PendingTaskCard key={t.id} task={t} />)}
            </div>
          </>
        )}

        {/* Grades by type */}
        {['harian', 'formatif', 'sumatif'].map(type => {
          const list = completedByType[type]
          if (list.length === 0) return null
          return (
            <div key={type}>
              <SectionHeader icon={TYPE_ICONS[type]} label={TYPE_LABELS[type]} color={TYPE_COLORS[type]} count={list.length} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.slice().reverse().map(g => <GradeCard key={g.id} grade={g} />)}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {!hasAnyGrade && pendingTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Belum Ada Nilai</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              Selesaikan tugas yang ditetapkan guru<br />untuk melihat nilaimu di sini.
            </div>
          </div>
        )}

        {!hasAnyGrade && pendingTasks.length > 0 && (
          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(103,232,249,0.05)', borderRadius: 14, border: '1px solid rgba(103,232,249,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 700, marginBottom: 4 }}>Cara Mengerjakan Tugas</div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
              Buka daftar misi → pilih misi yang ada tugas aktif (tanda 📋) → pilih <strong style={{ color: '#fff' }}>Mode Tugas</strong> → selesaikan semua soal.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
