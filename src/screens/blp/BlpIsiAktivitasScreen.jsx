import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { useAuth } from '../../AuthContext.jsx'
import { BLP_CATEGORIES, isSedangHaid } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'

function getJakartaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export default function BlpIsiAktivitasScreen({ goBack }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checked, setChecked] = useState([])
  const [student, setStudent] = useState(null)

  const today = getJakartaToday()

  useEffect(() => {
    let cancelled = false
    fetch('/api/blp/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) { setError(json.error); setLoading(false); return }
        const s = Object.values(json.students || {})[0]
        setStudent(s)
        if (s?.records?.[today]) {
          setChecked(s.records[today].completedActivities || [])
        }
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError('Gagal memuat data'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const sedangHaid = student ? isSedangHaid(student.haidPeriods) : false
  const todayDate = new Date(today + 'T00:00:00')
  const allActivities = BLP_CATEGORIES.flatMap(c => c.activities)
  const effectiveTotal = getEffectiveTotalActivities(todayDate, student?.haidPeriods || [])
  const effectiveDone  = checked.length > 0
    ? getEffectiveCompletedCount(todayDate, checked, student?.haidPeriods || [])
    : 0
  const skor = effectiveTotal > 0 ? Math.round((effectiveDone / effectiveTotal) * 100) : 0

  function toggleCheck(id) {
    setChecked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSimpan() {
    if (!student) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/blp/students/${student.id}/records/${today}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completedActivities: checked, score: skor, submissions: {} }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); setSaving(false); return }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      setError('Gagal menyimpan, coba lagi')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  if (error && !student) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{error}</div>
      <button onClick={goBack} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kembali</button>
    </div>
  )

  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Isi Aktivitas Harian" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 100px' }}>
        {/* Tanggal & skor */}
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700 }}>Tanggal</div>
            <div style={{ fontSize: 13, color: '#fff', marginTop: 2 }}>{todayLabel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#6ee7b7' }}>Skor</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: skor >= 80 ? '#10b981' : skor >= 50 ? '#f59e0b' : '#ef4444' }}>
              {skor}%
            </div>
          </div>
        </div>

        {sedangHaid && (
          <div style={{
            background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)',
            borderRadius: 12, padding: '10px 14px', marginBottom: 16,
            fontSize: 12, color: '#f9a8d4',
          }}>
            🌸 Periode haid aktif — aktivitas sholat tidak dihitung
          </div>
        )}

        {/* Daftar aktivitas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {allActivities.map(a => {
            const disabled = false
            const isChecked = checked.includes(a.id)
            return (
              <button
                key={a.id}
                onClick={() => !disabled && toggleCheck(a.id)}
                disabled={disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: disabled
                    ? 'rgba(255,255,255,0.03)'
                    : isChecked
                      ? 'rgba(16,185,129,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.06)' : isChecked ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 14, padding: '14px 16px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.45 : 1,
                  fontFamily: 'inherit', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 24, height: 24, borderRadius: 7,
                  border: `2px solid ${isChecked && !disabled ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                  background: isChecked && !disabled ? '#10b981' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: '#fff',
                }}>
                  {isChecked && !disabled ? '✓' : ''}
                </div>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{a.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: disabled ? '#4b5563' : '#fff' }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>+{a.poin} poin</div>
                </div>
              </button>
            )
          })}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#f87171',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#6ee7b7', fontWeight: 700,
          }}>
            ✅ Aktivitas berhasil disimpan!
          </div>
        )}
      </div>

      {/* Tombol simpan fixed di bawah */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
        padding: '12px 16px', background: 'rgba(10,26,18,0.95)',
        borderTop: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${skor}%`,
              background: skor >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : skor >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
              borderRadius: 8, transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{effectiveDone}/{effectiveTotal} aktivitas</span>
        </div>
        <button
          onClick={handleSimpan}
          disabled={saving}
          style={{
            width: '100%', background: saving ? 'rgba(16,185,129,0.4)' : 'linear-gradient(90deg, #10b981, #059669)',
            border: 'none', borderRadius: 14, padding: '14px',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Aktivitas'}
        </button>
      </div>
    </div>
  )
}
