import React, { useState, useEffect, useCallback } from 'react'

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

function HafalanDots({ count, total = 10, color }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i < count ? color : 'rgba(255,255,255,0.12)',
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function StudentList({ students, loading, error, onSelect }) {
  if (loading) return <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>
  if (error) return <div style={{ padding: 16, color: '#F87171', fontSize: 13 }}>{error}</div>
  if (students.length === 0) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
      Belum ada siswa terdaftar di kelas Anda.
    </div>
  )

  const byKelas = {}
  for (const s of students) (byKelas[s.kelas] ||= []).push(s)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 32px' }}>
      {Object.entries(byKelas).map(([kelas, list]) => (
        <div key={kelas}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            {kelas} — {list.length} siswa
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {list.map(s => {
              const total = s.hafalanPerkalian + s.hafalanPembagian
              return (
                <button key={s.id} onClick={() => onSelect(s)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#1A1D27', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366F1,#A855F7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: '#fff',
                  }}>{s.name[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
                      <HafalanDots count={s.hafalanPerkalian} color="#34D399" />
                      <HafalanDots count={s.hafalanPembagian} color="#60A5FA" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                      background: total > 0 ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)',
                      color: total > 0 ? '#FBBF24' : '#6B7280',
                      border: `1px solid ${total > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    }}>🧮 {total}/20</div>
                    <div style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>→</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function AssessView({ student, onBack }) {
  const [jenis, setJenis] = useState('perkalian')
  const [selectedAngka, setSelectedAngka] = useState(null)
  const [status, setStatus] = useState(null)      // per-table latest status map
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await apiCall(`/api/guru/hafalan/student/${student.id}`)
      setStatus(data.status)
      setHistory(data.history)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [student.id])

  useEffect(() => { load() }, [load])

  const getTableStatus = (j, a) => status?.[j]?.[a] || null

  const submit = async (result) => {
    if (!selectedAngka || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const data = await apiCall('/api/guru/hafalan', {
        method: 'POST',
        body: { studentId: student.id, jenis, angka: selectedAngka, status: result },
      })
      setStatus(data.status)
      setHistory(data.history)
      setSelectedAngka(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const tableColor = (j, a) => {
    const s = getTableStatus(j, a)
    if (s === 'lulus') return { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', text: '#34D399', icon: '✓' }
    if (s === 'diulang') return { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', text: '#F87171', icon: '↺' }
    return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#94A3B8', icon: '' }
  }

  const symbol = jenis === 'perkalian' ? '×' : '÷'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Student header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366F1,#A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff',
        }}>{student.name[0]?.toUpperCase()}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{student.name}</div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{student.kelas}</div>
        </div>
      </div>

      {loading && <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>Memuat…</div>}

      {!loading && (
        <>
          {/* Jenis tab */}
          <div style={{ display: 'flex', gap: 6, padding: '14px 0 12px' }}>
            {['perkalian', 'pembagian'].map(j => (
              <button key={j} onClick={() => { setJenis(j); setSelectedAngka(null) }} style={{
                flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                background: jenis === j ? '#6366F1' : 'rgba(255,255,255,0.07)',
                color: jenis === j ? '#fff' : '#94A3B8',
              }}>{j === 'perkalian' ? '✖ Perkalian' : '➗ Pembagian'}</button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 14 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(a => {
              const c = tableColor(jenis, a)
              const isSelected = selectedAngka === a
              return (
                <button key={a} onClick={() => setSelectedAngka(isSelected ? null : a)} style={{
                  padding: '12px 0', borderRadius: 12, border: `2px solid ${isSelected ? '#818CF8' : c.border}`,
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3,
                  background: isSelected ? 'rgba(99,102,241,0.25)' : c.bg,
                  color: isSelected ? '#c7d2fe' : c.text,
                  transition: 'all 0.1s',
                }}>
                  <div style={{ fontSize: 9, opacity: 0.7 }}>{symbol}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{a}</div>
                  {c.icon && <div style={{ fontSize: 9 }}>{c.icon}</div>}
                </button>
              )
            })}
          </div>

          {/* Action panel */}
          <div style={{
            background: '#1A1D27', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
            padding: 16, marginBottom: 14,
          }}>
            {selectedAngka ? (
              <>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>Menilai Setoran</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 12 }}>
                  {jenis === 'perkalian' ? 'Perkalian' : 'Pembagian'} {symbol} {selectedAngka}
                </div>
                {error && <div style={{ color: '#F87171', fontSize: 12, marginBottom: 8, textAlign: 'center' }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => submit('diulang')} disabled={submitting} style={{
                    flex: 1, padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
                    background: submitting ? '#1f1315' : 'rgba(239,68,68,0.2)',
                    color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>✕ DIULANG</button>
                  <button onClick={() => submit('lulus')} disabled={submitting} style={{
                    flex: 1, padding: '13px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 800,
                    background: submitting ? '#0f2318' : 'rgba(52,211,153,0.2)',
                    color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>✓ LULUS</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#6B7280', fontSize: 13, padding: '8px 0' }}>
                Pilih nomor hafalan di atas untuk menilai
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Riwayat Terakhir
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#1A1D27', borderRadius: 10, padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ flex: 1, fontSize: 13, color: '#fff', fontWeight: 600 }}>
                      {h.jenis === 'perkalian' ? 'Perkalian ×' : 'Pembagian ÷'}{h.angka}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{formatTime(h.dinilai_at)}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                      background: h.status === 'lulus' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                      color: h.status === 'lulus' ? '#34D399' : '#F87171',
                    }}>{h.status === 'lulus' ? 'LULUS' : 'DIULANG'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function GuruHafalanScreen() {
  const [view, setView] = useState('list') // 'list' | 'assess'
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { students } = await apiCall('/api/guru/hafalan/students')
      setStudents(students)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStudents() }, [loadStudents])

  const handleSelect = (s) => {
    setSelectedStudent(s)
    setView('assess')
  }

  const handleBack = () => {
    setView('list')
    setSelectedStudent(null)
    loadStudents() // refresh hafalan counts
  }

  return (
    <div>
      {view === 'assess' && selectedStudent ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <button onClick={handleBack} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94A3B8',
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}>← Kembali</button>
          </div>
          <AssessView student={selectedStudent} onBack={handleBack} />
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
              <div style={{ fontSize: 10, color: '#34D399', fontWeight: 700 }}>Perkalian (×1–×10)</div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', marginLeft: 8 }} />
              <div style={{ fontSize: 10, color: '#60A5FA', fontWeight: 700 }}>Pembagian (÷1–÷10)</div>
            </div>
          </div>
          <StudentList students={students} loading={loading} error={error} onSelect={handleSelect} />
        </>
      )}
    </div>
  )
}
