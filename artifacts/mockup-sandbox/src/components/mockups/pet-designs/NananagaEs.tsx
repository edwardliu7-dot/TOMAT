// Skin: Nananaga Es — frost ice dragon — LANGKA 20.000 koin
export default function NananagaEs() {
  return (
    <div style={{ minHeight: '100vh', background: '#010508', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes ne-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-10px) rotate(-1deg); }
          60%      { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes ne-wing-l {
          0%,100% { transform: rotate(0deg) scaleX(1);    transform-origin: 100% 60%; }
          40%     { transform: rotate(-18deg) scaleX(1.08); transform-origin: 100% 60%; }
          70%     { transform: rotate(-8deg) scaleX(1.04); transform-origin: 100% 60%; }
        }
        @keyframes ne-wing-r {
          0%,100% { transform: rotate(0deg) scaleX(1);   transform-origin: 0% 60%; }
          40%     { transform: rotate(18deg) scaleX(1.08); transform-origin: 0% 60%; }
          70%     { transform: rotate(8deg) scaleX(1.04); transform-origin: 0% 60%; }
        }
        @keyframes ne-breath {
          0%,100% { opacity: 0.7; transform: scaleX(1) scaleY(1); }
          50%     { opacity: 1;   transform: scaleX(1.2) scaleY(1.12); }
        }
        @keyframes ne-eye {
          0%,100% { filter: drop-shadow(0 0 4px #38BDF8); }
          50%     { filter: drop-shadow(0 0 14px #7DD3FC); }
        }
        @keyframes ne-aura {
          0%,100% { opacity: 0.3; transform: scale(1); }
          50%     { opacity: 0.6; transform: scale(1.06); }
        }
        @keyframes ne-crystal {
          0%,100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
          50%     { opacity: 1;   transform: scale(1.2) rotate(30deg); }
        }
        @keyframes ne-snowflake {
          0%,100% { opacity: 0; transform: translateY(0) rotate(0deg); }
          20%     { opacity: 0.9; }
          80%     { opacity: 0.6; }
          100%    { opacity: 0; transform: translateY(30px) rotate(360deg); }
        }
        .ne-body    { animation: ne-idle 2.6s ease-in-out infinite; transform-origin: center bottom; }
        .ne-wing-l  { animation: ne-wing-l 2.0s ease-in-out infinite; }
        .ne-wing-r  { animation: ne-wing-r 2.0s ease-in-out infinite; }
        .ne-breath  { animation: ne-breath 1.4s ease-in-out infinite; transform-origin: left center; }
        .ne-eye     { animation: ne-eye 1.8s ease-in-out infinite; }
        .ne-aura    { animation: ne-aura 2.2s ease-in-out infinite; }
        .ne-c1 { animation: ne-crystal 2.0s 0.0s ease-in-out infinite; }
        .ne-c2 { animation: ne-crystal 2.4s 0.6s ease-in-out infinite; }
        .ne-c3 { animation: ne-crystal 1.8s 1.2s ease-in-out infinite; }
        .ne-c4 { animation: ne-crystal 2.2s 0.4s ease-in-out infinite; }
        .ne-sf1 { animation: ne-snowflake 3s 0.0s ease-in-out infinite; }
        .ne-sf2 { animation: ne-snowflake 3.5s 1.0s ease-in-out infinite; }
        .ne-sf3 { animation: ne-snowflake 2.8s 1.8s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#010C18,#031828)',
        border: '1.5px solid rgba(56,189,248,0.4)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 90px rgba(56,189,248,0.2), 0 0 40px rgba(125,211,252,0.08), 0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Frost glow */}
        <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', width: 310, height: 200, background: 'radial-gradient(ellipse, rgba(56,189,248,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 280, height: 200, background: 'radial-gradient(circle, rgba(125,211,252,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Falling snowflakes */}
        <div className="ne-sf1" style={{ position: 'absolute', top: 20, left: 40, fontSize: 16, color: '#BAE6FD', opacity: 0 }}>❄</div>
        <div className="ne-sf2" style={{ position: 'absolute', top: 10, left: 180, fontSize: 12, color: '#7DD3FC', opacity: 0 }}>❄</div>
        <div className="ne-sf3" style={{ position: 'absolute', top: 15, left: 270, fontSize: 14, color: '#BAE6FD', opacity: 0 }}>❄</div>

        {/* Langka badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(56,189,248,0.3),rgba(14,165,233,0.18))', border: '1px solid rgba(56,189,248,0.7)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#7DD3FC' }}>❄ LANGKA</div>

        {/* Ice crystal sparks */}
        <div className="ne-c1" style={{ position: 'absolute', top: 46, left: 22, fontSize: 14, color: '#38BDF8' }}>✦</div>
        <div className="ne-c2" style={{ position: 'absolute', top: 72, right: 28, fontSize: 10, color: '#7DD3FC' }}>❄</div>
        <div className="ne-c3" style={{ position: 'absolute', bottom: 112, left: 16, fontSize: 8,  color: '#BAE6FD' }}>✦</div>
        <div className="ne-c4" style={{ position: 'absolute', top: 56, right: 56, fontSize: 12, color: '#38BDF8' }}>❄</div>

        {/* SVG Pet */}
        <div className="ne-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="200" height="195" viewBox="0 0 200 195" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="ne-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#0EA5E9"/>
                <stop offset="50%" stopColor="#0369A1"/>
                <stop offset="100%" stopColor="#082F49"/>
              </radialGradient>
              <radialGradient id="ne-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#E0F7FF"/>
                <stop offset="50%" stopColor="#7DD3FC"/>
                <stop offset="100%" stopColor="#38BDF8"/>
              </radialGradient>
              <radialGradient id="ne-head" cx="38%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#0EA5E9"/>
                <stop offset="55%" stopColor="#075985"/>
                <stop offset="100%" stopColor="#082F49"/>
              </radialGradient>
              <radialGradient id="ne-wing" cx="50%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#082F49"/>
                <stop offset="60%" stopColor="#041C2C"/>
                <stop offset="100%" stopColor="#020C14"/>
              </radialGradient>
              <radialGradient id="ne-breath" cx="5%" cy="50%" r="95%">
                <stop offset="0%"   stopColor="#FFFFFF"/>
                <stop offset="20%"  stopColor="#E0F7FF"/>
                <stop offset="50%"  stopColor="#7DD3FC"/>
                <stop offset="80%"  stopColor="#38BDF8"/>
                <stop offset="100%" stopColor="rgba(2,132,199,0)"/>
              </radialGradient>
              <filter id="ne-glow">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="ne-soft"><feGaussianBlur stdDeviation="2.5"/></filter>
            </defs>

            {/* Ice aura ring */}
            <ellipse cx="100" cy="180" rx="52" ry="11" fill="rgba(56,189,248,0.3)" filter="url(#ne-soft)" className="ne-aura"/>

            {/* Left wing — icy */}
            <g className="ne-wing-l" style={{ transformOrigin: '72px 108px' }}>
              <path d="M 72 108 Q 30 80 18 50 Q 22 68 32 75 Q 18 80 14 100 Q 28 90 38 96 Q 20 115 25 138 Q 42 118 58 120 Z" fill="url(#ne-wing)" stroke="#082F49" strokeWidth="1"/>
              <path d="M 72 108 Q 30 80 18 50" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.55"/>
              <path d="M 72 108 Q 18 100 14 100" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.45"/>
              <path d="M 72 108 Q 24 136 25 138" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.35"/>
              {/* Ice crystals on wing */}
              <text x="28" y="82" fontSize="10" fill="rgba(125,211,252,0.5)">❄</text>
              <text x="20" y="108" fontSize="8" fill="rgba(125,211,252,0.4)">❄</text>
            </g>

            {/* Right wing */}
            <g className="ne-wing-r" style={{ transformOrigin: '128px 108px' }}>
              <path d="M 128 108 Q 170 80 182 50 Q 178 68 168 75 Q 182 80 186 100 Q 172 90 162 96 Q 180 115 175 138 Q 158 118 142 120 Z" fill="url(#ne-wing)" stroke="#082F49" strokeWidth="1"/>
              <path d="M 128 108 Q 170 80 182 50" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.55"/>
              <path d="M 128 108 Q 182 100 186 100" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.45"/>
              <path d="M 128 108 Q 176 136 175 138" stroke="#0EA5E9" strokeWidth="0.9" fill="none" opacity="0.35"/>
              <text x="170" y="82" fontSize="10" fill="rgba(125,211,252,0.5)">❄</text>
              <text x="178" y="108" fontSize="8" fill="rgba(125,211,252,0.4)">❄</text>
            </g>

            {/* Tail */}
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#082F49" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#0369A1" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            <polygon points="148,158 154,166 144,164" fill="#38BDF8" opacity="0.8"/>
            <polygon points="156,150 163,156 153,156" fill="#38BDF8" opacity="0.65"/>

            {/* Body */}
            <ellipse cx="100" cy="142" rx="38" ry="32" fill="url(#ne-body)" stroke="#082F49" strokeWidth="1.4"/>
            <ellipse cx="100" cy="148" rx="22" ry="18" fill="url(#ne-belly)" opacity="0.8"/>
            {/* Ice scale pattern */}
            {[[-12,-10],[-4,-14],[4,-14],[12,-10],[-8,-2],[0,-5],[8,-2]].map(([dx,dy],i)=>(
              <ellipse key={i} cx={100+dx} cy={148+dy} rx="5" ry="3.5" fill="none" stroke="rgba(125,211,252,0.45)" strokeWidth="0.8"/>
            ))}
            {/* Back spines — ice blue */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${112-i%2*4} ${x-4},128 ${x+4},128`} fill="#38BDF8" opacity="0.7"/>
            ))}

            {/* Hind legs */}
            <path d="M 70 162 Q 62 175 58 178"  stroke="#082F49" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 70 162 Q 62 175 58 178"  stroke="#0369A1" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#082F49" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#0369A1" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            {[-8,-4,0,4].map((dx,i) => <line key={i} x1={58+dx} y1="177" x2={55+dx} y2="185" stroke="#082F49" strokeWidth="2" strokeLinecap="round"/>)}
            {[-4,0,4,8].map((dx,i) => <line key={i} x1={142+dx} y1="177" x2={139+dx} y2="185" stroke="#082F49" strokeWidth="2" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="100" cy="82" rx="36" ry="32" fill="url(#ne-head)" stroke="#082F49" strokeWidth="1.6"/>

            {/* Horns — crystal blue */}
            <path d="M 82 55 Q 76 34 80 26" stroke="#082F49" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 82 55 Q 76 34 80 26" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#082F49" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="80"  cy="26" r="4" fill="#E0F7FF" filter="url(#ne-glow)"/>
            <circle cx="120" cy="26" r="4" fill="#E0F7FF" filter="url(#ne-glow)"/>

            {/* Head spine ridge — ice crystals */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${54-i%2*3} ${x-3},65 ${x+3},65`} fill="#38BDF8" opacity="0.75"/>
            ))}

            {/* Eyes — arctic cyan glow */}
            <g className="ne-eye">
              <ellipse cx="83" cy="80" rx="12" ry="10" fill="#38BDF8" opacity="0.25"/>
              <circle cx="83" cy="80" r="9"  fill="#082F49"/>
              <ellipse cx="83" cy="80" rx="5" ry="7" fill="#38BDF8"/>
              <ellipse cx="83" cy="80" rx="2" ry="4" fill="#0EA5E9"/>
              <circle cx="86" cy="77" r="2" fill="white" opacity="0.8"/>
            </g>
            <g className="ne-eye">
              <ellipse cx="117" cy="80" rx="12" ry="10" fill="#38BDF8" opacity="0.25"/>
              <circle cx="117" cy="80" r="9"  fill="#082F49"/>
              <ellipse cx="117" cy="80" rx="5" ry="7" fill="#38BDF8"/>
              <ellipse cx="117" cy="80" rx="2" ry="4" fill="#0EA5E9"/>
              <circle cx="120" cy="77" r="2" fill="white" opacity="0.8"/>
            </g>

            {/* Snout */}
            <ellipse cx="100" cy="96" rx="18" ry="10" fill="#075985" stroke="#082F49" strokeWidth="1"/>
            <ellipse cx="94"  cy="95" rx="3" ry="2" fill="#041C2C"/>
            <ellipse cx="106" cy="95" rx="3" ry="2" fill="#041C2C"/>

            {/* Teeth — ice shards */}
            <path d="M 84 103 Q 100 112 116 103" stroke="#082F49" strokeWidth="1.5" fill="none"/>
            {[90,96,100,104,110].map((x,i)=>(
              <polygon key={i} points={`${x},103 ${x-2.5},110 ${x+2.5},110`} fill="#E0F7FF" opacity="0.95"/>
            ))}

            {/* Ice breath */}
            <g className="ne-breath" style={{ transformOrigin: '84px 103px' }}>
              <ellipse cx="52" cy="105" rx="32" ry="10" fill="url(#ne-breath)" filter="url(#ne-glow)"/>
              <ellipse cx="48" cy="102" rx="20" ry="6"  fill="rgba(224,247,255,0.6)"/>
              <ellipse cx="54" cy="109" rx="24" ry="5"  fill="rgba(56,189,248,0.45)"/>
              {/* Ice crystal shards in breath */}
              <text x="26" y="108" fontSize="10" fill="rgba(186,230,253,0.7)">❄</text>
              <text x="38" y="99"  fontSize="8"  fill="rgba(186,230,253,0.5)">❄</text>
            </g>

            {/* Frost halo */}
            <ellipse cx="100" cy="50" rx="38" ry="8" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="1.5" strokeDasharray="3 2"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#7DD3FC', letterSpacing: '0.18em', marginBottom: 4 }}>❄ LANGKA</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Nananaga Es</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Naga es dari puncak gunung beku. Nafasnya membekukan segalanya, matanya biru seperti samudra arktik.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0284C7,#075985)', color: '#E0F7FF', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 28px rgba(2,132,199,0.55), 0 0 40px rgba(56,189,248,0.2)' }}>
          🪙 Beli — 20.000 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Nananaga · Skin 3</div>
        </div>
      </div>
    </div>
  )
}
