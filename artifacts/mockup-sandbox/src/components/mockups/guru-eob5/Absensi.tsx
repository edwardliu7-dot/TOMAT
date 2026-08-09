import { useState } from "react";
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardCheck, FolderOpen,
  Users, Star, BarChart3, CalendarDays, Settings2, LogOut, ChevronRight,
  CalendarCheck2, History, Search, Check, Bell, Loader2, Info, Trash2,
  CheckCircle2, Thermometer, Mail, AlertTriangle,
} from "lucide-react";

// ── Sidebar (mini) ────────────────────────────────────────────────────────────
function Sidebar() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: FolderOpen, label: "Administrasi" },
    { icon: CalendarDays, label: "Jadwal" },
    { icon: BookOpen, label: "Jurnal" },
    { icon: ClipboardCheck, label: "Absensi", active: true },
    { icon: GraduationCap, label: "Nilai" },
    { icon: Star, label: "Poin Siswa" },
    { icon: BarChart3, label: "Rekap" },
    { icon: Settings2, label: "Pengaturan" },
  ];
  return (
    <aside className="w-[56px] shrink-0 h-screen bg-[#0f1c36] flex flex-col overflow-hidden">
      <div className="flex items-center justify-center h-14 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
      </div>
      <nav className="flex-1 flex flex-col items-center gap-1 py-3">
        {items.map(({ icon: Icon, label, active }: any) => (
          <button
            key={label}
            title={label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
              ${active ? "bg-blue-600 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-1 pb-3">
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">PB</div>
        <button className="w-10 h-10 rounded-lg text-white/40 hover:text-white flex items-center justify-center">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpa";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  hadir: "Hadir", sakit: "Sakit", izin: "Izin", alpa: "Alpa",
};

const statusActiveClass: Record<AttendanceStatus, string> = {
  hadir: "bg-emerald-500 text-white shadow-sm",
  sakit: "bg-orange-500 text-white shadow-sm",
  izin:  "bg-blue-500 text-white shadow-sm",
  alpa:  "bg-red-500 text-white shadow-sm",
};

const statusInactiveClass = "bg-slate-100 text-slate-600 hover:bg-slate-200";

const STUDENTS = [
  { id: "1", name: "Achmad Fauzi", nisn: "0091234567" },
  { id: "2", name: "Bunga Pertiwi", nisn: "0091234568" },
  { id: "3", name: "Cahya Ramadhan", nisn: "0091234569" },
  { id: "4", name: "Dian Safitri", nisn: "0091234570" },
  { id: "5", name: "Endra Wijaya", nisn: "0091234571" },
  { id: "6", name: "Fitri Handayani", nisn: "0091234572" },
  { id: "7", name: "Galih Prakoso", nisn: "0091234573" },
  { id: "8", name: "Hana Kusuma", nisn: "0091234574" },
];

const REKAP = [
  { tanggal: "2026-08-01", kelas: "VIII Ibnu Sina", mapel: "Matematika", hadir: 26, tidak: 1, status: ["sakit"] },
  { tanggal: "2026-07-31", kelas: "VIII Ibnu Sina", mapel: "Matematika", hadir: 27, tidak: 0, status: [] },
  { tanggal: "2026-07-30", kelas: "VII Ibnu Batuttah", mapel: "B. Indonesia", hadir: 24, tidak: 2, status: ["izin", "alpa"] },
];

export function Absensi() {
  const [tab, setTab] = useState<"input" | "rekap">("input");
  const [kelas, setKelas] = useState("VIII Ibnu Sina");
  const [tanggal] = useState("2026-08-04");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(STUDENTS.map((s) => [s.id, "hadir"]))
  );

  const filtered = STUDENTS.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const hadirCount = Object.values(rows).filter((v) => v === "hadir").length;
  const tidakCount = STUDENTS.length - hadirCount;

  return (
    <div className="flex h-screen bg-[#faf9f7] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">SMARTISA</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-xs text-slate-600 font-semibold">Absensi</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Absensi Siswa</h1>
              <p className="text-sm text-slate-500 mt-1">Catat kehadiran harian dan lihat rekap absensi</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
              {(["input", "rekap"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "input" ? <><CalendarCheck2 className="w-4 h-4" /> Input Absensi</> : <><History className="w-4 h-4" /> Riwayat</>}
                </button>
              ))}
            </div>

            {tab === "input" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form left */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  {/* Filters */}
                  <div className="flex gap-3 mb-5">
                    <select
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"].map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={tanggal}
                      readOnly
                      className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none"
                    />
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari siswa..."
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  {/* Student rows */}
                  <div className="divide-y divide-slate-100">
                    {filtered.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 py-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-400">{s.nisn}</div>
                        </div>
                        <div className="flex gap-1">
                          {(["hadir", "sakit", "izin", "alpa"] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => setRows({ ...rows, [s.id]: st })}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                rows[s.id] === st ? statusActiveClass[st] : statusInactiveClass
                              }`}
                            >
                              {STATUS_LABELS[st]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 h-10 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Simpan Absensi
                  </button>
                </div>

                {/* Summary right */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-4">Ringkasan</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Kelas</span>
                        <span className="text-sm font-bold text-slate-800">{kelas}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Total Siswa</span>
                        <span className="text-sm font-bold text-slate-800">{STUDENTS.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-sm text-slate-600">Hadir</span></div>
                        <span className="text-sm font-bold text-emerald-600">{hadirCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-orange-500" /><span className="text-sm text-slate-600">Tidak Hadir</span></div>
                        <span className="text-sm font-bold text-orange-600">{tidakCount}</span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(hadirCount / STUDENTS.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {Math.round((hadirCount / STUDENTS.length) * 100)}% kehadiran
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Rekap tab
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Riwayat Absensi Terbaru</h3>
                <div className="space-y-3">
                  {REKAP.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <CalendarCheck2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-800">{r.kelas}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold">{r.mapel}</span>
                        </div>
                        <p className="text-xs text-slate-500">{r.tanggal}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-emerald-600">{r.hadir} hadir</span>
                        {r.tidak > 0 && (
                          <p className="text-xs text-orange-500 font-semibold">{r.tidak} tidak hadir</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
