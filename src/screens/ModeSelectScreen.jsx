import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'

function ModeCard({ icon, title, subtitle, badge, badgeColor, description, ctaLabel, ctaColor, onClick, disabled, disabledReason }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        background: disabled ? 'rgba(255,255,255,0.02)' : '#1A1D27',
        border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.05)' : ctaColor + '44'}`,
        borderRadius: 20, padding: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = '' }}
    >
      {/* Accent glow */}
      {!disabled && <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: ctaColor, opacity: 0.06, filter: 'blur(20px)' }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{title}</div>
            {badge && (
              <span style={{ background: `${badgeColor}22`, color: badgeColor, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: 0.5 }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
      </div>

      {description && (
        <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          {description}
        </div>
      )}

      {disabledReason && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>
          {disabledReason}
        </div>
      )}

      {!disabled && (
        <div style={{ marginTop: 14, background: ctaColor, borderRadius: 12, padding: '12px 0', textAlign: 'center' }}>
          <span style={{ color: '#0A1628', fontSize: 14, fontWeight: 800 }}>{ctaLabel}</span>
        </div>
      )}
    </div>
  )
}

function TaskInfo({ task }) {
  const color = TYPE_COLORS[task.type]
  const icon = TYPE_ICONS[task.type]
  const label = TYPE_LABELS[task.type]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          {icon} {label}
        </span>
        <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
          📚 {task.totalQuestions} Soal
        </span>
        <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
          ⏰ Tenggat {task.dueAt}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>
        Ditugaskan untuk kelasmu oleh guru
      </div>
    </div>
  )
}

function EmptyTaskState() {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>📋</div>
      <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
        Belum ada tugas yang ditetapkan<br />
        oleh guru untuk misi ini.
      </div>
    </div>
  )
}

export default function ModeSelectScreen({ navigate, goBack, pendingGame, onModeSelected }) {
  const { getTaskForGame, startTaskSession } = useTask()
  const task = pendingGame ? getTaskForGame(pendingGame.key) : null

  const selectFreePlay = () => {
    onModeSelected('freeplay')
  }

  const selectTaskMode = () => {
    if (!task) return
    // Start the session inside the TaskProvider tree so the context is updated
    startTaskSession(task.id)
    onModeSelected('task', task.id)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="Pilih Mode Bermain" onBack={goBack} accentColor="#67E8F9" />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Game header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          background: 'rgba(255,255,255,0.04)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 32 }}>{pendingGame?.emoji}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{pendingGame?.name}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Pilih mode untuk memulai</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Free Play */}
          <ModeCard
            icon="🎮"
            title="Latihan Bebas"
            subtitle="Latihan kapan saja, tidak ada batas soal, hasil tidak disimpan sebagai nilai."
            badge="SELALU TERSEDIA"
            badgeColor="#34D399"
            ctaLabel="Mulai Latihan ▶"
            ctaColor="#34D399"
            onClick={selectFreePlay}
          />

          {/* Task Mode */}
          {task ? (
            <ModeCard
              icon={TYPE_ICONS[task.type]}
              title="Mode Tugas"
              subtitle={`Kerjakan ${task.totalQuestions} soal yang ditetapkan guru. Nilaimu akan tersimpan otomatis sebagai ${TYPE_LABELS[task.type]}.`}
              badge={TYPE_LABELS[task.type].toUpperCase()}
              badgeColor={TYPE_COLORS[task.type]}
              description={<TaskInfo task={task} />}
              ctaLabel={`Mulai Tugas · ${task.totalQuestions} Soal ▶`}
              ctaColor={TYPE_COLORS[task.type]}
              onClick={selectTaskMode}
            />
          ) : (
            <ModeCard
              icon="📋"
              title="Mode Tugas"
              subtitle="Mode ini hanya aktif jika guru telah menetapkan tugas atas akunmu."
              description={<EmptyTaskState />}
              ctaLabel=""
              ctaColor="#4B5563"
              disabled
            />
          )}
        </div>

        {/* Info note */}
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(103,232,249,0.05)', borderRadius: 12, border: '1px solid rgba(103,232,249,0.1)' }}>
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, marginBottom: 4 }}>💡 Tentang Mode Tugas</div>
          <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>
            Nilaimu akan otomatis tersimpan di akun dan terlihat oleh guru setelah kamu menyelesaikan semua soal tugas.
          </div>
        </div>
      </div>
    </div>
  )
}
