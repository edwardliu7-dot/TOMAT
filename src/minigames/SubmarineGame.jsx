import React, { useState, useEffect, useCallback } from 'react'
import { TopBar, PlayerHeader, Card, Btn, FeedbackBanner } from '../components/shared'
import { usePlayer } from '../PlayerContext'

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genMission() {
  let currentDepth = rand(-80, -10)
  const isDiving = Math.random() < 0.5
  let actionValue = rand(5, 30)
  let targetDepth = isDiving ? currentDepth - actionValue : currentDepth + actionValue
  if (targetDepth > 0) targetDepth = 0
  if (targetDepth < -100) { targetDepth = -100 }
  return { currentDepth, isDiving, actionValue, targetDepth }
}

export default function SubmarineGame({ goBack }) {
  const { addCoins, addExp } = usePlayer()
  const [mission, setMission] = useState(genMission)
  const [playerDepth, setPlayerDepth] = useState(0)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => { setPlayerDepth(mission.currentDepth) }, [mission])

  const newMission = useCallback(() => {
    setMission(genMission())
    setFeedback(null)
  }, [])

  const submit = () => {
    const correct = playerDepth === mission.targetDepth
    setFeedback(correct)
    if (correct) { addCoins(50); addExp(100) }
  }

  const depthPct = ((playerDepth + 100) / 100) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🐟 Misi: Palung Mariana" onBack={goBack} />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Radar Panel */}
        <Card border="rgba(103,232,249,0.3)">
          <div style={{ textAlign: 'center', fontSize: 12, color: '#67E8F9', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>RADAR SONAR</div>
          <div style={{ fontSize: 15, color: '#fff', textAlign: 'center', marginBottom: 4 }}>
            Posisi Awal: <strong>{mission.currentDepth} meter</strong>
          </div>
          <div style={{ fontSize: 15, color: '#fff', textAlign: 'center' }}>
            Perintah: {mission.isDiving ? '⬇️ Menyelam' : '⬆️ Naik'} sejauh <strong>{mission.actionValue} meter</strong>
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(103,232,249,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Pertanyaan:</div>
            <div style={{ fontSize: 17, color: '#67E8F9', fontWeight: 800 }}>
              {mission.currentDepth} {mission.isDiving ? '−' : '+'} {mission.actionValue} = ?
            </div>
          </div>
        </Card>

        {/* Depth Visualizer */}
        <Card border="rgba(103,232,249,0.2)">
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12, textAlign: 'center' }}>Atur kedalaman target kapal selam:</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* Visual depth bar */}
            <div style={{ width: 40, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: 8, position: 'relative', flexShrink: 0, border: '1px solid rgba(103,232,249,0.2)' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'linear-gradient(180deg,#06b6d4,#0284c7)', borderRadius: 8, transition: 'height 0.2s', height: `${depthPct}%` }} />
              <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 10, color: '#67E8F9' }}>0m</div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 10, color: '#67E8F9' }}>-100m</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: '#67E8F9', marginBottom: 12 }}>
                {playerDepth} m
              </div>
              <input type="range" min={-100} max={0} value={playerDepth}
                onChange={e => { if (feedback === null) setPlayerDepth(Number(e.target.value)) }}
                disabled={feedback !== null}
                style={{ accentColor: '#67E8F9' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                <span>-100m</span><span>0m</span>
              </div>
            </div>
          </div>
        </Card>

        {feedback !== null ? (
          <>
            <FeedbackBanner
              message={feedback ? '✅ Berhasil! Kapal Selam aman.' : `❌ Gagal! Target yang benar adalah ${mission.targetDepth} meter.`}
              isCorrect={feedback}
              extras="+50 Koin | +100 EXP"
            />
            <Btn onClick={newMission} color="#0e7490">Misi Berikutnya ▶</Btn>
          </>
        ) : (
          <Btn onClick={submit} color="#0e7490">⚙️ Eksekusi Mesin!</Btn>
        )}
      </div>
    </div>
  )
}
