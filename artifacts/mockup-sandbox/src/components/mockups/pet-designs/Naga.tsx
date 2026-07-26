// Pet Design: Naga (Dragon) — Langka — 15.000 koin
export default function Naga() {
  return (
    <div style={{ minHeight: '100vh', background: '#070D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes dragon-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-10px) rotate(-1deg); }
          60%      { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes wing-flap-l {
          0%,100% { transform: rotate(0deg) scaleX(1); transform-origin: 100% 60%; }
          40% { transform: rotate(-18deg) scaleX(1.08); transform-origin: 100% 60%; }
          70% { transform: rotate(-8deg) scaleX(1.04); transform-origin: 100% 60%; }
        }
        @keyframes wing-flap-r {
          0%,100% { transform: rotate(0deg) scaleX(1); transform-origin: 0% 60%; }
          40% { transform: rotate(18deg) scaleX(1.08); transform-origin: 0% 60%; }
          70% { transform: rotate(8deg) scaleX(1.04); transform-origin: 0% 60%; }
        }
        @keyframes fire-pulse {
          0%,100% { opacity: 0.7; transform: scaleX(1) scaleY(1); }
          50% { opacity: 1; transform: scaleX(1.15) scaleY(1.1); }
        }
        @keyframes eye-glow {
          0%,100% { filter: drop-shadow(0 0 3px #FF6B00); }
          50% { filter: drop-shadow(0 0 8px #FF6B00); }
        }
        @keyframes aura {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes tail-wave {
          0%,100% { d: path("M 115 148 Q 135 162 145 155 Q 158 148 152 138 Q 148 132 140 136"); }
          50% { d: path("M 115 148 Q 138 168 148 160 Q 162 152 156 140 Q 152 134 144 138"); }
        }
        @keyframes sparkle-rare {
          0%,100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(180deg); }
        }
        .dragon-body { animation: dragon-idle 2.6s ease-in-out infinite; transform-origin: center bottom; }
        .wing-left  { animation: wing-flap-l 1.8s ease-in-out infinite; }
        .wing-right { animation: wing-flap-r 1.8s ease-in-out infinite; }
        .fire       { animation: fire-pulse 1.2s ease-in-out infinite; transform-origin: left center; }
        .eye-glow   { animation: eye-glow 1.5s ease-in-out infinite; }
        .aura-ring  { animation: aura 2s ease-in-out infinite; }
        .sr1 { animation: sparkle-rare 2s 0s ease-in-out infinite; }
        .sr2 { animation: sparkle-rare 2s 0.6s ease-in-out infinite; }
        .sr3 { animation: sparkle-rare 2s 1.2s ease-in-out infinite; }
        .sr4 { animation: sparkle-rare 2s 0.4s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#0a0f24,#130a1e)',
        border: '1.5px solid rgba(251,146,60,0.4)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 80px rgba(251,146,60,0.15), 0 0 30px rgba(239,68,68,0.1), 0 20px 60px rgba(0,0,0,0.7)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background fire glow */}
        <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 260, height: 200, background: 'radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Langka badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(251,146,60,0.3),rgba(239,68,68,0.2))', border: '1px solid rgba(251,146,60,0.7)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#FB923C' }}>◆ LANGKA</div>

        {/* Sparkles */}
        <div className="sr1" style={{ position: 'absolute', top: 45, left: 22, color: '#FB923C', fontSize: 14 }}>✦</div>
        <div className="sr2" style={{ position: 'absolute', top: 80, right: 28, color: '#F87171', fontSize: 10 }}>✦</div>
        <div className="sr3" style={{ position: 'absolute', bottom: 110, left: 18, color: '#FB923C', fontSize: 8 }}>✦</div>
        <div className="sr4" style={{ position: 'absolute', top: 60, right: 55, color: '#FBBF24', fontSize: 12 }}>★</div>

        {/* SVG Pet */}
        <div className="dragon-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="200" height="195" viewBox="0 0 200 195" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="dr-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#1E6B4A"/>
                <stop offset="50%" stopColor="#155235"/>
                <stop offset="100%" stopColor="#0A3322"/>
              </radialGradient>
              <radialGradient id="dr-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#3CB878"/>
                <stop offset="60%" stopColor="#28A060"/>
                <stop offset="100%" stopColor="#1E7A48"/>
              </radialGradient>
              <radialGradient id="dr-head" cx="38%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#1E6B4A"/>
                <stop offset="55%" stopColor="#0F4A30"/>
                <stop offset="100%" stopColor="#072018"/>
              </radialGradient>
              <radialGradient id="dr-wing-l" cx="80%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#1A2A1A"/>
                <stop offset="60%" stopColor="#0D1A0D"/>
                <stop offset="100%" stopColor="#050D05"/>
              </radialGradient>
              <radialGradient id="dr-wing-r" cx="20%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#1A2A1A"/>
                <stop offset="60%" stopColor="#0D1A0D"/>
                <stop offset="100%" stopColor="#050D05"/>
              </radialGradient>
              <radialGradient id="dr-fire" cx="5%" cy="50%" r="95%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="20%" stopColor="#FBBF24"/>
                <stop offset="55%" stopColor="#F97316"/>
                <stop offset="100%" stopColor="rgba(239,68,68,0)"/>
              </radialGradient>
              <filter id="dr-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="dr-blur-soft">
                <feGaussianBlur stdDeviation="2"/>
              </filter>
            </defs>

            {/* Aura ring */}
            <ellipse cx="100" cy="180" rx="50" ry="10" fill="rgba(251,146,60,0.25)" filter="url(#dr-blur-soft)" className="aura-ring"/>

            {/* Left wing */}
            <g className="wing-left" style={{ transformOrigin: '72px 108px' }}>
              <path d="M 72 108 Q 30 80 18 50 Q 22 68 32 75 Q 18 80 14 100 Q 28 90 38 96 Q 20 115 25 138 Q 42 118 58 120 Z" fill="url(#dr-wing-l)" stroke="#1E3A1E" strokeWidth="1"/>
              {/* Wing membrane lines */}
              <path d="M 72 108 Q 30 80 18 50" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 72 108 Q 18 100 14 100" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.5"/>
              <path d="M 72 108 Q 24 136 25 138" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.4"/>
            </g>

            {/* Right wing */}
            <g className="wing-right" style={{ transformOrigin: '128px 108px' }}>
              <path d="M 128 108 Q 170 80 182 50 Q 178 68 168 75 Q 182 80 186 100 Q 172 90 162 96 Q 180 115 175 138 Q 158 118 142 120 Z" fill="url(#dr-wing-r)" stroke="#1E3A1E" strokeWidth="1"/>
              <path d="M 128 108 Q 170 80 182 50" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.6"/>
              <path d="M 128 108 Q 182 100 186 100" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.5"/>
              <path d="M 128 108 Q 176 136 175 138" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.4"/>
            </g>

            {/* Tail */}
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#0A3322" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#155235" strokeWidth="8" strokeLinecap="round" fill="none"/>
            {/* Tail spikes */}
            <polygon points="148,158 152,165 144,163" fill="#0F8A45" opacity="0.7"/>
            <polygon points="155,150 161,155 153,155" fill="#0F8A45" opacity="0.6"/>

            {/* Body */}
            <ellipse cx="100" cy="142" rx="38" ry="32" fill="url(#dr-body)" stroke="#0A3322" strokeWidth="1.4"/>
            {/* Belly scales */}
            <ellipse cx="100" cy="148" rx="22" ry="18" fill="url(#dr-belly)" opacity="0.8"/>
            {/* Scale pattern */}
            {[[-12,-10],[-4,-14],[4,-14],[12,-10],[-8,-2],[0,-5],[8,-2]].map(([dx,dy],i)=>(
              <ellipse key={i} cx={100+dx} cy={148+dy} rx="5" ry="3.5" fill="none" stroke="rgba(60,184,120,0.4)" strokeWidth="0.8"/>
            ))}

            {/* Hind legs */}
            <path d="M 70 162 Q 62 175 58 178" stroke="#0A3322" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 70 162 Q 62 175 58 178" stroke="#155235" strokeWidth="8" strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#0A3322" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#155235" strokeWidth="8" strokeLinecap="round" fill="none"/>
            {/* Claws */}
            {[-8,-4,0,4].map((dx,i) => <line key={i} x1={58+dx} y1="177" x2={55+dx} y2="185" stroke="#0A3322" strokeWidth="2" strokeLinecap="round"/>)}
            {[-4,0,4,8].map((dx,i) => <line key={i} x1={142+dx} y1="177" x2={139+dx} y2="185" stroke="#0A3322" strokeWidth="2" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="100" cy="82" rx="36" ry="32" fill="url(#dr-head)" stroke="#0A3322" strokeWidth="1.6"/>

            {/* Horns */}
            <path d="M 82 55 Q 76 34 80 26" stroke="#0A3322" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 82 55 Q 76 34 80 26" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#0A3322" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            {/* Horn tips */}
            <circle cx="80" cy="26" r="3" fill="#FBBF24"/>
            <circle cx="120" cy="26" r="3" fill="#FBBF24"/>

            {/* Head spine ridge */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${54-i%2*3} ${x-3},65 ${x+3},65`} fill="#0F8A45" opacity="0.7"/>
            ))}

            {/* Eyes */}
            <g className="eye-glow">
              <ellipse cx="83" cy="80" rx="11" ry="9" fill="#FF6B00" opacity="0.3"/>
              <circle cx="83" cy="80" r="9" fill="#1A2A10"/>
              <ellipse cx="83" cy="80" rx="5" ry="7" fill="#FF6B00"/>
              <ellipse cx="83" cy="80" rx="2" ry="4" fill="#8B0000"/>
              <circle cx="86" cy="77" r="2" fill="white" opacity="0.7"/>
            </g>
            <g className="eye-glow">
              <ellipse cx="117" cy="80" rx="11" ry="9" fill="#FF6B00" opacity="0.3"/>
              <circle cx="117" cy="80" r="9" fill="#1A2A10"/>
              <ellipse cx="117" cy="80" rx="5" ry="7" fill="#FF6B00"/>
              <ellipse cx="117" cy="80" rx="2" ry="4" fill="#8B0000"/>
              <circle cx="120" cy="77" r="2" fill="white" opacity="0.7"/>
            </g>

            {/* Snout */}
            <path d="M 86 96 Q 100 106 114 96 L 118 90 Q 100 98 82 90 Z" fill="#0A3322"/>
            <ellipse cx="100" cy="96" rx="18" ry="10" fill="#0F4A30" stroke="#0A3322" strokeWidth="1"/>
            {/* Nostrils */}
            <ellipse cx="94" cy="95" rx="3" ry="2" fill="#072018"/>
            <ellipse cx="106" cy="95" rx="3" ry="2" fill="#072018"/>

            {/* Teeth */}
            <path d="M 84 103 Q 100 112 116 103" stroke="#0A3322" strokeWidth="1.5" fill="none"/>
            {[90,96,100,104,110].map((x,i)=>(
              <polygon key={i} points={`${x},103 ${x-2.5},109 ${x+2.5},109`} fill="white" opacity="0.9"/>
            ))}

            {/* Fire breath */}
            <g className="fire" style={{ transformOrigin: '84px 103px' }}>
              <ellipse cx="58" cy="105" rx="26" ry="8" fill="url(#dr-fire)" filter="url(#dr-glow)"/>
              <ellipse cx="55" cy="103" rx="18" ry="5" fill="rgba(255,255,200,0.5)"/>
              <ellipse cx="60" cy="108" rx="20" ry="4" fill="rgba(249,115,22,0.4)"/>
            </g>

            {/* Body back spines */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${112-i%2*4} ${x-4},128 ${x+4},128`} fill="#0F8A45" opacity="0.65"/>
            ))}
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FB923C', letterSpacing: '0.18em', marginBottom: 4 }}>◆ LANGKA</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Naga Abadi</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Makhluk legenda yang hanya muncul di leaderboard puncak. Matanya menyala, sayapnya menggelegar. Pet paling langka!</div>
        </div>

        {/* Price button */}
        <button style={{
          width: '100%', padding: '13px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
          color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
          boxShadow: '0 4px 24px rgba(220,38,38,0.45), 0 0 40px rgba(251,146,60,0.2)',
        }}>
          🪙 Beli — 15.000 koin
        </button>

        {/* Tier dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FB923C' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>3 dari 3 tier</div>
        </div>
      </div>
    </div>
  )
}
