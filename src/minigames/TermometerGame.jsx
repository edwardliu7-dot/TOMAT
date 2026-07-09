import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genQ() {
  const start = rand(-15, 10)
  const change = rand(2, 12)
  const isRise = Math.random() < 0.5
  const answer = isRise ? start + change : start - change
  return { start, change, isRise, answer }
}

const TEMP_MIN = -20, TEMP_MAX = 20
const MARKS = [-20, -15, -10, -5, 0, 5, 10, 15, 20]

export default function TermometerGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [selected, setSelected] = useState(null) // student's temp guess
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setSelected(null); setFeedback(null) }, [])

  const adjust = (delta) => {
    if (feedback !== null) return
    setSelected(prev => {
      const base = prev !== null ? prev : q.start
      const next = base + delta
      return Math.max(TEMP_MIN, Math.min(TEMP_MAX, next))
    })
  }

  const confirm = () => {
    if (feedback !== null || selected === null) return
    const correct = selected === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const displayTemp = selected !== null ? selected : q.start
  const fillPct = (t) => ((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100
  const studentFill = fillPct(selected !== null ? selected : q.start)
  const startFill = fillPct(q.start)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌡️ Termometer Penyelamat" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>STASIUN CUACA DARURAT</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Suhu awal: <strong style={{ color: '#fff' }}>{q.start}°C</strong>.{' '}
            {q.isRise ? '🔥 Naik' : '❄️ Turun'} <strong style={{ color: '#67E8F9' }}>{q.change}°C</strong>.{' '}
            Geser termometer ke suhu akhir!
          </div>

          {/* Thermometer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'stretch', marginBottom: 8 }}>
            {/* Scale labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 32, paddingTop: 4 }}>
              {[...MARKS].reverse().map(m => (
                <div key={m} style={{ fontSize: 11, color: m === 0 ? '#67E8F9' : '#94A3B8', fontWeight: m === 0 ? 700 : 400, textAlign: 'right', lineHeight: 1 }}>{m}°</div>
              ))}
            </div>

            {/* Tube */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 40, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '2px solid rgba(103,232,249,0.4)', overflow: 'hidden' }}>
                {/* Start marker */}
                <div style={{ position: 'absolute', bottom: `${startFill}%`, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.3)' }} />
                {/* Student fill */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${studentFill}%`, background: selected !== null ? 'linear-gradient(180deg,#67E8F9,#2563eb)' : 'linear-gradient(180deg,#ef4444,#f97316)', borderRadius: 20, transition: 'height 0.2s' }} />
                {/* Temperature label */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 12, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}>{displayTemp}°</div>
              </div>
              {/* Bulb */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: selected !== null ? 'linear-gradient(135deg,#67E8F9,#2563eb)' : 'linear-gradient(135deg,#ef4444,#dc2626)', border: '3px solid rgba(255,255,255,0.2)', marginTop: -8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{displayTemp}°</span>
              </div>
            </div>

            {/* Tick marks */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 32, paddingTop: 4 }}>
              {[...MARKS].reverse().map(m => (
                <div key={m} style={{ width: 10, height: 2, background: m % 10 === 0 ? '#67E8F9' : 'rgba(103,232,249,0.3)' }} />
              ))}
            </div>
          </div>
        </Card>

        {/* +/- controls */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
            Geser suhu: kini <strong style={{ color: '#fff', fontSize: 18 }}>{displayTemp}°C</strong>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
            {[-5, -1].map(d => (
              <button key={d} onClick={() => adjust(d)} disabled={feedback !== null}
                style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid rgba(103,232,249,0.3)', background: 'rgba(103,232,249,0.08)', color: '#67E8F9', fontSize: 18, fontWeight: 900, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                {d}
              </button>
            ))}
            <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌡️</div>
            {[+1, +5].map(d => (
              <button key={d} onClick={() => adjust(d)} disabled={feedback !== null}
                style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: 18, fontWeight: 900, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                +{d}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
            {q.start}°C {q.isRise ? '+' : '−'} {q.change}°C = <strong style={{ color: '#fff' }}>{displayTemp}°C</strong>
          </div>
          {feedback === null && (
            <Btn onClick={confirm} color={selected !== null ? '#0e7490' : '#334155'}>
              {selected === null ? 'Geser dulu...' : `✅ Konfirmasi ${displayTemp}°C`}
            </Btn>
          )}
        </Card>

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
