import React, { useState } from 'react';
import { 
  ArrowRight, Award, Bell, Coins, Compass, 
  Flame, GraduationCap, Home, LockKeyhole, MessageCircle, ShoppingBag, 
  Sparkles, Star, Target, Trophy, User, Zap 
} from 'lucide-react';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const [toastMessage, setToastMessage] = useState('');
  const [missionStarted, setMissionStarted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

  const handleTabClick = (tabId: string, label: string) => {
    if (tabId === 'home') {
      setActiveTab('home');
    } else {
      showToast(`${label} belum tersedia`);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background blobs + dot grid */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute -right-[20%] top-[30%] h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[10%] h-[300px] w-[300px] rounded-full bg-sky-500/6 blur-[80px]" />
        
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{ 
            backgroundImage: 'radial-gradient(#b8deef 0.65px, transparent 0.65px)', 
            backgroundSize: '23px 23px' 
          }}
        />
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 h-full overflow-y-auto pb-24">
        
        {/* Section 1 — Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-[#071321]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-cyan-300 to-indigo-500 text-[#071321] shadow-lg shadow-cyan-500/20">
              <Target size={20} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-[0.18em] text-white">TOMAT</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
              <Coins size={14} className="text-amber-300" strokeWidth={2.5} />
              <span className="text-[12px] font-bold text-amber-200">385</span>
            </div>
            
            <button 
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] active:scale-95 transition-all"
              onClick={() => showToast('Tidak ada notifikasi baru')}
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 border border-[#071321]"></span>
            </button>
            
            <button 
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-300 to-indigo-500 font-black text-xs text-[#071321] shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              onClick={() => showToast('Buka profil')}
            >
              AF
            </button>
          </div>
        </header>

        {/* Section 2 — Greeting */}
        <div className="mt-5 px-4">
          <div className="inline-block rounded-sm bg-cyan-500/10 px-1.5 py-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
              PETA PERJALANANMU
            </span>
          </div>
          <h1 className="mt-2 text-[26px] font-black leading-tight text-white">
            Halo, Ahmad. 👋
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Siap menjelajah hari ini?
          </p>
        </div>

        {/* Section 3 — Stats pills row */}
        <div className="mt-4 flex gap-2 px-4">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 py-3 px-2">
            <Flame size={20} className="fill-orange-300 text-orange-300" />
            <span className="text-[12px] font-black text-white leading-none mt-1">7 hari</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wide">streak</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 py-3 px-2">
            <Zap size={20} className="fill-cyan-300 text-cyan-300" />
            <span className="text-[12px] font-black text-cyan-200 leading-none mt-1">+120 XP</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wide">minggu ini</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 py-3 px-2">
            <Trophy size={20} className="text-indigo-300" />
            <span className="text-[12px] font-black text-indigo-200 leading-none mt-1">#12</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wide">rankingku</span>
          </div>
        </div>

        {/* Section 4 — Next mission card */}
        <div className="mt-5 px-4">
          <div className="relative w-full overflow-hidden rounded-[22px] border border-cyan-300/20 bg-gradient-to-br from-[#102e42] via-[#0c2539] to-[#151b47] p-5">
            {/* Decorative rings */}
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-cyan-300/[0.07] pointer-events-none"></div>
            <div className="absolute -right-2 top-10 h-40 w-40 rounded-full border border-indigo-300/[0.1] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  MISI BERIKUTNYA
                </span>
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-amber-300 fill-amber-300" />
                  <span className="text-[10px] font-semibold text-slate-400">+40 XP</span>
                </div>
              </div>
              
              <h2 className="mt-3 text-[20px] font-black leading-tight text-white">
                Membaca Jejak di Gua Bilangan
              </h2>
              <p className="mt-1.5 text-[12px] text-slate-300/80">
                Pecahkan 5 teka-teki bilangan bulat.
              </p>
              
              {/* Progress bar */}
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((segment) => (
                  <div 
                    key={segment} 
                    className={`h-2 flex-1 rounded-full ${
                      segment <= 3 
                        ? 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.5)]' 
                        : 'bg-white/[0.10]'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">
                3 dari 5 tantangan selesai
              </p>
              
              {/* CTA button */}
              <button 
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[13px] bg-cyan-300 py-3 text-[13px] font-black text-[#082033] transition-all hover:bg-cyan-200 active:scale-[0.98]"
                onClick={() => setMissionStarted(true)}
              >
                {missionStarted ? (
                  <>MISI DIBUKA ✓</>
                ) : (
                  <>
                    LANJUTKAN MISI
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 5 — Zone list */}
        <div className="mt-6 px-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-black text-white">Zona Petualangan</h3>
            <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[9px] font-bold text-cyan-200">
              3 ZONA
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">Pilih jalurmu.</p>

          <div className="mt-3 space-y-3">
            {/* Zone 01 */}
            <div className="flex items-center gap-3.5 rounded-[18px] border border-white/[0.07] bg-[#0b1c2c]/80 p-4 active:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => showToast('Buka Gerbang Bilangan')}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Compass size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="truncate text-[14px] font-black text-white">Gerbang Bilangan</h4>
                  <span className="shrink-0 text-[10px] text-slate-500">68%</span>
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-cyan-300/70">
                  Matematika · VII
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.09]">
                  <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.35)] w-[68%]" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">7 dari 10 misi selesai</p>
              </div>
            </div>

            {/* Zone 02 */}
            <div className="flex items-center gap-3.5 rounded-[18px] border border-white/[0.07] bg-[#0b1c2c]/80 p-4 active:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => showToast('Buka Hutan Ekosistem')}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-indigo-300/20 bg-indigo-300/10 text-indigo-300">
                <Sparkles size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="truncate text-[14px] font-black text-white">Hutan Ekosistem</h4>
                  <span className="shrink-0 text-[10px] text-slate-500">34%</span>
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-indigo-300/70">
                  Biologi · VII
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.09]">
                  <div className="h-full rounded-full bg-indigo-400 w-[34%]" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">4 dari 12 misi selesai</p>
              </div>
            </div>

            {/* Zone 03 */}
            <div className="flex items-center gap-3.5 rounded-[18px] border border-white/[0.07] bg-[#0b1c2c]/80 p-4 opacity-60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-slate-500/20 bg-slate-500/10 text-slate-400">
                <Star size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="truncate text-[14px] font-black text-slate-300">Observatorium Kata</h4>
                  <LockKeyhole size={14} className="shrink-0 text-slate-500" />
                </div>
                <div className="mt-0.5 text-[10px] font-bold text-slate-400/70">
                  Bahasa Indonesia · VII
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.09]">
                  <div className="h-full rounded-full bg-slate-500 w-[0%]" />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Buka 2 misi lagi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 — Quick links */}
        <div className="mt-6 mb-4 px-4">
          <h3 className="text-[14px] font-black text-white">Akses cepat</h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button 
              className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 p-3 text-left transition-colors active:bg-white/[0.03]"
              onClick={() => showToast('Buka Nilai')}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <GraduationCap size={16} />
              </div>
              <div>
                <div className="text-[12px] font-bold text-white">Nilai</div>
                <div className="text-[10px] text-slate-500">Rapor & Statistik</div>
              </div>
            </button>
            
            <button 
              className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 p-3 text-left transition-colors active:bg-white/[0.03]"
              onClick={() => showToast('Buka Chat')}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="text-[12px] font-bold text-white">Chat</div>
                <div className="text-[10px] text-slate-500">Tanya Guru</div>
              </div>
            </button>

            <button 
              className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 p-3 text-left transition-colors active:bg-white/[0.03]"
              onClick={() => showToast('Buka Toko')}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <ShoppingBag size={16} />
              </div>
              <div>
                <div className="text-[12px] font-bold text-white">Toko</div>
                <div className="text-[10px] text-amber-300/80">385 koin</div>
              </div>
            </button>

            <button 
              className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.07] bg-[#0b1c2c]/80 p-3 text-left transition-colors active:bg-white/[0.03]"
              onClick={() => showToast('Buka Lencana')}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-rose-300">
                <Award size={16} />
              </div>
              <div>
                <div className="text-[12px] font-bold text-white">Lencana</div>
                <div className="text-[10px] text-rose-300/80">12 koleksi</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Section 7 — Fixed bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#071321]/95 pb-5 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 pt-3">
          <button 
            className="flex flex-col items-center gap-1 min-w-[64px]"
            onClick={() => handleTabClick('home', 'Beranda')}
          >
            <div className="relative">
              {activeTab === 'home' && (
                <div className="absolute -top-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />
              )}
              <Home 
                size={22} 
                className={activeTab === 'home' ? 'text-cyan-300' : 'text-slate-500'} 
                strokeWidth={activeTab === 'home' ? 2.5 : 2}
              />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'home' ? 'text-cyan-300' : 'text-slate-500'}`}>
              Beranda
            </span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1 min-w-[64px]"
            onClick={() => handleTabClick('journey', 'Perjalanan')}
          >
            <div className="relative">
              {activeTab === 'journey' && (
                <div className="absolute -top-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />
              )}
              <Compass 
                size={22} 
                className={activeTab === 'journey' ? 'text-cyan-300' : 'text-slate-500'} 
                strokeWidth={activeTab === 'journey' ? 2.5 : 2}
              />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'journey' ? 'text-cyan-300' : 'text-slate-500'}`}>
              Perjalanan
            </span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1 min-w-[64px]"
            onClick={() => handleTabClick('leaderboard', 'Peringkat')}
          >
            <div className="relative">
              {activeTab === 'leaderboard' && (
                <div className="absolute -top-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />
              )}
              <Trophy 
                size={22} 
                className={activeTab === 'leaderboard' ? 'text-cyan-300' : 'text-slate-500'} 
                strokeWidth={activeTab === 'leaderboard' ? 2.5 : 2}
              />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'leaderboard' ? 'text-cyan-300' : 'text-slate-500'}`}>
              Peringkat
            </span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-1 min-w-[64px]"
            onClick={() => handleTabClick('profile', 'Profil')}
          >
            <div className="relative">
              {activeTab === 'profile' && (
                <div className="absolute -top-3 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-300" />
              )}
              <User 
                size={22} 
                className={activeTab === 'profile' ? 'text-cyan-300' : 'text-slate-500'} 
                strokeWidth={activeTab === 'profile' ? 2.5 : 2}
              />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'profile' ? 'text-cyan-300' : 'text-slate-500'}`}>
              Profil
            </span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-[90px] left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-[#10263a] px-4 py-3 text-[11px] font-semibold text-cyan-100 shadow-2xl">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
