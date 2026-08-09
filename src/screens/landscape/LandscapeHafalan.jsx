/**
 * LandscapeHafalan — same logic as original HafalanScreen.
 * API: GET /api/siswa/hafalan → { perkalian: {'1':'lulus',...}, pembagian: {'1':'diulang',...} }
 * Cards generated locally (same genPerkalianCards/genPembagianCards as original).
 * Reward: 30 coins for 10/10, 15 coins for 8-9/10 (via usePlayer.addCoins).
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePlayer } from '../../PlayerContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f' }

const REWARD_BY_SCORE = { 10:30, 9:15, 8:15 }

// Same generators as original HafalanScreen
function genPerkalianCards(angka) {
  return Array.from({ length:10 }, (_,i) => {
    const k = i+1
    return { question:`${angka} × ${k}`, answer: angka*k }
  })
}
function genPembagianCards(angka) {
  return Array.from({ length:10 }, (_,i) => {
    const k = i+1
    return { question:`${angka*k} ÷ ${angka}`, answer: k }
  })
}
function genCards(jenis, angka) {
  return jenis==='perkalian' ? genPerkalianCards(angka) : genPembagianCards(angka)
}
function shuffle(arr) {
  const a = [...arr]
  for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a
}
function getStatus(hafalanStatus, jenis, angka) {
  return hafalanStatus?.[jenis]?.[String(angka)] || 'default'
}

const STATUS_COLOR = { lulus:'#10b981', diulang:'#f59e0b', default:'#4a5280' }
const STATUS_LABEL = { lulus:'✅ Lulus', diulang:'🔁 Ulangi', default:'⬜ Belum' }

// Simple numpad component
function Numpad({ value, onChange, onSubmit }) {
  const press = (d) => {
    if (d==='⌫') { onChange(value.slice(0,-1)); return }
    if (value.length>=3) return
    onChange(value+d)
  }
  const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','✓']
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, width:180 }}>
      {KEYS.map(k => (
        <button key={k} type="button" onClick={() => k==='✓'?onSubmit():press(k)} style={{ padding:'14px 0', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:16, fontWeight:800, background: k==='✓'?'#0e7490':k==='⌫'?'rgba(248,113,113,0.12)':'rgba(255,255,255,0.07)', color: k==='✓'?'#fff':k==='⌫'?'#f87171':'#e2e8f0', boxShadow: k==='✓'?'0 4px 12px rgba(14,116,144,0.3)':'none' }}>
          {k}
        </button>
      ))}
    </div>
  )
}

export default function LandscapeHafalan({ goBack }) {
  const { addCoins } = usePlayer() || {}

  // Same state as original HafalanScreen
  const [hafalanStatus, setHafalanStatus] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('home')   // home | flash | kuis | result
  const [jenis, setJenis]       = useState('perkalian')
  const [angka, setAngka]       = useState(null)
  const [cards, setCards]       = useState([])
  const [cardIdx, setCardIdx]   = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [kuisQs, setKuisQs]     = useState([])
  const [kuisIdx, setKuisIdx]   = useState(0)
  const [kuisInput, setKuisInput] = useState('')
  const [kuisCorrect, setKuisCorrect] = useState(0)
  const [kuisWrong, setKuisWrong]    = useState([])
  const [kuisFeedback, setKuisFeedback] = useState(null)
  const feedbackTimer = useRef(null)

  // Fetch hafalan status from same endpoint as original
  useEffect(() => {
    fetch('/api/siswa/hafalan', { credentials:'include' })
      .then(r => r.json())
      .then(d => { setHafalanStatus({ perkalian: d.perkalian||{}, pembagian: d.pembagian||{} }); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openDetail = (j, n) => { setJenis(j); setAngka(n) }

  const startFlash = () => {
    setCards(genCards(jenis, angka)); setCardIdx(0); setFlipped(false); setView('flash')
  }
  const startKuis = () => {
    setKuisQs(shuffle(genCards(jenis, angka))); setKuisIdx(0); setKuisInput(''); setKuisCorrect(0); setKuisWrong([]); setKuisFeedback(null); setView('kuis')
  }

  const submitKuisAnswer = useCallback(() => {
    if (!kuisInput.trim()) return
    const q = kuisQs[kuisIdx]
    const isCorrect = parseInt(kuisInput,10) === q.answer
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setKuisFeedback(isCorrect?'correct':'wrong')
    const newCorrect = isCorrect ? kuisCorrect+1 : kuisCorrect
    const newWrong   = isCorrect ? kuisWrong : [...kuisWrong, { question:q.question, userAnswer:kuisInput, correct:q.answer }]
    feedbackTimer.current = setTimeout(() => {
      setKuisFeedback(null); setKuisInput('')
      if (kuisIdx+1 >= kuisQs.length) {
        const reward = REWARD_BY_SCORE[newCorrect]
        if (reward && addCoins) addCoins(reward)
        setKuisCorrect(newCorrect); setKuisWrong(newWrong); setView('result')
      } else {
        setKuisCorrect(newCorrect); setKuisWrong(newWrong); setKuisIdx(i=>i+1)
      }
    }, 700)
  }, [kuisInput, kuisQs, kuisIdx, kuisCorrect, kuisWrong, addCoins])

  if (loading) return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontFamily:'system-ui,sans-serif' }}>Memuat…</div>
  )

  // ── VIEW: HOME ──────────────────────────────────────────────────────────────
  if (view === 'home') {
    const jenisOpts = [
      { id:'perkalian', label:'Perkalian ×', icon:'✖️' },
      { id:'pembagian', label:'Pembagian ÷', icon:'➗' },
    ]
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
            <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>🧮 Hafalan Interaktif</span>
          </div>
          <div style={{ background:'#0d2a20', border:`0.5px solid #2a5040`, borderRadius:7, padding:'3px 10px', color:C.green, fontSize:9, fontWeight:700 }}>🪙 +30 coin/lulus</div>
        </div>

        <div style={{ flex:1, display:'flex', minHeight:0 }}>
          {/* Jenis selector */}
          <div style={{ width:'22%', borderRight:`0.5px solid #1e2644`, display:'flex', flexDirection:'column', padding:'10px 8px', gap:6 }}>
            <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>JENIS</div>
            {jenisOpts.map(j => (
              <div key={j.id} onClick={() => openDetail(j.id, angka||2)} style={{ background: j.id===jenis?'#3c3489':C.card, border: j.id===jenis?'none':`0.5px solid ${C.border}`, borderRadius:9, padding:'10px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{j.icon}</span>
                <span style={{ color: j.id===jenis?'#eeedfe':C.sub, fontSize:11, fontWeight: j.id===jenis?700:400 }}>{j.label}</span>
              </div>
            ))}
          </div>

          {/* Angka grid */}
          <div style={{ flex:1, padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>PILIH ANGKA — {jenis.toUpperCase()}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, flex:1 }}>
              {Array.from({length:10},(_,i)=>i+1).map(n => {
                const st = getStatus(hafalanStatus, jenis, n)
                const sc = STATUS_COLOR[st]
                const selected = angka===n
                return (
                  <div key={n} onClick={() => openDetail(jenis, n)} style={{ background: selected?'#3c3489':C.card, border:`1px solid ${selected?'#5a4fc0':sc+'55'}`, borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, cursor:'pointer', padding:8 }}>
                    <div style={{ fontSize:22, fontWeight:900, color:selected?'#eeedfe':C.txt }}>{n}</div>
                    <div style={{ fontSize:8, color: selected?'#b0aaff':sc, fontWeight:700 }}>{STATUS_LABEL[st]}</div>
                  </div>
                )
              })}
            </div>
            {angka && (
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={startFlash} style={{ flex:1, background:'#1c3a60', border:`1px solid #2a5080`, borderRadius:10, padding:'10px', color:'#93c5fd', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🃏 Flash Card</button>
                <button onClick={startKuis} style={{ flex:1, background:`linear-gradient(135deg,${C.orange},#c94f2d)`, border:'none', borderRadius:10, padding:'10px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>📝 Kuis Mandiri</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── VIEW: FLASH CARD ────────────────────────────────────────────────────────
  if (view === 'flash') {
    const current = cards[cardIdx]
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={()=>setView('home')}>‹</div>
          <span style={{ color:C.txt, fontSize:14, fontWeight:700 }}>Flash Card — {jenis} {angka}</span>
          <span style={{ marginLeft:'auto', color:C.muted, fontSize:10 }}>{cardIdx+1}/{cards.length}</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:20 }}>
          <div onClick={()=>setFlipped(f=>!f)} style={{ width:260, height:160, cursor:'pointer', position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,#1e2a50,#1c2340)', border:`1px solid #3a4a7a`, borderRadius:18, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
              {!flipped ? (
                <><div style={{ color:C.txt, fontSize:44, fontWeight:900, letterSpacing:2 }}>{current?.question}</div><div style={{ color:C.muted, fontSize:10 }}>Ketuk untuk jawaban</div></>
              ) : (
                <><div style={{ color:C.green, fontSize:44, fontWeight:900 }}>{current?.answer}</div><div style={{ color:C.sub, fontSize:10 }}>{current?.question} = {current?.answer}</div></>
              )}
              <div style={{ position:'absolute', bottom:10, right:12, fontSize:14 }}>🔄</div>
            </div>
          </div>
          {flipped && (
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>{setCardIdx(i=>Math.min(i+1,cards.length-1));setFlipped(false)}} style={{ background:'#712b13', border:'none', borderRadius:10, padding:'9px 22px', color:'#faece7', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✗ Ulangi</button>
              <button onClick={()=>{setCardIdx(i=>Math.min(i+1,cards.length-1));setFlipped(false)}} style={{ background:'#085041', border:'none', borderRadius:10, padding:'9px 22px', color:'#e1f5ee', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Lulus</button>
            </div>
          )}
          {cardIdx >= cards.length-1 && flipped && (
            <button onClick={()=>setView('home')} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 20px', color:C.txt, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Kembali ke Daftar</button>
          )}
        </div>
      </div>
    )
  }

  // ── VIEW: KUIS ──────────────────────────────────────────────────────────────
  if (view === 'kuis') {
    const q = kuisQs[kuisIdx]
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={()=>setView('home')}>‹</div>
          <span style={{ color:C.txt, fontSize:14, fontWeight:700 }}>Kuis — {jenis} {angka}</span>
          <div style={{ marginLeft:'auto', color:C.muted, fontSize:10 }}>{kuisIdx+1}/{kuisQs.length}</div>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:20 }}>
          <div style={{ width:260, background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:'24px', textAlign:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ color:C.txt, fontSize:44, fontWeight:900, letterSpacing:2 }}>{q?.question}</div>
          </div>
          <input
            value={kuisInput}
            onChange={e=>setKuisInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submitKuisAnswer()}
            placeholder="Jawaban..."
            style={{ background:C.card, border:`1px solid ${kuisFeedback==='correct'?C.green:kuisFeedback==='wrong'?'#712b13':C.border}`, borderRadius:10, padding:'10px 18px', color:C.txt, fontSize:22, fontWeight:700, width:140, textAlign:'center', outline:'none', fontFamily:'inherit', transition:'border 0.2s' }}
          />
          {kuisFeedback && (
            <div style={{ fontSize:16, fontWeight:700, color: kuisFeedback==='correct'?C.green:'#f0997b' }}>
              {kuisFeedback==='correct' ? '✅ Benar!' : `❌ Salah — jawaban: ${q?.answer}`}
            </div>
          )}
          <Numpad value={kuisInput} onChange={setKuisInput} onSubmit={submitKuisAnswer} />
        </div>
      </div>
    )
  }

  // ── VIEW: RESULT ────────────────────────────────────────────────────────────
  if (view === 'result') {
    const reward = REWARD_BY_SCORE[kuisCorrect]
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
        <div style={{ fontSize:48 }}>{kuisCorrect>=8?'🎉':'📋'}</div>
        <div style={{ color:C.txt, fontSize:20, fontWeight:800 }}>{kuisCorrect}/10 Benar</div>
        {reward && <div style={{ color:C.gold, fontSize:14, fontWeight:700 }}>🪙 +{reward} koin!</div>}
        {kuisWrong.length > 0 && (
          <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:12, padding:'12px 16px', width:'100%', maxWidth:400 }}>
            <div style={{ color:C.sub, fontSize:9, fontWeight:700, marginBottom:8 }}>SOAL SALAH</div>
            {kuisWrong.map((w,i) => (
              <div key={i} style={{ color:C.txt, fontSize:10, marginBottom:4 }}>{w.question} = <span style={{ color:C.green, fontWeight:700 }}>{w.correct}</span> <span style={{ color:'#f0997b', fontSize:9 }}>(kamu: {w.userAnswer})</span></div>
            ))}
          </div>
        )}
        <button onClick={()=>setView('home')} style={{ background:`linear-gradient(135deg,${C.orange},#c94f2d)`, border:'none', borderRadius:10, padding:'11px 30px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Kembali</button>
      </div>
    )
  }

  return null
}
