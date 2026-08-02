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
import { guruCacheGet, guruCacheSet } from '../guruCache'

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

// ── Web loading screen dengan persentase (hanya tampil di browser, bukan APK) ─
function GuruDataLoadingScreen({ pct = 0 }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'linear-gradient(160deg, #0a0b14 0%, #0e1a2e 60%, #0a0b14 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: 'linear-gradient(135deg,#1e293b,#0f172a)',
        border: '1px solid rgba(159,227,189,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 28,
        boxShadow: '0 0 32px rgba(159,227,189,0.12)',
      }}>🏫</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: -0.3 }}>
        Memuat Data Guru
      </div>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 32 }}>
        Menyiapkan dashboard Anda…
      </div>
      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 280, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: 'linear-gradient(90deg,#9fe3bd,#67E8F9)',
          width: `${Math.max(4, pct)}%`,
          transition: 'width 0.4s ease',
          boxShadow: '0 0 8px rgba(159,227,189,0.5)',
        }} />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: '#9fe3bd', fontWeight: 700 }}>
        {Math.round(pct)}%
      </div>
    </div>
  )
}

// ── Shared Style Constants ────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '11px 12px', color: '#fff', fontSize: 13,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 1.5,
  textTransform: 'uppercase', marginBottom: 5,
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
      background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
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

