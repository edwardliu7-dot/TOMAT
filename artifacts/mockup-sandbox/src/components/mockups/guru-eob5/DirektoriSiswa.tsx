import { PageShell } from "./_shared/Sidebar";
import { Search, Download, Users } from "lucide-react";
import { useState } from "react";

const STUDENTS = [
  { id: "1", name: "Achmad Fauzi", kelas: "VIII Ibnu Sina", nisn: "0091234567", gender: "L", hadir: 98, nilai: 85 },
  { id: "2", name: "Bunga Pertiwi", kelas: "VIII Ibnu Sina", nisn: "0091234568", gender: "P", hadir: 100, nilai: 91 },
  { id: "3", name: "Cahya Ramadhan", kelas: "VII Ibnu Batuttah", nisn: "0091234569", gender: "L", hadir: 92, nilai: 75 },
  { id: "4", name: "Dian Safitri", kelas: "VIII Ibnu Sina", nisn: "0091234570", gender: "P", hadir: 97, nilai: 95 },
  { id: "5", name: "Endra Wijaya", kelas: "IX Al Khawarizmi", nisn: "0091234571", gender: "L", hadir: 88, nilai: 71 },
  { id: "6", name: "Fitri Handayani", kelas: "VII Ibnu Batuttah", nisn: "0091234572", gender: "P", hadir: 95, nilai: 83 },
  { id: "7", name: "Galih Prakoso", kelas: "IX Al Khawarizmi", nisn: "0091234573", gender: "L", hadir: 96, nilai: 79 },
  { id: "8", name: "Hana Kusuma", kelas: "VII Ibnu Batuttah", nisn: "0091234574", gender: "P", hadir: 99, nilai: 88 },
];

export function DirektoriSiswa() {
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("semua");
  const filtered = STUDENTS.filter((s) =>
    (kelas === "semua" || s.kelas === kelas) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const kelasList = [...new Set(STUDENTS.map((s) => s.kelas))].sort();

  return (
    <PageShell active="direktori-siswa" title="Direktori Siswa">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Direktori Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">{STUDENTS.length} siswa terdaftar</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" /> Ekspor
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau NISN..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={kelas} onChange={(e) => setKelas(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="semua">Semua Kelas</option>
          {kelasList.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {kelasList.map((k) => (
          <div key={k} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium truncate">{k}</div>
              <div className="text-xl font-black text-slate-800">{STUDENTS.filter((s) => s.kelas === k).length}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Nama</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Kelas</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">NISN</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">L/P</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Kehadiran</th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Nilai Avg</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{s.name.charAt(0)}</div>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{s.kelas}</td>
                <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{s.nisn}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.gender === "P" ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"}`}>{s.gender}</span>
                </td>
                <td className="px-4 py-3.5 text-center"><span className={`font-bold text-sm ${s.hadir >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{s.hadir}%</span></td>
                <td className="px-4 py-3.5 text-center font-bold text-slate-700">{s.nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
