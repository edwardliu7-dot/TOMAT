import React from 'react';

// Void as gravitational singularity — the card's own structure is being consumed.
// Everything leans, bends, and compresses toward the core. The void isn't in the art zone;
// it IS the art zone, and it's eating the card.
export function VoidMonarch_EventHorizon() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#010101] p-8 font-sans">
      <style>{`
        @keyframes vm-pull { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.06) rotate(0.4deg)} }
        @keyframes vm-horizon-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes vm-horizon-rspin { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes vm-core-pulse { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.4);opacity:1} }
        @keyframes vm-lensflare { 0%,100%{opacity:0.12} 50%{opacity:0.28} }
        @keyframes vm-tidal { 0%,100%{letter-spacing:.22em;opacity:0.85} 50%{letter-spacing:.18em;opacity:1} }
        @keyframes vm-tick { 0%,94%,100%{opacity:1} 95%,99%{opacity:0.3} }
        .vm-warp-text { animation: vm-tidal 4s ease-in-out infinite; }
        .vm-tick { animation: vm-tick 6s linear infinite; }
      `}</style>

      <div
        className="group relative w-[320px] cursor-pointer"
        style={{ perspective: '900px' }}
      >
        {/* Outer gravitational field glow */}
        <div style={{
          position: 'absolute', inset: -24,
          background: 'radial-gradient(ellipse at 50% 48%, rgba(30,20,60,0.8) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(18px)',
        }} />

        <div
          className="relative rounded-sm overflow-hidden"
          style={{
            background: '#060409',
            border: '1px solid rgba(100,80,160,0.18)',
            boxShadow: '0 0 0 1px rgba(50,30,100,0.12), inset 0 0 60px rgba(20,10,40,0.9)',
            animation: 'vm-pull 8s ease-in-out infinite',
          }}
        >
          {/* Gravitational lensing — the light bending inward */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 60% 55% at 50% 42%, rgba(40,20,80,0.55) 0%, transparent 55%),
              radial-gradient(ellipse 100% 80% at 50% 50%, rgba(10,5,20,0.9) 30%, transparent 100%)
            `,
          }} />

          {/* Accretion disc lines — compressed matter around the singularity */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
            width: 220, height: 220,
            pointerEvents: 'none',
          }}>
            {[200, 160, 120, 88].map((size, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: size, height: size,
                top: '50%', left: '50%',
                marginTop: -size / 2, marginLeft: -size / 2,
                borderRadius: '50%',
                border: `1px solid rgba(${80 + i * 20},${40 + i * 15},${140 + i * 20},${0.08 + i * 0.04})`,
                animation: `${i % 2 === 0 ? 'vm-horizon-spin' : 'vm-horizon-rspin'} ${22 - i * 4}s linear infinite`,
              }} />
            ))}
          </div>

          {/* Top bar — compressed toward center, like tidal stretching */}
          <div style={{ padding: '22px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(160,130,220,0.6)',
              animation: 'vm-tick 9s linear 0.5s infinite',
            }}>Bingkai Avatar</span>
            <div style={{
              padding: '4px 8px',
              background: 'rgba(8,5,18,0.9)',
              border: '1px solid rgba(80,50,160,0.25)',
            }}>
              <span style={{ fontSize: 7.5, color: 'rgba(160,130,220,0.7)', letterSpacing: '0.2em', fontWeight: 600 }}>
                Edisi 03 / 13
              </span>
            </div>
          </div>

          {/* Singularity art zone */}
          <div style={{
            position: 'relative', height: 220,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Photon sphere — bright ring just outside event horizon */}
            <div style={{
              position: 'absolute',
              width: 72, height: 72,
              borderRadius: '50%',
              boxShadow: '0 0 0 1.5px rgba(200,180,255,0.15), 0 0 30px 8px rgba(80,40,160,0.3), 0 0 60px 20px rgba(40,20,100,0.2)',
              animation: 'vm-core-pulse 3.5s ease-in-out infinite',
            }} />

            {/* The event horizon — absolute black circle, the void itself */}
            <div style={{
              position: 'absolute',
              width: 46, height: 46,
              borderRadius: '50%',
              background: '#000000',
              boxShadow: '0 0 0 1px rgba(180,150,255,0.2), 0 0 20px 6px rgba(60,30,130,0.5)',
              zIndex: 2,
            }} />

            {/* Lens flare — the last light before crossing */}
            <div style={{
              position: 'absolute',
              width: 200, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(160,130,255,0.12), rgba(200,180,255,0.2), rgba(160,130,255,0.12), transparent)',
              animation: 'vm-lensflare 5s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              width: 1, height: 160,
              background: 'linear-gradient(180deg, transparent, rgba(160,130,255,0.08), rgba(200,180,255,0.15), rgba(160,130,255,0.08), transparent)',
              animation: 'vm-lensflare 5s ease-in-out 2.5s infinite',
            }} />
          </div>

          {/* Body — typography being tidally compressed */}
          <div style={{ padding: '0 22px 22px', textAlign: 'center' }}>
            <h2
              className="vm-warp-text"
              style={{
                fontSize: 16, fontWeight: 300, color: '#e0d8ff',
                textTransform: 'uppercase', marginBottom: 10,
                textShadow: '0 0 20px rgba(160,130,255,0.2)',
              }}
            >
              Monarki Hampa
            </h2>
            <p style={{
              fontSize: 8.5, color: 'rgba(120,100,160,0.7)',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'monospace', lineHeight: 1.7,
            }}>
              Kekuasaan tertinggi lahir dari<br />keheningan absolut.
            </p>

            <div style={{
              margin: '20px 0',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(100,70,200,0.2) 30%, rgba(140,100,220,0.35) 50%, rgba(100,70,200,0.2) 70%, transparent)',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 7, color: 'rgba(100,80,150,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Mahar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: '1px solid rgba(130,100,200,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(160,130,220,0.8)' }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#c4b8e8', fontWeight: 500, letterSpacing: '0.05em' }}>18.000</span>
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'transparent',
                border: '1px solid rgba(80,50,160,0.45)',
                color: 'rgba(160,130,220,0.85)',
                fontSize: 7.5, letterSpacing: '0.3em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.4s',
              }}>Akuisisi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
