import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const aCount = 2 + Math.floor(Math.random() * 2)
  const bCount = 2 + Math.floor(Math.random() * 3)
  const answer = Math.pow(bCount, aCount)
  return { aCount, bCount, answer }
}

export default function G8MenaraGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🗼 Kombinasi Kunci Menara" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            KRISTAL ENERGI MENARA
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.7 }}>
            Ada <strong style={{ color: '#fff' }}>{q.aCount}</strong> lantai (Himpunan A) dan <strong style={{ color: '#fff' }}>{q.bCount}</strong> jenis kristal energi (Himpunan B).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa banyak cara berbeda memetakan tiap lantai ke satu kristal? (bᵃ)
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#c2410c">Buka Kunci</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! ${q.bCount}^${q.aCount} = ${q.answer}` : `❌ Kurang tepat. ${q.bCount}^${q.aCount} = ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
