import React, { useState } from 'react';
import { ArrowLeft, Coins, Star, HelpCircle, Check, ArrowRight, Package } from 'lucide-react';

export default function GameUI() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(true);

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] bg-[#000018] overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30 shadow-2xl sm:border sm:border-white/10 sm:rounded-[40px] sm:my-8">
      
      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[50%] bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[30%] -right-[30%] w-[60%] h-[60%] bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[50%] bg-blue-800/30 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* TopBar */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
              <ArrowLeft size={18} className="text-cyan-400" />
            </button>
            <div>
              <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Package size={14} className="text-violet-400" />
                Manifest Kargo
              </h1>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            MEDIUM
          </div>
        </div>

        {/* PlayerHeader Strip */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-black/20 backdrop-blur-md border-b border-white/5 z-20 sticky top-[65px]">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                <Coins size={10} className="text-yellow-950" />
              </div>
              <span className="font-bold text-yellow-500 text-xs tracking-wide">1,240</span>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                <Star size={10} className="text-cyan-950" />
              </div>
              <span className="font-bold text-cyan-400 text-xs tracking-wide">8,450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10 tracking-widest">
            02:14
          </div>
        </div>

        {/* Game Area */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          
          {/* Question Card */}
          <div className="relative rounded-3xl bg-[#111322]/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70"></div>
            
            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>
              
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-black/50 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5"></div>
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative font-mono text-xl font-bold tracking-widest flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-3 text-cyan-100">
                    <span className="text-cyan-500">3x</span> + <span className="text-violet-400">2y</span> = 24
                  </div>
                  <div className="w-full h-px bg-white/10"></div>
                  <div className="flex items-center justify-center gap-3 text-cyan-100">
                    <span className="text-cyan-500">x</span> + <span className="text-violet-400">4y</span> = 20
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <h2 className="font-black text-lg text-white tracking-wide">Tentukan nilai x!</h2>
                <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">
                  <HelpCircle size={14} />
                  Hint
                </button>
              </div>
              
              <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[13px] text-violet-300 flex items-start gap-3 mt-1">
                <span className="text-lg leading-none">💡</span>
                <span className="leading-snug">Gunakan metode eliminasi atau substitusi untuk menyelesaikan sistem ini.</span>
              </div>
            </div>
          </div>

          {/* Slider Input Card */}
          <div className="rounded-3xl bg-[#111322]/80 border border-white/10 backdrop-blur-xl p-6 flex flex-col gap-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent rounded-3xl pointer-events-none"></div>

            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Jawaban Anda</span>
              <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] font-mono flex items-center gap-2">
                <span className="text-cyan-500">x</span> = {sliderValue}
              </div>
            </div>
            
            <div className="relative py-2 z-10">
              <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 bg-slate-900/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)] rounded-full"
                  style={{ width: `${(sliderValue / 20) * 100}%` }}
                ></div>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="20" 
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer outline-none z-10 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-9 
                  [&::-webkit-slider-thumb]:h-9 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:border-[6px]
                  [&::-webkit-slider-thumb]:border-cyan-500
                  [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(6,182,212,1)]
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110"
              />
              
              <div className="flex justify-between text-xs text-slate-500 mt-6 font-mono font-bold tracking-widest">
                <span>0</span>
                <span>10</span>
                <span>20</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all uppercase tracking-widest text-sm relative overflow-hidden group">
              <div className="absolute inset-0 w-full h-full bg-white/20 blur-md translate-y-full group-hover:translate-y-0 transition-transform"></div>
              <span className="relative z-10 py-4 block">KONFIRMASI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Bottom Sheet Overlay */}
      {showFeedback && (
        <>
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={() => setShowFeedback(false)}
          ></div>
          
          {/* Feedback Sheet */}
          <div className="absolute bottom-0 left-0 w-full z-50 animate-in slide-in-from-bottom-full duration-500 ease-out sm:pb-4 sm:px-4">
            <div className="relative w-full rounded-t-[32px] sm:rounded-[32px] bg-[#022c22]/95 border-t sm:border border-green-500/30 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(34,197,94,0.2)] p-6 pt-8 pb-10 sm:pb-6 overflow-hidden">
              
              {/* Massive Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="relative flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-green-300/30 rotate-3">
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="text-green-50 font-black text-3xl tracking-wider drop-shadow-md">BENAR!</h3>
                    <div className="flex gap-4 mt-1.5">
                      <span className="flex items-center gap-1.5 text-yellow-400 font-black tracking-wider text-sm bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
                        +50 💰
                      </span>
                      <span className="flex items-center gap-1.5 text-cyan-300 font-black tracking-wider text-sm bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        +100 ⭐
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-green-100/90 text-[15px] leading-relaxed font-medium px-1">
                  Luar biasa! Solusi yang tepat untuk menyelamatkan kargo. Persamaan seimbang.
                </p>
                
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-green-950 font-black flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all uppercase tracking-widest text-sm group">
                  LANJUT 
                  <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Hide scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
