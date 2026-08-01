import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { blpPeriodKey } from './blpAktivitasData.js'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'

const BULAN_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

export default function BlpGuruPeriodeScreen({ goBack }) {
  const { data, loading, error: ctxError, loadDashboard, invalidate } = useBlpData()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [startDay, setStartDay] = useState(1)
  const [endDay, setEndDay] = useState(28)

  useEffect(() => { loadDashboard() }, [])

  const guru = data ? Object.values(data.gurus || {})[0] : null
  const blpPeriods = data?.blpPeriods || {}

  // Update form when month/year changes
  useEffect(() => {
    if (!guru) return
    const kelas = guru?.kelasWali?.[0] || ''
    const key = blpPeriodKey(kelas, year, month)
    const existing = blpPeriods[key]
    if (existing) {
      setStartDay(existing.startDay)
      setEndDay(existing.endDay)
    } else {
      setStartDay(1)
      setEndDay(28)
    }
  }, [year, month, blpPeriods])

  async function handleSimpan() {
    if (!guru) return
    const kelas = guru.kelasWali?.[0]
    if (!kelas) { setError('Data kelas guru tidak ditemukan'); return }
    if (endDay < startDay) { setError('Hari akhir harus >= hari mulai'); return }

    setSaving(true); setError(''); setSuccess(false)
    try {
      const res = await fetch('/api/blp/periods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ kelas, year, month, startDay, endDay }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal menyimpan'); setSaving(false); return }
      setSuccess(true)
      invalidate()  // cache dikosongkan, fetch ulang saat layar berikutnya dimuat
      setTimeout(() => setSuccess(false), 3000)
    } catch { setError('Gagal menyimpan, coba lagi') }
    setSaving(false)
  }

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  const kelas = guru?.kelasWali?.[0] || '—'

  // Build list of all months with existing periods
  const existingPeriods = Object.entries(blpPeriods).map(([key, val]) => {
    const parts = key.split('__')
    if (parts.length !== 2) return null
    const [k, ym] = parts
    const [y, m] = ym.split('-').map(Number)
    return { kelas: k, year: y, month: m, ...val }
  }).filter(Boolean).sort((a, b) => b.year - a.year || b.month - a.month)

  const daysInMonth = new Date(year, month, 0).getDate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Atur Periode BLP" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Info kelas */}
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '14px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 28 }}>🏫</div>
          <div>
            <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700 }}>Wali Kelas</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{kelas}</div>
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '20px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Rentang Tanggal Aktif
          </div>

          {/* Tahun & Bulan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>Tahun</label>
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  padding: '11px 10px', color: '#fff', fontSize: 13,
                  fontFamily: 'inherit', outline: 'none', appearance: 'none',
                }}
              >
                {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                  <option key={y} value={y} style={{ background: '#0d2d1a' }}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>Bulan</label>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  padding: '11px 10px', color: '#fff', fontSize: 13,
                  fontFamily: 'inherit', outline: 'none', appearance: 'none',
                }}
              >
                {BULAN_ID.map((b, i) => (
                  <option key={i + 1} value={i + 1} style={{ background: '#0d2d1a' }}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hari mulai & akhir */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Hari Mulai
              </label>
              <input
                type="number" min={1} max={daysInMonth}
                value={startDay}
                onChange={e => setStartDay(Math.min(daysInMonth, Math.max(1, Number(e.target.value))))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  padding: '11px 10px', color: '#fff', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                Hari Akhir
              </label>
              <input
                type="number" min={startDay} max={daysInMonth}
                value={endDay}
                onChange={e => setEndDay(Math.min(daysInMonth, Math.max(startDay, Number(e.target.value))))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                  padding: '11px 10px', color: '#fff', fontSize: 14,
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#6ee7b7', textAlign: 'center',
          }}>
            📅 BLP aktif: <strong>{startDay}–{endDay} {BULAN_ID[month - 1]} {year}</strong> ({endDay - startDay + 1} hari)
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
              ✅ Periode BLP berhasil disimpan!
            </div>
          )}

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
            {saving ? 'Menyimpan...' : '📅 Simpan Periode BLP'}
          </button>
        </div>

        {/* Periode yang sudah diatur */}
        {existingPeriods.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              PERIODE YANG SUDAH DIATUR
            </div>
            {existingPeriods.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < existingPeriods.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600 }}>
                    {BULAN_ID[p.month - 1]} {p.year}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>
                    Hari {p.startDay} – {p.endDay} ({p.endDay - p.startDay + 1} hari)
                  </div>
                </div>
                <button
                  onClick={() => { setYear(p.year); setMonth(p.month); setStartDay(p.startDay); setEndDay(p.endDay) }}
                  style={{
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: 8, padding: '5px 10px', color: '#6ee7b7',
                    fontFamily: 'inherit', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
