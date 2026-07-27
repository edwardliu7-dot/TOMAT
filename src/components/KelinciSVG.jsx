// ── KelinciSVG — Kelinsay — graduated from canvas mockup ─────────────────────
import React, { useState } from 'react'

let _kl = 0

export default function KelinciSVG({ state = 'idle', size = 100 }) {
  const [uid] = useState(() => `kl${++_kl}`)
  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'

  const css = `
    @keyframes ${uid}-ear-twitch-l {
      0%,85%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
      90%         { transform: rotate(-8deg); transform-origin: 50% 100%; }
      95%         { transform: rotate(5deg); transform-origin: 50% 100%; }
    }
    @keyframes ${uid}-ear-twitch-r {
      0%,80%,100% { transform: rotate(0deg); transform-origin: 50% 100%; }
      85%         { transform: rotate(8deg); transform-origin: 50% 100%; }
      92%         { transform: rotate(-5deg); transform-origin: 50% 100%; }
    }
    @keyframes ${uid}-tail-bob {
      0%,100% { transform: scale(1); }
      50%     { transform: scale(1.18); }
    }
    @keyframes ${uid}-shine {
      0%,100% { opacity: 0.6; }
      50%     { opacity: 1; }
    }
    @keyframes ${uid}-hungry-droop {
      0%,100% { transform: translateY(0px); }
      50%     { transform: translateY(2px); }
    }
    .${uid}-ear-l   { animation: ${uid}-ear-twitch-l ${sleeping || dead ? 'none' : '4s ease-in-out infinite'}; }
    .${uid}-ear-r   { animation: ${uid}-ear-twitch-r ${sleeping || dead ? 'none' : '4.5s ease-in-out infinite'}; }
    .${uid}-tail    { animation: ${uid}-tail-bob ${dead ? 'none' : '2.4s ease-in-out infinite'}; }
    .${uid}-shine   { animation: ${uid}-shine 2s ease-in-out infinite; }
    .${uid}-hungry  { animation: ${uid}-hungry-droop 3s ease-in-out infinite; }
  `

  // Scale: canvas uses 160×180 viewBox; we scale to `size`
  const scale = size / 160

  return (
    <svg
      width={size}
      height={size * 1.125}
      viewBox="0 0 160 180"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <style>{css}</style>
      <defs>
        <radialGradient id={`${uid}-body`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={dead ? '#aaa' : '#E8F4FF'}/>
          <stop offset="55%"  stopColor={dead ? '#888' : '#C8DCF0'}/>
          <stop offset="100%" stopColor={dead ? '#666' : '#9BB8D4'}/>
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor={dead ? '#ccc' : '#FFFFFF'}/>
          <stop offset="100%" stopColor={dead ? '#aaa' : '#DCF0FF'}/>
        </radialGradient>
        <radialGradient id={`${uid}-head`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor={dead ? '#b0b0b0' : '#EEF6FF'}/>
          <stop offset="55%"  stopColor={dead ? '#909090' : '#C8DCF0'}/>
          <stop offset="100%" stopColor={dead ? '#707070' : '#9BB8D4'}/>
        </radialGradient>
        <radialGradient id={`${uid}-ear-in`} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor={dead ? '#aaa' : '#FFB3C8'}/>
          <stop offset="100%" stopColor={dead ? '#888' : '#FF8FA8'}/>
        </radialGradient>
        <filter id={`${uid}-blur`}>
          <feGaussianBlur stdDeviation="1.2"/>
        </filter>
      </defs>

      {/* Body */}
      <ellipse cx="80" cy="130" rx="38" ry="32" fill={`url(#${uid}-body)`} stroke="#8AAAC0" strokeWidth="1.2"/>
      <ellipse cx="80" cy="136" rx="22" ry="18" fill={`url(#${uid}-belly)`}/>

      {/* Fluffy tail */}
      <g className={`${uid}-tail`}>
        <circle cx="116" cy="136" r="10" fill={dead ? '#aaa' : 'white'} opacity="0.9"/>
        <circle cx="116" cy="136" r="7"  fill={dead ? '#aaa' : 'white'}/>
        <circle cx="114" cy="134" r="3"  fill={dead ? '#aaa' : 'white'} opacity="0.7" filter={`url(#${uid}-blur)`}/>
      </g>

      {/* Front legs/paws */}
      <ellipse cx="62" cy="156" rx="10" ry="7" fill="#C0D8EE" stroke="#8AAAC0" strokeWidth="1"/>
      <ellipse cx="98" cy="158" rx="10" ry="7" fill="#C0D8EE" stroke="#8AAAC0" strokeWidth="1"/>
      {[-3,0,3].map((dx,i) => <line key={i} x1={62+dx} y1="159" x2={62+dx} y2="163" stroke="#8AAAC0" strokeWidth="0.8" strokeLinecap="round"/>)}
      {[-3,0,3].map((dx,i) => <line key={i} x1={98+dx} y1="161" x2={98+dx} y2="165" stroke="#8AAAC0" strokeWidth="0.8" strokeLinecap="round"/>)}

      {/* Head */}
      <ellipse cx="80" cy="82" rx="34" ry="32" fill={`url(#${uid}-head)`} stroke="#8AAAC0" strokeWidth="1.4"/>

      {/* Left ear */}
      <g className={`${uid}-ear-l`} style={{ transformOrigin: '58px 60px' }}>
        <ellipse cx="58" cy={sleeping ? 44 : 38} rx="13" ry={sleeping ? 22 : 28} fill="#C8DCF0" stroke="#8AAAC0" strokeWidth="1.2"
          transform={sleeping ? 'rotate(-18,58,60)' : hungry ? 'rotate(10,58,60)' : ''}/>
        <ellipse cx="58" cy={sleeping ? 46 : 40} rx="7" ry={sleeping ? 15 : 20} fill={`url(#${uid}-ear-in)`} opacity="0.8"
          transform={sleeping ? 'rotate(-18,58,60)' : hungry ? 'rotate(10,58,60)' : ''}/>
      </g>
      {/* Right ear */}
      <g className={`${uid}-ear-r`} style={{ transformOrigin: '102px 60px' }}>
        <ellipse cx="102" cy={sleeping ? 44 : 38} rx="13" ry={sleeping ? 22 : 28} fill="#C8DCF0" stroke="#8AAAC0" strokeWidth="1.2"
          transform={sleeping ? 'rotate(18,102,60)' : hungry ? 'rotate(-10,102,60)' : ''}/>
        <ellipse cx="102" cy={sleeping ? 46 : 40} rx="7" ry={sleeping ? 15 : 20} fill={`url(#${uid}-ear-in)`} opacity="0.8"
          transform={sleeping ? 'rotate(18,102,60)' : hungry ? 'rotate(-10,102,60)' : ''}/>
      </g>

      {/* Eyes */}
      {dead ? (
        <>
          <circle cx="68" cy="80" r="9" fill="white"/>
          <circle cx="92" cy="80" r="9" fill="white"/>
          <text x="68" y="84" textAnchor="middle" fontSize="13" fill="#9BB8D4" fontWeight="900">✕</text>
          <text x="92" y="84" textAnchor="middle" fontSize="13" fill="#9BB8D4" fontWeight="900">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 60 80 Q 68 75 76 80" stroke="#8AAAC0" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 84 80 Q 92 75 100 80" stroke="#8AAAC0" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <text x="110" y="54" fontSize="9"  fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="118" y="43" fontSize="13" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="128" y="30" fontSize="17" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      ) : (
        <>
          <circle cx="68" cy="80" r="9" fill="white"/>
          <circle cx="92" cy="80" r="9" fill="white"/>
          <circle cx="69" cy="81" r={hungry ? 4.5 : 6} fill="#1A3A5C"/>
          <circle cx="93" cy="81" r={hungry ? 4.5 : 6} fill="#1A3A5C"/>
          <circle cx="71" cy="78" r="2.5" fill="white" opacity="0.95" className={`${uid}-shine`}/>
          <circle cx="95" cy="78" r="2.5" fill="white" opacity="0.95" className={`${uid}-shine`}/>
          <circle cx="70" cy="83" r="1" fill="white" opacity="0.5"/>
          <circle cx="94" cy="83" r="1" fill="white" opacity="0.5"/>
          {happy && (
            <>
              <path d="M 57 71 Q 68 66 79 71" stroke="#8AAAC0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M 81 71 Q 92 66 103 71" stroke="#8AAAC0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* Cheeks */}
      {!dead && (
        <>
          <ellipse cx="56" cy="90" rx="8" ry="5" fill={hungry ? '#FFD0A8' : '#FFB3C8'} opacity="0.5"/>
          <ellipse cx="104" cy="90" rx="8" ry="5" fill={hungry ? '#FFD0A8' : '#FFB3C8'} opacity="0.5"/>
        </>
      )}

      {/* Nose */}
      <ellipse cx="80" cy="96" rx="4" ry="3" fill={dead ? '#9BB8D4' : '#FF8FA8'}/>
      {!dead && <ellipse cx="78.5" cy="95" rx="1.5" ry="1" fill="white" opacity="0.6"/>}

      {/* Mouth */}
      {dead ? (
        <>
          <path d="M 80 99 Q 76 96 73 98" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M 80 99 Q 84 96 87 98" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </>
      ) : hungry ? (
        <>
          <path d="M 80 99 Q 76 96 73 98" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M 80 99 Q 84 96 87 98" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <text x="110" y="145" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
        </>
      ) : happy ? (
        <>
          <path d="M 73 100 Q 80 108 87 100" stroke="#8AAAC0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="80" cy="105" rx="5" ry="4" fill="#FF8FA8" stroke="#e06080" strokeWidth="0.8"/>
          <line x1="77" y1="102" x2="77" y2="108" stroke="#e06080" strokeWidth="0.7"/>
          <line x1="80" y1="101" x2="80" y2="109" stroke="#e06080" strokeWidth="0.7"/>
          <line x1="83" y1="102" x2="83" y2="108" stroke="#e06080" strokeWidth="0.7"/>
        </>
      ) : (
        <>
          <path d="M 80 99 Q 76 103 73 101" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M 80 99 Q 84 103 87 101" stroke="#8AAAC0" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* Whiskers */}
      <line x1="60" y1="93" x2="73" y2="95" stroke="#6A90B0" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
      <line x1="58" y1="97" x2="73" y2="97" stroke="#6A90B0" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
      <line x1="87" y1="95" x2="100" y2="93" stroke="#6A90B0" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
      <line x1="87" y1="97" x2="102" y2="97" stroke="#6A90B0" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
    </svg>
  )
}
