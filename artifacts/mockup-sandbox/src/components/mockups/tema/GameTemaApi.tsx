import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle, Flame } from 'lucide-react';

// Deterministic ember positions
const EMBERS = Array.from({ length: 22 }, (_, i) => ({
  left: ((i * 127.3 + 8) % 100).toFixed(1),
  top: ((i * 83.7 + 20) % 100).toFixed(1),
  size: (2 + (i % 3) * 1.5).toFixed(1),
  opacity: (0.15 + (i % 5) * 0.08).toFixed(2),
  color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#f97316',
}));

export default function GameTemaApi() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  const accent = '#f59e0b'; // amber
  const accentDim = 'rgba(245,158,11,0.12)';
  const accentBorder = 'rgba(245,158,11,0.22)';
  const red = '#ef4444';
  const orange = '#f97316';

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] overflow-hidden flex flex-col font-sans sm:border sm:rounded-[40px] sm:my-8 shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #150502 0%, #2d0a04 40%, #1a0603 100%)', borderColor: 'rgba(245,158,11,0.2)' }}>

      {/* Fire BG */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ember particles */}
        {EMBERS.map((e, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left: `${e.left}%`, top: `${e.top}%`, width: `${e.size}px`, height: `${e.size}px`, background: e.color, opacity: e.opacity, boxShadow: `0 0 ${+e.size * 2}px ${e.color}` }} />
        ))}
        {/* Fire glow from bottom */}
        <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[50%] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #dc2626 0%, #92400e 50%, transparent 75%)' }} />
        {/* Top accent glow */}
        <div className="absolute top-[-15%] right-[20%] w-[60%] h-[45%] rounded-full blur-[120px] opacity-18"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, #b45309 60%, transparent 80%)' }} />
        {/* Fire overlay strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 opacity-12"
          style={{ background: 'linear-gradient(0deg, #dc2626 0%, transparent 100%)' }} />
        {/* Subtle heat distortion lines */}
        {[20, 45, 70].map((x, i) => (
          <div key={i} className="absolute w-px h-full opacity-[0.04]"
            style={{ left: `${x}%`, background: `linear-gradient(180deg, transparent 0%, ${orange} 50%, transparent 100%)` }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* TopBar */}
        <div className="flex items-center justify-between p-4 backdrop-blur-xl border-b sticky top-0 z-30"
          style={{ background: 'rgba(21,5,2,0.8)', borderColor: accentBorder }}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl border" style={{ background: accentDim, borderColor: accentBorder }}>
              <ArrowLeft size={18} style={{ color: accent }} />
            </button>
            <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Flame size={14} style={{ color: orange }} />
              Manifest Kargo
            </h1>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest"
            style={{ background: accentDim, border: `1px solid ${accentBorder}`, color: accent }}>
            MEDIUM
          </div>
        </div>

        {/* PlayerHeader */}
        <div className="flex justify-between items-center px-4 py-2.5 backdrop-blur-md border-b sticky top-[65px]"
          style={{ background: 'rgba(21,5,2,0.55)', borderColor: 'rgba(245,158,11,0.07)' }}>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.1)', border: `1px solid ${accentBorder}` }}>
              <span className="text-xs font-black" style={{ color: accent }}>🪙 1.240</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <span className="text-xs font-black" style={{ color: orange }}>⭐ 8.450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black tracking-widest px-2 py-1 rounded-md"
            style={{ color: 'rgba(245,158,11,0.65)', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
            02:14
          </div>
        </div>

        {/* Game Area */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: orange, boxShadow: `0 0 6px ${orange}` }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(245,158,11,0.45)' }}>
              Tema: Api Merah
            </span>
          </div>

          {/* Question Card */}
          <div className="relative rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ background: 'rgba(20,6,2,0.88)', border: `1px solid ${accentBorder}` }}>
            <div className="absolute top-0 left-0 w-full h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${orange}, ${accent}, transparent)` }} />
            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>
              <div className="flex flex-col gap-4 p-5 rounded-2xl relative overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(245,158,11,0.08)' }}>
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(239,68,68,0.05) 100%)' }} />
                <div className="relative font-mono text-xl font-bold flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3" style={{ color: '#fef3c7' }}>
                    <span style={{ color: orange }}>3x</span> + <span style={{ color: red }}>2y</span> = 24
                  </div>
                  <div className="w-full h-px" style={{ background: 'rgba(245,158,11,0.12)' }} />
                  <div className="flex items-center gap-3" style={{ color: '#fef3c7' }}>
                    <span style={{ color: orange }}>x</span> + <span style={{ color: red }}>4y</span> = 20
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white">Tentukan nilai x!</h2>
                <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ color: accent, background: accentDim, border: `1px solid ${accentBorder}` }}>
                  <HelpCircle size={14} /> Hint
                </button>
              </div>
              <div className="p-3.5 rounded-xl flex items-start gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <span className="text-lg leading-none">🔥</span>
                <span className="text-[13px] leading-snug">Gunakan metode eliminasi atau substitusi untuk menyelesaikan sistem ini.</span>
              </div>
            </div>
          </div>

          {/* Slider Card */}
          <div className="rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
            style={{ background: 'rgba(20,6,2,0.88)', border: `1px solid ${accentBorder}` }}>
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%)' }} />
            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(245,158,11,0.4)' }}>Jawaban</span>
              <div className="text-4xl font-black text-white font-mono" style={{ textShadow: `0 0 20px ${orange}` }}>
                <span style={{ color: orange }}>x</span> = {sliderValue}
              </div>
            </div>
            <div className="relative py-2 z-10">
              <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(245,158,11,0.1)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${(sliderValue / 20) * 100}%`, background: `linear-gradient(90deg, ${red}, ${orange}, ${accent})`, boxShadow: `0 0 15px ${orange}` }} />
              </div>
              <input type="range" min="0" max="20" value={sliderValue} onChange={(e) => setSliderValue(+e.target.value)}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[6px]" />
              <div className="flex justify-between text-xs mt-6 font-mono font-bold tracking-widest" style={{ color: 'rgba(245,158,11,0.28)' }}>
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
            <button onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl py-4 font-black text-white uppercase tracking-widest text-sm"
              style={{ background: `linear-gradient(90deg, ${red}, ${orange})`, boxShadow: `0 0 30px rgba(249,115,22,0.25)` }}>
              🔥 KONFIRMASI
            </button>
          </div>
        </div>
      </div>

      {showFeedback && (
        <>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40" onClick={() => setShowFeedback(false)} />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div className="relative rounded-t-[32px] backdrop-blur-2xl p-6 pt-8 pb-10 overflow-hidden"
              style={{ background: 'rgba(18,4,1,0.97)', borderTop: `1px solid ${accentBorder}`, boxShadow: `0 -20px 60px rgba(245,158,11,0.15)` }}>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-[60px]"
                style={{ background: 'rgba(249,115,22,0.22)' }} />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-3"
                    style={{ background: `linear-gradient(135deg, ${red}, ${accent})`, boxShadow: `0 0 30px rgba(249,115,22,0.4)` }}>
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl" style={{ color: accent }}>BENAR!</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="font-black text-sm" style={{ color: accent }}>+15 🪙</span>
                      <span className="font-black text-sm" style={{ color: orange }}>+100 ⭐</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowFeedback(false)}
                  className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm text-white"
                  style={{ background: `linear-gradient(90deg, #991b1b, ${orange})`, boxShadow: `0 0 30px rgba(249,115,22,0.25)` }}>
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
