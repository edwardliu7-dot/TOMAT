import React, { useState } from 'react';
import { ShoppingCart, Check, Lock, Palette, Star, Zap } from 'lucide-react';

const TEMAS = [
  {
    id: 'default',
    name: 'Default',
    desc: 'Tema bawaan TOMAT — biru galaksi & cyan',
    price: 0,
    owned: true,
    equipped: false,
    accent: '#22d3ee',
    bg: 'linear-gradient(135deg,#071321 0%,#0d1b2e 100%)',
    preview: ['#071321', '#0d1b2e', '#22d3ee', '#818cf8'],
  },
  {
    id: 'space',
    name: 'Luar Angkasa',
    desc: 'Alam semesta tak terbatas — bintang & nebula hangat',
    price: 800,
    owned: false,
    equipped: false,
    accent: '#fb923c',
    bg: 'linear-gradient(135deg,#07090f 0%,#1a0a2e 50%,#0a1a2e 100%)',
    preview: ['#07090f', '#1a0a2e', '#fb923c', '#c084fc'],
  },
  {
    id: 'void',
    name: 'Void',
    desc: 'Kegelapan mutlak — neon ungu dari kekosongan',
    price: 1200,
    owned: false,
    equipped: false,
    accent: '#a855f7',
    bg: 'linear-gradient(135deg,#000000 0%,#0d0014 100%)',
    preview: ['#000000', '#0d0014', '#a855f7', '#ec4899'],
  },
];

export default function TokoTabTema() {
  const [selected, setSelected] = useState<string | null>(null);
  const [equippedId, setEquippedId] = useState('default');

  const coins = 960;

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] bg-[#050c14] overflow-hidden flex flex-col font-sans sm:border sm:border-white/10 sm:rounded-[40px] sm:my-8 shadow-2xl">

      {/* BG Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-violet-700/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-cyan-700/15 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-12 pb-4 flex items-center justify-between border-b border-white/8">
        <div>
          <h1 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Palette size={20} className="text-violet-400" />
            Tema
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Ubah tampilan layar permainanmu</p>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
          <span className="text-base">🪙</span>
          <span className="font-black text-yellow-400 text-sm">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Items */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {TEMAS.map((tema) => {
          const isEquipped = equippedId === tema.id;
          const canAfford = coins >= tema.price;
          const isSelected = selected === tema.id;

          return (
            <div
              key={tema.id}
              onClick={() => setSelected(isSelected ? null : tema.id)}
              className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                isEquipped
                  ? 'border-violet-400/60 shadow-[0_0_20px_rgba(167,139,250,0.2)]'
                  : isSelected
                  ? 'border-white/20 shadow-md'
                  : 'border-white/8 hover:border-white/15'
              }`}
            >
              {/* Theme Preview Strip */}
              <div className="h-[64px] w-full relative overflow-hidden" style={{ background: tema.bg }}>
                {/* Simulated star dots */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: Math.random() * 2 + 1,
                      height: Math.random() * 2 + 1,
                      left: `${(i * 37 + 11) % 100}%`,
                      top: `${(i * 53 + 7) % 100}%`,
                      opacity: 0.3 + (i % 5) * 0.1,
                    }}
                  />
                ))}
                {/* Glow orb */}
                <div
                  className="absolute w-20 h-20 rounded-full blur-2xl opacity-40"
                  style={{ background: tema.accent, top: '-20%', left: '30%' }}
                />
                {/* Swatch row */}
                <div className="absolute bottom-3 left-4 flex gap-1.5">
                  {tema.preview.map((c) => (
                    <div
                      key={c}
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                {/* Equipped badge */}
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-violet-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={9} strokeWidth={3} /> DIPAKAI
                  </div>
                )}
                {/* Price badge */}
                {!tema.owned && (
                  <div
                    className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: `${tema.accent}22`, color: tema.accent, border: `1px solid ${tema.accent}44` }}
                  >
                    🪙 {tema.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="bg-white/[0.03] p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{tema.name}</p>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{tema.desc}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEquipped) return;
                    if (tema.owned) setEquippedId(tema.id);
                  }}
                  disabled={!tema.owned && !canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isEquipped
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 cursor-default'
                      : tema.owned
                      ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_12px_rgba(167,139,250,0.3)]'
                      : canAfford
                      ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/8'
                  }`}
                >
                  {isEquipped ? (
                    <span className="flex items-center gap-1"><Check size={11} strokeWidth={3} /> Aktif</span>
                  ) : tema.owned ? (
                    'Pakai'
                  ) : canAfford ? (
                    <span className="flex items-center gap-1"><ShoppingCart size={11} /> Beli</span>
                  ) : (
                    <span className="flex items-center gap-1"><Lock size={11} /> Kurang</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Info Banner */}
        <div className="rounded-2xl bg-violet-500/8 border border-violet-500/20 p-4 flex gap-3 items-start">
          <Zap size={16} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-[12px] text-violet-300/80 leading-relaxed">
            Tema mengubah tampilan <span className="font-bold text-violet-200">layar permainan</span> — warna latar, efek cahaya, dan gaya tombol. Profil dan toko tidak berubah.
          </p>
        </div>

        <div className="h-6" />
      </div>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
