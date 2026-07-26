import React, { useState } from "react";
import { Bell, Zap, Trophy, ArrowRight, Home, Map, Star, User, ShoppingBag, Lock, Swords, Shield } from "lucide-react";

export default function HomeSiswaMobile() {
  const [loadingMission, setLoadingMission] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleStartMission = () => {
    setLoadingMission(true);
    setTimeout(() => {
      setLoadingMission(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    }, 600);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.05] blur-[110px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#071321]/95 backdrop-blur-xl border-b border-indigo-500/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
            <span className="text-lg">🍅</span>
          </div>
          <div>
            <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-3 py-2">
            <span className="text-[12px]">🪙</span>
            <span className="text-[11px] font-bold text-yellow-200">385</span>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/15 bg-indigo-500/[0.05]">
            <Bell size={18} className="text-indigo-300" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-black text-white shadow-sm">
            AF
          </div>
        </div>
      </div>

      <div className="overflow-y-auto pb-28 relative z-10">
        {/* Greeting + Level */}
        <div className="px-4 mt-5">
          <div className="inline-block rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-300">
            Semester Ganjil • Aktif
          </div>
          <h1 className="text-[26px] font-black mt-1">Halo, Ahmad. 🎮</h1>
          <p className="text-[13px] text-[#4B6480] mt-1">Siap menjelajahi zona matematika hari ini?</p>
        </div>

        {/* Stats row */}
        <div className="px-4 mt-4 flex gap-2">
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[16px] border border-indigo-500/[0.10] bg-[#0E1E35] py-3">
            <span className="text-[16px]">⭐</span>
            <div className="text-[14px] font-bold">Lv. 8</div>
            <div className="text-[10px] text-[#4B6480]">Level</div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[16px] border border-indigo-500/[0.10] bg-[#0E1E35] py-3">
            <Zap size={18} className="text-indigo-400" />
            <div className="text-[14px] font-bold">2.140</div>
            <div className="text-[10px] text-[#4B6480]">Total XP</div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[16px] border border-indigo-500/[0.10] bg-[#0E1E35] py-3">
            <Trophy size={18} className="text-yellow-400" />
            <div className="text-[14px] font-bold">#4</div>
            <div className="text-[10px] text-[#4B6480]">Peringkat</div>
          </div>
        </div>

        {/* Active mission card */}
        <div className="px-4 mt-5">
          <div className="relative overflow-hidden rounded-[22px] border border-indigo-500/25 bg-gradient-to-br from-[#141B3A] via-[#0F1830] to-[#12203A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-indigo-500/10" />
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full border border-indigo-500/15" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="inline-block rounded-md bg-indigo-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-300">
                Tugas Aktif
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-400">
                <Zap size={11} />
                <span>+40 XP · 🪙 15</span>
              </div>
            </div>

            <h2 className="relative z-10 text-[18px] font-black text-white leading-tight">Teorema Pythagoras — Latihan 2</h2>
            <p className="relative z-10 text-[11px] text-indigo-200/60 mt-1 mb-4">Kelas VIII • BAB II · Pythagoras</p>

            <div className="relative z-10 space-y-1.5 mb-5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-white/[0.08] overflow-hidden">
                    {i <= 3 && (
                      <div className="h-full w-full rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#4B6480]">3 dari 5 soal selesai</div>
            </div>

            <button
              onClick={handleStartMission}
              disabled={loadingMission}
              className="relative z-10 flex w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 font-black text-white text-[13px] shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
            >
              {loadingMission ? "MEMUAT..." : "KERJAKAN SEKARANG →"}
            </button>
          </div>
        </div>

        {/* Zone list */}
        <div className="px-4 mt-6">
          <h3 className="text-[14px] font-bold mb-3 text-white/90">Pilih Zona Petualangan</h3>
          <div className="space-y-3">
            {/* Grade 7 Zone */}
            <div className="flex items-center gap-4 rounded-[18px] border border-cyan-400/25 bg-cyan-400/[0.05] p-4 shadow-[0_0_24px_rgba(103,232,249,0.06)] transition-colors hover:border-cyan-400/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-cyan-400/15 text-xl">🏰</div>
              <div className="flex-1">
                <div className="text-[9px] font-bold text-cyan-300 tracking-wider">KELAS VII</div>
                <div className="text-[14px] font-bold">Gerbang Bilangan</div>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08]">
                  <div className="h-full w-[68%] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(103,232,249,0.4)]" />
                </div>
              </div>
              <div className="text-[11px] font-bold text-cyan-300">68%</div>
            </div>

            {/* Grade 8 Zone - Active */}
            <div className="flex items-center gap-4 rounded-[18px] border border-orange-400/30 bg-orange-400/[0.07] p-4 shadow-[0_0_24px_rgba(251,146,60,0.08)] transition-colors hover:border-orange-400/50 ring-1 ring-orange-400/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-orange-400/15 text-xl">⚔️</div>
              <div className="flex-1">
                <div className="text-[9px] font-bold text-orange-300 tracking-wider">KELAS VIII · AKTIF</div>
                <div className="text-[14px] font-bold">Kerajaan Pythagoras</div>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.08]">
                  <div className="h-full w-[34%] rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
                </div>
              </div>
              <div className="text-[11px] font-bold text-orange-300">34%</div>
            </div>

            {/* Grade 9 Zone - Locked */}
            <div className="flex items-center gap-4 rounded-[18px] border border-white/[0.05] bg-[#0E1E35]/50 p-4 opacity-60">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.05] text-[#4B6480]">
                <Lock size={22} />
              </div>
              <div className="flex-1">
                <div className="text-[9px] font-bold text-[#4B6480] tracking-wider">KELAS IX</div>
                <div className="text-[14px] font-bold text-[#4B6480]">Observatorium SPLDV</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Lock size={10} className="text-[#4B6480]" />
                  <span className="text-[10px] text-[#4B6480]">Selesaikan Kelas 8 untuk membuka</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="px-4 mt-6 mb-4">
          <h3 className="text-[14px] font-bold mb-3 text-white/90">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { emoji: "📊", label: "Nilai & Tugas", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-500/15" },
              { emoji: "💬", label: "Chat Guru", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/15" },
              { emoji: "🛒", label: "Toko", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-500/15" },
              { emoji: "🏅", label: "Lencana", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-500/15" },
            ].map((link, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-[16px] border ${link.border} bg-[#0E1E35] p-3 active:scale-95 transition-transform cursor-pointer`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${link.bg} text-xl`}>
                  {link.emoji}
                </div>
                <span className="text-[13px] font-bold">{link.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tomi Pet strip */}
        <div className="px-4 mt-2 mb-6">
          <div className="flex items-center gap-3 rounded-[18px] border border-indigo-500/15 bg-[#0E1E35] p-4">
            <div className="text-2xl">🐹</div>
            <div className="flex-1">
              <div className="text-[12px] font-bold text-white">Tomi — Kenyang</div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full w-[75%] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              </div>
            </div>
            <button className="rounded-xl border border-yellow-400/25 bg-yellow-400/[0.08] px-3 py-1.5 text-[11px] font-bold text-yellow-300">
              Beri Makan
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#071321]/95 backdrop-blur-xl border-t border-indigo-500/[0.08] pb-6 pt-3 px-6">
        <div className="flex justify-between items-center">
          {[
            { emoji: "🏠", label: "Beranda", active: true },
            { emoji: "🗺️", label: "Zona", active: false },
            { emoji: "🏆", label: "Peringkat", active: false },
            { emoji: "👤", label: "Profil", active: false },
          ].map((tab, i) => (
            <div key={i} className="relative flex flex-col items-center gap-1 cursor-pointer w-16">
              {tab.active && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-indigo-400" />
              )}
              <span className={`text-[20px] ${tab.active ? "opacity-100" : "opacity-40"}`}>{tab.emoji}</span>
              <span className={`text-[10px] ${tab.active ? "text-indigo-400 font-bold" : "text-[#4B6480]"}`}>
                {tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-50 flex w-[90%] max-w-sm items-center gap-3 rounded-[14px] border border-indigo-500/20 bg-[#141B3A] px-4 py-3 text-[11px] font-semibold text-indigo-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Zap size={16} className="text-yellow-400" />
          Memuat soal Pythagoras untukmu...
        </div>
      )}
    </div>
  );
}
