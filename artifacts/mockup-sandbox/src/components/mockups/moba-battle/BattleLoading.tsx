import { useEffect, useMemo, useState } from "react";
import { Clock3, LockKeyhole, Map, Shield, Sparkles, Wifi, Zap } from "lucide-react";
import "./battle-loading.css";

type Side = "pijar" | "rona";

type Player = {
  name: string;
  pet: string;
  skin: string;
  side: Side;
  tone: string;
  icon: string;
  start: number;
  self?: boolean;
};

const players: Player[] = [
  { name: "Alya", pet: "Tomi", skin: "Golden", side: "pijar", tone: "#dd7659", icon: "T", start: 42, self: true },
  { name: "Bimo", pet: "Monyang", skin: "Raja", side: "pijar", tone: "#d59c42", icon: "M", start: 66 },
  { name: "Salsa", pet: "Kelinsay", skin: "Senja", side: "pijar", tone: "#d96c76", icon: "K", start: 83 },
  { name: "Nisa", pet: "Kelinsay", skin: "Malam", side: "rona", tone: "#7687db", icon: "K", start: 57 },
  { name: "Raka", pet: "Nananaga", skin: "Es", side: "rona", tone: "#34a9a0", icon: "N", start: 74 },
  { name: "Dito", pet: "Tomi", skin: "Void", side: "rona", tone: "#9677cc", icon: "T", start: 91 },
];

function PetIcon({ player }: { player: Player }) {
  return (
    <div className="loading-pet" style={{ "--pet-tone": player.tone } as React.CSSProperties}>
      <span className="loading-pet__ring" />
      <span className="loading-pet__ear loading-pet__ear--left" />
      <span className="loading-pet__ear loading-pet__ear--right" />
      <span className="loading-pet__face">
        <i className="loading-pet__eye loading-pet__eye--left" />
        <i className="loading-pet__eye loading-pet__eye--right" />
        <b>{player.icon}</b>
      </span>
    </div>
  );
}

function PlayerRow({ player, progress }: { player: Player; progress: number }) {
  const isDone = progress >= 100;
  return (
    <div
      className={`loading-player loading-player--${player.side} ${player.self ? "is-self" : ""} ${isDone ? "is-ready" : ""}`}
      aria-label={`${player.name}, ${isDone ? "siap" : `memuat ${progress}%`}`}
    >
      <div className="loading-player__identity">
        <PetIcon player={player} />
        <div>
          <strong>{player.name}{player.self ? <em>kamu</em> : null}</strong>
          <span>{player.pet} · {player.skin}</span>
        </div>
      </div>
      <div className="loading-player__meter">
        <div className="loading-player__meter-top">
          <span>{isDone ? "Siap" : "Memuat arena..."}</span>
          <b>{progress}%</b>
        </div>
        <div className="loading-player__track">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
       <span className={`loading-player__status ${isDone ? "is-done" : ""}`} aria-label={isDone ? "Siap" : "Memuat"}>
        {isDone ? "✓" : `${progress}`}
      </span>
    </div>
  );
}

function TeamPanel({ side, progress }: { side: Side; progress: number[] }) {
  const teamPlayers = players.filter((player) => player.side === side);
  const average = Math.round(progress.reduce((sum, value) => sum + value, 0) / progress.length);
  return (
    <section className={`loading-team loading-team--${side}`}>
      <header className="loading-team__header">
        <div>
          <span className="loading-team__eyebrow">{side === "pijar" ? "TIM MERAH" : "TIM BIRU"}</span>
          <h2>{side === "pijar" ? "Pijar" : "Rona"}</h2>
        </div>
        <span className="loading-team__average">{average}%</span>
      </header>
      <div className="loading-team__rows">
        {teamPlayers.map((player, index) => (
          <PlayerRow key={player.name} player={player} progress={progress[index]} />
        ))}
      </div>
    </section>
  );
}

export function BattleLoading() {
  const [progress, setProgress] = useState(players.map((player) => player.start));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => current.map((value, index) => {
        const step = index === 0 ? 3 : index % 2 === 0 ? 2 : 1;
        return Math.min(100, value + step);
      }));
    }, 820);
    return () => window.clearInterval(timer);
  }, []);

  const loadedCount = progress.filter((value) => value >= 100).length;
  const allLoaded = loadedCount === players.length;
  const overall = useMemo(
    () => Math.round(progress.reduce((sum, value) => sum + value, 0) / progress.length),
    [progress],
  );

  return (
    <main className="battle-loading">
      <div className="battle-loading__topline" />
      <header className="loading-header">
        <div className="loading-brand">
          <div className="loading-brand__mark">T</div>
          <div>
            <strong>TOMAT</strong>
            <span>ARENA BATTLE</span>
          </div>
        </div>
        <div className="loading-header__match">
          <span>MATCH DITEMUKAN</span>
          <b>HUTAN · 3V3</b>
        </div>
        <div className="loading-network"><Wifi size={13} /> ONLINE</div>
      </header>

      <div className="loading-content">
        <div className="loading-title">
          <span className="loading-title__line" />
          <div>
            <span className="loading-title__eyebrow">MEMASUKI PERTEMPURAN</span>
            <h1>Memuat arena</h1>
          </div>
          <span className="loading-title__line loading-title__line--right" />
        </div>

        <div className="loading-stage">
          <TeamPanel side="pijar" progress={progress.slice(0, 3)} />
          <div className="loading-vs">
            <div className="loading-vs__orbit loading-vs__orbit--outer" />
            <div className="loading-vs__orbit loading-vs__orbit--inner" />
            <div className="loading-vs__circle">
              <span>VS</span>
              <small>3V3</small>
            </div>
            <div className="loading-vs__arena">
              <span><Map size={11} /> HUTAN LUMUT</span>
              <span><Zap size={10} /> 3 LANE</span>
            </div>
            <span className="loading-vs__label">TIM LAWAN</span>
          </div>
          <TeamPanel side="rona" progress={progress.slice(3)} />
        </div>

        <div className="loading-summary" aria-live="polite">
          <div className="loading-summary__copy">
            <LockKeyhole size={15} />
            <div>
              <strong>{allLoaded ? "Semua pemain siap" : "Arena terkunci"}</strong>
              <span>{allLoaded ? "Pertempuran dimulai..." : "Tunggu semua pemain selesai memuat arena"}</span>
            </div>
          </div>
          <div className="loading-summary__overall">
            <span><Shield size={13} /> {loadedCount}/{players.length} SIAP</span>
            <b>{overall}%</b>
          </div>
        </div>
        <div className="loading-overall-track"><i style={{ width: `${overall}%` }} /></div>
        <div className="loading-meta">
          <span><Clock3 size={12} /> PERTANDINGAN DIMULAI OTOMATIS</span>
          <span><Sparkles size={12} /> SEMUA PET TERKUNCI SAAT MASUK</span>
        </div>
      </div>

      <footer className="loading-footer">
        <span>Jangan tutup halaman ini</span>
        <span className="loading-footer__center">Arena akan dimulai otomatis saat semua pemain mencapai 100%</span>
        <span>80.000 × 80.000 · TILE 16</span>
      </footer>
    </main>
  );
}
