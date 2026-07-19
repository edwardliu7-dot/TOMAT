import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Lock, 
  Award,
  Clock
} from 'lucide-react';

interface HafalanProgress {
  perkalian: number[]; // array of passed levels (1-10)
  pembagian: number[];
}

interface Student {
  id: string;
  name: string;
  kelas: string;
  progress: HafalanProgress;
  avatarColor: string;
  recentHistory: {
    materi: string;
    status: 'lulus' | 'ulang';
    date: string;
  }[];
}

const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Bunga Lestari',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2, 3, 4, 5, 6],
      pembagian: [1, 2, 3],
    },
    avatarColor: 'bg-rose-500',
    recentHistory: [
      { materi: 'Perkalian × 6', status: 'lulus', date: 'Hari ini, 08:30' },
      { materi: 'Perkalian × 6', status: 'ulang', date: 'Kemarin, 09:15' },
      { materi: 'Pembagian ÷ 3', status: 'lulus', date: 'Senin, 10:00' },
    ]
  },
  {
    id: '2',
    name: 'Ahmad Rizki',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      pembagian: [1, 2, 3, 4, 5],
    },
    avatarColor: 'bg-blue-500',
    recentHistory: [
      { materi: 'Pembagian ÷ 5', status: 'lulus', date: 'Hari ini, 07:45' },
    ]
  },
  {
    id: '3',
    name: 'Cici Paramida',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2],
      pembagian: [],
    },
    avatarColor: 'bg-emerald-500',
    recentHistory: [
      { materi: 'Perkalian × 2', status: 'lulus', date: 'Kemarin, 11:20' },
    ]
  },
  {
    id: '4',
    name: 'Dwi Saputra',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2, 3, 4],
      pembagian: [1, 2],
    },
    avatarColor: 'bg-amber-500',
    recentHistory: []
  },
  {
    id: '5',
    name: 'Eka Putri',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2, 3, 4, 5, 6, 7],
      pembagian: [1],
    },
    avatarColor: 'bg-purple-500',
    recentHistory: []
  },
  {
    id: '6',
    name: 'Fajar Siddiq',
    kelas: 'VII Ibnu Batuttah',
    progress: {
      perkalian: [1, 2, 3],
      pembagian: [],
    },
    avatarColor: 'bg-indigo-500',
    recentHistory: []
  },
];

