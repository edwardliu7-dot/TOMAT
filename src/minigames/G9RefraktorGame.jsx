import React, { useState, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner, SliderInput, randomSliderRange, DifficultyBadge, SurvivalOverScreen } from '../components/shared'
import { usePlayer } from '../PlayerContext'
import { byDifficulty, randInt, useSurvival } from '../difficulty'

// Luas selimut prisma segitiga (lateral) = keliling alas × tinggi prisma
// Alas segitiga siku-siku dengan sisi a,b,c (triple pythagoras), keliling = a+b+c
const TRIPLES = [[3,4,5],[5,12,13],[6,8,10],[8,15,17]]

function genQ(difficulty='medium') {
  const [a,b,c] = TRIPLES[randInt(0,TRIPLES.length-1)]
  const lMax = byDifficulty(difficulty, { easy:5, medium:8, hard:12 })
  const L = randInt(2, lMax)  // panjang prisma
  const perimeter = a + b + c
  const answer = perimeter * L  // luas selimut lateral
  const { min, max } = randomSliderRange([perimeter, answer], { step:1, minPad:10, maxPad:50 })
  return { a, b, c, L, perimeter, answer, min, max }
}

export default function G9RefraktorGame({ goBack, difficulty='medium', survival=false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [q, setQ] = useState(() => genQ(effectiveDifficulty))
  const [val, setVal] = useState(q.min)
  const [feedback, setFeedback] = useState(null)

  const newQ = useCallback(() => {
    const nq = genQ(effectiveDifficulty); setQ(nq); setVal(nq.min); setFeedback(null)
  }, [effectiveDifficulty])
  React.useEffect(() => { setVal(q.min) }, [q])

  const confirm = () => {
    if (feedback !== null) return
    const correct = val === q.answer
    setFeedback(correct); survivalState.recordResult(correct)
    if (correct) { addCoins(50); addExp(100) } else { recordWrongAnswer() }
  }

  if (survival && survivalState.gameOver)
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); newQ() }} goBack={goBack} />

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0a0014 0%,#06000e 100%)' }}>
      <PlayerHeader />
      <TopBar title="💎 Refraktor Kristal Energi" onBack={goBack} accentColor="#E879F9" rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />} />
      <div style={{ padding:'0 16px 32px', display:'flex', flexDirection:'column', gap:16 }}>
        <Card border="rgba(232,121,249,0.3)">
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:10 }}>Hitung luas selimut (lateral) prisma segitiga kristal untuk memantulkan laser!</div>
            <svg width="220" height="150" viewBox="0 0 220 150" style={{ display:'block', margin:'8px auto 4px', overflow:'visible' }}>
              <circle cx="110" cy="75" r="60" fill="rgba(103,232,249,0.07)" stroke="#67E8F9" strokeWidth={2.5} />
              <ellipse cx="110" cy="75" rx="60" ry="17" fill="none" stroke="rgba(103,232,249,0.35)" strokeWidth={1.5} />
              <ellipse cx="110" cy="75" rx="17" ry="60" fill="none" stroke="rgba(103,232,249,0.2)" strokeWidth={1} />
              <circle cx="110" cy="75" r="4" fill="#67E8F9" />
              <line x1="110" y1="75" x2="153" y2="32" stroke="#67E8F9" strokeWidth={2} />
              <text x="135" y="47" fill="#67E8F9" fontSize={13} fontWeight={800}>r</text>
              <text x="110" y="146" textAnchor="middle" fill="rgba(103,232,249,0.5)" fontSize={9}>4πr²</text>
            </svg>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <div style={{ background:'rgba(232,121,249,0.08)', border:'1px solid rgba(232,121,249,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Sisi alas</div>
                <div style={{ fontSize:15, fontWeight:800, color:'#E879F9' }}>{q.a}, {q.b}, {q.c} cm</div>
              </div>
              <div style={{ background:'rgba(232,121,249,0.08)', border:'1px solid rgba(232,121,249,0.2)', borderRadius:10, padding:'8px 14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#94A3B8' }}>Panjang</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#E879F9' }}>{q.L} cm</div>
              </div>
            </div>
            <div style={{ fontSize:13, color:'#6B7280' }}>Keliling alas = {q.a}+{q.b}+{q.c} = {q.perimeter} cm</div>
            <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:6 }}>Luas Selimut = Keliling × Panjang = ?</div>
          </div>
        </Card>
        {feedback === null && (
          <Card>
            <SliderInput value={val} min={q.min} max={q.max} step={1} onChange={setVal} label={`Luas: ${val} cm²`} accentColor="#E879F9" />
            <Btn onClick={confirm} color="#E879F9">Konfirmasi</Btn>
          </Card>
        )}
        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.answer} onNext={newQ} />}
      </div>
    </div>
  )
}
