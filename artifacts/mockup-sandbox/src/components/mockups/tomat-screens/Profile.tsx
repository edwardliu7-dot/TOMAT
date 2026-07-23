import React from "react";
import { ArrowLeft, Camera, Star, Zap, Save, LogOut } from "lucide-react";

export default function Profile() {
  const hexPattern = `url("data:image/svg+xml,%3Csvg width='40' height='69.2820323027551' viewBox='0 0 40 69.2820323027551' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 17.3205081l-20 11.5470053L0 17.3205081V-5.77350269l20-11.5470053L40-5.77350269V17.3205081zm0 46.1880215l-20 11.5470053-20-11.5470053V40.4145188l20-11.5470053 20 11.5470053v22.7060108zM20 51.9615242l-20-11.5470053v-23.0940108l20-11.5470054 20 11.5470054v23.0940108L20 51.9615242z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div 
      className="relative w-full max-w-[390px] min-h-[844px] bg-[#0F1115] overflow-y-auto text-slate-100 font-sans mx-auto shadow-2xl pb-10" 
      style={{ backgroundImage: hexPattern, backgroundAttachment: 'fixed' }}
    >
      
      {/* Nebula Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute -top-[10%] -left-[20%] w-[350px] h-[350px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[30%] -right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -left-[10%] w-[300px] h-[300px] rounded-full bg-green-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* TopBar */}
        <div className="flex items-center px-6 py-6 sticky top-0 bg-[#0F1115]/80 backdrop-blur-xl z-50 border-b border-white/[0.08]">
          <button className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6 text-cyan-400" />
          </button>
          <h1 className="ml-2 text-lg font-black text-white tracking-wide uppercase">Profil Saya</h1>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-6 px-6">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-violet-500 via-cyan-400 to-green-400 p-[3px] shadow-[0_0_30px_rgba(103,232,249,0.3)]">
              <div className="w-full h-full rounded-full bg-[#1E2128] flex items-center justify-center text-[64px]">
                🧑‍🚀
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-cyan-400 border-4 border-[#0F1115] flex items-center justify-center text-[#0F1115] hover:bg-cyan-300 transition-colors shadow-lg">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="mt-5 text-2xl font-black text-white tracking-wide">AHMAD FAUZI</h2>
          <div className="mt-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(103,232,249,0.15)]">
            IX A · SMP TISA
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 px-6 mt-8">
          <div className="flex flex-col items-center justify-center py-4 bg-[#1E2128]/70 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xl">
            <Star className="w-7 h-7 text-yellow-400 mb-1.5 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" fill="currentColor" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
            <span className="text-sm font-black text-white mt-0.5">8</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 bg-[#1E2128]/70 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xl">
            <div className="text-2xl mb-1.5 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">💰</div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Koin</span>
            <span className="text-sm font-black text-white mt-0.5">1,250</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 bg-[#1E2128]/70 backdrop-blur-md rounded-2xl border border-white/[0.08] shadow-xl">
            <Zap className="w-7 h-7 text-cyan-400 mb-1.5 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" fill="currentColor" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP</span>
            <span className="text-sm font-black text-white mt-0.5">2,400</span>
          </div>
        </div>

        {/* Informasi Akun Card */}
        <div className="px-6 mt-8">
          <div className="bg-[#1E2128]/80 backdrop-blur-md rounded-2xl p-5 border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-cyan-400"></div>
            <h3 className="text-sm font-bold text-cyan-400 mb-5 uppercase tracking-wider">Informasi Akun</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  defaultValue="Ahmad Fauzi"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                <textarea 
                  defaultValue="Suka matematika dan science. Cita-cita jadi astronot! 🚀"
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-500 bg-black/50 px-2 py-1 rounded-md">
                  47/150
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hafalan Progress Card */}
        <div className="px-6 mt-6">
          <div className="bg-[#1E2128]/80 backdrop-blur-md rounded-2xl p-5 border border-white/[0.08] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
            <h3 className="text-sm font-bold text-green-400 mb-5 uppercase tracking-wider flex items-center gap-2">
              <span className="text-base">🧮</span> Hafalan Perkalian
            </h3>
            
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { q: "6×6", s: true }, { q: "6×7", s: true }, { q: "6×8", s: true }, { q: "6×9", s: true },
                { q: "7×6", s: true }, { q: "7×7", s: true }, { q: "7×8", s: false }, { q: "7×9", s: false },
                { q: "8×6", s: true }, { q: "8×7", s: false }, { q: "8×8", s: false }, { q: "8×9", s: false },
                { q: "9×6", s: true }, { q: "9×7", s: false }, { q: "9×8", s: false }, { q: "9×9", s: false },
                { q: "10×6", s: true }, { q: "10×7", s: true }, { q: "10×8", s: true }, { q: "10×9", s: true },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`
                    flex items-center justify-center h-11 rounded-xl text-xs font-black border transition-all
                    ${item.s 
                      ? 'bg-green-500/15 border-green-400/40 text-green-300 shadow-[0_0_12px_rgba(74,222,128,0.2)]' 
                      : 'bg-black/40 border-white/[0.05] text-slate-600'}
                  `}
                >
                  {item.q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 mt-8 space-y-4">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-[#0F1115] font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] uppercase tracking-widest">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
          
          <button className="w-full bg-transparent border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
