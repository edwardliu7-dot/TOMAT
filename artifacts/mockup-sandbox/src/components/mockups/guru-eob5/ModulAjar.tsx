import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, FileText, ExternalLink, Download, Search, BookOpen } from "lucide-react";
import { useState } from "react";

const MATERIALS = [
  { id: "1", judul: "Modul Pythagoras — Pembuktian Visual", mapel: "Matematika", kelas: "VIII Ibnu Sina", jenis: "Modul", tanggal: "2026-08-01", url: "https://docs.google.com/..." },
  { id: "2", judul: "Presentasi Bilangan Bulat.pptx", mapel: "Matematika", kelas: "VII Ibnu Batuttah", jenis: "Presentasi", tanggal: "2026-07-28", url: "#" },
  { id: "3", judul: "Lembar Kerja Siswa Transformasi", mapel: "Matematika", kelas: "IX Al Khawarizmi", jenis: "LKS", tanggal: "2026-07-25", url: "#" },
  { id: "4", judul: "Video Tutorial Persamaan Linear", mapel: "Matematika", kelas: "VIII Ibnu Sina", jenis: "Video", tanggal: "2026-07-20", url: "https://youtube.com/..." },
  { id: "5", judul: "Soal Latihan Himpunan", mapel: "Matematika", kelas: "VII Ibnu Batuttah", jenis: "Soal", tanggal: "2026-07-18", url: "#" },
];

const TYPE_COLORS: Record<string, string> = {
  Modul: "bg-blue-100 text-blue-700",
  Presentasi: "bg-violet-100 text-violet-700",
  LKS: "bg-emerald-100 text-emerald-700",
  Video: "bg-red-100 text-red-600",
  Soal: "bg-amber-100 text-amber-700",
};

export function ModulAjar() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const filtered = MATERIALS.filter((m) => m.judul.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell active="modul-ajar" title="Modul Ajar">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Modul Ajar</h1>
          <p className="text-sm text-slate-500 mt-1">Bahan ajar dan materi pembelajaran</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Bahan
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Tambah Bahan Ajar</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Judul</label>
              <input placeholder="Nama bahan ajar" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Mata Pelajaran</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"><option>Matematika</option></select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kelas</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                {["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"].map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jenis</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                {["Modul", "Presentasi", "LKS", "Video", "Soal"].map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">URL / Link</label>
              <input placeholder="https://..." className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Batal</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">Simpan</button>
          </div>
        </div>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari bahan ajar..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 truncate">{m.judul}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[m.jenis] ?? "bg-slate-100 text-slate-600"}`}>{m.jenis}</span>
                <span className="text-xs text-slate-400">{m.kelas} · {m.tanggal}</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600">
                <ExternalLink className="w-4 h-4" />
              </a>
              <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
