import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Direct proportion: if qty1 costs price1 coins, qty2 costs ?
const SCENARIOS = [
  { item: 'Ramuan Penyembuh 🧪', qty1: 2, price1: 10, qty2: 5, answer: 25, wrong: [15, 20, 30] },
  { item: 'Buku Mantra 📗', qty1: 3, price1: 12, qty2: 7, answer: 28, wrong: [21, 35, 24] },
  { item: 'Kristal Sihir 💎', qty1: 4, price1: 20, qty2: 9, answer: 45, wrong: [36, 50, 40] },
  { item: 'Jamur Ajaib 🍄', qty1: 5, price1: 15, qty2: 8, answer: 24, wrong: [40, 30, 20] },
  { item: 'Peta Harta 🗺️', qty1: 2, price1: 6, qty2: 11, answer: 33, wrong: [22, 30, 36] },
  { item: 'Lilin Sihir 🕯️', qty1: 6, price1: 18, qty2: 10, answer: 30, wrong: [60, 24, 36] },
  { item: 'Benih Ajaib 🌱', qty1: 3, price1: 9, qty2: 12, answer: 36, wrong: [27, 45, 30] },
]

function genQ() {
  const base = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(String)
  return { ...base, opts }
}

export default function KasirSihirGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [feedback, setFeedback] = useState(null)
  const newQ = useCallback(() => { setQ(genQ()); setFeedback(null) }, [])
  const select = (opt) => {
    if (feedback !== null) return
    const correct = opt === String(q.answer)
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const unitPrice = q.price1 / q.qty1

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🏪 Kasir Toko Sihir" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>TOKO RAMUAN PENYIHIR</div>
          {/* Price tag */}
          <div style={{ background: '#EAB30820', border: '2px dashed #EAB308', borderRadius: 14, padding: '14px', textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{q.item.split(' ')[1]}</div>
            <div style={{ fontSize: 14, color: '#EAB308', fontWeight: 700 }}>{q.item.split(' ')[0]}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>
              {q.qty1} buah = 🪙 <strong style={{ color: '#EAB308' }}>{q.price1}</strong> koin
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              (harga satuan: 🪙 {unitPrice} koin)
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 6 }}>Pelanggan membeli:</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#67E8F9' }}>
              {q.qty2} {q.item.split(' ')[0]} = 🪙 ? koin
            </div>
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
            💡 Perbandingan Senilai: {q.qty1} buah / 🪙{q.price1} = {q.qty2} buah / 🪙?
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Berapa koin yang harus dibayar?</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Transaksi sukses! Harga = 🪙${q.answer}` : `❌ Harga salah! Seharusnya 🪙${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Pelanggan Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
