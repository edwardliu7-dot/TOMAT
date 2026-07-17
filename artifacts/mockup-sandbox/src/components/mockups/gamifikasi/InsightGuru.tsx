import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Flame, Coins, Zap, MoreVertical, ArrowUpRight, TrendingDown } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'Ahmad Faiz', level: 12, expWeek: 2450, coinsWeek: 320, streak: 5, activity: [40, 60, 20, 80, 100, 30, 90], status: 'active' },
  { id: 2, name: 'Bunga Lestari', level: 15, expWeek: 4100, coinsWeek: 550, streak: 12, activity: [80, 100, 90, 80, 100, 100, 100], status: 'very_active' },
  { id: 3, name: 'Bima Satria', level: 8, expWeek: 450, coinsWeek: 50, streak: 0, activity: [20, 0, 0, 10, 0, 0, 0], status: 'inactive' },
  { id: 4, name: 'Dina Mariana', level: 11, expWeek: 1800, coinsWeek: 210, streak: 3, activity: [0, 50, 40, 60, 0, 80, 50], status: 'active' },
  { id: 5, name: 'Fikri Haikal', level: 16, expWeek: 5200, coinsWeek: 800, streak: 21, activity: [100, 100, 100, 90, 100, 100, 100], status: 'very_active' },
  { id: 6, name: 'Gita Savitri', level: 9, expWeek: 800, coinsWeek: 120, streak: 1, activity: [30, 40, 0, 0, 20, 0, 50], status: 'inactive' },
  { id: 7, name: 'Hasan Syarif', level: 10, expWeek: 1200, coinsWeek: 150, streak: 2, activity: [50, 60, 0, 50, 40, 0, 80], status: 'active' },
  { id: 8, name: 'Indira Putri', level: 14, expWeek: 3200, coinsWeek: 420, streak: 7, activity: [70, 80, 60, 90, 80, 70, 90], status: 'active' },
];

