import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, ChevronLeft } from 'lucide-react';

// Variant B: "Dua Dunia" — Split Portal
// The screen is divided into two worlds. Tapping one side expands it to fill the screen,
// collapsing the other, then reveals the credential form inside that world.

export default function LoginVariantB() {
  const [chosen, setChosen] = useState<'siswa' | 'guru' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const siswaActive = chosen === 'siswa';
  const guruActive = chosen === 'guru';
  const decided = chosen !== null;

  return (
    <div className="relative min-h-screen h-full max-w-[390px] w-full mx-auto overflow-hidden font-sans text-slate-100 flex flex-col">

      {/* ── Two world panels, side by side ── */}
      <div className="flex flex-1 min-h-full relative">

        {/* SISWA WORLD — left */}
        <div
          onClick={() => !decided && setChosen('siswa')}
          className="relative flex flex-col items-center justify-start overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] cursor-pointer"
          style={{
            width: decided ? (siswaActive ? '100%' : '0%') : '50%',
            background: 'linear-gradient(160deg, #052e16 0%, #064e3b 40%, #0a1628 100%)',
            flexShrink: 0,
          }}
        >
          {/* Glow orb */}
          <div className="absolute top-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-emerald-500/20 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-teal-500/15 blur-[60px] pointer-events-none" />

          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${decided && !siswaActive ? 'opacity-0' : 'opacity-100'}`}
            style={{ paddingTop: siswaActive ? '56px' : '80px' }}
          >
            {/* Back button */}
            {siswaActive && (
              <button
                onClick={e => { e.stopPropagation(); setChosen(null); }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}

            <div className="text-5xl mb-3 drop-shadow-xl" style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.6))' }}>⚔️</div>
            <span className="text-xl font-black tracking-[0.2em] text-emerald-300 uppercase mb-0.5">Siswa</span>
            <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">Pejuang Angka</span>

            {!decided && (
              <div className="mt-6 flex flex-col items-center gap-1.5 px-4">
                {['Quest Harian', 'Koin & XP', 'Level Up'].map(t => (
                  <div key={t} className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider">
                    {t}
                  </div>
                ))}
                <div className="mt-4 w-8 h-[2px] bg-emerald-400/40 rounded-full" />
                <span className="text-[9px] text-emerald-600 font-bold tracking-widest mt-1">TAP MASUK</span>
              </div>
            )}

            {/* Login form inside siswa world */}
            {siswaActive && (
              <div className="w-full px-6 mt-8 space-y-3">
                <div className="text-center mb-5">
                  <div className="text-[9px] font-bold text-emerald-600 tracking-[0.2em] uppercase mb-1">Masuk sebagai</div>
                  <div className="text-2xl font-black text-emerald-300 tracking-wider">SISWA</div>
                </div>
                <p className="text-[10px] text-emerald-700/80 text-center mb-4 font-medium">
                  Gunakan NISN atau username dari akun BLP kamu.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-700" />
                  <input
                    type="text"
                    placeholder="NISN atau Username"
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-emerald-900 focus:outline-none font-medium"
                    style={{ caretColor: '#10B981' }}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-700" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-emerald-900 focus:outline-none font-medium tracking-widest"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-800 hover:text-emerald-400 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-black text-sm tracking-widest text-white mt-2"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 30px rgba(16,185,129,0.35)' }}
                >
                  MASUK <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Vertical divider glow on the right edge */}
          {!decided && (
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
          )}
        </div>

        {/* GURU WORLD — right */}
        <div
          onClick={() => !decided && setChosen('guru')}
          className="relative flex flex-col items-center justify-start overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] cursor-pointer"
          style={{
            width: decided ? (guruActive ? '100%' : '0%') : '50%',
            background: 'linear-gradient(160deg, #1e1b4b 0%, #2e1065 40%, #0a0a1a 100%)',
            flexShrink: 0,
          }}
        >
          <div className="absolute top-[-60px] right-[-60px] w-[280px] h-[280px] rounded-full bg-violet-500/20 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-purple-500/15 blur-[60px] pointer-events-none" />

          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${decided && !guruActive ? 'opacity-0' : 'opacity-100'}`}
            style={{ paddingTop: guruActive ? '56px' : '80px' }}
          >
            {guruActive && (
              <button
                onClick={e => { e.stopPropagation(); setChosen(null); }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}

            <div className="text-5xl mb-3 drop-shadow-xl" style={{ filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.6))' }}>🔮</div>
            <span className="text-xl font-black tracking-[0.2em] text-violet-300 uppercase mb-0.5">Guru</span>
            <span className="text-[10px] text-violet-600 font-bold tracking-widest uppercase">Arsitek Ilmu</span>

            {!decided && (
              <div className="mt-6 flex flex-col items-center gap-1.5 px-4">
                {['Buat Tugas', 'Pantau Kelas', 'Lihat Nilai'].map(t => (
                  <div key={t} className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 tracking-wider">
                    {t}
                  </div>
                ))}
                <div className="mt-4 w-8 h-[2px] bg-violet-400/40 rounded-full" />
                <span className="text-[9px] text-violet-600 font-bold tracking-widest mt-1">TAP MASUK</span>
              </div>
            )}

            {guruActive && (
              <div className="w-full px-6 mt-8 space-y-3">
                <div className="text-center mb-5">
                  <div className="text-[9px] font-bold text-violet-600 tracking-[0.2em] uppercase mb-1">Masuk sebagai</div>
                  <div className="text-2xl font-black text-violet-300 tracking-wider">GURU</div>
                </div>
                <p className="text-[10px] text-violet-700/80 text-center mb-4 font-medium">
                  Gunakan email atau username dari akun pengajar.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-700" />
                  <input
                    type="text"
                    placeholder="Email atau Username"
                    className="w-full bg-black/40 border border-violet-500/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-violet-900 focus:outline-none font-medium"
                    style={{ caretColor: '#A78BFA' }}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-700" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-violet-500/20 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-violet-900 focus:outline-none font-medium tracking-widest"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-800 hover:text-violet-400 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-black text-sm tracking-widest text-white mt-2"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', boxShadow: '0 0 30px rgba(139,92,246,0.35)' }}
                >
                  MASUK <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Top brand strip — always visible */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-col items-center pointer-events-none" style={{ opacity: decided ? 0 : 1, transition: 'opacity 0.4s' }}>
        <div className="mt-8 flex flex-col items-center">
          <span className="text-2xl mb-1">🍅</span>
          <h1 className="text-2xl font-black italic tracking-widest text-white drop-shadow-sm">TOMAT</h1>
          <p className="text-[8px] text-cyan-400 font-bold tracking-[0.25em] uppercase">Tantangan Otak MATematika</p>
        </div>
        <div className="mt-3 w-px h-6 bg-white/10" />
        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">Pilih Duniamu</p>
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
        <p className="text-[8px] font-bold text-slate-700 tracking-[0.2em] uppercase">SMP TISA Islamic School · V 2.0.1</p>
      </div>

    </div>
  );
}
