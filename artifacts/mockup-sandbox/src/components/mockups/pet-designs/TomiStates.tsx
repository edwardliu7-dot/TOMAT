import React, { useState } from "react";

const STATES = [
  { id: "idle",     label: "Idle",     emoji: "😌", desc: "Santai, melayang pelan" },
  { id: "walk",     label: "Walk",     emoji: "🚶", desc: "Jalan kiri-kanan" },
  { id: "happy",    label: "Happy",    emoji: "🎉", desc: "Lompat girang" },
  { id: "hungry",   label: "Hungry",   emoji: "🍖", desc: "Gemetar lapar" },
  { id: "sleeping", label: "Sleeping", emoji: "💤", desc: "Napas tertidur" },
  { id: "dead",     label: "Dead",     emoji: "💀", desc: "Greyscale, goyang lemah" },
] as const;

type StateId = typeof STATES[number]["id"];

const STATE_COLORS: Record<StateId, { accent: string; bg: string; glow: string }> = {
  idle:     { accent: "#67E8F9", bg: "rgba(103,232,249,0.08)", glow: "rgba(103,232,249,0.25)" },
  walk:     { accent: "#34D399", bg: "rgba(52,211,153,0.08)",  glow: "rgba(52,211,153,0.25)"  },
  happy:    { accent: "#FBBF24", bg: "rgba(251,191,36,0.10)",  glow: "rgba(251,191,36,0.30)"  },
  hungry:   { accent: "#F87171", bg: "rgba(248,113,113,0.08)", glow: "rgba(248,113,113,0.25)" },
  sleeping: { accent: "#A78BFA", bg: "rgba(167,139,250,0.08)", glow: "rgba(167,139,250,0.25)" },
  dead:     { accent: "#6B7280", bg: "rgba(107,114,128,0.08)", glow: "rgba(107,114,128,0.20)" },
};

