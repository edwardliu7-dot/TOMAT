import { PageShell } from "./_shared/Sidebar";
import { BookOpen, ListChecks, CheckCircle2, Clock, ChevronRight, BarChart3, Plus } from "lucide-react";
import { useState } from "react";

const SUBJECTS = [
  { name: "Matematika", guru: "Pak Budi Santoso", prosemDone: 3, prosemTotal: 3, tpDone: 24, tpTotal: 24, progress: 100 },
  { name: "B. Indonesia", guru: "Bu Ratna Dewi", prosemDone: 3, prosemTotal: 3, tpDone: 18, tpTotal: 20, progress: 90 },
  { name: "IPA", guru: "Pak Ahmad Yusuf", prosemDone: 2, prosemTotal: 3, tpDone: 12, tpTotal: 24, progress: 50 },
  { name: "PKN", guru: "Bu Siti Aminah", prosemDone: 1, prosemTotal: 3, tpDone: 8, tpTotal: 18, progress: 44 },
  { name: "PJOK", guru: "Pak Rudi Hermawan", prosemDone: 3, prosemTotal: 3, tpDone: 20, tpTotal: 20, progress: 100 },
  { name: "Seni Teater", guru: "Bu Lina Kartika", prosemDone: 2, prosemTotal: 3, tpDone: 14, tpTotal: 18, progress: 78 },
];

const SUMMARY = [
  { label: "Mata Pelajaran", val: SUBJECTS.length },
  { label: "Prosem Lengkap", val: `${SUBJECTS.filter((s) => s.prosemDone === s.prosemTotal).length}/${SUBJECTS.length}` },
  { label: "TP Terdaftar", val: SUBJECTS.reduce((a, s) => a + s.tpTotal, 0) },
  { label: "Avg. Kelengkapan", val: `${Math.round(SUBJECTS.reduce((a, s) => a + s.progress, 0) / SUBJECTS.length)}%` },
];

export function Kurikulum() {
  return (
    <PageShell active="kurikulum" title="Kurikulum">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kurikulum</h1>
          <p className="text-sm text-slate-500 mt-1">Kelengkapan dokumen kurikulum per mata pelajaran</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {SUMMARY.map(({ label, val }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-black text-slate-800">{val}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SUBJECTS.map((s) => (
          <div key={s.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.guru}</div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.progress === 100 ? "bg-emerald-100 text-emerald-700" : s.progress >= 75 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                {s.progress}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Prosem", val: `${s.prosemDone}/${s.prosemTotal}`, done: s.prosemDone === s.prosemTotal },
                { label: "Tujuan Pembelajaran", val: `${s.tpDone}/${s.tpTotal}`, done: s.tpDone === s.tpTotal },
                { label: "Status", val: s.progress === 100 ? "Lengkap" : "Belum Lengkap", done: s.progress === 100 },
              ].map(({ label, val, done }) => (
                <div key={label} className={`rounded-xl p-3 ${done ? "bg-emerald-50" : "bg-amber-50"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{label}</span>
                  </div>
                  <div className={`text-sm font-bold ${done ? "text-emerald-700" : "text-amber-700"}`}>{val}</div>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.progress === 100 ? "bg-emerald-500" : s.progress >= 75 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${s.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
