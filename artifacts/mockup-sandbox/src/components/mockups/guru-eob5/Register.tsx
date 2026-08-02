import { useState } from "react";
import { GraduationCap, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export function Register() {
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Dikirim</h2>
          <p className="text-sm text-slate-500 mb-6">Akun Anda sedang ditinjau oleh admin. Anda akan dihubungi setelah disetujui.</p>
          <button onClick={() => setSubmitted(false)} className="w-full h-10 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-[#faf9f7]">
      {/* Left */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1a56db] flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-800">GuruEOB5</div>
                <div className="text-xs text-slate-500 mt-0.5">SMARTISA · Daftar Akun</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Georgia', serif" }}>Daftar Akun Guru</h1>
              <p className="text-sm text-slate-500 mt-1">Lengkapi data untuk mendaftar</p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Nama Lengkap", ph: "Nama lengkap Anda" },
                { label: "Username", ph: "pak.nama" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">{f.label}</label>
                  <input placeholder={f.ph}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition" />
                </div>
              ))}

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"}
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition" />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Sekolah</label>
                <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <option>SMP TISA Islamic School</option>
                  <option>SDS TISA Islamic School</option>
                  <option>TK TISA Islamic School</option>
                </select>
              </div>

              <button onClick={() => setSubmitted(true)}
                className="w-full h-10 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors mt-2 shadow-sm">
                Daftar Sekarang
              </button>
            </div>

            <p className="text-sm text-slate-500 text-center mt-5">
              Sudah punya akun?{" "}
              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Masuk di sini</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="hidden lg:flex relative w-0 flex-1 bg-[#0f1c36] overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="reg-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#reg-grid)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
        </div>
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h1 className="text-4xl font-bold mb-5 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Bergabunglah dengan Komunitas Guru SMARTISA
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Daftarkan diri Anda dan mulai nikmati kemudahan mengelola administrasi, jurnal, absensi, dan nilai dalam satu platform.
            </p>
            <div className="mt-8 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-sm text-white/80">Akun akan aktif setelah diverifikasi admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
