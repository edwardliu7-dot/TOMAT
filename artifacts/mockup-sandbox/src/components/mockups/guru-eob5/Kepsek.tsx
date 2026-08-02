import { PageShell } from "./_shared/Sidebar";
import { Users, CheckSquare, FileText, AlertCircle, Search, Clock, BookOpen, ChevronRight, Download } from "lucide-react";

const TEACHERS = [
  { name: "Pak Budi Santoso", mapel: "Matematika", jabatan: "Guru", jurnal: 16, target: 18, pct: 89, status: "baik" },
  { name: "Bu Ratna Dewi", mapel: "B. Indonesia", jabatan: "Wali Kelas VIII", jurnal: 18, target: 18, pct: 100, status: "sangat_baik" },
  { name: "Pak Ahmad Yusuf", mapel: "IPA", jabatan: "Guru", jurnal: 12, target: 18, pct: 67, status: "cukup" },
  { name: "Bu Siti Aminah", mapel: "PKN", jabatan: "Wali Kelas VII", jurnal: 9, target: 18, pct: 50, status: "perlu_perhatian" },
  { name: "Pak Rudi Hermawan", mapel: "PJOK", jabatan: "Guru", jurnal: 17, target: 18, pct: 94, status: "sangat_baik" },
  { name: "Bu Lina Kartika", mapel: "Seni Teater", jabatan: "Guru", jurnal: 14, target: 18, pct: 78, status: "baik" },
];

const getStatus = (pct: number) => {
  if (pct >= 90) return { label: "Sangat Baik", cls: "bg-emerald-100 text-emerald-700" };
  if (pct >= 75) return { label: "Baik", cls: "bg-blue-100 text-blue-700" };
  if (pct >= 50) return { label: "Cukup", cls: "bg-amber-100 text-amber-700" };
  return { label: "Perlu Perhatian", cls: "bg-red-100 text-red-600" };
};

const getBarColor = (pct: number) => {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 75) return "bg-blue-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-400";
};

export function Kepsek() {
  const avgPct = Math.round(TEACHERS.reduce((a, t) => a + t.pct, 0) / TEACHERS.length);

  return (
    <PageShell active="kepsek" title="Kepala Sekolah">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pantauan Kepala Sekolah</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan kinerja guru dan akademik sekolah</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Guru", val: TEACHERS.length, bg: "bg-blue-100", iconCls: "text-blue-600", icon: <Users className="w-5 h-5" /> },
          { label: "Avg. Kepatuhan Jurnal", val: `${avgPct}%`, bg: "bg-emerald-100", iconCls: "text-emerald-600", icon: <CheckSquare className="w-5 h-5" /> },
          { label: "Perlu Perhatian", val: TEACHERS.filter((t) => t.pct < 75).length, bg: "bg-red-100", iconCls: "text-red-500", icon: <AlertCircle className="w-5 h-5" /> },
          { label: "Dokumen Terupload", val: 34, bg: "bg-violet-100", iconCls: "text-violet-600", icon: <FileText className="w-5 h-5" /> },
        ].map(({ label, val, bg, iconCls, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} ${iconCls} flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
              <div className="text-xl font-black text-slate-800">{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-700">Kepatuhan Jurnal Mengajar</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rata-rata semua guru · Juli–Agustus 2026</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStatus(avgPct).cls}`}>{getStatus(avgPct).label}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
          <div className={`h-full rounded-full transition-all ${getBarColor(avgPct)}`} style={{ width: `${avgPct}%` }} />
        </div>
        <p className="text-xs text-slate-400">{avgPct}% rata-rata kepatuhan</p>
      </div>

      {/* Teacher table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">Detail Per Guru</h3>
          <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700">
            <Download className="w-3.5 h-3.5" /> Ekspor
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Guru</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Jurnal</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 w-40">Progres</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {TEACHERS.map((t) => {
              const { label, cls } = getStatus(t.pct);
              return (
                <tr key={t.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{t.name.charAt(0)}</div>
                      <div>
                        <div className="font-semibold text-slate-800">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.mapel} · {t.jabatan}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-slate-700">{t.jurnal}</span>
                    <span className="text-slate-400">/{t.target}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getBarColor(t.pct)}`} style={{ width: `${t.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 w-8 text-right">{t.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
