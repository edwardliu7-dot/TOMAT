import React, { useState } from "react";
import { ChevronLeft, Zap } from "lucide-react";

export default function GameWeb() {
  const [sliderValue, setSliderValue] = useState(-10);
  const [confirmed, setConfirmed] = useState(false);
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);

  const correctAnswer = -10;

  const handleConfirm = () => {
    if (confirmed) return;
    setConfirmed(true);
    setShowResult(sliderValue === correctAnswer ? "correct" : "wrong");
    setTimeout(() => { setConfirmed(false); setShowResult(null); }, 2000);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.10] blur-[140px]" />
        <div className="absolute right-0 top-[30%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
      </div>

      {/* Left sidebar — game info */}
      <aside className="relative z-20 flex w-[280px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/80 backdrop-blur-xl shrink-0 p-6">
        <div className="flex items-center gap-2 mb-8">
          <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-indigo-500/15 bg-[#0E1E35] text-indigo-300">
            <ChevronLeft size={18} />
          </button>
          <div className="text-[13px] font-bold text-white">Keluar Game</div>
        </div>

        <div className="mb-6">
          <div className="rounded-md bg-cyan-400/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300 w-fit mb-2">BILANGAN BULAT</div>
          <h2 className="text-[20px] font-black leading-tight">Katak Pelompat Batu</h2>
          <p className="text-[12px] text-[#4B6480] mt-1">Kelas VIII · BAB I · Bilangan Bulat</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-[12px] font-bold mb-2">
            <span className="text-[#4B6480]">Soal</span>
            <span className="text-indigo-300">3 / 5</span>
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${i <= 2 ? "bg-indigo-400" : i === 3 ? "bg-indigo-500/40" : "bg-white/[0.08]"}`}>
                  {i <= 2 && <div className="h-full w-full rounded-full bg-indigo-400" />}
                </div>
                <div className={`text-[10px] font-bold w-4 text-right ${i <= 2 ? "text-indigo-300" : i === 3 ? "text-white" : "text-[#4B6480]"}`}>
                  {i <= 2 ? "✓" : i === 3 ? "●" : "○"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duel info */}
        <div className="rounded-[16px] border border-indigo-500/15 bg-[#0E1E35] p-4 mb-4">
          <div className="text-[10px] font-bold text-[#4B6480] uppercase tracking-wider mb-3">Mode Duel</div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-black">AF</div>
              <div>
                <div className="text-[12px] font-bold">Ahmad F.</div>
                <div className="text-[10px] text-emerald-400">Kamu</div>
              </div>
            </div>
            <div className="text-[22px] font-black text-white">2 — 1</div>
            <div className="flex items-center gap-2">
              <div>
                <div className="text-[12px] font-bold text-right">Budi S.</div>
                <div className="text-[10px] text-orange-400 text-right">Lawan</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[11px] font-black">BS</div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>

        {/* Rewards */}
        <div className="rounded-[16px] border border-yellow-400/15 bg-yellow-400/[0.05] p-4 mt-auto">
          <div className="text-[10px] font-bold text-yellow-300/70 uppercase tracking-wider mb-2">Hadiah Menang</div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-[18px] font-black text-indigo-300">+40</div>
              <div className="text-[9px] text-[#4B6480]">XP</div>
            </div>
            <div className="h-8 w-px bg-white/[0.06]" />
            <div className="text-center">
              <div className="text-[18px] font-black text-yellow-300">+15</div>
              <div className="text-[9px] text-[#4B6480]">Koin 🪙</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main game area */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-indigo-500/[0.08] bg-[#071321]/60 backdrop-blur-xl">
          <div className="h-2 flex-1 max-w-md rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[60%] rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          </div>
          <div className="flex items-center gap-4 ml-6">
            {/* Timer */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-indigo-500/30">
              <div className="absolute inset-1 rounded-full border-2 border-indigo-400 border-t-transparent animate-[spin_3s_linear_infinite]" />
              <span className="text-[18px] font-black text-indigo-300 z-10">42</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-3 py-2">
              <span className="text-[13px]">🪙</span>
              <span className="text-[12px] font-bold text-yellow-200">30</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-8">
          <div className="w-full max-w-2xl">
            <div className="rounded-[24px] border border-indigo-500/[0.18] bg-[#0E1E35] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-8 text-center">
              <div className="rounded-md bg-cyan-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300 mb-6 inline-block">
                OPERASI BILANGAN BULAT
              </div>
              <div className="text-[48px] font-black text-white tracking-tight">
                (-8) + (-5) + 3 = ?
              </div>
              <div className="mt-3 text-[14px] text-[#4B6480]">
                Geser slider ke jawaban yang benar
              </div>
            </div>

            {/* Number line */}
            <div className="rounded-[20px] border border-indigo-500/[0.10] bg-[#0A1628] p-6 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-blue-900/20 pointer-events-none" />
              <div className="relative">
                <div className="text-[11px] text-[#4B6480] font-semibold mb-4">GARIS BILANGAN</div>
                <div className="relative h-12 flex items-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-px w-full bg-indigo-400/25" />
                  </div>
                  {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map((n) => (
                    <div
                      key={n}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${((n + 20) / 40) * 100}%`, transform: "translateX(-50%)" }}
                    >
                      <div className={`h-3 w-px ${n === 0 ? "bg-white/50" : "bg-indigo-400/25"}`} />
                      <div className={`text-[11px] mt-1 ${n === 0 ? "text-white/60 font-bold" : "text-[#4B6480]"}`}>{n}</div>
                    </div>
                  ))}
                  {/* Frog marker */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-2 transition-all duration-200"
                    style={{ left: `${((sliderValue + 20) / 40) * 100}%` }}
                  >
                    <div className="text-[28px] drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]">🐸</div>
                  </div>
                  {/* Opponent ghost frog */}
                  <div
                    className="absolute -translate-x-1/2 translate-y-1 opacity-50"
                    style={{ left: `${((-8 + 20) / 40) * 100}%` }}
                  >
                    <div className="text-[20px]">👻</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="px-4 mb-8">
              <div className={`text-[56px] font-black tracking-tighter text-center mb-4 transition-colors ${showResult === "correct" ? "text-emerald-400" : showResult === "wrong" ? "text-red-400" : "text-indigo-300"}`}>
                {sliderValue > 0 ? `+${sliderValue}` : sliderValue === 0 ? "0" : `${sliderValue}`}
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full h-4 appearance-none rounded-full bg-[#0A1628] outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_4px_16px_rgba(99,102,241,0.5)] cursor-pointer"
              />
              <div className="w-full flex justify-between mt-2 text-[12px] font-semibold text-[#4B6480]">
                <span>−30</span>
                <span>0</span>
                <span>+30</span>
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={confirmed}
              className={`w-full rounded-[16px] px-5 py-5 text-[16px] font-black text-white transition-all disabled:opacity-70 ${
                showResult === "correct"
                  ? "bg-emerald-500 shadow-[0_6px_32px_rgba(52,211,153,0.35)]"
                  : showResult === "wrong"
                  ? "bg-red-500 shadow-[0_6px_32px_rgba(239,68,68,0.35)]"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_6px_32px_rgba(99,102,241,0.4)] hover:-translate-y-1"
              }`}
            >
              {showResult === "correct"
                ? "✅ BENAR! +40 XP · +15 🪙"
                : showResult === "wrong"
                ? "❌ SALAH! Coba lagi"
                : `KONFIRMASI POSISI ${sliderValue}`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
