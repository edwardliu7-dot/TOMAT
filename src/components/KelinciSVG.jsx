// ── KelinciSVG — Kelinsay the Rabbit ─────────────────────────────────────────
import React from 'react'

export default function KelinciSVG({ state = 'idle', size = 100 }) {
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const earTilt  = sleeping || hungry || dead ? 22 : 0
  const uid      = `kl${size}`

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <radialGradient id={`kl-body-${uid}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#EEF6FF"/>
          <stop offset="55%"  stopColor="#C8DCF0"/>
          <stop offset="100%" stopColor="#96B8D8"/>
        </radialGradient>
        <radialGradient id={`kl-belly-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#DCF0FF"/>
        </radialGradient>
        <radialGradient id={`kl-head-${uid}`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#F5FAFF"/>
          <stop offset="55%"  stopColor="#C8DCF0"/>
          <stop offset="100%" stopColor="#96B8D8"/>
        </radialGradient>
        <radialGradient id={`kl-ear-in-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#FFB3C8"/>
          <stop offset="100%" stopColor="#FF8FA8"/>
        </radialGradient>
        <radialGradient id={`kl-eye-${uid}`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#1A3A5C"/>
          <stop offset="100%" stopColor="#061220"/>
        </radialGradient>
        <filter id={`kl-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.3"/>
        </filter>
      </defs>

      {/* ── BODY ── */}
      <ellipse cx="60" cy="94" rx="30" ry="24"
        fill={`url(#kl-body-${uid})`} stroke="#7AAAC8" strokeWidth="1.2"/>
      <ellipse cx="60" cy="98" rx="17" ry="14"
        fill={`url(#kl-belly-${uid})`}/>
      {/* Fluffy tail */}
      <circle cx="88" cy="100" r="9" fill="white" opacity="0.95"/>
      <circle cx="88" cy="100" r="6" fill="white"/>
      <circle cx="86" cy="98"  r="2.5" fill="white" opacity="0.7" filter={`url(#kl-blur-${uid})`}/>

      {/* ── FEET ── */}
      <ellipse cx="46" cy="112" rx="9" ry="5.5" fill="#C0D8EE" stroke="#7AAAC8" strokeWidth="1"/>
      {[-4,-1,2].map((dx,i) => <line key={i} x1={46+dx} y1="115" x2={46+dx} y2="119" stroke="#7AAAC8" strokeWidth="0.8" strokeLinecap="round"/>)}
      <ellipse cx="68" cy="114" rx="9" ry="5.5" fill="#C0D8EE" stroke="#7AAAC8" strokeWidth="1"/>
      {[-4,-1,2].map((dx,i) => <line key={i} x1={68+dx} y1="117" x2={68+dx} y2="121" stroke="#7AAAC8" strokeWidth="0.8" strokeLinecap="round"/>)}

      {/* ── HEAD ── */}
      <ellipse cx="60" cy="58" rx="34" ry="32"
        fill={`url(#kl-head-${uid})`} stroke="#7AAAC8" strokeWidth="1.4"/>

      {/* ── EARS ── */}
      <g transform={`rotate(${earTilt} 41 40)`} style={{ transformOrigin: '41px 40px' }}>
        <ellipse cx="41" cy="24" rx="10" ry="26"
          fill="#C8DCF0" stroke="#7AAAC8" strokeWidth="1.3"/>
        <ellipse cx="41" cy="25" rx="5.5" ry="19"
          fill={`url(#kl-ear-in-${uid})`} opacity="0.85"/>
      </g>
      <g transform={`rotate(${-earTilt} 79 40)`} style={{ transformOrigin: '79px 40px' }}>
        <ellipse cx="79" cy="24" rx="10" ry="26"
          fill="#C8DCF0" stroke="#7AAAC8" strokeWidth="1.3"/>
        <ellipse cx="79" cy="25" rx="5.5" ry="19"
          fill={`url(#kl-ear-in-${uid})`} opacity="0.85"/>
      </g>

      {/* ── EYES ── */}
      {dead ? (
        <>
          <text x="48" y="64" fontSize="14" fill="#7AAAC8" fontWeight="900" textAnchor="middle">✕</text>
          <text x="72" y="64" fontSize="14" fill="#7AAAC8" fontWeight="900" textAnchor="middle">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 42 58 Q 48 53 54 58" stroke="#7AAAC8" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 66 58 Q 72 53 78 58" stroke="#7AAAC8" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <text x="82" y="42" fontSize="8"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="89" y="33" fontSize="11" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="97" y="23" fontSize="14" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <circle cx="49" cy="58" r="9" fill="white"/>
          <circle cx="71" cy="58" r="9" fill="white"/>
          <circle cx="50" cy="59" r={hungry ? 5 : 6} fill={`url(#kl-eye-${uid})`}/>
          <circle cx="72" cy="59" r={hungry ? 5 : 6} fill={`url(#kl-eye-${uid})`}/>
          <circle cx="52" cy="56" r="2.2" fill="white" opacity="0.95"/>
          <circle cx="74" cy="56" r="2.2" fill="white" opacity="0.95"/>
          {happy && (
            <>
              <path d="M 39 48 Q 49 43 59 48" stroke="#7AAAC8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M 61 48 Q 71 43 81 48" stroke="#7AAAC8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </>
          )}
          {hungry && (
            <>
              <path d="M 40 51 Q 50 48 60 52" stroke="#7AAAC8" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <path d="M 62 52 Q 72 48 82 51" stroke="#7AAAC8" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* ── CHEEK BLUSH ── */}
      {!dead && (
        <>
          <ellipse cx="36" cy="66" rx="7" ry="4" fill="#FFB3C8" opacity="0.45"/>
          <ellipse cx="84" cy="66" rx="7" ry="4" fill="#FFB3C8" opacity="0.45"/>
        </>
      )}

      {/* ── NOSE ── */}
      <ellipse cx="60" cy="71" rx="4.5" ry="3.5" fill="#FF8FA8"/>
      <ellipse cx="58.5" cy="69.8" rx="1.8" ry="1.1" fill="white" opacity="0.55"/>
      {hungry || dead ? (
        <path d="M 55 76 Q 60 73 65 76" stroke="#7AAAC8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      ) : happy ? (
        <>
          <path d="M 55 75 Q 60 81 65 75" stroke="#7AAAC8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
          <ellipse cx="60" cy="80" rx="4.5" ry="3.5" fill="#FF8FA8" stroke="#e06080" strokeWidth="0.8"/>
          <line x1="60" y1="76.5" x2="60" y2="83" stroke="#e06080" strokeWidth="0.8"/>
        </>
      ) : (
        <path d="M 55 75 Q 60 80 65 75" stroke="#7AAAC8" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      )}

      {/* ── WHISKERS ── */}
      <line x1="38" y1="70" x2="53" y2="72" stroke="#5A8AAA" strokeWidth="0.85" opacity="0.6" strokeLinecap="round"/>
      <line x1="37" y1="74" x2="53" y2="74" stroke="#5A8AAA" strokeWidth="0.85" opacity="0.5" strokeLinecap="round"/>
      <line x1="67" y1="72" x2="82" y2="70" stroke="#5A8AAA" strokeWidth="0.85" opacity="0.6" strokeLinecap="round"/>
      <line x1="67" y1="74" x2="83" y2="74" stroke="#5A8AAA" strokeWidth="0.85" opacity="0.5" strokeLinecap="round"/>

      {/* ── HUNGRY SPARKLE ── */}
      {hungry && !dead && <text x="78" y="108" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>}
    </svg>
  )
}
