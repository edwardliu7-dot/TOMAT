// Arena Tanding — mode selection, Landscape 844×390
export function ArenaScreen() {
  const modes = [
    { id:"duel", icon:"⚔️", title:"Duel 1v1", desc:"Tantang siswa lain head-to-head", players:"12 online", color:"#712b13", glow:"rgba(113,43,19,0.5)", badge:null },
    { id:"turnamen", icon:"🏆", title:"Turnamen", desc:"Kelompok vs kelompok, rebut juara kelas", players:"1 aktif", color:"#3c3489", glow:"rgba(60,52,137,0.5)", badge:"BARU" },
    { id:"boss", icon:"💀", title:"Boss Raid", desc:"Serang boss bersama satu kelas", players:"Cooldown 2j", color:"#085041", glow:"rgba(8,80,65,0.5)", badge:null },
    { id:"moba", icon:"🎮", title:"MOBA", desc:"2D arena 1v1 dengan pet-mu", players:"Beta", color:"#993556", glow:"rgba(153,53,86,0.5)", badge:"BETA" },
  ];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 70% 50% at 50% 60%, rgba(113,43,19,0.12) 0%, transparent 70%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Arena Tanding</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#5dcaa5", boxShadow:"0 0 6px #5dcaa5" }} />
          <span style={{ color:"#5dcaa5", fontSize:10 }}>24 siswa online</span>
        </div>
      </div>

      {/* Mode grid 2×2 */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:8, padding:"10px 14px 12px", position:"relative", zIndex:2 }}>
        {modes.map((m,i) => (
          <div key={i} style={{
            background:`linear-gradient(160deg,${m.color}dd,${m.color}88)`,
            borderRadius:12, padding:"12px 14px",
            display:"flex", alignItems:"center", gap:12,
            boxShadow:`0 4px 16px ${m.glow}`,
            cursor:"pointer", position:"relative", overflow:"hidden",
          }}>
            {/* Shimmer */}
            <div style={{ position:"absolute", right:-15, top:-15, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            {m.badge && (
              <div style={{ position:"absolute", top:7, right:9, background: m.badge==="BETA"?"#993556":"#fac775", color: m.badge==="BETA"?"#fff":"#12172b", fontSize:7.5, fontWeight:800, padding:"1.5px 6px", borderRadius:5 }}>{m.badge}</div>
            )}
            <div style={{ fontSize:32, flexShrink:0 }}>{m.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color:"#f2ede3", fontSize:13, fontWeight:800, lineHeight:1.2 }}>{m.title}</div>
              <div style={{ color:"rgba(242,237,227,0.7)", fontSize:9.5, marginTop:3, lineHeight:1.4 }}>{m.desc}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:7 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
                <span style={{ color:"rgba(255,255,255,0.6)", fontSize:8.5 }}>{m.players}</span>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"8px 14px", flexShrink:0, color:"#fff", fontSize:10, fontWeight:700 }}>
              Masuk ▶
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
