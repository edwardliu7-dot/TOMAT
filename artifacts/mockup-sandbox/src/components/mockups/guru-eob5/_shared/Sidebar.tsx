import {
  LayoutDashboard, FolderOpen, Users, BookOpen, ClipboardCheck,
  GraduationCap, Star, BarChart3, ListChecks, Sparkles, FileText,
  CalendarDays, CalendarRange, ShieldCheck, PieChart, Contact,
  Megaphone, ClipboardList, KeyRound, Inbox, Settings2, CalendarClock,
  LogOut, Bell, ChevronRight,
} from "lucide-react";
import { useState } from "react";

export const NAV = [
  { group: "Utama", items: [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "administrasi", icon: FolderOpen, label: "Administrasi" },
    { id: "jadwal", icon: CalendarDays, label: "Jadwal Pelajaran" },
    { id: "jurnal", icon: BookOpen, label: "Jurnal Mengajar" },
    { id: "absensi", icon: ClipboardCheck, label: "Absensi" },
    { id: "nilai", icon: GraduationCap, label: "Nilai" },
    { id: "poin", icon: Star, label: "Poin Siswa" },
    { id: "prosem", icon: ListChecks, label: "Program Semester" },
    { id: "info-pekanan", icon: CalendarRange, label: "Info Pekanan" },
    { id: "soal-otomatis", icon: Sparkles, label: "Soal Otomatis" },
    { id: "modul-ajar", icon: FileText, label: "Modul Ajar" },
    { id: "rekap", icon: BarChart3, label: "Rekap & Analitik" },
  ]},
  { group: "Jabatan", items: [
    { id: "kepsek", icon: ShieldCheck, label: "Kepala Sekolah" },
    { id: "kurikulum", icon: PieChart, label: "Kurikulum" },
    { id: "kesiswaan", icon: Users, label: "Kesiswaan" },
    { id: "walikelas", icon: Contact, label: "Wali Kelas" },
  ]},
  { group: "Admin", items: [
    { id: "guru", icon: Megaphone, label: "Manajemen Guru" },
    { id: "akun-siswa", icon: KeyRound, label: "Akun Siswa" },
    { id: "kalender", icon: CalendarClock, label: "Kalender Akademik" },
    { id: "direktori", icon: Megaphone, label: "Direktori Guru" },
    { id: "direktori-siswa", icon: ClipboardList, label: "Direktori Siswa" },
    { id: "kotak-masuk", icon: Inbox, label: "Kotak Masuk" },
    { id: "pengaturan", icon: Settings2, label: "Pengaturan" },
  ]},
];

export function AppSidebar({ active }: { active: string }) {
  return (
    <aside className="w-[240px] shrink-0 h-screen bg-[#0f1c36] flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">GuruEOB5</div>
          <div className="text-[10px] text-white/40">SMARTISA · Guru</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV.map((g) => (
          <div key={g.group} className="mb-3">
            <div className="px-2 text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">{g.group}</div>
            {g.items.map(({ id, icon: Icon, label }) => (
              <button key={id} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors
                ${active === id ? "bg-blue-600 text-white" : "text-white/55 hover:text-white hover:bg-white/10"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">PB</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">Pak Budi</div>
            <div className="text-[10px] text-white/40">Guru · Matematika</div>
          </div>
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="w-4 h-4" /><span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export function TopBar({ title, badge }: { title: string; badge?: number }) {
  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">SMARTISA</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-xs text-slate-700 font-semibold">{title}</span>
      </div>
      <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
        <Bell className="w-5 h-5" />
        {badge != null && badge > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>
    </div>
  );
}

export function PageShell({ active, title, badge, children }: { active: string; title: string; badge?: number; children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#faf9f7] overflow-hidden">
      <AppSidebar active={active} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} badge={badge} />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
