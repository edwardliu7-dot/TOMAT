import React from "react";
import { TomiSVG, PET_CSS, type SkinPalette } from "./CharacterSheet";

// ─── Skin catalogue ───────────────────────────────────────────────────────────
const SKINS: Record<string, {
  palette: SkinPalette;
  name: string; tier: string; tierColor: string;
  price: string; desc: string; glow?: string; badge: string;
}> = {
  golden: {
    name:"Golden Marmut",  tier:"STANDAR",    tierColor:"#F5A623", price:"Gratis",      badge:"🐹",
    desc:"Skin bawaan Tomi. Bulu emas mengkilap, rosette khas marmut golden retriever.",
    palette:{
      mainFur:"#F5A623", lightFur:"#F7C55E", darkFur:"#C47B0A",
      belly:"#FFF3CC", rosette:"#D48A12", nose:"#E07090", outline:"#9A5A00", whisker:"#7A4400",
    },
  },
  silver: {
    name:"Silver Fluff",   tier:"PREMIUM",    tierColor:"#C0C8D8", price:"800 🪙",      badge:"⭐",
    desc:"Bulu perak berkilau. Rosette bling-bling, menunjukkan siswa aktif.",
    glow:"rgba(192,200,216,0.35)",
    palette:{
      mainFur:"#B8C5D4", lightFur:"#E2EAF5", darkFur:"#7A8FA8",
      belly:"#EDF4FF", rosette:"#9AAFC5", nose:"#D08098", outline:"#5A7090", whisker:"#4A607A",
    },
  },
  cosmic: {
    name:"Cosmic Fluff",   tier:"EKSKLUSIF",  tierColor:"#A78BFA", price:"2.000 🪙",   badge:"🌌",
    desc:"Bulu ungu-biru galaksi, bintang berkelip di rosette. Status yang mengesankan.",
    glow:"rgba(167,139,250,0.45)",
    palette:{
      mainFur:"#7C3AED", lightFur:"#A78BFA", darkFur:"#4C1D95",
      belly:"#DDD6FE", rosette:"#C4B5FD", nose:"#F472B6", outline:"#5B21B6", whisker:"#8B5CF6",
    },
  },
  void: {
    name:"Void Emperor",   tier:"LEGENDARIS", tierColor:"#F59E0B", price:"5.000 🪙",   badge:"👑",
    desc:"Bulu hitam pekat berpendar emas, mata bercahaya, mahkota emas. Dominasi leaderboard.",
    glow:"rgba(245,158,11,0.55)",
    palette:{
      mainFur:"#1A1020", lightFur:"#2D1A40", darkFur:"#0A0810",
      belly:"#2A1830", rosette:"#F59E0B", nose:"#F59E0B", outline:"#F59E0B", whisker:"#F59E0B",
    },
  },
};

// ─── Void King overlay: crown + glowing eyes ─────────────────────────────────
function VoidOverlay({ size }: { size: number }) {
  const s = size / 120;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120"
      style={{ position:"absolute", top:0, left:0, pointerEvents:"none", overflow:"visible" }}>
      {/* crown */}
      <g transform="translate(38,8)">
        <polygon points="22,-11 28,0 36,-9 44,0 50,-11 52,7 -8,7"
          fill="#F59E0B" stroke="#C47B0A" strokeWidth="1"/>
        <circle cx="22" cy="-2" r="3" fill="#EF4444"/>
        <circle cx="36" cy="-7" r="3.5" fill="#60A5FA"/>
        <circle cx="50" cy="-2" r="3" fill="#10B981"/>
      </g>
      {/* glowing gold eyes */}
      <circle cx="53" cy="57" r="8" fill="#F59E0B" opacity="0.85"/>
      <circle cx="77" cy="57" r="8" fill="#F59E0B" opacity="0.85"/>
      <circle cx="56" cy="53" r="2.5" fill="white" opacity="0.9"/>
      <circle cx="80" cy="53" r="2.5" fill="white" opacity="0.9"/>
    </svg>
  );
}

// ─── Cosmic glitter stars on body ────────────────────────────────────────────
function CosmicStars({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120"
      style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}>
      {[{x:42,y:88},{x:70,y:94},{x:55,y:102},{x:80,y:85}].map((p,i)=>(
        <text key={i} x={p.x} y={p.y} fontSize="7" fill="#E9D5FF" opacity="0.85">✦</text>
      ))}
    </svg>
  );
}

const CSS = `
${PET_CSS}
@keyframes idle-float {
  0%,100% { transform:translateY(0px); }
  50%     { transform:translateY(-8px); }
}
@keyframes tier-glow-pulse {
  0%,100% { opacity:0.6; }
  50%     { opacity:1; }
}
`;

