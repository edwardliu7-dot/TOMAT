// ── TomiSVG — Tomi the Guinea Pig (Marmut Emas) ──────────────────────────────
// Exact SVG design from the canvas mockup. Shared by FloatingPet, ShopScreen,
// and ProfileScreen so the appearance is always pixel-identical.
import React from 'react'

export const SKIN_PALETTES = {
  golden: {
    mainFur: '#F5A623', lightFur: '#F7C55E', darkFur: '#C47B0A',
    belly: '#FFF3CC', rosette: '#D48A12', nose: '#E07090',
    outline: '#9A5A00', whisker: '#7A4400',
  },
  pet_skin_silver: {
    mainFur: '#B8C5D4', lightFur: '#E2EAF5', darkFur: '#7A8FA8',
    belly: '#EDF4FF', rosette: '#9AAFC5', nose: '#D08098',
    outline: '#5A7090', whisker: '#4A607A',
  },
  pet_skin_cosmic: {
    mainFur: '#7C3AED', lightFur: '#A78BFA', darkFur: '#4C1D95',
    belly: '#DDD6FE', rosette: '#C4B5FD', nose: '#F472B6',
    outline: '#5B21B6', whisker: '#8B5CF6',
  },
  pet_skin_void: {
    mainFur: '#1A1020', lightFur: '#2D1A40', darkFur: '#0A0810',
    belly: '#2A1830', rosette: '#F59E0B', nose: '#F59E0B',
    outline: '#F59E0B', whisker: '#F59E0B',
  },
}

export const PET_CSS = `
@keyframes tomi-idle {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  30%      { transform: translateY(-5px) rotate(-1deg); }
  70%      { transform: translateY(-3px) rotate(1deg); }
}
@keyframes tomi-walk {
  0%   { transform: translateX(0)    rotate(0deg)   scaleX(1); }
  20%  { transform: translateX(4px)  rotate(2deg)   scaleX(1.03); }
  50%  { transform: translateX(0)    rotate(0deg)   scaleX(1); }
  70%  { transform: translateX(-4px) rotate(-2deg)  scaleX(1.03); }
  100% { transform: translateX(0)    rotate(0deg)   scaleX(1); }
}
@keyframes tomi-happy {
  0%   { transform: scale(1)    rotate(0deg)   translateY(0); }
  20%  { transform: scale(1.1)  rotate(-6deg)  translateY(-9px); }
  40%  { transform: scale(1)    rotate(5deg)   translateY(0); }
  60%  { transform: scale(1.08) rotate(-4deg)  translateY(-6px); }
  80%  { transform: scale(1)    rotate(3deg)   translateY(0); }
  100% { transform: scale(1)    rotate(0deg)   translateY(0); }
}
@keyframes tomi-hungry {
  0%,100% { transform: translateX(0) translateY(0); }
  25%      { transform: translateX(-2px) translateY(1px); }
  75%      { transform: translateX(2px)  translateY(1px); }
}
@keyframes tomi-sleep {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-4px) rotate(2deg); }
}
@keyframes tomi-dead {
  0%,100% { transform: rotate(-3deg); }
  50%      { transform: rotate(3deg); }
}
`

export const STATE_ANIMS = {
  idle:     'tomi-idle 2.2s ease-in-out infinite',
  walk:     'tomi-walk 0.9s ease-in-out infinite',
  happy:    'tomi-happy 1s ease-in-out infinite',
  hungry:   'tomi-hungry 1.3s ease-in-out infinite',
  sleeping: 'tomi-sleep 3s ease-in-out infinite',
  dead:     'tomi-dead 4s ease-in-out infinite',
}

