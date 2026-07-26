import React, { useState, useEffect } from 'react'
import { usePlayer } from '../PlayerContext'
import { useTask } from '../TaskContext'

function useIsMd() {
  const [md, setMd] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setMd(mq.matches)
    const h = e => setMd(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return md
}

// GameDesktopWrapper — centers minigame content in a 480px column on desktop.
// Mobile (< 768px): no effect, children rendered directly.
// Desktop (≥ 768px): children in a centered max-480px column with a subtle
//   dot-grid backdrop and a top-bar showing [← Keluar] + gameEmoji + gameTitle.
//
// Props: { children, gameTitle, gameEmoji, onExit }
export default function GameDesktopWrapper({ children, gameTitle, gameEmoji, onExit }) {
  const isMd = useIsMd()
  const { player } = usePlayer()
  const { activeSession } = useTask() || {}

  const totalQuestions = activeSession?.totalQuestions || 0
  const answeredQuestions = activeSession
    ? (activeSession.correctAnswers || 0) + (activeSession.wrongAnswers || 0)
    : 0
  const progress = totalQuestions > 0
    ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100))
    : 0

  const gameStyles = `
    .tomat-game-stage {
      --game-bg: #071321;
      --game-panel: #0E1E35;
      --game-muted: #58718A;
      min-height: 100vh;
      color: #fff;
      background:
        radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 34%),
        radial-gradient(circle at 100% 45%, rgba(6,182,212,.07), transparent 32%),
        var(--game-bg);
    }
    .tomat-game-content {
      min-height: 100vh;
      position: relative;
    }
    .tomat-game-stage .tomat-player-header {
      background: rgba(7,19,33,.74) !important;
      border-bottom-color: rgba(99,102,241,.10) !important;
    }
    .tomat-game-stage .tomat-topbar {
      background: rgba(7,19,33,.78) !important;
      border-bottom-color: rgba(99,102,241,.12) !important;
    }
    .tomat-game-stage .tomat-topbar > button {
      background: #0E1E35 !important;
      border: 1px solid rgba(99,102,241,.20) !important;
      color: #C4B5FD !important;
    }
    .tomat-game-stage .tomat-topbar h2 {
      letter-spacing: -.01em;
    }
    .tomat-game-stage .tomat-game-mobile-footer {
      display: none;
    }
    @media (max-width: 767px) {
      .tomat-game-stage {
        overflow-x: hidden;
        padding-bottom: 60px;
      }
      .tomat-game-mobile {
        min-height: 100vh;
      }
      .tomat-game-content {
        min-height: auto;
      }
      .tomat-game-content > div:first-child {
        background: transparent !important;
      }
      .tomat-game-stage .tomat-player-header {
        padding: 10px 14px 8px !important;
        min-height: 58px;
      }
      .tomat-game-stage .tomat-player-header > button:first-child {
        width: 40px !important;
        height: 40px !important;
        border-radius: 12px !important;
        font-size: 17px !important;
      }
      .tomat-game-stage .tomat-player-header > div:nth-child(2) > div:first-child {
        font-size: 9px !important;
      }
      .tomat-game-stage .tomat-player-header > div:nth-child(2) > div:nth-child(2) {
        font-size: 13px !important;
      }
      .tomat-game-stage .tomat-player-header > div:nth-child(2) > div:last-child {
        margin-top: 4px !important;
      }
      .tomat-game-stage .tomat-topbar {
        padding: 10px 14px !important;
        min-height: 54px !important;
      }
      .tomat-game-stage .tomat-topbar > button {
        width: 34px !important;
        height: 34px !important;
        border-radius: 10px !important;
        font-size: 17px !important;
      }
      .tomat-game-stage .tomat-topbar h2 {
        font-size: 14px !important;
      }
      .tomat-game-stage .tomat-game-content [style*="padding: 0px 16px"] {
        padding-bottom: 20px !important;
      }
      .tomat-game-mobile-footer {
        position: fixed;
        z-index: 30;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 52px;
        padding: 8px 16px;
        box-sizing: border-box;
        background: rgba(7,19,33,.94);
        border-top: 1px solid rgba(99,102,241,.16);
        backdrop-filter: blur(16px);
      }
      .tomat-game-mobile-footer__reward {
        color: #A5B4FC;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }
      .tomat-game-mobile-footer__progress {
        flex: 1;
        min-width: 0;
        height: 6px;
        border-radius: 99px;
        overflow: hidden;
        background: rgba(255,255,255,.09);
      }
      .tomat-game-mobile-footer__progress i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #6366F1, #A78BFA);
      }
      .tomat-game-mobile-footer__coins {
        color: #FDE68A;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }
    }
  `

  return (
    <div className="tomat-game-stage" style={{
      minHeight: '100vh',
      width: '100%',
       background: '#071321',
      display: 'flex',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{gameStyles}</style>
      {!isMd ? (
        <>
          <main className="tomat-game-mobile" style={{ width: '100%', minWidth: 0 }}>
            <div className="tomat-game-content">{children}</div>
          </main>
          <div className="tomat-game-mobile-footer" aria-label="Ringkasan progres game">
            <span className="tomat-game-mobile-footer__reward">+100 EXP</span>
            <div className="tomat-game-mobile-footer__progress" aria-label="Progres soal">
              <i style={{ width: `${totalQuestions > 0 ? progress : 0}%` }} />
            </div>
            <span className="tomat-game-mobile-footer__coins">🪙 {player?.coins ?? 0}</span>
          </div>
        </>
      ) : (
        <>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -180, top: -220, width: 620, height: 620, borderRadius: '50%', background: 'rgba(79,70,229,0.12)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', right: -180, top: '30%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(6,182,212,0.07)', filter: 'blur(130px)' }} />
      </div>

      {/* Desktop mission rail — the game itself remains the source of truth for questions and scoring. */}
      <aside style={{
        position: 'relative', zIndex: 2, width: 264, flexShrink: 0, minHeight: '100vh',
        padding: 24, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
        background: 'rgba(10,22,40,0.84)', borderRight: '1px solid rgba(99,102,241,0.12)',
        backdropFilter: 'blur(18px)',
      }}>
        <button onClick={onExit} style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
          background: '#0E1E35', border: '1px solid rgba(99,102,241,0.2)', color: '#C4B5FD',
          borderRadius: 11, padding: '9px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 800,
          fontFamily: 'inherit',
        }}>← Keluar Game</button>

        <div style={{ marginTop: 28 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(34,211,238,0.12)', color: '#67E8F9',
            borderRadius: 6, padding: '5px 8px', fontSize: 9, fontWeight: 900,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>{activeSession ? 'MODE TUGAS' : 'LATIHAN BEBAS'}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{gameEmoji}</span>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 19, lineHeight: 1.2, fontWeight: 900 }}>{gameTitle}</h1>
          </div>
          <p style={{ margin: '8px 0 0', color: '#58718A', fontSize: 11, lineHeight: 1.5 }}>
             {activeSession?.task
               ? `${activeSession.task.kelas || 'Kelas'} · ${activeSession.task.type || 'Tugas'}`
              : 'Tantangan matematika TOMAT'}
          </p>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#58718A', fontSize: 11, fontWeight: 800, marginBottom: 10 }}>
            <span>PROGRES MISI</span>
            <span style={{ color: '#A5B4FC' }}>{totalQuestions > 0 ? `${answeredQuestions} / ${totalQuestions}` : 'Latihan'}</span>
          </div>
          {totalQuestions > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Array.from({ length: totalQuestions }, (_, index) => {
                const done = index < answeredQuestions
                const current = index === answeredQuestions
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 99, background: done ? '#818CF8' : current ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.08)' }} />
                    <span style={{ width: 16, color: done ? '#A5B4FC' : current ? '#fff' : '#58718A', fontSize: 10, fontWeight: 900, textAlign: 'right' }}>
                      {done ? '✓' : current ? '●' : '○'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 99, background: '#818CF8' }} />
            </div>
          )}
        </div>

        <div style={{
          marginTop: 'auto', borderRadius: 16, border: '1px solid rgba(250,204,21,0.18)',
          background: 'rgba(250,204,21,0.06)', padding: 15,
        }}>
          <div style={{ color: '#FDE68A', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hadiah & progres</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <div>
               <div style={{ color: '#A5B4FC', fontSize: 18, fontWeight: 900 }}>+100</div>
               <div style={{ color: '#58718A', fontSize: 9 }}>EXP / benar</div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.1)' }} />
            <div>
               <div style={{ color: '#FDE047', fontSize: 18, fontWeight: 900 }}>+15 🪙</div>
               <div style={{ color: '#58718A', fontSize: 9 }}>hadiah / benar</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main game area */}
      <main style={{
        position: 'relative', zIndex: 1, flex: 1, minWidth: 0, minHeight: '100vh',
        display: 'flex', justifyContent: 'center', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 620, minHeight: '100vh', position: 'relative' }}>
           <div className="tomat-game-content">{children}</div>
        </div>
      </main>
        </>
      )}
    </div>
  )
}
