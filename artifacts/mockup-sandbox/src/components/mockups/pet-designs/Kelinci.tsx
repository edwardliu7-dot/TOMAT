// Pet Design: Kelinci (Rabbit) — Umum — 3.000 koin
export default function Kelinci() {
  return (
    <div style={{ minHeight: '100vh', background: '#070D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes rabbit-idle {
          0%,100% { transform: translateY(0px); }
          40%      { transform: translateY(-7px); }
          70%      { transform: translateY(-4px); }
        }
        @keyframes ear-twitch-l {
          0%,85%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          90% { transform: rotate(-8deg); transform-origin: 50% 100%; }
          95% { transform: rotate(5deg); transform-origin: 50% 100%; }
        }
        @keyframes ear-twitch-r {
          0%,80%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
          85% { transform: rotate(8deg); transform-origin: 50% 100%; }
          92% { transform: rotate(-5deg); transform-origin: 50% 100%; }
        }
        @keyframes tail-bob {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes shine {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .rabbit-body { animation: rabbit-idle 2.4s ease-in-out infinite; transform-origin: center bottom; }
        .ear-left    { animation: ear-twitch-l 4s ease-in-out infinite; }
        .ear-right   { animation: ear-twitch-r 4.5s ease-in-out infinite; }
        .rabbit-tail { animation: tail-bob 2.4s ease-in-out infinite; }
        .shine-dot   { animation: shine 2s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#0a1628,#0d1f38)',
        border: '1.5px solid rgba(134,239,172,0.25)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 60px rgba(134,239,172,0.08), 0 20px 60px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 260, height: 200, background: 'radial-gradient(circle, rgba(134,239,172,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Tier badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.4)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#86EFAC' }}>UMUM</div>

        {/* SVG Pet */}
        <div className="rabbit-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="160" height="180" viewBox="0 0 160 180" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="rb-body" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#E8F4FF"/>
                <stop offset="55%" stopColor="#C8DCF0"/>
                <stop offset="100%" stopColor="#9BB8D4"/>
              </radialGradient>
              <radialGradient id="rb-belly" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="100%" stopColor="#DCF0FF"/>
              </radialGradient>
              <radialGradient id="rb-head" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#EEF6FF"/>
                <stop offset="55%" stopColor="#C8DCF0"/>
                <stop offset="100%" stopColor="#9BB8D4"/>
              </radialGradient>
              <radialGradient id="rb-ear-in" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#FFB3C8"/>
                <stop offset="100%" stopColor="#FF8FA8"/>
              </radialGradient>
              <filter id="rb-blur">
                <feGaussianBlur stdDeviation="1.2"/>
              </filter>
            </defs>

            {/* Body */}
            <ellipse cx="80" cy="130" rx="38" ry="32" fill="url(#rb-body)" stroke="#8AAAC0" strokeWidth="1.2"/>
            <ellipse cx="80" cy="136" rx="22" ry="18" fill="url(#rb-belly)"/>

            {/* Fluffy tail */}
            <g className="rabbit-tail">
              <circle cx="116" cy="136" r="10" fill="white" opacity="0.9"/>
              <circle cx="116" cy="136" r="7" fill="white"/>
              <circle cx="114" cy="134" r="3" fill="white" opacity="0.7" filter="url(#rb-blur)"/>
            </g>

            {/* Front legs/paws */}
            <ellipse cx="62" cy="156" rx="10" ry="7" fill="#C0D8EE" stroke="#8AAAC0" strokeWidth="1"/>
            <ellipse cx="98" cy="158" rx="10" ry="7" fill="#C0D8EE" stroke="#8AAAC0" strokeWidth="1"/>
            {/* Toe lines */}
            {[-3,0,3].map((dx,i) => <line key={i} x1={62+dx} y1="159" x2={62+dx} y2="163" stroke="#8AAAC0" strokeWidth="0.8" strokeLinecap="round"/>)}
            {[-3,0,3].map((dx,i) => <line key={i} x1={98+dx} y1="161" x2={98+dx} y2="165" stroke="#8AAAC0" strokeWidth="0.8" strokeLinecap="round"/>)}

            {/* Head */}
            <ellipse cx="80" cy="82" rx="34" ry="32" fill="url(#rb-head)" stroke="#8AAAC0" strokeWidth="1.4"/>

            {/* Left Ear */}
            <g className="ear-left" style={{ transformOrigin: '58px 60px' }}>
              <ellipse cx="58" cy="38" rx="13" ry="28" fill="#C8DCF0" stroke="#8AAAC0" strokeWidth="1.2"/>
              <ellipse cx="58" cy="40" rx="7" ry="20" fill="url(#rb-ear-in)" opacity="0.8"/>
            </g>
            {/* Right Ear */}
            <g className="ear-right" style={{ transformOrigin: '102px 60px' }}>
              <ellipse cx="102" cy="38" rx="13" ry="28" fill="#C8DCF0" stroke="#8AAAC0" strokeWidth="1.2"/>
              <ellipse cx="102" cy="40" rx="7" ry="20" fill="url(#rb-ear-in)" opacity="0.8"/>
            </g>

            {/* Eyes */}
            <circle cx="68" cy="80" r="9" fill="white"/>
            <circle cx="92" cy="80" r="9" fill="white"/>
            <circle cx="69" cy="81" r="6" fill="#1A3A5C"/>
            <circle cx="93" cy="81" r="6" fill="#1A3A5C"/>
            <circle cx="71" cy="78" r="2.5" fill="white" opacity="0.95" className="shine-dot"/>
            <circle cx="95" cy="78" r="2.5" fill="white" opacity="0.95" className="shine-dot"/>
            <circle cx="70" cy="83" r="1" fill="white" opacity="0.5"/>
            <circle cx="94" cy="83" r="1" fill="white" opacity="0.5"/>

            {/* Cheeks */}
            <ellipse cx="56" cy="90" rx="8" ry="5" fill="#FFB3C8" opacity="0.5"/>
            <ellipse cx="104" cy="90" rx="8" ry="5" fill="#FFB3C8" opacity="0.5"/>

            {/* Nose */}
            <ellipse cx="80" cy="96" rx="4" ry="3" fill="#FF8FA8"/>
            <ellipse cx="78.5" cy="95" rx="1.5" ry="1" fill="white" opacity="0.6"/>
            {/* Mouth */}
            <path d="M 80 99 Q 76 103 73 101" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M 80 99 Q 84 103 87 101" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

            {/* Whiskers */}
            <line x1="60" y1="93" x2="73" y2="95" stroke="#6A90B0" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
            <line x1="58" y1="97" x2="73" y2="97" stroke="#6A90B0" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
            <line x1="87" y1="95" x2="100" y2="93" stroke="#6A90B0" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
            <line x1="87" y1="97" x2="102" y2="97" stroke="#6A90B0" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#86EFAC', letterSpacing: '0.18em', marginBottom: 4 }}>UMUM</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Kelinci Salju</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Bulu putih lembut seperti salju. Telinganya panjang dan selalu waspada. Teman belajar yang menenangkan.</div>
        </div>

        {/* Price button */}
        <button style={{
          width: '100%', padding: '13px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
          boxShadow: '0 4px 20px rgba(5,150,105,0.35)',
        }}>
          🪙 Beli — 3.000 koin
        </button>

        {/* Tier indicator dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#86EFAC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>1 dari 3 tier</div>
        </div>
      </div>
    </div>
  )
}
