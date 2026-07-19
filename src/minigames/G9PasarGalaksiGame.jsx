import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

function genQ(difficulty='medium') {
  const priceMax = byDifficulty(difficulty, { easy:20, medium:50, hard:100 })
  const px = randInt(2, priceMax) * 100   // unit price of x (tiket warp)
  const py = randInt(1, priceMax - 1) * 100 // unit price of y (oksigen)
  // Package 1: a1 tiket + b1 oksigen = total1
  const a1 = randInt(1,3), b1 = randInt(1,3)
  const a2 = randInt(1,4), b2 = randInt(1,4)
  if (a1 * b2 === a2 * b1) return genQ(difficulty)
  const t1 = a1*px + b1*py
  const t2 = a2*px + b2*py
  const { min, max } = randomSliderRange([100, px], { step:100, minPad:100, maxPad:1000 })
  return { a1, b1, t1, a2, b2, t2, px, py, answer:px, min, max }
}

export default function G9PasarGalaksiGame({ goBack, difficulty='medium', survival=false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty); setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])
  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct); survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#001428 0%,#000d1a 100%)' }}>
      <PlayerHeader />
      <TopBar title="👽 Barter Di Pasar Galaksi" onBack={goBack} accentColor="#A78BFA" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(167,139,250,0.3)">
          <div>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>🛸 Harga satuan belum diketahui. Gunakan dua paket untuk menemukannya!</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#A78BFA' }}>Paket I:</div>
                <div style={{ fontSize:14, color:'#fff' }}>{q.a1} Tiket Warp + {q.b1} Botol Oksigen = <strong>{q.t1.toLocaleString()} kredit</strong></div>
              </div>
              <div style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:10, padding:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#FBBF24' }}>Paket II:</div>
                <div style={{ fontSize:14, color:'#fff' }}>{q.a2} Tiket Warp + {q.b2} Botol Oksigen = <strong>{q.t2.toLocaleString()} kredit</strong></div>
              </div>
            </div>
            <div style={{ fontSize:13, color:'#94A3B8', marginTop:10 }}>Harga 1 Tiket Warp (x) = ? kredit</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={100} onChange={setVal} label={`Tiket = ${val.toLocaleString()} kredit`} accentColor="#A78BFA" />
            <Btn onClick={confirm} color="#A78BFA">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
