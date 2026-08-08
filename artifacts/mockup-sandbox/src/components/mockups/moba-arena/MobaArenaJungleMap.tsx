import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  Gem,
  Map,
  ScrollText,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Node = { id: string; x: number; y: number; label: string; points: number; tone: "mint" | "gold" | "coral"; asset: string };
type Pet = { name: string; letter: string; x: number; y: number; color: string; team: "pijar" | "rona"; self?: boolean; carrying?: boolean };

const unityAsset = "/__mockup/images/unity-farm/";

const nodes: Node[] = [
  { id: "keliling", x: 24, y: 25, label: "Keliling", points: 10, tone: "mint", asset: "FG_Crystal_Gold_1.png" },
  { id: "pecahan", x: 43, y: 62, label: "Pecahan", points: 25, tone: "gold", asset: "FG_Treasure_Big.png" },
  { id: "peluang", x: 62, y: 24, label: "Peluang", points: 50, tone: "coral", asset: "FG_Crystal_Blue_1.png" },
  { id: "luas", x: 75, y: 68, label: "Luas", points: 10, tone: "mint", asset: "FG_Treasure_Small_1.png" },
  { id: "pola", x: 80, y: 32, label: "Pola", points: 25, tone: "gold", asset: "FG_Crystal_Gold_1.png" },
  { id: "sudut", x: 53, y: 83, label: "Sudut", points: 10, tone: "mint", asset: "FG_Treasure_Small_1.png" },
];

const pets: Pet[] = [
  { name: "Alya", letter: "A", x: 28, y: 48, color: "#eb775b", team: "pijar", self: true, carrying: true },
  { name: "Bimo", letter: "B", x: 35, y: 21, color: "#e9af48", team: "pijar" },
  { name: "Nisa", letter: "N", x: 65, y: 50, color: "#7888de", team: "rona", carrying: true },
  { name: "Raka", letter: "R", x: 74, y: 77, color: "#3eafa4", team: "rona" },
];

function Pet({ pet }: { pet: Pet }) {
  const sprite = pet.team === "pijar" ? "Character01_Walk_Down.png" : "Knight_11_Walk_Down.png";
  return (
    <div className={`j-pet ${pet.self ? "j-self" : ""}`} style={{ left: `${pet.x}%`, top: `${pet.y}%`, "--pet": pet.color } as CSSProperties}>
      <div className="j-name">{pet.name}{pet.self && <em>kamu</em>}</div>
      <div className="j-shadow" />
      <div className="j-body"><span className="j-unity-sprite" style={{ backgroundImage: `url("${unityAsset}${sprite}")` }} aria-hidden="true" /><b>{pet.letter}</b></div>
      {pet.carrying && <span className="j-scroll"><ScrollText size={12} /></span>}
      <span className={`j-team ${pet.team}`} />
    </div>
  );
}

function MiniMap({ onClose }: { onClose: () => void }) {
  return (
    <div className="j-map-pop">
      <header><span><Map size={14} /> Peta arena</span><button onClick={onClose} aria-label="Tutup peta"><X size={14} /></button></header>
      <div className="j-map-large"><i className="mm-river" /><i className="mm-base mm-pijar" /><i className="mm-base mm-rona" />{nodes.map((n) => <i className="mm-node" key={n.id} style={{ left: `${n.x}%`, top: `${n.y}%` }} />)}<i className="mm-player" /></div>
      <small>Gulungan tersebar di jalur hutan</small>
    </div>
  );
}

function AnalogStick({ onMove, onRelease }: { onMove: (x: number, y: number) => void; onRelease: () => void }) {
  const padRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateStick = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pad = padRef.current;
    if (!pad) return;
    const bounds = pad.getBoundingClientRect();
    const radius = Math.max(1, Math.min(bounds.width, bounds.height) / 2 - 25);
    const rawX = event.clientX - (bounds.left + bounds.width / 2);
    const rawY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > radius ? radius / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    setKnob({ x, y });
    onMove(x / radius, y / radius);
  };

  const releaseStick = () => {
    if (activePointer.current !== null) {
      try { padRef.current?.releasePointerCapture(activePointer.current); } catch { /* already released */ }
    }
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    onRelease();
  };

  return (
    <div
      ref={padRef}
      className="j-analog"
      aria-label="Kontrol analog gerak"
      onPointerDown={(event) => {
        activePointer.current = event.pointerId;
        padRef.current?.setPointerCapture(event.pointerId);
        updateStick(event);
      }}
      onPointerMove={(event) => {
        if (activePointer.current === event.pointerId) updateStick(event);
      }}
      onPointerUp={releaseStick}
      onPointerCancel={releaseStick}
    >
      <span className="j-analog-ring ring-one" />
      <span className="j-analog-ring ring-two" />
      <span className="j-analog-dot dot-top" />
      <span className="j-analog-dot dot-right" />
      <span className="j-analog-dot dot-bottom" />
      <span className="j-analog-dot dot-left" />
      <span className="j-analog-knob" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}>
        <span />
      </span>
    </div>
  );
}

