// Nilai & Tugas — Landscape 844×390

export function NilaiTugas() {
  const tugas = [
    { nama: "Gerbang Bilangan", mapel: "Matematika", deadline: "Besok", progress: 40, total: 10, done: 4, status: "aktif" },
    { nama: "Sel & Organ Tubuh", mapel: "IPA", deadline: "3 hari lagi", progress: 0, total: 8, done: 0, status: "baru" },
    { nama: "Persamaan Linear", mapel: "Matematika", deadline: "Selesai", progress: 100, total: 12, done: 12, status: "selesai" },
    { nama: "Ekosistem & Rantai Makanan", mapel: "IPA", deadline: "Selesai", progress: 100, total: 10, done: 10, status: "selesai" },
  ];

  const nilai = [
    { nama: "Pabrik Robot", skor: 92, tanggal: "7 Agt" },
    { nama: "Katak Pelompat", skor: 78, tanggal: "5 Agt" },
    { nama: "Gembok Roda Gigi", skor: 100, tanggal: "3 Agt" },
    { nama: "Sel Ramuan", skor: 85, tanggal: "1 Agt" },
  ];

  const statusColor: any = { aktif: "#fac775", baru: "#5dcaa5", selesai: "#5a6180" };
  const statusBg: any = { aktif: "#2e2200", baru: "#0d2a20", selesai: "#1a1c2a" };

  return (
    <div style={{
      width: 844, height: 390, background: "#12172b",
      fontFamily: "system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px 8px", borderBottom: "0.5px solid #1e2644", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: "#1c2340",
            border: "0.5px solid #313a5c", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#c9cdd8", fontSize: 14,
          }}>‹</div>
          <span style={{ color: "#f2ede3", fontSize: 14, fontWeight: 700 }}>Nilai & Tugas</span>
        </div>
        {/* Stat ringkasan */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Rata-rata", val: "88", color: "#5dcaa5" },
            { label: "Selesai", val: "12", color: "#cecbf6" },
            { label: "Aktif", val: "2", color: "#fac775" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#1c2340", border: "0.5px solid #313a5c",
              borderRadius: 8, padding: "4px 10px", textAlign: "center",
            }}>
              <div style={{ color: s.color, fontSize: 13, fontWeight: 800 }}>{s.val}</div>
              <div style={{ color: "#5a6180", fontSize: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: 2 kolom */}
      <div style={{ flex: 1, display: "flex", gap: 0, minHeight: 0 }}>

        {/* KIRI: Daftar tugas */}
        <div style={{
          width: 370, borderRight: "0.5px solid #1e2644",
          display: "flex", flexDirection: "column", padding: "8px 10px 8px 14px", gap: 6,
        }}>
          <div style={{ color: "#8b8f9e", fontSize: 9, fontWeight: 700, letterSpacing: 0.8 }}>TUGAS</div>
          {tugas.map((t, i) => (
            <div key={i} style={{
              background: statusBg[t.status], border: `0.5px solid ${t.status === "selesai" ? "#1e2644" : "#313a5c"}`,
              borderRadius: 9, padding: "7px 9px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {/* Left dot */}
              <div style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: statusColor[t.status],
                boxShadow: t.status !== "selesai" ? `0 0 5px ${statusColor[t.status]}` : "none",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: t.status === "selesai" ? "#5a6180" : "#f2ede3",
                  fontSize: 10.5, fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{t.nama}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <span style={{ color: "#5a6180", fontSize: 8 }}>{t.mapel}</span>
                  <span style={{ color: "#313a5c" }}>·</span>
                  <span style={{ color: statusColor[t.status], fontSize: 8 }}>{t.deadline}</span>
                </div>
                {t.status !== "selesai" && (
                  <div style={{ marginTop: 4, height: 2.5, background: "#2a3158", borderRadius: 2 }}>
                    <div style={{
                      height: 2.5, width: `${t.progress}%`,
                      background: t.status === "aktif" ? "#fac775" : "#5dcaa5", borderRadius: 2,
                    }} />
                  </div>
                )}
              </div>
              <div style={{ color: "#5a6180", fontSize: 9, flexShrink: 0 }}>
                {t.done}/{t.total}
              </div>
              {t.status !== "selesai" && (
                <div style={{
                  background: "linear-gradient(135deg,#e2653f,#c94f2d)",
                  borderRadius: 6, padding: "4px 8px",
                  color: "#fff", fontSize: 8.5, fontWeight: 700, flexShrink: 0,
                }}>Kerjakan</div>
              )}
              {t.status === "selesai" && (
                <span style={{ fontSize: 14 }}>✅</span>
              )}
            </div>
          ))}
        </div>

        {/* KANAN: Riwayat nilai */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: "8px 14px 8px 10px", gap: 6,
        }}>
          <div style={{ color: "#8b8f9e", fontSize: 9, fontWeight: 700, letterSpacing: 0.8 }}>RIWAYAT NILAI</div>
          {nilai.map((n, i) => (
            <div key={i} style={{
              background: "#1c2340", border: "0.5px solid #313a5c",
              borderRadius: 9, padding: "8px 10px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {/* Skor circle */}
              <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: n.skor >= 90 ? "linear-gradient(135deg,#5dcaa5,#3aaa85)"
                  : n.skor >= 75 ? "linear-gradient(135deg,#3c3489,#2a2470)"
                  : "linear-gradient(135deg,#993c1d,#712b13)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: n.skor >= 90 ? "0 0 10px rgba(93,202,165,0.3)" : "none",
              }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>{n.skor}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f2ede3", fontSize: 10.5, fontWeight: 600 }}>{n.nama}</div>
                <div style={{ color: "#5a6180", fontSize: 8, marginTop: 2 }}>{n.tanggal}</div>
              </div>
              {/* Bar visual */}
              <div style={{ width: 70 }}>
                <div style={{ height: 4, background: "#2a3158", borderRadius: 3 }}>
                  <div style={{
                    height: 4, width: `${n.skor}%`,
                    background: n.skor >= 90 ? "#5dcaa5" : n.skor >= 75 ? "#cecbf6" : "#f0997b",
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
