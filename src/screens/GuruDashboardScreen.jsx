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
import PublicProfileScreen from './PublicProfileScreen'
import CommunicationScreen from './CommunicationScreen'
import {
  MessageNotificationBell, AppNotificationBell, PublicProfileModal, UserAvatar, usePublicProfile, fetchPublicProfile, normalizeProfileTarget,
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
  { id: 'home',    label: '🏠', text: 'Beranda' },
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
    kelas:        kelasDiampu[0] || '',
    maxHp:        1000,
    bossName:     'Boss Matematika',
    bossEmoji:    '👹',
    rewardType:   'koin',
    rewardAmount: 100,
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
        body: {
          kelas: form.kelas, maxHp: Number(form.maxHp),
          bossName: form.bossName, bossEmoji: form.bossEmoji,
          rewardType: form.rewardType, rewardAmount: Number(form.rewardAmount),
        },
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
                  {r.rewardType && r.rewardAmount > 0 && (
                    <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                      🎁 {r.rewardType === 'koin' ? `🪙 ${r.rewardAmount} koin` : r.rewardType === 'exp' ? `⚡ ${r.rewardAmount} EXP` : `🪙+⚡ ${r.rewardAmount}`} per siswa jika menang
                    </div>
                  )}
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

            {/* Reward section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, marginTop: 2 }}>
              <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🎁 HADIAH JIKA BOSS DIKALAHKAN</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={labelStyle}>Jenis Hadiah</div>
                  <select value={form.rewardType} onChange={e => setForm(f => ({ ...f, rewardType: e.target.value }))} style={inputStyle}>
                    <option value="koin">🪙 Koin</option>
                    <option value="exp">⚡ EXP</option>
                    <option value="koin_exp">🎁 Koin + EXP</option>
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>Jumlah per Siswa</div>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={form.rewardAmount}
                    onChange={e => setForm(f => ({ ...f, rewardAmount: e.target.value }))}
                    style={{ ...inputStyle, MozAppearance: 'textfield' }}
                    placeholder="Ketik jumlah..."
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 8, lineHeight: 1.5 }}>
                {form.rewardType === 'koin' && `Setiap peserta mendapat 🪙 ${form.rewardAmount} koin saat boss dikalahkan.`}
                {form.rewardType === 'exp'  && `Setiap peserta mendapat ⚡ ${form.rewardAmount} EXP saat boss dikalahkan.`}
                {form.rewardType === 'koin_exp' && `Setiap peserta mendapat 🪙 ${form.rewardAmount} koin + ⚡ ${form.rewardAmount} EXP saat boss dikalahkan.`}
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
  // ── Kelas 8 BAB II — Teorema Pythagoras ────────────────────────────────────
  { key: 'g8trebuchet',    label: '⚔️ Bidikan Tepat Trebuchet',      desc: 'Hipotenusa segitiga siku-siku (c = √(a²+b²))' },
  { key: 'g8perisai',      label: '🛡️ Restorasi Perisai Kerajaan',   desc: 'Diagonal belah ketupat (d2 = 2√(s²−(d1/2)²))' },
  { key: 'g8hartakarun',   label: '💰 Harta Karun di Sudut Ruangan', desc: 'Diagonal ruang balok (d = √(P²+L²+T²))' },
  { key: 'g8inspeksisudut',label: '🗼 Inspeksi Sudut Menara',         desc: 'Menghitung a² + b² dari dua sisi' },
  { key: 'g8petaradar',    label: '📡 Peta Radar Pengintai',          desc: 'Jarak dua titik pada koordinat (d = √(Δx²+Δy²))' },
  { key: 'g8taligantung',  label: '🪢 Misi Penyelamatan Tali Gantung',desc: 'Panjang tali/hipotenusa (c = √(a²+b²))' },
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
  const [liveFeed,     setLiveFeed]     = useState([])         // { time, text, color }
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
      if (data.playerName) {
        const now = new Date()
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const icon = data.correct ? '✅' : '❌'
        setLiveFeed(prev => [{
          time, color: data.correct ? '#67E8F9' : '#f87171',
          text: `${data.playerName} menjawab soal ${data.round ?? ''} ${icon}`,
        }, ...prev].slice(0, 20))
      }
    })

    socket.on('tournament:player-finished', (data) => {
      if (data.playerName != null) {
        const now = new Date()
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLiveFeed(prev => [{
          time, color: '#10b981',
          text: `${data.playerName} menyelesaikan semua soal (${data.score ?? '?'} benar)`,
        }, ...prev].slice(0, 20))
      }
    })

    return () => {
      socket.off('tournament:state')
      socket.off('tournament:round-start')
      socket.off('tournament:finished')
      socket.off('tournament:cancelled')
      socket.off('tournament:player-answered')
      socket.off('tournament:player-finished')
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
        <div style={{ background: '#1A1D27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5 }}>🏆 BUAT TURNAMEN BARU</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Kelas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelS}>KELAS</div>
              <div style={{ position: 'relative' }}>
                <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} style={{ ...inputS, appearance: 'none' }}>
                  <option value="">Pilih kelas…</option>
                  {kelasDiampu.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8', fontSize: 12 }}>▼</div>
              </div>
            </div>

            {/* Game — 2-column grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelS}>GAME</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TOURNAMENT_GAMES.map(g => {
                  const sel = form.gameKey === g.key
                  const emoji = g.label.split(' ')[0]
                  const name = g.label.split(' ').slice(1).join(' ')
                  return (
                    <button key={g.key} type="button" onClick={() => setForm(f => ({ ...f, gameKey: g.key }))} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                      borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      background: sel ? 'rgba(103,232,249,0.1)' : '#111827',
                      border: sel ? '1px solid #67E8F9' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: sel ? '0 0 8px rgba(103,232,249,0.2)' : 'none',
                      fontSize: 13, fontWeight: sel ? 600 : 500,
                      color: sel ? '#67E8F9' : '#fff',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Format — cosmetic radio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelS}>FORMAT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 12, border: '1px solid #67E8F9', background: 'rgba(103,232,249,0.05)' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '5px solid #67E8F9', background: '#111827', marginTop: 2, flexShrink: 0, boxSizing: 'border-box' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Eliminasi Tunggal</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Kalah sekali langsung gugur</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: '#111827', opacity: 0.5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid #94A3B8', background: 'transparent', marginTop: 2, flexShrink: 0, boxSizing: 'border-box' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Round Robin</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Semua lawan semua</div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '8px 12px' }}>{error}</div>
            )}

            <div style={{ background: 'rgba(103,232,249,0.06)', border: '1px solid rgba(103,232,249,0.15)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
              🎯 Turnamen akan dimulai setelah kamu klik Mulai. Semua siswa online akan otomatis masuk.
            </div>

            <button type="submit" disabled={creating || !form.kelas} style={{
              background: creating || !form.kelas ? 'rgba(180,83,9,0.3)' : '#b45309',
              color: '#fff', border: 'none', borderRadius: 14, padding: '16px',
              fontSize: 16, fontWeight: 700, cursor: creating || !form.kelas ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: creating || !form.kelas ? 0.5 : 1,
              boxShadow: !creating && form.kelas ? '0 4px 12px rgba(180,83,9,0.3)' : 'none',
              marginTop: 8,
            }}>
              {creating ? '⏳ Memulai…' : `🏆 Mulai Turnamen — ${form.kelas || '…'}`}
            </button>
          </form>
        </div>
      ) : (
        // ── Bracket View ─────────────────────────────────────────────────────
        <>
          {/* Champion banner */}
          {tournament.champion && (
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🏆</div>
              <div>
                <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800 }}>JUARA TURNAMEN</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{tournament.champion.name}</div>
              </div>
            </div>
          )}

          {/* Summary stats bar */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { icon: '🎮', label: 'Game', value: TOURNAMENT_GAMES.find(g => g.key === tournament.gameKey)?.label?.split(' ').slice(1,3).join(' ') || tournament.gameKey },
              { icon: '👥', label: 'Peserta', value: `${tournament.rounds?.[0]?.matches?.reduce((a,m) => a + (m.player1 ? 1 : 0) + (m.player2 ? 1 : 0), 0) ?? '?'} siswa` },
              { icon: '⏱️', label: 'Ronde', value: `${tournament.currentRound} / ${tournament.rounds?.length ?? '?'}` },
              { icon: '📊', label: 'Status', value: tournament.status === 'finished' ? 'Selesai' : 'Berlangsung' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 20 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2, fontWeight: 500 }}>{stat.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bracket rounds — vertical list with in-progress expanded */}
          {tournament.rounds?.map((round, ri) => {
            const isLive = ri + 1 === tournament.currentRound && tournament.status !== 'finished'
            return (
              <div key={ri} style={{ background: '#111827', borderRadius: 16, border: `1px solid ${isLive ? 'rgba(103,232,249,0.2)' : 'rgba(255,255,255,0.08)'}`, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: isLive ? '#67E8F9' : '#94A3B8' }}>
                    RONDE {ri + 1}
                  </div>
                  {isLive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                      <div style={{ width: 5, height: 5, background: '#f87171', borderRadius: '50%' }} />
                      LIVE
                    </div>
                  )}
                  {ri + 1 < tournament.currentRound && (
                    <div style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>SELESAI</div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {round.matches.map((m, mi) => {
                    const badge = MATCH_STATUS_BADGE[m.status] || MATCH_STATUS_BADGE.pending
                    const isMatchLive = m.status === 'in-progress'
                    return (
                      <div key={mi} style={{
                        background: isMatchLive ? 'rgba(103,232,249,0.04)' : '#0D1117',
                        border: `1px solid ${isMatchLive ? 'rgba(103,232,249,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 12, padding: isMatchLive ? 16 : '12px 14px',
                      }}>
                        {isMatchLive && m.player1 && m.player2 ? (
                          // Expanded live match card
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                              <div style={{ background: 'rgba(103,232,249,0.1)', color: '#67E8F9', padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>MATCH {mi + 1}</div>
                              <div style={{ fontSize: 11, color: '#67E8F9', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                <span>⚔️</span> Sedang berlangsung
                              </div>
                            </div>
                            {[
                              { p: m.player1, color: '#67E8F9' },
                              null,
                              { p: m.player2, color: '#f59e0b' },
                            ].map((item, idx) => {
                              if (!item) return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                  <span style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1 }}>VS</span>
                                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                </div>
                              )
                              const { p, color } = item
                              const score = m.scores?.[p.userId] ?? 0
                              const initial = p.name?.charAt(0)?.toUpperCase() || '?'
                              const qDone = spectate?.id === m.id && spectateQ ? spectateQ.round : null
                              const qTotal = spectate?.id === m.id && spectateQ ? spectateQ.maxRounds : 7
                              const pct = qDone ? Math.min(100, (qDone / qTotal) * 100) : 0
                              return (
                                <div key={idx}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color === '#67E8F9' ? '#0e7490' : '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{initial}</div>
                                      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{p.name}</span>
                                    </div>
                                    <span style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 3, transition: 'width 0.3s' }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: '#94A3B8', width: 28, textAlign: 'right', fontWeight: 600 }}>{qDone ? `${qDone}/${qTotal}` : ''}</span>
                                  </div>
                                </div>
                              )
                            })}
                            <button onClick={() => openSpectate(m)} style={{
                              marginTop: 14, width: '100%', background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.2)',
                              borderRadius: 10, padding: '8px', color: '#67E8F9', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}>👁 Pantau Real-time</button>
                          </>
                        ) : (
                          // Compact match card (done or pending)
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              {[m.player1, m.player2].filter(Boolean).map((p, pi) => (
                                <div key={pi}>
                                  {pi === 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 14, fontWeight: m.winner?.userId === p.userId ? 600 : 500, color: m.winner && m.winner.userId !== p.userId ? '#94A3B8' : '#fff' }}>
                                      {m.winner?.userId === p.userId ? '🏅 ' : ''}{p.name}
                                    </span>
                                    {m.scores?.[p.userId] !== undefined && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: m.winner?.userId === p.userId ? '#10b981' : '#94A3B8' }}>{m.scores[p.userId]}</span>
                                        {m.winner?.userId === p.userId && <span style={{ fontSize: 12, color: '#10b981' }}>✓</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>{badge.label}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Live Feed */}
          {liveFeed.length > 0 && (
            <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                📡 Live Feed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {liveFeed.slice(0, 8).map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.1) }}>
                    <span style={{ color: ev.color, fontSize: 10, marginTop: 3 }}>●</span>
                    <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.5 }}>
                      <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: 11, marginRight: 8 }}>{ev.time}</span>
                      {ev.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom action buttons */}
          <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
            <button
              onClick={() => {
                const tabs = document.querySelectorAll('[data-tab]')
                tabs.forEach(t => t.getAttribute('data-tab') === 'nilai' && t.click())
              }}
              style={{
                flex: 1, background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.25)',
                borderRadius: 14, padding: '14px 0', color: '#67E8F9', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              📊 Lihat Nilai Siswa
            </button>
            {tournament.status !== 'finished' && (
              <button onClick={handleEnd} style={{
                flex: 1, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 14, padding: '14px 0', color: '#f87171', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                🛑 Hentikan
              </button>
            )}
          </div>
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

function useIsDesktop() {
  const [desk, setDesk] = React.useState(() => window.innerWidth >= 1024)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesk(mq.matches)
    const h = e => setDesk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desk
}

// ── Guru Home Overview Tab ────────────────────────────────────────────────────
function GuruActionCard({ eyebrow, icon, title, body, action, isEmerald, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minHeight: 178, borderRadius: 16, padding: 20,
        border: `1px solid ${isEmerald ? 'rgba(159,227,189,0.2)' : 'rgba(215,199,255,0.2)'}`,
        background: isEmerald ? '#153633' : '#252442',
        transition: 'transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, fontSize: 18,
          background: isEmerald ? 'rgba(159,227,189,0.15)' : 'rgba(215,199,255,0.15)',
          color: isEmerald ? '#9fe3bd' : '#d7c7ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: isEmerald ? '#8dc7ae' : '#b4a8d5' }}>{eyebrow}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>{title}</h3>
          <p style={{ marginTop: 4, maxWidth: 400, fontSize: 12, lineHeight: 1.6, color: isEmerald ? '#a8c7bd' : '#bdb9d0', margin: '4px 0 0' }}>{body}</p>
        </div>
        <button
          onClick={onClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            borderRadius: 9999, padding: '10px 14px', fontSize: 11, fontWeight: 700,
            background: isEmerald ? '#9fe3bd' : '#d7c7ff',
            color: isEmerald ? '#12302e' : '#332653',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >{action} +</button>
      </div>
    </div>
  )
}

function GuruHomeTab({ kelasDiampu, user, logout, onPlayGames, onGoProfile, onSelectTab, hideHeader = false }) {
  const [tugas, setTugas]       = useState([])
  const [students, setStudents] = useState([])
  const [nilaiList, setNilai]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeClass, setActiveClass] = useState('Semua kelas')
  const [showNotif, setShowNotif]     = useState(false)
  const [showMenu, setShowMenu]       = useState(false)
  const [toast, setToast]             = useState('')
  const isDesktop = useIsDesktop()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiCall('/api/guru/tugas').then(d => setTugas(d.tugas || [])),
      apiCall('/api/guru/students').then(d => setStudents(d.students || [])),
      apiCall('/api/guru/nilai').then(d => setNilai(d.nilai || [])),
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  const classes = ['Semua kelas', ...kelasDiampu]
  const filteredTugas = activeClass === 'Semua kelas' ? tugas : tugas.filter(t => t.kelas === activeClass)
  const activeTugas   = tugas.filter(t => t.status === 'active')
  const avgScore      = nilaiList.length > 0
    ? (nilaiList.reduce((s, n) => s + n.score, 0) / nilaiList.length).toFixed(1).replace('.', ',')
    : '—'

  const nama     = user?.name || 'Guru'
  const initials = nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const hour     = new Date().getHours()
  const greeting = hour < 11 ? 'pagi' : hour < 15 ? 'siang' : hour < 18 ? 'sore' : 'malam'
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const metrics = [
    { label: 'Siswa aktif',    value: students.length.toString().padStart(2, '0'), detail: `${kelasDiampu.length} kelas diampu`,        icon: '👥', accent: '#9fe3bd',  bg: 'rgba(159,227,189,0.1)' },
    { label: 'Tugas berjalan', value: activeTugas.length.toString().padStart(2, '0'), detail: `${activeTugas.length} perlu ditinjau`, icon: '📋', accent: '#d7c7ff',  bg: 'rgba(215,199,255,0.1)' },
    { label: 'Rata-rata kelas',value: avgScore,                                   detail: nilaiList.length > 0 ? `dari ${nilaiList.length} nilai` : 'Belum ada nilai', icon: '🎓', accent: '#f5cf9c',  bg: 'rgba(245,207,156,0.1)' },
    { label: 'Kelas diampu',   value: kelasDiampu.length.toString(),              detail: kelasDiampu.slice(0, 2).join(', ') || '—',     icon: '📅', accent: '#a8d7ec',  bg: 'rgba(168,215,236,0.1)' },
  ]

  const classColor = (kelas) => {
    const idx = kelasDiampu.indexOf(kelas)
    return ['#9fe3bd', '#d7c7ff', '#f5cf9c', '#a8d7ec'][idx % 4]
  }

  const photoSrc = user?.photoUrl ?? user?.photo_url ?? null

  return (
    <div style={{ minHeight: '100vh', background: '#071321', color: '#e8f1ee', position: 'relative' }}>
      {/* radial overlays */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6,
        background: 'radial-gradient(circle at 84% 0%, rgba(94,75,160,.18), transparent 33%), radial-gradient(circle at 8% 64%, rgba(29,123,96,.10), transparent 30%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1500, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>

        {/* ── Header (hidden on mobile when inside shell) ── */}
        <header style={{ display: hideHeader ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => notify('Kamu sudah berada di beranda TOMAT')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              <span style={{ width: 40, height: 40, borderRadius: 14, background: '#9fe3bd', color: '#0b2c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, letterSpacing: '-0.1em', boxShadow: '0 0 0 5px rgba(159,227,189,0.08)' }}>TM</span>
              {isDesktop && (
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#9fe3bd' }}>Ruang belajar</span>
                  <span style={{ fontWeight: 600, letterSpacing: '-0.03em', color: '#fff', fontSize: 14 }}>TOMAT</span>
                </span>
              )}
            </button>
            {isDesktop && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 16 }}>
                <button style={{ borderRadius: 9999, background: 'rgba(255,255,255,0.09)', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#fff', border: 'none', cursor: 'default', fontFamily: 'inherit' }}>Beranda</button>
                <NavBtn label="Kelas" onClick={() => onSelectTab('siswa')} />
                <NavBtn label="Rekap nilai" onClick={() => onSelectTab('nilai')} />
              </nav>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <button
              onClick={() => { setShowNotif(v => !v); setShowMenu(false) }}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#a8b6bd', cursor: 'pointer', position: 'relative', fontSize: 15 }}
            >
              🔔
              {activeTugas.length > 0 && <span style={{ position: 'absolute', top: 9, right: 10, width: 6, height: 6, borderRadius: '50%', background: '#9fe3bd' }} />}
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.09)' }} />
            <button
              onClick={() => { setShowMenu(v => !v); setShowNotif(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 9999, padding: '4px 8px 4px 4px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {photoSrc
                ? <img src={photoSrc} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                : <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#d7c7ff', color: '#3d286c', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
              }
              {isDesktop && (
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#fff' }}>{nama}</span>
                  <span style={{ display: 'block', fontSize: 10, color: '#83929d' }}>Guru</span>
                </span>
              )}
              <span style={{ color: '#71818c', fontSize: 11 }}>▾</span>
            </button>

            {/* Notif dropdown */}
            {showNotif && (
              <div style={{ position: 'absolute', right: 140, top: 52, zIndex: 30, width: 288, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: '#122231', padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Notifikasi</span>
                  <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: '#84959e', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
                {activeTugas.length > 0
                  ? <p style={{ borderRadius: 12, background: 'rgba(159,227,189,0.08)', padding: 12, fontSize: 12, lineHeight: 1.6, color: '#b7cbc8' }}>{activeTugas.length} tugas aktif sedang berjalan.</p>
                  : <p style={{ fontSize: 12, color: '#4e626e', textAlign: 'center', padding: 12 }}>Tidak ada notifikasi baru.</p>
                }
              </div>
            )}

            {/* Profile menu */}
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: 52, zIndex: 30, width: 208, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: '#122231', padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
                <MenuBtn label="Pengaturan profil" onClick={() => { setShowMenu(false); onGoProfile() }} />
                <MenuBtn label="🎮 Media Ajar" onClick={() => { setShowMenu(false); onPlayGames() }} />
                <MenuBtn label="Keluar" onClick={() => { setShowMenu(false); logout() }} danger />
              </div>
            )}
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{ paddingTop: isDesktop ? 56 : 32, paddingBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'flex-start', gap: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#82939e', marginBottom: 16 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9fe3bd', flexShrink: 0 }} />
                {todayStr}
              </div>
              <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 600, lineHeight: 0.98, letterSpacing: '-0.065em', color: '#fff', maxWidth: 560, margin: 0 }}>
                Selamat {greeting},<br /><span style={{ color: '#9fe3bd' }}>{nama.split(' ')[0]}.</span>
              </h1>
              <p style={{ marginTop: 20, maxWidth: 400, fontSize: 14, lineHeight: 1.7, color: '#98aab1' }}>
                {loading ? 'Memuat data kelas…' : `${kelasDiampu.length} kelas diampu · ${activeTugas.length} tugas aktif · ${students.length} siswa terdaftar.`}
              </p>
            </div>
            {/* Insight chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 320, width: '100%', borderRadius: 16, border: '1px solid rgba(215,199,255,0.2)', background: 'rgba(215,199,255,0.07)', padding: 16 }}>
              <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'rgba(215,199,255,0.15)', color: '#d7c7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#e5dcff', margin: 0 }}>
                  {activeTugas.length > 0 ? `${activeTugas.length} tugas aktif berjalan` : 'Semua terkelola dengan baik'}
                </p>
                <p style={{ marginTop: 4, fontSize: 11, lineHeight: 1.5, color: '#a99fc6', margin: '4px 0 0' }}>
                  {nilaiList.length > 0 ? `Rata-rata nilai kelas: ${avgScore}` : 'Mulai buat tugas untuk kelasmu.'}
                </p>
              </div>
              <button onClick={() => onSelectTab('insight')} style={{ color: '#d7c7ff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, flexShrink: 0, padding: 4, lineHeight: 1 }}>↗</button>
            </div>
          </div>
        </section>

        {/* ── Action cards ── */}
        <section style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.1fr 0.9fr' : '1fr', gap: 16 }}>
          <GuruActionCard
            eyebrow="TUGAS AKTIF" icon="📋"
            title="Buat tugas baru untuk kelasmu"
            body="Mulai dari kuis singkat, evaluasi harian, atau kumpulkan hasil pengamatan."
            action="Buat tugas" isEmerald={true}
            onClick={() => onSelectTab('tugas')}
          />
          <GuruActionCard
            eyebrow="PANTAU KELAS" icon="👥"
            title={students.length > 0 ? `${students.length} siswa terdaftar` : 'Pantau kelas aktif'}
            body={kelasDiampu.length > 0 ? `${kelasDiampu.join(' · ')} · SMP TISA` : 'Belum ada kelas diampu.'}
            action="Lihat kelas" isEmerald={false}
            onClick={() => onSelectTab('siswa')}
          />
        </section>

        {/* ── Metrics ── */}
        <section style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : 'repeat(2,1fr)', gap: 12, padding: '32px 0' }}>
          {metrics.map(m => (
            <button
              key={m.label}
              onClick={() => notify(`${m.label}: ${m.value}`)}
              style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,29,43,0.8)', padding: isDesktop ? 20 : 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ width: 36, height: 36, borderRadius: 12, background: m.bg, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{m.icon}</span>
                <span style={{ fontSize: 13, color: '#4e626e' }}>↗</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#82939e', margin: 0 }}>{m.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.05em', color: '#fff', margin: 0 }}>{loading ? '—' : m.value}</p>
                <p style={{ fontSize: 10, color: m.accent, margin: 0 }}>{m.detail}</p>
              </div>
            </button>
          ))}
        </section>

        {/* ── Bottom: task list + attention sidebar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0,1.55fr) minmax(290px,0.75fr)' : '1fr', gap: 32, paddingBottom: 48 }}>

          {/* Task list */}
          <section style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#738793', margin: 0 }}>Ruang kerja</p>
                <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 600, letterSpacing: '-0.045em', color: '#fff', margin: '8px 0 0' }}>Tugas mendatang</h2>
              </div>
              <button onClick={() => onSelectTab('tugas')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#9fe3bd', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9fe3bd'}>Lihat semua ↗</button>
            </div>

            {/* Class filter pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#6e818c', flexShrink: 0 }}>⚙</span>
              {classes.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveClass(c)}
                  style={{ whiteSpace: 'nowrap', borderRadius: 9999, border: `1px solid ${activeClass === c ? 'rgba(159,227,189,0.5)' : 'rgba(255,255,255,0.08)'}`, background: activeClass === c ? '#9fe3bd' : 'rgba(255,255,255,0.03)', color: activeClass === c ? '#12302e' : '#81939e', padding: '8px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                >{c}</button>
              ))}
            </div>

            {/* Task rows */}
            <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,29,43,0.7)', overflow: 'hidden' }}>
              {loading
                ? <div style={{ padding: 32, textAlign: 'center', color: '#4e626e', fontSize: 14 }}>Memuat…</div>
                : filteredTugas.length === 0
                  ? <div style={{ padding: 40, textAlign: 'center', color: '#4e626e', fontSize: 14 }}>Belum ada tugas untuk kelas ini.</div>
                  : filteredTugas.slice(0, 6).map((t, i) => {
                      const isActive = t.status === 'active'
                      const color = classColor(t.kelas)
                      return (
                        <button
                          key={t.id}
                          onClick={() => onSelectTab('tugas')}
                          style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, borderBottom: i < Math.min(filteredTugas.length, 6) - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', padding: isDesktop ? '16px 20px' : '14px 16px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#e0eae7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.game_name || t.gameName}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4, fontSize: 10, color: '#7f939d' }}>
                              <span>{t.kelas}</span>
                              <span style={{ color: '#435964' }}>·</span>
                              <span>{t.total_questions} soal</span>
                              {t.due_at && <><span style={{ color: '#435964' }}>·</span><span>Tenggat {new Date(t.due_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></>}
                            </span>
                          </span>
                          {isDesktop && (
                            <span style={{ borderRadius: 9999, padding: '4px 10px', fontSize: 10, fontWeight: 600, flexShrink: 0, background: isActive ? 'rgba(159,227,189,0.1)' : 'rgba(255,255,255,0.05)', color: isActive ? '#9fe3bd' : '#64748B' }}>
                              {isActive ? 'Aktif' : 'Ditutup'}
                            </span>
                          )}
                          <span style={{ color: '#536975', fontSize: 14, flexShrink: 0 }}>↗</span>
                        </button>
                      )
                    })
              }
            </div>
          </section>

          {/* Attention sidebar */}
          <section style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#738793', margin: 0 }}>Sinyal kelas</p>
                <h2 style={{ marginTop: 8, fontSize: 22, fontWeight: 600, letterSpacing: '-0.045em', color: '#fff', margin: '8px 0 0' }}>Ringkasan kelas</h2>
              </div>
              <button onClick={() => onSelectTab('insight')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', color: '#7e9099', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#7e9099'}>⋯</button>
            </div>

            <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,29,43,0.7)', padding: isDesktop ? 20 : 16 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: '#8fa1a8', margin: 0 }}>
                {loading ? 'Memuat data…' : students.length === 0 ? 'Belum ada siswa di kelasmu.' : `${students.length} siswa terdaftar di ${kelasDiampu.length} kelas.`}
              </p>
              {!loading && kelasDiampu.length > 0 && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {kelasDiampu.slice(0, 3).map((kelas, idx) => {
                    const colorPairs = [['#9fe3bd','#153a32'],['#d7c7ff','#3d286c'],['#f5cf9c','#633f20']]
                    const [bg, text] = colorPairs[idx % 3]
                    const cnt = students.filter(s => s.kelas === kelas).length
                    const aktif = activeTugas.filter(t => t.kelas === kelas).length
                    return (
                      <button key={kelas} onClick={() => onSelectTab('siswa')} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', padding: 0 }}>
                        <span style={{ width: 36, height: 36, borderRadius: '50%', background: bg, color: text, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{kelas.replace(/[^A-Z0-9]/gi,'').substring(0,4).toUpperCase()}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#dbe6e4' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kelas}</span>
                            <span style={{ borderRadius: 4, background: 'rgba(255,255,255,0.07)', padding: '2px 6px', fontSize: 9, fontWeight: 500, color: '#92a5aa', flexShrink: 0 }}>{cnt} siswa</span>
                          </span>
                          <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#82939e' }}>{aktif > 0 ? `${aktif} tugas aktif` : 'Tidak ada tugas aktif'}</span>
                        </span>
                        <span style={{ fontSize: 13, color: '#536975', flexShrink: 0 }}>↗</span>
                      </button>
                    )
                  })}
                </div>
              )}
              <button onClick={() => onSelectTab('siswa')} style={{ marginTop: 24, display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)', padding: '10px 0', fontSize: 12, fontWeight: 600, color: '#b4c4c5', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b4c4c5' }}>
                🔍 Buka pantau kelas
              </button>
            </div>

            {/* Highlight */}
            {!loading && activeTugas.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, border: '1px solid rgba(159,227,189,0.15)', background: 'rgba(159,227,189,0.05)', padding: 16 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(159,227,189,0.15)', color: '#9fe3bd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 11, lineHeight: 1.5, color: '#9fb5b1', margin: 0 }}>
                  <span style={{ fontWeight: 600, color: '#cde4d8' }}>{activeTugas[0].kelas}</span> memiliki tugas aktif: {activeTugas[0].game_name}.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50, borderRadius: 9999, border: '1px solid rgba(159,227,189,0.25)', background: '#162d35', padding: '12px 16px', fontSize: 12, fontWeight: 500, color: '#d6ebe2', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function NavBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 500, color: hov ? '#fff' : '#9eacb6', border: 'none', cursor: 'pointer', background: hov ? 'rgba(255,255,255,0.06)' : 'transparent', fontFamily: 'inherit', transition: 'color 0.15s, background 0.15s' }}>{label}</button>
  )
}

function MenuBtn({ label, onClick, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ width: '100%', borderRadius: 12, padding: '8px 12px', textAlign: 'left', fontSize: 12, color: hov ? (danger ? '#fff' : '#fff') : (danger ? '#F87171' : '#c0ced0'), border: 'none', background: hov ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)') : 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
  )
}

const DESKTOP_TABS = [
  { id: 'home',       icon: '🏠', text: 'Beranda' },
  { id: 'tugas',      icon: '📋', text: 'Kelola Tugas' },
  { id: 'siswa',      icon: '👥', text: 'Pantau Kelas' },
  { id: 'nilai',      icon: '📊', text: 'Nilai Siswa' },
  { id: 'insight',    icon: '🎮', text: 'Insight Siswa' },
  { id: 'raid',       icon: '⚔️', text: 'Boss Raid' },
  { id: 'turnamen',   icon: '🏆', text: 'Turnamen' },
  { id: 'hafalan',    icon: '📖', text: 'Hafalan' },
  { id: 'kunci',      icon: '🔒', text: 'Kunci Bab' },
  { id: 'komunikasi', icon: '💬', text: 'Komunikasi' },
]

export default function GuruDashboardScreen({ onPlayGames }) {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('home')
  const [view, setView] = useState('dashboard')
  const [komunikasiTarget, setKomunikasiTarget] = useState(null)
  const [visitedProfile, setVisitedProfile] = useState(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const publicProfile = usePublicProfile()
  const isDesktop = useIsDesktop()
  const kelasDiampu = user?.kelas || []
  const grades = [...new Set(kelasDiampu.map(kelasToGrade).filter(Boolean))].sort()

  const selectTab = useCallback((nextTab) => {
    setTab(nextTab)
    window.dispatchEvent(new CustomEvent('tomat:guru-tab-active', { detail: nextTab }))
  }, [])

  // The global desktop sidebar is the only desktop navigation. Keep its active
  // state in sync with the dashboard's internal tab state.
  useEffect(() => {
    const handler = (e) => {
      const key = e.detail?.key
      const nextTab = {
        guruDashboard: 'home',
        guruTugas: 'tugas',
        guruPantau: 'siswa',
        guruNilai: 'nilai',
        guruHafalan: 'hafalan',
        guruInsight: 'insight',
        guruRaid: 'raid',
        guruTurnamen: 'turnamen',
        guruKunci: 'kunci',
        guruKomunikasi: 'komunikasi',
      }[key]
      if (nextTab) selectTab(nextTab)
    }
    window.addEventListener('tomat:guru-nav', handler)
    return () => window.removeEventListener('tomat:guru-nav', handler)
  }, [selectTab])

  // "Lihat Profil" must not reuse the compact profile object from the modal.
  // Fetch the complete, access-checked profile before opening the full page.
  useEffect(() => {
    const handler = async (e) => {
      let target
      try { target = normalizeProfileTarget(e.detail) } catch { return }
      try {
        setVisitedProfile(target.photoUrl !== undefined || target.bio !== undefined
          ? target
          : await fetchPublicProfile(target))
      } catch (error) {
        setVisitedProfile({
          id: target.id,
          role: target.role,
          name: target.name || 'Pengguna',
          profileError: error.message || 'Gagal memuat profil.',
        })
      }
    }
    window.addEventListener('tomat:visit-profile', handler)
    return () => window.removeEventListener('tomat:visit-profile', handler)
  }, [])

  if (view === 'profile') {
    return <ProfileScreen goBack={() => setView('dashboard')} />
  }

  if (visitedProfile) {
    return <PublicProfileScreen profile={visitedProfile} goBack={() => setVisitedProfile(null)} />
  }

  const tabContent = (
    <>
      {tab === 'home'       && <GuruHomeTab kelasDiampu={kelasDiampu} user={user} logout={logout} onPlayGames={onPlayGames} onGoProfile={() => setView('profile')} onSelectTab={selectTab} hideHeader={!isDesktop} />}
      {tab === 'tugas'      && <TugasTab kelasDiampu={kelasDiampu} />}
      {tab === 'hafalan'    && <GuruHafalanScreen />}
      {tab === 'nilai'      && <NilaiTab onProfileClick={publicProfile.openProfile} />}
      {tab === 'komunikasi' && <CommunicationScreen embedded initialTarget={komunikasiTarget} />}
      {tab === 'siswa'      && <SiswaTab onProfileClick={publicProfile.openProfile} />}
      {tab === 'kunci'      && <KunciTab grades={grades} />}
      {tab === 'raid'       && <RaidTab kelasDiampu={kelasDiampu} />}
      {tab === 'turnamen'   && <TurnamenTab kelasDiampu={kelasDiampu} />}
      {tab === 'insight'    && <InsightTab onProfileClick={publicProfile.openProfile} />}
    </>
  )

  // ── shared bottom-nav data ──
  const PRIMARY_TABS = [
    { id: 'home',       icon: '🏠', label: 'Beranda' },
    { id: 'tugas',      icon: '📋', label: 'Tugas' },
    { id: 'komunikasi', icon: '💬', label: 'Chat' },
    { id: 'siswa',      icon: '👥', label: 'Siswa' },
  ]
  const MORE_TABS = [
    { id: 'hafalan',  icon: '🧮', label: 'Hafalan' },
    { id: 'nilai',    icon: '📊', label: 'Nilai' },
    { id: 'kunci',    icon: '🔒', label: 'Kunci Bab' },
    { id: 'raid',     icon: '⚔️',  label: 'Boss Raid' },
    { id: 'turnamen', icon: '🏆', label: 'Turnamen' },
    { id: 'insight',  icon: '🎮', label: 'Insight' },
  ]
  const isMoreTab = MORE_TABS.some(t => t.id === tab)

  // ── Desktop layout ──
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '45%', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(100px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Desktop topbar */}
          <div style={{
            padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(10,11,20,0.92)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0, zIndex: 50,
          }}>
            <button onClick={() => selectTab('home')} style={{
              background: 'rgba(159,227,189,0.1)', border: '1px solid rgba(159,227,189,0.25)',
              color: '#9fe3bd', borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>← Beranda</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {TABS.find(t => t.id === tab)?.label} {TABS.find(t => t.id === tab)?.text}
              </div>
              <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600, marginTop: 1 }}>
                {user?.name} · {kelasDiampu.join(', ') || 'Guru'}
              </div>
            </div>
            <MessageNotificationBell onClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} suppress={tab === 'komunikasi'} />
            <AppNotificationBell onCommunicationClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} />
            <button onClick={onPlayGames} style={{
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
              color: '#34D399', borderRadius: 20, padding: '8px 14px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}>🎮 Media Ajar</button>
            <button onClick={logout} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748B', width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>⏻</button>
          </div>
          <div style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', maxWidth: 1100 }}>
              {tabContent}
            </div>
          </div>
        </div>
        <PublicProfileModal profile={publicProfile.profile} loading={publicProfile.loading} error={publicProfile.error} onClose={publicProfile.closeProfile} />
      </div>
    )
  }

  // ── Mobile layout — fixed shell: topbar + scroll area + bottom nav ──
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0A0B14', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '45%', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(100px)' }} />
      </div>

      {/* ── Fixed Topbar ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(10,11,20,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Logo */}
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: '#9fe3bd', color: '#0b2c2a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 10, letterSpacing: '-0.05em', flexShrink: 0,
        }}>TM</span>

        {/* Tab title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tab === 'home' ? 'Dashboard Guru' : `${TABS.find(t => t.id === tab)?.label} ${TABS.find(t => t.id === tab)?.text}`}
          </div>
          <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name} · {kelasDiampu.join(', ') || 'Guru'}
          </div>
        </div>

        <MessageNotificationBell onClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} suppress={tab === 'komunikasi'} />
        <AppNotificationBell onCommunicationClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} />

        <button onClick={onPlayGames} style={{
          background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
          color: '#34D399', borderRadius: 16, padding: '6px 10px', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        }}>🎮</button>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1, WebkitOverflowScrolling: 'touch' }}>
        {tabContent}
        <PublicProfileModal profile={publicProfile.profile} loading={publicProfile.loading} error={publicProfile.error} onClose={publicProfile.closeProfile} />
      </div>

      {/* ── Fixed Bottom Nav ── */}
      <nav style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
        padding: '6px 4px 18px',
        background: 'rgba(10,11,20,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {PRIMARY_TABS.map(({ id, icon, label }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => { selectTab(id); setShowMoreMenu(false) }} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, border: 'none', background: 'none', cursor: 'pointer',
              color: active ? '#34D399' : '#4B5563', fontFamily: 'inherit',
              padding: '6px 2px', position: 'relative',
            }}>
              {active && <span style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 20, height: 3, borderRadius: 99, background: '#34D399',
              }} />}
              <span style={{ fontSize: 20, opacity: active ? 1 : 0.5 }}>{icon}</span>
              <small style={{ fontSize: 9, fontWeight: active ? 800 : 500 }}>{label}</small>
            </button>
          )
        })}

        {/* Lainnya */}
        <button onClick={() => setShowMoreMenu(v => !v)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 3, border: 'none', background: 'none', cursor: 'pointer',
          color: showMoreMenu || isMoreTab ? '#A78BFA' : '#4B5563',
          fontFamily: 'inherit', padding: '6px 2px', position: 'relative',
        }}>
          {(showMoreMenu || isMoreTab) && (
            <span style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 20, height: 3, borderRadius: 99, background: '#A78BFA',
            }} />
          )}
          <span style={{ fontSize: 20, opacity: showMoreMenu || isMoreTab ? 1 : 0.5 }}>☰</span>
          <small style={{ fontSize: 9, fontWeight: showMoreMenu || isMoreTab ? 800 : 500 }}>Lainnya</small>
        </button>
      </nav>

      {/* ── More Menu Sheet ── */}
      {showMoreMenu && (
        <>
          <div onClick={() => setShowMoreMenu(false)} style={{
            position: 'fixed', inset: 0, zIndex: 11, background: 'rgba(0,0,0,0.55)',
          }} />
          <div style={{
            position: 'fixed', bottom: 72, left: 8, right: 8, zIndex: 12,
            background: '#12131f', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.09)',
            padding: '16px 12px',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 6 }}>Menu Lainnya</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {MORE_TABS.map(({ id, icon, label }) => {
                const active = tab === id
                return (
                  <button key={id} onClick={() => { selectTab(id); setShowMoreMenu(false) }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '14px 8px', borderRadius: 14,
                    border: active ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    background: active ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#A78BFA' : '#94A3B8',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <small style={{ fontSize: 10, fontWeight: 700 }}>{label}</small>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
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
