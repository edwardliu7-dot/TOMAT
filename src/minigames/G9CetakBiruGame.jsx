import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const a = 2 + Math.floor(Math.random() * 3)
  const b = 2 + Math.floor(Math.random() * 4)
  const k = 2 + Math.floor(Math.random() * 3)
  const bigA = a * k
  const answer = b * k
  return { a, b, k, bigA, answer }
}

export default function G9CetakBiruGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(1); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #062b1a 0%, #041a10 100%)' }}>
      <PlayerHeader />
      <TopBar title="🧊 Cetak Biru Hologram" onBack={goBack} accentColor="#86EFAC" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(134,239,172,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Hologram: {q.a}cm × {q.b}cm.<br />
            Suku cadang asli: Sisi {q.bigA}cm sebangun dengan sisi {q.a}cm.
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa panjang sisi lainnya pada suku cadang asli?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={1} max={30} step={1}
              onChange={setVal}
              accentColor="#86EFAC" unit=" cm"
              leftLabel="1cm" rightLabel="30cm"
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#16a34a">Bangun Suku Cadang</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Benar! ${q.answer} cm` : `❌ Salah. Jawaban: ${q.answer} cm`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
