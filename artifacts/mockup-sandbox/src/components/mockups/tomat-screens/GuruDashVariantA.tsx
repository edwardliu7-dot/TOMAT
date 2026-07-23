import React, { useState } from 'react';
import {
  Plus, X, ChevronDown, Calendar, Play,
  BarChart2, Lock, Users, Gamepad2, Unlock, ClipboardList,
  ShieldCheck, TrendingUp, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

// Variant A: "Mission Control"
// Flip the hierarchy: active assignments are the primary surface.
// "New Task" is a FAB that slides up a compact bottom sheet.
// Teacher sees deployment status at a glance, not a blank form.

const TASKS = [
  {
    id: 1, emoji: '📦', name: 'Manifest Kargo Alien',
    kelas: 'IX A', type: 'Harian', soal: 5, level: 'Sedang',
    levelColor: '#FBBF24', status: 'aktif',
    done: 18, total: 28, pct: 64,
    deadline: '25 Jul',
  },
  {
    id: 2, emoji: '🎯', name: 'Kalibrasi Jangkauan Radar',
    kelas: 'IX B', type: 'Formatif', soal: 10, level: 'Sulit',
    levelColor: '#F87171', status: 'aktif',
    done: 5, total: 30, pct: 17,
    deadline: '27 Jul',
  },
  {
    id: 3, emoji: '💻', name: 'Dekripsi Konsol Komputer',
    kelas: 'VIII A', type: 'Harian', soal: 5, level: 'Mudah',
    levelColor: '#34D399', status: 'tutup',
    done: 25, total: 25, pct: 100,
    deadline: '20 Jul',
  },
];

const STATS = [
  { label: 'Aktif', value: '2', icon: Play, color: '#34D399' },
  { label: 'Selesai', value: '1', icon: CheckCircle2, color: '#A78BFA' },
  { label: 'Siswa', value: '83', icon: Users, color: '#67E8F9' },
  { label: 'Avg Score', value: '78', icon: TrendingUp, color: '#FBBF24' },
];

export default function GuruDashVariantA() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tugas');

  return (
    <div className="relative min-h-screen w-full bg-[#080B10] text-slate-200 font-sans overflow-hidden flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-violet-900/20 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[-20%] w-[60%] h-[40%] bg-cyan-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-10 pb-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-[2px] shadow-[0_0_14px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full bg-[#1A1F2B] rounded-full flex items-center justify-center text-xl">👩‍🏫</div>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Bu Sari Dewi</h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Guru Matematika · SMP TISA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            2 AKTIF
          </div>
        </div>
      </div>

      {/* Stat Strip */}
      <div className="relative z-10 px-5 mb-4">
        <div className="grid grid-cols-4 gap-2">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <div className="text-base font-black text-white leading-none">{s.value}</div>
                <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="relative z-10 px-5 border-b border-white/5 mb-4">
        <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-2.5">
          {[
            { id: 'tugas', icon: ClipboardList, label: 'TUGAS' },
            { id: 'hafalan', icon: Lock, label: 'HAFALAN' },
            { id: 'nilai', icon: BarChart2, label: 'NILAI' },
            { id: 'siswa', icon: Users, label: 'SISWA' },
            { id: 'insight', icon: Gamepad2, label: 'INSIGHT' },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 text-[10px] font-black tracking-widest whitespace-nowrap transition-all pb-0.5 border-b-2 ${
                  active ? 'text-emerald-400 border-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'text-slate-600 border-transparent hover:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mission List — primary surface */}
      <div className="relative z-10 flex-1 px-5 space-y-3 overflow-y-auto pb-28">

        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Deployment Aktif</h3>
          <span className="text-[9px] text-slate-600 font-bold">{TASKS.length} misi</span>
        </div>

        {TASKS.map(t => (
          <div
            key={t.id}
            className={`relative rounded-2xl border overflow-hidden transition-all ${
              t.status === 'aktif'
                ? 'bg-[#111720]/80 border-white/8'
                : 'bg-[#0C0F14]/60 border-white/4 opacity-60'
            }`}
          >
            {/* Progress bar across top */}
            <div className="h-1 w-full bg-white/5 rounded-t-2xl overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${t.pct}%`,
                  background: t.pct === 100 ? '#A78BFA' : t.status === 'aktif' ? '#34D399' : '#4B5563',
                  boxShadow: t.status === 'aktif' ? '0 0 8px rgba(52,211,153,0.5)' : 'none',
                }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5">{t.emoji}</span>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight mb-1">{t.name}</h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded">{t.kelas}</span>
                      <span className="text-[9px] text-slate-500 font-bold">{t.type}</span>
                      <span className="text-[9px] font-bold" style={{ color: t.levelColor }}>{t.level}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {t.status === 'aktif' ? (
                    <span className="text-[8px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Aktif</span>
                  ) : (
                    <span className="text-[8px] font-black text-slate-500 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">Selesai</span>
                  )}
                  <span className="text-[8px] text-slate-600 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{t.deadline}
                  </span>
                </div>
              </div>

              {/* Progress row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-400 font-bold">
                    <span className="text-white">{t.done}</span>/{t.total} siswa
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black" style={{ color: t.pct === 100 ? '#A78BFA' : '#34D399' }}>{t.pct}%</div>
                  {t.status === 'aktif' && (
                    <button className="text-[9px] font-black text-rose-400/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-2 py-0.5 rounded transition-all">
                      TUTUP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      {!sheetOpen && (
        <button
          onClick={() => setSheetOpen(true)}
          className="absolute bottom-7 right-5 z-30 w-14 h-14 rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6 text-white font-black" strokeWidth={3} />
        </button>
      )}

      {/* Bottom Sheet — New Task */}
      <div
        className={`absolute inset-x-0 bottom-0 z-40 transition-all duration-400 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-[#131820] rounded-t-3xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] p-5 pt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
            <h2 className="text-sm font-black text-white tracking-wide mt-2">Tetapkan Tugas Baru</h2>
            <button onClick={() => setSheetOpen(false)} className="text-slate-500 hover:text-white transition-colors mt-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-2.5 mb-2.5">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Kelas</label>
              <div className="h-10 px-3 bg-black/40 border border-white/8 rounded-xl flex items-center justify-between text-xs font-bold text-white">IX A <ChevronDown className="w-3.5 h-3.5 text-slate-500" /></div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Game Modul</label>
              <div className="h-10 px-3 bg-black/40 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs font-bold text-white">
                <span className="truncate mr-1">📦 Manifest Kargo Alien</span>
                <ChevronDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              { label: 'Penilaian', value: 'Harian' },
              { label: 'Jml Soal', value: '5 Soal' },
              { label: 'Tenggat', value: '25 Jul', icon: Calendar },
            ].map(f => (
              <div key={f.label}>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{f.label}</label>
                <div className="h-10 px-2.5 bg-black/40 border border-white/8 rounded-xl flex items-center justify-between text-xs font-bold text-white">
                  <span className="truncate">{f.value}</span>
                  {f.icon ? <f.icon className="w-3 h-3 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-[#080B10] font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
            <Play className="w-4 h-4 fill-[#080B10]" /> Tetapkan Tugas
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sheetOpen && (
        <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[2px]" onClick={() => setSheetOpen(false)} />
      )}

      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}
