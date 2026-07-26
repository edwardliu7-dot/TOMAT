import React, { useState } from "react";
import { Home, Map, Trophy, User, Crown, ChevronUp, ChevronDown, BarChart2, ShoppingBag, Award, MessageCircle, LogOut } from "lucide-react";

const NAV = [
  { icon: Home, label: "Beranda" },
  { icon: Map, label: "Zona Belajar" },
  { icon: BarChart2, label: "Nilai & Tugas" },
  { icon: Trophy, label: "Papan Peringkat", active: true },
  { icon: ShoppingBag, label: "Toko" },
  { icon: Award, label: "Lencana" },
  { icon: MessageCircle, label: "Chat" },
];

export default function LeaderboardWeb() {
  const [activeTab, setActiveTab] = useState("Kelasku");

  const top3 = [
    { rank: 2, name: "Budi Santoso", kelas: "IX AK", poin: 1840, hafalan: 18, init: "BS" },
    { rank: 1, name: "Ahmad Fauzi", kelas: "IX AK", poin: 2140, hafalan: 20, init: "AF" },
    { rank: 3, name: "Citra Dewi", kelas: "IX AK", poin: 1720, hafalan: 17, init: "CD" },
  ];

  const rows = [
    { rank: 4, name: "Siti Nuraini", kelas: "IX AK", poin: 1650, hafalan: 16, delta: 1, isMe: false },
    { rank: 5, name: "Dewi Pratiwi", kelas: "IX AK", poin: 1580, hafalan: 14, delta: -1, isMe: false },
    { rank: 6, name: "Saya (Ahmad F.)", kelas: "IX AK", poin: 1520, hafalan: 12, delta: 2, isMe: true },
    { rank: 7, name: "Rio Kusuma", kelas: "IX AK", poin: 1480, hafalan: 11, delta: 0, isMe: false },
    { rank: 8, name: "Maya Sari", kelas: "IX AK", poin: 1420, hafalan: 10, delta: -2, isMe: false },
    { rank: 9, name: "Reza Maulana", kelas: "IX AK", poin: 1350, hafalan: 8, delta: 1, isMe: false },
    { rank: 10, name: "Lina Triana", kelas: "IX AK", poin: 1290, hafalan: 7, delta: 0, isMe: false },
  ];

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2-1-3
  const podiumHeights = ["h-28", "h-20", "h-16"];
  const podiumColors = [
    { avatar: "from-yellow-400/20 to-[#0E1E35]", border: "border-yellow-400", crown: true, numBg: "bg-yellow-400" },
    { avatar: "from-gray-400/20 to-[#0E1E35]", border: "border-gray-400/40", crown: false, numBg: "bg-gray-400" },
    { avatar: "from-orange-400/20 to-[#0E1E35]", border: "border-orange-400/50", crown: false, numBg: "bg-orange-400" },
  ];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-violet-500/[0.06] blur-[140px]" />
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
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                (item as any).active
                  ? "bg-indigo-500/[0.12] text-indigo-300 ring-1 ring-indigo-500/20"
                  : "text-[#4B6480] hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </div>
          ))}
        </div>
        <div className="p-3 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] hover:bg-white/[0.03] cursor-pointer">
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
          <div>
            <h1 className="text-[20px] font-black">Papan Peringkat 🏆</h1>
            <p className="text-[11px] text-[#4B6480]">Diperbarui barusan · Poin = Tugas(40%) + Level(20%) + XP(10%) + Hafalan(30%)</p>
          </div>
          <div className="flex gap-2">
            {["🏫 Kelasku", "📗 Kelas 8", "📘 Kelas 9"].map((tab) => {
              const key = tab.replace(/^[^\s]+\s/, "");
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-[12px] font-bold transition-all ${
                    activeTab === key
                      ? "bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                      : "bg-[#0E1E35] text-[#4B6480] border border-indigo-500/[0.10] hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-8">
          {/* Podium */}
          <div className="flex items-end justify-center gap-6 mb-10">
            {podiumOrder.map((u, idx) => {
              const pc = idx === 0 ? podiumColors[0] : idx === 1 ? podiumColors[1] : podiumColors[2];
              return (
                <div key={u.rank} className={`flex flex-col items-center ${idx === 0 ? "w-40" : "w-32"}`}>
                  {pc.crown && <Crown className="mb-1 text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" size={28} strokeWidth={2.5} />}
                  <div className={`relative mb-3 flex ${idx === 0 ? "h-20 w-20" : "h-16 w-16"} items-center justify-center rounded-full bg-gradient-to-b ${pc.avatar} border-2 ${pc.border} shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}>
                    <span className={`${idx === 0 ? "text-2xl" : "text-xl"} font-bold`}>{u.init}</span>
                    <div className={`absolute -bottom-3 flex ${idx === 0 ? "h-7 w-7" : "h-6 w-6"} items-center justify-center rounded-full ${pc.numBg} text-[12px] font-black text-[#071321] shadow-lg`}>
                      {u.rank}
                    </div>
                  </div>
                  <div className={`flex w-full flex-col items-center justify-end rounded-t-[16px] bg-gradient-to-t from-[#0A1628] to-${idx === 0 ? "yellow" : idx === 1 ? "gray" : "orange"}-400/10 border-t border-x ${idx === 0 ? "border-yellow-400/30" : idx === 1 ? "border-gray-400/20" : "border-orange-400/20"} ${podiumHeights[idx]} pb-4 px-3`}>
                    <span className={`text-[13px] font-bold truncate max-w-full text-center ${idx === 0 ? "text-yellow-300" : "text-white"}`}>{u.name}</span>
                    <span className={`text-[11px] font-bold mt-0.5 ${idx === 0 ? "text-yellow-200" : "text-[#4B6480]"}`}>{u.poin.toLocaleString()} Poin</span>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(3, Math.floor(u.hafalan / 4)) }).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      ))}
                      {Array.from({ length: Math.min(2, Math.floor((u.hafalan % 4) / 2)) }).map((_, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-[11px] text-[#4B6480]">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Hafalan Perkalian</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Hafalan Pembagian</div>
            <span>🧮 Progress hafalan dari 20</span>
          </div>

          {/* Table */}
          <div className="rounded-[20px] border border-indigo-500/[0.10] bg-[#0E1E35] overflow-hidden">
            <div className="grid grid-cols-[48px_1fr_100px_120px_80px_80px] gap-0 px-5 py-3 border-b border-indigo-500/[0.08] text-[10px] font-bold uppercase tracking-wider text-[#4B6480]">
              <div>#</div>
              <div>Siswa</div>
              <div className="text-center">Kelas</div>
              <div className="text-center">Poin</div>
              <div className="text-center">🧮 Hafalan</div>
              <div className="text-center">Δ</div>
            </div>
            {rows.map((user) => (
              <div
                key={user.rank}
                className={`grid grid-cols-[48px_1fr_100px_120px_80px_80px] gap-0 px-5 py-4 border-b border-indigo-500/[0.06] last:border-0 transition-colors ${
                  user.isMe ? "bg-indigo-500/[0.08]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className={`flex items-center text-[14px] font-black ${user.isMe ? "text-indigo-300" : "text-[#4B6480]"}`}>{user.rank}</div>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-[12px] shrink-0 ${user.isMe ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-[#818CF8]"}`}>
                    {user.name.charAt(0)}
                  </div>
                  <span className={`text-[13px] font-bold ${user.isMe ? "text-indigo-300" : "text-white"}`}>{user.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[12px] text-[#4B6480]">{user.kelas}</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="rounded-md bg-indigo-500/15 px-3 py-1 text-[11px] font-black text-indigo-300">{user.poin.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[12px] text-[#4B6480]">{user.hafalan}/20</span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: Math.min(3, Math.floor(user.hafalan / 4)) }).map((_, i) => (
                      <div key={i} className="h-2 w-2 rounded-full bg-emerald-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {user.delta > 0 && <span className="flex items-center text-[12px] font-bold text-emerald-400"><ChevronUp size={14} />{user.delta}</span>}
                  {user.delta < 0 && <span className="flex items-center text-[12px] font-bold text-red-400"><ChevronDown size={14} />{Math.abs(user.delta)}</span>}
                  {user.delta === 0 && <span className="text-[12px] text-[#4B6480]">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
