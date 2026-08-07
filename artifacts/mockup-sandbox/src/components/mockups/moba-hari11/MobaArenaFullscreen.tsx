import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  Crown,
  Map,
  Radio,
  ScrollText,
  Sparkles,
  Trophy,
} from "lucide-react";

type Team = "Pijar" | "Rona";
type Pet = {
  name: string;
  kind: string;
  team: Team;
  x: number;
  y: number;
  tone: string;
  self?: boolean;
  scrolls: number;
};

const pets: Pet[] = [
  { name: "Alya", kind: "Tomi", team: "Pijar", x: 35, y: 51, tone: "#ef765e", self: true, scrolls: 1 },
  { name: "Bimo", kind: "Monyang", team: "Pijar", x: 26, y: 28, tone: "#e9b84c", scrolls: 0 },
  { name: "Nisa", kind: "Kelinsay", team: "Rona", x: 64, y: 43, tone: "#7988df", scrolls: 1 },
  { name: "Raka", kind: "Nananaga", team: "Rona", x: 78, y: 69, tone: "#39afa7", scrolls: 0 },
];

const nodes = [
  { x: 23, y: 20, points: 10, label: "mudah", tone: "mint" },
  { x: 48, y: 28, points: 25, label: "sedang", tone: "sun" },
  { x: 73, y: 24, points: 50, label: "sulit", tone: "coral" },
  { x: 54, y: 51, points: 25, label: "sedang", tone: "sun" },
  { x: 23, y: 78, points: 10, label: "mudah", tone: "mint" },
  { x: 72, y: 82, points: 10, label: "mudah", tone: "mint" },
];

function PetMarker({ pet }: { pet: Pet }) {
  return (
    <div className={`pet-marker ${pet.self ? "self" : ""}`} style={{ left: `${pet.x}%`, top: `${pet.y}%` }}>
      <div className="pet-tag"><i style={{ background: pet.team === "Pijar" ? "#e96d5c" : "#6e7edb" }} />{pet.name}{pet.self ? " · kamu" : ""}</div>
      <div className="pet-body" style={{ background: `linear-gradient(145deg, ${pet.tone}, #fff0ad)` }}>
        <span>{pet.kind.slice(0, 1)}</span><b /><b />
      </div>
      {pet.scrolls > 0 && <div className="scroll-badge"><ScrollText size={12} /></div>}
      <div className="pet-count">{pet.scrolls}/1 gulungan</div>
    </div>
  );
}

function MiniMap() {
  return (
    <div className="mini-map" aria-label="Peta mini posisi pemain">
      <div className="mini-river" />
      <span className="mini-base left" /><span className="mini-base right" />
      {pets.map((pet) => <span key={pet.name} className="mini-pet" style={{ left: `${pet.x}%`, top: `${pet.y}%`, background: pet.team === "Pijar" ? "#ed705d" : "#7584dc" }} />)}
      {nodes.slice(0, 4).map((node, i) => <span key={i} className="mini-node" style={{ left: `${node.x}%`, top: `${node.y}%` }} />)}
      <label><Map size={11} /> PETA ARENA</label>
    </div>
  );
}

