import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

const BOTTLES = [
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.50 },
  { label: '3/4', value: 0.75 },
  { label: '0.1', value: 0.10 },
  { label: '0.25', value: 0.25 },
  { label: '10%', value: 0.10 },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.50 },
]

const RECIPES = [
  { value: 0.5, label: '0.5 (atau 50% / 1/2)' },
  { value: 0.75, label: '0.75 (atau 75% / 3/4)' },
  { value: 0.6, label: '0.6 (atau 60% / 3/5)' },
  { value: 0.35, label: '0.35 (atau 35%)' },
  { value: 0.85, label: '0.85 (atau 85%)' },
]

function randRecipe() { return RECIPES[Math.floor(Math.random() * RECIPES.size)] || RECIPES[Math.floor(Math.random() * RECIPES.length)] }

export default function LabKimiaGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [recipe, setRecipe] = useState(() => RECIPES[Math.floor(Math.random() * RECIPES.length)])
  const [currentSum, setCurrentSum] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [history, setHistory] = useState([])

  const newRecipe = useCallback(() => {
    setRecipe(RECIPES[Math.floor(Math.random() * RECIPES.length)])
    setCurrentSum(0)
    setFeedback(null)
    setHistory([])
  }, [])

  const addBottle = (bottle) => {
    if (feedback !== null) return
    const newSum = Math.round((currentSum + bottle.value) * 100) / 100
    setCurrentSum(newSum)
    setHistory(h => [...h, bottle.label])
    if (Math.abs(newSum - recipe.value) < 0.001) {
      setFeedback(true)
      addCoins(50); addExp(100)
    } else if (newSum > recipe.value + 0.001) {
      setFeedback(false)
    }
  }

  const reset = () => { setCurrentSum(0); setFeedback(null); setHistory([]) }

  const fillPct = Math.min((currentSum / recipe.value) * 100, 100)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚗️ Lab Kimia Penemu" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RESEP KIMIA RAHASIA</div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#94A3B8', marginBottom: 4 }}>Campurkan cairan hingga mencapai:</div>
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{recipe.label}</div>
        </Card>

        {/* Cauldron */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>Campuran saat ini:</div>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '0 0 60px 60px', border: '2px solid rgba(103,232,249,0.3)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'linear-gradient(180deg,#06b6d4,#0284c7)', height: `${fillPct}%`, transition: 'height 0.3s' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{Math.round(currentSum * 100)}%</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 15, color: '#67E8F9', fontWeight: 700 }}>
            {currentSum.toFixed(2)} / {recipe.value.toFixed(2)}
          </div>
          {history.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
              Ditambah: {history.join(' + ')}
            </div>
          )}
        </Card>

        <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>Pilih botol untuk ditambahkan:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {BOTTLES.map((b, i) => (
            <button key={i} onClick={() => addBottle(b)} disabled={feedback !== null} style={{
              background: '#1E2128', border: '1px solid rgba(103,232,249,0.2)', borderRadius: 12,
              padding: '12px 4px', cursor: feedback !== null ? 'default' : 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!feedback) e.currentTarget.style.borderColor = '#67E8F9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(103,232,249,0.2)' }}
            >
              <div style={{ width: 28, height: 36, background: 'rgba(99,102,241,0.3)', borderRadius: 4, border: '1px solid rgba(103,232,249,0.3)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#67E8F9' }}>{b.label}</span>
            </button>
          ))}
        </div>

        {feedback === null && currentSum > 0 && (
          <button onClick={reset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 10, padding: '10px', fontFamily: 'inherit', cursor: 'pointer', fontSize: 13 }}>
            🔄 Reset Campuran
          </button>
        )}

        {feedback !== null && (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Reaksi Berhasil! Formula sempurna!' : '❌ Kelebihan! Campuran meluap!'}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newRecipe} color="#0e7490">Resep Berikutnya ▶</Btn>
          </>
        )}
      </div>
    </div>
  )
}
