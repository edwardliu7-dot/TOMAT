import React from 'react';

// "Royal" as illuminated proof manuscript.
// Math notation treated like scripture — equations as heraldic insignia.
// The luxury is in treating a theorem with the reverence of a royal decree.
export function RoyalMathematician_ProofSheet() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090805] p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes ps-spin-cw  { to { transform: rotate(360deg);  } }
        @keyframes ps-spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes ps-glow  { 0%,100%{opacity:.55} 50%{opacity:.9} }
        @keyframes ps-quill { 0%,100%{transform:translateX(0)} 50%{transform:translateX(2px)} }
      `}</style>

      <div style={{
        width: 320, background: 'linear-gradient(160deg,#100f09 0%,#080706 100%)',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: 2,
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(212,175,55,0.06)',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"Libre Baskerville", serif',
      }}>

        {/* Ruled proof-sheet lines across the entire card */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(212,175,55,0.04) 27px, rgba(212,175,55,0.04) 28px)',
        }} />

        {/* Left margin rule (like a proof pad) */}
        <div style={{
          position: 'absolute', left: 34, top: 0, bottom: 0, width: 1,
          background: 'rgba(180,60,60,0.12)', zIndex: 1, pointerEvents: 'none',
        }} />

        {/* Faint gold radial glow behind the center */}
        <div style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1, animation: 'ps-glow 4s ease-in-out infinite',
        }} />

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 5, padding: '20px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 7.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(180,155,90,0.6)', fontFamily: 'inherit', marginBottom: 3 }}>
              Spanduk Profil
            </div>
            {/* Line number like a proof */}
            <div style={{ fontSize: 6.5, color: 'rgba(180,60,60,0.35)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
              ① AXIOM
            </div>
          </div>
          <div style={{
            padding: '3px 8px',
            border: '1px solid rgba(212,175,55,0.2)',
            background: 'rgba(212,175,55,0.05)',
          }}>
            <span style={{ fontSize: 7.5, color: 'rgba(212,175,55,0.75)', letterSpacing: '0.18em', fontFamily: 'monospace', fontWeight: 700 }}>
              Edisi 02 / 20
            </span>
          </div>
        </div>

        {/* Central art: The Theorem Seal */}
        <div style={{ position: 'relative', zIndex: 5, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Orbiting rings */}
          <div style={{
            position: 'absolute', width: 172, height: 172, borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.22)',
            borderTopColor: 'transparent', borderBottomColor: 'transparent',
            animation: 'ps-spin-cw 22s linear infinite',
          }} />
          <div style={{
            position: 'absolute', width: 134, height: 134, borderRadius: '50%',
            border: '1px dashed rgba(212,175,55,0.14)',
            animation: 'ps-spin-ccw 30s linear infinite',
          }} />

          {/* The illuminated theorem panel */}
          <div style={{
            position: 'relative', zIndex: 2,
            width: 112, height: 112,
            background: 'linear-gradient(135deg, #1a1609 0%, #0d0b06 100%)',
            border: '1px solid rgba(212,175,55,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(212,175,55,0.1), inset 0 0 16px rgba(0,0,0,0.5)',
          }}>
            {/* Inner border */}
            <div style={{
              position: 'absolute', inset: 5,
              border: '1px solid rgba(212,175,55,0.12)',
            }} />
            {/* The theorem equations as the crest */}
            <div style={{ textAlign: 'center', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
              <div style={{
                fontSize: 13, fontFamily: 'serif', fontStyle: 'italic',
                background: 'linear-gradient(180deg,#fdf8e1,#d4af37 60%,#8a6513)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '0.04em',
              }}>∑ aₙ</div>
              <div style={{
                width: 46, height: 1,
                background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)',
                margin: '3px auto',
              }} />
              <div style={{
                fontSize: 13, fontFamily: 'serif', fontStyle: 'italic',
                background: 'linear-gradient(180deg,#fdf8e1,#d4af37 60%,#8a6513)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>n → ∞</div>
            </div>
          </div>

          {/* Floating proof annotations */}
          {[
            { text: 'Q.E.D.', x: '8%', y: '15%', size: 7 },
            { text: '∵', x: '82%', y: '20%', size: 11 },
            { text: '∴ □', x: '12%', y: '80%', size: 7 },
            { text: 'φ', x: '80%', y: '75%', size: 10 },
          ].map((a, i) => (
            <div key={i} style={{
              position: 'absolute', left: a.x, top: a.y,
              fontSize: a.size, color: 'rgba(212,175,55,0.28)',
              fontFamily: 'serif', fontStyle: 'italic',
              letterSpacing: '0.05em',
            }}>{a.text}</div>
          ))}
        </div>

        {/* Proof lines / working below symbol */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 38px 0 46px', marginBottom: 12 }}>
          {[
            { label: '①', text: 'Diberikan: x ∈ ℝ, x > 0', dim: true },
            { label: '②', text: 'Maka: ∃ε > 0 sehingga…', dim: false },
          ].map((line, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6,
              borderBottom: '1px solid rgba(212,175,55,0.05)', paddingBottom: 6,
            }}>
              <span style={{ fontSize: 7, color: 'rgba(180,60,60,0.4)', flexShrink: 0, fontFamily: 'monospace', minWidth: 12 }}>{line.label}</span>
              <span style={{ fontSize: 8, color: line.dim ? 'rgba(180,155,90,0.3)' : 'rgba(212,175,55,0.55)', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{line.text}</span>
            </div>
          ))}
        </div>

        {/* Divider with diamond */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '8px 0', position: 'relative', zIndex: 5 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2))', marginLeft: 22 }} />
          <div style={{ width: 5, height: 5, transform: 'rotate(45deg)', border: '1px solid rgba(212,175,55,0.45)' }} />
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.2), transparent)', marginRight: 22 }} />
        </div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 5, padding: '10px 22px 0', textAlign: 'center' }}>
          <h2 style={{
            fontSize: 19, fontWeight: 700, letterSpacing: '0.04em',
            background: 'linear-gradient(180deg,#fdf8e1 0%,#d4af37 50%,#8a6513 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 10, fontFamily: '"IM Fell English", serif',
          }}>
            Dekrit Mahaguru
          </h2>
          <p style={{ fontSize: 9.5, color: 'rgba(164,177,214,0.7)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 18, maxWidth: 260, margin: '0 auto 18px' }}>
            "Sebuah pengakuan tertinggi. Hanya untuk mereka yang telah membedah anatomi semesta angka."
          </p>
        </div>

        {/* Footer */}
        <div style={{
          position: 'relative', zIndex: 5,
          background: 'rgba(10,9,6,0.85)',
          borderTop: '1px solid rgba(212,175,55,0.12)',
          padding: '14px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 7, color: 'rgba(113,123,156,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 5 }}>Mahar Tebusan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, color: 'rgba(212,175,55,0.8)', fontFamily: 'serif', fontStyle: 'italic' }}>◈</span>
              <span style={{ fontSize: 15, color: '#e8e0cc', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'monospace' }}>15.000</span>
            </div>
          </div>
          <button style={{
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid rgba(212,175,55,0.3)',
            color: 'rgba(212,175,55,0.85)',
            fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
          }}>Akuisisi →</button>
        </div>
      </div>
    </div>
  );
}
