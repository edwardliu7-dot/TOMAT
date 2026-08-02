import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Plus, Trash2, ChevronLeft, Download, Lock, CalendarOff, Table2 } from "lucide-react";

const PROSEM_LIST = [
  { id: 1, mapel: "Matematika", kelas: "VIII Ibnu Sina", sem: 1, tahun: "2026/2027", items: 24 },
  { id: 2, mapel: "Matematika", kelas: "VII Ibnu Batuttah", sem: 1, tahun: "2026/2027", items: 20 },
  { id: 3, mapel: "Matematika", kelas: "IX Al Khawarizmi", sem: 1, tahun: "2026/2027", items: 18 },
];

const WEEKS = ["Mg 1", "Mg 2", "Mg 3", "Mg 4", "Mg 5", "Mg 6", "Mg 7", "Mg 8"];

const ITEMS = [
  { lm: 1, materi: "Bilangan Berpangkat dan Bentuk Akar", jp: 6, week: 1 },
  { lm: 2, materi: "Notasi Ilmiah", jp: 4, week: 2 },
  { lm: 3, materi: "Pola Bilangan", jp: 6, week: 3 },
  { lm: 4, materi: "Koordinat Kartesius", jp: 4, week: 4 },
  { lm: 5, materi: "Relasi dan Fungsi", jp: 8, week: 5 },
  { lm: 6, materi: "Persamaan Garis Lurus", jp: 8, week: 6 },
];

export function Prosem() {
  const [selected, setSelected] = useState<number | null>(null);

  if (selected !== null) {
    const p = PROSEM_LIST.find((x) => x.id === selected)!;
    return (
      <PageShell active="prosem" title="Program Semester">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{p.mapel} — {p.kelas}</h1>
            <p className="text-sm text-slate-500">Semester {p.sem} · {p.tahun}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" /> Ekspor XLSX
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Tambah Topik
            </button>
          </div>
        </div>

        {/* Grid view */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wide w-8">LM</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wide">Materi</th>
                  <th className="px-3 py-3 font-bold text-slate-500 text-center">JP</th>
                  {WEEKS.map((w) => (
                    <th key={w} className="px-2 py-3 font-bold text-slate-400 text-center w-12">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ITEMS.map((item) => (
                  <tr key={item.lm} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-bold inline-flex items-center justify-center text-xs">{item.lm}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.materi}</td>
                    <td className="px-3 py-3 text-center text-slate-500 font-semibold">{item.jp}</td>
                    {WEEKS.map((_, wi) => (
                      <td key={wi} className="px-2 py-3 text-center">
                        {wi + 1 === item.week ? (
                          <div className="w-7 h-7 rounded bg-blue-500 mx-auto" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-slate-100 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell active="prosem" title="Program Semester">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program Semester</h1>
          <p className="text-sm text-slate-500 mt-1">Rencana pembelajaran per semester</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Buat Prosem
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PROSEM_LIST.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setSelected(p.id)}>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Table2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{p.mapel}</h3>
              <p className="text-sm text-slate-500">{p.kelas} · Semester {p.sem} · {p.tahun}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-black text-slate-700">{p.items}</div>
              <div className="text-xs text-slate-400">topik</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
