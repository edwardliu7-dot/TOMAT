import React from "react";

// ─── Tomi SVG Pet Component ──────────────────────────────────────────────────
// Golden fluffy big-headed creature — like a baby golden retriever
// Props: state, skinColors, size
interface SkinPalette {
  mainFur: string;
  lightFur: string;
  darkFur: string;
  belly: string;
  inner: string;
  nose: string;
  outline: string;
}

const GOLDEN: SkinPalette = {
  mainFur: "#F5A623",
  lightFur: "#F7C55E",
  darkFur: "#C47B0A",
  belly: "#FFF0C0",
  inner: "#FBCD70",
  nose: "#6B2D2D",
  outline: "#9A5A00",
};

type PetState = "idle" | "walk" | "happy" | "hungry" | "sleeping";

function TomiSVG({
  state,
  skin = GOLDEN,
  size = 140,
}: {
  state: PetState;
  skin?: SkinPalette;
  size?: number;
}) {
  const s = size / 140;
  const id = `tomi-${state}-${Math.random().toString(36).slice(2, 6)}`;

  // Eye expressions per state
  const eyeOpen = state !== "sleeping";
  const eyeHappy = state === "happy";
  const eyeHungry = state === "hungry";
  const showTongue = state === "happy";
  const mouthDroop = state === "hungry";

  // Ear droop for hungry/sleeping
  const earRotL = state === "hungry" || state === "sleeping" ? 20 : 0;
  const earRotR = state === "hungry" || state === "sleeping" ? -20 : 0;

  return (
    <svg
      width={140 * s}
      height={160 * s}
      viewBox="0 0 140 160"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {/* Fur texture: radial blur glow */}
        <filter id={`${id}-fur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`${id}-body-grad`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skin.lightFur} />
          <stop offset="60%" stopColor={skin.mainFur} />
          <stop offset="100%" stopColor={skin.darkFur} />
        </radialGradient>
        <radialGradient id={`${id}-head-grad`} cx="42%" cy="35%" r="62%">
          <stop offset="0%" stopColor={skin.lightFur} />
          <stop offset="55%" stopColor={skin.mainFur} />
          <stop offset="100%" stopColor={skin.darkFur} />
        </radialGradient>
        <radialGradient id={`${id}-belly-grad`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="100%" stopColor={skin.belly} />
        </radialGradient>
        <radialGradient id={`${id}-eye-grad`} cx="30%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#2d0a00" />
          <stop offset="100%" stopColor="#0a0000" />
        </radialGradient>
      </defs>

      {/* ── TAIL ── */}
      <ellipse
        cx="108" cy="118" rx="18" ry="11"
        fill={`url(#${id}-body-grad)`}
        stroke={skin.outline} strokeWidth="1.2"
        transform="rotate(-30 108 118)"
      />
      <ellipse
        cx="112" cy="110" rx="11" ry="7"
        fill={skin.lightFur}
        transform="rotate(-45 112 110)"
      />

      {/* ── BODY ── */}
      {/* Fluffy body base — slightly wider than tall */}
      <ellipse
        cx="68" cy="118" rx="35" ry="28"
        fill={`url(#${id}-body-grad)`}
        stroke={skin.outline} strokeWidth="1.5"
      />
      {/* Belly patch */}
      <ellipse
        cx="67" cy="120" rx="18" ry="16"
        fill={`url(#${id}-belly-grad)`}
      />
      {/* Body fur tufts */}
      {[[-15, 6], [12, 4], [-8, -8], [16, -6]].map(([dx, dy], i) => (
        <circle
          key={i}
          cx={68 + dx} cy={118 + dy} r="8"
          fill={skin.mainFur}
          opacity="0.5"
          filter={`url(#${id}-fur)`}
        />
      ))}

      {/* ── LEGS / PAWS ── */}
      {/* Front-left */}
      <ellipse cx="50" cy="140" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2" />
      <ellipse cx="50" cy="149" rx="9" ry="5" fill={skin.darkFur} />
      {/* Front-right */}
      <ellipse cx="68" cy="141" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2" />
      <ellipse cx="68" cy="150" rx="9" ry="5" fill={skin.darkFur} />
      {/* Back-left (partially hidden) */}
      <ellipse cx="78" cy="140" rx="8" ry="11" fill={skin.darkFur} stroke={skin.outline} strokeWidth="1"  opacity="0.7" />
      <ellipse cx="78" cy="149" rx="8" ry="4.5" fill={skin.darkFur} opacity="0.7" />
      {/* Back-right */}
      <ellipse cx="90" cy="139" rx="8" ry="11" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1" />
      <ellipse cx="90" cy="148" rx="8" ry="4.5" fill={skin.darkFur} />

      {/* ── NECK FUR CONNECT ── */}
      <ellipse cx="68" cy="90" rx="24" ry="14" fill={skin.mainFur} />

      {/* ── HEAD (big, round, slightly flattened) ── */}
      <ellipse
        cx="68" cy="65" rx="44" ry="42"
        fill={`url(#${id}-head-grad)`}
        stroke={skin.outline} strokeWidth="1.8"
      />
      {/* Head fur tufts — outer fluffiness */}
      {[
        [-38, 0], [38, 0], [-28, -28], [28, -28],
        [0, -40], [-18, 34], [18, 34],
      ].map(([dx, dy], i) => (
        <circle
          key={i}
          cx={68 + dx} cy={65 + dy} r={i < 4 ? 12 : 10}
          fill={skin.mainFur}
          opacity="0.55"
          filter={`url(#${id}-fur)`}
        />
      ))}

      {/* ── EARS ── */}
      {/* Left ear */}
      <g transform={`rotate(${earRotL} 35 40)`}>
        <ellipse cx="35" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5" />
        <ellipse cx="35" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6" />
        {/* Inner ear fur tuft */}
        <ellipse cx="35" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5" />
      </g>
      {/* Right ear */}
      <g transform={`rotate(${earRotR} 101 40)`}>
        <ellipse cx="101" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5" />
        <ellipse cx="101" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6" />
        <ellipse cx="101" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5" />
      </g>

      {/* ── FOREHEAD TUFT ── */}
      <ellipse cx="68" cy="28" rx="12" ry="8" fill={skin.lightFur} opacity="0.8" />
      <ellipse cx="62" cy="26" rx="8" ry="6" fill={skin.lightFur} opacity="0.6" />
      <ellipse cx="74" cy="27" rx="7" ry="5" fill={skin.lightFur} opacity="0.6" />

      {/* ── EYES ── */}
      {eyeOpen ? (
        <>
          {/* Eye whites */}
          <ellipse cx="53" cy="63" rx="11" ry={eyeHappy ? 9 : 11} fill="white" />
          <ellipse cx="83" cy="63" rx="11" ry={eyeHappy ? 9 : 11} fill="white" />
          {/* Pupils */}
          <circle cx="54" cy="64" r={eyeHungry ? 6 : 7} fill={`url(#${id}-eye-grad)`} />
          <circle cx="84" cy="64" r={eyeHungry ? 6 : 7} fill={`url(#${id}-eye-grad)`} />
          {/* Eye shines */}
          <circle cx="57" cy="60" r="2.5" fill="white" opacity="0.9" />
          <circle cx="87" cy="60" r="2.5" fill="white" opacity="0.9" />
          <circle cx="56" cy="65" r="1" fill="white" opacity="0.5" />
          <circle cx="86" cy="65" r="1" fill="white" opacity="0.5" />
          {/* Happy eyebrow arcs */}
          {eyeHappy && (
            <>
              <path d="M 46 55 Q 53 50 60 55" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 76 55 Q 83 50 90 55" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* Hungry sad eyebrows */}
          {eyeHungry && (
            <>
              <path d="M 46 57 Q 53 54 60 58" stroke={skin.outline} strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 76 58 Q 83 54 90 57" stroke={skin.outline} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            </>
          )}
        </>
      ) : (
        /* Sleeping eyes — curved lines */
        <>
          <path d="M 44 63 Q 53 57 62 63" stroke={skin.outline} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 74 63 Q 83 57 92 63" stroke={skin.outline} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ── CHEEK BLUSH ── */}
      <ellipse cx="40" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.35" />
      <ellipse cx="96" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.35" />

      {/* ── NOSE ── */}
      <ellipse cx="68" cy="79" rx="7" ry="5" fill={skin.nose} />
      <ellipse cx="66" cy="77.5" rx="2.5" ry="1.5" fill="white" opacity="0.5" />

      {/* ── MOUTH ── */}
      {mouthDroop ? (
        <path d="M 62 86 Q 68 83 74 86" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : showTongue ? (
        <>
          <path d="M 62 84 Q 68 90 74 84" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="68" cy="90" rx="6" ry="5" fill="#FF8BA0" stroke="#e06080" strokeWidth="1" />
          <line x1="68" y1="86" x2="68" y2="94" stroke="#e06080" strokeWidth="1" />
        </>
      ) : (
        <path d="M 62 84 Q 68 89 74 84" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* ── SLEEPING ZZZ ── */}
      {state === "sleeping" && (
        <>
          <text x="96" y="44" fontSize="12" fill="#A0C4FF" fontWeight="bold" opacity="0.9">z</text>
          <text x="105" y="34" fontSize="16" fill="#A0C4FF" fontWeight="bold" opacity="0.7">z</text>
          <text x="116" y="22" fontSize="20" fill="#A0C4FF" fontWeight="bold" opacity="0.5">z</text>
        </>
      )}

      {/* ── HUNGRY STOMACH RUMBLE ── */}
      {state === "hungry" && (
        <text x="82" y="128" fontSize="16" fill="#FFB347" opacity="0.9">💫</text>
      )}
    </svg>
  );
}

// ─── Animation CSS ────────────────────────────────────────────────────────────
const CSS = `
@keyframes tomi-idle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes tomi-tail-wag {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}
@keyframes tomi-walk {
  0%   { transform: translateX(0) rotate(0deg); }
  25%  { transform: translateX(6px) rotate(2deg); }
  50%  { transform: translateX(0) rotate(0deg); }
  75%  { transform: translateX(-6px) rotate(-2deg); }
  100% { transform: translateX(0) rotate(0deg); }
}
@keyframes tomi-happy {
  0%   { transform: scale(1) rotate(0deg); }
  20%  { transform: scale(1.08) rotate(-5deg) translateY(-8px); }
  40%  { transform: scale(1) rotate(5deg) translateY(0px); }
  60%  { transform: scale(1.08) rotate(-4deg) translateY(-6px); }
  80%  { transform: scale(1) rotate(3deg) translateY(0px); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes tomi-hungry {
  0%, 100% { transform: translateX(0) translateY(0); }
  20% { transform: translateX(-3px) translateY(1px); }
  60% { transform: translateX(3px) translateY(1px); }
}
@keyframes tomi-sleep-float {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-4px) rotate(2deg); }
}
@keyframes zzz-float {
  0%   { opacity: 0; transform: translate(0px, 0px) scale(0.5); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: translate(10px, -25px) scale(1.1); }
}
`;

const STATES: { id: PetState; label: string; emoji: string; anim: string; desc: string }[] = [
  { id: "idle",     label: "Idle",     emoji: "😊", anim: "tomi-idle 2s ease-in-out infinite",     desc: "Mengambang santai" },
  { id: "walk",     label: "Berjalan", emoji: "🐾", anim: "tomi-walk 0.8s ease-in-out infinite",   desc: "Mondar-mandir layar" },
  { id: "happy",    label: "Senang",   emoji: "🎉", anim: "tomi-happy 1s ease-in-out infinite",    desc: "Setelah disentuh" },
  { id: "hungry",   label: "Lapar",    emoji: "😩", anim: "tomi-hungry 1.2s ease-in-out infinite", desc: "Perlu makan!" },
  { id: "sleeping", label: "Tidur",    emoji: "💤", anim: "tomi-sleep-float 3s ease-in-out infinite", desc: "Malam hari" },
];

export function CharacterSheet() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1b2a 0%, #1a0d2e 100%)",
      padding: "32px 24px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.25em", color: "#F5A623", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
          🐾 TOMAT PET SYSTEM
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, background: "linear-gradient(90deg, #F7C55E, #F5A623, #C47B0A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Tomi
        </h1>
        <div style={{ color: "#94A3B8", fontSize: 13, marginTop: 4 }}>
          Teman Setia Pejuang Matematika
        </div>
      </div>

      {/* Character states grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {STATES.map(({ id, label, emoji, anim, desc }) => (
          <div key={id} style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 20,
            padding: "20px 12px 16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            {/* Animated pet */}
            <div style={{ position: "relative", height: 170, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ animation: anim, transformOrigin: "center bottom" }}>
                <TomiSVG state={id} size={140} />
              </div>
            </div>

            {/* Label */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{emoji}</div>
              <div style={{ fontWeight: 800, color: "#F7C55E", fontSize: 14, marginTop: 2 }}>{label}</div>
              <div style={{ color: "#64748B", fontSize: 11, marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Design notes */}
      <div style={{
        marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
      }}>
        {[
          { icon: "🍖", title: "Sistem Lapar", text: "Hunger turun setiap jam. Beri makan dari Toko untuk mengisi kenyang. Makanan mahal = tahan lebih lama." },
          { icon: "✋", title: "Sentuhan Reaktif", text: "Tap Tomi saat bermain → animasi Happy. Long-press → Tomi merebahkan badan. Shake → Tomi pusing!" },
          { icon: "💀", title: "Bahaya Mati", text: "Jika kelaparan >24 jam, Tomi mati dengan mata ✕. Siswa harus membeli Snack Darurat untuk menghidupkan kembali." },
        ].map(({ icon, title, text }) => (
          <div key={title} style={{
            background: "rgba(245,166,35,0.06)",
            border: "1px solid rgba(245,166,35,0.15)",
            borderRadius: 14, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontWeight: 800, color: "#F7C55E", fontSize: 13, marginBottom: 4 }}>{title}</div>
            <div style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.6 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
