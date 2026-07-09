import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, OptionGrid } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const FUNCTION_SETS = [
  [['Ana', 'Api'], ['Budi', 'Air'], ['Citra', 'Tanah']],
  [['Dewi', 'Angin'], ['Eko', 'Api'], ['Fira', 'Angin']],
  [['Gita', 'Es'], ['Hadi', 'Batu'], ['Indra', 'Kayu']],
]
const NON_FUNCTION_SETS = [
  [['Ana', 'Api'], ['Ana', 'Air'], ['Budi', 'Tanah']],
  [['Dewi', 'Angin'], ['Dewi', 'Api'], ['Eko', 'Es']],
  [['Gita', 'Es'], ['Gita', 'Kayu'], ['Hadi', 'Batu']],
]

function genQ() {
  const isFunction = Math.random() < 0.5
  const pool = isFunction ? FUNCTION_SETS : NON_FUNCTION_SETS
  const pairs = pool[Math.floor(Math.random() * pool.length)]
  return { pairs, answer: isFunction ? 'Fungsi' : 'Bukan Fungsi', options: ['Fungsi', 'Bukan Fungsi'] }
}

export default function G8GerbangSihirGame({ goBack }) {
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
      <TopBar title="🚪 Gerbang Seleksi Sihir" onBack={goBack} accentColor="#FDBA74" />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(253,186,116,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#FDBA74', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            DAFTAR PENDAFTARAN MURID
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
            Setiap calon murid (Domain) hanya boleh memilih tepat satu elemen sihir (Kodomain).
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
          <div style={{ textAlign: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>Sah atau curang pendaftaran ini?</div>
        </Card>

        <OptionGrid options={q.options} onSelect={choose} correct={feedback !== null ? q.answer : null} disabled={feedback !== null} cols={2} />

        {feedback !== null && (
          <>
            <FeedbackBanner message={feedback ? `✅ Tepat sekali!` : `❌ Kurang tepat. Jawaban yang benar: ${q.answer}`} isCorrect={feedback} extras="+50 Koin | +100 EXP" />
            <Btn onClick={newQ} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
