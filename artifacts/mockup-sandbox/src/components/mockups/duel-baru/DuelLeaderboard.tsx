import React from 'react';

export function DuelLeaderboard() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-6px); }
          }
          .dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            background-color: #f59e0b;
            border-radius: 50%;
            margin: 0 3px;
            animation: bounce 1.4s infinite ease-in-out both;
          }
          .dot:nth-child(1) { animation-delay: -0.32s; }
          .dot:nth-child(2) { animation-delay: -0.16s; }
        `}
      </style>
      
      <div style={{
        width: '100%',
        maxWidth: '390px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '64px', lineHeight: 1, margin: 0 }}>🏁</div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#67E8F9', margin: 0, textAlign: 'center', letterSpacing: '-0.5px' }}>
            Kamu Sudah Selesai!
          </h1>
        </div>

        {/* Score Card */}
        <div style={{
          backgroundColor: '#1A1D27',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px 20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '28px', width: '100%' }}>
            {/* Kiri: Kamu */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ color: '#67E8F9', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>KAMU</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>Budi</div>
              <div style={{ color: '#67E8F9', fontSize: '40px', fontWeight: 900, marginTop: '6px', lineHeight: 1 }}>5</div>
              <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '6px', fontWeight: 500 }}>soal benar</div>
            </div>

            {/* Tengah: VS */}
            <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 900, opacity: 0.9 }}>
              VS
            </div>

            {/* Kanan: Lawan */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>LAWAN</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>Ahmad</div>
              <div style={{ color: '#f59e0b', fontSize: '40px', fontWeight: 900, marginTop: '6px', lineHeight: 1 }}>3</div>
              <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '6px', fontWeight: 500 }}>soal benar</div>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>

          <div style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', fontWeight: 500 }}>
            diperbarui langsung saat lawan menjawab
          </div>
        </div>

        {/* Status Banner */}
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box'
        }}>
          <div style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
            ⏳ Lawan masih mengerjakan soal…
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>

        {/* Progress lawan */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '0 4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
            <span>Ahmad</span>
            <span>soal 4 dari 7</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '57%', // 4/7 approx
              height: '100%',
              backgroundColor: '#f59e0b',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        {/* Tombol Keluar */}
        <button style={{
          width: '100%',
          maxWidth: '300px',
          padding: '16px',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          color: '#94A3B8',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '16px',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#273549'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
        >
          ← Keluar
        </button>

      </div>
    </div>
  );
}
