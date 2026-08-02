import { FormEvent, useState, type CSSProperties } from "react";

type Role = "siswa" | "guru";

const roles = {
  siswa: {
    label: "Siswa",
    sub: "Pelajar SMP TISA",
    icon: "↗",
    mark: "S",
    accent: "#8b7cff",
    accentSoft: "rgba(139,124,255,.16)",
    border: "rgba(139,124,255,.34)",
    background: "linear-gradient(145deg,#171748 0%,#211861 52%,#131735 100%)",
    features: ["TOMAT", "BLP"],
    hint: "Akses materi, nilai, dan permainanmu.",
    note: "Akun didaftarkan melalui BLP",
  },
  guru: {
    label: "Guru",
    sub: "Pengajar SMP TISA",
    icon: "✦",
    mark: "G",
    accent: "#f6b84a",
    accentSoft: "rgba(246,184,74,.14)",
    border: "rgba(246,184,74,.34)",
    background: "linear-gradient(145deg,#392312 0%,#503016 52%,#26190f 100%)",
    features: ["TOMAT", "BLP", "GURU"],
    hint: "Kelola kelas, penilaian, dan pembelajaran.",
    note: "Akun dibuat oleh admin sekolah",
  },
} as const;

export function RolePortalMobile() {
  const [selected, setSelected] = useState<Role>("siswa");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 1800);
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "#080b16",
        color: "#fff",
        fontFamily: "'Plus Jakarta Sans', 'Trebuchet MS', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "0 18px 18px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .rpm-card { transition: flex .45s cubic-bezier(.22,.8,.24,1), min-height .45s cubic-bezier(.22,.8,.24,1); }
        .rpm-input::placeholder { color: rgba(255,255,255,.34); }
        .rpm-input:focus { border-color: var(--accent) !important; background: rgba(255,255,255,.09) !important; }
        .rpm-button { transition: transform .2s ease, filter .2s ease; }
        .rpm-button:active { transform: scale(.98); }
        @media (max-height: 700px) { .rpm-card-selected { min-height: 410px !important; } }

        /* Custom scrollbar — webkit */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139,124,255,.55) 0%, rgba(99,102,241,.3) 100%);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139,124,255,.85) 0%, rgba(99,102,241,.6) 100%);
        }
        /* Firefox */
        * { scrollbar-width: thin; scrollbar-color: rgba(139,124,255,.45) transparent; }
      `}</style>

      <header style={{ height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/__mockup/images/logo-smartisa.png" alt="SMARTISA" style={{ width: 30, height: 30, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: ".08em" }}>SMARTISA</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", letterSpacing: ".16em", marginTop: 2 }}>PORTAL PEMBELAJARAN</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.38)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 99, padding: "7px 10px" }}>v1.4.5</div>
      </header>

      <section style={{ position: "relative", zIndex: 1, margin: "10px 0 18px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: "#9289d0", fontWeight: 700, marginBottom: 8 }}>Selamat datang kembali</div>
        <h1 style={{ margin: 0, fontSize: "clamp(27px, 8vw, 36px)", lineHeight: 1.1, letterSpacing: "-.06em", fontWeight: 800 }}>Masuk sebagai<br /><span style={{ color: "#d4cffc" }}>{roles[selected].label.toLowerCase()}.</span></h1>
      </section>

      <div style={{ position: "absolute", top: 90, right: -130, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${roles[selected].accentSoft}, transparent 68%)`, pointerEvents: "none", transition: "background .5s" }} />

      <section style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: "calc(100dvh - 190px)", position: "relative", zIndex: 2 }}>
        {(Object.keys(roles) as Role[]).map((role) => {
          const item = roles[role];
          const active = selected === role;
          return (
            <article
              key={role}
              className={`rpm-card ${active ? "rpm-card-selected" : ""}`}
              onClick={() => { if (!active) { setSelected(role); setSubmitted(false); } }}
              style={{
                flex: active ? 1.72 : 0.62,
                minHeight: active ? 438 : 82,
                position: "relative",
                overflow: "hidden",
                borderRadius: 22,
                border: `1px solid ${active ? item.border : "rgba(255,255,255,.1)"}`,
                background: active ? item.background : "linear-gradient(145deg,#101526,#111525)",
                cursor: active ? "default" : "pointer",
                boxShadow: active ? `0 20px 48px ${item.accentSoft}` : "none",
                "--accent": item.accent,
              } as CSSProperties}
            >
              <div style={{ position: "absolute", width: 210, height: 210, top: -86, right: -54, borderRadius: "50%", background: `radial-gradient(circle,${item.accentSoft},transparent 68%)`, opacity: active ? 1 : .25 }} />
              <div style={{ padding: active ? "22px 20px 18px" : "15px 18px", height: "100%", display: "flex", flexDirection: active ? "column" : "row", justifyContent: active ? "flex-start" : "center", gap: active ? 0 : 13, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: active ? 14 : 10, minHeight: active ? 66 : 48 }}>
                  <div style={{ width: active ? 51 : 35, height: active ? 51 : 35, borderRadius: active ? 16 : 11, display: "grid", placeItems: "center", background: item.accentSoft, border: `1px solid ${item.border}`, color: item.accent, fontSize: active ? 22 : 15, fontWeight: 800, transition: "all .35s" }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: active ? 25 : 16, fontWeight: 800, letterSpacing: "-.04em", color: active ? "#fff" : "rgba(255,255,255,.62)" }}>{item.label}</div>
                    {active ? <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 3 }}>{item.sub}</div> : <div style={{ fontSize: 10, color: "rgba(255,255,255,.28)", marginTop: 2 }}>Ketuk untuk masuk</div>}
                  </div>
                  {!active && <span style={{ marginLeft: "auto", color: item.accent, fontSize: 18 }}>›</span>}
                </div>

                {active && (
                  <>
                    <div style={{ display: "flex", gap: 6, margin: "17px 0 18px", flexWrap: "wrap" }}>
                      {item.features.map((feature) => <span key={feature} style={{ padding: "5px 10px", borderRadius: 99, background: feature === "GURU" ? "rgba(246,184,74,.16)" : "rgba(255,255,255,.08)", border: `1px solid ${feature === "GURU" ? "rgba(246,184,74,.3)" : "rgba(255,255,255,.12)"}`, color: feature === "GURU" ? "#f6c468" : "rgba(255,255,255,.62)", fontSize: 9, fontWeight: 800, letterSpacing: ".1em" }}>{feature}</span>)}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.5, marginBottom: 16 }}>{item.hint}</div>
                    <form onSubmit={submit} style={{ marginTop: "auto" }}>
                      <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.44)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 7 }}>Username</label>
                      <input className="rpm-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" required style={{ width: "100%", height: 45, color: "#fff", outline: "none", border: `1px solid ${item.border}`, borderRadius: 11, background: "rgba(255,255,255,.06)", padding: "0 13px", fontSize: 13, fontFamily: "inherit", marginBottom: 11 }} />
                      <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.44)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 7 }}>Kata sandi</label>
                      <div style={{ position: "relative" }}>
                        <input className="rpm-input" type={showPassword ? "text" : "password"} placeholder="Kata sandi" required style={{ width: "100%", height: 45, color: "#fff", outline: "none", border: `1px solid ${item.border}`, borderRadius: 11, background: "rgba(255,255,255,.06)", padding: "0 42px 0 13px", fontSize: 13, fontFamily: "inherit" }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Tampilkan kata sandi" style={{ position: "absolute", right: 12, top: 12, border: 0, background: "none", color: "rgba(255,255,255,.45)", cursor: "pointer", fontSize: 14 }}>{showPassword ? "○" : "◉"}</button>
                      </div>
                      <button className="rpm-button" type="submit" style={{ width: "100%", marginTop: 15, height: 46, border: 0, borderRadius: 11, background: item.accent, color: role === "guru" ? "#211304" : "#171331", fontWeight: 800, letterSpacing: ".08em", fontSize: 12, cursor: "pointer", fontFamily: "inherit", filter: submitted ? "brightness(1.18)" : "none" }}>{submitted ? "BERHASIL MASUK" : "MASUK KE PORTAL"}</button>
                      <div style={{ textAlign: "center", color: "rgba(255,255,255,.28)", fontSize: 10, marginTop: 10 }}>{item.note}</div>
                    </form>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <footer style={{ textAlign: "center", color: "rgba(255,255,255,.18)", fontSize: 9, letterSpacing: ".06em", padding: "15px 0 0" }}>SMP TISA ISLAMIC SCHOOL · AMAN & TERHUBUNG</footer>
    </main>
  );
}