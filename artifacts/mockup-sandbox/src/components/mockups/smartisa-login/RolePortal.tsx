import { useState } from "react";

type Role = "siswa" | "guru" | null;

export function RolePortal() {
  const [selected, setSelected] = useState<Role>("siswa");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "#080c16",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Top bar — platform identity minimal */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        zIndex: 20,
        background: "linear-gradient(to bottom, rgba(8,12,22,0.95) 0%, transparent 100%)",
      }}>
        <img
          src="/__mockup/images/logo-smartisa.png"
          alt="SMARTISA"
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
        <span style={{
          fontSize: 15,
          fontWeight: 800,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.04em",
        }}>
          SMARTISA
        </span>
      </div>

      {/* Portal split — two role cards */}
      <div style={{
        flex: 1,
        display: "flex",
        position: "relative",
      }}>

        {/* SISWA portal */}
        <div
          onClick={() => setSelected("siswa")}
          style={{
            flex: selected === "siswa" ? 3 : 1,
            transition: "flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            cursor: selected === "siswa" ? "default" : "pointer",
            overflow: "hidden",
          }}
        >
          {/* Background gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: selected === "siswa"
              ? "linear-gradient(135deg, #0f1635 0%, #1a1060 50%, #0f1635 100%)"
              : "linear-gradient(135deg, #0a0e20 0%, #0d1228 100%)",
            transition: "background 0.4s",
          }} />
          {/* Accent glow */}
          <div style={{
            position: "absolute",
            top: "20%", left: "30%",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            opacity: selected === "siswa" ? 1 : 0.3,
            transition: "opacity 0.4s",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />
          {/* Decorative line */}
          <div style={{
            position: "absolute",
            top: 0, bottom: 0, right: 0,
            width: 1,
            background: "rgba(99,102,241,0.2)",
          }} />

          {/* Content */}
          <div style={{
            position: "relative",
            zIndex: 5,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: selected === "siswa" ? "72px 40px 32px" : "72px 20px 32px",
            transition: "padding 0.4s",
          }}>

            {/* Role label */}
            <div style={{ marginBottom: selected === "siswa" ? 28 : 12 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
              <div style={{
                fontSize: selected === "siswa" ? 26 : 18,
                fontWeight: 900,
                color: selected === "siswa" ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "font-size 0.3s, color 0.3s",
                whiteSpace: "nowrap",
              }}>
                Siswa
              </div>
              {selected === "siswa" && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Pelajar SMP TISA
                </div>
              )}
            </div>

            {/* Feature pills — only shown when selected */}
            {selected === "siswa" && (
              <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
                {[
                  { l: "TOMAT", c: "#818CF8", bg: "rgba(99,102,241,0.15)", b: "rgba(99,102,241,0.3)" },
                  { l: "BLP", c: "#34D399", bg: "rgba(16,185,129,0.12)", b: "rgba(16,185,129,0.25)" },
                ].map(f => (
                  <div key={f.l} style={{
                    padding: "3px 10px", borderRadius: 16,
                    background: f.bg, border: `1px solid ${f.b}`,
                    fontSize: 10, fontWeight: 700, color: f.c, letterSpacing: "0.08em",
                  }}>{f.l}</div>
                ))}
              </div>
            )}

            {/* Login form — only in selected state */}
            {selected === "siswa" && (
              <div style={{ flex: 1 }}>
                {/* Username */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    marginBottom: 6,
                  }}>Username</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10, padding: "0 14px",
                  }}>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>👤</span>
                    <input
                      type="text"
                      placeholder="Masukkan username"
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "#fff", fontSize: 14, padding: "12px 0", fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    marginBottom: 6,
                  }}>Kata Sandi</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10, padding: "0 14px",
                  }}>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Kata sandi"
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "#fff", fontSize: 14, padding: "12px 0", fontFamily: "inherit",
                      }}
                    />
                    <button onClick={() => setShowPassword(v => !v)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 14, opacity: 0.4, padding: 0, color: "#fff",
                    }}>
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button style={{
                  width: "100%", padding: "13px",
                  borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                  color: "#fff", fontSize: 14, fontWeight: 800,
                  letterSpacing: "0.05em", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  fontFamily: "inherit",
                }}>
                  MASUK
                </button>

                <div style={{
                  marginTop: 10, fontSize: 11,
                  color: "rgba(255,255,255,0.25)", textAlign: "center",
                }}>
                  Akun didaftarkan melalui BLP
                </div>
              </div>
            )}

            {/* Tap hint — shown when not selected */}
            {selected !== "siswa" && (
              <div style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                marginTop: "auto",
                paddingBottom: 32,
              }}>
                Ketuk untuk masuk
              </div>
            )}
          </div>
        </div>

        {/* GURU portal */}
        <div
          onClick={() => setSelected("guru")}
          style={{
            flex: selected === "guru" ? 3 : 1,
            transition: "flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            cursor: selected === "guru" ? "default" : "pointer",
            overflow: "hidden",
          }}
        >
          {/* Background */}
          <div style={{
            position: "absolute", inset: 0,
            background: selected === "guru"
              ? "linear-gradient(135deg, #1a1008 0%, #2d1a00 50%, #1a1008 100%)"
              : "linear-gradient(135deg, #140e06 0%, #1a1208 100%)",
            transition: "background 0.4s",
          }} />
          {/* Accent glow */}
          <div style={{
            position: "absolute",
            top: "20%", left: "50%",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
            opacity: selected === "guru" ? 1 : 0.3,
            transition: "opacity 0.4s",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }} />

          {/* Content */}
          <div style={{
            position: "relative",
            zIndex: 5,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: selected === "guru" ? "72px 40px 32px" : "72px 20px 32px",
            transition: "padding 0.4s",
          }}>

            {/* Role label */}
            <div style={{ marginBottom: selected === "guru" ? 28 : 12 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎓</div>
              <div style={{
                fontSize: selected === "guru" ? 26 : 18,
                fontWeight: 900,
                color: selected === "guru" ? "#fff" : "rgba(255,255,255,0.5)",
                transition: "font-size 0.3s, color 0.3s",
                whiteSpace: "nowrap",
              }}>
                Guru
              </div>
              {selected === "guru" && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Pengajar SMP TISA
                </div>
              )}
            </div>

            {/* Feature pills */}
            {selected === "guru" && (
              <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
                {[
                  { l: "TOMAT", c: "#818CF8", bg: "rgba(99,102,241,0.15)", b: "rgba(99,102,241,0.3)" },
                  { l: "BLP", c: "#34D399", bg: "rgba(16,185,129,0.12)", b: "rgba(16,185,129,0.25)" },
                  { l: "GURU", c: "#FBB040", bg: "rgba(245,158,11,0.12)", b: "rgba(245,158,11,0.25)" },
                ].map(f => (
                  <div key={f.l} style={{
                    padding: "3px 10px", borderRadius: 16,
                    background: f.bg, border: `1px solid ${f.b}`,
                    fontSize: 10, fontWeight: 700, color: f.c, letterSpacing: "0.08em",
                  }}>{f.l}</div>
                ))}
              </div>
            )}

            {/* Login form */}
            {selected === "guru" && (
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6,
                  }}>Username</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 10, padding: "0 14px",
                  }}>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>👤</span>
                    <input type="text" placeholder="Masukkan username" style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, padding: "12px 0", fontFamily: "inherit",
                    }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6,
                  }}>Kata Sandi</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 10, padding: "0 14px",
                  }}>
                    <span style={{ fontSize: 14, opacity: 0.4 }}>🔒</span>
                    <input type="password" placeholder="Kata sandi" style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, padding: "12px 0", fontFamily: "inherit",
                    }} />
                  </div>
                </div>

                <button style={{
                  width: "100%", padding: "13px",
                  borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#1a0e00", fontSize: 14, fontWeight: 800,
                  letterSpacing: "0.05em", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                  fontFamily: "inherit",
                }}>
                  MASUK
                </button>

                <div style={{
                  marginTop: 10, fontSize: 11,
                  color: "rgba(255,255,255,0.25)", textAlign: "center",
                }}>
                  Akun dibuat oleh admin sekolah
                </div>
              </div>
            )}

            {selected !== "guru" && (
              <div style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                marginTop: "auto",
                paddingBottom: 32,
              }}>
                Ketuk untuk masuk
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom version */}
      <div style={{
        position: "absolute",
        bottom: 16, left: 0, right: 0,
        textAlign: "center",
        fontSize: 10,
        color: "rgba(255,255,255,0.15)",
        zIndex: 20,
      }}>
        v1.4.5 · SMP TISA Islamic School
      </div>
    </div>
  );
}
