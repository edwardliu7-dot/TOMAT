import React from "react";

interface SkinPalette {
  mainFur: string;
  lightFur: string;
  darkFur: string;
  belly: string;
  inner: string;
  nose: string;
  outline: string;
}

// ─── Skin Palettes ────────────────────────────────────────────────────────────
const SKINS: Record<string, { palette: SkinPalette; name: string; tier: string; tierColor: string; price: string; desc: string; glow?: string; badge: string }> = {
  golden: {
    name: "Golden Pup",
    tier: "STANDAR",
    tierColor: "#F5A623",
    price: "Gratis",
    badge: "🐾",
    desc: "Skin bawaan Tomi. Bulu emas mengkilap seperti golden retriever muda.",
    palette: {
      mainFur: "#F5A623", lightFur: "#F7C55E", darkFur: "#C47B0A",
      belly: "#FFF0C0", inner: "#FBCD70", nose: "#6B2D2D", outline: "#9A5A00",
    },
  },
  silver: {
    name: "Silver Star",
    tier: "PREMIUM",
    tierColor: "#C0C8D8",
    price: "800 🪙",
    badge: "⭐",
    desc: "Bulu perak berkilau. Menunjukkan siswa aktif dan rajin mengumpulkan koin.",
    glow: "rgba(192,200,216,0.4)",
    palette: {
      mainFur: "#B8C5D4", lightFur: "#E2EAF5", darkFur: "#7A8FA8",
      belly: "#EDF4FF", inner: "#C8D6E8", nose: "#3A4A58", outline: "#5A7090",
    },
  },
  cosmic: {
    name: "Cosmic Pup",
    tier: "EKSKLUSIF",
    tierColor: "#A78BFA",
    price: "2.000 🪙",
    badge: "🌌",
    desc: "Bulu ungu-biru galaksi dengan bintang berkelip. Status akun yang mengesankan.",
    glow: "rgba(167,139,250,0.5)",
    palette: {
      mainFur: "#7C3AED", lightFur: "#A78BFA", darkFur: "#4C1D95",
      belly: "#DDD6FE", inner: "#8B5CF6", nose: "#1E0055", outline: "#5B21B6",
    },
  },
  void: {
    name: "Void King",
    tier: "LEGENDARIS",
    tierColor: "#F59E0B",
    price: "5.000 🪙",
    badge: "👑",
    desc: "Bulu hitam pekat berpendar emas. Simbol kemewahan dan dominasi leaderboard.",
    glow: "rgba(245,158,11,0.6)",
    palette: {
      mainFur: "#1A1020", lightFur: "#2D1A40", darkFur: "#0A0810",
      belly: "#2D1A40", inner: "#3D2060", nose: "#F59E0B", outline: "#F59E0B",
    },
  },
};

