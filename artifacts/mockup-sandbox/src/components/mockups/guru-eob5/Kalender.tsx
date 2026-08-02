import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, Pencil, CheckCircle2, Clock, CalendarX, MoreVertical } from "lucide-react";

const CALENDARS = [
  { id: 1, name: "Tahun Ajaran 2026/2027", active: true, weeks: 36 },
  { id: 2, name: "Tahun Ajaran 2025/2026", active: false, weeks: 36 },
];

const WEEKS = [
  { id: 1, num: 1, label: "Mg 1", start: "2026-07-14", end: "2026-07-18", status: "efektif" as const, keterangan: "Awal Tahun Ajaran" },
  { id: 2, num: 2, label: "Mg 2", start: "2026-07-21", end: "2026-07-25", status: "efektif" as const, keterangan: "" },
  { id: 3, num: 3, label: "Mg 3", start: "2026-07-28", end: "2026-08-01", status: "efektif" as const, keterangan: "" },
  { id: 4, num: 4, label: "Mg 4", start: "2026-08-04", end: "2026-08-08", status: "efektif" as const, keterangan: "Pekan Ulangan Harian 1" },
  { id: 5, num: 5, label: "Mg 5", start: "2026-08-11", end: "2026-08-15", status: "libur" as const, keterangan: "HUT RI ke-81" },
  { id: 6, num: 6, label: "Mg 6", start: "2026-08-18", end: "2026-08-22", status: "efektif" as const, keterangan: "" },
  { id: 7, num: 7, label: "Mg 7", start: "2026-08-25", end: "2026-08-29", status: "efektif" as const, keterangan: "" },
  { id: 8, num: 8, label: "Mg 8", start: "2026-09-01", end: "2026-09-05", status: "ujian" as const, keterangan: "Sumatif Tengah Semester" },
];

const statusStyle = {
  efektif: "bg-emerald-100 text-emerald-700 border-emerald-200",
  libur: "bg-red-100 text-red-600 border-red-200",
  ujian: "bg-amber-100 text-amber-700 border-amber-200",
};
const statusLabel = { efektif: "Efektif", libur: "Libur", ujian: "Ujian/Tes" };

export function Kalender() {
  const [cal, setCal] = useState(1);
  const [showForm, setShowForm] = useState(false);

  return (
    <PageShell active="kalender" title="Kalender Akademik">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kalender Akademik</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola tahun ajaran dan pekan efektif</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Pekan
        </button>
      </div>

      {/* Calendar selector */}
      <div className="flex gap-3 mb-6">
        {CALENDARS.map((c) => (
          <button key={c.id} onClick={() => setCal(c.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              cal === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}>
            {c.active && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
            {c.name}
            <span className="text-xs font-medium text-slate-400">{c.weeks} mg</span>
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-200 text-sm font-medium text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
          <Plus className="w-4 h-4" /> Tahun Ajaran Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pekan Efektif", val: 6, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-100" },
          { label: "Pekan Libur", val: 1, icon: <CalendarX className="w-5 h-5 text-red-500" />, bg: "bg-red-100" },
          { label: "Pekan Ujian", val: 1, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: "bg-amber-100" },
        ].map(({ label, val, icon, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center">{icon}</div>
            <div>
              <div className="text-xs font-semibold text-slate-600">{label}</div>
              <div className="text-2xl font-black text-slate-800">{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Weeks table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase w-12">Mg</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Keterangan</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {WEEKS.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-3.5 text-center">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs inline-flex items-center justify-center">{w.num}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-xs font-medium text-slate-500">{w.start}</div>
                  <div className="text-[10px] text-slate-300">s/d {w.end}</div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle[w.status]}`}>
                    {statusLabel[w.status]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{w.keterangan || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