const CSS = `
  @keyframes tomi-idle {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    30%      { transform: translateY(-7px) rotate(-1.5deg); }
    70%      { transform: translateY(-4px) rotate(1deg); }
  }
  @keyframes tomi-walk {
    0%   { transform: translateX(0px)  rotate(0deg)  scaleX(1); }
    20%  { transform: translateX(6px)  rotate(3deg)  scaleX(1.04); }
    50%  { transform: translateX(0px)  rotate(0deg)  scaleX(1); }
    70%  { transform: translateX(-6px) rotate(-3deg) scaleX(1.04); }
    100% { transform: translateX(0px)  rotate(0deg)  scaleX(1); }
  }
  @keyframes tomi-happy {
    0%   { transform: scale(1)    rotate(0deg)   translateY(0px); }
    20%  { transform: scale(1.15) rotate(-8deg)  translateY(-12px); }
    40%  { transform: scale(1)    rotate(6deg)   translateY(0px); }
    60%  { transform: scale(1.10) rotate(-5deg)  translateY(-8px); }
    80%  { transform: scale(1)    rotate(3deg)   translateY(0px); }
    100% { transform: scale(1)    rotate(0deg)   translateY(0px); }
  }
  @keyframes tomi-hungry {
    0%,100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
    20%     { transform: translateX(-3px) translateY(2px) rotate(-2deg); }
    40%     { transform: translateX(3px)  translateY(1px) rotate(2deg); }
    60%     { transform: translateX(-2px) translateY(2px) rotate(-1deg); }
    80%     { transform: translateX(2px)  translateY(1px) rotate(1deg); }
  }
  @keyframes tomi-sleeping {
    0%,100% { transform: translateY(0px) rotate(-3deg); }
    50%     { transform: translateY(-5px) rotate(3deg); }
  }
  @keyframes tomi-dead {
    0%,100% { transform: rotate(-5deg) translateY(0px); }
    50%     { transform: rotate(5deg) translateY(2px); }
  }
  @keyframes z-float-1 {
    0%   { opacity: 0;   transform: translate(0px, 0px) scale(0.6); }
    30%  { opacity: 1;   transform: translate(4px, -10px) scale(1); }
    100% { opacity: 0;   transform: translate(8px, -28px) scale(0.8); }
  }
  @keyframes z-float-2 {
    0%   { opacity: 0;   transform: translate(0px, 0px) scale(0.5); }
    30%  { opacity: 1;   transform: translate(6px, -14px) scale(1); }
    100% { opacity: 0;   transform: translate(12px, -36px) scale(0.7); }
  }
  @keyframes z-float-3 {
    0%   { opacity: 0;   transform: translate(0px, 0px) scale(0.4); }
    30%  { opacity: 1;   transform: translate(8px, -18px) scale(1); }
    100% { opacity: 0;   transform: translate(16px, -46px) scale(0.6); }
  }
  @keyframes shadow-pulse {
    0%,100% { transform: translateX(-50%) scaleX(1); opacity: 0.25; }
    50%     { transform: translateX(-50%) scaleX(0.7); opacity: 0.12; }
  }
  @keyframes hungry-pulse {
    0%,100% { transform: translateX(-50%) scale(1);    opacity: 0; }
    20%     { transform: translateX(-50%) scale(1.1);  opacity: 1; }
    80%     { transform: translateX(-50%) scale(1.3);  opacity: 0; }
  }
  @keyframes card-glow-pulse {
    0%,100% { opacity: 0.6; }
    50%     { opacity: 1; }
  }
  @keyframes eyex-appear {
    0%   { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const ANIM: Record<StateId, string> = {
  idle:     "tomi-idle 2.4s ease-in-out infinite",
  walk:     "tomi-walk 0.85s ease-in-out infinite",
  happy:    "tomi-happy 0.9s ease-in-out infinite",
  hungry:   "tomi-hungry 1.2s ease-in-out infinite",
  sleeping: "tomi-sleeping 3.2s ease-in-out infinite",
  dead:     "tomi-dead 4s ease-in-out infinite",
};

function StateCard({ id, label, emoji, desc, active, onClick }: {
  id: StateId; label: string; emoji: string; desc: string;
  active: boolean; onClick: () => void;
}) {
  const c = STATE_COLORS[id];
  const isDead = id === "dead";
  const isSleeping = id === "sleeping";
  const isHungry = id === "hungry";
  const isHappy = id === "happy";

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        padding: "20px 12px 16px",
        borderRadius: 20,
        background: active ? c.bg : "rgba(255,255,255,0.03)",
        border: `1.5px solid ${active ? c.accent : "rgba(255,255,255,0.07)"}`,
        cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: active
          ? `0 0 32px ${c.glow}, inset 0 0 24px ${c.bg}`
          : "none",
        minWidth: 160,
        flex: 1,
        userSelect: "none",
      }}
    >
      {/* Glow blob behind pet */}
      {active && (
        <div style={{
          position: "absolute",
          top: "30%", left: "50%",
          transform: "translateX(-50%)",
          width: 120, height: 120,
          borderRadius: "50%",
          background: c.glow,
          filter: "blur(40px)",
          pointerEvents: "none",
          animation: "card-glow-pulse 2s ease-in-out infinite",
        }} />
      )}

      {/* Pet container */}
      <div style={{ position: "relative", width: 120, height: 140, marginBottom: 6 }}>

        {/* Shadow */}
        <div style={{
          position: "absolute",
          bottom: 4, left: "50%",
          width: 70, height: 14,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          filter: "blur(5px)",
          animation: "shadow-pulse 2.4s ease-in-out infinite",
          transformOrigin: "center",
        }} />

        {/* Sleeping Z bubbles */}
        {isSleeping && active && (
          <div style={{ position: "absolute", top: 0, right: 8, pointerEvents: "none" }}>
            <span style={{ position: "absolute", top: 28, right: 0, fontSize: 13, fontWeight: 900, color: "#A78BFA", animation: "z-float-1 2.4s ease-in-out infinite" }}>z</span>
            <span style={{ position: "absolute", top: 14, right: 6, fontSize: 17, fontWeight: 900, color: "#A78BFA", animation: "z-float-2 2.4s ease-in-out 0.7s infinite" }}>z</span>
            <span style={{ position: "absolute", top: 0, right: 14, fontSize: 22, fontWeight: 900, color: "#A78BFA", animation: "z-float-3 2.4s ease-in-out 1.4s infinite" }}>Z</span>
          </div>
        )}

        {/* Hungry indicator */}
        {isHungry && active && (
          <div style={{
            position: "absolute",
            top: -4, left: "50%",
            fontSize: 16,
            animation: "hungry-pulse 1.8s ease-in-out infinite",
            pointerEvents: "none",
          }}>🍖</div>
        )}

        {/* Happy sparkles */}
        {isHappy && active && (
          <>
            <span style={{ position: "absolute", top: 10, left: 2,  fontSize: 14, animation: "z-float-1 1.2s ease-in-out infinite" }}>✨</span>
            <span style={{ position: "absolute", top: 6,  right: 4, fontSize: 12, animation: "z-float-2 1.2s ease-in-out 0.4s infinite" }}>⭐</span>
            <span style={{ position: "absolute", top: 18, left: 10, fontSize: 10, animation: "z-float-3 1.2s ease-in-out 0.8s infinite" }}>✨</span>
          </>
        )}

        {/* Dead eyes overlay */}
        {isDead && (
          <div style={{
            position: "absolute",
            top: 28, left: "50%",
            transform: "translateX(-50%)",
            fontSize: 22,
            letterSpacing: 20,
            pointerEvents: "none",
            animation: "eyex-appear 0.4s ease-out both",
            zIndex: 2,
          }}>✕ ✕</div>
        )}

        {/* Tomi SVG */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          height: "100%",
          paddingBottom: 8,
        }}>
          <div style={{
            animation: ANIM[id],
            transformOrigin: "center bottom",
            filter: isDead
              ? "saturate(0) brightness(0.55)"
              : isHungry
              ? "saturate(0.6) brightness(0.85)"
              : isSleeping
              ? "brightness(0.75) saturate(0.7)"
              : "none",
            transition: "filter 0.4s ease",
          }}>
            <img
              src="/__mockup/images/tomi.svg"
              alt="Tomi"
              width={active ? 110 : 90}
              height={active ? 110 : 90}
              style={{
                display: "block",
                transition: "width 0.3s ease, height 0.3s ease",
                imageRendering: "crisp-edges",
              }}
            />
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5, marginBottom: 3,
      }}>
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <span style={{
          fontSize: 13, fontWeight: 800,
          color: active ? c.accent : "#94A3B8",
          transition: "color 0.2s",
        }}>{label}</span>
      </div>
      <span style={{
        fontSize: 10, color: "#475569", fontWeight: 500,
        textAlign: "center", lineHeight: 1.4,
      }}>{desc}</span>

      {/* Active pip */}
      {active && (
        <div style={{
          position: "absolute", bottom: 10,
          width: 24, height: 3, borderRadius: 99,
          background: c.accent,
          boxShadow: `0 0 8px ${c.accent}`,
        }} />
      )}
    </div>
  );
}

export function TomiStates() {
  const [active, setActive] = useState<StateId>("idle");
  const activeColor = STATE_COLORS[active];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#071321",
      color: "#E2E8F0",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 24px",
      gap: 28,
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
          Pet Design · Tomi SVG
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>
          Tomi —{" "}
          <span style={{ color: activeColor.accent, transition: "color 0.3s" }}>
            {STATES.find(s => s.id === active)?.label}
          </span>
        </h1>
        <p style={{ fontSize: 12, color: "#64748B", margin: "6px 0 0", fontWeight: 500 }}>
          Klik kartu untuk preview animasi · 6 state behavior
        </p>
      </div>

      {/* Cards row */}
      <div style={{
        display: "flex",
        gap: 10,
        width: "100%",
        maxWidth: 1060,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {STATES.map(s => (
          <StateCard
            key={s.id}
            {...s}
            active={active === s.id}
            onClick={() => setActive(s.id)}
          />
        ))}
      </div>

      {/* Bottom hint */}
      <div style={{
        fontSize: 11, color: "#334155", fontWeight: 500,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: 16, width: "100%", maxWidth: 1060,
        textAlign: "center",
      }}>
        idle · walk · happy · hungry · sleeping · dead — animasi CSS @keyframes, siap diimplementasi ke FloatingPet
      </div>
    </div>
  );
}
