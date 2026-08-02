import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Trophy, TrendingUp, TrendingDown, History, Users } from "lucide-react";
import { useState } from "react";

const STUDENTS = [
  { id: "1", name: "Bunga Pertiwi", kelas: "VIII Ibnu Sina", poin: 450, rank: 1, trend: "up" },
  { id: "2", name: "Dian Safitri", kelas: "VIII Ibnu Sina", poin: 420, rank: 2, trend: "up" },
  { id: "3", name: "Achmad Fauzi", kelas: "VIII Ibnu Sina", poin: 320, rank: 3, trend: "stable" },
  { id: "4", name: "Fatimah Zahra", kelas: "VIII Ibnu Sina", poin: 290, rank: 4, trend: "up" },
  { id: "5", name: "Gilang Putra", kelas: "VIII Ibnu Sina", poin: 240, rank: 5, trend: "down" },
  { id: "6", name: "Endra Wijaya", kelas: "VIII Ibnu Sina", poin: 180, rank: 6, trend: "down" },
];

const HISTORY = [
  { id: "h1", siswa: "Bunga Pertiwi", poin: 50, jenis: "tambah", alasan: "Menjawab pertanyaan dengan benar", tanggal: "2026-08-04" },
  { id: "h2", siswa: "Dian Safitri", poin: 30, jenis: "tambah", alasan: "Mengerjakan PR tepat waktu", tanggal: "2026-08-04" },
  { id: "h3", siswa: "Endra Wijaya", poin: -20, jenis: "kurang", alasan: "Tidak mengumpulkan tugas", tanggal: "2026-08-03" },
  { id: "h4", siswa: "Achmad Fauzi", poin: 20, jenis: "tambah", alasan: "Aktif di kelas", tanggal: "2026-08-03" },
];

export function Poin() {
  const [tab, setTab] = useState<"rekap" | "input" | "riwayat">("rekap");
  const [kelas, setKelas] = useState("VIII Ibnu Sina");
  const [showForm, setShowForm] = useState(false);

  return (
    <PageShell active="poin" title="Poin Siswa">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Poin Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola poin perilaku dan prestasi siswa</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Beri Poin
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Input Poin Siswa</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Siswa</label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                {STUDENTS.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Poin (+ tambah / - kurang)</label>
              <input type="number" defaultValue={20} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Alasan</label>
              <input placeholder="Alasan pemberian/pengurangan poin..." className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg">Batal</button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg">Simpan</button>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(["rekap", "riwayat"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "rekap" ? <><Trophy className="w-4 h-4" /> Rekap Poin</> : <><History className="w-4 h-4" /> Riwayat</>}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <select value={kelas} onChange={(e) => setKelas(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          {["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"].map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      {tab === "rekap" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {STUDENTS.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0
                ${s.rank === 1 ? "bg-amber-100 text-amber-700" : s.rank === 2 ? "bg-slate-200 text-slate-600" : s.rank === 3 ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-700"}`}>
                {s.rank <= 3 ? <Trophy className="w-3.5 h-3.5" /> : s.rank}
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">{s.name.charAt(0)}</div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-400">{s.kelas}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-lg font-black text-amber-600">{s.poin}</div>
                  <div className="text-[10px] text-slate-400">poin</div>
                </div>
                {s.trend === "up" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                  s.trend === "down" ? <TrendingDown className="w-4 h-4 text-red-400" /> :
                    <div className="w-4 h-4 rounded-full bg-slate-200" />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {HISTORY.map((h) => (
            <div key={h.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${h.poin > 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                {h.poin > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{h.siswa}</div>
                <div className="text-xs text-slate-400">{h.alasan} · {h.tanggal}</div>
              </div>
              <div className={`text-base font-black ${h.poin > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {h.poin > 0 ? "+" : ""}{h.poin}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
