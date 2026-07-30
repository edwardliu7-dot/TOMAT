import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle, Star } from 'lucide-react';

// Deterministic particle positions
const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: ((i * 131.7 + 7) % 100).toFixed(1),
  top:  ((i * 87.3  + 12) % 100).toFixed(1),
  size: (2 + (i % 4) * 1.2).toFixed(1),
  opacity: (0.08 + (i % 5) * 0.06).toFixed(2),
  isRed: i % 3 !== 0,
}));

const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  left: ((i * 113.1 + 5) % 100).toFixed(1),
  top:  ((i * 73.9  + 30) % 100).toFixed(1),
  size: (1.5 + (i % 3) * 1.0).toFixed(1),
  opacity: (0.12 + (i % 4) * 0.07).toFixed(2),
}));

export default function GameTemaMerahPutih() {
  const [sliderValue, setSliderValue] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  const red    = '#DC2626';
  const redBrt = '#EF4444';
  const redDim = 'rgba(220,38,38,0.14)';
  const redBrd = 'rgba(220,38,38,0.28)';
  const white  = '#F1F5F9';
  const cream  = '#FEF2F2';

  return (
    <div
      className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] overflow-hidden flex flex-col font-sans sm:border sm:rounded-[40px] sm:my-8 shadow-2xl"
      style={{ background: 'linear-gradient(180deg,#1a0009 0%,#2d0004 38%,#1c000a 65%,#0f0005 100%)', borderColor: redBrd }}
    >
      {/* ── Background atmosphere ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Star/dot particles — merah & putih */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              background: s.isRed ? red : white,
              opacity: s.opacity,
              boxShadow: s.isRed ? `0 0 ${+s.size * 3}px ${red}` : `0 0 ${+s.size * 2}px ${white}`,
            }}
          />
        ))}

        {/* Spark streaks */}
        {SPARKS.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${s.left}%`, top: `${s.top}%`,
              width: `${+s.size * 8}px`, height: `${s.size}px`,
              background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? redBrt : white}, transparent)`,
              opacity: s.opacity,
              transform: `rotate(${(i * 23) % 60 - 30}deg)`,
              borderRadius: 99,
            }}
          />
        ))}

        {/* Red glow — bottom flame source */}
        <div
          className="absolute bottom-[-8%] left-[5%] w-[90%] h-[55%] rounded-full blur-[110px]"
          style={{ background: 'radial-gradient(circle, #b91c1c 0%, #7f1d1d 45%, transparent 72%)', opacity: 0.32 }}
        />
        {/* White shimmer — top */}
        <div
          className="absolute top-[-20%] left-[20%] w-[60%] h-[50%] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(248,250,252,0.18) 0%, transparent 70%)', opacity: 0.6 }}
        />
        {/* Merah strip — top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-28"
          style={{ background: 'linear-gradient(180deg, rgba(220,38,38,0.22) 0%, transparent 100%)' }}
        />
        {/* Putih strip — bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(0deg, rgba(248,250,252,0.10) 0%, transparent 100%)' }}
        />
        {/* Flag divider — subtle horizontal line */}
        <div
          className="absolute left-0 right-0"
          style={{ top: '50%', height: '1px', background: `linear-gradient(90deg, transparent 5%, ${red}30 35%, ${white}20 50%, ${red}30 70%, transparent 95%)` }}
        />
        {/* Diagonal shine */}
        <div
          className="absolute top-0 left-[-30%] w-[50%] h-full opacity-[0.04]"
          style={{ background: `linear-gradient(105deg, transparent, ${white} 50%, transparent)`, transform: 'skewX(-15deg)' }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* ── TopBar ── */}
        <div
          className="flex items-center justify-between p-4 backdrop-blur-xl border-b sticky top-0 z-30"
          style={{ background: 'rgba(26,0,9,0.82)', borderColor: redBrd }}
        >
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl border" style={{ background: redDim, borderColor: redBrd }}>
              <ArrowLeft size={18} style={{ color: redBrt }} />
            </button>
            <h1 className="font-bold text-[13px] text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <span style={{ fontSize: 14 }}>🇮🇩</span>
              Manifest Kargo
            </h1>
          </div>
          <div
            className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest"
            style={{ background: redDim, border: `1px solid ${redBrd}`, color: redBrt }}
          >
            MEDIUM
          </div>
        </div>

        {/* ── PlayerHeader ── */}
        <div
          className="flex justify-between items-center px-4 py-2.5 backdrop-blur-md border-b sticky top-[65px]"
          style={{ background: 'rgba(26,0,9,0.55)', borderColor: 'rgba(220,38,38,0.08)' }}
        >
          <div className="flex gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)' }}
            >
              <span className="text-xs font-black text-yellow-400">🪙 1.240</span>
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: redDim, border: `1px solid ${redBrd}` }}
            >
              <span className="text-xs font-black" style={{ color: redBrt }}>⭐ 8.450 XP</span>
            </div>
          </div>
          <div
            className="text-[11px] font-black tracking-widest px-2 py-1 rounded-md"
            style={{ color: 'rgba(239,68,68,0.65)', background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.14)' }}
          >
            02:14
          </div>
        </div>

        {/* ── Game Area ── */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-6">
          {/* Tema label */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: red, boxShadow: `0 0 6px ${red}` }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(239,68,68,0.5)' }}>
              Tema: Merah Putih
            </span>
            <div className="w-2 h-2 rounded-full" style={{ background: white, boxShadow: `0 0 5px ${white}` }} />
          </div>

          {/* ── Question Card ── */}
          <div
            className="relative rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ background: 'rgba(22,2,10,0.9)', border: `1px solid ${redBrd}` }}
          >
            {/* Top shimmer — red to white */}
            <div
              className="absolute top-0 left-0 w-full h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${red}, ${white}, ${red}, transparent)` }}
            />
            <div className="p-5 flex flex-col gap-5">
              <p className="text-[13px] leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>

              {/* Equation box */}
              <div
                className="flex flex-col gap-4 p-5 rounded-2xl relative overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid rgba(220,38,38,0.10)` }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.05) 0%, rgba(248,250,252,0.03) 100%)' }}
                />
                <div className="relative font-mono text-xl font-bold flex flex-col gap-3 items-center">
                  <div className="flex items-center gap-3" style={{ color: cream }}>
                    <span style={{ color: redBrt }}>3x</span>
                    {' + '}
                    <span style={{ color: white }}>2y</span>
                    {' = 24'}
                  </div>
                  <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${redBrd}, transparent)` }} />
                  <div className="flex items-center gap-3" style={{ color: cream }}>
                    <span style={{ color: redBrt }}>x</span>
                    {' + '}
                    <span style={{ color: white }}>4y</span>
                    {' = 20'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white">Tentukan nilai x!</h2>
                <button
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ color: redBrt, background: redDim, border: `1px solid ${redBrd}` }}
                >
                  <HelpCircle size={14} /> Hint
                </button>
              </div>

              {/* Hint box */}
              <div
                className="p-3.5 rounded-xl flex items-start gap-3"
                style={{ background: 'rgba(220,38,38,0.08)', border: `1px solid rgba(220,38,38,0.20)`, color: '#fca5a5' }}
              >
                <span className="text-lg leading-none">🇮🇩</span>
                <span className="text-[13px] leading-snug">
                  Gunakan metode eliminasi atau substitusi untuk menyelesaikan sistem ini.
                </span>
              </div>
            </div>
          </div>

          {/* ── Slider Card ── */}
          <div
            className="rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
            style={{ background: 'rgba(22,2,10,0.9)', border: `1px solid ${redBrd}` }}
          >
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(220,38,38,0.04) 0%, rgba(248,250,252,0.02) 100%)' }}
            />

            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(239,68,68,0.4)' }}>
                Jawaban
              </span>
              <div
                className="text-4xl font-black text-white font-mono"
                style={{ textShadow: `0 0 22px ${red}, 0 0 44px rgba(220,38,38,0.4)` }}
              >
                <span style={{ color: redBrt }}>x</span> = {sliderValue}
              </div>
            </div>

            {/* Slider track */}
            <div className="relative py-2 z-10">
              <div
                className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid rgba(220,38,38,0.12)` }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${(sliderValue / 20) * 100}%`,
                    background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt}, ${white})`,
                    boxShadow: `0 0 18px ${red}`,
                  }}
                />
              </div>
              <input
                type="range" min="0" max="20" value={sliderValue}
                onChange={(e) => setSliderValue(+e.target.value)}
                className="relative w-full h-2.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[6px]"
                style={{ '--thumb-border-color': red } as React.CSSProperties}
              />
              <div
                className="flex justify-between text-xs mt-6 font-mono font-bold tracking-widest"
                style={{ color: 'rgba(220,38,38,0.3)' }}
              >
                <span>0</span><span>10</span><span>20</span>
              </div>
            </div>

            {/* Confirm button — merah gradient */}
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl py-4 font-black text-white uppercase tracking-widest text-sm"
              style={{
                background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt})`,
                boxShadow: `0 0 32px rgba(220,38,38,0.35)`,
              }}
            >
              🇮🇩 KONFIRMASI
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback Sheet ── */}
      {showFeedback && (
        <>
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-40"
            onClick={() => setShowFeedback(false)}
          />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div
              className="relative rounded-t-[32px] backdrop-blur-2xl p-6 pt-8 pb-10 overflow-hidden"
              style={{
                background: 'rgba(20,0,8,0.97)',
                borderTop: `1px solid ${redBrd}`,
                boxShadow: `0 -20px 60px rgba(220,38,38,0.18)`,
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-[60px]"
                style={{ background: 'rgba(220,38,38,0.22)' }}
              />
              {/* White shimmer top */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: `linear-gradient(90deg, transparent, ${white}55, transparent)` }}
              />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-3"
                    style={{
                      background: `linear-gradient(135deg, #7f1d1d, ${red}, ${redBrt})`,
                      boxShadow: `0 0 30px rgba(220,38,38,0.45)`,
                    }}
                  >
                    <Check size={32} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl" style={{ color: redBrt }}>BENAR!</h3>
                    <div className="flex gap-3 mt-1">
                      <span className="font-black text-sm text-yellow-400">+15 🪙</span>
                      <span className="font-black text-sm" style={{ color: redBrt }}>+100 ⭐</span>
                    </div>
                  </div>
                </div>

                {/* Divider merah-putih */}
                <div
                  className="h-[2px] rounded-full"
                  style={{ background: `linear-gradient(90deg, ${red}, ${white}88, ${red})` }}
                />

                <button
                  onClick={() => setShowFeedback(false)}
                  className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm text-white"
                  style={{
                    background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt})`,
                    boxShadow: `0 0 30px rgba(220,38,38,0.28)`,
                  }}
                >
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
