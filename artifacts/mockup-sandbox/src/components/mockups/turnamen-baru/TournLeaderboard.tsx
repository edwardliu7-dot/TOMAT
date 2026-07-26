import React from 'react';

export function TournLeaderboard() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '390px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}>
        <style>
          {`
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-3px); }
            }
            .dot {
              display: inline-block;
              animation: bounce 1.4s infinite ease-in-out both;
            }
            .dot:nth-child(1) { animation-delay: -0.32s; }
            .dot:nth-child(2) { animation-delay: -0.16s; }
            .dot:nth-child(3) { animation-delay: 0s; }
          `}
        </style>

        {/* Content Wrapper */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: '24px'
        }}>
          
          {/* Header section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '56px', lineHeight: 1 }}>🏁</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#67E8F9', textAlign: 'center' }}>
              Kamu Sudah Selesai!
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', fontWeight: 500 }}>
              Ronde 2 — vs Siti Nurhaliza
            </div>
          </div>

          {/* Score Card */}
          <div style={{
            backgroundColor: '#1A1D27',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {/* Self */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#67E8F9', letterSpacing: '0.5px', marginBottom: '4px' }}>KAMU</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600, marginBottom: '12px' }}>Budi</div>
              <div style={{ fontSize: '40px', fontWeight: 900, color: '#67E8F9', lineHeight: 1 }}>4</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontWeight: 500 }}>soal benar</div>
            </div>

            {/* Divider */}
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b', fontStyle: 'italic', opacity: 0.9 }}>
              VS
            </div>

            {/* Opponent */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.5px', marginBottom: '4px' }}>LAWAN</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600, marginBottom: '12px' }}>Siti</div>
              <div style={{ fontSize: '40px', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>3</div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontWeight: 500 }}>soal benar</div>
            </div>
          </div>

          {/* Status Banner */}
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⏳ Lawan masih mengerjakan soal</span>
              <span style={{ display: 'flex', width: '12px', justifyContent: 'space-between' }}>
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </div>
          </div>

          {/* Bracket Info Card */}
          <div style={{
            backgroundColor: '#1A1D27',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '18px', lineHeight: 1.2 }}>🏆</div>
            <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, fontWeight: 500 }}>
              Jika menang &rarr; Semifinal vs pemenang <span style={{ color: '#ffffff', fontWeight: 700 }}>Dani</span> vs <span style={{ color: '#ffffff', fontWeight: 700 }}>Rizky</span>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ height: '8px' }} />

          {/* Action Button */}
          <button style={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            color: '#ffffff',
            padding: '16px 24px',
            fontSize: '15px',
            fontWeight: 600,
            width: '100%',
            maxWidth: '300px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s',
          }}>
            <span style={{ fontSize: '16px', lineHeight: 1, color: '#94A3B8' }}>&larr;</span> Keluar Turnamen
          </button>

        </div>
      </div>
    </div>
  );
}
