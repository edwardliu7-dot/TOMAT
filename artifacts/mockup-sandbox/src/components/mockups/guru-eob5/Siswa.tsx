import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Search, ChevronRight, Users, GraduationCap, TrendingUp } from "lucide-react";

const STUDENTS = [
  { id: "1", name: "Achmad Fauzi", kelas: "VIII Ibnu Sina", nisn: "0091234567", gender: "L", hadir: 98, nilai: 85 },
  { id: "2", name: "Bunga Pertiwi", kelas: "VIII Ibnu Sina", nisn: "0091234568", gender: "P", hadir: 100, nilai: 91 },
  { id: "3", name: "Cahya Ramadhan", kelas: "VII Ibnu Batuttah", nisn: "0091234569", gender: "L", hadir: 92, nilai: 75 },
  { id: "4", name: "Dian Safitri", kelas: "VIII Ibnu Sina", nisn: "0091234570", gender: "P", hadir: 97, nilai: 95 },
  { id: "5", name: "Endra Wijaya", kelas: "IX Al Khawarizmi", nisn: "0091234571", gender: "L", hadir: 88, nilai: 71 },
  { id: "6", name: "Fitri Handayani", kelas: "VII Ibnu Batuttah", nisn: "0091234572", gender: "P", hadir: 95, nilai: 83 },
  { id: "7", name: "Galih Prakoso", kelas: "IX Al Khawarizmi", nisn: "0091234573", gender: "L", hadir: 96, nilai: 79 },
  { id: "8", name: "Hana Kusuma", kelas: "VII Ibnu Batuttah", nisn: "0091234574", gender: "P", hadir: 99, nilai: 88 },
  { id: "9", name: "Ilham Saputra", kelas: "VIII Ibnu Sina", nisn: "0091234575", gender: "L", hadir: 91, nilai: 76 },
  { id: "10", name: "Jihan Aulia", kelas: "IX Al Khawarizmi", nisn: "0091234576", gender: "P", hadir: 94, nilai: 82 },
];

function DetailSiswa({ s, onBack }: { s: typeof STUDENTS[0]; onBack: () => void }) {
  return (
    <PageShell active="siswa" title="Detail Siswa">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" /> Kembali ke Daftar
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-700">
            {s.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{s.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{s.kelas} · NISN {s.nisn}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${s.gender === "P" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>
              {s.gender === "P" ? "Perempuan" : "Laki-laki"}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Kehadiran", val: `${s.hadir}%`, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Rata-rata Nilai", val: s.nilai, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Status", val: s.hadir >= 75 ? "Aktif" : "Perhatian", color: s.hadir >= 75 ? "text-emerald-600" : "text-red-500", bg: s.hadir >= 75 ? "bg-emerald-100" : "bg-red-100" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-black ${color}`}>{val}</div>
            <div className="text-xs text-slate-600 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function Siswa() {
  const [kelas, setKelas] = useState("semua");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<typeof STUDENTS[0] | null>(null);

  if (detail) return <DetailSiswa s={detail} onBack={() => setDetail(null)} />;

  const filtered = STUDENTS.filter((s) =>
    (kelas === "semua" || s.kelas === kelas) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const kelasList = [...new Set(STUDENTS.map((s) => s.kelas))].sort();

  return (
    <PageShell active="siswa" title="Manajemen Siswa">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">{STUDENTS.length} siswa terdaftar</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kelasList.map((k) => {
          const count = STUDENTS.filter((s) => s.kelas === k).length;
          return (
            <button key={k} onClick={() => setKelas(kelas === k ? "semua" : k)}
              className={`p-4 rounded-2xl border text-left transition-all ${kelas === k ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kelas</span>
              </div>
              <div className="text-sm font-bold text-slate-700 leading-tight">{k}</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{count} <span className="text-sm font-medium text-slate-400">siswa</span></div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama siswa..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.map((s) => (
          <button key={s.id} onClick={() => setDetail(s)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800">{s.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.kelas} · {s.nisn}</div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className={`text-sm font-bold ${s.hadir >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{s.hadir}%</div>
                <div className="text-[10px] text-slate-400">Hadir</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{s.nilai}</div>
                <div className="text-[10px] text-slate-400">Nilai</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}
