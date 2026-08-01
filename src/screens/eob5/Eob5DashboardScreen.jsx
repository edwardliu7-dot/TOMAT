import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthContext";

const C = {
  bg: "linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)",
  primary: "#f59e0b",
  dim: "rgba(245,158,11,0.18)",
  border: "rgba(245,158,11,0.3)",
  text: "#fef3c7",
  sub: "#92400e",
  card: "rgba(255,255,255,0.04)",
  white: "rgba(255,255,255,0.07)",
};

const COLOR_MAP = {
  blue: { icon: "#3b82f6", iconBg: "rgba(59,130,246,0.15)", bar: "#3b82f6" },
  violet: { icon: "#8b5cf6", iconBg: "rgba(139,92,246,0.15)", bar: "#8b5cf6" },
  amber: { icon: "#f59e0b", iconBg: "rgba(245,158,11,0.15)", bar: "#f59e0b" },
  emerald: { icon: "#22c55e", iconBg: "rgba(34,197,94,0.15)", bar: "#22c55e" },
};

const MENU = [
  {
    key: "eob5-absensi",
    label: "Absensi",
    emoji: "📋",
    desc: "Input & rekap kehadiran",
  },
  {
    key: "eob5-nilai",
    label: "Nilai",
    emoji: "📊",
    desc: "Nilai Kurikulum Merdeka",
  },
  {
    key: "eob5-jurnal",
    label: "Jurnal",
    emoji: "📖",
    desc: "Jurnal mengajar harian",
  },
  {
    key: "eob5-jadwal",
    label: "Jadwal",
    emoji: "📅",
    desc: "Jadwal pelajaran",
  },
  {
    key: "eob5-prosem",
    label: "Prosem",
    emoji: "📝",
    desc: "Program semester",
  },
  {
    key: "eob5-materi",
    label: "Materi",
    emoji: "📚",
    desc: "Modul & bahan ajar",
  },
  {
    key: "eob5-soal-ai",
    label: "Soal AI",
    emoji: "🤖",
    desc: "Generate soal otomatis",
  },
  {
    key: "eob5-siswa",
    label: "Siswa",
    emoji: "👥",
    desc: "Manajemen data siswa",
  },
  {
    key: "eob5-rekap",
    label: "Rekap",
    emoji: "📈",
    desc: "Rekap kelas & periode",
  },
  {
    key: "eob5-kalender",
    label: "Kalender",
    emoji: "🗓️",
    desc: "Kalender akademik & pekan",
  },
  {
    key: "eob5-info-pekanan",
    label: "Info Pekan",
    emoji: "📊",
    desc: "Ringkasan mingguan & WA",
  },
  { key: "eob5-inbox", label: "Pesan", emoji: "💬", desc: "Pesan masuk dari siswa" },
  { key: "eob5-poin", label: "Poin Siswa", emoji: "📌", desc: "Rekap poin perilaku" },
  { key: "eob5-akun-siswa", label: "Akun Siswa", emoji: "🔑", desc: "Generate akun login siswa" },
  { key: "eob5-direktori-guru", label: "Direktori Guru", emoji: "👨‍🏫", desc: "Daftar guru & progres" },
  { key: "eob5-direktori-siswa", label: "Direktori Siswa", emoji: "📚", desc: "Direktori semua siswa" },
];

