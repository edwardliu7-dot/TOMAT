import { useState } from "react";

// Contoh data stiker yang bisa dimiliki siswa
const STIKER_CATALOG = [
  { id: "stiker_roket",     emoji: "🚀", nama: "Roket Belajar",    tier: "common"  },
  { id: "stiker_bintang",   emoji: "⭐", nama: "Bintang Lima",     tier: "common"  },
  { id: "stiker_api",       emoji: "🔥", nama: "On Fire",          tier: "common"  },
  { id: "stiker_petir",     emoji: "⚡", nama: "Kilat",            tier: "common"  },
  { id: "stiker_otak",      emoji: "🧠", nama: "Brainiac",         tier: "rare"    },
  { id: "stiker_mahkota",   emoji: "👑", nama: "Raja Matematika",  tier: "rare"    },
  { id: "stiker_berlian",   emoji: "💎", nama: "Berlian",          tier: "rare"    },
  { id: "stiker_sihir",     emoji: "✨", nama: "Ajaib",            tier: "rare"    },
  { id: "stiker_naga",      emoji: "🐉", nama: "Sang Naga",        tier: "epic"    },
  { id: "stiker_galaksi",   emoji: "🌌", nama: "Galaksi",          tier: "epic"    },
];

const TIER_COLORS: Record<string, { ring: string; bg: string; label: string }> = {
  common: { ring: "ring-slate-500",   bg: "bg-slate-800/60",   label: "Umum"   },
  rare:   { ring: "ring-blue-400",    bg: "bg-blue-900/40",    label: "Langka" },
  epic:   { ring: "ring-purple-400",  bg: "bg-purple-900/40",  label: "Epik"   },
};

// Slot stiker yang terpasang di profil (maks 5)
const EQUIPPED: string[] = [
  "stiker_roket",
  "stiker_mahkota",
  "stiker_galaksi",
  "stiker_berlian",
  "stiker_api",
];

