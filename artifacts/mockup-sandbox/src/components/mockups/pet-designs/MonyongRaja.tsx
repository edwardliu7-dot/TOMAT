// Skin: Monyong Raja — royal crown monkey — EPIC 12.000 koin
export default function MonyongRaja() {
  return (
    <div style={{ minHeight: '100vh', background: '#080502', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes mr-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30%      { transform: translateY(-8px) rotate(-1deg); }
          65%      { transform: translateY(-4px) rotate(0.8deg); }
        }
        @keyframes mr-tail {
          0%,100% { transform: rotate(-20deg); transform-origin: 0% 0%; }
          50%     { transform: rotate(20deg);  transform-origin: 0% 0%; }
        }
        @keyframes mr-crown {
          0%,100% { filter: drop-shadow(0 0 4px #D4AF37); }
          50%     { filter: drop-shadow(0 0 12px #FBBF24); }
        }
        @keyframes mr-sparkle {
          0%,100% { opacity: 0; transform: scale(0.4); }
          50%     { opacity: 1; transform: scale(1.3); }
        }
        @keyframes mr-ear-l {
          0%,88%,100% { transform: rotate(0deg);  transform-origin: 100% 60%; }
          92% { transform: rotate(-6deg); transform-origin: 100% 60%; }
        }
        @keyframes mr-ear-r {
          0%,82%,100% { transform: rotate(0deg); transform-origin: 0% 60%; }
          86% { transform: rotate(6deg); transform-origin: 0% 60%; }
        }
        .mr-body  { animation: mr-idle 2.1s ease-in-out infinite; transform-origin: center bottom; }
        .mr-tail  { animation: mr-tail 1.8s ease-in-out infinite; }
        .mr-crown { animation: mr-crown 2s ease-in-out infinite; }
        .mr-ear-l { animation: mr-ear-l 5s ease-in-out infinite; }
        .mr-ear-r { animation: mr-ear-r 4.5s ease-in-out infinite; }
        .mr-sp1 { animation: mr-sparkle 1.8s 0.0s ease-in-out infinite; }
        .mr-sp2 { animation: mr-sparkle 2.2s 0.5s ease-in-out infinite; }
        .mr-sp3 { animation: mr-sparkle 1.6s 1.1s ease-in-out infinite; }
        .mr-sp4 { animation: mr-sparkle 2.0s 0.3s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#18100A,#2A1C08)',
        border: '1.5px solid rgba(212,175,55,0.45)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 70px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.7)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Royal glow */}
        <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 300, height: 220, background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: 280, height: 160, background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Royal badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(212,175,55,0.35),rgba(184,142,20,0.2))', border: '1px solid rgba(212,175,55,0.7)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#D4AF37' }}>♛ ROYAL</div>

        {/* Gold sparkles */}
        <div className="mr-sp1" style={{ position: 'absolute', top: 48, left: 24, fontSize: 14, color: '#D4AF37' }}>✦</div>
        <div className="mr-sp2" style={{ position: 'absolute', top: 68, right: 30, fontSize: 10, color: '#FBBF24' }}>★</div>
        <div className="mr-sp3" style={{ position: 'absolute', bottom: 112, left: 18, fontSize: 8,  color: '#D4AF37' }}>✦</div>
        <div className="mr-sp4" style={{ position: 'absolute', top: 58, right: 58, fontSize: 11, color: '#FDE68A' }}>★</div>

        {/* SVG Pet */}
        <div className="mr-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="170" height="200" viewBox="0 0 170 200" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="mr-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#C4875A"/>
                <stop offset="55%" stopColor="#A0633A"/>
                <stop offset="100%" stopColor="#7A4520"/>
              </radialGradient>
              <radialGradient id="mr-face" cx="45%" cy="40%" r="58%">
                <stop offset="0%" stopColor="#F5C89A"/>
                <stop offset="60%" stopColor="#E8A870"/>
                <stop offset="100%" stopColor="#C88040"/>
              </radialGradient>
              <radialGradient id="mr-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#F5C89A"/>
                <stop offset="100%" stopColor="#E8A870"/>
              </radialGradient>
              <radialGradient id="mr-crown" cx="50%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#FDE68A"/>
                <stop offset="50%" stopColor="#D4AF37"/>
                <stop offset="100%" stopColor="#92400E"/>
              </radialGradient>
              <filter id="mr-soft"><feGaussianBlur stdDeviation="1.5"/></filter>
              <filter id="mr-crown-glow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Royal aura */}
            <ellipse cx="85" cy="180" rx="45" ry="10" fill="rgba(212,175,55,0.25)" filter="url(#mr-soft)"/>

            {/* Tail */}
            <g className="mr-tail" style={{ transformOrigin: '48px 140px' }}>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#7A4520" strokeWidth="9" strokeLinecap="round"/>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#A0633A" strokeWidth="6" strokeLinecap="round"/>
              {/* Gold tail tip */}
              <circle cx="15" cy="140" r="5" fill="#D4AF37" opacity="0.8"/>
            </g>

            {/* Body */}
            <ellipse cx="85" cy="140" rx="36" ry="30" fill="url(#mr-body)" stroke="#6A3818" strokeWidth="1.2"/>
            <ellipse cx="85" cy="146" rx="20" ry="16" fill="url(#mr-belly)"/>
            {/* Royal emblem on chest */}
            <text x="85" y="152" textAnchor="middle" fontSize="14" fill="rgba(212,175,55,0.55)">♛</text>

            {/* Legs */}
            <ellipse cx="70" cy="166" rx="11" ry="8" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
            <ellipse cx="100" cy="168" rx="11" ry="8" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={70+dx} cy={173} rx={2.5} ry={3} fill="#7A4520"/>)}
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={100+dx} cy={175} rx={2.5} ry={3} fill="#7A4520"/>)}

            {/* Arms */}
            <path d="M 52 132 Q 40 148 45 158" stroke="#7A4520" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 52 132 Q 40 148 45 158" stroke="#A0633A" strokeWidth="7"  strokeLinecap="round" fill="none"/>
            <ellipse cx="44" cy="160" rx="8" ry="6" fill="#7A4520"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#7A4520" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#A0633A" strokeWidth="7"  strokeLinecap="round" fill="none"/>
            <ellipse cx="126" cy="160" rx="8" ry="6" fill="#7A4520"/>

            {/* Head */}
            <ellipse cx="85" cy="88" rx="36" ry="34" fill="url(#mr-body)" stroke="#6A3818" strokeWidth="1.4"/>

            {/* Left ear */}
            <g className="mr-ear-l" style={{ transformOrigin: '52px 88px' }}>
              <circle cx="50" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
              <circle cx="50" cy="84" r="9"  fill="url(#mr-face)"/>
            </g>
            {/* Right ear */}
            <g className="mr-ear-r" style={{ transformOrigin: '120px 88px' }}>
              <circle cx="120" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
              <circle cx="120" cy="84" r="9"  fill="url(#mr-face)"/>
            </g>

            {/* Face oval */}
            <ellipse cx="85" cy="94" rx="26" ry="22" fill="url(#mr-face)"/>

            {/* Crown ♛ */}
            <g className="mr-crown" filter="url(#mr-crown-glow)">
              {/* Crown base */}
              <rect x="62" y="52" width="46" height="12" rx="3" fill="url(#mr-crown)" stroke="#92400E" strokeWidth="0.8"/>
              {/* Crown points */}
              <polygon points="65,52 68,38 71,52" fill="#D4AF37" stroke="#92400E" strokeWidth="0.6"/>
              <polygon points="82,52 85,34 88,52" fill="#FBBF24" stroke="#92400E" strokeWidth="0.6"/>
              <polygon points="99,52 102,38 105,52" fill="#D4AF37" stroke="#92400E" strokeWidth="0.6"/>
              {/* Crown gems */}
              <circle cx="68" cy="44" r="3" fill="#EF4444"/>
              <circle cx="85" cy="41" r="3.5" fill="#60A5FA"/>
              <circle cx="102" cy="44" r="3" fill="#34D399"/>
              {/* Crown base decoration */}
              <circle cx="75" cy="57" r="2" fill="#FBBF24" opacity="0.8"/>
              <circle cx="85" cy="58" r="2" fill="#FBBF24" opacity="0.8"/>
              <circle cx="95" cy="57" r="2" fill="#FBBF24" opacity="0.8"/>
            </g>

            {/* Eyes — confident */}
            <circle cx="74" cy="84" r="9" fill="white"/>
            <circle cx="96" cy="84" r="9" fill="white"/>
            <circle cx="75" cy="85" r="6.5" fill="#2D1A00"/>
            <circle cx="97" cy="85" r="6.5" fill="#2D1A00"/>
            <circle cx="77" cy="82" r="2.5" fill="white" opacity="0.95"/>
            <circle cx="99" cy="82" r="2.5" fill="white" opacity="0.95"/>
            {/* Regal eyebrows */}
            <path d="M 67 75 Q 74 71 81 75" stroke="#6A3818" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M 89 75 Q 96 71 103 75" stroke="#6A3818" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <ellipse cx="85" cy="99" rx="5" ry="3.5" fill="#6A3818"/>
            <ellipse cx="83.5" cy="97.8" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>
            {/* Confident smile */}
            <path d="M 75 104 Q 85 112 95 104" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <rect x="81" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="85.5" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>

            {/* Cheeks */}
            <ellipse cx="62"  cy="94" rx="9" ry="6" fill="#FF9999" opacity="0.3"/>
            <ellipse cx="108" cy="94" rx="9" ry="6" fill="#FF9999" opacity="0.3"/>

            {/* Royal dashed halo */}
            <ellipse cx="85" cy="54" rx="36" ry="7" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" strokeDasharray="4 3"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#D4AF37', letterSpacing: '0.18em', marginBottom: 4 }}>♛ ROYAL</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Monyong Raja</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Mahkota emas bertahta di kepalanya. Monyong Raja memerintah leaderboard dengan senyum lebarnya.</div>
        </div>

        <button style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#B45309,#92400E)', color: '#FDE68A', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(180,83,9,0.5)' }}>
          🪙 Beli — 12.000 koin
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C084FC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>Monyong · Skin 2</div>
        </div>
      </div>
    </div>
  )
}
