// Toko TOMAT — Shop screen, LANDSCAPE mobile (844×390)

export function TokoScreen() {
  const tabs = ["Unggulan", "Skin pet", "Booster exp", "Avatar & frame", "Emote"];
  const activeTab = 0;

  const items = [
    { icon: "🐇", bg: "#085041", label: "Skin Tomi Hutan", price: "2.500", badge: null, discountFrom: null },
    { icon: "⚡", bg: "#3c3489", label: "Booster 2× EXP", price: "1.200", badge: null, discountFrom: null },
    { icon: "😊", bg: "#993556", label: "Emote Semangat", price: "800", badge: "baru", discountFrom: null },
    { icon: "👑", bg: "#996e17", label: "Frame Juara Kelas", price: "3.000", badge: null, discountFrom: null },
    { icon: "🎩", bg: "#993c1d", label: "Topi Merah Kelinsay", price: "1.400", badge: null, discountFrom: "2.000" },
    { icon: "🔒", bg: null, label: "Buka di Lv 5", price: null, badge: null, discountFrom: null, locked: true },
  ];

  return (
    <div style={{
      width: 844,
      height: 390,
      background: "#12172b",
      fontFamily: "system-ui, sans-serif",
      display: "flex",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 70% at 30% 0%, rgba(60,52,137,0.14) 0%, transparent 65%)",
      }} />

      {/* ── PANEL KIRI: Header + Tabs + Banner ── */}
      <div style={{
        width: 220, flexShrink: 0, display: "flex", flexDirection: "column",
        borderRight: "0.5px solid #1e2644", position: "relative", zIndex: 2,
        padding: "10px 10px 10px 12px",
        gap: 8,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "#1c2340", border: "0.5px solid #313a5c",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#c9cdd8", fontSize: 14,
            }}>‹</div>
            <span style={{ color: "#f2ede3", fontSize: 14, fontWeight: 700 }}>Toko</span>
          </div>
          <div style={{
            background: "#1c2340", border: "0.5px solid #313a5c",
            borderRadius: 7, padding: "4px 9px",
            display: "flex", alignItems: "center", gap: 4,
            color: "#fac775", fontSize: 10, fontWeight: 700,
          }}>
            <span style={{ fontSize: 11 }}>🪙</span> 24.500
          </div>
        </div>

        {/* Tabs vertikal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map((tab, i) => (
            <div key={i} style={{
              background: i === activeTab ? "#3c3489" : "#1c2340",
              border: i === activeTab ? "none" : "0.5px solid #313a5c",
              borderRadius: 8, padding: "6px 11px",
              color: i === activeTab ? "#eeedfe" : "#8b8f9e",
              fontSize: 10.5, fontWeight: i === activeTab ? 600 : 400,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {i === 0 ? "⭐" : i === 1 ? "🐾" : i === 2 ? "⚡" : i === 3 ? "🖼" : "😊"}
              {tab}
            </div>
          ))}
        </div>

        {/* Daily deal banner */}
        <div style={{
          background: "linear-gradient(135deg,#8c3518,#712b13)",
          borderRadius: 9, padding: "9px 10px", marginTop: "auto",
          position: "relative", overflow: "hidden",
          boxShadow: "0 3px 12px rgba(113,43,19,0.4)",
        }}>
          <div style={{
            position: "absolute", right: -8, top: -8,
            width: 50, height: 50, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{ color: "#f5c4b3", fontSize: 7.5, fontWeight: 700, letterSpacing: 0.8, marginBottom: 2 }}>
            ⏱ PENAWARAN HARI INI
          </div>
          <div style={{ color: "#faece7", fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
            Topi Merah Kelinsay
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5,
          }}>
            <div>
              <span style={{ color: "#a06050", fontSize: 9, textDecoration: "line-through" }}>🪙 2.000</span>
              <span style={{ color: "#fac775", fontSize: 10, fontWeight: 700, marginLeft: 4 }}>🪙 1.400</span>
            </div>
            <div style={{
              background: "linear-gradient(135deg,#f0997b,#e2653f)",
              color: "#fff", fontSize: 11, fontWeight: 900,
              padding: "4px 8px", borderRadius: 7,
            }}>-30%</div>
          </div>
        </div>
      </div>

      {/* ── PANEL KANAN: Grid item ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "10px 12px", position: "relative", zIndex: 2, gap: 8,
      }}>
        {/* Section label */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ color: "#8b8f9e", fontSize: 10.5, fontWeight: 600 }}>Item Unggulan</span>
          <span style={{ color: "#5a6180", fontSize: 9 }}>Lihat semua →</span>
        </div>

        {/* Grid 3×2 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 8, flex: 1, minHeight: 0,
        }}>
          {items.map((item: any, i: number) => (
            <div key={i} style={{
              background: item.locked ? "#161c33" : "#1c2340",
              border: item.locked ? "0.5px dashed #313a5c" : "0.5px solid #313a5c",
              borderRadius: 10, padding: "8px 7px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 4,
              position: "relative", cursor: item.locked ? "default" : "pointer",
              opacity: item.locked ? 0.55 : 1,
            }}>
              {item.badge && (
                <div style={{
                  position: "absolute", top: 5, right: 5,
                  background: "#3c3489", color: "#eeedfe",
                  fontSize: 7.5, fontWeight: 700, padding: "1px 5px", borderRadius: 5,
                }}>{item.badge}</div>
              )}
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: item.bg ?? "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: item.locked ? 18 : 23,
                boxShadow: item.bg ? "0 3px 10px rgba(0,0,0,0.3)" : "none",
              }}>{item.icon}</div>

              <div style={{
                color: item.locked ? "#5a6180" : "#f2ede3",
                fontSize: 9, fontWeight: 600,
                textAlign: "center", lineHeight: 1.3, maxWidth: "100%",
              }}>{item.label}</div>

              {item.price && (
                <div style={{ textAlign: "center" }}>
                  {item.discountFrom && (
                    <div style={{ color: "#5a6180", fontSize: 8, textDecoration: "line-through" }}>
                      🪙 {item.discountFrom}
                    </div>
                  )}
                  <div style={{
                    color: "#fac775", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 2, justifyContent: "center",
                  }}>
                    🪙 {item.price}
                  </div>
                </div>
              )}

              {item.price && (
                <div style={{
                  width: "90%", background: "linear-gradient(135deg,#e2653f,#c94f2d)",
                  borderRadius: 6, padding: "4px 0", textAlign: "center",
                  color: "#fff", fontSize: 8.5, fontWeight: 700,
                }}>Beli</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
