import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { useAuth } from '../../AuthContext.jsx'
import { useBlpData } from '../../contexts/BlpDataContext.jsx'
import { isSedangHaid } from './blpAktivitasData.js'

export default function BlpHaidScreen({ goBack }) {
  const { user } = useAuth()
  const { invalidate } = useBlpData()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [student, setStudent] = useState(null)
  const [haidPeriods, setHaidPeriods] = useState([])

  function loadData() {
    setLoading(true)
    fetch('/api/blp/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (json.error) { setError(json.error); setLoading(false); return }
        const s = Object.values(json.students || {})[0]
        setStudent(s)
        setHaidPeriods(s?.haidPeriods || [])
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat data'); setLoading(false) })
  }

  useEffect(() => { loadData() }, [])

  const sedangHaid = isSedangHaid(haidPeriods)
  const openPeriod = haidPeriods.find(h => h.endDate === null)

  async function handleMulaiHaid() {
    if (!student) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`/api/blp/students/${student.id}/haid`, {
        method: 'POST', credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal mencatat'); setSaving(false); return }
      setSuccess('Periode haid berhasil dicatat. Aktivitas sholat akan dikecualikan otomatis.')
      invalidate()
      loadData()
    } catch { setError('Gagal mencatat, coba lagi') }
    setSaving(false)
  }

  async function handleSelesaiHaid() {
    if (!student) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`/api/blp/students/${student.id}/haid/end`, {
        method: 'PUT', credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Gagal mengakhiri'); setSaving(false); return }
      setSuccess('Periode haid selesai. Aktivitas sholat kembali aktif.')
      invalidate()
      loadData()
    } catch { setError('Gagal mengakhiri, coba lagi') }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Periode Haid" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Status saat ini */}
        <div style={{
          background: sedangHaid
            ? 'rgba(236,72,153,0.12)'
            : 'rgba(16,185,129,0.08)',
          border: `1px solid ${sedangHaid ? 'rgba(236,72,153,0.3)' : 'rgba(16,185,129,0.25)'}`,
          borderRadius: 16, padding: '18px', marginBottom: 20, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{sedangHaid ? '🌸' : '✅'}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            {sedangHaid ? 'Sedang Haid' : 'Tidak Sedang Haid'}
          </div>
          {sedangHaid && openPeriod && (
            <div style={{ fontSize: 13, color: '#f9a8d4' }}>
              Mulai: {new Date(openPeriod.startDate + 'T00:00:00').toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, lineHeight: 1.5 }}>
            {sedangHaid
              ? 'Aktivitas sholat dikecualikan dari perhitungan skor selama periode ini.'
              : 'Saat ini semua aktivitas termasuk sholat dihitung dalam skor BLP.'}
          </div>
        </div>

        {/* Tombol aksi */}
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
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            fontSize: 13, color: '#6ee7b7', fontWeight: 700,
          }}>
            ✅ {success}
          </div>
        )}

        {!sedangHaid ? (
          <button
            onClick={handleMulaiHaid}
            disabled={saving}
            style={{
              width: '100%', background: saving ? 'rgba(236,72,153,0.3)' : 'linear-gradient(90deg, #ec4899, #db2777)',
              border: 'none', borderRadius: 14, padding: '15px',
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 12,
            }}
          >
            🌸 Mulai Catat Haid Hari Ini
          </button>
        ) : (
          <button
            onClick={handleSelesaiHaid}
            disabled={saving}
            style={{
              width: '100%', background: saving ? 'rgba(16,185,129,0.3)' : 'linear-gradient(90deg, #10b981, #059669)',
              border: 'none', borderRadius: 14, padding: '15px',
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 12,
            }}
          >
            ✅ Catat Selesai Haid Hari Ini
          </button>
        )}

        {/* Info */}
        <div style={{
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 12, padding: '12px 14px', marginBottom: 20,
          fontSize: 12, color: '#a5b4fc', lineHeight: 1.6,
        }}>
          💡 Catatan haid hanya bisa dilakukan untuk hari ini. Satu periode haid harus ditutup sebelum bisa membuka periode baru.
        </div>

        {/* Riwayat periode haid */}
        {haidPeriods.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '16px',
          }}>
            <div style={{ fontSize: 11, color: '#f9a8d4', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              RIWAYAT PERIODE
            </div>
            {haidPeriods.slice(0, 6).map(h => (
              <div key={h.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#f3f4f6', fontWeight: 600 }}>
                    {new Date(h.startDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    s/d {h.endDate
                      ? new Date(h.endDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '(masih berlangsung)'}
                  </div>
                </div>
                {!h.endDate && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#ec4899',
                    background: 'rgba(236,72,153,0.15)', borderRadius: 8, padding: '3px 8px',
                  }}>AKTIF</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
