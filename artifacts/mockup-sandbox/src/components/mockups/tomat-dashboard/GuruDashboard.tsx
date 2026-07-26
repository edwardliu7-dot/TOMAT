import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FilePlus2,
  Filter,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

type TaskStatus = 'Perlu diperiksa' | 'Terjadwal' | 'Draft';
type ClassFilter = 'Semua kelas' | 'VII A' | 'VIII B' | 'IX C';

type Task = {
  title: string;
  className: Exclude<ClassFilter, 'Semua kelas'>;
  detail: string;
  due: string;
  status: TaskStatus;
  tone: 'emerald' | 'violet' | 'amber';
};

const tasks: Task[] = [
  {
    title: 'Membaca grafik pertumbuhan',
    className: 'VII A',
    detail: '28 jawaban masuk dari 32 siswa',
    due: 'Hari ini, 16.00',
    status: 'Perlu diperiksa',
    tone: 'emerald',
  },
  {
    title: 'Refleksi ekosistem sekitar',
    className: 'VIII B',
    detail: 'Tugas esai · 26 siswa',
    due: 'Besok, 09.00',
    status: 'Terjadwal',
    tone: 'violet',
  },
  {
    title: 'Kuis energi dan perubahan',
    className: 'IX C',
    detail: '12 pertanyaan · 32 siswa',
    due: 'Kamis, 13.30',
    status: 'Draft',
    tone: 'amber',
  },
  {
    title: 'Jurnal pengamatan tanah',
    className: 'VII A',
    detail: '15 jawaban masuk dari 32 siswa',
    due: 'Jumat, 15.30',
    status: 'Perlu diperiksa',
    tone: 'emerald',
  },
];

const metrics = [
  { label: 'Siswa aktif', value: '124', detail: '+8 minggu ini', icon: Users, accent: 'emerald' },
  { label: 'Tugas berjalan', value: '08', detail: '3 perlu ditinjau', icon: BookOpen, accent: 'violet' },
  { label: 'Rata-rata kelas', value: '82,4', detail: '+4,2% dari bulan lalu', icon: GraduationCap, accent: 'amber' },
  { label: 'Kehadiran hari ini', value: '96,8%', detail: '5 siswa belum hadir', icon: CalendarDays, accent: 'sky' },
];

const avatarColors = ['bg-[#9fe3bd] text-[#153a32]', 'bg-[#d7c7ff] text-[#3d286c]', 'bg-[#f5cf9c] text-[#633f20]'];

