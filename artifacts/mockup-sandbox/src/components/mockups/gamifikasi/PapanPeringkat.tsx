import React from "react";
import { Trophy, Medal, ChevronLeft, Zap, Coins } from "lucide-react";

export function PapanPeringkat() {
  const leaderboardData = [
    { rank: 1, name: "Bima S.", level: 12, exp: 2450, isMe: false },
    { rank: 2, name: "Alya F.", level: 11, exp: 2300, isMe: false },
    { rank: 3, name: "Rizky D.", level: 11, exp: 2150, isMe: false },
    { rank: 4, name: "Siti A.", level: 10, exp: 1900, isMe: false },
    { rank: 5, "name": "Fadil M.", level: 10, exp: 1850, isMe: false },
    { rank: 6, name: "Nisa K.", level: 9, exp: 1600, isMe: false },
    { rank: 7, name: "Dika P.", level: 9, exp: 1550, isMe: false },
    { rank: 8, name: "Putri W.", level: 9, exp: 1420, isMe: false },
    { rank: 9, name: "Tariq H.", level: 8, exp: 1250, isMe: true },
    { rank: 10, name: "Reza A.", level: 8, exp: 1100, isMe: false },
    { rank: 11, name: "Kirana P.", level: 7, exp: 950, isMe: false },
    { rank: 12, name: "Adit N.", level: 7, exp: 800, isMe: false },
  ];

  const top3 = [
    leaderboardData[1], // Rank 2
    leaderboardData[0], // Rank 1
    leaderboardData[2], // Rank 3
  ];

  const rest = leaderboardData.slice(3);
  const me = leaderboardData.find((user) => user.isMe);

  return (
    <div className="w-full max-w-[420px] h-[850px] mx-auto bg-[#0B0D14] text-white flex flex-col font-sans overflow-hidden shadow-2xl relative border border-slate-800 rounded-3xl">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-indigo-600 to-indigo-800 pt-12 pb-24 px-6 relative shrink-0">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 active:scale-95 transition-transform">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider">PAPAN PERINGKAT</h1>
            <p className="text-indigo-200 text-sm font-medium">VII Ibnu Battutah</p>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Podium Section - Overlapping header */}
      <div className="relative z-20 px-6 -mt-20 shrink-0">
        <div className="flex items-end justify-center gap-3">
          {/* Rank 2 */}
          <div className="flex flex-col items-center mb-6 z-10">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-[#1A1D27] border-4 border-slate-300 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(203,213,225,0.3)]">
                {top3[0].name.charAt(0)}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-slate-300 rounded-full flex items-center justify-center border-2 border-[#1A1D27] text-slate-800 font-bold text-xs">
                2
              </div>
            </div>
            <p className="text-sm font-bold mt-2 truncate w-20 text-center">{top3[0].name}</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full mt-1">
              <Zap size={10} fill="currentColor" /> {top3[0].exp}
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center z-20 transform -translate-y-4">
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
                <Trophy size={28} fill="currentColor" />
              </div>
              <div className="w-20 h-20 rounded-full bg-[#1A1D27] border-4 border-yellow-400 flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                {top3[1].name.charAt(0)}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[#1A1D27] text-yellow-900 font-black text-sm">
                1
              </div>
            </div>
            <p className="text-base font-bold mt-3 text-yellow-400 truncate w-24 text-center">{top3[1].name}</p>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2.5 py-1 rounded-full mt-1">
              <Zap size={12} fill="currentColor" /> {top3[1].exp}
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center mb-4 z-10">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-full bg-[#1A1D27] border-4 border-amber-600 flex items-center justify-center text-lg font-bold shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                {top3[2].name.charAt(0)}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center border-2 border-[#1A1D27] text-amber-100 font-bold text-xs">
                3
              </div>
            </div>
            <p className="text-sm font-bold mt-2 truncate w-20 text-center">{top3[2].name}</p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full mt-1">
              <Zap size={10} fill="currentColor" /> {top3[2].exp}
            </div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28 scrollbar-hide">
        <div className="flex flex-col gap-3">
          {rest.map((user) => (
            <div 
              key={user.rank} 
              className={`flex items-center gap-3 p-3 rounded-2xl ${user.isMe ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-[#1A1D27]'} transition-colors hover:bg-slate-800`}
            >
              <div className="w-8 text-center text-slate-400 font-bold text-sm">
                {user.rank}
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.isMe ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${user.isMe ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {user.name} {user.isMe && <span className="text-xs text-indigo-400 font-normal ml-1">(Kamu)</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">
                    Lvl {user.level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold text-sm">
                  <Zap size={14} fill="currentColor" />
                  {user.exp}
                </div>
                {/* Progress bar visual */}
                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full" 
                    style={{ width: `${(user.exp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed "Me" Banner at bottom */}
      {me && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0B0D14] via-[#0B0D14] to-transparent pointer-events-none">
          <div className="bg-[#1A1D27] border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] rounded-2xl p-3 flex items-center gap-3 pointer-events-auto">
            <div className="w-8 text-center text-indigo-400 font-black text-sm">
              {me.rank}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-indigo-600 ring-2 ring-indigo-400/50">
              {me.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate text-white">
                {me.name} <span className="text-xs text-indigo-300 font-normal ml-1">(Kamu)</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded">
                  Lvl {me.level}
                </span>
                <span className="text-[10px] text-slate-400">150 XP ke Lvl {me.level + 1}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-emerald-400 font-bold text-sm">
                <Zap size={14} fill="currentColor" />
                {me.exp}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hide scrollbar styles inline for convenience */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
