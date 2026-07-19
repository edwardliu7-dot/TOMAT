import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../AuthContext'
import { GAMES_CATALOG, GRADE_BAB_LABELS, getBabsForGrade } from '../gamesCatalog'

const KELAS_PREFIX_TO_GRADE = { VII: 7, VIII: 8, IX: 9 }
function kelasToGrade(kelas) {
  return KELAS_PREFIX_TO_GRADE[kelas?.trim().split(' ')[0]] || null
}
import GuruHafalanScreen from './GuruHafalanScreen'
import { TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { DIFFICULTY_LEVELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../difficulty'
import ProfileScreen from './ProfileScreen'

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const TABS = [
  { id: 'tugas',   label: '📋 Tugas' },
  { id: 'hafalan', label: '🧮 Hafalan' },
  { id: 'nilai',   label: '📊 Rekap Nilai' },
  { id: 'siswa',   label: '👥 Siswa' },
  { id: 'kunci',   label: '🔒 Kunci Bab' },
  { id: 'insight', label: '🎮 Insight' },
]

function Section({ children, style = {} }) {
  return <div style={{ background: '#1A1D27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 16, ...style }}>{children}</div>
}

function TugasTab({ kelasDiampu }) {
  const [tugasList, setTugasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initialKelas = kelasDiampu[0] || ''
  const initialGames = GAMES_CATALOG.filter(g => g.grade === kelasToGrade(initialKelas))
  const [form, setForm] = useState({ kelas: initialKelas, gameKey: initialGames[0]?.key || '', type: 'harian', totalQuestions: 5, dueAt: '', difficulty: 'medium' })
  const [submitting, setSubmitting] = useState(false)

  const availableGames = GAMES_CATALOG.filter(g => g.grade === kelasToGrade(form.kelas))

  useEffect(() => {
    if (!availableGames.some(g => g.key === form.gameKey)) {
      setForm(f => ({ ...f, gameKey: availableGames[0]?.key || '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.kelas])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { tugas } = await apiCall('/api/guru/tugas')
      setTugasList(tugas)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const game = GAMES_CATALOG.find(g => g.key === form.gameKey)
      await apiCall('/api/guru/tugas', {
        method: 'POST',
        body: {
          kelas: form.kelas,
          gameKey: form.gameKey,
          gameName: game?.name,
          gameEmoji: game?.emoji,
          bab: game?.bab,
          type: form.type,
          totalQuestions: form.totalQuestions,
          dueAt: form.dueAt || null,
          difficulty: form.difficulty,
        },
      })
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const closeTugas = async (id, status) => {
    try {
      await apiCall(`/api/guru/tugas/${id}`, { method: 'PATCH', body: { status } })
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Section>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Tetapkan Tugas Baru</div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} style={inputStyle}>
            {kelasDiampu.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={form.gameKey} onChange={e => setForm(f => ({ ...f, gameKey: e.target.value }))} style={inputStyle}>
            {availableGames.length === 0 && <option value="">Tidak ada game untuk kelas ini</option>}
            {availableGames.map(g => <option key={g.key} value={g.key}>{g.emoji} {g.name} ({GRADE_BAB_LABELS[g.grade]?.[g.bab] || g.bab})</option>)}
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
              <option value="harian">Penilaian Harian</option>
              <option value="formatif">Penilaian Formatif</option>
              <option value="sumatif">Penilaian Sumatif</option>
            </select>
            <input type="number" min={1} value={form.totalQuestions} onChange={e => setForm(f => ({ ...f, totalQuestions: e.target.value }))} placeholder="Jumlah soal" style={{ ...inputStyle, width: 110 }} />
          </div>
          <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
            {DIFFICULTY_LEVELS.map(level => <option key={level} value={level}>Tingkat Kesulitan: {DIFFICULTY_LABELS[level]}</option>)}
          </select>
          <input type="date" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} style={inputStyle} />
          {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={submitting || kelasDiampu.length === 0} style={submitBtnStyle(submitting)}>
            {submitting ? 'Menyimpan…' : 'Tetapkan Tugas'}
          </button>
        </form>
      </Section>

      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Daftar Tugas ({tugasList.length})</div>
        {loading ? (
          <div style={{ color: '#94A3B8', fontSize: 13 }}>Memuat…</div>
        ) : tugasList.length === 0 ? (
          <div style={{ color: '#6B7280', fontSize: 13 }}>Belum ada tugas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tugasList.map(t => {
              const color = TYPE_COLORS[t.type]
              return (
                <Section key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{t.game_emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.game_name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {t.kelas} · {TYPE_ICONS[t.type]} {TYPE_LABELS[t.type]} · {t.total_questions} soal{t.due_at ? ` · Tenggat ${t.due_at}` : ''}
                    </div>
                  </div>
                  <span style={{ background: `${DIFFICULTY_COLORS[t.difficulty] || '#67E8F9'}22`, color: DIFFICULTY_COLORS[t.difficulty] || '#67E8F9', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                    {DIFFICULTY_LABELS[t.difficulty] || t.difficulty}
                  </span>
                  <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                    {t.status === 'active' ? 'AKTIF' : 'DITUTUP'}
                  </span>
                  <button onClick={() => closeTugas(t.id, t.status === 'active' ? 'closed' : 'active')} style={smallBtnStyle}>
                    {t.status === 'active' ? 'Tutup' : 'Buka'}
                  </button>
                </Section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function NilaiTab() {
  const [nilaiList, setNilaiList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiCall('/api/guru/nilai').then(({ nilai }) => setNilaiList(nilai)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#94A3B8', fontSize: 13 }}>Memuat…</div>
  if (nilaiList.length === 0) return <div style={{ color: '#6B7280', fontSize: 13 }}>Belum ada nilai yang terkumpul.</div>

  const avg = Math.round(nilaiList.reduce((s, n) => s + n.score, 0) / nilaiList.length)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Section style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{avg}</div>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>Rata-rata dari {nilaiList.length} nilai terkumpul</div>
      </Section>
      {nilaiList.map(n => {
        const color = TYPE_COLORS[n.type]
        const scoreColor = n.score >= 90 ? '#34D399' : n.score >= 75 ? '#67E8F9' : n.score >= 60 ? '#F59E0B' : '#F87171'
        return (
          <Section key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22 }}>{n.game_emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{n.student_name} <span style={{ color: '#6B7280', fontWeight: 400 }}>({n.student_username})</span></div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                {n.game_name} · {n.kelas} · {TYPE_ICONS[n.type]} {TYPE_LABELS[n.type]} · {n.correct_count}/{n.total_questions} soal
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor }}>{n.score}</div>
          </Section>
        )
      })}
    </div>
  )
}

function SiswaTab() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiCall('/api/guru/students').then(({ students }) => setStudents(students)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#94A3B8', fontSize: 13 }}>Memuat…</div>
  if (students.length === 0) return <div style={{ color: '#6B7280', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>

  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#67E8F9', marginBottom: 8 }}>{kelas} ({list.length} siswa)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(s => (
              <Section key={s.id} style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{s.username}</div>
              </Section>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function KunciTab({ grades }) {
  const [locks, setLocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const { locks } = await apiCall('/api/guru/bab-locks')
      setLocks(locks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const isLocked = (grade, bab) => locks.some(l => l.grade === grade && l.bab === bab && l.locked)

  const toggle = async (grade, bab) => {
    setError('')
    try {
      await apiCall('/api/guru/bab-locks', { method: 'POST', body: { grade, bab, locked: !isLocked(grade, bab) } })
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div style={{ color: '#94A3B8', fontSize: 13 }}>Memuat…</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
      {grades.length === 0 && <div style={{ color: '#6B7280', fontSize: 13 }}>Anda belum mengampu kelas manapun.</div>}
      {grades.map(grade => (
        <div key={grade}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#A78BFA', marginBottom: 8 }}>Kelas {grade}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {getBabsForGrade(grade).map(bab => {
              const locked = isLocked(grade, bab)
              return (
                <Section key={bab} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{GRADE_BAB_LABELS[grade]?.[bab] || bab}</div>
                  <button onClick={() => toggle(grade, bab)} style={{
                    background: locked ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.15)',
                    color: locked ? '#F87171' : '#34D399', border: 'none', borderRadius: 20,
                    padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {locked ? '🔒 Terkunci — Buka' : '🔓 Terbuka — Kunci'}
                  </button>
                </Section>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function Sparkline({ values }) {
  const max = Math.max(1, ...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          width: 8, borderRadius: 2, height: Math.max(3, (v / max) * 28),
          background: i === values.length - 1 && v > 0 ? '#34D399' : v > 0 ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  )
}

function InsightTab() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiCall('/api/guru/insight').then(({ students }) => setStudents(students)).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#94A3B8', fontSize: 13 }}>Memuat…</div>
  if (error) return <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>
  if (students.length === 0) return <div style={{ color: '#6B7280', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>

  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 12, color: '#6B7280' }}>
        Aktivitas 7 hari terakhir, level, koin, dan lencana — dari data game yang sudah tercatat.
      </div>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#67E8F9', marginBottom: 8 }}>{kelas} ({list.length} siswa)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map(s => (
              <Section key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.name}
                    {s.activeToday && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} title="Aktif hari ini" />}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                    ⭐ Lv {s.level} · 📚 {s.exp} EXP · 🪙 {s.coins} · 🏅 {s.badgeCount} · 🔥 Rekor {s.bestSurvivalStreak}
                  </div>
                </div>
                <Sparkline values={s.sparkline} />
              </Section>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function GuruDashboardScreen({ onPlayGames }) {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('tugas')
  const [view, setView] = useState('dashboard')
  const kelasDiampu = user?.kelas || []
  const grades = [...new Set(kelasDiampu.map(kelasToGrade).filter(Boolean))].sort()

  if (view === 'profile') {
    return <ProfileScreen goBack={() => setView('dashboard')} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1115' }}>
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setView('profile')} title="Profil" style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0, padding: 0, border: 'none', cursor: 'pointer',
          background: user?.photoUrl ? `url(${user.photoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366F1, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: '#fff',
        }}>{!user?.photoUrl && user?.name?.[0]?.toUpperCase()}</button>
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setView('profile')}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>Guru · {kelasDiampu.join(', ') || 'Belum ada kelas diampu'}</div>
        </div>
        <button onClick={onPlayGames} title="Main sebagai Media Ajar" style={{
          background: 'rgba(52,211,153,0.15)', border: 'none', color: '#34D399',
          borderRadius: 20, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        }}>🎮 Media Ajar</button>
        <button onClick={logout} title="Keluar" style={{
          background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8',
          width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 15,
        }}>⏻</button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: '0 0 auto', padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap',
            background: tab === t.id ? '#1E2128' : 'transparent',
            color: tab === t.id ? '#34D399' : '#6B7280',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 'tugas'   && <TugasTab kelasDiampu={kelasDiampu} />}
        {tab === 'hafalan' && <GuruHafalanScreen />}
        {tab === 'nilai'   && <NilaiTab />}
        {tab === 'siswa'   && <SiswaTab />}
        {tab === 'kunci'   && <KunciTab grades={grades} />}
        {tab === 'insight' && <InsightTab />}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#0F1115', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '11px 12px', color: '#fff', fontSize: 13,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

function submitBtnStyle(loading) {
  return {
    marginTop: 4, background: loading ? '#166534' : 'linear-gradient(135deg,#22C55E,#16A34A)',
    color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0',
    fontSize: 14, fontWeight: 800, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
  }
}

const smallBtnStyle = {
  background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', borderRadius: 8,
  padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
}
