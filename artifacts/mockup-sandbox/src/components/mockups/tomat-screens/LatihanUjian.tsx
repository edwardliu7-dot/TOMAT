// Latihan Ujian — Landscape 844×390
export function LatihanUjian() {
  const topics = [
    { label:"Matematika Kelas 7", soal:40, icon:"➕", color:"#3c3489", done:true },
    { label:"Matematika Kelas 8", soal:45, icon:"📐", color:"#3c3489", done:false },
    { label:"IPA Kelas 7", soal:35, icon:"🧪", color:"#085041", done:true },
    { label:"IPA Kelas 8", soal:38, icon:"🔬", color:"#085041", done:false },
  ];

  const options = ["A. 24", "B. 36", "C. 48", "D. 56"];
  const selected = 1;

  return (
    <div style={{ width:844, height:390, background:"#12172b", fontFamily:"system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 45% 60% at 75% 50%, rgba(60,52,137,0.12) 0%, transparent 65%)" }} />

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 8px", borderBottom:"0.5px solid #1e2644", flexShrink:0, position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"#1c2340", border:"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", color:"#c9cdd8", fontSize:14 }}>‹</div>
          <span style={{ color:"#f2ede3", fontSize:14, fontWeight:700 }}>Latihan Ujian</span>
        </div>
        {/* Timer */}
        <div style={{ background:"#2e2200", border:"0.5px solid #5a4000", borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:12 }}>⏱</span>
          <span style={{ color:"#fac775", fontSize:12, fontWeight:800, fontVariantNumeric:"tabular-nums" }}>12:34</span>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", gap:0, minHeight:0, position:"relative", zIndex:2 }}>
        {/* KIRI: Pilih topik */}
        <div style={{ width:220, borderRight:"0.5px solid #1e2644", display:"flex", flexDirection:"column", padding:"10px 10px", gap:6 }}>
          <div style={{ color:"#5a6180", fontSize:8, fontWeight:700, letterSpacing:0.8 }}>PILIH PAKET</div>
          {topics.map((t,i) => (
            <div key={i} style={{ background: i===1?"#1c2340":"transparent", border: i===1?"0.5px solid #313a5c":"0.5px solid transparent", borderRadius:9, padding:"8px 9px", cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${t.color}44`, border:`0.5px solid ${t.color}88`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"#f2ede3", fontSize:9.5, fontWeight:600, lineHeight:1.3 }}>{t.label}</div>
                <div style={{ color:"#5a6180", fontSize:8, marginTop:1 }}>{t.soal} soal</div>
              </div>
              {t.done && <span style={{ fontSize:12 }}>✅</span>}
            </div>
          ))}
          <div style={{ marginTop:"auto", background:"linear-gradient(135deg,#e2653f,#c94f2d)", borderRadius:9, padding:"9px", textAlign:"center", color:"#fff", fontSize:11, fontWeight:700 }}>▶ Mulai Latihan</div>
        </div>

        {/* KANAN: Soal aktif */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"10px 14px", gap:8 }}>
          {/* Progres soal */}
          <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
            {Array.from({length:10}).map((_,i) => (
              <div key={i} style={{ width:20, height:20, borderRadius:5, background: i<3?"#5dcaa5": i===3?"#3c3489":"#1c2340", border: i===3?"0.5px solid #cecbf6":"0.5px solid #313a5c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color: i<3?"#fff": i===3?"#eeedfe":"#5a6180", fontWeight:700 }}>{i+1}</div>
            ))}
            <span style={{ color:"#5a6180", fontSize:8, marginLeft:4, alignSelf:"center" }}>+ 30 lagi</span>
          </div>

          {/* Soal */}
          <div style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:11, padding:"12px 14px" }}>
            <div style={{ color:"#5a6180", fontSize:8, marginBottom:5 }}>No. 4 · Matematika Kelas 8 — Pythagoras</div>
            <div style={{ color:"#f2ede3", fontSize:12, fontWeight:600, lineHeight:1.6 }}>
              Sebuah segitiga siku-siku memiliki sisi 3 cm dan 4 cm. Berapakah panjang sisi miringnya?
            </div>
          </div>

          {/* Pilihan */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, flex:1 }}>
            {options.map((opt,i) => (
              <div key={i} style={{ background: i===selected?"linear-gradient(135deg,#3c3489,#2a2470)":"#1c2340", border: i===selected?"0.5px solid #cecbf6":"0.5px solid #313a5c", borderRadius:9, padding:"9px 12px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <div style={{ width:22, height:22, borderRadius:6, background: i===selected?"#cecbf6":"#2a3158", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color: i===selected?"#12172b":"#5a6180", fontSize:9.5, fontWeight:800 }}>{["A","B","C","D"][i]}</span>
                </div>
                <span style={{ color: i===selected?"#eeedfe":"#c9cdd8", fontSize:10.5, fontWeight: i===selected?600:400 }}>{opt.split(". ")[1]}</span>
              </div>
            ))}
          </div>

          {/* Nav */}
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
            <div style={{ background:"#1c2340", border:"0.5px solid #313a5c", borderRadius:8, padding:"6px 14px", color:"#8b8f9e", fontSize:10 }}>← Kembali</div>
            <div style={{ background:"linear-gradient(135deg,#e2653f,#c94f2d)", borderRadius:8, padding:"6px 14px", color:"#fff", fontSize:10, fontWeight:700 }}>Selanjutnya →</div>
          </div>
        </div>
      </div>
    </div>
  );
}
