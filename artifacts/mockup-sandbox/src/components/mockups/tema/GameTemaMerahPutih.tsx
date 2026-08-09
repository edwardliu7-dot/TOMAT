import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, HelpCircle } from 'lucide-react';

// ── Deterministic positions ──────────────────────────────────────────────────

// Stars in night sky
const STARS = Array.from({ length: 60 }, (_, i) => ({
  left: ((i * 137.5 + 11) % 100).toFixed(2),
  top:  ((i * 89.3  + 5)  % 70).toFixed(2),   // only upper 70%
  size: (0.8 + (i % 4) * 0.5).toFixed(1),
  opacity: (0.15 + (i % 6) * 0.08).toFixed(2),
}));

// Firework burst clusters
const BURSTS: { cx: number; cy: number; r: number; color: string; rays: number }[] = [
  { cx: 18, cy: 14, r: 7,  color: '#DC2626', rays: 12 },
  { cx: 75, cy: 10, r: 9,  color: '#F8FAFC', rays: 14 },
  { cx: 50, cy: 22, r: 6,  color: '#FCA5A5', rays: 10 },
  { cx: 88, cy: 28, r: 5,  color: '#DC2626', rays: 8  },
  { cx: 32, cy: 30, r: 4,  color: '#F8FAFC', rays: 8  },
];

// Pre-compute burst rays as scattered dots
const BURST_DOTS = BURSTS.flatMap((b) =>
  Array.from({ length: b.rays }, (_, j) => {
    const angleRad = (j / b.rays) * 2 * Math.PI;
    const dist = b.r * (0.4 + ((j * 17 + 3) % 7) * 0.09);
    return {
      x: b.cx + Math.cos(angleRad) * dist,
      y: b.cy + Math.sin(angleRad) * dist,
      size: 1.5 + ((j * 3) % 3) * 0.8,
      color: b.color,
      opacity: 0.45 + ((j * 7) % 5) * 0.09,
    };
  })
);

// Confetti pieces (small rects, tilted)
const CONFETTI = Array.from({ length: 35 }, (_, i) => ({
  left:    ((i * 121.1 + 9) % 100).toFixed(1),
  top:     ((i * 77.3  + 5) % 100).toFixed(1),
  w:       (4 + (i % 3) * 3),
  h:       (2 + (i % 2) * 1.5),
  rot:     ((i * 41) % 180 - 90),
  color:   i % 3 === 0 ? '#DC2626' : i % 3 === 1 ? '#F8FAFC' : '#FCA5A5',
  opacity: (0.10 + (i % 5) * 0.06).toFixed(2),
}));

// Umbul-umbul (triangle flag buntings) along two ropes at the top
const FLAG_COLS = 13;
const FLAGS_ROW1 = Array.from({ length: FLAG_COLS }, (_, i) => ({
  x: (i / (FLAG_COLS - 1)) * 100,
  y: 4 + Math.sin((i / (FLAG_COLS - 1)) * Math.PI) * 3.5,   // sag curve
  isRed: i % 2 === 0,
}));
const FLAGS_ROW2 = Array.from({ length: FLAG_COLS }, (_, i) => ({
  x: (i / (FLAG_COLS - 1)) * 100,
  y: 9.5 + Math.sin((i / (FLAG_COLS - 1)) * Math.PI) * 3,
  isRed: i % 2 !== 0,
}));

