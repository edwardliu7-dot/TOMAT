import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, AlertTriangle, BookOpen, Clock, Share2, ArrowUpRight } from "lucide-react";

const WEEKS = [
  { num: 4, label: "Pekan 4 · 4–8 Agt 2026", status: "efektif" },
  { num: 3, label: "Pekan 3 · 28 Jul–1 Agt 2026", status: "efektif" },
  { num: 2, label: "Pekan 2 · 21–25 Jul 2026", status: "efektif" },
  { num: 1, label: "Pekan 1 · 14–18 Jul 2026", status: "efektif" },
];

const SCHEDULE_WEEK4 = [
  { hari: "Senin, 4 Agt", mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "07:00–08:20", materi: "Teorema Pythagoras", jp: 2, jurnal: true },
  { hari: "Senin, 4 Agt", mapel: "Matematika", kelas: "VII Ibnu Batuttah", jam: "08:30–09:50", materi: "Bilangan Bulat", jp: 2, jurnal: true },
  { hari: "Selasa, 5 Agt", mapel: "Matematika", kelas: "IX Al Khawarizmi", jam: "07:00–08:20", materi: "Transformasi Geometri", jp: 2, jurnal: false },
  { hari: "Rabu, 6 Agt", mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "10:00–11:20", materi: "Persamaan Linear", jp: 2, jurnal: false },
  { hari: "Rabu, 6 Agt", mapel: "Matematika", kelas: "VII Ibnu Batuttah", jam: "13:30–14:50", materi: "Himpunan", jp: 2, jurnal: false },
  { hari: "Kamis, 7 Agt", mapel: "Matematika", kelas: "IX Al Khawarizmi", jam: "08:00–09:20", materi: "Peluang", jp: 2, jurnal: false },
  { hari: "Jumat, 8 Agt", mapel: "Matematika", kelas: "VIII Ibnu Sina", jam: "07:30–08:50", materi: "Pythagoras Lanjutan", jp: 2, jurnal: false },
];

const groupByDay = (items: typeof SCHEDULE_WEEK4) => {
  const map: Record<string, typeof SCHEDULE_WEEK4> = {};
  for (const item of items) {
    if (!map[item.hari]) map[item.hari] = [];
    map[item.hari].push(item);
  }
  return map;
};

export function InfoPekanan() {
  const [weekIdx, setWeekIdx] = useState(0);
  const week = WEEKS[weekIdx];
  const grouped = groupByDay(SCHEDULE_WEEK4);
  const jurnal = SCHEDULE_WEEK4.filter((s) => s.jurnal).length;
  const total = SCHEDULE_WEEK4.length;

  return (
    <PageShell active="info-pekanan" title="Info Pekanan">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Info Pekanan</h1>
        <p className="text-sm text-slate-500 mt-1">Jadwal dan progres mengajar per pekan</p>
      </div>

      {/* Week navigator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekIdx(Math.min(weekIdx + 1, WEEKS.length - 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors" disabled={weekIdx >= WEEKS.length - 1}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-slate-800">{week.label}</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1 inline-block">Pekan Efektif</span>
          </div>
          <button onClick={() => setWeekIdx(Math.max(weekIdx - 1, 0))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors" disabled={weekIdx === 0}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
        {WEEKS.map((w, i) => (
          <button key={w.num} onClick={() => setWeekIdx(i)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              weekIdx === i ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}>
            {w.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="text-2xl font-black text-slate-800">{total}</div>
          <div className="text-xs text-slate-500 mt-1">Sesi Dijadwalkan</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{jurnal}</div>
          <div className="text-xs text-slate-500 mt-1">Jurnal Terisi</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <div className="text-2xl font-black text-orange-500">{total - jurnal}</div>
          <div className="text-xs text-slate-500 mt-1">Belum Diisi</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Progres Jurnal Pekan Ini</span>
          <span className="text-sm font-bold text-blue-600">{Math.round((jurnal / total) * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(jurnal / total) * 100}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{jurnal} dari {total} sesi sudah diisi jurnal</p>
      </div>

      {/* Schedule by day */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([hari, sessions]) => (
          <div key={hari} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-700">{hari}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {sessions.map((s, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.jurnal ? "bg-emerald-100" : "bg-amber-100"}`}>
                    {s.jurnal ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800">{s.mapel}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-semibold">{s.kelas}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.jam}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.materi}</span>
                    </div>
                  </div>
                  {!s.jurnal && (
                    <button className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline shrink-0">
                      Isi Jurnal <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
