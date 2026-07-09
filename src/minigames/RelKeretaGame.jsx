import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, OptionGrid, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Ratio table: find the missing value
const TABLES = [
  { label1: 'Waktu (jam)', label2: 'Jarak (km)', rows: [[1, 80], [2, 160], [3, '?'], [4, 320]], answer: 240, wrong: [200, 220, 260], context: 'Kereta melaju 80 km/jam' },
  { label1: 'Tiket', label2: 'Harga (koin)', rows: [[1, 5], [2, 10], [3, '?'], [5, 25]], answer: 15, wrong: [12, 18, 20], context: 'Harga 1 tiket = 5 koin' },
  { label1: 'Wagon', label2: 'Penumpang', rows: [[1, 50], [2, 100], [4, '?'], [6, 300]], answer: 200, wrong: [150, 180, 250], context: 'Setiap wagon isi 50 penumpang' },
  { label1: 'Bahan Bakar (L)', label2: 'Jarak (km)', rows: [[2, 60], [4, 120], [6, '?'], [8, 240]], answer: 180, wrong: [150, 200, 160], context: '1 liter = 30 km' },
  { label1: 'Rel (m)', label2: 'Waktu (menit)', rows: [[100, 2], [200, 4], [300, '?'], [500, 10]], answer: 6, wrong: [5, 8, 9], context: '100 m rel dipasang per 2 menit' },
]

function genQ() {
  const base = TABLES[Math.floor(Math.random() * TABLES.length)]
  const opts = shuffle([...base.wrong, base.answer]).map(String)
  // Find which row has '?'
  const qRow = base.rows.findIndex(r => r[1] === '?')
  return { ...base, opts, qRow }
}

export default function RelKeretaGame({ goBack }) {
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚄 Menyusun Rel Kereta Cepat" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>TABEL DATA REL KERETA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>{q.context}</div>
          {/* Ratio table */}
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(103,232,249,0.2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(103,232,249,0.15)' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9', borderRight: '1px solid rgba(103,232,249,0.15)' }}>{q.label1}</div>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9' }}>{q.label2}</div>
            </div>
            {q.rows.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(103,232,249,0.1)', background: i === q.qRow ? 'rgba(103,232,249,0.08)' : 'transparent' }}>
                <div style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: '#fff', borderRight: '1px solid rgba(103,232,249,0.1)' }}>{row[0]}</div>
                <div style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: row[1] === '?' ? '#f59e0b' : '#fff' }}>
                  {row[1] === '?' ? '❓' : row[1]}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
            Gunakan pola perbandingan untuk menemukan nilai ❓
          </div>
        </Card>
        <div style={{ fontSize: 13, color: '#67E8F9', fontWeight: 600 }}>Pilih nilai yang tepat untuk melengkapi tabel:</div>
        <OptionGrid options={q.opts} onSelect={select} correct={feedback !== null ? String(q.answer) : null} disabled={feedback !== null} />
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Rel tersambung! Nilai yang tepat: ${q.answer}` : `❌ Rel bengkok! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
