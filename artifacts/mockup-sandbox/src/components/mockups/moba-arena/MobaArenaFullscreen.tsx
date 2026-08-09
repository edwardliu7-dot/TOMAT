import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  Compass,
  Crosshair,
  Gem,
  Map,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from "lucide-react";

type Team = "pijar" | "rona";
type NodeDifficulty = "mudah" | "sedang" | "sulit";

type QuestionNode = {
  id: string;
  x: string;
  y: string;
  difficulty: NodeDifficulty;
  points: number;
  label: string;
  claimed?: boolean;
};

type Pet = {
  id: string;
  name: string;
  species: string;
  letter: string;
  team: Team;
  x: string;
  y: string;
  tone: string;
  carrying?: boolean;
  self?: boolean;
  mood?: "idle" | "walk" | "happy";
};

const questionNodes: QuestionNode[] = [
  { id: "n1", x: "26%", y: "27%", difficulty: "mudah", points: 10, label: "Keliling" },
  { id: "n2", x: "44%", y: "64%", difficulty: "sedang", points: 25, label: "Pecahan" },
  { id: "n3", x: "58%", y: "28%", difficulty: "sulit", points: 50, label: "Peluang" },
  { id: "n4", x: "72%", y: "67%", difficulty: "mudah", points: 10, label: "Luas" },
  { id: "n5", x: "78%", y: "30%", difficulty: "sedang", points: 25, label: "Pola", claimed: true },
  { id: "n6", x: "52%", y: "82%", difficulty: "mudah", points: 10, label: "Sudut" },
];

const pets: Pet[] = [
  {
    id: "alya",
    name: "Alya",
    species: "Tomi",
    letter: "T",
    team: "pijar",
    x: "29%",
    y: "46%",
    tone: "#f1785e",
    carrying: true,
    self: true,
    mood: "walk",
  },
  {
    id: "bimo",
    name: "Bimo",
    species: "Monyang",
    letter: "M",
    team: "pijar",
    x: "35%",
    y: "23%",
    tone: "#e2a33e",
    mood: "idle",
  },
  {
    id: "nisa",
    name: "Nisa",
    species: "Kelinsay",
    letter: "K",
    team: "rona",
    x: "65%",
    y: "51%",
    tone: "#7484dc",
    carrying: true,
    mood: "happy",
  },
  {
    id: "raka",
    name: "Raka",
    species: "Nananaga",
    letter: "N",
    team: "rona",
    x: "73%",
    y: "76%",
    tone: "#35afa4",
    mood: "idle",
  },
];

const foliage = [
  [4, 14, 5],
  [8, 19, 4],
  [10, 25, 6],
  [5, 32, 5],
  [12, 39, 4],
  [6, 76, 6],
  [11, 82, 4],
  [16, 87, 5],
  [84, 10, 5],
  [91, 16, 4],
  [88, 83, 6],
  [94, 76, 4],
  [79, 89, 5],
  [72, 6, 4],
  [31, 8, 4],
] as const;

function PetToken({ pet }: { pet: Pet }) {
  return (
    <div
      className={`pet-token ${pet.self ? "is-self" : ""} mood-${pet.mood ?? "idle"}`}
      style={{ left: pet.x, top: pet.y, "--pet-tone": pet.tone } as CSSProperties}
    >
      <div className="pet-nameplate">
        <span>{pet.name}</span>
        {pet.self && <b>kamu</b>}
      </div>
      <div className="pet-shadow" />
      <div className="pet-body">
        <i className="pet-ear left" />
        <i className="pet-ear right" />
        <span>{pet.letter}</span>
        <i className="pet-eye left" />
        <i className="pet-eye right" />
      </div>
      {pet.carrying && (
        <span className="pet-scroll" aria-label="Membawa gulungan">
          <ScrollText size={12} />
        </span>
      )}
      <span className={`pet-team-dot ${pet.team}`} />
    </div>
  );
}

