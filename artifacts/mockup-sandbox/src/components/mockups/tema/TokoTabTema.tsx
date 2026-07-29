import React, { useState } from 'react';
import { ShoppingCart, Check, Lock, Palette, Zap, Crown } from 'lucide-react';

const TEMAS = [
  {
    id: 'default',
    name: 'Default',
    desc: 'Tema bawaan TOMAT — biru galaksi & cyan',
    price: 0,
    owned: true,
    limited: false,
    accent: '#22d3ee',
    preview: ['#071321', '#0d1b2e', '#22d3ee', '#818cf8'],
    bgStyle: 'linear-gradient(135deg,#071321 0%,#0d1b2e 100%)',
    glowColor: 'rgba(34,211,238,0.3)',
  },
  {
    id: 'space',
    name: 'Luar Angkasa',
    desc: 'Background galaxy gelap, aksen cyan, partikel bintang',
    price: 1500,
    owned: false,
    limited: false,
    accent: '#22d3ee',
    preview: ['#020610', '#0a1020', '#22d3ee', '#6366f1'],
    bgStyle: 'linear-gradient(135deg,#020610 0%,#0a0f1e 50%,#060b18 100%)',
    glowColor: 'rgba(34,211,238,0.25)',
  },
  {
    id: 'hutan',
    name: 'Hutan Mistis',
    desc: 'Gradien hijau tua, aksen hijau neon, partikel daun',
    price: 2000,
    owned: false,
    limited: false,
    accent: '#4ade80',
    preview: ['#021408', '#04230e', '#4ade80', '#86efac'],
    bgStyle: 'linear-gradient(135deg,#021408 0%,#04230e 50%,#071a0c 100%)',
    glowColor: 'rgba(74,222,128,0.25)',
  },
  {
    id: 'api',
    name: 'Api Merah',
    desc: 'Gradien merah-oranye, aksen amber, overlay nyala',
    price: 2500,
    owned: false,
    limited: false,
    accent: '#f59e0b',
    preview: ['#150502', '#2d0a04', '#f59e0b', '#ef4444'],
    bgStyle: 'linear-gradient(135deg,#150502 0%,#2d0a04 50%,#1a0603 100%)',
    glowColor: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'salju',
    name: 'Salju',
    desc: 'Biru muda + putih, aksen ice-blue, partikel salju',
    price: 2000,
    owned: false,
    limited: false,
    accent: '#7dd3fc',
    preview: ['#0a1929', '#0f2744', '#7dd3fc', '#e0f2fe'],
    bgStyle: 'linear-gradient(135deg,#0a1929 0%,#0f2744 50%,#0c2030 100%)',
    glowColor: 'rgba(125,211,252,0.25)',
  },
  {
    id: 'void',
    name: 'Void',
    desc: 'Hitam pekat, aksen ungu neon, partikel void',
    price: 8000,
    owned: false,
    limited: true,
    accent: '#a855f7',
    preview: ['#000000', '#0d0014', '#a855f7', '#ec4899'],
    bgStyle: 'linear-gradient(135deg,#000000 0%,#0d0014 100%)',
    glowColor: 'rgba(168,85,247,0.3)',
  },
];

// Deterministic "star" dots for preview strip
const DOT_POSITIONS = Array.from({ length: 14 }, (_, i) => ({
  left: ((i * 137.5 + 11) % 100).toFixed(1),
  top: ((i * 83.7 + 7) % 100).toFixed(1),
  size: (1 + (i % 3) * 0.5).toFixed(1),
  opacity: (0.25 + (i % 4) * 0.1).toFixed(2),
}));

export default function TokoTabTema() {
  const [equippedId, setEquippedId] = useState('default');
  const coins = 1800;

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] bg-[#050c14] overflow-hidden flex flex-col font-sans sm:border sm:border-white/10 sm:rounded-[40px] sm:my-8 shadow-2xl">

      {/* BG Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-violet-700/12 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-cyan-700/12 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-11 pb-4 flex items-center justify-between border-b border-white/8">
        <div>
          <h1 className="font-black text-xl text-white tracking-tight flex items-center gap-2">
            <Palette size={20} className="text-violet-400" />
            Tema
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Ubah tampilan layar permainanmu</p>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
          <span className="text-base">🪙</span>
          <span className="font-black text-yellow-400 text-sm">{coins.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Items */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {TEMAS.map((tema) => {
          const isEquipped = equippedId === tema.id;
          const canAfford = coins >= tema.price;

          return (
            <div
              key={tema.id}
              className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                isEquipped
                  ? 'border-violet-400/50 shadow-[0_0_18px_rgba(167,139,250,0.18)]'
                  : 'border-white/8 hover:border-white/15'
              }`}
            >
              {/* Theme Preview Strip */}
              <div className="h-[58px] w-full relative overflow-hidden" style={{ background: tema.bgStyle }}>
                {DOT_POSITIONS.map((d, i) => (
                  <div key={i} className="absolute rounded-full bg-white pointer-events-none"
                    style={{ left: `${d.left}%`, top: `${d.top}%`, width: `${d.size}px`, height: `${d.size}px`, opacity: d.opacity }} />
                ))}
                {/* Glow orb */}
                <div className="absolute w-24 h-24 rounded-full blur-3xl opacity-35 pointer-events-none"
                  style={{ background: tema.accent, top: '-40%', left: '25%' }} />

                {/* Swatch row */}
                <div className="absolute bottom-2.5 left-3.5 flex gap-1.5">
                  {tema.preview.map((c) => (
                    <div key={c} className="w-4 h-4 rounded-full border border-white/25 shadow-sm" style={{ background: c }} />
                  ))}
                </div>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {tema.limited && (
                    <div className="bg-yellow-500/90 text-yellow-950 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown size={8} /> LIMITED
                    </div>
                  )}
                  {isEquipped && (
                    <div className="bg-violet-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={8} strokeWidth={3} /> DIPAKAI
                    </div>
                  )}
                  {!tema.owned && !isEquipped && (
                    <div className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: `${tema.accent}22`, color: tema.accent, border: `1px solid ${tema.accent}44` }}>
                      🪙 {tema.price.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-white/[0.03] px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{tema.name}</p>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{tema.desc}</p>
                </div>
                <button
                  onClick={() => { if (!isEquipped && tema.owned) setEquippedId(tema.id); }}
                  disabled={!tema.owned && !canAfford}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${
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
                    <span className="flex items-center gap-1"><Check size={10} strokeWidth={3} /> Aktif</span>
                  ) : tema.owned ? 'Pakai' : canAfford ? (
                    <span className="flex items-center gap-1"><ShoppingCart size={10} /> Beli</span>
                  ) : (
                    <span className="flex items-center gap-1"><Lock size={10} /> Kurang</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Info Banner */}
        <div className="rounded-2xl bg-violet-500/8 border border-violet-500/18 p-3.5 flex gap-2.5 items-start mt-1">
          <Zap size={15} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-violet-300/75 leading-relaxed">
            Tema mengubah tampilan <span className="font-bold text-violet-200">layar permainan</span> — warna latar, efek cahaya, dan gaya tombol. Profil & toko tidak terpengaruh.
          </p>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
