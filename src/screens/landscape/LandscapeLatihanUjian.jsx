import { useState, useEffect, useRef } from 'react'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f' }

// Fallback soal jika PAKET_UJIAN tidak tersedia
const FALLBACK_PAKET = [
  { id:'mat7', label:'Matematika Kelas 7', icon:'➕', color:'#3c3489', soal:[
    { q:'Hasil dari 15 + (-8) adalah...', opts:['7','23','-7','-23'], ans:0 },
    { q:'Nilai dari |−12| adalah...', opts:['12','-12','0','144'], ans:0 },
    { q:'FPB dari 24 dan 36 adalah...', opts:['6','12','8','4'], ans:1 },
  ]},
  { id:'mat8', label:'Matematika Kelas 8', icon:'📐', color:'#3c3489', soal:[
    { q:'Sisi miring segitiga siku-siku dengan sisi 3 dan 4 adalah...', opts:['5','7','25','12'], ans:0 },
    { q:'Luas lingkaran dengan jari-jari 7 cm adalah... (π=22/7)', opts:['154 cm²','44 cm²','22 cm²','308 cm²'], ans:0 },
  ]},
  { id:'ipa7', label:'IPA Kelas 7', icon:'🧪', color:'#085041', soal:[
    { q:'Satuan SI untuk massa adalah...', opts:['gram','kilogram','ton','miligram'], ans:1 },
    { q:'Zat yang memiliki bentuk dan volume tetap adalah...', opts:['Gas','Cair','Padat','Plasma'], ans:2 },
  ]},
]

