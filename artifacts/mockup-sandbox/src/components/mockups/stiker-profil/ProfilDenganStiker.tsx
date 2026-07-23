import { useState, useRef, useCallback } from "react";

const STIKER_CATALOG = [
  { id: "stiker_roket",   emoji: "🚀", nama: "Roket",        tier: "common" },
  { id: "stiker_api",     emoji: "🔥", nama: "Api",          tier: "common" },
  { id: "stiker_petir",   emoji: "⚡", nama: "Petir",        tier: "common" },
  { id: "stiker_bintang", emoji: "⭐", nama: "Bintang",      tier: "common" },
  { id: "stiker_awan",    emoji: "☁️", nama: "Awan",         tier: "common" },
  { id: "stiker_hati",    emoji: "💜", nama: "Hati",         tier: "common" },
  { id: "stiker_otak",    emoji: "🧠", nama: "Brainiac",     tier: "rare"   },
  { id: "stiker_mahkota", emoji: "👑", nama: "Mahkota",      tier: "rare"   },
  { id: "stiker_berlian", emoji: "💎", nama: "Berlian",      tier: "rare"   },
  { id: "stiker_medal",   emoji: "🏅", nama: "Medali",       tier: "rare"   },
  { id: "stiker_naga",    emoji: "🐉", nama: "Naga",         tier: "epic"   },
  { id: "stiker_galaksi", emoji: "🌌", nama: "Galaksi",      tier: "epic"   },
];

type PlacedStiker = {
  uid: string;       // unique instance id
  catalogId: string;
  emoji: string;
  x: number;        // percent 0–100 relative to banner width
  y: number;        // percent 0–100 relative to banner height
  size: number;     // px
};

let uidCounter = 0;
function newUid() { return `s${++uidCounter}`; }

const BANNER_H = 140; // px — height of the banner canvas area

