import React, { useState } from "react";
import { Home, Map, Trophy, BarChart2, ShoppingBag, Award, MessageCircle, ChevronDown, Zap, TrendingUp, TrendingDown, LogOut, ArrowRight } from "lucide-react";

const NAV = [
  { icon: Home, label: "Beranda" },
  { icon: Map, label: "Zona Belajar" },
  { icon: BarChart2, label: "Nilai & Tugas", active: true },
  { icon: Trophy, label: "Papan Peringkat" },
  { icon: ShoppingBag, label: "Toko" },
  { icon: Award, label: "Lencana" },
  { icon: MessageCircle, label: "Chat" },
];

const tasks = [
  { name: "Teorema Pythagoras — Latihan 2", bab: "Kelas VIII · BAB II", date: "Hari ini, 10:00", score: 92, xp: 40 },
  { name: "Bilangan Berpangkat — Soal Cerita", bab: "Kelas VIII · BAB I", date: "Kemarin, 14:30", score: 85, xp: 35 },
  { name: "SPLDV — Penyelesaian Sistem", bab: "Kelas IX · BAB I", date: "12 Okt, 08:15", score: 72, xp: 25 },
  { name: "Bilangan Bulat Negatif", bab: "Kelas VII · BAB I", date: "10 Okt, 15:00", score: 78, xp: 30 },
  { name: "Statistika Dasar — Mean & Median", bab: "Kelas IX · BAB V", date: "8 Okt, 09:00", score: 88, xp: 38 },
  { name: "Rasio & Proporsi", bab: "Kelas VII · BAB III", date: "5 Okt, 11:00", score: 95, xp: 45 },
];

const pending = [
  { name: "Bangun Datar — Luas & Keliling", bab: "Kelas VIII · BAB V", deadline: "Besok, 23:59", xp: 45, urgent: true },
  { name: "Pola Bilangan Fibonacci", bab: "Kelas VIII · BAB IV", deadline: "3 Nov, 23:59", xp: 40, urgent: false },
  { name: "Transformasi Geometri", bab: "Kelas IX · BAB IV", deadline: "10 Nov, 23:59", xp: 50, urgent: false },
];

const scoreColor = (s: number) =>
  s >= 85 ? "text-emerald-300 bg-emerald-400/15 border-emerald-400/25"
  : s >= 70 ? "text-yellow-300 bg-yellow-400/15 border-yellow-400/25"
  : "text-red-300 bg-red-400/15 border-red-400/25";

