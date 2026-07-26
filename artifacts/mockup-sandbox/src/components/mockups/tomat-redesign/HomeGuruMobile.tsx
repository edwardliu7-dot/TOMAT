import React, { useState, useEffect } from "react";
import { Bell, Home, BookOpen, ClipboardList, BarChart2, User, ChevronRight, Clock, Zap, CheckCircle2, Swords, Lock } from "lucide-react";

export default function HomeGuruMobile() {
  const [activeTab, setActiveTab] = useState("Beranda");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2600);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative h-full overflow-y-auto pb-24">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-indigo-500/[0.08] bg-[#071321]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
                <div className="rounded-md bg-indigo-400/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-indigo-300">Guru</div>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
            </div>
          </div>
          <button className="relative rounded-full bg-[#0E1E35] p-2.5 text-indigo-300 transition-colors hover:bg-[#141B3A]">
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
          </button>
        </header>

        {/* Greeting */}
        <div className="px-4 mt-5 relative z-10">
          <h1 className="text-[22px] font-black leading-tight text-white">
            Selamat pagi, Bu Sari! 👩‍🏫
          </h1>
          <p className="mt-1 text-[11px] font-medium text-[#4B6480]">Senin, 26 Juli 2026 · Semester Ganjil</p>
        </div>

        {/* Class summary card */}
        <div className="px-4 mt-4 relative z-10">
          <div className="group relative rounded-[18px] border border-indigo-500/15 bg-[#0E1E35] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:border-indigo-500/30 transition-all overflow-hidden cursor-pointer">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/[0.05] blur-[20px]" />
            <div className="relative flex items-center justify-between mb-4">
              <div>
                <div className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-300 w-max mb-2">Kelas Utama</div>
                <h2 className="text-[18px] font-bold text-white">IX Al Khawarizmi</h2>
              </div>
              <ChevronRight size={20} className="text-[#4B6480] group-hover:text-indigo-400 transition-colors" />
            </div>

            <div className="grid grid-cols-3 gap-2 relative">
              {[
                { label: "Siswa", val: "28", color: "text-white" },
                { label: "Rata²", val: "82", color: "text-yellow-300" },
                { label: "Aktif", val: "24", color: "text-emerald-400" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-[#0A1628] border border-indigo-500/[0.08] p-2.5 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#4B6480] uppercase tracking-wider mb-1">{s.label}</span>
                  <span className={`text-[16px] font-black ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="px-4 mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x relative z-10">
          {[
            { icon: BookOpen, label: "3 Tugas aktif", color: "border-blue-400/20 bg-blue-400/[0.08] text-blue-300", iconColor: "text-blue-400" },
            { icon: ClipboardList, label: "12 Belum dinilai", color: "border-yellow-400/20 bg-yellow-400/[0.08] text-yellow-200", iconColor: "text-yellow-300" },
            { icon: Swords, label: "Boss Raid aktif", color: "border-orange-400/20 bg-orange-400/[0.08] text-orange-200", iconColor: "text-orange-400" },
          ].map((pill, i) => (
            <div key={i} className={`flex snap-start shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 ${pill.color}`}>
              <pill.icon size={12} className={pill.iconColor} />
              <span className="text-[11px] font-bold">{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Pending tasks */}
        <div className="px-4 mt-5 relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Tugas Menunggu Penilaian</h3>
            <button className="text-[11px] font-bold text-indigo-400">Lihat Semua</button>
          </div>

          <div className="space-y-3">
            {[
              { subject: "Kelas IX", title: "Teorema Pythagoras — Latihan 2", due: "Hari ini, 23:59", pending: 8, urgent: true },
              { subject: "Kelas VIII", title: "Bilangan Berpangkat — Soal Cerita", due: "Besok", pending: 12, urgent: false },
            ].map((task, i) => (
              <div key={i} className="flex flex-col rounded-[16px] border border-indigo-500/[0.10] bg-[#0E1E35] p-3.5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="rounded-md bg-[#0A1628] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-500/10">{task.subject}</div>
                  <div className={`flex items-center gap-1 text-[10px] font-semibold ${task.urgent ? "text-orange-300" : "text-[#4B6480]"}`}>
                    <Clock size={10} />
                    {task.due}
                  </div>
                </div>
                <h4 className="text-[14px] font-bold text-white mb-3">{task.title}</h4>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-[#4B6480]"><span className="font-bold text-yellow-300">{task.pending}</span> blm dinilai</div>
                  <button className="rounded-[10px] bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-[11px] font-black text-white shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all">
                    Nilai Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student activity */}
        <div className="px-4 mt-5 mb-4 relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Aktivitas Siswa Terkini</h3>
          </div>

          <div className="space-y-2.5">
            {[
              { name: "Ahmad Fauzi", init: "AF", action: "Menyelesaikan Pythagoras Lat. 2", badge: "+40 XP", time: "2 mnt", color: "from-indigo-500 to-violet-600" },
              { name: "Budi Santoso", init: "BS", action: "Mengumpulkan Tugas Bilangan", badge: "Menunggu", time: "15 mnt", color: "from-yellow-500 to-orange-500" },
              { name: "Citra Dewi", init: "CD", action: "Menang Duel vs Rio K.", badge: "+15 🪙", time: "1 jam", color: "from-emerald-500 to-cyan-600" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[14px] border border-indigo-500/[0.08] bg-[#0E1E35] px-3 py-2.5 cursor-pointer hover:border-indigo-500/20 transition-colors">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${s.color} text-[11px] font-bold text-white`}>
                  {s.init}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="truncate text-[12px] font-bold text-white">{s.name}</div>
                    <div className="text-[9px] font-medium text-[#4B6480]">{s.time} lalu</div>
                  </div>
                  <div className="truncate text-[11px] text-[#4B6480]">{s.action}</div>
                </div>
                <div className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-black tracking-wider ${s.badge === "Menunggu" ? "bg-[#0A1628] text-[#4B6480]" : "bg-indigo-500/15 text-indigo-300"}`}>
                  {s.badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guru feature shortcuts */}
        <div className="px-4 mt-2 mb-6 relative z-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4B6480] mb-3">Fitur Guru</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { emoji: "👁️", label: "Pantau Kelas" },
              { emoji: "💥", label: "Boss Raid" },
              { emoji: "🏆", label: "Turnamen" },
              { emoji: "🔒", label: "Kunci Bab" },
              { emoji: "💡", label: "Insight" },
              { emoji: "💬", label: "Komunikasi" },
            ].map((feat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-[14px] border border-indigo-500/[0.10] bg-[#0E1E35] p-3 cursor-pointer hover:border-indigo-500/20 transition-colors">
                <span className="text-[22px]">{feat.emoji}</span>
                <span className="text-[10px] font-bold text-[#4B6480] text-center leading-tight">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-indigo-500/[0.08] bg-[#071321]/95 pb-5 pt-2 backdrop-blur-xl">
        {[
          { id: "Beranda", emoji: "🏠" },
          { id: "Kelas", emoji: "📚" },
          { id: "Tugas", emoji: "📋" },
          { id: "Nilai", emoji: "📊" },
          { id: "Profil", emoji: "👤" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center w-14 h-12"
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              )}
              <span className={`text-[18px] mb-0.5 transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}>{tab.emoji}</span>
              <span className={`text-[9px] font-bold transition-colors ${isActive ? "text-indigo-400" : "text-[#4B6480]"}`}>
                {tab.id}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-[90px] left-1/2 z-50 flex w-[90%] -translate-x-1/2 items-center gap-3 rounded-[14px] border border-indigo-500/20 bg-[#141B3A] px-4 py-3 text-[11px] font-semibold text-indigo-100 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
            <CheckCircle2 size={14} />
          </div>
          Budi Santoso baru saja mengumpulkan tugas Pythagoras!
        </div>
      )}
    </div>
  );
}
