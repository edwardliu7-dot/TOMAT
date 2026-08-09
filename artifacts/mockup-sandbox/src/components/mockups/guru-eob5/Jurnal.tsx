import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, Edit2, Calendar, BookOpen, CheckCircle2, Clock, Filter, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

const JOURNALS = [
  { id: 1, mapel: "Matematika", kelas: "VIII Ibnu Sina", materi: "Teorema Pythagoras — Pembuktian Visual", tanggal: "2026-08-04", jp: 2, hadir: 27, catatan: "Siswa antusias dengan demonstrasi papan tulis." },
  { id: 2, mapel: "Matematika", kelas: "VII Ibnu Batuttah", materi: "Bilangan Bulat dan Operasinya", tanggal: "2026-08-04", jp: 2, hadir: 25, catatan: "Latihan soal kelompok berjalan lancar." },
  { id: 3, mapel: "Matematika", kelas: "IX Al Khawarizmi", materi: "Transformasi Geometri — Refleksi", tanggal: "2026-08-03", jp: 2, hadir: 26, catatan: "Penggunaan GeoGebra membantu visualisasi." },
  { id: 4, mapel: "Matematika", kelas: "VIII Ibnu Sina", materi: "Persamaan Linear Dua Variabel", tanggal: "2026-08-02", jp: 2, hadir: 28, catatan: "" },
  { id: 5, mapel: "Matematika", kelas: "VII Ibnu Batuttah", materi: "Himpunan — Operasi Irisan", tanggal: "2026-08-01", jp: 2, hadir: 24, catatan: "Satu siswa izin." },
];

const MONTHS = [
  { label: "Juli 2026", target: 18, done: 14 },
  { label: "Agustus 2026", target: 18, done: 5 },
];

export function Jurnal() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("semua");

  return (
    <PageShell active="jurnal" title="Jurnal Mengajar">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Jurnal Mengajar</h1>
          <p className="text-sm text-slate-500 mt-1">Rekam aktivitas mengajar harian</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Jurnal
        </button>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {MONTHS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</div>
                <div className="text-2xl font-black text-slate-800 mt-1">{m.done}<span className="text-sm font-semibold text-slate-400">/{m.target} JP</span></div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.done >= m.target ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {Math.round((m.done / m.target) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${m.done >= m.target ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min((m.done / m.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add journal form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Entri Jurnal Baru</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Mata Pelajaran</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option>Matematika</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kelas</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option>VIII Ibnu Sina</option>
                <option>VII Ibnu Batuttah</option>
                <option>IX Al Khawarizmi</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tanggal</label>
              <input type="date" defaultValue="2026-08-04" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Materi</label>
              <input type="text" placeholder="Topik yang diajarkan..." className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Catatan (opsional)</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" placeholder="Catatan tambahan..." />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Batal</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Simpan</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["semua", "VIII Ibnu Sina", "VII Ibnu Batuttah", "IX Al Khawarizmi"].map((k) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === k ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {k === "semua" ? "Semua Kelas" : k}
          </button>
        ))}
      </div>

      {/* Journal list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {JOURNALS.filter((j) => filter === "semua" || j.kelas === filter).map((j) => (
          <div key={j.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800">{j.materi}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-semibold">{j.kelas}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{j.tanggal}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3 h-3" />{j.hadir} hadir</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.jp} JP</span>
                </div>
                {j.catatan && <p className="text-xs text-slate-400 mt-1 italic">{j.catatan}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
