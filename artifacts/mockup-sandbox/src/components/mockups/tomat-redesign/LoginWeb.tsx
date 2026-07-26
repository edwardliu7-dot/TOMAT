import React, { useState } from "react";
import { BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";

export default function LoginWeb() {
  const [role, setRole] = useState<"siswa" | "guru">("siswa");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-60 h-[700px] w-[700px] rounded-full bg-indigo-600/[0.10] blur-[160px]" />
        <div className="absolute -right-60 bottom-0 h-[700px] w-[700px] rounded-full bg-violet-500/[0.08] blur-[160px]" />
        <div className="absolute top-[30%] left-[40%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      </div>

      {/* Left panel — branding */}
      <div className="relative z-10 hidden lg:flex w-[55%] flex-col items-center justify-center bg-gradient-to-br from-[#0E1830] to-[#071321] border-r border-indigo-500/10 px-16">
        <div className="max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_20px_60px_rgba(99,102,241,0.4)]">
              <span className="text-5xl">🍅</span>
            </div>
          </div>
          <h1 className="text-[48px] font-black tracking-[0.18em] mb-2">TOMAT</h1>
          <p className="text-[14px] font-bold uppercase tracking-[0.25em] text-indigo-300/80 mb-6">Tantangan Otak Matematika</p>
          <p className="text-[15px] text-[#4B6480] leading-relaxed">
            Platform gamifikasi matematika SMP yang membuat belajar jadi petualangan seru.<br />
            Kumpulkan koin, taklukkan boss, dan jadilah juara kelas! 🎮
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              { emoji: "⚔️", label: "Duel Real-time" },
              { emoji: "💥", label: "Boss Raid Co-op" },
              { emoji: "🏆", label: "Turnamen Kelas" },
              { emoji: "🐹", label: "Pet Tomi" },
              { emoji: "🛒", label: "Toko Kosmetik" },
              { emoji: "🧮", label: "Hafalan Interaktif" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-2 text-[12px] font-bold text-indigo-200">
                <span>{feat.emoji}</span>
                <span>{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="flex lg:hidden flex-col items-center text-center mb-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_12px_40px_rgba(99,102,241,0.4)] mb-4">
              <span className="text-3xl">🍅</span>
            </div>
            <h1 className="text-4xl font-black tracking-[0.16em]">TOMAT</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/80 mt-1">Tantangan Otak Matematika</p>
          </div>

          <h2 className="text-[28px] font-black mb-2">Masuk</h2>
          <p className="text-[14px] text-[#4B6480] mb-8">Pilih peran dan masukkan kredensialmu.</p>

          {/* Role Selection */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              { val: "siswa" as const, icon: BookOpen, label: "Siswa", sub: "Pelajar Tangguh" },
              { val: "guru" as const, icon: GraduationCap, label: "Guru", sub: "Pemandu Ilmu" },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setRole(r.val)}
                className={`flex flex-col items-center justify-center gap-3 rounded-[20px] border p-5 transition-all ${
                  role === r.val
                    ? "border-indigo-500/50 bg-indigo-500/[0.10] shadow-[0_0_32px_rgba(99,102,241,0.12)]"
                    : "border-indigo-500/15 bg-[#0E1E35] opacity-70 hover:opacity-100"
                }`}
              >
                <r.icon size={28} className={role === r.val ? "text-indigo-400" : "text-[#4B6480]"} />
                <div>
                  <div className={`text-[15px] font-bold ${role === r.val ? "text-white" : "text-white/60"}`}>{r.label}</div>
                  <div className="text-[11px] text-[#4B6480]">{r.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#4B6480] mb-2 uppercase tracking-wider">
                {role === "siswa" ? "Email / WhatsApp" : "Alamat Email"}
              </label>
              <input
                type={role === "siswa" ? "text" : "email"}
                placeholder={role === "siswa" ? "contoh: 08123456789" : "guru@sekolah.com"}
                className="w-full rounded-[14px] border border-indigo-500/[0.15] bg-[#0E1E35] px-5 py-3.5 text-[14px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#4B6480] mb-2 uppercase tracking-wider">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Kata sandi"
                  className="w-full rounded-[14px] border border-indigo-500/[0.15] bg-[#0E1E35] px-5 py-3.5 pr-12 text-[14px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B6480] hover:text-indigo-400 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-4 text-[15px] font-black text-white shadow-[0_6px_32px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(99,102,241,0.5)] active:translate-y-0">
            MASUK SEKARANG
          </button>

          <button className="mt-5 w-full text-center text-[13px] font-medium text-indigo-400/70 transition-colors hover:text-indigo-400">
            Lupa kata sandi?
          </button>

          <div className="mt-10 text-center text-[11px] text-[#4B6480]">v2.0 · SMP TISA Islamic School</div>
        </div>
      </div>
    </div>
  );
}
