// Skin: Kelinsay Senja — warm sunset rabbit — UMUM+ 2.000 koin
export default function KelinsaySenja() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F0A04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes ks-idle {
          0%,100% { transform: translateY(0px); }
          40%      { transform: translateY(-7px); }
          70%      { transform: translateY(-4px); }
        }
        @keyframes ks-ear-l {
          0%,85%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          90% { transform: rotate(-8deg); transform-origin: 50% 100%; }
          95% { transform: rotate(5deg); transform-origin: 50% 100%; }
        }
        @keyframes ks-ear-r {
          0%,80%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          85% { transform: rotate(8deg); transform-origin: 50% 100%; }
          92% { transform: rotate(-5deg); transform-origin: 50% 100%; }
        }
        @keyframes ks-tail { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }
        @keyframes ks-shine { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes ks-warm-glow { 0%,100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        .ks-body { animation: ks-idle 2.4s ease-in-out infinite; transform-origin: center bottom; }
        .ks-ear-l { animation: ks-ear-l 4s ease-in-out infinite; }
        .ks-ear-r { animation: ks-ear-r 4.5s ease-in-out infinite; }
        .ks-tail  { animation: ks-tail 2.4s ease-in-out infinite; }
        .ks-shine { animation: ks-shine 2s ease-in-out infinite; }
        .ks-warm  { animation: ks-warm-glow 2.8s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#1C0E04,#2A1408)',
        border: '1.5px solid rgba(251,146,60,0.3)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 60px rgba(251,146,60,0.1), 0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background warm glow */}
        <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 280, height: 220, background: 'radial-gradient(circle, rgba(251,146,60,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 260, height: 180, background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Tier badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(251,146,60,0.18)', border: '1px solid rgba(251,146,60,0.5)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#FB923C' }}>UMUM+</div>

        {/* SVG Pet */}
        <div className="ks-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="160" height="180" viewBox="0 0 160 180" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="ks-body" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#FAD4A8"/>
                <stop offset="55%" stopColor="#F5B880"/>
                <stop offset="100%" stopColor="#E89050"/>
              </radialGradient>
              <radialGradient id="ks-belly" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#FFF0E0"/>
                <stop offset="100%" stopColor="#FDDBB8"/>
              </radialGradient>
              <radialGradient id="ks-head" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#FAD4A8"/>
                <stop offset="55%" stopColor="#F5B880"/>
                <stop offset="100%" stopColor="#E89050"/>
              </radialGradient>
              <radialGradient id="ks-ear-in" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#FF9070"/>
                <stop offset="100%" stopColor="#FF6040"/>
              </radialGradient>
              <filter id="ks-blur"><feGaussianBlur stdDeviation="1.2"/></filter>
            </defs>

            {/* Body */}
            <ellipse cx="80" cy="130" rx="38" ry="32" fill="url(#ks-body)" stroke="#D07830" strokeWidth="1.2"/>
            <ellipse cx="80" cy="136" rx="22" ry="18" fill="url(#ks-belly)"/>

            {/* Sunset shimmer on fur */}
            <ellipse cx="60" cy="118" rx="10" ry="7" fill="rgba(255,200,100,0.18)" filter="url(#ks-blur)"/>

            {/* Fluffy tail */}
            <g className="ks-tail">
              <circle cx="116" cy="136" r="11" fill="#FFF0E0" opacity="0.9"/>
              <circle cx="116" cy="136" r="7.5" fill="white"/>
              <circle cx="114" cy="134" r="3.5" fill="white" opacity="0.7" filter="url(#ks-blur)"/>
            </g>

            {/* Paws */}
            <ellipse cx="62" cy="156" rx="10" ry="7" fill="#ECA060" stroke="#D07830" strokeWidth="1"/>
            <ellipse cx="98" cy="158" rx="10" ry="7" fill="#ECA060" stroke="#D07830" strokeWidth="1"/>
            {[-3,0,3].map((dx,i) => <line key={i} x1={62+dx} y1="159" x2={62+dx} y2="163" stroke="#D07830" strokeWidth="0.8" strokeLinecap="round"/>)}
            {[-3,0,3].map((dx,i) => <line key={i} x1={98+dx} y1="161" x2={98+dx} y2="165" stroke="#D07830" strokeWidth="0.8" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="80" cy="82" rx="34" ry="32" fill="url(#ks-head)" stroke="#D07830" strokeWidth="1.4"/>

            {/* Left Ear */}
            <g className="ks-ear-l" style={{ transformOrigin: '58px 60px' }}>
              <ellipse cx="58" cy="38" rx="13" ry="28" fill="#F5B880" stroke="#D07830" strokeWidth="1.2"/>
              <ellipse cx="58" cy="40" rx="7" ry="20" fill="url(#ks-ear-in)" opacity="0.85"/>
            </g>
            {/* Right Ear */}
            <g className="ks-ear-r" style={{ transformOrigin: '102px 60px' }}>
              <ellipse cx="102" cy="38" rx="13" ry="28" fill="#F5B880" stroke="#D07830" strokeWidth="1.2"/>
              <ellipse cx="102" cy="40" rx="7" ry="20" fill="url(#ks-ear-in)" opacity="0.85"/>
            </g>

            {/* Eyes — warm amber */}
            <circle cx="68" cy="80" r="9" fill="white"/>
            <circle cx="92" cy="80" r="9" fill="white"/>
            <circle cx="69" cy="81" r="6" fill="#8B4513"/>
            <circle cx="93" cy="81" r="6" fill="#8B4513"/>
            <circle cx="71" cy="78" r="2.5" fill="white" opacity="0.95" className="ks-shine"/>
            <circle cx="95" cy="78" r="2.5" fill="white" opacity="0.95" className="ks-shine"/>
            <circle cx="70" cy="83" r="1" fill="white" opacity="0.5"/>
            <circle cx="94" cy="83" r="1" fill="white" opacity="0.5"/>

            {/* Warm cheeks */}
            <ellipse cx="56" cy="90" rx="9" ry="5.5" fill="#FF7040" opacity="0.45"/>
            <ellipse cx="104" cy="90" rx="9" ry="5.5" fill="#FF7040" opacity="0.45"/>

            {/* Nose — sunset pink */}
            <ellipse cx="80" cy="96" rx="4" ry="3" fill="#FF6040"/>
            <ellipse cx="78.5" cy="95" rx="1.5" ry="1" fill="white" opacity="0.65"/>
            {/* Smile */}
            <path d="M 80 99 Q 76 103 73 101" stroke="#D07830" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M 80 99 Q 84 103 87 101" stroke="#D07830" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

            {/* Whiskers */}
            <line x1="60" y1="93" x2="73" y2="95" stroke="#B06020" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
            <line x1="58" y1="97" x2="73" y2="97" stroke="#B06020" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
            <line x1="87" y1="95" x2="100" y2="93" stroke="#B06020" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
            <line x1="87" y1="97" x2="102" y2="97" stroke="#B06020" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>

            {/* Sunset rays decorative */}
            <line x1="120" y1="40" x2="130" y2="30" stroke="#FB923C" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
            <line x1="126" y1="48" x2="138" y2="44" stroke="#FB923C" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
            <line x1="128" y1="58" x2="140" y2="58" stroke="#FB923C" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#FB923C', letterSpacing: '0.18em', marginBottom: 4 }}>UMUM+</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Kelinsay Senja</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Bulu hangat warna senja. Muncul saat matahari terbenam, membawa ketenangan dan semangat belajar.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#EA580C,#C2410C)', color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(234,88,12,0.4)' }}>
          🪙 Beli — 2.000 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#86EFAC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FB923C' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Kelinsay · Skin 2</div>
        </div>
      </div>
    </div>
  )
}
