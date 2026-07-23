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
import CommunicationScreen from './CommunicationScreen'
import {
  MessageNotificationBell, PublicProfileModal, UserAvatar, usePublicProfile,
} from '../components/shared'

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
  { id: 'tugas',   label: '📋', text: 'Tugas' },
  { id: 'hafalan', label: '🧮', text: 'Hafalan' },
  { id: 'nilai',   label: '📊', text: 'Nilai' },
  { id: 'komunikasi', label: '💬', text: 'Chat' },
  { id: 'siswa',   label: '👥', text: 'Siswa' },
  { id: 'kunci',   label: '🔒', text: 'Kunci Bab' },
  { id: 'insight', label: '🎮', text: 'Insight' },
]

function Section({ children, style = {} }) {
  return (
    <div style={{
      background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
      padding: 16, ...style
    }}>{children}</div>
  )
}

function TugasTab({ kelasDiampu }) {
  const [tugasList, setTugasList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const initialKelas = kelasDiampu[0] || ''
  const initialGrade = kelasToGrade(initialKelas)
  const initialGames = GAMES_CATALOG.filter(g => initialGrade ? g.grade <= initialGrade : false)
  const [form, setForm] = useState({ kelas: initialKelas, gameKey: initialGames[0]?.key || '', type: 'harian', totalQuestions: 5, dueAt: '', difficulty: 'medium' })
  const [submitting, setSubmitting] = useState(false)

  const classGrade = kelasToGrade(form.kelas)
  const availableGames = GAMES_CATALOG.filter(g => classGrade ? g.grade <= classGrade : false)

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
          kelas: form.kelas, gameKey: form.gameKey, gameName: game?.name,
          gameEmoji: game?.emoji, bab: game?.bab, type: form.type,
          totalQuestions: form.totalQuestions, dueAt: form.dueAt || null,
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
      {/* New task form */}
      <div style={{ background: '#111827', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }} />
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 8px rgba(6,182,212,0.8)' }} />
            Tetapkan Tugas Baru
          </div>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <div>
                <div style={labelStyle}>Kelas</div>
                <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} style={inputStyle}>
                  {kelasDiampu.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <div style={{ ...labelStyle, color: '#06B6D4' }}>Game Modul</div>
                <select value={form.gameKey} onChange={e => setForm(f => ({ ...f, gameKey: e.target.value }))} style={{ ...inputStyle, borderColor: 'rgba(6,182,212,0.35)' }}>
                  {availableGames.length === 0 && <option value="">Tidak ada game untuk kelas ini</option>}
                  {[9, 8, 7].filter(gr => gr <= (classGrade || 0)).map(gr => {
                    const gradeGames = availableGames.filter(g => g.grade === gr)
                    if (gradeGames.length === 0) return null
                    return (
                      <optgroup key={gr} label={`Kelas ${gr === 7 ? 'VII' : gr === 8 ? 'VIII' : 'IX'}`}>
                        {gradeGames.map(g => <option key={g.key} value={g.key}>{g.emoji} {g.name} ({GRADE_BAB_LABELS[g.grade]?.[g.bab] || g.bab})</option>)}
                      </optgroup>
                    )
                  })}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={labelStyle}>Penilaian</div>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                  <option value="harian">Harian</option>
                  <option value="formatif">Formatif</option>
                  <option value="sumatif">Sumatif</option>
                </select>
              </div>
              <div>
                <div style={labelStyle}>Jml Soal</div>
                <input type="number" min={1} value={form.totalQuestions}
                  onChange={e => setForm(f => ({ ...f, totalQuestions: e.target.value }))}
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={labelStyle}>Kesulitan</div>
                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inputStyle}>
                  {DIFFICULTY_LEVELS.map(level => <option key={level} value={level}>{DIFFICULTY_LABELS[level]}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>Tenggat</div>
                <input type="date" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            {error && <div style={{ color: '#fca5a5', fontSize: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '8px 12px' }}>{error}</div>}
            <button type="submit" disabled={submitting || kelasDiampu.length === 0} style={{
              marginTop: 4, background: submitting ? '#065f46' : 'linear-gradient(135deg,#10B981,#059669)',
              color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
              fontSize: 14, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 20px rgba(16,185,129,0.3)',
            }}>
              ▶ {submitting ? 'Menyimpan…' : 'Tetapkan Tugas'}
            </button>
          </form>
        </div>
      </div>

      {/* Task list */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>
          Daftar Tugas <span style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', fontSize: 11, padding: '1px 8px', borderRadius: 20, marginLeft: 6 }}>{tugasList.length}</span>
        </div>
        {loading ? (
          <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
        ) : tugasList.length === 0 ? (
          <div style={{ color: '#374151', fontSize: 13 }}>Belum ada tugas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tugasList.map(t => {
              const isActive = t.status === 'active'
              const color = TYPE_COLORS[t.type]
              return (
                <div key={t.id} style={{
                  background: '#111827', borderRadius: 16, border: `1px solid ${isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                  overflow: 'hidden', display: 'flex', opacity: isActive ? 1 : 0.65,
                }}>
                  <div style={{ width: 4, flexShrink: 0, background: isActive ? '#10B981' : '#374151', boxShadow: isActive ? '0 0 8px rgba(16,185,129,0.6)' : 'none' }} />
                  <div style={{ padding: '12px 14px', flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 22 }}>{t.game_emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.game_name}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ color: '#67E8F9', fontWeight: 700, background: 'rgba(103,232,249,0.1)', padding: '1px 7px', borderRadius: 8 }}>{t.kelas}</span>
                        <span>{TYPE_ICONS[t.type]} {TYPE_LABELS[t.type]}</span>
                        <span>{t.total_questions} soal</span>
                        {t.due_at && <span>Tenggat {t.due_at}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#34D399' : '#64748B',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{isActive ? 'Aktif' : 'Ditutup'}</span>
                      <button onClick={() => closeTugas(t.id, t.status === 'active' ? 'closed' : 'active')} style={{
                        background: isActive ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                        color: isActive ? '#F87171' : '#34D399',
                        border: `1px solid ${isActive ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
                        borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>
                        {isActive ? 'Tutup' : 'Buka'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function NilaiTab({ onProfileClick }) {
  const [nilaiList, setNilaiList] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiCall('/api/guru/nilai').then(({ nilai }) => setNilaiList(nilai)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (nilaiList.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada nilai yang terkumpul.</div>

  const avg = Math.round(nilaiList.reduce((s, n) => s + n.score, 0) / nilaiList.length)
  const avgColor = avg >= 90 ? '#34D399' : avg >= 75 ? '#67E8F9' : avg >= 60 ? '#FBBF24' : '#F87171'

  // Keep each assignment separate by its database id. A teacher may assign
  // the same game more than once, so grouping only by game name would merge
  // different assignments together.
  const kelasGroups = new Map()
  for (const nilai of nilaiList) {
    if (!kelasGroups.has(nilai.kelas)) kelasGroups.set(nilai.kelas, new Map())
    const tugasGroups = kelasGroups.get(nilai.kelas)
    if (!tugasGroups.has(nilai.tugas_id)) {
      tugasGroups.set(nilai.tugas_id, {
        id: nilai.tugas_id,
        gameName: nilai.game_name,
        gameEmoji: nilai.game_emoji,
        type: nilai.type,
        dueAt: nilai.due_at,
        nilai: [],
      })
    }
    tugasGroups.get(nilai.tugas_id).nilai.push(nilai)
  }

  const scoreColor = score => score >= 90 ? '#34D399' : score >= 75 ? '#67E8F9' : score >= 60 ? '#FBBF24' : '#F87171'
  const formatDate = value => value
    ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: '#111827', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: avgColor, lineHeight: 1 }}>{avg}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Rata-rata dari {nilaiList.length} nilai terkumpul</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[...kelasGroups.entries()].map(([kelas, tugasGroups]) => {
          const kelasNilai = [...tugasGroups.values()].flatMap(tugas => tugas.nilai)
          const kelasAverage = Math.round(kelasNilai.reduce((sum, nilai) => sum + nilai.score, 0) / kelasNilai.length)
          return (
            <div key={kelas} style={{
              background: 'rgba(15,23,42,0.68)', border: '1px solid rgba(103,232,249,0.18)',
              borderRadius: 18, padding: 12,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 11, background: 'rgba(103,232,249,0.14)',
                  color: '#67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>🏫</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>Kelas {kelas}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {kelasNilai.length} nilai · {tugasGroups.size} tugas
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(kelasAverage) }}>{kelasAverage}</div>
                  <div style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 }}>Rata-rata</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {[...tugasGroups.values()].map(tugas => {
                  const tugasAverage = Math.round(tugas.nilai.reduce((sum, nilai) => sum + nilai.score, 0) / tugas.nilai.length)
                  return (
                    <div key={tugas.id} style={{
                      background: '#111827', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px',
                        background: 'rgba(255,255,255,0.025)',
                      }}>
                        <div style={{ fontSize: 24, flexShrink: 0 }}>{tugas.gameEmoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{tugas.gameName}</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                            <span style={{
                              background: `${TYPE_COLORS[tugas.type]}18`, color: TYPE_COLORS[tugas.type],
                              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            }}>
                              {TYPE_ICONS[tugas.type]} {TYPE_LABELS[tugas.type]}
                            </span>
                            <span style={{ color: '#64748B', fontSize: 10 }}>
                              {tugas.nilai.length} siswa mengumpulkan
                            </span>
                            {tugas.dueAt && (
                              <span style={{ color: '#64748B', fontSize: 10 }}>
                                Tenggat {formatDate(tugas.dueAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(tugasAverage) }}>{tugasAverage}</div>
                          <div style={{ fontSize: 9, color: '#64748B' }}>RATA-RATA</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px 10px' }}>
                        {tugas.nilai.map(n => (
                          <div key={n.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(255,255,255,0.035)', borderRadius: 10, padding: '9px 10px',
                          }}>
                             <UserAvatar
                               user={{ id: n.student_id, role: 'siswa', name: n.student_name, photoUrl: n.student_photo_url, equippedBingkai: n.student_equipped_bingkai }}
                               size={34}
                               onClick={() => onProfileClick({ id: n.student_id, role: 'siswa', name: n.student_name })}
                             />
                            <div style={{ flex: 1, minWidth: 0 }}>
                               <button onClick={() => onProfileClick({ id: n.student_id, role: 'siswa', name: n.student_name })} style={{
                                 border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                                 color: '#fff', fontFamily: 'inherit', textAlign: 'left',
                                 fontSize: 12, fontWeight: 700, maxWidth: '100%',
                                 overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                               }}>
                                {n.student_name}
                                <span style={{ color: '#64748B', fontWeight: 400, marginLeft: 5 }}>({n.student_username})</span>
                               </button>
                              <div style={{ fontSize: 10, color: '#64748B', marginTop: 3 }}>
                                {n.correct_count}/{n.total_questions} soal
                              </div>
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor(n.score) }}>{n.score}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SiswaTab({ onProfileClick }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiCall('/api/guru/students').then(({ students }) => setStudents(students)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (students.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>
  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{kelas} ({list.length} siswa)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(s => (
              <Section key={s.id} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar
                  user={{ ...s, role: 'siswa' }}
                  size={38}
                  onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })}
                />
                <button onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })} style={{
                  flex: 1, minWidth: 0, border: 'none', background: 'none', padding: 0,
                  color: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.username}</div>
                </button>
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
    } catch (err) { setError(err.message) }
  }
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>}
      {grades.length === 0 && <div style={{ color: '#374151', fontSize: 13 }}>Anda belum mengampu kelas manapun.</div>}
      {grades.map(grade => (
        <div key={grade}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#A78BFA', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Kelas {grade}</div>
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
          background: i === values.length - 1 && v > 0 ? '#34D399' : v > 0 ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.07)',
        }} />
      ))}
    </div>
  )
}

function InsightTab({ onProfileClick }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    apiCall('/api/guru/insight').then(({ students }) => setStudents(students)).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (error) return <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>
  if (students.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>
  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 12, color: '#374151' }}>Aktivitas 7 hari terakhir, level, koin, dan lencana.</div>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{kelas} ({list.length} siswa)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map(s => (
              <Section key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserAvatar
                  user={{ ...s, role: 'siswa' }}
                  size={38}
                  onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })} style={{
                    border: 'none', background: 'none', padding: 0, color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex',
                    alignItems: 'center', gap: 6, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</span>
                    {s.activeToday && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />}
                  </button>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    ⭐ Lv {s.level} · 📚 {s.exp} EXP · 🪙 {s.coins} · 🏅 {s.badgeCount} · 🔥 {s.bestSurvivalStreak}
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
  const publicProfile = usePublicProfile()
  const kelasDiampu = user?.kelas || []
  const grades = [...new Set(kelasDiampu.map(kelasToGrade).filter(Boolean))].sort()

  if (view === 'profile') {
    return <ProfileScreen goBack={() => setView('dashboard')} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B14', position: 'relative' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '45%', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(10,11,20,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={() => setView('profile')} style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0, padding: 0,
            border: '2px solid rgba(139,92,246,0.4)', cursor: 'pointer',
            background: user?.photoUrl ? `url(${user.photoUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 14px rgba(139,92,246,0.3)',
          }}>{!user?.photoUrl && user?.name?.[0]?.toUpperCase()}</button>

          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setView('profile')}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>
              Guru · {kelasDiampu.join(', ') || 'Belum ada kelas diampu'}
            </div>
          </div>

           <MessageNotificationBell onClick={() => setTab('komunikasi')} />

           <button onClick={onPlayGames} style={{
            background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
            color: '#34D399', borderRadius: 20, padding: '8px 14px', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}>🎮 Media Ajar</button>

          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748B', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⏻</button>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 4, padding: '12px 16px 0', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: '0 0 auto', padding: '8px 14px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                background: active ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: active ? '#34D399' : '#4B5563',
                borderBottom: active ? '2px solid #34D399' : '2px solid transparent',
                marginBottom: -1,
                boxShadow: active ? '0 0 12px rgba(52,211,153,0.15)' : 'none',
              }}>
                {t.label} {t.text}
              </button>
            )
          })}
        </div>

        <div style={{ padding: 16 }}>
          {tab === 'tugas'   && <TugasTab kelasDiampu={kelasDiampu} />}
          {tab === 'hafalan' && <GuruHafalanScreen />}
          {tab === 'nilai'   && <NilaiTab onProfileClick={publicProfile.openProfile} />}
          {tab === 'komunikasi' && <CommunicationScreen embedded />}
          {tab === 'siswa'   && <SiswaTab onProfileClick={publicProfile.openProfile} />}
          {tab === 'kunci'   && <KunciTab grades={grades} />}
          {tab === 'insight' && <InsightTab onProfileClick={publicProfile.openProfile} />}
        </div>
        <PublicProfileModal
          profile={publicProfile.profile}
          loading={publicProfile.loading}
          error={publicProfile.error}
          onClose={publicProfile.closeProfile}
        />
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '11px 12px', color: '#fff', fontSize: 13,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 1.5,
  textTransform: 'uppercase', marginBottom: 5,
}
