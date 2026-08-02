import { PageShell } from "./_shared/Sidebar";
import { Users, TrendingUp, Award, MessageCircle, ChevronRight, Star } from "lucide-react";

const KELAS = "VIII Ibnu Sina";
const STUDENTS = [
  { id: "1", name: "Achmad Fauzi", hadir: 98, nilai: 85, poin: 320, rank: 3 },
  { id: "2", name: "Bunga Pertiwi", hadir: 100, nilai: 91, poin: 450, rank: 1 },
  { id: "3", name: "Dian Safitri", hadir: 97, nilai: 95, poin: 420, rank: 2 },
  { id: "4", name: "Endra Wijaya", hadir: 88, nilai: 71, poin: 180, rank: 6 },
  { id: "5", name: "Fatimah Zahra", hadir: 96, nilai: 83, poin: 290, rank: 4 },
  { id: "6", name: "Gilang Putra", hadir: 93, nilai: 78, poin: 240, rank: 5 },
];

export function WaliKelas() {
  const avgHadir = Math.round(STUDENTS.reduce((a, s) => a + s.hadir, 0) / STUDENTS.length * 10) / 10;
  const avgNilai = Math.round(STUDENTS.reduce((a, s) => a + s.nilai, 0) / STUDENTS.length * 10) / 10;

  return (
    <PageShell active="walikelas" title="Wali Kelas">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Wali Kelas</h1>
        <p className="text-sm text-slate-500 mt-1">Pantauan khusus kelas {KELAS}</p>
      </div>

      {/* Kelas card */}
      <div className="bg-gradient-to-br from-[#0f1c36] to-[#1e3a6e] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="wk-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#wk-grid)"/></svg>
        </div>
        <div className="relative">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">Kelas Binaan</div>
          <h2 className="text-3xl font-black text-white">{KELAS}</h2>
          <p className="text-white/60 text-sm mt-1">Wali Kelas: Pak Budi Santoso · {STUDENTS.length} siswa</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Avg. Kehadiran", val: `${avgHadir}%` },
              { label: "Avg. Nilai", val: avgNilai },
              { label: "Siswa Aktif", val: STUDENTS.filter((s) => s.hadir >= 90).length },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <div className="text-[10px] font-semibold text-white/50 uppercase">{label}</div>
                <div className="text-2xl font-black text-white mt-1">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-700">Daftar Siswa</h2>
          <span className="text-xs text-slate-400">{STUDENTS.length} siswa</span>
        </div>
        <div className="divide-y divide-slate-50">
          {STUDENTS.sort((a, b) => a.rank - b.rank).map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0
                ${s.rank === 1 ? "bg-amber-100 text-amber-700" : s.rank === 2 ? "bg-slate-200 text-slate-600" : s.rank === 3 ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-700"}`}>
                {s.rank <= 3 ? <Star className="w-3.5 h-3.5" /> : s.rank}
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800">{s.name}</div>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <div className={`text-sm font-bold ${s.hadir >= 95 ? "text-emerald-600" : s.hadir >= 90 ? "text-blue-600" : "text-amber-600"}`}>{s.hadir}%</div>
                  <div className="text-[10px] text-slate-400">Hadir</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700">{s.nilai}</div>
                  <div className="text-[10px] text-slate-400">Nilai</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-600">{s.poin}</div>
                  <div className="text-[10px] text-slate-400">Poin</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
