/**
 * Eob5SoalAiScreen.jsx — Generator Soal Otomatis via Groq AI
 * Generate soal PG/Esai, simpan ke riwayat, preview, hapus.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  dim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  sub: '#92400e',
  card: 'rgba(255,255,255,0.06)',
  green: '#4ade80',
  red: '#f87171',
}

const inp = {
  background: 'rgba(255,255,255,0.07)',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '9px 12px',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function safeDate(val) {
  try {
    if (!val) return '-'
    const d = new Date(val)
    if (isNaN(d)) return '-'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '-' }
}

function toArr(val) {
  if (Array.isArray(val)) return val
  if (val == null) return []
  return [val]
}

function SoalPreview({ soal }) {
  const soalArr = toArr(soal)
  const preview = soalArr.slice(0, 5)
  const remaining = soalArr.length - preview.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {preview.map((q, idx) => {
        const isPG = q.pilihan && q.pilihan.length > 0
        return (
          <div key={idx} style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>
              <span style={{ color: C.primary, fontWeight: 800 }}>{idx + 1}.</span>{' '}
              {q.pertanyaan}
            </div>

            {isPG ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {toArr(q.pilihan).map((opt, i) => {
                  const letter = opt.trim().charAt(0).toUpperCase()
                  const isAnswer = q.jawaban && (letter === q.jawaban.toUpperCase() || opt === q.jawaban || opt.toUpperCase().startsWith(q.jawaban.toUpperCase() + '.'))
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 10px', borderRadius: 8, background: isAnswer ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)', border: isAnswer ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ color: isAnswer ? C.green : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 13, flexShrink: 0, width: 16 }}>{isAnswer ? '✓' : LETTERS[i] || i}</span>
                      <span style={{ color: isAnswer ? C.green : '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{opt}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '8px 12px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>Kunci Jawaban: </span>
                <span style={{ fontSize: 13, color: C.green }}>{q.jawaban}</span>
              </div>
            )}

            {q.pembahasan && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, borderLeft: `3px solid ${C.primary}` }}>
                <span style={{ fontSize: 11, color: C.sub }}>💡 </span>
                <span style={{ fontSize: 11, color: '#78716c', lineHeight: 1.5 }}>{q.pembahasan}</span>
              </div>
            )}
          </div>
        )
      })}
      {remaining > 0 && (
        <div style={{ textAlign: 'center', padding: '10px', background: C.dim, borderRadius: 8, fontSize: 12, color: C.primary, fontWeight: 700 }}>
          ...dan {remaining} soal lainnya (simpan untuk melihat semua)
        </div>
      )}
    </div>
  )
}

export default function Eob5SoalAiScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedSoal, setSelectedSoal] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [form, setForm] = useState({ topik: '', tingkat: 'Kelas 7', jumlah: 10, jenis: 'pilihan-ganda', kesulitan: 'sedang' })
  const [generating, setGenerating] = useState(false)
  const [generatedSoal, setGeneratedSoal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [deleting, setDeleting] = useState(null)

  if (user?.role !== 'guru') return (
    <div style={{ padding: 60, textAlign: 'center', color: C.red, fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  )

  const ff = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const loadHistory = useCallback(() => {
    setLoadingHistory(true)
    fetch('/api/eob5/soal-otomatis/tersimpan', { credentials: 'include' })
      .then(r => r.json()).then(d => { setHistory(Array.isArray(d) ? d : []); setLoadingHistory(false) })
      .catch(() => setLoadingHistory(false))
  }, [])

  const loadDetail = useCallback((id) => {
    setLoadingDetail(true)
    setSelectedSoal(null)
    fetch(`/api/eob5/soal-otomatis/tersimpan/${id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => {
        const soalData = d.soal_json ? (typeof d.soal_json === 'string' ? JSON.parse(d.soal_json) : d.soal_json) : d
        setSelectedSoal({ ...d, parsedSoal: toArr(soalData.soal || soalData) })
        setLoadingDetail(false)
      })
      .catch(() => setLoadingDetail(false))
  }, [])

  useEffect(() => { loadHistory() }, [])
  useEffect(() => { if (selectedId) { setGeneratedSoal(null); setSaved(false); loadDetail(selectedId) } }, [selectedId])

  const handleGenerate = async () => {
    if (!form.topik.trim()) { showMsg('error', 'Topik wajib diisi'); return }
    setGenerating(true); setMsg({ type: '', text: '' }); setGeneratedSoal(null); setSaved(false); setSelectedId(null); setSelectedSoal(null)
    try {
      const r = await fetch('/api/eob5/soal-otomatis/generate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topik: form.topik, tingkat: form.tingkat, jumlah: form.jumlah, jenis: form.jenis }),
      })
      const d = await r.json()
      if (!r.ok) { showMsg('error', d.error || 'Gagal generate soal'); setGenerating(false); return }
      if (!d.soal || d.soal.length === 0) { showMsg('error', 'AI tidak menghasilkan soal. Coba topik lain.'); setGenerating(false); return }
      setGeneratedSoal(d)
      showMsg('ok', `✅ ${d.soal.length} soal berhasil dibuat!`)
    } catch { showMsg('error', 'Gagal terhubung ke server') }
    setGenerating(false)
  }

  const handleSave = async () => {
    if (!generatedSoal) return
    setSaving(true)
    try {
      const r = await fetch('/api/eob5/soal-otomatis/generate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topik: form.topik, tingkat: form.tingkat, jumlah: form.jumlah, jenis: form.jenis, simpan: true }),
      })
      if (r.ok) { setSaved(true); loadHistory(); showMsg('ok', 'Soal berhasil disimpan ke riwayat!') }
      else { const d = await r.json(); showMsg('error', d.error || 'Gagal menyimpan') }
    } catch { showMsg('error', 'Gagal menyimpan') }
    setSaving(false)
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!confirm('Hapus soal ini dari riwayat?')) return
    setDeleting(id)
    try {
      await fetch(`/api/eob5/soal-otomatis/tersimpan/${id}`, { method: 'DELETE', credentials: 'include' })
      if (selectedId === id) { setSelectedId(null); setSelectedSoal(null) }
      loadHistory()
    } catch { showMsg('error', 'Gagal menghapus') }
    setDeleting(null)
  }

  const activePreviewSoal = generatedSoal ? generatedSoal.soal : (selectedSoal?.parsedSoal || null)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5 }}>GURU · GROQ AI</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Generator Soal Otomatis</div>
        </div>
        <div style={{ fontSize: 11, color: C.sub }}>🤖 AI-powered</div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: form + preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Message */}
          {msg.text && (
            <div style={{ background: msg.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.type === 'ok' ? '#4ade80' : '#ef4444'}`, borderRadius: 10, padding: '10px 14px', color: msg.type === 'ok' ? C.green : C.red, fontSize: 13 }}>
              {msg.text}
            </div>
          )}

          {/* Form */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 14 }}>🤖 Parameter Pembuatan Soal</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TOPIK / MATERI *</div>
                <input value={form.topik} onChange={e => ff('topik', e.target.value)} placeholder="Misal: Persamaan Linear Satu Variabel" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TINGKAT KELAS</div>
                <select value={form.tingkat} onChange={e => ff('tingkat', e.target.value)} style={inp}>
                  <option value="Kelas 7">Kelas 7</option>
                  <option value="Kelas 8">Kelas 8</option>
                  <option value="Kelas 9">Kelas 9</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>JUMLAH SOAL</div>
                <select value={form.jumlah} onChange={e => ff('jumlah', parseInt(e.target.value))} style={inp}>
                  {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} soal</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TIPE SOAL</div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: `1px solid ${C.border}`, padding: 2, gap: 2 }}>
                  {[['pilihan-ganda', 'Pilihan Ganda'], ['esai', 'Esai']].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => ff('jenis', val)}
                      style={{ flex: 1, background: form.jenis === val ? C.dim : 'transparent', border: form.jenis === val ? `1px solid ${C.border}` : '1px solid transparent', borderRadius: 6, padding: '6px 4px', color: form.jenis === val ? C.primary : '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>KESULITAN</div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: `1px solid ${C.border}`, padding: 2, gap: 2 }}>
                  {['mudah', 'sedang', 'sulit'].map(k => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => ff('kesulitan', k)}
                      style={{ flex: 1, background: form.kesulitan === k ? C.dim : 'transparent', border: form.kesulitan === k ? `1px solid ${C.border}` : '1px solid transparent', borderRadius: 6, padding: '6px 2px', color: form.kesulitan === k ? C.primary : '#94a3b8', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.2s' }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{ width: '100%', background: generating ? C.dim : 'linear-gradient(90deg,#f59e0b,#d97706)', border: 'none', borderRadius: 12, padding: '13px', color: '#1a0a00', fontWeight: 800, fontSize: 14, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {generating ? <><span>⚙️</span><span>AI sedang menyusun soal...</span></> : <><span>⚡</span><span>Generate Soal dengan AI</span></>}
            </button>
          </div>

          {/* Generated results header */}
          {generatedSoal && !generating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>✅ {generatedSoal.soal.length} soal berhasil dibuat</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!saved ? (
                  <button onClick={handleSave} disabled={saving} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {saving ? 'Menyimpan...' : '💾 Simpan ke Riwayat'}
                  </button>
                ) : (
                  <span style={{ background: 'rgba(74,222,128,0.15)', color: C.green, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>✅ Tersimpan</span>
                )}
                <button onClick={handleGenerate} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔄 Generate Ulang
                </button>
              </div>
            </div>
          )}

          {/* History detail header */}
          {selectedSoal && !generatedSoal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>📂 Riwayat:</span>
              <span style={{ fontSize: 12, color: C.text }}>{selectedSoal.topik}</span>
              <span style={{ fontSize: 10, color: C.sub, marginLeft: 'auto' }}>{safeDate(selectedSoal.created_at)}</span>
            </div>
          )}

          {/* Loading detail */}
          {loadingDetail && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
              <div style={{ color: C.primary, fontWeight: 700 }}>Memuat soal...</div>
            </div>
          )}

          {/* Preview */}
          {!loadingDetail && activePreviewSoal && activePreviewSoal.length > 0 && (
            <SoalPreview soal={activePreviewSoal} />
          )}

          {/* Empty state */}
          {!loadingDetail && !activePreviewSoal && !generating && (
            <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
              <div style={{ color: C.sub, fontSize: 13 }}>Isi form di atas lalu klik "Generate Soal"</div>
              <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>atau pilih riwayat di sidebar kanan untuk melihat kembali.</div>
            </div>
          )}
        </div>

        {/* Right: history sidebar */}
        <div style={{ width: 260, borderLeft: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🕑</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Soal Tersimpan</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingHistory ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 12 }}>Memuat riwayat...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 12 }}>Belum ada soal yang disimpan.</div>
            ) : (
              history.map(h => {
                const colorPalette = ['rgba(99,102,241,0.2)', 'rgba(245,158,11,0.2)', 'rgba(34,197,94,0.2)', 'rgba(239,68,68,0.2)', 'rgba(168,85,247,0.2)']
                const ci = h.id ? Math.abs(h.id.toString().charCodeAt(0) - 48) % colorPalette.length : 0
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => { setGeneratedSoal(null); setSaved(false); setSelectedId(h.id) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,0.05)`, cursor: 'pointer', background: selectedId === h.id ? 'rgba(245,158,11,0.12)' : 'transparent', border: 'none', color: 'inherit', fontFamily: 'inherit', display: 'flex', alignItems: 'flex-start', gap: 8 }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: colorPalette[ci], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {h.jenis === 'esai' ? '📄' : '📋'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.topik}</div>
                      <div style={{ fontSize: 10, color: C.sub, marginTop: 3 }}>🕐 {safeDate(h.created_at)}</div>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(h.id, e)}
                        disabled={deleting === h.id}
                        style={{ marginTop: 4, background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '2px 6px', color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
