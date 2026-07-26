import React, { useState } from 'react';

export function DuelGameOver() {
  const [view, setView] = useState<'win' | 'lose'>('win');

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseSubtle {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes shakeSubtle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}} />

      {/* View Toggle */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', gap: 8 }}>
        <button 
          onClick={() => setView('win')}
          style={{
            padding: '6px 12px',
            background: view === 'win' ? '#0e7490' : '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Win
        </button>
        <button 
          onClick={() => setView('lose')}
          style={{
            padding: '6px 12px',
            background: view === 'lose' ? '#f87171' : '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Lose
        </button>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '390px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
        gap: '20px'
      }}>
        {view === 'win' ? <DuelGameOverWin /> : <DuelGameOverLose />}
      </div>
    </div>
  );
}

function DuelGameOverWin() {
  return (
    <>
      <div style={{
        fontSize: '80px',
        animation: 'pulseSubtle 2s infinite ease-in-out',
        marginBottom: '4px',
        lineHeight: 1
      }}>
        🏆
      </div>
      
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#fbbf24' }}>
          Kamu Menang!
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
          Selamat! Kamu mendapat 🪙 +15 koin
        </p>
      </div>

      <div style={{
        background: '#1A1D27',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        gap: '32px',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '12px',
        marginBottom: '12px'
      }}>
        {/* Left: Kamu */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#67E8F9', letterSpacing: '0.5px' }}>KAMU</div>
          <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>Budi</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#67E8F9', lineHeight: '1.2' }}>5</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>soal benar</div>
        </div>

        {/* Center: VS */}
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b', marginTop: '-16px' }}>
          VS
        </div>

        {/* Right: Lawan */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>LAWAN</div>
          <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>Ahmad</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#f87171', lineHeight: '1.2' }}>3</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>soal benar</div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
        Kamu menyelesaikan dalam 2m 14s &nbsp;•&nbsp; Lawan: 2m 31s
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <button style={{
          width: '100%',
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          color: '#ffffff',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          ← Keluar
        </button>
      </div>
    </>
  );
}

// Preview: State Kalah
function DuelGameOverLose() {
  return (
    <>
      <div style={{
        fontSize: '80px',
        animation: 'shakeSubtle 4s infinite ease-in-out',
        marginBottom: '4px',
        lineHeight: 1
      }}>
        😤
      </div>
      
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#f87171' }}>
          Kamu Kalah!
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
          Jangan menyerah, coba lagi di duel berikutnya!
        </p>
      </div>

      <div style={{
        background: '#1A1D27',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        gap: '32px',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '12px',
        marginBottom: '12px'
      }}>
        {/* Left: Kamu */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>KAMU</div>
          <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>Budi</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#f87171', lineHeight: '1.2' }}>2</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>soal benar</div>
        </div>

        {/* Center: VS */}
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b', marginTop: '-16px' }}>
          VS
        </div>

        {/* Right: Lawan */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.5px' }}>LAWAN</div>
          <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>Ahmad</div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#10b981', lineHeight: '1.2' }}>5</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>soal benar</div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
        Kamu menyelesaikan dalam 2m 45s &nbsp;•&nbsp; Lawan: 1m 58s
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <button style={{
          width: '100%',
          background: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          color: '#ffffff',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          ← Keluar
        </button>
      </div>
    </>
  );
}
