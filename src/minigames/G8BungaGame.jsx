import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
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
  const [digits, setDigits] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setDigits(''); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null || digits === '') return
    const correct = parseInt(digits, 10) === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2d0a00 0%, #1a0a00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌸 Teka-teki Hutan Bunga" onBack={goBack} accentColor="#FCA5A5" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(252,165,165,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FCA5A5', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            HITUNG KELOPAK BUNGA AJAIB
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Setiap bunga memiliki kelopak sebanyak jumlah dua bunga sebelumnya. Berapa kelopak bunga ke-5?
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
            {q.terms.map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Bunga {i + 1}</div>
                <div style={{ background: 'rgba(252,165,165,0.08)', border: '1px solid rgba(252,165,165,0.25)', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                  <div style={{ fontSize: 14 }}>🌸</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{t}</div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Bunga 5</div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(252,165,165,0.4)', borderRadius: 10, padding: '10px 12px', minWidth: 56 }}>
                <div style={{ fontSize: 14 }}>❓</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FCA5A5' }}>{digits || '?'}</div>
              </div>
            </div>
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#dc2626">Buka Jalan</Btn>
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
