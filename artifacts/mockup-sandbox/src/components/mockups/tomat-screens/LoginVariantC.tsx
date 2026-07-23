import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';

// Variant C: "Identifikasi Agen" — Mission Briefing Terminal
// Leans fully into the game narrative: you are an agent identifying yourself to the system.
// Role selection = choosing your clearance level. Form = credential verification terminal.
// Monospace typography, scan-line effects, amber/green terminal aesthetic.

const ROLES = [
  {
    id: 'siswa',
    code: 'AGEN-LAPANGAN',
    label: 'SISWA',
    clearance: 'LEVEL 1 — HIJAU',
    clearanceColor: '#34D399',
    clearanceBg: 'rgba(52,211,153,0.12)',
    clearanceBorder: 'rgba(52,211,153,0.3)',
    desc: 'Akses: Quest, Arena, Leaderboard.',
    userLabel: 'ID AGEN (NISN)',
    userPlaceholder: 'Masukkan NISN atau username...',
    emoji: '🎯',
    accentColor: '#34D399',
    glowColor: 'rgba(52,211,153,0.25)',
  },
  {
    id: 'guru',
    code: 'KOMANDAN',
    label: 'GURU',
    clearance: 'LEVEL 5 — MERAH',
    clearanceColor: '#F87171',
    clearanceBg: 'rgba(248,113,113,0.12)',
    clearanceBorder: 'rgba(248,113,113,0.3)',
    desc: 'Akses: Komando, Intelijen, Laporan.',
    userLabel: 'ID KOMANDAN',
    userPlaceholder: 'Masukkan email atau username...',
    emoji: '🎖️',
    accentColor: '#F87171',
    glowColor: 'rgba(248,113,113,0.25)',
  },
];

function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);
  return displayed;
}

function Blink() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ opacity: on ? 1 : 0, color: '#34D399' }}>█</span>;
}

