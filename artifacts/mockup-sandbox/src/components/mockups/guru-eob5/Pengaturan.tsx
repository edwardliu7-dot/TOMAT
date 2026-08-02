import { PageShell } from "./_shared/Sidebar";
import { useState } from "react";

const THEMES = [
  { id: "default", label: "Navy", emoji: "🔵", sidebar: "#0f1c36", primary: "#1a56db" },
  { id: "tosca", label: "Tosca", emoji: "🌿", sidebar: "#0f4c45", primary: "#0d9488" },
  { id: "senja", label: "Senja", emoji: "🌅", sidebar: "#7c2d12", primary: "#f59e0b" },
  { id: "indigo", label: "Indigo", emoji: "💜", sidebar: "#1e1b4b", primary: "#6366f1" },
  { id: "gelap", label: "Gelap", emoji: "🌑", sidebar: "#0f0f0f", primary: "#a3a3a3" },
  { id: "batik", label: "Batik", emoji: "🌺", sidebar: "#4a1942", primary: "#d946ef" },
];

const FONTS = [
  { id: "jakarta", label: "Plus Jakarta Sans" },
  { id: "inter", label: "Inter" },
  { id: "nunito", label: "Nunito" },
  { id: "dm-sans", label: "DM Sans" },
];

export function Pengaturan() {
  const [theme, setTheme] = useState("default");
  const [font, setFont] = useState("jakarta");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  return (
    <PageShell active="pengaturan" title="Pengaturan">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">Personalisasi tampilan dan preferensi akun</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-1">Tema Warna</h2>
          <p className="text-xs text-slate-400 mb-5">Pilih warna sidebar dan aksen utama</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  theme === t.id ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300"
                }`}>
                <div className="flex gap-1 shrink-0">
                  <div className="w-5 h-8 rounded-l-lg" style={{ background: t.sidebar }} />
                  <div className="w-5 h-8 rounded-r-lg" style={{ background: t.primary }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{t.emoji} {t.label}</div>
                </div>
                {theme === t.id && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-1">Font</h2>
          <p className="text-xs text-slate-400 mb-4">Pilih jenis huruf untuk tampilan aplikasi</p>
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((f) => (
              <button key={f.id} onClick={() => setFont(f.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  font === f.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}>
                <div className="text-xs font-semibold text-slate-500 mb-1">Aa</div>
                <div className="text-sm font-semibold text-slate-700">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-1">Notifikasi</h2>
          <p className="text-xs text-slate-400 mb-5">Atur preferensi pemberitahuan</p>
          <div className="space-y-4">
            {[
              { label: "Notifikasi Email", desc: "Terima ringkasan mingguan via email", val: notifEmail, set: setNotifEmail },
              { label: "Push Notification", desc: "Pemberitahuan real-time di browser", val: notifPush, set: setNotifPush },
            ].map(({ label, desc, val, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                </div>
                <button onClick={() => set(!val)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${val ? "bg-blue-600" : "bg-slate-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${val ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-4">Profil Akun</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-xl font-black text-blue-700">PB</div>
            <div>
              <div className="font-bold text-slate-800">Pak Budi Santoso</div>
              <div className="text-sm text-slate-400">@pak.budi · Guru · Matematika</div>
              <button className="text-xs text-blue-600 font-semibold mt-1 hover:underline">Ganti Foto</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Nama Lengkap", val: "Pak Budi Santoso" }, { label: "Sebutan", val: "Pak Budi" }].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">{f.label}</label>
                <input defaultValue={f.val} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Simpan Perubahan</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
