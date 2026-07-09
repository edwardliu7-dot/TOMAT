import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const TABLES = [
  { label1: 'Waktu (jam)', label2: 'Jarak (km)', rows: [[1, 80], [2, 160], [3, '?'], [4, 320]], answer: 240, context: 'Kereta melaju 80 km/jam', unit: 'km' },
  { label1: 'Tiket', label2: 'Harga (koin)', rows: [[1, 5], [2, 10], [3, '?'], [5, 25]], answer: 15, context: 'Harga 1 tiket = 5 koin', unit: 'koin' },
  { label1: 'Wagon', label2: 'Penumpang', rows: [[1, 50], [2, 100], [4, '?'], [6, 300]], answer: 200, context: 'Setiap wagon isi 50 penumpang', unit: 'penumpang' },
  { label1: 'Bahan Bakar (L)', label2: 'Jarak (km)', rows: [[2, 60], [4, 120], [6, '?'], [8, 240]], answer: 180, context: '1 liter = 30 km', unit: 'km' },
  { label1: 'Rel (m)', label2: 'Waktu (menit)', rows: [[100, 2], [200, 4], [300, '?'], [500, 10]], answer: 6, context: '100 m rel dipasang per 2 menit', unit: 'menit' },
]

function genQ() {
  const base = TABLES[Math.floor(Math.random() * TABLES.length)]
  const qRow = base.rows.findIndex(r => r[1] === '?')
  return { ...base, qRow }
}

export default function RelKeretaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setInput(''); setFeedback(null) }, [])

  const pressKey = (k) => {
    if (feedback !== null) return
    if (k === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (input.length >= 5) return
    setInput(p => p + k)
  }

  const inputNum = input === '' ? null : parseInt(input, 10)

  const confirm = () => {
    if (feedback !== null || inputNum === null) return
    const correct = inputNum === q.answer
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '', '0', '⌫']

  // Pattern visualization: ratio per row1 column1
  const knownRow = q.rows.find(r => r[1] !== '?')
  const ratio = knownRow ? knownRow[1] / knownRow[0] : 1

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚄 Menyusun Rel Kereta Cepat" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>TABEL DATA REL KERETA</div>
          <div style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 14 }}>{q.context}</div>

          {/* Table */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(103,232,249,0.2)', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(103,232,249,0.15)' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9', borderRight: '1px solid rgba(103,232,249,0.15)' }}>{q.label1}</div>
              <div style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#67E8F9' }}>{q.label2}</div>
            </div>
            {q.rows.map((row, i) => {
              const isQ = i === q.qRow
              const displayVal = isQ ? (
                <span style={{ color: feedback === null ? '#f59e0b' : feedback ? '#34D399' : '#ef4444', fontWeight: 900 }}>
                  {feedback !== null ? q.answer : inputNum !== null ? inputNum : '❓'}
                </span>
              ) : row[1]
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid rgba(103,232,249,0.1)', background: isQ ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                  <div style={{ padding: '12px 14px', fontSize: 15, fontWeight: 700, color: '#fff', borderRight: '1px solid rgba(103,232,249,0.1)' }}>{row[0]}</div>
                  <div style={{ padding: '12px 14px', fontSize: 15, fontWeight: 700, color: isQ ? '#f59e0b' : '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {displayVal}
                    {isQ && inputNum === null && <span style={{ fontSize: 11, color: '#94A3B8' }}>← ketik!</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pattern hint */}
          <div style={{ padding: '10px', background: 'rgba(103,232,249,0.06)', borderRadius: 8, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
            Pola: setiap 1 {q.label1.split('(')[0].trim()}, ada <strong style={{ color: '#67E8F9' }}>{ratio} {q.label2.split('(')[0].trim()}</strong>
          </div>
        </Card>

        {/* Numpad */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 8 }}>
            Ketik nilai ❓ = <strong style={{ fontSize: 24, color: '#f59e0b', fontFamily: 'monospace' }}>{input || '?'}</strong>
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
          <Btn onClick={confirm} color={inputNum !== null ? '#0e7490' : '#334155'}>
            {inputNum !== null ? `✅ Pasang rel: nilai = ${input}` : 'Ketik nilai yang hilang...'}
          </Btn>
        )}
        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? `✅ Rel tersambung! Nilai: ${q.answer}` : `❌ Rel bengkok! Jawaban benar: ${q.answer}`}
              isCorrect={feedback} extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newQ} color="#0e7490">Rute Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
