import React from 'react';

// Void as hidden spectrum — subverting the all-black expectation.
// "Void" doesn't mean darkness; it means the absence of limitation.
// This frame reveals prismatic light that shouldn't exist in emptiness.
// Oil-slick holographic gradients emerge from absolute black.
export function VoidMonarch_ChromaticVoid() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#000000] p-8 font-sans">
      <style>{`
        @keyframes cv-hue   { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
        @keyframes cv-drift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes cv-shimmer { 0%{opacity:0.08;transform:rotate(20deg) translateX(-120%)} 100%{opacity:0.22;transform:rotate(20deg) translateX(220%)} }
        @keyframes cv-float { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.04) rotate(0.6deg)} }
        @keyframes cv-orb   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        @keyframes cv-ring-cw  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes cv-ring-ccw { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
      `}</style>

      <div className="group relative w-[320px] cursor-pointer" style={{ animation: 'cv-float 7s ease-in-out infinite' }}>

        {/* Prismatic outer glow — the corona of the hidden spectrum */}
        <div style={{
          position: 'absolute', inset: -16,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #ff006622, #7c3aed33, #0ea5e922, #10b98122, #7c3aed22)',
          backgroundSize: '300% 300%',
          animation: 'cv-drift 8s ease infinite, cv-hue 12s linear infinite',
          filter: 'blur(16px)',
          opacity: 0.5,
        }} />

        <div
          style={{
            position: 'relative',
            background: '#020202',
            border: '1px solid #111',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), inset 0 0 40px rgba(0,0,0,0.8)',
          }}
        >
          {/* Iridescent base layer — oil slick on obsidian */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(125deg, rgba(124,58,237,0.06) 0%, rgba(14,165,233,0.04) 25%, rgba(16,185,129,0.04) 50%, rgba(251,191,36,0.04) 75%, rgba(239,68,68,0.05) 100%)',
            backgroundSize: '400% 400%',
            animation: 'cv-drift 12s ease infinite',
            pointerEvents: 'none',
          }} />

          {/* Shimmer streak — the moving prism light */}
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: '35%',
              background: 'linear-gradient(90deg, transparent, rgba(200,180,255,0.1), rgba(150,230,255,0.12), rgba(200,255,200,0.08), transparent)',
              animation: 'cv-shimmer 4s ease-in-out 1s infinite',
            }} />
          </div>

          {/* Header */}
          <div style={{ padding: '22px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #a78bfa, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%',
              animation: 'cv-drift 5s ease infinite',
            }}>Bingkai Avatar</span>
            <div style={{
              padding: '4px 9px',
              background: 'rgba(10,5,20,0.8)',
              border: '1px solid rgba(160,120,255,0.2)',
              borderRadius: 2,
            }}>
              <span style={{ fontSize: 7.5, color: 'rgba(200,180,255,0.7)', letterSpacing: '0.2em', fontWeight: 600 }}>
                Edisi 03 / 13
              </span>
            </div>
          </div>

          {/* Art zone — the prism core */}
          <div style={{
            position: 'relative', height: 230,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Chromatic rings */}
            {[
              { size: 188, color: 'rgba(167,139,250,0.12)', dur: '20s', dir: 'cv-ring-cw', dash: true },
              { size: 145, color: 'rgba(56,189,248,0.15)', dur: '14s', dir: 'cv-ring-ccw', dash: false },
              { size: 100, color: 'rgba(52,211,153,0.12)', dur: '10s', dir: 'cv-ring-cw', dash: true },
            ].map((r, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: r.size, height: r.size,
                borderRadius: '50%',
                border: `1px ${r.dash ? 'dashed' : 'solid'} ${r.color}`,
                animation: `${r.dir} ${r.dur} linear infinite`,
              }} />
            ))}

            {/* Prismatic core — the void revealing its true nature */}
            <div style={{
              position: 'relative', zIndex: 2,
              width: 66, height: 66,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.6) 30%, rgba(14,165,233,0.3) 55%, transparent 75%)',
              animation: 'cv-orb 3s ease-in-out infinite',
              boxShadow: `
                0 0 0 1px rgba(200,180,255,0.3),
                0 0 20px 6px rgba(124,58,237,0.25),
                0 0 40px 12px rgba(14,165,233,0.15),
                0 0 60px 20px rgba(16,185,129,0.1)
              `,
            }}>
              {/* Spectrum facets inside the orb */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #ff006640, #7c3aed60, #0ea5e950, #10b98140, #fbbf2440, #ef444440, #ff006640)',
                animation: 'cv-ring-cw 4s linear infinite',
                mixBlendMode: 'screen',
              }} />
            </div>

            {/* Floating chromatic dust */}
            {[
              { x: '22%', y: '25%', c: '#a78bfa', s: 3, a: 0.6 },
              { x: '75%', y: '30%', c: '#38bdf8', s: 2, a: 0.5 },
              { x: '20%', y: '72%', c: '#34d399', s: 2, a: 0.4 },
              { x: '78%', y: '68%', c: '#fbbf24', s: 2, a: 0.5 },
              { x: '50%', y: '18%', c: '#f472b6', s: 3, a: 0.45 },
              { x: '50%', y: '80%', c: '#60a5fa', s: 2, a: 0.5 },
            ].map((d, i) => (
              <div key={i} style={{
                position: 'absolute', left: d.x, top: d.y,
                width: d.s, height: d.s, borderRadius: '50%',
                background: d.c, opacity: d.a,
                boxShadow: `0 0 6px 2px ${d.c}88`,
              }} />
            ))}
          </div>

          {/* Title */}
          <div style={{ padding: '0 22px 22px', textAlign: 'center' }}>
            <h2 style={{
              fontSize: 15.5, fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase',
              marginBottom: 10,
              background: 'linear-gradient(90deg, #c4b5fd, #ffffff, #bae6fd)',
              backgroundSize: '200% 100%',
              animation: 'cv-drift 6s ease infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Monarki Hampa
            </h2>
            <p style={{
              fontSize: 8.5, color: 'rgba(180,160,220,0.55)',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              fontFamily: 'monospace', lineHeight: 1.7,
            }}>
              Kekuasaan tertinggi lahir dari<br />keheningan absolut.
            </p>

            <div style={{
              margin: '20px 0', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(14,165,233,0.3), rgba(16,185,129,0.25), transparent)',
              backgroundSize: '200% 100%',
              animation: 'cv-drift 5s ease infinite',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 7, color: 'rgba(150,130,200,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Mahar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 13, height: 13, borderRadius: '50%',
                    border: '1px solid rgba(167,139,250,0.5)',
                    background: 'conic-gradient(#7c3aed44, #0ea5e944, #7c3aed44)',
                    animation: 'cv-ring-cw 3s linear infinite',
                  }} />
                  <span style={{ fontSize: 13, color: '#e0d8ff', fontWeight: 400, letterSpacing: '0.05em' }}>18.000</span>
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(14,165,233,0.1))',
                border: '1px solid rgba(167,139,250,0.3)',
                color: 'rgba(200,185,255,0.9)',
                fontSize: 7.5, letterSpacing: '0.28em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer',
              }}>Akuisisi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