export default function NilaiWeb() {
  const [activeSection, setActiveSection] = useState("Rekap Nilai");
  const avg = Math.round(tasks.reduce((a, t) => a + t.score, 0) / tasks.length);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[150px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 flex w-[220px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/80 backdrop-blur-xl shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-2 space-y-0.5">
          <div className="mb-3 mt-1 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Menu Utama</div>
          {NAV.map((item) => (
            <div key={item.label} className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-bold transition-all cursor-pointer ${(item as any).active ? "bg-indigo-500/[0.12] text-indigo-300 ring-1 ring-indigo-500/20" : "text-[#4B6480] hover:bg-white/[0.03] hover:text-white"}`}>
              <item.icon size={17} />
              {item.label}
            </div>
          ))}
        </div>
        <div className="p-3 mt-auto border-t border-indigo-500/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] cursor-pointer hover:bg-white/[0.03]">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[12px] font-black shrink-0">AF</div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[12px] font-bold">Ahmad Fauzi</div>
              <div className="truncate text-[10px] text-[#4B6480]">IX Al Khawarizmi</div>
            </div>
            <button className="text-[#4B6480] hover:text-red-400 shrink-0"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-indigo-500/[0.06] bg-[#071321]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-black">Nilai & Tugas 📊</h1>
            <div className="flex gap-2">
              {["Rekap Nilai", "Tugas Aktif"].map(s => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${activeSection === s ? "bg-indigo-500 text-white" : "text-[#4B6480] hover:text-white border border-indigo-500/[0.10]"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-[12px] font-bold text-indigo-300">
            Semester Ganjil <ChevronDown size={14} />
          </button>
        </header>

        <div className="max-w-6xl mx-auto p-8">
          {activeSection === "Rekap Nilai" ? (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-5 mb-8">
                {[
                  { emoji: "📊", label: "Rata-rata Nilai", val: avg.toString(), sub: "dari semua tugas", color: "border-indigo-500/15 bg-indigo-500/[0.05]" },
                  { emoji: "⚡", label: "Total XP Dikumpulkan", val: "2.140", sub: "semester ini", color: "border-violet-400/15 bg-violet-400/[0.05]" },
                  { emoji: "✅", label: "Tugas Selesai", val: tasks.length.toString(), sub: "dari guru", color: "border-emerald-400/15 bg-emerald-400/[0.05]" },
                  { emoji: "🪙", label: "Koin dari Tugas", val: (tasks.length * 15).toString(), sub: "15 koin per tugas", color: "border-yellow-400/15 bg-yellow-400/[0.05]" },
                ].map((s, i) => (
                  <div key={i} className={`rounded-[20px] border ${s.color} p-5`}>
                    <span className="text-[28px] block mb-3">{s.emoji}</span>
                    <div className="text-[28px] font-black text-white">{s.val}</div>
                    <div className="text-[13px] font-bold text-white/80 mt-0.5">{s.label}</div>
                    <div className="text-[11px] text-[#4B6480] mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Score overview card */}
              <div className="rounded-[24px] border border-indigo-500/20 bg-gradient-to-br from-[#141B3A] to-[#0F1830] p-8 mb-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="inline-block rounded-md bg-indigo-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-3">RATA-RATA KESELURUHAN</div>
                    <div className="flex items-end gap-2">
                      <span className="text-[72px] font-black leading-none text-indigo-300">{avg}</span>
                      <span className="text-[24px] font-bold text-[#4B6480] pb-2">/100</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span className="text-[14px] font-bold text-emerald-400">Sangat Baik</span>
                    </div>
                  </div>
                  {/* Score distribution */}
                  <div className="flex gap-2 items-end">
                    {tasks.map((t, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={`w-8 rounded-t-lg ${t.score >= 85 ? "bg-emerald-400" : t.score >= 70 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ height: `${(t.score / 100) * 120}px` }}
                        />
                        <div className="text-[9px] text-[#4B6480]">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task list */}
              <div className="rounded-[20px] border border-indigo-500/[0.10] bg-[#0E1E35] overflow-hidden">
                <div className="grid grid-cols-[1fr_160px_80px_100px_100px] gap-0 px-6 py-3 border-b border-indigo-500/[0.08] text-[10px] font-bold uppercase tracking-wider text-[#4B6480]">
                  <div>Tugas</div>
                  <div>Bab/Kelas</div>
                  <div className="text-center">Nilai</div>
                  <div className="text-center">XP</div>
                  <div className="text-center">Koin</div>
                </div>
                {tasks.map((task, i) => (
                  <div key={i} className="grid grid-cols-[1fr_160px_80px_100px_100px] gap-0 px-6 py-4 border-b border-indigo-500/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <div className="text-[13px] font-bold text-white">{task.name}</div>
                      <div className="text-[11px] text-[#4B6480] mt-0.5">{task.date}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] text-[#4B6480]">{task.bab}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className={`flex h-9 min-w-[44px] items-center justify-center rounded-[10px] border px-2 text-[14px] font-black ${scoreColor(task.score)}`}>
                        {task.score}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-[12px] font-bold text-indigo-300">+{task.xp} XP</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-[12px] font-bold text-yellow-300">+15 🪙</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Pending tasks */}
              <div className="mb-6">
                <h3 className="text-[16px] font-bold mb-4">Tugas Menunggu</h3>
                <div className="space-y-4">
                  {pending.map((task, i) => (
                    <div key={i} className="flex items-center gap-6 rounded-[20px] border border-indigo-500/15 bg-gradient-to-br from-[#141B3A] to-[#0E1E35] p-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="rounded-md bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">{task.bab}</div>
                          <div className={`text-[11px] font-bold ${task.urgent ? "text-orange-300" : "text-[#4B6480]"}`}>⏰ {task.deadline}</div>
                        </div>
                        <h4 className="text-[18px] font-black text-white mb-2">{task.name}</h4>
                        <div className="flex items-center gap-3 text-[12px]">
                          <span className="text-indigo-300 font-bold">+{task.xp} XP</span>
                          <span className="text-yellow-300">+15 🪙</span>
                        </div>
                      </div>
                      <button className="shrink-0 flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-[14px] font-black text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 transition-all">
                        Kerjakan <ArrowRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
