// Skin: Nananaga Merah — crimson fire dragon — LANGKA 18.000 koin
export default function NananagaMerah() {
  return (
    <div style={{ minHeight: '100vh', background: '#080100', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes nm-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-10px) rotate(-1deg); }
          60%      { transform: translateY(-5px) rotate(1deg); }
        }
        @keyframes nm-wing-l {
          0%,100% { transform: rotate(0deg) scaleX(1);    transform-origin: 100% 60%; }
          40%     { transform: rotate(-20deg) scaleX(1.1); transform-origin: 100% 60%; }
          70%     { transform: rotate(-9deg) scaleX(1.04); transform-origin: 100% 60%; }
        }
        @keyframes nm-wing-r {
          0%,100% { transform: rotate(0deg) scaleX(1);   transform-origin: 0% 60%; }
          40%     { transform: rotate(20deg) scaleX(1.1); transform-origin: 0% 60%; }
          70%     { transform: rotate(9deg) scaleX(1.04); transform-origin: 0% 60%; }
        }
        @keyframes nm-fire {
          0%,100% { opacity: 0.75; transform: scaleX(1) scaleY(1); }
          50%     { opacity: 1;   transform: scaleX(1.25) scaleY(1.15); }
        }
        @keyframes nm-eye {
          0%,100% { filter: drop-shadow(0 0 4px #FF2200); }
          50%     { filter: drop-shadow(0 0 14px #FF4400); }
        }
        @keyframes nm-aura {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%     { opacity: 0.7;  transform: scale(1.06); }
        }
        @keyframes nm-spark {
          0%,100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
          50%     { opacity: 1; transform: scale(1.4) rotate(180deg); }
        }
        .nm-body   { animation: nm-idle 2.4s ease-in-out infinite; transform-origin: center bottom; }
        .nm-wing-l { animation: nm-wing-l 1.6s ease-in-out infinite; }
        .nm-wing-r { animation: nm-wing-r 1.6s ease-in-out infinite; }
        .nm-fire   { animation: nm-fire 1.0s ease-in-out infinite; transform-origin: left center; }
        .nm-eye    { animation: nm-eye 1.3s ease-in-out infinite; }
        .nm-aura   { animation: nm-aura 2s ease-in-out infinite; }
        .nm-sp1 { animation: nm-spark 1.8s 0.0s ease-in-out infinite; }
        .nm-sp2 { animation: nm-spark 2.0s 0.5s ease-in-out infinite; }
        .nm-sp3 { animation: nm-spark 1.6s 1.0s ease-in-out infinite; }
        .nm-sp4 { animation: nm-spark 1.9s 0.3s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#0F0100,#1E0200)',
        border: '1.5px solid rgba(220,38,38,0.5)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 90px rgba(220,38,38,0.2), 0 0 40px rgba(251,146,60,0.12), 0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Crimson fire glow */}
        <div style={{ position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)', width: 320, height: 200, background: 'radial-gradient(ellipse, rgba(220,38,38,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 280, height: 200, background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Langka badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(220,38,38,0.35),rgba(185,28,28,0.2))', border: '1px solid rgba(220,38,38,0.75)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#FCA5A5' }}>◆ LANGKA</div>

        {/* Fire sparks */}
        <div className="nm-sp1" style={{ position: 'absolute', top: 44, left: 20, fontSize: 14, color: '#EF4444' }}>✦</div>
        <div className="nm-sp2" style={{ position: 'absolute', top: 78, right: 26, fontSize: 10, color: '#F97316' }}>✦</div>
        <div className="nm-sp3" style={{ position: 'absolute', bottom: 112, left: 16, fontSize: 8,  color: '#EF4444' }}>★</div>
        <div className="nm-sp4" style={{ position: 'absolute', top: 58, right: 54, fontSize: 12, color: '#FBBF24' }}>★</div>

        {/* SVG Pet */}
        <div className="nm-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="200" height="195" viewBox="0 0 200 195" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="nm-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#991B1B"/>
                <stop offset="50%" stopColor="#7F1D1D"/>
                <stop offset="100%" stopColor="#450A0A"/>
              </radialGradient>
              <radialGradient id="nm-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#F97316"/>
                <stop offset="60%" stopColor="#DC2626"/>
                <stop offset="100%" stopColor="#991B1B"/>
              </radialGradient>
              <radialGradient id="nm-head" cx="38%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#991B1B"/>
                <stop offset="55%" stopColor="#6B0000"/>
                <stop offset="100%" stopColor="#2D0000"/>
              </radialGradient>
              <radialGradient id="nm-wing" cx="50%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#2D0000"/>
                <stop offset="60%" stopColor="#1A0000"/>
                <stop offset="100%" stopColor="#0A0000"/>
              </radialGradient>
              <radialGradient id="nm-fire" cx="5%" cy="50%" r="95%">
                <stop offset="0%"   stopColor="#FFFFFF"/>
                <stop offset="15%"  stopColor="#FDE68A"/>
                <stop offset="40%"  stopColor="#F97316"/>
                <stop offset="75%"  stopColor="#DC2626"/>
                <stop offset="100%" stopColor="rgba(185,28,28,0)"/>
              </radialGradient>
              <filter id="nm-glow">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="nm-soft"><feGaussianBlur stdDeviation="2"/></filter>
            </defs>

            {/* Aura ring */}
            <ellipse cx="100" cy="180" rx="52" ry="11" fill="rgba(220,38,38,0.35)" filter="url(#nm-soft)" className="nm-aura"/>

            {/* Left wing */}
            <g className="nm-wing-l" style={{ transformOrigin: '72px 108px' }}>
              <path d="M 72 108 Q 30 80 18 50 Q 22 68 32 75 Q 18 80 14 100 Q 28 90 38 96 Q 20 115 25 138 Q 42 118 58 120 Z" fill="url(#nm-wing)" stroke="#2D0000" strokeWidth="1"/>
              <path d="M 72 108 Q 30 80 18 50" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.6"/>
              <path d="M 72 108 Q 18 100 14 100" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.5"/>
              <path d="M 72 108 Q 24 136 25 138" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.4"/>
            </g>

            {/* Right wing */}
            <g className="nm-wing-r" style={{ transformOrigin: '128px 108px' }}>
              <path d="M 128 108 Q 170 80 182 50 Q 178 68 168 75 Q 182 80 186 100 Q 172 90 162 96 Q 180 115 175 138 Q 158 118 142 120 Z" fill="url(#nm-wing)" stroke="#2D0000" strokeWidth="1"/>
              <path d="M 128 108 Q 170 80 182 50" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.6"/>
              <path d="M 128 108 Q 182 100 186 100" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.5"/>
              <path d="M 128 108 Q 176 136 175 138" stroke="#6B0000" strokeWidth="0.9" fill="none" opacity="0.4"/>
            </g>

            {/* Tail */}
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#2D0000" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136" stroke="#7F1D1D" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            <polygon points="148,158 154,166 144,164" fill="#DC2626" opacity="0.8"/>
            <polygon points="156,150 163,156 153,156" fill="#DC2626" opacity="0.65"/>

            {/* Body */}
            <ellipse cx="100" cy="142" rx="38" ry="32" fill="url(#nm-body)" stroke="#2D0000" strokeWidth="1.4"/>
            <ellipse cx="100" cy="148" rx="22" ry="18" fill="url(#nm-belly)" opacity="0.75"/>
            {/* Crimson scale pattern */}
            {[[-12,-10],[-4,-14],[4,-14],[12,-10],[-8,-2],[0,-5],[8,-2]].map(([dx,dy],i)=>(
              <ellipse key={i} cx={100+dx} cy={148+dy} rx="5" ry="3.5" fill="none" stroke="rgba(239,68,68,0.45)" strokeWidth="0.8"/>
            ))}
            {/* Back spines — crimson */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${112-i%2*4} ${x-4},128 ${x+4},128`} fill="#DC2626" opacity="0.7"/>
            ))}

            {/* Hind legs */}
            <path d="M 70 162 Q 62 175 58 178"  stroke="#2D0000" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 70 162 Q 62 175 58 178"  stroke="#7F1D1D" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#2D0000" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M 130 162 Q 138 175 142 178" stroke="#7F1D1D" strokeWidth="8"  strokeLinecap="round" fill="none"/>
            {[-8,-4,0,4].map((dx,i) => <line key={i} x1={58+dx} y1="177" x2={55+dx} y2="185" stroke="#2D0000" strokeWidth="2" strokeLinecap="round"/>)}
            {[-4,0,4,8].map((dx,i) => <line key={i} x1={142+dx} y1="177" x2={139+dx} y2="185" stroke="#2D0000" strokeWidth="2" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="100" cy="82" rx="36" ry="32" fill="url(#nm-head)" stroke="#2D0000" strokeWidth="1.6"/>

            {/* Horns — blood red tips */}
            <path d="M 82 55 Q 76 34 80 26" stroke="#2D0000" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 82 55 Q 76 34 80 26" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#2D0000" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M 118 55 Q 124 34 120 26" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="80"  cy="26" r="3.5" fill="#FCA5A5" filter="url(#nm-glow)"/>
            <circle cx="120" cy="26" r="3.5" fill="#FCA5A5" filter="url(#nm-glow)"/>

            {/* Head spine ridge */}
            {[88,94,100,106,112].map((x,i) => (
              <polygon key={i} points={`${x},${54-i%2*3} ${x-3},65 ${x+3},65`} fill="#DC2626" opacity="0.75"/>
            ))}

            {/* Eyes — blazing red */}
            <g className="nm-eye">
              <ellipse cx="83" cy="80" rx="12" ry="10" fill="#FF2200" opacity="0.35"/>
              <circle cx="83" cy="80" r="9"  fill="#1A0000"/>
              <ellipse cx="83" cy="80" rx="5" ry="7" fill="#FF2200"/>
              <ellipse cx="83" cy="80" rx="2" ry="4" fill="#8B0000"/>
              <circle cx="86" cy="77" r="2" fill="white" opacity="0.75"/>
            </g>
            <g className="nm-eye">
              <ellipse cx="117" cy="80" rx="12" ry="10" fill="#FF2200" opacity="0.35"/>
              <circle cx="117" cy="80" r="9"  fill="#1A0000"/>
              <ellipse cx="117" cy="80" rx="5" ry="7" fill="#FF2200"/>
              <ellipse cx="117" cy="80" rx="2" ry="4" fill="#8B0000"/>
              <circle cx="120" cy="77" r="2" fill="white" opacity="0.75"/>
            </g>

            {/* Snout */}
            <ellipse cx="100" cy="96" rx="18" ry="10" fill="#450A0A" stroke="#2D0000" strokeWidth="1"/>
            <ellipse cx="94"  cy="95" rx="3" ry="2" fill="#1A0000"/>
            <ellipse cx="106" cy="95" rx="3" ry="2" fill="#1A0000"/>

            {/* Teeth */}
            <path d="M 84 103 Q 100 112 116 103" stroke="#2D0000" strokeWidth="1.5" fill="none"/>
            {[90,96,100,104,110].map((x,i)=>(
              <polygon key={i} points={`${x},103 ${x-2.5},110 ${x+2.5},110`} fill="white" opacity="0.9"/>
            ))}

            {/* MASSIVE fire breath */}
            <g className="nm-fire" style={{ transformOrigin: '84px 103px' }}>
              <ellipse cx="50" cy="105" rx="34" ry="11" fill="url(#nm-fire)" filter="url(#nm-glow)"/>
              <ellipse cx="46" cy="102" rx="22" ry="6"  fill="rgba(255,255,150,0.55)"/>
              <ellipse cx="52" cy="109" rx="26" ry="5"  fill="rgba(249,115,22,0.5)"/>
              <ellipse cx="30" cy="105" rx="12" ry="5"  fill="rgba(239,68,68,0.4)"/>
            </g>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FCA5A5', letterSpacing: '0.18em', marginBottom: 4 }}>◆ LANGKA</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Nananaga Merah</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Naga berdarah api dari gunung berapi purba. Matanya merah menyala, nafasnya menghancurkan segalanya.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#DC2626,#991B1B)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 28px rgba(220,38,38,0.55), 0 0 40px rgba(239,68,68,0.2)' }}>
          🪙 Beli — 18.000 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Nananaga · Skin 2</div>
        </div>
      </div>
    </div>
  )
}