// Silhouette skyline at the bottom (building outlines)
const SKYLINE = [
  { x: 0,   w: 60,  h: 38 },
  { x: 50,  w: 40,  h: 55 },
  { x: 80,  w: 50,  h: 45 },
  { x: 115, w: 35,  h: 70 },
  { x: 140, w: 60,  h: 35 },
  { x: 190, w: 45,  h: 60 },
  { x: 225, w: 55,  h: 48 },
  { x: 265, w: 40,  h: 80 },
  { x: 295, w: 70,  h: 42 },
  { x: 350, w: 45,  h: 58 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function GameTemaMerahPutih() {
  const [slider, setSlider] = useState(4);
  const [showFeedback, setShowFeedback] = useState(false);

  const red    = '#DC2626';
  const redBrt = '#EF4444';
  const white  = '#F8FAFC';
  const gold   = '#D4AF37';
  const navy   = '#050814';
  const midnightBg = 'linear-gradient(180deg,#050814 0%,#080d1f 35%,#0d1130 55%,#12001a 100%)';

  // ── Umbul-umbul helper ────────────────────────────────────────────────────
  const UmbulUmbul = ({ row }: { row: typeof FLAGS_ROW1 }) => (
    <>
      {/* Rope line */}
      <polyline
        points={row.map(f => `${f.x * 3.9},${f.y * 6.5}`).join(' ')}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.6"
      />
      {/* Triangle flags */}
      {row.map((f, i) => {
        const px = f.x * 3.9;
        const py = f.y * 6.5;
        const fw = 11, fh = 15;
        return (
          <polygon
            key={i}
            points={`${px - fw/2},${py} ${px + fw/2},${py} ${px},${py + fh}`}
            fill={f.isRed ? red : white}
            opacity={0.88}
          />
        );
      })}
    </>
  );

  return (
    <div
      className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] sm:min-h-[844px] sm:h-[844px] overflow-hidden flex flex-col font-sans sm:border sm:rounded-[40px] sm:my-8 shadow-2xl"
      style={{ background: midnightBg, borderColor: 'rgba(220,38,38,0.35)' }}
    >

      {/* ════════════════════════════════════════════════════════════════════
          ENVIRONMENT LAYER
          ════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

        {/* Night sky stars */}
        {STARS.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }} />
        ))}

        {/* Firework glow centers */}
        {BURSTS.map((b, i) => (
          <div key={i} className="absolute rounded-full blur-[18px]"
            style={{ left: `${b.cx}%`, top: `${b.cy}%`, width: `${b.r * 6}px`, height: `${b.r * 6}px`,
              transform: 'translate(-50%,-50%)',
              background: b.color, opacity: 0.22 }} />
        ))}

        {/* Firework burst dots */}
        {BURST_DOTS.map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.size}px`, height: `${d.size}px`,
              transform: 'translate(-50%,-50%)',
              background: d.color, opacity: d.opacity,
              boxShadow: `0 0 ${d.size * 2}px ${d.color}` }} />
        ))}

        {/* Confetti */}
        {CONFETTI.map((c, i) => (
          <div key={i} className="absolute"
            style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.w}px`, height: `${c.h}px`,
              background: c.color, opacity: c.opacity,
              transform: `rotate(${c.rot}deg)`, borderRadius: 1 }} />
        ))}

        {/* Umbul-umbul (SVG, full width) */}
        <svg
          className="absolute top-0 left-0 w-full"
          style={{ height: '140px' }}
          viewBox="0 0 390 140"
          preserveAspectRatio="none"
        >
          <UmbulUmbul row={FLAGS_ROW1} />
          <UmbulUmbul row={FLAGS_ROW2} />
        </svg>

        {/* Moon glow — putih keperakan */}
        <div className="absolute top-[-3%] right-[8%] rounded-full blur-[40px] opacity-20"
          style={{ width: 80, height: 80, background: 'radial-gradient(circle, #F8FAFC, #9CA3AF 60%, transparent 80%)' }} />

        {/* Horizon red glow — simulating distance celebration lights */}
        <div className="absolute bottom-[15%] left-0 right-0 h-20 blur-[30px] opacity-22"
          style={{ background: 'linear-gradient(0deg, #7f1d1d 0%, transparent 100%)' }} />

        {/* Building skyline silhouette */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          style={{ height: '100px' }}
          viewBox="0 0 390 100"
          preserveAspectRatio="none"
        >
          {SKYLINE.map((b, i) => (
            <rect key={i} x={b.x} y={100 - b.h} width={b.w} height={b.h}
              fill="rgba(5,8,20,0.95)" />
          ))}
          {/* Windows in buildings — tiny yellow dots */}
          {SKYLINE.flatMap((b, bi) =>
            Array.from({ length: Math.floor(b.h / 12) }, (_, ri) =>
              Array.from({ length: Math.floor(b.w / 12) }, (_, ci) => ({
                key: `${bi}-${ri}-${ci}`,
                x: b.x + 4 + ci * 12,
                y: 100 - b.h + 6 + ri * 12,
                lit: (bi + ri + ci) % 3 !== 0,
              }))
            ).flat()
          ).map(w => w.lit && (
            <rect key={w.key} x={w.x} y={w.y} width={4} height={3}
              fill="#D4AF37" opacity="0.55" rx="0.5" />
          ))}
        </svg>

        {/* Ground ambient light */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(0deg, rgba(220,38,38,0.08) 0%, transparent 100%)' }} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          UI LAYER
          ════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">

        {/* ── TopBar ── */}
        <div className="flex items-center justify-between p-4 backdrop-blur-xl border-b sticky top-0 z-30"
          style={{ background: 'rgba(5,8,20,0.80)', borderColor: 'rgba(220,38,38,0.28)' }}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl border"
              style={{ background: 'rgba(220,38,38,0.12)', borderColor: 'rgba(220,38,38,0.28)' }}>
              <ArrowLeft size={18} style={{ color: redBrt }} />
            </button>
            <div className="flex items-center gap-2">
              {/* Inline mini flag */}
              <div className="flex flex-col overflow-hidden rounded-sm shadow-md flex-shrink-0"
                style={{ width: 20, height: 14, gap: 0 }}>
                <div className="flex-1" style={{ background: red }} />
                <div className="flex-1" style={{ background: white }} />
              </div>
              <h1 className="font-bold text-[13px] text-slate-100 uppercase tracking-wider">
                Manifest Kargo
              </h1>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest"
            style={{ background: 'rgba(212,175,55,0.14)', border: `1px solid rgba(212,175,55,0.32)`, color: gold }}>
            MEDIUM
          </div>
        </div>

        {/* ── PlayerHeader ── */}
        <div className="flex justify-between items-center px-4 py-2.5 backdrop-blur-md border-b sticky top-[65px]"
          style={{ background: 'rgba(5,8,20,0.55)', borderColor: 'rgba(220,38,38,0.08)' }}>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)' }}>
              <span className="text-xs font-black text-yellow-400">🪙 1.240</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)' }}>
              <span className="text-xs font-black" style={{ color: redBrt }}>⭐ 8.450 XP</span>
            </div>
          </div>
          <div className="text-[11px] font-black tracking-widest px-2 py-1 rounded-md"
            style={{ color: 'rgba(220,38,38,0.65)', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)' }}>
            02:14
          </div>
        </div>

        {/* ── Game Area ── */}
        <div className="p-4 flex flex-col gap-5 pb-32 pt-5">

          {/* Event badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(220,38,38,0.28)' }}>
              <span style={{ fontSize: 11 }}>🇮🇩</span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: redBrt }}>
                Kemerdekaan RI · HUT ke-81
              </span>
            </div>
          </div>

          {/* ── Question Card — styled like a PIAGAM (certificate) ── */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: `1.5px solid ${gold}55` }}>

            {/* Certificate header stripe — merah */}
            <div className="relative flex items-center justify-between px-5 py-3"
              style={{ background: `linear-gradient(90deg, #7f1d1d, ${red}, #9b1c1c)` }}>
              {/* Gold top line */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px]"
                style={{ background: `linear-gradient(90deg, transparent, ${gold}, ${white}88, ${gold}, transparent)` }} />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'rgba(212,175,55,0.25)', border: `1.5px solid ${gold}88` }}>
                  ⭐
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white opacity-90">
                  Soal Pejuang Merdeka
                </span>
              </div>
              <span className="font-black text-[10px] tracking-widest" style={{ color: gold }}>5/10</span>
            </div>

            {/* Certificate body — putih semi-transparent */}
            <div className="p-5 flex flex-col gap-5"
              style={{ background: 'rgba(5,8,20,0.88)', borderTop: `1px solid ${gold}22` }}>

              {/* Gold side accent line */}
              <div className="absolute left-0 top-16 bottom-0 w-[3px]"
                style={{ background: `linear-gradient(180deg, ${red}, ${gold}88, transparent)` }} />

              <p className="text-[13px] leading-relaxed font-medium pl-3" style={{ color: 'rgba(248,250,252,0.75)' }}>
                Dua jenis kargo alien mendarat di dermaga. Selesaikan sistem persamaan berikut!
              </p>

              {/* Equation box — flag-stripe accent */}
              <div className="rounded-xl relative overflow-hidden"
                style={{ border: `1px solid rgba(212,175,55,0.18)` }}>
                {/* Left flag stripe */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col overflow-hidden" style={{ width: 5 }}>
                  <div className="flex-1" style={{ background: red }} />
                  <div className="flex-1" style={{ background: white }} />
                </div>
                <div className="p-5 pl-6 flex flex-col gap-3"
                  style={{ background: 'rgba(0,0,0,0.42)' }}>
                  <div className="font-mono text-xl font-bold flex flex-col gap-3 items-center">
                    <div className="flex items-center gap-2" style={{ color: '#fef2f2' }}>
                      <span style={{ color: redBrt }}>3x</span>
                      <span style={{ color: 'rgba(248,250,252,0.5)' }}>+</span>
                      <span style={{ color: white }}>2y</span>
                      <span style={{ color: 'rgba(248,250,252,0.5)' }}>=</span>
                      <span style={{ color: gold }}>24</span>
                    </div>
                    <div className="w-3/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${gold}44, transparent)` }} />
                    <div className="flex items-center gap-2" style={{ color: '#fef2f2' }}>
                      <span style={{ color: redBrt }}>x</span>
                      <span style={{ color: 'rgba(248,250,252,0.5)' }}>+</span>
                      <span style={{ color: white }}>4y</span>
                      <span style={{ color: 'rgba(248,250,252,0.5)' }}>=</span>
                      <span style={{ color: gold }}>20</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="font-black text-lg text-white pl-3">Tentukan nilai <span style={{ color: redBrt }}>x</span>!</h2>
                <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ color: gold, background: 'rgba(212,175,55,0.12)', border: `1px solid rgba(212,175,55,0.28)` }}>
                  <HelpCircle size={14} /> Hint
                </button>
              </div>

              {/* Hint box — parchment/piagam style */}
              <div className="p-3.5 rounded-xl flex items-start gap-3 pl-6"
                style={{ background: 'rgba(220,38,38,0.07)', border: `1px solid rgba(220,38,38,0.18)`, color: '#fca5a5' }}>
                <span className="text-base leading-none flex-shrink-0">🎆</span>
                <span className="text-[12px] leading-snug">
                  Gunakan eliminasi atau substitusi. Semangat Pejuang!
                </span>
              </div>
            </div>

            {/* Gold bottom line */}
            <div className="h-[1.5px]"
              style={{ background: `linear-gradient(90deg, transparent, ${gold}66, transparent)` }} />
          </div>

          {/* ── Slider Card — Bendera-themed ── */}
          <div className="rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
            style={{ background: 'rgba(5,8,20,0.88)', border: `1.5px solid rgba(220,38,38,0.28)` }}>

            {/* Diagonal flag stripe decoration (top-right corner) */}
            <div className="absolute top-0 right-0 overflow-hidden rounded-tr-2xl" style={{ width: 64, height: 64 }}>
              <div className="absolute" style={{ width: 64, height: 32, top: 0, right: 0, background: red, transform: 'skewY(-45deg)', transformOrigin: 'right top' }} />
              <div className="absolute" style={{ width: 64, height: 32, top: 32, right: 0, background: white, opacity: 0.12 }} />
            </div>

            <div className="flex justify-between items-end relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(220,38,38,0.5)' }}>Jawaban</span>
              <div className="text-4xl font-black font-mono" style={{ color: white, textShadow: `0 0 22px ${red}, 0 0 44px rgba(220,38,38,0.35)` }}>
                <span style={{ color: redBrt }}>x</span>
                <span style={{ color: 'rgba(248,250,252,0.45)' }}> = </span>
                <span>{slider}</span>
              </div>
            </div>

            {/* Slider — merah to putih gradient */}
            <div className="relative py-2 z-10">
              <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(220,38,38,0.15)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${(slider / 20) * 100}%`,
                    background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt}, #fca5a5, ${white})`,
                    boxShadow: `0 0 20px ${red}` }} />
              </div>
              <input type="range" min="0" max="20" value={slider}
                onChange={(e) => setSlider(+e.target.value)}
                className="relative w-full h-3 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-[5px]"
              />
              <div className="flex justify-between text-xs mt-6 font-mono font-bold tracking-widest" style={{ color: 'rgba(220,38,38,0.35)' }}>
                <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>

            {/* Confirm button */}
            <button onClick={() => setShowFeedback(true)}
              className="w-full rounded-2xl py-4 font-black text-white uppercase tracking-widest text-sm relative overflow-hidden"
              style={{ background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt})`,
                boxShadow: `0 0 32px rgba(220,38,38,0.40), 0 4px 16px rgba(0,0,0,0.5)` }}>
              {/* Shimmer stripe */}
              <div className="absolute top-0 left-[-40%] w-[30%] h-full opacity-20"
                style={{ background: 'linear-gradient(105deg, transparent, white, transparent)', transform: 'skewX(-20deg)' }} />
              🇮🇩 KONFIRMASI
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          FEEDBACK SHEET — fireworks celebration
          ════════════════════════════════════════════════════════════════════ */}
      {showFeedback && (
        <>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] z-40"
            onClick={() => setShowFeedback(false)} />
          <div className="absolute bottom-0 left-0 w-full z-50">
            <div className="relative rounded-t-[32px] backdrop-blur-2xl p-6 pt-8 pb-10 overflow-hidden"
              style={{ background: 'rgba(5,8,20,0.97)', borderTop: `2px solid ${red}55`,
                boxShadow: `0 -20px 60px rgba(220,38,38,0.22)` }}>

              {/* Background fireworks inside the sheet */}
              <div className="absolute inset-0 overflow-hidden rounded-t-[32px] pointer-events-none">
                {BURST_DOTS.slice(0, 30).map((d, i) => (
                  <div key={i} className="absolute rounded-full"
                    style={{ left: `${d.x * 1.1}%`, top: `${d.y * 0.6}%`,
                      width: `${d.size}px`, height: `${d.size}px`,
                      background: d.color, opacity: d.opacity * 0.6 }} />
                ))}
              </div>

              {/* Gold shimmer top */}
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${gold}, ${white}66, ${gold}, transparent)` }} />

              {/* Red/white glow */}
              <div className="absolute -top-16 left-1/4 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
                style={{ background: `rgba(220,38,38,0.25)` }} />
              <div className="absolute -top-16 right-1/4 w-40 h-40 rounded-full blur-[50px] pointer-events-none"
                style={{ background: `rgba(248,250,252,0.10)` }} />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  {/* Medal icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center rotate-3 flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, #7f1d1d, ${red})`,
                      border: `2px solid ${gold}66`,
                      boxShadow: `0 0 30px rgba(220,38,38,0.5), 0 0 12px ${gold}44` }}>
                    <Check size={34} color={white} strokeWidth={4} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl leading-none" style={{ color: redBrt }}>
                      MERDEKA!
                    </h3>
                    <p className="text-[11px] mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>Jawaban benar, Pejuang!</p>
                    <div className="flex gap-3 mt-2">
                      <span className="font-black text-sm text-yellow-400">+15 🪙</span>
                      <span className="font-black text-sm" style={{ color: redBrt }}>+100 ⭐</span>
                    </div>
                  </div>
                </div>

                {/* Merah-putih divider */}
                <div className="flex rounded-full overflow-hidden" style={{ height: 3 }}>
                  <div className="flex-1" style={{ background: red }} />
                  <div className="flex-1" style={{ background: white }} />
                </div>

                <button onClick={() => setShowFeedback(false)}
                  className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm text-white relative overflow-hidden"
                  style={{ background: `linear-gradient(90deg, #7f1d1d, ${red}, ${redBrt})`,
                    boxShadow: `0 0 28px rgba(220,38,38,0.35)` }}>
                  <div className="absolute top-0 left-[-40%] w-[30%] h-full opacity-20"
                    style={{ background: 'linear-gradient(105deg, transparent, white, transparent)', transform: 'skewX(-20deg)' }} />
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
