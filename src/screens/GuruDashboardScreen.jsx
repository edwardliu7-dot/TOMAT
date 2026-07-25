import React, { useState, useEffect, useCallback, useRef } from 'react'
import { connectSocket, getSocket } from '../socket'
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
  MessageNotificationBell, AppNotificationBell, PublicProfileModal, UserAvatar, usePublicProfile,
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
  { id: 'raid',      label: '⚔️', text: 'Boss Raid' },
  { id: 'turnamen',  label: '🏆', text: 'Turnamen' },
  { id: 'insight',   label: '🎮', text: 'Insight' },
]

function Section({ children, style = {} }) {
  return (
    <div style={{
      background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
      padding: 16, ...style
    }}>{children}</div>
  )
}

function EditTugasModal({ tugas, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: tugas.type,
    totalQuestions: tugas.total_questions,
    dueAt: tugas.due_at ? tugas.due_at.slice(0, 10) : '',
    difficulty: tugas.difficulty || 'medium',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { tugas: updated } = await apiCall(`/api/guru/tugas/${tugas.id}`, {
        method: 'PATCH',
        body: {
          type: form.type,
          totalQuestions: form.totalQuestions,
          dueAt: form.dueAt || null,
          difficulty: form.difficulty,
        },
      })
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
        width: '100%', maxWidth: 400, overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,#F59E0B,#EF4444)' }} />
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>{tugas.game_emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{tugas.game_name}</div>
              <div style={{ fontSize: 11, color: '#67E8F9' }}>{tugas.kelas}</div>
            </div>
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', color: '#94A3B8',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 0',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Batal</button>
              <button type="submit" disabled={saving} style={{
                flex: 2, background: saving ? '#92400E' : 'linear-gradient(135deg,#F59E0B,#D97706)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0',
                fontSize: 13, fontWeight: 800, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>✏️ {saving ? 'Menyimpan…' : 'Simpan Perubahan'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
  const [editingTugas, setEditingTugas] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

  const handleSaved = (updated) => {
    setTugasList(list => list.map(t => t.id === updated.id ? updated : t))
    setEditingTugas(null)
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await apiCall(`/api/guru/tugas/${confirmDeleteId}`, { method: 'DELETE' })
      setTugasList(list => list.filter(t => t.id !== confirmDeleteId))
      setConfirmDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const confirmTarget = tugasList.find(t => t.id === confirmDeleteId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Edit modal */}
      {editingTugas && (
        <EditTugasModal
          tugas={editingTugas}
          onClose={() => setEditingTugas(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && confirmTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => !deleting && setConfirmDeleteId(null)}>
          <div style={{
            background: '#111827', borderRadius: 20, border: '1px solid rgba(239,68,68,0.3)',
            width: '100%', maxWidth: 360, padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Hapus Tugas?</div>
            <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 4 }}>
              {confirmTarget.game_emoji} <strong style={{ color: '#fff' }}>{confirmTarget.game_name}</strong> · {confirmTarget.kelas}
            </div>
            <div style={{ fontSize: 11, color: '#EF4444', textAlign: 'center', marginBottom: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: '8px 12px', marginTop: 8 }}>
              Semua nilai siswa untuk tugas ini ikut terhapus dan tidak bisa dipulihkan.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDeleteId(null)} disabled={deleting} style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', color: '#94A3B8',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 0',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 2, background: deleting ? '#7F1D1D' : 'linear-gradient(135deg,#EF4444,#DC2626)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0',
                fontSize: 13, fontWeight: 800, cursor: deleting ? 'default' : 'pointer', fontFamily: 'inherit',
              }}>🗑️ {deleting ? 'Menghapus…' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}

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
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => closeTugas(t.id, t.status === 'active' ? 'closed' : 'active')} style={{
                          background: isActive ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                          color: isActive ? '#F87171' : '#34D399',
                          border: `1px solid ${isActive ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
                          borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}>
                          {isActive ? 'Tutup' : 'Buka'}
                        </button>
                        <button onClick={() => setEditingTugas(t)} title="Edit tugas" style={{
                          background: 'rgba(245,158,11,0.12)', color: '#FBBF24',
                          border: '1px solid rgba(245,158,11,0.25)',
                          borderRadius: 8, padding: '4px 8px', fontSize: 13, cursor: 'pointer', lineHeight: 1,
                        }}>✏️</button>
                        <button onClick={() => setConfirmDeleteId(t.id)} title="Hapus tugas" style={{
                          background: 'rgba(239,68,68,0.12)', color: '#F87171',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 8, padding: '4px 8px', fontSize: 13, cursor: 'pointer', lineHeight: 1,
                        }}>🗑️</button>
                      </div>
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
                   {s.is_test_account && <div style={{ fontSize: 9, color: '#FBBF24', fontWeight: 800, letterSpacing: .8, marginTop: 3 }}>AKUN DEMO · FULL CATALOG</div>}
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
                   {s.is_test_account && <div style={{ fontSize: 9, color: '#FBBF24', fontWeight: 800, letterSpacing: .8, marginTop: 3 }}>AKUN DEMO · SEMUA ITEM TERSEDIA</div>}
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

// ── Boss Raid Tab ─────────────────────────────────────────────────────────────
const BOSS_EMOJIS = ['👹', '🐲', '👾', '🤖', '🦂', '👻', '💀', '🧟', '🐉', '🦖']

function RaidTab({ kelasDiampu }) {
  const [raids,     setRaids]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [creating,  setCreating]  = useState(false)
  const [ending,    setEnding]    = useState(null)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({
    kelas:     kelasDiampu[0] || '',
    maxHp:     1000,
    bossName:  'Boss Matematika',
    bossEmoji: '👹',
  })

  const refresh = useCallback(async () => {
    try {
      const data = await apiCall('/api/guru/boss-raid')
      setRaids(data.raids || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Poll every 8s for live HP updates
  useEffect(() => {
    const t = setInterval(refresh, 8_000)
    return () => clearInterval(t)
  }, [refresh])

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await apiCall('/api/guru/boss-raid', {
        method: 'POST',
        body: { kelas: form.kelas, maxHp: Number(form.maxHp), bossName: form.bossName, bossEmoji: form.bossEmoji },
      })
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const end = async (kelas) => {
    setEnding(kelas)
    setError('')
    try {
      await apiCall(`/api/guru/boss-raid/${encodeURIComponent(kelas)}`, { method: 'DELETE' })
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setEnding(null)
    }
  }

  const activeKelas = raids.map(r => r.kelas)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Active raids */}
      {raids.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>🔴 RAID SEDANG AKTIF</div>
          {raids.map(r => {
            const pct   = Math.round((r.hp / r.maxHp) * 100)
            const hpClr = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
            return (
              <div key={r.kelas} style={{
                background: '#0D1117', borderRadius: 14, marginBottom: 10,
                border: '1px solid rgba(239,68,68,0.3)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 32 }}>{r.bossEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{r.bossName}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Kelas {r.kelas} · {r.participants?.length || 0} peserta aktif</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: hpClr, textAlign: 'right' }}>
                    {r.hp.toLocaleString()}<br/>
                    <span style={{ fontSize: 10, color: '#475569', fontWeight: 400 }}>/ {r.maxHp.toLocaleString()} HP</span>
                  </div>
                </div>

                {/* HP bar */}
                <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: hpClr, borderRadius: 8, transition: 'width 0.5s ease' }} />
                </div>

                {/* Top attacker preview */}
                {r.participants?.length > 0 && (
                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>
                    🏆 Top: {r.participants[0].name} ({r.participants[0].damage} damage)
                  </div>
                )}

                <button
                  onClick={() => end(r.kelas)}
                  disabled={ending === r.kelas}
                  style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                    color: '#f87171', borderRadius: 8, padding: '7px 16px',
                    fontSize: 12, fontWeight: 700, cursor: ending === r.kelas ? 'default' : 'pointer',
                    opacity: ending === r.kelas ? 0.6 : 1,
                  }}
                >
                  {ending === r.kelas ? '…' : '⏹ Akhiri Raid'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Create form */}
      <div style={{ background: '#111827', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#ef4444,#f59e0b)' }} />
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.8)' }} />
            Mulai Boss Raid Baru
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14, lineHeight: 1.6 }}>
            Siswa sekelasmu bersatu mengalahkan satu bos bersama. Setiap jawaban benar = -100 HP Bos.
          </div>

          <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
              <div>
                <div style={labelStyle}>Kelas</div>
                <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} style={inputStyle}>
                  {kelasDiampu.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>Nama Boss</div>
                <input
                  value={form.bossName}
                  onChange={e => setForm(f => ({ ...f, bossName: e.target.value }))}
                  maxLength={40} placeholder="Boss Matematika"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={labelStyle}>Total HP Boss</div>
                <select value={form.maxHp} onChange={e => setForm(f => ({ ...f, maxHp: e.target.value }))} style={inputStyle}>
                  <option value={500}>500 HP — Mudah</option>
                  <option value={1000}>1.000 HP — Normal</option>
                  <option value={2000}>2.000 HP — Sulit</option>
                  <option value={5000}>5.000 HP — Legenda</option>
                </select>
              </div>
              <div>
                <div style={labelStyle}>Emoji Boss</div>
                <select value={form.bossEmoji} onChange={e => setForm(f => ({ ...f, bossEmoji: e.target.value }))} style={inputStyle}>
                  {BOSS_EMOJIS.map(em => <option key={em} value={em}>{em} {em}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '8px 12px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={creating || !form.kelas || activeKelas.includes(form.kelas)}
              style={{
                marginTop: 4,
                background: (creating || !form.kelas || activeKelas.includes(form.kelas))
                  ? 'rgba(239,68,68,0.1)'
                  : 'linear-gradient(135deg,#ef4444,#b91c1c)',
                color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
                fontSize: 14, fontWeight: 800, cursor: (creating || activeKelas.includes(form.kelas)) ? 'default' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (creating || !form.kelas || activeKelas.includes(form.kelas)) ? 0.5 : 1,
                boxShadow: (creating || activeKelas.includes(form.kelas)) ? 'none' : '0 0 20px rgba(239,68,68,0.25)',
              }}
            >
              {creating
                ? '⏳ Memulai…'
                : activeKelas.includes(form.kelas)
                  ? `⚔️ Raid sudah aktif di ${form.kelas}`
                  : `⚔️ Mulai Raid untuk ${form.kelas || '…'}`}
            </button>
          </form>
        </div>
      </div>

      {loading && !raids.length && (
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13, paddingTop: 8 }}>Memuat…</div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TURNAMEN TAB
// ══════════════════════════════════════════════════════════════════════════════
const TOURNAMENT_GAMES = [
  // ── Kelas 7 BAB I ───────────────────────────────────────────────────────────
  { key: 'katak',          label: '🐸 Katak Pelompat',              desc: 'Bilangan bulat, garis bilangan' },
  { key: 'termometer',     label: '🌡️ Termometer',                  desc: 'Penjumlahan/pengurangan bilangan bulat' },
  { key: 'pabrikrobot',    label: '🤖 Pabrik Robot',                desc: 'Perkalian bilangan bulat' },
  { key: 'gembok',         label: '⚙️ Gembok Roda Gigi',            desc: 'FPB' },
  { key: 'mercusuar',      label: '🏮 Mercusuar',                    desc: 'KPK' },
  { key: 'sporajamur',     label: '🍄 Spora Jamur',                  desc: 'Pangkat bilangan bulat positif' },
  { key: 'scanner',        label: '💎 Scanner Permata',              desc: 'Hitung bilangan prima dari daftar' },
  // ── Kelas 8 BAB I ───────────────────────────────────────────────────────────
  { key: 'g8selramuan',    label: '🧪 Penggandaan Sel Ramuan',       desc: 'Pangkat bulat positif (b^e)' },
  { key: 'g8racunminiatur',label: '☠️ Ekstraksi Racun Miniatur',     desc: 'Pertumbuhan eksponensial (p₀ × bⁿ)' },
  { key: 'g8kristal',      label: '💎 Pemisahan Elemen Kristal',     desc: 'Akar kuadrat & akar pangkat tiga' },
  { key: 'g8fusienergi',   label: '⚗️ Fusi Energi Alkemis',         desc: 'Pangkat pecahan (b^(p/q))' },
  { key: 'g8mantraakar',   label: '✨ Penyederhanaan Mantra Akar',   desc: 'Menyederhanakan bentuk akar (√a + √b)' },
  { key: 'g8geolog',       label: '⛏️ Ekspedisi Geolog Kerajaan',    desc: 'Pertumbuhan berlapis (p₀ × bⁿ)' },
]

const MATCH_STATUS_BADGE = {
  finished:       { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', label: '✅ Selesai' },
  'in-progress':  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: '⚡ Berlangsung' },
  'waiting-join': { bg: 'rgba(103,232,249,0.12)', color: '#67E8F9', label: '⏳ Menunggu' },
  walkover:       { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', label: '⏩ Walkover' },
  bye:            { bg: 'rgba(52,211,153,0.12)',  color: '#34D399', label: '🟢 BYE' },
  pending:        { bg: 'rgba(255,255,255,0.06)', color: '#475569', label: '🔒 Menunggu' },
}

function TurnamenTab({ kelasDiampu }) {
  const [tournament,   setTournament]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [error,        setError]        = useState('')
  const [spectate,       setSpectate]       = useState(null)  // match being spectated
  const [spectateSliders,setSpectateSliders] = useState({})    // { [userId]: number }
  const [spectateQ,      setSpectateQ]       = useState(null)  // { round, maxRounds, text }
  const [form,         setForm]         = useState({ kelas: kelasDiampu[0] || '', gameKey: 'katak' })
  const socketJoined   = useRef(false)

  // Fetch current tournament state via REST on mount
  useEffect(() => {
    apiCall('/api/guru/tournament').then(d => {
      setTournament(d.tournaments?.[0] || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Connect socket for live updates (guru needs socket for real-time bracket)
  useEffect(() => {
    const socket = connectSocket()

    socket.on('tournament:state', (state) => {
      setTournament(state)
    })
    socket.on('tournament:round-start', ({ state }) => {
      if (state) setTournament(state)
    })
    socket.on('tournament:finished', ({ state }) => {
      if (state) setTournament(state)
    })
    socket.on('tournament:cancelled', () => {
      setTournament(null)
    })
    socket.on('tournament:player-answered', (data) => {
      if (spectate?.id === data.matchId) {
        setSpectate(s => s ? { ...s, scores: data.scores } : s)
      }
    })

    return () => {
      socket.off('tournament:state')
      socket.off('tournament:round-start')
      socket.off('tournament:finished')
      socket.off('tournament:cancelled')
      socket.off('tournament:player-answered')
    }
  }, [spectate])

  // When we have a tournament, join its socket room for live updates
  useEffect(() => {
    if (!tournament?.id || socketJoined.current === tournament.id) return
    socketJoined.current = tournament.id
    const socket = getSocket()
    socket?.emit('tournament:spectate', { tournamentId: tournament.id })
  }, [tournament?.id])

  // Spectate-match socket events — sliders + question (resets when spectate changes)
  useEffect(() => {
    if (!spectate) {
      setSpectateSliders({})
      setSpectateQ(null)
      return
    }
    const socket = getSocket()
    if (!socket) return

    const onSlider = ({ userId, value }) => {
      setSpectateSliders(s => ({ ...s, [String(userId)]: value }))
    }
    const onQuestion = ({ question, round, maxRounds }) => {
      const text = question?.question?.text || question?.text || ''
      setSpectateQ({ round, maxRounds, text })
      setSpectateSliders({})  // reset slider positions for new question
    }

    socket.on('tournament:opponent-slider', onSlider)
    socket.on('tournament:question', onQuestion)

    return () => {
      socket.off('tournament:opponent-slider', onSlider)
      socket.off('tournament:question', onQuestion)
    }
  }, [spectate?.id])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.kelas || !form.gameKey) return
    setCreating(true)
    setError('')
    try {
      const data = await apiCall('/api/guru/tournament', { method: 'POST', body: form })
      setTournament(data.tournament)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleEnd = async () => {
    if (!tournament) return
    try {
      await apiCall(`/api/guru/tournament/${tournament.id}`, { method: 'DELETE' })
      setTournament(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const openSpectate = (match) => {
    if (!match?.id) return
    setSpectate(match)
    getSocket()?.emit('tournament:spectate-match', { matchId: match.id })
  }

  const inputS = {
    width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '11px 12px', color: '#fff', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
  const labelS = { fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13, paddingTop: 16 }}>Memuat…</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!tournament ? (
        // ── Setup Form ──────────────────────────────────────────────────────
        <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5, marginBottom: 12 }}>⚔️ MULAI TURNAMEN BARU</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Kelas */}
            <div>
              <div style={labelS}>Kelas</div>
              <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} style={inputS}>
                <option value="">Pilih kelas…</option>
                {kelasDiampu.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            {/* Game */}
            <div>
              <div style={labelS}>Game Turnamen</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TOURNAMENT_GAMES.map(g => (
                  <label key={g.key} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: form.gameKey === g.key ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${form.gameKey === g.key ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12, cursor: 'pointer',
                  }}>
                    <input type="radio" name="gameKey" value={g.key} checked={form.gameKey === g.key}
                      onChange={e => setForm(f => ({ ...f, gameKey: e.target.value }))}
                      style={{ accentColor: '#f59e0b' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{g.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '8px 12px' }}>{error}</div>
            )}

            <button type="submit" disabled={creating || !form.kelas} style={{
              background: creating || !form.kelas ? 'rgba(245,158,11,0.1)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
              fontSize: 14, fontWeight: 800, cursor: creating || !form.kelas ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: creating || !form.kelas ? 0.5 : 1,
              boxShadow: !creating && form.kelas ? '0 0 20px rgba(245,158,11,0.25)' : 'none',
            }}>
              {creating ? '⏳ Memulai…' : `🏆 Mulai Turnamen untuk ${form.kelas || '…'}`}
            </button>
          </form>
        </div>
      ) : (
        // ── Bracket View ─────────────────────────────────────────────────────
        <>
          {/* Tournament info */}
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5 }}>🏆 TURNAMEN AKTIF</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {TOURNAMENT_GAMES.find(g => g.key === tournament.gameKey)?.label || tournament.gameKey}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  {tournament.kelas} · Ronde {tournament.currentRound}
                  {tournament.status === 'finished' && ' · SELESAI'}
                </div>
              </div>
              {tournament.status !== 'finished' && (
                <button onClick={handleEnd} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '8px 14px', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🛑 Akhiri
                </button>
              )}
            </div>
            {tournament.champion && (
              <div style={{ marginTop: 12, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800 }}>JUARA TURNAMEN</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{tournament.champion.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Bracket rounds */}
          {tournament.rounds?.map((round, ri) => (
            <div key={ri} style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                RONDE {ri + 1}{ri + 1 === tournament.currentRound && tournament.status !== 'finished' ? ' (BERLANGSUNG)' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {round.matches.map((m, mi) => {
                  const badge = MATCH_STATUS_BADGE[m.status] || MATCH_STATUS_BADGE.pending
                  return (
                    <div key={mi} style={{
                      background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          {[m.player1, m.player2].filter(Boolean).map((p, pi) => (
                            <div key={pi}>
                              {pi === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '5px 0' }} />}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, fontWeight: m.winner?.userId === p.userId ? 800 : 500, color: m.winner && m.winner.userId !== p.userId ? '#475569' : '#94A3B8' }}>
                                  {m.winner?.userId === p.userId ? '🏅 ' : ''}{p.name}
                                </span>
                                {m.scores?.[p.userId] !== undefined && (
                                  <span style={{ fontSize: 12, fontWeight: 800, color: pi === 0 ? '#67E8F9' : '#f59e0b' }}>{m.scores[p.userId]}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{badge.label}</span>
                          {m.status === 'in-progress' && (
                            <button onClick={() => openSpectate(m)} style={{
                              background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)',
                              borderRadius: 8, padding: '4px 8px', color: '#67E8F9', fontSize: 10, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}>👁 Pantau</button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Spectator bottom sheet */}
      {spectate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setSpectate(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 480, margin: '0 auto',
            background: '#1A1D27', border: '1.5px solid rgba(103,232,249,0.3)',
            borderRadius: '24px 24px 0 0', padding: '24px 20px 32px',
          }}>
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 4, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: '#67E8F9', marginBottom: 12 }}>
              👁 Pantau Match
            </div>
            {/* Player cards side-by-side */}
            {spectate.player1 && spectate.player2 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[
                  { p: spectate.player1, color: '#67E8F9', emoji: '🐸' },
                  { p: spectate.player2, color: '#f59e0b', emoji: '🔥' },
                ].map(({ p, color, emoji }) => {
                  const score = spectate.scores?.[p.userId] ?? 0
                  const sliderVal = spectateSliders[String(p.userId)] ?? 0
                  // slider range for katak is -20 to 20 (range of 40)
                  const sliderPct = Math.max(0, Math.min(100, ((sliderVal + 20) / 40) * 100))
                  return (
                    <div key={p.userId} style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${color}33`, borderRadius: 14, padding: '12px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 11, color, fontWeight: 700, marginBottom: 4 }}>{emoji} {p.name}</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color }}>{score}</div>
                      <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>soal benar</div>
                      {/* Real-time slider */}
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Slider saat ini</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color }}>{sliderVal}</div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${sliderPct}%`, background: color, borderRadius: 4, transition: 'width 0.1s' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Round indicator */}
            {spectateQ ? (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10,
                }}>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Soal saat ini</span>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {Array.from({ length: spectateQ.maxRounds }, (_, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < spectateQ.round - 1 ? '#10b981' : i === spectateQ.round - 1 ? '#67E8F9' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#67E8F9' }}>{spectateQ.round}/{spectateQ.maxRounds}</span>
                </div>
                {spectateQ.text && (
                  <div style={{ padding: '8px 12px', background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.15)', borderRadius: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700 }}>ℹ️ {spectateQ.text}</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 14 }}>
                Skor & slider diperbarui real-time saat siswa bermain
              </div>
            )}

            <button onClick={() => setSpectate(null)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', color: '#94A3B8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕ Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GuruDashboardScreen({ onPlayGames }) {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('tugas')
  const [view, setView] = useState('dashboard')
  const [komunikasiTarget, setKomunikasiTarget] = useState(null)
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

            <MessageNotificationBell onClick={target => { setKomunikasiTarget(target || null); setTab('komunikasi') }} suppress={tab === 'komunikasi'} />
            <AppNotificationBell onCommunicationClick={target => { setKomunikasiTarget(target || null); setTab('komunikasi') }} />

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

        <div style={{ padding: 16, maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {tab === 'tugas'   && <TugasTab kelasDiampu={kelasDiampu} />}
          {tab === 'hafalan' && <GuruHafalanScreen />}
          {tab === 'nilai'   && <NilaiTab onProfileClick={publicProfile.openProfile} />}
          {tab === 'komunikasi' && <CommunicationScreen embedded initialTarget={komunikasiTarget} />}
          {tab === 'siswa'   && <SiswaTab onProfileClick={publicProfile.openProfile} />}
          {tab === 'kunci'   && <KunciTab grades={grades} />}
          {tab === 'raid'     && <RaidTab kelasDiampu={kelasDiampu} />}
          {tab === 'turnamen' && <TurnamenTab kelasDiampu={kelasDiampu} />}
          {tab === 'insight'  && <InsightTab onProfileClick={publicProfile.openProfile} />}
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
