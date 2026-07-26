import React, { useState } from "react";
import { Home, Map, Trophy, User, BarChart2, ShoppingBag, Award, MessageCircle, Edit3, Zap, LogOut, ArrowRight } from "lucide-react";

const NAV = [
  { icon: Home, label: "Beranda" },
  { icon: Map, label: "Zona Belajar" },
  { icon: BarChart2, label: "Nilai & Tugas" },
  { icon: Trophy, label: "Papan Peringkat" },
  { icon: ShoppingBag, label: "Toko" },
  { icon: Award, label: "Lencana" },
  { icon: MessageCircle, label: "Chat" },
];

export default function ProfileWeb() {
  const [petHunger, setPetHunger] = useState(75);
  const [toast, setToast] = useState("");

  const feedPet = () => {
    setPetHunger(Math.min(100, petHunger + 15));
    setToast("Tomi diberi makan! 🥕 Kenyang +15%");
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-0 top-[30%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[150px]" />
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
            <div key={item.label} className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-bold text-[#4B6480] hover:bg-white/[0.03] hover:text-white transition-all cursor-pointer">
              <item.icon size={17} />
              {item.label}
            </div>
          ))}
        </div>
        <div className="p-3 mt-auto border-t border-indigo-500/[0.06]">
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
          <h1 className="text-[20px] font-black">Profil Saya 👤</h1>
          <button className="flex items-center gap-2 rounded-[12px] border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-2 text-[13px] font-bold text-indigo-300 hover:bg-indigo-500/10 transition-colors">
            <Edit3 size={16} /> Edit Profil
          </button>
        </header>

        <div className="max-w-6xl mx-auto p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Left — profile card */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* Avatar card */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="absolute -inset-2.5 rounded-full border-2 border-indigo-500/40 shadow-[0_0_24px_rgba(99,102,241,0.25)]" />
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[36px] font-black shadow-[0_8px_32px_rgba(99,102,241,0.4)]">
                    AF
                  </div>
                  <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-[#0E1E35]" />
                </div>
                <h2 className="text-[22px] font-black">Ahmad Fauzi</h2>
                <p className="text-[13px] text-[#4B6480] mt-1">IX Al Khawarizmi · SMP TISA</p>
                <div className="mt-3 flex items-center gap-1.5 rounded-full border border-yellow-400/25 bg-yellow-400/[0.08] px-3 py-1.5">
                  <span className="text-[12px]">👑</span>
                  <span className="text-[12px] font-bold text-yellow-300">Aurum Sovereign</span>
                </div>

                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3 mt-5">
                  {[
                    { emoji: "⭐", val: "Lv. 8", label: "Level" },
                    { emoji: "⚡", val: "2.140", label: "Total XP" },
                    { emoji: "🏆", val: "#4", label: "Rank Kelas" },
                    { emoji: "🪙", val: "385", label: "Koin" },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center rounded-[14px] border border-indigo-500/[0.08] bg-[#0A1628] py-3">
                      <span className="text-[18px] mb-0.5">{s.emoji}</span>
                      <div className="text-[16px] font-black">{s.val}</div>
                      <div className="text-[10px] text-[#4B6480] mt-0.5 font-bold">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomi pet */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">🐹</span>
                    <div>
                      <div className="font-bold text-[15px]">Tomi</div>
                      <div className="text-[10px] text-[#4B6480]">Pet Marmot</div>
                    </div>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${petHunger > 60 ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" : petHunger > 30 ? "text-yellow-300 bg-yellow-400/10 border-yellow-400/20" : "text-red-300 bg-red-400/10 border-red-400/20"}`}>
                    {petHunger > 60 ? "Kenyang 😊" : petHunger > 30 ? "Lapar 😕" : "Lapar Sekali 😢"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071321] border border-indigo-500/10 text-4xl shadow-inner shrink-0">🐹</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-emerald-300 font-semibold">Kenyang</span>
                      <span className="text-white font-bold">{petHunger}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/[0.08] overflow-hidden mb-3">
                      <div className={`h-full rounded-full transition-all duration-500 ${petHunger > 60 ? "bg-emerald-400" : petHunger > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${petHunger}%` }} />
                    </div>
                    <button onClick={feedPet} className="w-full rounded-[10px] border border-yellow-400/25 bg-yellow-400/[0.08] py-2 text-[12px] font-bold text-yellow-300 hover:bg-yellow-400/20 transition-colors">
                      Beri Makan 🥕 (Wortel)
                    </button>
                  </div>
                </div>
              </div>

              {/* Competition shortcuts */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-5">
                <h3 className="font-bold text-[15px] mb-4">Mode Kompetisi</h3>
                <div className="space-y-3">
                  {[
                    { emoji: "⚔️", label: "Duel Katak Pelompat", sub: "PvP real-time", color: "border-indigo-500/20" },
                    { emoji: "💥", label: "Boss Raid", sub: "Co-op class battle", color: "border-orange-500/20" },
                    { emoji: "🏆", label: "Turnamen Kelas", sub: "Bracket tournament", color: "border-yellow-500/20" },
                  ].map((m, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-[14px] border ${m.color} bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors`}>
                      <span className="text-[20px]">{m.emoji}</span>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold">{m.label}</div>
                        <div className="text-[10px] text-[#4B6480]">{m.sub}</div>
                      </div>
                      <ArrowRight size={14} className="text-[#4B6480]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — badges + achievements */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Active cosmetics */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6">
                <h3 className="font-bold text-[17px] mb-4">Kosmetik Aktif</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { type: "Bingkai", name: "Aurum Sovereign", emoji: "👑", rarity: "LEGENDARIS", color: "border-yellow-400/30 bg-yellow-400/[0.05]" },
                    { type: "Spanduk", name: "Pijar Bintang", emoji: "🌟", rarity: "LANGKA", color: "border-blue-400/25 bg-blue-400/[0.05]" },
                    { type: "Tema", name: "Ocean Deep", emoji: "🌊", rarity: "UMUM", color: "border-indigo-500/20 bg-indigo-500/[0.05]" },
                  ].map((c, i) => (
                    <div key={i} className={`flex flex-col items-center rounded-[18px] border ${c.color} p-5 text-center`}>
                      <span className="text-[32px] mb-2">{c.emoji}</span>
                      <div className="text-[11px] text-[#4B6480] mb-1 uppercase tracking-wider">{c.type}</div>
                      <div className="text-[14px] font-bold">{c.name}</div>
                      <div className="mt-2 text-[9px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">{c.rarity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[17px]">Koleksi Lencana 🏅</h3>
                  <span className="text-[13px] text-[#4B6480]">12 dari 30</span>
                </div>
                <div className="grid grid-cols-8 gap-3">
                  {[
                    "🥇", "⚡", "🎯", "🔥", "📚", "🌟", "💡", "🛡️",
                    "⚔️", "🏆", "🌙", "🎮", "💎", "👑", "🔮", "🎪",
                    "🌊", "🎭", "🦋", "🌈", "🎸", "🚀", "🌺", "🔔",
                  ].map((emoji, i) => (
                    <div
                      key={i}
                      className={`flex h-12 items-center justify-center rounded-[14px] border text-[20px] transition-all ${
                        i < 12
                          ? "border-indigo-500/15 bg-[#0A1628] hover:border-indigo-500/30 cursor-pointer shadow-sm"
                          : "border-white/[0.04] bg-[#0A1628]/40 opacity-20"
                      }`}
                    >
                      <span className={i >= 12 ? "grayscale" : ""}>{emoji}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6">
                <h3 className="font-bold text-[17px] mb-4">Progres Pencapaian</h3>
                <div className="space-y-4">
                  {[
                    { name: "Penjelajah Misi", desc: "Selesaikan 10 tugas dari guru", val: 7, total: 10, color: "bg-indigo-400" },
                    { name: "Duel Master", desc: "Menangkan 20 duel katak pelompat", val: 12, total: 20, color: "bg-violet-400" },
                    { name: "Hafalan Pro 🧮", desc: "Selesaikan 20 hafalan perkalian & pembagian", val: 12, total: 20, color: "bg-emerald-400" },
                    { name: "Boss Slayer 💥", desc: "Berpartisipasi dalam 5 Boss Raid", val: 3, total: 5, color: "bg-orange-400" },
                  ].map((ach, i) => (
                    <div key={i} className="rounded-[16px] border border-indigo-500/[0.08] bg-[#0A1628] p-4">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <div className="text-[14px] font-bold">{ach.name}</div>
                          <div className="text-[11px] text-[#4B6480] mt-0.5">{ach.desc}</div>
                        </div>
                        <span className="text-[14px] font-black text-indigo-300">{ach.val}/{ach.total}</span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                        <div className={`h-full rounded-full ${ach.color} shadow-[0_0_8px]`} style={{ width: `${(ach.val / ach.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-[16px] border border-indigo-500/30 bg-[#141B3A] px-6 py-4 text-[13px] font-bold text-indigo-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-300">
          <span className="text-[18px]">🐹</span>
          {toast}
        </div>
      )}
    </div>
  );
}
