// ── NagaSVG — Nananaga — graduated from canvas mockup ────────────────────────
import React, { useState } from 'react'

let _ng = 0

export default function NagaSVG({ state = 'idle', size = 100, variant = 'pet_nananaga' }) {
  const [uid] = useState(() => `ng${++_ng}`)
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const isMerah = variant === 'pet_nananaga_merah'
  const isEs = variant === 'pet_nananaga_es'
  const palette = dead
    ? {
        body1: '#3a4a3a', body2: '#2a3a2a', body3: '#1a2a1a',
        belly1: '#4a6a4a', belly2: '#3a5a3a', head2: '#223322', head3: '#121a12',
        wing1: '#1A2A1A', wing2: '#0D1A0D', wing3: '#050D05',
        line: '#1E3A1E', lineSoft: '#2A5A2A', spine: '#3F6A3F', horn: '#888',
        eyeGlow: '#777', eye: '#777', snout: '#223322', snoutDark: '#1a2a1a',
        breath1: '#aaa', breath2: '#888', accent: '#888',
      }
    : isMerah
      ? {
          body1: '#991B1B', body2: '#7F1D1D', body3: '#450A0A',
          belly1: '#F97316', belly2: '#DC2626', head2: '#6B0000', head3: '#2D0000',
          wing1: '#2D0000', wing2: '#1A0000', wing3: '#0A0000',
          line: '#2D0000', lineSoft: '#6B0000', spine: '#DC2626', horn: '#EF4444',
          eyeGlow: '#FF2200', eye: '#FF2200', snout: '#450A0A', snoutDark: '#1A0000',
          breath1: '#FFFFFF', breath2: '#F97316', accent: '#DC2626',
        }
      : isEs
        ? {
            body1: '#0EA5E9', body2: '#0369A1', body3: '#082F49',
            belly1: '#E0F7FF', belly2: '#7DD3FC', head2: '#075985', head3: '#082F49',
            wing1: '#082F49', wing2: '#041C2C', wing3: '#020C14',
            line: '#082F49', lineSoft: '#0EA5E9', spine: '#38BDF8', horn: '#38BDF8',
            eyeGlow: '#38BDF8', eye: '#38BDF8', snout: '#075985', snoutDark: '#041C2C',
            breath1: '#FFFFFF', breath2: '#7DD3FC', accent: '#38BDF8',
          }
        : {
            body1: '#1E6B4A', body2: '#155235', body3: '#0A3322',
            belly1: '#3CB878', belly2: '#28A060', head2: '#0F4A30', head3: '#072018',
            wing1: '#1A2A1A', wing2: '#0D1A0D', wing3: '#050D05',
            line: '#1E3A1E', lineSoft: '#2A5A2A', spine: '#0F8A45', horn: '#F59E0B',
            eyeGlow: '#FF6B00', eye: '#FF6B00', snout: '#0F4A30', snoutDark: '#072018',
            breath1: '#FFFFFF', breath2: '#F97316', accent: '#0F8A45',
          }

  const css = `
    @keyframes ${uid}-wing-l {
      0%,100% { transform: rotate(0deg) scaleX(1);    transform-origin: 100% 60%; }
      40%     { transform: rotate(-18deg) scaleX(1.08); transform-origin: 100% 60%; }
      70%     { transform: rotate(-8deg) scaleX(1.04); transform-origin: 100% 60%; }
    }
    @keyframes ${uid}-wing-r {
      0%,100% { transform: rotate(0deg) scaleX(1);   transform-origin: 0% 60%; }
      40%     { transform: rotate(18deg) scaleX(1.08); transform-origin: 0% 60%; }
      70%     { transform: rotate(8deg) scaleX(1.04); transform-origin: 0% 60%; }
    }
    @keyframes ${uid}-fire {
      0%,100% { opacity: 0.7; transform: scaleX(1) scaleY(1); }
      50%     { opacity: 1;   transform: scaleX(1.15) scaleY(1.1); }
    }
    @keyframes ${uid}-eye-glow {
      0%,100% { filter: drop-shadow(0 0 3px ${palette.eyeGlow}); }
      50%     { filter: drop-shadow(0 0 12px ${palette.eyeGlow}); }
    }
    @keyframes ${uid}-aura {
      0%,100% { opacity: 0.3; transform: scale(1); }
      50%     { opacity: 0.6; transform: scale(1.05); }
    }
    @keyframes ${uid}-sparkle {
      0%,100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
      50%     { opacity: 1; transform: scale(1.3) rotate(180deg); }
    }
    .${uid}-wing-l    { animation: ${uid}-wing-l ${dead || sleeping ? 'none' : '1.8s ease-in-out infinite'}; }
    .${uid}-wing-r    { animation: ${uid}-wing-r ${dead || sleeping ? 'none' : '1.8s ease-in-out infinite'}; }
    .${uid}-fire      { animation: ${uid}-fire   ${dead ? 'none' : '1.2s ease-in-out infinite'}; transform-origin: left center; }
    .${uid}-eye-glow  { animation: ${uid}-eye-glow ${dead ? 'none' : '1.5s ease-in-out infinite'}; }
    .${uid}-aura-ring { animation: ${uid}-aura 2s ease-in-out infinite; }
    .${uid}-sr1 { animation: ${uid}-sparkle 2s 0s ease-in-out infinite; }
    .${uid}-sr2 { animation: ${uid}-sparkle 2s 0.6s ease-in-out infinite; }
    .${uid}-sr3 { animation: ${uid}-sparkle 2s 1.2s ease-in-out infinite; }
    .${uid}-sr4 { animation: ${uid}-sparkle 2s 0.4s ease-in-out infinite; }
  `

  return (
    <svg
      width={size}
      height={size * 0.975}
      viewBox="0 0 200 195"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <style>{css}</style>
      <defs>
        <radialGradient id={`${uid}-body`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor={palette.body1}/>
          <stop offset="50%"  stopColor={palette.body2}/>
          <stop offset="100%" stopColor={palette.body3}/>
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={palette.belly1}/>
          <stop offset="60%"  stopColor={palette.belly2}/>
          <stop offset="100%" stopColor={isMerah ? '#991B1B' : isEs ? '#38BDF8' : '#1E7A48'}/>
        </radialGradient>
        <radialGradient id={`${uid}-head`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={palette.body1}/>
          <stop offset="55%"  stopColor={palette.head2}/>
          <stop offset="100%" stopColor={palette.head3}/>
        </radialGradient>
        <radialGradient id={`${uid}-wing-l`} cx="80%" cy="20%" r="80%">
          <stop offset="0%"   stopColor={palette.wing1}/>
          <stop offset="60%"  stopColor={palette.wing2}/>
          <stop offset="100%" stopColor={palette.wing3}/>
        </radialGradient>
        <radialGradient id={`${uid}-wing-r`} cx="20%" cy="20%" r="80%">
          <stop offset="0%"   stopColor={palette.wing1}/>
          <stop offset="60%"  stopColor={palette.wing2}/>
          <stop offset="100%" stopColor={palette.wing3}/>
        </radialGradient>
        <radialGradient id={`${uid}-fire`} cx="5%" cy="50%" r="95%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="20%"  stopColor={isEs ? '#E0F7FF' : '#FBBF24'}/>
          <stop offset="55%"  stopColor={palette.breath2}/>
          <stop offset="100%" stopColor={isEs ? 'rgba(2,132,199,0)' : 'rgba(239,68,68,0)'}/>
        </radialGradient>
        <filter id={`${uid}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-soft`}>
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>

      {isEs && !dead && (
        <>
          <circle cx="22" cy="55" r="2" fill="#E0F2FE" opacity=".9"/>
          <circle cx="176" cy="68" r="1.8" fill="#BAE6FD" opacity=".85"/>
          <text x="28" y="118" fontSize="9" fill="#BAE6FD" opacity=".75">❄</text>
        </>
      )}

      {/* Aura ring */}
      {!dead && (
        <ellipse cx="100" cy="180" rx="50" ry="10"
          fill={isMerah ? 'rgba(220,38,38,0.35)' : isEs ? 'rgba(56,189,248,0.3)' : 'rgba(251,146,60,0.25)'}
          filter={`url(#${uid}-soft)`} className={`${uid}-aura-ring`}/>
      )}

      {/* Sparkles (rare effect) */}
      {!dead && !sleeping && (
        <>
          <text className={`${uid}-sr1`} x="18" y="52" fontSize="14" fill={isEs ? '#38BDF8' : isMerah ? '#EF4444' : '#FB923C'}>✦</text>
          <text className={`${uid}-sr2`} x="172" y="85" fontSize="10" fill={isEs ? '#7DD3FC' : isMerah ? '#F97316' : '#F87171'}>{isEs ? '❄' : '✦'}</text>
          <text className={`${uid}-sr3`} x="14" y="152" fontSize="8" fill={isEs ? '#BAE6FD' : isMerah ? '#EF4444' : '#FB923C'}>{isEs ? '❄' : '★'}</text>
          <text className={`${uid}-sr4`} x="148" y="65" fontSize="12" fill={isEs ? '#38BDF8' : isMerah ? '#FBBF24' : '#FBBF24'}>{isEs ? '❄' : '★'}</text>
        </>
      )}

      {/* Left wing */}
      <g className={`${uid}-wing-l`} style={{ transformOrigin: '72px 108px' }}>
        <path d="M 72 108 Q 30 80 18 50 Q 22 68 32 75 Q 18 80 14 100 Q 28 90 38 96 Q 20 115 25 138 Q 42 118 58 120 Z"
          fill={`url(#${uid}-wing-l)`} stroke={palette.line} strokeWidth="1"/>
        <path d="M 72 108 Q 30 80 18 50" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.6"/>
        <path d="M 72 108 Q 18 100 14 100" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M 72 108 Q 24 136 25 138" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>

      {/* Right wing */}
      <g className={`${uid}-wing-r`} style={{ transformOrigin: '128px 108px' }}>
        <path d="M 128 108 Q 170 80 182 50 Q 178 68 168 75 Q 182 80 186 100 Q 172 90 162 96 Q 180 115 175 138 Q 158 118 142 120 Z"
          fill={`url(#${uid}-wing-r)`} stroke={palette.line} strokeWidth="1"/>
        <path d="M 128 108 Q 170 80 182 50" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.6"/>
        <path d="M 128 108 Q 182 100 186 100" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M 128 108 Q 176 136 175 138" stroke={palette.lineSoft} strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>

      {/* Tail */}
      <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136"
        stroke={palette.body3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136"
        stroke={palette.body2} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <polygon points="148,158 152,165 144,163" fill={palette.accent} opacity="0.7"/>
      <polygon points="155,150 161,155 153,155" fill={palette.accent} opacity="0.6"/>

      {/* Body */}
      <ellipse cx="100" cy="142" rx="38" ry="32" fill={`url(#${uid}-body)`} stroke={palette.body3} strokeWidth="1.4"/>
      <ellipse cx="100" cy="148" rx="22" ry="18" fill={`url(#${uid}-belly)`} opacity="0.8"/>
      {/* Scale pattern */}
      {[[-12,-10],[-4,-14],[4,-14],[12,-10],[-8,-2],[0,-5],[8,-2]].map(([dx,dy],i)=>(
        <ellipse key={i} cx={100+dx} cy={148+dy} rx="5" ry="3.5"
          fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.55"/>
      ))}
      {/* Back spines */}
      {[88,94,100,106,112].map((x,i) => (
        <polygon key={i} points={`${x},${112-i%2*4} ${x-4},128 ${x+4},128`} fill={palette.spine} opacity="0.7"/>
      ))}

      {/* Hind legs */}
      <path d="M 70 162 Q 62 175 58 178" stroke={palette.body3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 70 162 Q 62 175 58 178" stroke={palette.body2} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M 130 162 Q 138 175 142 178" stroke={palette.body3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 130 162 Q 138 175 142 178" stroke={palette.body2} strokeWidth="8" strokeLinecap="round" fill="none"/>
      {[-8,-4,0,4].map((dx,i) => <line key={i} x1={58+dx} y1="177" x2={55+dx} y2="185" stroke={palette.body3} strokeWidth="2" strokeLinecap="round"/>)}
      {[-4,0,4,8].map((dx,i) => <line key={i} x1={142+dx} y1="177" x2={139+dx} y2="185" stroke={palette.body3} strokeWidth="2" strokeLinecap="round"/>)}

      {/* Head */}
      <ellipse cx="100" cy="82" rx="36" ry="32" fill={`url(#${uid}-head)`} stroke={palette.body3} strokeWidth="1.6"/>

      {/* Horns */}
      <path d="M 82 55 Q 76 34 80 26" stroke={palette.body3} strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M 82 55 Q 76 34 80 26" stroke={palette.horn} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 118 55 Q 124 34 120 26" stroke={palette.body3} strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M 118 55 Q 124 34 120 26" stroke={palette.horn} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="80" cy="26" r="3" fill={isEs ? '#E0F7FF' : palette.horn}/>
      <circle cx="120" cy="26" r="3" fill={isEs ? '#E0F7FF' : palette.horn}/>

      {/* Head spine ridge */}
      {[88,94,100,106,112].map((x,i) => (
        <polygon key={i} points={`${x},${54-i%2*3} ${x-3},65 ${x+3},65`} fill={palette.spine} opacity="0.75"/>
      ))}

      {/* Eyes */}
      {dead ? (
        <>
          <circle cx="83" cy="80" r="9" fill={palette.head3}/>
          <circle cx="117" cy="80" r="9" fill={palette.head3}/>
          <text x="83" y="84" textAnchor="middle" fontSize="12" fill={palette.belly1} fontWeight="900">✕</text>
          <text x="117" y="84" textAnchor="middle" fontSize="12" fill={palette.belly1} fontWeight="900">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 74 80 Q 83 75 92 80" stroke={palette.body3} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 108 80 Q 117 75 126 80" stroke={palette.body3} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <text x="148" y="48" fontSize="9" fill={isEs ? '#BAE6FD' : '#A0C4FF'} fontWeight="bold" opacity="0.9">z</text>
          <text x="160" y="35" fontSize="13" fill={isEs ? '#BAE6FD' : '#A0C4FF'} fontWeight="bold" opacity="0.7">z</text>
          <text x="174" y="20" fontSize="17" fill={isEs ? '#BAE6FD' : '#A0C4FF'} fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <g className={`${uid}-eye-glow`}>
            <ellipse cx="83" cy="80" rx="11" ry="9" fill={palette.eyeGlow} opacity="0.3"/>
            <circle cx="83" cy="80" r="9" fill={palette.head3}/>
            <ellipse cx="83" cy="80" rx={hungry ? 3 : 5} ry={hungry ? 6 : 7} fill={palette.eye}/>
            <ellipse cx="83" cy="80" rx="2" ry="4" fill={isEs ? '#0EA5E9' : '#8B0000'}/>
            <circle  cx="86" cy="77" r="2"  fill="white" opacity="0.7"/>
          </g>
          <g className={`${uid}-eye-glow`}>
            <ellipse cx="117" cy="80" rx="11" ry="9" fill={palette.eyeGlow} opacity="0.3"/>
            <circle cx="117" cy="80" r="9" fill={palette.head3}/>
            <ellipse cx="117" cy="80" rx={hungry ? 3 : 5} ry={hungry ? 6 : 7} fill={palette.eye}/>
            <ellipse cx="117" cy="80" rx="2" ry="4" fill={isEs ? '#0EA5E9' : '#8B0000'}/>
            <circle  cx="120" cy="77" r="2"  fill="white" opacity="0.7"/>
          </g>
          {happy && (
            <>
              <path d="M 70 70 Q 83 64 96 70" stroke={palette.spine} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M 104 70 Q 117 64 130 70" stroke={palette.spine} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* Snout */}
      <path d="M 86 96 Q 100 106 114 96 L 118 90 Q 100 98 82 90 Z" fill={palette.body3}/>
      <ellipse cx="100" cy="96" rx="18" ry="10" fill={palette.snout} stroke={palette.body3} strokeWidth="1"/>
      <ellipse cx="94" cy="95" rx="3" ry="2" fill={palette.snoutDark}/>
      <ellipse cx="106" cy="95" rx="3" ry="2" fill={palette.snoutDark}/>

      {/* Teeth */}
      {!sleeping && (
        <>
          <path d="M 84 103 Q 100 112 116 103" stroke={palette.body3} strokeWidth="1.5" fill="none"/>
          {[90,96,100,104,110].map((x,i)=>(
            <polygon key={i} points={`${x},103 ${x-2.5},109 ${x+2.5},109`}
              fill={dead ? '#8aaa8a' : 'white'} opacity="0.9"/>
          ))}
        </>
      )}

      {/* Fire breath */}
      {!dead && (
        <g className={`${uid}-fire`} style={{ transformOrigin: '84px 103px' }}>
          <ellipse cx="58" cy="105" rx={happy ? 32 : 26} ry="8"
            fill={`url(#${uid}-fire)`} filter={`url(#${uid}-glow)`}/>
          <ellipse cx="55" cy="103" rx={happy ? 22 : 18} ry="5" fill={isEs ? 'rgba(224,247,255,0.6)' : 'rgba(255,255,200,0.5)'}/>
          <ellipse cx="60" cy="108" rx={happy ? 24 : 20} ry="4" fill={isEs ? 'rgba(56,189,248,0.45)' : isMerah ? 'rgba(249,115,22,0.5)' : 'rgba(249,115,22,0.4)'}/>
          {isEs && <text x="28" y="108" fontSize="9" fill="rgba(186,230,253,0.7)">❄</text>}
        </g>
      )}

      {/* Hungry indicator */}
      {hungry && !dead && (
        <text x="160" y="185" fontSize="14" fill={isEs ? '#7DD3FC' : isMerah ? '#FBBF24' : '#FFB347'} opacity="0.85">💫</text>
      )}
    </svg>
  )
}
