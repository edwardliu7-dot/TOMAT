import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const TABLES = [
  { label1: 'Waktu (jam)', label2: 'Jarak (km)', rows: [[1, 80], [2, 160], [3, '?'], [4, 320]], answer: 240, max: 400, unit: 'km', tier: 'easy' },
  { label1: 'Tiket', label2: 'Harga (koin)', rows: [[1, 5], [2, 10], [3, '?'], [5, 25]], answer: 15, max: 30, unit: 'koin', tier: 'easy' },
  { label1: 'Wagon', label2: 'Penumpang', rows: [[1, 50], [2, 100], [4, '?'], [6, 300]], answer: 200, max: 400, unit: 'penumpang', tier: 'medium' },
  { label1: 'Bahan Bakar (L)', label2: 'Jarak (km)', rows: [[2, 60], [4, 120], [6, '?'], [8, 240]], answer: 180, max: 300, unit: 'km', tier: 'medium' },
  { label1: 'Rel (m)', label2: 'Waktu (menit)', rows: [[100, 2], [200, 4], [300, '?'], [500, 10]], answer: 6, max: 15, unit: 'menit', tier: 'hard' },
  { label1: 'Truk', label2: 'Muatan (ton)', rows: [[3, 30], [5, 50], [7, '?'], [9, 90]], answer: 70, max: 100, unit: 'ton', tier: 'hard' },
  { label1: 'Percobaan', label2: 'Hasil (gram)', rows: [[4, 10], [8, 20], [14, '?'], [20, 50]], answer: 35, max: 60, unit: 'gram', tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  const base = pickFrom(poolForDifficulty(TABLES, difficulty))
  const qRow = base.rows.findIndex(r => r[1] === '?')
  return { ...base, qRow }
}

export default function RelKeretaGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [selectedVal, setSelectedVal] = useState(0)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setSelectedVal(0); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (feedback !== null) return
    const correct = selectedVal === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚄 Menyusun Rel Kereta Cepat" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <svg width="220" height="72" viewBox="0 0 220 72" style={{ display:'block', margin:'0 auto 10px', overflow:'visible' }}>
            {/* Rails */}
            <line x1="8" y1="52" x2="212" y2="52" stroke="rgba(245,158,11,0.5)" strokeWidth="2.5" />
            <line x1="8" y1="58" x2="212" y2="58" stroke="rgba(245,158,11,0.5)" strokeWidth="2.5" />
            {/* Sleepers */}
            {[10,28,46,64,82,100,118,136,154,172,190].map((x,i)=>(
              <rect key={i} x={x} y="49" width="10" height="12" rx="1" fill="#0a1428" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
            ))}
            {/* Train locomotive */}
            <rect x="8" y="28" width="60" height="24" rx="5" fill="#001428" stroke="#f59e0b" strokeWidth="2" />
            <rect x="14" y="32" width="20" height="14" rx="2" fill="#0a2035" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
            <circle cx="20" cy="54" r="6" fill="#001428" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="52" cy="54" r="6" fill="#001428" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Smoke */}
            <circle cx="14" cy="20" r="5" fill="rgba(245,158,11,0.12)" />
            <circle cx="22" cy="13" r="7" fill="rgba(245,158,11,0.08)" />
            {/* Train wagons */}
            <rect x="72" y="34" width="42" height="18" rx="3" fill="#001428" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" />
            <circle cx="82" cy="54" r="5" fill="#001428" stroke="rgba(245,158,11,0.4)" strokeWidth="1.2" />
            <circle cx="106" cy="54" r="5" fill="#001428" stroke="rgba(245,158,11,0.4)" strokeWidth="1.2" />
            <rect x="118" y="34" width="42" height="18" rx="3" fill="#001428" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />
            <circle cx="128" cy="54" r="5" fill="#001428" stroke="rgba(245,158,11,0.35)" strokeWidth="1.2" />
            <circle cx="152" cy="54" r="5" fill="#001428" stroke="rgba(245,158,11,0.35)" strokeWidth="1.2" />
            {/* Question wagon */}
            <rect x="164" y="34" width="42" height="18" rx="3" fill="rgba(245,158,11,0.07)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x="185" y="46" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="900">?</text>
            <circle cx="174" cy="54" r="5" fill="#001428" stroke="#f59e0b" strokeWidth="1.2" />
            <circle cx="198" cy="54" r="5" fill="#001428" stroke="#f59e0b" strokeWidth="1.2" />
          </svg>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(103,232,249,0.2)', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(103,232,249,0.15)' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9', borderRight: '1px solid rgba(103,232,249,0.15)' }}>{q.label1}</div>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9' }}>{q.label2}</div>
            </div>
            {q.rows.map((row, i) => {
              const isQ = i === q.qRow
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(103,232,249,0.1)', background: isQ ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                  <div style={{ padding: '12px 14px', fontSize: 15, fontWeight: 700, color: '#fff', borderRight: '1px solid rgba(103,232,249,0.1)' }}>{row[0]}</div>
                  <div style={{ padding: '12px 14px', fontSize: 15, fontWeight: 700, color: isQ ? '#f59e0b' : '#fff' }}>
                    {isQ ? (feedback !== null ? q.answer : selectedVal || '?') : row[1]}
                  </div>
                </div>
              )
            })}
          </div>

          <SliderInput
            value={selectedVal}
            min={0}
            max={q.max}
            onChange={setSelectedVal}
            disabled={feedback !== null}
            accentColor="#f59e0b"
          />
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color="#0e7490">
            ✅ Konfirmasi Nilai: {selectedVal}
          </Btn>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Rel tersambung!` : `❌ Rel bengkok! Jawaban: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
