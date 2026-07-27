// Skin: Monyong Kosmik — galaxy cosmic monkey — EPIC 10.000 koin
export default function MonyongKosmik() {
  return (
    <div style={{ minHeight: '100vh', background: '#020308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes mk-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30%      { transform: translateY(-8px) rotate(-1.5deg); }
          65%      { transform: translateY(-4px) rotate(1deg); }
        }
        @keyframes mk-tail {
          0%,100% { transform: rotate(-20deg); transform-origin: 0% 0%; }
          50%     { transform: rotate(20deg);  transform-origin: 0% 0%; }
        }
        @keyframes mk-star {
          0%,100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50%     { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        @keyframes mk-nebula {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%     { opacity: 0.65; transform: scale(1.06); }
        }
        @keyframes mk-eye-glow {
          0%,100% { filter: drop-shadow(0 0 4px #A855F7); }
          50%     { filter: drop-shadow(0 0 12px #C084FC); }
        }
        @keyframes mk-ear-l {
          0%,88%,100% { transform: rotate(0deg);  transform-origin: 100% 60%; }
          92% { transform: rotate(-6deg); transform-origin: 100% 60%; }
        }
        @keyframes mk-ear-r {
          0%,82%,100% { transform: rotate(0deg); transform-origin: 0% 60%; }
          86% { transform: rotate(6deg); transform-origin: 0% 60%; }
        }
        .mk-body      { animation: mk-idle 2.1s ease-in-out infinite; transform-origin: center bottom; }
        .mk-tail      { animation: mk-tail 1.8s ease-in-out infinite; }
        .mk-nebula    { animation: mk-nebula 3s ease-in-out infinite; }
        .mk-eye-glow  { animation: mk-eye-glow 1.8s ease-in-out infinite; }
        .mk-ear-l     { animation: mk-ear-l 5s ease-in-out infinite; }
        .mk-ear-r     { animation: mk-ear-r 4.5s ease-in-out infinite; }
        .mk-s1 { animation: mk-star 2.0s 0.0s ease-in-out infinite; }
        .mk-s2 { animation: mk-star 2.4s 0.6s ease-in-out infinite; }
        .mk-s3 { animation: mk-star 1.8s 1.2s ease-in-out infinite; }
        .mk-s4 { animation: mk-star 2.2s 0.4s ease-in-out infinite; }
        .mk-s5 { animation: mk-star 1.9s 0.9s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#06030F,#0E0520)',
        border: '1.5px solid rgba(168,85,247,0.4)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 80px rgba(168,85,247,0.18), 0 0 40px rgba(99,102,241,0.08), 0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Nebula background */}
        <div className="mk-nebula" style={{ position: 'absolute', top: -40, left: -30, width: 220, height: 200, background: 'radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.1) 50%, transparent 75%)', pointerEvents: 'none', borderRadius: '50%' }} />
        <div className="mk-nebula" style={{ position: 'absolute', bottom: -20, right: -20, width: 200, height: 180, background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)', pointerEvents: 'none', borderRadius: '50%' }} />

        {/* Cosmic stars background */}
        {[[20,30],[290,50],[50,170],[310,140],[160,260],[35,290],[300,275],[140,40],[270,200]].map(([x,y],i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: i%3===0?3:2, height: i%3===0?3:2, borderRadius: '50%', background: i%2===0?'#C084FC':'#93C5FD', opacity: 0.5 }}/>
        ))}

        {/* Epic badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(168,85,247,0.35),rgba(99,102,241,0.2))', border: '1px solid rgba(168,85,247,0.65)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#C084FC' }}>🌌 KOSMIK</div>

        {/* Sparkles */}
        <div className="mk-s1" style={{ position: 'absolute', top: 45, left: 22, fontSize: 14, color: '#A855F7' }}>✦</div>
        <div className="mk-s2" style={{ position: 'absolute', top: 75, right: 30, fontSize: 10, color: '#818CF8' }}>✦</div>
        <div className="mk-s3" style={{ position: 'absolute', bottom: 115, left: 18, fontSize: 8,  color: '#C084FC' }}>★</div>
        <div className="mk-s4" style={{ position: 'absolute', top: 58, right: 55, fontSize: 12, color: '#7C3AED' }}>✦</div>
        <div className="mk-s5" style={{ position: 'absolute', bottom: 140, right: 22, fontSize: 9, color: '#93C5FD' }}>★</div>

        {/* SVG Pet */}
        <div className="mk-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="170" height="190" viewBox="0 0 170 190" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="mkk-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="45%" stopColor="#5B21B6"/>
                <stop offset="100%" stopColor="#2E1065"/>
              </radialGradient>
              <radialGradient id="mkk-face" cx="45%" cy="40%" r="58%">
                <stop offset="0%" stopColor="#A78BFA"/>
                <stop offset="60%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#4C1D95"/>
              </radialGradient>
              <radialGradient id="mkk-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#DDD6FE"/>
                <stop offset="100%" stopColor="#A78BFA"/>
              </radialGradient>
              <radialGradient id="mkk-eye" cx="30%" cy="28%" r="65%">
                <stop offset="0%" stopColor="#A855F7"/>
                <stop offset="50%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#2E1065"/>
              </radialGradient>
              <filter id="mkk-soft"><feGaussianBlur stdDeviation="2"/></filter>
              <filter id="mkk-glow">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Cosmic aura glow */}
            <ellipse cx="85" cy="175" rx="48" ry="10" fill="rgba(168,85,247,0.3)" filter="url(#mkk-soft)"/>

            {/* Tail */}
            <g className="mk-tail" style={{ transformOrigin: '48px 140px' }}>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#2E1065" strokeWidth="9" strokeLinecap="round"/>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#5B21B6" strokeWidth="6" strokeLinecap="round"/>
              {/* Stardust on tail tip */}
              <circle cx="15" cy="140" r="5" fill="#C084FC" opacity="0.8" filter="url(#mkk-glow)"/>
            </g>

            {/* Body */}
            <ellipse cx="85" cy="140" rx="36" ry="30" fill="url(#mkk-body)" stroke="#2E1065" strokeWidth="1.2"/>
            <ellipse cx="85" cy="146" rx="20" ry="16" fill="url(#mkk-belly)" opacity="0.7"/>
            {/* Cosmic swirls on body */}
            <path d="M 72 135 Q 85 128 98 135" stroke="rgba(192,132,252,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M 75 144 Q 85 140 95 144" stroke="rgba(192,132,252,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <circle cx="78" cy="131" r="1.5" fill="#C084FC" opacity="0.6"/>
            <circle cx="92" cy="129" r="1" fill="#93C5FD" opacity="0.6"/>
            <circle cx="86" cy="152" r="1.5" fill="#C084FC" opacity="0.5"/>

            {/* Legs */}
            <ellipse cx="70" cy="166" rx="11" ry="8" fill="#5B21B6" stroke="#2E1065" strokeWidth="1"/>
            <ellipse cx="100" cy="168" rx="11" ry="8" fill="#5B21B6" stroke="#2E1065" strokeWidth="1"/>
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={70+dx} cy={173} rx={2.5} ry={3} fill="#2E1065"/>)}
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={100+dx} cy={175} rx={2.5} ry={3} fill="#2E1065"/>)}

            {/* Arms */}
            <path d="M 52 132 Q 40 148 45 158" stroke="#2E1065" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 52 132 Q 40 148 45 158" stroke="#5B21B6" strokeWidth="7"  strokeLinecap="round" fill="none"/>
            <ellipse cx="44" cy="160" rx="8" ry="6" fill="#2E1065"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#2E1065" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#5B21B6" strokeWidth="7"  strokeLinecap="round" fill="none"/>
            <ellipse cx="126" cy="160" rx="8" ry="6" fill="#2E1065"/>

            {/* Head */}
            <ellipse cx="85" cy="88" rx="36" ry="34" fill="url(#mkk-body)" stroke="#2E1065" strokeWidth="1.4"/>

            {/* Left ear */}
            <g className="mk-ear-l" style={{ transformOrigin: '52px 88px' }}>
              <circle cx="50" cy="84" r="14" fill="#5B21B6" stroke="#2E1065" strokeWidth="1.2"/>
              <circle cx="50" cy="84" r="9"  fill="url(#mkk-face)"/>
            </g>
            {/* Right ear */}
            <g className="mk-ear-r" style={{ transformOrigin: '120px 88px' }}>
              <circle cx="120" cy="84" r="14" fill="#5B21B6" stroke="#2E1065" strokeWidth="1.2"/>
              <circle cx="120" cy="84" r="9"  fill="url(#mkk-face)"/>
            </g>

            {/* Face oval */}
            <ellipse cx="85" cy="94" rx="26" ry="22" fill="url(#mkk-face)"/>

            {/* Eyes — glowing cosmic purple */}
            <g className="mk-eye-glow">
              <ellipse cx="74" cy="84" rx="10" ry="10" fill="rgba(168,85,247,0.25)" filter="url(#mkk-soft)"/>
              <circle cx="74" cy="84" r="9" fill="white"/>
              <circle cx="75" cy="85" r="6.5" fill="url(#mkk-eye)"/>
              <circle cx="77" cy="82" r="2.5" fill="white" opacity="0.95"/>
              <circle cx="76" cy="87" r="1" fill="white" opacity="0.4"/>
            </g>
            <g className="mk-eye-glow">
              <ellipse cx="96" cy="84" rx="10" ry="10" fill="rgba(168,85,247,0.25)" filter="url(#mkk-soft)"/>
              <circle cx="96" cy="84" r="9" fill="white"/>
              <circle cx="97" cy="85" r="6.5" fill="url(#mkk-eye)"/>
              <circle cx="99" cy="82" r="2.5" fill="white" opacity="0.95"/>
              <circle cx="98" cy="87" r="1" fill="white" opacity="0.4"/>
            </g>
            {/* Cosmic eyebrows */}
            <path d="M 68 76 Q 74 72 80 76" stroke="#A78BFA" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 90 76 Q 96 72 102 76" stroke="#A78BFA" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <ellipse cx="85" cy="99" rx="5" ry="3.5" fill="#2E1065"/>
            {/* Happy galaxy grin */}
            <path d="M 75 104 Q 85 112 95 104" stroke="#2E1065" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M 78 107 Q 85 114 92 107" fill="#A78BFA" stroke="none" opacity="0.5"/>
            <rect x="81" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="85.5" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>

            {/* Cosmic cheeks */}
            <ellipse cx="62"  cy="94" rx="9" ry="6" fill="#7C3AED" opacity="0.4"/>
            <ellipse cx="108" cy="94" rx="9" ry="6" fill="#7C3AED" opacity="0.4"/>

            {/* Galaxy halo */}
            <ellipse cx="85" cy="55" rx="36" ry="8" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="1.5" strokeDasharray="3 2"/>

            {/* Constellation dots */}
            <circle cx="55" cy="60" r="1.5" fill="#C084FC" opacity="0.7"/>
            <circle cx="62" cy="52" r="1" fill="#93C5FD" opacity="0.6"/>
            <circle cx="70" cy="58" r="1.2" fill="#C084FC" opacity="0.65"/>
            <line x1="55" y1="60" x2="62" y2="52" stroke="#A78BFA" strokeWidth="0.6" opacity="0.4"/>
            <line x1="62" y1="52" x2="70" y2="58" stroke="#A78BFA" strokeWidth="0.6" opacity="0.4"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#C084FC', letterSpacing: '0.18em', marginBottom: 4 }}>🌌 KOSMIK</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Monyong Kosmik</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Lahir di galaksi jauh. Bulunya menyimpan bintang-bintang, matanya memancarkan cahaya nebula.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(124,58,237,0.55)' }}>
          🪙 Beli — 10.000 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C084FC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818CF8' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Monyong · Skin 3</div>
        </div>
      </div>
    </div>
  )
}
