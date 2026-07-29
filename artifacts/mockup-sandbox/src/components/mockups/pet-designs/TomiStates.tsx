import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   TomiStates — 6-state canvas mockup
   Setiap bagian (telinga, mata, tangan/paw, kaki, badan) animasi independen
   viewBox 100 × 120, semua koordinat dalam space itu
───────────────────────────────────────────────────────────────────────────── */

type TState = "idle" | "walk" | "happy" | "hungry" | "sleeping" | "dead";

const STATE_META: Record<TState, { label: string; emoji: string; accent: string; bg: string }> = {
  idle:     { label: "Idle",     emoji: "😌", accent: "#67E8F9", bg: "rgba(103,232,249,0.08)" },
  walk:     { label: "Walk",     emoji: "🚶", accent: "#34D399", bg: "rgba(52,211,153,0.08)"  },
  happy:    { label: "Happy",    emoji: "🎉", accent: "#FBBF24", bg: "rgba(251,191,36,0.10)"  },
  hungry:   { label: "Hungry",   emoji: "🍖", accent: "#F87171", bg: "rgba(248,113,113,0.08)" },
  sleeping: { label: "Sleeping", emoji: "💤", accent: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
  dead:     { label: "Dead",     emoji: "💀", accent: "#6B7280", bg: "rgba(107,114,128,0.08)" },
};

/* ── colour palette (matches tomi.svg warm-cream tones) ── */
const FUR     = "#F0A830";
const FUR_LT  = "#F7C860";
const FUR_DK  = "#C47A0A";
const BELLY   = "#FFF5D0";
const EAR_IN  = "#F5A0B8";
const OUTLINE = "#7A4800";
const NOSE    = "#E07090";
const WHISKER = "#9A5A00";

/* ══════════════════════════════════════════════════════════════════════════
   Per-state keyframes — prefixed with state name so 6 can run side-by-side
═══════════════════════════════════════════════════════════════════════════ */
function makeCSS(s: TState) {
  const p = s; // prefix
  switch (s) {
    case "idle": return `
      @keyframes ${p}-body { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(4deg)} 50%{transform:rotate(-4deg)} }
      @keyframes ${p}-paw-l { 0%,100%{transform:translateY(0px) rotate(-3deg)} 50%{transform:translateY(-2px) rotate(3deg)} }
      @keyframes ${p}-paw-r { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-2px) rotate(-3deg)} }
      @keyframes ${p}-foot  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-2px)} }
      @keyframes ${p}-blink {
        0%,88%,96%,100%{transform:scaleY(1)} 90%,94%{transform:scaleY(0.05)}
      }
    `;
    case "walk": return `
      @keyframes ${p}-body { 0%,100%{transform:rotate(0deg) translateY(0)} 25%{transform:rotate(3deg) translateY(-2px)} 75%{transform:rotate(-3deg) translateY(-2px)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(5deg)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(-5deg)} }
      @keyframes ${p}-paw-l { 0%,50%,100%{transform:translateY(0px) rotate(-10deg)} 25%{transform:translateY(-8px) rotate(5deg)} }
      @keyframes ${p}-paw-r { 0%,50%,100%{transform:translateY(0px) rotate(10deg)} 75%{transform:translateY(-8px) rotate(-5deg)} }
      @keyframes ${p}-foot-l{ 0%,50%,100%{transform:translateY(0px)} 25%{transform:translateY(-6px)} }
      @keyframes ${p}-foot-r{ 0%,50%,100%{transform:translateY(0px)} 75%{transform:translateY(-6px)} }
    `;
    case "happy": return `
      @keyframes ${p}-body { 0%,100%{transform:translateY(0px) scale(1)} 30%{transform:translateY(-12px) scale(1.06)} 60%{transform:translateY(-4px) scale(1.02)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(-18deg) translateY(-2px)} 50%{transform:rotate(-10deg) translateY(-5px)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(18deg) translateY(-2px)} 50%{transform:rotate(10deg) translateY(-5px)} }
      @keyframes ${p}-paw-l { 0%,100%{transform:translateY(0px) rotate(-20deg)} 40%{transform:translateY(-14px) rotate(-40deg)} 70%{transform:translateY(-8px) rotate(-25deg)} }
      @keyframes ${p}-paw-r { 0%,100%{transform:translateY(0px) rotate(20deg)} 40%{transform:translateY(-14px) rotate(40deg)} 70%{transform:translateY(-8px) rotate(25deg)} }
      @keyframes ${p}-foot  { 0%,100%{transform:translateY(0px)} 30%{transform:translateY(-8px)} }
      @keyframes ${p}-star  { 0%{opacity:0;transform:scale(0) rotate(0deg)} 40%{opacity:1;transform:scale(1.2) rotate(20deg)} 100%{opacity:0;transform:scale(0.6) rotate(40deg) translateY(-18px)} }
    `;
    case "hungry": return `
      @keyframes ${p}-body { 0%,100%{transform:translateY(0px) rotate(0deg)} 30%{transform:translateY(3px) rotate(-1.5deg)} 70%{transform:translateY(2px) rotate(1deg)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(35deg) translateY(4px)} 50%{transform:rotate(38deg) translateY(5px)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(-35deg) translateY(4px)} 50%{transform:rotate(-38deg) translateY(5px)} }
      @keyframes ${p}-paw-l { 0%,100%{transform:translateY(4px) rotate(8deg)} 50%{transform:translateY(6px) rotate(10deg)} }
      @keyframes ${p}-paw-r { 0%,100%{transform:translateY(4px) rotate(-8deg)} 50%{transform:translateY(6px) rotate(-10deg)} }
      @keyframes ${p}-foot  { 0%,100%{transform:translateY(3px)} 50%{transform:translateY(4px)} }
      @keyframes ${p}-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-2px)} 40%{transform:translateX(2px)} 60%{transform:translateX(-1.5px)} 80%{transform:translateX(1.5px)} }
      @keyframes ${p}-tear  { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(10px);opacity:0} }
      @keyframes ${p}-rumble{ 0%,100%{transform:translateY(0) scaleX(1)} 50%{transform:translateY(1px) scaleX(1.04)} }
    `;
    case "sleeping": return `
      @keyframes ${p}-body  { 0%,100%{transform:scaleX(1) scaleY(1)} 50%{transform:scaleX(1.04) scaleY(0.97)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(12deg)} 50%{transform:rotate(15deg)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(-15deg)} }
      @keyframes ${p}-paw-l { 0%,100%{transform:translateY(2px) rotate(5deg)} }
      @keyframes ${p}-paw-r { 0%,100%{transform:translateY(2px) rotate(-5deg)} }
      @keyframes ${p}-foot  { 0%,100%{transform:translateY(2px)} }
      @keyframes ${p}-z1    { 0%{opacity:0;transform:translate(0,0) scale(0.5)} 30%{opacity:1;transform:translate(3px,-8px) scale(0.9)} 100%{opacity:0;transform:translate(7px,-22px) scale(0.5)} }
      @keyframes ${p}-z2    { 0%{opacity:0;transform:translate(0,0) scale(0.4)} 30%{opacity:1;transform:translate(5px,-12px) scale(1)} 100%{opacity:0;transform:translate(11px,-30px) scale(0.6)} }
      @keyframes ${p}-z3    { 0%{opacity:0;transform:translate(0,0) scale(0.3)} 30%{opacity:1;transform:translate(7px,-16px) scale(1.1)} 100%{opacity:0;transform:translate(15px,-40px) scale(0.4)} }
    `;
    case "dead": return `
      @keyframes ${p}-body  { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(-6deg)} }
      @keyframes ${p}-ear-l { 0%,100%{transform:rotate(55deg) translateY(8px)} }
      @keyframes ${p}-ear-r { 0%,100%{transform:rotate(-55deg) translateY(8px)} }
      @keyframes ${p}-paw-l { 0%,100%{transform:translateY(-10px) rotate(-50deg)} 50%{transform:translateY(-8px) rotate(-48deg)} }
      @keyframes ${p}-paw-r { 0%,100%{transform:translateY(-10px) rotate(50deg)} 50%{transform:translateY(-8px) rotate(48deg)} }
      @keyframes ${p}-foot  { 0%,100%{transform:translateY(-4px) rotate(-5deg)} }
      @keyframes ${p}-star  { 0%,100%{transform:rotate(0deg) translate(0,0)} 50%{transform:rotate(180deg) translate(2px,-1px)} }
    `;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Eye renderers
═══════════════════════════════════════════════════════════════════════════ */
function EyeNormal({ cx, cy, r, uid, blink }: { cx: number; cy: number; r: number; uid: string; blink?: boolean }) {
  return (
    <g style={blink ? { transformBox: "fill-box", transformOrigin: "center", animation: `idle-blink 4s ease-in-out infinite` } : {}}>
      <circle cx={cx} cy={cy} r={r} fill="white" />
      <circle cx={cx} cy={cy + 0.6} r={r - 1.4} fill="#190900" />
      <circle cx={cx - 1.2} cy={cy - 1.2} r={1.5} fill="white" opacity={0.95} />
      <circle cx={cx + 0.8} cy={cy + 1}   r={0.7} fill="white" opacity={0.5} />
    </g>
  );
}

function EyeHappy({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // ^w^ crescent — arc closing from below
  return (
    <g>
      <path
        d={`M ${cx - r + 0.5} ${cy + 1} Q ${cx} ${cy - r - 1} ${cx + r - 0.5} ${cy + 1}`}
        stroke="#190900" strokeWidth="2.8" fill="none" strokeLinecap="round"
      />
    </g>
  );
}

function EyeSad({ cx, cy, r, side }: { cx: number; cy: number; r: number; side: "L" | "R" }) {
  const browDx = side === "L" ? 1.5 : -1.5; // inner brow raised toward nose
  return (
    <g>
      <circle cx={cx} cy={cy + 1} r={r - 0.5} fill="white" />
      <circle cx={cx} cy={cy + 2} r={r - 2}   fill="#190900" />
      <circle cx={cx - 1} cy={cy} r={1.2} fill="white" opacity={0.9} />
      {/* angled sad brow */}
      <path
        d={`M ${cx - r + 1} ${cy - r - 2 + (side === "L" ? 2 : 0)} Q ${cx} ${cy - r - 4} ${cx + r - 1} ${cy - r - 2 + (side === "R" ? 2 : 0)}`}
        stroke={OUTLINE} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity={0.75}
      />
      {/* tiny teardrop — animated separately */}
      <ellipse cx={cx + (side === "L" ? 2 : -2)} cy={cy + r + 1} rx={1.2} ry={1.6}
        fill="#67CAEE" opacity={0.85}
        style={{ animation: `hungry-tear 2.4s ease-in infinite` }} />
    </g>
  );
}

function EyeSleeping({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <path
      d={`M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.85} ${cx + r} ${cy}`}
      stroke={OUTLINE} strokeWidth="2.6" fill="none" strokeLinecap="round"
    />
  );
}

function EyeDead({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const d = r * 0.75;
  return (
    <g>
      <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />
      <line x1={cx + d} y1={cy - d} x2={cx - d} y2={cy + d} stroke={OUTLINE} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Mouth renderers
═══════════════════════════════════════════════════════════════════════════ */
function Mouth({ type }: { type: "neutral" | "smile" | "grin" | "frown" | "o" }) {
  const cx = 50, cy = 68;
  if (type === "grin")
    return (
      <g>
        <path d={`M 41 ${cy - 1} Q 50 ${cy + 9} 59 ${cy - 1}`} fill="#D97070" stroke="#A03040" strokeWidth="1.4" strokeLinecap="round" />
        <line x1={50} y1={cy - 1} x2={50} y2={cy + 6} stroke="#B04050" strokeWidth="1.2" opacity={0.6} />
      </g>
    );
  if (type === "smile")
    return <path d={`M 43 ${cy} Q 50 ${cy + 6} 57 ${cy}`} stroke="#904040" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  if (type === "frown")
    return <path d={`M 43 ${cy + 4} Q 50 ${cy - 1} 57 ${cy + 4}`} stroke="#904040" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
  if (type === "o")
    return <ellipse cx={50} cy={cy + 2} rx={3.5} ry={2.8} fill="#904040" />;
  // neutral
  return <path d={`M 44 ${cy + 1} Q 50 ${cy + 5} 56 ${cy + 1}`} stroke="#904040" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
}

/* ══════════════════════════════════════════════════════════════════════════
   Full Tomi figure — one SVG per state
═══════════════════════════════════════════════════════════════════════════ */
function TomiFigure({ state }: { state: TState }) {
  const p = state;
  const isDead     = state === "dead";
  const isHappy    = state === "happy";
  const isSleeping = state === "sleeping";
  const isHungry   = state === "hungry";
  const isWalk     = state === "walk";

  // Durations
  const bodyDur    = { idle: "2.6s", walk: "0.72s", happy: "0.85s", hungry: "3s", sleeping: "3.4s", dead: "5s" }[state];
  const earDur     = { idle: "2.6s", walk: "0.72s", happy: "0.85s", hungry: "3s", sleeping: "3.4s", dead: "6s" }[state];
  const pawDur     = { idle: "2.6s", walk: "0.72s", happy: "0.85s", hungry: "3s", sleeping: "3.4s", dead: "6s" }[state];
  const footDur    = { idle: "2.6s", walk: "0.72s", happy: "0.85s", hungry: "3s", sleeping: "3.4s", dead: "6s" }[state];

  const bodyAnim   = `${p}-body ${bodyDur} ease-in-out infinite`;
  const earLAnim   = `${p}-ear-l ${earDur} ease-in-out infinite`;
  const earRAnim   = `${p}-ear-r ${earDur} ease-in-out infinite`;
  const pawLAnim   = `${p}-paw-l ${pawDur} ease-in-out infinite`;
  const pawRAnim   = `${p}-paw-r ${pawDur} ease-in-out infinite`;
  const footLAnim  = isWalk ? `${p}-foot-l ${footDur} ease-in-out infinite` : `${p}-foot ${footDur} ease-in-out infinite`;
  const footRAnim  = isWalk ? `${p}-foot-r ${footDur} ease-in-out 0.36s infinite` : `${p}-foot ${footDur} ease-in-out 0.4s infinite`;

  const filter = isDead ? "saturate(0) brightness(0.55)" : isHungry ? "saturate(0.7) brightness(0.88)" : "none";

  // Ear transform-origin: left ear rotates from base at (30,38), right from (70,38)
  return (
    <svg
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block", filter }}
    >
      <defs>
        <radialGradient id={`hg-${p}`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={FUR_LT} />
          <stop offset="55%"  stopColor={FUR} />
          <stop offset="100%" stopColor={FUR_DK} />
        </radialGradient>
        <radialGradient id={`bg-${p}`} cx="42%" cy="36%" r="62%">
          <stop offset="0%"   stopColor={FUR_LT} />
          <stop offset="60%"  stopColor={FUR} />
          <stop offset="100%" stopColor={FUR_DK} />
        </radialGradient>
        <radialGradient id={`belly-${p}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#fffde8" />
          <stop offset="100%" stopColor={BELLY} />
        </radialGradient>
        <filter id={`shadow-${p}`}>
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* ── Whole-body wrapper (body bounce / sway) ── */}
      <g style={{
        transformBox: "fill-box", transformOrigin: "50% 90%",
        animation: bodyAnim,
      }}>

        {/* ── LEFT EAR ── pivot at base bottom-center of ear */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "30px 40px",
          animation: earLAnim,
        }}>
          <ellipse cx="30" cy="22" rx="11" ry="14" fill={`url(#hg-${p})`} stroke={OUTLINE} strokeWidth="1.4" />
          <ellipse cx="30" cy="23" rx="6"  ry="8.5" fill={FUR_DK} opacity="0.45" />
          <ellipse cx="30" cy="22" rx="3.5" ry="5.5" fill={EAR_IN} opacity="0.65" />
        </g>

        {/* ── RIGHT EAR ── pivot at base bottom-center of ear */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "70px 40px",
          animation: earRAnim,
        }}>
          <ellipse cx="70" cy="22" rx="11" ry="14" fill={`url(#hg-${p})`} stroke={OUTLINE} strokeWidth="1.4" />
          <ellipse cx="70" cy="23" rx="6"  ry="8.5" fill={FUR_DK} opacity="0.45" />
          <ellipse cx="70" cy="22" rx="3.5" ry="5.5" fill={EAR_IN} opacity="0.65" />
        </g>

        {/* ── BODY ── */}
        <g style={{ transformBox: "fill-box", transformOrigin: "50px 92px",
                    animation: isHungry ? `hungry-rumble 1.2s ease-in-out infinite` : undefined }}>
          <ellipse cx="50" cy="92" rx="30" ry="22" fill={`url(#bg-${p})`} stroke={OUTLINE} strokeWidth="1.5" filter={`url(#shadow-${p})`} />
          <ellipse cx="50" cy="94" rx="17" ry="13" fill={`url(#belly-${p})`} />
          {/* rosette spots on body */}
          <circle cx="36" cy="88" r="4.5" fill="none" stroke={FUR_DK} strokeWidth="1.1" opacity="0.4" />
          <circle cx="36" cy="88" r="1.5" fill={FUR_DK} opacity="0.3" />
          <circle cx="64" cy="95" r="4"   fill="none" stroke={FUR_DK} strokeWidth="1.1" opacity="0.35" />
          <circle cx="64" cy="95" r="1.4" fill={FUR_DK} opacity="0.28" />
        </g>

        {/* ── LEFT PAW ── pivot at shoulder */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "26px 84px",
          animation: pawLAnim,
        }}>
          <ellipse cx="24" cy="90" rx="8.5" ry="6" fill={FUR} stroke={OUTLINE} strokeWidth="1.2" />
          <ellipse cx="24" cy="93" rx="8"   ry="3.5" fill={FUR_DK} opacity="0.5" />
          {[-3,0,3].map((dx, i) => (
            <circle key={i} cx={24 + dx} cy="95.5" r="1.4" fill={OUTLINE} opacity="0.55" />
          ))}
        </g>

        {/* ── RIGHT PAW ── pivot at shoulder */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "74px 84px",
          animation: pawRAnim,
        }}>
          <ellipse cx="76" cy="90" rx="8.5" ry="6" fill={FUR} stroke={OUTLINE} strokeWidth="1.2" />
          <ellipse cx="76" cy="93" rx="8"   ry="3.5" fill={FUR_DK} opacity="0.5" />
          {[-3,0,3].map((dx, i) => (
            <circle key={i} cx={76 + dx} cy="95.5" r="1.4" fill={OUTLINE} opacity="0.55" />
          ))}
        </g>

        {/* ── LEFT FOOT ── */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "35px 108px",
          animation: footLAnim,
        }}>
          <ellipse cx="35" cy="108" rx="9"  ry="5.5" fill={FUR} stroke={OUTLINE} strokeWidth="1.1" />
          <ellipse cx="35" cy="111" rx="8.5" ry="3"  fill={FUR_DK} opacity="0.55" />
          {[-3.5,0,3.5].map((dx, i) => (
            <circle key={i} cx={35 + dx} cy="113" r="1.3" fill={OUTLINE} opacity="0.5" />
          ))}
        </g>

        {/* ── RIGHT FOOT ── */}
        <g style={{
          transformBox: "fill-box", transformOrigin: "65px 108px",
          animation: footRAnim,
        }}>
          <ellipse cx="65" cy="108" rx="9"  ry="5.5" fill={FUR} stroke={OUTLINE} strokeWidth="1.1" />
          <ellipse cx="65" cy="111" rx="8.5" ry="3"  fill={FUR_DK} opacity="0.55" />
          {[-3.5,0,3.5].map((dx, i) => (
            <circle key={i} cx={65 + dx} cy="113" r="1.3" fill={OUTLINE} opacity="0.5" />
          ))}
        </g>

        {/* ── HEAD ── rendered last so it sits on top of ears */}
        <ellipse cx="50" cy="50" rx="36" ry="33"
          fill={`url(#hg-${p})`} stroke={OUTLINE} strokeWidth="1.6" />

        {/* forehead tuft */}
        <ellipse cx="50" cy="19" rx="9"  ry="6.5" fill={FUR_LT} opacity="0.75" />
        <ellipse cx="43" cy="18" rx="6"  ry="4.5" fill={FUR_LT} opacity="0.55" />
        <ellipse cx="57" cy="18" rx="5.5" ry="4"  fill={FUR_LT} opacity="0.5" />

        {/* ── CHEEK BLUSH ── */}
        {!isDead && (
          <>
            <ellipse cx="22" cy="58" rx={isHappy ? 8 : 6.5} ry={isHappy ? 5 : 3.8}
              fill="#FF8FA0" opacity={isHappy ? 0.45 : 0.28} />
            <ellipse cx="78" cy="58" rx={isHappy ? 8 : 6.5} ry={isHappy ? 5 : 3.8}
              fill="#FF8FA0" opacity={isHappy ? 0.45 : 0.28} />
          </>
        )}

        {/* ── EYES ── */}
        {isHappy && (
          <>
            <EyeHappy cx={38} cy={46} r={8} />
            <EyeHappy cx={62} cy={46} r={8} />
          </>
        )}
        {isSleeping && (
          <>
            <EyeSleeping cx={38} cy={46} r={8} />
            <EyeSleeping cx={62} cy={46} r={8} />
          </>
        )}
        {isDead && (
          <>
            <EyeDead cx={38} cy={46} r={7} />
            <EyeDead cx={62} cy={46} r={7} />
          </>
        )}
        {isHungry && (
          <>
            <EyeSad cx={38} cy={46} r={8} side="L" />
            <EyeSad cx={62} cy={46} r={8} side="R" />
          </>
        )}
        {!isHappy && !isSleeping && !isDead && !isHungry && (
          <>
            <EyeNormal cx={38} cy={46} r={8} uid={p} blink={state === "idle"} />
            <EyeNormal cx={62} cy={46} r={8} uid={p} />
          </>
        )}

        {/* ── NOSE ── */}
        <ellipse cx="50" cy="60" rx="4.5" ry="3.5" fill={NOSE} />
        <ellipse cx="48.5" cy="58.8" rx="1.8" ry="1.1" fill="white" opacity="0.5" />
        {/* philtrum */}
        <path d="M 50 63 L 48 66 M 50 63 L 52 66 M 50 63 L 50 66"
          stroke={OUTLINE} strokeWidth="0.85" strokeLinecap="round" opacity="0.55" />

        {/* ── MOUTH ── */}
        <Mouth type={isHappy ? "grin" : isHungry ? "frown" : isSleeping ? "neutral" : isDead ? "o" : isWalk ? "neutral" : "smile"} />

        {/* ── WHISKERS ── */}
        {!isDead && (
          <>
            <line x1="22" y1="60" x2="42" y2="61" stroke={WHISKER} strokeWidth="0.9" opacity="0.6" strokeLinecap="round" />
            <line x1="21" y1="63" x2="42" y2="63" stroke={WHISKER} strokeWidth="0.9" opacity="0.5" strokeLinecap="round" />
            <line x1="22" y1="66" x2="42" y2="65" stroke={WHISKER} strokeWidth="0.9" opacity="0.4" strokeLinecap="round" />
            <line x1="78" y1="61" x2="58" y2="60" stroke={WHISKER} strokeWidth="0.9" opacity="0.6" strokeLinecap="round" />
            <line x1="79" y1="63" x2="58" y2="63" stroke={WHISKER} strokeWidth="0.9" opacity="0.5" strokeLinecap="round" />
            <line x1="78" y1="65" x2="58" y2="66" stroke={WHISKER} strokeWidth="0.9" opacity="0.4" strokeLinecap="round" />
          </>
        )}

        {/* ── SLEEPING: ZZZ ── */}
        {isSleeping && (
          <>
            <text x="68" y="36" fontSize="10" fill="#A78BFA" fontWeight="900"
              style={{ animation: `sleeping-z1 2.8s ease-in-out infinite` }}>z</text>
            <text x="74" y="26" fontSize="14" fill="#A78BFA" fontWeight="900"
              style={{ animation: `sleeping-z2 2.8s ease-in-out 0.8s infinite` }}>z</text>
            <text x="82" y="14" fontSize="18" fill="#A78BFA" fontWeight="900"
              style={{ animation: `sleeping-z3 2.8s ease-in-out 1.6s infinite` }}>Z</text>
          </>
        )}

        {/* ── HUNGRY: shake overlay + sweat ── */}
        {isHungry && (
          <g style={{ animation: `hungry-shake 0.8s ease-in-out infinite` }}>
            {/* sweat drop */}
            <ellipse cx="78" cy="35" rx="3" ry="4.5" fill="#67CAEE" opacity="0.9" />
            <ellipse cx="78" cy="32.5" rx="1.5" ry="1.2" fill="#AEE8FA" opacity="0.7" />
          </g>
        )}

        {/* ── HAPPY: sparkle stars ── */}
        {isHappy && (
          <>
            <text x="6" y="26" fontSize="13"
              style={{ animation: `happy-star 1.1s ease-out infinite` }}>✨</text>
            <text x="78" y="20" fontSize="10"
              style={{ animation: `happy-star 1.1s ease-out 0.4s infinite` }}>⭐</text>
            <text x="2" y="50" fontSize="9"
              style={{ animation: `happy-star 1.1s ease-out 0.7s infinite` }}>✨</text>
          </>
        )}

        {/* ── DEAD: stars circling head ── */}
        {isDead && (
          <>
            {[0,1,2].map(i => (
              <text key={i} x={32 + i * 18} y="8" fontSize="10" fill="#FBBF24"
                style={{ animation: `dead-star 2s linear ${i * 0.66}s infinite`, transformBox: "fill-box", transformOrigin: `${41 + i * 18}px 12px` }}>
                ★
              </text>
            ))}
          </>
        )}

      </g>{/* end body wrapper */}

      {/* Ground shadow */}
      <ellipse cx="50" cy="117" rx="28" ry="5" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   State card
═══════════════════════════════════════════════════════════════════════════ */
function StateCard({ state }: { state: TState }) {
  const m = STATE_META[state];
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 0, padding: "18px 12px 14px",
      borderRadius: 20,
      background: m.bg,
      border: `1.5px solid ${m.accent}30`,
      boxShadow: `0 0 28px ${m.accent}18`,
      minWidth: 0, flex: 1,
      position: "relative",
    }}>
      <style>{makeCSS(state)}</style>

      {/* glow behind pet */}
      <div style={{
        position: "absolute", top: "25%", left: "50%",
        transform: "translateX(-50%)",
        width: 110, height: 110, borderRadius: "50%",
        background: `${m.accent}22`, filter: "blur(32px)",
        pointerEvents: "none",
      }} />

      {/* pet */}
      <div style={{ width: 110, height: 132, position: "relative" }}>
        <TomiFigure state={state} />
      </div>

      {/* label */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
        <span style={{ fontSize: 13 }}>{m.emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: m.accent }}>{m.label}</span>
      </div>

      {/* accent pip */}
      <div style={{
        width: 20, height: 3, borderRadius: 99, marginTop: 6,
        background: m.accent, boxShadow: `0 0 6px ${m.accent}`,
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Root export
═══════════════════════════════════════════════════════════════════════════ */
export function TomiStates() {
  const STATES: TState[] = ["idle","walk","happy","hungry","sleeping","dead"];

  return (
    <div style={{
      minHeight: "100vh", background: "#071321",
      color: "#E2E8F0", fontFamily: "'Inter', sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "28px 20px", gap: 20,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", color: "#475569", textTransform: "uppercase", marginBottom: 5 }}>
          Pet Design · Tomi — Vector Rebuild
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>
          6 State Animations — Tiap Bagian Independen
        </h1>
        <p style={{ fontSize: 11, color: "#475569", margin: "5px 0 0", fontWeight: 500 }}>
          telinga · mata · hidung · tangan (paw) · kaki · badan — CSS @keyframes terpisah
        </p>
      </div>

      {/* Grid: 3 + 3 */}
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 820 }}>
        {STATES.slice(0,3).map(s => <StateCard key={s} state={s} />)}
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 820 }}>
        {STATES.slice(3).map(s => <StateCard key={s} state={s} />)}
      </div>

      {/* Legend */}
      <div style={{ fontSize: 10, color: "#334155", fontWeight: 500, textAlign: "center" }}>
        Telinga: rotate dari pivot pangkal · Mata: shape berbeda per state (^w^, X, arc, brow) · Paw: translateY + rotate · Kaki: bounce terpisah L/R
      </div>
    </div>
  );
}
