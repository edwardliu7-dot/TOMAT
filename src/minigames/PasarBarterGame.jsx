import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { poolForDifficulty, pickFrom, useSurvival } from '../difficulty'

const SCENARIOS = [
  { item: 'Ramuan Penyembuh 🧪', qty1: 2, price1: 10, qty2: 5, answer: 25, tier: 'easy' },
  { item: 'Buku Mantra 📗', qty1: 3, price1: 12, qty2: 7, answer: 28, tier: 'easy' },
  { item: 'Kristal Sihir 💎', qty1: 4, price1: 20, qty2: 9, answer: 45, tier: 'medium' },
  { item: 'Jamur Ajaib 🍄', qty1: 5, price1: 15, qty2: 8, answer: 24, tier: 'medium' },
  { item: 'Peta Harta 🗺️', qty1: 2, price1: 6, qty2: 11, answer: 33, tier: 'hard' },
  { item: 'Lilin Sihir 🕯️', qty1: 6, price1: 18, qty2: 10, answer: 30, tier: 'hard' },
  { item: 'Benih Ajaib 🌱', qty1: 3, price1: 9, qty2: 12, answer: 36, tier: 'hard' },
]

function genQ(difficulty = 'medium') {
  return pickFrom(poolForDifficulty(SCENARIOS, difficulty))
}

export default function KasirSihirGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ(effectiveDifficulty)); setInput(''); setFeedback(null) }, [effectiveDifficulty])

  const unitPrice = q.price1 / q.qty1
  const inputNum = input === '' ? null : parseInt(input, 10)

  // Visual proportion: how full the second bar should be
  const barWidth1 = 100
  const barWidth2 = inputNum !== null ? Math.min(100, (inputNum / (unitPrice * q.qty2 * 1.5)) * 100) : 0
  const correctBar = Math.min(100, (q.answer / (unitPrice * q.qty2 * 1.5)) * 100)

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 4) return
    setInput(p => p + k)
  }

  const confirm = () => {
    if (feedback !== null || inputNum === null) return
    const correct = inputNum === q.answer
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  const itemParts = q.item.split(' ')
  const icon = itemParts[itemParts.length - 1]
  const name = itemParts.slice(0, -1).join(' ')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏪 Kasir Toko Sihir" onBack={goBack} rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(234,179,8,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>TOKO RAMUAN PENYIHIR</div>
          <svg width="220" height="72" viewBox="0 0 220 72" style={{ display:'block', margin:'0 auto 8px', overflow:'visible' }}>
            {/* Shop awning */}
            <polygon points="10,28 210,28 198,8 22,8" fill="#1a1000" stroke="#EAB308" strokeWidth="1.5" />
            {[22,50,78,106,134,162,190].map((x,i)=>(
              <line key={i} x1={x} y1="8" x2={x} y2="28" stroke="rgba(234,179,8,0.3)" strokeWidth="1" />
            ))}
            {/* Shop front */}
            <rect x="10" y="28" width="200" height="40" rx="3" fill="#0d0a00" stroke="rgba(234,179,8,0.35)" strokeWidth="1.5" />
            {/* Window */}
            <rect x="20" y="34" width="80" height="28" rx="3" fill="#0a0800" stroke="rgba(234,179,8,0.25)" strokeWidth="1" />
            {/* Shelves */}
            <line x1="22" y1="52" x2="98" y2="52" stroke="rgba(234,179,8,0.2)" strokeWidth="1" />
            {/* Items on shelf */}
            <text x="35" y="51" fontSize="12">🧪</text>
            <text x="55" y="51" fontSize="12">📗</text>
            <text x="75" y="51" fontSize="12">💎</text>
            {/* Price tag */}
            <rect x="112" y="34" width="90" height="28" rx="3" fill="#0a0800" stroke="#EAB308" strokeWidth="1" />
            <text x="118" y="46" fill="#EAB308" fontSize="9" fontWeight="700">qty₁ → 🪙{q.price1}</text>
            <text x="118" y="58" fill="rgba(234,179,8,0.6)" fontSize="9">qty₂ → 🪙 ?</text>
            {/* Sign */}
            <text x="110" y="22" textAnchor="middle" fill="#EAB308" fontSize="9" fontWeight="700">✦ TOKO SIHIR ✦</text>
          </svg>

          {/* Price display */}
          <div style={{ background: '#1a1400', border: '2px dashed #EAB308', borderRadius: 14, padding: '12px', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 14, color: '#EAB308', fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
              {q.qty1} buah = 🪙 <strong style={{ color: '#EAB308' }}>{q.price1}</strong> koin
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>harga satuan: 🪙 {unitPrice} koin</div>
          </div>

          {/* Proportion bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                <span>{q.qty1} buah</span>
                <span>🪙 {q.price1} koin</span>
              </div>
              <div style={{ height: 20, background: 'rgba(234,179,8,0.08)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(234,179,8,0.2)' }}>
                <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg,#EAB308,#f59e0b)', borderRadius: 10 }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
                <span>{q.qty2} buah</span>
                <span style={{ color: inputNum !== null ? '#67E8F9' : '#475569' }}>🪙 {inputNum ?? '?'} koin</span>
              </div>
              <div style={{ height: 20, background: 'rgba(103,232,249,0.08)', borderRadius: 10, overflow: 'hidden', border: `1px solid ${feedback === null ? 'rgba(103,232,249,0.2)' : feedback ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
                <div style={{ height: '100%', width: `${feedback !== null ? correctBar : barWidth2}%`, background: feedback === true ? 'linear-gradient(90deg,#34D399,#059669)' : feedback === false ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#67E8F9,#0ea5e9)', borderRadius: 10, transition: 'width 0.2s' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Perbandingan Senilai:</div>
            <div style={{ fontSize: 15, color: '#67E8F9', fontFamily: 'monospace', fontWeight: 700 }}>
              {q.qty1}/{q.price1} = {q.qty2}/<span style={{ color: inputNum !== null ? '#f59e0b' : '#475569' }}>{inputNum ?? '?'}</span>
            </div>
          </div>
        </Card>

        {/* Numpad */}
        <Card border="rgba(234,179,8,0.2)">
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, textAlign: 'center' }}>
            {q.qty2} {name} = 🪙 <strong style={{ color: '#f59e0b', fontSize: 22, fontFamily: 'monospace' }}>{input || '?'}</strong> koin
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {numpadKeys.map((k, idx) => (
              k === '' ? <div key={`empty-${idx}`} /> :
              <button key={`key-${idx}`} onClick={() => pressKey(k)} disabled={feedback !== null}
                style={{ padding: '14px 8px', borderRadius: 12, border: `1px solid ${k === '⌫' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.2)'}`, background: k === '⌫' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)', color: k === '⌫' ? '#ef4444' : '#fff', fontSize: 20, fontWeight: 700, cursor: feedback !== null ? 'not-allowed' : 'pointer' }}>
                {k}
              </button>
            ))}
          </div>
        </Card>

        {feedback === null && (
          <Btn onClick={confirm} color={inputNum !== null ? '#0e7490' : '#334155'}>
            {inputNum !== null ? `✅ Bayar 🪙${input} koin` : 'Ketik harga...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Transaksi sukses! Harga = 🪙${q.answer}` : `❌ Harga salah! Seharusnya 🪙${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={() => { if (feedback === false) recordWrongAnswer(); newQ() }} color="#0e7490">Pelanggan Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