export function InsightGuru() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'exp' | 'level' | 'streak'>('exp');

  const sortedStudents = useMemo(() => {
    return [...mockStudents]
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'exp') return b.expWeek - a.expWeek;
        if (sortBy === 'level') return b.level - a.level;
        if (sortBy === 'streak') return b.streak - a.streak;
        return 0;
      });
  }, [searchTerm, sortBy]);

  const getActivityColor = (height: number) => {
    if (height === 0) return 'bg-white/10';
    if (height < 40) return 'bg-[#F87171]'; // red for low
    if (height < 80) return 'bg-[#818CF8]'; // indigo for med
    return 'bg-[#34D399]'; // green for high
  };

  return (
    <div className="mx-auto w-full max-w-[420px] min-h-[100dvh] bg-[#0B0D14] text-white font-sans overflow-hidden flex flex-col shadow-2xl relative">
      
      {/* Header */}
      <div className="relative pt-12 pb-6 px-6 bg-gradient-to-br from-indigo-900 via-purple-900/80 to-[#0B0D14] border-b border-white/5 shrink-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 bg-white/10 rounded-md text-[10px] font-bold tracking-wider uppercase text-indigo-300 mb-2 border border-white/5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5 animate-pulse"></span>
              Guru Dashboard
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              VII Ibnu Batuttah
            </h1>
            <p className="text-sm text-indigo-200 mt-1 opacity-80 font-medium">Insight Keterlibatan Siswa</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm transition-colors hover:bg-white/20">
            <MoreVertical size={20} className="text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-[#1A1D27]/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-[#34D399]" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Rata-rata EXP</span>
            </div>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-black text-white leading-none">2.4K</span>
              <span className="flex items-center text-[10px] font-bold text-[#34D399] mb-0.5 bg-[#34D399]/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight size={10} className="mr-0.5" /> 12%
              </span>
            </div>
          </div>
          <div className="bg-[#1A1D27]/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-[#F87171]" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Siswa Kritis</span>
            </div>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-black text-[#F87171] leading-none">3</span>
              <span className="text-[10px] font-bold text-white/50 mb-0.5 leading-tight">
                dari 32<br/>siswa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 [&::-webkit-scrollbar]:hidden">
        
        {/* Controls */}
        <div className="flex gap-2 sticky top-0 z-20 py-2 bg-[#0B0D14]/90 backdrop-blur-xl -mx-4 px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A1D27] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#1A1D27] border border-white/5 rounded-xl py-3 pl-4 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              <option value="exp">Urut: EXP</option>
              <option value="level">Urut: Level</option>
              <option value="streak">Urut: Streak</option>
            </select>
            <SlidersHorizontal size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {sortedStudents.map((student, idx) => (
            <div 
              key={student.id} 
              className={`bg-[#1A1D27] rounded-2xl p-4 border transition-all ${
                student.status === 'inactive' 
                  ? 'border-[#F87171]/30 relative overflow-hidden bg-gradient-to-r from-[#1A1D27] to-[#F87171]/5' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {student.status === 'inactive' && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="absolute top-3 -right-6 bg-[#F87171] text-white text-[9px] font-bold uppercase tracking-wider py-1 px-8 rotate-45 shadow-[0_2px_10px_rgba(248,113,113,0.5)]">
                    Pasif
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 shadow-inner ${
                    student.status === 'very_active' ? 'bg-gradient-to-br from-[#818CF8] to-[#34D399] text-white' :
                    student.status === 'inactive' ? 'bg-[#F87171]/20 text-[#F87171]' :
                    'bg-[#2A2E3D] text-white/80'
                  }`}>
                    {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  {student.streak > 0 && (
                    <div className="absolute -bottom-1.5 -right-1.5 bg-[#1A1D27] rounded-full p-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                        student.streak >= 7 ? 'bg-gradient-to-br from-[#F59E0B] to-[#F87171] shadow-[0_0_10px_rgba(248,113,113,0.6)]' : 'bg-[#818CF8]'
                      }`}>
                        {student.streak}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-bold text-white text-[15px] truncate">{student.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center text-[10px] font-bold text-[#818CF8] bg-[#818CF8]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      LVL {student.level}
                    </span>
                    {student.status === 'inactive' && (
                      <span className="text-[10px] text-[#F87171] font-bold flex items-center bg-[#F87171]/10 px-1.5 py-0.5 rounded">
                        <TrendingDown size={10} className="mr-0.5" /> ATENSI
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-12 gap-2.5 items-end relative z-10">
                <div className="col-span-4 bg-[#0B0D14] rounded-xl p-2.5 border border-white/5">
                  <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider mb-1 flex items-center">
                    <Zap size={10} className="mr-1 text-[#34D399]" /> EXP
                  </div>
                  <div className="font-black text-[#34D399] text-sm truncate">
                    {student.expWeek.toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div className="col-span-4 bg-[#0B0D14] rounded-xl p-2.5 border border-white/5">
                  <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider mb-1 flex items-center">
                    <Coins size={10} className="mr-1 text-[#EAB308]" /> Koin
                  </div>
                  <div className="font-black text-[#EAB308] text-sm truncate">
                    {student.coinsWeek.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="col-span-4 pl-1">
                  <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider mb-1.5 text-right pr-1">
                    Aktivitas 7H
                  </div>
                  <div className="flex items-end justify-end h-[22px] gap-[3px] pr-1">
                    {student.activity.map((height, i) => (
                      <div key={i} className="w-[4px] h-full bg-[#0B0D14] rounded-full overflow-hidden flex flex-col justify-end">
                        <div className={`w-full rounded-full transition-all duration-500 ${getActivityColor(height)}`} style={{ height: `${height}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}

          {sortedStudents.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto bg-[#1A1D27] rounded-full flex items-center justify-center mb-4">
                <Search className="text-white/20" size={32} />
              </div>
              <p className="text-white/60 font-medium">Tidak ada siswa yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button for Teacher */}
      <div className="absolute bottom-6 right-6 z-30">
        <button className="w-14 h-14 bg-gradient-to-br from-[#818CF8] to-[#6366F1] text-white rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.5)] transition-transform hover:scale-105 active:scale-95 border border-white/10">
          <TrendingDown className="rotate-180" size={24} />
        </button>
      </div>

    </div>
  );
}
