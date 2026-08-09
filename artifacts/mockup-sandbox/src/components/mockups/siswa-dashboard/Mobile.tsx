import {
  CheckCircle2, Circle, Moon, Shield, Brain, Heart,
  Handshake, Star, Mic, FileText, LogOut, Calendar,
  Settings, TrendingUp, Bell,
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
    accentColor: "#22c55e",
    activities: [
      { label: "Shalat 5 Waktu Berjamaah",  done: false },
      { label: "Berdzikir ba'da Sholat",    done: false },
      { label: "Bersholawat Nabi Muhammad", done: false },
      { label: "Sholat Dhuha",              done: false },
      { label: "Membaca Al Qur'an",         done: false, note: "Penanda: Al-Ikhlas ayat 1" },
      { label: "Sholat sunnah Rawatib",     done: false },
      { label: "Infaq Sodakoh",             done: false },
      { label: "Mendo'akan Orang Tua",      done: false },
    ],
  },
  {
    id: "resilience", label: "RESILIENCE", sub: "KETEGUHAN",
    accentColor: "#f59e0b",
    activities: [
      { label: "Datang Ke Sekolah Tepat Waktu", done: false, note: "Tidak berlaku di akhir pekan" },
      { label: "Bertanggung Jawab",             done: false },
      { label: "Sholat Tahajud",                done: false },
      { label: "Olahraga / Berjalan 200-300 m", done: false },
    ],
  },
  {
    id: "resourcefulness", label: "RESOURCEFULNESS", sub: "MENCARI SUMBER PENGETAHUAN",
    accentColor: "#3b82f6",
    activities: [
      { label: "Belajar setiap hari min. 30 menit",  done: false },
      { label: "Hafal Ayat Al Qur'an dan artinya",   done: false },
      { label: "Memanfaatkan Internet (Positif)",    done: false },
      { label: "Hafal Hadits Shohih dan artinya",    done: false },
    ],
  },
  {
    id: "reflectiveness", label: "REFLECTIVENESS", sub: "REFLEKSI/MUHASABAH",
    accentColor: "#8b5cf6",
    activities: [
      { label: "Sholat Taubat 2 Rakaat",     done: false },
      { label: "Istighfar min 100x",         done: false },
      { label: "Evaluasi Diri Sebelum Tidur",done: false },
    ],
  },
  {
    id: "reciprocity", label: "RECIPROCITY", sub: "KEMANDIRIAN",
    accentColor: "#f43f5e",
    activities: [
      { label: "Menyiapkan Perlengkapan sekolah sendiri", done: false },
      { label: "Membantu Kesulitan Orang Lain",           done: false },
      { label: "Bekerjasama",                             done: false },
      { label: "Peka terhadap situasi",                   done: false },
    ],
  },
];

const totalCount = categories.reduce((s, c) => s + c.activities.length, 0);
const pct = 0;

