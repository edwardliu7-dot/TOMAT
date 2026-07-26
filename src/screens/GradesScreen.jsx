import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

function GradeCard({ grade }) {
  const color = TYPE_COLORS[grade.type]
  const label = TYPE_LABELS[grade.type]
  const icon = TYPE_ICONS[grade.type]
  const date = new Date(grade.completedAt)
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const scoreColor = grade.score >= 90 ? '#34D399' : grade.score >= 75 ? '#67E8F9' : grade.score >= 60 ? '#F59E0B' : '#F87171'

  return (
    <div style={{ background: '#0E1E35', borderRadius: 16, border: `1px solid ${color}33`, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,.16)' }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{grade.gameEmoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{grade.gameName}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{icon} {label}</span>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>{grade.correctCount}/{grade.totalQuestions} soal · {dateStr}</div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: scoreColor }}>{grade.score}</div>
        <div style={{ fontSize: 10, color: '#6B7280' }}>Nilai</div>
      </div>
    </div>
  )
}

function GradeRow({ grade }) {
  const color = TYPE_COLORS[grade.type]
  const icon = TYPE_ICONS[grade.type]
  const date = new Date(grade.completedAt)
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  const scoreColor = grade.score >= 90 ? '#34D399' : grade.score >= 75 ? '#67E8F9' : grade.score >= 60 ? '#F59E0B' : '#F87171'

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 22 }}>{grade.gameEmoji}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{grade.gameName}</div>
            <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{icon} {TYPE_LABELS[grade.type]}</span>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{grade.score}</span>
      </td>
      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>{grade.correctCount}/{grade.totalQuestions}</td>
      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B', fontSize: 12 }}>{dateStr}</td>
    </tr>
  )
}

