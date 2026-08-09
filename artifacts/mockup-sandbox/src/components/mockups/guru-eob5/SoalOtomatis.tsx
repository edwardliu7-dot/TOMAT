import { PageShell } from "./_shared/Sidebar";
import { Sparkles, Loader2, Download, Trash2, ListChecks, ClipboardList, History, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const SAVED = [
  { id: "1", topik: "Teorema Pythagoras", kelas: "VIII", jumlah: 10, jenis: "Pilihan Ganda", tanggal: "2026-08-01" },
  { id: "2", topik: "Bilangan Bulat — Operasi Dasar", kelas: "VII", jumlah: 5, jenis: "Esai", tanggal: "2026-07-29" },
  { id: "3", topik: "Transformasi Geometri", kelas: "IX", jumlah: 10, jenis: "Pilihan Ganda", tanggal: "2026-07-25" },
];

const GENERATED = [
  { no: 1, soal: "Sebuah segitiga siku-siku memiliki dua sisi penyiku 3 cm dan 4 cm. Berapa panjang hipotenusanya?", jawaban: "5 cm", penjelasan: "Gunakan rumus Pythagoras: c² = a² + b² = 9 + 16 = 25, sehingga c = 5.", pilihan: ["3 cm", "4 cm", "5 cm", "6 cm"] },
  { no: 2, soal: "Jika a = 5 cm dan c = 13 cm pada segitiga siku-siku, berapa nilai b?", jawaban: "12 cm", penjelasan: "b² = c² − a² = 169 − 25 = 144, sehingga b = 12.", pilihan: ["8 cm", "10 cm", "11 cm", "12 cm"] },
  { no: 3, soal: "Triple Pythagoras manakah yang benar dari pilihan berikut?", jawaban: "(8, 15, 17)", penjelasan: "8² + 15² = 64 + 225 = 289 = 17²", pilihan: ["(6, 8, 11)", "(5, 12, 14)", "(8, 15, 17)", "(7, 24, 26)"] },
];

export function SoalOtomatis() {
  const [tab, setTab] = useState<"buat" | "tersimpan">("buat");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [jenis, setJenis] = useState("Pilihan Ganda");

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1500);
  };

  return (
    <PageShell active="soal-otomatis" title="Soal Otomatis AI">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="w-6 h-6 text-violet-600" />
          <h1 className="text-2xl font-bold text-slate-800">Soal Otomatis AI</h1>
        </div>
        <p className="text-sm text-slate-500">Buat soal latihan dengan kecerdasan buatan (Groq)</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(["buat", "tersimpan"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "buat" ? <><Sparkles className="w-4 h-4" /> Buat Soal</> : <><History className="w-4 h-4" /> Tersimpan</>}
          </button>
        ))}
      </div>

      {tab === "buat" ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Parameter Soal</h3>
            <div className="space-y-3">
              {[
                { label: "Topik / Materi", type: "text", ph: "cth: Teorema Pythagoras", def: "Teorema Pythagoras" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} defaultValue={f.def}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jenis Soal</label>
                <select value={jenis} onChange={(e) => setJenis(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                  <option>Pilihan Ganda</option><option>Esai</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tingkat Kelas</label>
                <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                  <option>Kelas 8</option><option>Kelas 7</option><option>Kelas 9</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jumlah Soal</label>
                <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                  <option>3 soal</option><option>5 soal</option><option>10 soal</option>
                </select>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading}
              className="w-full mt-5 h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat soal...</> : <><Sparkles className="w-4 h-4" /> Generate Soal</>}
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!generated && !loading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Soal akan muncul di sini</p>
                <p className="text-xs mt-1">Isi parameter dan klik Generate</p>
              </div>
            ) : loading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-600">Sedang membuat soal...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-violet-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-violet-700">{GENERATED.length} soal berhasil dibuat</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-100">
                      <Download className="w-3.5 h-3.5" /> Simpan
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {GENERATED.map((q) => (
                    <div key={q.no} className="p-5">
                      <div className="flex gap-3 mb-3">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-black flex items-center justify-center shrink-0">{q.no}</span>
                        <p className="text-sm font-semibold text-slate-800">{q.soal}</p>
                      </div>
                      {jenis === "Pilihan Ganda" && (
                        <div className="grid grid-cols-2 gap-2 mb-3 ml-9">
                          {q.pilihan.map((p, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${p === q.jawaban ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-100"}`}>
                              <span className="font-bold text-slate-400">{String.fromCharCode(65 + i)}.</span>
                              <span className={p === q.jawaban ? "font-semibold text-emerald-700" : "text-slate-600"}>{p}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="ml-9 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Jawaban: {q.jawaban}</p>
                        <p className="text-xs text-blue-600">{q.penjelasan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {SAVED.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <ListChecks className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{s.topik}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">{s.jenis}</span>
                  <span className="text-xs text-slate-400">Kelas {s.kelas} · {s.jumlah} soal · {s.tanggal}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