export function GuruDashboard() {
  const [activeClass, setActiveClass] = useState<ClassFilter>('Semua kelas');
  const [toast, setToast] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filteredTasks = useMemo(
    () => activeClass === 'Semua kelas' ? tasks : tasks.filter((task) => task.className === activeClass),
    [activeClass],
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  return (
    <main className="min-h-[100dvh] bg-[#071321] text-[#e8f1ee] selection:bg-[#9fe3bd] selection:text-[#102a29]">
      <div className="pointer-events-none fixed inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 84% 0%, rgba(94, 75, 160, .18), transparent 33%), radial-gradient(circle at 8% 64%, rgba(29, 123, 96, .10), transparent 30%)' }} />
      <div className="relative mx-auto min-h-[100dvh] max-w-[1500px] px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <button
              aria-label="Buka beranda TOMAT"
              onClick={() => notify('Kamu sudah berada di beranda TOMAT')}
              className="group flex items-center gap-3"
            >
              <span className="grid size-10 place-items-center rounded-[14px] bg-[#9fe3bd] text-[#0b2c2a] shadow-[0_0_0_5px_rgba(159,227,189,.08)] transition-transform group-hover:scale-105">
                <span className="font-black tracking-[-0.1em]">TM</span>
              </span>
              <span className="hidden text-left sm:block">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#9fe3bd]">Ruang belajar</span>
                <span className="font-semibold tracking-[-0.03em] text-white">TOMAT</span>
              </span>
            </button>
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              <button onClick={() => notify('Beranda sedang aktif')} className="rounded-full bg-white/[0.09] px-4 py-2 text-xs font-semibold text-white">Beranda</button>
              <button onClick={() => notify('Kelas akan dibuka di ruang kerja terpisah')} className="rounded-full px-4 py-2 text-xs font-medium text-[#9eacb6] transition-colors hover:bg-white/[0.06] hover:text-white">Kelas</button>
              <button onClick={() => notify('Rekap nilai siap ditinjau')} className="rounded-full px-4 py-2 text-xs font-medium text-[#9eacb6] transition-colors hover:bg-white/[0.06] hover:text-white">Rekap nilai</button>
            </nav>
          </div>

          <div className="relative flex items-center gap-2 sm:gap-3">
            <button onClick={() => setShowNotifications((value) => !value)} aria-label="Notifikasi" className="relative grid size-10 place-items-center rounded-full border border-white/[0.09] text-[#a8b6bd] transition-colors hover:bg-white/[0.07] hover:text-white">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute right-[10px] top-[9px] size-1.5 rounded-full bg-[#9fe3bd]" />
            </button>
            <div className="h-7 w-px bg-white/[0.09]" />
            <button onClick={() => setShowProfile((value) => !value)} className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-white/[0.06]">
              <span className="grid size-9 place-items-center rounded-full bg-[#d7c7ff] text-xs font-bold text-[#3d286c]">NA</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-white">Nadia Arum</span>
                <span className="block text-[10px] text-[#83929d]">Guru IPA</span>
              </span>
              <ChevronDown size={14} className="text-[#71818c]" />
            </button>
            {showNotifications && (
              <div className="absolute right-14 top-12 z-20 w-72 rounded-2xl border border-white/[0.1] bg-[#122231] p-4 shadow-2xl shadow-black/30">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Notifikasi baru</span>
                  <button onClick={() => setShowNotifications(false)} aria-label="Tutup notifikasi"><X size={15} className="text-[#84959e]" /></button>
                </div>
                <p className="rounded-xl bg-[#9fe3bd]/[0.08] p-3 text-xs leading-5 text-[#b7cbc8]">12 jawaban baru dari kelas VII A menunggu diperiksa.</p>
              </div>
            )}
            {showProfile && (
              <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-white/[0.1] bg-[#122231] p-2 shadow-2xl shadow-black/30">
                <button onClick={() => notify('Pengaturan profil dibuka')} className="w-full rounded-xl px-3 py-2 text-left text-xs text-[#c0ced0] hover:bg-white/[0.06]">Pengaturan profil</button>
                <button onClick={() => notify('Sesi demo tetap tersimpan')} className="w-full rounded-xl px-3 py-2 text-left text-xs text-[#c0ced0] hover:bg-white/[0.06]">Keluar dari sesi</button>
              </div>
            )}
          </div>
        </header>

        <section className="pb-8 pt-10 sm:pt-14">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs text-[#82939e]">
                <span className="inline-block size-2 rounded-full bg-[#9fe3bd]" />
                Selasa, 15 Oktober 2024 <span className="text-[#40545f]">/</span> Minggu ke-42
              </div>
              <h1 className="max-w-xl text-[clamp(2.3rem,5vw,4.15rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-white">
                Selamat pagi,<br /><span className="text-[#9fe3bd]">Bu Nadia.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-[#98aab1]">Ruang kelasmu tertata rapi. Ada beberapa hal yang bisa diselesaikan sebelum istirahat.</p>
            </div>
            <div className="flex max-w-sm items-center gap-4 rounded-2xl border border-[#d7c7ff]/20 bg-[#d7c7ff]/[0.07] p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#d7c7ff]/15 text-[#d7c7ff]"><Sparkles size={19} strokeWidth={1.7} /></span>
              <div>
                <p className="text-xs font-semibold text-[#e5dcff]">Ritme kelas sedang baik</p>
                <p className="mt-1 text-[11px] leading-4 text-[#a99fc6]">Keterlibatan siswa naik 12% minggu ini.</p>
              </div>
              <button onClick={() => notify('Insight kelas dibuka')} aria-label="Lihat insight kelas" className="ml-auto text-[#d7c7ff] transition-transform hover:translate-x-1"><ArrowUpRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <ActionCard
            eyebrow="TUGAS AKTIF"
            icon={<FilePlus2 size={19} />}
            title="Buat tugas baru untuk kelasmu"
            body="Mulai dari kuis singkat, refleksi, atau kumpulkan hasil pengamatan."
            action="Buat tugas"
            accent="emerald"
            onClick={() => notify('Form tugas baru siap diisi')}
          />
          <ActionCard
            eyebrow="AGENDA KELAS"
            icon={<CalendarDays size={19} />}
            title="2 kegiatan hari ini"
            body="VII A · Praktikum fotosintesis, pukul 10.15"
            action="Lihat agenda"
            accent="violet"
            onClick={() => notify('Agenda kelas dibuka')}
          />
        </section>

        <section className="grid grid-cols-2 gap-x-3 gap-y-3 py-8 lg:grid-cols-4 lg:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const color = metric.accent === 'emerald' ? 'text-[#9fe3bd] bg-[#9fe3bd]/[0.1]' : metric.accent === 'violet' ? 'text-[#d7c7ff] bg-[#d7c7ff]/[0.1]' : metric.accent === 'amber' ? 'text-[#f5cf9c] bg-[#f5cf9c]/[0.1]' : 'text-[#a8d7ec] bg-[#a8d7ec]/[0.1]';
            return (
              <button key={metric.label} onClick={() => notify(`${metric.label}: ${metric.value}`)} className="group rounded-2xl border border-white/[0.08] bg-[#0d1d2b]/80 p-4 text-left transition-colors hover:border-white/[0.16] sm:p-5">
                <div className="mb-5 flex items-start justify-between">
                  <span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={17} strokeWidth={1.7} /></span>
                  <ArrowUpRight size={15} className="text-[#4e626e] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] font-medium text-[#82939e]">{metric.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
                  <p className="hidden text-[10px] text-[#9fe3bd] sm:block">{metric.detail}</p>
                </div>
                <p className="mt-1 text-[10px] text-[#9fe3bd] sm:hidden">{metric.detail}</p>
              </button>
            );
          })}
        </section>

        <div className="grid gap-8 pb-12 xl:grid-cols-[minmax(0,1.55fr)_minmax(290px,.75fr)]">
          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#738793]">Ruang kerja</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Tugas mendatang</h2>
              </div>
              <button onClick={() => notify('Semua tugas berhasil dimuat')} className="flex items-center gap-1.5 text-xs font-semibold text-[#9fe3bd] hover:text-white">Lihat semua <ArrowUpRight size={14} /></button>
            </div>
            <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
              <Filter size={14} className="mr-1 shrink-0 text-[#6e818c]" />
              {(['Semua kelas', 'VII A', 'VIII B', 'IX C'] as ClassFilter[]).map((filter) => (
                <button key={filter} onClick={() => setActiveClass(filter)} className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-semibold transition-colors ${activeClass === filter ? 'border-[#9fe3bd]/50 bg-[#9fe3bd] text-[#12302e]' : 'border-white/[0.08] bg-white/[0.03] text-[#81939e] hover:border-white/[0.18] hover:text-white'}`}>
                  {filter}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1d2b]/70">
              {filteredTasks.map((task, index) => (
                <TaskRow key={task.title} task={task} index={index} onClick={() => notify(`Membuka ${task.title}`)} />
              ))}
              {filteredTasks.length === 0 && <div className="p-10 text-center text-sm text-[#82939e]">Belum ada tugas untuk kelas ini.</div>}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#738793]">Sinyal kelas</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">Perlu perhatian</h2>
              </div>
              <button onClick={() => notify('Daftar perhatian disegarkan')} aria-label="Segarkan perhatian" className="grid size-8 place-items-center rounded-full border border-white/[0.08] text-[#7e9099] hover:text-white"><MoreHorizontal size={16} /></button>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1d2b]/70 p-4 sm:p-5">
              <p className="text-xs leading-5 text-[#8fa1a8]">Tiga siswa terlihat lebih pasif dari biasanya dalam dua minggu terakhir.</p>
              <div className="mt-5 space-y-4">
                {[
                  ['RA', 'Raka Aditya', 'VII A', 'Belum mengumpulkan 2 tugas'],
                  ['SF', 'Salsa Fitria', 'VIII B', 'Kehadiran 78% bulan ini'],
                  ['DN', 'Dimas Nugroho', 'IX C', 'Nilai kuis turun 9 poin'],
                ].map(([initial, name, className, concern], index) => (
                  <button key={name} onClick={() => notify(`Membuka catatan ${name}`)} className="flex w-full items-center gap-3 text-left">
                    <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-bold ${avatarColors[index]}`}>{initial}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-xs font-semibold text-[#dbe6e4]"><span className="truncate">{name}</span><span className="rounded bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-medium text-[#92a5aa]">{className}</span></span>
                      <span className="mt-1 block truncate text-[11px] text-[#82939e]">{concern}</span>
                    </span>
                    <ArrowUpRight size={14} className="shrink-0 text-[#536975]" />
                  </button>
                ))}
              </div>
              <button onClick={() => notify('Catatan wali kelas dibuka')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.09] py-2.5 text-xs font-semibold text-[#b4c4c5] transition-colors hover:bg-white/[0.06] hover:text-white"><Search size={14} /> Buka catatan wali kelas</button>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#9fe3bd]/15 bg-[#9fe3bd]/[0.05] p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#9fe3bd]/15 text-[#9fe3bd]"><Check size={16} /></span>
              <p className="text-[11px] leading-4 text-[#9fb5b1]"><span className="font-semibold text-[#cde4d8]">Kelas VII A</span> mencapai target kehadiran minggu ini.</p>
            </div>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#9fe3bd]/25 bg-[#162d35] px-4 py-3 text-xs font-medium text-[#d6ebe2] shadow-2xl shadow-black/40">
          {toast}
        </div>
      )}
    </main>
  );
}

function ActionCard({
  eyebrow,
  icon,
  title,
  body,
  action,
  accent,
  onClick,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  body: string;
  action: string;
  accent: 'emerald' | 'violet';
  onClick: () => void;
}) {
  const isEmerald = accent === 'emerald';
  return (
    <div className={`group flex min-h-[178px] flex-col justify-between rounded-2xl border p-5 transition-transform hover:-translate-y-0.5 sm:p-6 ${isEmerald ? 'border-[#9fe3bd]/20 bg-[#153633]' : 'border-[#d7c7ff]/20 bg-[#252442]'}`}>
      <div className="flex items-start justify-between">
        <span className={`grid size-10 place-items-center rounded-xl ${isEmerald ? 'bg-[#9fe3bd]/15 text-[#9fe3bd]' : 'bg-[#d7c7ff]/15 text-[#d7c7ff]'}`}>{icon}</span>
        <span className={`font-mono text-[10px] font-bold tracking-[0.18em] ${isEmerald ? 'text-[#8dc7ae]' : 'text-[#b4a8d5]'}`}>{eyebrow}</span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">{title}</h3>
          <p className={`mt-1 max-w-md text-xs leading-5 ${isEmerald ? 'text-[#a8c7bd]' : 'text-[#bdb9d0]'}`}>{body}</p>
        </div>
        <button onClick={onClick} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-bold transition-colors ${isEmerald ? 'bg-[#9fe3bd] text-[#12302e] hover:bg-[#c0f0d0]' : 'bg-[#d7c7ff] text-[#332653] hover:bg-[#e7ddff]'}`}>{action}<Plus size={14} /></button>
      </div>
    </div>
  );
}

function TaskRow({ task, index, onClick }: { task: Task; index: number; onClick: () => void }) {
  const statusStyle = task.status === 'Perlu diperiksa'
    ? 'bg-[#9fe3bd]/[0.1] text-[#9fe3bd]'
    : task.status === 'Terjadwal'
      ? 'bg-[#d7c7ff]/[0.1] text-[#c9b9f7]'
      : 'bg-[#f5cf9c]/[0.1] text-[#f5cf9c]';
  const marker = task.tone === 'emerald' ? 'bg-[#9fe3bd]' : task.tone === 'violet' ? 'bg-[#d7c7ff]' : 'bg-[#f5cf9c]';
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-4 text-left last:border-b-0 hover:bg-white/[0.035] sm:gap-4 sm:px-5">
      <span className={`size-1.5 shrink-0 rounded-full ${marker}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#e0eae7] sm:text-sm">{task.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#7f939d]">
          <span>{task.className}</span><span className="text-[#435964]">·</span><span>{task.detail}</span>
        </span>
      </span>
      <span className="hidden items-center gap-1.5 text-[10px] text-[#82949c] sm:flex"><Clock3 size={12} /> {task.due}</span>
      <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold md:block ${statusStyle}`}>{task.status}</span>
      <ArrowUpRight size={15} className="shrink-0 text-[#536975] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span className="sr-only">{`Buka ${task.title}, baris ${index + 1}`}</span>
    </button>
  );
}

export default GuruDashboard;