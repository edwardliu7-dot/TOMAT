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
  const palette = dead
    ? {
        bodyLight: '#888', bodyMid: '#666', bodyDark: '#444',
        faceLight: '#b0a090', faceMid: '#908070', faceDark: '#707060',
        bellyLight: '#b0a090', bellyDark: '#908070', eyeLight: '#777', eyeDark: '#444',
        outline: '#4d4035', limb: '#666', limbDark: '#444', accent: '#777', cheek: '#888',
      }
    : isKosmik
      ? {
          bodyLight: '#7C3AED', bodyMid: '#5B21B6', bodyDark: '#2E1065',
          faceLight: '#A78BFA', faceMid: '#7C3AED', faceDark: '#4C1D95',
          bellyLight: '#DDD6FE', bellyDark: '#A78BFA', eyeLight: '#A855F7', eyeDark: '#2E1065',
          outline: '#2E1065', limb: '#5B21B6', limbDark: '#2E1065', accent: '#C084FC', cheek: '#7C3AED',
        }
      : {
          bodyLight: '#C4875A', bodyMid: '#A0633A', bodyDark: '#7A4520',
          faceLight: '#F5C89A', faceMid: '#E8A870', faceDark: '#C88040',
          bellyLight: '#F5C89A', bellyDark: '#E8A870', eyeLight: '#2D1A00', eyeDark: '#0D0800',
          outline: '#6A3818', limb: '#A0633A', limbDark: '#7A4520', accent: '#D4AF37', cheek: '#FF9999',
        }

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
    .${uid}-sp4   { animation: ${uid}-sparkle 2s 0.3s ease-in-out infinite; }
    .${uid}-crown { animation: ${uid}-sparkle 2s ease-in-out infinite; }
    .${uid}-eye-glow { animation: ${uid}-sparkle 1.8s ease-in-out infinite; }
  `

  // canvas viewBox: 170×190 → scale to size (normalise to 160 wide for consistency)
  return (
    <svg
      width={size}
      height={size * 1.1176}
      viewBox="0 0 170 190"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <style>{css}</style>
      <defs>
        <radialGradient id={`${uid}-body`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor={palette.bodyLight}/>
          <stop offset="55%"  stopColor={palette.bodyMid}/>
          <stop offset="100%" stopColor={palette.bodyDark}/>
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="45%" cy="40%" r="58%">
          <stop offset="0%"   stopColor={palette.faceLight}/>
          <stop offset="60%"  stopColor={palette.faceMid}/>
          <stop offset="100%" stopColor={palette.faceDark}/>
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={palette.bellyLight}/>
          <stop offset="100%" stopColor={palette.bellyDark}/>
        </radialGradient>
        <radialGradient id={`${uid}-eye`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor={palette.eyeLight}/>
          <stop offset="100%" stopColor={palette.eyeDark}/>
        </radialGradient>
        <filter id={`${uid}-soft`}>
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
        <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A"/>
          <stop offset="50%" stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#92400E"/>
        </linearGradient>
      </defs>

      {isKosmik && !dead && (
        <>
          <circle cx="24" cy="47" r="2" fill="#E9D5FF" opacity=".9"/>
          <circle cx="150" cy="54" r="1.6" fill="#C4B5FD" opacity=".8"/>
          <circle cx="143" cy="133" r="1.8" fill="#F0ABFC" opacity=".75"/>
          <circle cx="55" cy="60" r="1.5" fill="#C084FC" opacity=".7"/>
          <circle cx="62" cy="52" r="1" fill="#93C5FD" opacity=".6"/>
          <circle cx="70" cy="58" r="1.2" fill="#C084FC" opacity=".65"/>
          <line x1="55" y1="60" x2="62" y2="52" stroke="#A78BFA" strokeWidth=".6" opacity=".4"/>
          <line x1="62" y1="52" x2="70" y2="58" stroke="#A78BFA" strokeWidth=".6" opacity=".4"/>
        </>
      )}

      {isRaja && !dead && (
        <g className={`${uid}-crown`}>
          <path d="M 66 55 L 70 35 L 78 49 L 85 30 L 92 49 L 100 35 L 104 55 Z"
            fill={`url(#${uid}-crown)`} stroke="#92400E" strokeWidth="1"/>
          <circle cx="85" cy="42" r="3" fill="#60A5FA"/>
          <circle cx="70" cy="46" r="2.5" fill="#EF4444"/>
          <circle cx="100" cy="46" r="2.5" fill="#34D399"/>
        </g>
      )}

      {/* Variant aura glow (only when alive) */}
      {!dead && <ellipse cx="85" cy="170" rx="45" ry="10" fill={isRaja ? 'rgba(212,175,55,0.25)' : 'rgba(168,85,247,0.3)'} filter={`url(#${uid}-soft)`}/>}

      {/* Variant sparkles */}
      {!dead && !sleeping && (
        <>
          <text className={`${uid}-sp1`} x="18" y="58" fontSize="14" fill={isRaja ? '#D4AF37' : '#C084FC'}>✦</text>
          <text className={`${uid}-sp2`} x="148" y="75" fontSize="10" fill={isRaja ? '#FBBF24' : '#A78BFA'}>{isRaja ? '★' : '✦'}</text>
          <text className={`${uid}-sp3`} x="12" y="148" fontSize="8" fill={isRaja ? '#D4AF37' : '#C084FC'}>✦</text>
          {isRaja && <text className={`${uid}-sp4`} x="142" y="58" fontSize="11" fill="#FDE68A">★</text>}
        </>
      )}

      {/* Tail */}
      <g className={`${uid}-tail`} style={{ transformOrigin: '48px 140px' }}>
        <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125"
          fill="none" stroke={palette.limbDark} strokeWidth="9" strokeLinecap="round"/>
        <path d="M 50 138 Q 20 160 15 140 Q 10 120 30 115 Q 42 110 40 125"
          fill="none" stroke={palette.limb} strokeWidth="6" strokeLinecap="round"/>
        {isRaja && <circle cx="15" cy="140" r="5" fill="#D4AF37" opacity=".8"/>}
        {isKosmik && <circle cx="15" cy="140" r="5" fill="#C084FC" opacity=".8"/>}
      </g>

      {/* Body */}
      <ellipse cx="85" cy="140" rx="36" ry="30" fill={`url(#${uid}-body)`} stroke={palette.outline} strokeWidth="1.2"/>
      <ellipse cx="85" cy="146" rx="20" ry="16" fill={`url(#${uid}-belly)`} opacity={isKosmik ? '.7' : '1'}/>
      {isRaja && <text x="85" y="152" textAnchor="middle" fontSize="14" fill="rgba(212,175,55,.55)">♛</text>}
      {isKosmik && (
        <>
          <path d="M 72 135 Q 85 128 98 135" stroke="rgba(192,132,252,.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M 75 144 Q 85 140 95 144" stroke="rgba(192,132,252,.3)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <circle cx="78" cy="131" r="1.5" fill="#C084FC" opacity=".6"/>
          <circle cx="92" cy="129" r="1" fill="#93C5FD" opacity=".6"/>
          <circle cx="86" cy="152" r="1.5" fill="#C084FC" opacity=".5"/>
        </>
      )}

      {/* Legs */}
      <ellipse cx="70" cy="166" rx="11" ry="8" fill={palette.limb} stroke={palette.outline} strokeWidth="1"/>
      <ellipse cx="100" cy="168" rx="11" ry="8" fill={palette.limb} stroke={palette.outline} strokeWidth="1"/>
      {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={70+dx} cy={173} rx={2.5} ry={3} fill={palette.limbDark}/>)}
      {[-5,-1.5,2].map((dx,i) => <ellipse key={i} cx={100+dx} cy={175} rx={2.5} ry={3} fill={palette.limbDark}/>)}

      {/* Arms */}
      <path d="M 52 132 Q 40 148 45 158" stroke={palette.limbDark} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M 52 132 Q 40 148 45 158" stroke={palette.limb} strokeWidth="7" strokeLinecap="round" fill="none"/>
      <ellipse cx="44" cy="160" rx="8" ry="6" fill={palette.limbDark}/>
      <path d="M 118 132 Q 130 148 125 158" stroke={palette.limbDark} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M 118 132 Q 130 148 125 158" stroke={palette.limb} strokeWidth="7" strokeLinecap="round" fill="none"/>
      <ellipse cx="126" cy="160" rx="8" ry="6" fill={palette.limbDark}/>

      {/* Head */}
      <ellipse cx="85" cy="88" rx="36" ry="34" fill={`url(#${uid}-body)`} stroke={palette.outline} strokeWidth="1.4"/>

      {/* Left ear */}
      <g className={`${uid}-ear-l`} style={{ transformOrigin: '52px 88px' }}>
        <circle cx="50" cy="84" r="14" fill={palette.limb} stroke={palette.outline} strokeWidth="1.2"/>
        <circle cx="50" cy="84" r="9"  fill={`url(#${uid}-face)`}/>
      </g>
      {/* Right ear */}
      <g className={`${uid}-ear-r`} style={{ transformOrigin: '120px 88px' }}>
        <circle cx="120" cy="84" r="14" fill={palette.limb} stroke={palette.outline} strokeWidth="1.2"/>
        <circle cx="120" cy="84" r="9"  fill={`url(#${uid}-face)`}/>
      </g>

      {/* Face oval */}
      <ellipse cx="85" cy="94" rx="26" ry="22" fill={`url(#${uid}-face)`}/>

      {/* Eyes */}
      {dead ? (
        <>
          <circle cx="74" cy="84" r="9" fill="white"/>
          <circle cx="96" cy="84" r="9" fill="white"/>
          <text x="74" y="88" textAnchor="middle" fontSize="13" fill={palette.accent} fontWeight="900">✕</text>
          <text x="96" y="88" textAnchor="middle" fontSize="13" fill={palette.accent} fontWeight="900">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 65 84 Q 74 79 83 84" stroke={palette.outline} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 87 84 Q 96 79 105 84" stroke={palette.outline} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
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
          <path d="M 68 76 Q 74 73 80 76" stroke={isKosmik ? '#A78BFA' : palette.outline} strokeWidth="2"
            fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,3)' : happy ? 'translate(0,-2)' : ''}/>
          <path d="M 90 76 Q 96 73 102 76" stroke={isKosmik ? '#A78BFA' : palette.outline} strokeWidth="2"
            fill="none" strokeLinecap="round"
            transform={hungry ? 'translate(0,3)' : happy ? 'translate(0,-2)' : ''}/>
        </>
      )}

      {/* Nose */}
      <ellipse cx="85" cy="99" rx="5" ry="3.5" fill={palette.outline}/>
      {!dead && <ellipse cx="83.5" cy="97.8" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)"/>}

      {/* Mouth */}
      {dead ? (
        <path d="M 78 104 Q 85 100 92 104" stroke={palette.outline} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      ) : hungry ? (
        <>
          <path d="M 78 104 Q 85 100 92 104" stroke={palette.outline} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <text x="135" y="178" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
        </>
      ) : (
        <>
          <path d="M 75 104 Q 85 112 95 104" stroke={palette.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M 78 107 Q 85 114 92 107" fill={isKosmik ? '#A78BFA' : '#FF8FA8'} stroke="none" opacity="0.6"/>
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
      <ellipse cx="85" cy="55" rx="12" ry="8" fill={palette.bodyLight} opacity="0.7"/>
      <path d="M 80 52 Q 85 44 90 52" stroke={palette.limb} strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Epic crown halo */}
      {!dead && (
        <ellipse cx="85" cy="56" rx="30" ry="6"
          fill="none" stroke={isRaja ? 'rgba(212,175,55,0.5)' : 'rgba(168,85,247,0.5)'} strokeWidth="1.5" strokeDasharray="4 3"/>
      )}
    </svg>
  )
}
