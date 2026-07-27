// ── NagaSVG — Nananaga — graduated from canvas mockup ────────────────────────
import React, { useState } from 'react'

let _ng = 0

export default function NagaSVG({ state = 'idle', size = 100 }) {
  const [uid] = useState(() => `ng${++_ng}`)
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'

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
      0%,100% { filter: drop-shadow(0 0 3px #FF6B00); }
      50%     { filter: drop-shadow(0 0 9px #FF6B00); }
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

  const bodyColor   = dead ? '#3a4a3a' : '#1E6B4A'
  const bodyColor2  = dead ? '#2a3a2a' : '#155235'
  const bodyColor3  = dead ? '#1a2a1a' : '#0A3322'
  const bellyColor  = dead ? '#4a6a4a' : '#3CB878'
  const bellyColor2 = dead ? '#3a5a3a' : '#28A060'

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
          <stop offset="0%"   stopColor={bodyColor}/>
          <stop offset="50%"  stopColor={bodyColor2}/>
          <stop offset="100%" stopColor={bodyColor3}/>
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor={bellyColor}/>
          <stop offset="60%"  stopColor={bellyColor2}/>
          <stop offset="100%" stopColor={dead ? '#2a4a2a' : '#1E7A48'}/>
        </radialGradient>
        <radialGradient id={`${uid}-head`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={bodyColor}/>
          <stop offset="55%"  stopColor={dead ? '#223322' : '#0F4A30'}/>
          <stop offset="100%" stopColor={dead ? '#121a12' : '#072018'}/>
        </radialGradient>
        <radialGradient id={`${uid}-wing-l`} cx="80%" cy="20%" r="80%">
          <stop offset="0%"   stopColor="#1A2A1A"/>
          <stop offset="60%"  stopColor="#0D1A0D"/>
          <stop offset="100%" stopColor="#050D05"/>
        </radialGradient>
        <radialGradient id={`${uid}-wing-r`} cx="20%" cy="20%" r="80%">
          <stop offset="0%"   stopColor="#1A2A1A"/>
          <stop offset="60%"  stopColor="#0D1A0D"/>
          <stop offset="100%" stopColor="#050D05"/>
        </radialGradient>
        <radialGradient id={`${uid}-fire`} cx="5%" cy="50%" r="95%">
          <stop offset="0%"   stopColor="#FFFFFF"/>
          <stop offset="20%"  stopColor="#FBBF24"/>
          <stop offset="55%"  stopColor="#F97316"/>
          <stop offset="100%" stopColor="rgba(239,68,68,0)"/>
        </radialGradient>
        <filter id={`${uid}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-soft`}>
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>

      {/* Aura ring */}
      {!dead && (
        <ellipse cx="100" cy="180" rx="50" ry="10"
          fill="rgba(251,146,60,0.25)" filter={`url(#${uid}-soft)`} className={`${uid}-aura-ring`}/>
      )}

      {/* Sparkles (rare effect) */}
      {!dead && !sleeping && (
        <>
          <text className={`${uid}-sr1`} x="18" y="52" fontSize="14" fill="#FB923C">✦</text>
          <text className={`${uid}-sr2`} x="172" y="85" fontSize="10" fill="#F87171">✦</text>
          <text className={`${uid}-sr3`} x="14" y="152" fontSize="8"  fill="#FB923C">✦</text>
          <text className={`${uid}-sr4`} x="148" y="65" fontSize="12" fill="#FBBF24">★</text>
        </>
      )}

      {/* Left wing */}
      <g className={`${uid}-wing-l`} style={{ transformOrigin: '72px 108px' }}>
        <path d="M 72 108 Q 30 80 18 50 Q 22 68 32 75 Q 18 80 14 100 Q 28 90 38 96 Q 20 115 25 138 Q 42 118 58 120 Z"
          fill={`url(#${uid}-wing-l)`} stroke="#1E3A1E" strokeWidth="1"/>
        <path d="M 72 108 Q 30 80 18 50" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.6"/>
        <path d="M 72 108 Q 18 100 14 100" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M 72 108 Q 24 136 25 138" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>

      {/* Right wing */}
      <g className={`${uid}-wing-r`} style={{ transformOrigin: '128px 108px' }}>
        <path d="M 128 108 Q 170 80 182 50 Q 178 68 168 75 Q 182 80 186 100 Q 172 90 162 96 Q 180 115 175 138 Q 158 118 142 120 Z"
          fill={`url(#${uid}-wing-r)`} stroke="#1E3A1E" strokeWidth="1"/>
        <path d="M 128 108 Q 170 80 182 50" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.6"/>
        <path d="M 128 108 Q 182 100 186 100" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.5"/>
        <path d="M 128 108 Q 176 136 175 138" stroke="#2A5A2A" strokeWidth="0.8" fill="none" opacity="0.4"/>
      </g>

      {/* Tail */}
      <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136"
        stroke={bodyColor3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 115 148 Q 138 162 148 158 Q 162 150 156 140 Q 152 132 142 136"
        stroke={bodyColor2} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <polygon points="148,158 152,165 144,163" fill="#0F8A45" opacity="0.7"/>
      <polygon points="155,150 161,155 153,155" fill="#0F8A45" opacity="0.6"/>

      {/* Body */}
      <ellipse cx="100" cy="142" rx="38" ry="32" fill={`url(#${uid}-body)`} stroke={bodyColor3} strokeWidth="1.4"/>
      <ellipse cx="100" cy="148" rx="22" ry="18" fill={`url(#${uid}-belly)`} opacity="0.8"/>
      {/* Scale pattern */}
      {[[-12,-10],[-4,-14],[4,-14],[12,-10],[-8,-2],[0,-5],[8,-2]].map(([dx,dy],i)=>(
        <ellipse key={i} cx={100+dx} cy={148+dy} rx="5" ry="3.5"
          fill="none" stroke="rgba(60,184,120,0.4)" strokeWidth="0.8"/>
      ))}
      {/* Back spines */}
      {[88,94,100,106,112].map((x,i) => (
        <polygon key={i} points={`${x},${112-i%2*4} ${x-4},128 ${x+4},128`} fill="#0F8A45" opacity="0.65"/>
      ))}

      {/* Hind legs */}
      <path d="M 70 162 Q 62 175 58 178"  stroke={bodyColor3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 70 162 Q 62 175 58 178"  stroke={bodyColor2} strokeWidth="8"  strokeLinecap="round" fill="none"/>
      <path d="M 130 162 Q 138 175 142 178" stroke={bodyColor3} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M 130 162 Q 138 175 142 178" stroke={bodyColor2} strokeWidth="8"  strokeLinecap="round" fill="none"/>
      {[-8,-4,0,4].map((dx,i) => <line key={i} x1={58+dx} y1="177" x2={55+dx} y2="185" stroke={bodyColor3} strokeWidth="2" strokeLinecap="round"/>)}
      {[-4,0,4,8].map((dx,i) => <line key={i} x1={142+dx} y1="177" x2={139+dx} y2="185" stroke={bodyColor3} strokeWidth="2" strokeLinecap="round"/>)}

      {/* Head */}
      <ellipse cx="100" cy="82" rx="36" ry="32" fill={`url(#${uid}-head)`} stroke={bodyColor3} strokeWidth="1.6"/>

      {/* Horns */}
      <path d="M 82 55 Q 76 34 80 26" stroke={bodyColor3} strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M 82 55 Q 76 34 80 26" stroke={dead ? '#888' : '#F59E0B'} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M 118 55 Q 124 34 120 26" stroke={bodyColor3} strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M 118 55 Q 124 34 120 26" stroke={dead ? '#888' : '#F59E0B'} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="80"  cy="26" r="3" fill={dead ? '#888' : '#FBBF24'}/>
      <circle cx="120" cy="26" r="3" fill={dead ? '#888' : '#FBBF24'}/>

      {/* Head spine ridge */}
      {[88,94,100,106,112].map((x,i) => (
        <polygon key={i} points={`${x},${54-i%2*3} ${x-3},65 ${x+3},65`} fill="#0F8A45" opacity="0.7"/>
      ))}

      {/* Eyes */}
      {dead ? (
        <>
          <circle cx="83"  cy="80" r="9" fill="#1A2A10"/>
          <circle cx="117" cy="80" r="9" fill="#1A2A10"/>
          <text x="83"  y="84" textAnchor="middle" fontSize="12" fill="#3CB878" fontWeight="900">✕</text>
          <text x="117" y="84" textAnchor="middle" fontSize="12" fill="#3CB878" fontWeight="900">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 74 80 Q 83 75 92 80"  stroke={bodyColor3} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 108 80 Q 117 75 126 80" stroke={bodyColor3} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <text x="148" y="48" fontSize="9"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="160" y="35" fontSize="13" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="174" y="20" fontSize="17" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <g className={`${uid}-eye-glow`}>
            <ellipse cx="83" cy="80" rx="11" ry="9" fill="#FF6B00" opacity="0.3"/>
            <circle  cx="83" cy="80" r="9"  fill="#1A2A10"/>
            <ellipse cx="83" cy="80" rx={hungry ? 3 : 5} ry={hungry ? 6 : 7} fill="#FF6B00"/>
            <ellipse cx="83" cy="80" rx="2" ry="4" fill="#8B0000"/>
            <circle  cx="86" cy="77" r="2"  fill="white" opacity="0.7"/>
          </g>
          <g className={`${uid}-eye-glow`}>
            <ellipse cx="117" cy="80" rx="11" ry="9" fill="#FF6B00" opacity="0.3"/>
            <circle  cx="117" cy="80" r="9"  fill="#1A2A10"/>
            <ellipse cx="117" cy="80" rx={hungry ? 3 : 5} ry={hungry ? 6 : 7} fill="#FF6B00"/>
            <ellipse cx="117" cy="80" rx="2" ry="4" fill="#8B0000"/>
            <circle  cx="120" cy="77" r="2"  fill="white" opacity="0.7"/>
          </g>
          {happy && (
            <>
              <path d="M 70 70 Q 83 64 96 70"  stroke="#0F8A45" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M 104 70 Q 117 64 130 70" stroke="#0F8A45" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* Snout */}
      <path d="M 86 96 Q 100 106 114 96 L 118 90 Q 100 98 82 90 Z" fill={bodyColor3}/>
      <ellipse cx="100" cy="96" rx="18" ry="10" fill={dead ? '#223322' : '#0F4A30'} stroke={bodyColor3} strokeWidth="1"/>
      <ellipse cx="94"  cy="95" rx="3" ry="2" fill={dead ? '#1a2a1a' : '#072018'}/>
      <ellipse cx="106" cy="95" rx="3" ry="2" fill={dead ? '#1a2a1a' : '#072018'}/>

      {/* Teeth */}
      {!sleeping && (
        <>
          <path d="M 84 103 Q 100 112 116 103" stroke={bodyColor3} strokeWidth="1.5" fill="none"/>
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
          <ellipse cx="55" cy="103" rx={happy ? 22 : 18} ry="5" fill="rgba(255,255,200,0.5)"/>
          <ellipse cx="60" cy="108" rx={happy ? 24 : 20} ry="4" fill="rgba(249,115,22,0.4)"/>
        </g>
      )}

      {/* Hungry indicator */}
      {hungry && !dead && (
        <text x="160" y="185" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
      )}
    </svg>
  )
}
