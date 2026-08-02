import { useState } from "react";
import {
  LayoutDashboard, FolderOpen, Users, BookOpen, ClipboardCheck,
  GraduationCap, Star, BarChart3, ClipboardList, ShieldCheck,
  CalendarDays, CalendarRange, Megaphone, Sparkles, ListChecks,
  KeyRound, Inbox, Settings2, Contact, CalendarClock, PieChart,
  LogOut, TrendingUp, Calendar, Clock, FileText, ChevronRight,
  AlertTriangle, Bell,
} from "lucide-react";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", active: true },
      { icon: FolderOpen, label: "Administrasi" },
      { icon: CalendarDays, label: "Jadwal Pelajaran" },
      { icon: BookOpen, label: "Jurnal Mengajar" },
      { icon: ClipboardCheck, label: "Absensi" },
      { icon: GraduationCap, label: "Nilai" },
      { icon: Star, label: "Poin Siswa" },
      { icon: ListChecks, label: "Program Semester" },
      { icon: CalendarRange, label: "Info Pekanan" },
      { icon: Sparkles, label: "Soal Otomatis" },
      { icon: BookOpen, label: "Modul Ajar" },
      { icon: BarChart3, label: "Rekap & Analitik" },
    ],
  },
  {
    label: "Jabatan",
    items: [
      { icon: ShieldCheck, label: "Kepala Sekolah" },
      { icon: PieChart, label: "Kurikulum" },
      { icon: Users, label: "Kesiswaan" },
      { icon: Contact, label: "Wali Kelas" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: Users, label: "Manajemen Guru" },
      { icon: KeyRound, label: "Akun Siswa" },
      { icon: CalendarClock, label: "Kalender Akademik" },
      { icon: Megaphone, label: "Direktori Guru" },
      { icon: ClipboardList, label: "Direktori Siswa" },
      { icon: Inbox, label: "Kotak Masuk" },
      { icon: Settings2, label: "Pengaturan" },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 h-screen bg-[#0f1c36] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none">GuruEOB5</div>
            <div className="text-[10px] text-white/50 mt-0.5">SMARTISA</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">
              {g.label}
            </div>
            {g.items.map(({ icon: Icon, label, active }: any) => (
              <button
                key={label}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5
                  ${active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 mb-2 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            PB
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">Pak Budi</div>
            <div className="text-[10px] text-white/40 truncate">Guru · Mat</div>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { iconBg: string; iconText: string; bar: string }> = {
  blue:    { iconBg: "bg-blue-100",    iconText: "text-blue-600",    bar: "bg-blue-500" },
  violet:  { iconBg: "bg-violet-100",  iconText: "text-violet-600",  bar: "bg-violet-500" },
  amber:   { iconBg: "bg-amber-100",   iconText: "text-amber-600",   bar: "bg-amber-500" },
  emerald: { iconBg: "bg-emerald-100", iconText: "text-emerald-600", bar: "bg-emerald-500" },
};

function StatCard({ title, value, color, icon, progress }: any) {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconText}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">{title}</div>
        <div className="text-3xl font-black text-slate-800">{value}</div>
      </div>
      <div className="h-1 absolute bottom-0 left-0 right-0 bg-slate-100">
        <div className={`h-full ${c.bar}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
const CHART_DATA = [
  { minggu: "Mg 1", jumlah: 4 },
  { minggu: "Mg 2", jumlah: 7 },
  { minggu: "Mg 3", jumlah: 5 },
  { minggu: "Mg 4", jumlah: 9 },
  { minggu: "Mg 5", jumlah: 9 },
];

function BarChart() {
  const max = Math.max(...CHART_DATA.map((d) => d.jumlah), 1);
  return (
    <div className="h-44 flex items-end gap-4 mt-6 pb-2 px-2">
      {CHART_DATA.map((d, i) => {
        const pct = (d.jumlah / max) * 100;
        const isFull = pct >= 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="w-full bg-slate-100 rounded-t-lg relative h-full flex items-end overflow-hidden">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${isFull ? "bg-slate-800" : "bg-slate-300"}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-500">{d.minggu}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Task item ─────────────────────────────────────────────────────────────────
function TaskItem({ icon, color, title, desc, time, href = "#" }: any) {
  const colorMap: Record<string, string> = {
    amber:   "bg-amber-100 text-amber-600",
    violet:  "bg-violet-100 text-violet-600",
    blue:    "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
        <span className="text-[11px] font-medium text-slate-400 mt-1 block">{time}</span>
      </div>
      <button className="text-xs font-bold text-slate-600 border border-slate-200 rounded-full px-3.5 py-1.5 hover:bg-slate-100 transition-colors">
        Tinjau
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function Dashboard() {
  return (
    <div className="flex h-screen bg-[#faf9f7] overflow-hidden">
      <Sidebar />

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between gap-2 px-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">SMARTISA</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-slate-600 font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              PB
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">

            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800">
                Selamat pagi, <span className="text-blue-600">Pak Budi</span> 👋
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Senin, 4 Agustus 2026 · SMP TISA Islamic School
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Siswa"    value={87}  color="blue"    icon={<Users className="w-5 h-5" />}         progress={87} />
              <StatCard title="Jurnal Bulan Ini" value={18} color="emerald" icon={<BookOpen className="w-5 h-5" />}    progress={75} />
              <StatCard title="Hadir Hari Ini" value={24}  color="violet"  icon={<ClipboardCheck className="w-5 h-5" />} progress={92} />
              <StatCard title="Dokumen"        value={12}  color="amber"   icon={<FileText className="w-5 h-5" />}      progress={48} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Jurnal progress chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Jurnal Mengajar</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Target 18 JP/minggu · Bulan Juli 2026</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                    75% tercapai
                  </span>
                </div>
                <BarChart />
              </div>

              {/* Tugas hari ini */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-800">Tugas Hari Ini</h2>
                </div>
                <div className="space-y-1">
                  <TaskItem icon={<BookOpen className="w-4 h-4" />} color="blue" title="Isi Jurnal" desc="Kelas VIII Ibnu Sina · Matematika" time="08:00" />
                  <TaskItem icon={<ClipboardCheck className="w-4 h-4" />} color="emerald" title="Absensi" desc="Kelas VIII Ibnu Sina" time="Sekarang" />
                  <TaskItem icon={<TrendingUp className="w-4 h-4" />} color="violet" title="Input Nilai" desc="Sumatif Tengah · 27 siswa" time="12:00" />
                </div>
              </div>

            </div>

            {/* Recent journals */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Jurnal Terbaru</h2>
                <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { mapel: "Matematika", kelas: "VIII Ibnu Sina", materi: "Teorema Pythagoras — Pembuktian", tanggal: "4 Agt 2026", hadir: 27 },
                  { mapel: "Matematika", kelas: "VII Ibnu Batuttah", materi: "Bilangan Bulat dan Operasinya", tanggal: "3 Agt 2026", hadir: 25 },
                  { mapel: "Matematika", kelas: "IX Al Khawarizmi", materi: "Transformasi Geometri — Refleksi", tanggal: "2 Agt 2026", hadir: 26 },
                ].map((j, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-800">{j.mapel}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold">{j.kelas}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{j.materi}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">{j.tanggal}</div>
                      <div className="text-[10px] font-bold text-emerald-600 mt-0.5">{j.hadir} hadir</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