export function Mobile() {
  return (
    <div className="min-h-screen font-sans max-w-sm mx-auto flex flex-col" style={{ background: C.pageBg, color: "white" }}>
      {/* Status bar */}
      <div className="px-4 pt-2 pb-1 flex justify-between items-center text-xs" style={{ background: C.navBg }}>
        <span>09:41</span>
        <span>▂▄▆ ✦ 🔋</span>
      </div>

      {/* Header */}
      <div className="px-4 pt-3 pb-0" style={{ background: C.navBg, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm">B</div>
            <div>
              <div className="font-bold text-sm">BLP Harian</div>
              <div className="text-xs" style={{ color: C.muted }}>SMP TISA</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative" style={{ color: C.muted }}><Bell className="w-4 h-4" /></button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">AR</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {[
            { icon: CheckCircle2, label: "Harian",     active: true  },
            { icon: Calendar,     label: "Kalender",   active: false },
            { icon: Settings,     label: "Pengaturan", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button key={label}
              className="flex items-center gap-1 px-3 py-2.5 text-xs font-medium rounded-t-lg flex-1 justify-center"
              style={active ? { background: "white", color: "#1a3028" } : { color: C.muted }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date card */}
      <div className="mx-4 mt-4 rounded-2xl px-4 py-3 text-center" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
        <div className="font-bold">Minggu, 2 Agustus 2026</div>
        <div className="text-xs font-semibold mt-0.5" style={{ color: "#4ade80" }}>HARI INI</div>
      </div>

      {/* Score card */}
      <div className="mx-4 mt-3 rounded-2xl p-4" style={{
        background: "linear-gradient(135deg, #059669 0%, #10b981 60%, #34d399 100%)",
      }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs opacity-75 uppercase tracking-wide mb-1">MINGGU, 2 AGUSTUS 2026
              <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">HARI INI</span>
            </div>
            <div className="text-4xl font-bold">0</div>
            <div className="text-sm opacity-75 mt-0.5">Nilai BLP Hari Ini</div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-3.5 h-3.5 text-white/40" />
              ))}
            </div>
            <div className="text-xs opacity-70 mt-1">Ayo selesaikan amaliyahmu!</div>
            <div className="mt-2">
              <div className="text-xs opacity-70 mb-1">0 / {totalCount} aktivitas selesai</div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)", width: 140 }}>
                <div className="h-full bg-white rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="white" strokeWidth="8"
                strokeDasharray={`0 ${2 * Math.PI * 24}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold">0%</span>
              <span className="text-xs opacity-70" style={{ fontSize: 9 }}>selesai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity categories */}
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4 overflow-y-auto">
        {categories.map((cat) => {
          const catDone = cat.activities.filter(a => a.done).length;
          const catPct = Math.round((catDone / cat.activities.length) * 100);
          return (
            <div key={cat.id}>
              {/* Section header */}
              <div className="rounded-xl mb-2 flex items-center px-3 py-2.5 gap-2" style={{
                background: "white",
                borderLeft: `4px solid ${cat.accentColor}`,
              }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs" style={{ color: cat.accentColor }}>{cat.label}</div>
                  <div className="text-xs text-gray-500 truncate">{cat.sub}</div>
                </div>
                <span className="text-xs font-semibold text-gray-700 flex-shrink-0">{catDone}/{cat.activities.length}</span>
                <div className="w-20 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: "#e5e7eb" }}>
                  <div className="h-full rounded-full" style={{ width: `${catPct}%`, background: cat.accentColor }} />
                </div>
              </div>

              {/* Activity items */}
              <div className="space-y-1.5 ml-1">
                {cat.activities.map((act) => (
                  <div key={act.label} className="rounded-xl px-3 py-3 flex items-start gap-2.5"
                    style={{
                      background: C.itemBg,
                      border: (act as any).note ? `1px solid ${cat.accentColor}40` : `1px solid ${C.border}`
                    }}>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                      style={{ borderColor: act.done ? cat.accentColor : "#3a5545",
                               background: act.done ? cat.accentColor : "transparent" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white leading-snug">{act.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: C.dimText }}>TARGET: SETIAP HARI</div>
                      {(act as any).note && (
                        <div className="text-xs mt-0.5" style={{ color: "#fbbf24" }}>📌 {(act as any).note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="py-3 text-center text-xs" style={{ color: C.dimText }}>
          🌐 © 2026 BLP Harian · SMP TISA Islamic School 🌐
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex justify-around px-6 py-3" style={{ background: C.navBg, borderTop: `1px solid ${C.border}` }}>
        {[
          { icon: CheckCircle2, label: "Harian",     active: true  },
          { icon: Calendar,     label: "Kalender",   active: false },
          { icon: TrendingUp,   label: "Progress",   active: false },
          { icon: Settings,     label: "Pengaturan", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} className="flex flex-col items-center gap-0.5 py-0.5"
            style={{ color: active ? "#4ade80" : C.muted }}>
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
