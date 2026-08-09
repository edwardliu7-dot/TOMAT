import { useEffect, useState } from "react";
import {
  Bell, Bolt, ChevronRight, Coins, Compass, Crown, Settings2, Heart, Map,
  MessageCircle, Shield, Sparkles, Swords, Trophy, UserRound, X, RotateCw,
} from "lucide-react";

const quickActions = [
  { label: "Misi", note: "3 aktif", icon: Compass, tone: "coral" },
  { label: "Peringkat", note: "#12 kelas", icon: Crown, tone: "violet" },
  { label: "Koleksi", note: "8 item", icon: Shield, tone: "teal" },
  { label: "Teman", note: "2 online", icon: MessageCircle, tone: "gold" },
];

export default function MobileLandscapeDashboard() {
  const [portrait, setPortrait] = useState(false);
  const [notice, setNotice] = useState("");
  const [arenaOpen, setArenaOpen] = useState(false);
  const [activeAction, setActiveAction] = useState("Misi");
  const [notifications, setNotifications] = useState(2);

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth || window.innerWidth < 620);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  };

  if (portrait) {
    return (
      <main className="tomat-rotate">
        <style>{styles}</style>
        <div className="rotate-orbit orbit-a" /><div className="rotate-orbit orbit-b" />
        <div className="rotate-mark">T</div>
        <div className="rotate-phone"><div className="rotate-notch" /><div className="rotate-screen"><span>+</span><span>−</span><span>×</span></div></div>
        <RotateCw size={27} className="rotate-arrow" />
        <p className="rotate-kicker">TOMAT · PETUALANGAN BELAJAR</p>
        <h1>Putar perangkat<br />ke lanskap</h1>
        <p className="rotate-copy">Dunia TOMI menunggu di layar lebar. Miringkan perangkatmu untuk masuk ke cockpit permainan.</p>
        <div className="rotate-hint"><span /><span /><span /></div>
      </main>
    );
  }

  return (
    <main className="tomat-shell">
      <style>{styles}</style>
      <div className="world-image" />
      <div className="world-wash" />
      <div className="world-grid" />
      <header className="topbar">
        <div className="brand"><span className="brand-badge">T</span><div><strong>TOMAT</strong><small>SMARTISA · PETUALANGAN BELAJAR</small></div></div>
        <div className="resources">
          <span><Coins size={15} /> 385</span><span><Bolt size={15} /> 74 / 100</span>
          <button onClick={() => { setNotifications(0); toast("Semua notifikasi sudah dibaca"); }} aria-label="Notifikasi"><Bell size={17} />{notifications > 0 && <b>{notifications}</b>}</button>
           <button onClick={() => toast("Pengaturan cockpit dibuka")} aria-label="Pengaturan"><Settings2 size={17} /></button>
        </div>
      </header>

      <section className="profile-card">
        <div className="avatar"><span className="avatar-ear left" /><span className="avatar-ear right" /><div className="tomi-face"><i /><i /><em /></div><span className="avatar-scarf" /></div>
        <div className="profile-copy"><small>PEMAIN AKTIF</small><h2>Alif Fajar</h2><span>Penjelajah Pijar <strong>LV. 08</strong></span></div>
        <div className="level-track"><div><span>PROGRES LEVEL</span><b>1.240 / 1.500 XP</b></div><i><em /></i></div>
      </section>

      <section className="mission-card">
        <div className="eyebrow"><Sparkles size={13} /> MISI YANG DITUNGGU TOMI</div>
        <h1>Jejak Bilangan<br /><em>di Pulau Senja</em></h1>
        <p>Temukan pola bilangan untuk membuka gerbang arena berikutnya.</p>
        <div className="mission-progress"><span><b>3</b> dari 5 tantangan</span><strong>60%</strong><i><em /></i></div>
        <button onClick={() => toast("Misi dibuka — Tomi siap berangkat")} className="mission-link">LANJUTKAN MISI <ChevronRight size={15} /></button>
      </section>

      <div className="pet-stage">
        <div className="sun-ring" /><div className="pet-glow" />
        <div className="tomi-large"><span className="t-ear e1" /><span className="t-ear e2" /><div className="tomi-head"><div className="t-eye te1" /><div className="t-eye te2" /><span className="tomi-mouth" /><span className="tomi-blush b1" /><span className="tomi-blush b2" /></div><div className="tomi-body"><span /></div>
        </div>
        <div className="pet-caption"><span>TOMI</span><small>teman belajar level 08</small></div>
        <div className="floating-chip chip-one"><Heart size={12} /> 94 energi</div><div className="floating-chip chip-two"><Sparkles size={12} /> siap menjelajah</div>
      </div>

      <aside className="action-rail">
        <div className="rail-label">AKSI CEPAT</div>
        {quickActions.map(({ label, note, icon: Icon, tone }) => (
          <button key={label} className={`rail-action ${tone} ${activeAction === label ? "selected" : ""}`} onClick={() => { setActiveAction(label); toast(`${label}: ${note}`); }}>
            <span><Icon size={19} /></span><div><strong>{label}</strong><small>{note}</small></div>
          </button>
        ))}
      </aside>

      <div className="arena-wrap">
        <button className={`arena-cta ${arenaOpen ? "entered" : ""}`} onClick={() => { setArenaOpen((value) => !value); toast(arenaOpen ? "Kembali ke cockpit" : "Arena dibuka — pilih tantanganmu"); }}>
          <span className="cta-icon">{arenaOpen ? <Map size={22} /> : <Swords size={22} />}</span><span><small>{arenaOpen ? "KEMBALI KE PETA" : "TANTANGAN HARI INI"}</small><strong>{arenaOpen ? "LIHAT PETA" : "MASUK ARENA"}</strong></span><ChevronRight size={20} />
        </button>
      </div>
      <div className="bottom-status"><span className="online-dot" /> TOMI ONLINE <i /> SERVER PULAU SENJA <span className="coords">SEKTOR 04 · 16:42</span></div>
      {notice && <div className="toast"><Sparkles size={14} />{notice}<button onClick={() => setNotice("")}><X size={13} /></button></div>}
    </main>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{box-sizing:border-box}html,body,#root{margin:0;min-width:100%;min-height:100%;overflow:hidden}button{font:inherit}
.tomat-shell{position:relative;isolation:isolate;min-height:100dvh;overflow:hidden;background:#153e49;color:#fff6d8;font-family:'DM Sans',sans-serif}
.world-image{position:absolute;inset:0;background:url('/__mockup/images/OIP_(1)_1786204149155.webp') center/cover no-repeat;filter:saturate(.8) contrast(1.08);transform:scale(1.08)}
.world-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,35,48,.94) 0%,rgba(14,47,57,.76) 27%,rgba(19,68,73,.27) 62%,rgba(12,31,46,.72) 100%),linear-gradient(0deg,rgba(8,28,40,.84),transparent 54%,rgba(13,39,56,.32))}
.world-grid{position:absolute;inset:0;opacity:.16;background-image:linear-gradient(rgba(222,225,175,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(222,225,175,.3) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(90deg,#000,transparent 85%)}
.topbar{position:absolute;z-index:5;left:3.5%;right:3.5%;top:4.2%;display:flex;justify-content:space-between;align-items:center}.brand{display:flex;gap:10px;align-items:center}.brand-badge,.rotate-mark{display:grid;place-items:center;width:39px;height:39px;border-radius:13px 13px 13px 4px;background:#eb765c;color:#fff1c6;font:800 20px 'Space Mono';box-shadow:4px 5px 0 rgba(8,30,39,.3)}.brand strong{display:block;letter-spacing:.2em;font-size:15px}.brand small{display:block;margin-top:2px;color:#bcd0b5;font:700 7px 'Space Mono';letter-spacing:.08em}.resources{display:flex;align-items:center;gap:8px}.resources>span,.resources button{height:34px;padding:0 11px;display:flex;align-items:center;gap:6px;border:1px solid rgba(251,226,160,.25);border-radius:10px;background:rgba(12,46,57,.72);color:#f9dc91;font:700 10px 'Space Mono';backdrop-filter:blur(9px)}.resources>span:nth-child(2){color:#8fe1c8}.resources button{position:relative;width:35px;padding:0;justify-content:center;color:#e4e7c0;cursor:pointer}.resources button:hover{background:#327b78;transform:translateY(-2px)}.resources b{position:absolute;right:-3px;top:-5px;display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background:#ee775c;color:#fff3cf;font-size:8px}
.profile-card{position:absolute;z-index:4;left:3.5%;top:16%;width:min(31vw,355px);padding:14px;border:1px solid rgba(255,225,159,.3);border-radius:15px;background:rgba(12,43,52,.78);box-shadow:0 15px 30px rgba(2,25,35,.3);backdrop-filter:blur(12px);display:flex;align-items:center;gap:10px}.avatar{position:relative;width:55px;height:55px;flex:none;display:grid;place-items:center}.tomi-face{position:relative;width:43px;height:42px;background:#e98563;border:2px solid #ffdc9e;border-radius:47% 47% 42% 42%;box-shadow:inset 0 -4px #c85f59}.tomi-face i{position:absolute;top:14px;width:5px;height:7px;border-radius:50%;background:#263f4a}.tomi-face i:first-child{left:11px}.tomi-face i:nth-child(2){right:11px}.tomi-face em{position:absolute;bottom:8px;left:17px;width:8px;height:4px;border-bottom:2px solid #724654;border-radius:50%}.avatar-ear{position:absolute;top:3px;width:18px;height:22px;background:#df755f;border:2px solid #ffdba0;border-radius:65% 25%}.avatar-ear.left{left:4px;transform:rotate(-22deg)}.avatar-ear.right{right:4px;transform:scaleX(-1) rotate(-22deg)}.avatar-scarf{position:absolute;bottom:1px;width:34px;height:8px;border-radius:4px;background:#5bc0ad}.profile-copy{min-width:88px}.profile-copy small,.level-track span{color:#aec9b3;font:700 8px 'Space Mono';letter-spacing:.1em}.profile-copy h2{margin:3px 0;font-size:15px}.profile-copy span{color:#c6d7c1;font-size:10px}.profile-copy strong{margin-left:4px;padding:3px 5px;border-radius:4px;background:#e6af5b;color:#4e3641;font:700 8px 'Space Mono'}.level-track{flex:1;align-self:end}.level-track div,.mission-progress{display:flex;justify-content:space-between;align-items:center}.level-track b{font:700 8px 'Space Mono';color:#f0cf87}.level-track>i,.mission-progress>i{display:block;height:5px;margin-top:6px;overflow:hidden;border-radius:99px;background:rgba(232,220,170,.2)}.level-track em{display:block;width:82%;height:100%;background:#e9a85b;border-radius:inherit}
.mission-card{position:absolute;z-index:4;left:3.5%;bottom:15%;width:min(32vw,365px);padding:16px 17px;border:1px solid rgba(255,220,151,.35);border-radius:17px;background:linear-gradient(135deg,rgba(22,71,72,.9),rgba(14,45,59,.86));box-shadow:0 18px 38px rgba(3,27,37,.33);backdrop-filter:blur(10px)}.mission-card:after{content:"";position:absolute;right:-25px;top:-27px;width:100px;height:100px;border:13px solid rgba(232,172,101,.1);border-radius:50%}.eyebrow{display:flex;gap:6px;align-items:center;color:#f4c570;font:700 8px 'Space Mono';letter-spacing:.1em}.mission-card h1{margin:9px 0 5px;font-size:clamp(18px,2.2vw,27px);line-height:1.04;letter-spacing:-.04em}.mission-card h1 em{color:#ffb991;font-style:normal}.mission-card p{max-width:270px;margin:0;color:#c4d1bb;font-size:10px;line-height:1.45}.mission-progress{position:relative;margin-top:13px;font-size:9px;color:#b8cdb5}.mission-progress b{color:#f6d28a}.mission-progress strong{color:#f1b980;font:700 9px 'Space Mono'}.mission-progress>i{position:absolute;left:0;right:0;bottom:-9px}.mission-progress em{display:block;width:60%;height:100%;background:#e98368}.mission-link{display:flex;align-items:center;gap:3px;margin-top:21px;padding:0;border:0;background:none;color:#fff0bd;font:800 9px 'Space Mono';cursor:pointer}.mission-link:hover{color:#ffad89;gap:7px}
.pet-stage{position:absolute;z-index:3;left:36%;right:24%;top:21%;bottom:10%;display:grid;place-items:center}.sun-ring{position:absolute;width:min(35vw,390px);height:min(35vw,390px);border:1px solid rgba(255,218,151,.3);border-radius:50%;box-shadow:0 0 0 24px rgba(255,208,135,.06),0 0 0 54px rgba(255,208,135,.04)}.pet-glow{position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(239,131,100,.22);filter:blur(35px);animation:breathe 4s ease-in-out infinite}.tomi-large{position:relative;width:170px;height:190px;animation:float 4s ease-in-out infinite}.tomi-head{position:absolute;z-index:2;left:28px;top:18px;width:114px;height:108px;border:4px solid #ffe0a1;border-radius:48% 48% 45% 45%;background:#e87b60;box-shadow:inset 0 -11px rgba(184,74,76,.23),0 13px 0 rgba(12,43,49,.3)}.t-ear{position:absolute;z-index:1;top:0;width:43px;height:63px;border:4px solid #ffe0a1;border-radius:67% 28%;background:#d9675a}.t-ear.e1{left:7px;transform:rotate(-21deg)}.t-ear.e2{right:7px;transform:scaleX(-1) rotate(-21deg)}.t-eye{position:absolute;top:38px;width:12px;height:16px;border-radius:50%;background:#254552}.te1{left:28px}.te2{right:28px}.tomi-mouth{position:absolute;left:47px;top:66px;width:22px;height:11px;border-bottom:3px solid #753f4c;border-radius:50%}.tomi-blush{position:absolute;top:61px;width:15px;height:7px;background:#f7a177;border-radius:50%;opacity:.8}.b1{left:12px}.b2{right:12px}.tomi-body{position:absolute;left:45px;bottom:0;width:80px;height:85px;border:4px solid #ffe0a1;border-radius:45% 45% 28% 28%;background:#52b7a5;box-shadow:inset 0 -12px rgba(27,112,111,.25),0 13px 0 rgba(12,43,49,.3)}.tomi-body:before,.tomi-body:after{content:"";position:absolute;bottom:5px;width:19px;height:32px;border:3px solid #ffe0a1;border-radius:50%;background:#e57e61}.tomi-body:before{left:-14px;transform:rotate(18deg)}.tomi-body:after{right:-14px;transform:rotate(-18deg)}.tomi-body span{position:absolute;left:30px;top:18px;width:18px;height:24px;border:3px solid #ffe0a1;border-radius:50%;background:#eeaf64}.pet-caption{position:absolute;bottom:1%;display:flex;flex-direction:column;align-items:center}.pet-caption span{font:800 17px 'Space Mono';letter-spacing:.18em;color:#ffe6a7}.pet-caption small{color:#bdd0b8;font-size:9px}.floating-chip{position:absolute;display:flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid rgba(255,227,161,.28);border-radius:999px;background:rgba(13,49,59,.74);color:#e8dbad;font:700 9px 'Space Mono';backdrop-filter:blur(9px)}.chip-one{right:3%;top:32%;color:#ffb69a}.chip-two{left:3%;bottom:24%;color:#9ddfca}.action-rail{position:absolute;z-index:4;right:3.5%;top:22%;bottom:14%;width:156px;display:flex;flex-direction:column;gap:8px}.rail-label{margin-bottom:2px;color:#d3d7b1;font:700 8px 'Space Mono';letter-spacing:.15em}.rail-action{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid rgba(242,222,162,.18);border-radius:12px;background:rgba(11,44,55,.72);color:#e8e5c7;text-align:left;cursor:pointer;backdrop-filter:blur(9px);transition:.2s}.rail-action:hover,.rail-action.selected{transform:translateX(-4px);border-color:rgba(255,196,125,.7);background:rgba(43,94,91,.87)}.rail-action>span{display:grid;place-items:center;width:31px;height:31px;border-radius:9px}.rail-action.coral>span{background:rgba(231,117,91,.25);color:#ffa489}.rail-action.violet>span{background:rgba(128,116,201,.28);color:#c2b9ff}.rail-action.teal>span{background:rgba(75,184,163,.25);color:#91e4c8}.rail-action.gold>span{background:rgba(228,178,83,.23);color:#f3cf86}.rail-action strong,.rail-action small{display:block}.rail-action strong{font-size:10px}.rail-action small{margin-top:2px;color:#a7c1b1;font-size:8px}.arena-wrap{position:absolute;z-index:5;right:3.5%;bottom:10%;}.arena-cta{display:flex;align-items:center;gap:11px;min-width:205px;padding:10px 12px;border:1px solid #ffd994;border-radius:14px;background:linear-gradient(135deg,#eb765d,#ce5d5c);color:#fff3cc;box-shadow:0 10px 0 rgba(104,48,56,.38),0 18px 30px rgba(7,28,37,.35);cursor:pointer;transition:.2s}.arena-cta:hover{transform:translateY(-4px);filter:saturate(1.12)}.arena-cta:active{transform:translateY(2px);box-shadow:0 5px 0 rgba(104,48,56,.38)}.arena-cta.entered{background:linear-gradient(135deg,#398e88,#27736f)}.cta-icon{display:grid;place-items:center;width:37px;height:37px;border-radius:10px;background:rgba(255,244,197,.2)}.arena-cta small,.arena-cta strong{display:block;text-align:left}.arena-cta small{font:700 7px 'Space Mono';letter-spacing:.08em;color:#ffe2a7}.arena-cta strong{margin-top:2px;font:800 15px 'Space Mono'}.bottom-status{position:absolute;z-index:5;bottom:3%;left:3.5%;color:#a9c8b3;font:700 8px 'Space Mono';letter-spacing:.08em}.bottom-status i{display:inline-block;width:3px;height:3px;margin:0 9px;border-radius:50%;background:#e7bd73;vertical-align:middle}.online-dot{display:inline-block;width:6px;height:6px;margin-right:5px;border-radius:50%;background:#6ce0b4;box-shadow:0 0 8px #6ce0b4}.coords{margin-left:18px;color:#789a91}.toast{position:absolute;z-index:20;left:50%;bottom:5%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:10px 13px;border:1px solid rgba(255,224,157,.35);border-radius:999px;background:rgba(10,42,52,.92);color:#f7e8bb;font-size:10px;box-shadow:0 12px 27px rgba(1,23,31,.35);animation:in .25s ease}.toast svg{color:#f2b875}.toast button{display:grid;place-items:center;padding:0;border:0;background:none;color:#a8c6b6;cursor:pointer}
.tomat-rotate{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;overflow:hidden;background:#103e49;color:#fff4d1;text-align:center;font-family:'DM Sans',sans-serif}.tomat-rotate:before{content:"";position:absolute;inset:0;opacity:.22;background-image:radial-gradient(#f6d78d 1px,transparent 1px);background-size:22px 22px}.rotate-mark{position:absolute;top:8%;left:8%;width:43px;height:43px}.rotate-orbit{position:absolute;border:1px solid rgba(248,203,131,.22);border-radius:50%}.orbit-a{width:290px;height:290px;top:-80px;right:-100px}.orbit-b{width:230px;height:230px;bottom:-70px;left:-90px;border-color:rgba(109,213,183,.2)}.rotate-phone{position:relative;width:98px;height:166px;margin-bottom:22px;border:3px solid #ffda98;border-radius:18px;background:#1d6b70;box-shadow:11px 12px 0 rgba(5,29,39,.26);transform:rotate(-18deg);animation:tilt 3.4s ease-in-out infinite}.rotate-notch{position:absolute;top:8px;left:35px;width:25px;height:5px;border-radius:9px;background:#ffda98}.rotate-screen{position:absolute;inset:25px 9px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;border-radius:10px;background:linear-gradient(#46a99a,#2e7978);color:#fbd68c;font:700 19px 'Space Mono'}.rotate-arrow{position:absolute;top:38%;right:22%;color:#e9866b;animation:arrow 1.5s ease-in-out infinite}.rotate-kicker{margin:0;color:#83d0b2;font:700 8px 'Space Mono';letter-spacing:.18em}.tomat-rotate h1{margin:8px 0 8px;font-size:clamp(26px,8vw,40px);line-height:1.01;letter-spacing:-.05em}.rotate-copy{max-width:270px;margin:0;color:#bbd2bc;font-size:12px;line-height:1.45}.rotate-hint{display:flex;gap:5px;margin-top:20px}.rotate-hint span{width:5px;height:5px;border-radius:50%;background:#edaa69}.rotate-hint span:nth-child(2){background:#e77b62}.rotate-hint span:nth-child(3){background:#68c4ac}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes breathe{0%,100%{transform:scale(.9);opacity:.65}50%{transform:scale(1.08);opacity:1}}@keyframes in{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes tilt{0%,100%{transform:rotate(-18deg) translateY(0)}50%{transform:rotate(-18deg) translateY(-7px)}}@keyframes arrow{0%,100%{transform:rotate(0) translateX(0)}50%{transform:rotate(90deg) translateX(5px)}}
@media(max-width:860px) and (orientation:landscape){.topbar{top:3%;left:2.5%;right:2.5%}.brand small{display:none}.resources>span{padding:0 7px}.profile-card{left:2.5%;top:14%;width:33vw;transform:scale(.88);transform-origin:left top}.mission-card{left:2.5%;bottom:12%;width:34vw;transform:scale(.88);transform-origin:left bottom}.pet-stage{left:34%;right:22%;top:18%;bottom:7%}.action-rail{right:2.5%;top:17%;bottom:12%;width:130px;gap:5px}.rail-action{padding:7px}.rail-action>span{width:27px;height:27px}.arena-wrap{right:2.5%;bottom:6%}.bottom-status{left:2.5%;bottom:2%;font-size:7px}.coords{display:none}}
`;