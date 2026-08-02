import { useState, useEffect } from 'react'
import { TopBar } from '../../components/shared.jsx'
import { useAuth } from '../../AuthContext.jsx'
import { SURAH_LIST } from './blpAktivitasData.js'

export default function BlpQuranScreen({ goBack }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [student, setStudent] = useState(null)

  // Form state
  const [surahNo, setSurahNo] = useState(1)
  const [surahName, setSurahName] = useState(SURAH_LIST[0]?.nameLatin || 'Al-Fatihah')
  const [ayat, setAyat] = useState(1)
  const [halaman, setHalaman] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/blp/dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) { setError(json.error); setLoading(false); return }
        const s = Object.values(json.students || {})[0]
        setStudent(s)
        if (s?.quranBookmark) {
          const bm = s.quranBookmark
          setSurahNo(bm.surahNo || 1)
          setSurahName(bm.surahName || 'Al-Fatihah')
          setAyat(bm.ayat || 1)
          setHalaman(bm.halaman != null ? String(bm.halaman) : '')
        }
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError('Gagal memuat data'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  function handleSurahChange(e) {
    const no = Number(e.target.value)
    const found = SURAH_LIST.find(s => s.no === no)
    setSurahNo(no)
    setSurahName(found ? found.nameLatin : `Surah ${no}`)
    setAyat(1)
  }

  async function handleSimpan() {
    if (!student) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/blp/students/${student.id}/quran-bookmark`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          surahNo,
          surahName,
          ayat: Number(ayat),
          halaman: halaman !== '' ? Number(halaman) : null,
        }),
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

  const selectedSurah = SURAH_LIST.find(s => s.no === surahNo)
  const maxAyat = selectedSurah?.ayatCount || 999

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#10b981' }}>Memuat...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a1a12 0%, #0d2d1a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar title="Quran Tracker" onBack={goBack} accentColor="#10b981" />

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Bookmark saat ini */}
        {student?.quranBookmark && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 16, padding: '16px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
              📖 PENANDA TERAKHIR
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {student.quranBookmark.surahName}
            </div>
            <div style={{ fontSize: 13, color: '#6ee7b7' }}>
              Surah ke-{student.quranBookmark.surahNo} • Ayat {student.quranBookmark.ayat}
              {student.quranBookmark.halaman != null && ` • Halaman ${student.quranBookmark.halaman}`}
            </div>
            {student.quranBookmark.updatedAt && (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
                Diperbarui: {new Date(student.quranBookmark.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            )}
          </div>
        )}

        {/* Form update bookmark */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: '20px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            Perbarui Penanda Bacaan
          </div>

          {/* Pilih Surah */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Nama Surah
            </label>
            <select
              value={surahNo}
              onChange={handleSurahChange}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '11px 12px', color: '#fff', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', appearance: 'none',
              }}
            >
              {SURAH_LIST.map(s => (
                <option key={s.no} value={s.no} style={{ background: '#0d2d1a' }}>
                  {s.no}. {s.nameLatin} ({s.ayatCount} ayat)
                </option>
              ))}
              <option value={surahNo} style={{ background: '#0d2d1a' }}>
                {!SURAH_LIST.find(s => s.no === surahNo) ? `${surahNo}. ${surahName}` : null}
              </option>
            </select>
            {/* Surah number input jika tidak ada di list */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Nomor surah (1–114):</span>
              <input
                type="number" min={1} max={114}
                value={surahNo}
                onChange={e => {
                  const no = Math.min(114, Math.max(1, Number(e.target.value)))
                  const found = SURAH_LIST.find(s => s.no === no)
                  setSurahNo(no)
                  setSurahName(found ? found.nameLatin : `Surah ${no}`)
                  setAyat(1)
                }}
                style={{
                  width: 60, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                  padding: '6px 10px', color: '#fff', fontSize: 13,
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Ayat */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Ayat
            </label>
            <input
              type="number" min={1} max={maxAyat}
              value={ayat}
              onChange={e => setAyat(Math.min(maxAyat, Math.max(1, Number(e.target.value))))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '11px 12px', color: '#fff', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {selectedSurah && (
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                Surah {selectedSurah.nameLatin} memiliki {selectedSurah.ayatCount} ayat
              </div>
            )}
          </div>

          {/* Halaman (opsional) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Halaman <span style={{ color: '#6b7280', fontWeight: 400 }}>(opsional)</span>
            </label>
            <input
              type="number" min={1} max={604}
              value={halaman}
              onChange={e => setHalaman(e.target.value)}
              placeholder="Nomor halaman mushaf"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                padding: '11px 12px', color: '#fff', fontSize: 14,
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
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
              ✅ Penanda bacaan berhasil disimpan!
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
            {saving ? 'Menyimpan...' : '📖 Simpan Penanda'}
          </button>
        </div>

        {/* Info */}
        <div style={{
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 12, padding: '12px 14px',
          fontSize: 12, color: '#a5b4fc', lineHeight: 1.6,
        }}>
          💡 Catat surah dan ayat terakhir yang kamu baca agar tidak kehilangan progres bacaan Al-Qur'an.
        </div>
      </div>
    </div>
  )
}
