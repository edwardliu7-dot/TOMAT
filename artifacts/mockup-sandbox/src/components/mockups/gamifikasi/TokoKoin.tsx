import React, { useState } from 'react';
import { ChevronLeft, Coins, Check, Lock, Sparkles, Image as ImageIcon, Paintbrush, Smile, Info } from 'lucide-react';

export function TokoKoin() {
  const [activeTab, setActiveTab] = useState('Bingkai');
  const userCoins = 1450;

  const tabs = [
    { id: 'Bingkai', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'Spanduk', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Tema', icon: <Paintbrush className="w-4 h-4" /> },
    { id: 'Stiker', icon: <Smile className="w-4 h-4" /> },
  ];

  const items = {
    'Bingkai': [
      { id: 1, name: 'Neon Cyber', price: 500, state: 'buyable', visual: 'border-[#34D399] border-dashed' },
      { id: 2, name: 'Api Abadi', price: 800, state: 'buyable', visual: 'border-[#F87171] border-double' },
      { id: 3, name: 'Golden Halo', price: 0, state: 'equipped', visual: 'border-[#EAB308] border-solid shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
      { id: 4, name: 'Void King', price: 3000, state: 'locked', visual: 'border-purple-600 border-solid opacity-50' },
      { id: 5, name: 'Ice Crystal', price: 1200, state: 'buyable', visual: 'border-cyan-400 border-solid' },
      { id: 6, name: 'Sakura Petal', price: 950, state: 'buyable', visual: 'border-pink-400 border-dotted' },
    ],
    'Spanduk': [
      { id: 7, name: 'Galaksi', price: 1000, state: 'buyable', visual: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-black' },
      { id: 8, name: 'Hutan Ajaib', price: 1200, state: 'buyable', visual: 'bg-gradient-to-r from-emerald-900 to-teal-900' },
      { id: 9, name: 'Retro 8-bit', price: 2500, state: 'locked', visual: 'bg-gradient-to-r from-gray-700 to-gray-900' },
    ],
    'Tema': [],
    'Stiker': []
  };

  const renderVisual = (item: any, tab: string) => {
    if (tab === 'Bingkai') {
      return (
        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-black/40 ${item.visual}`}>
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-2xl text-slate-500">🧑‍🎓</span>
          </div>
        </div>
      );
    } else if (tab === 'Spanduk') {
      return (
        <div className={`w-full h-20 rounded-lg ${item.visual} flex items-center justify-center overflow-hidden relative`}>
          {item.state === 'locked' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Lock className="w-6 h-6 text-slate-400" /></div>}
        </div>
      );
    }
    return <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center"><Info className="w-6 h-6 text-slate-500" /></div>;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#000000] font-sans p-4">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[420px] h-[800px] max-h-[100dvh] overflow-hidden rounded-[32px] bg-[#0B0D14] ring-8 ring-gray-900 relative shadow-2xl flex flex-col text-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-800 p-6 rounded-b-[24px] shadow-lg relative z-10 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Toko Kosmetik</h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
          
          <div className="bg-[#0B0D14]/60 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">Saldo Koin</p>
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-[#EAB308]" />
                <span className="text-3xl font-black text-white">{userCoins.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-white/10 text-white flex items-center gap-2">
              <span>Top Up</span>
              <span className="text-[10px] bg-indigo-500 px-1.5 py-0.5 rounded-md text-white font-bold">PRO</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-4 py-4 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' 
                  : 'bg-[#1A1D27] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {tab.icon}
              {tab.id}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 scrollbar-hide">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {activeTab === 'Bingkai' ? 'Bingkai Avatar' : 
               activeTab === 'Spanduk' ? 'Spanduk Profil' : 
               activeTab === 'Tema' ? 'Tema Warna' : 'Stiker Chat'}
            </h2>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
              {(items as any)[activeTab]?.length || 0} Item
            </span>
          </div>

          <div className={`grid ${activeTab === 'Spanduk' ? 'grid-cols-1' : 'grid-cols-2'} gap-4 pb-8`}>
            {(items as any)[activeTab]?.map((item: any) => (
              <div 
                key={item.id} 
                className={`bg-[#1A1D27] rounded-[20px] p-4 flex flex-col items-center gap-4 relative overflow-hidden border ${
                  item.state === 'equipped' ? 'border-[#EAB308]/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 
                  item.state === 'locked' ? 'border-red-900/30 opacity-80' : 'border-white/5'
                }`}
              >
                {/* Equipped Badge */}
                {item.state === 'equipped' && (
                  <div className="absolute top-0 right-0 bg-[#EAB308] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    DIPAKAI
                  </div>
                )}

                {/* Visual Representation */}
                <div className="mt-2">
                  {renderVisual(item, activeTab)}
                </div>

                {/* Info */}
                <div className="text-center w-full mt-auto">
                  <h3 className="font-bold text-white text-sm mb-3">{item.name}</h3>
                  
                  {item.state === 'equipped' ? (
                    <button className="w-full py-2.5 rounded-xl bg-white/5 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 border border-white/10" disabled>
                      <Check className="w-4 h-4 text-[#34D399]" /> Terpasang
                    </button>
                  ) : item.state === 'locked' ? (
                    <button className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 border border-red-500/20" disabled>
                      <Lock className="w-4 h-4" /> 
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3" /> {item.price.toLocaleString('id-ID')}</span>
                    </button>
                  ) : (
                    <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors">
                      Beli <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md"><Coins className="w-3.5 h-3.5 text-[#EAB308]" /> {item.price.toLocaleString('id-ID')}</span>
                    </button>
                  )}
                </div>
                
                {/* Too expensive visual indicator */}
                {item.state === 'locked' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold text-red-400 bg-red-900/50 px-3 py-1.5 rounded-full border border-red-500/30 backdrop-blur-sm">
                      Koin Tidak Cukup
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Empty State for unfinished tabs */}
            {(items as any)[activeTab]?.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Segera Hadir</h3>
                <p className="text-slate-400 text-sm max-w-[200px]">Item baru untuk kategori ini sedang disiapkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokoKoin;
