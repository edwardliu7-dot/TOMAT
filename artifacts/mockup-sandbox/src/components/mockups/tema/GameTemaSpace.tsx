import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle, Telescope } from 'lucide-react';

// Deterministic star field
const STARS = Array.from({ length: 80 }, (_, i) => ({
  left: ((i * 137.508) % 100).toFixed(2),
  top: ((i * 97.3) % 100).toFixed(2),
  size: (0.8 + (i % 4) * 0.5).toFixed(1),
  opacity: (0.2 + (i % 6) * 0.1).toFixed(2),
}));

export default function GameTemaSpace() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  const accent = '#22d3ee'; // cyan
  const accentDim = 'rgba(34,211,238,0.15)';
  const accentBorder = 'rgba(34,211,238,0.25)';
  const indigo = '#818cf8';

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] overflow-hidden flex flex-col font-sans sm:border sm:rounded-[40px] sm:my-8 shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #020610 0%, #060b18 50%, #0a0e1a 100%)', borderColor: 'rgba(34,211,238,0.15)' }}>

      {/* Star Field */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }} />
        ))}
        {/* Nebula / galaxy glow */}
        <div className="absolute top-[-15%] left-[15%] w-[80%] h-[55%] rounded-full blur-[140px] opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, #3730a3 50%, transparent 70%)' }} />
        <div className="absolute top-[10%] right-[-15%] w-[55%] h-[45%] rounded-full blur-[100px] opacity-12"
          style={{ background: 'radial-gradient(circle, #22d3ee 0%, #0891b2 60%, transparent 70%)' }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[40%] rounded-full blur-[100px] opacity-10"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
        {/* Shooting star */}
        <div className="absolute h-px w-20 opacity-30 rotate-[-35deg]"
          style={{ top: '18%', left: '55%', background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* TopBar */}
        <div className="flex items-center justify-between p-4 backdrop-blur-xl border-b sticky top-0 z-30"
          style={{ background: 'rgba(2,6,16,0.75)', borderColor: accentBorder }}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl border" style={{ background: accentDim, borderColor: accentBorder }}>
              <ArrowLeft size={18} style={{ color: accent }} />
            </button>
            <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Telescope size={14} style={{ color: accent }} />
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
          style={{ background: 'rgba(2,6,16,0.55)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="text-xs font-black text-yellow-400">🪙 1.240</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: accentDim, border: `1px solid ${accentBorder}` }}>
              <span className="text-xs font-black" style={{ color: accent }}>⭐ 8.450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black tracking-widest px-2 py-1 rounded-md"
            style={{ color: 'rgba(34,211,238,0.6)', background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
            02:14
          </div>
        </div>

        {/* Game Area */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(34,211,238,0.45)' }}>
              Tema: Luar Angkasa
            </span>
          </div>

          {/* Question Card */}
          <div className="relative rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ background: 'rgba(4,8,20,0.82)', border: `1px solid ${accentBorder}` }}>
            <div className="absolute top-0 left-0 w-full h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, ${indigo}, transparent)` }} />
            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>
              <div className="flex flex-col gap-4 p-5 rounded-2xl relative overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.04) 0%, rgba(99,102,241,0.04) 100%)' }} />
                <div className="relative font-mono text-xl font-bold flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3 text-slate-100">
                    <span style={{ color: accent }}>3x</span> + <span style={{ color: indigo }}>2y</span> = 24
                  </div>
                  <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="flex items-center gap-3 text-slate-100">
                    <span style={{ color: accent }}>x</span> + <span style={{ color: indigo }}>4y</span> = 20
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
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'rgba(165,180,252,0.85)' }}>
                <span className="text-lg leading-none">🌌</span>
                <span className="text-[13px] leading-snug">Gunakan metode eliminasi atau substitusi untuk menyelesaikan sistem ini.</span>
              </div>
            </div>
          </div>

          {/* Slider Card */}
          <div className="rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
            style={{ background: 'rgba(4,8,20,0.82)', border: `1px solid ${accentBorder}` }}>
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(34,211,238,0.03) 0%, transparent 100%)' }} />
            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Jawaban</span>
              <div className="text-4xl font-black text-white font-mono" style={{ textShadow: `0 0 20px ${accent}` }}>
                <span style={{ color: accent }}>x</span> = {sliderValue}
              </div>
            </div>
            <div className="relative py-2 z-10">
              <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${(sliderValue / 20) * 100}%`, background: `linear-gradient(90deg, #0891b2, ${accent})`, boxShadow: `0 0 15px ${accent}` }} />
              </div>
              <input type="range" min="0" max="20" value={sliderValue} onChange={(e) => setSliderValue(+e.target.value)}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[6px] [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(34,211,238,1)]"
                style={{ ['--thumb-border' as any]: accent }} />
              <div className="flex justify-between text-xs mt-6 font-mono font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.22)' }}>
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>
            <button onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl py-4 font-black text-white uppercase tracking-widest text-sm"
              style={{ background: `linear-gradient(90deg, #0891b2, #0e7490)`, boxShadow: `0 0 30px rgba(34,211,238,0.25)` }}>
              🚀 KONFIRMASI
            </button>
          </div>
        </div>
      </div>

      {showFeedback && (
        <>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40" onClick={() => setShowFeedback(false)} />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div className="relative rounded-t-[32px] backdrop-blur-2xl p-6 pt-8 pb-10 overflow-hidden"
              style={{ background: 'rgba(2,6,16,0.97)', borderTop: `1px solid ${accentBorder}`, boxShadow: `0 -20px 60px rgba(34,211,238,0.15)` }}>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-[60px]"
                style={{ background: `rgba(34,211,238,0.2)` }} />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-3"
                    style={{ background: `linear-gradient(135deg, #0891b2, ${indigo})`, boxShadow: `0 0 30px rgba(34,211,238,0.4)` }}>
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl" style={{ color: accent }}>BENAR!</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="font-black text-sm text-yellow-400">+15 🪙</span>
                      <span className="font-black text-sm" style={{ color: accent }}>+100 ⭐</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowFeedback(false)}
                  className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm text-white"
                  style={{ background: `linear-gradient(90deg, #0891b2, #4338ca)`, boxShadow: `0 0 30px rgba(34,211,238,0.25)` }}>
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