export function MobaArenaJungleMap() {
  const [seconds, setSeconds] = useState(7 * 60 + 42);
  const [score, setScore] = useState(86);
  const [claimed, setClaimed] = useState<string[]>(["pola"]);
  const [selected, setSelected] = useState<Node | null>(null);
  const [muted, setMuted] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [notice, setNotice] = useState("Alya siap menyusuri Hutan Angka");
  const [move, setMove] = useState("diam");
  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 600)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (move === "diam") return;
    const timer = window.setTimeout(() => setMove("diam"), 800);
    return () => window.clearTimeout(timer);
  }, [move]);

  const openNode = (node: Node) => {
    if (claimed.includes(node.id)) {
      setNotice("Node ini sudah dikumpulkan tim Rona");
      return;
    }
    setSelected(node);
    setNotice(`${node.label} terbuka · jawab untuk membawa +${node.points}`);
  };
  const answer = () => {
    if (!selected) return;
    setClaimed((current) => [...current, selected.id]);
    setScore((current) => current + selected.points);
    setNotice(`Benar! Gulungan ${selected.label} ikut Alya pulang`);
    setSelected(null);
  };
  const moveAnalog = (x: number, y: number) => {
    if (Math.hypot(x, y) < 0.12) return;
    setMove("bergerak");
    setNotice("Alya bergerak mengikuti analog");
  };

  return (
    <main className="j-arena">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box}html,body,#root{margin:0;min-width:100%;min-height:100%;overflow:hidden}button{font:inherit}
        .j-arena{position:relative;isolation:isolate;width:100%;min-height:100dvh;overflow:hidden;background:#071c24;color:#fff3c9;font-family:'DM Sans',sans-serif}
        .j-arena:before{content:"";position:absolute;inset:0;z-index:8;pointer-events:none;opacity:.12;background-image:radial-gradient(rgba(227,240,181,.8) .7px,transparent .8px);background-size:6px 6px;mix-blend-mode:soft-light}
        .j-world{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 48% 40%,#2f7d70 0%,#1e5d5b 35%,#113c45 76%,#08252e 100%)}
        .j-world:before{content:"";position:absolute;inset:-8%;background:linear-gradient(116deg,transparent 0 39%,rgba(235,205,111,.36) 39.3% 41%,transparent 41.4% 61%,rgba(245,214,126,.27) 61.2% 63%,transparent 63.4%),linear-gradient(30deg,transparent 0 47%,rgba(246,221,141,.22) 47.2% 49.5%,transparent 49.8%);transform:rotate(-8deg);opacity:.95}
        .j-world:after{content:"";position:absolute;inset:-18% 43%;width:20%;transform:rotate(17deg);background:linear-gradient(90deg,#075066,#2e9ca0 48%,#0b5665);clip-path:polygon(38% 0,72% 0,100% 100%,0 100%);box-shadow:inset 11px 0 0 rgba(3,33,47,.32),inset -11px 0 0 rgba(143,228,199,.18);animation:j-water 7s ease-in-out infinite}
        .j-board{position:absolute;inset:4% 8%;border:1px solid rgba(203,227,164,.22);transform:perspective(1000px) rotateX(5deg) rotateZ(-1deg);box-shadow:0 0 0 24px rgba(4,32,39,.13),0 30px 90px rgba(0,10,16,.48);overflow:hidden;border-radius:2.2%;background:linear-gradient(135deg,rgba(16,71,55,.82),rgba(22,90,66,.72))}
        .j-terrain-texture{position:absolute;z-index:0;inset:-18%;width:136%;height:136%;object-fit:cover;image-rendering:pixelated;opacity:.18;mix-blend-mode:screen;filter:saturate(1.3) hue-rotate(8deg)}
        .j-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(153,214,167,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(153,214,167,.09) 1px,transparent 1px);background-size:clamp(36px,4vw,70px);mask-image:radial-gradient(ellipse,#000 35%,transparent 90%)}
        .j-lane{position:absolute;height:13%;width:114%;left:-7%;border:clamp(12px,1.4vw,24px) solid rgba(243,211,123,.22);border-radius:50%;box-shadow:inset 0 0 20px rgba(7,50,54,.35),0 0 0 2px rgba(232,216,138,.12)}.j-lane.a{top:14%;transform:rotate(-13deg)}.j-lane.b{top:44%;transform:rotate(2deg)}.j-lane.c{top:72%;transform:rotate(13deg)}
        .j-lane-label{position:absolute;color:rgba(227,222,150,.34);font:700 9px 'Space Mono';letter-spacing:.18em}.jl-a{top:15%;left:17%}.jl-b{top:48%;left:45%}.jl-c{bottom:12%;right:16%}
        .j-brush{position:absolute;z-index:2;width:clamp(74px,9vw,145px);height:clamp(48px,5vw,82px);object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 10px 4px rgba(2,34,36,.42));animation:j-sway 4s ease-in-out infinite}
        .b1{left:10%;top:15%}.b2{left:16%;top:70%;animation-delay:1.3s}.b3{left:39%;top:9%;transform:scale(.7)}.b4{right:11%;top:14%;animation-delay:2s}.b5{right:13%;top:73%;transform:scale(1.1)}.b6{left:37%;bottom:11%;transform:scale(.65)}
        .j-rock{position:absolute;z-index:3;width:clamp(44px,5vw,78px);height:clamp(38px,4vw,64px);object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 8px 4px rgba(3,35,39,.42));transform:rotate(-10deg)}.r1{left:28%;top:34%}.r2{left:32%;top:39%;transform:rotate(18deg) scale(.65)}.r3{right:26%;top:33%;transform:rotate(13deg)}.r4{right:22%;top:39%;transform:scale(.7)}.r5{left:56%;bottom:21%;transform:rotate(22deg) scale(.8)}
        .j-base{position:absolute;z-index:5;top:42%;width:132px;text-align:center;filter:drop-shadow(0 8px 7px rgba(1,22,28,.45))}.j-base.pijar{left:2%}.j-base.rona{right:2%}.j-base:before{content:"";position:absolute;left:8px;top:8px;width:108px;height:108px;border:2px solid rgba(248,225,142,.45);border-radius:50%;box-shadow:0 0 0 12px rgba(239,211,126,.08)}.j-core{position:relative;margin:auto;width:58px;height:58px;display:grid;place-items:center;border:3px solid #ffe9a9;background:#da6e55;transform:rotate(45deg);border-radius:15px 15px 5px 15px}.j-core svg{transform:rotate(-45deg)}.rona .j-core{background:#637ad0;border-radius:15px 5px 15px 15px}.j-base strong{display:block;margin-top:14px;font:700 10px 'Space Mono';letter-spacing:.14em}.j-base small{display:block;margin-top:4px;color:#d5d4a2;font:700 9px 'Space Mono'}.j-integrity{width:86px;height:4px;margin:7px auto 0;background:rgba(250,229,157,.28);border-radius:4px;overflow:hidden}.j-integrity i{display:block;width:84%;height:100%;background:#eb7c5b}.rona .j-integrity i{width:61%;background:#7789dc}
        .j-node{position:absolute;z-index:8;width:58px;height:58px;display:grid;place-items:center;border-radius:50%;transform:translate(-50%,-50%);color:#fff5cc;border:3px solid #e8e5a8;cursor:pointer;background:radial-gradient(circle,rgba(30,100,74,.94),rgba(11,50,51,.84));box-shadow:0 8px 12px rgba(3,31,34,.34);animation:j-pulse 2.4s ease-in-out infinite}.j-node.mint{border-color:#cceaa1}.j-node.gold{border-color:#ffe5a2}.j-node.coral{border-color:#a9d9ef;background:radial-gradient(circle,rgba(35,106,130,.94),rgba(11,50,61,.84))}.j-node.claimed{opacity:.32;filter:grayscale(1);animation:none}.j-node:hover{transform:translate(-50%,-50%) scale(1.15)}.j-node img{width:54px;height:22px;object-fit:contain;image-rendering:pixelated}.j-node span{position:absolute;top:62px;white-space:nowrap;font:700 8px 'Space Mono';text-shadow:0 2px 4px #0a3439}.j-node b{position:absolute;right:-19px;top:3px;font:700 9px 'Space Mono'}
        .j-pet{position:absolute;z-index:10;width:72px;text-align:center;transform:translate(-50%,-50%);animation:j-float 3s ease-in-out infinite}.j-pet:nth-of-type(2n){animation-delay:1.1s}.j-name{position:relative;z-index:3;display:inline-flex;gap:4px;padding:3px 6px;color:#fff5cd;background:rgba(7,40,44,.78);border:1px solid rgba(243,225,158,.42);border-radius:5px;font-size:9px;font-weight:700;white-space:nowrap}.j-name em{color:#ffc08c;font-style:normal;font-size:8px}.j-self .j-name{border-color:#ffbd8d;background:rgba(109,53,49,.84)}.j-shadow{position:absolute;z-index:1;bottom:0;left:13px;width:48px;height:12px;background:rgba(1,28,31,.42);filter:blur(3px);border-radius:50%}.j-body{position:relative;z-index:2;width:50px;height:42px;margin:7px auto 0;display:grid;place-items:center;color:#fff2bd;border:0;border-radius:48%;font:700 15px 'Space Mono';box-shadow:0 5px 0 rgba(3,34,38,.38);animation:j-walk .6s ease-in-out infinite alternate}.j-unity-sprite{position:absolute;inset:0;background-position:0 0;background-size:200px 50px;background-repeat:no-repeat;image-rendering:pixelated;filter:drop-shadow(0 3px 1px rgba(1,22,28,.54))}.j-body b{position:relative;z-index:1;color:transparent}.j-scroll{position:absolute;z-index:4;right:2px;top:29px;width:21px;height:21px;display:grid;place-items:center;border:2px solid #ffefb5;border-radius:50%;color:#a66a35;background:#ffe09b;transform:rotate(10deg)}.j-team{position:absolute;z-index:4;left:8px;top:29px;width:7px;height:7px;border:1px solid #fff3c5;border-radius:50%}.j-team.pijar{background:#ee735d}.j-team.rona{background:#7c8de1}
        .j-hud{position:absolute;z-index:20;inset:0;pointer-events:none}.j-hud>*{pointer-events:auto}.j-brand{position:absolute;top:22px;left:28px;display:flex;gap:9px;align-items:center;text-shadow:0 3px 9px rgba(2,22,28,.5)}.j-brand-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:12px 12px 12px 3px;background:#e6755b;color:#fff3c9;font:800 18px 'Space Mono';box-shadow:3px 3px 0 rgba(0,25,30,.28)}.j-brand-copy strong{display:block;font-size:13px;letter-spacing:.18em}.j-brand-copy small{color:#c4dbb0;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.j-match{position:absolute;top:20px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:17px;padding:8px 15px;border:1px solid rgba(245,225,156,.3);border-radius:999px;background:rgba(7,39,44,.72);backdrop-filter:blur(8px);box-shadow:0 8px 20px rgba(1,26,30,.3)}.j-team-score{display:flex;gap:7px;align-items:center;font-size:10px;font-weight:700}.j-team-score b{font:700 18px 'Space Mono'}.j-team-score.pijar b{color:#ffb593}.j-team-score.rona b{color:#b7bffc}.j-vs{color:#a9ad88;font:700 9px 'Space Mono'}.j-time{position:absolute;top:66px;left:50%;transform:translateX(-50%);font:700 11px 'Space Mono';letter-spacing:.14em;color:#e8deae}.j-minimap{position:absolute;top:22px;right:28px;width:184px;height:128px;overflow:hidden;border:1px solid rgba(237,227,161,.44);border-radius:13px;background:rgba(10,52,55,.82);box-shadow:0 10px 23px rgba(1,27,31,.3);backdrop-filter:blur(7px)}.j-minimap:before{content:"";position:absolute;inset:-25%;background:linear-gradient(55deg,transparent 39%,#3a9da0 40% 51%,transparent 52%),linear-gradient(145deg,transparent 45%,#d3b866 46% 51%,transparent 52%);transform:rotate(8deg)}.j-minimap:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(192,216,145,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(192,216,145,.15) 1px,transparent 1px);background-size:18px 18px}.j-mini-dot{position:absolute;z-index:2;width:8px;height:8px;border:2px solid #fff4c9;border-radius:50%}.md1{left:24%;top:57%;background:#ef765d}.md2{left:75%;top:28%;background:#7889df}.md3{left:53%;top:61%;background:#ebbd58}.j-minimap label{position:absolute;z-index:3;bottom:7px;left:9px;font:700 8px 'Space Mono';color:#d6d9a4}.j-actions{position:absolute;right:28px;bottom:24px;display:flex;align-items:end;gap:9px}.j-icon-btn,.j-pad button{display:grid;place-items:center;color:#fff0bd;border:1px solid rgba(239,222,155,.35);background:rgba(7,43,48,.76);box-shadow:0 7px 16px rgba(1,26,30,.28);backdrop-filter:blur(7px);cursor:pointer}.j-icon-btn{width:38px;height:38px;border-radius:50%}.j-icon-btn:hover,.j-pad button:hover{background:rgba(44,103,96,.82);transform:translateY(-2px)}.j-pad{width:116px;height:116px;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);gap:4px;padding:8px;border:1px solid rgba(239,222,155,.25);border-radius:50%;background:rgba(4,38,43,.72);backdrop-filter:blur(7px)}.j-pad button{border:0;border-radius:10px}.j-pad button:nth-child(1){grid-area:1/2}.j-pad button:nth-child(2){grid-area:2/1}.j-pad button:nth-child(3){grid-area:2/2;background:rgba(224,110,81,.3);color:#f3c96b}.j-pad button:nth-child(4){grid-area:2/3}.j-pad button:nth-child(5){grid-area:3/2}.j-toast{position:absolute;left:50%;bottom:25px;transform:translateX(-50%);padding:8px 13px;display:flex;gap:7px;align-items:center;border:1px solid rgba(239,222,155,.24);border-radius:999px;background:rgba(7,40,44,.7);color:#e9e3b8;font-size:10px;white-space:nowrap;backdrop-filter:blur(8px)}.j-toast svg{color:#f0c969}.j-sound{position:absolute;top:78px;right:227px}
        .j-map-pop{position:absolute;z-index:40;top:162px;right:28px;width:275px;padding:11px;border:1px solid rgba(239,222,155,.36);border-radius:14px;background:rgba(6,39,44,.93);box-shadow:0 18px 36px rgba(1,21,27,.48);backdrop-filter:blur(10px)}.j-map-pop header{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;font-size:11px;font-weight:700}.j-map-pop header span{display:flex;gap:6px;align-items:center}.j-map-pop header button{display:grid;place-items:center;border:0;background:none;color:#d6d3a5;cursor:pointer}.j-map-large{position:relative;height:155px;overflow:hidden;border-radius:9px;background:#245e4e url('/__mockup/images/unity-farm/FG_Grasslands_Spring.png') center/256px 256px;image-rendering:pixelated}.j-map-large:before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(190,214,145,.14),rgba(9,47,48,.18))}.mm-river{position:absolute;inset:-20% 41%;transform:rotate(16deg);background:#38969b;clip-path:polygon(30% 0,72% 0,100% 100%,0 100%)}.mm-base{position:absolute;z-index:2;width:19px;height:19px;border-radius:50%;border:2px solid #ffecb4}.mm-pijar{left:9%;bottom:10%;background:#db705c}.mm-rona{right:9%;top:10%;background:#7386dc}.mm-node{position:absolute;z-index:3;width:7px;height:7px;border-radius:50%;background:#e5ba5a;border:1px solid #fff0bf}.mm-player{position:absolute;z-index:4;left:26%;top:55%;width:9px;height:9px;border-radius:50%;background:#f0785d;border:2px solid #fff3c4}.j-map-pop small{display:block;margin-top:8px;color:#b5c998;font-size:9px}
        .j-question{position:absolute;z-index:50;left:50%;top:50%;width:min(310px,calc(100vw - 30px));transform:translate(-50%,-50%);padding:18px;border:2px solid #ffe6a5;border-radius:15px;color:#23474b;background:#fff5d5;box-shadow:0 22px 55px rgba(0,16,22,.55)}.j-question button.close{position:absolute;right:8px;top:8px;display:grid;place-items:center;width:25px;height:25px;border:0;border-radius:50%;background:transparent;color:#55746c;cursor:pointer}.j-question small{font:700 9px 'Space Mono';letter-spacing:.12em;color:#b36e3c;text-transform:uppercase}.j-question h2{margin:8px 0 4px;font-size:19px}.j-question p{margin:0;color:#64756e;font-size:11px;line-height:1.5}.j-answer{width:100%;margin-top:14px;padding:10px;border:0;border-radius:9px;color:#fff2c3;background:#df7357;font-weight:800;cursor:pointer}.j-answer:hover{background:#c9604d}
        @keyframes j-water{0%,100%{margin-left:0;opacity:.86}50%{margin-left:1.5%;opacity:1}}@keyframes j-sway{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg) translateY(-2px)}}@keyframes j-pulse{0%,100%{box-shadow:0 8px 12px rgba(3,31,34,.34)}50%{box-shadow:0 8px 18px rgba(229,191,92,.45)}}@keyframes j-float{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 3px))}}@keyframes j-walk{from{transform:rotate(-2deg) translateX(-1px)}to{transform:rotate(2deg) translateX(1px)}}
        @media(max-width:700px){.j-board{inset:8% 1% 3%;transform:none}.j-brand-copy,.j-time,.j-toast{display:none}.j-brand{top:14px;left:14px}.j-match{top:13px;gap:8px;padding:7px 9px}.j-minimap{top:68px;right:14px;width:132px;height:94px}.j-sound{top:75px;right:155px}.j-actions{right:12px;bottom:14px;gap:5px}.j-pad{width:98px;height:98px}.j-base{transform:scale(.7)}.j-base.pijar{left:-2%}.j-base.rona{right:-2%}.j-node{transform:translate(-50%,-50%) scale(.85)}.j-pet{transform:translate(-50%,-50%) scale(.82)}.j-map-pop{top:168px;right:14px;width:245px}}
      `}</style>
      <style>{`
        .j-analog{position:relative;width:132px;height:132px;touch-action:none;user-select:none;border:1px solid rgba(239,222,155,.32);border-radius:50%;background:radial-gradient(circle at 34% 27%,rgba(46,117,109,.82),rgba(4,38,43,.86) 62%);box-shadow:inset 0 0 0 9px rgba(5,31,36,.34),0 7px 16px rgba(1,26,30,.28);cursor:grab}
        .j-analog:active{cursor:grabbing;background:radial-gradient(circle at 34% 27%,rgba(60,137,124,.92),rgba(4,38,43,.9) 62%)}
        .j-analog-ring{position:absolute;left:50%;top:50%;border:1px solid rgba(239,222,155,.2);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}
        .j-analog-ring.ring-one{width:86px;height:86px}.j-analog-ring.ring-two{width:52px;height:52px;border-color:rgba(239,222,155,.13)}
        .j-analog-dot{position:absolute;width:4px;height:4px;border-radius:50%;background:#e6c872;opacity:.65;pointer-events:none}
        .j-analog-dot.dot-top{left:50%;top:10px;transform:translateX(-50%)}.j-analog-dot.dot-right{right:10px;top:50%;transform:translateY(-50%)}
        .j-analog-dot.dot-bottom{left:50%;bottom:10px;transform:translateX(-50%)}.j-analog-dot.dot-left{left:10px;top:50%;transform:translateY(-50%)}
        .j-analog-knob{position:absolute;left:50%;top:50%;width:54px;height:54px;border:2px solid #ffe6a5;border-radius:50%;background:radial-gradient(circle at 32% 25%,#ffb98a,#d96d58 58%,#8e4b4c);box-shadow:0 7px 0 rgba(3,28,33,.42),inset 0 4px 8px rgba(255,240,180,.24);pointer-events:none;transition:transform .12s ease-out}
        .j-analog-knob span{position:absolute;left:50%;top:50%;width:13px;height:13px;border:2px solid rgba(255,240,180,.7);border-radius:50%;transform:translate(-50%,-50%)}
        @media(max-width:700px){.j-analog{width:106px;height:106px}.j-analog-ring.ring-one{width:70px;height:70px}.j-analog-ring.ring-two{width:42px;height:42px}.j-analog-knob{width:44px;height:44px}.j-analog-dot.dot-top{top:8px}.j-analog-dot.dot-right{right:8px}.j-analog-dot.dot-bottom{bottom:8px}.j-analog-dot.dot-left{left:8px}}
      `}</style>
      <section className="j-world" aria-label="Peta hutan TOMAT">
          <div className="j-board"><img className="j-terrain-texture" src={`${unityAsset}FG_Grasslands_Spring.png`} alt="" /><div className="j-grid" /><div className="j-lane a" /><div className="j-lane b" /><div className="j-lane c" /><span className="j-lane-label jl-a">LAJUR UTARA</span><span className="j-lane-label jl-b">LAJUR TENGAH</span><span className="j-lane-label jl-c">LAJUR SELATAN</span>
          <img className="j-brush b1" src={`${unityAsset}FG_Grass_Spring.png`} alt="" /><img className="j-brush b2" src={`${unityAsset}FG_Grass_Summer.png`} alt="" /><img className="j-brush b3" src={`${unityAsset}FG_Grass_Spring.png`} alt="" /><img className="j-brush b4" src={`${unityAsset}FG_Grass_Summer.png`} alt="" /><img className="j-brush b5" src={`${unityAsset}FG_Grass_Spring.png`} alt="" /><img className="j-brush b6" src={`${unityAsset}FG_Grass_Summer.png`} alt="" />
          <img className="j-rock r1" src={`${unityAsset}FG_Grounds.png`} alt="" /><img className="j-rock r2" src={`${unityAsset}FG_Grounds.png`} alt="" /><img className="j-rock r3" src={`${unityAsset}FG_Grounds.png`} alt="" /><img className="j-rock r4" src={`${unityAsset}FG_Grounds.png`} alt="" /><img className="j-rock r5" src={`${unityAsset}FG_Grounds.png`} alt="" />
          <div className="j-base pijar"><div className="j-core"><Gem size={26} /></div><strong>BASE PIJAR</strong><small>{score} POIN</small><div className="j-integrity"><i /></div></div>
          <div className="j-base rona"><div className="j-core"><Gem size={26} /></div><strong>BASE RONA</strong><small>71 POIN</small><div className="j-integrity"><i /></div></div>
          {nodes.map((node) => <button key={node.id} className={`j-node ${node.tone} ${claimed.includes(node.id) ? "claimed" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => openNode(node)} aria-label={`${node.label}, ${node.points} poin`}><img src={`${unityAsset}${node.asset}`} alt="" /><b>+{node.points}</b><span>{node.label}</span></button>)}
          {pets.map((pet) => <Pet key={pet.name} pet={pet} />)}
        </div>
      </section>
      <div className="j-hud">
        <div className="j-brand"><span className="j-brand-mark">T</span><span className="j-brand-copy"><strong>TOMAT</strong><small>arena belajar</small></span></div>
        <div className="j-match"><span className="j-team-score pijar"><b>{score}</b>Pijar</span><span className="j-vs">VS</span><span className="j-team-score rona">Rona<b>71</b></span></div><div className="j-time">{time}</div>
        <div className="j-minimap" aria-label="Minimap"><span className="j-mini-dot md1" /><span className="j-mini-dot md2" /><span className="j-mini-dot md3" /><label>POSISI PET</label></div>
        <button className="j-icon-btn j-sound" onClick={() => { setMuted((v) => !v); setNotice(muted ? "Suara arena dinyalakan" : "Suara arena dimatikan"); }} aria-label={muted ? "Nyalakan suara" : "Matikan suara"}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
         <div className="j-actions"><button className="j-icon-btn" onClick={() => setMapOpen((v) => !v)} aria-label="Buka peta"><Map size={16} /></button><AnalogStick onMove={moveAnalog} onRelease={() => setMove("diam")} /></div>
        <div className="j-toast"><Sparkles size={12} />{notice}{move !== "diam" && ` · ${move}`}</div>
        {mapOpen && <MiniMap onClose={() => setMapOpen(false)} />}
        {selected && <div className="j-question"><button className="close" onClick={() => setSelected(null)} aria-label="Tutup soal"><X size={15} /></button><small>Node soal · +{selected.points} poin</small><h2>{selected.label}</h2><p>Jawab dengan benar untuk mengubah node ini menjadi gulungan yang bisa dibawa Alya ke Base Pijar.</p><button className="j-answer" onClick={answer}>Jawab benar dan ambil gulungan</button></div>}
      </div>
    </main>
  );
}