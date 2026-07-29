import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle, Skull } from 'lucide-react';

const GLITCH_CHARS = ['▓', '░', '▒', '█', '▀', '▄'];

// Static deterministic "glitch" scanlines
const SCANLINES = Array.from({ length: 8 }, (_, i) => ({
  top: `${10 + i * 11}%`,
  opacity: 0.015 + (i % 3) * 0.01,
}));

export default function GameTemaVoid() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  const accent = '#a855f7';
  const accentSoft = 'rgba(168,85,247,0.15)';
  const accentBorder = 'rgba(168,85,247,0.25)';
  const pink = '#ec4899';

  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] overflow-hidden flex flex-col font-sans sm:border sm:rounded-[40px] sm:my-8 shadow-2xl"
      style={{ background: '#000000', borderColor: 'rgba(168,85,247,0.25)' }}>

      {/* Void Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep void glow */}
        <div className="absolute top-[-30%] left-[10%] w-[80%] h-[60%] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(88,28,135,0.5) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[0%] w-[60%] h-[50%] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[-10%] w-[50%] h-[40%] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />
        {/* CRT scanlines */}
        {SCANLINES.map((s, i) => (
          <div key={i} className="absolute left-0 right-0 h-px bg-white pointer-events-none"
            style={{ top: s.top, opacity: s.opacity }} />
        ))}
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
        {/* Void grid - very subtle */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* TopBar */}
        <div className="flex items-center justify-between p-4 backdrop-blur-xl border-b sticky top-0 z-30"
          style={{ background: 'rgba(0,0,0,0.8)', borderColor: accentBorder }}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl border" style={{ background: accentSoft, borderColor: accentBorder }}>
              <ArrowLeft size={18} style={{ color: accent }} />
            </button>
            <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider font-mono">
              <Skull size={14} style={{ color: accent }} />
              Manifest Kargo
            </h1>
          </div>
          <div className="px-3 py-1 rounded text-[10px] font-black tracking-widest font-mono"
            style={{ background: accentSoft, border: `1px solid ${accentBorder}`, color: accent }}>
            MEDIUM
          </div>
        </div>

        {/* PlayerHeader */}
        <div className="flex justify-between items-center px-4 py-2.5 backdrop-blur-md border-b sticky top-[65px]"
          style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(168,85,247,0.08)' }}>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono"
              style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <span className="text-xs font-black" style={{ color: pink }}>🪙 1.240</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded font-mono"
              style={{ background: accentSoft, border: `1px solid ${accentBorder}` }}>
              <span className="text-xs font-black" style={{ color: accent }}>⭐ 8.450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black tracking-widest px-2 py-1 rounded font-mono"
            style={{ color: 'rgba(168,85,247,0.6)', background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
            02:14
          </div>
        </div>

        {/* Game Area */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          {/* Tema label */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono" style={{ color: 'rgba(168,85,247,0.5)' }}>Tema: Void</span>
          </div>

          {/* Question Card */}
          <div className="relative rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ background: 'rgba(5,0,10,0.9)', border: `1px solid ${accentBorder}` }}>
            {/* Top glow line */}
            <div className="absolute top-0 left-0 w-full h-[1px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}, ${pink}, transparent)` }} />
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: accent }} />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: accent }} />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" style={{ borderColor: accent }} />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: accent }} />

            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>
              <div className="flex flex-col gap-4 p-5 rounded-xl relative overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(168,85,247,0.12)' }}>
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, rgba(168,85,247,0.04) 0%, rgba(236,72,153,0.04) 100%)` }} />
                <div className="relative font-mono text-xl font-bold flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: accent, textShadow: `0 0 12px ${accent}` }}>3x</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>+</span>
                    <span style={{ color: pink, textShadow: `0 0 12px ${pink}` }}>2y</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>=</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>24</span>
                  </div>
                  <div className="w-full h-px" style={{ background: 'rgba(168,85,247,0.15)' }} />
                  <div className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: accent, textShadow: `0 0 12px ${accent}` }}>x</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>+</span>
                    <span style={{ color: pink, textShadow: `0 0 12px ${pink}` }}>4y</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>=</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>20</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white font-mono tracking-wide">Tentukan nilai x!</h2>
                <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded font-mono"
                  style={{ color: accent, background: accentSoft, border: `1px solid ${accentBorder}` }}>
                  <HelpCircle size={14} /> Hint
                </button>
              </div>
              <div className="p-3.5 rounded-xl flex items-start gap-3"
                style={{ background: 'rgba(168,85,247,0.06)', border: `1px solid ${accentBorder}` }}>
                <span className="text-lg leading-none">💀</span>
                <span className="text-[13px] leading-snug" style={{ color: 'rgba(168,85,247,0.8)', fontFamily: 'monospace' }}>
                  Gunakan metode eliminasi atau substitusi untuk menyelesaikan sistem ini.
                </span>
              </div>
            </div>
          </div>

          {/* Slider Card */}
          <div className="rounded-2xl backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl relative"
            style={{ background: 'rgba(5,0,10,0.9)', border: `1px solid ${accentBorder}` }}>
            {/* Top line */}
            <div className="absolute top-0 left-0 w-full h-[1px]"
              style={{ background: `linear-gradient(90deg, transparent, ${pink}, ${accent}, transparent)` }} />

            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest font-mono" style={{ color: 'rgba(168,85,247,0.5)' }}>Jawaban</span>
              <div className="text-4xl font-black text-white font-mono"
                style={{ textShadow: `0 0 25px ${accent}` }}>
                <span style={{ color: accent }}>x</span> = {sliderValue}
              </div>
            </div>
            <div className="relative py-2 z-10">
              <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-none overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(168,85,247,0.1)' }}>
                <div className="absolute left-0 top-0 h-full"
                  style={{ width: `${(sliderValue / 20) * 100}%`, background: `linear-gradient(90deg, #581c87, ${accent})`, boxShadow: `0 0 15px ${accent}` }} />
              </div>
              <input type="range" min="0" max="20" value={sliderValue} onChange={(e) => setSliderValue(+e.target.value)}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[5px] [&::-webkit-slider-thumb]:rotate-45"
                style={{ ['--slider-color' as any]: accent }} />
              <div className="flex justify-between text-xs mt-6 font-mono font-bold tracking-widest" style={{ color: 'rgba(168,85,247,0.3)' }}>
                <span>000</span><span>010</span><span>020</span>
              </div>
            </div>
            <button onClick={() => setShowFeedback(true)}
              className="w-full rounded-none py-4 font-black text-white uppercase tracking-widest text-sm font-mono relative overflow-hidden"
              style={{ background: `linear-gradient(90deg, #3b0764, #581c87)`, border: `1px solid ${accentBorder}`, boxShadow: `0 0 30px rgba(168,85,247,0.2)` }}>
              <span style={{ textShadow: `0 0 10px ${accent}` }}>▶ KONFIRMASI ◀</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px] z-40" onClick={() => setShowFeedback(false)} />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div className="relative backdrop-blur-2xl p-6 pt-8 pb-10 overflow-hidden"
              style={{ background: 'rgba(3,0,8,0.98)', borderTop: `1px solid ${accentBorder}`, boxShadow: `0 -20px 60px rgba(168,85,247,0.15)` }}>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-[60px]"
                style={{ background: `rgba(168,85,247,0.25)` }} />
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l" style={{ borderColor: accent }} />
              <div className="absolute top-3 right-3 w-5 h-5 border-t border-r" style={{ borderColor: accent }} />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-none flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, #3b0764, #581c87)`, boxShadow: `0 0 30px rgba(168,85,247,0.5)`, border: `1px solid ${accentBorder}` }}>
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl font-mono" style={{ color: accent, textShadow: `0 0 15px ${accent}` }}>BENAR!</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="font-black text-sm font-mono" style={{ color: pink }}>+15 🪙</span>
                      <span className="font-black text-sm font-mono" style={{ color: accent }}>+100 ⭐</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowFeedback(false)}
                  className="w-full py-4 font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-mono"
                  style={{ background: `linear-gradient(90deg, #3b0764, #831843)`, color: 'white', border: `1px solid ${accentBorder}`, boxShadow: `0 0 30px rgba(168,85,247,0.3)` }}>
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