// eslint-disable-next-line react/display-name
export default function TomiSVG({ state = 'idle', skinId = 'golden', size = 100 }) {
  const skin = SKIN_PALETTES[skinId] || SKIN_PALETTES.golden
  const uid = `gp${size}${skinId}`

  const sleeping = state === 'sleeping'
  const hungry   = state === 'hungry'
  const happy    = state === 'happy'
  const dead     = state === 'dead'
  const earTilt  = sleeping || hungry || dead ? 18 : 0

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <filter id={`blur-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`hg-${uid}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={skin.lightFur}/>
          <stop offset="55%"  stopColor={skin.mainFur}/>
          <stop offset="100%" stopColor={skin.darkFur}/>
        </radialGradient>
        <radialGradient id={`bg-${uid}`} cx="45%" cy="38%" r="58%">
          <stop offset="0%"   stopColor={skin.lightFur}/>
          <stop offset="60%"  stopColor={skin.mainFur}/>
          <stop offset="100%" stopColor={skin.darkFur}/>
        </radialGradient>
        <radialGradient id={`belly-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#fffde8"/>
          <stop offset="100%" stopColor={skin.belly}/>
        </radialGradient>
        <radialGradient id={`eye-${uid}`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#3D1A00"/>
          <stop offset="100%" stopColor="#100500"/>
        </radialGradient>
      </defs>

      {/* ── BODY ── */}
      <ellipse cx="60" cy="92" rx="30" ry="22"
        fill={`url(#bg-${uid})`} stroke={skin.outline} strokeWidth="1.4"/>
      <ellipse cx="60" cy="94" rx="16" ry="13"
        fill={`url(#belly-${uid})`}/>
      {[[-22,2],[20,0],[-10,-10],[14,-8]].map(([dx,dy],i)=>(
        <circle key={i} cx={60+dx} cy={92+dy} r="7"
          fill={skin.mainFur} opacity="0.45" filter={`url(#blur-${uid})`}/>
      ))}
      <circle cx="44" cy="88" r="5" fill="none" stroke={skin.rosette} strokeWidth="1.2" opacity="0.55"/>
      <circle cx="44" cy="88" r="1.8" fill={skin.rosette} opacity="0.4"/>
      <circle cx="72" cy="95" r="4.5" fill="none" stroke={skin.rosette} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="72" cy="95" r="1.6" fill={skin.rosette} opacity="0.35"/>

      {/* ── FEET ── */}
      <ellipse cx="42" cy="109" rx="8" ry="5" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1"/>
      <ellipse cx="42" cy="112" rx="8" ry="3" fill={skin.darkFur}/>
      {[-4,-1,2].map((dx,i)=>(
        <circle key={i} cx={42+dx} cy="114" r="1.5" fill={skin.darkFur} opacity="0.8"/>
      ))}
      <ellipse cx="58" cy="110" rx="8" ry="5" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1"/>
      <ellipse cx="58" cy="113" rx="8" ry="3" fill={skin.darkFur}/>
      {[-4,-1,2].map((dx,i)=>(
        <circle key={i} cx={58+dx} cy="115" r="1.5" fill={skin.darkFur} opacity="0.8"/>
      ))}
      <ellipse cx="73" cy="109" rx="7" ry="4.5" fill={skin.darkFur} stroke={skin.outline} strokeWidth="0.9" opacity="0.75"/>
      <ellipse cx="86" cy="108" rx="7" ry="4.5" fill={skin.mainFur} stroke={skin.outline} strokeWidth="0.9" opacity="0.85"/>

      {/* ── HEAD fur halo ── */}
      {[[-34,2],[32,2],[-24,-22],[22,-22],[0,-34],[-16,24],[14,24]].map(([dx,dy],i)=>(
        <circle key={i} cx={60+dx} cy={56+dy} r={i<4?11:9}
          fill={skin.mainFur} opacity="0.5" filter={`url(#blur-${uid})`}/>
      ))}
      <ellipse cx="60" cy="56" rx="38" ry="36"
        fill={`url(#hg-${uid})`} stroke={skin.outline} strokeWidth="1.6"/>

      {/* ── EARS ── */}
      <g transform={`rotate(${earTilt} 28 32)`}>
        <ellipse cx="28" cy="30" rx="11" ry="13" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.4"/>
        <ellipse cx="28" cy="31" rx="6" ry="8" fill={skin.darkFur} opacity="0.5"/>
        <ellipse cx="28" cy="30" rx="3.5" ry="5" fill="#F9C0C8" opacity="0.55"/>
      </g>
      <g transform={`rotate(${-earTilt} 92 32)`}>
        <ellipse cx="92" cy="30" rx="11" ry="13" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.4"/>
        <ellipse cx="92" cy="31" rx="6" ry="8" fill={skin.darkFur} opacity="0.5"/>
        <ellipse cx="92" cy="30" rx="3.5" ry="5" fill="#F9C0C8" opacity="0.55"/>
      </g>

      {/* ── FOREHEAD TUFT ── */}
      <ellipse cx="60" cy="23" rx="10" ry="7" fill={skin.lightFur} opacity="0.8"/>
      <ellipse cx="54" cy="22" rx="7" ry="5" fill={skin.lightFur} opacity="0.6"/>
      <ellipse cx="66" cy="22" rx="6" ry="4.5" fill={skin.lightFur} opacity="0.55"/>

      {/* ── ROSETTE on head ── */}
      <circle cx="40" cy="60" r="5" fill="none" stroke={skin.rosette} strokeWidth="1.1" opacity="0.45"/>
      <circle cx="40" cy="60" r="1.8" fill={skin.rosette} opacity="0.35"/>

      {/* ── EYES ── */}
      {dead ? (
        <>
          <text x="42" y="62" fontSize="16" fill={skin.outline} fontWeight="900" textAnchor="middle">✕</text>
          <text x="78" y="62" fontSize="16" fill={skin.outline} fontWeight="900" textAnchor="middle">✕</text>
        </>
      ) : sleeping ? (
        <>
          <path d="M 46 57 Q 53 52 60 57" stroke={skin.outline} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M 72 57 Q 79 52 86 57" stroke={skin.outline} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <circle cx="52" cy="56" r="10" fill="white"/>
          <circle cx="76" cy="56" r="10" fill="white"/>
          <circle cx="53" cy="57" r={hungry ? 5.5 : 6.5} fill={`url(#eye-${uid})`}/>
          <circle cx="77" cy="57" r={hungry ? 5.5 : 6.5} fill={`url(#eye-${uid})`}/>
          <circle cx="56" cy="53" r="2.2" fill="white" opacity="0.92"/>
          <circle cx="80" cy="53" r="2.2" fill="white" opacity="0.92"/>
          <circle cx="55" cy="59" r="0.9" fill="white" opacity="0.5"/>
          <circle cx="79" cy="59" r="0.9" fill="white" opacity="0.5"/>
          {happy && (
            <>
              <path d="M 44 47 Q 52 42 60 47" stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <path d="M 68 47 Q 76 42 84 47" stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            </>
          )}
          {hungry && (
            <>
              <path d="M 44 49 Q 52 46 60 50" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M 68 50 Q 76 46 84 49" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* ── CHEEK BLUSH ── */}
      {!dead && (
        <>
          <ellipse cx="39" cy="66" rx="7.5" ry="4" fill="#FF9999" opacity="0.32"/>
          <ellipse cx="89" cy="66" rx="7.5" ry="4" fill="#FF9999" opacity="0.32"/>
        </>
      )}

      {/* ── NOSE ── */}
      <ellipse cx="60" cy="70" rx="5" ry="4" fill={skin.nose}/>
      <ellipse cx="58.5" cy="68.5" rx="2" ry="1.2" fill="white" opacity="0.5"/>
      <path d="M 60 73 L 58 76 M 60 73 L 62 76 M 60 73 L 60 76"
        stroke={skin.outline} strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>

      {/* ── MOUTH ── */}
      {hungry || dead ? (
        <path d="M 54 79 Q 60 76 66 79" stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      ) : happy ? (
        <>
          <path d="M 54 78 Q 60 84 66 78" stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <ellipse cx="60" cy="83" rx="5" ry="4" fill="#FF8BA0" stroke="#e06080" strokeWidth="0.9"/>
          <line x1="60" y1="79" x2="60" y2="86" stroke="#e06080" strokeWidth="0.9"/>
        </>
      ) : (
        <path d="M 54 78 Q 60 83 66 78" stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      )}

      {/* ── WHISKERS ── */}
      <line x1="40" y1="70" x2="54" y2="71" stroke={skin.whisker} strokeWidth="0.9" opacity="0.65" strokeLinecap="round"/>
      <line x1="40" y1="73" x2="54" y2="73" stroke={skin.whisker} strokeWidth="0.9" opacity="0.55" strokeLinecap="round"/>
      <line x1="40" y1="76" x2="54" y2="75" stroke={skin.whisker} strokeWidth="0.9" opacity="0.45" strokeLinecap="round"/>
      <line x1="80" y1="71" x2="94" y2="70" stroke={skin.whisker} strokeWidth="0.9" opacity="0.65" strokeLinecap="round"/>
      <line x1="80" y1="73" x2="95" y2="73" stroke={skin.whisker} strokeWidth="0.9" opacity="0.55" strokeLinecap="round"/>
      <line x1="80" y1="75" x2="94" y2="76" stroke={skin.whisker} strokeWidth="0.9" opacity="0.45" strokeLinecap="round"/>

      {/* ── STATE EXTRAS ── */}
      {sleeping && (
        <>
          <text x="88" y="38" fontSize="10" fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="96" y="28" fontSize="14" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="105" y="17" fontSize="18" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      )}
      {hungry && !dead && (
        <text x="78" y="106" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
      )}
      {/* Void king crown overlay */}
      {skinId === 'pet_skin_void' && (
        <g transform="translate(38,8)">
          <polygon points="22,-11 28,0 36,-9 44,0 50,-11 52,7 -8,7" fill="#F59E0B" stroke="#C47B0A" strokeWidth="1"/>
          <circle cx="22" cy="-2" r="3" fill="#EF4444"/>
          <circle cx="36" cy="-7" r="3.5" fill="#60A5FA"/>
          <circle cx="50" cy="-2" r="3" fill="#10B981"/>
        </g>
      )}
    </svg>
  )
}
