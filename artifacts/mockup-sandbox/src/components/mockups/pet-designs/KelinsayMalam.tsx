// Skin: Kelinsay Malam — midnight star rabbit — PREMIUM 4.500 koin
export default function KelinsayMalam() {
  return (
    <div style={{ minHeight: '100vh', background: '#03050F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes km-idle {
          0%,100% { transform: translateY(0px); }
          40%      { transform: translateY(-7px); }
          70%      { transform: translateY(-4px); }
        }
        @keyframes km-ear-l {
          0%,85%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          90% { transform: rotate(-8deg); transform-origin: 50% 100%; }
          95% { transform: rotate(5deg); transform-origin: 50% 100%; }
        }
        @keyframes km-ear-r {
          0%,80%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          85% { transform: rotate(8deg); transform-origin: 50% 100%; }
          92% { transform: rotate(-5deg); transform-origin: 50% 100%; }
        }
        @keyframes km-tail { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes km-star {
          0%,100% { opacity: 0.2; transform: scale(0.6); }
          50%     { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes km-glow {
          0%,100% { filter: drop-shadow(0 0 3px #818CF8); }
          50%     { filter: drop-shadow(0 0 10px #818CF8); }
        }
        .km-body  { animation: km-idle 2.4s ease-in-out infinite; transform-origin: center bottom; }
        .km-ear-l { animation: km-ear-l 4s ease-in-out infinite; }
        .km-ear-r { animation: km-ear-r 4.5s ease-in-out infinite; }
        .km-tail  { animation: km-tail 2.4s ease-in-out infinite; }
        .km-s1 { animation: km-star 1.8s 0.0s ease-in-out infinite; }
        .km-s2 { animation: km-star 2.2s 0.5s ease-in-out infinite; }
        .km-s3 { animation: km-star 1.6s 1.0s ease-in-out infinite; }
        .km-s4 { animation: km-star 2.0s 1.5s ease-in-out infinite; }
        .km-s5 { animation: km-star 1.9s 0.8s ease-in-out infinite; }
        .km-eye-glow { animation: km-glow 2s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#06081C,#0C1035)',
        border: '1.5px solid rgba(129,140,248,0.35)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 60px rgba(129,140,248,0.12), 0 20px 60px rgba(0,0,0,0.7)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Night sky glow */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 280, height: 220, background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Stars on background */}
        {[[30,40],[280,60],[60,180],[300,150],[150,220],[40,280],[290,260]].map(([x,y],i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 2, height: 2, borderRadius: '50%', background: '#C7D2FE', opacity: 0.6 }}/>
        ))}

        {/* Tier badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(129,140,248,0.25),rgba(99,102,241,0.15))', border: '1px solid rgba(129,140,248,0.55)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#A5B4FC' }}>✦ PREMIUM</div>

        {/* Floating stars */}
        <div className="km-s1" style={{ position: 'absolute', top: 48, left: 26, fontSize: 12, color: '#C7D2FE' }}>✦</div>
        <div className="km-s2" style={{ position: 'absolute', top: 72, right: 32, fontSize: 9,  color: '#818CF8' }}>★</div>
        <div className="km-s3" style={{ position: 'absolute', bottom: 115, left: 20, fontSize: 8, color: '#C7D2FE' }}>✦</div>
        <div className="km-s4" style={{ position: 'absolute', top: 130, right: 24, fontSize: 7, color: '#A5B4FC' }}>✦</div>
        <div className="km-s5" style={{ position: 'absolute', top: 55, right: 60, fontSize: 11, color: '#E0E7FF' }}>★</div>

        {/* SVG Pet */}
        <div className="km-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="160" height="180" viewBox="0 0 160 180" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="km-body" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#5B6AD0"/>
                <stop offset="55%" stopColor="#3D4EA8"/>
                <stop offset="100%" stopColor="#252E80"/>
              </radialGradient>
              <radialGradient id="km-belly" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#A5B4FC"/>
                <stop offset="100%" stopColor="#818CF8"/>
              </radialGradient>
              <radialGradient id="km-head" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#5B6AD0"/>
                <stop offset="55%" stopColor="#3D4EA8"/>
                <stop offset="100%" stopColor="#252E80"/>
              </radialGradient>
              <radialGradient id="km-ear-in" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#E0E7FF"/>
                <stop offset="100%" stopColor="#C7D2FE"/>
              </radialGradient>
              <filter id="km-blur"><feGaussianBlur stdDeviation="1.4"/></filter>
              <filter id="km-glow-f">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Body */}
            <ellipse cx="80" cy="130" rx="38" ry="32" fill="url(#km-body)" stroke="#3D4EA8" strokeWidth="1.2"/>
            <ellipse cx="80" cy="136" rx="22" ry="18" fill="url(#km-belly)" opacity="0.7"/>

            {/* Star pattern on body */}
            <text x="68" y="127" fontSize="9" fill="rgba(199,210,254,0.5)">✦</text>
            <text x="85" y="138" fontSize="7" fill="rgba(199,210,254,0.4)">★</text>
            <text x="58" y="140" fontSize="6" fill="rgba(199,210,254,0.35)">✦</text>

            {/* Fluffy tail — silver */}
            <g className="km-tail">
              <circle cx="116" cy="136" r="11" fill="#C7D2FE" opacity="0.85"/>
              <circle cx="116" cy="136" r="7.5" fill="#E0E7FF"/>
              <circle cx="114" cy="134" r="3.5" fill="white" opacity="0.7" filter="url(#km-blur)"/>
            </g>

            {/* Paws */}
            <ellipse cx="62" cy="156" rx="10" ry="7" fill="#3D4EA8" stroke="#252E80" strokeWidth="1"/>
            <ellipse cx="98" cy="158" rx="10" ry="7" fill="#3D4EA8" stroke="#252E80" strokeWidth="1"/>
            {[-3,0,3].map((dx,i) => <line key={i} x1={62+dx} y1="159" x2={62+dx} y2="163" stroke="#818CF8" strokeWidth="0.8" strokeLinecap="round"/>)}
            {[-3,0,3].map((dx,i) => <line key={i} x1={98+dx} y1="161" x2={98+dx} y2="165" stroke="#818CF8" strokeWidth="0.8" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="80" cy="82" rx="34" ry="32" fill="url(#km-head)" stroke="#3D4EA8" strokeWidth="1.4"/>

            {/* Left Ear */}
            <g className="km-ear-l" style={{ transformOrigin: '58px 60px' }}>
              <ellipse cx="58" cy="38" rx="13" ry="28" fill="#3D4EA8" stroke="#252E80" strokeWidth="1.2"/>
              <ellipse cx="58" cy="40" rx="7" ry="20" fill="url(#km-ear-in)" opacity="0.85"/>
            </g>
            {/* Right Ear */}
            <g className="km-ear-r" style={{ transformOrigin: '102px 60px' }}>
              <ellipse cx="102" cy="38" rx="13" ry="28" fill="#3D4EA8" stroke="#252E80" strokeWidth="1.2"/>
              <ellipse cx="102" cy="40" rx="7" ry="20" fill="url(#km-ear-in)" opacity="0.85"/>
            </g>

            {/* Eyes — glowing indigo */}
            <g className="km-eye-glow">
              <circle cx="68" cy="80" r="9" fill="white"/>
              <circle cx="69" cy="81" r="6" fill="#4338CA"/>
              <circle cx="71" cy="78" r="2.5" fill="white" opacity="0.95"/>
              <circle cx="70" cy="83" r="1" fill="white" opacity="0.5"/>
            </g>
            <g className="km-eye-glow">
              <circle cx="92" cy="80" r="9" fill="white"/>
              <circle cx="93" cy="81" r="6" fill="#4338CA"/>
              <circle cx="95" cy="78" r="2.5" fill="white" opacity="0.95"/>
              <circle cx="94" cy="83" r="1" fill="white" opacity="0.5"/>
            </g>

            {/* Silver cheeks */}
            <ellipse cx="56" cy="90" rx="8" ry="5" fill="#C7D2FE" opacity="0.35"/>
            <ellipse cx="104" cy="90" rx="8" ry="5" fill="#C7D2FE" opacity="0.35"/>

            {/* Nose */}
            <ellipse cx="80" cy="96" rx="4" ry="3" fill="#818CF8"/>
            <ellipse cx="78.5" cy="95" rx="1.5" ry="1" fill="white" opacity="0.6"/>
            <path d="M 80 99 Q 76 103 73 101" stroke="#6366F1" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M 80 99 Q 84 103 87 101" stroke="#6366F1" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

            {/* Whiskers */}
            <line x1="60" y1="93" x2="73" y2="95" stroke="#818CF8" strokeWidth="0.8" opacity="0.55" strokeLinecap="round"/>
            <line x1="58" y1="97" x2="73" y2="97" stroke="#818CF8" strokeWidth="0.8" opacity="0.45" strokeLinecap="round"/>
            <line x1="87" y1="95" x2="100" y2="93" stroke="#818CF8" strokeWidth="0.8" opacity="0.55" strokeLinecap="round"/>
            <line x1="87" y1="97" x2="102" y2="97" stroke="#818CF8" strokeWidth="0.8" opacity="0.45" strokeLinecap="round"/>

            {/* Moon crescent decoration */}
            <path d="M 118 48 Q 130 55 128 68 Q 120 60 118 48 Z" fill="#FBBF24" opacity="0.7"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.18em', marginBottom: 4 }}>✦ PREMIUM</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Kelinsay Malam</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Bulu indigo gelap berhias bintang. Muncul di tengah malam, mata birunya memancarkan cahaya lembut.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#4338CA,#3730A3)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(67,56,202,0.5)' }}>
          🪙 Beli — 4.500 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#86EFAC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C0C8D8' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Kelinsay · Skin 3</div>
        </div>
      </div>
    </div>
  )
}
