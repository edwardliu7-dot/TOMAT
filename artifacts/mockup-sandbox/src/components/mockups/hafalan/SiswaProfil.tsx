import React from 'react';
import { Check, Lock, Star, Zap, Award, Medal, Shield } from 'lucide-react';

export function SiswaProfil() {
  const perkalian = [
    { id: 1, label: '× 1', earned: true },
    { id: 2, label: '× 2', earned: true },
    { id: 3, label: '× 3', earned: true },
    { id: 4, label: '× 4', earned: true },
    { id: 5, label: '× 5', earned: true },
    { id: 6, label: '× 6', earned: true },
    { id: 7, label: '× 7', earned: true },
    { id: 8, label: '× 8', earned: false },
    { id: 9, label: '× 9', earned: false },
    { id: 10, label: '× 10', earned: false },
  ];

  const pembagian = [
    { id: 1, label: '÷ 1', earned: true },
    { id: 2, label: '÷ 2', earned: true },
    { id: 3, label: '÷ 3', earned: true },
    { id: 4, label: '÷ 4', earned: true },
    { id: 5, label: '÷ 5', earned: true },
    { id: 6, label: '÷ 6', earned: false },
    { id: 7, label: '÷ 7', earned: false },
    { id: 8, label: '÷ 8', earned: false },
    { id: 9, label: '÷ 9', earned: false },
    { id: 10, label: '÷ 10', earned: false },
  ];

  const otherBadges = [
    { id: 1, title: 'Pemula Tangguh', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 2, title: 'Raja Kuis', icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 3, title: 'Penyelesai Cepat', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="flex justify-center min-h-[100dvh] bg-[#000000] sm:bg-zinc-950 font-sans text-white">
      <div className="w-full max-w-[420px] bg-[#0B0D14] min-h-[100dvh] relative shadow-2xl flex flex-col overflow-hidden pb-10">
        
        {/* Top section: Profile Header */}
        <div className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-indigo-900/60 via-purple-900/20 to-transparent">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Golden frame glow */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-amber-300 to-yellow-600 rounded-full blur-[6px] opacity-70"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-300 via-yellow-200 to-yellow-600 rounded-full z-0"></div>
              <div className="relative z-10 w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900 shadow-xl overflow-hidden">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-300 to-purple-300">BL</span>
              </div>
              <div className="absolute -bottom-2 -right-2 z-20 bg-indigo-500 rounded-full p-1.5 border-2 border-[#0B0D14]">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Bunga Lestari
            </h1>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                Lv. 15
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-xs font-medium border border-white/10">
                VII Ibnu Batuttah
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">EXP</span>
              </div>
              <span className="text-lg font-bold text-white">4,250</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
                <span className="text-sm">🪙</span>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Koin</span>
              </div>
              <span className="text-lg font-bold text-white">1,280</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                <Medal className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Peringkat</span>
              </div>
              <span className="text-lg font-bold text-white">#2</span>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-6 flex-1">
          {/* Hafalan Section */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="relative z-10 mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl drop-shadow-sm">🧮</span> Hafalan Matematika
              </h2>
              <p className="text-[13px] text-slate-400 mt-1">
                Diverifikasi langsung oleh Guru
              </p>
            </div>

            {/* Progress summary */}
            <div className="mb-6 bg-[#0B0D14]/50 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-2.5">
                <div className="text-sm font-medium text-slate-300">Total Hafalan Lulus</div>
                <div className="text-sm font-bold text-white"><span className="text-emerald-400 text-base">12</span> <span className="text-slate-500">/ 20</span></div>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full relative" style={{ width: '60%' }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right mt-1.5 text-[10px] text-slate-500 font-medium">60% Tuntas</div>
            </div>

            {/* Perkalian Grid */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                Perkalian <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-medium">1 - 10</span>
              </h3>
              <div className="grid grid-cols-5 gap-2.5">
                {perkalian.map((item) => (
                  item.earned ? (
                    <div key={item.id} className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-[4px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300/40 shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm stroke-[3]" />
                        <span className="text-[11px] font-bold text-white drop-shadow-sm tracking-tight">{item.label}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={item.id} className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full bg-[#0B0D14]/80 border border-white/5">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span className="text-[11px] font-medium text-slate-500 tracking-tight">{item.label}</span>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Pembagian Grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                Pembagian <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-slate-300 font-medium">1 - 10</span>
              </h3>
              <div className="grid grid-cols-5 gap-2.5">
                {pembagian.map((item) => (
                  item.earned ? (
                    <div key={item.id} className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-[4px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-0.5 py-1.5 px-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300/40 shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm stroke-[3]" />
                        <span className="text-[11px] font-bold text-white drop-shadow-sm tracking-tight">{item.label}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={item.id} className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full bg-[#0B0D14]/80 border border-white/5">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span className="text-[11px] font-medium text-slate-500 tracking-tight">{item.label}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </section>

          {/* Other Badges */}
          <section className="pb-8">
            <h2 className="text-sm font-bold text-slate-200 mb-4 px-1">Lencana Pencapaian</h2>
            <div className="grid grid-cols-3 gap-3">
              {otherBadges.map((badge) => (
                <div key={badge.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors cursor-pointer">
                  <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center mb-3 shadow-inner`}>
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 leading-tight">{badge.title}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
