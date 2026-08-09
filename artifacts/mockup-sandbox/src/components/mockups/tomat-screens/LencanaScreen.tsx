// Lencana (Achievements) — Landscape 844×390
export function LencanaScreen() {
  const categories = ["Semua", "Matematika", "IPA", "Sosial", "Event"];
  const badges = [
    { icon:"🌟", name:"Bintang Kelas", desc:"Capai rank #1 di kelas", earned:true, rarity:"Epic", date:"2 Agt" },
    { icon:"🔥", name:"Streak 7 Hari", desc:"Belajar 7 hari berturut-turut", earned:true, rarity:"Langka", date:"5 Agt" },
    { icon:"🏆", name:"Juara Turnamen", desc:"Menangkan 1 turnamen", earned:true, rarity:"Langka", date:"1 Agt" },
    { icon:"⚡", name:"Speed Runner", desc:"Selesaikan game < 30 detik", earned:true, rarity:"Umum", date:"28 Jul" },
    { icon:"💎", name:"100 Game", desc:"Selesaikan 100 game edukasi", earned:false, rarity:"Epic", prog:"87/100" },
    { icon:"🎯", name:"Tembak Tepat", desc:"Jawab 10 soal berturut benar", earned:false, rarity:"Langka", prog:"7/10" },
    { icon:"🌙", name:"Pelajar Malam", desc:"Belajar setelah jam 21.00", earned:false, rarity:"Umum", prog:"3/5" },
    { icon:"🚀", name:"Level 50", desc:"Capai level 50", earned:false, rarity:"Epic", prog:"Lv 12/50" },
    { icon:"🎪", name:"Event Master", desc:"Ikuti 5 event musiman", earned:false, rarity:"Langka", prog:"1/5" },
  ];
  const rarityColor: any = { Epic:"#f0997b", Langka:"#cecbf6", Umum:"#5dcaa5" };
  const rarityBg: any = { Epic:"#2a1208", Langka:"#1a1535", Umum:"#0d2218" };

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 60% 50% at 50% 20%, rgba(240,153,123,0.07) 0%, transparent 65%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Lencana</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[{label:"Diraih",val:"4",color:"#fac775"},{label:"Total",val:"24",color:"#5a6180"}].map((s,i) => (
            <div key={i} style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:7, padding:"4px 10px", textAlign:"center" }}>
              <div style={{ color:s.color, fontSize:13, fontWeight:800 }}>{s.val}</div>
              <div style={{ color:"#5a6180", fontSize:7.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display:"flex", gap:5, padding:"7px 14px", borderBottom:"0.5px solid #1e2644", position:"relative", zIndex:2, flexShrink:0 }}>
        {categories.map((c,i) => (
          <div key={i} style={{ background: i===0?"#3c3489":"#1c2340", border: i===0?"none":"0.5px solid #313a5c", borderRadius:20, padding:"4px 12px", color: i===0?"#eeedfe":"#8b8f9e", fontSize:9.5, fontWeight: i===0?600:400 }}>{c}</div>
        ))}
      </div>

      {/* Badge grid */}
      <div style={{ flex:1, overflowY:"auto", padding:"10px 14px", position:"relative", zIndex:2 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
          {badges.map((b,i) => (
            <div key={i} style={{ background: b.earned?rarityBg[b.rarity]:"#161c33", border: b.earned?`0.5px solid ${rarityColor[b.rarity]}44`:"0.5px dashed #313a5c", borderRadius:10, padding:"9px 10px", display:"flex", alignItems:"center", gap:9, opacity: b.earned?1:0.6 }}>
              <div style={{ width:42, height:42, borderRadius:10, background: b.earned?`${rarityColor[b.rarity]}22`:"#1c2340", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, filter: b.earned?"none":"grayscale(1)", flexShrink:0 }}>{b.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                  <div style={{ color: b.earned?rarityColor[b.rarity]:"#5a6180", fontSize:7, fontWeight:700, background: b.earned?`${rarityColor[b.rarity]}22`:"#1c2340", borderRadius:4, padding:"1px 5px" }}>{b.rarity}</div>
                  {b.earned && <span style={{ fontSize:10 }}>✅</span>}
                </div>
                <div style={{ color: b.earned?"#f2ede3":"#5a6180", fontSize:10, fontWeight:700, lineHeight:1.2 }}>{b.name}</div>
                <div style={{ color:"#5a6180", fontSize:8, marginTop:2, lineHeight:1.3 }}>{b.earned ? `Diraih ${b.date}` : (b as any).prog ?? ""}</div>
                {!b.earned && (b as any).prog && (
                  <div style={{ marginTop:4, height:2.5, background:"#2a3158", borderRadius:2 }}>
                    <div style={{ height:2.5, background:rarityColor[b.rarity], borderRadius:2, width: b.name==="100 Game"?"87%":b.name==="Tembak Tepat"?"70%":b.name==="Pelajar Malam"?"60%":"24%" }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
