import { useState, useEffect } from 'react'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f' }

export default function LandscapeHafalan({ goBack }) {
  const [cards, setCards] = useState([])
  const [mode, setMode] = useState('flashcard') // flashcard | kuis
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/siswa/hafalan', { credentials:'include' })
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        const items = data.cards || data.items || []
        setCards(items.length > 0 ? items : generateDefaultCards())
        setLoading(false)
      })
      .catch(() => { setCards(generateDefaultCards()); setLoading(false) })
  }, [])

  function generateDefaultCards() {
    const pairs = []
    for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) pairs.push({ question:`${a} × ${b}`, answer:`${a*b}`, status:'belum' })
    return pairs.slice(0, 20)
  }

  const current = cards[currentIdx]
  const lulus = cards.filter(c => c.status==='lulus').length
  const diulang = cards.filter(c => c.status==='diulang').length

  const markStatus = (status) => {
    setCards(cs => cs.map((c,i) => i===currentIdx ? {...c, status} : c))
    setFlipped(false)
    setResult(null)
    setInput('')
    setCurrentIdx(i => Math.min(i+1, cards.length-1))
  }

  const checkAnswer = () => {
    if (!current) return
    const correct = input.trim() === String(current.answer).trim()
    setResult(correct ? 'benar' : 'salah')
    if (correct) markStatus('lulus')
    else setTimeout(() => { setResult(null); setInput('') }, 1200)
  }

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 50% 60% at 70% 50%, rgba(93,202,165,0.08) 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Hafalan Interaktif</span>
        </div>
        <div style={{ background:'#0d2a20', border:'0.5px solid #2a5040', borderRadius:7, padding:'3px 10px', color:C.green, fontSize:9, fontWeight:700 }}>🪙 +30 coin/lulus</div>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>
        {/* KIRI: Daftar + mode */}
        <div style={{ width:'28%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', padding:'10px 10px', gap:7 }}>
          {/* Mode */}
          <div style={{ display:'flex', gap:6 }}>
            {[{id:'flashcard',icon:'🃏',label:'Flash Card'},{id:'kuis',icon:'📝',label:'Kuis'}].map(m => (
              <div key={m.id} onClick={() => setMode(m.id)} style={{ flex:1, background: m.id===mode?'#3c3489':C.card, border: m.id===mode?'none':`0.5px solid ${C.border}`, borderRadius:8, padding:'7px 8px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:14 }}>{m.icon}</div>
                <div style={{ color: m.id===mode?'#eeedfe':C.sub, fontSize:8.5, marginTop:2, fontWeight: m.id===mode?700:400 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'7px 9px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4, textAlign:'center' }}>
            {[{l:'Lulus',v:lulus,c:C.green},{l:'Ulangi',v:diulang,c:C.gold},{l:'Sisa',v:cards.length-lulus-diulang,c:C.muted}].map((s,i) => (
              <div key={i}>
                <div style={{ color:s.c, fontSize:13, fontWeight:800 }}>{s.v}</div>
                <div style={{ color:C.muted, fontSize:7.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ height:3, background:'#2a3158', borderRadius:2 }}>
            <div style={{ height:3, background:C.green, borderRadius:2, width:`${cards.length?lulus/cards.length*100:0}%`, transition:'width 0.3s' }} />
          </div>

          {/* Card list */}
          <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8 }}>SOAL ({cards.length})</div>
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
            {cards.slice(0,12).map((c,i) => {
              const sc = { lulus:C.green, diulang:C.gold, belum:C.muted }
              return (
                <div key={i} onClick={() => { setCurrentIdx(i); setFlipped(false); setResult(null); setInput('') }} style={{ background: i===currentIdx?'rgba(60,52,137,0.25)':C.card, border:`0.5px solid ${i===currentIdx?'#3c3489':C.border}`, borderRadius:7, padding:'5px 8px', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:sc[c.status||'belum'], flexShrink:0 }} />
                  <span style={{ color:C.txt, fontSize:10, fontWeight:600 }}>{c.question}</span>
                  <span style={{ color:C.muted, fontSize:8.5, marginLeft:'auto' }}>{c.status==='belum'?'—':c.answer}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* KANAN: Flash card atau kuis */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px 20px', gap:12 }}>
          {loading ? <div style={{ color:C.muted }}>Memuat...</div> : !current ? (
            <div style={{ color:C.green, fontSize:14, fontWeight:700 }}>Semua soal selesai! 🎉</div>
          ) : (
            <>
              <div style={{ color:C.muted, fontSize:9 }}>Soal {currentIdx+1} dari {cards.length}</div>

              {mode === 'flashcard' ? (
                <>
                  <div onClick={() => setFlipped(f => !f)} style={{ width:260, height:150, position:'relative', cursor:'pointer' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,#1e2a50,#1c2340)', border:'1px solid #3a4a7a', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 24px rgba(0,0,0,0.4)', transition:'all 0.2s' }}>
                      {!flipped ? (
                        <>
                          <div style={{ color:C.txt, fontSize:42, fontWeight:900, letterSpacing:2 }}>{current.question}</div>
                          <div style={{ color:C.muted, fontSize:10 }}>Ketuk untuk jawaban</div>
                        </>
                      ) : (
                        <>
                          <div style={{ color:C.green, fontSize:42, fontWeight:900 }}>{current.answer}</div>
                          <div style={{ color:C.sub, fontSize:10 }}>{current.question} = {current.answer}</div>
                        </>
                      )}
                      <div style={{ position:'absolute', bottom:10, right:12, fontSize:16 }}>🔄</div>
                    </div>
                  </div>
                  {flipped && (
                    <div style={{ display:'flex', gap:8 }}>
                      <div onClick={() => markStatus('diulang')} style={{ background:'#712b13', borderRadius:10, padding:'9px 22px', color:'#faece7', fontSize:11, fontWeight:700, cursor:'pointer' }}>✗ Ulangi</div>
                      <div onClick={() => markStatus('lulus')} style={{ background:'#085041', borderRadius:10, padding:'9px 22px', color:'#e1f5ee', fontSize:11, fontWeight:700, cursor:'pointer' }}>✓ Lulus</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ width:260, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:16, padding:'20px', textAlign:'center' }}>
                    <div style={{ color:C.txt, fontSize:42, fontWeight:900, letterSpacing:2 }}>{current.question}</div>
                  </div>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&checkAnswer()} placeholder="Jawaban..." style={{ background:C.card, border:`1px solid ${result==='benar'?C.green:result==='salah'?'#712b13':C.border}`, borderRadius:10, padding:'10px 18px', color:C.txt, fontSize:22, fontWeight:700, width:140, textAlign:'center', outline:'none', transition:'border 0.2s' }} />
                  <div onClick={checkAnswer} style={{ background:`linear-gradient(135deg,${C.orange},#c94f2d)`, borderRadius:10, padding:'9px 30px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Periksa ↵</div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
