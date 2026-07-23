import React from 'react';

// "Royal" as mathematical authority — the luxury of absolute certainty.
// A formal proof statement treated as a royal decree. No decorative rings.
// The power comes from having the correct answer, not from ornamentation.
// Sparse, ruled, precise. Like Euclid's Elements illuminated in gold.
export function RoyalMathematician_Axiom() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200;0,300;0,400;1,200;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes ax-pulse  { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes ax-blink  { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes ax-drift  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes ax-glow   { 0%,100%{box-shadow:0 0 18px rgba(212,175,55,0.1)} 50%{box-shadow:0 0 35px rgba(212,175,55,0.22)} }
      `}</style>

      <div style={{
        width: 320,
        background: '#000000',
        border: '1px solid rgba(212,175,55,0.22)',
        position: 'relative', overflow: 'hidden',
        fontFamily: '"Crimson Pro", serif',
        animation: 'ax-glow 5s ease-in-out infinite',
      }}>

        {/* Horizontal proof-pad rules — the whole card IS a ruled proof sheet */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(212,175,55,0.045) 31px, rgba(212,175,55,0.045) 32px)',
        }} />

        {/* Very faint "THEOREM" watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) rotate(-12deg)',
          fontSize: 54, fontWeight: 200, letterSpacing: '0.3em',
          color: 'rgba(212,175,55,0.025)',
          fontFamily: '"Crimson Pro", serif',
          pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none',
        }}>THEOREM</div>

        {/* Top rule — the frame's authority line */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5) 20%, rgba(212,175,55,0.7) 50%, rgba(212,175,55,0.5) 80%, transparent)' }} />

          {/* Header */}
          <div style={{ padding: '16px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 7.5, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(180,155,90,0.5)', fontFamily: '"Space Mono", monospace', fontWeight: 400 }}>
              Spanduk Profil
            </span>
            <span style={{ fontSize: 7.5, color: 'rgba(212,175,55,0.65)', letterSpacing: '0.15em', fontFamily: '"Space Mono", monospace' }}>
              02 / 20
            </span>
          </div>
        </div>

        {/* Central section: the formal theorem statement */}
        <div style={{ position: 'relative', zIndex: 5, padding: '28px 28px 20px' }}>

          {/* Statement label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 20, height: 20, border: '1px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 9, color: 'rgba(212,175,55,0.7)', fontFamily: '"Space Mono", monospace' }}>∎</span>
            </div>
            <span style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.45)', fontFamily: '"Space Mono", monospace' }}>
              Teorema Utama
            </span>
          </div>

          {/* The theorem itself — the heart of the card */}
          <div style={{
            padding: '22px 20px',
            border: '1px solid rgba(212,175,55,0.18)',
            background: 'rgba(212,175,55,0.025)',
            marginBottom: 16,
            position: 'relative',
          }}>
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid rgba(212,175,55,0.5)', borderLeft: '2px solid rgba(212,175,55,0.5)' }} />
            <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: '2px solid rgba(212,175,55,0.5)', borderRight: '2px solid rgba(212,175,55,0.5)' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: '2px solid rgba(212,175,55,0.5)', borderLeft: '2px solid rgba(212,175,55,0.5)' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid rgba(212,175,55,0.5)', borderRight: '2px solid rgba(212,175,55,0.5)' }} />

            {/* The formal statement — the visual crown of the card */}
            <div style={{
              textAlign: 'center',
              animation: 'ax-drift 6s ease-in-out infinite',
            }}>
              <div style={{
                fontSize: 26, fontWeight: 200, fontStyle: 'italic',
                background: 'linear-gradient(180deg,#fdf8e1 0%,#d4af37 55%,#8a6513 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.4, letterSpacing: '0.02em',
                fontFamily: '"Crimson Pro", serif',
              }}>
                ∀ε &gt; 0,<br />∃δ &gt; 0
              </div>
              <div style={{
                marginTop: 10,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)',
              }} />
              <div style={{
                marginTop: 10, fontSize: 12, fontStyle: 'italic',
                color: 'rgba(212,175,55,0.5)', fontFamily: '"Crimson Pro", serif',
                letterSpacing: '0.08em',
              }}>
                sehingga |x − c| &lt; δ
              </div>
              <div style={{
                marginTop: 4, fontSize: 12, fontStyle: 'italic',
                color: 'rgba(212,175,55,0.35)', fontFamily: '"Crimson Pro", serif',
              }}>
                ⟹ |ƒ(x) − L| &lt; ε
              </div>
            </div>
          </div>

          {/* Proof conclusion */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 8, color: 'rgba(212,175,55,0.35)', fontFamily: '"Space Mono", monospace', letterSpacing: '0.1em' }}>
              Terbukti dengan sempurna.
            </span>
            <span style={{
              fontSize: 14, color: 'rgba(212,175,55,0.6)',
              fontFamily: '"Crimson Pro", serif',
              animation: 'ax-pulse 3s ease-in-out infinite',
            }}>□</span>
          </div>
        </div>

        {/* Title area */}
        <div style={{ position: 'relative', zIndex: 5, padding: '0 28px 18px', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
          <div style={{ marginTop: 16 }}>
            <h2 style={{
              fontSize: 21, fontWeight: 300, letterSpacing: '0.1em',
              background: 'linear-gradient(180deg,#fdf8e1 0%,#d4af37 60%,#8a6513 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 9, fontFamily: '"Crimson Pro", serif',
            }}>
              Dekrit Mahaguru
            </h2>
            <p style={{
              fontSize: 9.5, color: 'rgba(164,177,214,0.55)', fontStyle: 'italic',
              lineHeight: 1.7, fontFamily: '"Crimson Pro", serif',
            }}>
              "Sebuah pengakuan tertinggi. Hanya untuk mereka yang telah membedah anatomi semesta angka."
            </p>
          </div>
        </div>

        {/* Bottom rule then footer */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.25) 20%, rgba(212,175,55,0.35) 50%, rgba(212,175,55,0.25) 80%, transparent)' }} />
          <div style={{
            padding: '14px 22px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(212,175,55,0.02)',
          }}>
            <div>
              <div style={{ fontSize: 7, color: 'rgba(113,123,156,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: '"Space Mono", monospace', marginBottom: 5 }}>Mahar Tebusan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, color: 'rgba(212,175,55,0.7)', fontFamily: '"Crimson Pro", serif', fontStyle: 'italic' }}>◈</span>
                <span style={{ fontSize: 15, color: '#e8e0cc', fontWeight: 400, fontFamily: '"Crimson Pro", serif', letterSpacing: '0.05em' }}>15.000</span>
              </div>
            </div>
            <button style={{
              padding: '9px 20px',
              background: 'transparent',
              border: '1px solid rgba(212,175,55,0.3)',
              color: 'rgba(212,175,55,0.8)',
              fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase',
              fontWeight: 700, cursor: 'pointer', fontFamily: '"Space Mono", monospace',
            }}>Akuisisi</button>
          </div>
          <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4) 20%, rgba(212,175,55,0.6) 50%, rgba(212,175,55,0.4) 80%, transparent)' }} />
        </div>
      </div>
    </div>
  );
}
