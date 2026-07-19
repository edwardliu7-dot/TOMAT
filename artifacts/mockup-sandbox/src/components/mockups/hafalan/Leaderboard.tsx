import React, { useState } from 'react';
import { Trophy, Medal, Star, ChevronLeft } from 'lucide-react';

const expData = [
  { id: 1, name: 'Fikri Haikal', level: 16, exp: 8500, maxExp: 10000, hafalan: 18, isMe: false, avatar: 'FH', color: 'from-yellow-400 to-yellow-600' },
  { id: 2, name: 'Bunga Lestari', level: 15, exp: 7200, maxExp: 8000, hafalan: 12, isMe: false, avatar: 'BL', color: 'from-slate-300 to-slate-500' },
  { id: 3, name: 'Indira Putri', level: 14, exp: 6800, maxExp: 8000, hafalan: 9, isMe: false, avatar: 'IP', color: 'from-amber-600 to-amber-800' },
  { id: 4, name: 'Reza Rahadian', level: 14, exp: 6100, maxExp: 8000, hafalan: 10, isMe: false, avatar: 'RR' },
  { id: 5, name: 'Ahmad Dani', level: 13, exp: 5400, maxExp: 6000, hafalan: 5, isMe: true, avatar: 'AD' },
  { id: 6, name: 'Siti Nurhaliza', level: 12, exp: 4900, maxExp: 6000, hafalan: 8, isMe: false, avatar: 'SN' },
  { id: 7, name: 'Budi Santoso', level: 11, exp: 4200, maxExp: 5000, hafalan: 3, isMe: false, avatar: 'BS' },
  { id: 8, name: 'Dewi Lestari', level: 10, exp: 3800, maxExp: 5000, hafalan: 2, isMe: false, avatar: 'DL' },
];

