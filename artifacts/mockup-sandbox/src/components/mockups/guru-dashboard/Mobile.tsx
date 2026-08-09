import { useState } from "react";
import {
  Users, BarChart3, Heart, Bell, LogOut, Search,
  Eye, MessageCircle, ChevronLeft, ChevronRight,
  TrendingUp, CheckCircle2, Calendar, Star,
  AlertCircle, Clock, Filter,
} from "lucide-react";

const C = {
  pageBg:  "#0b1d14",
  navBg:   "#122018",
  cardBg:  "#16291e",
  rowBg:   "#192b21",
  border:  "#24402e",
  muted:   "#5fa870",
  dim:     "#3d6b4d",
  accent:  "#10b981",
};

const students = [
  { id: 1, name: "Airlangga Yusuf T.P.",   inits: "AY", kelas: "VII Ibn Batuttah", progress: 18, total: 22, score: 84, status: "Proses",  female: false },
  { id: 2, name: "Alif Syahrin Mubarok",    inits: "AS", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 91, status: "Selesai", female: false },
  { id: 3, name: "Alisya Nadhira A.",        inits: "AN", kelas: "VII Ibn Batuttah", progress: 0,  total: 22, score: 0,  status: "Belum",   female: true  },
  { id: 4, name: "Aqila Resyia Sunandar",   inits: "AR", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 96, status: "Selesai", female: true  },
  { id: 5, name: "Fatimah Zahrin H.",        inits: "FZ", kelas: "VII Ibn Batuttah", progress: 15, total: 22, score: 73, status: "Proses",  female: true  },
  { id: 6, name: "Ghania Khairunnisa P.",    inits: "GK", kelas: "VII Ibn Batuttah", progress: 0,  total: 22, score: 0,  status: "Belum",   female: true  },
  { id: 7, name: "Haikal Ramadhan S.",       inits: "HR", kelas: "VII Ibn Batuttah", progress: 20, total: 22, score: 88, status: "Proses",  female: false },
  { id: 8, name: "Intan Permata Sari",       inits: "IP", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 79, status: "Selesai", female: true  },
];

const recap = [
  { id: 1, name: "Airlangga Yusuf T.P.",  inits: "AY", avg: 84,  best: 97, days: 18, trend: "up"   },
  { id: 2, name: "Alif Syahrin Mubarok",  inits: "AS", avg: 91,  best: 100,days: 22, trend: "up"   },
  { id: 3, name: "Alisya Nadhira A.",      inits: "AN", avg: 0,   best: 0,  days: 0,  trend: "down" },
  { id: 4, name: "Aqila Resyia Sunandar", inits: "AR", avg: 96,  best: 100,days: 22, trend: "up"   },
  { id: 5, name: "Fatimah Zahrin H.",      inits: "FZ", avg: 73,  best: 88, days: 15, trend: "flat" },
  { id: 6, name: "Ghania K.P.",            inits: "GK", avg: 0,   best: 0,  days: 0,  trend: "down" },
  { id: 7, name: "Haikal Ramadhan S.",     inits: "HR", avg: 88,  best: 95, days: 20, trend: "up"   },
  { id: 8, name: "Intan Permata Sari",     inits: "IP", avg: 79,  best: 90, days: 22, trend: "flat" },
];

const haidData = [
  { id: 3,  name: "Alisya Nadhira A.",      inits: "AN", status: "haid",    since: "29 Jul", until: "4 Agt"  },
  { id: 4,  name: "Aqila Resyia Sunandar",  inits: "AR", status: "normal",  since: null,     until: null     },
  { id: 5,  name: "Fatimah Zahrin H.",       inits: "FZ", status: "normal",  since: null,     until: null     },
  { id: 6,  name: "Ghania Khairunnisa P.",   inits: "GK", status: "haid",    since: "1 Agt",  until: null     },
  { id: 8,  name: "Intan Permata Sari",      inits: "IP", status: "normal",  since: null,     until: null     },
];

const scoreColor = (s: number) =>
  s === 0 ? "#ef4444" : s >= 85 ? "#22c55e" : s >= 70 ? "#f59e0b" : "#ef4444";

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  Selesai: { bg: "#14532d", color: "#4ade80", label: "Selesai" },
  Proses:  { bg: "#78350f", color: "#fbbf24", label: "Proses"  },
  Belum:   { bg: "#7f1d1d", color: "#f87171", label: "Belum"   },
};

const Avatar = ({ inits, size = 10 }: { inits: string; size?: number }) => (
  <div
    className={`w-${size} h-${size} rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0`}
    style={{ background: "linear-gradient(135deg,#10b981,#0d9488)", color: "white" }}
  >
    {inits}
  </div>
);

type Tab = "daftar" | "rekap" | "haid";

