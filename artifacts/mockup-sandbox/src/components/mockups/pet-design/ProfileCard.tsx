import React, { useState } from "react";
import { TomiSVG, PET_CSS, GOLDEN } from "./CharacterSheet";

const CSS = `
${PET_CSS}
@keyframes gp-pose-float {
  0%,100% { transform:translateY(0) rotate(-1.5deg); }
  50%     { transform:translateY(-9px) rotate(1.5deg); }
}
@keyframes heart-pop {
  0%   { transform:scale(0.6); opacity:0; }
  50%  { transform:scale(1.3); opacity:1; }
  100% { transform:scale(1);   opacity:0.8; }
}
`;

export function ProfileCard() {
  const [fed, setFed] = useState(false);
  const hunger = 62;

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d1b2a 0%,#1a0d2e 100%)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"24px 16px",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
      color:"#fff",
    }}>
      <style>{CSS}</style>

      <div style={{ fontSize:13, letterSpacing:"0.2em", color:"#F5A623",
        fontWeight:800, textTransform:"uppercase", marginBottom:20 }}>
        👤 Kartu Profil Siswa
      </div>

      {/* Card */}
      <div style={{
        width:360,
        background:"#0F172A",
        border:"1px solid rgba(245,166,35,0.25)",
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 20px 60px rgba(0,0,0,0.6),0 0 40px rgba(245,166,35,0.08)",
        position:"relative",
      }}>
        {/* Banner */}
        <div style={{
          height:110, position:"relative",
          background:"linear-gradient(135deg,#1a1a00,#3D2A00,#1a1000)",
          overflow:"hidden",
        }}>
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(90deg,transparent,rgba(245,166,35,0.12),transparent)",
          }}/>
          {/* decorative stars */}
          {[{x:20,y:20},{x:80,y:40},{x:200,y:15},{x:280,y:35},{x:330,y:18},{x:150,y:55}].map((p,i)=>(
            <div key={i} style={{
              position:"absolute", left:p.x, top:p.y,
              color:"#F7C55E", fontSize:i%2===0?8:6, opacity:0.4+i*0.07,
            }}>✦</div>
          ))}
        </div>

        {/* Avatar + Tomi overlap zone */}
        <div style={{ position:"relative", marginTop:-60, padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6 }}>
            {/* Avatar */}
            <div style={{
              width:80, height:80, borderRadius:22, flexShrink:0,
              background:"linear-gradient(135deg,#10B981,#06B6D4)",
              border:"3px solid rgba(245,166,35,0.5)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:32, fontWeight:900, color:"#fff",
              position:"relative", zIndex:2,
              boxShadow:"0 0 20px rgba(245,166,35,0.2)",
            }}>A</div>

            {/* Tomi sitting beside avatar — happy pose */}
            <div style={{
              animation:"gp-pose-float 2.4s ease-in-out infinite",
              transformOrigin:"center bottom",
              position:"relative", zIndex:3, marginBottom:-6,
            }}>
              {/* floating heart above Tomi */}
              <div style={{
                position:"absolute", right:-2, top:-18,
                fontSize:16, color:"#FF6B9D",
                animation:"heart-pop 1.8s ease-in-out infinite",
              }}>♥</div>
              <TomiSVG state="happy" skin={GOLDEN} size={90}/>
            </div>

            {/* Name */}
            <div style={{ flex:1, paddingBottom:8, paddingLeft:4 }}>
              <div style={{ fontSize:17, fontWeight:900, color:"#fff" }}>Andi Pratama</div>
              <div style={{
                display:"inline-block", marginTop:4, padding:"2px 8px",
                borderRadius:99,
                background:"rgba(103,232,249,0.12)", color:"#67E8F9",
                fontSize:10, fontWeight:800,
              }}>🧑‍🎓 Kelas 8A</div>
            </div>
          </div>
        </div>

        {/* Pet status */}
        <div style={{ padding:"14px 20px 8px" }}>
          <div style={{
            background:"rgba(245,166,35,0.06)",
            border:"1px solid rgba(245,166,35,0.18)",
            borderRadius:14, padding:"12px 14px",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:16 }}>🐹</span>
              <span style={{ fontWeight:800, color:"#F7C55E", fontSize:13 }}>Tomi</span>
              <span style={{
                marginLeft:"auto", fontSize:9, fontWeight:800,
                background:"rgba(245,166,35,0.15)", color:"#F5A623",
                padding:"2px 7px", borderRadius:20,
              }}>Golden Marmut</span>
            </div>

            {/* Hunger bar */}
            <div style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:10, color:"#94A3B8" }}>🌾 Kenyang</span>
                <span style={{ fontSize:10,
                  color:hunger>50?"#F5A623":"#EF4444", fontWeight:700 }}>{hunger}%</span>
              </div>
              <div style={{ background:"rgba(255,255,255,0.08)",
                borderRadius:99, height:6, overflow:"hidden" }}>
                <div style={{
                  width:`${hunger}%`, height:"100%", borderRadius:99,
                  background: hunger>50
                    ? "linear-gradient(90deg,#F5A623,#F7C55E)"
                    : hunger>25
                    ? "linear-gradient(90deg,#F59E0B,#EF4444)"
                    : "#EF4444",
                  transition:"width 0.5s ease",
                }}/>
              </div>
            </div>

            {/* Feed button */}
            <button onClick={()=>setFed(true)} style={{
              width:"100%", padding:"8px", borderRadius:10,
              background: fed?"rgba(16,185,129,0.15)":"rgba(245,166,35,0.15)",
              border:`1px solid ${fed?"rgba(16,185,129,0.3)":"rgba(245,166,35,0.3)"}`,
              color: fed?"#34D399":"#F5A623",
              fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit",
              transition:"all 0.2s",
            }}>
              {fed?"✅ Tomi sudah makan! 🎉":"🥕 Beri Makan Tomi"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding:"8px 20px 20px",
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { label:"Level", value:"12", icon:"⭐" },
            { label:"Koin",  value:"2.340", icon:"🪙" },
            { label:"Game",  value:"87",    icon:"🎮" },
          ].map(s=>(
            <div key={s.label} style={{
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:12, padding:"10px 8px", textAlign:"center",
            }}>
              <div style={{ fontSize:16 }}>{s.icon}</div>
              <div style={{ fontWeight:900, fontSize:16, color:"#fff", marginTop:2 }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:20, textAlign:"center", color:"#64748B",
        fontSize:12, maxWidth:320, lineHeight:1.6 }}>
        Tomi (marmut emas) duduk di samping foto profil, bereaksi terhadap
        sentuhan, dan menampilkan status kenyang secara real-time.
      </div>
    </div>
  );
}
