import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  CircleHelp,
  Clock3,
  Crown,
  Gem,
  Radio,
  ScrollText,
  Shield,
  Sparkles,
  Trophy,
  Wifi,
} from "lucide-react";

type Node = { left: string; top: string; difficulty: "mudah" | "sedang" | "sulit"; points: number; claimed?: boolean };
type Pet = { name: string; pet: string; team: "Pijar" | "Rona"; left: string; top: string; color: string; scrolls: number; carrying?: boolean; self?: boolean };

const nodes: Node[] = [
  { left: "23%", top: "28%", difficulty: "mudah", points: 10 },
  { left: "39%", top: "63%", difficulty: "sedang", points: 25 },
  { left: "52%", top: "31%", difficulty: "sulit", points: 50 },
  { left: "67%", top: "65%", difficulty: "mudah", points: 10 },
  { left: "77%", top: "30%", difficulty: "sedang", points: 25, claimed: true },
  { left: "48%", top: "78%", difficulty: "mudah", points: 10 },
];

const pets: Pet[] = [
  { name: "Alya", pet: "Tomi", team: "Pijar", left: "28%", top: "47%", color: "#ef765e", scrolls: 1, carrying: true, self: true },
  { name: "Bimo", pet: "Monyang", team: "Pijar", left: "34%", top: "24%", color: "#ffb545", scrolls: 0 },
  { name: "Nisa", pet: "Kelinsay", team: "Rona", left: "64%", top: "50%", color: "#7b89e8", scrolls: 1, carrying: true },
  { name: "Raka", pet: "Nananaga", team: "Rona", left: "72%", top: "76%", color: "#36bfb0", scrolls: 0 },
];

function PetToken({ pet }: { pet: Pet }) {
  return (
    <div className={`pet-token ${pet.self ? "is-self" : ""}`} style={{ left: pet.left, top: pet.top }}>
      <div className="pet-name">{pet.name}{pet.self ? " · kamu" : ""}</div>
      <div className="pet-orb" style={{ background: `linear-gradient(145deg, ${pet.color}, #fff0b3)` }}>
        <span>{pet.pet === "Monyang" ? "M" : pet.pet === "Kelinsay" ? "K" : pet.pet === "Nananaga" ? "N" : "T"}</span>
        <div className="pet-eye eye-a" /><div className="pet-eye eye-b" />
      </div>
      {pet.carrying && <div className="carry-scroll"><ScrollText size={13} /></div>}
      <div className="pet-meta"><span className="team-dot" style={{ background: pet.team === "Pijar" ? "#ef765e" : "#7b89e8" }} />{pet.scrolls}/{pet.pet === "Monyang" ? 2 : 1}</div>
    </div>
  );
}

function Base({ side, tower, score }: { side: "left" | "right"; tower: number; score: number }) {
  return (
    <div className={`base ${side}`}>
      <div className="base-glow" />
      <div className="base-icon"><Crown size={22} /></div>
      <div className="base-title">{side === "left" ? "BASE PIJAR" : "BASE RONA"}</div>
      <div className="base-score">{score}<small> poin</small></div>
      <div className="tower-line"><span>Tower luar</span><b>{tower}%</b></div>
      <div className="bar"><i style={{ width: `${tower}%` }} /></div>
    </div>
  );
}

