import { PageShell } from "./_shared/Sidebar";
import { Search, Contact, Mail, Phone, BookOpen, ChevronRight } from "lucide-react";
import { useState } from "react";

const TEACHERS = [
  { id: "1", name: "Pak Budi Santoso", mapel: ["Matematika"], jabatan: ["guru"], kelas: ["VIII Ibnu Sina", "VII Ibnu Batuttah", "IX Al Khawarizmi"], jurnal: 16, target: 18, phone: "0812xxxx" },
  { id: "2", name: "Bu Ratna Dewi", mapel: ["B. Indonesia"], jabatan: ["guru", "wali_kelas"], kelas: ["VIII Ibnu Sina"], jurnal: 18, target: 18, phone: "0813xxxx" },
  { id: "3", name: "Pak Ahmad Yusuf", mapel: ["IPA"], jabatan: ["guru"], kelas: ["VII Ibnu Batuttah", "IX Al Khawarizmi"], jurnal: 12, target: 18, phone: "0814xxxx" },
  { id: "4", name: "Bu Siti Aminah", mapel: ["PKN"], jabatan: ["guru", "wali_kelas"], kelas: ["VII Ibnu Batuttah"], jurnal: 9, target: 18, phone: "0815xxxx" },
  { id: "5", name: "Pak Rudi Hermawan", mapel: ["PJOK"], jabatan: ["guru"], kelas: ["VII Ibnu Batuttah", "VIII Ibnu Sina", "IX Al Khawarizmi"], jurnal: 17, target: 18, phone: "0816xxxx" },
  { id: "6", name: "Bu Lina Kartika", mapel: ["Seni Teater"], jabatan: ["guru"], kelas: ["VIII Ibnu Sina"], jurnal: 14, target: 18, phone: "0817xxxx" },
];

const JABATAN_LABELS: Record<string, string> = {
  guru: "Guru", wali_kelas: "Wali Kelas", kepala_sekolah: "Kepala Sekolah", wakasek: "Wakasek",
};

export function Direktori() {
  const [search, setSearch] = useState("");
  const filtered = TEACHERS.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell active="direktori" title="Direktori Guru">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Direktori Guru</h1>
          <p className="text-sm text-slate-500 mt-1">{TEACHERS.length} guru terdaftar di sistem</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau mata pelajaran..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((t) => {
          const pct = Math.round((t.jurnal / t.target) * 100);
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-lg font-black text-white shrink-0">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">{t.name}</span>
                  {t.jabatan.map((j) => (
                    <span key={j} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j === "wali_kelas" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                      {JABATAN_LABELS[j]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{t.mapel.join(", ")}</span>
                  <span>{t.kelas.length} kelas</span>
                </div>
              </div>
              <div className="shrink-0 text-center mx-4">
                <div className="text-sm font-bold text-slate-700">{t.jurnal}<span className="text-slate-400">/{t.target}</span></div>
                <div className="text-[10px] text-slate-400">Jurnal</div>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
