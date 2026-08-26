import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  Gem,
  LockKeyhole,
  Map,
  Medal,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserRound,
} from "lucide-react";

type Chapter = "I" | "II" | "III";

const chapters: {
  id: Chapter;
  label: string;
  title: string;
  subtitle: string;
  color: string;
  soft: string;
  icon: React.ReactNode;
  missions: { title: string; description: string; icon: React.ReactNode; progress?: string; active?: boolean }[];
}[] = [
  {
    id: "I",
    label: "BAB I",
    title: "Bilangan Berpangkat",
    subtitle: "6 misi alkemis",
    color: "#FBBF24",
    soft: "rgba(251,191,36,0.12)",
    icon: <Sparkles size={17} />,
    missions: [
      { title: "Penggandaan Sel Ramuan", description: "Hitung pertumbuhan sel ajaib dengan bilangan berpangkat.", icon: <Gem size={18} />, progress: "3 / 5 soal", active: true },
      { title: "Ekstraksi Racun Miniatur", description: "Ubah pangkat negatif menjadi pecahan penawar.", icon: <Flame size={18} />, progress: "Belum dimulai" },
      { title: "Pemisahan Elemen Kristal", description: "Stabilkan kristal dengan pangkat pecahan.", icon: <Sparkles size={18} />, progress: "Belum dimulai" },
      { title: "Fusi Energi Alkemis", description: "Gabungkan energi dengan operasi pangkat pecahan.", icon: <Shield size={18} />, progress: "Belum dimulai" },
      { title: "Penyederhanaan Mantra Akar", description: "Sederhanakan bentuk akar untuk tembok kastil.", icon: <ScrollText size={18} />, progress: "Belum dimulai" },
      { title: "Ekspedisi Geolog Kerajaan", description: "Pecahkan masalah eksponen di dunia nyata.", icon: <Map size={18} />, progress: "Belum dimulai" },
    ],
  },
  {
    id: "II",
    label: "BAB II",
    title: "Teorema Pythagoras",
    subtitle: "6 misi ksatria",
    color: "#7DD3FC",
    soft: "rgba(125,211,252,0.12)",
    icon: <Shield size={17} />,
    missions: [
      { title: "Bidikan Tepat Trebuchet", description: "Temukan sisi miring untuk bidikan sempurna.", icon: <Swords size={18} />, progress: "Terbuka" },
      { title: "Restorasi Perisai Kerajaan", description: "Cari diagonal perisai yang retak.", icon: <Shield size={18} />, progress: "Terkunci" },
      { title: "Harta Karun di Sudut Ruangan", description: "Temukan diagonal ruang peti harta.", icon: <Gem size={18} />, progress: "Terkunci" },
      { title: "Inspeksi Sudut Menara", description: "Uji apakah menara sudah tegak lurus.", icon: <Map size={18} />, progress: "Terkunci" },
      { title: "Peta Radar Pengintai", description: "Hitung jarak dua titik di peta.", icon: <Map size={18} />, progress: "Terkunci" },
      { title: "Misi Penyelamatan Tali Gantung", description: "Pilih tali terpendek untuk menyelamatkan putri.", icon: <Swords size={18} />, progress: "Terkunci" },
    ],
  },
  {
    id: "III",
    label: "BAB III",
    title: "Persamaan & Pertidaksamaan",
    subtitle: "4 misi strategi",
    color: "#86EFAC",
    soft: "rgba(134,239,172,0.12)",
    icon: <ScrollText size={17} />,
    missions: [
      { title: "Teka-Teki Gerbang Logika", description: "Temukan nilai x dari inskripsi kuno.", icon: <ScrollText size={18} />, progress: "Terbuka" },
      { title: "Katrol Penyeimbang Jembatan", description: "Seimbangkan beban kiri dan kanan.", icon: <Shield size={18} />, progress: "Terkunci" },
      { title: "Penerjemah Gulungan Kuno", description: "Ubah cerita warga menjadi model matematika.", icon: <ScrollText size={18} />, progress: "Terkunci" },
      { title: "Kapasitas Kereta Kuda", description: "Muat logistik tanpa melewati batas.", icon: <Map size={18} />, progress: "Terkunci" },
    ],
  },
];

function ProgressDots({ active = 3, total = 5, color }: { active?: number; total?: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: index < active ? color : "rgba(255,255,255,0.15)" }}
        />
      ))}
    </div>
  );
}