export default function LandscapeLatihanUjian({ goBack }) {
  const [paket, setPaket] = useState(FALLBACK_PAKET)
  const [activePaket, setActivePaket] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  const STORAGE_KEY = 'tomat_latihan_history'

  // PAKET_UJIAN loaded via dynamic import (Vite ESM-safe)
  useEffect(() => {
    import('../../data/soalUjian').then(m => {
      if (m?.PAKET_UJIAN?.length) {
        // Normalise format: soalUjian uses { questions, answer(int) }
        // while our local fallback uses { soal, opts[], ans }
        const normalised = m.PAKET_UJIAN.map(p => ({
          ...p,
          soal: (p.questions || []).map(q => ({
            q: q.soal || q.question || '',
            opts: (q.options || []).map(o => o.value ?? o.label ?? o),
            ans: q.answer ?? 0,
          })),
        }))
        setPaket(normalised)
      }
    }).catch(() => {})
  }, [])

  const startPaket = (p) => {
    setActivePaket(p)
    setCurrentQ(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
    setTimeLeft(p.soal.length * 60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setFinished(true); return 0 } return t-1 })
    }, 1000)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  const next = () => {
    if (selected === null) return
    const newAnswers = [...answers, selected]
    if (currentQ + 1 >= activePaket.soal.length) {
      clearInterval(timerRef.current)
      const score = Math.round(newAnswers.filter((a,i) => a === activePaket.soal[i].ans).length / activePaket.soal.length * 100)
      try { const h = JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); h[activePaket.id] = {score, date:new Date().toISOString()}; localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch {}
      setAnswers(newAnswers)
      setFinished(true)
    } else {
      setAnswers(newAnswers)
      setCurrentQ(q => q+1)
      setSelected(null)
    }
  }

  const history = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') } catch { return {} } })()

  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  if (activePaket && !finished) {
    const q = activePaket.soal[currentQ]
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Exam header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={() => { clearInterval(timerRef.current); setActivePaket(null) }}>✕</div>
            <span style={{ color:C.txt, fontSize:13, fontWeight:700 }}>{activePaket.label}</span>
          </div>
          <div style={{ background:'#2e2200', border:'0.5px solid #5a4000', borderRadius:8, padding:'4px 12px', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12 }}>⏱</span>
            <span style={{ color: timeLeft<=30?'#f0997b':C.gold, fontSize:13, fontWeight:800, fontVariantNumeric:'tabular-nums' }}>{fmtTime(timeLeft||0)}</span>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', minHeight:0 }}>
          {/* Progress soal */}
          <div style={{ width:'18%', borderRight:'0.5px solid #1e2644', padding:'10px 8px', display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, marginBottom:2 }}>SOAL</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {activePaket.soal.map((_,i) => (
                <div key={i} style={{ width:24, height:24, borderRadius:6, background: i<currentQ?C.green: i===currentQ?'#3c3489':C.card, border: i===currentQ?'0.5px solid #cecbf6':`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color: i<=currentQ?'#fff':C.muted, fontSize:8, fontWeight:700 }}>{i+1}</div>
              ))}
            </div>
          </div>

          {/* Soal + pilihan */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', gap:10 }}>
            <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:11, padding:'13px 16px', flexShrink:0 }}>
              <div style={{ color:C.muted, fontSize:8, marginBottom:5 }}>No. {currentQ+1}</div>
              <div style={{ color:C.txt, fontSize:12, fontWeight:600, lineHeight:1.7 }}>{q.q}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, flex:1 }}>
              {q.opts.map((opt,i) => (
                <div key={i} onClick={() => setSelected(i)} style={{ background: i===selected?'linear-gradient(135deg,#3c3489,#2a2470)':C.card, border: i===selected?'0.5px solid #cecbf6':`0.5px solid ${C.border}`, borderRadius:10, padding:'10px 13px', display:'flex', alignItems:'center', gap:9, cursor:'pointer', transition:'all 0.12s' }}>
                  <div style={{ width:24, height:24, borderRadius:7, background: i===selected?C.purple:'#2a3158', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color: i===selected?'#12172b':C.muted, fontSize:10, fontWeight:800 }}>{['A','B','C','D'][i]}</span>
                  </div>
                  <span style={{ color: i===selected?'#eeedfe':C.txt, fontSize:10.5, fontWeight: i===selected?600:400 }}>{opt}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
              {currentQ > 0 && <div onClick={() => { setCurrentQ(q=>q-1); setSelected(answers[currentQ-1]??null) }} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'7px 16px', color:C.sub, fontSize:10, cursor:'pointer' }}>← Kembali</div>}
              <div onClick={next} style={{ background: selected!==null?`linear-gradient(135deg,${C.orange},#c94f2d)`:'#2a3158', borderRadius:8, padding:'7px 20px', color:'#fff', fontSize:10, fontWeight:700, cursor: selected!==null?'pointer':'default', opacity: selected!==null?1:0.4 }}>
                {currentQ+1 >= activePaket.soal.length ? 'Selesai ✓' : 'Selanjutnya →'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activePaket && finished) {
    const score = Math.round(answers.filter((a,i) => a === activePaket.soal[i]?.ans).length / activePaket.soal.length * 100)
    const scoreColor = score>=80?C.green:score>=60?C.gold:'#f0997b'
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
        <div style={{ fontSize:48 }}>{score>=80?'🏆':score>=60?'😊':'📖'}</div>
        <div style={{ color:scoreColor, fontSize:52, fontWeight:900 }}>{score}</div>
        <div style={{ color:C.sub, fontSize:12 }}>Skor kamu di {activePaket.label}</div>
        <div style={{ display:'flex', gap:8 }}>
          <div onClick={() => startPaket(activePaket)} style={{ background:'#3c3489', borderRadius:10, padding:'9px 22px', color:'#eeedfe', fontSize:11, fontWeight:700, cursor:'pointer' }}>Coba Lagi</div>
          <div onClick={() => setActivePaket(null)} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'9px 22px', color:C.sub, fontSize:11, cursor:'pointer' }}>Paket Lain</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
        <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Latihan Ujian</span>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'12px 16px', overflowY:'auto' }}>
        {paket.map((p,i) => {
          const done = history[p.id]
          return (
            <div key={i} onClick={() => startPaket(p)} style={{ background:`linear-gradient(160deg,${p.color}cc,${p.color}88)`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', boxShadow:`0 4px 16px ${p.color}44`, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', right:-10, top:-10, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
              {done && <div style={{ position:'absolute', top:8, right:10, fontSize:18 }}>✅</div>}
              <span style={{ fontSize:30, flexShrink:0 }}>{p.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ color:'#f2ede3', fontSize:13, fontWeight:700 }}>{p.label}</div>
                <div style={{ color:'rgba(242,237,227,0.65)', fontSize:9.5, marginTop:3 }}>{p.soal.length} soal</div>
                {done && <div style={{ color:'rgba(242,237,227,0.8)', fontSize:9, marginTop:4 }}>Skor terakhir: <strong>{done.score}</strong></div>}
              </div>
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'8px 14px', flexShrink:0, color:'#fff', fontSize:10, fontWeight:700 }}>Mulai ▶</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
