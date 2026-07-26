import React, { useState } from "react";
import { Bell, Zap, Trophy, ArrowRight, Home, Map, ShoppingBag, Award, MessageCircle, BookOpen, BarChart2, Lock, LogOut, Settings } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Beranda", active: true },
  { icon: Map, label: "Zona Belajar", active: false },
  { icon: BarChart2, label: "Nilai & Tugas", active: false },
  { icon: Trophy, label: "Papan Peringkat", active: false },
  { icon: ShoppingBag, label: "Toko", active: false },
  { icon: Award, label: "Lencana", active: false },
  { icon: MessageCircle, label: "Chat", active: false },
];

export default function HomeSiswaWeb() {
  const [loadingMission, setLoadingMission] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleStartMission = () => {
    setLoadingMission(true);
    setTimeout(() => { setLoadingMission(false); setShowToast(true); setTimeout(() => setShowToast(false), 2400); }, 600);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-[15%] top-[20%] h-[700px] w-[700px] rounded-full bg-violet-500/[0.05] blur-[180px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 flex w-[220px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/80 backdrop-blur-xl shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="mb-3 mt-1 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Menu Utama</div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                item.active
                  ? "bg-indigo-500/[0.12] text-indigo-300 ring-1 ring-indigo-500/20"
                  : "text-[#4B6480] hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Tomi strip */}
        <div className="mx-3 mb-3 rounded-[14px] border border-indigo-500/15 bg-[#0E1E35] p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[16px]">🐹</span>
            <span className="text-[12px] font-bold text-white">Tomi</span>
            <span className="ml-auto text-[10px] font-bold text-emerald-300">Kenyang</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[75%] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          </div>
        </div>

        <div className="p-3 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] hover:bg-white/[0.03] cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[12px] font-black text-white shrink-0">
              AF
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[12px] font-bold text-white">Ahmad Fauzi</div>
              <div className="truncate text-[10px] text-[#4B6480]">IX Al Khawarizmi</div>
            </div>
            <button className="text-[#4B6480] hover:text-red-400 transition-colors shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-[68px] items-center justify-end gap-4 border-b border-indigo-500/[0.06] bg-[#071321]/80 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-3 py-2 cursor-pointer hover:bg-yellow-400/12 transition-colors">
            <span className="text-[13px]">🪙</span>
            <span className="text-[12px] font-bold text-yellow-200">385 koin</span>
          </div>
          <div className="text-[12px] text-[#4B6480]">Semester Ganjil · Aktif</div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/15 bg-indigo-500/[0.05] hover:bg-indigo-500/10 transition-colors">
            <Bell size={18} className="text-indigo-300" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </button>
        </header>

        <div className="mx-auto max-w-6xl p-8 pb-24">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Greeting */}
              <div>
                <div className="inline-block rounded-md bg-indigo-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300 mb-2">
                  Petualangan Matematikamu
                </div>
                <h1 className="text-[32px] font-black">Halo, Ahmad. 🎮</h1>
                <p className="text-[15px] text-[#4B6480] mt-1">Siap untuk melanjutkan petualangan belajar hari ini?</p>
              </div>

              {/* Active Mission */}
              <div className="relative overflow-hidden rounded-[24px] border border-indigo-500/25 bg-gradient-to-br from-[#141B3A] via-[#0F1830] to-[#12203A] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-indigo-500/10" />
                <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-indigo-500/15" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="inline-block rounded-md bg-indigo-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300 ring-1 ring-indigo-500/25">
                        Tugas Aktif
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
                        <Zap size={13} />
                        <span>+40 XP · 🪙 15</span>
                      </div>
                    </div>

                    <h2 className="text-[26px] font-black text-white leading-tight mb-2">Teorema Pythagoras — Latihan 2</h2>
                    <p className="text-[14px] text-indigo-200/60 mb-5 max-w-md">Kelas VIII · BAB II — Pythagoras. Buktikan sisi miring segitiga siku-siku menggunakan teorema Pythagoras.</p>

                    <div className="space-y-2 max-w-sm">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-2 flex-1 rounded-full bg-white/[0.08] overflow-hidden">
                            {i <= 3 && <div className="h-full w-full rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />}
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] font-medium text-indigo-300">3 dari 5 soal selesai (60%)</div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartMission}
                    disabled={loadingMission}
                    className="shrink-0 flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-[14px] font-black text-white shadow-[0_6px_28px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
                  >
                    {loadingMission ? "MEMUAT..." : "KERJAKAN SEKARANG"}
                    {!loadingMission && <ArrowRight size={18} />}
                  </button>
                </div>
              </div>

              {/* Zones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-bold">Pilih Zona Petualangan</h3>
                  <button className="text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Lihat Semua</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Grade 7 */}
                  <div className="flex flex-col gap-4 rounded-[20px] border border-cyan-400/25 bg-cyan-400/[0.05] p-5 shadow-[0_0_32px_rgba(103,232,249,0.06)] transition-all hover:border-cyan-400/40 hover:-translate-y-1 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-cyan-400/15 text-3xl">🏰</div>
                      <div className="text-[18px] font-black text-cyan-300">68%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-cyan-400 mb-1">KELAS VII</div>
                      <div className="text-[16px] font-bold mb-2">Gerbang Bilangan</div>
                      <div className="text-[11px] text-[#4B6480] mb-3">Bil. Bulat, Rasional, Rasio</div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                        <div className="h-full w-[68%] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(103,232,249,0.4)]" />
                      </div>
                    </div>
                  </div>

                  {/* Grade 8 — Active */}
                  <div className="flex flex-col gap-4 rounded-[20px] border border-orange-400/30 bg-orange-400/[0.07] p-5 shadow-[0_0_32px_rgba(251,146,60,0.08)] transition-all hover:border-orange-400/50 hover:-translate-y-1 cursor-pointer ring-1 ring-orange-400/20">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-orange-400/15 text-3xl">⚔️</div>
                      <div>
                        <div className="text-[18px] font-black text-orange-300">34%</div>
                        <div className="text-[9px] text-orange-300/70 font-bold text-right">AKTIF</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-orange-400 mb-1">KELAS VIII</div>
                      <div className="text-[16px] font-bold mb-2">Kerajaan Pythagoras</div>
                      <div className="text-[11px] text-[#4B6480] mb-3">Pythagoras, PLSV, Bangun Datar</div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
                        <div className="h-full w-[34%] rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
                      </div>
                    </div>
                  </div>

                  {/* Grade 9 — Locked */}
                  <div className="flex flex-col gap-4 rounded-[20px] border border-white/[0.05] bg-[#0E1E35]/50 p-5 opacity-55">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/[0.05] text-[#4B6480]">
                        <Lock size={26} />
                      </div>
                      <Lock size={18} className="text-[#4B6480]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider text-[#4B6480] mb-1">KELAS IX</div>
                      <div className="text-[16px] font-bold text-[#4B6480] mb-2">Observatorium SPLDV</div>
                      <div className="text-[11px] text-[#4B6480] mb-3">SPLDV, Lingkaran, Bangun Ruang</div>
                      <div className="text-[10px] text-[#4B6480]">Selesaikan Kelas 8 untuk membuka</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "⭐", val: "Lv. 8", label: "Level" },
                  { emoji: "⚡", val: "2.140", label: "Total XP" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-indigo-500/[0.10] bg-[#0E1E35] py-6">
                    <span className="text-[28px]">{s.emoji}</span>
                    <div className="text-center">
                      <div className="text-[20px] font-black">{s.val}</div>
                      <div className="text-[12px] text-[#4B6480] font-medium mt-0.5">{s.label}</div>
                    </div>
                  </div>
                ))}
                <div className="col-span-2 flex items-center justify-between rounded-[20px] border border-yellow-400/20 bg-yellow-400/[0.05] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/20 text-2xl">🏆</div>
                    <div>
                      <div className="text-[12px] text-yellow-300/80 font-medium mb-0.5">Peringkat Kelas</div>
                      <div className="text-[18px] font-black text-yellow-400">Posisi #4</div>
                    </div>
                  </div>
                  <button className="h-8 w-8 rounded-full border border-yellow-400/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Access */}
              <div className="rounded-[24px] border border-indigo-500/[0.08] bg-[#0E1E35] p-5">
                <h3 className="text-[15px] font-bold mb-4">Akses Cepat</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { emoji: "📊", label: "Nilai & Tugas" },
                    { emoji: "💬", label: "Chat Guru" },
                    { emoji: "🛒", label: "Toko" },
                    { emoji: "🏅", label: "Lencana" },
                  ].map((link, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 rounded-[16px] border border-white/[0.03] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] cursor-pointer text-center">
                      <span className="text-[24px]">{link.emoji}</span>
                      <span className="text-[12px] font-bold">{link.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duel/Raid shortcuts */}
              <div className="rounded-[24px] border border-indigo-500/[0.08] bg-[#0E1E35] p-5">
                <h3 className="text-[15px] font-bold mb-4">Mode Kompetisi</h3>
                <div className="space-y-3">
                  {[
                    { emoji: "⚔️", label: "Duel Katak Pelompat", sub: "PvP real-time", color: "border-indigo-500/20 bg-indigo-500/[0.05]" },
                    { emoji: "💥", label: "Boss Raid", sub: "Co-op class battle", color: "border-orange-500/20 bg-orange-500/[0.05]" },
                    { emoji: "🏆", label: "Turnamen Kelas", sub: "Bracket tournament", color: "border-yellow-500/20 bg-yellow-500/[0.05]" },
                  ].map((mode, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-[14px] border ${mode.color} p-3 cursor-pointer hover:opacity-80 transition-opacity`}>
                      <span className="text-[22px]">{mode.emoji}</span>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold">{mode.label}</div>
                        <div className="text-[10px] text-[#4B6480]">{mode.sub}</div>
                      </div>
                      <ArrowRight size={14} className="text-[#4B6480]" />
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <Zap size={16} />
          </div>
          Memuat soal Pythagoras untukmu...
        </div>
      )}
    </div>
  );
}