export function MobaArenaFullscreen() {
  const [seconds, setSeconds] = useState(7 * 60 + 42);
  const [ping, setPing] = useState("18 ms");
  const [objective, setObjective] = useState("Temukan 1 gulungan lagi untuk tim");
  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value > 0 ? value - 1 : 600), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const time = useMemo(() => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);
  const refresh = () => {
    setPing("14 ms");
    setObjective("Posisi tersinkron · lanjutkan jelajah");
    window.setTimeout(() => setObjective("Temukan 1 gulungan lagi untuk tim"), 2400);
  };

  return (
    <main className="arena-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box} html,body,#root{margin:0;min-height:100%;background:#b5cb91}
        .arena-screen{width:100vw;min-height:100vh;overflow:hidden;position:relative;color:#183c43;font-family:'DM Sans',sans-serif;background:#b5cb91;isolation:isolate}
        .world{position:absolute;inset:0;overflow:hidden;background:#b7cf91}
        .world:before{content:"";position:absolute;inset:0;opacity:.55;background-image:radial-gradient(circle at 15% 18%,#e9e7ad 0 2px,transparent 3px),radial-gradient(circle at 74% 30%,#87b878 0 1px,transparent 2px),radial-gradient(circle at 56% 78%,#e7d995 0 1.5px,transparent 2.5px);background-size:47px 41px,34px 38px,52px 44px}
        .world:after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,rgba(239,118,94,.13),transparent 37%,rgba(116,131,221,.12)),radial-gradient(ellipse at center,transparent 38%,rgba(49,91,65,.18));pointer-events:none}
        .river{position:absolute;top:-10%;bottom:-10%;left:47%;width:12%;transform:rotate(14deg);background:linear-gradient(90deg,rgba(77,158,174,.14),rgba(105,193,198,.62) 48%,rgba(68,145,165,.17));border-left:3px dashed rgba(44,123,143,.3);border-right:3px dashed rgba(44,123,143,.3);box-shadow:inset 12px 0 25px rgba(254,245,191,.22),inset -12px 0 25px rgba(36,119,143,.16)}
        .river:before,.river:after{content:"";position:absolute;width:38px;height:6px;border-top:2px solid rgba(255,247,196,.55);border-radius:50%;left:25%;animation:water 4s ease-in-out infinite}.river:before{top:28%}.river:after{top:69%;animation-delay:1.5s}
        .lane{position:absolute;left:-8%;right:-8%;height:15%;border:22px solid rgba(249,237,181,.7);border-radius:50%;box-shadow:0 0 0 4px rgba(101,146,104,.16),inset 0 0 17px rgba(82,121,81,.17);transform:rotate(-9deg)}.lane.top{top:12%}.lane.mid{top:42%;height:17%;transform:rotate(2deg);border-width:25px}.lane.bot{top:72%;transform:rotate(10deg)}
        .lane-line{position:absolute;color:rgba(41,101,91,.38);font:700 10px 'Space Mono';letter-spacing:.18em;text-transform:uppercase}.lane-line.a{top:16%;left:5%}.lane-line.b{top:48%;left:44%}.lane-line.c{bottom:11%;right:4%}
        .grove{position:absolute;width:18%;height:23%;background:radial-gradient(circle at 20% 28%,#477c60 0 10%,transparent 11%),radial-gradient(circle at 54% 38%,#578b61 0 15%,transparent 16%),radial-gradient(circle at 80% 67%,#3f785c 0 13%,transparent 14%),radial-gradient(circle at 28% 78%,#76a66a 0 16%,transparent 17%);filter:drop-shadow(8px 9px 0 rgba(59,100,63,.12));opacity:.94}.grove.one{left:3%;top:27%;transform:rotate(-7deg)}.grove.two{right:4%;top:8%;transform:rotate(12deg)}.grove.three{left:7%;bottom:6%;transform:rotate(9deg)}.grove.four{right:9%;bottom:18%;transform:rotate(-12deg)}
        .rock{position:absolute;width:42px;height:30px;border-radius:48% 52% 42% 58%;background:linear-gradient(145deg,#b8aa86,#777f69);box-shadow:inset -5px -5px 0 rgba(58,86,71,.18),4px 5px 0 rgba(70,102,72,.12)}.rock.r1{left:37%;top:12%;transform:rotate(17deg)}.rock.r2{right:28%;bottom:11%;transform:rotate(-14deg)}.rock.r3{left:17%;top:59%;transform:scale(.72)}
        .base{position:absolute;z-index:3;width:132px;text-align:center;top:42%}.base.left{left:1.5%}.base.right{right:1.5%}.base-ring{width:104px;height:104px;margin:auto;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(255,248,193,.9) 0 23%,rgba(236,113,93,.6) 24% 28%,rgba(236,113,93,.15) 29% 62%,transparent 63%);border:2px solid rgba(255,245,182,.55)}.right .base-ring{background:radial-gradient(circle,rgba(255,248,193,.9) 0 23%,rgba(112,128,220,.65) 24% 28%,rgba(112,128,220,.15) 29% 62%,transparent 63%)}.base-core{width:53px;height:53px;border:4px solid #fff2bb;border-radius:18px 18px 18px 5px;display:grid;place-items:center;color:#fff8cf;background:#e86e5d;box-shadow:0 6px 0 rgba(81,101,65,.2)}.right .base-core{background:#7584db;border-radius:18px 18px 5px 18px}.base-name{font:700 9px 'Space Mono';letter-spacing:.13em;margin-top:5px;color:#31565b}.base-score{font:700 13px 'Space Mono';margin-top:3px;color:#d1584d}.right .base-score{color:#5668c4}
        .node{position:absolute;z-index:5;width:58px;height:58px;transform:translate(-50%,-50%);display:grid;place-items:center;border-radius:50%;border:4px solid;background:#fff0bc;box-shadow:0 5px 0 rgba(66,103,72,.17);animation:float 3.5s ease-in-out infinite}.node:after{content:"";position:absolute;inset:-8px;border:1px dashed currentColor;border-radius:50%;opacity:.45}.node.mint{color:#4c9a78;border-color:#80be91;background:#e1f1bd}.node.sun{color:#ad7a32;border-color:#dfb24f}.node.coral{color:#b6544a;border-color:#e47e68;background:#ffd4bd}.node b{font:700 11px 'Space Mono'}.node span{position:absolute;top:64px;font-size:8px;font-weight:700;color:#55715f;white-space:nowrap}
        .pet-marker{position:absolute;z-index:8;transform:translate(-50%,-50%);text-align:center;min-width:80px;animation:bob 3.2s ease-in-out infinite}.pet-marker:nth-of-type(2n){animation-delay:.9s}.pet-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 6px;border-radius:5px;background:rgba(255,251,226,.84);border:1px solid rgba(205,193,139,.75);font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 3px 7px rgba(58,91,66,.13)}.pet-tag i{width:6px;height:6px;border-radius:50%}.self .pet-tag{border-color:#ed765f;color:#c55748}.pet-body{position:relative;width:49px;height:43px;margin:6px auto 3px;border:3px solid #fff6cb;border-radius:50% 50% 45% 45%;display:grid;place-items:center;color:#fffbd8;font:700 17px 'Space Mono';box-shadow:0 6px 0 rgba(55,93,66,.27)}.pet-body:before{content:"";position:absolute;left:6px;right:6px;bottom:-9px;height:13px;background:inherit;border-radius:0 0 50% 50%;z-index:-1}.pet-body b{position:absolute;top:17px;width:6px;height:8px;border-radius:50%;background:#204852}.pet-body b:first-of-type{left:10px}.pet-body b:last-of-type{right:10px}.scroll-badge{position:absolute;right:0;top:30px;width:23px;height:23px;border-radius:50%;display:grid;place-items:center;color:#8f672d;background:#fff0b5;border:2px solid #fff9d9;transform:rotate(9deg)}.pet-count{font-size:8px;color:#44615d;background:rgba(255,251,226,.7);padding:2px 5px;border-radius:4px}
        .top-hud{position:absolute;z-index:12;top:18px;left:22px;right:22px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none}.brand{display:flex;align-items:center;gap:9px}.brand-mark{width:38px;height:38px;display:grid;place-items:center;background:#ec715d;color:#fff8cf;border-radius:13px 13px 13px 4px;font:700 19px 'Space Mono';box-shadow:3px 4px 0 rgba(104,95,60,.18)}.brand-copy strong{display:block;font-size:16px;letter-spacing:.16em}.brand-copy span{display:block;margin-top:3px;color:#557064;font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}.match-hud{display:flex;align-items:center;gap:14px;padding:9px 13px;border-radius:13px;background:rgba(255,249,215,.78);border:1px solid rgba(207,193,134,.55);box-shadow:0 5px 15px rgba(68,93,61,.1);backdrop-filter:blur(8px)}.score{font:700 18px 'Space Mono'}.score.pijar{color:#d75d4f}.score.rona{color:#6675ce}.versus{font-size:9px;font-weight:700;color:#7c7964}.timer{font:700 20px 'Space Mono';padding-left:11px;border-left:1px solid #d6c99c}.timer small{font:700 8px 'DM Sans';color:#817c67;margin-left:4px;letter-spacing:.12em}.live{display:flex;align-items:center;gap:5px;color:#478e71;font-size:10px;font-weight:700}.live i{width:7px;height:7px;border-radius:50%;background:#48ae7e;box-shadow:0 0 0 4px rgba(119,190,135,.2)}
        .objective{position:absolute;z-index:10;top:91px;left:50%;transform:translateX(-50%);padding:9px 15px;display:flex;align-items:center;gap:8px;border-radius:999px;background:rgba(255,249,215,.7);border:1px solid rgba(207,193,134,.48);color:#5c6956;font-size:11px;font-weight:700;backdrop-filter:blur(8px);white-space:nowrap}.objective svg{color:#c28c35}
        .right-tools{position:absolute;z-index:10;right:20px;bottom:26px;display:flex;flex-direction:column;gap:10px;align-items:flex-end}.mini-map{width:148px;height:112px;position:relative;overflow:hidden;border-radius:14px;background:#aaca88;border:2px solid rgba(255,246,192,.74);box-shadow:0 6px 17px rgba(47,87,57,.18)}.mini-map:before{content:"";position:absolute;inset:9px;border:10px solid rgba(255,240,179,.53);border-radius:50%;transform:rotate(-5deg)}.mini-river{position:absolute;top:-22%;bottom:-20%;left:48%;width:13%;transform:rotate(14deg);background:rgba(92,180,192,.52)}.mini-base{position:absolute;width:13px;height:13px;border-radius:4px;border:2px solid #fff4bd;top:46%;background:#e96d5c}.mini-base.left{left:8%}.mini-base.right{right:8%;background:#7182dc}.mini-pet,.mini-node{position:absolute;z-index:2;width:7px;height:7px;border:1px solid #fff7d0;border-radius:50%}.mini-node{background:#e5b54d;width:5px;height:5px}.mini-map label{position:absolute;bottom:6px;left:8px;display:flex;align-items:center;gap:4px;color:#47705e;font:700 8px 'Space Mono';letter-spacing:.08em}
        .controls{display:flex;align-items:flex-end;gap:15px}.joystick{width:88px;height:88px;border-radius:50%;display:grid;place-items:center;background:rgba(255,249,215,.38);border:1px solid rgba(255,249,215,.7);box-shadow:inset 0 0 0 10px rgba(118,150,102,.13)}.stick{width:42px;height:42px;border-radius:50%;background:rgba(255,250,216,.78);border:2px solid rgba(190,175,115,.7);box-shadow:0 4px 8px rgba(65,88,60,.16)}.direction-pad{display:grid;grid-template-columns:repeat(3,26px);grid-template-rows:repeat(3,26px);gap:3px;padding:6px;border-radius:12px;background:rgba(255,249,215,.48);border:1px solid rgba(255,249,215,.7)}.direction-pad button{border:0;border-radius:6px;background:rgba(255,251,225,.78);color:#55715f;font:700 14px 'Space Mono';cursor:pointer}.direction-pad button:hover{background:#fff3bd}.direction-pad .up{grid-column:2}.direction-pad .left{grid-column:1;grid-row:2}.direction-pad .center{grid-column:2;grid-row:2;background:rgba(224,191,108,.42)}.direction-pad .right{grid-column:3;grid-row:2}.direction-pad .down{grid-column:2;grid-row:3}.sync{border:0;background:rgba(255,249,215,.7);color:#52715f;border-radius:9px;padding:7px 9px;font-size:9px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px}.sync:hover{background:#fff3bd}
        .status{position:absolute;z-index:10;left:22px;bottom:26px;display:flex;gap:8px;align-items:center;color:#4d6b61;font-size:10px;font-weight:700}.status span{padding:7px 9px;border-radius:8px;background:rgba(255,249,215,.63);backdrop-filter:blur(7px)}.status svg{vertical-align:middle;margin-right:4px;color:#4eaa7e}
        @keyframes bob{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 4px))}}@keyframes float{0%,100%{margin-top:0}50%{margin-top:-4px}}@keyframes water{0%,100%{transform:translateX(0);opacity:.4}50%{transform:translateX(18px);opacity:.8}}
        @media(max-width:700px){.top-hud{top:10px;left:12px;right:12px}.brand-copy{display:none}.match-hud{gap:8px;padding:7px 9px}.match-hud .live{display:none}.score{font-size:14px}.timer{font-size:15px;padding-left:8px}.timer small{display:none}.objective{top:67px;font-size:9px;max-width:80%;overflow:hidden}.right-tools{right:10px;bottom:13px}.mini-map{width:112px;height:83px}.controls{gap:8px}.joystick{width:69px;height:69px}.stick{width:32px;height:32px}.direction-pad{transform:scale(.78);transform-origin:bottom right}.status{left:10px;bottom:13px}.status span:last-child{display:none}.base{transform:scale(.7)}.node{width:45px;height:45px}.node span{top:50px;font-size:7px}.pet-marker{transform:translate(-50%,-50%) scale(.82)}}
      `}</style>
      <section className="world" aria-label="Arena TOMAT">
        <div className="river" /><div className="lane top" /><div className="lane mid" /><div className="lane bot" />
        <span className="lane-line a">LAJUR ATAS</span><span className="lane-line b">LAJUR TENGAH</span><span className="lane-line c">LAJUR BAWAH</span>
        <div className="grove one" /><div className="grove two" /><div className="grove three" /><div className="grove four" />
        <div className="rock r1" /><div className="rock r2" /><div className="rock r3" />
        <div className="base left"><div className="base-ring"><div className="base-core"><Crown size={24} /></div></div><div className="base-name">BASE PIJAR</div><div className="base-score">86 poin</div></div>
        <div className="base right"><div className="base-ring"><div className="base-core"><Crown size={24} /></div></div><div className="base-name">BASE RONA</div><div className="base-score">71 poin</div></div>
        {nodes.map((node, i) => <div key={i} className={`node ${node.tone}`} style={{ left: `${node.x}%`, top: `${node.y}%` }}><Sparkles size={16} /><b>+{node.points}</b><span>{node.label}</span></div>)}
        {pets.map((pet) => <PetMarker key={pet.name} pet={pet} />)}
      </section>
      <header className="top-hud">
        <div className="brand"><div className="brand-mark">T</div><div className="brand-copy"><strong>TOMAT</strong><span>Arena belajar bersama</span></div></div>
        <div className="match-hud"><span className="score pijar">86</span><span className="versus">PIJAR</span><span className="versus">VS</span><span className="versus">RONA</span><span className="score rona">71</span><span className="timer">{time}<small>TERSISA</small></span><span className="live"><i />langsung</span></div>
      </header>
      <div className="objective"><ScrollText size={15} /> {objective}</div>
      <div className="status"><span><Radio size={12} /> Terhubung · {ping}</span><span><Trophy size={12} /> Skor tim diperbarui</span></div>
      <aside className="right-tools"><MiniMap /><div className="controls"><div className="joystick" aria-label="Joystick gerak"><div className="stick" /></div><div className="direction-pad" aria-label="Pad arah laptop"><button className="up" onClick={refresh}>↑</button><button className="left" onClick={refresh}>←</button><button className="center" onClick={refresh}><Compass size={12} /></button><button className="right" onClick={refresh}>→</button><button className="down" onClick={refresh}>↓</button></div></div><button className="sync" onClick={refresh}><Radio size={12} /> Segarkan posisi</button></aside>
    </main>
  );
}