export function SkinVariants() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d1b2a 0%,#1a0d2e 100%)",
      padding:"32px 24px",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      color:"#fff",
    }}>
      <style>{CSS}</style>

      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontSize:13, letterSpacing:"0.25em", color:"#F5A623",
          fontWeight:800, textTransform:"uppercase", marginBottom:6 }}>
          🛍️ PET SKIN SHOP
        </div>
        <h1 style={{ fontSize:28, fontWeight:900, margin:0, color:"#fff" }}>
          Koleksi Skin Tomi
        </h1>
        <div style={{ color:"#64748B", fontSize:13, marginTop:4 }}>
          Ubah penampilan Marmut Emasmu — dari standar hingga legendaris
        </div>
      </div>

      {/* Skin grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
        {Object.entries(SKINS).map(([key, s]) => (
          <div key={key} style={{
            background: s.glow
              ? `radial-gradient(ellipse at 50% 0%,${s.glow} 0%,transparent 65%),rgba(255,255,255,0.04)`
              : "rgba(255,255,255,0.04)",
            border:`1.5px solid ${s.tierColor}44`,
            borderRadius:22,
            padding:"28px 16px 20px",
            display:"flex", flexDirection:"column", alignItems:"center", gap:12,
            position:"relative",
            boxShadow: s.glow ? `0 0 28px ${s.glow}` : "none",
          }}>
            {/* tier badge */}
            <div style={{
              position:"absolute", top:-11, left:"50%",
              transform:"translateX(-50%)",
              background:s.tierColor,
              color: key==="void" ? "#000" : "#fff",
              fontSize:9, fontWeight:900, letterSpacing:"0.15em",
              padding:"3px 11px", borderRadius:20,
            }}>
              {s.badge} {s.tier}
            </div>

            {/* Pet with overlays */}
            <div style={{ position:"relative", width:130, height:130,
              animation:"idle-float 2s ease-in-out infinite" }}>
              <TomiSVG state="idle" skin={s.palette} size={130}/>
              {key==="void"   && <VoidOverlay   size={130}/>}
              {key==="cosmic" && <CosmicStars   size={130}/>}
            </div>

            {/* Info */}
            <div style={{ textAlign:"center", width:"100%" }}>
              <div style={{ fontWeight:900, fontSize:16, color:s.tierColor }}>{s.name}</div>
              <div style={{ color:"#94A3B8", fontSize:11, marginTop:4, lineHeight:1.5 }}>{s.desc}</div>
            </div>

            {/* Buy button */}
            <button style={{
              width:"100%", padding:"10px", borderRadius:12,
              background: key==="golden" ? "rgba(245,166,35,0.15)" : `${s.tierColor}22`,
              border:`1px solid ${s.tierColor}44`,
              color:s.tierColor, fontWeight:800, fontSize:14,
              cursor:"pointer", fontFamily:"inherit",
            }}>
              {s.price==="Gratis" ? "✅ Terpasang" : `Beli — ${s.price}`}
            </button>
          </div>
        ))}
      </div>

      {/* Food shop */}
      <div style={{ marginTop:32 }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:13, letterSpacing:"0.2em", color:"#F5A623",
            fontWeight:800, textTransform:"uppercase", marginBottom:4 }}>
            🌾 Toko Makanan Marmut
          </div>
          <div style={{ color:"#64748B", fontSize:12 }}>
            Semakin mahal makanannya, semakin lama Tomi kenyang
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { name:"Wortel Kecil",   emoji:"🥕", price:"30 🪙",  dur:"2 jam",  color:"#F5A623" },
            { name:"Sayuran Segar",  emoji:"🥦", price:"80 🪙",  dur:"6 jam",  color:"#34D399" },
            { name:"Buah Premium",   emoji:"🍓", price:"200 🪙", dur:"16 jam", color:"#F472B6" },
            { name:"Pesta Mewah",    emoji:"🫐", price:"500 🪙", dur:"3 hari", color:"#A78BFA" },
          ].map(f=>(
            <div key={f.name} style={{
              background:"rgba(255,255,255,0.04)",
              border:`1px solid ${f.color}33`,
              borderRadius:16, padding:"16px 12px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
            }}>
              <div style={{ fontSize:36 }}>{f.emoji}</div>
              <div style={{ fontWeight:800, fontSize:13, color:"#fff" }}>{f.name}</div>
              <div style={{ fontSize:11, color:"#64748B" }}>Kenyang {f.dur}</div>
              <div style={{ fontWeight:900, fontSize:15, color:f.color }}>{f.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
