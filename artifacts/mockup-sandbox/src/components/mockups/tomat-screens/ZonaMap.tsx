// Zona Matematika — Peta BAB, Landscape 844×390
export function ZonaMap() {
  const grades = [
    { label:"Kelas 7", babs:["BAB I\nBilangan", "BAB II\nHimpunan", "BAB III\nAljabar"], done:[3,1,0], total:[7,6,7], color:"#3c3489" },
    { label:"Kelas 8", babs:["BAB I\nPola Bil.", "BAB II\nPythagoras", "BAB III\nGeometri", "BAB IV\nBangun Datar", "BAB V\nStatistika"], done:[5,3,0,0,0], total:[6,6,6,8,7], color:"#3c3489" },
    { label:"Kelas 9", babs:["BAB I\nPerpangkatan", "BAB II\nPersamaan", "BAB III\nBangun Ruang", "BAB IV\nTransformasi", "BAB V\nStatistika"], done:[4,2,0,0,0], total:[6,7,6,7,5], color:"#3c3489" },
  ];
  const activeGrade = 1;
  const g = grades[activeGrade];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 50% 60% at 20% 50%, rgba(60,52,137,0.15) 0%, transparent 65%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Zona Matematika</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ color:"#5a6180", fontSize:9 }}>Progress keseluruhan</span>
          <div style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:7, padding:"3px 9px" }}>
            <span style={{ color:"#5dcaa5", fontSize:11, fontWeight:800 }}>26%</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", minHeight:0, position:"relative", zIndex:2 }}>
        {/* KIRI: Grade selector */}
        <div style={{ width:130, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", padding:"10px 8px", gap:6 }}>
          {grades.map((gr,i) => (
            <div key={i} style={{
              background: i===activeGrade?"#3c3489":"#1c2340",
              border: i===activeGrade?"none":"0.5px solid #313a5c",
              borderRadius:9, padding:"9px 10px", cursor:"pointer", flex: i===activeGrade?1.5:1,
              display:"flex", flexDirection:"column", justifyContent:"center",
            }}>
              <div style={{ color: i===activeGrade?"#eeedfe":"#8b8f9e", fontSize:11, fontWeight: i===activeGrade?700:500 }}>{gr.label}</div>
              <div style={{ marginTop:5, height:2.5, background: i===activeGrade?"rgba(255,255,255,0.15)":"#2a3158", borderRadius:2 }}>
                <div style={{ height:2.5, background: i===activeGrade?"#cecbf6":"#3c3489", borderRadius:2, width:`${Math.round(gr.done.reduce((a,b)=>a+b,0)/gr.total.reduce((a,b)=>a+b,0)*100)}%` }} />
              </div>
              <div style={{ color: i===activeGrade?"#cecbf6":"#5a6180", fontSize:8, marginTop:2 }}>
                {gr.done.reduce((a,b)=>a+b,0)}/{gr.total.reduce((a,b)=>a+b,0)} game
              </div>
            </div>
          ))}
        </div>

        {/* KANAN: BAB cards */}
        <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ color:"#8b8f9e", fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>BAB — {g.label.toUpperCase()}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {g.babs.map((bab,i) => {
              const pct = Math.round(g.done[i]/g.total[i]*100);
              const locked = i>2;
              return (
                <div key={i} style={{
                  background: locked?"#161c33": pct===100?"linear-gradient(135deg,#0d2a20,#1a3a2a)":"#1c2340",
                  border: locked?"0.5px dashed #313a5c": pct===100?"0.5px solid #2a5040":"0.5px solid #313a5c",
                  borderRadius:10, padding:"10px 10px", width:130, flexShrink:0,
                  opacity: locked?0.5:1, cursor: locked?"default":"pointer",
                  position:"relative",
                }}>
                  {pct===100 && !locked && <div style={{ position:"absolute", top:6, right:7, fontSize:12 }}>✅</div>}
                  {locked && <div style={{ position:"absolute", top:6, right:7, fontSize:11 }}>🔒</div>}
                  {!locked && pct>0 && pct<100 && (
                    <div style={{ position:"absolute", top:6, right:7, background:"#fac775", borderRadius:4, padding:"1px 5px", color:"#12172b", fontSize:7.5, fontWeight:800 }}>{pct}%</div>
                  )}
                  <div style={{ fontSize:20, marginBottom:4 }}>➕</div>
                  <div style={{ color: locked?"#5a6180":pct===100?"#5dcaa5":"#f2ede3", fontSize:9, fontWeight:700, whiteSpace:"pre-line", lineHeight:1.4 }}>{bab}</div>
                  <div style={{ color:"#5a6180", fontSize:7.5, marginTop:4 }}>{locked?"Kunci BAB":pct===100?"Selesai":`${g.done[i]}/${g.total[i]} game`}</div>
                  {!locked && (
                    <div style={{ marginTop:5, height:2.5, background:"#2a3158", borderRadius:2 }}>
                      <div style={{ height:2.5, background: pct===100?"#5dcaa5":"#cecbf6", borderRadius:2, width:`${pct}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
