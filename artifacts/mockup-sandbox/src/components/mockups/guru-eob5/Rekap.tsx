import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Download, TrendingUp, TrendingDown, Users, BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";

const TABS = ["Kelas", "Siswa", "Periode"];

const CLASS_DATA = [
  { kelas: "VII Ibnu Batuttah", siswa: 28, hadirRate: 94.2, nilaiAvg: 81.5, jurnalDone: 16, jurnalTarget: 18 },
  { kelas: "VIII Ibnu Sina", siswa: 27, hadirRate: 97.1, nilaiAvg: 85.3, jurnalDone: 18, jurnalTarget: 18 },
  { kelas: "IX Al Khawarizmi", siswa: 25, hadirRate: 91.8, nilaiAvg: 79.2, jurnalDone: 14, jurnalTarget: 18 },
];

const STUDENTS = [
  { name: "Achmad Fauzi", kelas: "VIII", hadir: 98, nilai: 85.5, trend: "up" },
  { name: "Bunga Pertiwi", kelas: "VIII", hadir: 100, nilai: 91.2, trend: "up" },
  { name: "Cahya Ramadhan", kelas: "VII", hadir: 92, nilai: 74.8, trend: "down" },
  { name: "Dian Safitri", kelas: "VIII", hadir: 97, nilai: 95.0, trend: "up" },
  { name: "Endra Wijaya", kelas: "IX", hadir: 88, nilai: 71.3, trend: "down" },
  { name: "Fitri Handayani", kelas: "VII", hadir: 95, nilai: 82.7, trend: "up" },
];

const PERIOD_DATA = [
  { label: "Jul 2026", jurnal: 14, hadir: 96.2, nilai: 83.1 },
  { label: "Agt 2026", jurnal: 5, hadir: 95.8, nilai: null },
];

export function Rekap() {
  const [tab, setTab] = useState(0);
  const [kelas, setKelas] = useState("semua");

  return (
    <PageShell active="rekap" title="Rekap & Analitik">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap & Analitik</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan performa mengajar dan siswa</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Ekspor CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Siswa", val: 80, color: "text-blue-600", bg: "bg-blue-100", icon: <Users className="w-5 h-5" /> },
          { label: "Rata-rata Kehadiran", val: "94.4%", color: "text-emerald-600", bg: "bg-emerald-100", icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: "Rata-rata Nilai", val: "82.0", color: "text-violet-600", bg: "bg-violet-100", icon: <BarChart3 className="w-5 h-5" /> },
          { label: "Jurnal Bulan Ini", val: "5/18", color: "text-amber-600", bg: "bg-amber-100", icon: <AlertTriangle className="w-5 h-5" /> },
        ].map(({ label, val, color, bg, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
              <div className="text-xl font-black text-slate-800">{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === i ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Kelas</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Siswa</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Kehadiran</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Rata-rata Nilai</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Jurnal</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {CLASS_DATA.map((c) => (
                <tr key={c.kelas} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-semibold text-slate-800">{c.kelas}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{c.siswa}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${c.hadirRate >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{c.hadirRate}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${c.nilaiAvg >= 80 ? "text-blue-600" : "text-orange-500"}`}>{c.nilaiAvg}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.jurnalDone >= c.jurnalTarget ? "bg-emerald-500" : "bg-blue-500"}`}
                          style={{ width: `${(c.jurnalDone / c.jurnalTarget) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{c.jurnalDone}/{c.jurnalTarget}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <select value={kelas} onChange={(e) => setKelas(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="semua">Semua Kelas</option>
              {["VII", "VIII", "IX"].map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Siswa</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Kelas</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Kehadiran</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Nilai Rata-rata</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500">Tren</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {STUDENTS.filter((s) => kelas === "semua" || s.kelas === kelas).map((s) => (
                <tr key={s.name} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{s.name.charAt(0)}</div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-slate-500">{s.kelas}</td>
                  <td className="px-4 py-3.5 text-center"><span className={`font-bold ${s.hadir >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{s.hadir}%</span></td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-700">{s.nilai.toFixed(1)}</td>
                  <td className="px-4 py-3.5 text-center">
                    {s.trend === "up" ? <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" /> : <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 2 && (
        <div className="grid grid-cols-1 gap-4">
          {PERIOD_DATA.map((p) => (
            <div key={p.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">{p.label}</h3>
                <span className="text-xs text-slate-400 font-medium">{p.jurnal} jurnal tercatat</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><div className="text-xl font-black text-blue-600">{p.jurnal}</div><div className="text-xs text-slate-500">Jurnal</div></div>
                <div className="text-center"><div className="text-xl font-black text-emerald-600">{p.hadir}%</div><div className="text-xs text-slate-500">Kehadiran</div></div>
                <div className="text-center"><div className="text-xl font-black text-slate-600">{p.nilai ?? "—"}</div><div className="text-xs text-slate-500">Rata-rata Nilai</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
