import React from "react";
import { ChevronLeft, Trophy, Star, Target, Flame, Zap, Award, Lock, BookOpen, Shield, Crown } from "lucide-react";

export function LencanaPencapaian() {
  const badges = [
    {
      id: 1,
      title: "Pemula Tangguh",
      description: "Mencapai Level 10",
      icon: <Zap className="w-8 h-8 text-yellow-300" fill="currentColor" />,
      color: "from-yellow-400 to-amber-600",
      border: "border-yellow-500/50",
      bg: "bg-yellow-500/20",
      isUnlocked: true,
      date: "12 Okt 2023",
    },
    {
      id: 2,
      title: "Pakar Survival",
      description: "20 soal beruntun (Survival)",
      icon: <Flame className="w-8 h-8 text-red-300" fill="currentColor" />,
      color: "from-red-400 to-rose-600",
      border: "border-red-500/50",
      bg: "bg-red-500/20",
      isUnlocked: true,
      date: "15 Okt 2023",
    },
    {
      id: 3,
      title: "Penakluk BAB I",
      description: "Selesaikan semua materi BAB I",
      icon: <BookOpen className="w-8 h-8 text-blue-300" fill="currentColor" />,
      color: "from-blue-400 to-indigo-600",
      border: "border-blue-500/50",
      bg: "bg-blue-500/20",
      isUnlocked: true,
      date: "20 Okt 2023",
    },
    {
      id: 4,
      title: "Rutin 7 Hari",
      description: "Main 7 hari berturut-turut",
      icon: <Target className="w-8 h-8 text-emerald-300" />,
      color: "from-emerald-400 to-teal-600",
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/20",
      isUnlocked: true,
      date: "22 Okt 2023",
    },
    {
      id: 5,
      title: "Sempurna",
      description: "Dapat nilai 100 di Tugas",
      icon: <Star className="w-8 h-8 text-purple-300" fill="currentColor" />,
      color: "from-purple-400 to-fuchsia-600",
      border: "border-purple-500/50",
      bg: "bg-purple-500/20",
      isUnlocked: false,
      date: null,
    },
    {
      id: 6,
      title: "Raja Survival",
      description: "50 soal beruntun (Survival)",
      icon: <Crown className="w-8 h-8 text-amber-300" fill="currentColor" />,
      color: "from-amber-300 to-yellow-600",
      border: "border-amber-500/50",
      bg: "bg-amber-500/20",
      isUnlocked: false,
      date: null,
    },
    {
      id: 7,
      title: "Penakluk BAB II",
      description: "Selesaikan semua materi BAB II",
      icon: <Shield className="w-8 h-8 text-cyan-300" fill="currentColor" />,
      color: "from-cyan-400 to-blue-600",
      border: "border-cyan-500/50",
      bg: "bg-cyan-500/20",
      isUnlocked: false,
      date: null,
    },
    {
      id: 8,
      title: "Legenda TOMAT",
      description: "Mencapai Level 50",
      icon: <Trophy className="w-8 h-8 text-indigo-300" fill="currentColor" />,
      color: "from-indigo-400 to-purple-600",
      border: "border-indigo-500/50",
      bg: "bg-indigo-500/20",
      isUnlocked: false,
      date: null,
    },
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = 30; // Conceptually 30 badges total

  return (
    <div className="flex justify-center bg-[#0B0D14] min-h-screen text-slate-200 font-sans p-4">
      <div className="w-full max-w-[420px] bg-[#0B0D14] rounded-[24px] overflow-hidden flex flex-col relative ring-1 ring-white/10 shadow-2xl">
        {/* Header with Purple Gradient */}
        <div className="bg-gradient-to-b from-indigo-900/60 to-[#0B0D14] pt-6 pb-4 px-6 flex flex-col shrink-0 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
              <ChevronLeft className="w-6 h-6 text-indigo-200" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">Lencana Saya</h1>
          </div>

          <div className="flex items-center gap-4 bg-[#1A1D27] p-4 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <Award className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                Koleksi Anda
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{unlockedCount}</span>
                <span className="text-slate-400 font-medium">/ {totalCount} lencana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center text-center p-4 rounded-[20px] border transition-all duration-300 ${
                  badge.isUnlocked
                    ? "bg-[#1A1D27] border-white/5 hover:border-white/10 hover:-translate-y-1"
                    : "bg-[#12141C] border-white/5 opacity-80"
                }`}
              >
                {/* Badge Icon Container */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 relative ${
                    badge.isUnlocked
                      ? `bg-gradient-to-br ${badge.color} shadow-lg`
                      : "bg-slate-800/50"
                  }`}
                >
                  {badge.isUnlocked ? (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay" />
                  ) : null}
                  
                  {badge.isUnlocked ? (
                    <div className="relative z-10 drop-shadow-md">{badge.icon}</div>
                  ) : (
                    <Lock className="w-8 h-8 text-slate-600" />
                  )}

                  {/* Sparkle effects for unlocked */}
                  {badge.isUnlocked && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-50 blur-[2px]" />
                      <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                    </>
                  )}
                </div>

                {/* Badge Info */}
                <h3 className={`font-bold text-[15px] leading-tight mb-1 ${
                  badge.isUnlocked ? "text-white" : "text-slate-500"
                }`}>
                  {badge.title}
                </h3>
                
                <p className={`text-[11px] leading-snug mb-3 flex-1 ${
                  badge.isUnlocked ? "text-slate-400" : "text-slate-600"
                }`}>
                  {badge.description}
                </p>

                {/* Unlock Date / Lock Status */}
                <div className="w-full mt-auto">
                  {badge.isUnlocked ? (
                    <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 py-1.5 px-2 rounded-lg border border-emerald-400/20">
                      Diraih {badge.date}
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-slate-500 bg-slate-800/50 py-1.5 px-2 rounded-lg border border-slate-700/50">
                      Terkunci
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-300 mb-1">Masih banyak yang tersembunyi!</h4>
            <p className="text-xs text-slate-500">
              Terus mainkan game untuk menemukan dan membuka lencana rahasia lainnya.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
