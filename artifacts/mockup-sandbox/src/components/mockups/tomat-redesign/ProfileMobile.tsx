import React, { useState } from "react";
import { Home, Map, Trophy, User, Edit3, Zap, Star, Swords } from "lucide-react";

export default function ProfileMobile() {
  const [toastMessage, setToastMessage] = useState("");
  const [petHunger, setPetHunger] = useState(75);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2400);
  };

  const feedPet = () => {
    if (petHunger >= 100) return;
    setPetHunger(Math.min(100, petHunger + 15));
    showToast("Tomi diberi makan! 🥕 Kenyang +15%");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="overflow-y-auto pb-24 relative z-10 h-[100dvh]">
        {/* Top section */}
        <div className="bg-gradient-to-b from-[#141B3A] to-[#071321] px-4 pt-10 pb-5 relative">
          <button className="absolute top-8 right-4 rounded-full border border-indigo-500/20 bg-[#0E1E35] p-2 text-indigo-300">
            <Edit3 size={18} />
          </button>

          <div className="flex flex-col items-center">
            {/* Avatar with frame */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full border-2 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[32px] font-black text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)]">
                AF
              </div>
              <div className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#141B3A]" />
            </div>

            <h1 className="mt-4 text-[22px] font-black text-white">Ahmad Fauzi</h1>
            <p className="mt-1 text-[12px] text-[#4B6480]">IX Al Khawarizmi · SMP TISA</p>

            {/* Active cosmetic badge */}
            <div className="mt-2 flex items-center gap-1.5 rounded-full border border-yellow-400/25 bg-yellow-400/[0.08] px-3 py-1">
              <span className="text-[10px]">👑</span>
              <span className="text-[10px] font-bold text-yellow-300">Aurum Sovereign</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-4 mt-2 flex gap-2">
          {[
            { emoji: "⭐", val: "Lv 8", label: "Level" },
            { emoji: "⚡", val: "2.140", label: "XP" },
            { emoji: "🏆", val: "#4", label: "Rank" },
            { emoji: "🪙", val: "385", label: "Koin" },
          ].map((s, i) => (
            <div key={i} className="flex-1 rounded-[16px] bg-[#0E1E35] border border-indigo-500/[0.10] p-2.5 flex flex-col items-center text-center">
              <span className="text-[15px] mb-0.5">{s.emoji}</span>
              <div className="font-black text-[14px] text-white">{s.val}</div>
              <div className="text-[9px] text-[#4B6480] mt-0.5 uppercase tracking-wider font-bold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tomi Pet section */}
        <div className="px-4 mt-5">
          <div className="rounded-[18px] border border-indigo-500/[0.12] bg-[#0E1E35] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-[150px] w-[150px] rounded-full bg-violet-500/[0.05] blur-[30px]" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">🐹</span>
                <h2 className="font-bold text-white">Tomi</h2>
              </div>
              <div className="rounded-md bg-emerald-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                {petHunger > 60 ? "Kenyang 😊" : petHunger > 30 ? "Lapar 😕" : "Lapar Sekali 😢"}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071321] border border-indigo-500/10 text-4xl shadow-inner">
                🐹
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-emerald-300 font-semibold">Kenyang</span>
                  <span className="text-white">{petHunger}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className={`h-full rounded-full shadow-[0_0_8px] transition-all duration-500 ${
                      petHunger > 60
                        ? "bg-emerald-400 shadow-emerald-400/40"
                        : petHunger > 30
                        ? "bg-yellow-400 shadow-yellow-400/40"
                        : "bg-red-400 shadow-red-400/40"
                    }`}
                    style={{ width: `${petHunger}%` }}
                  />
                </div>

                <button
                  onClick={feedPet}
                  className="mt-3 w-full rounded-xl border border-yellow-400/30 bg-yellow-400/[0.08] py-2 text-[12px] font-bold text-yellow-300 hover:bg-yellow-400/20 transition-colors active:scale-95"
                >
                  Beri Makan 🥕 (Wortel)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 mt-5">
          <div className="grid grid-cols-2 gap-2.5">
            <button className="flex items-center gap-3 rounded-[14px] border border-indigo-500/15 bg-[#0E1E35] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-lg">⚔️</div>
              <div className="text-left">
                <div className="text-[12px] font-bold text-white">Duel</div>
                <div className="text-[10px] text-[#4B6480]">Tantang siswa</div>
              </div>
            </button>
            <button className="flex items-center gap-3 rounded-[14px] border border-orange-500/15 bg-[#0E1E35] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-lg">💥</div>
              <div className="text-left">
                <div className="text-[12px] font-bold text-white">Boss Raid</div>
                <div className="text-[10px] text-[#4B6480]">Co-op battle</div>
              </div>
            </button>
          </div>
        </div>

        {/* Badges section */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-[15px]">Lencana 🏅</h2>
            <span className="text-[11px] text-[#4B6480]">12 dari 30</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { emoji: "🥇", active: true }, { emoji: "⚡", active: true }, { emoji: "🎯", active: true },
              { emoji: "🔥", active: true }, { emoji: "📚", active: true }, { emoji: "🌟", active: true },
              { emoji: "💡", active: true }, { emoji: "🛡️", active: true }, { emoji: "⚔️", active: true },
              { emoji: "🏆", active: false }, { emoji: "🌙", active: false }, { emoji: "🎮", active: false },
              { emoji: "💎", active: false }, { emoji: "👑", active: false }, { emoji: "🔮", active: false },
            ].map((badge, i) => (
              <div
                key={i}
                className={`flex h-12 w-full items-center justify-center rounded-[14px] border ${
                  badge.active
                    ? "bg-[#0E1E35] border-indigo-500/[0.15] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    : "bg-[#0A1628]/50 border-white/[0.04] opacity-25"
                }`}
              >
                <span className={`text-[18px] ${!badge.active ? "grayscale" : ""}`}>{badge.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement progress */}
        <div className="px-4 mt-5 pb-6">
          <h2 className="font-bold text-white text-[15px] mb-3">Progres Pencapaian</h2>

          <div className="flex flex-col gap-3">
            {[
              { name: "Penjelajah Misi", val: 7, total: 10, color: "bg-indigo-400" },
              { name: "Duel Master", val: 12, total: 20, color: "bg-violet-400" },
              { name: "Hafalan Pro 🧮", val: 12, total: 20, color: "bg-emerald-400" },
            ].map((ach, i) => (
              <div key={i} className="rounded-[16px] border border-indigo-500/[0.10] bg-[#0E1E35] p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-semibold text-white">{ach.name}</span>
                  <span className="text-[12px] text-indigo-300 font-bold">{ach.val}/{ach.total}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full rounded-full ${ach.color} shadow-[0_0_8px]`} style={{ width: `${(ach.val / ach.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[#071321]/95 pb-6 pt-3 backdrop-blur-xl border-t border-indigo-500/[0.08]">
        {[
          { emoji: "🏠", label: "Beranda" },
          { emoji: "🗺️", label: "Zona" },
          { emoji: "🏆", label: "Peringkat" },
          { emoji: "👤", label: "Profil", active: true },
        ].map((tab, i) => (
          <button key={i} className="flex flex-col items-center gap-1.5 relative w-16">
            {tab.active && <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
            <span className={`text-[20px] ${tab.active ? "opacity-100" : "opacity-35"}`}>{tab.emoji}</span>
            <span className={`text-[10px] font-semibold ${tab.active ? "text-indigo-400" : "text-[#4B6480]"}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-[14px] border border-indigo-500/20 bg-[#141B3A] px-4 py-3 shadow-2xl animate-in fade-in slide-in-from-bottom-5 whitespace-nowrap">
          <span className="text-[14px]">🐹</span>
          <span className="text-[12px] font-semibold text-indigo-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
