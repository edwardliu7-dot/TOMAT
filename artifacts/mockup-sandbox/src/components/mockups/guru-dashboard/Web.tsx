import { useState } from "react";
import {
  Users, BarChart3, Heart, Bell, LogOut, Search,
  Eye, MessageCircle, ChevronLeft, ChevronRight,
  TrendingUp, CheckCircle2, Download, FileSpreadsheet,
  AlertCircle, Star, Filter, Calendar, Clock,
  ChevronDown, Printer,
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
  { id: 1, name: "Airlangga Yusuf Tuanah Putra", inits: "AY", kelas: "VII Ibn Batuttah", progress: 18, total: 22, score: 84, status: "Proses",  female: false },
  { id: 2, name: "Alif Syahrin Mubarok",          inits: "AS", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 91, status: "Selesai", female: false },
  { id: 3, name: "Alisya Nadhira Andarestia",      inits: "AN", kelas: "VII Ibn Batuttah", progress: 0,  total: 22, score: 0,  status: "Belum",   female: true  },
  { id: 4, name: "Aqila Resyia Sunandar",          inits: "AR", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 96, status: "Selesai", female: true  },
  { id: 5, name: "Fatimah Zahrin Hishasha",        inits: "FZ", kelas: "VII Ibn Batuttah", progress: 15, total: 22, score: 73, status: "Proses",  female: true  },
  { id: 6, name: "Ghania Khairunnisa Putri",       inits: "GK", kelas: "VII Ibn Batuttah", progress: 0,  total: 22, score: 0,  status: "Belum",   female: true  },
  { id: 7, name: "Haikal Ramadhan Saputra",        inits: "HR", kelas: "VII Ibn Batuttah", progress: 20, total: 22, score: 88, status: "Proses",  female: false },
  { id: 8, name: "Intan Permata Sari",             inits: "IP", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 79, status: "Selesai", female: true  },
  { id: 9, name: "Jafar Al-Amin Ridwan",           inits: "JA", kelas: "VII Ibn Batuttah", progress: 5,  total: 22, score: 62, status: "Proses",  female: false },
  { id: 10,name: "Keysha Amara Putri",             inits: "KA", kelas: "VII Ibn Batuttah", progress: 22, total: 22, score: 94, status: "Selesai", female: true  },
  { id: 11,name: "Luthfi Hakim Pratama",           inits: "LH", kelas: "VII Ibn Batuttah", progress: 0,  total: 22, score: 0,  status: "Belum",   female: false },
  { id: 12,name: "Madinatunnisa Al-Zahra",         inits: "MA", kelas: "VII Ibn Batuttah", progress: 19, total: 22, score: 87, status: "Proses",  female: true  },
];

const recap = [
  { id: 1, name: "Airlangga Yusuf T.P.",  inits: "AY", avg: 84,  best: 97,  days: 18, devout: 90, resilience: 82, trend: "up"   },
  { id: 2, name: "Alif Syahrin Mubarok",  inits: "AS", avg: 91,  best: 100, days: 22, devout: 95, resilience: 88, trend: "up"   },
  { id: 3, name: "Alisya Nadhira A.",      inits: "AN", avg: 0,   best: 0,   days: 0,  devout: 0,  resilience: 0,  trend: "down" },
  { id: 4, name: "Aqila Resyia Sunandar", inits: "AR", avg: 96,  best: 100, days: 22, devout: 98, resilience: 94, trend: "up"   },
  { id: 5, name: "Fatimah Zahrin H.",      inits: "FZ", avg: 73,  best: 88,  days: 15, devout: 78, resilience: 68, trend: "flat" },
  { id: 6, name: "Ghania K.P.",            inits: "GK", avg: 0,   best: 0,   days: 0,  devout: 0,  resilience: 0,  trend: "down" },
  { id: 7, name: "Haikal Ramadhan S.",     inits: "HR", avg: 88,  best: 95,  days: 20, devout: 91, resilience: 85, trend: "up"   },
  { id: 8, name: "Intan Permata Sari",     inits: "IP", avg: 79,  best: 90,  days: 22, devout: 82, resilience: 76, trend: "flat" },
];

