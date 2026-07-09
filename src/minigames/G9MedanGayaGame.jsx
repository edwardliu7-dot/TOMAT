import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import NumpadAnswer from '../components/NumpadAnswer'
import { usePlayer } from '../PlayerContext'

function genQ() {
  const r = 7 * (1 + Math.floor(Math.random() * 6))
  const C = 44 * (r / 7)
  return { C, answer: r }
}

export default function G9MedanGayaGame({ goBack }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1400 0%, #100c00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🛡️ Medan Gaya Pelindung" onBack={goBack} accentColor="#4ADE80" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(74,222,128,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#4ADE80', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            HUJAN METEOR MENDEKAT!
          </div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.8 }}>
            Perisai berbentuk lingkaran harus menutupi badan pesawat dengan keliling minimum <strong style={{ color: '#fff' }}>{q.C} meter</strong> (gunakan π ≈ 22/7).
          </div>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Berapa jari-jari (r) perisai yang harus diaktifkan?
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <NumpadAnswer digits={digits} setDigits={setDigits} negative={false} setNegative={() => {}} allowNegative={false} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={confirm} disabled={digits === ''} color="#15803d">Aktifkan Perisai</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Perisai aktif! r = ${q.answer} m` : `❌ Kurang tepat. r yang benar = ${q.answer} m`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
