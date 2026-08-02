import {
  CheckCircle2, Circle, Moon, Shield, Brain, Heart,
  Handshake, Star, Mic, FileText, LogOut, Calendar,
  Settings, TrendingUp,
} from "lucide-react";

const C = {
  pageBg:  "#0d2018",
  navBg:   "#162c1f",
  cardBg:  "#1a3028",
  itemBg:  "#1c2838",
  border:  "#2a4535",
  muted:   "#6aaa82",
  dimText: "#4a7a5a",
};

const categories = [
  {
    id: "devout", label: "DEVOUT", sub: "KESADARAN DIRI",
    accentColor: "#22c55e", borderColor: "#22c55e",
    activities: [
      { label: "Shalat 5 Waktu Berjamaah",      done: false, target: "SETIAP HARI" },
      { label: "Berdzikir ba'da Sholat",         done: false, target: "SETIAP HARI" },
      { label: "Bersholawat Nabi Muhammad",      done: false, target: "SETIAP HARI" },
      { label: "Sholat Dhuha",                   done: false, target: "SETIAP HARI" },
      { label: "Membaca Al Qur'an",              done: false, target: "SETIAP HARI", note: "Penanda: Al-Ikhlas ayat 1" },
      { label: "Sholat sunnah Rawatib",          done: false, target: "SETIAP HARI" },
      { label: "Infaq Sodakoh",                  done: false, target: "SETIAP HARI" },
      { label: "Mendo'akan Orang Tua",           done: false, target: "SETIAP HARI" },
    ],
  },
  {
    id: "resilience", label: "RESILIENCE", sub: "KETEGUHAN",
    accentColor: "#f59e0b", borderColor: "#f59e0b",
    activities: [
      { label: "Datang Ke Sekolah Tepat Waktu",  done: false, target: "SETIAP HARI", note: "Tidak berlaku di akhir pekan (bukan hari sekolah)" },
      { label: "Bertanggung Jawab",              done: false, target: "SETIAP HARI" },
      { label: "Sholat Tahajud",                 done: false, target: "SETIAP HARI" },
      { label: "Olahraga / Berjalan 200-300 m",  done: false, target: "SETIAP HARI" },
    ],
  },
  {
    id: "resourcefulness", label: "RESOURCEFULNESS", sub: "MENCARI SUMBER PENGETAHUAN",
    accentColor: "#3b82f6", borderColor: "#3b82f6",
    activities: [
      { label: "Belajar setiap hari min. 30 menit", done: false, target: "SETIAP HARI" },
      { label: "Hafal Ayat Al Qur'an dan artinya",  done: false, target: "SETIAP HARI" },
      { label: "Memanfaatkan Internet (Positif)",   done: false, target: "SETIAP HARI" },
      { label: "Hafal Hadits Shohih dan artinya",   done: false, target: "SATU PEKAN"  },
    ],
  },
  {
    id: "reflectiveness", label: "REFLECTIVENESS", sub: "REFLEKSI/MUHASABAH",
    accentColor: "#8b5cf6", borderColor: "#8b5cf6",
    activities: [
      { label: "Sholat Taubat 2 Rakaat",  done: false, target: "SETIAP HARI" },
      { label: "Istighfar min 100x",      done: false, target: "SETIAP HARI" },
      { label: "Evaluasi Diri Sebelum Tidur", done: false, target: "SETIAP HARI" },
    ],
  },
  {
    id: "reciprocity", label: "RECIPROCITY", sub: "KEMANDIRIAN",
    accentColor: "#f43f5e", borderColor: "#f43f5e",
    activities: [
      { label: "Menyiapkan Perlengkapan sekolah sendiri", done: false, target: "SETIAP HARI" },
      { label: "Membantu Kesulitan Orang Lain",           done: false, target: "SETIAP HARI" },
      { label: "Bekerjasama",                             done: false, target: "SETIAP HARI" },
      { label: "Peka terhadap situasi",                   done: false, target: "SETIAP HARI" },
    ],
  },
];

const doneCount = 0;
const totalCount = categories.reduce((s, c) => s + c.activities.length, 0);
const pct = 0;

export function Web() {
  return (
    <div className="min-h-screen font-sans" style={{ background: C.pageBg, color: "white" }}>
      {/* Header */}
      <header style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold">B</div>
            <div>
              <div className="font-bold text-base leading-tight">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA Islamic School</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-sm">AR</div>
            <button style={{ color: C.muted }}><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-6 flex gap-1 pb-0">
          {[
            { icon: CheckCircle2, label: "Harian",     active: true  },
            { icon: Calendar,     label: "Kalender",   active: false },
            { icon: Settings,     label: "Pengaturan", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button key={label}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition"
              style={active ? { background: "white", color: "#1a3028" } : { color: C.muted }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-5 space-y-4">
        {/* Date card */}
        <div className="rounded-2xl px-5 py-4 text-center" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
          <div className="font-bold text-lg">Minggu, 2 Agustus 2026</div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: "#4ade80" }}>HARI INI</div>
        </div>

        {/* Score card */}
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
        }}>
          <div>
            <div className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wide">MINGGU, 2 AGUSTUS 2026
              <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">HARI INI</span>
            </div>
            <div className="text-5xl font-bold">0</div>
            <div className="text-sm opacity-80 mt-1">Nilai BLP Hari Ini</div>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 text-white/40" />
              ))}
              <span className="text-xs opacity-70 ml-1">Ayo selesaikan amaliyahmu!</span>
            </div>
            <div className="mt-3">
              <div className="text-xs opacity-70 mb-1">{doneCount} / {totalCount} aktivitas selesai</div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)", width: 220 }}>
                <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                <circle cx="48" cy="48" r="38" fill="none" stroke="white" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38 * pct / 100} ${2 * Math.PI * 38}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{pct}%</span>
                <span className="text-xs opacity-70">selesai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category sections */}
        {categories.map((cat) => {
          const catDone = cat.activities.filter(a => a.done).length;
          const catPct = Math.round((catDone / cat.activities.length) * 100);
          return (
            <div key={cat.id}>
              {/* Section header — white card with colored left border */}
              <div className="rounded-xl mb-2 flex items-center px-4 py-3 gap-3" style={{
                background: "white",
                borderLeft: `4px solid ${cat.accentColor}`,
              }}>
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: cat.accentColor }}>{cat.label}</div>
                  <div className="text-xs text-gray-500">{cat.sub}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">{catDone}/{cat.activities.length}</span>
                  <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
                    <div className="h-full rounded-full" style={{ width: `${catPct}%`, background: cat.accentColor }} />
                  </div>
                </div>
              </div>

              {/* Activity items */}
              <div className="space-y-2 ml-1">
                {cat.activities.map((act) => (
                  <div key={act.label} className="rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{ background: C.itemBg, border: act.note ? `1px solid ${cat.accentColor}40` : `1px solid ${C.border}` }}>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                      style={{ borderColor: act.done ? cat.accentColor : "#3a5545",
                               background: act.done ? cat.accentColor : "transparent" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{act.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.dimText }}>TARGET: {act.target}</div>
                      {act.note && (
                        <div className="text-xs mt-0.5" style={{ color: "#fbbf24" }}>📌 {act.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="py-4 text-center text-xs" style={{ color: C.dimText }}>
          🌐 © 2026 BLP Harian · SMP TISA Islamic School 🌐
        </div>
      </main>
    </div>
  );
}