function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.tidakHadir + d.hadir), 1);
  const visible = data.slice(-5);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 120,
        padding: "0 4px",
      }}
    >
      {visible.map((d, i) => {
        const total = d.total || 0;
        const pct = (total / max) * 100;
        const hadirPct = total > 0 ? (d.hadir / total) * 100 : 0;
        const label = d.tanggal
          ? new Intl.DateTimeFormat("id-ID", {
              weekday: "short",
              day: "numeric",
            }).format(new Date(d.tanggal + "T00:00:00"))
          : "";
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ fontSize: 10, color: C.primary, fontWeight: 700 }}>
              {total}
            </div>
            <div
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                overflow: "hidden",
                height: `${Math.max(pct, 8)}%`,
                minHeight: 6,
                display: "flex",
                flexDirection: "column-reverse",
              }}
            >
              <div
                style={{
                  width: "100%",
                  flex: `0 0 ${hadirPct}%`,
                  background: "#22c55e",
                  minHeight: total > 0 ? 4 : 0,
                }}
              />
              <div
                style={{
                  width: "100%",
                  flex: `0 0 ${100 - hadirPct}%`,
                  background: "#ef4444",
                  minHeight: 0,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.sub,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, color, emoji, progress }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 12px",
        position: "relative",
        overflow: "hidden",
        borderLeft: `3px solid ${c.bar}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: c.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>
        <div
          style={{
            fontSize: 10,
            color: C.sub,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{ fontSize: 28, fontWeight: 900, color: c.bar, lineHeight: 1 }}
      >
        {value}
      </div>
      {progress !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: c.bar,
              transition: "width 0.5s",
            }}
          />
        </div>
      )}
    </div>
  );
}

function todayStr() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );
}

export default function Eob5DashboardScreen({ navigate, goBack }) {
  const { user } = useContext(AuthContext);
  const [dash, setDash] = useState(null);
  const [recentJournals, setRecentJournals] = useState([]);
  const [jurnalBulanIni, setJurnalBulanIni] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "guru") return;
    const load = async () => {
      try {
        const [dashRes, journalRes] = await Promise.all([
          fetch("/api/eob5/dashboard", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : {},
          ),
          fetch("/api/eob5/journal", { credentials: "include" }).then((r) =>
            r.ok ? r.json() : [],
          ),
        ]);
        const journals = Array.isArray(journalRes) ? journalRes : [];
        const now = new Date();
        const bulanIni = journals.filter((j) => {
          const d = new Date(
            (j.tanggal || j.created_at || "").slice(0, 10) + "T00:00:00",
          );
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length;
        setDash(dashRes);
        setRecentJournals(journals.slice(0, 6));
        setJurnalBulanIni(bulanIni);
      } catch {
        /* silent */
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const firstName = user?.name?.split(" ")[0] || "Guru";
  const totalSiswa = dash?.statistik?.totalSiswa ?? 0;
  const absensiHariIni = dash?.statistik?.absensiHariIni?.total ?? 0;
  const absensiHadir = dash?.statistik?.absensiHariIni?.hadir ?? 0;
  const kelasDiampu = dash?.statistik?.kelasDiampu ?? [];
  const rekapMinggu = dash?.rekapMingguIni ?? [];

  const attention = [];
  if (!loading) {
    if (jurnalBulanIni < 10) {
      attention.push({
        emoji: "📖",
        title: "Jurnal Mengajar",
        desc: `Baru ${jurnalBulanIni} jurnal bulan ini — pastikan rutin mengisi`,
        key: "eob5-jurnal",
      });
    }
    if (totalSiswa === 0) {
      attention.push({
        emoji: "👥",
        title: "Data Siswa Kosong",
        desc: "Belum ada siswa terdaftar — import atau tambahkan data",
        key: "eob5-siswa",
      });
    }
  }

  const STATS = [
    {
      label: "Total Siswa",
      value: loading ? "…" : totalSiswa,
      color: "blue",
      emoji: "👥",
      progress: 100,
    },
    {
      label: "Jurnal Bulan Ini",
      value: loading ? "…" : jurnalBulanIni,
      color: "violet",
      emoji: "📖",
      progress: Math.min((jurnalBulanIni / 20) * 100, 100),
    },
    {
      label: "Kelas Diampu",
      value: loading ? "…" : kelasDiampu.length,
      color: "amber",
      emoji: "🏫",
      progress: 100,
    },
    {
      label: "Absensi Hari Ini",
      value: loading ? "…" : absensiHariIni,
      color: "emerald",
      emoji: "📋",
      progress:
        absensiHariIni > 0 && totalSiswa > 0
          ? (absensiHadir / absensiHariIni) * 100
          : 0,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "system-ui,sans-serif",
        color: C.text,
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(0,0,0,0.35)",
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {goBack && (
          <button
            onClick={goBack}
            style={{
              background: "none",
              border: "none",
              color: C.primary,
              fontSize: 22,
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            ←
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              color: C.sub,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            SMARTISA · GURU
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
            Dashboard
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.sub }}>Selamat datang,</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>
            {firstName}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        {/* Quick action: Tulis Jurnal */}
        <button
          onClick={() => navigate("eob5-jurnal")}
          style={{
            width: "100%",
            marginBottom: 20,
            background: C.dim,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            color: C.text,
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 24 }}>📖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
              Tulis Jurnal Hari Ini
            </div>
            <div style={{ fontSize: 11, color: C.sub }}>
              Catat pembelajaran & materi yang diajarkan
            </div>
          </div>
          <span style={{ color: C.primary, fontSize: 18 }}>→</span>
        </button>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {STATS.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              color={s.color}
              emoji={s.emoji}
              progress={s.progress}
            />
          ))}
        </div>

        {/* Bar Chart: Rekap Absensi Minggu Ini */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                Rekap Absensi 7 Hari Terakhir
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                {rekapMinggu.length} hari tercatat
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: "#22c55e",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                Hadir
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color: "#ef4444",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: "#ef4444",
                    display: "inline-block",
                  }}
                />
                Absen
              </span>
            </div>
          </div>
          {loading ? (
            <div
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.sub,
                fontSize: 12,
              }}
            >
              Memuat…
            </div>
          ) : rekapMinggu.length === 0 ? (
            <div
              style={{
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.sub,
                fontSize: 12,
              }}
            >
              Belum ada data absensi minggu ini
            </div>
          ) : (
            <BarChart data={rekapMinggu} />
          )}
        </div>

        {/* Perlu Perhatian */}
        {attention.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                color: C.sub,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              PERLU PERHATIAN
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attention.map((a, i) => (
                <button
                  key={i}
                  onClick={() => navigate(a.key)}
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{a.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                    >
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                      {a.desc}
                    </div>
                  </div>
                  <span style={{ color: C.primary }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Journals */}
        {recentJournals.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 10,
                color: C.sub,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              JURNAL TERBARU
            </div>
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {recentJournals.map((j, i) => (
                <div
                  key={j.id}
                  style={{
                    padding: "10px 14px",
                    borderBottom:
                      i < recentJournals.length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 16 }}>📖</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {j.materi || "(tanpa materi)"}
                    </div>
                    <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                      {j.kelas} · {j.subject_name || "—"} ·{" "}
                      {j.tanggal ? j.tanggal.slice(0, 10) : ""}
                    </div>
                  </div>
                  {j.prosem_item_id && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#8b5cf6",
                        background: "rgba(139,92,246,0.1)",
                        borderRadius: 4,
                        padding: "1px 5px",
                        flexShrink: 0,
                      }}
                    >
                      📝
                    </span>
                  )}
                </div>
              ))}
              <button
                onClick={() => navigate("eob5-jurnal")}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: "10px",
                  color: C.sub,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderTop: `1px dashed ${C.border}`,
                }}
              >
                Lihat Semua Jurnal →
              </button>
            </div>
          </div>
        )}

        {/* Aksi Cepat */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 10,
              color: C.sub,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            AKSI CEPAT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 8,
            }}
          >
            {[
              { key: "eob5-jurnal", label: "Tulis Jurnal" },
              { key: "eob5-absensi", label: "Input Absensi" },
              { key: "eob5-nilai", label: "Input Nilai" },
              { key: "eob5-prosem", label: "Program Semester" },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => navigate(a.key)}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  {a.label}
                </span>
                <span style={{ color: C.primary, fontSize: 14 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div
          style={{
            fontSize: 10,
            color: C.sub,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          MENU UTAMA
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 10,
          }}
        >
          {MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => navigate(m.key)}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: "16px 14px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.dim;
                e.currentTarget.style.borderColor = C.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.card;
                e.currentTarget.style.borderColor = C.border;
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = C.dim;
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.background = C.card;
              }}
            >
              <div style={{ fontSize: 28 }}>{m.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.4 }}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
