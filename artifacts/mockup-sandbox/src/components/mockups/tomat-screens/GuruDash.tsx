import React from 'react';
import { 
  ChevronDown, 
  Calendar, 
  Settings, 
  Play, 
  Lock, 
  Unlock, 
  Users, 
  BarChart2, 
  Gamepad2, 
  ShieldCheck, 
  ClipboardList
} from 'lucide-react';

export default function GuruDash() {
  return (
    <div className="min-h-screen w-full bg-[#0F1115] text-slate-200 font-sans overflow-x-hidden relative pb-20">
      {/* Nebula Background */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-900/30 via-violet-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[40%] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-20%] w-[50%] h-[40%] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Profile Header */}
      <div className="relative pt-12 pb-6 px-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-[2px] shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#1E2128] rounded-full flex items-center justify-center text-2xl">
                👩‍🏫
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0F1115] flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Bu Sari Dewi</h1>
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mt-0.5">Guru Matematika • SMP TISA</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="px-1 z-10 relative border-b border-white/5">
        <div className="flex overflow-x-auto hide-scrollbar px-4 gap-6">
          <div className="pb-3 border-b-2 border-green-500 text-green-400 font-bold whitespace-nowrap text-sm flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            <ClipboardList className="w-4 h-4" /> TUGAS
          </div>
          <div className="pb-3 text-slate-500 font-bold whitespace-nowrap text-sm flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer">
            <Lock className="w-4 h-4" /> HAFALAN
          </div>
          <div className="pb-3 text-slate-500 font-bold whitespace-nowrap text-sm flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer">
            <BarChart2 className="w-4 h-4" /> REKAP NILAI
          </div>
          <div className="pb-3 text-slate-500 font-bold whitespace-nowrap text-sm flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer">
            <Users className="w-4 h-4" /> SISWA
          </div>
          <div className="pb-3 text-slate-500 font-bold whitespace-nowrap text-sm flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer">
            <Unlock className="w-4 h-4" /> KUNCI BAB
          </div>
          <div className="pb-3 text-slate-500 font-bold whitespace-nowrap text-sm flex items-center gap-2 hover:text-slate-300 transition-colors cursor-pointer">
            <Gamepad2 className="w-4 h-4" /> INSIGHT
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 z-10 relative space-y-6">
        
        {/* Tetapkan Tugas Baru Card */}
        <div className="bg-[#1E2128]/70 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
              Tetapkan Tugas Baru
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kelas</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between text-sm font-bold text-white transition-colors cursor-pointer">
                  IX A
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_2px_rgba(103,232,249,0.5)]">Game Modul</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-cyan-500/40 hover:border-cyan-400/60 rounded-xl flex items-center justify-between text-sm font-bold text-white shadow-[0_0_15px_rgba(103,232,249,0.05)_inset] transition-colors cursor-pointer">
                  <span className="truncate mr-2">📦 Manifest Kargo Alien</span>
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Penilaian</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between text-sm font-bold text-white transition-colors cursor-pointer">
                  Harian
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jml Soal</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between text-sm font-bold text-white transition-colors cursor-pointer">
                  5 Soal
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kesulitan</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between text-sm font-bold text-white transition-colors cursor-pointer">
                  <span className="text-yellow-400 drop-shadow-[0_0_2px_rgba(234,179,8,0.5)]">Sedang</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tenggat</label>
                <div className="h-11 px-3 bg-[#0F1115]/80 border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-between text-sm font-bold text-white transition-colors cursor-pointer">
                  25 Jul 2026
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>

            <button className="w-full h-12 mt-2 bg-green-500 hover:bg-green-400 text-[#0F1115] font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Play className="w-5 h-5 fill-[#0F1115]" />
              Tetapkan Tugas
            </button>
          </div>
        </div>

        {/* Daftar Tugas List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2">
              Daftar Tugas 
              <span className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">3</span>
            </h3>
          </div>

          <div className="space-y-3">
            {/* Task Item 1 */}
            <div className="bg-[#1E2128]/60 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden flex relative group hover:bg-[#1E2128]/80 transition-colors">
              <div className="w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div className="p-3.5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-white pr-2">📦 Manifest Kargo Alien</h4>
                  <span className="text-[9px] font-black uppercase text-green-400 tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex-shrink-0 mt-0.5">Aktif</span>
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  <span className="text-cyan-400 font-bold bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">IX A</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>Harian</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>5 soal</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-yellow-400/80">Sedang</span>
                </div>
              </div>
              <div className="px-3.5 border-l border-white/5 flex flex-col justify-center items-center gap-1 bg-white/[0.02] hover:bg-rose-500/10 transition-colors cursor-pointer group/btn">
                <span className="text-[10px] font-bold uppercase text-rose-400/70 group-hover/btn:text-rose-400 transition-colors">Tutup</span>
              </div>
            </div>

            {/* Task Item 2 */}
            <div className="bg-[#1E2128]/60 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden flex relative group hover:bg-[#1E2128]/80 transition-colors">
              <div className="w-1.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div className="p-3.5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-white pr-2">🎯 Kalibrasi Jangkauan Radar</h4>
                  <span className="text-[9px] font-black uppercase text-green-400 tracking-wider bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex-shrink-0 mt-0.5">Aktif</span>
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  <span className="text-cyan-400 font-bold bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">IX B</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>Formatif</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>10 soal</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-rose-400/80">Sulit</span>
                </div>
              </div>
              <div className="px-3.5 border-l border-white/5 flex flex-col justify-center items-center gap-1 bg-white/[0.02] hover:bg-rose-500/10 transition-colors cursor-pointer group/btn">
                <span className="text-[10px] font-bold uppercase text-rose-400/70 group-hover/btn:text-rose-400 transition-colors">Tutup</span>
              </div>
            </div>

            {/* Task Item 3 */}
            <div className="bg-[#1E2128]/30 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden flex relative opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-1.5 bg-slate-600" />
              <div className="p-3.5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-slate-300 pr-2">💻 Dekripsi Konsol Komputer</h4>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider bg-slate-500/10 px-2 py-1 rounded border border-slate-500/20 flex-shrink-0 mt-0.5">Ditutup</span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  <span className="text-slate-400 font-bold bg-slate-400/10 px-1.5 py-0.5 rounded border border-slate-400/20">VIII A</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>Harian</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>5 soal</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-green-400/60">Mudah</span>
                </div>
              </div>
              <div className="px-3.5 border-l border-white/5 flex flex-col justify-center items-center gap-1 bg-white/[0.02] hover:bg-green-500/10 transition-colors cursor-pointer group/btn">
                <span className="text-[10px] font-bold uppercase text-green-400/70 group-hover/btn:text-green-400 transition-colors">Buka</span>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