const haidData = [
  { id: 3,  name: "Alisya Nadhira Andarestia",          inits: "AN", status: "haid",   since: "29 Jul 2026", until: "4 Agt 2026", notes: "Sholat tidak dihitung 29/7–4/8" },
  { id: 4,  name: "Aqila Resyia Sunandar",              inits: "AR", status: "normal", since: null, until: null, notes: "" },
  { id: 5,  name: "Fatimah Zahrin Hishasha",            inits: "FZ", status: "normal", since: null, until: null, notes: "" },
  { id: 6,  name: "Ghania Khairunnisa Putri",           inits: "GK", status: "haid",   since: "1 Agt 2026",  until: null, notes: "Masih berlangsung" },
  { id: 8,  name: "Intan Permata Sari",                 inits: "IP", status: "normal", since: null, until: null, notes: "" },
  { id: 10, name: "Keysha Amara Putri",                 inits: "KA", status: "normal", since: null, until: null, notes: "" },
  { id: 12, name: "Madinatunnisa Al-Zahra",             inits: "MA", status: "normal", since: null, until: null, notes: "" },
];

const scoreColor = (s: number) =>
  s === 0 ? "#ef4444" : s >= 85 ? "#22c55e" : s >= 70 ? "#f59e0b" : "#ef4444";

const statusStyle: Record<string, { bg: string; color: string }> = {
  Selesai: { bg: "#14532d", color: "#4ade80" },
  Proses:  { bg: "#78350f", color: "#fbbf24" },
  Belum:   { bg: "#7f1d1d", color: "#f87171" },
};

const Avatar = ({ inits, haid }: { inits: string; haid?: boolean }) => (
  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
    style={{ background: haid ? "linear-gradient(135deg,#be185d,#9d174d)" : "linear-gradient(135deg,#10b981,#0d9488)", color: "white" }}>
    {inits}
  </div>
);

type Tab = "daftar" | "rekap" | "haid";