// ─── Inline SVG pet (same as CharacterSheet, reused here) ────────────────────
function TomiSVG({ skin, size = 140, glowColor }: { skin: SkinPalette; size?: number; glowColor?: string }) {
  const uid = Math.random().toString(36).slice(2, 7);
  return (
    <svg width={size} height={size * 1.14} viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <filter id={`gf-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {glowColor && (
          <filter id={`eglow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="eg" />
            <feMerge><feMergeNode in="eg" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <radialGradient id={`bg-${uid}`} cx="42%" cy="35%" r="62%">
          <stop offset="0%" stopColor={skin.lightFur} />
          <stop offset="55%" stopColor={skin.mainFur} />
          <stop offset="100%" stopColor={skin.darkFur} />
        </radialGradient>
        <radialGradient id={`bly-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="100%" stopColor={skin.belly} />
        </radialGradient>
      </defs>

      {/* Outer glow for premium skins */}
      {glowColor && (
        <ellipse cx="68" cy="65" rx="52" ry="50" fill={glowColor} filter={`url(#eglow-${uid})`} opacity="0.6" />
      )}

      {/* Tail */}
      <ellipse cx="108" cy="118" rx="18" ry="11" fill={`url(#bg-${uid})`} stroke={skin.outline} strokeWidth="1.2" transform="rotate(-30 108 118)" />
      <ellipse cx="112" cy="110" rx="11" ry="7" fill={skin.lightFur} transform="rotate(-45 112 110)" />

      {/* Body */}
      <ellipse cx="68" cy="118" rx="35" ry="28" fill={`url(#bg-${uid})`} stroke={skin.outline} strokeWidth="1.5" />
      <ellipse cx="67" cy="120" rx="18" ry="16" fill={`url(#bly-${uid})`} />
      {[[-15,6],[12,4],[-8,-8],[16,-6]].map(([dx,dy],i) => (
        <circle key={i} cx={68+dx} cy={118+dy} r="8" fill={skin.mainFur} opacity="0.5" filter={`url(#gf-${uid})`} />
      ))}

      {/* Legs */}
      <ellipse cx="50" cy="140" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2" />
      <ellipse cx="50" cy="149" rx="9" ry="5" fill={skin.darkFur} />
      <ellipse cx="68" cy="141" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2" />
      <ellipse cx="68" cy="150" rx="9" ry="5" fill={skin.darkFur} />
      <ellipse cx="78" cy="140" rx="8" ry="11" fill={skin.darkFur} stroke={skin.outline} strokeWidth="1" opacity="0.7" />
      <ellipse cx="90" cy="139" rx="8" ry="11" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1" />
      <ellipse cx="90" cy="148" rx="8" ry="4.5" fill={skin.darkFur} />

      {/* Neck */}
      <ellipse cx="68" cy="90" rx="24" ry="14" fill={skin.mainFur} />

      {/* Head */}
      <ellipse cx="68" cy="65" rx="44" ry="42" fill={`url(#bg-${uid})`} stroke={skin.outline} strokeWidth="1.8" />
      {[[-38,0],[38,0],[-28,-28],[28,-28],[0,-40],[-18,34],[18,34]].map(([dx,dy],i) => (
        <circle key={i} cx={68+dx} cy={65+dy} r={i<4?12:10} fill={skin.mainFur} opacity="0.55" filter={`url(#gf-${uid})`} />
      ))}

      {/* Ears */}
      <ellipse cx="35" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5" />
      <ellipse cx="35" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6" />
      <ellipse cx="35" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5" />
      <ellipse cx="101" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5" />
      <ellipse cx="101" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6" />
      <ellipse cx="101" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5" />

      {/* Forehead tuft */}
      <ellipse cx="68" cy="28" rx="12" ry="8" fill={skin.lightFur} opacity="0.8" />
      <ellipse cx="62" cy="26" rx="8" ry="6" fill={skin.lightFur} opacity="0.6" />
      <ellipse cx="74" cy="27" rx="7" ry="5" fill={skin.lightFur} opacity="0.6" />

      {/* Eyes — for Void King, glowing gold */}
      <ellipse cx="53" cy="63" rx="11" ry="11" fill="white" />
      <ellipse cx="83" cy="63" rx="11" ry="11" fill="white" />
      <circle cx="54" cy="64" r="7" fill="#0a0000" />
      <circle cx="84" cy="64" r="7" fill="#0a0000" />
      {/* Gold pupils for Void */}
      {skin.nose === "#F59E0B" && (
        <>
          <circle cx="54" cy="64" r="5" fill="#F59E0B" opacity="0.9" />
          <circle cx="84" cy="64" r="5" fill="#F59E0B" opacity="0.9" />
        </>
      )}
      <circle cx="57" cy="60" r="2.5" fill="white" opacity="0.9" />
      <circle cx="87" cy="60" r="2.5" fill="white" opacity="0.9" />

      {/* Cheeks */}
      <ellipse cx="40" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.35" />
      <ellipse cx="96" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.35" />

      {/* Nose */}
      <ellipse cx="68" cy="79" rx="7" ry="5" fill={skin.nose} />
      <ellipse cx="66" cy="77.5" rx="2.5" ry="1.5" fill="white" opacity="0.5" />

      {/* Mouth */}
      <path d="M 62 84 Q 68 89 74 84" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Cosmic: sparkle stars on body */}
      {skin.mainFur === "#7C3AED" && (
        <>
          {[{x:50,y:105},{x:85,y:100},{x:70,y:130},{x:42,y:120},{x:95,y:118}].map((p,i) => (
            <text key={i} x={p.x} y={p.y} fontSize="8" fill="#E9D5FF" opacity="0.8">✦</text>
          ))}
        </>
      )}

      {/* Void King: gold crown */}
      {skin.nose === "#F59E0B" && (
        <g transform="translate(50, 18)">
          <polygon points="18,-10 24,0 30,-8 36,0 42,-10 44,6 -8,6" fill="#F59E0B" stroke="#C47B0A" strokeWidth="1" />
          <circle cx="18" cy="-2" r="3" fill="#EF4444" />
          <circle cx="30" cy="-6" r="3.5" fill="#3B82F6" />
          <circle cx="42" cy="-2" r="3" fill="#10B981" />
        </g>
      )}
    </svg>
  );
}

