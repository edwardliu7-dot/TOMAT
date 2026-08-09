// Profil Siswa — Landscape 844×390
export function ProfilSiswa() {
  const badges = [
    { icon:"⭐", label:"Bintang Kelas", earned:true },
    { icon:"🔥", label:"Streak 7 Hari", earned:true },
    { icon:"🏆", label:"Juara Turnamen", earned:true },
    { icon:"💎", label:"100 Game", earned:false },
    { icon:"🌙", label:"Belajar Malam", earned:false },
    { icon:"🚀", label:"Level 50", earned:false },
  ];
  const stats = [
    { label:"Koin Total", val:"24.500", icon:"🪙", color:"#fac775" },
    { label:"Game Selesai", val:"87", icon:"🎮", color:"#cecbf6" },
    { label:"Rank Kelas", val:"#5", icon:"👑", color:"#f0997b" },
    { label:"Streak", val:"7 hari", icon:"🔥", color:"#5dcaa5" },
  ];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 40% 70% at 18% 50%, rgba(226,101,63,0.1) 0%, transparent 60%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Profil</span>
        </div>
        <div style={{ display:"flex", gap:5 }}>
          <div style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:7, padding:"4px 10px", color:"#8b8f9e", fontSize:10 }}>Edit Profil</div>
          <div style={{ background:"#712b13", borderRadius:7, padding:"4px 10px", color:"#faece7", fontSize:10, fontWeight:600 }}>Logout</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", gap:0, minHeight:0, position:"relative", zIndex:2 }}>

        {/* KIRI: Identitas */}
        <div style={{ width:220, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"10px 14px", gap:8 }}>
          {/* Avatar */}
          <div style={{ position:"relative" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#e2653f,#c94f2d)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 0 3px #2a3158, 0 0 0 5px #e2653f44", fontSize:30 }}>A</div>
            <div style={{ position:"absolute", bottom:0, right:0, width:22, height:22, borderRadius:"50%", background:"#3c3489", border:"2px solid #12172b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>✏️</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#f2ede3", fontSize:14, fontWeight:800 }}>Ahmad Fauzi</div>
            <div style={{ color:"#8b8f9e", fontSize:9.5, marginTop:2 }}>VIII Al-Khawarizmi · SMP TISA</div>
          </div>
          {/* Level + XP */}
          <div style={{ width:"100%", background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:9, padding:"8px 10px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ background:"#3c3489", borderRadius:4, padding:"1px 6px", color:"#cecbf6", fontSize:9, fontWeight:700 }}>Lv 12</div>
                <span style={{ color:"#8b8f9e", fontSize:9 }}>Penjelajah Pijar</span>
              </div>
              <span style={{ color:"#5a6180", fontSize:9 }}>380/1000</span>
            </div>
            <div style={{ height:4, background:"#2a3158", borderRadius:3 }}>
              <div style={{ height:4, width:"38%", background:"linear-gradient(90deg,#e2653f,#fac775)", borderRadius:3 }} />
            </div>
          </div>
          {/* Pet */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:9, padding:"6px 10px", width:"100%" }}>
            <span style={{ fontSize:24 }}>🐇</span>
            <div>
              <div style={{ color:"#f2ede3", fontSize:10, fontWeight:600 }}>Tomi</div>
              <div style={{ color:"#5a6180", fontSize:8 }}>Pet Aktif</div>
            </div>
            <div style={{ marginLeft:"auto", background:"#085041", borderRadius:5, padding:"2px 6px", color:"#9fe1cb", fontSize:8 }}>Sehat</div>
          </div>
        </div>

        {/* TENGAH: Stats */}
        <div style={{ width:200, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", padding:"10px 10px", gap:6 }}>
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8 }}>STATISTIK</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, flex:1 }}>
            {stats.map((s,i) => (
              <div key={i} style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:9, padding:"10px 8px", display:"flex", flexDirection:"column", gap:4, justifyContent:"center", alignItems:"center" }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <div style={{ color:s.color, fontSize:13, fontWeight:800 }}>{s.val}</div>
                <div style={{ color:"#5a6180", fontSize:8, textAlign:"center" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* KANAN: Lencana */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"10px 12px", gap:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8 }}>LENCANA</div>
            <div style={{ color:"#5a6180", fontSize:8 }}>3/12 diraih</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
            {badges.map((b,i) => (
              <div key={i} style={{ background: b.earned?"linear-gradient(135deg,#1a2a40,#1c2340)":"#161c33", border: b.earned?"0.5px solid #3a4a7a":"0.5px dashed #313a5c", borderRadius:9, padding:"8px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, opacity: b.earned?1:0.45 }}>
                <span style={{ fontSize:22, filter: b.earned?"none":"grayscale(1)" }}>{b.icon}</span>
                <div style={{ color: b.earned?"#f2ede3":"#5a6180", fontSize:8.5, textAlign:"center", fontWeight: b.earned?600:400, lineHeight:1.3 }}>{b.label}</div>
                {b.earned && <div style={{ width:18, height:18, borderRadius:"50%", background:"#5dcaa5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✓</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
