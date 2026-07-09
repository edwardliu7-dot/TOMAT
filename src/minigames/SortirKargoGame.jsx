import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

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

function genQ() {
  const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 27, 29, 31]
  const selected = shuffle(pool).slice(0, 9)
  return { rocks: selected }
}

export default function ScannerPermatGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [q, setQ] = useState(genQ)
  const [tapped, setTapped] = useState(new Set())
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => { setQ(genQ()); setTapped(new Set()); setFeedback(null) }, [])

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
    if (isCorrect) { addCoins(50); addExp(100) }
  }

  const primesInSet = q.rocks.filter(isPrime)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="💎 Scanner Batu Permata" onBack={goBack} />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>KONVEYOR BATU TAMBANG</div>
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
            <Btn onClick={newQ} color="#0e7490">Konveyor Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
