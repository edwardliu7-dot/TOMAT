import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

const OPTIONS_POOL = ['kuadrat dari', 'dua kali dari', 'setengah dari', 'satu lebihnya dari']
const RELATIONS = [
  { pairs: [[2, 4], [3, 9], [4, 16]], answer: 'kuadrat dari' },
  { pairs: [[1, 2], [2, 4], [3, 6]], answer: 'dua kali dari' },
  { pairs: [[4, 2], [6, 3], [8, 4]], answer: 'setengah dari' },
  { pairs: [[2, 3], [3, 4], [4, 5]], answer: 'satu lebihnya dari' },
]

function genQ() {
  const item = RELATIONS[Math.floor(Math.random() * RELATIONS.length)]
  return { ...item, options: shuffle(OPTIONS_POOL) }
}

export default function G8MakcomblangGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])

  const choose = (opt) => {
    if (feedback !== null) return
    const correct = opt === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #2b1400 0%, #1a0d00 100%)' }}>
      <PlayerHeader />
      <TopBar title="💘 Makcomblang Desa" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            HUBUNGKAN WARGA DENGAN KEAHLIAN
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {q.pairs.map(([a, b], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{a}</span>
                <span style={{ color: '#FDBA74' }}>→</span>
                <span style={{ background: 'rgba(253,186,116,0.12)', borderRadius: 8, padding: '6px 12px' }}>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>Apa relasi yang menghubungkan Himpunan A ke Himpunan B?</div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sekali!` : `❌ Kurang tepat. Relasi yang benar: "${q.answer}"`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
