// Beranda TOMAT — Layout 5 Zona, LANDSCAPE mobile (844×390)
// Zona Atas: Profil, Koin, Utilitas
// Zona Kiri: Misi aktif, event, quick links
// Zona Tengah: Pet Tomi
// Zona Kanan: 3 pintu utama (Matematika, IPA, Arena)
// Zona Bawah: Chat preview + nav bar

export function ZonaDashboard() {
  return (
    <div style={{
      width: 844,
      height: 390,
      background: "#12172b",
      fontFamily: "system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 50% at 50% 55%, rgba(60,52,137,0.18) 0%, transparent 70%)",
      }} />

      {/* ── ZONA ATAS ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "8px 12px 6px",
        borderBottom: "0.5px solid #1e2644",
        position: "relative", zIndex: 2, flexShrink: 0,
      }}>
        {/* Kiri: Avatar + nama */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#e2653f,#c94f2d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 0 1.5px #2a3158",
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>A</span>
          </div>
          <div>
            <div style={{ color: "#f2ede3", fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>Ahmad</div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
              <div style={{
                background: "#3c3489", borderRadius: 3,
                padding: "1px 4px", color: "#cecbf6", fontSize: 8, fontWeight: 700,
              }}>Lv 12</div>
              <div style={{ color: "#5a6180", fontSize: 8 }}>Penjelajah Pijar</div>
            </div>
          </div>
        </div>

        {/* Tengah: XP bar */}
        <div style={{ flex: 1, maxWidth: 180, margin: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: "#5a6180", fontSize: 8 }}>XP</span>
            <span style={{ color: "#5dcaa5", fontSize: 8 }}>380 / 1000</span>
          </div>
          <div style={{ height: 3, background: "#1c2340", borderRadius: 2 }}>
            <div style={{ height: 3, width: "38%", background: "linear-gradient(90deg,#5dcaa5,#3aaa85)", borderRadius: 2 }} />
          </div>
        </div>

        {/* Kanan: Koin + utilitas */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{
            background: "#1c2340", border: "0.5px solid #313a5c",
            borderRadius: 7, padding: "4px 8px",
            color: "#fac775", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: 11 }}>🪙</span> 24.500
          </div>
          {["🔔", "⚙️"].map((ic, i) => (
            <div key={i} style={{
              background: "#1c2340", border: "0.5px solid #313a5c",
              borderRadius: 7, width: 26, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11,
            }}>{ic}</div>
          ))}
        </div>
      </div>

      {/* ── CONTENT UTAMA — 3 kolom ── */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "130px 1fr 152px",
        gap: 8, padding: "8px 10px",
        position: "relative", zIndex: 2,
        minHeight: 0,
      }}>

        {/* ZONA KIRI — Misi & event */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Tugas aktif */}
          <div style={{
            background: "#1c2340", border: "0.5px solid #313a5c",
            borderRadius: 9, padding: "8px", flex: 1, minHeight: 0,
          }}>
            <div style={{ color: "#5dcaa5", fontSize: 7.5, fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>TUGAS AKTIF</div>
            <div style={{ color: "#f2ede3", fontSize: 10.5, fontWeight: 600, lineHeight: 1.3 }}>Gerbang Bilangan</div>
            <div style={{ color: "#8b8f9e", fontSize: 8.5, marginTop: 2 }}>Kerjakan sebelum besok</div>
            <div style={{ marginTop: 6, height: 3, background: "#2a3158", borderRadius: 2 }}>
              <div style={{ height: 3, width: "40%", background: "#5dcaa5", borderRadius: 2 }} />
            </div>
            <div style={{ color: "#5a6180", fontSize: 7.5, marginTop: 2 }}>4 / 10 soal</div>
          </div>

          {/* Row bawah: misi + quicklinks */}
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{
              background: "#1c2340", border: "0.5px solid #313a5c",
              borderRadius: 8, padding: "6px 7px", flex: 1,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 12 }}>🚩</span>
              <span style={{ color: "#c9cdd8", fontSize: 9, fontWeight: 500 }}>Misi</span>
            </div>
            <div style={{
              background: "linear-gradient(135deg,#1a3a2a,#0f2a1e)",
              border: "0.5px solid #2a5040",
              borderRadius: 8, padding: "6px 7px", flex: 1,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 11 }}>📋</span>
              <div style={{ color: "#5dcaa5", fontSize: 8, fontWeight: 700, lineHeight: 1.2 }}>BLP</div>
            </div>
          </div>

          {/* Quick icons */}
          <div style={{
            background: "#1c2340", border: "0.5px solid #313a5c",
            borderRadius: 8, padding: "5px 7px",
            display: "flex", justifyContent: "space-around",
          }}>
            {["📖", "✏️", "🎯"].map((ic, i) => (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: 6, background: "#2a3158",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              }}>{ic}</div>
            ))}
          </div>
        </div>

        {/* ZONA TENGAH — Pet + bottom nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0 }}>
          {/* Pet area */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
          }}>
            <div style={{ color: "#8b8f9e", fontSize: 9 }}>Selamat datang, Ahmad!</div>

            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                width: 70, height: 12,
                background: "radial-gradient(ellipse, rgba(240,153,123,0.25) 0%, transparent 70%)",
                borderRadius: "50%",
              }} />
              <div style={{
                width: 78, height: 78, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #2a3158, #1c2340)",
                border: "1.5px solid #313a5c",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}>🐇</div>
            </div>

            <div style={{ color: "#f2ede3", fontSize: 11, fontWeight: 600 }}>Tomi</div>

            {/* HP bar */}
            <div style={{ width: "85%", background: "#1c2340", borderRadius: 6, padding: "4px 6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ color: "#5a6180", fontSize: 7.5 }}>Lapar</span>
                <span style={{ color: "#f0997b", fontSize: 7.5 }}>70%</span>
              </div>
              <div style={{ height: 3, background: "#2a3158", borderRadius: 2 }}>
                <div style={{ height: 3, width: "70%", background: "linear-gradient(90deg,#f0997b,#e2653f)", borderRadius: 2 }} />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 4, width: "85%" }}>
              <div style={{
                flex: 1, background: "linear-gradient(135deg,#e2653f,#c94f2d)",
                borderRadius: 7, padding: "5px 0", textAlign: "center",
                color: "#fff", fontSize: 9, fontWeight: 700,
              }}>Beri Makan</div>
              <div style={{
                background: "#1c2340", border: "0.5px solid #313a5c",
                borderRadius: 7, padding: "5px 8px",
                color: "#8b8f9e", fontSize: 12,
              }}>🛍</div>
            </div>
          </div>

          {/* Zona bawah: chat + nav */}
          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {/* Chat preview */}
            <div style={{
              background: "rgba(28,35,64,0.9)", border: "0.5px solid #313a5c",
              borderRadius: 8, padding: "5px 9px", flex: 1,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 12 }}>💬</span>
              <span style={{ color: "#5a6180", fontSize: 9, flex: 1 }}>Chat kelas...</span>
              <div style={{
                background: "#e2653f", borderRadius: "50%",
                width: 14, height: 14, display: "flex", alignItems: "center",
                justifyContent: "center", color: "#fff", fontSize: 7, fontWeight: 700,
              }}>3</div>
            </div>

            {/* Nav icons */}
            {[["🛒", "Toko"], ["🏅", "Lencana"], ["👑", "Rank"], ["🎒", "Tas"]].map(([ic, label], i) => (
              <div key={i} style={{
                background: "#1c2340", border: "0.5px solid #313a5c",
                borderRadius: 8, padding: "5px 6px", minWidth: 34,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              }}>
                <span style={{ fontSize: 14 }}>{ic}</span>
                <span style={{ color: "#5a6180", fontSize: 7 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZONA KANAN — 3 pintu utama */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            {
              bg: "linear-gradient(160deg,#4a3fa8,#3c3489)",
              shadow: "rgba(60,52,137,0.45)",
              icon: "➕", title: "Zona Matematika", sub: "Kelas 7 · 8 · 9",
              textColor: "#eeedfe", subColor: "#cecbf6", ctaColor: "#eeedfe",
            },
            {
              bg: "linear-gradient(160deg,#0d6b55,#085041)",
              shadow: "rgba(8,80,65,0.45)",
              icon: "🧪", title: "Zona IPA", sub: "Kelas 7 · 8 · 9",
              textColor: "#e1f5ee", subColor: "#9fe1cb", ctaColor: "#e1f5ee",
            },
            {
              bg: "linear-gradient(160deg,#8c3518,#712b13)",
              shadow: "rgba(113,43,19,0.5)",
              icon: "⚔️", title: "Arena Tanding", sub: "Duel · Boss · MOBA",
              textColor: "#faece7", subColor: "#f5c4b3", ctaColor: "#faece7",
              badge: "LIVE",
            },
          ].map((zone, i) => (
            <div key={i} style={{
              background: zone.bg, borderRadius: 9, padding: "8px 10px", flex: 1,
              display: "flex", flexDirection: "row", alignItems: "center", gap: 8,
              boxShadow: `0 3px 10px ${zone.shadow}`,
              position: "relative", overflow: "hidden", cursor: "pointer",
            }}>
              {zone.badge && (
                <div style={{
                  position: "absolute", top: 5, right: 6,
                  background: "#f0997b", borderRadius: 3,
                  padding: "1px 4px", color: "#4a1b0c", fontSize: 7, fontWeight: 700,
                }}>{zone.badge}</div>
              )}
              <span style={{ fontSize: 22, flexShrink: 0 }}>{zone.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: zone.textColor, fontSize: 10.5, fontWeight: 700, lineHeight: 1.2 }}>{zone.title}</div>
                <div style={{ color: zone.subColor, fontSize: 8.5, marginTop: 2 }}>{zone.sub}</div>
                <div style={{
                  marginTop: 4, background: "rgba(255,255,255,0.13)",
                  borderRadius: 4, padding: "2px 7px", display: "inline-block",
                  color: zone.ctaColor, fontSize: 8, fontWeight: 700,
                }}>▶ Masuk</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
