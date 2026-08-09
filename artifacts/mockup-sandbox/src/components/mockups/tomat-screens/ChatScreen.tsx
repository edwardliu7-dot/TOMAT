// Chat Kelas — Landscape 844×390
export function ChatScreen() {
  const convos = [
    { nama:"Bu Rahma", role:"Guru", preview:"Tugas Gerbang Bilangan sudah...", time:"10:24", unread:2, online:true },
    { nama:"Kelas VIII-A", role:"Forum Kelas", preview:"Ahmad: haha bener banget itu 😂", time:"09:55", unread:0, online:true },
    { nama:"Pak Hendra", role:"Guru IPA", preview:"Nilai kalian sudah saya input", time:"Kemarin", unread:0, online:false },
  ];
  const messages = [
    { from:"Bu Rahma", text:"Selamat pagi! Tugas Gerbang Bilangan sudah bisa dikerjakan ya 📖", time:"09:00", mine:false },
    { from:"me", text:"Siap Bu, sudah saya mulai tadi malam!", time:"09:15", mine:true },
    { from:"Bu Rahma", text:"Bagus! Jangan lupa deadline-nya besok jam 23:59 ya.", time:"09:16", mine:false },
    { from:"me", text:"Siap Bu 🙏", time:"09:18", mine:true },
    { from:"Bu Rahma", text:"Oh ya, ada yang mau ditanyakan soal materi BAB II?", time:"10:24", mine:false },
  ];

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Komunikasi</span>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", minHeight:0 }}>
        {/* KIRI: Daftar konversasi */}
        <div style={{ width:240, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", padding:"8px 8px", gap:4 }}>
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8, padding:"0 4px 4px" }}>PERCAKAPAN</div>
          {convos.map((c,i) => (
            <div key={i} style={{ background: i===0?"#1c2340":"transparent", border: i===0?"0.5px solid #313a5c":"0.5px solid transparent", borderRadius:9, padding:"8px 9px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background: i===0?"linear-gradient(135deg,#5dcaa5,#3aaa85)": i===1?"linear-gradient(135deg,#3c3489,#2a2470)":"linear-gradient(135deg,#085041,#063328)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontSize:14, fontWeight:700 }}>{c.nama[0]}</span>
                </div>
                {c.online && <div style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:"#5dcaa5", border:"1.5px solid #12172b" }} />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"#f2ede3", fontSize:10.5, fontWeight:600 }}>{c.nama}</span>
                  <span style={{ color:"#5a6180", fontSize:8 }}>{c.time}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2 }}>
                  <span style={{ color:"#8b8f9e", fontSize:8.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>{c.preview}</span>
                  {c.unread>0 && <div style={{ background:"#e2653f", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:8, fontWeight:700 }}>{c.unread}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KANAN: Chat bubbles */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          {/* Chat header */}
          <div style={{ padding:"8px 12px", borderBottom:"0.5px solid #1e2644", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#5dcaa5,#3aaa85)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>B</div>
            <div>
              <div style={{ color:"#f2ede3", fontSize:11, fontWeight:700 }}>Bu Rahma</div>
              <div style={{ color:"#5dcaa5", fontSize:8 }}>Online</div>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"8px 12px", display:"flex", flexDirection:"column", gap:6 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.mine?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"65%", background: m.mine?"linear-gradient(135deg,#3c3489,#2a2470)":"#1c2340", border: m.mine?"none":"0.5px solid #313a5c", borderRadius: m.mine?"12px 12px 3px 12px":"12px 12px 12px 3px", padding:"7px 10px" }}>
                  <div style={{ color:"#f2ede3", fontSize:9.5, lineHeight:1.5 }}>{m.text}</div>
                  <div style={{ color: m.mine?"#8b8acd":"#5a6180", fontSize:7.5, marginTop:3, textAlign:"right" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Input */}
          <div style={{ padding:"7px 10px", borderTop:"0.5px solid #1e2644", display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ flex:1, background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:20, padding:"7px 12px", color:"#5a6180", fontSize:9.5 }}>Ketik pesan...</div>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#e2653f,#c94f2d)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>➤</div>
          </div>
        </div>
      </div>
    </div>
  );
}
