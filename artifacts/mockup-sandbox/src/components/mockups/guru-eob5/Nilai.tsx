import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Download, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Award, Percent } from "lucide-react";

const STUDENTS = [
  { id: "1", name: "Achmad Fauzi", nisn: "009" },
  { id: "2", name: "Bunga Pertiwi", nisn: "010" },
  { id: "3", name: "Cahya Ramadhan", nisn: "011" },
  { id: "4", name: "Dian Safitri", nisn: "012" },
  { id: "5", name: "Endra Wijaya", nisn: "013" },
];

type GradeType = "formatif" | "sumatif_tengah" | "sumatif_akhir";

const TYPES: { id: GradeType; label: string; color: string }[] = [
  { id: "formatif", label: "Formatif", color: "bg-blue-100 text-blue-700" },
  { id: "sumatif_tengah", label: "Sumatif Tengah", color: "bg-violet-100 text-violet-700" },
  { id: "sumatif_akhir", label: "Sumatif Akhir", color: "bg-amber-100 text-amber-700" },
];

const MOCK_GRADES: Record<string, Record<GradeType, number | null>> = {
  "1": { formatif: 85, sumatif_tengah: 82, sumatif_akhir: null },
  "2": { formatif: 91, sumatif_tengah: 88, sumatif_akhir: null },
  "3": { formatif: 78, sumatif_tengah: 75, sumatif_akhir: null },
  "4": { formatif: 95, sumatif_tengah: 94, sumatif_akhir: null },
  "5": { formatif: 72, sumatif_tengah: null, sumatif_akhir: null },
};

function avg(g: Record<GradeType, number | null>) {
  const vals = Object.values(g).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function Nilai() {
  const [kelas, setKelas] = useState("VIII Ibnu Sina");
  const [mapel, setMapel] = useState("Matematika");
  const [tab, setTab] = useState<"input" | "rekap">("input");

  return (
    <PageShell active="nilai" title="Nilai Siswa">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nilai Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Input dan kelola nilai formatif dan sumatif</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Ekspor Excel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(["input", "rekap"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "input" ? "Input Nilai" : "Rekap Nilai"}
          </button>
        ))}
      </div>

      {tab === "input" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex gap-3 p-5 border-b border-slate-100">
            <select value={kelas} onChange={(e) => setKelas(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              {["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"].map((k) => <option key={k}>{k}</option>)}
            </select>
            <select value={mapel} onChange={(e) => setMapel(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option>Matematika</option><option>B. Indonesia</option><option>IPA</option>
            </select>
            <select className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option>Semester 1</option><option>Semester 2</option>
            </select>
          </div>

          {/* Grade grid */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Siswa</th>
                {TYPES.map((t) => (
                  <th key={t.id} className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.color}`}>{t.label}</span>
                  </th>
                ))}
                <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {STUDENTS.map((s) => {
                const g = MOCK_GRADES[s.id];
                const a = avg(g);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{s.name.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-slate-800">{s.name}</div>
                          <div className="text-xs text-slate-400">{s.nisn}</div>
                        </div>
                      </div>
                    </td>
                    {TYPES.map((t) => (
                      <td key={t.id} className="px-4 py-3.5 text-center">
                        <input
                          type="number" min={0} max={100}
                          defaultValue={g[t.id] ?? ""}
                          placeholder="—"
                          className="w-16 h-8 text-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                        />
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-center">
                      {a !== null ? (
                        <span className={`inline-flex items-center gap-1 font-bold text-sm ${a >= 75 ? "text-emerald-600" : "text-red-500"}`}>
                          {a >= 75 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {a}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-5 border-t border-slate-100 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Simpan Nilai</button>
          </div>
        </div>
      ) : (
        // Rekap tab
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Rata-rata Kelas", val: "84.2", icon: <Award className="w-5 h-5 text-amber-600" />, bg: "bg-amber-100" },
              { label: "Siswa Tuntas", val: "22/27", icon: <Percent className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-100" },
              { label: "Perlu Remedial", val: "5", icon: <TrendingDown className="w-5 h-5 text-red-500" />, bg: "bg-red-100" },
            ].map(({ label, val, icon, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">{icon}</div>
                <div><div className="text-xs font-semibold text-slate-600">{label}</div><div className="text-2xl font-black text-slate-800">{val}</div></div>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100"><th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase">Siswa</th><th className="text-center px-4 py-2 text-xs font-bold text-slate-500">Formatif</th><th className="text-center px-4 py-2 text-xs font-bold text-slate-500">S. Tengah</th><th className="text-center px-4 py-2 text-xs font-bold text-slate-500">Rata-rata</th><th className="text-center px-4 py-2 text-xs font-bold text-slate-500">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {STUDENTS.map((s) => {
                const g = MOCK_GRADES[s.id];
                const a = avg(g);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3"><span className="font-semibold text-slate-800">{s.name}</span></td>
                    <td className="px-4 py-3 text-center text-slate-600">{g.formatif ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{g.sumatif_tengah ?? "—"}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{a ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {a !== null ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${a >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {a >= 75 ? "Tuntas" : "Remedial"}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
