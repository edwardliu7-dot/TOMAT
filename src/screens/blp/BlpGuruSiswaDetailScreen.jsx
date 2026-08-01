import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { hitungSkor, AKTIVITAS_LIST } from './blpAktivitasData.js'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'

function SkorBadge({ skor }) {
  const color = skor >= 80 ? '#10b981' : skor >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: `${color}22`, border: `1px solid ${color}55`,
      borderRadius: 10, padding: '3px 10px',
      fontSize: 12, fontWeight: 800, color,
    }}>
      {skor}%
    </span>
  )
}

export default function BlpGuruSiswaDetailScreen({ goBack, studentId }) {
  const { data, loading, error: ctxError, loadDashboard, patchSubmission } = useBlpData()
  const [reviewing, setReviewing] = useState(false)
  const [expandedDate, setExpandedDate] = useState(null)

  useEffect(() => { loadDashboard() }, [studentId])

  const student = data
    ? (studentId ? Object.values(data.students || {}).find(s => s.id === studentId) : Object.values(data.students || {})[0]) || null
    : null
  const error = ctxError || (!loading && data && !student ? 'Data siswa tidak ditemukan' : null)

  async function handleReview(date, activityId) {
    if (!student) return
    setReviewing(true)
    try {
      await fetch(`/api/blp/students/${student.id}/records/${date}/submissions/${activityId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'reviewed' }),
      })
      patchSubmission(student.id, date, activityId, { reviewed: true })
    } catch {}
    setReviewing(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  if (error || !student) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ color: '#ef4444', fontSize: 14 }}>{error || 'Data tidak ditemukan'}</div>
      <button onClick={goBack} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kembali</button>
    </div>
  )

  const records = student.records || {}
  const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a))
  const thisMonth = new Date().toISOString().slice(0, 7)
  const skorsThisMonth = sortedDates
    .filter(d => d.startsWith(thisMonth))
    .map(d => hitungSkor(records[d].completedActivities, false))
  const avgSkor = skorsThisMonth.length
    ? Math.round(skorsThisMonth.reduce((a, b) => a + b, 0) / skorsThisMonth.length)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title={student.name} onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Info siswa */}
        <div style={{
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 16, padding: '16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{student.name}</div>
          <div style={{ fontSize: 12, color: '#6ee7b7', marginBottom: 2 }}>Kelas: {student.kelas}</div>
          {student.email && <div style={{ fontSize: 12, color: '#9ca3af' }}>Email: {student.email}</div>}
          {student.whatsapp && <div style={{ fontSize: 12, color: '#9ca3af' }}>WA: {student.whatsapp}</div>}
          {student.jenisKelamin && (
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Jenis Kelamin: {student.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}
            </div>
          )}
          {student.quranBookmark && (
            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: 'rgba(16,185,129,0.1)', borderRadius: 10,
              fontSize: 12, color: '#6ee7b7',
            }}>
              📖 Penanda Quran: {student.quranBookmark.surahName} ayat {student.quranBookmark.ayat}
            </div>
          )}
        </div>

        {/* Statistik */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Total Hari', value: sortedDates.length, color: '#10b981' },
            { label: 'Bulan Ini', value: skorsThisMonth.length, color: '#6366f1' },
            { label: 'Rata-rata', value: `${avgSkor}%`, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: 12, padding: '12px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Riwayat haid */}
        {student.haidPeriods?.length > 0 && (
          <div style={{
            background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)',
            borderRadius: 14, padding: '14px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, color: '#f9a8d4', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              RIWAYAT HAID
            </div>
            {student.haidPeriods.slice(0, 3).map(h => (
              <div key={h.id} style={{ fontSize: 12, color: '#e5e7eb', padding: '4px 0' }}>
                {new Date(h.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' → '}
                {h.endDate
                  ? new Date(h.endDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : <span style={{ color: '#ec4899' }}>berlangsung</span>}
              </div>
            ))}
          </div>
        )}

        {/* Daftar record */}
        {sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px 0', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            Belum ada riwayat BLP untuk siswa ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              RIWAYAT CATATAN BLP ({sortedDates.length} hari)
            </div>
            {sortedDates.map(dateStr => {
              const rec = records[dateStr]
              const skor = hitungSkor(rec.completedActivities, false)
              const isExpanded = expandedDate === dateStr
              const hasSubmissions = rec.submissions && Object.keys(rec.submissions).length > 0
              const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
              })

              return (
                <div key={dateStr} style={{
                  background: isExpanded ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isExpanded ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : dateStr)}
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: 'transparent', border: 'none',
                      color: '#fff', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{dateLabel}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {rec.completedActivities?.length ?? 0}/{AKTIVITAS_LIST.length} aktivitas
                          {hasSubmissions && ' • 📎 Ada submission'}
                        </div>
                      </div>
                      <SkorBadge skor={skor} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ paddingTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: hasSubmissions ? 12 : 0 }}>
                        {AKTIVITAS_LIST.map(a => {
                          const done = rec.completedActivities?.includes(a.id)
                          return (
                            <span key={a.id} style={{
                              fontSize: 11, padding: '4px 8px', borderRadius: 8,
                              background: done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                              color: done ? '#6ee7b7' : '#4b5563',
                              border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            }}>
                              {a.emoji} {done ? '✓' : '✗'}
                            </span>
                          )
                        })}
                      </div>

                      {hasSubmissions && (
                        <div style={{
                          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                          borderRadius: 10, padding: '10px 12px', marginTop: 4,
                        }}>
                          <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 700, marginBottom: 8 }}>
                            📎 SUBMISSION SISWA
                          </div>
                          {Object.entries(rec.submissions).map(([actId, sub]) => {
                            const activity = AKTIVITAS_LIST.find(a => a.id === actId)
                            return (
                              <div key={actId} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                              }}>
                                <div>
                                  <div style={{ fontSize: 12, color: '#e5e7eb' }}>
                                    {activity?.emoji} {activity?.label || actId}
                                  </div>
                                  {sub.reviewedAt && (
                                    <div style={{ fontSize: 10, color: '#10b981', marginTop: 2 }}>
                                      ✅ Ditinjau {new Date(sub.reviewedAt).toLocaleDateString('id-ID')}
                                    </div>
                                  )}
                                </div>
                                {!sub.reviewedAt && (
                                  <button
                                    onClick={() => handleReview(dateStr, actId)}
                                    disabled={reviewing}
                                    style={{
                                      background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
                                      borderRadius: 8, padding: '5px 10px', color: '#6ee7b7',
                                      fontFamily: 'inherit', cursor: reviewing ? 'not-allowed' : 'pointer',
                                      fontSize: 11, fontWeight: 700,
                                    }}
                                  >
                                    Tandai Ditinjau
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