// ── Tugas Tab ─────────────────────────────────────────────────────────────────
function TugasTab({ kelasDiampu }) {
  const [tugasList, setTugasList] = useState(() => guruCacheGet('tugas') ?? [])
  const [loading, setLoading] = useState(() => !guruCacheGet('tugas'))
  const [error, setError] = useState('')
  const initialKelas = kelasDiampu[0] || ''
  const initialGrade = kelasToGrade(initialKelas)
  const initialGames = GAMES_CATALOG.filter(g => initialGrade ? g.grade <= initialGrade : false)
  const [form, setForm] = useState({ kelas: initialKelas, gameKey: initialGames[0]?.key || '', type: 'harian', totalQuestions: 5, dueAt: '', difficulty: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [editingTugas, setEditingTugas] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [subView, setSubView] = useState('list') // 'form' | 'list'

  const classGrade = kelasToGrade(form.kelas)
  const availableGames = GAMES_CATALOG.filter(g => classGrade ? g.grade <= classGrade : false)

  useEffect(() => {
    if (!availableGames.some(g => g.key === form.gameKey)) {
      setForm(f => ({ ...f, gameKey: availableGames[0]?.key || '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.kelas])

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const { tugas } = await apiCall('/api/guru/tugas')
      setTugasList(tugas)
      guruCacheSet('tugas', tugas)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const cached = guruCacheGet('tugas')
    refresh(!cached) // show loading hanya jika tidak ada cache
  }, [refresh])

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
      setSubView('list')
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

      {/* Sub-view toggle */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, gap: 4 }}>
        {[{ id: 'list', label: `Daftar Tugas${tugasList.length ? ` (${tugasList.length})` : ''}` }, { id: 'form', label: '+ Buat Tugas' }].map(v => (
          <button key={v.id} onClick={() => setSubView(v.id)} style={{
            flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            background: subView === v.id ? (v.id === 'form' ? 'linear-gradient(135deg,#10B981,#059669)' : '#1A1D27') : 'transparent',
            color: subView === v.id ? '#fff' : '#4B5563',
            transition: 'all 0.15s',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Create form */}
      {subView === 'form' && (
        <div style={{ background: '#111827', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
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
      )}

      {/* Task list */}
      {subView === 'list' && (
        <div>
          {loading ? (
            <div style={{ color: '#64748B', fontSize: 13, padding: '12px 0' }}>Memuat…</div>
          ) : tugasList.length === 0 ? (
            <div style={{ color: '#374151', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              Belum ada tugas. Klik <strong style={{ color: '#10B981' }}>+ Buat Tugas</strong> untuk memulai.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tugasList.map(t => {
                const isActive = t.status === 'active'
                return (
                  <div key={t.id} style={{
                    background: '#111827', borderRadius: 14, border: `1px solid ${isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
                    overflow: 'hidden', display: 'flex', opacity: isActive ? 1 : 0.65,
                  }}>
                    <div style={{ width: 3, flexShrink: 0, background: isActive ? '#10B981' : '#374151', boxShadow: isActive ? '0 0 8px rgba(16,185,129,0.6)' : 'none' }} />
                    <div style={{ padding: '10px 12px', flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Status pill + game name */}
                      <span style={{
                        flexShrink: 0,
                        background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#34D399' : '#64748B',
                        border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                      }}>{isActive ? 'Aktif' : 'Tutup'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.game_emoji} {t.game_name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ color: '#67E8F9', fontWeight: 700 }}>{t.kelas}</span>
                          <span>·</span>
                          <span>{TYPE_ICONS[t.type]} {TYPE_LABELS[t.type]}</span>
                          <span>·</span>
                          <span>{t.total_questions} soal</span>
                          {t.due_at && <><span>·</span><span>Tenggat {t.due_at}</span></>}
                        </div>
                      </div>
                      {/* Icon action buttons */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button onClick={() => closeTugas(t.id, t.status === 'active' ? 'closed' : 'active')} title={isActive ? 'Tutup tugas' : 'Buka tugas'} style={{
                          background: isActive ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)',
                          color: isActive ? '#F87171' : '#34D399',
                          border: `1px solid ${isActive ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
                          borderRadius: 8, width: 32, height: 32, fontSize: 13, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isActive ? '⏸' : '▶'}
                        </button>
                        <button onClick={() => setEditingTugas(t)} title="Edit tugas" style={{
                          background: 'rgba(245,158,11,0.12)', color: '#FBBF24',
                          border: '1px solid rgba(245,158,11,0.25)',
                          borderRadius: 8, width: 32, height: 32, fontSize: 13, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✏️</button>
                        <button onClick={() => setConfirmDeleteId(t.id)} title="Hapus tugas" style={{
                          background: 'rgba(239,68,68,0.12)', color: '#F87171',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: 8, width: 32, height: 32, fontSize: 13, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Nilai Tab ─────────────────────────────────────────────────────────────────
function NilaiTab({ onProfileClick }) {
  const [nilaiList, setNilaiList] = useState(() => guruCacheGet('nilai') ?? [])
  const [loading, setLoading] = useState(() => !guruCacheGet('nilai'))
  const [openKelas, setOpenKelas] = useState(new Set())

  useEffect(() => {
    const cached = guruCacheGet('nilai')
    if (!cached) setLoading(true)
    apiCall('/api/guru/nilai').then(({ nilai }) => {
      setNilaiList(nilai)
      guruCacheSet('nilai', nilai)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (nilaiList.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada nilai yang terkumpul.</div>

  const avg = Math.round(nilaiList.reduce((s, n) => s + n.score, 0) / nilaiList.length)
  const avgColor = avg >= 90 ? '#34D399' : avg >= 75 ? '#67E8F9' : avg >= 60 ? '#FBBF24' : '#F87171'

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

  const toggleKelas = (kelas) => {
    setOpenKelas(prev => {
      const next = new Set(prev)
      if (next.has(kelas)) next.delete(kelas)
      else next.add(kelas)
      return next
    })
  }

  // Unique kelas count and tugas count
  const uniqueTugas = new Set(nilaiList.map(n => n.tugas_id)).size

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Summary bar — 3 stats inline */}
      <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: avgColor, lineHeight: 1 }}>{avg}</div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rata-rata</div>
        </div>
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{nilaiList.length}</div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nilai</div>
        </div>
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{uniqueTugas}</div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tugas</div>
        </div>
      </div>

      {/* Kelas accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...kelasGroups.entries()].map(([kelas, tugasGroups]) => {
          const kelasNilai = [...tugasGroups.values()].flatMap(tugas => tugas.nilai)
          const kelasAverage = Math.round(kelasNilai.reduce((sum, nilai) => sum + nilai.score, 0) / kelasNilai.length)
          const isOpen = openKelas.has(kelas)
          return (
            <div key={kelas} style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              {/* Kelas header — tap to toggle */}
              <button onClick={() => toggleKelas(kelas)} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, background: 'rgba(103,232,249,0.14)',
                  color: '#67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                }}>🏫</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{kelas}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                    {kelasNilai.length} nilai · {tugasGroups.size} tugas
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(kelasAverage) }}>{kelasAverage}</div>
                  <div style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 }}>Avg</div>
                </div>
                <span style={{ color: '#64748B', fontSize: 14, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>›</span>
              </button>

              {/* Tugas list (expanded) */}
              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...tugasGroups.values()].map(tugas => {
                      const tugasAverage = Math.round(tugas.nilai.reduce((sum, nilai) => sum + nilai.score, 0) / tugas.nilai.length)
                      return (
                        <div key={tugas.id} style={{
                          background: '#0D1117', borderRadius: 12,
                          border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
                        }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                          }}>
                            <div style={{ fontSize: 20, flexShrink: 0 }}>{tugas.gameEmoji}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tugas.gameName}</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                                <span style={{
                                  background: `${TYPE_COLORS[tugas.type]}18`, color: TYPE_COLORS[tugas.type],
                                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                                }}>
                                  {TYPE_ICONS[tugas.type]} {TYPE_LABELS[tugas.type]}
                                </span>
                                <span style={{ color: '#64748B', fontSize: 10 }}>
                                  {tugas.nilai.length} siswa
                                </span>
                                {tugas.dueAt && (
                                  <span style={{ color: '#64748B', fontSize: 10 }}>
                                    Tenggat {formatDate(tugas.dueAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(tugasAverage) }}>{tugasAverage}</div>
                              <div style={{ fontSize: 9, color: '#64748B' }}>RATA-RATA</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '4px 8px 8px' }}>
                            {tugas.nilai.map(n => (
                              <div key={n.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 10px',
                              }}>
                                <UserAvatar
                                  user={{ id: n.student_id, role: 'siswa', name: n.student_name, photoUrl: n.student_photo_url, equippedBingkai: n.student_equipped_bingkai }}
                                  size={28}
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
                                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>
                                    {n.correct_count}/{n.total_questions} soal
                                  </div>
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: scoreColor(n.score), flexShrink: 0 }}>{n.score}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Siswa Tab ─────────────────────────────────────────────────────────────────
function SiswaTab({ onProfileClick }) {
  const [students, setStudents] = useState(() => guruCacheGet('students') ?? [])
  const [loading, setLoading] = useState(() => !guruCacheGet('students'))
  useEffect(() => {
    const cached = guruCacheGet('students')
    if (!cached) setLoading(true)
    apiCall('/api/guru/students').then(({ students }) => {
      setStudents(students)
      guruCacheSet('students', students)
    }).finally(() => setLoading(false))
  }, [])
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (students.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>
  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          {/* Sticky kelas header */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 5,
            background: 'rgba(10,11,20,0.96)', backdropFilter: 'blur(12px)',
            padding: '8px 0 10px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9', textTransform: 'uppercase', letterSpacing: 1 }}>{kelas}</span>
            <span style={{ background: 'rgba(103,232,249,0.12)', color: '#67E8F9', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{list.length} siswa</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {list.map(s => (
              <button key={s.id} onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#111827', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
                padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
              }}>
                <UserAvatar
                  user={{ ...s, role: 'siswa' }}
                  size={32}
                  onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{s.username}</div>
                  {s.is_test_account && <div style={{ fontSize: 9, color: '#FBBF24', fontWeight: 800, letterSpacing: .8, marginTop: 2 }}>AKUN DEMO</div>}
                </div>
                <span style={{ color: '#374151', fontSize: 14, flexShrink: 0 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Kunci Tab ─────────────────────────────────────────────────────────────────
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>}
      {grades.length === 0 && <div style={{ color: '#374151', fontSize: 13 }}>Anda belum mengampu kelas manapun.</div>}
      {grades.map(grade => (
        <div key={grade}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#A78BFA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Kelas {grade}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {getBabsForGrade(grade).map(bab => {
              const locked = isLocked(grade, bab)
              return (
                <div key={bab} style={{
                  background: '#111827', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>{locked ? '🔒' : '🔓'}</span>
                    <div style={{ fontSize: 13, color: locked ? '#94A3B8' : '#fff', fontWeight: 600 }}>{GRADE_BAB_LABELS[grade]?.[bab] || bab}</div>
                  </div>
                  {/* Switch toggle */}
                  <button onClick={() => toggle(grade, bab)} style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: locked ? 'rgba(239,68,68,0.25)' : 'rgba(52,211,153,0.25)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    boxShadow: `inset 0 0 0 1px ${locked ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.4)'}`,
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: locked ? 3 : 23,
                      width: 20, height: 20, borderRadius: '50%',
                      background: locked ? '#F87171' : '#34D399',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ values }) {
  const max = Math.max(1, ...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36, flexShrink: 0 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          width: 8, borderRadius: 2, height: Math.max(3, (v / max) * 36),
          background: i === values.length - 1 && v > 0 ? '#34D399' : v > 0 ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.07)',
        }} />
      ))}
    </div>
  )
}

// ── Insight Tab ───────────────────────────────────────────────────────────────
function InsightTab({ onProfileClick }) {
  const [students, setStudents] = useState(() => guruCacheGet('insight') ?? [])
  const [loading, setLoading] = useState(() => !guruCacheGet('insight'))
  const [error, setError] = useState('')
  useEffect(() => {
    const cached = guruCacheGet('insight')
    if (!cached) setLoading(true)
    apiCall('/api/guru/insight').then(({ students }) => {
      setStudents(students)
      guruCacheSet('insight', students)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])
  if (loading) return <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
  if (error) return <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>
  if (students.length === 0) return <div style={{ color: '#374151', fontSize: 13 }}>Belum ada siswa terdaftar di kelas yang Anda ampu.</div>

  const badgeColor = count => count < 3 ? '#F87171' : count < 8 ? '#FBBF24' : '#34D399'

  const byKelas = {}
  for (const s of students) { (byKelas[s.kelas] ||= []).push(s) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 11, color: '#64748B', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 12px' }}>
        Aktivitas 7 hari terakhir, level, koin, dan lencana.
      </div>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {kelas}
            <span style={{ background: 'rgba(103,232,249,0.12)', color: '#67E8F9', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{list.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(s => (
              <div key={s.id} style={{ background: '#111827', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserAvatar
                  user={{ ...s, role: 'siswa' }}
                  size={34}
                  onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => onProfileClick({ id: s.id, role: 'siswa', name: s.name })} style={{
                    border: 'none', background: 'none', padding: 0, color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex',
                    alignItems: 'center', gap: 6, textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</span>
                    {s.activeToday && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />}
                  </button>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>⭐ Lv {s.level}</span>
                    <span>📚 {s.exp} EXP</span>
                    <span>🪙 {s.coins}</span>
                    <span style={{ color: badgeColor(s.badgeCount) }}>🏅 {s.badgeCount}</span>
                    <span>🔥 {s.bestSurvivalStreak}</span>
                  </div>
                  {s.is_test_account && <div style={{ fontSize: 9, color: '#FBBF24', fontWeight: 800, letterSpacing: .8, marginTop: 2 }}>AKUN DEMO · SEMUA ITEM TERSEDIA</div>}
                </div>
                <Sparkline values={s.sparkline} />
              </div>
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
  const [formOpen,  setFormOpen]  = useState(false)
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
      setFormOpen(false)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Active raids — HP bar prominent */}
      {raids.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 800, letterSpacing: 1.5 }}>🔴 RAID SEDANG AKTIF</div>
          {raids.map(r => {
            const pct   = Math.round((r.hp / r.maxHp) * 100)
            const hpClr = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
            return (
              <div key={r.kelas} style={{
                background: '#0D1117', borderRadius: 16,
                border: '1px solid rgba(239,68,68,0.35)', overflow: 'hidden',
              }}>
                {/* Big HP bar at top */}
                <div style={{ height: 8, background: 'rgba(255,255,255,0.04)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: hpClr, transition: 'width 0.5s ease', boxShadow: `0 0 10px ${hpClr}80` }} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 36 }}>{r.bossEmoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{r.bossName}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Kelas {r.kelas} · {r.participants?.length || 0} peserta aktif</div>
                      {r.rewardType && r.rewardAmount > 0 && (
                        <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, marginTop: 3 }}>
                          🎁 {r.rewardType === 'koin' ? `🪙 ${r.rewardAmount} koin` : r.rewardType === 'exp' ? `⚡ ${r.rewardAmount} EXP` : `🪙+⚡ ${r.rewardAmount}`} per siswa jika menang
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: hpClr }}>{r.hp.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>/ {r.maxHp.toLocaleString()} HP</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: hpClr, marginTop: 2 }}>{pct}%</div>
                    </div>
                  </div>

                  {r.participants?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px' }}>
                      🏆 Top: {r.participants[0].name} ({r.participants[0].damage} damage)
                    </div>
                  )}

                  <button
                    onClick={() => end(r.kelas)}
                    disabled={ending === r.kelas}
                    style={{
                      width: '100%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                      color: '#f87171', borderRadius: 12, padding: '10px 0',
                      fontSize: 13, fontWeight: 700, cursor: ending === r.kelas ? 'default' : 'pointer',
                      opacity: ending === r.kelas ? 0.6 : 1, fontFamily: 'inherit',
                    }}
                  >
                    {ending === r.kelas ? '…' : '⏹ Akhiri Raid'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create form — collapsible, show toggle button */}
      <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <button onClick={() => setFormOpen(v => !v)} style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ height: 2, width: 0, position: 'absolute' }} />
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚔️</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Mulai Boss Raid Baru</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>Setiap jawaban benar = -100 HP Bos</div>
          </div>
          <span style={{ color: '#64748B', fontSize: 16, transform: formOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
        </button>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#ef4444,#f59e0b)', margin: '0 0 0 0' }} />

        {formOpen && (
          <div style={{ padding: '14px 16px' }}>
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

              <div>
                <div style={labelStyle}>Total HP Boss</div>
                <select value={form.maxHp} onChange={e => setForm(f => ({ ...f, maxHp: e.target.value }))} style={inputStyle}>
                  <option value={500}>500 HP — Mudah</option>
                  <option value={1000}>1.000 HP — Normal</option>
                  <option value={2000}>2.000 HP — Sulit</option>
                  <option value={5000}>5.000 HP — Legenda</option>
                </select>
              </div>

              {/* Boss emoji grid 2×5 */}
              <div>
                <div style={labelStyle}>Emoji Boss</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {BOSS_EMOJIS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({ ...f, bossEmoji: em }))} style={{
                      fontSize: 22, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: form.bossEmoji === em ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                      boxShadow: form.bossEmoji === em ? 'inset 0 0 0 1.5px rgba(239,68,68,0.5)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                    }}>{em}</button>
                  ))}
                </div>
              </div>

              {/* Reward section */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 2 }}>
                <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🎁 HADIAH JIKA BOSS DIKALAHKAN</div>
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
        )}
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

const TEAM_COLORS = [
  '#67E8F9', // cyan
  '#f59e0b', // amber
  '#a78bfa', // violet
  '#34d399', // emerald
  '#f472b6', // pink
  '#fb923c', // orange
  '#60a5fa', // blue
  '#a3e635', // lime
]

function TurnamenTab({ kelasDiampu }) {
  const [tournament,   setTournament]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [error,        setError]        = useState('')
  const [spectate,       setSpectate]       = useState(null)
  const [spectateSliders,setSpectateSliders] = useState({})
  const [spectateQ,      setSpectateQ]       = useState(null)
  const [form,         setForm]         = useState({
    kelasArr:           kelasDiampu.slice(0, 1),
    gameKey:            'katak',
    selectedStudentIds: null,
    mode:               'individual',
    teamCount:          2,
    teamAssignment:     'auto',   // 'auto' | 'manual'
    manualTeams:        [],       // [{ name, memberIds: string[] }]
  })
  const [students,       setStudents]       = useState([])
  const [studentsLoading,setStudentsLoading] = useState(false)
  const [liveFeed,     setLiveFeed]     = useState([])
  const [activeRound,  setActiveRound]  = useState(null) // for round pill navigation
  const [history,      setHistory]      = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const socketJoined   = useRef(false)

  // Load siswa when kelasArr changes
  useEffect(() => {
    if (!form.kelasArr.length) { setStudents([]); return }
    setStudentsLoading(true)
    apiCall('/api/guru/students')
      .then(({ students: all }) => {
        const filtered = (all || []).filter(s => form.kelasArr.includes(s.kelas))
        setStudents(filtered)
        setForm(f => ({ ...f, selectedStudentIds: filtered.map(s => String(s.userId)) }))
      })
      .catch(() => {})
      .finally(() => setStudentsLoading(false))
  }, [form.kelasArr.join(',')])

  // Fetch current tournament state + history via REST on mount
  useEffect(() => {
    apiCall('/api/guru/tournament').then(d => {
      setTournament(d.tournaments?.[0] || null)
      setLoading(false)
    }).catch(() => setLoading(false))
    apiCall('/api/guru/tournament/history').then(d => {
      setHistory(d.history || [])
      setHistoryLoading(false)
    }).catch(() => setHistoryLoading(false))
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

  // Spectate-match socket events
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
      setSpectateSliders({})
    }

    socket.on('tournament:opponent-slider', onSlider)
    socket.on('tournament:question', onQuestion)

    return () => {
      socket.off('tournament:opponent-slider', onSlider)
      socket.off('tournament:question', onQuestion)
    }
  }, [spectate?.id])

  const getSelectedIds = () => form.selectedStudentIds

  // Helper: inisialisasi manualTeams saat count berubah, pertahankan anggota yang sudah ada
  const initManualTeams = (count, existingTeams, allStudentIds) => {
    const teams = Array.from({ length: count }, (_, i) => ({
      name: existingTeams[i]?.name || `Kelompok ${i + 1}`,
      memberIds: existingTeams[i]?.memberIds || [],
    }))
    return teams
  }

  // Helper: klik siswa dalam manual assignment
  const handleManualAssign = (studentId) => {
    setForm(f => {
      const teams = f.manualTeams.length === f.teamCount
        ? f.manualTeams
        : initManualTeams(f.teamCount, f.manualTeams, [])
      const currentTeamIdx = teams.findIndex(t => t.memberIds.includes(studentId))
      if (currentTeamIdx === -1) {
        // belum ditugaskan → masuk ke tim dengan anggota paling sedikit
        const minIdx = teams.reduce((mi, t, i) => t.memberIds.length < teams[mi].memberIds.length ? i : mi, 0)
        const next = teams.map((t, i) => i === minIdx
          ? { ...t, memberIds: [...t.memberIds, studentId] }
          : t)
        return { ...f, manualTeams: next }
      } else {
        const nextTeamIdx = (currentTeamIdx + 1) % (teams.length + 1)
        if (nextTeamIdx === teams.length) {
          // kembali ke belum ditugaskan
          const next = teams.map((t, i) => i === currentTeamIdx
            ? { ...t, memberIds: t.memberIds.filter(id => id !== studentId) }
            : t)
          return { ...f, manualTeams: next }
        } else {
          // pindah ke tim berikutnya
          const next = teams.map((t, i) => {
            if (i === currentTeamIdx) return { ...t, memberIds: t.memberIds.filter(id => id !== studentId) }
            if (i === nextTeamIdx)    return { ...t, memberIds: [...t.memberIds, studentId] }
            return t
          })
          return { ...f, manualTeams: next }
        }
      }
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.kelasArr?.length || !form.gameKey) return
    const selectedIds = getSelectedIds()
    if (selectedIds.length < 2) {
      setError('Minimal 2 siswa diperlukan.')
      return
    }
    setCreating(true)
    setError('')
    try {
      const body = { kelasArr: form.kelasArr, gameKey: form.gameKey }
      if (form.selectedStudentIds.length < students.length) {
        body.selectedStudentIds = form.selectedStudentIds
      }
      body.mode = form.mode
      if (form.mode === 'kelompok') {
        if (form.teamAssignment === 'manual' && form.manualTeams.length >= 2) {
          body.teams = form.manualTeams.map(t => ({ name: t.name, memberIds: t.memberIds }))
        } else {
          body.teamCount = form.teamCount
        }
      }
      const data = await apiCall('/api/guru/tournament', { method: 'POST', body })
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

  if (loading) return (
    <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13, paddingTop: 16 }}>Memuat…</div>
  )

  // Determine which round to show (for pill nav)
  const displayRound = activeRound !== null ? activeRound : (tournament?.currentRound ? tournament.currentRound - 1 : 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!tournament ? (
        // ── Setup Form ──────────────────────────────────────────────────────
        <div style={{ background: '#1A1D27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: 1.5 }}>🏆 BUAT TURNAMEN BARU</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Kelas — multi-select checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>KELAS</span>
                <span style={{ fontSize: 10, color: '#67E8F9', fontWeight: 600 }}>
                  {form.kelasArr.length === 0 ? 'Pilih minimal 1' : `${form.kelasArr.length} dipilih`}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {kelasDiampu.map(k => {
                  const checked = form.kelasArr.includes(k)
                  return (
                    <button key={k} type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        kelasArr: checked ? f.kelasArr.filter(x => x !== k) : [...f.kelasArr, k]
                      }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'inherit', textAlign: 'left', border: 'none',
                        background: checked ? 'rgba(103,232,249,0.1)' : 'rgba(255,255,255,0.04)',
                        boxShadow: checked ? 'inset 0 0 0 1.5px #67E8F9' : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                      }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: checked ? '#67E8F9' : 'transparent',
                        border: `1.5px solid ${checked ? '#67E8F9' : '#475569'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {checked && <span style={{ color: '#0A1628', fontSize: 11, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: checked ? 700 : 500, color: checked ? '#67E8F9' : '#94A3B8' }}>{k}</span>
                    </button>
                  )
                })}
              </div>
              {form.kelasArr.length > 1 && (
                <div style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '6px 10px' }}>
                  ⚔️ Turnamen Antar Kelas — siswa dari {form.kelasArr.length} kelas akan bersaing bersama
                </div>
              )}
            </div>

            {/* Siswa Peserta — checklist */}
            {form.kelasArr.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>SISWA PESERTA</span>
                  {studentsLoading ? (
                    <span style={{ fontSize: 10, color: '#64748B' }}>Memuat…</span>
                  ) : (
                    <span style={{ fontSize: 10, color: '#67E8F9', fontWeight: 600 }}>
                      {getSelectedIds().length} / {students.length} dipilih
                    </span>
                  )}
                </div>

                {studentsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                  </div>
                ) : students.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#64748B', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'center' }}>
                    Tidak ada siswa di kelas ini
                  </div>
                ) : (
                  <>
                    {/* Tombol Pilih Semua */}
                    <button type="button"
                      onClick={() => {
                        const allIds = students.map(s => String(s.userId))
                        const curIds = getSelectedIds()
                        const allSelected = curIds.length === students.length
                        setForm(f => ({ ...f, selectedStudentIds: allSelected ? [] : allIds }))
                      }}
                      style={{
                        alignSelf: 'flex-start', padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        background: getSelectedIds().length === students.length
                          ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.06)',
                        border: getSelectedIds().length === students.length
                          ? '1px solid #67E8F9' : '1px solid rgba(255,255,255,0.1)',
                        color: getSelectedIds().length === students.length ? '#67E8F9' : '#94A3B8',
                      }}>
                      {getSelectedIds().length === students.length ? '✓ Semua Dipilih' : 'Pilih Semua'}
                    </button>

                    {/* Daftar siswa per kelas */}
                    {form.kelasArr.map(kls => {
                      const siswaDiKelas = students.filter(s => s.kelas === kls)
                      if (!siswaDiKelas.length) return null
                      const selectedIds = getSelectedIds()
                      return (
                        <div key={kls} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {form.kelasArr.length > 1 && (
                            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 0.8, paddingLeft: 2, marginBottom: 2 }}>
                              {kls}
                            </div>
                          )}
                          {siswaDiKelas.map(s => {
                            const id = String(s.userId)
                            const checked = selectedIds.includes(id)
                            return (
                              <button key={id} type="button"
                                onClick={() => {
                                  const cur = getSelectedIds()
                                  const next = cur.includes(id)
                                    ? cur.filter(x => x !== id)
                                    : [...cur, id]
                                  setForm(f => ({ ...f, selectedStudentIds: next }))
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                                  fontFamily: 'inherit', textAlign: 'left', border: 'none',
                                  background: checked ? 'rgba(103,232,249,0.07)' : 'rgba(255,255,255,0.03)',
                                  boxShadow: checked ? 'inset 0 0 0 1px rgba(103,232,249,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.07)',
                                }}>
                                <div style={{
                                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                  background: checked ? '#67E8F9' : 'transparent',
                                  border: `1.5px solid ${checked ? '#67E8F9' : '#475569'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {checked && <span style={{ color: '#0A1628', fontSize: 10, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? '#e2e8f0' : '#64748B' }}>
                                  {s.name}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}

                    {/* Peringatan jika < 2 */}
                    {getSelectedIds().length < 2 && (
                      <div style={{ fontSize: 11, color: '#f87171', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '6px 10px' }}>
                        ⚠️ Pilih minimal 2 siswa untuk memulai turnamen
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Game — horizontal scroll chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelStyle}>GAME</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {TOURNAMENT_GAMES.map(g => {
                  const sel = form.gameKey === g.key
                  const emoji = g.label.split(' ')[0]
                  const name = g.label.split(' ').slice(1).join(' ')
                  return (
                    <button key={g.key} type="button" onClick={() => setForm(f => ({ ...f, gameKey: g.key }))} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                      borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      background: sel ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.05)',
                      border: sel ? '1px solid #67E8F9' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: sel ? '0 0 8px rgba(103,232,249,0.2)' : 'none',
                      fontSize: 12, fontWeight: sel ? 700 : 500,
                      color: sel ? '#67E8F9' : '#94A3B8',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                      <span style={{ whiteSpace: 'nowrap' }}>{name}</span>
                    </button>
                  )
                })}
              </div>
              {/* Selected game info */}
              {form.gameKey && (
                <div style={{ fontSize: 11, color: '#64748B', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px' }}>
                  {TOURNAMENT_GAMES.find(g => g.key === form.gameKey)?.desc}
                </div>
              )}
            </div>

            {/* Mode Turnamen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelStyle}>MODE TURNAMEN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { value: 'individual', label: 'Individual', desc: 'Tiap siswa bertanding sendiri' },
                  { value: 'kelompok',   label: 'Kelompok',   desc: 'Siswa dibagi menjadi tim' },
                ].map(opt => {
                  const sel = form.mode === opt.value
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => setForm(f => ({ ...f, mode: opt.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                        fontFamily: 'inherit', textAlign: 'left', border: 'none',
                        background: sel ? 'rgba(103,232,249,0.07)' : 'rgba(255,255,255,0.03)',
                        boxShadow: sel ? 'inset 0 0 0 1.5px #67E8F9' : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
                        border: sel ? '5px solid #67E8F9' : '1.5px solid #475569',
                        background: sel ? '#111827' : 'transparent',
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? '#67E8F9' : '#94A3B8' }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{opt.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pengaturan Kelompok */}
            {form.mode === 'kelompok' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(103,232,249,0.03)', border: '1px solid rgba(103,232,249,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#67E8F9', fontWeight: 800, letterSpacing: 1.2 }}>PENGATURAN KELOMPOK</div>

                {/* Jumlah kelompok */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.8 }}>JUMLAH KELOMPOK</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, teamCount: Math.max(2, f.teamCount - 1), manualTeams: [] }))}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
                      −
                    </button>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#67E8F9', minWidth: 24, textAlign: 'center' }}>{form.teamCount}</span>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, teamCount: Math.min(8, f.teamCount + 1), manualTeams: [] }))}
                      style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
                      +
                    </button>
                    <span style={{ fontSize: 11, color: '#475569' }}>min 2, max 8</span>
                  </div>
                </div>

                {/* Toggle auto / manual */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.8 }}>PEMBAGIAN</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'auto', label: 'Otomatis' }, { v: 'manual', label: 'Manual' }].map(opt => {
                      const sel = form.teamAssignment === opt.v
                      return (
                        <button key={opt.v} type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            teamAssignment: opt.v,
                            manualTeams: opt.v === 'manual'
                              ? initManualTeams(f.teamCount, f.manualTeams, getSelectedIds())
                              : f.manualTeams,
                          }))}
                          style={{
                            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: 12, fontWeight: sel ? 700 : 500,
                            background: sel ? '#67E8F9' : 'rgba(255,255,255,0.06)',
                            border: sel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            color: sel ? '#0A1628' : '#94A3B8',
                          }}>
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Konten sesuai assignment */}
                {form.teamAssignment === 'auto' ? (
                  <div style={{ fontSize: 11, color: '#64748B', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6 }}>
                    ℹ️ Server akan membagi <strong style={{ color: '#94A3B8' }}>{getSelectedIds().length} siswa</strong> ke{' '}
                    <strong style={{ color: '#67E8F9' }}>{form.teamCount} kelompok</strong> secara acak
                    {' '}(±{Math.ceil(getSelectedIds().length / form.teamCount)} siswa/kelompok)
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Kelompok cards */}
                    {Array.from({ length: form.teamCount }, (_, i) => {
                      const team = form.manualTeams[i] || { name: `Kelompok ${i + 1}`, memberIds: [] }
                      const color = TEAM_COLORS[i % TEAM_COLORS.length]
                      const memberNames = team.memberIds
                        .map(id => students.find(s => String(s.userId) === id)?.name)
                        .filter(Boolean)
                      return (
                        <div key={i} style={{ borderRadius: 10, border: `1px solid ${color}33`, background: `${color}08`, padding: '8px 10px' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 6 }}>
                            {team.name} ({memberNames.length} anggota)
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {memberNames.length === 0
                              ? <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>Belum ada anggota</span>
                              : memberNames.map((n, j) => (
                                <span key={j} style={{
                                  fontSize: 11, padding: '2px 8px', borderRadius: 12,
                                  background: `${color}22`, color, border: `1px solid ${color}44`, fontWeight: 600,
                                }}>{n}</span>
                              ))}
                          </div>
                        </div>
                      )
                    })}

                    {/* Belum ditugaskan */}
                    {(() => {
                      const assignedIds = (form.manualTeams || []).flatMap(t => t.memberIds)
                      const unassigned = students
                        .filter(s => getSelectedIds().includes(String(s.userId)) && !assignedIds.includes(String(s.userId)))
                      if (unassigned.length === 0) return null
                      return (
                        <div style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '8px 10px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                            Belum ditugaskan ({unassigned.length})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {unassigned.map(s => (
                              <span key={s.userId} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: '#64748B', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Semua siswa — klik untuk assign */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: 0.8 }}>KLIK SISWA UNTUK PINDAHKAN KELOMPOK</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {students.filter(s => getSelectedIds().includes(String(s.userId))).map(s => {
                          const id = String(s.userId)
                          const teams = form.manualTeams || []
                          const teamIdx = teams.findIndex(t => t.memberIds.includes(id))
                          const color = teamIdx >= 0 ? TEAM_COLORS[teamIdx % TEAM_COLORS.length] : '#475569'
                          const label = teamIdx >= 0 ? `Kel.${teamIdx + 1}` : '—'
                          return (
                            <button key={id} type="button"
                              onClick={() => handleManualAssign(id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                                background: teamIdx >= 0 ? `${color}22` : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${teamIdx >= 0 ? color + '55' : 'rgba(255,255,255,0.1)'}`,
                                color,
                              }}>
                              <span>{s.name}</span>
                              <span style={{ fontSize: 9, opacity: 0.7 }}>{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Peringatan belum ditugaskan */}
                    {(() => {
                      const assignedIds = (form.manualTeams || []).flatMap(t => t.memberIds)
                      const unassignedCount = students
                        .filter(s => getSelectedIds().includes(String(s.userId)) && !assignedIds.includes(String(s.userId))).length
                      if (unassignedCount === 0) return null
                      return (
                        <div style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '6px 10px' }}>
                          ⚠️ {unassignedCount} siswa belum ditugaskan ke kelompok mana pun
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Format — cosmetic radio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={labelStyle}>FORMAT</div>
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

            <button type="submit" disabled={creating || !form.kelasArr?.length || getSelectedIds().length < 2} style={{
              background: creating || !form.kelasArr?.length || getSelectedIds().length < 2 ? 'rgba(180,83,9,0.3)' : '#b45309',
              color: '#fff', border: 'none', borderRadius: 14, padding: '16px',
              fontSize: 16, fontWeight: 700, cursor: creating || !form.kelasArr?.length || getSelectedIds().length < 2 ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: creating || !form.kelasArr?.length || getSelectedIds().length < 2 ? 0.5 : 1,
              boxShadow: !creating && form.kelasArr?.length && getSelectedIds().length >= 2 ? '0 4px 12px rgba(180,83,9,0.3)' : 'none',
              marginTop: 8,
            }}>
              {creating
                ? '⏳ Memulai…'
                : form.kelasArr?.length > 1
                  ? `🏆 Mulai Turnamen Antar Kelas (${form.kelasArr.length} kelas)`
                  : `🏆 Mulai Turnamen — ${form.kelasArr?.[0] || '…'}`}
            </button>
          </form>
        </div>
      ) : (
        // ── Bracket View ─────────────────────────────────────────────────────
        <>
          {/* Podium / Champion banner */}
          {tournament.champion && (
            <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800 }}>JUARA TURNAMEN</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{tournament.champion.name}</div>
                </div>
              </div>
              {(tournament.runnerUp || tournament.semifinalists?.length > 0) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {tournament.runnerUp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(148,163,184,0.1)', borderRadius: 20, padding: '4px 10px' }}>
                      <span>🥈</span>
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>{tournament.runnerUp.name}</span>
                    </div>
                  )}
                  {tournament.semifinalists?.map(s => (
                    <div key={s.userId} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(205,124,58,0.1)', borderRadius: 20, padding: '4px 10px' }}>
                      <span>🥉</span>
                      <span style={{ fontSize: 12, color: '#cd7c3a', fontWeight: 700 }}>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary stats bar */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { icon: '🎮', label: 'Game', value: TOURNAMENT_GAMES.find(g => g.key === tournament.gameKey)?.label?.split(' ').slice(1,3).join(' ') || tournament.gameKey },
              { icon: '👥', label: 'Peserta', value: `${tournament.rounds?.[0]?.matches?.reduce((a,m) => a + (m.player1 ? 1 : 0) + (m.player2 ? 1 : 0), 0) ?? '?'} siswa` },
              { icon: '⏱️', label: 'Ronde', value: `${tournament.currentRound} / ${tournament.rounds?.length ?? '?'}` },
              { icon: '📊', label: 'Status', value: tournament.status === 'finished' ? 'Selesai' : 'Berlangsung' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 1, fontWeight: 500 }}>{stat.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Round navigation pills */}
          {tournament.rounds && tournament.rounds.length > 1 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {tournament.rounds.map((round, ri) => {
                const isLive = ri + 1 === tournament.currentRound && tournament.status !== 'finished'
                const isDone = ri + 1 < tournament.currentRound
                const isActive = displayRound === ri
                const roundLabel = round.label || `Ronde ${ri + 1}`
                return (
                  <button key={ri} onClick={() => setActiveRound(ri)} style={{
                    flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
                    background: isActive
                      ? (isLive ? 'rgba(248,113,113,0.2)' : isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.12)')
                      : 'rgba(255,255,255,0.04)',
                    color: isActive
                      ? (isLive ? '#f87171' : isDone ? '#10b981' : '#fff')
                      : '#64748B',
                    boxShadow: isActive ? `inset 0 0 0 1px ${isLive ? 'rgba(248,113,113,0.4)' : isDone ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.2)'}` : 'none',
                  }}>
                    {isLive ? '🔴 ' : isDone ? '✓ ' : ''}{roundLabel}
                  </button>
                )
              })}
            </div>
          )}

          {/* Bracket for selected round */}
          {tournament.rounds?.[displayRound] && (() => {
            const round = tournament.rounds[displayRound]
            const ri = displayRound
            const isLive = ri + 1 === tournament.currentRound && tournament.status !== 'finished'
            return (
              <div style={{ background: '#111827', borderRadius: 16, border: `1px solid ${isLive ? 'rgba(103,232,249,0.2)' : 'rgba(255,255,255,0.06)'}`, padding: 16 }}>
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
                        border: `1px solid ${isMatchLive ? 'rgba(103,232,249,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: 12, padding: isMatchLive ? 16 : '12px 14px',
                      }}>
                        {isMatchLive && m.player1 && m.player2 ? (
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
          })()}

          {/* Live Feed */}
          {liveFeed.length > 0 && (
            <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
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

      {/* Riwayat Turnamen — shown when no active tournament */}
      {!tournament && (
        <div style={{ background: '#1A1D27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 800, letterSpacing: 1.5, marginBottom: 14 }}>📜 RIWAYAT TURNAMEN</div>
          {historyLoading ? (
            <div style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '12px 0' }}>Memuat…</div>
          ) : history.length === 0 ? (
            <div style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: '12px 0' }}>Belum ada turnamen yang pernah digelar.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(h => {
                const gameLabel = TOURNAMENT_GAMES.find(g => g.key === h.game_key)?.label || h.game_key
                const gameEmoji = gameLabel.split(' ')[0]
                const gameName  = gameLabel.split(' ').slice(1).join(' ')
                const isFinished = h.status === 'finished'
                const finishedDate = h.finished_at ? new Date(h.finished_at) : null
                const date = finishedDate && !isNaN(finishedDate) ? finishedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null
                const time = finishedDate && !isNaN(finishedDate) ? finishedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
                return (
                  <div key={h.id} style={{
                    background: '#111827', borderRadius: 12,
                    border: `1px solid ${isFinished ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ fontSize: 18 }}>{gameEmoji}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gameName}</div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                        {h.kelas_arr?.length > 1 ? `⚔️ ${h.kelas_arr.join(', ')}` : h.kelas}
                      </div>
                        </div>
                      </div>
                      <span style={{
                        flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                        background: isFinished ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)',
                        color: isFinished ? '#fbbf24' : '#f87171',
                      }}>
                        {isFinished ? '🏆 Selesai' : '🛑 Dibatalkan'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {isFinished && h.champion_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 13 }}>🥇</span>
                          <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>{h.champion_name}</span>
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>👥</span> {h.total_participants} peserta
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🔄</span> {h.total_rounds} ronde
                      </div>
                      <div style={{ fontSize: 11, color: '#475569', marginLeft: 'auto', textAlign: 'right' }}>
                        {date} · {time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
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
            {spectate.player1 && spectate.player2 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[
                  { p: spectate.player1, color: '#67E8F9', emoji: '🐸' },
                  { p: spectate.player2, color: '#f59e0b', emoji: '🔥' },
                ].map(({ p, color, emoji }) => {
                  const score = spectate.scores?.[p.userId] ?? 0
                  const sliderVal = spectateSliders[String(p.userId)] ?? 0
                  const sliderPct = Math.max(0, Math.min(100, ((sliderVal + 20) / 40) * 100))
                  return (
                    <div key={p.userId} style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${color}33`, borderRadius: 14, padding: '12px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 11, color, fontWeight: 700, marginBottom: 4 }}>{emoji} {p.name}</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color }}>{score}</div>
                      <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>soal benar</div>
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
function GuruHomeTab({ kelasDiampu, user, logout, onPlayGames, onGoProfile, onSelectTab, hideHeader = false }) {
  const [tugas, setTugas]             = useState(() => guruCacheGet('home_tugas') ?? [])
  const [homeStats, setHomeStats]     = useState(() => guruCacheGet('home_stats') ?? null)
  const hasCache                      = !!(guruCacheGet('home_tugas') && guruCacheGet('home_stats'))
  const [loading, setLoading]         = useState(!hasCache)
  const [loadPct, setLoadPct]         = useState(0)
  const [activeClass, setActiveClass] = useState('Semua kelas')
  const isDesktop = useIsDesktop()
  const isNative  = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true

  useEffect(() => {
    let done = 0
    const onOne = () => { done++; setLoadPct(done * 50); if (done === 2) setLoading(false) }
    apiCall('/api/guru/tugas')
      .then(d => { const t = d.tugas || []; setTugas(t); guruCacheSet('home_tugas', t) })
      .catch(() => {}).finally(onOne)
    apiCall('/api/guru/home-stats')
      .then(d => { setHomeStats(d); guruCacheSet('home_stats', d) })
      .catch(() => {}).finally(onOne)
  }, [])

  const classes = ['Semua kelas', ...kelasDiampu]
  const filteredTugas = activeClass === 'Semua kelas' ? tugas : tugas.filter(t => t.kelas === activeClass)
  const activeTugas   = tugas.filter(t => t.status === 'active')
  const studentCount  = homeStats?.studentCount ?? 0
  const nilaiCount    = homeStats?.nilaiCount ?? 0
  const avgScore      = nilaiCount > 0
    ? String(homeStats.avgScore).replace('.', ',')
    : '—'

  const nama     = user?.name || 'Guru'
  const hour     = new Date().getHours()
  const greeting = hour < 11 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam'
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  const metrics = [
    { label: 'Siswa',      value: studentCount,             detail: `${kelasDiampu.length} kelas`,                              icon: '👥', accent: '#9fe3bd',  bg: 'rgba(159,227,189,0.12)' },
    { label: 'Tugas Aktif', value: activeTugas.length,      detail: 'berjalan',                                                  icon: '📋', accent: '#d7c7ff',  bg: 'rgba(215,199,255,0.12)' },
    { label: 'Rata-rata',   value: avgScore,                 detail: nilaiCount > 0 ? `${nilaiCount} nilai` : 'Belum ada',        icon: '🎓', accent: '#f5cf9c', bg: 'rgba(245,207,156,0.12)' },
    { label: 'Kelas',       value: kelasDiampu.length,       detail: kelasDiampu[0] || '—',                                      icon: '📅', accent: '#67E8F9',  bg: 'rgba(103,232,249,0.12)' },
  ]

  const classColor = (kelas) => {
    const idx = kelasDiampu.indexOf(kelas)
    return ['#9fe3bd', '#d7c7ff', '#f5cf9c', '#a8d7ec'][idx % 4]
  }

  // Web browser: tampilkan loading screen dengan persentase (hanya saat tidak ada cache)
  if (loading && !isNative) {
    return <GuruDataLoadingScreen pct={loadPct} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingBottom: 8 }}>

      {/* ── Hero greeting ── */}
      <div style={{ padding: isDesktop ? '28px 0 20px' : '20px 16px 16px' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9fe3bd', display: 'inline-block' }} />
          {todayStr}
        </div>
        <h1 style={{ fontSize: isDesktop ? 32 : 24, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
          Selamat {greeting}, <span style={{ color: '#9fe3bd' }}>{nama.split(' ')[0]}.</span>
        </h1>
        <p style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
          {loading ? 'Memuat data kelas…' : `${kelasDiampu.length} kelas · ${activeTugas.length} tugas aktif · ${studentCount} siswa`}
        </p>
      </div>

      {/* ── Metric strip — horizontal scroll ── */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: isDesktop ? '0 0 16px' : '0 16px 16px', scrollbarWidth: 'none' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            flexShrink: 0, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
            background: '#111827', padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12, minWidth: 140,
          }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: m.bg, color: m.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{loading ? '—' : m.value}</div>
              <div style={{ fontSize: 11, color: m.accent, marginTop: 2, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>{m.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick action pills ── */}
      <div style={{ display: 'flex', gap: 10, padding: isDesktop ? '0 0 20px' : '0 16px 20px' }}>
        <button onClick={() => onSelectTab('tugas')} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'linear-gradient(135deg,rgba(159,227,189,0.18),rgba(159,227,189,0.08))',
          border: '1px solid rgba(159,227,189,0.3)', color: '#9fe3bd',
          borderRadius: 24, padding: '13px 16px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>📋 Tetapkan Tugas</button>
        <button onClick={() => onSelectTab('raid')} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.08))',
          border: '1px solid rgba(239,68,68,0.3)', color: '#F87171',
          borderRadius: 24, padding: '13px 16px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>⚔️ Mulai Boss Raid</button>
      </div>

      {/* ── Task list ── */}
      <div style={{ padding: isDesktop ? '0 0 20px' : '0 16px 20px' }}>
        {/* Header + class filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Tugas Aktif</div>
          <button onClick={() => onSelectTab('tugas')} style={{ fontSize: 11, color: '#9fe3bd', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Lihat semua →</button>
        </div>
        {/* Class filter pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', marginBottom: 8 }}>
          {classes.map(c => (
            <button key={c} onClick={() => setActiveClass(c)} style={{
              flexShrink: 0, borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 600,
              background: activeClass === c ? '#9fe3bd' : 'rgba(255,255,255,0.04)',
              color: activeClass === c ? '#12302e' : '#64748B',
              border: activeClass === c ? '1px solid #9fe3bd' : '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>

        {/* Task rows — compact */}
        {loading ? (
          <div style={{ color: '#64748B', fontSize: 13 }}>Memuat…</div>
        ) : filteredTugas.length === 0 ? (
          <div style={{ color: '#374151', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            Belum ada tugas untuk kelas ini.
          </div>
        ) : (
          <div style={{ background: '#111827', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {filteredTugas.slice(0, 6).map((t, i) => {
              const isActive = t.status === 'active'
              const color = classColor(t.kelas)
              return (
                <button key={t.id} onClick={() => onSelectTab('tugas')} style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 10,
                  borderBottom: i < Math.min(filteredTugas.length, 6) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  padding: '12px 14px', textAlign: 'left', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{
                    flexShrink: 0, fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
                    background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#34D399' : '#64748B',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{isActive ? 'Aktif' : 'Tutup'}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#e0eae7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.game_name || t.gameName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2, fontSize: 10, color: '#64748B' }}>
                      <span>{t.kelas}</span>
                      <span>·</span>
                      <span>{t.total_questions} soal</span>
                      {t.due_at && <><span>·</span><span>Tenggat {new Date(t.due_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></>}
                    </span>
                  </span>
                  <span style={{ color: '#374151', fontSize: 14, flexShrink: 0 }}>›</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Class summary ── */}
      {!loading && kelasDiampu.length > 0 && (
        <div style={{ padding: isDesktop ? '0 0 20px' : '0 16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Ringkasan Kelas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {kelasDiampu.map((kelas, idx) => {
              const colorPairs = [['#9fe3bd','rgba(159,227,189,0.1)'],['#d7c7ff','rgba(215,199,255,0.1)'],['#f5cf9c','rgba(245,207,156,0.1)'],['#67E8F9','rgba(103,232,249,0.1)']]
              const [accent, bg] = colorPairs[idx % 4]
              const cnt = homeStats?.studentsByClass?.[kelas] ?? 0
              const aktif = activeTugas.filter(t => t.kelas === kelas).length
              return (
                <button key={kelas} onClick={() => onSelectTab('siswa')} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#111827', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
                  padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
                }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: bg, color: accent, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, letterSpacing: -0.5 }}>
                    {kelas.replace(/[^A-Z0-9]/gi,'').substring(0,4).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kelas}</span>
                    <span style={{ display: 'block', fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {cnt} siswa · {aktif > 0 ? `${aktif} tugas aktif` : 'tidak ada tugas aktif'}
                    </span>
                  </span>
                  <span style={{ color: '#374151', fontSize: 14, flexShrink: 0 }}>›</span>
                </button>
              )
            })}
          </div>
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
      if (key === 'profile') { setView('profile'); return }
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

  const currentTabInfo = TABS.find(t => t.id === tab)

  // ── Desktop layout — left sidebar + content ──
  if (isDesktop) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', background: '#0A0B14', position: 'relative', display: 'flex' }}>
        {/* Background blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '45%', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(100px)' }} />
        </div>

        {/* ── Left Sidebar 220px ── */}
        <div style={{
          width: 220, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20,
          background: 'rgba(10,11,20,0.97)', backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Logo + user info */}
          <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: '#9fe3bd', color: '#0b2c2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, letterSpacing: '-0.05em', flexShrink: 0 }}>TM</span>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.12em', color: '#9fe3bd', textTransform: 'uppercase' }}>SMARTISA</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Ruang Guru</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#d7c7ff', color: '#3d286c', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(user?.name || 'G').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Guru'}</div>
                <div style={{ fontSize: 10, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(user?.kelas || []).slice(0, 2).join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Tab list */}
          <nav style={{ flex: 1, padding: '10px 10px' }}>
            {DESKTOP_TABS.map(({ id, icon, text }) => {
              const active = tab === id
              return (
                <button key={id} onClick={() => selectTab(id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, marginBottom: 3,
                  background: active ? 'rgba(159,227,189,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(159,227,189,0.2)' : '1px solid transparent',
                  color: active ? '#9fe3bd' : '#64748B',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                  transition: 'all 0.12s',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar actions bottom */}
          <div style={{ padding: '10px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={onPlayGames} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              borderRadius: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
              color: '#34D399', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            }}>🎮 <span>Media Ajar</span></button>
            <button onClick={() => setView('profile')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
              color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            }}>👤 <span>Profil Saya</span></button>
            <button onClick={logout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              borderRadius: 12, background: 'transparent', border: '1px solid rgba(239,68,68,0.12)',
              color: '#F87171', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            }}>⏻ <span>Keluar</span></button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div style={{ flex: 1, marginLeft: 220, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {/* Topbar */}
          <div style={{
            padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(10,11,20,0.92)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0, zIndex: 50,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{currentTabInfo?.label}</span>
                {currentTabInfo?.text}
              </div>
              <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600, marginTop: 1 }}>
                {user?.name} · {kelasDiampu.join(', ') || 'Guru'}
              </div>
            </div>
            <MessageNotificationBell onClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} suppress={tab === 'komunikasi'} />
            <AppNotificationBell onCommunicationClick={target => { setKomunikasiTarget(target || null); selectTab('komunikasi') }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 32px', width: '100%', maxWidth: 1280 }}>
            {tabContent}
          </div>
        </div>

        <PublicProfileModal profile={publicProfile.profile} loading={publicProfile.loading} error={publicProfile.error} onClose={publicProfile.closeProfile} />
      </div>
    )
  }

  // ── Mobile layout — fully fixed shell ──
  // AppShell header is fixed at top (64px). Bottom nav is fixed at bottom.
  // Scrollable content fills the space between them via fixed inset positioning.
  // This mirrors the siswa AppShell pattern and is immune to height arithmetic errors.
  const navBottom = 'calc(56px + max(18px, env(safe-area-inset-bottom)))'
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A0B14', zIndex: 0 }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '60%', height: '45%', borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(100px)' }} />
      </div>

      {/* ── Scrollable Content — fixed between header and bottom nav ── */}
      <div style={{
        position: 'fixed', top: 64, left: 0, right: 0, bottom: navBottom,
        overflowY: 'auto', overflowX: 'hidden',
        zIndex: 1, WebkitOverflowScrolling: 'touch', touchAction: 'pan-y',
      }}>
        {tab !== 'home' && (
          <div style={{ padding: '16px 16px 0' }}>
            {tabContent}
          </div>
        )}
        {tab === 'home' && tabContent}
        <div style={{ height: 16 }} />
        <PublicProfileModal profile={publicProfile.profile} loading={publicProfile.loading} error={publicProfile.error} onClose={publicProfile.closeProfile} />
      </div>

      {/* ── Fixed Bottom Nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
        paddingTop: 4, paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
        paddingLeft: 4, paddingRight: 4,
        background: 'rgba(10,11,20,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        minHeight: 56,
      }}>
        {PRIMARY_TABS.map(({ id, icon, label }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => { selectTab(id); setShowMoreMenu(false) }} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, border: 'none', background: 'none', cursor: 'pointer',
              color: active ? '#34D399' : '#4B5563', fontFamily: 'inherit',
              padding: '6px 2px', position: 'relative', minHeight: 48,
              justifyContent: 'center',
            }}>
              {active && <span style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 20, height: 3, borderRadius: 99, background: '#34D399',
              }} />}
              <span style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{icon}</span>
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
          minHeight: 48, justifyContent: 'center',
        }}>
          {(showMoreMenu || isMoreTab) && (
            <span style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 20, height: 3, borderRadius: 99, background: '#A78BFA',
            }} />
          )}
          <span style={{ fontSize: 22, opacity: showMoreMenu || isMoreTab ? 1 : 0.5 }}>☰</span>
          <small style={{ fontSize: 9, fontWeight: showMoreMenu || isMoreTab ? 800 : 500 }}>Lainnya</small>
        </button>
      </nav>

      {/* ── More Menu Sheet — vertical list ── */}
      {showMoreMenu && (
        <>
          <div onClick={() => setShowMoreMenu(false)} style={{
            position: 'fixed', inset: 0, zIndex: 11, background: 'rgba(0,0,0,0.55)',
          }} />
          <div style={{
            position: 'fixed', bottom: 'calc(56px + max(18px, env(safe-area-inset-bottom)))', left: 8, right: 8, zIndex: 12,
            background: '#12131f', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.09)',
            overflow: 'hidden',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 16px 8px' }}>Menu Lainnya</div>
            {MORE_TABS.map(({ id, icon, label }) => {
              const active = tab === id
              return (
                <button key={id} onClick={() => { selectTab(id); setShowMoreMenu(false) }} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', border: 'none',
                  background: active ? 'rgba(167,139,250,0.08)' : 'transparent',
                  color: active ? '#A78BFA' : '#94A3B8',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxSizing: 'border-box',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0, width: 24, textAlign: 'center' }}>{icon}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 700 : 500 }}>{label}</span>
                  <span style={{ fontSize: 16, color: active ? '#A78BFA' : '#374151', flexShrink: 0 }}>›</span>
                </button>
              )
            })}
            <div style={{ height: 6 }} />
          </div>
        </>
      )}
    </div>
  )
}
