import { useState } from "react";

type Role = "siswa" | "guru";

export function LoginScreen() {
  const [role, setRole] = useState<Role>("siswa");
  const [showPassword, setShowPassword] = useState(false);

  const isSiswa = role === "siswa";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0a0e1a 0%, #0d1220 50%, #0a0f1e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-5%", right: "-5%",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", right: "10%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Main card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        position: "relative",
        zIndex: 1,
      }}>

        {/* Brand section */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* Logo */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 16,
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}>
            <img
              src="/__mockup/images/logo-smartisa.png"
              alt="SMARTISA"
              style={{ width: 64, height: 64, objectFit: "contain" }}
            />
          </div>

          {/* Platform name */}
          <div style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.5px",
            marginBottom: 6,
          }}>
            SMARTISA
          </div>
          <div style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.05em",
            marginBottom: 20,
          }}>
            Platform Pembelajaran Resmi TISA
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {[
              { label: "TOMAT", color: "#818CF8", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)" },
              { label: "BLP", color: "#34D399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
              { label: "GURU", color: "#FBB040", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
            ].map((f) => (
              <div key={f.label} style={{
                padding: "4px 12px",
                borderRadius: 20,
                background: f.bg,
                border: `1px solid ${f.border}`,
                fontSize: 11,
                fontWeight: 700,
                color: f.color,
                letterSpacing: "0.08em",
              }}>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 20,
          padding: "28px 24px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>

          {/* Role selector */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}>
              Masuk sebagai
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {([
                { key: "siswa", label: "Siswa", icon: "📖", sub: "Pelajar" },
                { key: "guru", label: "Guru", icon: "🎓", sub: "Pengajar" },
              ] as const).map((r) => {
                const isActive = role === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: isActive
                        ? "1.5px solid rgba(99,102,241,0.7)"
                        : "1.5px solid rgba(255,255,255,0.07)",
                      background: isActive
                        ? "rgba(99,102,241,0.18)"
                        : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{r.icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.7)",
                      }}>
                        {r.label}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                      }}>
                        {r.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Username
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "0 14px",
              transition: "border-color 0.15s",
            }}>
              <span style={{ fontSize: 16, opacity: 0.4 }}>👤</span>
              <input
                type="text"
                placeholder="Masukkan username"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  padding: "13px 0",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Kata Sandi
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "0 14px",
            }}>
              <span style={{ fontSize: 16, opacity: 0.4 }}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  padding: "13px 0",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  opacity: 0.4,
                  padding: 0,
                  color: "#fff",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: isSiswa
                ? "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)"
                : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.05em",
              cursor: "pointer",
              boxShadow: isSiswa
                ? "0 4px 20px rgba(99,102,241,0.4)"
                : "0 4px 20px rgba(139,92,246,0.4)",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            MASUK SEKARANG
          </button>

          {/* Footer links */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
              fontFamily: "inherit",
            }}>
              Lupa kata sandi?
            </button>
          </div>
        </div>

        {/* Bottom note */}
        <div style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.02em",
        }}>
          {role === "siswa"
            ? "Akun siswa didaftarkan melalui aplikasi BLP"
            : "Akun guru dibuat oleh admin sekolah melalui BLP"}
          <br />
          <span style={{ marginTop: 4, display: "block" }}>v1.4.5 · SMP TISA Islamic School</span>
        </div>
      </div>
    </div>
  );
}