const hafalanData = [
  { id: 1, name: 'Fikri Haikal', level: 16, hafalan: 20, isMe: false, avatar: 'FH', mult: 5, div: 5 },
  { id: 4, name: 'Reza Rahadian', level: 14, hafalan: 15, isMe: false, avatar: 'RR', mult: 5, div: 2 },
  { id: 2, name: 'Bunga Lestari', level: 15, hafalan: 12, isMe: false, avatar: 'BL', mult: 4, div: 2 },
  { id: 3, name: 'Indira Putri', level: 14, hafalan: 9, isMe: false, avatar: 'IP', mult: 3, div: 1 },
  { id: 6, name: 'Siti Nurhaliza', level: 12, hafalan: 8, isMe: false, avatar: 'SN', mult: 2, div: 2 },
  { id: 5, name: 'Ahmad Dani', level: 13, hafalan: 5, isMe: true, avatar: 'AD', mult: 1, div: 1 },
  { id: 7, name: 'Budi Santoso', level: 11, hafalan: 3, isMe: false, avatar: 'BS', mult: 1, div: 0 },
  { id: 8, name: 'Dewi Lestari', level: 10, hafalan: 2, isMe: false, avatar: 'DL', mult: 0, div: 0 },
];

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'exp' | 'hafalan'>('hafalan');

  return (
    <div className="bg-[#0B0D14] min-h-[100dvh] w-full text-slate-200 font-sans mx-auto max-w-[420px] shadow-2xl overflow-hidden flex flex-col relative">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-900/40 via-purple-900/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="pt-10 pb-4 px-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Papan Peringkat</h1>
            <p className="text-sm text-indigo-300/80 font-medium">Kelas VII Ibnu Batuttah</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 relative">
          <button
            onClick={() => setActiveTab('exp')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 ${
              activeTab === 'exp' ? 'text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EXP & Level
          </button>
          <button
            onClick={() => setActiveTab('hafalan')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 z-10 ${
              activeTab === 'hafalan' ? 'text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hafalan
          </button>
          {/* Active Tab Indicator */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-lg transition-transform duration-300 ease-out`}
            style={{ transform: activeTab === 'exp' ? 'translateX(0)' : 'translateX(100%)' }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 relative z-10 scrollbar-hide">
        {activeTab === 'exp' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Podium */}
            <div className="flex justify-center items-end gap-3 mt-4 mb-10 h-48">
              {/* Rank 2 */}
              <div className="flex flex-col items-center w-1/3 relative pb-8">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-lg font-bold text-slate-300 z-10 relative overflow-hidden">
                    {expData[1].avatar}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-600/40 to-transparent" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-slate-400 text-slate-900 flex items-center justify-center font-black text-xs border border-[#0B0D14] z-20">2</div>
                </div>
                <div className="text-xs font-bold text-white text-center mb-0.5 truncate w-full px-1">{expData[1].name}</div>
                <div className="text-[10px] text-indigo-300 font-medium mb-1.5">Lv.{expData[1].level}</div>
                <div className="bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 border border-white/5">
                  <span className="text-[10px]">🧮</span>
                  <span className="text-[10px] font-bold text-emerald-400">{expData[1].hafalan}/20</span>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center w-1/3 relative z-10 pb-12">
                <div className="absolute -top-6 text-yellow-400 animate-pulse">
                  <Trophy className="w-6 h-6 fill-yellow-400" />
                </div>
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-[3px] border-yellow-400 flex items-center justify-center text-2xl font-bold text-white z-10 relative overflow-hidden shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                    {expData[0].avatar}
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/40 to-transparent" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-sm border-2 border-[#0B0D14] z-20 shadow-lg">1</div>
                </div>
                <div className="text-sm font-bold text-white text-center mt-1 mb-0.5 truncate w-full px-1">{expData[0].name}</div>
                <div className="text-[11px] text-yellow-300 font-medium mb-2">Lv.{expData[0].level}</div>
                <div className="bg-yellow-400/20 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-yellow-400/30">
                  <span className="text-xs">🧮</span>
                  <span className="text-xs font-bold text-yellow-300">{expData[0].hafalan}/20</span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center w-1/3 relative pb-6">
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-600 flex items-center justify-center text-lg font-bold text-amber-200 z-10 relative overflow-hidden">
                    {expData[2].avatar}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-800/40 to-transparent" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-amber-600 text-amber-50 flex items-center justify-center font-black text-xs border border-[#0B0D14] z-20">3</div>
                </div>
                <div className="text-xs font-bold text-white text-center mb-0.5 truncate w-full px-1">{expData[2].name}</div>
                <div className="text-[10px] text-indigo-300 font-medium mb-1.5">Lv.{expData[2].level}</div>
                <div className="bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 border border-white/5">
                  <span className="text-[10px]">🧮</span>
                  <span className="text-[10px] font-bold text-emerald-400">{expData[2].hafalan}/20</span>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {expData.slice(3).map((user, idx) => (
                <div 
                  key={user.id} 
                  className={`flex items-center p-3 rounded-2xl border ${
                    user.isMe 
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  } transition-colors`}
                >
                  <div className="w-6 text-center font-bold text-slate-400 mr-2 text-sm">{idx + 4}</div>
                  
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 border border-white/10 mr-3">
                    {user.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-white truncate">{user.name}</span>
                      {user.isMe && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white uppercase tracking-wider">Kamu</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-indigo-300 whitespace-nowrap">Lv.{user.level}</span>
                      <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-400 rounded-full"
                          style={{ width: `${(user.exp / user.maxExp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-3 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 flex flex-col items-center justify-center min-w-[48px]">
                    <span className="text-xs mb-0.5">🧮</span>
                    <span className="text-[10px] font-bold text-slate-300 leading-none">{user.hafalan}/20</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hafalan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
            <div className="flex flex-col gap-3">
              {hafalanData.map((user, idx) => (
                <div 
                  key={user.id} 
                  className={`relative flex flex-col p-4 rounded-2xl border ${
                    user.isMe 
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  } transition-colors`}
                >
                  {/* Top student tooltip */}
                  {idx === 0 && (
                    <div className="absolute -top-3 right-4 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 border border-emerald-400 z-20">
                      <Star className="w-3 h-3 fill-emerald-950" />
                      Hafal semua!
                    </div>
                  )}

                  <div className="flex items-center">
                    <div className="w-6 text-center font-black text-xl text-slate-600 mr-3">
                      {idx === 0 ? <span className="text-yellow-400">1</span> :
                       idx === 1 ? <span className="text-slate-300">2</span> :
                       idx === 2 ? <span className="text-amber-600">3</span> :
                       idx + 1}
                    </div>
                    
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mr-3 relative ${
                      idx === 0 ? 'bg-slate-800 border-2 border-yellow-400 text-white shadow-[0_0_10px_rgba(250,204,21,0.2)]' :
                      'bg-slate-800 border border-white/10 text-slate-300'
                    }`}>
                      {user.avatar}
                      {idx === 0 && (
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#0B0D14]">
                            <Star className="w-3 h-3 fill-yellow-950 text-yellow-950" />
                         </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white truncate">{user.name}</span>
                        {user.isMe && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white uppercase tracking-wider">Kamu</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Level {user.level}</div>
                    </div>
                    
                    <div className="ml-2 text-right">
                      <div className="text-2xl font-black font-mono tracking-tighter">
                        <span className={user.hafalan === 20 ? "text-emerald-400" : "text-white"}>{user.hafalan}</span>
                        <span className="text-slate-500 text-lg">/20</span>
                      </div>
                    </div>
                  </div>

                  {/* Hafalan Progress Dots */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1.5 flex justify-between">
                        <span>PERKALIAN (×1 - ×5)</span>
                        <span className={user.mult === 5 ? "text-emerald-400" : ""}>{user.mult}/5</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(i => (
                          <div 
                            key={`m-${i}`} 
                            className={`flex-1 h-1.5 rounded-full ${i <= user.mult ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.3)]' : 'bg-slate-800 border border-white/5'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-white/5" />
                    
                    <div className="flex-1">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1.5 flex justify-between">
                        <span>PEMBAGIAN (÷1 - ÷5)</span>
                        <span className={user.div === 5 ? "text-emerald-400" : ""}>{user.div}/5</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(i => (
                          <div 
                            key={`d-${i}`} 
                            className={`flex-1 h-1.5 rounded-full ${i <= user.div ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.3)]' : 'bg-slate-800 border border-white/5'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action / Navigation Area to ground the design */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0B0D14] via-[#0B0D14]/90 to-transparent pointer-events-none z-20" />
    </div>
  );
}
