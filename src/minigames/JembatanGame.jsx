import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, useSurvival } from '../difficulty'

function genQ(difficulty = 'medium') {
  const { bases, exps } = byDifficulty(difficulty, {
    easy: { bases: [2, 3], exps: [2, 3] },
    medium: { bases: [2, 3, 4, 5], exps: [2, 3, 4] },
    hard: { bases: [3, 4, 5, 6, 7], exps: [3, 4, 5] },
  })
  const base = bases[Math.floor(Math.random() * bases.length)]
  const exp = exps[Math.floor(Math.random() * exps.length)]
  const answer = Math.pow(base, exp)
  return { base, exp, answer }
}

export default function SporaJamurGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setInput(''); setFeedback(null) }, [effectiveDifficulty])

  const stages = Array.from({ length: q.exp + 1 }, (_, i) => Math.pow(q.base, i))

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 5) return
    setInput(p => p + k)
  }

  const confirm = () => {
    if (feedback !== null || input === '') return
    const correct = parseInt(input, 10) === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🍄 Serangan Spora Jamur" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>MONITOR PENYEBARAN JAMUR HAMA</div>
          <div style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>
            Setiap detik, <strong style={{ color: '#fff' }}>1 jamur → {q.base} jamur</strong>. Berapa jamur pada detik ke-{q.exp}?
          </div>

          {/* Growth timeline */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 16, overflowX: 'auto' }}>
            {stages.map((count, i) => {
              const isLast = i === stages.length - 1
              return (
                <React.Fragment key={i}>
                  <div style={{ textAlign: 'center', minWidth: 60, flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 6 }}>Detik {i}</div>
                    <div style={{ background: isLast ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.04)', border: `2px solid ${isLast ? 'rgba(103,232,249,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 4px', minHeight: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {isLast ? (
                        <div style={{ fontSize: feedback !== null ? 16 : 20, fontWeight: 900, color: feedback === true ? '#34D399' : feedback === false ? '#ef4444' : '#f59e0b' }}>
                          {feedback !== null ? q.answer : '❓'}
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: '🍄'.length > 0 ? 14 : 11, marginBottom: 2 }}>
                            {'🍄'.repeat(Math.min(count, 4))}{count > 4 ? '…' : ''}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{count}</div>
                        </>
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20, color: '#34D399', fontSize: 14, paddingBottom: 0 }}>→</div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9', fontFamily: 'monospace' }}>
              {q.base}<sup style={{ fontSize: 14 }}>{q.exp}</sup> = ?
            </div>
          </div>
        </Card>

        {/* Numpad */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ background: '#0a1628', borderRadius: 12, padding: '12px 20px', textAlign: 'right', marginBottom: 12, border: `2px solid ${feedback === null ? 'rgba(103,232,249,0.3)' : feedback ? '#34D399' : '#ef4444'}` }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: feedback === null ? '#fff' : feedback ? '#34D399' : '#ef4444', fontFamily: 'monospace', minHeight: 42 }}>
              {input || '?'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {numpadKeys.map((k, idx) => (
              k === '' ? <div key={`empty-${idx}`} /> :
              <button key={`key-${idx}`} onClick={() => pressKey(k)} disabled={feedback !== null}
                style={{ padding: '14px 8px', borderRadius: 12, border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(103,232,249,0.2)'}`, background: k === '⌫' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)', color: k === '⌫' ? '#ef4444' : '#fff', fontSize: 20, fontWeight: 700, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                {k}
              </button>
            ))}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={input !== '' ? '#0e7490' : '#334155'}>
            {input !== '' ? `✅ Tembak! ${q.base}^${q.exp} = ${input}` : 'Ketik jumlah jamur...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Tembakan tepat! ${q.base}^${q.exp} = ${q.answer} jamur.` : `❌ Meleset! ${q.base}^${q.exp} = ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Gelombang Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
