import { PageShell } from "./_shared/Sidebar";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Clock, CheckCircle2, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";

const FEEDBACKS = [
  { id: "1", user: "Pak Ahmad Yusuf", role: "guru", category: "Bug", message: "Halaman absensi kadang blank setelah refresh.", status: "open", rating: null, tanggal: "2026-08-04" },
  { id: "2", user: "Bu Ratna Dewi", role: "guru", category: "Fitur", message: "Bisa ditambahkan export PDF untuk rekap nilai?", status: "in-progress", rating: null, tanggal: "2026-08-03" },
  { id: "3", user: "Achmad Fauzi", role: "siswa", category: "UI", message: "Tampilan dark mode untuk siswa bagus sekali!", status: "resolved", rating: 5, tanggal: "2026-08-02" },
  { id: "4", user: "Bunga Pertiwi", role: "siswa", category: "Bug", message: "Notifikasi tidak muncul di HP saya.", status: "open", rating: null, tanggal: "2026-08-01" },
  { id: "5", user: "Pak Rudi Hermawan", role: "guru", category: "Fitur", message: "Fitur soal AI sangat membantu! Terima kasih.", status: "resolved", rating: 5, tanggal: "2026-07-31" },
];

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  open: { label: "Baru", cls: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "Diproses", cls: "bg-amber-100 text-amber-700" },
  resolved: { label: "Selesai", cls: "bg-emerald-100 text-emerald-700" },
};

const CAT_COLORS: Record<string, string> = {
  Bug: "bg-red-100 text-red-600",
  Fitur: "bg-violet-100 text-violet-700",
  UI: "bg-blue-100 text-blue-600",
};

export function Feedback() {
  const [filter, setFilter] = useState("semua");
  const filtered = FEEDBACKS.filter((f) => filter === "semua" || f.status === filter);
  const counts = { open: FEEDBACKS.filter((f) => f.status === "open").length, resolved: FEEDBACKS.filter((f) => f.status === "resolved").length };

  return (
    <PageShell active="feedback" title="Feedback Admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola masukan dari guru dan siswa</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Masuk", val: FEEDBACKS.length, bg: "bg-blue-100", tc: "text-blue-600", icon: <MessageSquare className="w-5 h-5" /> },
          { label: "Perlu Ditangani", val: counts.open, bg: "bg-amber-100", tc: "text-amber-600", icon: <Clock className="w-5 h-5" /> },
          { label: "Diselesaikan", val: counts.resolved, bg: "bg-emerald-100", tc: "text-emerald-600", icon: <CheckCircle2 className="w-5 h-5" /> },
        ].map(({ label, val, bg, tc, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} ${tc} flex items-center justify-center shrink-0`}>{icon}</div>
            <div><div className="text-xs text-slate-500 font-medium">{label}</div><div className="text-xl font-black text-slate-800">{val}</div></div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        {["semua", "open", "in-progress", "resolved"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {s === "semua" ? "Semua" : STATUS_LABELS[s].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {filtered.map((fb) => (
          <div key={fb.id} className="p-5 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">{fb.user.charAt(0)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-slate-800">{fb.user}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fb.role === "guru" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-600"}`}>
                    {fb.role === "guru" ? "Guru" : "Siswa"}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CAT_COLORS[fb.category] ?? "bg-slate-100 text-slate-600"}`}>{fb.category}</span>
                </div>
                <p className="text-sm text-slate-700">{fb.message}</p>
                {fb.rating !== null && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < fb.rating! ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400">{fb.tanggal}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_LABELS[fb.status].cls}`}>{STATUS_LABELS[fb.status].label}</span>
              </div>
            </div>
            {fb.status !== "resolved" && (
              <div className="flex gap-2 ml-12">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
