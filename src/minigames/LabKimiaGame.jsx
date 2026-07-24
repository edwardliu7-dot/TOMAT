import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

// Pipe segments with fraction lengths
const PIPES = [
  { id: 'p1', label: '1/4 m', value: 0.25 },
  { id: 'p2', label: '1/2 m', value: 0.50 },
  { id: 'p3', label: '3/4 m', value: 0.75 },
  { id: 'p4', label: '1/3 m', value: 1 / 3 },
  { id: 'p5', label: '2/3 m', value: 2 / 3 },
  { id: 'p6', label: '1/8 m', value: 0.125 },
]

// NOTE: each puzzle's pipe combo must use distinct PIPES ids (the pipe pool has
// exactly one chip per id, so a target requiring the same id twice is unsolvable).
const QUESTIONS = [
  { target: 0.75, label: '3/4 meter', tier: 'easy', slots: [
    { id: 's1', accepts: ['p1'] },
    { id: 's2', accepts: ['p2'] }
  ]},
  { target: 1.0, label: '1 meter', tier: 'easy', slots: [
    { id: 's1', accepts: ['p1'] },
    { id: 's2', accepts: ['p3'] }
  ]},
  { target: 1.25, label: '5/4 meter', tier: 'medium', slots: [
    { id: 's1', accepts: ['p2'] },
    { id: 's2', accepts: ['p3'] }
  ]},
  { target: 1.5, label: '3/2 meter', tier: 'medium', slots: [
    { id: 's1', accepts: ['p1'] },
    { id: 's2', accepts: ['p2'] },
    { id: 's3', accepts: ['p3'] },
  ]},
  { target: 1.75, label: '7/4 meter', tier: 'hard', slots: [
    { id: 's1', accepts: ['p3'] },
    { id: 's2', accepts: ['p4'] },
    { id: 's3', accepts: ['p5'] },
  ]},
  { target: 1.625, label: '13/8 meter', tier: 'hard', slots: [
    { id: 's1', accepts: ['p1'] },
    { id: 's2', accepts: ['p2'] },
    { id: 's3', accepts: ['p3'] },
    { id: 's4', accepts: ['p6'] },
  ]},
  { target: 2.0, label: '2 meter', tier: 'hard', slots: [
    { id: 's1', accepts: ['p1'] },
    { id: 's2', accepts: ['p3'] },
    { id: 's3', accepts: ['p4'] },
    { id: 's4', accepts: ['p5'] },
  ]},
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(QUESTIONS, difficulty))
}

export default function PipaAirGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    setQ(genQ(effectiveDifficulty))
    setPlaced({})
    setFeedback(null)
  }, [effectiveDifficulty])

  const handlePlace = (slotId, pipeId) => {
    const newPlaced = { ...placed, [slotId]: pipeId }
    setPlaced(newPlaced)
    
    if (Object.keys(newPlaced).length === q.slots.length) {
      let totalValue = 0
      Object.values(newPlaced).forEach(pid => {
        totalValue += PIPES.find(p => p.id === pid).value
      })
      
      const correct = Math.abs(totalValue - q.target) < 0.01
      setFeedback(correct)
      survivalState.recordResult(correct)
      if (correct) { addCoins(50); addExp(100) }
    }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔧 Teknisi Pipa Air" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <svg width="220" height="80" viewBox="0 0 220 80" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {/* Wall mount left */}
            <rect x="8" y="32" width="12" height="16" rx="3" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            {/* Main pipe horizontal */}
            <rect x="20" y="36" width="60" height="8" rx="3" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            {/* Pipe segment 1 */}
            <rect x="82" y="36" width="28" height="8" rx="3" fill="#0a2035" stroke="#67E8F9" strokeWidth="2" />
            <text x="96" y="43" textAnchor="middle" fill="#67E8F9" fontSize="8" fontWeight="700">1/2</text>
            {/* Gap */}
            <line x1="112" y1="40" x2="122" y2="40" stroke="rgba(103,232,249,0.3)" strokeWidth="1.5" strokeDasharray="3,3" />
            {/* Pipe segment 2 */}
            <rect x="124" y="36" width="28" height="8" rx="3" fill="#0a2035" stroke="#f59e0b" strokeWidth="2" />
            <text x="138" y="43" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="700">1/4</text>
            {/* End tank */}
            <rect x="156" y="24" width="30" height="32" rx="4" fill="#001428" stroke="#67E8F9" strokeWidth="1.5" />
            <rect x="160" y="28" width="22" height="20" rx="2" fill="rgba(103,232,249,0.12)" />
            <text x="171" y="42" textAnchor="middle" fill="#67E8F9" fontSize="9" fontWeight="700">?m</text>
            {/* Water flow arrows */}
            {[30,50,70].map((x,i)=>(
              <polygon key={i} points={`${x},37 ${x+8},40 ${x},43`} fill="rgba(103,232,249,0.4)" />
            ))}
            {/* Drip */}
            <ellipse cx="171" cy="60" rx="4" ry="5" fill="rgba(103,232,249,0.3)" />
            <text x="110" y="76" textAnchor="middle" fill="rgba(103,232,249,0.5)" fontSize="9">pecahan + pecahan = total</text>
          </svg>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Sambungkan pipa hingga mencapai:</div>
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#fff' }}>{q.label}</div>
        </Card>

        <Card border="rgba(103,232,249,0.2)">
          <DragMatch
            items={PIPES}
            slots={q.slots}
            placed={placed}
            onPlace={handlePlace}
            disabled={feedback !== null}
            accentColor="#67E8F9"
            renderChip={(it) => (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18 }}>🔩</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#67E8F9' }}>{it.label}</div>
              </div>
            )}
            renderSlot={() => <div style={{ fontSize: 12, color: '#6B7280' }}>Geser Pipa</div>}
          />
        </Card>

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Saluran tersambung! Air mengalir lancar!' : '❌ Pipa tidak pas! Air masih bocor.'}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Saluran Berikutnya ▶</Btn>
          </>
        )}
        
        {feedback === false && (
          <Btn onClick={() => { setPlaced({}); setFeedback(null) }} color="#334155">Coba Lagi</Btn>
        )}
      </div>
    </div>
  )
}