export function ProfilDenganStiker() {
  const [placed, setPlaced] = useState<PlacedStiker[]>([
    { uid: "s0a", catalogId: "stiker_mahkota", emoji: "👑", x: 78, y: 18, size: 36 },
    { uid: "s0b", catalogId: "stiker_roket",   emoji: "🚀", x: 14, y: 55, size: 30 },
    { uid: "s0c", catalogId: "stiker_berlian", emoji: "💎", x: 55, y: 70, size: 28 },
    { uid: "s0d", catalogId: "stiker_galaksi", emoji: "🌌", x: 88, y: 60, size: 32 },
  ]);

  const [selected, setSelected] = useState<string | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ ox: 0, oy: 0 });

  // ── Add sticker by tapping in catalog ──
  function addStiker(cat: typeof STIKER_CATALOG[0]) {
    setPlaced(prev => [...prev, {
      uid: newUid(),
      catalogId: cat.id,
      emoji: cat.emoji,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 60,
      size: 28 + Math.floor(Math.random() * 14),
    }]);
  }

  // ── Remove selected stiker ──
  function removeSelected() {
    if (!selected) return;
    setPlaced(prev => prev.filter(s => s.uid !== selected));
    setSelected(null);
  }

  // ── Pointer-based drag on individual stiker ──
  const onStikerPointerDown = useCallback((
    e: React.PointerEvent,
    uid: string,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(uid);
    setDraggingUid(uid);

    const banner = bannerRef.current!;
    const rect = banner.getBoundingClientRect();
    const stiker = placed.find(s => s.uid === uid)!;
    // Offset from stiker center to pointer
    dragOffsetRef.current = {
      ox: e.clientX - rect.left - (stiker.x / 100) * rect.width,
      oy: e.clientY - rect.top  - (stiker.y / 100) * rect.height,
    };
  }, [placed]);

  const onStikerPointerMove = useCallback((
    e: React.PointerEvent,
    uid: string,
  ) => {
    if (draggingUid !== uid) return;
    const banner = bannerRef.current!;
    const rect = banner.getBoundingClientRect();
    const rawX = e.clientX - rect.left - dragOffsetRef.current.ox;
    const rawY = e.clientY - rect.top  - dragOffsetRef.current.oy;
    const x = Math.max(0, Math.min(100, (rawX / rect.width)  * 100));
    const y = Math.max(0, Math.min(100, (rawY / rect.height) * 100));
    setPlaced(prev => prev.map(s => s.uid === uid ? { ...s, x, y } : s));
  }, [draggingUid]);

  const onStikerPointerUp = useCallback(() => {
    setDraggingUid(null);
  }, []);

  // Tap on banner background → deselect
  function onBannerClick(e: React.MouseEvent) {
    if (e.target === bannerRef.current) setSelected(null);
  }

  // Resize selected stiker
  function resizeSelected(delta: number) {
    if (!selected) return;
    setPlaced(prev => prev.map(s =>
      s.uid === selected ? { ...s, size: Math.max(16, Math.min(72, s.size + delta)) } : s
    ));
  }

  const tierColor: Record<string, string> = {
    common: "border-slate-600 bg-slate-800/70",
    rare:   "border-blue-500/60 bg-blue-900/40",
    epic:   "border-purple-500/60 bg-purple-900/40",
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col select-none"
         style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SPANDUK = STIKER CANVAS ── */}
      <div
        ref={bannerRef}
        onClick={onBannerClick}
        className="relative flex-shrink-0 overflow-hidden cursor-crosshair"
        style={{
          height: BANNER_H,
          background: "linear-gradient(115deg,#020617,#172554 48%,#e0f2fe)",
        }}
      >
        {/* Star particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
              top: `${Math.sin(i * 1.3) * 40 + 50}%`,
              left: `${(i * 5.5) % 100}%`,
              opacity: 0.3 + (i % 4) * 0.1,
            }}
          />
        ))}

        {/* Guide label */}
        <div className="absolute top-2 left-3 text-white/25 text-[10px] pointer-events-none
                        tracking-wider uppercase font-medium">
          Kanvas Stiker
        </div>

        {/* Placed stickers */}
        {placed.map(s => {
          const isSelected = selected === s.uid;
          return (
            <div
              key={s.uid}
              onPointerDown={e => onStikerPointerDown(e, s.uid)}
              onPointerMove={e => onStikerPointerMove(e, s.uid)}
              onPointerUp={onStikerPointerUp}
              className="absolute flex items-center justify-center rounded-full
                         transition-[box-shadow] cursor-grab active:cursor-grabbing"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size + 8,
                height: s.size + 8,
                fontSize: s.size,
                transform: "translate(-50%, -50%)",
                zIndex: isSelected ? 30 : 10,
                boxShadow: isSelected
                  ? "0 0 0 2px #818cf8, 0 0 12px rgba(129,140,248,0.6)"
                  : "0 2px 8px rgba(0,0,0,0.4)",
                background: isSelected ? "rgba(129,140,248,0.15)" : "transparent",
              }}
            >
              {s.emoji}
            </div>
          );
        })}
      </div>

      {/* ── TOOLBAR (shows when stiker selected) ── */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 border-b border-white/5 bg-slate-900/80 backdrop-blur"
        style={{ minHeight: 40 }}
      >
        {selected ? (
          <>
            <span className="text-white/50 text-[11px]">
              {placed.find(s => s.uid === selected)?.emoji} dipilih
            </span>
            <div className="flex-1" />
            <button onClick={() => resizeSelected(-4)}
              className="w-7 h-7 rounded-lg bg-slate-700/80 text-white text-sm flex items-center justify-center hover:bg-slate-600">
              −
            </button>
            <button onClick={() => resizeSelected(+4)}
              className="w-7 h-7 rounded-lg bg-slate-700/80 text-white text-sm flex items-center justify-center hover:bg-slate-600">
              +
            </button>
            <button onClick={removeSelected}
              className="w-7 h-7 rounded-lg bg-red-900/60 text-red-300 text-sm flex items-center justify-center hover:bg-red-800/70 ml-1">
              🗑
            </button>
            <button onClick={() => setSelected(null)}
              className="w-7 h-7 rounded-lg bg-slate-700/80 text-white/50 text-xs flex items-center justify-center hover:bg-slate-600 ml-1">
              ✕
            </button>
          </>
        ) : (
          <span className="text-white/30 text-[11px] w-full text-center">
            Tap stiker untuk pilih · drag untuk geser · + / − untuk ukuran
          </span>
        )}
      </div>

      {/* ── AVATAR + INFO ── */}
      <div className="flex flex-col items-center px-4 pt-5 pb-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                          text-white bg-indigo-700"
               style={{ boxShadow: "0 0 18px 4px rgba(99,102,241,0.45)" }}>
            A
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[#0a0a1a] text-[10px]
                          font-black rounded-full w-5 h-5 flex items-center justify-center">
            12
          </div>
        </div>
        <h2 className="mt-2.5 text-white font-bold text-sm">Aditya Pranata</h2>
        <p className="text-slate-400 text-xs">Kelas 8A · SMPN 1 Jakarta</p>
        <div className="flex gap-3 mt-2.5">
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
            <span className="text-xs">🪙</span>
            <span className="text-yellow-400 text-xs font-bold">2.450</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
            <span className="text-xs">⚡</span>
            <span className="text-blue-400 text-xs font-bold">3.200 EXP</span>
          </div>
        </div>
      </div>

      {/* ── STIKER PICKER ── */}
      <div className="mx-4 mb-3 bg-slate-800/40 border border-white/5 rounded-2xl p-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-xs font-bold">✨ Tambah Stiker</h3>
          <span className="text-slate-500 text-[10px]">{placed.length} stiker terpasang</span>
        </div>

        {/* Tier groups */}
        {(["common","rare","epic"] as const).map(tier => {
          const items = STIKER_CATALOG.filter(s => s.tier === tier);
          return (
            <div key={tier} className="mb-2">
              <p className="text-slate-600 text-[9px] uppercase tracking-widest mb-1.5 ml-0.5">
                {tier === "common" ? "Umum" : tier === "rare" ? "⬥ Langka" : "★ Epik"}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {items.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => addStiker(cat)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl
                                border transition-all active:scale-90 hover:scale-105 ${tierColor[tier]}`}
                    title={`+ ${cat.nama}`}
                  >
                    {cat.emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <p className="text-slate-600 text-[10px] text-center mt-1">
          Tap stiker di atas untuk tambah ke banner
        </p>
      </div>
    </div>
  );
}