export function MobaArenaHud() {
  const [seconds, setSeconds] = useState(7 * 60 + 42);
  const [feed, setFeed] = useState(["Nisa membawa Gulungan Sedang", "Alya menemukan node mudah +10", "Tower Rona tersisa 62 poin"]);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 600)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const addEvent = () => setFeed((items) => ["Snapshot server tersinkron", ...items].slice(0, 4));
  const minute = String(Math.floor(seconds / 60)).padStart(2, "0");
  const second = String(seconds % 60).padStart(2, "0");

  return (
    <main className="tomat-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .tomat-shell { min-height: 100vh; background: #f5f0df; color: #193c46; font-family: 'DM Sans', sans-serif; padding: 20px; overflow-x: hidden; }
        .topbar { max-width: 1440px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .brand { display: flex; align-items: center; gap: 11px; }
        .brand-mark { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 13px 13px 13px 4px; background: #ef765e; color: #fff8dd; box-shadow: 4px 4px 0 #d8bc87; font-weight: 700; font-family: 'Space Mono'; }
        .brand h1 { font-size: 20px; letter-spacing: .16em; margin: 0; line-height: 1; }
        .brand p { margin: 5px 0 0; color: #7c7664; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; }
        .top-actions { display: flex; align-items: center; gap: 9px; }
        .pill { border: 1px solid #d9cda9; background: #fff9e9; border-radius: 999px; padding: 9px 12px; display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; }
        .connected { color: #3d9e78; }.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #48bf88; box-shadow: 0 0 0 4px #d9f0d9; }
        .match-layout { max-width: 1440px; margin: auto; display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 16px; }
        .game-panel, .side-panel { border: 1px solid #dbcda8; border-radius: 22px; background: #fffbeb; box-shadow: 0 12px 30px rgba(92, 75, 35, .1); }
        .game-panel { padding: 14px; }
        .match-head { display: flex; justify-content: space-between; align-items: center; padding: 2px 6px 14px; }
        .phase { display: flex; align-items: center; gap: 9px; font-size: 11px; letter-spacing: .11em; color: #827a61; font-weight: 700; text-transform: uppercase; }
        .phase b { color: #d35c4b; background: #fde1d7; padding: 5px 8px; border-radius: 6px; }
        .timer { font-family: 'Space Mono'; font-weight: 700; font-size: 23px; color: #193c46; letter-spacing: .04em; }
        .timer small { font: 600 10px 'DM Sans'; color: #8b8269; margin-left: 5px; letter-spacing: .12em; }
        .scoreboard { display: flex; align-items: center; justify-content: center; gap: 22px; padding: 0 8px 14px; }
        .team-score { flex: 1; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 13px; }
        .team-score:last-child { justify-content: flex-end; text-align: right; }
        .team-score strong { font: 700 25px 'Space Mono'; color: #d65e4d; }
        .team-score:last-child strong { color: #6571cb; }
        .score-line { height: 6px; flex: 1; max-width: 150px; background: #f5d3c7; border-radius: 9px; overflow: hidden; }.score-line i { display: block; height: 100%; width: 64%; background: #ef765e; border-radius: inherit; }.team-score:last-child .score-line { background: #d6d7f2; }.team-score:last-child .score-line i { width: 52%; background: #7b89e8; }
        .versus { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; background: #193c46; color: #f8e8b6; font: 700 11px 'Space Mono'; box-shadow: 0 4px 0 #c8b888; }
        .arena { position: relative; min-height: 570px; border-radius: 17px; overflow: hidden; border: 5px solid #b6aa76; background: #cbd993; isolation: isolate; }
        .arena:before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 18% 20%, rgba(255,255,255,.5) 0 2px, transparent 3px), radial-gradient(circle at 75% 70%, rgba(88,145,104,.2) 0 1px, transparent 2px), linear-gradient(135deg, #c8d88f, #b5d39e 55%, #e1d58f); background-size: 38px 38px, 29px 29px, auto; opacity: .75; z-index: -2; }
        .arena:after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(239,118,94,.1), transparent 45%, rgba(123,137,232,.1)); pointer-events: none; z-index: 3; }
        .lane { position: absolute; left: 7%; right: 7%; height: 92px; border-radius: 50%; border: 16px solid rgba(255,248,208,.42); transform: rotate(-8deg); box-shadow: 0 0 0 3px rgba(112,149,111,.16), inset 0 0 12px rgba(100,125,95,.12); }
        .lane.one { top: 20%; }.lane.two { top: 45%; transform: rotate(0); border-width: 14px; }.lane.three { top: 70%; transform: rotate(8deg); }
        .river { position: absolute; top: 0; bottom: 0; left: 49%; width: 10%; background: rgba(104,177,190,.18); transform: rotate(13deg); border-left: 2px dashed rgba(72,135,150,.28); border-right: 2px dashed rgba(72,135,150,.28); }
        .lane-label { position: absolute; color: rgba(37,93,92,.5); font: 700 9px 'Space Mono'; letter-spacing: .13em; text-transform: uppercase; }
        .lane-label.top { top: 11%; left: 5%; }.lane-label.mid { top: 47%; left: 46%; }.lane-label.bot { bottom: 9%; right: 4%; }
        .base { position: absolute; top: 40%; width: 104px; text-align: center; z-index: 5; }.base.left { left: 2%; }.base.right { right: 2%; }
        .base-glow { position: absolute; width: 90px; height: 90px; left: 7px; top: 0; border-radius: 50%; background: rgba(239,118,94,.23); filter: blur(8px); z-index: -1; }.right .base-glow { background: rgba(123,137,232,.25); }
        .base-icon { width: 53px; height: 53px; margin: auto; display: grid; place-items: center; border-radius: 17px 17px 17px 5px; color: #fff4c3; background: #e9705e; border: 4px solid #fff0bd; box-shadow: 0 5px 0 rgba(134,95,63,.22); }.right .base-icon { background: #7280dc; border-radius: 17px 17px 5px 17px; }
        .base-title { margin-top: 8px; font: 700 9px 'Space Mono'; letter-spacing: .08em; }.base-score { margin-top: 3px; font: 700 14px 'Space Mono'; }.base-score small { font: 500 9px 'DM Sans'; color: #6c765e; }
        .tower-line { display: flex; justify-content: space-between; gap: 4px; margin-top: 9px; font-size: 9px; color: #60705f; }.tower-line b { font-family: 'Space Mono'; color: #c95747; }.right .tower-line b { color: #5f6cc6; }
        .bar { height: 5px; background: rgba(255,255,255,.65); border-radius: 5px; overflow: hidden; margin-top: 4px; }.bar i { display: block; height: 100%; background: #ef765e; border-radius: inherit; }.right .bar i { background: #7b89e8; }
        .node { position: absolute; z-index: 6; transform: translate(-50%, -50%); display: grid; place-items: center; width: 47px; height: 47px; border-radius: 50%; cursor: default; transition: transform .2s ease; }.node:hover { transform: translate(-50%, -50%) scale(1.12); }.node.easy { background: #e8f2b7; border: 4px solid #82b96d; color: #417452; }.node.medium { background: #ffe3a3; border: 4px solid #dcaa4b; color: #a46c2a; }.node.hard { background: #ffd0bc; border: 4px solid #e47a62; color: #ac4d42; }.node.claimed { opacity: .5; filter: grayscale(.3); }
        .node b { font: 700 10px 'Space Mono'; }.node span { font-size: 8px; margin-top: -2px; font-weight: 700; }
        .pet-token { position: absolute; z-index: 8; transform: translate(-50%, -50%); text-align: center; min-width: 67px; animation: bob 3s ease-in-out infinite; }.pet-token:nth-of-type(2n) { animation-delay: .8s; }.pet-name { background: #fffbeb; border: 1px solid #d7c998; border-radius: 5px; padding: 3px 5px; font-size: 9px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(53,72,54,.14); }.is-self .pet-name { border-color: #ef765e; color: #bf5545; }
        .pet-orb { width: 39px; height: 35px; margin: 5px auto 2px; border-radius: 48% 48% 45% 45%; border: 3px solid #fff5ca; box-shadow: 0 4px 0 rgba(95,104,68,.28); position: relative; display: grid; place-items: center; color: #fff9db; font: 700 15px 'Space Mono'; }.pet-orb:before { content: ''; position: absolute; left: 4px; right: 4px; bottom: -7px; height: 10px; background: inherit; border-radius: 0 0 50% 50%; z-index: -1; }.pet-eye { position: absolute; width: 5px; height: 7px; border-radius: 50%; background: #23464a; top: 13px; }.eye-a { left: 8px; }.eye-b { right: 8px; }
        .pet-meta { font-size: 8px; color: #49615c; background: rgba(255,251,235,.78); display: inline-flex; align-items: center; gap: 3px; padding: 2px 5px; border-radius: 4px; }.team-dot { width: 5px; height: 5px; border-radius: 50%; }.carry-scroll { position: absolute; right: -2px; top: 25px; color: #a5722d; background: #fff1b3; border: 2px solid #fff9d9; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; transform: rotate(10deg); }
        @keyframes bob { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 3px)); } }
        .side-panel { padding: 18px; display: flex; flex-direction: column; gap: 18px; }.side-heading { display: flex; justify-content: space-between; align-items: center; }.side-heading h2 { margin: 0; font-size: 15px; }.side-heading span { color: #8e866e; font: 10px 'Space Mono'; }
        .inventory { background: #f6efd4; border: 1px solid #e2d3aa; border-radius: 15px; padding: 13px; }.inventory-title { display: flex; align-items: center; gap: 7px; color: #a36b2f; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }.scroll-row { display: flex; gap: 9px; margin-top: 11px; }.scroll-card { flex: 1; min-width: 0; border-radius: 10px; padding: 10px 6px; text-align: center; background: #fff9e6; border: 1px solid #ead6a4; color: #8a673b; }.scroll-card.empty { opacity: .55; border-style: dashed; }.scroll-card b { display: block; font: 700 13px 'Space Mono'; }.scroll-card span { display: block; font-size: 9px; margin-top: 3px; }
        .mini-map { height: 145px; background: #c9d795; border-radius: 14px; border: 1px solid #b7c27d; position: relative; overflow: hidden; }.mini-map:before { content: ''; position: absolute; left: 8%; right: 8%; top: 42%; height: 22%; border-radius: 50%; border: 10px solid rgba(255,248,208,.52); transform: rotate(-10deg); }.mini-map-line { position: absolute; left: 49%; top: -20%; width: 12%; height: 145%; background: rgba(83,164,183,.22); transform: rotate(14deg); }.mini-dot { position: absolute; width: 9px; height: 9px; border: 2px solid #fff8de; border-radius: 50%; box-shadow: 0 1px 3px #6d7e54; }.map-label { position: absolute; bottom: 8px; left: 10px; color: rgba(46,88,80,.65); font: 9px 'Space Mono'; }
        .feed { flex: 1; min-height: 150px; }.feed-title { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: #716b59; text-transform: uppercase; letter-spacing: .08em; }.feed ul { padding: 0; margin: 9px 0 0; list-style: none; display: grid; gap: 9px; }.feed li { font-size: 11px; line-height: 1.35; color: #5b655a; padding-left: 16px; position: relative; }.feed li:before { content: ''; position: absolute; left: 1px; top: 5px; width: 6px; height: 6px; background: #ef765e; border-radius: 2px; transform: rotate(45deg); }.feed li:first-child:before { background: #7b89e8; }.sync-button { width: 100%; border: 1px solid #d8ca9f; background: #fff9e9; color: #52706d; border-radius: 9px; padding: 9px; font: 700 10px 'Space Mono'; cursor: pointer; }.sync-button:hover { background: #f2e6bf; }
        .footer-note { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 5px 1px; color: #8c8269; font-size: 10px; }.footer-note svg { color: #52a887; }
        @media (max-width: 820px) { .tomat-shell { padding: 12px; }.match-layout { grid-template-columns: 1fr; }.side-panel { display: grid; grid-template-columns: 1fr 1fr; }.feed { min-height: unset; }.arena { min-height: 510px; } }
        @media (max-width: 520px) { .topbar { align-items: flex-start; }.top-actions .pill:first-child { display: none; }.brand h1 { font-size: 17px; }.match-head { padding-bottom: 10px; }.timer { font-size: 18px; }.scoreboard { gap: 8px; }.team-score { gap: 5px; font-size: 10px; }.team-score strong { font-size: 18px; }.score-line { max-width: 55px; }.versus { width: 29px; height: 29px; }.arena { min-height: 430px; border-width: 3px; }.base { transform: scale(.78); transform-origin: center; }.side-panel { display: flex; }.mini-map { height: 125px; } }
      `}</style>
      <header className="topbar">
        <div className="brand"><div className="brand-mark">T</div><div><h1>TOMAT</h1><p>Arena belajar bersama</p></div></div>
        <div className="top-actions"><div className="pill"><Clock3 size={14} /> Hari 11 <span style={{ color: "#b39a55" }}>•</span> Arena</div><div className="pill connected"><span className="live-dot" /> Terhubung <Wifi size={14} /></div></div>
      </header>
      <div className="match-layout">
        <section className="game-panel">
          <div className="match-head"><div className="phase"><span>Match #TMT-2048</span><b><Activity size={12} /> Berlangsung</b></div><div className="timer">{minute}:{second}<small>TERSISA</small></div></div>
          <div className="scoreboard">
            <div className="team-score"><strong>86</strong><span>Pijar</span><div className="score-line"><i /></div></div><div className="versus">VS</div><div className="team-score"><div className="score-line"><i /></div><span>Rona</span><strong>71</strong></div>
          </div>
          <div className="arena" role="img" aria-label="Arena pertandingan dua sisi TOMAT">
            <div className="river" /><div className="lane one" /><div className="lane two" /><div className="lane three" />
            <span className="lane-label top">Lajur Atas</span><span className="lane-label mid">Lajur Tengah</span><span className="lane-label bot">Lajur Bawah</span>
            <Base side="left" tower={86} score={86} /><Base side="right" tower={62} score={71} />
            {nodes.map((node, index) => <div key={index} className={`node ${node.difficulty} ${node.claimed ? "claimed" : ""}`} style={{ left: node.left, top: node.top }}><CircleHelp size={15} /><b>+{node.points}</b><span>{node.difficulty}</span></div>)}
            {pets.map((pet) => <PetToken key={pet.name} pet={pet} />)}
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 4, color: "rgba(42,103,104,.5)" }}><Gem size={19} /></div>
          </div>
          <div className="footer-note"><Radio size={13} /> State server terakhir diperbarui 2 dtk lalu <span>•</span> <Shield size={13} /> Tidak ada serangan antar Pet</div>
        </section>
        <aside className="side-panel">
          <div className="side-heading"><h2>Pos Komando</h2><span>2v2</span></div>
          <div className="inventory"><div className="inventory-title"><ScrollText size={15} /> Gulungan milikmu <span style={{ marginLeft: "auto", fontFamily: "'Space Mono'" }}>1 / 1</span></div><div className="scroll-row"><div className="scroll-card"><BookOpen size={16} /><b>+25</b><span>Sedang</span></div><div className="scroll-card empty"><Sparkles size={16} /><b>—</b><span>Slot kosong</span></div></div></div>
          <div className="side-heading"><h2>Peta arena</h2><span>langsung</span></div>
          <div className="mini-map"><div className="mini-map-line" /><span className="mini-dot" style={{ left: "16%", top: "48%", background: "#ef765e" }} /><span className="mini-dot" style={{ left: "30%", top: "31%", background: "#ef765e" }} /><span className="mini-dot" style={{ left: "68%", top: "49%", background: "#7b89e8" }} /><span className="mini-dot" style={{ left: "80%", top: "68%", background: "#7b89e8" }} /><span className="mini-dot" style={{ left: "52%", top: "56%", background: "#dfb04e" }} /><span className="map-label">semua posisi berasal dari snapshot</span></div>
          <div className="feed"><div className="feed-title"><Trophy size={15} /> Kilasan arena</div><ul>{feed.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul></div>
          <button className="sync-button" onClick={addEvent}><Wifi size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> Minta snapshot terbaru</button>
        </aside>
      </div>
    </main>
  );
}