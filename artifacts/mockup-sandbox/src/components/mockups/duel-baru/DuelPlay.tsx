import React from 'react';

export function DuelPlay() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '390px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      {/* TopBar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          gap: '12px'
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>⚔️ Katak Pelompat</h1>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* Score Bar */}
        <div
          style={{
            background: '#1A1D27',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Left: KAMU */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ color: '#67E8F9', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>KAMU</div>
            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>Budi</div>
            <div style={{ color: '#67E8F9', fontSize: '36px', fontWeight: 900, lineHeight: '1.1' }}>4</div>
          </div>

          {/* Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 600 }}>SOAL</div>
            <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>5/7</div>
            <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>VS</div>
          </div>

          {/* Right: LAWAN */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>LAWAN</div>
            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>Ahmad</div>
            <div style={{ color: '#f59e0b', fontSize: '36px', fontWeight: 900, lineHeight: '1.1' }}>3</div>
          </div>
        </div>

        {/* Game Card */}
        <div
          style={{
            background: '#1A1D27',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Number Line SVG */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '260/120', background: '#0A1628', borderRadius: '12px', overflow: 'hidden' }}>
            <svg viewBox="0 0 260 120" style={{ width: '100%', height: '100%' }}>
              {/* River background elements */}
              <rect x="0" y="0" width="260" height="120" fill="#0A1628" />
              <path d="M0 60 Q 65 50, 130 60 T 260 60" fill="none" stroke="rgba(103, 232, 249, 0.1)" strokeWidth="20" />
              <path d="M0 80 Q 65 70, 130 80 T 260 80" fill="none" stroke="rgba(103, 232, 249, 0.15)" strokeWidth="15" />
              
              {/* Number Line */}
              <line x1="20" y1="90" x2="240" y2="90" stroke="#475569" strokeWidth="2" />
              
              {/* Ticks and Numbers */}
              {[...Array(7)].map((_, i) => {
                const val = -15 + i * 5;
                const x = 20 + i * (220 / 6);
                return (
                  <g key={i}>
                    <line x1={x} y1="87" x2={x} y2="93" stroke="#94A3B8" strokeWidth="2" />
                    <text x={x} y="110" fill="#94A3B8" fontSize="10" textAnchor="middle" fontWeight="500">{val}</text>
                  </g>
                );
              })}

              {/* Start Position Marker */}
              <circle cx={144.66} cy="90" r="4" fill="#94A3B8" />

              {/* Dashed Arc 2 to 7 */}
              {/* x for 2 is approx 20 + 17*(220/30) = 20 + 124.66 = 144.66 */}
              {/* x for 7 is approx 20 + 22*(220/30) = 20 + 161.33 = 181.33 */}
              <path 
                d="M 144.66 85 Q 163 45, 181.33 85" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />

              {/* Ghost Opponent (Pos 3) */}
              {/* x for 3: 20 + 18*(220/30) = 20 + 132 = 152 */}
              <text x="152" y="85" fontSize="20" textAnchor="middle" style={{ opacity: 0.45 }}>🔥</text>

              {/* Player Frog (Pos 7) */}
              <text x="181.33" y="85" fontSize="24" textAnchor="middle">🐸</text>
            </svg>
          </div>

          {/* Soal */}
          <div style={{ fontSize: '15px', lineHeight: '1.5', textAlign: 'center' }}>
            Katak di batu <strong style={{ color: '#fff' }}>2</strong>, melompat ⮕ maju <strong style={{ color: '#fff' }}>5 batu</strong>. Geser katak!
          </div>

          {/* Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div 
              style={{ 
                background: 'rgba(103, 232, 249, 0.1)', 
                color: '#67E8F9', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '16px', 
                fontWeight: 700 
              }}
            >
              7
            </div>
            <input 
              type="range" 
              min="-15" 
              max="15" 
              defaultValue="7"
              style={{
                width: '100%',
                accentColor: '#67E8F9'
              }}
            />
          </div>

          {/* Result Banner */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div style={{ color: '#10b981', fontSize: '15px', fontWeight: 600 }}>✅ Benar!</div>
            <div style={{ color: '#94A3B8', fontSize: '12px' }}>Soal berikutnya sebentar lagi…</div>
          </div>
        </div>

        {/* Tombol Konfirmasi */}
        <button
          style={{
            background: '#0e7490',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            width: '100%',
            cursor: 'pointer',
            opacity: 0.8
          }}
          disabled
        >
          ✅ Konfirmasi Posisi 7
        </button>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: '#94A3B8', fontSize: '11px', marginTop: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🐸 Kamu</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔥 Lawan</span>
        </div>
      </div>
    </div>
  );
}