const CSS = `
@keyframes idle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
}
`;

export function SkinVariants() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1b2a 0%, #1a0d2e 100%)",
      padding: "32px 24px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#fff",
    }}>
      <style>{CSS}</style>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 13, letterSpacing: "0.25em", color: "#F5A623", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
          🛍️ PET SKIN SHOP
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#fff" }}>
          Koleksi Skin Tomi
        </h1>
        <div style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
          Ubah penampilan petmu — dari standar hingga legendaris
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {Object.entries(SKINS).map(([key, skin]) => (
          <div key={key} style={{
            background: skin.glow
              ? `radial-gradient(ellipse at 50% 0%, ${skin.glow}22, transparent 70%), rgba(255,255,255,0.04)`
              : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${skin.tierColor}44`,
            borderRadius: 22,
            padding: "24px 16px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            position: "relative",
            boxShadow: skin.glow ? `0 0 30px ${skin.glow}` : "none",
          }}>
            {/* Tier badge */}
            <div style={{
              position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
              background: skin.tierColor, color: key === "void" ? "#000" : "#fff",
              fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
              padding: "3px 10px", borderRadius: 20,
            }}>
              {skin.badge} {skin.tier}
            </div>

            {/* Pet */}
            <div style={{ animation: "idle-float 2s ease-in-out infinite", marginTop: 12 }}>
              <TomiSVG skin={skin.palette} size={130} glowColor={skin.glow} />
            </div>

            {/* Info */}
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: skin.tierColor }}>{skin.name}</div>
              <div style={{ color: "#94A3B8", fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{skin.desc}</div>
            </div>

            {/* Price button */}
            <button style={{
              width: "100%", padding: "10px", borderRadius: 12,
              background: key === "golden" ? "rgba(245,166,35,0.15)" : `${skin.tierColor}22`,
              border: `1px solid ${skin.tierColor}44`,
              color: skin.tierColor, fontWeight: 800, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {skin.price === "Gratis" ? "✅ Terpasang" : `Beli — ${skin.price}`}
            </button>
          </div>
        ))}
      </div>

      {/* Food section */}
      <div style={{ marginTop: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#F5A623", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>
            🍖 Toko Makanan Pet
          </div>
          <div style={{ color: "#64748B", fontSize: 12 }}>Semakin mahal makanannya, semakin lama Tomi kenyang</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { name: "Snack Biasa", emoji: "🍪", price: "30 🪙", duration: "2 jam", color: "#F5A623" },
            { name: "Makan Siang", emoji: "🍖", price: "80 🪙", duration: "6 jam", color: "#FB923C" },
            { name: "Makan Mewah", emoji: "🥩", price: "200 🪙", duration: "16 jam", color: "#C084FC" },
            { name: "Pesta Royal", emoji: "🍱", price: "500 🪙", duration: "3 hari", color: "#F59E0B" },
          ].map(f => (
            <div key={f.name} style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${f.color}33`,
              borderRadius: 16, padding: "16px 12px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{ fontSize: 36 }}>{f.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>{f.name}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Kenyang selama {f.duration}</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: f.color }}>{f.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
