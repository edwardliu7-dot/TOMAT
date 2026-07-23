import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen h-full max-w-[390px] w-full mx-auto bg-[#0F1115] overflow-y-auto overflow-x-hidden font-sans flex flex-col text-slate-100">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Nebula/Aurora Glows */}
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-violet-900/30 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-20%] w-[80%] h-[50%] bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[10%] w-[100%] h-[40%] bg-emerald-900/20 blur-[100px] rounded-full mix-blend-screen" />
        
        {/* Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-full px-6 py-12 justify-center items-center">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 mt-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 mb-6 shadow-[0_0_50px_rgba(244,63,94,0.15)] border border-rose-500/20 backdrop-blur-xl">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-rose-500/30 to-orange-500/30 blur-md" />
            <div className="absolute inset-0 rounded-full border border-white/10 shadow-inner" />
            <span className="text-6xl relative z-10 drop-shadow-xl saturate-150">🍅</span>
          </div>
          
          <h1 className="text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-2 drop-shadow-sm">
            TOMAT
          </h1>
          
          <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase mb-4 text-center">
            Tantangan Otak MATematika
          </p>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E2128]/80 border border-white/5 backdrop-blur-sm shadow-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              SMP TISA Islamic School
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative w-full rounded-[24px] bg-[#1E2128]/80 backdrop-blur-xl border border-white/5 shadow-2xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150" style={{ animationFillMode: 'both' }}>
          
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[24px]" />
          
          {/* Role Toggle */}
          <div className="flex p-1 bg-black/40 rounded-full mb-6 border border-white/5 shadow-inner">
            <button
              onClick={() => setRole('siswa')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                role === 'siswa' 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Siswa
            </button>
            <button
              onClick={() => setRole('guru')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                role === 'guru' 
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] border border-violet-500/30' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              Guru
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400 mb-6 text-center px-1 font-medium">
            Akun siswa didaftarkan melalui aplikasi BLP. Masuk menggunakan akun yang sudah terdaftar.
          </p>

          <form className="space-y-4 w-full" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="NISN atau Username"
                  className="w-full bg-[#0F1115]/80 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-[#0F1115]/80 border border-white/5 rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner font-medium tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0F1115] transition-all shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
                <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[11px] px-4 py-4 flex items-center justify-center gap-2 transition-all duration-300 group-hover:from-emerald-500 group-hover:to-teal-400">
                  <span className="text-sm font-bold text-white uppercase tracking-widest drop-shadow-sm">Masuk</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform drop-shadow-sm" />
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Area */}
        <div className="mt-auto flex justify-center pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300" style={{ animationFillMode: 'both' }}>
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.2em] uppercase">
            V 2.0.1 <span className="mx-2 opacity-50">•</span> Koding Next
          </p>
        </div>

      </div>
    </div>
  );
}
