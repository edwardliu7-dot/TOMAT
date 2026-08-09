import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, FileText, BookOpen, Upload, FolderOpen, Download, Eye } from "lucide-react";
import { useState } from "react";

const DOCS = [
  { id: "1", name: "RPP Matematika Kelas VIII Sem 1", type: "RPP", kelas: "VIII Ibnu Sina", tanggal: "2026-08-01", url: "#", size: "245 KB" },
  { id: "2", name: "Silabus Matematika 2026/2027", type: "Silabus", kelas: "Semua", tanggal: "2026-07-14", url: "#", size: "182 KB" },
  { id: "3", name: "SK Mengajar Semester 1", type: "SK", kelas: "Semua", tanggal: "2026-07-10", url: "#", size: "98 KB" },
  { id: "4", name: "Jurnal Mengajar Juli 2026", type: "Jurnal", kelas: "VIII Ibnu Sina", tanggal: "2026-07-31", url: "#", size: "120 KB" },
  { id: "5", name: "Rekap Absensi Q1", type: "Rekap", kelas: "VIII Ibnu Sina", tanggal: "2026-07-28", url: "#", size: "88 KB" },
];

const SUBJECTS = [
  { id: "1", name: "Matematika", active: true },
  { id: "2", name: "B. Indonesia", active: true },
  { id: "3", name: "IPA", active: true },
  { id: "4", name: "PKN", active: true },
];

const DOC_TYPE_COLORS: Record<string, string> = {
  RPP: "bg-blue-100 text-blue-700",
  Silabus: "bg-violet-100 text-violet-700",
  SK: "bg-emerald-100 text-emerald-700",
  Jurnal: "bg-amber-100 text-amber-700",
  Rekap: "bg-slate-100 text-slate-600",
};

export function Administrasi() {
  const [tab, setTab] = useState<"dokumen" | "mapel">("dokumen");
  const [showUpload, setShowUpload] = useState(false);

  return (
    <PageShell active="administrasi" title="Administrasi">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrasi</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dokumen, mata pelajaran, dan berkas administrasi</p>
        </div>
        {tab === "dokumen" && (
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Upload className="w-4 h-4" /> Upload Dokumen
          </button>
        )}
        {tab === "mapel" && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Tambah Mapel
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(["dokumen", "mapel"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "dokumen" ? <><FolderOpen className="w-4 h-4" /> Dokumen</> : <><BookOpen className="w-4 h-4" /> Mata Pelajaran</>}
          </button>
        ))}
      </div>

      {tab === "dokumen" ? (
        <>
          {showUpload && (
            <div className="bg-white rounded-2xl border border-dashed border-blue-300 p-8 mb-5 text-center">
              <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">Seret & lepas file di sini</p>
              <p className="text-xs text-slate-400 mb-4">PDF, DOCX, XLSX hingga 10 MB</p>
              <button className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">Pilih File</button>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {DOCS.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{d.name}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DOC_TYPE_COLORS[d.type] ?? "bg-slate-100 text-slate-600"}`}>{d.type}</span>
                    <span className="text-xs text-slate-400">{d.kelas} · {d.tanggal} · {d.size}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Download className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {SUBJECTS.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-slate-800">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  {s.active ? "Aktif" : "Nonaktif"}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
