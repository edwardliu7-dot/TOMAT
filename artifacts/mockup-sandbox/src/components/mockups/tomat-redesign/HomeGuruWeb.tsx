import React, { useState, useEffect } from "react";
import { Bell, Home, BookOpen, ClipboardList, BarChart2, Users, User, ChevronRight, Clock, Zap, CheckCircle2, Swords, Trophy, Lock, Settings, LogOut, Shield } from "lucide-react";

const GURU_NAV = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: ClipboardList, label: "Tugas", active: false },
  { icon: Users, label: "Pantau Kelas", active: false },
  { icon: BarChart2, label: "Nilai Siswa", active: false },
  { icon: BookOpen, label: "Hafalan", active: false },
  { icon: Zap, label: "Insight Siswa", active: false },
  { icon: Swords, label: "Boss Raid", active: false },
  { icon: Trophy, label: "Turnamen", active: false },
  { icon: Lock, label: "Kunci Bab", active: false },
];

export default function HomeGuruWeb() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2600);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-[15%] top-[25%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[160px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 flex w-[220px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/80 backdrop-blur-xl shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
                <div className="rounded-md bg-indigo-400/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-indigo-300">Guru</div>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="mb-3 mt-1 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Menu Guru</div>
          {GURU_NAV.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[12px] font-bold transition-all cursor-pointer ${
                item.active
                  ? "bg-indigo-500/[0.12] text-indigo-300 ring-1 ring-indigo-500/20"
                  : "text-[#4B6480] hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="p-3 mt-auto border-t border-indigo-500/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] hover:bg-white/[0.03] cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[12px] font-black text-white shrink-0">BS</div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[12px] font-bold text-white">Bu Sari</div>
              <div className="truncate text-[10px] text-[#4B6480]">Guru Matematika</div>
            </div>
            <button className="text-[#4B6480] hover:text-red-400 transition-colors shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-indigo-500/[0.06] bg-[#071321]/80 px-8 backdrop-blur-xl">
          <div>
            <h1 className="text-[20px] font-black">Selamat pagi, Bu Sari! 👩‍🏫</h1>
            <p className="text-[11px] text-[#4B6480]">Senin, 26 Juli 2026 · Semester Ganjil</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/15 bg-indigo-500/[0.05] hover:bg-indigo-500/10 transition-colors">
              <Bell size={18} className="text-indigo-300" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-8 pb-24">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              { emoji: "🎓", label: "Total Siswa", val: "28", sub: "IX Al Khawarizmi", color: "border-indigo-500/15 bg-indigo-500/[0.05]" },
              { emoji: "📊", label: "Rata-rata Nilai", val: "82", sub: "Semester Ganjil", color: "border-yellow-400/15 bg-yellow-400/[0.05]" },
              { emoji: "✅", label: "Siswa Aktif", val: "24", sub: "Hari ini", color: "border-emerald-400/15 bg-emerald-400/[0.05]" },
              { emoji: "📋", label: "Tugas Menunggu", val: "12", sub: "Belum dinilai", color: "border-orange-400/15 bg-orange-400/[0.05]" },
            ].map((s, i) => (
              <div key={i} className={`rounded-[20px] border ${s.color} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[24px]">{s.emoji}</span>
                </div>
                <div className="text-[28px] font-black text-white">{s.val}</div>
                <div className="text-[13px] font-bold text-white/80 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-[#4B6480] mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left — pending tasks */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold">Tugas Menunggu Penilaian</h3>
                  <button className="text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                  {[
                    { kelas: "Kelas IX", title: "Teorema Pythagoras — Latihan 2", bab: "BAB II", due: "Hari ini, 23:59", pending: 8, urgent: true },
                    { kelas: "Kelas VIII", title: "Bilangan Berpangkat — Soal Cerita", bab: "BAB I", due: "Besok", pending: 12, urgent: false },
                    { kelas: "Kelas VII", title: "Bilangan Bulat Negatif — Kuis 1", bab: "BAB I", due: "3 Nov, 23:59", pending: 5, urgent: false },
                  ].map((task, i) => (
                    <div key={i} className="flex items-center gap-5 rounded-[18px] border border-indigo-500/[0.10] bg-[#0E1E35] p-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">{task.kelas} · {task.bab}</div>
                          <div className={`flex items-center gap-1 text-[11px] font-semibold ${task.urgent ? "text-orange-300" : "text-[#4B6480]"}`}>
                            <Clock size={11} /> Tenggat: {task.due}
                          </div>
                        </div>
                        <h4 className="text-[15px] font-bold text-white">{task.title}</h4>
                      </div>
                      <div className="shrink-0 flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-[22px] font-black text-yellow-300">{task.pending}</div>
                          <div className="text-[10px] text-[#4B6480] font-bold">blm dinilai</div>
                        </div>
                        <button className="rounded-[12px] bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-[12px] font-black text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all whitespace-nowrap">
                          Nilai Sekarang
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student activity */}
              <div>
                <h3 className="text-[16px] font-bold mb-4">Aktivitas Siswa Terkini</h3>
                <div className="space-y-2.5">
                  {[
                    { name: "Ahmad Fauzi", init: "AF", action: "Menyelesaikan Pythagoras Latihan 2 — Skor 92", badge: "+40 XP", time: "2 mnt lalu", color: "from-indigo-500 to-violet-600" },
                    { name: "Budi Santoso", init: "BS", action: "Mengumpulkan Tugas Bilangan Berpangkat", badge: "Menunggu Nilai", time: "15 mnt lalu", color: "from-yellow-500 to-orange-500" },
                    { name: "Citra Dewi", init: "CD", action: "Meraih peringkat #1 — Papan Peringkat", badge: "+100 XP", time: "1 jam lalu", color: "from-emerald-500 to-cyan-600" },
                    { name: "Rio Kusuma", init: "RK", action: "Menang Duel vs Dimas A. (+15 🪙)", badge: "+15 🪙", time: "2 jam lalu", color: "from-orange-500 to-red-500" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-[16px] border border-indigo-500/[0.08] bg-[#0E1E35] px-4 py-3 hover:border-indigo-500/20 transition-colors cursor-pointer">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.color} text-[12px] font-bold text-white`}>
                        {s.init}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <div className="text-[13px] font-bold text-white">{s.name}</div>
                          <div className="text-[10px] font-medium text-[#4B6480]">{s.time}</div>
                        </div>
                        <div className="text-[12px] text-[#4B6480] truncate">{s.action}</div>
                      </div>
                      <div className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-black ${s.badge === "Menunggu Nilai" ? "bg-[#0A1628] text-[#4B6480]" : "bg-indigo-500/15 text-indigo-300"}`}>
                        {s.badge}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — feature shortcuts */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              <div className="rounded-[24px] border border-indigo-500/[0.08] bg-[#0E1E35] p-5">
                <h3 className="text-[15px] font-bold mb-4">Fitur Guru</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { emoji: "💥", label: "Boss Raid", sub: "Buat raid baru" },
                    { emoji: "🏆", label: "Turnamen", sub: "Kelola bracket" },
                    { emoji: "🔒", label: "Kunci Bab", sub: "Atur akses" },
                    { emoji: "💡", label: "Insight", sub: "Analitik kelas" },
                    { emoji: "🧮", label: "Hafalan", sub: "Monitor prog." },
                    { emoji: "💬", label: "Komunikasi", sub: "Chat & forum" },
                  ].map((feat, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 rounded-[16px] border border-indigo-500/[0.08] bg-[#0A1628] p-4 cursor-pointer hover:border-indigo-500/20 transition-colors text-center">
                      <span className="text-[24px]">{feat.emoji}</span>
                      <div>
                        <div className="text-[12px] font-bold">{feat.label}</div>
                        <div className="text-[10px] text-[#4B6480]">{feat.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="rounded-[24px] border border-indigo-500/[0.08] bg-[#0E1E35] p-5">
                <h3 className="text-[15px] font-bold mb-4">Ringkasan Kelas</h3>
                <div className="space-y-3">
                  {[
                    { label: "Tugas Aktif", val: "3", color: "text-indigo-300" },
                    { label: "Boss Raid Aktif", val: "1", color: "text-orange-300" },
                    { label: "Turnamen Minggu Ini", val: "1", color: "text-yellow-300" },
                    { label: "Hafalan Selesai", val: "8/28", color: "text-emerald-300" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-indigo-500/[0.06] last:border-0">
                      <span className="text-[12px] text-[#4B6480]">{stat.label}</span>
                      <span className={`text-[14px] font-black ${stat.color}`}>{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-[16px] border border-indigo-500/30 bg-[#141B3A] px-6 py-4 text-[13px] font-bold text-indigo-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
            <CheckCircle2 size={16} />
          </div>
          Budi Santoso baru mengumpulkan tugas Pythagoras!
        </div>
      )}
    </div>
  );
}