export function GuruPanel() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(MOCK_STUDENTS[0]);
  const [activeTab, setActiveTab] = useState<'perkalian' | 'pembagian'>('perkalian');
  const [selectedMateri, setSelectedMateri] = useState<number>(7);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProgressDots = (progress: number[]) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(num => (
          <div 
            key={num} 
            className={`w-2 h-2 rounded-full ${progress.includes(num) ? 'bg-[#34D399]' : 'bg-white/10'}`} 
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  if (selectedStudent) {
    // State 2: Penilaian Setoran
    return (
      <div className="min-h-[100dvh] w-full bg-[#0B0D14] text-slate-200 font-sans selection:bg-indigo-500/30 flex justify-center">
        <div className="w-full max-w-[420px] bg-[#0B0D14] relative flex flex-col min-h-[100dvh] border-x border-white/5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-b from-indigo-900/40 to-transparent sticky top-0 z-10 backdrop-blur-sm">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Kembali ke daftar</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${selectedStudent.avatarColor} flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-${selectedStudent.avatarColor.split('-')[1]}-500/20`}>
                {getInitials(selectedStudent.name)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{selectedStudent.name}</h1>
                <p className="text-sm text-slate-400">{selectedStudent.kelas}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Award size={14} className="text-yellow-400" />
                  <span className="text-xs text-yellow-400/90 font-medium">
                    {selectedStudent.progress.perkalian.length + selectedStudent.progress.pembagian.length} Hafalan Lulus
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 pb-32 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-sm font-bold text-white mb-3 tracking-wide uppercase text-slate-400">Pilih Materi Hafalan</h2>
              
              {/* Tabs */}
              <div className="flex p-1 bg-white/5 rounded-xl mb-4 border border-white/10">
                <button 
                  onClick={() => setActiveTab('perkalian')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'perkalian' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Perkalian
                </button>
                <button 
                  onClick={() => setActiveTab('pembagian')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'pembagian' 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pembagian
                </button>
              </div>

              {/* Grid 1-10 */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isPassed = selectedStudent.progress[activeTab].includes(num);
                  const isSelected = selectedMateri === num;
                  const isNext = !isPassed && (num === 1 || selectedStudent.progress[activeTab].includes(num - 1));
                  const isLocked = !isPassed && !isNext;

                  return (
                    <button
                      key={num}
                      disabled={isLocked}
                      onClick={() => setSelectedMateri(num)}
                      className={`
                        relative flex flex-col items-center justify-center aspect-square rounded-xl border transition-all
                        ${isPassed 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : isSelected
                            ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105 z-10'
                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500/80 cursor-not-allowed'
                        }
                      `}
                    >
                      <span className="text-xs opacity-70 mb-0.5">{activeTab === 'perkalian' ? '×' : '÷'}</span>
                      <span className="text-lg font-bold">{num}</span>
                      
                      {isPassed && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border border-[#0B0D14]">
                          <CheckCircle2 size={10} className="text-[#0B0D14]" />
                        </div>
                      )}
                      
                      {!isPassed && !isSelected && (
                        <div className="absolute top-1 right-1">
                          <Lock size={10} className="text-yellow-500/50" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History */}
            {selectedStudent.recentHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-400 mb-3 tracking-wide uppercase flex items-center gap-2">
                  <Clock size={14} /> Riwayat Terakhir
                </h3>
                <div className="space-y-2">
                  {selectedStudent.recentHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-sm font-medium text-white">{hist.materi}</div>
                        <div className="text-xs text-slate-400">{hist.date}</div>
                      </div>
                      <div className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                        hist.status === 'lulus' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {hist.status === 'lulus' ? 'LULUS' : 'DIULANG'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assessment Bottom Bar */}
          <div className="fixed bottom-0 w-full max-w-[420px] bg-[#0B0D14]/90 backdrop-blur-md border-t border-white/10 p-4 pb-safe">
            <div className="mb-3 text-center">
              <p className="text-sm text-slate-400">Menilai Setoran</p>
              <p className="text-lg font-bold text-white capitalize">{activeTab} {activeTab === 'perkalian' ? '×' : '÷'} {selectedMateri}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="w-5 h-5 rounded-full bg-red-400/20 flex items-center justify-center">×</span>
                DIULANG
              </button>
              <button className="flex-1 bg-[#34D399] text-[#0B0D14] border border-[#34D399] font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 transition-transform">
                <CheckCircle2 size={20} />
                LULUS
              </button>
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  // State 1: Student Selection List
  return (
    <div className="min-h-[100dvh] w-full bg-[#0B0D14] text-slate-200 font-sans selection:bg-indigo-500/30 flex justify-center">
      <div className="w-full max-w-[420px] bg-[#0B0D14] relative flex flex-col min-h-[100dvh] border-x border-white/5">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-purple-900/30 to-transparent">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
            <span className="text-yellow-400">✦</span> Guru Matematika
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Setoran Hafalan</h1>
          <p className="text-sm text-slate-400 font-medium">Kelas VII Ibnu Batuttah</p>
        </div>

        <div className="px-4 pb-20 flex-1">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <button 
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  // auto select next incomplete level
                  const nextPerkalian = [1,2,3,4,5,6,7,8,9,10].find(n => !student.progress.perkalian.includes(n)) || 10;
                  setSelectedMateri(nextPerkalian);
                  setActiveTab('perkalian');
                }}
                className="w-full flex items-center p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all group text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${student.avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg`}>
                  {getInitials(student.name)}
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{student.name}</h3>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold w-4">×</span>
                      {renderProgressDots(student.progress.perkalian)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold w-4">÷</span>
                      {renderProgressDots(student.progress.pembagian)}
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-500/20 group-hover:translate-x-1 transition-all">
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">Siswa tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
