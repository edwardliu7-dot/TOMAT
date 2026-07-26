// Pet Design: Monyet (Monkey) — Epic — 8.000 koin
export default function Monyet() {
  return (
    <div style={{ minHeight: '100vh', background: '#070D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes monkey-idle {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30%      { transform: translateY(-8px) rotate(-1.5deg); }
          65%      { transform: translateY(-4px) rotate(1deg); }
        }
        @keyframes tail-swing {
          0%,100% { transform: rotate(-20deg); transform-origin: 0% 0%; }
          50%      { transform: rotate(20deg); transform-origin: 0% 0%; }
        }
        @keyframes blink {
          0%,92%,100% { scaleY: 1; }
          95% { transform: scaleY(0.1); transform-origin: center; }
        }
        @keyframes monkey-ear-l {
          0%,88%,100% { transform: rotate(0deg); transform-origin: 100% 60%; }
          92% { transform: rotate(-6deg); transform-origin: 100% 60%; }
        }
        @keyframes monkey-ear-r {
          0%,82%,100% { transform: rotate(0deg); transform-origin: 0% 60%; }
          86% { transform: rotate(6deg); transform-origin: 0% 60%; }
        }
        @keyframes sparkle {
          0%,100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .monkey-body { animation: monkey-idle 2.1s ease-in-out infinite; transform-origin: center bottom; }
        .monkey-tail { animation: tail-swing 1.8s ease-in-out infinite; }
        .m-ear-l { animation: monkey-ear-l 5s ease-in-out infinite; }
        .m-ear-r { animation: monkey-ear-r 4.5s ease-in-out infinite; }
        .sp1 { animation: sparkle 2s 0.1s ease-in-out infinite; }
        .sp2 { animation: sparkle 2s 0.7s ease-in-out infinite; }
        .sp3 { animation: sparkle 2s 1.3s ease-in-out infinite; }
      `}</style>

      <div style={{
        width: 340,
        background: 'linear-gradient(160deg,#120a28,#1e0f3e)',
        border: '1.5px solid rgba(168,85,247,0.35)',
        borderRadius: 28,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: '0 0 60px rgba(168,85,247,0.12), 0 20px 60px rgba(0,0,0,0.6)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 280, height: 220, background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Epic badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'linear-gradient(135deg,rgba(168,85,247,0.3),rgba(139,92,246,0.2))', border: '1px solid rgba(168,85,247,0.6)', borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: '#C084FC' }}>★ EPIC</div>

        {/* Sparkles */}
        <div className="sp1" style={{ position: 'absolute', top: 50, left: 30, fontSize: 14, color: '#C084FC' }}>✦</div>
        <div className="sp2" style={{ position: 'absolute', top: 70, right: 35, fontSize: 10, color: '#A78BFA' }}>✦</div>
        <div className="sp3" style={{ position: 'absolute', top: 140, left: 20, fontSize: 8, color: '#C084FC' }}>✦</div>

        {/* SVG Pet */}
        <div className="monkey-body" style={{ position: 'relative', zIndex: 1 }}>
          <svg width="170" height="190" viewBox="0 0 170 190" style={{ overflow: 'visible' }}>
            <defs>
              <radialGradient id="mk-body" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#C4875A"/>
                <stop offset="55%" stopColor="#A0633A"/>
                <stop offset="100%" stopColor="#7A4520"/>
              </radialGradient>
              <radialGradient id="mk-face" cx="45%" cy="40%" r="58%">
                <stop offset="0%" stopColor="#F5C89A"/>
                <stop offset="60%" stopColor="#E8A870"/>
                <stop offset="100%" stopColor="#C88040"/>
              </radialGradient>
              <radialGradient id="mk-belly" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#F5C89A"/>
                <stop offset="100%" stopColor="#E8A870"/>
              </radialGradient>
              <radialGradient id="mk-ear-in" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#F5C89A"/>
                <stop offset="100%" stopColor="#E8A870"/>
              </radialGradient>
              <radialGradient id="mk-eye" cx="30%" cy="28%" r="65%">
                <stop offset="0%" stopColor="#2D1A00"/>
                <stop offset="100%" stopColor="#0D0800"/>
              </radialGradient>
              <filter id="mk-soft">
                <feGaussianBlur stdDeviation="1.5"/>
              </filter>
              <radialGradient id="mk-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168,85,247,0.4)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
            </defs>

            {/* Epic aura glow under body */}
            <ellipse cx="85" cy="170" rx="45" ry="10" fill="rgba(168,85,247,0.2)" filter="url(#mk-soft)"/>

            {/* Tail */}
            <g className="monkey-tail" style={{ transformOrigin: '48px 140px' }}>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#7A4520" strokeWidth="9" strokeLinecap="round"/>
              <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125" fill="none" stroke="#A0633A" strokeWidth="6" strokeLinecap="round"/>
            </g>

            {/* Body */}
            <ellipse cx="85" cy="140" rx="36" ry="30" fill="url(#mk-body)" stroke="#6A3818" strokeWidth="1.2"/>
            <ellipse cx="85" cy="146" rx="20" ry="16" fill="url(#mk-belly)"/>

            {/* Legs */}
            <ellipse cx="70" cy="166" rx="11" ry="8" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
            <ellipse cx="100" cy="168" rx="11" ry="8" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
            {/* Feet toes */}
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={70+dx} cy={173} rx={2.5} ry={3} fill="#7A4520"/>)}
            {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={100+dx} cy={175} rx={2.5} ry={3} fill="#7A4520"/>)}

            {/* Arms */}
            <path d="M 52 132 Q 40 148 45 158" stroke="#7A4520" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 52 132 Q 40 148 45 158" stroke="#A0633A" strokeWidth="7" strokeLinecap="round" fill="none"/>
            <ellipse cx="44" cy="160" rx="8" ry="6" fill="#7A4520"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#7A4520" strokeWidth="10" strokeLinecap="round" fill="none"/>
            <path d="M 118 132 Q 130 148 125 158" stroke="#A0633A" strokeWidth="7" strokeLinecap="round" fill="none"/>
            <ellipse cx="126" cy="160" rx="8" ry="6" fill="#7A4520"/>

            {/* Head */}
            <ellipse cx="85" cy="88" rx="36" ry="34" fill="url(#mk-body)" stroke="#6A3818" strokeWidth="1.4"/>

            {/* Left ear */}
            <g className="m-ear-l" style={{ transformOrigin: '52px 88px' }}>
              <circle cx="50" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
              <circle cx="50" cy="84" r="9" fill="url(#mk-ear-in)"/>
            </g>
            {/* Right ear */}
            <g className="m-ear-r" style={{ transformOrigin: '120px 88px' }}>
              <circle cx="120" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
              <circle cx="120" cy="84" r="9" fill="url(#mk-ear-in)"/>
            </g>

            {/* Face oval */}
            <ellipse cx="85" cy="94" rx="26" ry="22" fill="url(#mk-face)"/>

            {/* Eyes */}
            <circle cx="74" cy="84" r="9" fill="white"/>
            <circle cx="96" cy="84" r="9" fill="white"/>
            <circle cx="75" cy="85" r="6.5" fill="url(#mk-eye)"/>
            <circle cx="97" cy="85" r="6.5" fill="url(#mk-eye)"/>
            <circle cx="77" cy="82" r="2.5" fill="white" opacity="0.95"/>
            <circle cx="99" cy="82" r="2.5" fill="white" opacity="0.95"/>
            <circle cx="76" cy="87" r="1" fill="white" opacity="0.4"/>
            <circle cx="98" cy="87" r="1" fill="white" opacity="0.4"/>
            {/* Eyebrows (raised, curious) */}
            <path d="M 68 76 Q 74 73 80 76" stroke="#6A3818" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M 90 76 Q 96 73 102 76" stroke="#6A3818" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <ellipse cx="85" cy="99" rx="5" ry="3.5" fill="#6A3818"/>
            <ellipse cx="83.5" cy="97.8" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>
            {/* Mouth — big grin */}
            <path d="M 75 104 Q 85 112 95 104" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M 78 107 Q 85 114 92 107" fill="#FF8FA8" stroke="none" opacity="0.6"/>
            {/* Teeth */}
            <rect x="81" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="85.5" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>

            {/* Cheeks */}
            <ellipse cx="62" cy="94" rx="9" ry="6" fill="#FF9999" opacity="0.35"/>
            <ellipse cx="108" cy="94" rx="9" ry="6" fill="#FF9999" opacity="0.35"/>

            {/* Head tuft */}
            <ellipse cx="85" cy="55" rx="12" ry="8" fill="#C4875A" opacity="0.7"/>
            <path d="M 80 52 Q 85 44 90 52" stroke="#A0633A" strokeWidth="3" strokeLinecap="round" fill="none"/>

            {/* Epic crown / halo */}
            <ellipse cx="85" cy="56" rx="30" ry="6" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" strokeDasharray="4 3"/>
          </svg>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#C084FC', letterSpacing: '0.18em', marginBottom: 4 }}>★ EPIC</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Monyet Ceria</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5, maxWidth: 240 }}>Penuh semangat dan selalu bahagia. Ekspresinya bikin semua orang tertawa. Pet yang paling ekspresif!</div>
        </div>

        {/* Price button */}
        <button style={{
          width: '100%', padding: '13px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em',
          boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
        }}>
          🪙 Beli — 8.000 koin
        </button>

        {/* Tier dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C084FC' }}/>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }}/>
          <div style={{ fontSize: 10, color: '#4B6480', marginLeft: 4, fontWeight: 700 }}>2 dari 3 tier</div>
        </div>
      </div>
    </div>
  )
}
