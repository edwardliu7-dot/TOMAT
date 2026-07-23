import React from 'react';

// "Royal" as the golden ratio — φ = 1.618...
// The card's proportions, art, and hierarchy are all governed by mathematical law.
// The Fibonacci spiral IS the crest. Beauty as provable fact, not taste.
export function RoyalMathematician_GoldenRatio() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07060a] p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400&display=swap');
        @keyframes gr-spin-cw   { to { transform: rotate(360deg);  } }
        @keyframes gr-spin-ccw  { to { transform: rotate(-360deg); } }
        @keyframes gr-glow-phi  { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)} }
        @keyframes gr-trace     { to { stroke-dashoffset: 0; } }
      `}</style>

      <div style={{
        width: 320,
        background: 'linear-gradient(150deg, #0c0a14 0%, #07060a 100%)',
        border: '1px solid rgba(212,175,55,0.14)',
        borderRadius: 2,
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(212,175,55,0.05)',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"Cormorant Garamond", serif',
      }}>

        {/* Very faint geometric grid — like an architect's construction sheet */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />

        {/* φ annotation floating in background */}
        <div style={{
          position: 'absolute', right: 14, top: '45%',
          fontSize: 72, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
          color: 'rgba(212,175,55,0.04)', pointerEvents: 'none', zIndex: 1,
          lineHeight: 1, userSelect: 'none',
        }}>φ</div>

        {/* Glow behind the spiral */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)',
          animation: 'gr-glow-phi 5s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 5, padding: '20px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 7.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(180,155,90,0.55)', fontFamily: '"JetBrains Mono", monospace', fontWeight: 300 }}>
              Spanduk Profil
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 7.5, color: 'rgba(212,175,55,0.7)', letterSpacing: '0.18em', fontFamily: '"JetBrains Mono", monospace', fontWeight: 400 }}>
              Edisi 02 / 20
            </div>
            <div style={{ fontSize: 7, color: 'rgba(212,175,55,0.3)', letterSpacing: '0.1em', fontFamily: '"JetBrains Mono", monospace', marginTop: 2 }}>
              φ = 1.61803…
            </div>
          </div>
        </div>

        {/* Central art: Fibonacci spiral construction */}
        <div style={{ position: 'relative', zIndex: 5, height: 224, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer compass arcs */}
          <div style={{
            position: 'absolute', width: 180, height: 180, borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.1)',
            borderTopColor: 'rgba(212,175,55,0.3)', borderRightColor: 'rgba(212,175,55,0.2)',
            animation: 'gr-spin-cw 40s linear infinite',
          }} />
          <div style={{
            position: 'absolute', width: 138, height: 138, borderRadius: '50%',
            border: '1px dashed rgba(212,175,55,0.08)',
            animation: 'gr-spin-ccw 55s linear infinite',
          }} />

          {/* The Fibonacci spiral — SVG drawn in gold */}
          <svg width="148" height="148" viewBox="0 0 148 148" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            {/* Construction rectangles — the Fibonacci tiling */}
            <rect x="37" y="37" width="74" height="74" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5" fill="none"/>
            <rect x="37" y="37" width="46" height="46" stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" fill="none"/>
            <rect x="37" y="83" width="28" height="28" stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" fill="none"/>
            <rect x="65" y="83" width="18" height="18" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" fill="none"/>
            <rect x="65" y="101" width="11" height="11" stroke="rgba(212,175,55,0.07)" strokeWidth="0.5" fill="none"/>
            <rect x="76" y="101" width="7" height="7" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" fill="none"/>

            {/* The golden spiral path */}
            <path
              d="M111,37 Q111,111 37,111 Q37,65 65,65 Q65,83 51,83 Q51,74 58,74 Q58,79 55,79"
              stroke="rgba(212,175,55,0.55)" strokeWidth="1.2" fill="none"
              strokeLinecap="round"
            />
            {/* Extra spiral arc */}
            <path
              d="M111,37 A74,74 0 0,1 111,111"
              stroke="rgba(212,175,55,0.18)" strokeWidth="0.5" fill="none"
            />

            {/* Compass center mark */}
            <circle cx="74" cy="74" r="2" fill="rgba(212,175,55,0.6)" />
            <line x1="70" y1="74" x2="78" y2="74" stroke="rgba(212,175,55,0.35)" strokeWidth="0.5"/>
            <line x1="74" y1="70" x2="74" y2="78" stroke="rgba(212,175,55,0.35)" strokeWidth="0.5"/>

            {/* φ ratio annotation lines */}
            <line x1="37" y1="34" x2="111" y2="34" stroke="rgba(212,175,55,0.2)" strokeWidth="0.4" strokeDasharray="2 3"/>
            <line x1="37" y1="31" x2="37" y2="34" stroke="rgba(212,175,55,0.2)" strokeWidth="0.4"/>
            <line x1="111" y1="31" x2="111" y2="34" stroke="rgba(212,175,55,0.2)" strokeWidth="0.4"/>
            <text x="74" y="30" textAnchor="middle" fontSize="5" fill="rgba(212,175,55,0.35)" fontFamily="serif" fontStyle="italic">a</text>

            <line x1="37" y1="83" x2="37" y2="111" stroke="rgba(212,175,55,0.15)" strokeWidth="0.4" strokeDasharray="1 3"/>
            <text x="33" y="99" textAnchor="middle" fontSize="5" fill="rgba(212,175,55,0.25)" fontFamily="serif" fontStyle="italic">b</text>
          </svg>

          {/* φ callout */}
          <div style={{
            position: 'absolute', bottom: 14, right: 28,
            fontSize: 8, fontFamily: '"JetBrains Mono", monospace',
            color: 'rgba(212,175,55,0.4)',
          }}>a/b = φ</div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px', position: 'relative', zIndex: 5 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18))', marginLeft: 22 }} />
          <div style={{ width: 5, height: 5, transform: 'rotate(45deg)', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.06)' }} />
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.18), transparent)', marginRight: 22 }} />
        </div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 22px', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 22, fontWeight: 600, letterSpacing: '0.06em',
            background: 'linear-gradient(180deg,#fdf8e1 0%,#d4af37 50%,#8a6513 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8, lineHeight: 1.2,
          }}>
            Dekrit Mahaguru
          </h2>
          <p style={{ fontSize: 9.5, color: 'rgba(164,177,214,0.65)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16, maxWidth: 250, margin: '0 auto 16px' }}>
            "Sebuah pengakuan tertinggi. Hanya untuk mereka yang telah membedah anatomi semesta angka."
          </p>
        </div>

        {/* Footer */}
        <div style={{
          position: 'relative', zIndex: 5,
          background: 'rgba(8,7,11,0.9)',
          borderTop: '1px solid rgba(212,175,55,0.1)',
          padding: '14px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 7, color: 'rgba(113,123,156,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace', marginBottom: 5 }}>Mahar Tebusan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 14, transform: 'rotate(45deg)', border: '1px solid rgba(212,175,55,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 5, height: 5, background: 'rgba(212,175,55,0.7)' }} />
              </div>
              <span style={{ fontSize: 15, color: '#e8e0cc', fontWeight: 600, letterSpacing: '0.05em' }}>15.000</span>
            </div>
          </div>
          <button style={{
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid rgba(212,175,55,0.28)',
            color: 'rgba(212,175,55,0.8)',
            fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase',
            fontWeight: 400, cursor: 'pointer',
            fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 11,
          }}>Akuisisi</button>
        </div>
      </div>
    </div>
  );
}