function MissionCard({
  mission,
  color,
  soft,
}: {
  mission: (typeof chapters)[number]["missions"][number];
  color: string;
  soft: string;
}) {
  const locked = mission.progress === "Terkunci";
  return (
    <button
      className="group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98]"
      style={{
        borderColor: mission.active ? `${color}88` : "rgba(255,255,255,0.07)",
        background: mission.active ? `linear-gradient(110deg, ${soft}, rgba(255,255,255,0.025))` : "rgba(255,255,255,0.035)",
        opacity: locked ? 0.62 : 1,
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ color: locked ? "#64748B" : color, background: locked ? "rgba(255,255,255,0.06)" : soft }}
      >
        {locked ? <LockKeyhole size={18} /> : mission.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold text-white">{mission.title}</span>
          {mission.active && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase" style={{ background: soft, color }}>Aktif</span>}
        </span>
        <span className="mt-1 block truncate text-[11px] leading-4 text-slate-400">{mission.description}</span>
        <span className="mt-2 flex items-center gap-2 text-[10px] font-semibold" style={{ color: locked ? "#64748B" : color }}>
          {mission.active ? <><ProgressDots color={color} /> {mission.progress}</> : mission.progress}
        </span>
      </span>
      {!locked && <ArrowRight size={16} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}

export function Grade8Portrait() {
  const [activeChapter, setActiveChapter] = useState<Chapter>("I");
  const chapter = chapters.find((item) => item.id === activeChapter) ?? chapters[0];

  return (
    <main className="min-h-[100dvh] w-full bg-[#080A11] font-sans text-slate-200">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden border-x border-white/[0.06] bg-[#0B0D14]">
        <header className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.28),transparent_45%),linear-gradient(145deg,#161936,#0B0D14_75%)] px-5 pb-5 pt-4">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-indigo-400/10" />
          <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full border border-indigo-400/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-sm shadow-lg shadow-orange-500/20">🦊</div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-indigo-300">Zona Ksatria Geometri</p>
                <h1 className="text-lg font-black leading-tight text-white">Kelas 8</h1>
              </div>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300"><UserRound size={17} /></button>
          </div>
          <div className="relative mt-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Selamat datang kembali,</p>
              <p className="mt-0.5 text-base font-bold text-white">Alya Pratama <span className="text-amber-300">✦</span></p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1.5 text-[10px] font-bold text-amber-300">
              <Flame size={13} /> 7 hari
            </div>
          </div>
        </header>

        <section className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Perjalananmu</p>
              <p className="mt-1 text-sm font-bold text-white">Kemajuan kurikulum</p>
            </div>
            <span className="text-xl font-black text-indigo-300">18%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-[18%] rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-[0_0_12px_rgba(129,140,248,0.55)]" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>3 dari 16 misi selesai</span>
            <span className="flex items-center gap-1 text-amber-300"><Trophy size={11} /> +150 EXP berikutnya</span>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Peta Petualangan</p>
              <p className="mt-1 text-sm font-bold text-white">{chapter.title}</p>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">Kelas 8 <ChevronDown size={14} /></button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            {chapters.map((item) => {
              const selected = item.id === activeChapter;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveChapter(item.id)}
                  className="flex min-w-[112px] items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all"
                  style={{
                    borderColor: selected ? `${item.color}88` : "rgba(255,255,255,0.07)",
                    background: selected ? item.soft : "rgba(255,255,255,0.035)",
                    color: selected ? item.color : "#94A3B8",
                  }}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: selected ? `${item.color}1f` : "rgba(255,255,255,0.06)" }}>{item.icon}</span>
                  <span>
                    <span className="block text-[10px] font-extrabold">{item.label}</span>
                    <span className="mt-0.5 block text-[9px] text-slate-500">{item.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex-1 space-y-2.5 overflow-y-auto px-5 pb-24 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: chapter.color }}>Misi tersedia</p>
            <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-semibold text-slate-400">{chapter.missions.length} misi</span>
          </div>
          {chapter.missions.map((mission) => (
            <MissionCard key={mission.title} mission={mission} color={chapter.color} soft={chapter.soft} />
          ))}
        </section>

        <nav className="fixed bottom-0 z-10 flex w-full max-w-[420px] items-center justify-around border-t border-white/[0.08] bg-[#0B0D14]/90 px-4 py-3 backdrop-blur-xl">
          <button className="flex flex-col items-center gap-1 text-indigo-300"><Map size={18} /><span className="text-[9px] font-bold">Peta</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-500"><Medal size={18} /><span className="text-[9px] font-bold">Lencana</span></button>
          <button className="relative -mt-7 flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-4 border-[#0B0D14] bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-lg shadow-indigo-500/30"><Star size={20} fill="currentColor" /><span className="text-[8px] font-black">MAIN</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-500"><Trophy size={18} /><span className="text-[9px] font-bold">Peringkat</span></button>
          <button className="flex flex-col items-center gap-1 text-slate-500"><UserRound size={18} /><span className="text-[9px] font-bold">Profil</span></button>
        </nav>
      </div>
    </main>
  );
}