function BaseCore({ team, score, integrity }: { team: Team; score: number; integrity: number }) {
  const isPijar = team === "pijar";
  return (
    <div className={`base-core ${team}`} style={{ left: isPijar ? "4%" : undefined, right: !isPijar ? "4%" : undefined }}>
      <div className="base-ring" />
      <div className="base-crystal">
        <Gem size={25} strokeWidth={1.8} />
      </div>
      <strong>{isPijar ? "PIJAR" : "RONA"}</strong>
      <span>{score} poin</span>
      <div className="base-integrity">
        <i style={{ width: `${integrity}%` }} />
      </div>
    </div>
  );
}

function DirectionPad({ onDirection }: { onDirection: (direction: string) => void }) {
  return (
    <div className="direction-pad" aria-label="Kontrol arah">
      <button aria-label="Gerak atas" onClick={() => onDirection("atas")}>
        <ArrowUp size={17} />
      </button>
      <button aria-label="Gerak kiri" onClick={() => onDirection("kiri")}>
        <ArrowLeft size={17} />
      </button>
      <span className="pad-center"><Compass size={19} /></span>
      <button aria-label="Gerak kanan" onClick={() => onDirection("kanan")}>
        <ArrowRight size={17} />
      </button>
      <button aria-label="Gerak bawah" onClick={() => onDirection("bawah")}>
        <ArrowDown size={17} />
      </button>
    </div>
  );
}

