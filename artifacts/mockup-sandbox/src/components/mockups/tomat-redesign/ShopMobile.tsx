import React, { useState } from "react";
import { Home, Map, Trophy, User, Check, Clock, Zap } from "lucide-react";

export default function ShopMobile() {
  const [activeTab, setActiveTab] = useState("Bingkai");
  const [petHunger, setPetHunger] = useState(55);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const tabs = ["Bingkai", "Spanduk", "Tema", "Stiker", "Pet Skin", "Tomi 🐹"];

  const items: Record<string, Array<{ name: string; price: number; emoji: string; status: string; rarity?: string; edition?: string }>> = {
    "Bingkai": [
      { name: "Aurum Sovereign", price: 3500, emoji: "👑", status: "owned", rarity: "LEGENDARIS", edition: "Limited" },
      { name: "Void Monarch", price: 4200, emoji: "🌌", status: "buy", rarity: "LEGENDARIS", edition: "Limited" },
      { name: "Celestia Relic", price: 2800, emoji: "✨", status: "buy", rarity: "EPIK" },
      { name: "Royal Math.", price: 3200, emoji: "📐", status: "buy", rarity: "EPIK" },
    ],
    "Spanduk": [
      { name: "Pijar Bintang", price: 1500, emoji: "🌟", status: "owned", rarity: "LANGKA" },
      { name: "Dekrit Mahaguru", price: 2000, emoji: "📜", status: "buy", rarity: "EPIK" },
      { name: "Aurora Math", price: 1200, emoji: "🎆", status: "buy", rarity: "UMUM" },
      { name: "Galaksi Angka", price: 1800, emoji: "🌌", status: "buy", rarity: "LANGKA" },
    ],
    "Tema": [
      { name: "Void Dark", price: 2500, emoji: "🌑", status: "buy", rarity: "EPIK" },
      { name: "Neon Math", price: 1500, emoji: "💜", status: "buy", rarity: "LANGKA" },
      { name: "Ocean Deep", price: 800, emoji: "🌊", status: "owned", rarity: "UMUM" },
    ],
    "Stiker": [
      { name: "Kalkulator Gaul", price: 50, emoji: "🧮", status: "buy", rarity: "UMUM" },
      { name: "Pecahan Lucu", price: 80, emoji: "🍕", status: "owned", rarity: "UMUM" },
      { name: "Pythagoras Epic", price: 150, emoji: "📐", status: "buy", rarity: "LANGKA" },
      { name: "Boss Raid Win", price: 300, emoji: "💥", status: "buy", rarity: "EPIK" },
    ],
    "Pet Skin": [
      { name: "Tomi Golden", price: 2000, emoji: "✨🐹", status: "buy", rarity: "LANGKA" },
      { name: "Tomi Cosmic", price: 3000, emoji: "🌌🐹", status: "buy", rarity: "EPIK" },
      { name: "Tomi Void", price: 4000, emoji: "🖤🐹", status: "buy", rarity: "LEGENDARIS", edition: "Limited" },
    ],
    "Tomi 🐹": [],
  };

  const rarityColor = (r?: string) =>
    r === "LEGENDARIS" ? "text-yellow-300 bg-yellow-400/10 border-yellow-400/20"
    : r === "EPIK" ? "text-violet-300 bg-violet-400/10 border-violet-400/20"
    : r === "LANGKA" ? "text-blue-300 bg-blue-400/10 border-blue-400/20"
    : "text-gray-400 bg-white/[0.05] border-white/10";

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative h-[100dvh] overflow-y-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#071321]/95 backdrop-blur-xl px-4 py-4 border-b border-indigo-500/[0.08]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-black tracking-tight">Toko 🛒</h1>
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-3 py-2">
              <span className="text-[13px]">🪙</span>
              <span className="text-[13px] font-bold text-yellow-200">385</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-[#4B6480]">Belanjakan koinmu untuk item eksklusif</p>
        </div>

        {/* Tab bar */}
        <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-[12px] px-4 py-2 text-[12px] font-bold transition-all ${
                activeTab === tab
                  ? "bg-indigo-500 text-white shadow-[0_2px_12px_rgba(99,102,241,0.3)]"
                  : "bg-[#0E1E35] border border-indigo-500/[0.10] text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tomi Tab */}
        {activeTab === "Tomi 🐹" ? (
          <div className="px-4 mt-5 space-y-4">
            {/* Pet status */}
            <div className="rounded-[20px] border border-indigo-500/20 bg-[#0E1E35] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#071321] border border-indigo-500/10 text-5xl shadow-inner">
                  🐹
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-white text-[16px]">Tomi</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${petHunger > 60 ? "text-emerald-300 bg-emerald-400/10" : petHunger > 30 ? "text-yellow-300 bg-yellow-400/10" : "text-red-300 bg-red-400/10"}`}>
                      {petHunger > 60 ? "Kenyang 😊" : petHunger > 30 ? "Agak lapar 😕" : "Lapar sekali 😢"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B6480] mb-2">Tingkat kenyang:</div>
                  <div className="h-3 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${petHunger > 60 ? "bg-emerald-400" : petHunger > 30 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: `${petHunger}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-[#4B6480]">Lapar</span>
                    <span className="text-[9px] text-[#4B6480]">{petHunger}%</span>
                    <span className="text-[9px] text-[#4B6480]">Kenyang</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Food items */}
            <div>
              <h3 className="text-[13px] font-bold text-white/80 mb-3">Pilih Makanan</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Wortel", emoji: "🥕", price: 25, fill: 15, desc: "Camilan ringan" },
                  { name: "Salad Hijau", emoji: "🥗", price: 50, fill: 30, desc: "Makan siang sehat" },
                  { name: "Wortel Premium", emoji: "🥕✨", price: 100, fill: 50, desc: "Extra fresh!" },
                  { name: "Pesta Makan", emoji: "🎉🥗", price: 200, fill: 100, desc: "Full kenyang" },
                ].map((food, i) => (
                  <div key={i} className="rounded-[16px] bg-[#0E1E35] border border-indigo-500/[0.10] p-3 flex flex-col items-center text-center">
                    <div className="text-3xl mb-2">{food.emoji}</div>
                    <div className="font-bold text-[13px] text-white mb-0.5">{food.name}</div>
                    <div className="text-[10px] text-[#4B6480] mb-2">{food.desc}</div>
                    <div className="text-[10px] text-emerald-300 mb-2">+{food.fill}% kenyang</div>
                    <button
                      onClick={() => {
                        setPetHunger(Math.min(100, petHunger + food.fill));
                        showToast(`${food.name} diberikan! Tomi senang 🐹`);
                      }}
                      className="w-full py-2 rounded-[10px] bg-indigo-500/15 border border-indigo-500/20 text-[11px] font-bold text-indigo-300 hover:bg-indigo-500/25 transition-colors flex items-center justify-center gap-1"
                    >
                      🪙 {food.price}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 mt-5">
            {/* Featured item */}
            {activeTab === "Bingkai" && (
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1440] to-[#0E1E35] border border-yellow-400/20 rounded-[20px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-5">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <span className="rounded-md bg-yellow-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-yellow-300 border border-yellow-400/20">
                    🔥 Item Terpilih
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-red-400 border border-red-500/20">
                    <Clock size={10} /> Sisa 8 item
                  </span>
                </div>
                <div className="flex gap-4 items-center relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071321]/50 border border-yellow-400/15 text-3xl shadow-inner">
                    🌌
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] font-black leading-tight mb-0.5 text-white">Void Monarch</h3>
                    <p className="text-[10px] text-[#4B6480]">Bingkai eksklusif bergaya kegelapan kosmik</p>
                    <div className="mt-1 text-[9px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 rounded px-1.5 py-0.5 inline-block">LEGENDARIS · LIMITED</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px]">🪙</span>
                    <span className="text-[15px] font-black text-yellow-300">4.200</span>
                  </div>
                  <button
                    onClick={() => showToast("Void Monarch dibeli! 🌌")}
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black rounded-[10px] px-5 py-2.5 text-[12px] shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    BELI SEKARANG
                  </button>
                </div>
              </div>
            )}

            {/* Item Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {(items[activeTab] || []).map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[16px] bg-[#0E1E35] border border-indigo-500/[0.10] p-3 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className={`text-[8px] font-bold border rounded px-1.5 py-0.5 ${rarityColor(item.rarity)}`}>{item.rarity}</span>
                    {item.edition && <span className="text-[8px] font-bold text-red-400">LTD</span>}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-[#071321]/60 flex items-center justify-center text-2xl mb-2 shadow-inner">
                    {item.emoji}
                  </div>
                  <h4 className="font-bold text-[12px] text-white mb-1 leading-tight">{item.name}</h4>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-[11px]">🪙</span>
                    <span className="text-[12px] font-bold text-yellow-300">{item.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-auto w-full">
                    {item.status === "buy" && (
                      <button
                        onClick={() => showToast(`${item.name} dibeli!`)}
                        className="w-full py-2 rounded-[10px] bg-indigo-500/[0.12] border border-indigo-500/20 text-indigo-300 text-[11px] font-bold hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-colors"
                      >
                        BELI
                      </button>
                    )}
                    {item.status === "owned" && (
                      <div className="w-full py-2 rounded-[10px] bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1">
                        <Check size={12} /> DIPAKAI
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#141B3A] border border-indigo-500/20 px-4 py-3 rounded-[14px] text-[12px] font-bold text-indigo-100 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 whitespace-nowrap">
            <Zap size={14} className="text-indigo-400" />
            {toast}
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <div className="fixed bottom-0 w-full bg-[#071321]/95 backdrop-blur-xl border-t border-indigo-500/[0.08] pb-6 pt-3 px-6 z-30">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {[
            { emoji: "🏠", label: "Beranda" },
            { emoji: "🗺️", label: "Zona" },
            { emoji: "🏆", label: "Peringkat" },
            { emoji: "👤", label: "Profil" },
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center gap-1.5 p-2">
              <span className="text-[20px] opacity-35">{item.emoji}</span>
              <span className="text-[10px] text-[#4B6480]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
