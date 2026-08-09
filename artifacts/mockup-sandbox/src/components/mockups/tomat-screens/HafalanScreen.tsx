// Hafalan Interaktif — Landscape 844×390
export function HafalanScreen() {
  const cards = [
    { q:"8 × 7", a:"56", status:"lulus" },
    { q:"9 × 6", a:"54", status:"lulus" },
    { q:"7 × 8", a:"56", status:"diulang" },
    { q:"6 × 9", a:"54", status:"belum" },
  ];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 50% 60% at 70% 50%, rgba(93,202,165,0.08) 0%, transparent 65%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Hafalan Interaktif</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ background:"#0d2a20", border:"0.5px solid #2a5040", borderRadius:7, padding:"3px 9px", color:"#5dcaa5", fontSize:9, fontWeight:700 }}>🪙 +30 coin/lulus</div>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", gap:0, minHeight:0, position:"relative", zIndex:2 }}>
        {/* KIRI: Mode + daftar kartu */}
        <div style={{ width:220, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", padding:"10px 10px", gap:7 }}>
          {/* Mode selector */}
          <div style={{ display:"flex", gap:5 }}>
            <div style={{ flex:1, background:"#3c3489", borderRadius:8, padding:"7px 8px", textAlign:"center" }}>
              <div style={{ fontSize:14 }}>🃏</div>
              <div style={{ color:"#eeedfe", fontSize:8.5, fontWeight:700, marginTop:2 }}>Flash Card</div>
            </div>
            <div style={{ flex:1, background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:8, padding:"7px 8px", textAlign:"center" }}>
              <div style={{ fontSize:14 }}>📝</div>
              <div style={{ color:"#8b8f9e", fontSize:8.5, marginTop:2 }}>Kuis Mandiri</div>
            </div>
          </div>
          {/* Daftar kartu */}
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8 }}>DAFTAR SOAL</div>
          <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, overflowY:"auto" }}>
            {cards.map((c,i) => {
              const sc: any = { lulus:"#5dcaa5", diulang:"#fac775", belum:"#5a6180" };
              const sb: any = { lulus:"#0d2a20", diulang:"#2e2200", belum:"#1c2340" };
              return (
                <div key={i} style={{ background:sb[c.status], border:`0.5px solid ${c.status!=="belum"?"#313a5c":"#1e2644"}`, borderRadius:8, padding:"6px 9px", display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:sc[c.status], flexShrink:0 }} />
                  <span style={{ color:"#f2ede3", fontSize:11, fontWeight:700 }}>{c.q}</span>
                  <span style={{ color:"#5a6180", fontSize:9, marginLeft:"auto" }}>{c.status==="belum"?"—":c.a}</span>
                </div>
              );
            })}
          </div>
          <div style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:8, padding:"5px 8px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#5a6180", fontSize:8 }}>Progress</span>
            <span style={{ color:"#f2ede3", fontSize:8, fontWeight:700 }}>2/4 lulus</span>
          </div>
        </div>

        {/* KANAN: Flash card aktif */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px", gap:10 }}>
          {/* Card */}
          <div style={{ width:280, height:160, position:"relative" }}>
            {/* Shadow card */}
            <div style={{ position:"absolute", inset:0, background:"#1c2340", borderRadius:16, transform:"rotate(-2deg)", opacity:0.5 }} />
            {/* Main card */}
            <div style={{ position:"relative", background:"linear-gradient(160deg,#1e2a50,#1c2340)", border:"1px solid #3a4a7a", borderRadius:16, width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ color:"#5a6180", fontSize:9, letterSpacing:1 }}>SOAL 3 DARI 10</div>
              <div style={{ color:"#f2ede3", fontSize:40, fontWeight:900, letterSpacing:2 }}>7 × 8</div>
              <div style={{ color:"#5a6180", fontSize:10 }}>Ketuk untuk lihat jawaban</div>
              <div style={{ position:"absolute", bottom:10, right:12, fontSize:16 }}>🔄</div>
            </div>
          </div>

          {/* Numpad / action */}
          <div style={{ display:"flex", gap:6 }}>
            <div style={{ background:"#712b13", borderRadius:10, padding:"8px 20px", color:"#faece7", fontSize:11, fontWeight:700, cursor:"pointer" }}>✗ Ulangi</div>
            <div style={{ background:"#085041", borderRadius:10, padding:"8px 20px", color:"#e1f5ee", fontSize:11, fontWeight:700, cursor:"pointer" }}>✓ Lulus</div>
          </div>

          <div style={{ display:"flex", gap:4 }}>
            {[1,2,3,4,5,6,7,8,9,0].map(n => (
              <div key={n} style={{ width:30, height:30, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#f2ede3", fontSize:11, fontWeight:700 }}>{n}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
