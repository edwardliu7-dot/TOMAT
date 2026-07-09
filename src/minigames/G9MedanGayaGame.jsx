import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const r = 7 * (1 + Math.floor(Math.random() * 6))
  const C = 44 * (r / 7)
  return { C, answer: r }
}

export default function G9MedanGayaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [val, setVal] = useState(7)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setVal(7); setFeedback(null) }, [])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1400 0%, #100c00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Medan Gaya Pelindung" onBack={goBack} accentColor="#4ADE80" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Keliling perisai: <strong style={{ color: '#fff' }}>{q.C} m</strong> (π ≈ 22/7).
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Tentukan jari-jari (r) perisai!
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <SliderInput
              value={val} min={7} max={70} step={7}
              onChange={setVal}
              accentColor="#4ADE80" unit=" m"
              leftLabel="7m" rightLabel="70m"
            />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} color="#15803d">Aktifkan Perisai</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Perisai aktif! r = ${q.answer} m` : `❌ Salah. r yang benar = ${q.answer} m`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
