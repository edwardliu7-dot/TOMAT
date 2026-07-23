import React, { useState } from "react";

interface SkinPalette {
  mainFur: string; lightFur: string; darkFur: string;
  belly: string; inner: string; nose: string; outline: string;
}
const GOLDEN: SkinPalette = {
  mainFur: "#F5A623", lightFur: "#F7C55E", darkFur: "#C47B0A",
  belly: "#FFF0C0", inner: "#FBCD70", nose: "#6B2D2D", outline: "#9A5A00",
};

function TomiPose({ skin = GOLDEN, size = 90 }: { skin?: SkinPalette; size?: number }) {
  const uid = `pp-${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg width={size} height={size * 1.14} viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <filter id={`f${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`hg${uid}`} cx="42%" cy="35%" r="62%">
          <stop offset="0%" stopColor={skin.lightFur}/>
          <stop offset="55%" stopColor={skin.mainFur}/>
          <stop offset="100%" stopColor={skin.darkFur}/>
        </radialGradient>
        <radialGradient id={`bl${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8e0"/>
          <stop offset="100%" stopColor={skin.belly}/>
        </radialGradient>
      </defs>
      {/* Tail wagging pose — angled up */}
      <ellipse cx="108" cy="108" rx="18" ry="11" fill={`url(#hg${uid})`} stroke={skin.outline} strokeWidth="1.2" transform="rotate(-50 108 108)" />
      <ellipse cx="114" cy="98" rx="11" ry="7" fill={skin.lightFur} transform="rotate(-65 114 98)" />
      {/* Body */}
      <ellipse cx="68" cy="118" rx="35" ry="28" fill={`url(#hg${uid})`} stroke={skin.outline} strokeWidth="1.5" />
      <ellipse cx="67" cy="120" rx="18" ry="16" fill={`url(#bl${uid})`} />
      {[[-15,6],[12,4],[-8,-8],[16,-6]].map(([dx,dy],i)=>(
        <circle key={i} cx={68+dx} cy={118+dy} r="8" fill={skin.mainFur} opacity="0.5" filter={`url(#f${uid})`}/>
      ))}
      {/* Legs */}
      <ellipse cx="50" cy="140" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2"/>
      <ellipse cx="50" cy="149" rx="9" ry="5" fill={skin.darkFur}/>
      <ellipse cx="68" cy="141" rx="9" ry="12" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.2"/>
      <ellipse cx="68" cy="150" rx="9" ry="5" fill={skin.darkFur}/>
      <ellipse cx="78" cy="140" rx="8" ry="11" fill={skin.darkFur} stroke={skin.outline} strokeWidth="1" opacity="0.7"/>
      <ellipse cx="90" cy="139" rx="8" ry="11" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1"/>
      <ellipse cx="90" cy="148" rx="8" ry="4.5" fill={skin.darkFur}/>
      {/* Neck */}
      <ellipse cx="68" cy="90" rx="24" ry="14" fill={skin.mainFur}/>
      {/* Head */}
      <ellipse cx="68" cy="65" rx="44" ry="42" fill={`url(#hg${uid})`} stroke={skin.outline} strokeWidth="1.8"/>
      {[[-38,0],[38,0],[-28,-28],[28,-28],[0,-40],[-18,34],[18,34]].map(([dx,dy],i)=>(
        <circle key={i} cx={68+dx} cy={65+dy} r={i<4?12:10} fill={skin.mainFur} opacity="0.55" filter={`url(#f${uid})`}/>
      ))}
      {/* Ears */}
      <ellipse cx="35" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5"/>
      <ellipse cx="35" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6"/>
      <ellipse cx="35" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5"/>
      <ellipse cx="101" cy="35" rx="16" ry="22" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5"/>
      <ellipse cx="101" cy="36" rx="9" ry="14" fill={skin.darkFur} opacity="0.6"/>
      <ellipse cx="101" cy="32" rx="7" ry="10" fill={skin.lightFur} opacity="0.5"/>
      {/* Forehead tuft */}
      <ellipse cx="68" cy="28" rx="12" ry="8" fill={skin.lightFur} opacity="0.8"/>
      <ellipse cx="62" cy="26" rx="8" ry="6" fill={skin.lightFur} opacity="0.6"/>
      <ellipse cx="74" cy="27" rx="7" ry="5" fill={skin.lightFur} opacity="0.6"/>
      {/* Eyes — happy/squinting with big smile */}
      <ellipse cx="53" cy="63" rx="11" ry="9" fill="white"/>
      <ellipse cx="83" cy="63" rx="11" ry="9" fill="white"/>
      <circle cx="54" cy="64" r="6" fill="#0a0000"/>
      <circle cx="84" cy="64" r="6" fill="#0a0000"/>
      <circle cx="57" cy="60" r="2.5" fill="white" opacity="0.9"/>
      <circle cx="87" cy="60" r="2.5" fill="white" opacity="0.9"/>
      {/* Happy eyebrows */}
      <path d="M 46 55 Q 53 50 60 55" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 76 55 Q 83 50 90 55" stroke={skin.outline} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Cheeks */}
      <ellipse cx="40" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.4"/>
      <ellipse cx="96" cy="74" rx="9" ry="5" fill="#FF9999" opacity="0.4"/>
      {/* Nose */}
      <ellipse cx="68" cy="79" rx="7" ry="5" fill={skin.nose}/>
      <ellipse cx="66" cy="77.5" rx="2.5" ry="1.5" fill="white" opacity="0.5"/>
      {/* Big smile with tongue */}
      <path d="M 60 84 Q 68 93 76 84" stroke={skin.outline} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="68" cy="91" rx="7" ry="5.5" fill="#FF8BA0" stroke="#e06080" strokeWidth="1"/>
      <line x1="68" y1="86" x2="68" y2="95" stroke="#e06080" strokeWidth="1"/>
      {/* Paw wave — right paw raised */}
      <ellipse cx="99" cy="108" rx="10" ry="8" fill={skin.mainFur} stroke={skin.outline} strokeWidth="1.5" transform="rotate(-30 99 108)"/>
      <ellipse cx="99" cy="102" rx="8" ry="5" fill={skin.darkFur} transform="rotate(-30 99 102)"/>
      {/* Heart float */}
      <text x="104" y="88" fontSize="18" fill="#FF6B9D" opacity="0.9">♥</text>
    </svg>
  );
}

const CSS = `
@keyframes pet-pose-float {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}
@keyframes heart-beat {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.3); opacity: 1; }
}
@keyframes hunger-pulse {
  0%, 100% { width: 70%; }
  50% { width: 68%; }
}
@keyframes star-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export function ProfileCard() {
  const [fed, setFed] = useState(false);
  const hunger = 62;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1b2a 0%, #1a0d2e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#fff",
    }}>
      <style>{CSS}</style>

      <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#F5A623", fontWeight: 800, textTransform: "uppercase", marginBottom: 20 }}>
        👤 Kartu Profil Siswa
      </div>

      {/* Profile Card */}
      <div style={{
        width: 360, background: "#0F172A",
        border: "1px solid rgba(245,166,35,0.25)",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(245,166,35,0.08)",
        position: "relative",
      }}>
        {/* Banner */}
        <div style={{
          height: 110, position: "relative",
          background: "linear-gradient(135deg, #1a1a00, #3D2A00, #1a1000)",
          overflow: "hidden",
        }}>
          {/* Gold shimmer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.12), transparent)",
          }}/>
          {/* Stars */}
          {[{x:20,y:20},{x:80,y:40},{x:200,y:15},{x:280,y:35},{x:330,y:18},{x:150,y:55}].map((p,i)=>(
            <div key={i} style={{
              position:"absolute", left:p.x, top:p.y,
              color:"#F7C55E", fontSize:i%2===0?8:6, opacity:0.4+i*0.08,
            }}>✦</div>
          ))}
        </div>

        {/* Avatar + Pet overlap zone */}
        <div style={{ position: "relative", marginTop: -60, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* Profile photo */}
            <div style={{
              width: 80, height: 80, borderRadius: 22,
              background: "linear-gradient(135deg, #10B981, #06B6D4)",
              border: "3px solid rgba(245,166,35,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 900, color: "#fff",
              flexShrink: 0, position: "relative", zIndex: 2,
              boxShadow: "0 0 20px rgba(245,166,35,0.2)",
            }}>A</div>

            {/* Tomi pet — sitting next to avatar */}
            <div style={{
              animation: "pet-pose-float 2.2s ease-in-out infinite",
              transformOrigin: "center bottom",
              position: "relative", zIndex: 3,
              marginBottom: -8,
            }}>
              <TomiPose size={90} />
            </div>

            {/* Name area */}
            <div style={{ flex: 1, paddingBottom: 8, paddingLeft: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Andi Pratama</div>
              <div style={{
                display: "inline-block", marginTop: 4, padding: "2px 8px",
                borderRadius: 99, background: "rgba(103,232,249,0.12)", color: "#67E8F9",
                fontSize: 10, fontWeight: 800,
              }}>🧑‍🎓 Kelas 8A</div>
            </div>
          </div>
        </div>

        {/* Pet status bar */}
        <div style={{ padding: "14px 20px 8px" }}>
          <div style={{
            background: "rgba(245,166,35,0.06)",
            border: "1px solid rgba(245,166,35,0.18)",
            borderRadius: 14, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🐾</span>
              <span style={{ fontWeight: 800, color: "#F7C55E", fontSize: 13 }}>Tomi</span>
              <span style={{
                marginLeft: "auto", fontSize: 9, fontWeight: 800,
                background: "rgba(245,166,35,0.15)", color: "#F5A623",
                padding: "2px 7px", borderRadius: 20,
              }}>Golden Pup</span>
            </div>
            {/* Hunger bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#94A3B8" }}>🍖 Kenyang</span>
                <span style={{ fontSize: 10, color: hunger > 50 ? "#F5A623" : "#EF4444", fontWeight: 700 }}>{hunger}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{
                  width: `${hunger}%`, height: "100%", borderRadius: 99,
                  background: hunger > 50
                    ? "linear-gradient(90deg, #F5A623, #F7C55E)"
                    : hunger > 25
                    ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                    : "#EF4444",
                  transition: "width 0.5s ease",
                }}/>
              </div>
            </div>
            {/* Feed button */}
            <button
              onClick={() => setFed(true)}
              style={{
                width: "100%", padding: "8px", borderRadius: 10,
                background: fed ? "rgba(16,185,129,0.15)" : "rgba(245,166,35,0.15)",
                border: `1px solid ${fed ? "rgba(16,185,129,0.3)" : "rgba(245,166,35,0.3)"}`,
                color: fed ? "#34D399" : "#F5A623",
                fontWeight: 800, fontSize: 12, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
            >
              {fed ? "✅ Tomi sudah makan! 🎉" : "🍖 Beri Makan Tomi"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "8px 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Level", value: "12", icon: "⭐" },
            { label: "Koin", value: "2.340", icon: "🪙" },
            { label: "Game", value: "87", icon: "🎮" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div style={{ marginTop: 20, textAlign: "center", color: "#64748B", fontSize: 12, maxWidth: 320, lineHeight: 1.6 }}>
        Tomi duduk di samping foto profil, bereaksi terhadap sentuhan,
        dan menampilkan status kenyang secara real-time.
      </div>
    </div>
  );
}
