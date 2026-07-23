import React from 'react';
import { ChevronLeft, Rocket, Zap, ArrowRight } from 'lucide-react';

export default function SiswaHome() {
  return (
    <div className="relative min-h-[100dvh] w-full max-w-[390px] mx-auto overflow-hidden bg-[#0A0D14] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Deep Space Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] rounded-full bg-cyan-900/30 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] w-[40%] h-[30%] rounded-full bg-rose-900/10 blur-[80px]" />
        
        {/* Starfield simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0A0D14]/80 to-[#0A0D14]" />
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', 
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }} 
        />
      </div>

      <div className="relative z-10 h-full flex flex-col overflow-y-auto pb-12 scrollbar-none">
        {/* Player Header */}
        <header className="px-4 py-3 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] border-2 border-[#0A0D14] ring-1 ring-cyan-500/50 z-10 relative">
                🧑‍🚀
              </div>
              <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/20" />
            </div>
            
            <div className="flex flex-col">
              <div className="text-[13px] font-bold text-white tracking-wide">Ahmad Fauzi</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(34,211,238,0.2)] border border-cyan-800/50">
                  LV 8
                </div>
                <div className="w-16 h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-blue-500 w-[80%] shadow-[0_0_10px_rgba(34,211,238,0.8)] relative">
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-white/40 to-transparent" />
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 font-medium">2400/3000 XP</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-[#1A1F2E]/80 border border-white/5 px-2.5 py-1.5 rounded-full shadow-inner">
            <span className="text-sm">💰</span>
            <span className="text-[11px] font-black text-amber-400 tracking-wide">1,250</span>
          </div>
        </header>

        {/* TopBar */}
        <div className="px-5 mt-6 mb-8 flex flex-col gap-3">
          <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all mb-2 backdrop-blur-sm active:scale-95">
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h1 className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 flex items-center gap-2 tracking-tight">
                <Rocket className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={26} strokeWidth={2.5} />
                ZONA KELAS IX
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase rounded shadow-[0_0_8px_rgba(244,63,94,0.15)] flex items-center gap-1">
                <Zap size={10} className="fill-rose-400" />
                SULIT
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Tantangan Lanjutan</span>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="px-4 flex flex-col gap-10">
          
          {/* Chapter 1 */}
          <section className="flex flex-col gap-4 relative">
            {/* Header */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-7 w-1.5 bg-gradient-to-b from-cyan-300 to-cyan-600 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-cyan-100 flex items-center gap-2">
                <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">BAB I</span>
                <span className="text-slate-600">·</span>
                Sistem Persamaan Linear
              </h2>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <MissionCard 
                emoji="📦" 
                title="Manifest Kargo Alien" 
                chapter="BAB I"
                color="cyan"
              />
              <MissionCard 
                emoji="🗺️" 
                title="Plotting Rute Grafik" 
                chapter="BAB I"
                color="cyan"
              />
              <MissionCard 
                emoji="📡" 
                title="Interseksi Radar Sinyal" 
                chapter="BAB I"
                color="cyan"
              />
              <MissionCard 
                emoji="💻" 
                title="Dekripsi Konsol Komputer" 
                chapter="BAB I"
                color="cyan"
              />
              <MissionCard 
                emoji="👽" 
                title="Barter Di Pasar Galaksi" 
                chapter="BAB I"
                color="cyan"
              />
            </div>
          </section>

          {/* Chapter 2 */}
          <section className="flex flex-col gap-4 relative">
            {/* Header */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-7 w-1.5 bg-gradient-to-b from-violet-300 to-violet-600 rounded-full shadow-[0_0_12px_rgba(167,139,250,0.6)]" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-violet-100 flex items-center gap-2">
                <span className="text-violet-400 drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]">BAB II</span>
                <span className="text-slate-600">·</span>
                Fungsi Kuadrat
              </h2>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <MissionCard 
                emoji="🎯" 
                title="Kalibrasi Jangkauan Radar" 
                chapter="BAB II"
                color="violet"
              />
              <MissionCard 
                emoji="🛰️" 
                title="Kalkulasi Orbit Satelit" 
                chapter="BAB II"
                color="violet"
              />
              <MissionCard 
                emoji="🛡️" 
                title="Medan Gaya Shield Pelindung" 
                chapter="BAB II"
                color="violet"
              />
              <MissionCard 
                emoji="⚡" 
                title="Tembakan Laser Sektor" 
                chapter="BAB II"
                color="violet"
              />
              <MissionCard 
                emoji="☄️" 
                title="Jalur Pintas Sabuk Asteroid" 
                chapter="BAB II"
                color="violet"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function MissionCard({ emoji, title, chapter, color }: { emoji: string, title: string, chapter: string, color: 'cyan' | 'violet' }) {
  const isCyan = color === 'cyan';
  
  const colorStyles = isCyan 
    ? 'border-l-cyan-500 bg-gradient-to-r from-cyan-500/10 to-transparent hover:from-cyan-500/20'
    : 'border-l-violet-500 bg-gradient-to-r from-violet-500/10 to-transparent hover:from-violet-500/20';
    
  const pillStyles = isCyan
    ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
    : 'bg-violet-950/80 text-violet-400 border-violet-800/50 shadow-[0_0_10px_rgba(167,139,250,0.1)]';

  const glowStyles = isCyan
    ? 'shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] border-cyan-500/20'
    : 'shadow-[0_0_20px_rgba(167,139,250,0.15)] group-hover:shadow-[0_0_25px_rgba(167,139,250,0.25)] border-violet-500/20';

  return (
    <div className={`relative group overflow-hidden rounded-[16px] bg-[#121622]/90 backdrop-blur-md border-y border-r border-white/[0.03] border-l-[3px] ${colorStyles} p-3.5 pr-4 flex items-center justify-between transition-all duration-300 active:scale-[0.98] cursor-pointer hover:border-white/[0.08]`}>
      
      {/* Glossy overlay reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[16px]" />

      <div className="flex items-center gap-3.5 relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-[#0A0D14] border flex items-center justify-center text-[22px] transition-all duration-300 ${glowStyles}`}>
          {emoji}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] border ${pillStyles}`}>
              {chapter}
            </span>
          </div>
          <h3 className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors tracking-wide">{title}</h3>
        </div>
      </div>
      
      <button className="relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20 transition-all shadow-sm">
        MULAI
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
