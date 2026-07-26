import React, { useEffect, useRef } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { DIFFICULTY_LEVELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../difficulty'
import { usePet } from '../PetContext'

// Inline 4-way picker nested inside the Latihan Bebas card: Mudah / Sedang / Sulit / Survival.
// Each button starts free play immediately with its own config — there is no separate CTA.
function FreePlayPicker({ onPick }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>Pilih tingkat kesulitan:</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
        {DIFFICULTY_LEVELS.map(level => (
          <button key={level} onClick={() => onPick({ difficulty: level })} style={{
            background: `${DIFFICULTY_COLORS[level]}18`, border: `1.5px solid ${DIFFICULTY_COLORS[level]}55`,
            borderRadius: 12, padding: '12px 6px', color: DIFFICULTY_COLORS[level], fontSize: 13,
            fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>{DIFFICULTY_LABELS[level]}</button>
        ))}
      </div>
      <button onClick={() => onPick({ survival: true })} style={{
        width: '100%', background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.4)',
        borderRadius: 12, padding: '12px 6px', color: '#F87171', fontSize: 13,
        fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
      }}>🔥 Survival — mulai dari Mudah, makin sulit tiap beberapa soal!</button>
    </div>
  )
}

function ModeCard({ icon, title, subtitle, badge, badgeColor, description, ctaLabel, ctaColor, onClick, disabled, disabledReason, topRightBadge }) {
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
      {/* Top-right badge (e.g. "✨ BARU") */}
      {topRightBadge && (
        <div style={{ position: 'absolute', top: 12, right: 14, background: 'linear-gradient(90deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, letterSpacing: 1, zIndex: 1 }}>
          {topRightBadge}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, paddingRight: topRightBadge ? 52 : 0 }}>
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

      {!disabled && ctaLabel && (
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
        {task.difficulty && (
          <span style={{ background: `${DIFFICULTY_COLORS[task.difficulty] || '#67E8F9'}22`, color: DIFFICULTY_COLORS[task.difficulty] || '#67E8F9', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
            {DIFFICULTY_LABELS[task.difficulty] || task.difficulty}
          </span>
        )}
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

function useIsMd() {
  const [md, setMd] = React.useState(() => window.innerWidth >= 768)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setMd(mq.matches)
    const h = e => setMd(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return md
}

export default function ModeSelectScreen({ navigate, goBack, pendingGame, taskId, onModeSelected, onDuel }) {
  const { tasks, getTaskForGame, startTaskSession } = useTask()
  const { pet } = usePet()
  const isMd = useIsMd()
  const petDead = pet?.isDead === true
  const task = taskId
    ? tasks.find(candidate => candidate.id === taskId && candidate.status === 'active') || null
    : (pendingGame ? getTaskForGame(pendingGame.key) : null)
  const directTaskStarted = useRef(false)

  useEffect(() => {
    if (!taskId || !task || directTaskStarted.current) return
    directTaskStarted.current = true
    startTaskSession(task.id)
    onModeSelected('task', task.id, { difficulty: task.difficulty || 'medium' })
  }, [taskId, task, startTaskSession, onModeSelected])

  const selectFreePlay = (config) => {
    onModeSelected('freeplay', null, config)
  }

  const selectTaskMode = () => {
    if (!task) return
    // Start the session inside the TaskProvider tree so the context is updated
    startTaskSession(task.id)
    onModeSelected('task', task.id, { difficulty: task.difficulty || 'medium' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="Pilih Mode Bermain" onBack={goBack} accentColor="#67E8F9" />

      <div style={{ padding: '0 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
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

        <div style={isMd ? {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          alignItems: 'start',
        } : { display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Free Play */}
          <ModeCard
            icon="🎮"
            title="Latihan Bebas"
            subtitle="Latihan kapan saja, tidak ada batas soal, hasil tidak disimpan sebagai nilai."
            badge="SELALU TERSEDIA"
            badgeColor="#34D399"
            description={<FreePlayPicker onPick={selectFreePlay} />}
            ctaLabel=""
            ctaColor="#34D399"
          />

          {/* Task Mode */}
          {petDead ? (
            <ModeCard
              icon="📋"
              title="Mode Tugas"
              subtitle="Mode Tugas tidak tersedia saat Tomi mati."
              description={
                <div style={{ textAlign: 'center', padding: '4px 0' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>💀</div>
                  <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                    Hidupkan kembali Tomi di Toko<br />untuk membuka Mode Tugas.
                  </div>
                </div>
              }
              ctaLabel=""
              ctaColor="#4B5563"
              disabled
              disabledReason="🐾 Tomi harus hidup untuk mengerjakan tugas."
            />
          ) : task ? (
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

          {/* Mode Duel — tersedia untuk semua game turnamen */}
          {onDuel && (
            petDead ? (
              <div style={isMd ? { gridColumn: '1 / -1' } : {}}>
                <ModeCard
                  icon="⚔️"
                  title="Mode Duel"
                  subtitle="Mode Duel tidak tersedia saat Tomi mati."
                  badge="MULTIPLAYER"
                  badgeColor="#4B5563"
                  description={
                    <div style={{ textAlign: 'center', padding: '4px 0' }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>💀</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                        Hidupkan kembali Tomi di Toko<br />untuk bisa berduel.
                      </div>
                    </div>
                  }
                  ctaLabel=""
                  ctaColor="#4B5563"
                  disabled
                  disabledReason="🐾 Tomi harus hidup untuk bermain duel."
                />
              </div>
            ) : (
              <div style={isMd ? { gridColumn: '1 / -1' } : {}}>
                <ModeCard
                  icon="⚔️"
                  title="Mode Duel"
                  subtitle="Tantang teman sekelasmu secara real-time! 7 soal, siapa lebih banyak benar?"
                  badge="MULTIPLAYER"
                  badgeColor="#f59e0b"
                  topRightBadge="✨ BARU"
                  ctaLabel="Masuk Lobby Duel ▶"
                  ctaColor="#f59e0b"
                  onClick={onDuel}
                />
              </div>
            )
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
