import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ() {
  const start = rand(-15, 10)
  const change = rand(2, 12)
  const isRise = Math.random() < 0.5
  const answer = isRise ? start + change : start - change
  // Dynamic range: cover both start and answer with ~8°C padding, snapped to nearest 5
  const lo = Math.min(start, answer)
  const hi = Math.max(start, answer)
  const tempMin = Math.floor((lo - 8) / 5) * 5
  const tempMax = Math.ceil((hi + 8) / 5) * 5
  return { start, change, isRise, answer, tempMin, tempMax }
}

export default function TermometerGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null) // student's temp guess
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  const confirm = () => {
    const currentVal = selected !== null ? selected : q.start
    if (feedback !== null) return
    const correct = currentVal === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const displayTemp = selected !== null ? selected : q.start
  const fillPct = (t) => ((t - q.tempMin) / (q.tempMax - q.tempMin)) * 100
  const studentFill = fillPct(displayTemp)
  const startFill = fillPct(q.start)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌡️ Termometer Penyelamat" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Suhu awal: <strong style={{ color: '#fff' }}>{q.start}°C</strong>. {q.isRise ? '🔥 Naik' : '❄️ Turun'} <strong style={{ color: '#67E8F9' }}>{q.change}°C</strong>. Geser ke suhu akhir!
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 40, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '2px solid rgba(103,232,249,0.4)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: `${startFill}%`, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.3)', zIndex: 2 }} />
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${studentFill}%`, background: 'linear-gradient(180deg,#67E8F9,#2563eb)', borderRadius: 20, transition: 'height 0.2s' }} />
            </div>
          </div>

          <SliderInput
            value={displayTemp}
            min={q.tempMin}
            max={q.tempMax}
            onChange={setSelected}
            disabled={feedback !== null}
            unit="°C"
            markEvery={5}
            accentColor="#67E8F9"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi {displayTemp}°C
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Hewan selamat! Suhu akhir = ${q.answer}°C` : `❌ Gagal! Jawaban benar: ${q.answer}°C`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
