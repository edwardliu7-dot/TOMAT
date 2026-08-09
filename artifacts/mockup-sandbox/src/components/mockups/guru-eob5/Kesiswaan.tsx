import { PageShell } from "./_shared/Sidebar";
import { Users, TrendingUp, Award, AlertTriangle, ChevronRight, BarChart3 } from "lucide-react";

const CLASS_STATS = [
  { kelas: "VII Ibnu Batuttah", siswa: 28, hadir: 94.2, nilai: 81.5, poin: 1240 },
  { kelas: "VIII Ibnu Sina", siswa: 27, hadir: 97.1, nilai: 85.3, poin: 1560 },
  { kelas: "IX Al Khawarizmi", siswa: 25, hadir: 91.8, nilai: 79.2, poin: 980 },
];

const ALERTS = [
  { name: "Endra Wijaya", kelas: "IX Al Khawarizmi", issue: "Kehadiran 88% — di bawah batas 90%", type: "hadir" },
  { name: "Slamet Riyadi", kelas: "VII Ibnu Batuttah", issue: "Nilai rata-rata 68 — perlu remedial", type: "nilai" },
];

export function Kesiswaan() {
  return (
    <PageShell active="kesiswaan" title="Kesiswaan">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kesiswaan</h1>
        <p className="text-sm text-slate-500 mt-1">Pantauan kehadiran, prestasi, dan perkembangan siswa</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Siswa", val: 80, bg: "bg-blue-100", tc: "text-blue-600", icon: <Users className="w-5 h-5" /> },
          { label: "Avg. Kehadiran", val: "94.4%", bg: "bg-emerald-100", tc: "text-emerald-600", icon: <TrendingUp className="w-5 h-5" /> },
          { label: "Siswa Berprestasi", val: 12, bg: "bg-amber-100", tc: "text-amber-600", icon: <Award className="w-5 h-5" /> },
          { label: "Perlu Perhatian", val: ALERTS.length, bg: "bg-red-100", tc: "text-red-500", icon: <AlertTriangle className="w-5 h-5" /> },
        ].map(({ label, val, bg, tc, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} ${tc} flex items-center justify-center shrink-0`}>{icon}</div>
            <div><div className="text-xs text-slate-500 font-medium">{label}</div><div className="text-xl font-black text-slate-800">{val}</div></div>
          </div>
        ))}
      </div>

      {/* Per kelas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700">Statistik Per Kelas</h2>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Kelas</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Siswa</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Kehadiran</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Rata-rata Nilai</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Total Poin</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {CLASS_STATS.map((c) => (
              <tr key={c.kelas} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-semibold text-slate-800">{c.kelas}</td>
                <td className="px-4 py-4 text-center text-slate-600">{c.siswa}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`font-bold ${c.hadir >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{c.hadir}%</span>
                </td>
                <td className="px-4 py-4 text-center font-bold text-slate-700">{c.nilai}</td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-amber-600">{c.poin.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-slate-700">Perlu Perhatian</h2>
          </div>
          <div className="space-y-3">
            {ALERTS.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">{a.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 text-sm">{a.name}</div>
                  <div className="text-xs text-slate-500">{a.kelas} · {a.issue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
