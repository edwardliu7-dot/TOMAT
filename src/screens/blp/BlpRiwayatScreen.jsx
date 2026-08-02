import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { BLP_CATEGORIES } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'

function getSkorForRecord(record, dateStr, haidPeriods = []) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  const total = getEffectiveTotalActivities(dateObj)
  const done  = getEffectiveCompletedCount(dateObj, record.completedActivities || [], haidPeriods)
  return total > 0 ? Math.round((done / total) * 100) : 0
}

function SkorBar({ skor }) {
  const color = skor >= 80 ? '#10b981' : skor >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${skor}%`, background: color, borderRadius: 6 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, width: 36, textAlign: 'right' }}>{skor}%</span>
    </div>
  )
}

export default function BlpRiwayatScreen({ goBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [student, setStudent] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/blp/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) { setError(json.error); setLoading(false); return }
        setStudent(Object.values(json.students || {})[0])
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError('Gagal memuat data'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
      <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>
      <button onClick={goBack} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kembali</button>
    </div>
  )

  const records = student?.records || {}
  const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a))

  const selectedRecord = selectedDate ? records[selectedDate] : null
  const haidPeriods = student?.haidPeriods || []
  const selectedSkor = selectedRecord ? getSkorForRecord(selectedRecord, selectedDate, haidPeriods) : 0

  // Statistik keseluruhan
  const allSkors = sortedDates.map(d => getSkorForRecord(records[d], d, haidPeriods))
  const avgSkor = allSkors.length ? Math.round(allSkors.reduce((a, b) => a + b, 0) / allSkors.length) : 0
  const bestSkor = allSkors.length ? Math.max(...allSkors) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Riwayat BLP" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Statistik umum */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Hari Terisi', value: sortedDates.length, color: '#10b981' },
            { label: 'Rata-rata Skor', value: `${avgSkor}%`, color: '#f59e0b' },
            { label: 'Skor Terbaik', value: `${bestSkor}%`, color: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 14, padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {sortedDates.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: '#6b7280', fontSize: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            Belum ada riwayat BLP.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedDates.map(dateStr => {
              const rec = records[dateStr]
              const skor = getSkorForRecord(rec, dateStr, haidPeriods)
              const isSelected = selectedDate === dateStr
              const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <div key={dateStr} style={{
                  background: isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSelected ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    style={{
                      width: '100%', padding: '14px 16px',
                      background: 'transparent', border: 'none',
                      color: '#fff', fontFamily: 'inherit', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{dateLabel}</div>
                    <SkorBar skor={skor} />
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                      {rec.completedActivities?.length ?? 0} dari {getEffectiveTotalActivities(new Date(dateStr + 'T00:00:00'))} aktivitas • {isSelected ? '▲ Sembunyikan' : '▼ Lihat Detail'}
                    </div>
                  </button>

                  {isSelected && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {BLP_CATEGORIES.flatMap(c => c.activities).map(a => {
                          const done = rec.completedActivities?.includes(a.id)
                          return (
                            <div key={a.id} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              opacity: done ? 1 : 0.4,
                            }}>
                              <span style={{ fontSize: 16 }}>{done ? '✅' : '⬜'}</span>
                              <span style={{ fontSize: 13 }}>{a.emoji} {a.name}</span>
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
        )}
      </div>
    </div>
  )
}
