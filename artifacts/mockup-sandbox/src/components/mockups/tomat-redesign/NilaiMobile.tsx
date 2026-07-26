import React, { useState } from "react";
import { Home, Map, Trophy, User, ChevronDown, Zap, TrendingUp, TrendingDown } from "lucide-react";

export default function NilaiMobile() {
  const [activeTab, setActiveTab] = useState("Nilai");

  const tasks = [
    { name: "Teorema Pythagoras — Lat. 2", bab: "Kelas VIII · BAB II", date: "Hari ini, 10:00", score: 92, status: "Selesai", xp: 40 },
    { name: "Bilangan Berpangkat", bab: "Kelas VIII · BAB I", date: "Kemarin, 14:30", score: 85, status: "Selesai", xp: 35 },
    { name: "SPLDV — Soal Cerita", bab: "Kelas IX · BAB I", date: "12 Okt, 08:15", score: 72, status: "Selesai", xp: 25 },
    { name: "Persamaan Linear Satu Var.", bab: "Kelas VII · BAB III", date: "10 Okt, 15:00", score: 78, status: "Selesai", xp: 30 },
    { name: "Statistika Dasar", bab: "Kelas IX · BAB V", date: "8 Okt, 09:00", score: 88, status: "Selesai", xp: 38 },
  ];

  const pending = [
    { name: "Bangun Datar — Luas & Keliling", bab: "Kelas VIII · BAB V", deadline: "Besok, 23:59", xp: 45 },
    { name: "Pola Bilangan Fibonacci", bab: "Kelas VIII · BAB IV", deadline: "3 Nov, 23:59", xp: 40 },
  ];

  const scoreColor = (s: number) =>
    s >= 85 ? "text-emerald-300 bg-emerald-400/15 border-emerald-400/25"
    : s >= 70 ? "text-yellow-300 bg-yellow-400/15 border-yellow-400/25"
    : "text-red-300 bg-red-400/15 border-red-400/25";

  const avgScore = Math.round(tasks.reduce((a, t) => a + t.score, 0) / tasks.length);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative z-10 flex h-[100dvh] flex-col overflow-y-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#071321]/90 px-4 py-4 backdrop-blur-xl border-b border-indigo-500/[0.08]">
          <h1 className="text-[20px] font-black tracking-wide">Nilai & Tugas 📊</h1>
          <button className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold text-indigo-300">
            Semester Ganjil <ChevronDown size={14} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="px-4 mt-4">
          <div className="flex bg-[#0A1628] rounded-[12px] p-1 border border-indigo-500/[0.06]">
            {["Nilai", "Tugas Aktif"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[12px] font-bold rounded-[10px] transition-all ${
                  activeTab === tab ? "bg-[#0E1E35] text-white border border-indigo-500/[0.10]" : "text-[#4B6480]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Nilai" && (
          <>
            {/* Overall score card */}
            <div className="px-4 mt-4">
              <div className="rounded-[22px] border border-indigo-500/20 bg-gradient-to-br from-[#141B3A] to-[#0F1830] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)] relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-[30px]" />

                <div className="inline-block rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-300 relative z-10">
                  RATA-RATA NILAI TUGAS
                </div>

                <div className="mt-3 flex items-end gap-1 relative z-10">
                  <span className="text-[48px] font-black leading-none text-indigo-300 tracking-tighter">{avgScore}</span>
                  <span className="text-[20px] font-bold text-[#4B6480] pb-1">/100</span>
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/25 relative z-10">
                  <TrendingUp size={12} /> Sangat Baik
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-indigo-500/10 pt-4 relative z-10">
                  <div className="text-center">
                    <div className="text-[15px] font-black text-white">{tasks.length}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B6480]">Dikerjakan</div>
                  </div>
                  <div className="h-6 w-px bg-indigo-500/10" />
                  <div className="text-center">
                    <div className="text-[15px] font-black text-white">{pending.length}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B6480]">Menunggu</div>
                  </div>
                  <div className="h-6 w-px bg-indigo-500/10" />
                  <div className="text-center">
                    <div className="text-[15px] font-black text-yellow-300">2.140</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B6480]">Total XP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent scores */}
            <div className="px-4 mt-5">
              <h2 className="text-[13px] font-black uppercase tracking-wider text-white/80 mb-3">Tugas Selesai</h2>
              <div className="space-y-2.5">
                {tasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[16px] border border-indigo-500/[0.08] bg-[#0E1E35] p-3.5 shadow-sm">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-[13px] font-bold text-white truncate">{task.name}</div>
                      <div className="text-[10px] font-medium text-[#4B6480] mt-0.5">{task.bab} · {task.date}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap size={10} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-300 font-bold">+{task.xp} XP</span>
                        <span className="text-[10px] text-yellow-300 ml-1">+15 🪙</span>
                      </div>
                    </div>
                    <div className={`flex h-10 min-w-[40px] items-center justify-center rounded-[10px] border px-2 text-[14px] font-black ${scoreColor(task.score)}`}>
                      {task.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "Tugas Aktif" && (
          <div className="px-4 mt-4 space-y-3">
            {pending.map((task, i) => (
              <div key={i} className="rounded-[18px] border border-indigo-500/20 bg-gradient-to-br from-[#141B3A] to-[#0E1E35] p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-300">{task.bab}</div>
                  <div className="text-[10px] font-bold text-orange-300">⏰ {task.deadline}</div>
                </div>
                <h4 className="text-[15px] font-bold text-white mb-3">{task.name}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-indigo-300 font-bold">+{task.xp} XP</span>
                    <span className="text-yellow-300">+15 🪙</span>
                  </div>
                  <button className="rounded-[10px] bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-[11px] font-black text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all">
                    KERJAKAN →
                  </button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center text-[#4B6480]">
                <span className="text-4xl mb-3">✅</span>
                <div className="font-bold text-white">Semua tugas selesai!</div>
                <div className="text-[12px] mt-1">Kamu luar biasa 🎉</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-indigo-500/[0.08] bg-[#071321]/95 pb-5 pt-2 backdrop-blur-xl">
        {[
          { emoji: "🏠", label: "Beranda" },
          { emoji: "🗺️", label: "Zona" },
          { emoji: "🏆", label: "Peringkat" },
          { emoji: "👤", label: "Profil" },
        ].map((tab) => (
          <button key={tab.label} className="relative flex flex-col items-center gap-1 w-16">
            <span className="text-[20px] opacity-35">{tab.emoji}</span>
            <span className="text-[10px] text-[#4B6480]">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
