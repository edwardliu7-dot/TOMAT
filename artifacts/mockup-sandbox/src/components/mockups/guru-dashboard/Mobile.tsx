import {
  Users, BarChart3, Heart, Bell, LogOut, Search,
  Eye, MessageCircle, Mail, Trash2, ChevronLeft,
  ChevronRight, TrendingUp, CheckCircle2,
} from "lucide-react";

const C = {
  pageBg:  "#0d2018",
  navBg:   "#162c1f",
  cardBg:  "#1a3028",
  rowBg:   "#1c2e24",
  itemBg:  "#1c2838",
  border:  "#2a4535",
  muted:   "#6aaa82",
  dimText: "#4a7a5a",
};

const students = [
  { name: "Airlangga Yusuf Tuanah Putra", kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum"   },
  { name: "Alif Syahrin Mubarok",          kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum"   },
  { name: "Alisya Nadhira Andarestia",      kelas: "VII Ibnu Batuttah", progress: 0, total: 22, score: 0,  status: "Belum"   },
  { name: "Aqila Resyia Sunandar",          kelas: "VII Ibnu Batuttah", progress: 4, total: 22, score: 73, status: "Proses"  },
  { name: "Fatimah Zahrin Hishasha",        kelas: "VII Ibnu Batuttah", progress: 8, total: 22, score: 87, status: "Selesai" },
];

const scoreColor = (s: number) =>
  s === 0 ? "#ef4444" : s >= 85 ? "#22c55e" : "#f59e0b";

const statusStyle: Record<string, { bg: string; color: string }> = {
  Selesai: { bg: "#14532d", color: "#4ade80" },
  Proses:  { bg: "#78350f", color: "#fbbf24" },
  Belum:   { bg: "#7f1d1d", color: "#f87171" },
};

export function Mobile() {
  return (
    <div className="min-h-screen font-sans max-w-sm mx-auto flex flex-col" style={{ background: C.pageBg, color: "white" }}>
      {/* Status bar */}
      <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs" style={{ background: C.navBg }}>
        <span>09:41</span>
        <span>▂▄▆ ✦ 🔋</span>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-0" style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm">B</div>
            <div>
              <div className="font-bold text-sm">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">SD</div>
            <button style={{ color: C.muted }}><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {[
            { icon: Users,    label: "Daftar Siswa", active: true  },
            { icon: BarChart3, label: "Rekap Nilai", active: false },
            { icon: Heart,    label: "Haid Siswi",   active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-t-lg flex-1 justify-center"
              style={active ? { background: "white", color: "#1a3028" } : { color: C.muted }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-2">
        {[
          { label: "Total Siswa",    value: "21", icon: Users,        iconBg: "#14532d", iconColor: "#4ade80" },
          { label: "Sudah Isi",      value: "0",  icon: CheckCircle2, iconBg: "#134e4a", iconColor: "#2dd4bf" },
          { label: "Rata-rata Skor", value: "0.0",icon: TrendingUp,   iconBg: "#78350f", iconColor: "#fbbf24" },
          { label: "Belum Isi",      value: "21", icon: Bell,         iconBg: "#7f1d1d", iconColor: "#f87171" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
              <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">{value}</div>
              <div className="text-xs mt-0.5" style={{ color: C.muted }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Date nav + search */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2 rounded-xl px-3 py-2" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
          <button style={{ color: C.muted }}><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium">Min, 2 Agt 2026</span>
          <button style={{ color: C.muted }}><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none"
            placeholder="Cari nama siswa..."
            style={{ background: C.cardBg, border: `1px solid ${C.border}`, color: "white" }}
          />
        </div>
      </div>

      {/* Student list */}
      <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: C.dimText }}>Daftar Siswa</div>
        {students.map((s) => (
          <div key={s.name} className="rounded-2xl p-3.5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold truncate text-white">{s.name}</span>
                  <span className="font-bold text-base ml-2 flex-shrink-0" style={{ color: scoreColor(s.score) }}>{s.score}</span>
                </div>
                <div className="text-xs mb-1.5" style={{ color: C.muted }}>{s.kelas}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#2a4535" }}>
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s.progress / s.total) * 100}%` }} />
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: C.muted }}>{s.progress}/{s.total}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" style={statusStyle[s.status]}>
                    {s.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2.5 justify-end">
              <button className="p-1.5 rounded-lg" style={{ background: "#1e3a5f" }}><Eye className="w-3.5 h-3.5 text-blue-400" /></button>
              <button className="p-1.5 rounded-lg" style={{ background: "#134e3a" }}><MessageCircle className="w-3.5 h-3.5 text-teal-400" /></button>
              <button className="p-1.5 rounded-lg" style={{ background: "#14401a" }}><Mail className="w-3.5 h-3.5 text-green-400" /></button>
              <button className="p-1.5 rounded-lg" style={{ background: "#4a1010" }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-around px-6 py-3" style={{ background: C.navBg, borderTop: `1px solid ${C.border}` }}>
        {[
          { icon: Users,    label: "Siswa",  active: true  },
          { icon: BarChart3,label: "Rekap",  active: false },
          { icon: Bell,     label: "Notif",  active: false },
          { icon: LogOut,   label: "Keluar", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} className="flex flex-col items-center gap-0.5 py-0.5"
            style={{ color: active ? "#4ade80" : C.muted }}>
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
