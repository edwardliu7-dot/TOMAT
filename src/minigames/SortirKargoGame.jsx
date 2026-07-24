import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function isPrime(n) {
  if (n < 2) return false
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false
  return true
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const POOLS = {
  easy: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  medium: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 27, 29, 31],
  hard: [23, 29, 31, 33, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 67, 71],
}

function genQ(difficulty = 'medium') {
  const pool = byDifficulty(difficulty, POOLS)
  const selected = shuffle(pool).slice(0, 9)
  return { rocks: selected }
}

export default function ScannerPermatGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [tapped, setTapped] = useState(new Set())
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setTapped(new Set()); setFeedback(null) }, [effectiveDifficulty])

  const tapRock = (n) => {
    if (feedback !== null) return
    setTapped(prev => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n); else next.add(n)
      return next
    })
  }

  const scan = () => {
    const correctPrimes = new Set(q.rocks.filter(isPrime))
    const isCorrect = [...correctPrimes].every(n => tapped.has(n)) && [...tapped].every(n => correctPrimes.has(n))
    setFeedback(isCorrect)
    survivalState.recordResult(isCorrect)
    if (isCorrect) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const primesInSet = q.rocks.filter(isPrime)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="💎 Scanner Batu Permata" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>KONVEYOR BATU TAMBANG</div>
          <svg width="220" height="62" viewBox="0 0 220 62" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {/* Scanner frame */}
            <rect x="78" y="2" width="64" height="38" rx="4" fill="rgba(103,232,249,0.06)" stroke="#67E8F9" strokeWidth="1.5" />
            {/* Scan beam */}
            <line x1="80" y1="20" x2="140" y2="20" stroke="rgba(103,232,249,0.6)" strokeWidth="2" strokeDasharray="6,3" />
            <text x="90" y="16" fill="rgba(103,232,249,0.5)" fontSize="8">SCAN</text>
            {/* Conveyor belt */}
            <rect x="4" y="44" width="212" height="14" rx="6" fill="#0a1428" stroke="rgba(103,232,249,0.3)" strokeWidth="1.5" />
            {[14,36,58,80,102,124,146,168,190].map((x,i)=>(
              <circle key={i} cx={x} cy="51" r="5" fill="#001014" stroke="rgba(103,232,249,0.2)" strokeWidth="1" />
            ))}
            {/* Rocks on belt */}
            <text x="30" y="46" fontSize="14">🪨</text>
            <text x="55" y="46" fontSize="14">🪨</text>
            <text x="160" y="46" fontSize="14">🪨</text>
            <text x="185" y="46" fontSize="14">🪨</text>
            {/* Highlighted prime rock in scanner */}
            <text x="102" y="42" fontSize="16" style={{filter:'drop-shadow(0 0 6px #67E8F9)'}}>🪨</text>
            {/* Check marks */}
            <text x="24" y="36" fill="rgba(52,211,153,0.7)" fontSize="10">✓</text>
            <text x="50" y="36" fill="rgba(239,68,68,0.7)" fontSize="10">✗</text>
            {/* Arrow direction */}
            <polygon points="210,50 202,46 202,54" fill="rgba(103,232,249,0.4)" />
            {/* Label */}
            <text x="110" y="60" textAnchor="middle" fill="rgba(103,232,249,0.4)" fontSize="8">ketuk batu bertanda prima</text>
          </svg>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
            Gunakan pemindai! Pilih batu yang berisi <strong style={{ color: '#fff' }}>bilangan prima</strong> saja.
            <br /><span style={{ fontSize: 12 }}>Bilangan prima hanya bisa dibagi 1 dan dirinya sendiri.</span>
          </div>
          {/* Conveyor belt */}
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '6px 2px', border: '1px solid rgba(103,232,249,0.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '8px' }}>
              {q.rocks.map((n, i) => {
                const isTapped = tapped.has(n)
                const showResult = feedback !== null
                const isCorrect = isPrime(n)
                let bg = isTapped ? 'rgba(103,232,249,0.2)' : 'rgba(255,255,255,0.04)'
                let border = isTapped ? '#67E8F9' : 'rgba(255,255,255,0.12)'
                if (showResult) {
                  if (isCorrect) { bg = 'rgba(22,163,74,0.2)'; border = '#22c55e' }
                  else if (isTapped) { bg = 'rgba(220,38,38,0.2)'; border = '#ef4444' }
                }
                return (
                  <button key={i} onClick={() => tapRock(n)} disabled={feedback !== null} style={{
                    background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '14px 8px',
                    cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <div style={{ fontSize: 20 }}>🪨</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: isTapped ? '#67E8F9' : '#fff' }}>{n}</div>
                    {showResult && <div style={{ fontSize: 11 }}>{isCorrect ? '✅' : '❌'}</div>}
                  </button>
                )
              })}
            </div>
          </div>
          {feedback === null && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              {tapped.size} batu dipilih · Ketuk untuk memilih/batal
            </div>
          )}
        </Card>

        {feedback === null ? (
          <Btn onClick={scan} disabled={tapped.size === 0} color="#0e7490">🔍 Aktifkan Pemindai!</Btn>
        ) : (
          <>
            <FeedbackBanner
              message={feedback
                ? `✅ Pemindai akurat! Prima: ${primesInSet.join(', ')}`
                : `❌ Ada yang salah! Prima yang benar: ${primesInSet.join(', ')}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Konveyor Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
