import React, { useState } from "react";
import { BookOpen, GraduationCap, Eye, EyeOff } from "lucide-react";

export default function LoginMobile() {
  const [role, setRole] = useState<"siswa" | "guru">("siswa");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#071321] px-6 text-white">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.12] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.08] blur-[140px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Branding */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_12px_40px_rgba(99,102,241,0.4)]">
            <span className="text-3xl">🍅</span>
          </div>
          <h1 className="mb-1 text-4xl font-black tracking-[0.16em] text-white">TOMAT</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/80">
            Tantangan Otak Matematika
          </p>
          <p className="mt-2 text-[11px] text-[#4B6480]">
            Platform belajar matematika SMP yang menyenangkan 🎮
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setRole("siswa")}
            className={`flex flex-col items-center justify-center gap-2 rounded-[18px] border p-4 text-center transition-all ${
              role === "siswa"
                ? "border-indigo-500/50 bg-indigo-500/[0.12] shadow-[0_0_24px_rgba(99,102,241,0.12)]"
                : "border-indigo-500/15 bg-[#0E1E35] opacity-70 hover:opacity-100"
            }`}
          >
            <BookOpen size={24} className={role === "siswa" ? "text-indigo-400" : "text-[#4B6480]"} />
            <div>
              <div className={`text-[13px] font-bold ${role === "siswa" ? "text-white" : "text-white/60"}`}>
                Siswa
              </div>
              <div className="text-[9px] font-semibold text-[#4B6480]">Pelajar Tangguh</div>
            </div>
          </button>

          <button
            onClick={() => setRole("guru")}
            className={`flex flex-col items-center justify-center gap-2 rounded-[18px] border p-4 text-center transition-all ${
              role === "guru"
                ? "border-indigo-500/50 bg-indigo-500/[0.12] shadow-[0_0_24px_rgba(99,102,241,0.12)]"
                : "border-indigo-500/15 bg-[#0E1E35] opacity-70 hover:opacity-100"
            }`}
          >
            <GraduationCap size={24} className={role === "guru" ? "text-indigo-400" : "text-[#4B6480]"} />
            <div>
              <div className={`text-[13px] font-bold ${role === "guru" ? "text-white" : "text-white/60"}`}>
                Guru
              </div>
              <div className="text-[9px] font-semibold text-[#4B6480]">Pemandu Ilmu</div>
            </div>
          </button>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-3">
          <input
            type={role === "siswa" ? "text" : "email"}
            placeholder={role === "siswa" ? "Email / WhatsApp" : "Alamat Email"}
            className="w-full rounded-[12px] border border-indigo-500/[0.15] bg-[#0E1E35] px-4 py-3.5 text-[13px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Kata Sandi"
              className="w-full rounded-[12px] border border-indigo-500/[0.15] bg-[#0E1E35] px-4 py-3.5 pr-12 text-[13px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B6480] hover:text-indigo-400 transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <button className="mt-6 w-full rounded-[12px] bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3.5 text-[14px] font-black text-white shadow-[0_4px_24px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_32px_rgba(99,102,241,0.45)] active:translate-y-0">
          MASUK SEKARANG
        </button>

        {/* Forgot Password */}
        <button className="mt-4 w-full text-center text-[11px] font-medium text-indigo-400/70 transition-colors hover:text-indigo-400">
          Lupa kata sandi?
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 w-full -translate-x-1/2 text-center text-[9px] font-medium text-[#4B6480]">
        v2.0 · SMP TISA Islamic School
      </div>
    </div>
  );
}
