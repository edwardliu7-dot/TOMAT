import React, { useState } from "react";
import { ChevronLeft, Zap } from "lucide-react";

export default function GameMobile() {
  const [sliderValue, setSliderValue] = useState(-10);
  const [confirmed, setConfirmed] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);

  const correctAnswer = -10;

  const handleConfirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    setShowResult(sliderValue === correctAnswer ? "correct" : "wrong");
    setTimeout(() => {
      setConfirmed(false);
      setShowResult(null);
    }, 2000);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white flex flex-col font-sans">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1 pb-4">
        {/* Top bar */}
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between">
            <button className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-indigo-500/[0.15] bg-[#0E1E35] text-white">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <div className="text-[12px] font-bold text-white">Katak Pelompat Batu</div>
              <div className="text-[10px] text-[#4B6480]">Soal 3 dari 5</div>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-3 py-1.5">
              <span className="text-[11px]">🪙</span>
              <span className="text-[11px] font-bold text-yellow-200">+15</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          </div>
        </div>

        {/* Duel score bar */}
        <div className="mx-4 mt-5 rounded-[16px] border border-indigo-500/15 bg-[#0E1E35] p-3">
          <div className="flex items-center justify-between text-[11px] font-bold mb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-black">AF</div>
              <span className="text-indigo-300">KAMU</span>
            </div>
            <div className="text-[16px] font-black text-white">2 — 1</div>
            <div className="flex items-center gap-2">
              <span className="text-orange-300">LAWAN</span>
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] font-black">BS</div>
            </div>
          </div>
          <div className="relative h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>

        {/* Timer */}
        <div className="mt-5 flex justify-center">
          <div className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full border-[3px] border-indigo-500/30">
            <div className="absolute inset-1 rounded-full border-[3px] border-indigo-400 border-t-transparent animate-[spin_3s_linear_infinite]" />
            <div className="text-[24px] font-black tracking-tight text-indigo-300">42</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="px-4 mt-5">
          <div className="rounded-[22px] border border-indigo-500/[0.15] bg-[#0E1E35] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.35)] flex flex-col items-center">
            <div className="rounded-md bg-cyan-400/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 mb-4">
              BILANGAN BULAT
            </div>
            <div className="text-[30px] font-black text-white text-center tracking-tight">
              (-8) + (-5) + 3 = ?
            </div>
            <div className="mt-2 text-[11px] font-medium text-[#4B6480] text-center">
              Geser slider ke jawaban yang benar
            </div>
          </div>
        </div>

        {/* Number line visual */}
        <div className="px-4 mt-5">
          <div className="rounded-[16px] border border-indigo-500/10 bg-[#0A1628] p-4 relative overflow-hidden">
            {/* River / background */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-blue-900/20" />
            <div className="relative">
              <div className="text-[10px] text-[#4B6480] mb-3 font-semibold">GARIS BILANGAN</div>
              {/* Number line */}
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-indigo-400/30" />
                </div>
                {/* Tick marks */}
                {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map((n) => (
                  <div
                    key={n}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${((n + 20) / 40) * 100}%`, transform: "translateX(-50%)" }}
                  >
                    <div className={`h-2 w-px ${n === 0 ? "bg-white/60" : "bg-indigo-400/30"}`} />
                    <div className={`text-[8px] mt-1 ${n === 0 ? "text-white/60" : "text-[#4B6480]"}`}>{n}</div>
                  </div>
                ))}
                {/* Frog marker (player answer position) */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1 transition-all duration-200"
                  style={{ left: `${((sliderValue + 20) / 40) * 100}%` }}
                >
                  <div className="text-[20px]">🐸</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slider answer */}
        <div className="px-6 mt-5 flex flex-col items-center">
          <div className={`text-[40px] font-black tracking-tighter mb-4 transition-colors ${showResult === "correct" ? "text-emerald-400" : showResult === "wrong" ? "text-red-400" : "text-indigo-300"}`}>
            {sliderValue > 0 ? `+${sliderValue}` : sliderValue === 0 ? "0" : `${sliderValue}`}
          </div>

          <div className="relative w-full flex items-center h-8">
            <input
              type="range"
              min="-30"
              max="30"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="absolute w-full h-3 appearance-none rounded-full bg-[#0A1628] outline-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_2px_12px_rgba(99,102,241,0.5)] cursor-pointer"
            />
          </div>
          <div className="w-full flex justify-between mt-2 text-[10px] font-semibold text-[#4B6480]">
            <span>−30</span>
            <span>0</span>
            <span>+30</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Confirm Button */}
        <div className="px-4 mt-4 flex flex-col items-center">
          <button
            onClick={handleConfirm}
            disabled={confirmed}
            className={`w-full rounded-[14px] px-5 py-4 text-[15px] font-black text-white transition-all disabled:opacity-70 ${
              showResult === "correct"
                ? "bg-emerald-500 shadow-[0_4px_24px_rgba(52,211,153,0.3)]"
                : showResult === "wrong"
                ? "bg-red-500 shadow-[0_4px_24px_rgba(239,68,68,0.3)]"
                : "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_4px_24px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
            }`}
          >
            {showResult === "correct" ? "✅ BENAR! +15 🪙" : showResult === "wrong" ? "❌ SALAH!" : `KONFIRMASI POSISI ${sliderValue}`}
          </button>
        </div>
      </div>

      {/* Bottom Score Strip */}
      <div className="border-t border-indigo-500/[0.08] bg-[#071321]/95 px-5 py-3 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap size={16} className="text-indigo-400" />
          <span className="text-[13px] font-black text-indigo-200">+40 XP</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          ))}
          <div className="h-2.5 w-2.5 rounded-full bg-red-400 opacity-50 ml-1" />
          <div className="h-2.5 w-2.5 rounded-full bg-red-400 opacity-50" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">🪙</span>
          <span className="text-[13px] font-black text-yellow-200">30</span>
        </div>
      </div>
    </div>
  );
}
