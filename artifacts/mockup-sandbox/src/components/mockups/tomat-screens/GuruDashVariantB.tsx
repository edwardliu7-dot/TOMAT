import React, { useState } from 'react';
import {
  ChevronRight, BarChart2, Lock, Users, Gamepad2,
  ClipboardList, ShieldCheck, TrendingUp, CheckCircle2,
  AlertCircle, Star, Zap, BookOpen, Plus
} from 'lucide-react';

// Variant B: "Kelas-First"
// Primary surface = class roster with live progress rings.
// Teacher sees which class needs attention at a glance.
// Assignments are scoped per class, not a flat global list.

const KELAS = [
  {
    id: 'IX A', grade: 'IX', sub: 'A',
    siswa: 28, hadir: 26,
    avgScore: 82, topScore: 97,
    tugas: { aktif: 2, selesai: 8 },
    pct: 82,
    color: '#818CF8', glow: 'rgba(129,140,248,0.4)',
    alert: null,
    lastGame: '📦 Manifest Kargo Alien',
  },
  {
    id: 'IX B', grade: 'IX', sub: 'B',
    siswa: 30, hadir: 28,
    avgScore: 71, topScore: 91,
    tugas: { aktif: 1, selesai: 6 },
    pct: 71,
    color: '#FB923C', glow: 'rgba(251,146,60,0.4)',
    alert: '5 siswa belum mulai tugas',
    lastGame: '🎯 Kalibrasi Radar',
  },
  {
    id: 'VIII A', grade: 'VIII', sub: 'A',
    siswa: 25, hadir: 25,
    avgScore: 90, topScore: 100,
    tugas: { aktif: 0, selesai: 10 },
    pct: 90,
    color: '#34D399', glow: 'rgba(52,211,153,0.4)',
    alert: null,
    lastGame: '💻 Dekripsi Konsol',
  },
];

const TABS = [
  { id: 'kelas', icon: BookOpen, label: 'KELAS' },
  { id: 'tugas', icon: ClipboardList, label: 'TUGAS' },
  { id: 'hafalan', icon: Lock, label: 'HAFALAN' },
  { id: 'nilai', icon: BarChart2, label: 'NILAI' },
  { id: 'siswa', icon: Users, label: 'SISWA' },
  { id: 'insight', icon: Gamepad2, label: 'INSIGHT' },
];

function ProgressRing({ pct, color, glow, size = 52 }: { pct: number; color: string; glow: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
      />
    </svg>
  );
}

export default function GuruDashVariantB() {
  const [activeTab, setActiveTab] = useState('kelas');
  const [expandedClass, setExpandedClass] = useState<string | null>('IX A');

  return (
    <div className="relative min-h-screen w-full bg-[#09090F] text-slate-200 font-sans overflow-hidden flex flex-col">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[50%] bg-indigo-900/15 rounded-full blur-[90px]" />
        <div className="absolute top-[50%] left-[-20%] w-[60%] h-[40%] bg-orange-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-10 pb-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 p-[2px] shadow-[0_0_16px_rgba(129,140,248,0.4)]">
              <div className="w-full h-full rounded-[14px] bg-[#13131F] flex items-center justify-center text-xl">👩‍🏫</div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-[#09090F] flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-[15px] font-black text-white tracking-tight leading-tight">Bu Sari Dewi</h1>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Guru Matematika · SMP TISA</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[9px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Zap className="w-2.5 h-2.5" />
            3 KELAS AKTIF
          </div>
          <div className="text-[8px] text-slate-500 font-bold">83 siswa total</div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="relative z-10 px-5 mb-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Avg Score', value: '81', icon: Star, color: '#FBBF24' },
            { label: 'Tugas Aktif', value: '3', icon: ClipboardList, color: '#818CF8' },
            { label: 'Selesai', value: '24', icon: CheckCircle2, color: '#34D399' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-none">{s.value}</div>
                  <div className="text-[8px] text-slate-500 font-bold mt-0.5">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="relative z-10 px-5 border-b border-white/[0.05] mb-3">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2.5">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 text-[10px] font-black tracking-widest whitespace-nowrap transition-all pb-0.5 border-b-2 ${
                  active
                    ? 'text-indigo-400 border-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.6)]'
                    : 'text-slate-600 border-transparent hover:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Class list */}
      <div className="relative z-10 flex-1 px-5 space-y-3 overflow-y-auto pb-6">

        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daftar Kelas</span>
          <button className="flex items-center gap-1 text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors">
            <Plus className="w-3 h-3" /> Tambah Kelas
          </button>
        </div>

        {KELAS.map(k => {
          const expanded = expandedClass === k.id;
          return (
            <div
              key={k.id}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                background: expanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                borderColor: expanded ? `${k.color}30` : 'rgba(255,255,255,0.05)',
                boxShadow: expanded ? `0 0 30px ${k.glow}15` : 'none',
              }}
            >
              {/* Top accent bar */}
              <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${k.color}80, transparent)` }} />

              <button
                className="w-full p-4 flex items-center gap-4 text-left"
                onClick={() => setExpandedClass(expanded ? null : k.id)}
              >
                {/* Ring + class badge */}
                <div className="relative flex-shrink-0">
                  <ProgressRing pct={k.pct} color={k.color} glow={k.glow} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[11px] font-black text-white leading-none">{k.pct}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-black text-white">{k.grade}</span>
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black"
                      style={{ background: `${k.color}20`, color: k.color }}
                    >
                      {k.sub}
                    </span>
                    {k.alert && (
                      <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold truncate">
                    {k.lastGame}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                    <Users className="w-3 h-3" />
                    {k.hadir}/{k.siswa}
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-slate-600 transition-transform"
                    style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
                  {/* Alert */}
                  {k.alert && (
                    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span className="text-[10px] text-orange-300 font-bold">{k.alert}</span>
                    </div>
                  )}

                  {/* Stat row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Avg Score', value: k.avgScore, suffix: '', color: k.color },
                      { label: 'Tertinggi', value: k.topScore, suffix: '', color: '#FBBF24' },
                      { label: 'Tugas', value: k.tugas.aktif, suffix: ' aktif', color: '#34D399' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/[0.03] rounded-xl p-2.5 text-center">
                        <div className="text-sm font-black" style={{ color: stat.color }}>{stat.value}<span className="text-[8px] text-slate-500">{stat.suffix}</span></div>
                        <div className="text-[8px] text-slate-500 font-bold mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: `${k.color}20`, color: k.color, border: `1px solid ${k.color}30` }}
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> Rekap Nilai
                    </button>
                    <button
                      className="flex-1 h-9 bg-white/[0.04] border border-white/8 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-white/[0.07] transition-all"
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> Beri Tugas
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}
