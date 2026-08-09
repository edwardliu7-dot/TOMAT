import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, Edit2, Clock } from "lucide-react";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const SCHEDULE: Record<string, { mapel: string; kelas: string; jam: string; ruang: string; color: string }[]> = {
  Senin: [
    { mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "07:00–08:20", ruang: "R. 201", color: "bg-blue-50 border-blue-200 text-blue-800" },
    { mapel: "Matematika", kelas: "VII Ibnu Batuttah", jam: "08:30–09:50", ruang: "R. 103", color: "bg-violet-50 border-violet-200 text-violet-800" },
    { mapel: "Matematika", kelas: "IX Al Khawarizmi", jam: "13:00–14:20", ruang: "R. 301", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  ],
  Selasa: [
    { mapel: "Matematika", kelas: "IX Al Khawarizmi", jam: "07:00–08:20", ruang: "R. 301", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  ],
  Rabu: [
    { mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "10:00–11:20", ruang: "R. 201", color: "bg-blue-50 border-blue-200 text-blue-800" },
    { mapel: "Matematika", kelas: "VII Ibnu Batuttah", jam: "13:30–14:50", ruang: "R. 103", color: "bg-violet-50 border-violet-200 text-violet-800" },
  ],
  Kamis: [
    { mapel: "Matematika", kelas: "IX Al Khawarizmi", jam: "08:00–09:20", ruang: "R. 301", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  ],
  Jumat: [
    { mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "07:30–08:50", ruang: "R. 201", color: "bg-blue-50 border-blue-200 text-blue-800" },
  ],
  Sabtu: [],
};

export function Jadwal() {
  const [kelas, setKelas] = useState("semua");
  const [showForm, setShowForm] = useState(false);

  const totalJP = Object.values(SCHEDULE).reduce((acc, day) => acc + day.length * 2, 0);

  return (
    <PageShell active="jadwal" title="Jadwal Pelajaran">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jadwal Pelajaran</h1>
          <p className="text-sm text-slate-500 mt-1">Timetable mingguan · {totalJP} JP/minggu</p>
        </div>
        <div className="flex gap-2">
          <select value={kelas} onChange={(e) => setKelas(e.target.value)}
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="semua">Semua Kelas</option>
            <option>VII Ibnu Batuttah</option>
            <option>VIII Ibnu Sina</option>
            <option>IX Al Khawarizmi</option>
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Sesi
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Tambah Jadwal Baru</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: "Hari", type: "select", opts: DAYS },
              { label: "Mata Pelajaran", type: "text", ph: "Matematika" },
              { label: "Kelas", type: "select", opts: ["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"] },
              { label: "Jam Mulai", type: "time" },
              { label: "Jam Selesai", type: "time" },
              { label: "Ruang", type: "text", ph: "R. 201" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                {f.type === "select" ? (
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    {f.opts?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} placeholder={f.ph} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Batal</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">Simpan</button>
          </div>
        </div>
      )}

      {/* Timetable grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const sessions = SCHEDULE[day].filter((s) => kelas === "semua" || s.kelas === kelas);
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`px-4 py-3 border-b border-slate-100 ${sessions.length > 0 ? "bg-slate-800" : "bg-slate-50"}`}>
                <h3 className={`text-sm font-bold ${sessions.length > 0 ? "text-white" : "text-slate-400"}`}>{day}</h3>
                <p className={`text-xs mt-0.5 ${sessions.length > 0 ? "text-white/60" : "text-slate-300"}`}>{sessions.length} sesi</p>
              </div>
              <div className="p-3 space-y-2 min-h-[80px]">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center pt-4">Tidak ada jadwal</p>
                ) : sessions.map((s, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${s.color} group relative`}>
                    <div className="font-semibold text-sm">{s.mapel}</div>
                    <div className="text-xs mt-0.5 opacity-70">{s.kelas}</div>
                    <div className="flex items-center gap-1 text-xs mt-1 opacity-60">
                      <Clock className="w-3 h-3" />{s.jam} · {s.ruang}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-white/60"><Edit2 className="w-3 h-3" /></button>
                      <button className="p-1 rounded hover:bg-white/60"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
