import { useState } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
}
const inputSt = { background:'rgba(255,255,255,0.06)', border:`1px solid ${C.border}`, borderRadius:8, padding:'10px 12px', color:'#fff', fontFamily:'inherit', fontSize:14, width:'100%', boxSizing:'border-box' }

export default function Eob5SoalAiScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [topik, setTopik] = useState('')
  const [tingkat, setTingkat] = useState('7')
  const [jumlah, setJumlah] = useState(5)
  const [jenis, setJenis] = useState('pilihan-ganda')
  const [loading, setLoading] = useState(false)
  const [soal, setSoal] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const handleGenerate = async () => {
    if (!topik.trim()) { setError('Topik wajib diisi'); return }
    setLoading(true); setError(''); setSoal(null); setSaved(false)
    try {
      const r = await fetch('/api/eob5/soal-otomatis/generate', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ topik, tingkat:`Kelas ${tingkat}`, jumlah, jenis }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error||'Gagal generate soal'); setLoading(false); return }
      if (!d.soal || d.soal.length === 0) { setError('AI tidak menghasilkan soal. Coba topik lain.'); setLoading(false); return }
      setSoal(d)
    } catch { setError('Gagal terhubung ke server') }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!soal) return
    setSaving(true)
    try {
      const r = await fetch('/api/eob5/soal-otomatis/generate', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ topik, tingkat:`Kelas ${tingkat}`, jumlah, jenis, simpan:true }),
      })
      if (r.ok) setSaved(true)
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, paddingBottom:40 }}>
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer' }}>←</button>
        <div>
          <div style={{ fontSize:11, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>EOB5 · GROQ AI</div>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff' }}>Generator Soal Otomatis</div>
        </div>
      </div>

      <div style={{ padding:16 }}>
        {/* Form */}
        <div style={{ background:'rgba(0,0,0,0.3)', border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:13, color:C.primary, fontWeight:700, marginBottom:14 }}>🤖 Parameter Soal</div>

          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:5 }}>TOPIK / TUJUAN PEMBELAJARAN *</div>
            <input value={topik} onChange={e=>setTopik(e.target.value)} placeholder="Mis: Persamaan Linear Satu Variabel" style={{ ...inputSt }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:5 }}>TINGKAT KELAS</div>
              <select value={tingkat} onChange={e=>setTingkat(e.target.value)} style={{ ...inputSt }}>
                <option value="7">Kelas 7</option>
                <option value="8">Kelas 8</option>
                <option value="9">Kelas 9</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:5 }}>JUMLAH SOAL</div>
              <select value={jumlah} onChange={e=>setJumlah(parseInt(e.target.value))} style={{ ...inputSt }}>
                {[3,5,10,15,20].map(n=><option key={n} value={n}>{n} soal</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1, marginBottom:5 }}>JENIS</div>
              <select value={jenis} onChange={e=>setJenis(e.target.value)} style={{ ...inputSt }}>
                <option value="pilihan-ganda">Pilihan Ganda</option>
                <option value="esai">Esai</option>
              </select>
            </div>
          </div>

          {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:10, padding:'10px 14px', color:'#f87171', fontSize:13, marginBottom:12 }}>{error}</div>}

          <button onClick={handleGenerate} disabled={loading} style={{ width:'100%', background: loading ? C.dim : 'linear-gradient(90deg,#f59e0b,#d97706)', border:'none', borderRadius:14, padding:'15px', color:'#1a0a00', fontSize:15, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {loading ? '🤖 AI sedang membuat soal…' : '⚡ Generate Soal'}
          </button>
        </div>

        {/* Loading animation */}
        {loading && (
          <div style={{ textAlign:'center', padding:40 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🤖</div>
            <div style={{ color:C.primary, fontWeight:700, fontSize:15 }}>AI sedang membuat soal…</div>
            <div style={{ color:C.sub, fontSize:12, marginTop:6 }}>Biasanya membutuhkan 5–15 detik</div>
          </div>
        )}

        {/* Results */}
        {soal && !loading && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, color:C.primary, fontWeight:700 }}>✅ {soal.soal.length} soal berhasil dibuat</div>
              <div style={{ display:'flex', gap:8 }}>
                {!saved && (
                  <button onClick={handleSave} disabled={saving} style={{ background:C.dim, border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 12px', color:C.primary, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                    {saving?'Menyimpan…':'💾 Simpan'}
                  </button>
                )}
                {saved && <span style={{ background:'rgba(34,197,94,0.15)', color:'#4ade80', borderRadius:10, padding:'7px 12px', fontSize:12, fontWeight:700 }}>✅ Tersimpan</span>}
                <button onClick={handleGenerate} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid rgba(255,255,255,0.12)`, borderRadius:10, padding:'7px 12px', color:'#94a3b8', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  🔄 Generate Ulang
                </button>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {soal.soal.map((s, i) => (
                <div key={i} style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:14, padding:16 }}>
                  <div style={{ fontWeight:700, color:'#fff', fontSize:14, marginBottom:10, lineHeight:1.5 }}>
                    <span style={{ color:C.primary, fontWeight:800 }}>{i+1}.</span> {s.pertanyaan}
                  </div>

                  {s.pilihan && s.pilihan.length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:10 }}>
                      {s.pilihan.map((p, j) => {
                        const isJawaban = s.jawaban && p.toUpperCase().startsWith(s.jawaban.toUpperCase() + '.')
                        return (
                          <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 10px', borderRadius:8, background: isJawaban?'rgba(52,211,153,0.1)':'transparent', border: isJawaban?'1px solid rgba(52,211,153,0.3)':'1px solid transparent' }}>
                            <span style={{ color: isJawaban?'#34d399':'rgba(255,255,255,0.3)', fontWeight:700, fontSize:14, flexShrink:0 }}>{isJawaban?'✓':' '}</span>
                            <span style={{ color: isJawaban?'#34d399':'#94a3b8', fontSize:13, lineHeight:1.5 }}>{p}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {s.jawaban && !s.pilihan?.length && (
                    <div style={{ padding:'8px 12px', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:8, marginBottom:8 }}>
                      <span style={{ color:'#34d399', fontSize:13, fontWeight:600 }}>Jawaban: {s.jawaban}</span>
                    </div>
                  )}

                  {s.pembahasan && (
                    <div style={{ marginTop:6, padding:'8px 12px', background:'rgba(255,255,255,0.04)', borderRadius:8, borderLeft:'3px solid rgba(245,158,11,0.5)' }}>
                      <span style={{ fontSize:11, color:C.sub }}>💡 </span>
                      <span style={{ fontSize:12, color:'#78716c', lineHeight:1.5 }}>{s.pembahasan}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
