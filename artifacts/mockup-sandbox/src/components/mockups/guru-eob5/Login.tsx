import { useState } from "react";
import { Eye, EyeOff, GraduationCap, BookOpen, Users, ClipboardCheck } from "lucide-react";

export function Login() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-[#faf9f7]">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1a56db] flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800 leading-none">GuruEOB5</div>
                <div className="text-xs text-slate-500 mt-0.5">SMARTISA · Modul Guru</div>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Georgia', serif" }}>
                Selamat Datang
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Masuk dengan akun guru atau admin Anda.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Username</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition placeholder-slate-400"
                  placeholder="Masukkan username"
                  defaultValue="pak.budi"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    defaultValue="password123"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button className="w-full h-10 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors mt-2 shadow-sm">
                Masuk
              </button>
            </div>

            <p className="text-sm text-slate-500 text-center mt-5">
              Belum punya akun?{" "}
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Daftar di sini</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right: hero */}
      <div className="hidden lg:flex relative w-0 flex-1 bg-[#0f1c36] overflow-hidden">
        <div className="absolute inset-0">
          {/* subtle grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
        </div>
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h1 className="text-4xl font-bold mb-5 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Administrasi Sekolah, Lebih Tenang dan Tertata.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              GuruEOB5 adalah pendamping harian Anda. Kelola data siswa, jurnal mengajar, absensi, dan nilai dalam satu tempat.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Manajemen Siswa" },
                { icon: BookOpen, label: "Jurnal Mengajar" },
                { icon: ClipboardCheck, label: "Absensi Digital" },
                { icon: GraduationCap, label: "Laporan Nilai" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <Icon className="w-5 h-5 text-blue-300 shrink-0" />
                  <span className="text-sm font-medium text-white/90">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
