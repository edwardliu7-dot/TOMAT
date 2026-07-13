import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DragMatch, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const FUNCTION_SETS = [
  { tier: 'easy', pairs: [['Ana', 'Api'], ['Budi', 'Air']] },
  { tier: 'easy', pairs: [['Dewi', 'Angin'], ['Eko', 'Es']] },
  { tier: 'medium', pairs: [['Ana', 'Api'], ['Budi', 'Air'], ['Citra', 'Tanah']] },
  { tier: 'medium', pairs: [['Gita', 'Es'], ['Hadi', 'Batu'], ['Indra', 'Kayu']] },
  { tier: 'hard', pairs: [['Ana', 'Api'], ['Budi', 'Air'], ['Citra', 'Tanah'], ['Dewi', 'Angin']] },
  { tier: 'hard', pairs: [['Gita', 'Es'], ['Hadi', 'Batu'], ['Indra', 'Kayu'], ['Joko', 'Angin'], ['Kiki', 'Api']] },
]
const NON_FUNCTION_SETS = [
  { tier: 'easy', pairs: [['Ana', 'Api'], ['Ana', 'Air']] },
  { tier: 'easy', pairs: [['Dewi', 'Angin'], ['Dewi', 'Api']] },
  { tier: 'medium', pairs: [['Ana', 'Api'], ['Ana', 'Air'], ['Budi', 'Tanah']] },
  { tier: 'medium', pairs: [['Dewi', 'Angin'], ['Dewi', 'Api'], ['Eko', 'Es']] },
  { tier: 'hard', pairs: [['Ana', 'Api'], ['Budi', 'Air'], ['Citra', 'Tanah'], ['Citra', 'Angin']] },
  { tier: 'hard', pairs: [['Gita', 'Es'], ['Hadi', 'Batu'], ['Indra', 'Kayu'], ['Joko', 'Angin'], ['Joko', 'Api']] },
]

function genQ(difficulty = 'medium') {
  const isFunction = Math.random() < 0.5
  const pool = isFunction ? FUNCTION_SETS : NON_FUNCTION_SETS
  const picked = pickFrom(poolForDifficulty(pool, difficulty))
  const items = [
    { id: 'f', label: 'Fungsi' },
    { id: 'nf', label: 'Bukan Fungsi' }
  ]
  const slot = { id: 'type', answerId: isFunction ? 'f' : 'nf' }
  return { pairs: picked.pairs, items, slot }
}

export default function G8GerbangSihirGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [placed, setPlaced] = useState({})
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setPlaced({}); setFeedback(null) }, [effectiveDifficulty])

  const confirm = () => {
    if (placed.type === undefined) return
    const correct = placed.type === q.slot.answerId
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚪 Gerbang Seleksi Sihir" onBack={goBack} accentColor="#FDBA74" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 12 }}>
            Apakah pendaftaran ini termasuk Fungsi?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.pairs.map(([a, b], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{a}</span>
                <span style={{ color: '#FDBA74' }}>→</span>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{b}</span>
              </div>
            ))}
          </div>
        </Card>

        {feedback === null && (
          <Card>
            <DragMatch
              items={q.items}
              slots={[q.slot]}
              placed={placed}
              onPlace={(slotId, itemId) => setPlaced({ [slotId]: itemId })}
              accentColor="#FDBA74"
              renderSlot={() => <span style={{ color: '#94A3B8', fontSize: 14 }}>Tarik Jenis Disini</span>}
            />
            <div style={{ marginTop: 20 }}>
              <Btn onClick={confirm} disabled={placed.type === undefined} color="#c2410c">Verifikasi!</Btn>
            </div>
          </Card>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sekali!` : `❌ Kurang tepat.`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