export function Web() {
  const [tab, setTab] = useState<Tab>("daftar");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  const sudahIsi  = students.filter(s => s.status === "Selesai").length;
  const proses    = students.filter(s => s.status === "Proses").length;
  const belum     = students.filter(s => s.status === "Belum").length;
  const avgScore  = Math.round(students.filter(s => s.score > 0).reduce((a, s) => a + s.score, 0) / students.filter(s => s.score > 0).length) || 0;
  const haidCount = haidData.filter(h => h.status === "haid").length;

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === "semua" || s.status.toLowerCase() === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen font-sans" style={{ background: C.pageBg, color: "white" }}>
      {/* ── HEADER ── */}
      <header style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>BLP</div>
            <div>
              <div className="font-bold text-base leading-tight">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA Islamic School • Wali Kelas</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <Bell className="w-5 h-5" style={{ color: C.muted }} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                style={{ background: "linear-gradient(135deg,#10b981,#0d9488)", color: "white" }}>SD</div>
              <div>
                <div className="text-sm font-semibold leading-none">Siti Dewi</div>
                <div className="text-xs mt-0.5" style={{ color: C.muted }}>VII Ibn Batuttah</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: C.muted }} />
            </div>
            <button className="p-2 rounded-lg transition" style={{ color: C.muted, background: C.cardBg, border: `1px solid ${C.border}` }}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {([
            { id: "daftar", icon: Users,    label: "Daftar Siswa"       },
            { id: "rekap",  icon: BarChart3, label: "Rekap Nilai"       },
            { id: "haid",   icon: Heart,    label: "Haid Siswi", badge: haidCount },
          ] as { id: Tab; icon: typeof Users; label: string; badge?: number }[]).map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all"
              style={tab === id
                ? { background: C.cardBg, color: "white", borderTop: `2px solid ${C.accent}`, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }
                : { color: C.muted }}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge ? (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">{badge}</span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-5">

        {/* ── TAB: DAFTAR SISWA ── */}
        {tab === "daftar" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              {[
                { label: "Total Siswa",    value: students.length, sub: "VII Ibn Batuttah",  icon: Users,        iconBg: "#14532d", iconColor: "#4ade80" },
                { label: "Selesai Mengisi",value: sudahIsi,         sub: `${Math.round(sudahIsi/students.length*100)}% dari total`, icon: CheckCircle2, iconBg: "#134e4a", iconColor: "#2dd4bf" },
                { label: "Rata-rata Skor", value: avgScore,         sub: "Skor tertinggi: 96", icon: TrendingUp,  iconBg: "#3b3210", iconColor: "#fbbf24" },
                { label: "Belum Mengisi",  value: belum,            sub: "Perlu diingatkan",  icon: Bell,        iconBg: "#7f1d1d", iconColor: "#f87171" },
              ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl font-bold leading-none">{value}</div>
                      <div className="text-sm mt-1 font-medium" style={{ color: C.muted }}>{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.dim }}>{sub}</div>
                    </div>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                      <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              {/* Toolbar */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex-1">
                  <div className="font-semibold">Daftar Siswa Hari Ini</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>Sabtu, 2 Agustus 2026</div>
                </div>
                {/* Date nav */}
                <div className="flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: C.rowBg, border: `1px solid ${C.border}` }}>
                  <button style={{ color: C.muted }}><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-medium px-2 whitespace-nowrap">2 Agt 2026</span>
                  <button style={{ color: C.muted }}><ChevronRight className="w-4 h-4" /></button>
                </div>
                {/* Filter */}
                <div className="flex gap-1">
                  {["semua", "selesai", "proses", "belum"].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition"
                      style={filterStatus === f
                        ? { background: C.accent, color: "white" }
                        : { background: C.rowBg, color: C.muted, border: `1px solid ${C.border}` }}>
                      {f}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                  <input
                    className="pl-9 pr-4 py-2 text-sm rounded-lg w-52 focus:outline-none"
                    placeholder="Cari nama siswa..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ background: C.rowBg, border: `1px solid ${C.border}`, color: "white" }}
                  />
                </div>
                {/* Export */}
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1e40af" }}>
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Column headers */}
              <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.dim, borderBottom: `1px solid ${C.border}`, gridTemplateColumns: "2.5fr 1.5fr 0.7fr 0.8fr 0.9fr" }}>
                <span>NAMA SISWA</span>
                <span>PROGRES BULAN INI</span>
                <span className="text-center">SKOR</span>
                <span className="text-center">STATUS</span>
                <span className="text-center">AKSI</span>
              </div>

              {/* Rows */}
              {filtered.map((s, i) => (
                <div
                  key={s.id}
                  className="grid px-5 py-3 items-center"
                  style={{
                    gridTemplateColumns: "2.5fr 1.5fr 0.7fr 0.8fr 0.9fr",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                    background: i % 2 === 0 ? C.cardBg : C.rowBg,
                  }}
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <Avatar inits={s.inits} />
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {s.name}
                        {s.female && <Heart className="w-3 h-3 text-rose-400 inline" />}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: C.muted }}>{s.kelas}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1" style={{ color: C.muted }}>
                      <span>{s.progress} dari {s.total} hari</span>
                      <span>{Math.round(s.progress / s.total * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "#1e3a2a" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${(s.progress / s.total) * 100}%`,
                          background: s.progress === s.total ? "#10b981" : s.progress > 10 ? "#f59e0b" : "#ef4444"
                        }} />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <span className="font-bold text-lg" style={{ color: scoreColor(s.score) }}>
                      {s.score || "–"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={statusStyle[s.status]}>
                      {s.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button className="p-1.5 rounded-lg transition" style={{ background: "#1e3a5f" }}>
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button className="p-1.5 rounded-lg transition" style={{ background: "#134e3a" }}>
                      <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                    </button>
                    {s.female && (
                      <button className="p-1.5 rounded-lg transition" style={{ background: "#4a1028" }}>
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Table footer */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
                <span className="text-xs" style={{ color: C.muted }}>
                  Menampilkan {filtered.length} dari {students.length} siswa
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(p => (
                    <button key={p} className="w-8 h-8 rounded-lg text-xs font-medium transition"
                      style={p === 1
                        ? { background: C.accent, color: "white" }
                        : { background: C.rowBg, color: C.muted, border: `1px solid ${C.border}` }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB: REKAP NILAI ── */}
        {tab === "rekap" && (
          <>
            {/* Month selector + export */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                <button style={{ color: C.muted }}><ChevronLeft className="w-4 h-4" /></button>
                <div className="text-center px-2">
                  <div className="font-semibold">Agustus 2026</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>Rekap Bulanan</div>
                </div>
                <button style={{ color: C.muted }}><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#1e3a5f", color: "#60a5fa", border: "1px solid #1e40af" }}>
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: C.cardBg, color: C.muted, border: `1px solid ${C.border}` }}>
                  <Printer className="w-4 h-4" />
                  Cetak
                </button>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 mb-5">
              {[
                { label: "Rata-rata Kelas",  value: `${avgScore}`,                  icon: TrendingUp,   iconBg: "#134e4a", iconColor: "#2dd4bf" },
                { label: "Skor Tertinggi",   value: "96",                            icon: Star,         iconBg: "#3b3210", iconColor: "#fbbf24" },
                { label: "Aktif Mengisi",    value: `${sudahIsi + proses}`,          icon: CheckCircle2, iconBg: "#14532d", iconColor: "#4ade80" },
                { label: "Tidak Aktif",      value: `${belum}`,                      icon: AlertCircle,  iconBg: "#7f1d1d", iconColor: "#f87171" },
              ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl font-bold leading-none">{value}</div>
                      <div className="text-sm mt-1" style={{ color: C.muted }}>{label}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                      <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score distribution chart */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="font-semibold mb-4">Distribusi Skor Siswa</div>
              <div className="flex items-end gap-2 h-24">
                {[
                  { range: "<50",   count: 2, color: "#ef4444" },
                  { range: "50–59", count: 1, color: "#f97316" },
                  { range: "60–69", count: 1, color: "#f59e0b" },
                  { range: "70–79", count: 2, color: "#eab308" },
                  { range: "80–89", count: 3, color: "#84cc16" },
                  { range: "90–100",count: 3, color: "#22c55e" },
                ].map(({ range, count, color }) => (
                  <div key={range} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold" style={{ color }}>{count}</span>
                    <div className="w-full rounded-t-md" style={{ height: `${(count / 4) * 80}px`, background: color, opacity: 0.85 }} />
                    <span className="text-[10px]" style={{ color: C.dim }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recap table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-4 font-semibold" style={{ borderBottom: `1px solid ${C.border}` }}>
                Rekap Per Siswa — Agustus 2026
              </div>
              <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.dim, borderBottom: `1px solid ${C.border}`, gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 1fr 1fr 0.6fr" }}>
                <span>NAMA SISWA</span>
                <span className="text-center">RATA-RATA</span>
                <span className="text-center">TERBAIK</span>
                <span className="text-center">HARI ISI</span>
                <span className="text-center">DEVOUT</span>
                <span className="text-center">RESILIENCE</span>
                <span className="text-center">TREND</span>
              </div>
              {recap.map((s, i) => (
                <div key={s.id} className="grid px-5 py-3 items-center"
                  style={{ gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 1fr 1fr 0.6fr", borderBottom: i < recap.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? C.cardBg : C.rowBg }}>
                  <div className="flex items-center gap-3">
                    <Avatar inits={s.inits} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <div className="text-center font-bold" style={{ color: scoreColor(s.avg) }}>{s.avg || "–"}</div>
                  <div className="text-center font-bold text-emerald-400">{s.best || "–"}</div>
                  <div className="text-center text-sm">{s.days}</div>
                  {/* Devout mini bar */}
                  <div className="px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e3a2a" }}>
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${s.devout}%` }} />
                      </div>
                      <span className="text-xs w-6 text-right" style={{ color: C.muted }}>{s.devout || "–"}</span>
                    </div>
                  </div>
                  {/* Resilience mini bar */}
                  <div className="px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1e3a2a" }}>
                        <div className="h-full rounded-full bg-sky-400" style={{ width: `${s.resilience}%` }} />
                      </div>
                      <span className="text-xs w-6 text-right" style={{ color: C.muted }}>{s.resilience || "–"}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-base font-bold"
                      style={{ color: s.trend === "up" ? "#4ade80" : s.trend === "down" ? "#f87171" : "#fbbf24" }}>
                      {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TAB: HAID SISWI ── */}
        {tab === "haid" && (
          <>
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl p-4 mb-5" style={{ background: "#1a0a12", border: "1px solid #5c1a36" }}>
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-rose-300 text-sm">Catatan Penting</div>
                <div className="text-sm mt-1" style={{ color: "#fca5a5" }}>
                  Siswi yang sedang haid tidak diwajibkan memenuhi amaliyah sholat. Skor sholat harian mereka tidak dihitung selama periode haid berlangsung.
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Siswi", value: haidData.length, color: "#4ade80",  bg: "#14532d" },
                { label: "Sedang Haid", value: haidCount,       color: "#fda4af",  bg: "#5c1a36" },
                { label: "Normal",      value: haidData.length - haidCount, color: "#2dd4bf", bg: "#134e4a" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-2xl p-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
                  <div className="text-3xl font-bold" style={{ color }}>{value}</div>
                  <div className="text-sm mt-1" style={{ color: C.muted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div className="font-semibold">Data Haid Siswi</div>
                  <div className="text-xs mt-0.5" style={{ color: C.muted }}>VII Ibn Batuttah • Agustus 2026</div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: "#5c1a36", color: "#fda4af", border: "1px solid #7f1d45" }}>
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.dim, borderBottom: `1px solid ${C.border}`, gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 1fr" }}>
                <span>NAMA SISWI</span>
                <span className="text-center">STATUS</span>
                <span className="text-center">MULAI</span>
                <span>KETERANGAN</span>
                <span className="text-center">AKSI</span>
              </div>

              {haidData.map((s, i) => (
                <div key={s.id} className="grid px-5 py-3.5 items-center"
                  style={{
                    gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 1fr",
                    borderBottom: i < haidData.length - 1 ? `1px solid ${C.border}` : "none",
                    background: s.status === "haid" ? "#160810" : i % 2 === 0 ? C.cardBg : C.rowBg,
                  }}>
                  <div className="flex items-center gap-3">
                    <Avatar inits={s.inits} haid={s.status === "haid"} />
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.muted }}>VII Ibn Batuttah</div>
                    </div>
                  </div>
                  <div className="text-center">
                    {s.status === "haid" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#7f1d45", color: "#fda4af" }}>
                        Sedang Haid
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#14532d", color: "#4ade80" }}>
                        Normal
                      </span>
                    )}
                  </div>
                  <div className="text-center text-sm" style={{ color: s.since ? "#fca5a5" : C.dim }}>
                    {s.since ?? "–"}
                  </div>
                  <div className="text-sm" style={{ color: s.notes ? "#fca5a5" : C.dim }}>
                    {s.notes || "Tidak ada catatan"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {s.status === "haid" ? (
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition" style={{ background: "#14532d", color: "#4ade80" }}>
                        Tandai Selesai
                      </button>
                    ) : (
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition" style={{ background: "#5c0f3b", color: "#fda4af" }}>
                        Mulai Haid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
