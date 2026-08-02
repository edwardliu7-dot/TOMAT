import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, Edit2, Search, Users, BookOpen, Briefcase } from "lucide-react";
import { useState } from "react";

const TEACHERS = [
  { id: "1", name: "Pak Budi Santoso", username: "pak.budi", mapel: ["Matematika"], jabatan: ["guru"], isAdmin: false },
  { id: "2", name: "Bu Ratna Dewi", username: "bu.ratna", mapel: ["B. Indonesia"], jabatan: ["guru", "wali_kelas"], isAdmin: false },
  { id: "3", name: "Pak Ahmad Yusuf", username: "pak.ahmad", mapel: ["IPA"], jabatan: ["guru"], isAdmin: false },
  { id: "4", name: "Bu Siti Aminah", username: "bu.siti", mapel: ["PKN"], jabatan: ["guru", "wali_kelas"], isAdmin: false },
  { id: "5", name: "Admin TISA", username: "admin", mapel: [], jabatan: ["kepala_sekolah"], isAdmin: true },
];

const JAB_LABELS: Record<string, string> = { guru: "Guru", wali_kelas: "Wali Kelas", kepala_sekolah: "Kepala Sekolah", wakasek: "Wakasek" };
const JAB_COLOR: Record<string, string> = { guru: "bg-slate-100 text-slate-600", wali_kelas: "bg-violet-100 text-violet-700", kepala_sekolah: "bg-amber-100 text-amber-700" };

export function Guru() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const filtered = TEACHERS.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell active="guru" title="Manajemen Guru">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Guru</h1>
          <p className="text-sm text-slate-500 mt-1">{TEACHERS.length} akun terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Tambah Guru / Admin Baru</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[{ label: "Nama Lengkap", ph: "Nama guru" }, { label: "Username", ph: "pak.nama" }].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                <input placeholder={f.ph} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Role</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <option value="guru">Guru</option><option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Password Awal</label>
              <input type="password" placeholder="••••••••" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau username..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.map((t) => (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${t.isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
              {t.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-slate-800">{t.name}</span>
                {t.isAdmin && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">ADMIN</span>}
                {t.jabatan.map((j) => (
                  <span key={j} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${JAB_COLOR[j] ?? "bg-slate-100 text-slate-600"}`}>{JAB_LABELS[j]}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>@{t.username}</span>
                {t.mapel.length > 0 && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{t.mapel.join(", ")}</span>}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
