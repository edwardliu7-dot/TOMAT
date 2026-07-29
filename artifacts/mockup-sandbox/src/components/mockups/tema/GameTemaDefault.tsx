import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle, Package } from 'lucide-react';

export default function GameTemaDefault() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] bg-[#000018] overflow-hidden flex flex-col font-sans sm:border sm:border-white/10 sm:rounded-[40px] sm:my-8 shadow-2xl">

      {/* Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[20%] w-[70%] h-[50%] bg-violet-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] -right-[30%] w-[60%] h-[60%] bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[10%] w-[80%] h-[50%] bg-blue-800/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* TopBar */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-white/5 border border-white/10">
              <ArrowLeft size={18} className="text-cyan-400" />
            </button>
            <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Package size={14} className="text-violet-400" />
              Manifest Kargo
            </h1>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest">
            MEDIUM
          </div>
        </div>

        {/* PlayerHeader */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-[65px]">
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20">
              <span className="text-yellow-400 text-xs font-black">🪙 1.240</span>
            </div>
            <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <span className="text-cyan-400 text-xs font-black">⭐ 8.450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black text-slate-400 bg-white/5 px-2 py-1 rounded-md border border-white/10 tracking-widest">
            02:14
          </div>
        </div>

        {/* Game Area */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          {/* Tema label */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tema: Default</span>
          </div>

          {/* Question Card */}
          <div className="relative rounded-3xl bg-[#111322]/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />
            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-black/50 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
                <div className="relative font-mono text-xl font-bold flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3 text-cyan-100">
                    <span className="text-cyan-500">3x</span> + <span className="text-violet-400">2y</span> = 24
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex items-center gap-3 text-cyan-100">
                    <span className="text-cyan-500">x</span> + <span className="text-violet-400">4y</span> = 20
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white">Tentukan nilai x!</h2>
                <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                  <HelpCircle size={14} /> Hint
                </button>
              </div>
            </div>
          </div>

          {/* Slider Card */}
          <div className="rounded-3xl bg-[#111322]/80 border border-white/10 backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Jawaban</span>
              <div className="text-4xl font-black text-white font-mono">
                <span className="text-cyan-500">x</span> = {sliderValue}
              </div>
            </div>
            <div className="relative py-2">
              <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" style={{ width: `${(sliderValue / 20) * 100}%` }} />
              </div>
              <input type="range" min="0" max="20" value={sliderValue} onChange={(e) => setSliderValue(+e.target.value)}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[6px] [&::-webkit-slider-thumb]:border-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(6,182,212,1)]" />
              <div className="flex justify-between text-xs text-slate-500 mt-6 font-mono font-bold">
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
            <button onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] uppercase tracking-widest text-sm">
              KONFIRMASI
            </button>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-40" onClick={() => setShowFeedback(false)} />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div className="relative rounded-t-[32px] bg-[#022c22]/95 border-t border-green-500/30 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(34,197,94,0.2)] p-6 pt-8 pb-10 overflow-hidden">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] rotate-3">
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="text-green-50 font-black text-3xl">BENAR!</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="text-yellow-400 font-black text-sm">+15 🪙</span>
                      <span className="text-cyan-300 font-black text-sm">+100 ⭐</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowFeedback(false)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-green-950 font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                  LANJUT <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
