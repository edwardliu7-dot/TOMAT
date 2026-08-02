import { PageShell } from "./_shared/Sidebar";
import { KeyRound, Search, Plus, Trash2, Edit2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";

const ACCOUNTS = [
  { id: "1", name: "Achmad Fauzi", username: "achmad.fauzi", kelas: "VIII Ibnu Sina", active: true, lastLogin: "2026-08-04" },
  { id: "2", name: "Bunga Pertiwi", username: "bunga.pertiwi", kelas: "VIII Ibnu Sina", active: true, lastLogin: "2026-08-04" },
  { id: "3", name: "Cahya Ramadhan", username: "cahya.ramadhan", kelas: "VII Ibnu Batuttah", active: true, lastLogin: "2026-08-03" },
  { id: "4", name: "Dian Safitri", username: "dian.safitri", kelas: "VIII Ibnu Sina", active: true, lastLogin: "2026-08-04" },
  { id: "5", name: "Endra Wijaya", username: "endra.wijaya", kelas: "IX Al Khawarizmi", active: false, lastLogin: "2026-07-28" },
  { id: "6", name: "Fitri Handayani", username: "fitri.handayani", kelas: "VII Ibnu Batuttah", active: true, lastLogin: "2026-08-02" },
];

export function AkunSiswa() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showPass, setShowPass] = useState<string | null>(null);
  const filtered = ACCOUNTS.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell active="akun-siswa" title="Akun Siswa">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Akun Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akun login siswa</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Buat Akun
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Buat Akun Siswa Baru</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: "Nama Siswa", ph: "Nama lengkap" },
              { label: "Username", ph: "nama.siswa" },
              { label: "Kelas", type: "select" },
              { label: "Password Awal", ph: "Min. 6 karakter", type: "password" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                {f.type === "select" ? (
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                    {["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"].map((k) => <option key={k}>{k}</option>)}
                  </select>
                ) : (
                  <input type={f.type ?? "text"} placeholder={f.ph}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Batal</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg">Buat Akun</button>
          </div>
        </div>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau username..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Siswa</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Username</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Kelas</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Login Terakhir</th>
            <th className="px-4 py-3 w-24"></th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{a.name.charAt(0)}</div>
                    <span className="font-semibold text-slate-800">{a.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{a.username}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{a.kelas}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"}`}>
                    {a.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-400">{a.lastLogin}</td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Reset password" className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"><KeyRound className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
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
