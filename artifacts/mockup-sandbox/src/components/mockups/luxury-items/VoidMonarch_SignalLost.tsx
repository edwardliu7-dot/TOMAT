import React from 'react';

// Void as digital entropy — the card itself is corrupting.
// Scan lines, RGB channel offset, flickering elements.
// The void isn't space; it's the failure of the medium to maintain coherence.
// This frame doesn't decorate your profile — it corrupts the data around it.
export function VoidMonarch_SignalLost() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#000000] p-8 font-mono">
      <style>{`
        @keyframes sl-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
        @keyframes sl-flicker {
          0%,88%,100% { opacity:1 }
          89%          { opacity:0.3 }
          90%          { opacity:1 }
          92%          { opacity:0.1 }
          93%          { opacity:0.9 }
        }
        @keyframes sl-glitch-h {
          0%,90%,100% { transform:translateX(0) skewX(0deg); clip-path:none }
          91%          { transform:translateX(-3px) skewX(-1deg); clip-path:inset(20% 0 60% 0) }
          92%          { transform:translateX(3px) skewX(1deg);  clip-path:inset(60% 0 15% 0) }
          93%          { transform:translateX(0) skewX(0deg);   clip-path:none }
        }
        @keyframes sl-rgb-r { 0%,85%,100%{transform:translate(0,0)} 86%{transform:translate(2px,-1px)} 87%{transform:translate(-2px,1px)} 88%{transform:translate(0,0)} }
        @keyframes sl-rgb-b { 0%,85%,100%{transform:translate(0,0)} 86%{transform:translate(-3px,1px)} 87%{transform:translate(1px,-2px)} 88%{transform:translate(0,0)} }
        @keyframes sl-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes sl-static {
          0%,100% { background-position: 0 0 }
          10%  { background-position: -5% -10% }
          30%  { background-position: 3% 15% }
          50%  { background-position: -8% 5% }
          70%  { background-position: 5% -12% }
          90%  { background-position: -3% 8% }
        }
        @keyframes sl-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes sl-rspin { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes sl-noise { 0%{transform:translate(0,0)} 20%{transform:translate(-2px,2px)} 40%{transform:translate(-2px,-2px)} 60%{transform:translate(2px,2px)} 80%{transform:translate(2px,-2px)} 100%{transform:translate(0,0)} }
        .sl-flicker { animation: sl-flicker 7s linear infinite; }
        .sl-glitch  { animation: sl-glitch-h 5s ease-in-out infinite; }
      `}</style>

      <div className="group relative w-[320px] cursor-pointer sl-flicker">

        {/* CRT outer vignette */}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: 4,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none', zIndex: 10,
        }} />

        <div style={{
          position: 'relative',
          background: '#030507',
          border: '1px solid rgba(80,200,120,0.15)',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(80,200,120,0.06), 0 0 20px rgba(40,180,80,0.06)',
        }}>

          {/* Scan lines overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
          }} />

          {/* Moving scan bar */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 60, zIndex: 3, pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent, rgba(80,200,120,0.04), rgba(80,200,120,0.07), rgba(80,200,120,0.04), transparent)',
            animation: 'sl-scan 4s linear infinite',
          }} />

          {/* Static noise texture */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation: 'sl-static 0.5s steps(1) infinite',
          }} />

          {/* Header — with terminal-style corruption */}
          <div style={{ padding: '22px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(80,200,120,0.7)' }}>
                Bingkai Avatar
              </span>
              <span style={{ fontSize: 6, letterSpacing: '0.12em', color: 'rgba(80,200,120,0.3)', fontFamily: 'monospace' }}>
                ERR_SIGNAL_DEGRADED<span style={{ animation: 'sl-blink 1s step-end infinite' }}>█</span>
              </span>
            </div>
            <div style={{
              padding: '4px 9px',
              background: 'rgba(0,20,8,0.9)',
              border: '1px solid rgba(80,200,120,0.2)',
            }}>
              <span style={{ fontSize: 7.5, color: 'rgba(80,200,120,0.6)', letterSpacing: '0.2em', fontWeight: 600 }}>
                Edisi 03 / 13
              </span>
            </div>
          </div>

          {/* Art zone — the corrupted symbol */}
          <div style={{
            position: 'relative', height: 220, zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Orbital rings with glitch */}
            <div style={{ position: 'absolute', width: 175, height: 175, borderRadius: '50%', border: '1px dashed rgba(80,200,120,0.12)', animation: 'sl-spin 28s linear infinite' }} />
            <div style={{ position: 'absolute', width: 135, height: 135, borderRadius: '50%', border: '1px solid rgba(80,200,120,0.18)', animation: 'sl-rspin 18s linear infinite' }} />

            {/* RGB-split symbol — the key glitch effect */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              {/* Red channel offset */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,60,60,0.4)" strokeWidth="0.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', inset: 0, animation: 'sl-rgb-r 4s ease-in-out infinite' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,60,60,0.3)" />
              </svg>
              {/* Blue channel offset */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(60,120,255,0.35)" strokeWidth="0.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', inset: 0, animation: 'sl-rgb-b 4s ease-in-out infinite' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(60,120,255,0.3)" />
              </svg>
              {/* Main green channel */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(80,220,120,0.7)" strokeWidth="0.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 8px rgba(80,200,120,0.5))' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(180,255,200,0.9)" />
                <path d="M12 7v10" strokeDasharray="1 1" opacity="0.4" />
              </svg>
            </div>

            {/* Corrupted pixels scattered */}
            {[
              { left: '18%', top: '28%', w: 8, h: 2, c: 'rgba(255,60,60,0.5)' },
              { left: '72%', top: '35%', w: 12, h: 1, c: 'rgba(60,120,255,0.5)' },
              { left: '25%', top: '68%', w: 6, h: 2, c: 'rgba(80,220,120,0.4)' },
              { left: '65%', top: '72%', w: 10, h: 1, c: 'rgba(255,60,60,0.35)' },
            ].map((p, i) => (
              <div key={i} style={{
                position: 'absolute', left: p.left, top: p.top,
                width: p.w, height: p.h, background: p.c,
                animation: `sl-flicker ${2 + i * 0.7}s linear ${i * 0.5}s infinite`,
              }} />
            ))}
          </div>

          {/* Title with glitch treatment */}
          <div style={{ padding: '0 22px 22px', textAlign: 'center', position: 'relative', zIndex: 5 }}>
            <div className="sl-glitch">
              <h2 style={{
                fontSize: 15.5, fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: 'rgba(200,240,210,0.9)', marginBottom: 10,
                textShadow: '0 0 12px rgba(80,200,120,0.3)',
              }}>
                Monarki Hampa
              </h2>
            </div>
            <p style={{
              fontSize: 8.5, color: 'rgba(80,160,100,0.55)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              lineHeight: 1.7,
            }}>
              Kekuasaan tertinggi lahir dari<br />keheningan absolut.
            </p>

            {/* Corrupted data readout */}
            <div style={{
              margin: '14px 0 18px',
              padding: '6px 8px',
              background: 'rgba(0,20,8,0.6)',
              border: '1px solid rgba(80,200,120,0.1)',
              borderRadius: 2,
            }}>
              <div style={{ fontSize: 7, color: 'rgba(80,200,120,0.4)', letterSpacing: '0.08em', fontFamily: 'monospace', lineHeight: 1.8 }}>
                <span style={{ animation: 'sl-flicker 3s linear 0.3s infinite' }}>FRAME_INTEGRITY: 12%</span><br />
                <span style={{ animation: 'sl-flicker 4s linear 1s infinite' }}>SIGNAL_LOSS: CRITICAL</span><br />
                <span style={{ animation: 'sl-flicker 2.5s linear 0.7s infinite' }}>DATA_CORRUPTION: ACTIVE<span style={{ animation: 'sl-blink 0.8s step-end infinite' }}>_</span></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 7, color: 'rgba(80,160,100,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Mahar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(80,200,120,0.5)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 12h6"/>
                  </svg>
                  <span style={{ fontSize: 13, color: 'rgba(200,240,210,0.85)', fontWeight: 400, letterSpacing: '0.05em' }}>18.000</span>
                </div>
              </div>
              <button style={{
                padding: '8px 20px',
                background: 'transparent',
                border: '1px solid rgba(80,200,120,0.25)',
                color: 'rgba(80,200,120,0.7)',
                fontSize: 7.5, letterSpacing: '0.28em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
              }}>Akuisisi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
