import React from 'react';

function MatchR1({ winner, wScore, loser, lScore }: { winner: string, wScore: string, loser: string, lScore: string }) {
  return (
    <div style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{winner}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>{wScore}</span>
          <span style={{ fontSize: '12px', color: '#10b981' }}>✓</span>
        </div>
      </div>
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>{loser}</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>{lScore}</span>
      </div>
    </div>
  );
}

function MatchR2Expanded() {
  return (
    <div style={{ background: 'rgba(103,232,249,0.04)', border: '1px solid rgba(103,232,249,0.2)', borderRadius: '16px', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(103,232,249,0.1)', color: '#67E8F9', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>MATCH A</div>
        <div style={{ fontSize: '11px', color: '#67E8F9', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
          <span style={{ animation: 'pulse 1.5s infinite' }}>⚔️</span> Sedang berlangsung
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Player 1: Ahmad */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0e7490', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>A</div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Ahmad</span>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#67E8F9', lineHeight: 1 }}>3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '71%', background: '#67E8F9', height: '100%', borderRadius: 3 }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#94A3B8', width: '26px', textAlign: 'right', fontWeight: 600 }}>5/7</span>
          </div>
        </div>

        {/* VS Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
          <span style={{ fontSize: '10px', color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>VS</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
        </div>

        {/* Player 2: Budi */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>B</div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Budi</span>
            </div>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '57%', background: '#f59e0b', height: '100%', borderRadius: 3 }}></div>
            </div>
            <span style={{ fontSize: '12px', color: '#94A3B8', width: '26px', textAlign: 'right', fontWeight: 600 }}>4/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchR2Compact() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>MATCH B</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>Siti</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>4</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>Rizky <span style={{fontSize: '12px', marginLeft: '4px'}}>⏳</span></span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>5</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 4, borderRadius: 2 }}><div style={{ width: '85%', background: '#67E8F9', height: '100%', borderRadius: 2 }}></div></div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: 4, borderRadius: 2 }}><div style={{ width: '100%', background: '#f59e0b', height: '100%', borderRadius: 2 }}></div></div>
      </div>
    </div>
  );
}

export function TournGuruBracket() {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '390px',
        margin: '0 auto',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {/* TopBar */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0A1628', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', cursor: 'pointer', color: '#94A3B8' }}>←</span>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>🏆 Turnamen Ronde 2</h1>
          </div>
          <div style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, background: '#f87171', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div> LIVE
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Summary Bar */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', padding: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
              <span style={{ fontSize: '22px' }}>🎮</span>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px', fontWeight: 500 }}>Game</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Katak Pelompat</div>
              </div>
            </div>
            <div style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
              <span style={{ fontSize: '22px' }}>👥</span>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px', fontWeight: 500 }}>Sisa</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>4 siswa</div>
              </div>
            </div>
            <div style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'fit-content' }}>
              <span style={{ fontSize: '22px' }}>⏱️</span>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px', fontWeight: 500 }}>Ronde</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>2 / 3</div>
              </div>
            </div>
          </div>

          {/* Bracket Visual */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '40px', padding: '16px 16px 32px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Column 1 - Ronde 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '180px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.5px' }}>RONDE 1 (SELESAI)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                <MatchR1 winner="Ahmad" wScore="5" loser="Dani" lScore="3" />
                <MatchR1 winner="Budi" wScore="6" loser="Reza" lScore="4" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <MatchR1 winner="Siti" wScore="7" loser="Lila" lScore="2" />
                <MatchR1 winner="Rizky" wScore="5" loser="Hana" lScore="4" />
              </div>
            </div>

            {/* Column 2 - Ronde 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '270px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '12px', color: '#67E8F9', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                RONDE 2 <span style={{ width: 6, height: 6, background: '#67E8F9', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingTop: '16px' }}>
                <MatchR2Expanded />
                <MatchR2Compact />
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div style={{ padding: '0 16px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📡 Live Feed
            </h3>
            <div style={{ background: '#1A1D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: '#10b981', fontSize: '10px', marginTop: '4px', animation: 'pulse 1.5s infinite' }}>●</span>
                <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
                  <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px', marginRight: '8px' }}>14:23</span>
                  <strong>Rizky</strong> menyelesaikan semua soal <span style={{ color: '#10b981', fontWeight: 700 }}>(5 benar)</span>
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginLeft: '22px' }}></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: '#67E8F9', fontSize: '10px', marginTop: '4px' }}>●</span>
                <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
                  <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px', marginRight: '8px' }}>14:23</span>
                  <strong>Siti</strong> menjawab soal 6 ✅
                </div>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginLeft: '22px' }}></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', opacity: 0.7 }}>
                <span style={{ color: '#67E8F9', fontSize: '10px', marginTop: '4px' }}>●</span>
                <div style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
                  <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px', marginRight: '8px' }}>14:22</span>
                  <strong>Ahmad</strong> menjawab soal 5 ✅
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Bawah */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0d1f3c', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          <button style={{ width: '100%', padding: '16px', background: '#0e7490', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
            Lihat Nilai Siswa
          </button>
          <button style={{ width: '100%', padding: '16px', background: '#1e293b', color: '#f87171', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
            Hentikan Turnamen
          </button>
        </div>
      </div>
    </>
  );
}
