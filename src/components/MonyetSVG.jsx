// ── MonyetSVG — Monyong the Monkey ───────────────────────────────────────────
import React from 'react'

export default function MonyetSVG({ state = 'idle', size = 100 }) {
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const uid      = `mk${size}`

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <radialGradient id={`mk-body-${uid}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#C4875A"/>
          <stop offset="55%"  stopColor="#A0633A"/>
          <stop offset="100%" stopColor="#7A4520"/>
        </radialGradient>
        <radialGradient id={`mk-belly-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#F5C89A"/>
          <stop offset="100%" stopColor="#E8A870"/>
        </radialGradient>
        <radialGradient id={`mk-face-${uid}`} cx="45%" cy="40%" r="58%">
          <stop offset="0%"   stopColor="#F5C89A"/>
          <stop offset="65%"  stopColor="#E8A870"/>
          <stop offset="100%" stopColor="#C88040"/>
        </radialGradient>
        <radialGradient id={`mk-head-${uid}`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#C4875A"/>
          <stop offset="55%"  stopColor="#A0633A"/>
          <stop offset="100%" stopColor="#7A4520"/>
        </radialGradient>
        <radialGradient id={`mk-eye-${uid}`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#2D1A00"/>
          <stop offset="100%" stopColor="#0D0800"/>
        </radialGradient>
        <filter id={`mk-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.3"/>
        </filter>
      </defs>

      {/* ── TAIL ── */}
      <path d="M 88 90 Q 108 100 110 88 Q 112 76 100 74 Q 92 72 90 80"
        fill="none" stroke="#6A3818" strokeWidth="8"  strokeLinecap="round"/>
      <path d="M 88 90 Q 108 100 110 88 Q 112 76 100 74 Q 92 72 90 80"
        fill="none" stroke="#A0633A" strokeWidth="5.5" strokeLinecap="round"/>

      {/* ── BODY ── */}
      <ellipse cx="58" cy="92" rx="28" ry="24"
        fill={`url(#mk-body-${uid})`} stroke="#6A3818" strokeWidth="1.2"/>
      <ellipse cx="58" cy="97" rx="16" ry="13"
        fill={`url(#mk-belly-${uid})`}/>

      {/* ── ARMS ── */}
      <path d="M 33 84 Q 22 100 26 110" stroke="#6A3818" strokeWidth="8"  strokeLinecap="round" fill="none"/>
      <path d="M 33 84 Q 22 100 26 110" stroke="#A0633A" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="25" cy="112" rx="7" ry="5" fill="#6A3818"/>
      <path d="M 83 84 Q 94 100 90 110" stroke="#6A3818" strokeWidth="8"  strokeLinecap="round" fill="none"/>
      <path d="M 83 84 Q 94 100 90 110" stroke="#A0633A" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="91" cy="112" rx="7" ry="5" fill="#6A3818"/>

      {/* ── LEGS ── */}
      <ellipse cx="46" cy="112" rx="10" ry="6.5" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
      <ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#A0633A" stroke="#6A3818" strokeWidth="1"/>
      {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={46+dx} cy={117} rx={2.2} ry={2.8} fill="#7A4520"/>)}
      {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={70+dx} cy={119} rx={2.2} ry={2.8} fill="#7A4520"/>)}

      {/* ── HEAD ── */}
      <ellipse cx="58" cy="56" rx="32" ry="30"
        fill={`url(#mk-head-${uid})`} stroke="#6A3818" strokeWidth="1.4"/>

      {/* ── EARS ── */}
      <circle cx="28" cy="52" r="12" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
      <circle cx="28" cy="52" r="8"  fill={`url(#mk-face-${uid})`}/>
      <circle cx="88" cy="52" r="12" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
      <circle cx="88" cy="52" r="8"  fill={`url(#mk-face-${uid})`}/>

      {/* ── FACE OVAL ── */}
      <ellipse cx="58" cy="62" rx="23" ry="19" fill={`url(#mk-face-${uid})`}/>

      {/* ── EYEBROWS ── */}
      {!dead && !sleeping && (
        <>
          <path d="M 44 44 Q 50 41 56 44" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,2)' : ''}/>
          <path d="M 60 44 Q 66 41 72 44" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,2)' : ''}/>
        </>
      )}

      {/* ── EYES ── */}
      {dead ? (
        <>
          <text x="48" y="62" fontSize="14" fill="#6A3818" fontWeight="900" textAnchor="middle">✕</text>
          <text x="68" y="62" fontSize="14" fill="#6A3818" fontWeight="900" textAnchor="middle">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 42 56 Q 48 51 54 56" stroke="#6A3818" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 62 56 Q 68 51 74 56" stroke="#6A3818" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <text x="82" y="38" fontSize="8"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="90" y="28" fontSize="11" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="99" y="17" fontSize="14" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <circle cx="48" cy="56" r="9" fill="white"/>
          <circle cx="68" cy="56" r="9" fill="white"/>
          <circle cx="49" cy="57" r={hungry ? 5 : 6.5} fill={`url(#mk-eye-${uid})`}/>
          <circle cx="69" cy="57" r={hungry ? 5 : 6.5} fill={`url(#mk-eye-${uid})`}/>
          <circle cx="51" cy="54" r="2.2" fill="white" opacity="0.95"/>
          <circle cx="71" cy="54" r="2.2" fill="white" opacity="0.95"/>
          {happy && (
            <>
              <path d="M 38 46 Q 48 42 58 46" stroke="#6A3818" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M 58 46 Q 68 42 78 46" stroke="#6A3818" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* ── CHEEK BLUSH ── */}
      {!dead && (
        <>
          <ellipse cx="33" cy="64" rx="8" ry="5" fill="#FF9999" opacity="0.35"/>
          <ellipse cx="83" cy="64" rx="8" ry="5" fill="#FF9999" opacity="0.35"/>
        </>
      )}

      {/* ── NOSE & MOUTH ── */}
      <ellipse cx="58" cy="70" rx="5" ry="3.5" fill="#6A3818"/>
      <ellipse cx="56.5" cy="68.8" rx="1.8" ry="1.1" fill="rgba(255,255,255,0.5)"/>
      {hungry || dead ? (
        <path d="M 53 76 Q 58 73 63 76" stroke="#6A3818" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      ) : happy ? (
        <>
          <path d="M 50 76 Q 58 84 66 76" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="58" cy="81" rx="6" ry="4.5" fill="#FF8FA8" stroke="#e06080" strokeWidth="0.9"/>
          <line x1="54" y1="78" x2="54" y2="85" stroke="#e06080" strokeWidth="0.8"/>
          <line x1="58" y1="76.5" x2="58" y2="85" stroke="#e06080" strokeWidth="0.8"/>
          <line x1="62" y1="78" x2="62" y2="85" stroke="#e06080" strokeWidth="0.8"/>
        </>
      ) : (
        <path d="M 52 76 Q 58 82 64 76" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      )}

      {/* ── HEAD TUFT ── */}
      <path d="M 54 26 Q 58 16 62 26" stroke="#C4875A" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M 50 28 Q 52 18 55 26" stroke="#C4875A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M 66 26 Q 69 16 71 28" stroke="#C4875A" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* ── HUNGRY SPARKLE ── */}
      {hungry && !dead && <text x="82" y="108" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>}
    </svg>
  )
}
