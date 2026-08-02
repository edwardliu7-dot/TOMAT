/**
 * Eob5MateriScreen.jsx — Buat Modul Ajar via Groq AI
 * Generate modul ajar Kurikulum Merdeka, tampilkan history, ekspor teks.
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
  cardBorder: 'rgba(255,255,255,0.1)',
  white: '#fff',
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

function safeDate(val) {
  try {
    if (!val) return '-'
    const d = new Date(val)
    if (isNaN(d)) return '-'
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '-' }
}

function toArr(val) {
  if (Array.isArray(val)) return val
  if (val == null) return []
  return [val]
}

function ModulPreview({ modul }) {
  const [openSection, setOpenSection] = useState('tujuan')
  const c = modul.content || {}

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id)

  const sections = [
    {
      id: 'tujuan',
      label: '🎯 Tujuan Pembelajaran',
      body: (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {toArr(c.tujuan_pembelajaran).map((t, i) => (
            <li key={i} style={{ color: C.text, fontSize: 13, marginBottom: 4, lineHeight: 1.5 }}>{t}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'profil',
      label: '🌟 Profil Pelajar Pancasila',
      body: (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {toArr(c.profil_pelajar_pancasila).map((p, i) => (
            <li key={i} style={{ color: C.text, fontSize: 13, marginBottom: 4 }}>{p}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'kegiatan',
      label: '📋 Kegiatan Pembelajaran',
      body: (() => {
        const kp = c.kegiatan_pembelajaran || {}
        return (
          <div>
            {['pendahuluan', 'inti', 'penutup'].map(fase => {
              const data = kp[fase] || {}
              return (
                <div key={fase} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                    {fase} {data.durasi ? `(${data.durasi})` : ''}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {toArr(data.langkah).map((l, i) => (
                      <li key={i} style={{ color: C.text, fontSize: 12, marginBottom: 3, lineHeight: 1.5 }}>{l}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )
      })(),
    },
    {
      id: 'asesmen',
      label: '📝 Asesmen',
      body: (() => {
        const a = c.asesmen || {}
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {a.diagnostik && <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.primary }}>Diagnostik: </strong>{a.diagnostik}</div>}
            {a.formatif && <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.primary }}>Formatif: </strong>{a.formatif}</div>}
            {a.sumatif && <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.primary }}>Sumatif: </strong>{a.sumatif}</div>}
          </div>
        )
      })(),
    },
    {
      id: 'pengayaan',
      label: '🔁 Pengayaan & Remedial',
      body: (() => {
        const pr = c.pengayaan_remedial || {}
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pr.pengayaan && <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.primary }}>Pengayaan: </strong>{pr.pengayaan}</div>}
            {pr.remedial && <div style={{ fontSize: 13, color: C.text }}><strong style={{ color: C.primary }}>Remedial: </strong>{pr.remedial}</div>}
          </div>
        )
      })(),
    },
  ]

  const identitas = c.identitas || {}

  return (
    <div>
      {/* Header identitas */}
      <div style={{ background: 'rgba(245,158,11,0.12)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, marginBottom: 6 }}>
          {identitas.materi || modul.materi}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {identitas.mata_pelajaran && (
            <span style={{ background: C.dim, color: C.primary, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              {identitas.mata_pelajaran}
            </span>
          )}
          {(identitas.kelas || modul.kelas) && (
            <span style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
              Kelas {identitas.kelas || modul.kelas}
            </span>
          )}
          <span style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
            {identitas.alokasi_waktu || modul.alokasi_waktu}
          </span>
          {identitas.nama_penyusun && (
            <span style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b', borderRadius: 6, padding: '2px 8px', fontSize: 11 }}>
              👤 {identitas.nama_penyusun}
            </span>
          )}
        </div>
        {c.capaian_pembelajaran && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
            <strong style={{ color: C.sub }}>Capaian Pembelajaran:</strong> {c.capaian_pembelajaran}
          </div>
        )}
      </div>

      {/* Accordion sections */}
      {sections.map(sec => (
        <div key={sec.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 6, overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggle(sec.id)}
            style={{ width: '100%', background: openSection === sec.id ? C.dim : 'transparent', border: 'none', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{sec.label}</span>
            <span style={{ color: C.primary, fontSize: 16 }}>{openSection === sec.id ? '▲' : '▼'}</span>
          </button>
          {openSection === sec.id && (
            <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderTop: `1px solid ${C.border}` }}>
              {sec.body}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Eob5MateriScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedModul, setSelectedModul] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [form, setForm] = useState({ subject_id: '', materi: '', alokasi_waktu: '', kelas: '', mata_pelajaran: '' })
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [deleting, setDeleting] = useState(null)
  const [downloading, setDownloading] = useState(null)

  if (user?.role !== 'guru') return (
    <div style={{ padding: 60, textAlign: 'center', color: C.red, fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  )

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  const loadSubjects = useCallback(() => {
    fetch('/api/eob5/subjects', { credentials: 'include' })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setSubjects(d) }).catch(() => {})
  }, [])

  const loadHistory = useCallback(() => {
    setLoadingHistory(true)
    fetch('/api/eob5/modul-ajar', { credentials: 'include' })
      .then(r => r.json()).then(d => { setHistory(Array.isArray(d) ? d : []); setLoadingHistory(false) })
      .catch(() => setLoadingHistory(false))
  }, [])

  const loadDetail = useCallback((id) => {
    setLoadingDetail(true)
    setSelectedModul(null)
    fetch(`/api/eob5/modul-ajar/${id}`, { credentials: 'include' })
      .then(r => r.json()).then(d => { setSelectedModul(d); setLoadingDetail(false) })
      .catch(() => setLoadingDetail(false))
  }, [])

  useEffect(() => { loadSubjects(); loadHistory() }, [])
  useEffect(() => { if (selectedId) loadDetail(selectedId) }, [selectedId])

  const handleGenerate = async () => {
    if (!form.materi.trim()) { showMsg('error', 'Topik/materi wajib diisi'); return }
    if (!form.alokasi_waktu.trim()) { showMsg('error', 'Alokasi waktu wajib diisi'); return }
    setGenerating(true); setMsg({ type: '', text: '' })
    try {
      const body = { ...form }
      if (!body.subject_id) delete body.subject_id
      const r = await fetch('/api/eob5/modul-ajar/generate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) { showMsg('error', d.error || 'Gagal generate modul ajar'); setGenerating(false); return }
      showMsg('ok', 'Modul ajar berhasil dibuat!')
      loadHistory()
      setSelectedId(d.id)
      setSelectedModul(d)
    } catch { showMsg('error', 'Gagal terhubung ke server') }
    setGenerating(false)
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!confirm('Hapus modul ajar ini?')) return
    setDeleting(id)
    try {
      await fetch(`/api/eob5/modul-ajar/${id}`, { method: 'DELETE', credentials: 'include' })
      if (selectedId === id) { setSelectedId(null); setSelectedModul(null) }
      loadHistory()
    } catch { showMsg('error', 'Gagal menghapus') }
    setDeleting(null)
  }

  const handleExport = (modul) => {
    const c = modul.content || {}
    const id = c.identitas || {}
    const kp = c.kegiatan_pembelajaran || {}
    const a = c.asesmen || {}
    const pr = c.pengayaan_remedial || {}

    const lines = [
      `MODUL AJAR — KURIKULUM MERDEKA`,
      `=====================================`,
      `Mata Pelajaran  : ${id.mata_pelajaran || modul.materi}`,
      `Materi          : ${id.materi || modul.materi}`,
      `Kelas           : ${id.kelas || modul.kelas || '-'}`,
      `Alokasi Waktu   : ${id.alokasi_waktu || modul.alokasi_waktu}`,
      `Nama Penyusun   : ${id.nama_penyusun || '-'}`,
      ``,
      `CAPAIAN PEMBELAJARAN`,
      `---------------------`,
      c.capaian_pembelajaran || '-',
      ``,
      `TUJUAN PEMBELAJARAN`,
      `--------------------`,
      ...toArr(c.tujuan_pembelajaran).map((t, i) => `${i + 1}. ${t}`),
      ``,
      `PROFIL PELAJAR PANCASILA`,
      `-------------------------`,
      ...toArr(c.profil_pelajar_pancasila).map((p, i) => `${i + 1}. ${p}`),
      ``,
      `SARANA & PRASARANA`,
      `-------------------`,
      ...toArr(c.sarana_prasarana).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `MODEL PEMBELAJARAN : ${c.model_pembelajaran || '-'}`,
      ``,
      `KEGIATAN PEMBELAJARAN`,
      `----------------------`,
    ]

    for (const fase of ['pendahuluan', 'inti', 'penutup']) {
      const data = kp[fase] || {}
      lines.push(`\n${fase.toUpperCase()} (${data.durasi || ''})`)
      toArr(data.langkah).forEach((l, i) => lines.push(`  ${i + 1}. ${l}`))
    }

    lines.push(``, `ASESMEN`, `-------`)
    if (a.diagnostik) lines.push(`Diagnostik : ${a.diagnostik}`)
    if (a.formatif) lines.push(`Formatif   : ${a.formatif}`)
    if (a.sumatif) lines.push(`Sumatif    : ${a.sumatif}`)

    lines.push(``, `PENGAYAAN & REMEDIAL`, `---------------------`)
    if (pr.pengayaan) lines.push(`Pengayaan : ${pr.pengayaan}`)
    if (pr.remedial) lines.push(`Remedial  : ${pr.remedial}`)

    if (c.refleksi_guru) {
      lines.push(``, `REFLEKSI GURU`, `--------------`, c.refleksi_guru)
    }

    if (toArr(c.referensi).length) {
      lines.push(``, `REFERENSI`, `----------`)
      toArr(c.referensi).forEach((r, i) => lines.push(`${i + 1}. ${r}`))
    }

    const text = lines.join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Modul_Ajar_${(modul.materi || 'export').replace(/\s+/g, '_')}.txt`
    document.body.appendChild(link); link.click(); link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5 }}>GURU · GROQ AI</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Buat Modul Ajar AI</div>
        </div>
        <div style={{ fontSize: 11, color: C.sub }}>✨ Kurikulum Merdeka</div>
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
            <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 14 }}>✨ Parameter Modul Ajar</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MATA PELAJARAN</div>
                {subjects.length > 0 ? (
                  <select value={form.subject_id} onChange={e => { f('subject_id', e.target.value); f('mata_pelajaran', subjects.find(s => s.id === e.target.value)?.name || '') }} style={inp}>
                    <option value="">— Pilih mata pelajaran —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <input value={form.mata_pelajaran} onChange={e => f('mata_pelajaran', e.target.value)} placeholder="Misal: Matematika" style={inp} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>KELAS (OPSIONAL)</div>
                <input value={form.kelas} onChange={e => f('kelas', e.target.value)} placeholder="Misal: VII" style={inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TOPIK / MATERI *</div>
                <input value={form.materi} onChange={e => f('materi', e.target.value)} placeholder="Misal: Sistem Pencernaan Manusia" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ALOKASI WAKTU *</div>
                <input value={form.alokasi_waktu} onChange={e => f('alokasi_waktu', e.target.value)} placeholder="Misal: 2 JP" style={inp} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{ width: '100%', background: generating ? C.dim : `linear-gradient(90deg,#f59e0b,#d97706)`, border: 'none', borderRadius: 12, padding: '13px', color: '#1a0a00', fontWeight: 800, fontSize: 14, cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {generating ? (
                <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</span><span>AI sedang memproses...</span></>
              ) : (
                <><span>✨</span><span>Generate Modul Ajar</span></>
              )}
            </button>
          </div>

          {/* Loading detail */}
          {loadingDetail && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <div style={{ color: C.primary, fontWeight: 700 }}>Memuat modul ajar...</div>
            </div>
          )}

          {/* Preview */}
          {!loadingDetail && selectedModul && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>📄 Preview Modul Ajar</div>
                <button
                  onClick={() => handleExport(selectedModul)}
                  style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.primary, fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ⬇ Ekspor .txt
                </button>
              </div>
              <ModulPreview modul={selectedModul} />
            </div>
          )}

          {/* Empty state */}
          {!loadingDetail && !selectedModul && !generating && (
            <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📓</div>
              <div style={{ color: C.sub, fontSize: 13 }}>Isi form di atas lalu klik "Generate Modul Ajar"</div>
              <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>atau pilih riwayat di sidebar kanan untuk melihat kembali.</div>
            </div>
          )}
        </div>

        {/* Right: history sidebar */}
        <div style={{ width: 260, borderLeft: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🕑</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Riwayat Modul</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingHistory ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 12 }}>Memuat riwayat...</div>
            ) : history.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: C.sub, fontSize: 12 }}>Belum ada modul yang dibuat.</div>
            ) : (
              history.map(h => (
                <div
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,0.05)`, cursor: 'pointer', background: selectedId === h.id ? 'rgba(245,158,11,0.12)' : 'transparent', transition: 'background 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ background: C.dim, borderRadius: 6, padding: '4px 6px', fontSize: 14, flexShrink: 0 }}>📓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.materi}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                        {h.kelas && <span style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>{h.kelas}</span>}
                        <span style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>{h.alokasi_waktu}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.sub, marginTop: 4 }}>🕐 {safeDate(h.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingLeft: 30 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (selectedModul && selectedModul.id === h.id) handleExport(selectedModul) }}
                      style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, padding: '3px 7px', color: C.primary, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                      title="Ekspor"
                    >⬇</button>
                    <button
                      onClick={(e) => handleDelete(h.id, e)}
                      disabled={deleting === h.id}
                      style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 5, padding: '3px 7px', color: C.red, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                    >🗑</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