export function MobaArenaFullscreen() {
  const [seconds, setSeconds] = useState(7 * 60 + 42);
  const [pijarScore, setPijarScore] = useState(86);
  const [claimed, setClaimed] = useState<string[]>(["n5"]);
  const [selectedNode, setSelectedNode] = useState<QuestionNode | null>(null);
  const [muted, setMuted] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [notice, setNotice] = useState("Alya siap mencari soal di lajur tengah");
  const [direction, setDirection] = useState("diam");

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 600)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (direction === "diam") return;
    const timeout = window.setTimeout(() => setDirection("diam"), 900);
    return () => window.clearTimeout(timeout);
  }, [direction]);

  const timeLabel = useMemo(
    () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    [seconds],
  );

  const claimNode = (node: QuestionNode) => {
    if (node.claimed || claimed.includes(node.id)) {
      setNotice("Node ini sudah diambil oleh tim Rona");
      return;
    }
    setSelectedNode(node);
    setNotice(`Soal ${node.label} terbuka · jawab untuk membawa +${node.points}`);
  };

  const answerQuestion = () => {
    if (!selectedNode) return;
    setClaimed((items) => [...items, selectedNode.id]);
    setPijarScore((value) => value + selectedNode.points);
    setNotice(`Benar · Alya membawa gulungan +${selectedNode.points} ke Base Pijar`);
    setSelectedNode(null);
  };

  return (
    <main className="moba-fullscreen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body, #root { min-width: 100%; min-height: 100%; margin: 0; }
        body { overflow: hidden; background: #182f31; }
        button { font: inherit; }
        .moba-fullscreen { position: relative; min-height: 100vh; width: 100%; overflow: hidden; isolation: isolate; color: #f9f1cf; font-family: 'DM Sans', sans-serif; background: #92bf7e; }
        .world { position: absolute; inset: 0; overflow: hidden; background:
          linear-gradient(113deg, transparent 0 28%, rgba(255,246,189,.16) 28.3% 28.7%, transparent 29% 58%, rgba(255,246,189,.1) 58.3% 58.8%, transparent 59%),
          radial-gradient(circle at 23% 30%, rgba(215,231,139,.46), transparent 24%),
          radial-gradient(circle at 83% 69%, rgba(120,183,127,.4), transparent 28%),
          linear-gradient(135deg, #86bc82, #abc96e 44%, #9ac68c 72%, #c9d98d); }
        .world::before { content: ''; position: absolute; inset: -15% 40%; width: 21%; transform: rotate(13deg); background: linear-gradient(90deg, rgba(51,153,171,.23), rgba(143,219,210,.37) 45%, rgba(49,147,163,.2)); box-shadow: inset 9px 0 0 rgba(37,126,150,.15), inset -9px 0 0 rgba(255,252,195,.18); clip-path: polygon(35% 0, 75% 0, 100% 100%, 0 100%); }
        .world::after { content: ''; position: absolute; inset: 0; opacity: .55; background-image: linear-gradient(rgba(61,111,94,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(61,111,94,.14) 1px, transparent 1px); background-size: clamp(36px, 4vw, 72px) clamp(36px, 4vw, 72px); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 87%, transparent); }
        .lane { position: absolute; left: -6%; width: 112%; height: 15%; border: clamp(14px, 1.9vw, 31px) solid rgba(255,247,197,.32); border-left-color: rgba(255,247,197,.48); border-right-color: rgba(255,247,197,.18); border-radius: 50%; transform: rotate(-8deg); box-shadow: 0 0 0 2px rgba(73,127,103,.12), inset 0 0 22px rgba(78,131,95,.12); }
        .lane.one { top: 17%; }.lane.two { top: 43%; transform: rotate(1deg); }.lane.three { top: 69%; transform: rotate(8deg); }
        .lane-tag { position: absolute; z-index: 1; color: rgba(39,102,87,.5); font: 700 clamp(8px, .7vw, 11px) 'Space Mono'; letter-spacing: .16em; text-transform: uppercase; }
        .lane-tag.top { top: 13%; left: 14%; }.lane-tag.mid { top: 48%; left: 47%; }.lane-tag.bot { bottom: 12%; right: 13%; }
        .foliage { position: absolute; z-index: 1; width: clamp(42px, 4.8vw, 78px); height: clamp(34px, 4vw, 64px); border-radius: 50%; background: radial-gradient(circle at 30% 24%, #e7ed9a 0 12%, transparent 13%), radial-gradient(circle at 72% 34%, #d1e67a 0 17%, transparent 18%), radial-gradient(circle at 35% 70%, #c1da6c 0 20%, transparent 21%), radial-gradient(circle at 72% 76%, #afd067 0 20%, transparent 21%), #83b65e; filter: drop-shadow(0 7px 0 rgba(49,103,76,.21)); opacity: .96; }
        .stone { position: absolute; z-index: 2; width: clamp(30px, 3.2vw, 54px); height: clamp(22px, 2.5vw, 42px); border-radius: 8px; background: linear-gradient(160deg, #b8d8df, #6b9bad 70%); border: 2px solid rgba(233,248,226,.7); box-shadow: 0 6px 0 rgba(55,101,99,.3); transform: rotate(-8deg); }
        .stone.s1 { left: 18%; top: 29%; }.stone.s2 { left: 21%; top: 36%; transform: rotate(12deg); }.stone.s3 { right: 18%; top: 61%; transform: rotate(8deg); }.stone.s4 { right: 14%; top: 69%; }.stone.s5 { left: 42%; top: 11%; transform: rotate(4deg); }.stone.s6 { left: 46%; top: 16%; }
        .hud { position: absolute; z-index: 20; inset: 0; pointer-events: none; }
        .hud button, .hud .interactive { pointer-events: auto; }
        .brand-mark { position: absolute; top: clamp(18px, 2.4vw, 34px); left: clamp(18px, 2.5vw, 42px); display: flex; align-items: center; gap: 10px; filter: drop-shadow(0 3px 8px rgba(29,76,64,.32)); }
        .brand-t { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 11px 11px 11px 3px; color: #fff6cb; background: #e96e58; font: 800 17px 'Space Mono'; box-shadow: 3px 3px 0 rgba(92,79,49,.22); }
        .brand-copy { display: grid; gap: 1px; }.brand-copy strong { font-size: 13px; letter-spacing: .17em; }.brand-copy span { color: rgba(255,248,211,.76); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .minimap { position: absolute; top: clamp(18px, 2.4vw, 34px); right: clamp(18px, 2.5vw, 42px); width: clamp(136px, 15vw, 225px); aspect-ratio: 1.25; overflow: hidden; border-radius: 15px; background: rgba(31,71,66,.68); border: 1px solid rgba(255,246,190,.5); box-shadow: 0 8px 20px rgba(28,77,65,.22); backdrop-filter: blur(7px); }
        .minimap::before { content: ''; position: absolute; inset: -25%; transform: rotate(14deg); background: linear-gradient(90deg, transparent 37%, rgba(104,200,208,.8) 37% 48%, transparent 48%), linear-gradient(36deg, transparent 45%, rgba(248,238,163,.65) 45% 52%, transparent 52%); }
        .minimap::after { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(212,231,163,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(212,231,163,.18) 1px, transparent 1px); background-size: 17px 17px; }
        .mini-label { position: absolute; left: 10px; bottom: 7px; z-index: 2; font: 700 8px 'Space Mono'; letter-spacing: .09em; color: rgba(255,247,207,.76); text-transform: uppercase; }
        .mini-dot { position: absolute; z-index: 3; width: 8px; height: 8px; border: 2px solid #fff8cf; border-radius: 50%; box-shadow: 0 1px 5px #173e43; }.mini-dot.pijar { background: #ef765e; }.mini-dot.rona { background: #7889e6; }.mini-dot.gold { background: #edb743; }
        .mini-dot.a { left: 23%; top: 55%; }.mini-dot.b { left: 34%; top: 27%; }.mini-dot.c { left: 70%; top: 48%; }.mini-dot.d { left: 83%; top: 72%; }.mini-dot.e { left: 55%; top: 57%; }
        .match-score { position: absolute; top: clamp(18px, 2.4vw, 34px); left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 18px; padding: 8px 14px; border-radius: 999px; color: #fff6cb; background: rgba(30,72,68,.62); border: 1px solid rgba(255,247,196,.32); box-shadow: 0 8px 20px rgba(32,76,65,.2); backdrop-filter: blur(8px); }
        .team-result { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; }.team-result b { font: 700 18px 'Space Mono'; }.team-result.pijar b { color: #ffb08f; }.team-result.rona b { color: #b5baff; }.score-vs { color: rgba(255,244,195,.48); font: 700 9px 'Space Mono'; }
        .match-time { position: absolute; top: 84px; left: 50%; transform: translateX(-50%); color: rgba(255,247,210,.82); font: 700 12px 'Space Mono'; letter-spacing: .12em; text-shadow: 0 2px 6px rgba(30,80,72,.45); }
        .connection { position: absolute; top: 92px; left: clamp(18px, 2.5vw, 42px); display: flex; align-items: center; gap: 6px; color: rgba(246,255,218,.78); font-size: 10px; }.connection i { width: 7px; height: 7px; border-radius: 50%; background: #74dda1; box-shadow: 0 0 0 4px rgba(116,221,161,.18); }
        .world-event { position: absolute; left: 50%; bottom: clamp(116px, 14vh, 155px); transform: translateX(-50%); display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 9px; color: rgba(255,248,211,.88); background: rgba(31,76,67,.59); border: 1px solid rgba(255,247,195,.24); font-size: 11px; box-shadow: 0 5px 14px rgba(29,77,66,.2); backdrop-filter: blur(7px); }
        .world-event svg { color: #f3c965; }.world-event b { color: #fff4bd; font-weight: 700; }
        .team-panel { position: absolute; bottom: clamp(22px, 3.5vw, 52px); left: clamp(18px, 2.5vw, 42px); width: min(265px, 24vw); display: grid; gap: 7px; padding: 10px 12px; border-radius: 12px; background: rgba(27,74,67,.58); border: 1px solid rgba(255,247,198,.28); box-shadow: 0 8px 18px rgba(31,77,66,.2); backdrop-filter: blur(8px); }
        .team-panel-head { display: flex; justify-content: space-between; align-items: center; color: rgba(255,247,207,.76); font-size: 10px; }.team-panel-head b { color: #ffb08f; font: 700 12px 'Space Mono'; }.team-bar { height: 5px; border-radius: 5px; background: rgba(255,245,197,.18); overflow: hidden; }.team-bar i { display: block; height: 100%; width: 68%; background: #f17d64; border-radius: inherit; }.team-hint { display: flex; align-items: center; gap: 5px; color: rgba(255,247,205,.56); font-size: 9px; }.team-hint svg { color: #f5d477; }
        .quick-actions { position: absolute; right: clamp(18px, 2.5vw, 42px); bottom: clamp(22px, 3.5vw, 52px); display: flex; align-items: end; gap: 9px; }
        .quick-button { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid rgba(255,247,198,.34); border-radius: 50%; color: rgba(255,248,211,.83); background: rgba(28,76,69,.52); box-shadow: 0 6px 14px rgba(32,78,64,.2); backdrop-filter: blur(7px); cursor: pointer; transition: transform .2s, background .2s; }.quick-button:hover { transform: translateY(-3px); background: rgba(36,91,81,.72); }.quick-button:focus-visible { outline: 2px solid #fff4b5; outline-offset: 3px; }
        .direction-pad { width: 124px; height: 124px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 4px; padding: 9px; border-radius: 50%; background: rgba(22,70,66,.5); border: 1px solid rgba(255,248,196,.24); box-shadow: 0 8px 18px rgba(24,76,66,.25); backdrop-filter: blur(8px); }
        .direction-pad button, .pad-center { display: grid; place-items: center; border: 0; border-radius: 12px; color: rgba(255,248,207,.86); background: rgba(255,246,196,.1); cursor: pointer; transition: background .2s, transform .15s; }.direction-pad button:hover { background: rgba(255,246,196,.22); }.direction-pad button:active { transform: scale(.9); }.direction-pad button:nth-child(1) { grid-column: 2; grid-row: 1; }.direction-pad button:nth-child(2) { grid-column: 1; grid-row: 2; }.pad-center { grid-column: 2; grid-row: 2; color: #f2cb67; background: rgba(239,118,94,.22); }.direction-pad button:nth-child(4) { grid-column: 3; grid-row: 2; }.direction-pad button:nth-child(5) { grid-column: 2; grid-row: 3; }
        .ability-stack { display: flex; flex-direction: column; align-items: center; gap: 8px; }.ability-button { position: relative; width: 58px; height: 58px; display: grid; place-items: center; border-radius: 50%; color: #fff5c7; border: 2px solid rgba(255,244,183,.78); background: radial-gradient(circle at 35% 28%, #f8be6c, #e36b51 68%); box-shadow: 0 5px 0 rgba(95,75,42,.3), 0 10px 18px rgba(52,77,52,.22); cursor: pointer; }.ability-button.secondary { width: 43px; height: 43px; border-width: 1px; background: radial-gradient(circle at 35% 28%, #92d0d0, #4f899c 70%); }.ability-key { position: absolute; right: -3px; top: -4px; width: 17px; height: 17px; display: grid; place-items: center; border-radius: 50%; color: #31565b; background: #fff5c3; font: 700 8px 'Space Mono'; }.ability-label { color: rgba(255,248,208,.75); font-size: 9px; font-weight: 700; }
        .base-core { position: absolute; top: 43%; z-index: 4; width: 104px; display: grid; justify-items: center; text-align: center; filter: drop-shadow(0 5px 7px rgba(43,84,59,.28)); }.base-ring { position: absolute; top: 7px; width: 100px; height: 100px; border: 2px solid rgba(255,248,191,.48); border-radius: 50%; box-shadow: 0 0 0 12px rgba(255,248,191,.09); }.base-crystal { position: relative; width: 51px; height: 51px; display: grid; place-items: center; color: #fff6c6; border: 3px solid #fff1af; background: #eb7359; box-shadow: 0 5px 0 rgba(104,77,49,.27); transform: rotate(45deg); border-radius: 13px 13px 5px 13px; }.base-crystal svg { transform: rotate(-45deg); }.base-core.rona .base-crystal { background: #7184db; border-radius: 13px 5px 13px 13px; }.base-core strong { margin-top: 12px; color: rgba(255,247,200,.84); font: 700 9px 'Space Mono'; letter-spacing: .12em; }.base-core > span { color: rgba(44,79,71,.75); font: 700 9px 'Space Mono'; margin-top: 3px; }.base-integrity { width: 80px; height: 4px; margin-top: 6px; border-radius: 5px; background: rgba(255,251,212,.52); overflow: hidden; }.base-integrity i { display: block; height: 100%; background: #e8785d; }.rona .base-integrity i { background: #7184db; }
        .question-node { position: absolute; z-index: 7; width: 54px; height: 54px; display: grid; place-items: center; border-radius: 50%; transform: translate(-50%, -50%); color: #fff7cb; cursor: pointer; transition: transform .2s, filter .2s; filter: drop-shadow(0 5px 5px rgba(53,95,72,.27)); }.question-node:hover, .question-node:focus-visible { transform: translate(-50%, -50%) scale(1.13); filter: drop-shadow(0 8px 10px rgba(53,95,72,.35)); outline: none; }.question-node.mudah { background: radial-gradient(circle at 35% 28%, #edf2ba, #76b875); border: 3px solid #e6f1b2; }.question-node.sedang { background: radial-gradient(circle at 35% 28%, #ffe2a1, #d68d45); border: 3px solid #fff1bb; }.question-node.sulit { background: radial-gradient(circle at 35% 28%, #ffc1a7, #d55c52); border: 3px solid #ffe0b4; }.question-node.claimed { opacity: .42; filter: grayscale(.8); cursor: default; }.node-points { position: absolute; top: 6px; right: -21px; color: #fff4be; font: 700 9px 'Space Mono'; text-shadow: 0 2px 4px rgba(24,76,62,.6); }.node-label { position: absolute; top: 61px; color: rgba(255,247,207,.8); white-space: nowrap; font: 700 8px 'Space Mono'; letter-spacing: .06em; text-shadow: 0 1px 4px rgba(34,83,65,.65); }
        .pet-token { position: absolute; z-index: 9; width: 74px; transform: translate(-50%, -50%); text-align: center; animation: pet-bob 3s ease-in-out infinite; }.pet-token:nth-of-type(2n) { animation-delay: .8s; }.pet-token.mood-walk .pet-body { animation: pet-walk .55s ease-in-out infinite alternate; }.pet-token.mood-happy .pet-body { animation: pet-hop .65s ease-in-out infinite; }.pet-nameplate { position: relative; z-index: 2; display: inline-flex; gap: 4px; align-items: center; padding: 3px 6px; border: 1px solid rgba(255,246,193,.56); border-radius: 5px; color: #fff7cf; background: rgba(31,77,67,.72); white-space: nowrap; font-size: 9px; font-weight: 700; box-shadow: 0 2px 5px rgba(38,84,64,.25); }.pet-nameplate b { color: #ffbc91; font-size: 8px; }.is-self .pet-nameplate { border-color: #ffc292; background: rgba(126,65,55,.78); }.pet-body { position: relative; z-index: 2; width: 42px; height: 37px; margin: 7px auto 1px; display: grid; place-items: center; color: #fff6c8; background: linear-gradient(145deg, color-mix(in srgb, var(--pet-tone) 80%, white), var(--pet-tone)); border: 3px solid #fff4bd; border-radius: 48% 48% 45% 45%; font: 700 15px 'Space Mono'; box-shadow: 0 5px 0 rgba(49,87,66,.33); }.pet-body::before { content: ''; position: absolute; left: 5px; right: 5px; bottom: -8px; height: 12px; border-radius: 0 0 50% 50%; background: var(--pet-tone); z-index: -1; }.pet-ear { position: absolute; top: -6px; width: 13px; height: 13px; border: 2px solid #fff4bd; background: var(--pet-tone); border-radius: 4px 9px 3px 8px; }.pet-ear.left { left: 2px; transform: rotate(-24deg); }.pet-ear.right { right: 2px; transform: rotate(24deg); }.pet-eye { position: absolute; top: 15px; width: 5px; height: 7px; border-radius: 50%; background: #234d4d; }.pet-eye.left { left: 9px; }.pet-eye.right { right: 9px; }.pet-shadow { position: absolute; z-index: 1; bottom: 2px; left: 14px; width: 47px; height: 12px; border-radius: 50%; background: rgba(40,87,63,.25); filter: blur(3px); }.pet-scroll { position: absolute; z-index: 3; right: 4px; top: 29px; width: 22px; height: 22px; display: grid; place-items: center; border: 2px solid #fff5c3; border-radius: 50%; color: #9e692c; background: #ffe6a1; transform: rotate(9deg); }.pet-team-dot { position: absolute; left: 8px; top: 29px; width: 7px; height: 7px; border: 1px solid #fff6cf; border-radius: 50%; }.pet-team-dot.pijar { background: #ef765e; }.pet-team-dot.rona { background: #7889e6; }
        @keyframes pet-bob { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 3px)); } }
        @keyframes pet-walk { from { transform: translateX(-2px) rotate(-2deg); } to { transform: translateX(2px) rotate(2deg); } }
        @keyframes pet-hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .question-popover { position: absolute; z-index: 30; left: 50%; top: 50%; width: min(290px, calc(100vw - 32px)); transform: translate(-50%, -50%); padding: 17px; border-radius: 16px; color: #23484a; background: rgba(255,249,222,.96); border: 2px solid rgba(255,255,219,.9); box-shadow: 0 20px 45px rgba(26,77,63,.38); }.question-popover .close { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; display: grid; place-items: center; border: 0; border-radius: 50%; color: #5a7164; background: transparent; cursor: pointer; }.question-popover small { color: #b17237; font: 700 9px 'Space Mono'; letter-spacing: .12em; text-transform: uppercase; }.question-popover h2 { margin: 7px 0 5px; font-size: 18px; }.question-popover p { margin: 0; color: #637266; font-size: 11px; line-height: 1.5; }.answer-button { width: 100%; margin-top: 13px; padding: 10px; border: 0; border-radius: 9px; color: #fff7ce; background: #e87559; font-weight: 800; cursor: pointer; }.answer-button:hover { background: #d8624d; }.map-popover { position: absolute; z-index: 31; right: clamp(18px, 2.5vw, 42px); top: 165px; width: clamp(180px, 22vw, 300px); padding: 10px; border-radius: 13px; background: rgba(25,70,66,.88); border: 1px solid rgba(255,247,197,.38); box-shadow: 0 15px 28px rgba(25,76,65,.28); backdrop-filter: blur(10px); }.map-popover .map-popover-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: #fff2bd; font-size: 11px; font-weight: 700; }.map-popover button { border: 0; color: #dbe5c0; background: transparent; cursor: pointer; }.map-large { position: relative; height: 130px; overflow: hidden; border-radius: 9px; background: linear-gradient(135deg, #a6cb7a, #78b599); }.map-large::before { content: ''; position: absolute; inset: -20% 37%; transform: rotate(13deg); background: rgba(86,188,195,.58); }.map-large::after { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(49,106,87,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(49,106,87,.18) 1px, transparent 1px); background-size: 18px 18px; }.toast { position: absolute; left: 50%; bottom: 25px; transform: translateX(-50%); z-index: 35; max-width: calc(100vw - 40px); padding: 8px 12px; border-radius: 999px; color: rgba(255,249,213,.9); background: rgba(26,72,66,.72); border: 1px solid rgba(255,248,198,.24); font-size: 10px; box-shadow: 0 5px 15px rgba(32,79,66,.2); backdrop-filter: blur(8px); white-space: nowrap; }
        @media (max-width: 700px) { .brand-copy, .connection, .match-time, .team-panel, .world-event { display: none; }.match-score { top: 18px; gap: 8px; padding: 7px 10px; }.minimap { top: 70px; right: 16px; width: 120px; }.quick-actions { right: 14px; bottom: 18px; gap: 5px; }.direction-pad { width: 106px; height: 106px; }.ability-button { width: 51px; height: 51px; }.ability-button.secondary { width: 38px; height: 38px; }.base-core { transform: scale(.72); }.pet-token { transform: translate(-50%, -50%) scale(.83); }.question-node { transform: translate(-50%, -50%) scale(.84); }.toast { bottom: 8px; }.lane-tag { font-size: 7px; } }
      `}</style>

      <section className="world" aria-label="Arena TOMAT">
        <div className="lane one" /><div className="lane two" /><div className="lane three" />
        <span className="lane-tag top">LAJUR ATAS</span><span className="lane-tag mid">LAJUR TENGAH</span><span className="lane-tag bot">LAJUR BAWAH</span>
        {foliage.map(([left, top, scale], index) => (
          <span key={`foliage-${index}`} className="foliage" style={{ left: `${left}%`, top: `${top}%`, transform: `scale(${scale / 5})` }} />
        ))}
        <span className="stone s1" /><span className="stone s2" /><span className="stone s3" /><span className="stone s4" /><span className="stone s5" /><span className="stone s6" />
        <BaseCore team="pijar" score={pijarScore} integrity={86} />
        <BaseCore team="rona" score={71} integrity={62} />
        {questionNodes.map((node) => {
          const isClaimed = node.claimed || claimed.includes(node.id);
          return (
            <button key={node.id} className={`question-node ${node.difficulty} ${isClaimed ? "claimed" : ""}`} style={{ left: node.x, top: node.y }} onClick={() => claimNode(node)} aria-label={`${node.label}, ${node.points} poin`}>
              <CircleHelp size={18} /><span className="node-points">+{node.points}</span><span className="node-label">{node.label}</span>
            </button>
          );
        })}
        {pets.map((pet) => <PetToken key={pet.id} pet={pet} />)}
      </section>

      <div className="hud">
        <div className="brand-mark"><span className="brand-t">T</span><span className="brand-copy"><strong>TOMAT</strong><span>arena belajar</span></span></div>
        <div className="connection"><i /> Terhubung <Wifi size={12} /></div>
        <div className="match-score">
          <span className="team-result pijar"><b>{pijarScore}</b><span>Pijar</span></span><span className="score-vs">VS</span><span className="team-result rona"><span>Rona</span><b>71</b></span>
        </div>
        <div className="match-time">{timeLabel}</div>
        <div className="minimap" role="img" aria-label="Minimap posisi Pet"><span className="mini-dot pijar a" /><span className="mini-dot pijar b" /><span className="mini-dot rona c" /><span className="mini-dot rona d" /><span className="mini-dot gold e" /><span className="mini-label">posisi langsung</span></div>
        <button className="quick-button interactive" style={{ position: "absolute", top: 91, right: "calc(clamp(18px, 2.5vw, 42px) + 233px)" }} onClick={() => setMuted((value) => !value)} aria-label={muted ? "Nyalakan suara" : "Matikan suara"}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
        <div className="world-event"><Sparkles size={14} /><span>{notice}</span></div>
        <div className="team-panel"><div className="team-panel-head"><span>Base Pijar</span><b>{pijarScore} poin</b></div><div className="team-bar"><i /></div><span className="team-hint"><ShieldCheck size={12} /> Gulungan dibawa pulang untuk mengisi skor</span></div>
        <div className="quick-actions">
          <button className="quick-button interactive" onClick={() => setMapOpen((value) => !value)} aria-label="Buka peta arena"><Map size={16} /></button>
          <button className="quick-button interactive" onClick={() => setNotice("Chat tim dibuka · gunakan komunikasi yang sopan")} aria-label="Buka chat"><MessageCircle size={16} /></button>
          <DirectionPad onDirection={(value) => { setDirection(value); setNotice(`Alya bergerak ke ${value}`); }} />
          <div className="ability-stack"><button className="ability-button interactive" onClick={() => setNotice("Alya mengaktifkan fokus · node terdekat disorot")} aria-label="Aktifkan fokus"><Crosshair size={24} /><span className="ability-key">Q</span></button><span className="ability-label">{direction === "diam" ? "fokus" : direction}</span></div>
        </div>
        {mapOpen && <div className="map-popover"><div className="map-popover-head"><span>Peta arena</span><button onClick={() => setMapOpen(false)} aria-label="Tutup peta"><X size={14} /></button></div><div className="map-large"><span className="mini-dot pijar a" /><span className="mini-dot pijar b" /><span className="mini-dot rona c" /><span className="mini-dot rona d" /><span className="mini-dot gold e" /></div></div>}
        {selectedNode && <div className="question-popover"><button className="close" onClick={() => setSelectedNode(null)} aria-label="Tutup soal"><X size={15} /></button><small>Node soal · +{selectedNode.points} poin</small><h2>{selectedNode.label}</h2><p>Jawab soal ini dengan benar untuk mengubahnya menjadi gulungan yang bisa dibawa Alya ke Base Pijar.</p><button className="answer-button" onClick={answerQuestion}>Jawab benar dan ambil gulungan</button></div>}
        <div className="toast"><ScrollText size={12} /> {notice}</div>
      </div>
    </main>
  );
}