// ── MonyetSVG — Monyong — graduated from canvas mockup ───────────────────────
import React, { useState } from 'react'

let _mk = 0

export default function MonyetSVG({ state = 'idle', size = 100, variant = 'pet_monyong' }) {
  const [uid] = useState(() => `mk${++_mk}`)
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const isRaja = variant === 'pet_monyong_raja'
  const isKosmik = variant === 'pet_monyong_kosmik'
  const variantFilter = isRaja
    ? 'saturate(1.18) sepia(.25) hue-rotate(345deg)'
    : isKosmik ? 'saturate(1.65) hue-rotate(210deg) brightness(.92)' : undefined

  const css = `
    @keyframes ${uid}-tail-swing {
      0%,100% { transform: rotate(-20deg); transform-origin: 0% 0%; }
      50%     { transform: rotate(20deg);  transform-origin: 0% 0%; }
    }
    @keyframes ${uid}-ear-l {
      0%,88%,100% { transform: rotate(0deg);  transform-origin: 100% 60%; }
      92%         { transform: rotate(-6deg); transform-origin: 100% 60%; }
    }
    @keyframes ${uid}-ear-r {
      0%,82%,100% { transform: rotate(0deg); transform-origin: 0% 60%; }
      86%         { transform: rotate(6deg); transform-origin: 0% 60%; }
    }
    @keyframes ${uid}-sparkle {
      0%,100% { opacity: 0; transform: scale(0.5); }
      50%     { opacity: 1; transform: scale(1.2); }
    }
    .${uid}-tail  { animation: ${uid}-tail-swing ${dead ? 'none' : '1.8s ease-in-out infinite'}; }
    .${uid}-ear-l { animation: ${uid}-ear-l ${sleeping || dead ? 'none' : '5s ease-in-out infinite'}; }
    .${uid}-ear-r { animation: ${uid}-ear-r ${sleeping || dead ? 'none' : '4.5s ease-in-out infinite'}; }
    .${uid}-sp1   { animation: ${uid}-sparkle 2s 0.1s ease-in-out infinite; }
    .${uid}-sp2   { animation: ${uid}-sparkle 2s 0.7s ease-in-out infinite; }
    .${uid}-sp3   { animation: ${uid}-sparkle 2s 1.3s ease-in-out infinite; }
  `

  // canvas viewBox: 170×190 → scale to size (normalise to 160 wide for consistency)
  return (
    <svg
      width={size}
      height={size * 1.1176}
      viewBox="0 0 170 190"
      style={{ overflow: 'visible', display: 'block', filter: variantFilter }}
    >
      <style>{css}</style>
      <defs>
        <radialGradient id={`${uid}-body`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor={dead ? '#888' : '#C4875A'}/>
          <stop offset="55%"  stopColor={dead ? '#666' : '#A0633A'}/>
          <stop offset="100%" stopColor={dead ? '#444' : '#7A4520'}/>
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="45%" cy="40%" r="58%">
          <stop offset="0%"   stopColor={dead ? '#b0a090' : '#F5C89A'}/>
          <stop offset="60%"  stopColor={dead ? '#908070' : '#E8A870'}/>
          <stop offset="100%" stopColor={dead ? '#707060' : '#C88040'}/>
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={dead ? '#b0a090' : '#F5C89A'}/>
          <stop offset="100%" stopColor={dead ? '#908070' : '#E8A870'}/>
        </radialGradient>
        <radialGradient id={`${uid}-eye`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#2D1A00"/>
          <stop offset="100%" stopColor="#0D0800"/>
        </radialGradient>
        <filter id={`${uid}-soft`}>
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>

      {isKosmik && !dead && (
        <>
          <circle cx="24" cy="47" r="2" fill="#E9D5FF" opacity=".9"/>
          <circle cx="150" cy="54" r="1.6" fill="#C4B5FD" opacity=".8"/>
          <circle cx="143" cy="133" r="1.8" fill="#F0ABFC" opacity=".75"/>
        </>
      )}

      {isRaja && !dead && (
        <g>
          <path d="M 66 55 L 70 35 L 78 49 L 85 30 L 92 49 L 100 35 L 104 55 Z"
            fill="#D4AF37" stroke="#92400E" strokeWidth="1"/>
          <circle cx="85" cy="42" r="3" fill="#60A5FA"/>
          <circle cx="70" cy="46" r="2.5" fill="#EF4444"/>
          <circle cx="100" cy="46" r="2.5" fill="#34D399"/>
        </g>
      )}

      {/* Epic aura glow (only when alive) */}
      {!dead && <ellipse cx="85" cy="170" rx="45" ry="10" fill="rgba(168,85,247,0.2)" filter={`url(#${uid}-soft)`}/>}

      {/* Epic sparkles */}
      {!dead && !sleeping && (
        <>
          <text className={`${uid}-sp1`} x="18" y="58" fontSize="14" fill="#C084FC">✦</text>
          <text className={`${uid}-sp2`} x="148" y="75" fontSize="10" fill="#A78BFA">✦</text>
          <text className={`${uid}-sp3`} x="12" y="148" fontSize="8"  fill="#C084FC">✦</text>
        </>
      )}

      {/* Tail */}
      <g className={`${uid}-tail`} style={{ transformOrigin: '48px 140px' }}>
        <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125"
          fill="none" stroke="#7A4520" strokeWidth="9" strokeLinecap="round"/>
        <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125"
          fill="none" stroke="#A0633A" strokeWidth="6" strokeLinecap="round"/>
      </g>

      {/* Body */}
      <ellipse cx="85" cy="140" rx="36" ry="30" fill={`url(#${uid}-body)`} stroke="#6A3818" strokeWidth="1.2"/>
      <ellipse cx="85" cy="146" rx="20" ry="16" fill={`url(#${uid}-belly)`}/>

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
      <ellipse cx="85" cy="88" rx="36" ry="34" fill={`url(#${uid}-body)`} stroke="#6A3818" strokeWidth="1.4"/>

      {/* Left ear */}
      <g className={`${uid}-ear-l`} style={{ transformOrigin: '52px 88px' }}>
        <circle cx="50" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
        <circle cx="50" cy="84" r="9"  fill={`url(#${uid}-face)`}/>
      </g>
      {/* Right ear */}
      <g className={`${uid}-ear-r`} style={{ transformOrigin: '120px 88px' }}>
        <circle cx="120" cy="84" r="14" fill="#A0633A" stroke="#6A3818" strokeWidth="1.2"/>
        <circle cx="120" cy="84" r="9"  fill={`url(#${uid}-face)`}/>
      </g>

      {/* Face oval */}
      <ellipse cx="85" cy="94" rx="26" ry="22" fill={`url(#${uid}-face)`}/>

      {/* Eyes */}
      {dead ? (
        <>
          <circle cx="74" cy="84" r="9" fill="white"/>
          <circle cx="96" cy="84" r="9" fill="white"/>
          <text x="74" y="88" textAnchor="middle" fontSize="13" fill="#A0633A" fontWeight="900">✕</text>
          <text x="96" y="88" textAnchor="middle" fontSize="13" fill="#A0633A" fontWeight="900">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 65 84 Q 74 79 83 84" stroke="#6A3818" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 87 84 Q 96 79 105 84" stroke="#6A3818" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <text x="130" y="52" fontSize="9"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="140" y="40" fontSize="13" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="152" y="27" fontSize="17" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <circle cx="74" cy="84" r="9" fill="white"/>
          <circle cx="96" cy="84" r="9" fill="white"/>
          <circle cx="75" cy="85" r={hungry ? 5 : 6.5} fill={`url(#${uid}-eye)`}/>
          <circle cx="97" cy="85" r={hungry ? 5 : 6.5} fill={`url(#${uid}-eye)`}/>
          <circle cx="77" cy="82" r="2.5" fill="white" opacity="0.95"/>
          <circle cx="99" cy="82" r="2.5" fill="white" opacity="0.95"/>
          <circle cx="76" cy="87" r="1"   fill="white" opacity="0.4"/>
          <circle cx="98" cy="87" r="1"   fill="white" opacity="0.4"/>
          {/* Eyebrows */}
          <path d="M 68 76 Q 74 73 80 76" stroke="#6A3818" strokeWidth="2"
            fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,3)' : happy ? 'translate(0,-2)' : ''}/>
          <path d="M 90 76 Q 96 73 102 76" stroke="#6A3818" strokeWidth="2"
            fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,3)' : happy ? 'translate(0,-2)' : ''}/>
        </>
      )}

      {/* Nose */}
      <ellipse cx="85" cy="99" rx="5" ry="3.5" fill={dead ? '#A0633A' : '#6A3818'}/>
      {!dead && <ellipse cx="83.5" cy="97.8" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>}

      {/* Mouth */}
      {dead ? (
        <path d="M 78 104 Q 85 100 92 104" stroke="#6A3818" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : hungry ? (
        <>
          <path d="M 78 104 Q 85 100 92 104" stroke="#6A3818" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <text x="135" y="178" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
        </>
      ) : (
        <>
          <path d="M 75 104 Q 85 112 95 104" stroke="#6A3818" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M 78 107 Q 85 114 92 107" fill="#FF8FA8" stroke="none" opacity="0.6"/>
          <rect x="81" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
          <rect x="85.5" y="105" width="4" height="4" rx="1" fill="white" opacity="0.9"/>
        </>
      )}

      {/* Cheeks */}
      {!dead && (
        <>
          <ellipse cx="62"  cy="94" rx="9" ry="6" fill={hungry ? '#FFD0A8' : '#FF9999'} opacity="0.35"/>
          <ellipse cx="108" cy="94" rx="9" ry="6" fill={hungry ? '#FFD0A8' : '#FF9999'} opacity="0.35"/>
        </>
      )}

      {/* Head tuft */}
      <ellipse cx="85" cy="55" rx="12" ry="8" fill="#C4875A" opacity="0.7"/>
      <path d="M 80 52 Q 85 44 90 52" stroke="#A0633A" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Epic crown halo */}
      {!dead && (
        <ellipse cx="85" cy="56" rx="30" ry="6"
          fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" strokeDasharray="4 3"/>
      )}
    </svg>
  )
}