function PendingTaskCard({ task, onClick }) {
  const color = TYPE_COLORS[task.type]
  const label = TYPE_LABELS[task.type]
  const icon = TYPE_ICONS[task.type]
  return (
    <div style={{ background: 'linear-gradient(135deg,#141B3A,#0E1E35)', borderRadius: 16, border: `1px solid ${color}44`, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.14)' }}>
      <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: 0, background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
        <div style={{ fontSize: 26 }}>{task.gameEmoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{task.gameName}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{icon} {label}</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>📚 {task.totalQuestions} soal</span>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>Tenggat {task.dueAt}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>⏳ BELUM DIKERJAKAN</div>
        </div>
        <div style={{ color: '#67E8F9', fontSize: 16 }}>▶</div>
      </button>
    </div>
  )
}

const DESKTOP_TABS = [
  { id: 'selesai', label: '✅ Tugas Selesai' },
  { id: 'aktif', label: '⏳ Tugas Aktif' },
  { id: 'per-game', label: '📊 Per Game' },
]

export default function GradesScreen({ goBack, navigate }) {
  const { grades, tasks } = useTask()
  const isDesktop = useIsDesktop()
  const [desktopTab, setDesktopTab] = useState('selesai')

  const pendingTasks = tasks.filter(t => t.status === 'active')
  const completedByType = {
    harian: grades.filter(g => g.type === 'harian'),
    formatif: grades.filter(g => g.type === 'formatif'),
    sumatif: grades.filter(g => g.type === 'sumatif'),
  }
  const hasAnyGrade = grades.length > 0
  const avgScore = hasAnyGrade ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : null

  // ── Summary card ──
  const SummaryCard = () => hasAnyGrade ? (
    <div style={{
       background: 'linear-gradient(135deg, #141B3A, #0F1830)',
      border: '1.5px solid rgba(167,139,250,0.3)', borderRadius: 20, padding: 20, marginBottom: 20,
    }}>
       <div style={{ display: 'inline-block', fontSize: 10, color: '#C4B5FD', fontWeight: 900, letterSpacing: 1.7, padding: '5px 9px', borderRadius: 6, background: 'rgba(99,102,241,.15)', marginBottom: 12 }}>RINGKASAN NILAI</div>
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
  ) : null

  if (!isDesktop) {
    // ── Mobile layout ──
    return (
       <div style={{ minHeight: '100vh', background: '#071321', backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 38%), radial-gradient(circle at 100% 70%, rgba(124,58,237,.06), transparent 35%)' }}>
        <PlayerHeader />
         <TopBar title="Nilai & Tugas 📊" onBack={goBack} accentColor="#818CF8" />
        <div style={{ padding: '0 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <SummaryCard />
          {pendingTasks.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
                <div style={{ fontSize: 18 }}>⏳</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#F59E0B' }}>Tugas Belum Dikerjakan</div>
                <span style={{ background: '#F59E0B22', color: '#F59E0B', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>{pendingTasks.length} tugas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingTasks.map(t => <PendingTaskCard key={t.id} task={t} onClick={() => navigate?.(t.gameKey, { taskId: t.id })} />)}
              </div>
            </>
          )}
          {['harian', 'formatif', 'sumatif'].map(type => {
            const list = completedByType[type]
            if (list.length === 0) return null
            const color = TYPE_COLORS[type]
            return (
              <div key={type}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
                  <div style={{ fontSize: 18 }}>{TYPE_ICONS[type]}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color }}>{TYPE_LABELS[type]}</div>
                  <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>{list.length} nilai</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.slice().reverse().map(g => <GradeCard key={g.id} grade={g} />)}
                </div>
              </div>
            )
          })}
          {!hasAnyGrade && pendingTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Belum Ada Nilai</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Selesaikan tugas yang ditetapkan guru<br />untuk melihat nilaimu di sini.</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Desktop layout ──
  return (
     <div style={{ minHeight: '100vh', background: '#071321', backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 38%), radial-gradient(circle at 100% 70%, rgba(124,58,237,.06), transparent 35%)' }}>
       <TopBar title="Nilai & Tugas 📊" onBack={goBack} accentColor="#818CF8" />
      <div style={{ padding: '16px var(--page-pad) 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <SummaryCard />

        {/* Desktop tabs */}
         <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#0A1628', border: '1px solid rgba(99,102,241,0.08)', borderRadius: 14, padding: 4 }}>
          {DESKTOP_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setDesktopTab(t.id)}
              style={{
                 flex: 1, border: desktopTab === t.id ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent', borderRadius: 10, padding: '10px 16px',
                 background: desktopTab === t.id ? '#0E1E35' : 'transparent',
                 color: desktopTab === t.id ? '#C4B5FD' : '#58718A',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab: Tugas Aktif */}
        {desktopTab === 'aktif' && (
          pendingTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#94A3B8' }}>Tidak ada tugas aktif</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingTasks.map(t => <PendingTaskCard key={t.id} task={t} onClick={() => navigate?.(t.gameKey, { taskId: t.id })} />)}
            </div>
          )
        )}

        {/* Tab: Tugas Selesai — table view */}
        {desktopTab === 'selesai' && (
          !hasAnyGrade ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Belum Ada Nilai</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>Selesaikan tugas yang ditetapkan guru untuk melihat nilaimu.</div>
            </div>
          ) : (
             <div style={{ background: '#0E1E35', borderRadius: 16, border: '1px solid rgba(99,102,241,0.10)', overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,.16)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Game</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 80 }}>Nilai</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 80 }}>Soal</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, width: 140 }}>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.slice().reverse().map(g => <GradeRow key={g.id} grade={g} />)}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab: Per Game */}
        {desktopTab === 'per-game' && (
          !hasAnyGrade ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              <div>Belum ada nilai untuk ditampilkan.</div>
            </div>
          ) : (() => {
            const byGame = {}
            grades.forEach(g => {
              if (!byGame[g.gameKey]) byGame[g.gameKey] = { name: g.gameName, emoji: g.gameEmoji, scores: [] }
              byGame[g.gameKey].scores.push(g.score)
            })
            const gameList = Object.values(byGame).map(g => ({ ...g, best: Math.max(...g.scores), avg: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length) }))
            gameList.sort((a, b) => b.best - a.best)
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {gameList.map((g, i) => {
                  const bestColor = g.best >= 90 ? '#34D399' : g.best >= 75 ? '#67E8F9' : g.best >= 60 ? '#F59E0B' : '#F87171'
                  return (
                     <div key={i} style={{ background: '#0E1E35', border: '1px solid rgba(99,102,241,0.10)', borderRadius: 16, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ fontSize: 28 }}>{g.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{g.scores.length}× dimainkan</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: bestColor }}>{g.best}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Terbaik</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: '#94A3B8' }}>{g.avg}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Rata-rata</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}
