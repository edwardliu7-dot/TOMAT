import { useEffect, useState } from "react";
import { LoaderCircle, LockKeyhole, Swords, Wifi } from "lucide-react";
import "./battle-loading.css";

type Player = {
  name: string;
  pet: string;
  tone: string;
  ready: boolean;
  self?: boolean;
};

const leftTeam: Player[] = [
  { name: "Alya", pet: "Tomi", tone: "#f17b5c", ready: true, self: true },
  { name: "Bimo", pet: "Monyang", tone: "#e6ab42", ready: true },
  { name: "Salsa", pet: "Kelinsay", tone: "#ef9d81", ready: true },
];

const rightTeam: Player[] = [
  { name: "Nisa", pet: "Kelinsay", tone: "#7887dd", ready: true },
  { name: "Raka", pet: "Nananaga", tone: "#38aaa1", ready: true },
  { name: "Dito", pet: "Tomi", tone: "#9a7fd3", ready: true },
];

function PetBadge({ player }: { player: Player }) {
  return (
    <div className={`battle-pet ${player.self ? "is-self" : ""}`} style={{ "--pet-tone": player.tone } as React.CSSProperties}>
      <span className="battle-pet__halo" />
      <span className="battle-pet__ear battle-pet__ear--left" />
      <span className="battle-pet__ear battle-pet__ear--right" />
      <span className="battle-pet__face">
        <i className="battle-pet__eye battle-pet__eye--left" />
        <i className="battle-pet__eye battle-pet__eye--right" />
        <b>{player.pet.slice(0, 1)}</b>
      </span>
      <span className="battle-pet__spark battle-pet__spark--one">✦</span>
      <span className="battle-pet__spark battle-pet__spark--two">·</span>
    </div>
  );
}

function PlayerCard({ player, side }: { player: Player; side: "left" | "right" }) {
  return (
    <div className={`player-card player-card--${side} ${player.self ? "is-self" : ""}`}>
      <PetBadge player={player} />
      <div className="player-card__copy">
        <strong>{player.name}{player.self ? <em>kamu</em> : null}</strong>
        <span>{player.pet}</span>
      </div>
      <div className={`ready-dot ${player.ready ? "is-ready" : ""}`} aria-label={player.ready ? "Siap" : "Memuat"} />
    </div>
  );
}

function TeamColumn({ team, side, players }: { team: string; side: "left" | "right"; players: Player[] }) {
  return (
    <section className={`team-column team-column--${side}`}>
      <div className="team-column__heading">
        <div>
          <span className="eyebrow">TIM {side === "left" ? "MERAH" : "BIRU"}</span>
          <h2>{team}</h2>
        </div>
        <span className="team-count">{players.length}/3</span>
      </div>
      <div className="team-column__players">
        {players.map((player) => <PlayerCard key={player.name} player={player} side={side} />)}
      </div>
      <div className="team-column__line" />
      <span className="team-column__status">Semua pemain siap</span>
    </section>
  );
}

export function BattleLoading() {
  const [progress, setProgress] = useState(67);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 96 ? 67 : value + 1));
      setPulse((value) => !value);
    }, 1100);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="battle-loading">
      <div className="battle-loading__grain" />
      <div className="battle-loading__glow battle-loading__glow--left" />
      <div className="battle-loading__glow battle-loading__glow--right" />
      <div className="battle-loading__grid" />

      <header className="battle-header">
        <div className="battle-brand">
          <div className="battle-brand__mark">T</div>
          <div>
            <strong>SMARTISA</strong>
            <span>TOMAT · ARENA</span>
          </div>
        </div>
        <div className="battle-connection"><Wifi size={13} /> KONEKSI AMAN</div>
        <div className="battle-header__mode"><span>MODE</span><b>3 V 3</b></div>
      </header>

      <div className="battle-content">
        <div className="battle-kicker"><span /> MATCH DITEMUKAN <span /></div>
        <h1>SIAPKAN PETMU</h1>
        <p className="battle-subtitle">Pertempuran matematika akan segera dimulai</p>

        <div className="battle-versus">
          <TeamColumn team="Pijar" side="left" players={leftTeam} />
          <div className="versus-core">
            <div className="versus-core__ring versus-core__ring--outer" />
            <div className="versus-core__ring versus-core__ring--inner" />
            <div className="versus-core__mark"><Swords size={22} /></div>
            <span className="versus-core__text">VS</span>
          </div>
          <TeamColumn team="Rona" side="right" players={rightTeam} />
        </div>

        <div className="battle-progress">
          <div className="battle-progress__top">
            <span><LoaderCircle size={14} className={pulse ? "is-pulsing" : ""} /> MENYIAPKAN ARENA</span>
            <b>{progress}%</b>
          </div>
          <div className="battle-progress__track"><i style={{ width: `${progress}%` }} /></div>
          <div className="battle-progress__meta"><span>Memuat arena hutan</span><span>80.000 × 80.000</span></div>
        </div>

        <div className="battle-tip">
          <LockKeyhole size={14} />
          <span><b>Tips arena:</b> jawab soal dengan benar untuk mengumpulkan gulungan dan hancurkan markas lawan.</span>
        </div>
      </div>

      <footer className="battle-footer">
        <span>Jangan tutup halaman ini</span>
        <span className="battle-footer__dots"><i /><i /><i /></span>
        <span>Pet-mu sedang memasang perlengkapan</span>
      </footer>
    </main>
  );
}
