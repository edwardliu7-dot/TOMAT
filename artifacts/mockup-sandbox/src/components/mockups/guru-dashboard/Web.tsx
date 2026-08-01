import {
  Users, BarChart3, Heart, Bell, LogOut, Search,
  Eye, MessageCircle, Mail, Trash2, ChevronLeft,
  ChevronRight, TrendingUp, CheckCircle2, Download,
  FileSpreadsheet, Presentation,
} from "lucide-react";

const C = {
  pageBg:   "#0d2018",
  navBg:    "#162c1f",
  cardBg:   "#1a3028",
  rowBg:    "#1c2e24",
  itemBg:   "#1c2838",
  border:   "#2a4535",
  muted:    "#6aaa82",
  dimText:  "#4a7a5a",
};

const students = [
  { name: "Airlangga Yusuf Tuanah Putra", kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum" },
  { name: "Alif Syahrin Mubarok",          kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum" },
  { name: "Alisya Nadhira Andarestia",      kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum" },
  { name: "Aqila Resyia Sunandar",          kelas: "VII Ibnu Batuttah", progress: 4, total: 22, score: 73, status: "Proses" },
  { name: "Fatimah Zahrin Hishasha",        kelas: "VII Ibnu Batuttah", progress: 8, total: 22, score: 87, status: "Selesai" },
  { name: "Ghania Khairunnisa Putri",       kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum" },
];

const scoreColor = (s: number) =>
  s === 0 ? "#ef4444" : s >= 85 ? "#22c55e" : s >= 70 ? "#f59e0b" : "#ef4444";

const statusStyle: Record<string, { bg: string; color: string }> = {
  Selesai: { bg: "#14532d", color: "#4ade80" },
  Proses:  { bg: "#78350f", color: "#fbbf24" },
  Belum:   { bg: "#7f1d1d", color: "#f87171" },
};

const recap = [
  { name: "Airlangga Yusuf Tuanah...", kelas: "VII Ibnu Batuttah", avg: 62,  days: 1 },
  { name: "Alif Syahrin Mubarok",      kelas: "VII Ibnu Batuttah", avg: 38,  days: 1 },
  { name: "Alisya Nadhira Andares...", kelas: "VII Ibnu Batuttah", avg: 71,  days: 1 },
  { name: "Aqila Resyia Sunandar",     kelas: "VII Ibnu Batuttah", avg: 90,  days: 1 },
  { name: "Fatimah Zahrin Hishasha",   kelas: "VII Ibnu Batuttah", avg: 84,  days: 1 },
];

const haidSiswi = [
  { name: "Alisya Nadhira Andarestia", kelas: "VII Ibnu Batuttah", status: "Tidak sedang haid" },
  { name: "Aqila Resyia Sunandar",     kelas: "VII Ibnu Batuttah", status: "Tidak sedang haid" },
  { name: "Fatimah Zahrin Hishasha Dama Putra", kelas: "VII Ibnu Batuttah", status: "Tidak sedang haid" },
];

type Tab = "daftar" | "rekap" | "haid";
const activeTab: Tab = "daftar";

export function Web() {
  return (
    <div className="min-h-screen font-sans" style={{ background: C.pageBg, color: "white" }}>
      {/* Header */}
      <header style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">B</div>
            <div>
              <div className="font-bold text-base leading-tight">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA Islamic School</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">SD</div>
            </div>
            <button style={{ color: C.muted }} className="p-1.5"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-0">
          {[
            { id: "daftar", icon: Users,      label: "Daftar Siswa" },
            { id: "rekap",  icon: BarChart3,  label: "Rekap Nilai"  },
            { id: "haid",   icon: Heart,      label: "Haid Siswi"   },
          ].map(({ id, icon: Icon, label }) => {
            const active = id === activeTab;
            return (
              <button
                key={id}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition"
                style={active
                  ? { background: "white", color: "#1a3028", borderBottom: "none" }
                  : { color: C.muted }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: "Total Siswa",   value: "21", sub: "VII Ibnu Batuttah", icon: Users,         iconBg: "#14532d", iconColor: "#4ade80" },
            { label: "Sudah Isi",     value: "0",  sub: "0% dari total",     icon: CheckCircle2,  iconBg: "#134e4a", iconColor: "#2dd4bf" },
            { label: "Rata-rata Skor",value: "0.0",sub: "2 Agt 2026",        icon: TrendingUp,    iconBg: "#78350f", iconColor: "#fbbf24" },
            { label: "Belum Isi",     value: "21", sub: "Perlu diingatkan",  icon: Bell,          iconBg: "#7f1d1d", iconColor: "#f87171" },
          ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-sm mt-0.5" style={{ color: C.muted }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.dimText }}>{sub}</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
          {/* Table header row */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex-1">
              <div className="font-semibold">Daftar Siswa</div>
              <div className="text-xs mt-0.5" style={{ color: C.muted }}>21 Siswa Terdaftar</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ background: "#162c1f", color: C.muted, border: `1px solid ${C.border}` }}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-medium px-2">Min, 2 Agt 2026</span>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm" style={{ background: "#162c1f", color: C.muted, border: `1px solid ${C.border}` }}>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input
                className="pl-9 pr-4 py-2 text-sm rounded-lg w-48 focus:outline-none"
                placeholder="Cari nama siswa..."
                style={{ background: "#162c1f", border: `1px solid ${C.border}`, color: "white" }}
              />
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white">
              <BarChart3 className="w-4 h-4" />
              Rekap
            </button>
          </div>

          {/* Column headers */}
          <div className="grid px-5 py-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: C.dimText, borderBottom: `1px solid ${C.border}`, gridTemplateColumns: "2fr 1.5fr 0.8fr 0.8fr 1fr" }}>
            <span>NAMA SISWA</span>
            <span>PROGRES</span>
            <span className="text-center">SKOR</span>
            <span className="text-center">STATUS</span>
            <span className="text-center">AKSI</span>
          </div>

          {/* Rows */}
          {students.map((s, i) => (
            <div
              key={s.name}
              className="grid px-5 py-3.5 items-center transition"
              style={{
                gridTemplateColumns: "2fr 1.5fr 0.8fr 0.8fr 1fr",
                borderBottom: i < students.length - 1 ? `1px solid ${C.border}` : "none",
                background: i % 2 === 0 ? C.cardBg : C.rowBg,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-white truncate max-w-[180px]">{s.name}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{s.kelas}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs" style={{ color: C.muted }}>
                  <span>{s.progress}/{s.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2a4535" }}>
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s.progress / s.total) * 100}%` }} />
                </div>
              </div>
              <div className="text-center font-bold text-base" style={{ color: scoreColor(s.score) }}>{s.score}</div>
              <div className="text-center">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={statusStyle[s.status]}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button className="p-1.5 rounded-lg" style={{ background: "#1e3a5f" }}><Eye className="w-3.5 h-3.5 text-blue-400" /></button>
                <button className="p-1.5 rounded-lg" style={{ background: "#134e3a" }}><MessageCircle className="w-3.5 h-3.5 text-teal-400" /></button>
                <button className="p-1.5 rounded-lg" style={{ background: "#14401a" }}><Mail className="w-3.5 h-3.5 text-green-400" /></button>
                <button className="p-1.5 rounded-lg" style={{ background: "#4a1010" }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-5 py-3 text-xs flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}>
            <span>Menampilkan 6 dari 21 siswa</span>
            <div className="flex gap-1">
              {[1,2,3].map(p => (
                <button key={p} className="w-7 h-7 rounded-md text-xs font-medium"
                  style={p === 1 ? { background: "#10b981", color: "white" } : { background: "#162c1f", color: C.muted, border: `1px solid ${C.border}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
