import React, { useState } from "react";
import { Home, Map, Trophy, User, BarChart2, ShoppingBag, Award, MessageCircle, Check, Clock, Zap, LogOut } from "lucide-react";

const NAV = [
  { icon: Home, label: "Beranda" },
  { icon: Map, label: "Zona Belajar" },
  { icon: BarChart2, label: "Nilai & Tugas" },
  { icon: Trophy, label: "Papan Peringkat" },
  { icon: ShoppingBag, label: "Toko", active: true },
  { icon: Award, label: "Lencana" },
  { icon: MessageCircle, label: "Chat" },
];

export default function ShopWeb() {
  const [activeTab, setActiveTab] = useState("Bingkai");
  const [toast, setToast] = useState<string | null>(null);
  const [petHunger, setPetHunger] = useState(55);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const tabs = ["Bingkai", "Spanduk", "Tema", "Stiker", "Pet Skin", "Tomi 🐹"];

  const rarityStyle = (r?: string) =>
    r === "LEGENDARIS" ? "text-yellow-300 bg-yellow-400/10 border-yellow-400/20"
    : r === "EPIK" ? "text-violet-300 bg-violet-400/10 border-violet-400/20"
    : r === "LANGKA" ? "text-blue-300 bg-blue-400/10 border-blue-400/20"
    : "text-gray-400 bg-white/[0.05] border-white/10";

  const shopItems = {
    "Bingkai": [
      { name: "Aurum Sovereign", price: 3500, emoji: "👑", status: "owned", rarity: "LEGENDARIS", edition: "Limited", desc: "Bingkai emas eksklusif untuk para juara" },
      { name: "Void Monarch", price: 4200, emoji: "🌌", status: "buy", rarity: "LEGENDARIS", edition: "Limited", desc: "Bingkai kegelapan kosmik nan megah" },
      { name: "Celestia Relic", price: 2800, emoji: "✨", status: "buy", rarity: "EPIK", desc: "Bingkai peninggalan bintang kuno" },
      { name: "Royal Mathematician", price: 3200, emoji: "📐", status: "buy", rarity: "EPIK", desc: "Bingkai sang matematikawan agung" },
      { name: "Galaksi Biru", price: 1500, emoji: "🌀", status: "buy", rarity: "LANGKA", desc: "Bingkai biru galaksi yang indah" },
      { name: "Standar Belajar", price: 300, emoji: "🔵", status: "buy", rarity: "UMUM", desc: "Bingkai sederhana namun elegan" },
    ],
    "Spanduk": [
      { name: "Pijar Bintang", price: 1500, emoji: "🌟", status: "owned", rarity: "LANGKA", desc: "Spanduk bintang bersinar" },
      { name: "Dekrit Mahaguru", price: 2000, emoji: "📜", status: "buy", rarity: "EPIK", desc: "Spanduk keputusan sang guru" },
      { name: "Aurora Math", price: 1200, emoji: "🎆", status: "buy", rarity: "LANGKA", desc: "Cahaya aurora di langit matematika" },
      { name: "Galaksi Angka", price: 1800, emoji: "🌌", status: "buy", rarity: "LANGKA", desc: "Angka-angka di galaksi jauh" },
    ],
    "Tema": [
      { name: "Void Dark", price: 2500, emoji: "🌑", status: "buy", rarity: "EPIK", desc: "Tema gelap kekosongan kosmik" },
      { name: "Neon Math", price: 1500, emoji: "💜", status: "buy", rarity: "LANGKA", desc: "Tema neon ungu cerah berpendar" },
      { name: "Ocean Deep", price: 800, emoji: "🌊", status: "owned", rarity: "UMUM", desc: "Tema biru laut dalam yang tenang" },
    ],
    "Stiker": [
      { name: "Kalkulator Gaul", price: 50, emoji: "🧮", status: "buy", rarity: "UMUM", desc: "Kalkulator dengan gaya terkini" },
      { name: "Pecahan Lucu", price: 80, emoji: "🍕", status: "owned", rarity: "UMUM", desc: "Pecahan pizza yang menggemaskan" },
      { name: "Pythagoras Epic", price: 150, emoji: "📐", status: "buy", rarity: "LANGKA", desc: "Segitiga siku-siku yang heroik" },
      { name: "Boss Raid Win", price: 300, emoji: "💥", status: "buy", rarity: "EPIK", desc: "Stiker kemenangan boss raid" },
      { name: "Duel Champion", price: 250, emoji: "⚔️", status: "buy", rarity: "LANGKA", desc: "Juara duel katak pelompat" },
    ],
    "Pet Skin": [
      { name: "Tomi Original", price: 0, emoji: "🐹", status: "owned", rarity: "UMUM", desc: "Penampilan asli Tomi si marmot" },
      { name: "Tomi Golden", price: 2000, emoji: "✨🐹", status: "buy", rarity: "LANGKA", desc: "Tomi dengan bulu emas berkilauan" },
      { name: "Tomi Cosmic", price: 3000, emoji: "🌌🐹", status: "buy", rarity: "EPIK", desc: "Tomi dari dimensi kosmik" },
      { name: "Tomi Void", price: 4000, emoji: "🖤🐹", status: "buy", rarity: "LEGENDARIS", edition: "Limited", desc: "Tomi kegelapan yang misterius" },
    ],
    "Tomi 🐹": [],
  };

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
          <h1 className="text-[20px] font-black">Toko 🛒</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-4 py-2">
              <span className="text-[14px]">🪙</span>
              <span className="text-[14px] font-black text-yellow-200">385 Koin</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Tab bar */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-[12px] px-5 py-2.5 text-[13px] font-bold transition-all ${
                  activeTab === tab
                    ? "bg-indigo-500 text-white shadow-[0_2px_16px_rgba(99,102,241,0.3)]"
                    : "bg-[#0E1E35] border border-indigo-500/[0.10] text-white/60 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tomi Tab */}
          {activeTab === "Tomi 🐹" ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Tomi status */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6">
                <h3 className="font-bold text-[17px] mb-4">Status Tomi</h3>
                <div className="flex items-center gap-5">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[20px] bg-[#071321] border border-indigo-500/10 text-5xl shadow-inner shrink-0">🐹</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-[18px]">Tomi</span>
                      <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${petHunger > 60 ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20" : petHunger > 30 ? "text-yellow-300 bg-yellow-400/10 border-yellow-400/20" : "text-red-300 bg-red-400/10 border-red-400/20"}`}>
                        {petHunger > 60 ? "Kenyang 😊" : petHunger > 30 ? "Agak lapar 😕" : "Lapar sekali 😢"}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#4B6480] mb-2">Tingkat kenyang: {petHunger}%</div>
                    <div className="h-3 w-full rounded-full bg-white/[0.08] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${petHunger > 60 ? "bg-emerald-400" : petHunger > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${petHunger}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#4B6480] mt-1">
                      <span>Lapar</span><span>Kenyang</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food grid */}
              <div className="rounded-[24px] border border-indigo-500/[0.12] bg-[#0E1E35] p-6">
                <h3 className="font-bold text-[17px] mb-4">Pilih Makanan</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Wortel", emoji: "🥕", price: 25, fill: 15 },
                    { name: "Salad Hijau", emoji: "🥗", price: 50, fill: 30 },
                    { name: "Wortel Premium", emoji: "🥕✨", price: 100, fill: 50 },
                    { name: "Pesta Makan", emoji: "🎉🥗", price: 200, fill: 100 },
                  ].map((food, i) => (
                    <div key={i} className="rounded-[16px] border border-indigo-500/[0.10] bg-[#0A1628] p-4 flex flex-col items-center text-center">
                      <div className="text-[28px] mb-2">{food.emoji}</div>
                      <div className="font-bold text-[14px] mb-0.5">{food.name}</div>
                      <div className="text-[11px] text-emerald-300 mb-3">+{food.fill}% kenyang</div>
                      <button
                        onClick={() => {
                          setPetHunger(Math.min(100, petHunger + food.fill));
                          showToast(`${food.name} diberikan! Tomi senang 🐹`);
                        }}
                        className="w-full py-2 rounded-[10px] bg-indigo-500/15 border border-indigo-500/20 text-[12px] font-bold text-indigo-300 hover:bg-indigo-500/25 transition-colors"
                      >
                        🪙 {food.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Featured */}
              {activeTab === "Bingkai" && (
                <div className="relative overflow-hidden bg-gradient-to-br from-[#1A1440] to-[#0E1E35] border border-yellow-400/20 rounded-[24px] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] mb-6">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-[40px] pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#071321]/60 border border-yellow-400/15 text-5xl shadow-inner shrink-0">🌌</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="rounded-md bg-yellow-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-300 border border-yellow-400/20">🔥 Item Pilihan</span>
                        <span className="flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-black text-red-400 border border-red-500/20"><Clock size={10} /> Sisa 8 item</span>
                      </div>
                      <h3 className="text-[22px] font-black mb-1">Void Monarch</h3>
                      <p className="text-[13px] text-[#4B6480] mb-1">Bingkai kegelapan kosmik eksklusif — LIMITED EDITION</p>
                      <div className="text-[10px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 rounded px-2 py-0.5 inline-block">LEGENDARIS</div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[24px]">🪙</span>
                        <span className="text-[24px] font-black text-yellow-300">4.200</span>
                      </div>
                      <button
                        onClick={() => showToast("Void Monarch dibeli! 🌌")}
                        className="rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-[14px] font-black text-white shadow-[0_6px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all"
                      >
                        BELI SEKARANG
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Item grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(shopItems[activeTab] || []).map((item, idx) => (
                  <div key={idx} className="rounded-[20px] bg-[#0E1E35] border border-indigo-500/[0.10] p-5 flex flex-col shadow-sm hover:border-indigo-500/20 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-bold border rounded px-2 py-0.5 ${rarityStyle(item.rarity)}`}>{item.rarity}</span>
                      {(item as any).edition && <span className="text-[9px] font-bold text-red-400 border border-red-400/20 rounded px-1.5 py-0.5 bg-red-400/10">LTD</span>}
                    </div>
                    <div className="flex h-16 w-16 self-center items-center justify-center rounded-[18px] bg-[#071321] border border-indigo-500/10 text-3xl mb-3 shadow-inner">{item.emoji}</div>
                    <h4 className="font-bold text-[14px] text-white mb-1 leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-[#4B6480] mb-3 flex-1">{item.desc}</p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[13px]">🪙</span>
                      <span className="text-[14px] font-black text-yellow-300">{item.price.toLocaleString()}</span>
                    </div>
                    {item.status === "buy" && (
                      <button
                        onClick={() => showToast(`${item.name} dibeli!`)}
                        className="w-full py-2.5 rounded-[12px] bg-indigo-500/[0.12] border border-indigo-500/20 text-[12px] font-bold text-indigo-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-colors"
                      >
                        BELI
                      </button>
                    )}
                    {item.status === "owned" && (
                      <div className="w-full py-2.5 rounded-[12px] bg-emerald-500/[0.08] border border-emerald-500/20 text-[12px] font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                        <Check size={13} /> DIPAKAI
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-[16px] border border-indigo-500/30 bg-[#141B3A] px-6 py-4 text-[13px] font-bold text-indigo-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-8 duration-300">
          <Zap size={16} className="text-indigo-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
