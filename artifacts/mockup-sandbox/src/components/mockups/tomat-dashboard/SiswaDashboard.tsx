import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Coins,
  Compass,
  Flame,
  GraduationCap,
  LockKeyhole,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

type Zone = {
  number: string;
  title: string;
  subject: string;
  description: string;
  progress: number;
  color: string;
  icon: React.ElementType;
  locked?: boolean;
  detail: string;
};

const zones: Zone[] = [
  {
    number: "01",
    title: "Gerbang Bilangan",
    subject: "Matematika · Kelas VII",
    description: "Bangun fondasi logika dan taklukkan bilangan bulat.",
    progress: 68,
    color: "cyan",
    icon: Compass,
    detail: "7 dari 10 misi selesai",
  },
  {
    number: "02",
    title: "Hutan Ekosistem",
    subject: "IPA · Kelas VII",
    description: "Ikuti jejak makhluk hidup dan jaga keseimbangan alam.",
    progress: 34,
    color: "indigo",
    icon: Sparkles,
    detail: "4 dari 12 misi selesai",
  },
  {
    number: "03",
    title: "Observatorium Kata",
    subject: "Bahasa Indonesia · Kelas VII",
    description: "Temukan cerita, susun gagasan, dan bicara lebih berani.",
    progress: 0,
    color: "slate",
    icon: Star,
    locked: true,
    detail: "Selesaikan 2 misi lagi untuk membuka",
  },
];

const quickLinks = [
  { label: "Nilai", sublabel: "Rekap belajarmu", icon: GraduationCap, accent: "text-cyan-300", bg: "bg-cyan-400/10" },
  { label: "Chat", sublabel: "Tanya guru", icon: MessageCircle, accent: "text-indigo-300", bg: "bg-indigo-400/10" },
  { label: "Toko", sublabel: "385 koin tersedia", icon: ShoppingBag, accent: "text-amber-300", bg: "bg-amber-400/10" },
  { label: "Lencana", sublabel: "12 koleksi", icon: Award, accent: "text-rose-300", bg: "bg-rose-400/10" },
];

