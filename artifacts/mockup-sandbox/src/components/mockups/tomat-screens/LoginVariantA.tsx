import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck, Gamepad2, GraduationCap } from 'lucide-react';

// Variant A: "Pilih Kelasmu" — RPG Class Selection
// Role selection becomes a full character-archetype picker before the form appears.
// Tapping a class card commits you; the form slides in below.

const classes = [
  {
    id: 'siswa',
    label: 'SISWA',
    sub: 'Pejuang Angka',
    icon: Gamepad2,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.35)',
    bg: 'from-emerald-950/80 to-teal-950/80',
    border: 'border-emerald-500/50',
    ring: 'shadow-[0_0_40px_rgba(16,185,129,0.4)]',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    traits: ['Quest Harian', 'XP & Level', 'Koin Reward'],
    emoji: '⚔️',
    placeholder: 'NISN atau Username',
  },
  {
    id: 'guru',
    label: 'GURU',
    sub: 'Arsitek Ilmu',
    icon: GraduationCap,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.35)',
    bg: 'from-violet-950/80 to-purple-950/80',
    border: 'border-violet-500/50',
    ring: 'shadow-[0_0_40px_rgba(167,139,250,0.4)]',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    traits: ['Buat Tugas', 'Pantau Kelas', 'Lihat Nilai'],
    emoji: '🔮',
    placeholder: 'Email atau Username',
  },
];

export default function LoginVariantA() {
  const [role, setRole] = useState<'siswa' | 'guru' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const selected = classes.find(c => c.id === role);

  return (
    <div className="relative min-h-screen h-full max-w-[390px] w-full mx-auto bg-[#080A0E] overflow-y-auto overflow-x-hidden font-sans flex flex-col text-slate-100">

      {/* Dynamic background shifts with role */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-700">
        {role === 'siswa' && (
          <>
            <div className="absolute top-0 left-[-20%] w-[140%] h-[55%] bg-emerald-900/25 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-teal-900/20 blur-[100px] rounded-full" />
          </>
        )}
        {role === 'guru' && (
          <>
            <div className="absolute top-0 right-[-20%] w-[140%] h-[55%] bg-violet-900/25 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[40%] bg-purple-900/20 blur-[100px] rounded-full" />
          </>
        )}
        {!role && (
          <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[60%] bg-slate-800/40 blur-[100px] rounded-full" />
        )}
        {/* Particle dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              backgroundColor: role === 'guru' ? '#A78BFA' : role === 'siswa' ? '#10B981' : '#ffffff',
              boxShadow: `0 0 6px 2px ${role === 'guru' ? '#A78BFA' : role === 'siswa' ? '#10B981' : '#ffffff'}`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-full px-5 py-8 items-center">

        {/* Header */}
        <div className="flex flex-col items-center mb-7 mt-2">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-3 border border-white/10 shadow-[0_0_30px_rgba(244,63,94,0.12)]">
            <span className="text-3xl">🍅</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-wider text-white mb-0.5 drop-shadow-sm">
            TOMAT
          </h1>
          <p className="text-[9px] font-bold tracking-[0.3em] text-cyan-400 uppercase">
            Tantangan Otak MATematika
          </p>
        </div>

        {/* ── STEP 1: Class Selection ── */}
        <div className="w-full mb-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center mb-3">
            — Pilih peranmu —
          </p>

          <div className="grid grid-cols-2 gap-3">
            {classes.map(cls => {
              const Icon = cls.icon;
              const isActive = role === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setRole(cls.id as 'siswa' | 'guru')}
                  className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 bg-gradient-to-b ${cls.bg} ${
                    isActive
                      ? `${cls.border} ${cls.ring} scale-[1.03]`
                      : 'border-white/5 scale-100 opacity-60 hover:opacity-80'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cls.color }} />
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-2.5"
                    style={{
                      background: `radial-gradient(circle at center, ${cls.glow} 0%, transparent 70%)`,
                      boxShadow: isActive ? `0 0 20px ${cls.glow}` : 'none',
                    }}
                  >
                    <span className="text-2xl">{cls.emoji}</span>
                  </div>
                  <span className="text-sm font-black tracking-wider" style={{ color: isActive ? cls.color : '#94a3b8' }}>
                    {cls.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 font-medium">{cls.sub}</span>

                  {/* Trait pills */}
                  <div className="mt-3 flex flex-col gap-1 w-full">
                    {cls.traits.map(t => (
                      <div
                        key={t}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border text-center transition-all ${
                          isActive ? cls.badge : 'bg-white/5 text-slate-600 border-white/5'
                        }`}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 2: Login Form (slides in after role chosen) ── */}
        <div
          className={`w-full transition-all duration-500 origin-top ${
            role ? 'opacity-100 max-h-[400px] translate-y-0' : 'opacity-0 max-h-0 -translate-y-4 overflow-hidden pointer-events-none'
          }`}
        >
          <div
            className="relative w-full rounded-2xl bg-[#0F1218]/90 backdrop-blur-xl border p-5"
            style={{ borderColor: selected ? selected.color + '33' : 'transparent', boxShadow: selected ? `0 0 30px ${selected.glow}` : 'none' }}
          >
            <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl" style={{ background: selected ? `linear-gradient(90deg, transparent, ${selected.color}66, transparent)` : 'transparent' }} />

            <form className="space-y-3" onSubmit={e => e.preventDefault()}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={selected?.placeholder ?? 'Username'}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-medium"
                  style={{ caretColor: selected?.color }}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none transition-all font-medium tracking-widest"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                className="w-full rounded-xl py-3.5 flex items-center justify-center gap-2 font-black text-sm tracking-widest text-white transition-all"
                style={{
                  background: selected ? `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)` : '#333',
                  boxShadow: selected ? `0 0 24px ${selected.glow}` : 'none',
                }}
              >
                MASUK <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Prompt when no role chosen */}
        {!role && (
          <p className="text-[11px] text-slate-600 text-center mt-2 font-medium">
            Pilih peran untuk melanjutkan
          </p>
        )}

        <div className="mt-auto pt-6 pb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SMP TISA Islamic School · V 2.0.1</p>
          </div>
        </div>

      </div>
    </div>
  );
}