export function ProfilDenganStiker() {
  const [activeTab, setActiveTab] = useState<"profil" | "toko">("profil");
  const [equipped, setEquipped] = useState<string[]>(EQUIPPED);
  const [owned] = useState<string[]>([
    "stiker_roket","stiker_bintang","stiker_api","stiker_petir",
    "stiker_otak","stiker_mahkota","stiker_berlian","stiker_sihir",
    "stiker_naga","stiker_galaksi",
  ]);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const MAX_SLOTS = 5;
  const equippedItems = STIKER_CATALOG.filter(s => equipped.includes(s.id));
  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => equippedItems[i] ?? null);

  function toggleEquip(id: string) {
    setEquipped(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_SLOTS) return prev; // slot penuh
      return [...prev, id];
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SPANDUK / BANNER ── */}
      <div
        className="relative h-36 flex-shrink-0 overflow-hidden"
        style={{ background: "linear-gradient(115deg,#020617,#172554 48%,#e0f2fe)" }}
      >
        {/* Partikel bintang */}
        {[...Array(18)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/20"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              top: `${Math.sin(i * 1.3) * 40 + 50}%`,
              left: `${(i * 5.7) % 100}%`,
              opacity: 0.4 + (i % 4) * 0.15,
            }}
          />
        ))}

        {/* Stiker yang terpasang — tampil mengambang di atas banner */}
        <div className="absolute bottom-[-20px] right-4 flex gap-2 z-20">
          {slots.map((stiker, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredSlot(idx)}
              onMouseLeave={() => setHoveredSlot(null)}
              className="relative"
            >
              {stiker ? (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl
                             shadow-lg border-2 border-white/20 cursor-default"
                  style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)" }}
                >
                  {stiker.emoji}
                  {hoveredSlot === idx && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white
                                    text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-white/10 z-30">
                      {stiker.nama}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20
                               flex items-center justify-center text-white/20 text-xs">
                  +
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── AVATAR ── */}
      <div className="flex flex-col items-center px-4 pt-6 pb-3 relative">
        <div className="relative -mt-2">
          {/* Avatar lingkaran dengan bingkai void */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
                          text-white bg-indigo-700 ring-4 ring-offset-4 ring-offset-[#0a0a1a]"
               style={{ boxShadow: "0 0 18px 4px rgba(99,102,241,0.5)", ring: "ring-indigo-400" }}>
            A
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[#0a0a1a] text-[10px]
                          font-black rounded-full w-5 h-5 flex items-center justify-center">
            12
          </div>
        </div>

        <h2 className="mt-3 text-white font-bold text-base">Aditya Pranata</h2>
        <p className="text-slate-400 text-xs">Kelas 8A · SMPN 1 Jakarta</p>

        {/* Koin & EXP */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20
                          rounded-full px-3 py-1">
            <span className="text-sm">🪙</span>
            <span className="text-yellow-400 text-xs font-bold">2.450</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20
                          rounded-full px-3 py-1">
            <span className="text-sm">⚡</span>
            <span className="text-blue-400 text-xs font-bold">3.200 EXP</span>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex mx-4 mb-3 bg-slate-800/50 rounded-xl p-1">
        {(["profil","toko"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "profil" ? "👤 Profil" : "🛍️ Toko Stiker"}
          </button>
        ))}
      </div>

      {/* ── KONTEN TABS ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {activeTab === "profil" && (
          <div className="space-y-3">
            {/* Slot stiker aktif */}
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-bold">✨ Stiker Terpasang</h3>
                <span className="text-slate-500 text-[11px]">{equipped.length}/{MAX_SLOTS} slot</span>
              </div>
              <div className="flex gap-2">
                {slots.map((stiker, idx) => {
                  const tier = stiker ? TIER_COLORS[stiker.tier] : null;
                  return (
                    <div key={idx}
                      className={`flex-1 aspect-square rounded-xl flex items-center justify-center
                                  text-2xl border-2 transition-all
                                  ${tier
                                    ? `${tier.bg} ${tier.ring} ring-1`
                                    : "border-dashed border-slate-700 bg-slate-900/30"
                                  }`}
                    >
                      {stiker ? stiker.emoji : (
                        <span className="text-slate-700 text-sm">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-slate-500 text-[10px] mt-2 text-center">
                Stiker muncul di banner profilmu & bisa dilihat temanmu
              </p>
            </div>

            {/* Koleksi dimiliki */}
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
              <h3 className="text-white text-sm font-bold mb-3">🎒 Koleksi Kamu</h3>
              <div className="grid grid-cols-5 gap-2">
                {STIKER_CATALOG.filter(s => owned.includes(s.id)).map(stiker => {
                  const isOn = equipped.includes(stiker.id);
                  const tier = TIER_COLORS[stiker.tier];
                  return (
                    <button key={stiker.id} onClick={() => toggleEquip(stiker.id)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-xl
                                  border-2 transition-all relative
                                  ${isOn
                                    ? `${tier.bg} ${tier.ring} ring-2 scale-105`
                                    : "bg-slate-900/50 border-slate-700 hover:border-slate-500"
                                  }`}
                    >
                      {stiker.emoji}
                      {isOn && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full
                                        w-3 h-3 flex items-center justify-center text-[8px] text-white font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-slate-500 text-[10px] mt-2 text-center">
                Tap stiker untuk pasang / lepas
              </p>
            </div>
          </div>
        )}

        {activeTab === "toko" && (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs text-center">Beli stiker baru dengan koin kamu</p>
            {(["common","rare","epic"] as const).map(tier => {
              const tierInfo = TIER_COLORS[tier];
              const items = STIKER_CATALOG.filter(s => s.tier === tier);
              const prices: Record<string,number> = { common: 200, rare: 600, epic: 1500 };
              return (
                <div key={tier} className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
                  <h3 className={`text-sm font-bold mb-3 ${
                    tier === "common" ? "text-slate-300"
                    : tier === "rare" ? "text-blue-300"
                    : "text-purple-300"
                  }`}>
                    {tier === "common" ? "⚪ Umum" : tier === "rare" ? "🔵 Langka" : "🟣 Epik"}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {items.map(stiker => {
                      const isOwned = owned.includes(stiker.id);
                      return (
                        <div key={stiker.id}
                          className={`rounded-xl p-2 flex flex-col items-center gap-1 border
                                      ${isOwned
                                        ? "opacity-40 border-slate-700 bg-slate-900/30"
                                        : `${tierInfo.bg} ${tierInfo.ring} ring-1`
                                      }`}
                        >
                          <span className="text-2xl">{stiker.emoji}</span>
                          <span className="text-[9px] text-slate-300 text-center leading-tight">{stiker.nama}</span>
                          {isOwned ? (
                            <span className="text-[9px] text-green-400 font-bold">Dimiliki</span>
                          ) : (
                            <button className="text-[9px] bg-yellow-500 text-[#0a0a1a] font-bold
                                               rounded-full px-2 py-0.5 flex items-center gap-0.5">
                              🪙 {prices[tier]}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
