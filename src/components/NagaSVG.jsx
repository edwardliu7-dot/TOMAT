// ── NagaSVG — Nananaga the Dragon ────────────────────────────────────────────
import React from 'react'

export default function NagaSVG({ state = 'idle', size = 100 }) {
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const uid      = `ng${size}`

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <radialGradient id={`ng-body-${uid}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#1E6B4A"/>
          <stop offset="55%"  stopColor="#125335"/>
          <stop offset="100%" stopColor="#082A1A"/>
        </radialGradient>
        <radialGradient id={`ng-belly-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#3CB878"/>
          <stop offset="65%"  stopColor="#28A060"/>
          <stop offset="100%" stopColor="#1E7A48"/>
        </radialGradient>
        <radialGradient id={`ng-head-${uid}`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#1E6B4A"/>
          <stop offset="55%"  stopColor="#0F4A30"/>
          <stop offset="100%" stopColor="#051A0E"/>
        </radialGradient>
        <radialGradient id={`ng-wing-${uid}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%"   stopColor="#1A2A1A"/>
          <stop offset="70%"  stopColor="#0A1A0A"/>
          <stop offset="100%" stopColor="#040D04"/>
        </radialGradient>
        <filter id={`ng-blur-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
        <filter id={`ng-fire-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── WINGS ── */}
      <path d="M 42 72 Q 12 52 8 28 Q 14 46 24 52 Q 8 58 5 74 Q 18 64 30 68 Z"
        fill={`url(#ng-wing-${uid})`} stroke="#1E3A1E" strokeWidth="0.9"/>
      <path d="M 42 72 Q 8 58 5 74" stroke="#2A5A2A" strokeWidth="0.7" fill="none" opacity="0.55"/>
      <path d="M 42 72 Q 12 52 8 28"  stroke="#2A5A2A" strokeWidth="0.7" fill="none" opacity="0.55"/>
      <path d="M 78 72 Q 108 52 112 28 Q 106 46 96 52 Q 112 58 115 74 Q 102 64 90 68 Z"
        fill={`url(#ng-wing-${uid})`} stroke="#1E3A1E" strokeWidth="0.9"/>
      <path d="M 78 72 Q 112 58 115 74" stroke="#2A5A2A" strokeWidth="0.7" fill="none" opacity="0.55"/>
      <path d="M 78 72 Q 108 52 112 28"  stroke="#2A5A2A" strokeWidth="0.7" fill="none" opacity="0.55"/>

      {/* ── TAIL ── */}
      <path d="M 82 96 Q 102 108 108 100 Q 116 92 110 84 Q 106 78 100 82"
        fill="none" stroke="#082A1A" strokeWidth="9"  strokeLinecap="round"/>
      <path d="M 82 96 Q 102 108 108 100 Q 116 92 110 84 Q 106 78 100 82"
        fill="none" stroke="#125335" strokeWidth="6.5" strokeLinecap="round"/>
      {/* Tail spines */}
      <polygon points="108,100 113,107 105,106" fill="#0F8A45" opacity="0.75"/>
      <polygon points="114,92 120,96 112,97"  fill="#0F8A45" opacity="0.65"/>

      {/* ── BODY ── */}
      <ellipse cx="60" cy="94" rx="30" ry="24"
        fill={`url(#ng-body-${uid})`} stroke="#082A1A" strokeWidth="1.3"/>
      <ellipse cx="60" cy="99" rx="17" ry="14"
        fill={`url(#ng-belly-${uid})`} opacity="0.85"/>
      {/* Scale pattern on belly */}
      {[[-10,-8],[-2,-11],[6,-11],[14,-8],[-6,-1],[2,-3],[10,-1]].map(([dx,dy],i)=>(
        <ellipse key={i} cx={60+dx} cy={99+dy} rx="4.5" ry="3"
          fill="none" stroke="rgba(60,184,120,0.35)" strokeWidth="0.7"/>
      ))}
      {/* Body spines */}
      {[50,56,60,64,70].map((x,i)=>(
        <polygon key={i} points={`${x},${74-i%2*3} ${x-3},85 ${x+3},85`}
          fill="#0F8A45" opacity="0.7"/>
      ))}

      {/* ── HIND LEGS ── */}
      <path d="M 44 108 Q 36 118 32 120" stroke="#082A1A" strokeWidth="9"  strokeLinecap="round" fill="none"/>
      <path d="M 44 108 Q 36 118 32 120" stroke="#125335" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
      <path d="M 76 108 Q 84 118 88 120" stroke="#082A1A" strokeWidth="9"  strokeLinecap="round" fill="none"/>
      <path d="M 76 108 Q 84 118 88 120" stroke="#125335" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
      {[-6,-2,2,6].map((dx,i)=><line key={i} x1={32+dx} y1="119" x2={29+dx} y2="127" stroke="#082A1A" strokeWidth="1.5" strokeLinecap="round"/>)}
      {[-6,-2,2,6].map((dx,i)=><line key={i} x1={88+dx} y1="119" x2={85+dx} y2="127" stroke="#082A1A" strokeWidth="1.5" strokeLinecap="round"/>)}

      {/* ── HEAD ── */}
      <ellipse cx="60" cy="56" rx="32" ry="30"
        fill={`url(#ng-head-${uid})`} stroke="#082A1A" strokeWidth="1.5"/>

      {/* ── HORNS ── */}
      <path d="M 46 30 Q 40 12 44 4"  stroke="#082A1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M 46 30 Q 40 12 44 4"  stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="44" cy="4" r="2.8" fill="#FBBF24"/>
      <path d="M 74 30 Q 80 12 76 4"  stroke="#082A1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M 74 30 Q 80 12 76 4"  stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="76" cy="4" r="2.8" fill="#FBBF24"/>

      {/* ── HEAD SPINES ── */}
      {[46,52,60,68,74].map((x,i)=>(
        <polygon key={i} points={`${x},${28-i%2*3} ${x-3},40 ${x+3},40`}
          fill="#0F8A45" opacity="0.75"/>
      ))}

      {/* ── SNOUT ── */}
      <ellipse cx="60" cy="70" rx="16" ry="11"
        fill="#0F4A30" stroke="#082A1A" strokeWidth="1.2"/>
      <ellipse cx="54" cy="69" rx="3" ry="2.2" fill="#051A0E"/>
      <ellipse cx="66" cy="69" rx="3" ry="2.2" fill="#051A0E"/>

      {/* ── EYES ── */}
      {dead ? (
        <>
          <text x="44" y="56" fontSize="13" fill="#0F8A45" fontWeight="900" textAnchor="middle">✕</text>
          <text x="76" y="56" fontSize="13" fill="#0F8A45" fontWeight="900" textAnchor="middle">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 37 52 Q 44 47 51 52" stroke="#082A1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 69 52 Q 76 47 83 52" stroke="#082A1A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <text x="86" y="40" fontSize="8"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="94" y="30" fontSize="11" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="103" y="19" fontSize="14" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          {/* Eye glow */}
          <ellipse cx="44" cy="52" rx="10" ry="9" fill="rgba(255,107,0,0.25)" filter={`url(#ng-blur-${uid})`}/>
          <ellipse cx="76" cy="52" rx="10" ry="9" fill="rgba(255,107,0,0.25)" filter={`url(#ng-blur-${uid})`}/>
          <circle cx="44" cy="52" r="9" fill="#1A2A10"/>
          <circle cx="76" cy="52" r="9" fill="#1A2A10"/>
          <ellipse cx="44" cy="52" rx={hungry ? 3 : 4.5} ry={hungry ? 6 : 7.5} fill="#FF6B00"/>
          <ellipse cx="76" cy="52" rx={hungry ? 3 : 4.5} ry={hungry ? 6 : 7.5} fill="#FF6B00"/>
          <ellipse cx="44" cy="52" rx={hungry ? 1.5 : 2} ry={hungry ? 3.5 : 4} fill="#8B0000"/>
          <ellipse cx="76" cy="52" rx={hungry ? 1.5 : 2} ry={hungry ? 3.5 : 4} fill="#8B0000"/>
          <circle cx="47" cy="49" r="2" fill="white" opacity="0.65"/>
          <circle cx="79" cy="49" r="2" fill="white" opacity="0.65"/>
          {happy && (
            <>
              <path d="M 34 43 Q 44 38 54 43" stroke="#0F8A45" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M 66 43 Q 76 38 86 43" stroke="#0F8A45" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* ── TEETH ── */}
      {!sleeping && (
        <>
          <path d="M 48 78 Q 60 86 72 78" stroke="#082A1A" strokeWidth="1.3" fill="none"/>
          {[52,57,60,63,68].map((x,i)=>(
            <polygon key={i} points={`${x},78 ${x-2},84 ${x+2},84`} fill="white" opacity="0.9"/>
          ))}
        </>
      )}

      {/* ── FIRE BREATH ── */}
      {(happy || (!dead && !sleeping)) && (
        <g filter={`url(#ng-fire-${uid})`}>
          <ellipse cx="36" cy="76" rx={happy ? 18 : 12} ry="6"
            style={{ fill: 'url(#ng-fire-grad)' }} opacity="0.85"/>
          {/* Inline gradient via stop-color */}
          <defs>
            <radialGradient id={`ng-fire-grad-${uid}`} cx="5%" cy="50%" r="95%">
              <stop offset="0%"   stopColor="#FFFFFF"/>
              <stop offset="20%"  stopColor="#FBBF24"/>
              <stop offset="55%"  stopColor="#F97316"/>
              <stop offset="100%" stopColor="rgba(239,68,68,0)"/>
            </radialGradient>
          </defs>
          <ellipse cx="36" cy="76" rx={happy ? 18 : 12} ry="6"
            fill={`url(#ng-fire-grad-${uid})`} opacity="0.85"/>
          <ellipse cx="34" cy="74" rx={happy ? 12 : 8} ry="4"
            fill="rgba(255,255,200,0.45)"/>
        </g>
      )}

      {/* ── HUNGRY SPARKLE ── */}
      {hungry && !dead && <text x="82" y="108" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>}
    </svg>
  )
}