export default function LoginVariantC() {
  const [step, setStep] = useState<'identify' | 'verify'>('identify');
  const [role, setRole] = useState<typeof ROLES[0] | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  const headerText = useTypingEffect('> SISTEM TOMAT v2.0.1', 35);
  const subText = useTypingEffect('> IDENTIFIKASI AGEN DIPERLUKAN...', 25);

  // Animate scan line
  useEffect(() => {
    const t = setInterval(() => setScanLine(v => (v + 1) % 100), 20);
    return () => clearInterval(t);
  }, []);

  const chosen = role;

  return (
    <div className="relative min-h-screen h-full max-w-[390px] w-full mx-auto overflow-hidden font-mono text-green-400 flex flex-col"
      style={{ background: '#020804' }}
    >
      {/* CRT scan-line overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 h-[2px] opacity-10 transition-none"
          style={{
            top: `${scanLine}%`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.8) 30%, rgba(52,211,153,1) 50%, rgba(52,211,153,0.8) 70%, transparent 100%)',
          }}
        />
        {/* Subtle CRT lines */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-20 flex flex-col min-h-full px-5 py-6">

        {/* Terminal header */}
        <div className="mb-6 border border-green-900/60 rounded-lg p-4 bg-black/40">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[9px] text-green-800 tracking-widest ml-1">TOMAT-TERMINAL</span>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] text-green-400 tracking-wider">{headerText}<Blink /></p>
            <p className="text-[10px] text-green-700 tracking-wider">{subText}</p>
          </div>

          <div className="mt-3 border-t border-green-900/40 pt-3 flex items-center gap-3">
            <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px rgba(52,211,153,0.5))' }}>🍅</div>
            <div>
              <div className="text-base font-black tracking-[0.3em] text-green-300">TOMAT</div>
              <div className="text-[8px] text-green-700 tracking-[0.2em]">TANTANGAN OTAK MATEMATIKA</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[8px] text-green-800">STATUS</div>
              <div className="text-[9px] text-green-400 font-bold tracking-wider animate-pulse">● ONLINE</div>
            </div>
          </div>
        </div>

        {/* Step 1: Role/clearance selection */}
        {step === 'identify' && (
          <div className="flex-1 flex flex-col">
            <div className="text-[10px] text-green-700 tracking-widest uppercase mb-3">
              &gt; Pilih tingkat akses:
            </div>

            <div className="space-y-3 mb-6">
              {ROLES.map(r => {
                const isSelected = chosen?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRole(r)}
                    className="w-full text-left rounded-lg border transition-all duration-200 p-4 relative overflow-hidden"
                    style={{
                      background: isSelected ? r.clearanceBg : 'rgba(0,0,0,0.4)',
                      borderColor: isSelected ? r.accentColor + '80' : 'rgba(52,211,153,0.15)',
                      boxShadow: isSelected ? `0 0 20px ${r.glowColor}, inset 0 0 20px ${r.glowColor}` : 'none',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ background: r.accentColor }} />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="text-2xl mt-0.5" style={{ filter: isSelected ? `drop-shadow(0 0 10px ${r.accentColor})` : 'none' }}>
                        {r.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black tracking-[0.2em]" style={{ color: isSelected ? r.accentColor : '#4B5563' }}>
                            {r.label}
                          </span>
                          <span className="text-[8px] font-bold tracking-widest" style={{ color: isSelected ? r.accentColor + 'aa' : '#374151' }}>
                            [{r.code}]
                          </span>
                        </div>
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-bold tracking-widest mb-1.5"
                          style={{
                            background: isSelected ? r.clearanceBg : 'transparent',
                            borderColor: isSelected ? r.clearanceBorder : 'rgba(52,211,153,0.1)',
                            color: isSelected ? r.clearanceColor : '#374151',
                          }}
                        >
                          <span className="text-[8px]">▲</span>
                          {r.clearance}
                        </div>
                        <p className="text-[9px] tracking-wider" style={{ color: isSelected ? r.accentColor + '99' : '#374151' }}>
                          {r.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="text-[8px] font-black tracking-widest" style={{ color: r.accentColor }}>
                          ✓ PILIH
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => chosen && setStep('verify')}
              disabled={!chosen}
              className="w-full rounded-lg py-3.5 flex items-center justify-center gap-2 text-sm font-black tracking-[0.2em] uppercase transition-all duration-300"
              style={{
                background: chosen ? `linear-gradient(135deg, ${chosen.accentColor}33, ${chosen.accentColor}22)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${chosen ? chosen.accentColor + '60' : 'rgba(52,211,153,0.1)'}`,
                color: chosen ? chosen.accentColor : '#374151',
                boxShadow: chosen ? `0 0 20px ${chosen.glowColor}` : 'none',
                cursor: chosen ? 'pointer' : 'not-allowed',
              }}
            >
              &gt; LANJUT VERIFIKASI <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-auto pt-4 text-center">
              <p className="text-[9px] text-green-900 tracking-widest">SMP TISA Islamic School · AUTHORIZED USE ONLY</p>
            </div>
          </div>
        )}

        {/* Step 2: Credential verification */}
        {step === 'verify' && chosen && (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setStep('identify')}
              className="flex items-center gap-1.5 text-[10px] tracking-widest mb-4 transition-colors"
              style={{ color: chosen.accentColor + '80' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              &lt; KEMBALI
            </button>

            <div className="border rounded-lg p-3 mb-5" style={{ borderColor: chosen.accentColor + '30', background: chosen.clearanceBg }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{chosen.emoji}</span>
                <div>
                  <div className="text-[8px] tracking-widest" style={{ color: chosen.accentColor + '80' }}>IDENTITAS TERPILIH</div>
                  <div className="text-sm font-black tracking-[0.2em]" style={{ color: chosen.accentColor }}>{chosen.label} [{chosen.code}]</div>
                </div>
                <div className="ml-auto text-[8px] font-bold px-2 py-1 rounded border" style={{ color: chosen.clearanceColor, borderColor: chosen.clearanceBorder, background: chosen.clearanceBg }}>
                  {chosen.clearance}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-green-700 tracking-widest mb-4">
              &gt; Masukkan kredensial untuk verifikasi:
            </div>

            <form className="space-y-4 flex-1 flex flex-col" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="text-[9px] tracking-widest block mb-1.5" style={{ color: chosen.accentColor + '80' }}>
                  &gt; {chosen.userLabel}:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold" style={{ color: chosen.accentColor + '60' }}>&gt;</span>
                  <input
                    type="text"
                    placeholder={chosen.userPlaceholder}
                    className="w-full rounded-lg py-3 pl-8 pr-4 text-sm border bg-black/60 focus:outline-none font-mono tracking-wider"
                    style={{
                      borderColor: chosen.accentColor + '30',
                      color: chosen.accentColor,
                      caretColor: chosen.accentColor,
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] tracking-widest block mb-1.5" style={{ color: chosen.accentColor + '80' }}>
                  &gt; KATA SANDI:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold" style={{ color: chosen.accentColor + '60' }}>&gt;</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full rounded-lg py-3 pl-8 pr-11 text-sm border bg-black/60 focus:outline-none font-mono tracking-widest"
                    style={{
                      borderColor: chosen.accentColor + '30',
                      color: chosen.accentColor,
                      caretColor: chosen.accentColor,
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: chosen.accentColor + '60' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <button
                  type="button"
                  className="w-full rounded-lg py-3.5 flex items-center justify-center gap-2 text-sm font-black tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${chosen.accentColor}22, ${chosen.accentColor}11)`,
                    border: `1px solid ${chosen.accentColor}60`,
                    color: chosen.accentColor,
                    boxShadow: `0 0 25px ${chosen.glowColor}`,
                  }}
                >
                  <div className="absolute inset-0 animate-pulse opacity-20" style={{ background: `radial-gradient(ellipse at center, ${chosen.accentColor} 0%, transparent 70%)` }} />
                  <span className="relative">&gt; VERIFIKASI &amp; MASUK</span>
                  <ArrowRight className="w-4 h-4 relative" />
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <p className="text-[9px] text-green-900 tracking-widest">SMP TISA Islamic School · AUTHORIZED USE ONLY</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
