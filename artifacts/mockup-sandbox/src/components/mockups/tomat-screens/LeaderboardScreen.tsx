// Papan Peringkat — Landscape 844×390
export function LeaderboardScreen() {
  const tabs = ["Kelasku", "Kelas 8", "Kelas 9"];
  const top3 = [
    { rank: 2, nama: "Siti R.", koin: 18200, avatar: "S", color: "#85b7eb" },
    { rank: 1, nama: "Ahmad F.", koin: 24500, avatar: "A", color: "#e2653f" },
    { rank: 3, nama: "Budi P.", koin: 15900, avatar: "B", color: "#5dcaa5" },
  ];
  const rest = [
    { rank: 4, nama: "Dewi A.", koin: 14200, me: false },
    { rank: 5, nama: "Rafi M.", koin: 13800, me: true },
    { rank: 6, nama: "Nisa H.", koin: 12500, me: false },
    { rank: 7, nama: "Yusuf T.", koin: 11900, me: false },
    { rank: 8, nama: "Laila K.", koin: 10400, me: false },
  ];
  const rankColors = ["#fac775","#c9cdd8","#f0997b"];
  const heightMap = [100,130,80];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      {/* Glow */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 50% 60% at 50% 0%, rgba(206,203,246,0.1) 0%, transparent 65%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Papan Peringkat</span>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          {tabs.map((t,i) => (
            <div key={i} style={{ background: i===0?"#3c3489":"#1c2340", border: i===0?"none":"0.5px solid #313a5c", borderRadius:7, padding:"4px 10px", color: i===0?"#eeedfe":"#8b8f9e", fontSize:10, fontWeight: i===0?600:400 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", gap:0, minHeight:0, position:"relative", zIndex:2 }}>
        {/* KIRI: Podium top 3 */}
        <div style={{ width:340, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", padding:"10px 12px 12px", gap:8 }}>
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8, alignSelf:"flex-start" }}>TOP 3</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, width:"100%" }}>
            {top3.map((p,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${p.color}44,${p.color}22)`, border:`2px solid ${rankColors[i]}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ color:"#f2ede3", fontSize:16, fontWeight:700 }}>{p.avatar}</span>
                  </div>
                  {p.rank===1 && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", fontSize:16 }}>👑</div>}
                </div>
                <div style={{ color:"#f2ede3", fontSize:9, fontWeight:600, textAlign:"center" }}>{p.nama}</div>
                <div style={{ color:"#fac775", fontSize:8 }}>🪙 {(p.koin/1000).toFixed(1)}k</div>
                <div style={{ width:"100%", background:rankColors[i], borderRadius:"6px 6px 0 0", height:heightMap[i], display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#12172b", fontSize:18, fontWeight:900 }}>#{p.rank}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KANAN: Rank 4–8 */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"8px 12px", gap:5 }}>
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8 }}>PERINGKAT BERIKUTNYA</div>
          {rest.map((r,i) => (
            <div key={i} style={{ background: r.me?"rgba(60,52,137,0.25)":"#1c2340", border: r.me?"0.5px solid #3c3489":"0.5px solid #313a5c", borderRadius:9, padding:"7px 10px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ color: r.rank<=5?"#fac775":"#5a6180", fontSize:13, fontWeight:800, width:24, textAlign:"center" }}>{r.rank}</div>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"#2a3158", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#f2ede3", fontSize:12, fontWeight:700 }}>{r.nama[0]}</span>
              </div>
              <div style={{ flex:1 }}>
                <span style={{ color: r.me?"#cecbf6":"#f2ede3", fontSize:10.5, fontWeight: r.me?700:500 }}>{r.nama}</span>
                {r.me && <span style={{ marginLeft:6, background:"#3c3489", color:"#cecbf6", fontSize:7, fontWeight:700, padding:"1px 5px", borderRadius:4 }}>KAMU</span>}
              </div>
              <div style={{ color:"#fac775", fontSize:10, display:"flex", alignItems:"center", gap:3 }}>🪙 {r.koin.toLocaleString("id")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
