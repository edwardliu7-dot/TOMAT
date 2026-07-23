import React from "react";

// ─── Palette ──────────────────────────────────────────────────────────────────
export interface SkinPalette {
  mainFur: string;
  lightFur: string;
  darkFur: string;
  belly: string;
  rosette: string;   // rosette swirl accent
  nose: string;
  outline: string;
  whisker: string;
}

export const GOLDEN: SkinPalette = {
  mainFur:  "#F5A623",
  lightFur: "#F7C55E",
  darkFur:  "#C47B0A",
  belly:    "#FFF3CC",
  rosette:  "#D48A12",
  nose:     "#E07090",
  outline:  "#9A5A00",
  whisker:  "#7A4400",
};

// ─── Guinea-pig SVG ────────────────────────────────────────────────────────────
// Cute marmut: huge round head, barrel body, tiny feet, round ears, rosettes,
// whiskers, big eyes. No tail (guinea pigs don't have one).
export type PetState = "idle" | "walk" | "happy" | "hungry" | "sleeping";

export function TomiSVG({
  state  = "idle",
  skin   = GOLDEN,
  size   = 140,
}: {
  state?:  PetState;
  skin?:   SkinPalette;
  size?:   number;
}) {
  const uid = `gp-${Math.random().toString(36).slice(2, 7)}`;

  const sleeping = state === "sleeping";
  const hungry   = state === "hungry";
  const happy    = state === "happy";

  // ear droop angles for sad/sleeping
  const earTilt = sleeping || hungry ? 18 : 0;

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {/* soft fur blur overlay */}
        <filter id={`blur-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* head gradient – light top-left, dark bottom-right */}
        <radialGradient id={`hg-${uid}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={skin.lightFur}/>
          <stop offset="55%"  stopColor={skin.mainFur}/>
          <stop offset="100%" stopColor={skin.darkFur}/>
        </radialGradient>
        {/* body gradient */}
        <radialGradient id={`bg-${uid}`} cx="45%" cy="38%" r="58%">
          <stop offset="0%"   stopColor={skin.lightFur}/>
          <stop offset="60%"  stopColor={skin.mainFur}/>
          <stop offset="100%" stopColor={skin.darkFur}/>
        </radialGradient>
        {/* belly gradient */}
        <radialGradient id={`belly-${uid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#fffde8"/>
          <stop offset="100%" stopColor={skin.belly}/>
        </radialGradient>
        {/* eye gradient */}
        <radialGradient id={`eye-${uid}`} cx="30%" cy="28%" r="65%">
          <stop offset="0%"   stopColor="#3D1A00"/>
          <stop offset="100%" stopColor="#100500"/>
        </radialGradient>
      </defs>

      {/* ── BODY (compact barrel, sits below head) ── */}
      <ellipse cx="60" cy="92" rx="30" ry="22"
        fill={`url(#bg-${uid})`} stroke={skin.outline} strokeWidth="1.4"/>
      {/* belly patch */}
      <ellipse cx="60" cy="94" rx="16" ry="13"
        fill={`url(#belly-${uid})`}/>
      {/* body fur tufts */}
      {[[-22,2],[20,0],[-10,-10],[14,-8]].map(([dx,dy],i)=>(
        <circle key={i} cx={60+dx} cy={92+dy} r="7"
          fill={skin.mainFur} opacity="0.45"
          filter={`url(#blur-${uid})`}/>
      ))}
      {/* rosette swirls on body */}
      <circle cx="44" cy="88" r="5" fill="none"
        stroke={skin.rosette} strokeWidth="1.2" opacity="0.55"/>
      <circle cx="44" cy="88" r="1.8" fill={skin.rosette} opacity="0.4"/>
      <circle cx="72" cy="95" r="4.5" fill="none"
        stroke={skin.rosette} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="72" cy="95" r="1.6" fill={skin.rosette} opacity="0.35"/>

      {/* ── TINY FEET (barely peek out under body) ── */}
      {/* front-left */}
      <ellipse cx="42" cy="109" rx="8" ry="5"
        fill={skin.mainFur} stroke={skin.outline} strokeWidth="1"/>
      <ellipse cx="42" cy="112" rx="8" ry="3"
        fill={skin.darkFur}/>
      {/* toe nubs */}
      {[-4,-1,2].map((dx,i)=>(
        <circle key={i} cx={42+dx} cy="114" r="1.5" fill={skin.darkFur} opacity="0.8"/>
      ))}
      {/* front-right */}
      <ellipse cx="58" cy="110" rx="8" ry="5"
        fill={skin.mainFur} stroke={skin.outline} strokeWidth="1"/>
      <ellipse cx="58" cy="113" rx="8" ry="3" fill={skin.darkFur}/>
      {[-4,-1,2].map((dx,i)=>(
        <circle key={i} cx={58+dx} cy="115" r="1.5" fill={skin.darkFur} opacity="0.8"/>
      ))}
      {/* back feet (slightly darker, partially hidden) */}
      <ellipse cx="73" cy="109" rx="7" ry="4.5"
        fill={skin.darkFur} stroke={skin.outline} strokeWidth="0.9" opacity="0.75"/>
      <ellipse cx="86" cy="108" rx="7" ry="4.5"
        fill={skin.mainFur} stroke={skin.outline} strokeWidth="0.9" opacity="0.85"/>

      {/* ── HEAD (very large, round – guinea pigs are mostly head!) ── */}
      {/* outer fur halo */}
      {[[-34,2],[32,2],[-24,-22],[22,-22],[0,-34],[-16,24],[14,24]].map(([dx,dy],i)=>(
        <circle key={i} cx={60+dx} cy={56+dy} r={i<4?11:9}
          fill={skin.mainFur} opacity="0.5"
          filter={`url(#blur-${uid})`}/>
      ))}
      <ellipse cx="60" cy="56" rx="38" ry="36"
        fill={`url(#hg-${uid})`} stroke={skin.outline} strokeWidth="1.6"/>

      {/* ── EARS (small, round, on top sides of head) ── */}
      {/* left ear */}
      <g transform={`rotate(${earTilt} 28 32)`}>
        <ellipse cx="28" cy="30" rx="11" ry="13"
          fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.4"/>
        <ellipse cx="28" cy="31" rx="6" ry="8"
          fill={skin.darkFur} opacity="0.5"/>
        <ellipse cx="28" cy="30" rx="3.5" ry="5"
          fill="#F9C0C8" opacity="0.55"/>
      </g>
      {/* right ear */}
      <g transform={`rotate(${-earTilt} 92 32)`}>
        <ellipse cx="92" cy="30" rx="11" ry="13"
          fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.4"/>
        <ellipse cx="92" cy="31" rx="6" ry="8"
          fill={skin.darkFur} opacity="0.5"/>
        <ellipse cx="92" cy="30" rx="3.5" ry="5"
          fill="#F9C0C8" opacity="0.55"/>
      </g>

      {/* ── FUR TUFT on forehead ── */}
      <ellipse cx="60" cy="23" rx="10" ry="7" fill={skin.lightFur} opacity="0.8"/>
      <ellipse cx="54" cy="22" rx="7"  ry="5" fill={skin.lightFur} opacity="0.6"/>
      <ellipse cx="66" cy="22" rx="6"  ry="4.5" fill={skin.lightFur} opacity="0.55"/>

      {/* ── ROSETTE on head (one side) ── */}
      <circle cx="40" cy="60" r="5" fill="none"
        stroke={skin.rosette} strokeWidth="1.1" opacity="0.45"/>
      <circle cx="40" cy="60" r="1.8" fill={skin.rosette} opacity="0.35"/>

      {/* ── EYES ── */}
      {sleeping ? (
        /* closed — simple curved lines */
        <>
          <path d="M 46 57 Q 53 52 60 57" stroke={skin.outline} strokeWidth="2.2"
            fill="none" strokeLinecap="round"/>
          <path d="M 72 57 Q 79 52 86 57" stroke={skin.outline} strokeWidth="2.2"
            fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          {/* sclera */}
          <circle cx="52" cy="56" r="10" fill="white"/>
          <circle cx="76" cy="56" r="10" fill="white"/>
          {/* iris */}
          <circle cx="53" cy="57" r={hungry ? 5.5 : 6.5}
            fill={`url(#eye-${uid})`}/>
          <circle cx="77" cy="57" r={hungry ? 5.5 : 6.5}
            fill={`url(#eye-${uid})`}/>
          {/* shine */}
          <circle cx="56" cy="53" r="2.2" fill="white" opacity="0.92"/>
          <circle cx="80" cy="53" r="2.2" fill="white" opacity="0.92"/>
          <circle cx="55" cy="59" r="0.9" fill="white" opacity="0.5"/>
          <circle cx="79" cy="59" r="0.9" fill="white" opacity="0.5"/>
          {/* happy arched brow */}
          {happy && (
            <>
              <path d="M 44 47 Q 52 42 60 47" stroke={skin.outline} strokeWidth="1.8"
                fill="none" strokeLinecap="round"/>
              <path d="M 68 47 Q 76 42 84 47" stroke={skin.outline} strokeWidth="1.8"
                fill="none" strokeLinecap="round"/>
            </>
          )}
          {/* hungry sad brow – inner corners raised */}
          {hungry && (
            <>
              <path d="M 44 49 Q 52 46 60 50" stroke={skin.outline} strokeWidth="2"
                fill="none" strokeLinecap="round"/>
              <path d="M 68 50 Q 76 46 84 49" stroke={skin.outline} strokeWidth="2"
                fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}

      {/* ── CHEEK BLUSH ── */}
      <ellipse cx="39" cy="66" rx="7.5" ry="4" fill="#FF9999" opacity="0.32"/>
      <ellipse cx="89" cy="66" rx="7.5" ry="4" fill="#FF9999" opacity="0.32"/>

      {/* ── NOSE (small, round, pink – guinea pig style) ── */}
      <ellipse cx="60" cy="70" rx="5" ry="4" fill={skin.nose}/>
      <ellipse cx="58.5" cy="68.5" rx="2" ry="1.2" fill="white" opacity="0.5"/>
      {/* Y-shaped nose groove */}
      <path d="M 60 73 L 58 76 M 60 73 L 62 76 M 60 73 L 60 76"
        stroke={skin.outline} strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>

      {/* ── MOUTH ── */}
      {hungry ? (
        <path d="M 54 79 Q 60 76 66 79"
          stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      ) : happy ? (
        <>
          <path d="M 54 78 Q 60 84 66 78"
            stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          {/* tongue */}
          <ellipse cx="60" cy="83" rx="5" ry="4" fill="#FF8BA0" stroke="#e06080" strokeWidth="0.9"/>
          <line x1="60" y1="79" x2="60" y2="86" stroke="#e06080" strokeWidth="0.9"/>
        </>
      ) : (
        <path d="M 54 78 Q 60 83 66 78"
          stroke={skin.outline} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      )}

      {/* ── WHISKERS ── */}
      {/* left side */}
      <line x1="40" y1="70" x2="54" y2="71" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.65" strokeLinecap="round"/>
      <line x1="40" y1="73" x2="54" y2="73" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.55" strokeLinecap="round"/>
      <line x1="40" y1="76" x2="54" y2="75" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.45" strokeLinecap="round"/>
      {/* right side */}
      <line x1="80" y1="71" x2="94" y2="70" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.65" strokeLinecap="round"/>
      <line x1="80" y1="73" x2="95" y2="73" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.55" strokeLinecap="round"/>
      <line x1="80" y1="75" x2="94" y2="76" stroke={skin.whisker}
        strokeWidth="0.9" opacity="0.45" strokeLinecap="round"/>

      {/* ── STATE EXTRAS ── */}
      {sleeping && (
        <>
          <text x="88" y="38" fontSize="10" fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="96" y="28" fontSize="14" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="105" y="17" fontSize="18" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      )}
      {hungry && (
        <text x="78" y="106" fontSize="14" fill="#FFB347" opacity="0.85">💫</text>
      )}
    </svg>
  );
}

// ─── CSS animations ───────────────────────────────────────────────────────────
export const PET_CSS = `
@keyframes gp-idle {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  30%      { transform: translateY(-5px) rotate(-1deg); }
  70%      { transform: translateY(-3px) rotate(1deg); }
}
@keyframes gp-walk {
  0%   { transform: translateX(0)   rotate(0deg)  scaleX(1); }
  20%  { transform: translateX(5px) rotate(2deg)  scaleX(1.03); }
  50%  { transform: translateX(0)   rotate(0deg)  scaleX(1); }
  70%  { transform: translateX(-5px) rotate(-2deg) scaleX(1.03); }
  100% { transform: translateX(0)   rotate(0deg)  scaleX(1); }
}
@keyframes gp-happy {
  0%   { transform: scale(1)    rotate(0deg)  translateY(0); }
  20%  { transform: scale(1.1)  rotate(-6deg) translateY(-9px); }
  40%  { transform: scale(1)    rotate(5deg)  translateY(0); }
  60%  { transform: scale(1.08) rotate(-4deg) translateY(-6px); }
  80%  { transform: scale(1)    rotate(3deg)  translateY(0); }
  100% { transform: scale(1)    rotate(0deg)  translateY(0); }
}
@keyframes gp-hungry {
  0%,100% { transform: translateX(0) translateY(0); }
  25%      { transform: translateX(-2px) translateY(1px); }
  75%      { transform: translateX(2px)  translateY(1px); }
}
@keyframes gp-sleep {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-4px) rotate(2deg); }
}
`;

// ─── States list ──────────────────────────────────────────────────────────────
const STATES: {
  id: PetState; label: string; emoji: string; anim: string; desc: string;
}[] = [
  { id:"idle",     label:"Idle",     emoji:"😊", anim:"gp-idle 2.2s ease-in-out infinite",    desc:"Mengambang santai" },
  { id:"walk",     label:"Berjalan", emoji:"🐾", anim:"gp-walk 0.9s ease-in-out infinite",    desc:"Mondar-mandir layar" },
  { id:"happy",    label:"Senang",   emoji:"🎉", anim:"gp-happy 1s ease-in-out infinite",     desc:"Setelah disentuh" },
  { id:"hungry",   label:"Lapar",    emoji:"😩", anim:"gp-hungry 1.3s ease-in-out infinite",  desc:"Perlu makan!" },
  { id:"sleeping", label:"Tidur",    emoji:"💤", anim:"gp-sleep 3s ease-in-out infinite",     desc:"Malam hari" },
];

// ─── Character Sheet screen ───────────────────────────────────────────────────
export function CharacterSheet() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d1b2a 0%,#1a0d2e 100%)",
      padding:"32px 24px",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      color:"#fff",
    }}>
      <style>{PET_CSS}</style>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontSize:13, letterSpacing:"0.25em", color:"#F5A623",
          fontWeight:800, textTransform:"uppercase", marginBottom:6 }}>
          🐹 TOMAT PET SYSTEM
        </div>
        <h1 style={{ fontSize:32, fontWeight:900, margin:0,
          background:"linear-gradient(90deg,#F7C55E,#F5A623,#C47B0A)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Tomi
        </h1>
        <div style={{ color:"#94A3B8", fontSize:13, marginTop:4 }}>
          Marmut Emas — Teman Setia Pejuang Matematika
        </div>
      </div>

      {/* State grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16 }}>
        {STATES.map(({ id, label, emoji, anim, desc }) => (
          <div key={id} style={{
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(245,166,35,0.2)",
            borderRadius:20,
            padding:"20px 12px 16px",
            display:"flex", flexDirection:"column", alignItems:"center", gap:10,
          }}>
            <div style={{ height:148, display:"flex",
              alignItems:"flex-end", justifyContent:"center" }}>
              <div style={{ animation:anim, transformOrigin:"center bottom" }}>
                <TomiSVG state={id} size={130}/>
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:18 }}>{emoji}</div>
              <div style={{ fontWeight:800, color:"#F7C55E", fontSize:14, marginTop:2 }}>{label}</div>
              <div style={{ color:"#64748B", fontSize:11, marginTop:2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Design notes */}
      <div style={{ marginTop:28, display:"grid",
        gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        {[
          { icon:"🍖", title:"Sistem Lapar",
            text:"Hunger turun tiap jam. Beri makan dari Toko agar Tomi tetap hidup. Makanan mahal = tahan lebih lama." },
          { icon:"✋", title:"Sentuhan Reaktif",
            text:"Tap Tomi → animasi Senang. Long-press → Tomi merebahkan badan. Shake → Tomi pusing!" },
          { icon:"💀", title:"Bahaya Mati",
            text:"Kelaparan >24 jam → Tomi mati (mata ✕). Beli Snack Darurat di Toko untuk menghidupkan kembali." },
        ].map(({ icon, title, text }) => (
          <div key={title} style={{
            background:"rgba(245,166,35,0.06)",
            border:"1px solid rgba(245,166,35,0.15)",
            borderRadius:14, padding:"14px 16px",
          }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontWeight:800, color:"#F7C55E", fontSize:13, marginBottom:4 }}>{title}</div>
            <div style={{ color:"#94A3B8", fontSize:11, lineHeight:1.6 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
