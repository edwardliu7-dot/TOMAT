import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 1 + Math.floor(Math.random() * 4)
  const b = 1 + Math.floor(Math.random() * 4)
  const seq = [a, b]
  for (let i = 2; i < 5; i++) seq.push(seq[i - 1] + seq[i - 2])
  return { terms: seq.slice(0, 4), answer: seq[4] }
}

export default function G8BungaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { 
    const nq = genQ()
    setQ(nq)
    setVal(nq.terms[3])
    setFeedback(null) 
  }, [])

  React.useEffect(() => {
    setVal(q.terms[3])
  }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2d0a00 0%, #1a0a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌸 Teka-teki Hutan Bunga" onBack={goBack} accentColor="#FCA5A5" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
            Berapa kelopak bunga ke-5? (Jumlah 2 sebelumnya)
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.terms.map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.25)', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                  <div style={{ fontSize: 14 }}>🌸</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{t}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid #FCA5A5', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                <div style={{ fontSize: 14 }}>❓</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FCA5A5' }}>{val}</div>
              </div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput 
              value={val} 
              min={q.terms[0]} 
              max={q.answer + 5} 
              onChange={setVal} 
              accentColor="#FCA5A5"
            />
            <div style={{ marginTop: 24 }}>
              <Btn onClick={confirm} color="#dc2626">Buka Jalan</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! Jawabannya ${q.answer}` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