export default function SiswaDashboard() {
  const [activeNav, setActiveNav] = useState("Perjalanan");
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [missionStarted, setMissionStarted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const handleNav = (label: string) => {
    setActiveNav(label);
    if (label !== "Perjalanan") showNotice(`${label} sedang disiapkan untukmu.`);
  };

  return (
    <main className="min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-slate-100 selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-cyan-500/[0.08] blur-[110px]" />
        <div className="absolute -right-40 top-[38%] h-[580px] w-[580px] rounded-full bg-indigo-500/[0.10] blur-[130px]" />
        <div className="absolute bottom-[-280px] left-[35%] h-[520px] w-[520px] rounded-full bg-sky-500/[0.06] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#b8deef 0.65px, transparent 0.65px)", backgroundSize: "23px 23px" }} />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1440px]">
        <aside className="hidden w-[222px] shrink-0 flex-col border-r border-white/[0.07] bg-[#091827]/80 px-5 py-7 backdrop-blur-xl lg:flex">
          <div className="mb-12 flex items-center gap-3 px-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br from-cyan-300 to-indigo-500 text-[#071321] shadow-[0_10px_30px_rgba(45,212,191,0.18)]">
              <Target size={21} strokeWidth={2.7} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#091827] bg-amber-300" />
            </div>
            <div>
              <div className="font-black tracking-[0.18em] text-white">TOMAT</div>
              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">Ruang Tumbuh</div>
            </div>
          </div>
          <nav className="space-y-2" aria-label="Navigasi utama">
            {[
              { label: "Perjalanan", icon: Compass },
              { label: "Kelas Saya", icon: BookOpen },
              { label: "Pencapaian", icon: Trophy },
            ].map(({ label, icon: Icon }) => {
              const isActive = activeNav === label;
              return (
                <button
                  key={label}
                  onClick={() => handleNav(label)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-semibold transition-all ${isActive ? "bg-cyan-300/[0.12] text-cyan-200 ring-1 ring-cyan-300/20" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"}`}
                >
                  <Icon size={17} className={isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"} />
                  {label}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-400/[0.13] to-cyan-400/[0.06] p-4">
            <div className="mb-2 flex items-center gap-2 text-cyan-200">
              <CircleHelp size={15} />
              <span className="text-[11px] font-bold">Butuh bantuan?</span>
            </div>
            <p className="mb-3 text-[10px] leading-relaxed text-slate-400">Teman belajar TOMAT siap menemanimu.</p>
            <button onClick={() => showNotice("Pesan bantuan sudah dikirim ke guru pendamping.")} className="text-[10px] font-bold text-cyan-300 transition-colors hover:text-cyan-100">
              Hubungi pendamping <ArrowRight size={12} className="ml-1 inline" />
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 pb-12 sm:px-7 lg:px-10">
          <header className="flex items-center justify-between border-b border-white/[0.07] py-4 sm:py-5">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-indigo-500 text-[#071321]"><Target size={19} /></div>
              <span className="font-black tracking-[0.14em]">TOMAT</span>
            </div>
            <div className="hidden text-[11px] font-semibold text-slate-500 lg:block">
              Selasa, 12 Maret 2024 <span className="mx-2 text-slate-700">/</span> Semester Genap
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.07] px-3 py-2 sm:flex">
                <Coins size={15} className="text-amber-300" />
                <span className="text-[11px] font-bold text-amber-200">385</span>
              </div>
              <button onClick={() => showNotice("Belum ada kabar baru hari ini.")} aria-label="Notifikasi" className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-slate-400 transition-colors hover:bg-white/[0.09] hover:text-white">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
              </button>
              <button onClick={() => showNotice("Profil Ahmad dibuka.")} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1.5 pr-2.5 transition-colors hover:bg-white/[0.09]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-200 to-indigo-500 text-sm font-black text-[#092034]">AF</span>
                <span className="hidden text-[11px] font-bold text-slate-200 sm:block">Ahmad Fauzi</span>
                <ChevronRight size={14} className="rotate-90 text-slate-500" />
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1120px] pt-7 sm:pt-9">
            <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">PETA PERJALANANMU</p>
                <h1 className="text-[28px] font-black tracking-[-0.035em] text-white sm:text-[34px]">Halo, Ahmad. <span className="text-slate-400">Siap menjelajah?</span></h1>
                <p className="mt-2 text-[13px] text-slate-400">Satu langkah kecil hari ini membawa kamu lebih dekat ke tujuan.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300"><Flame size={19} fill="currentColor" /></div>
                <div>
                  <div className="text-sm font-black text-white">7 hari</div>
                  <div className="text-[10px] text-slate-500">streak belajar</div>
                </div>
                <div className="ml-2 h-7 w-px bg-white/10" />
                <div className="text-right">
                  <div className="text-sm font-black text-cyan-200">+120 XP</div>
                  <div className="text-[10px] text-slate-500">minggu ini</div>
                </div>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-[24px] border border-cyan-300/20 bg-gradient-to-br from-[#102e42] via-[#0c2539] to-[#151b47] p-5 shadow-[0_22px_70px_rgba(3,16,38,0.35)] sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[34px] border-cyan-300/[0.07]" />
              <div className="pointer-events-none absolute -right-2 top-8 h-56 w-56 rounded-full border border-indigo-300/[0.12]" />
              <div className="pointer-events-none absolute bottom-[-75px] right-[19%] h-40 w-40 rounded-full bg-cyan-300/[0.08] blur-3xl" />
              <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-cyan-300/15 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200">MISI BERIKUTNYA</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><Zap size={12} className="text-amber-300" fill="currentColor" /> +40 XP</span>
                  </div>
                  <h2 className="max-w-[520px] text-[24px] font-black leading-tight tracking-[-0.025em] text-white sm:text-[29px]">Membaca Jejak di <span className="text-cyan-200">Gua Bilangan</span></h2>
                  <p className="mt-2 max-w-[480px] text-[12px] leading-relaxed text-slate-300/80">Pecahkan 5 teka-teki bilangan bulat untuk membuka jalur berikutnya.</p>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button onClick={() => setMissionStarted(true)} className="group flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-[11px] font-black text-[#082033] shadow-[0_8px_28px_rgba(103,232,249,0.2)] transition-all hover:-translate-y-0.5 hover:bg-cyan-200 active:translate-y-0">
                      {missionStarted ? "MISI DIBUKA" : "LANJUTKAN MISI"} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                    <button onClick={() => showNotice("Ringkasan misi: 3 soal pilihan ganda dan 2 tantangan bonus.")} className="text-[11px] font-bold text-slate-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">Lihat ringkasan</button>
                  </div>
                </div>
                <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-[#071827]/45 p-4 md:w-[260px]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">PROGRES MISI</span>
                    <span className="text-sm font-black text-cyan-200">3/5</span>
                  </div>
                  <div className="mb-3 flex gap-1.5">
                    {[true, true, true, false, false].map((done, i) => <div key={i} className={`h-2 flex-1 rounded-full ${done ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.35)]" : "bg-white/[0.12]"}`} />)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400"><Check size={13} className="text-cyan-300" /> Terakhir aktif 18 menit lalu</div>
                </div>
              </div>
            </section>

            <div className="my-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2"><h2 className="text-[18px] font-black tracking-tight text-white">Zona petualangan</h2><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[9px] font-bold text-cyan-200">3 ZONA</span></div>
                <p className="mt-1 text-[11px] text-slate-500">Pilih jalur yang ingin kamu taklukkan.</p>
              </div>
              <button onClick={() => showNotice("Menampilkan semua misi yang tersedia.")} className="hidden items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-100 sm:flex">Lihat semua <ArrowRight size={13} /></button>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              {zones.map((zone) => {
                const Icon = zone.icon;
                const isSelected = activeZone === zone.number;
                const isLocked = zone.locked;
                return (
                  <button key={zone.number} onClick={() => isLocked ? showNotice("Selesaikan misi di zona sebelumnya untuk membuka area ini.") : setActiveZone(isSelected ? null : zone.number)} className={`group relative overflow-hidden rounded-[20px] border p-5 text-left transition-all ${isLocked ? "cursor-not-allowed border-white/[0.07] bg-white/[0.025] opacity-70" : isSelected ? "border-cyan-300/40 bg-cyan-300/[0.09] shadow-[0_14px_38px_rgba(22,184,209,0.1)]" : "border-white/[0.08] bg-[#0b1c2c]/80 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-[#10283b]"}`}>
                    <div className={`absolute -right-9 -top-9 h-28 w-28 rounded-full blur-2xl ${isLocked ? "bg-slate-400/[0.05]" : zone.color === "cyan" ? "bg-cyan-300/[0.1]" : "bg-indigo-400/[0.12]"}`} />
                    <div className="relative flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLocked ? "border-white/10 bg-white/[0.04] text-slate-500" : zone.color === "cyan" ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200" : "border-indigo-300/20 bg-indigo-300/10 text-indigo-200"}`}><Icon size={19} /></div>
                      <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-slate-600">{zone.number}</span>
                    </div>
                    <div className="relative mt-5">
                      <h3 className="text-[15px] font-black text-white">{zone.title}</h3>
                      <p className="mt-1 text-[10px] font-bold text-cyan-300/70">{zone.subject}</p>
                      <p className="mt-3 min-h-[34px] text-[11px] leading-relaxed text-slate-400">{zone.description}</p>
                    </div>
                    <div className="relative mt-5">
                      <div className="mb-2 flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-500">{zone.detail}</span>{isLocked ? <LockKeyhole size={13} className="text-slate-500" /> : <span className="font-black text-cyan-200">{zone.progress}%</span>}</div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.09]"><div className={`h-full rounded-full ${isLocked ? "bg-slate-600" : zone.color === "cyan" ? "bg-cyan-300" : "bg-indigo-300"}`} style={{ width: `${zone.progress}%` }} /></div>
                    </div>
                    {!isLocked && <div className={`relative mt-4 flex items-center gap-1 text-[10px] font-black ${isSelected ? "text-cyan-200" : "text-slate-500 group-hover:text-cyan-300"}`}>{isSelected ? "ZONA DIPILIH" : "BUKA PETA"} <ChevronRight size={13} /></div>}
                  </button>
                );
              })}
            </section>

            <div className="mb-3 mt-8 flex items-center justify-between"><h2 className="text-[14px] font-black text-white">Akses cepat</h2><span className="text-[10px] text-slate-600">Semua yang kamu butuhkan</span></div>
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickLinks.map(({ label, sublabel, icon: Icon, accent, bg }) => (
                <button key={label} onClick={() => showNotice(`${label} dibuka — ${sublabel}.`)} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0b1c2c]/75 p-3 text-left transition-all hover:border-white/[0.16] hover:bg-white/[0.06]">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${accent}`}><Icon size={17} /></span>
                  <span className="min-w-0"><span className="block text-[11px] font-black text-slate-200">{label}</span><span className="mt-0.5 block truncate text-[9px] text-slate-500">{sublabel}</span></span>
                </button>
              ))}
            </section>
          </div>
        </section>
      </div>

      {notice && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-cyan-300/20 bg-[#10263a] px-4 py-3 text-[11px] font-semibold text-cyan-100 shadow-2xl"><Sparkles size={15} className="text-cyan-300" /> {notice}<button onClick={() => setNotice(null)} aria-label="Tutup notifikasi" className="ml-2 text-slate-500 hover:text-white"><X size={14} /></button></div>}
    </main>
  );
}