export function Mobile() {
  const [tab, setTab] = useState<Tab>("daftar");
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const sudahIsi  = students.filter(s => s.status === "Selesai").length;
  const proses    = students.filter(s => s.status === "Proses").length;
  const belum     = students.filter(s => s.status === "Belum").length;
  const avgScore  = Math.round(students.filter(s => s.score > 0).reduce((a, s) => a + s.score, 0) / students.filter(s => s.score > 0).length) || 0;
  const haidCount = haidData.filter(h => h.status === "haid").length;

  return (
    <div className="min-h-screen font-sans max-w-sm mx-auto flex flex-col select-none" style={{ background: C.pageBg, color: "white" }}>
      {/* Status bar */}
      <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs" style={{ background: C.navBg }}>
        <span className="font-medium">09:41</span>
        <span>▂▄▆ ✦ 🔋</span>
      </div>

      {/* Header */}
      <div style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              BLP
            </div>
            <div>
              <div className="font-bold text-sm">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA • Wali Kelas</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>SD</div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 text-[8px] flex items-center justify-center font-bold" style={{ borderColor: C.navBg }}>3</span>
            </div>
            <button style={{ color: C.muted }}><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-2 gap-1">
          {([
            { id: "daftar", icon: Users,    label: "Siswa"   },
            { id: "rekap",  icon: BarChart3, label: "Rekap"   },
            { id: "haid",   icon: Heart,    label: "Haid"    },
          ] as { id: Tab; icon: typeof Users; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-t-lg flex-1 justify-center transition-all"
              style={tab === id
                ? { background: C.cardBg, color: "white", borderTop: `2px solid ${C.accent}` }
                : { color: C.muted }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === "haid" && haidCount > 0 && (
                <span className="ml-0.5 w-4 h-4 bg-rose-600 rounded-full text-[9px] flex items-center justify-center font-bold text-white">{haidCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: DAFTAR SISWA ── */}
      {tab === "daftar" && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1.5 px-3 pt-3 pb-2">
            {[
              { label: "Total",   value: students.length, color: "#6aaa82",  bg: C.cardBg    },
              { label: "Selesai", value: sudahIsi,         color: "#4ade80",  bg: "#14532d"   },
              { label: "Proses",  value: proses,           color: "#fbbf24",  bg: "#78350f"   },
              { label: "Belum",   value: belum,            color: "#f87171",  bg: "#7f1d1d"   },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="rounded-xl p-2 text-center" style={{ background: bg, border: `1px solid ${C.border}` }}>
                <div className="font-bold text-base leading-none" style={{ color }}>{value}</div>
                <div className="text-[10px] mt-0.5" style={{ color }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Date nav */}
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <button style={{ color: C.muted }}><ChevronLeft className="w-4 h-4" /></button>
              <div className="text-center">
                <div className="text-sm font-semibold">Sabtu, 2 Agt 2026</div>
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>Periode: 1–31 Agustus</div>
              </div>
              <button style={{ color: C.muted }}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none"
                placeholder="Cari nama siswa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: C.cardBg, border: `1px solid ${C.border}`, color: "white" }}
              />
            </div>
          </div>

          {/* Student list */}
          <div className="flex-1 px-3 pb-4 space-y-2 overflow-y-auto">
            {filteredStudents.map((s) => (
              <div key={s.id} className="rounded-2xl p-3" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2.5">
                  <Avatar inits={s.inits} size={10} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{s.name}</span>
                      <span className="font-bold text-base ml-2 flex-shrink-0" style={{ color: scoreColor(s.score) }}>{s.score || "–"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e3a2a" }}>
                        <div className="h-full rounded-full" style={{ width: `${(s.progress / s.total) * 100}%`, background: s.progress === s.total ? C.accent : "#f59e0b" }} />
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: C.muted }}>{s.progress}/{s.total}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" style={statusStyle[s.status]}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2.5 justify-end">
                  <button className="p-1.5 rounded-lg" style={{ background: "#1e3a5f" }}><Eye className="w-3.5 h-3.5 text-blue-400" /></button>
                  <button className="p-1.5 rounded-lg" style={{ background: "#134e3a" }}><MessageCircle className="w-3.5 h-3.5 text-teal-400" /></button>
                  {s.female && (
                    <button className="p-1.5 rounded-lg" style={{ background: "#4a1028" }}><Heart className="w-3.5 h-3.5 text-rose-400" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── TAB: REKAP NILAI ── */}
      {tab === "rekap" && (
        <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
          {/* Month header */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <button style={{ color: C.muted }}><ChevronLeft className="w-4 h-4" /></button>
            <div className="text-center">
              <div className="font-semibold text-sm">Agustus 2026</div>
              <div className="text-xs mt-0.5" style={{ color: C.muted }}>Rekap Bulanan</div>
            </div>
            <button style={{ color: C.muted }}><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Rata-rata Kelas", value: `${avgScore}`, icon: TrendingUp,   iconBg: "#134e4a", iconColor: "#2dd4bf" },
              { label: "Pengisian Aktif",  value: `${sudahIsi + proses}/${students.length}`, icon: CheckCircle2, iconBg: "#14532d", iconColor: "#4ade80" },
            ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <div key={label} className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <div>
                  <div className="font-bold text-base leading-none">{value}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Score distribution bar */}
          <div className="rounded-xl p-3" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <div className="text-xs font-semibold mb-2" style={{ color: C.muted }}>DISTRIBUSI SKOR</div>
            <div className="flex rounded-full overflow-hidden h-3">
              <div className="bg-emerald-500" style={{ width: "37%" }} title="≥85" />
              <div className="bg-yellow-500" style={{ width: "25%" }} title="70–84" />
              <div className="bg-red-500"     style={{ width: "38%" }} title="<70 / Belum" />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: C.muted }}>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />≥85 (3)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />70–84 (2)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Belum (3)</span>
            </div>
          </div>

          {/* Per-student recap */}
          <div className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: C.dim }}>Detail Per Siswa</div>
          {recap.map(s => (
            <div key={s.id} className="rounded-2xl px-3 py-2.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2.5">
                <Avatar inits={s.inits} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs" style={{ color: C.muted }}>Rata: <span className="font-bold" style={{ color: scoreColor(s.avg) }}>{s.avg || "–"}</span></span>
                    <span className="text-xs" style={{ color: C.muted }}>Terbaik: <span className="font-bold text-emerald-400">{s.best || "–"}</span></span>
                    <span className="text-xs" style={{ color: C.muted }}>Hari: <span className="font-bold text-white">{s.days}</span></span>
                  </div>
                </div>
                <div className="text-xs px-1.5 py-0.5 rounded" style={{
                  color: s.trend === "up" ? "#4ade80" : s.trend === "down" ? "#f87171" : "#fbbf24",
                  background: s.trend === "up" ? "#14532d" : s.trend === "down" ? "#7f1d1d" : "#78350f"
                }}>
                  {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: HAID SISWI ── */}
      {tab === "haid" && (
        <div className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
          {/* Info banner */}
          <div className="rounded-xl p-3 flex gap-2.5" style={{ background: "#3b0a2a", border: "1px solid #6b1a45" }}>
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs" style={{ color: "#fda4af" }}>
              Siswi yang sedang haid skor sholarnya tidak dihitung dalam BLP Harian.
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: "#3b0a2a", border: "1px solid #6b1a45" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#5c0f3b" }}>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="font-bold text-base leading-none text-rose-400">{haidCount}</div>
                <div className="text-[10px] mt-0.5 text-rose-300">Sedang Haid</div>
              </div>
            </div>
            <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#14532d" }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-base leading-none text-emerald-400">{haidData.length - haidCount}</div>
                <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>Normal</div>
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: C.dim }}>Siswi Kelas VII Ibn Batuttah</div>

          {haidData.map(s => (
            <div key={s.id} className="rounded-2xl px-3 py-3" style={{
              background: s.status === "haid" ? "#1e0a16" : C.cardBg,
              border: `1px solid ${s.status === "haid" ? "#5c1a36" : C.border}`
            }}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ background: s.status === "haid" ? "linear-gradient(135deg,#be185d,#9d174d)" : "linear-gradient(135deg,#10b981,#0d9488)", color: "white" }}>
                  {s.inits}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{s.name}</div>
                  {s.status === "haid" ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#7f1d45", color: "#fda4af" }}>Sedang Haid</span>
                      {s.since && <span className="text-xs" style={{ color: "#fda4af" }}>Sejak {s.since}</span>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Tidak sedang haid</span>
                    </div>
                  )}
                </div>
                {s.status === "haid" ? (
                  <button className="px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: "#14532d", color: "#4ade80" }}>
                    Selesai
                  </button>
                ) : (
                  <button className="px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: "#5c0f3b", color: "#fda4af" }}>
                    Mulai Haid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <div className="flex justify-around px-4 py-2.5" style={{ background: C.navBg, borderTop: `1px solid ${C.border}` }}>
        {([
          { icon: Users,     label: "Siswa",  id: "daftar" },
          { icon: BarChart3, label: "Rekap",  id: "rekap"  },
          { icon: Calendar,  label: "Jadwal", id: "jadwal" },
          { icon: Bell,      label: "Notif",  id: "notif"  },
        ] as const).map(({ icon: Icon, label, id }) => (
          <button key={id} onClick={() => id === "daftar" || id === "rekap" ? setTab(id as Tab) : null}
            className="flex flex-col items-center gap-0.5 py-0.5"
            style={{ color: tab === id ? C.accent : C.muted }}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
