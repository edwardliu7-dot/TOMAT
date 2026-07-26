import React, { useState } from "react";
import { Home, Map, Trophy, User, Crown, ChevronUp, ChevronDown } from "lucide-react";

export default function LeaderboardMobile() {
  const [activeTab, setActiveTab] = useState("Kelasku");

  const leaderboardData = [
    { rank: 4, name: "Siti Nuraini", kelas: "IX AK", poin: 1650, hafalan: 16, delta: 1, isCurrentUser: false },
    { rank: 5, name: "Dewi Pratiwi", kelas: "IX AK", poin: 1580, hafalan: 14, delta: -1, isCurrentUser: false },
    { rank: 6, name: "Saya (Ahmad F.)", kelas: "IX AK", poin: 1520, hafalan: 12, delta: 2, isCurrentUser: true },
    { rank: 7, name: "Rio Kusuma", kelas: "IX AK", poin: 1480, hafalan: 11, delta: 0, isCurrentUser: false },
    { rank: 8, name: "Maya Sari", kelas: "IX AK", poin: 1420, hafalan: 10, delta: -2, isCurrentUser: false },
    { rank: 9, name: "Reza Maulana", kelas: "IX AK", poin: 1350, hafalan: 8, delta: 1, isCurrentUser: false },
    { rank: 10, name: "Lina Triana", kelas: "IX AK", poin: 1290, hafalan: 7, delta: 0, isCurrentUser: false },
  ];

  const topThree = [
    { rank: 2, name: "Budi S.", poin: 1840, init: "BS", hafalan: 18, color: "from-gray-400/20 to-[#0E1E35]", border: "border-gray-400/40", height: "h-20" },
    { rank: 1, name: "Ahmad F.", poin: 2140, init: "AF", hafalan: 20, color: "from-yellow-400/20 to-[#0E1E35]", border: "border-yellow-400", height: "h-28" },
    { rank: 3, name: "Citra A.", poin: 1720, init: "CA", hafalan: 17, color: "from-orange-400/20 to-[#0E1E35]", border: "border-orange-400/50", height: "h-16" },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative z-10 h-full overflow-y-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#071321]/90 px-5 pt-6 pb-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-black tracking-tight text-white">Papan Peringkat 🏆</h1>
              <p className="text-[10px] text-[#4B6480] font-semibold tracking-wider uppercase mt-1">Diperbarui barusan</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.3)]">
              <span className="text-lg">🍅</span>
            </div>
          </div>
        </div>

        {/* Scoring formula pill */}
        <div className="mx-5 mt-3 rounded-[12px] border border-indigo-500/15 bg-[#0E1E35] px-3 py-2 text-[10px] text-[#4B6480] font-semibold">
          <span className="text-indigo-300 font-bold">Poin</span> = Rata² Tugas (40%) + Level (20%) + XP (10%) + Hafalan (30%)
        </div>

        {/* Tab bar */}
        <div className="mt-4 flex gap-2 px-5 overflow-x-auto no-scrollbar">
          {["🏫 Kelasku", "📗 Kelas 8", "📘 Kelas 9"].map((tab) => {
            const key = tab.replace(/^[^\s]+\s/, "");
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(key)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[12px] font-bold transition-all ${
                  activeTab === key
                    ? "bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                    : "bg-[#0E1E35] text-[#4B6480] border border-indigo-500/[0.10] hover:bg-[#141B3A]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Top 3 Podium */}
        <div className="mt-8 px-5">
          <div className="flex items-end justify-center gap-3">
            {topThree.map((u) => (
              <div key={u.rank} className={`flex flex-col items-center relative z-${u.rank === 1 ? 20 : 10} ${u.rank === 1 ? "w-28" : "w-24"}`}>
                {u.rank === 1 && (
                  <Crown className="mb-1 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" size={24} strokeWidth={2.5} />
                )}
                <div className={`relative mb-3 flex ${u.rank === 1 ? "h-16 w-16" : "h-14 w-14"} items-center justify-center rounded-full bg-gradient-to-b ${u.color} border-2 ${u.border} shadow-[0_4px_16px_rgba(0,0,0,0.5)]`}>
                  <span className={`${u.rank === 1 ? "text-xl" : "text-lg"} font-bold`}>{u.init}</span>
                  <div className={`absolute -bottom-2 flex ${u.rank === 1 ? "h-6 w-6" : "h-5 w-5"} items-center justify-center rounded-full ${u.rank === 1 ? "bg-yellow-400" : u.rank === 2 ? "bg-gray-400" : "bg-orange-400"} text-[${u.rank === 1 ? "12" : "10"}px] font-black text-[#071321]`}>
                    {u.rank}
                  </div>
                </div>
                <div className={`flex w-full flex-col items-center justify-end rounded-t-[16px] bg-gradient-to-t from-[#0A1628] ${u.rank === 1 ? "to-yellow-500/10 border-yellow-400/30" : u.rank === 2 ? "to-gray-400/10 border-gray-400/20" : "to-orange-400/10 border-orange-400/20"} border-t border-x ${u.height} pb-3`}>
                  <span className={`text-[${u.rank === 1 ? "12" : "11"}px] font-bold truncate max-w-[80px] ${u.rank === 1 ? "text-yellow-300" : "text-white"}`}>{u.name}</span>
                  <span className={`text-[10px] font-bold mt-0.5 ${u.rank === 1 ? "text-yellow-200" : "text-[#4B6480]"}`}>{u.poin.toLocaleString()} Poin</span>
                  <div className="flex gap-0.5 mt-1">
                    <div className="h-1 w-1 rounded-full bg-emerald-400" />
                    <div className="h-1 w-1 rounded-full bg-emerald-400" />
                    <div className="h-1 w-1 rounded-full bg-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rounded-full" />
        </div>

        {/* Hafalan legend */}
        <div className="mx-5 mt-4 flex items-center gap-3 text-[10px] text-[#4B6480]">
          <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-400" /> Perkalian</div>
          <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-blue-400" /> Pembagian</div>
          <span>🧮 Hafalan</span>
        </div>

        {/* Ranked list */}
        <div className="mt-4 px-5 space-y-2.5">
          {leaderboardData.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center rounded-[14px] px-3 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all ${
                user.isCurrentUser
                  ? "bg-indigo-500/[0.10] border border-indigo-500/30"
                  : "bg-[#0E1E35] border border-indigo-500/[0.08]"
              }`}
            >
              <div className="w-8 text-center font-black text-[#4B6480] text-[13px]">{user.rank}</div>

              <div className={`ml-2 flex h-9 w-9 items-center justify-center rounded-full font-bold text-[12px] ${user.isCurrentUser ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-[#818CF8]"}`}>
                {user.name.charAt(0)}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className={`truncate text-[12px] font-bold ${user.isCurrentUser ? "text-indigo-300" : "text-white"}`}>
                  {user.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-[#4B6480]">🧮 {user.hafalan}/20</span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: Math.min(3, Math.floor(user.hafalan / 4)) }).map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    ))}
                    {Array.from({ length: Math.min(2, Math.floor((user.hafalan % 4) / 2)) }).map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="rounded-md bg-indigo-500/15 px-2.5 py-1 text-[10px] font-black text-indigo-300">
                  {user.poin.toLocaleString()} Poin
                </div>
                <div className="mt-1 flex items-center text-[10px] font-bold">
                  {user.delta > 0 && <span className="text-emerald-400 flex items-center"><ChevronUp size={12} />{user.delta}</span>}
                  {user.delta < 0 && <span className="text-red-400 flex items-center"><ChevronDown size={12} />{Math.abs(user.delta)}</span>}
                  {user.delta === 0 && <span className="text-[#4B6480] px-1">—</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-indigo-500/[0.08] bg-[#071321]/95 pb-5 pt-3 backdrop-blur-xl">
        <div className="flex justify-around px-2">
          {[
            { emoji: "🏠", label: "Beranda" },
            { emoji: "🗺️", label: "Zona" },
            { emoji: "🏆", label: "Peringkat", active: true },
            { emoji: "👤", label: "Profil" },
          ].map((item) => (
            <button key={item.label} className="relative flex flex-col items-center p-2 w-16">
              {item.active && (
                <div className="absolute -top-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
              <span className={`text-[20px] mb-1 ${item.active ? "opacity-100" : "opacity-35"}`}>{item.emoji}</span>
              <span className={`text-[10px] font-bold ${item.active ? "text-indigo-400" : "text-[#4B6480]"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
