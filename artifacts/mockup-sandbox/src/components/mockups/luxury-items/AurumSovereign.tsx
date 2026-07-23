import React from 'react';

export function AurumSovereign() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-8 font-sans selection:bg-[#d4af37]/30">
      <div 
        className="relative w-[320px] h-[480px] rounded-sm p-[1px] shadow-2xl transition-transform duration-700 hover:scale-[1.02] group"
        style={{
          background: 'linear-gradient(145deg, #d4af37 0%, #aa7c11 20%, #2a220b 45%, #1a1505 80%, #4a3810 100%)',
          boxShadow: '0 30px 60px -15px rgba(212, 175, 55, 0.2), 0 0 20px rgba(212, 175, 55, 0.05) inset'
        }}
      >
        <div className="relative h-full w-full bg-[#0a0a0a] flex flex-col overflow-hidden rounded-[1px]">
          {/* Background Texture / Glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-30" style={{
            background: 'radial-gradient(circle at 50% 30%, #d4af37 0%, transparent 60%)'
          }}></div>
          
          <div className="absolute inset-0 pointer-events-none mix-blend-overlay" style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.08%22/%3E%3C/svg%3E")'
          }}></div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#d4af37]/40 m-3 opacity-70"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#d4af37]/40 m-3 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#d4af37]/40 m-3 opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#d4af37]/40 m-3 opacity-70"></div>

          <div className="relative p-6 flex flex-col items-center h-full z-10">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-12">
              <span className="text-[9px] tracking-[0.3em] text-[#d4af37]/80 font-semibold uppercase">
                Bingkai Avatar
              </span>
              <div className="px-2.5 py-1 border border-[#d4af37]/40 bg-[#d4af37]/10 backdrop-blur-md rounded-sm shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                <span className="text-[9px] tracking-[0.2em] text-[#e8d08c] font-bold">
                  EDISI 01 / 25
                </span>
              </div>
            </div>

            {/* Visual Symbol */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-10 group-hover:drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-700">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 border border-[#d4af37]/20 rounded-full animate-[spin_60s_linear_infinite]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#d4af37]/50"></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#d4af37]/50"></div>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#d4af37]/50"></div>
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#d4af37]/50"></div>
              </div>
              
              <div className="absolute inset-4 border border-[#d4af37]/10 rounded-full border-dashed"></div>
              
              {/* Core Symbol */}
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] z-10">
                <defs>
                  <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF5B8" />
                    <stop offset="20%" stopColor="#E0AA3E" />
                    <stop offset="50%" stopColor="#9C7006" />
                    <stop offset="80%" stopColor="#E0AA3E" />
                    <stop offset="100%" stopColor="#FFF5B8" />
                  </linearGradient>
                  <linearGradient id="gold-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0AA3E" />
                    <stop offset="50%" stopColor="#8B6508" />
                    <stop offset="100%" stopColor="#4A3604" />
                  </linearGradient>
                </defs>
                <path d="M2 20L4 10L9 14L12 3L15 14L20 10L22 20H2Z" fill="url(#gold-grad)" stroke="url(#gold-grad-dark)" strokeWidth="0.5" strokeLinejoin="round"/>
                <circle cx="12" cy="2" r="1.5" fill="url(#gold-grad)" />
                <circle cx="4" cy="8" r="1.5" fill="url(#gold-grad)" />
                <circle cx="20" cy="8" r="1.5" fill="url(#gold-grad)" />
                <path d="M5 16.5H19" stroke="#634805" strokeWidth="0.5" strokeLinecap="round"/>
                <path d="M5 18H19" stroke="#634805" strokeWidth="0.5" strokeLinecap="round"/>
                
                {/* Central gem */}
                <path d="M12 9L14 12L12 15L10 12L12 9Z" fill="#0a0a0a" stroke="url(#gold-grad)" strokeWidth="0.5"/>
              </svg>
            </div>

            {/* Title & Copy */}
            <div className="text-center w-full mb-auto mt-2">
              <h2 className="text-3xl font-serif mb-4 tracking-wide" style={{
                background: 'linear-gradient(to right, #f2e3b6, #d4af37, #f2e3b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 20px rgba(212,175,55,0.3)'
              }}>
                Aurum Sovereign
              </h2>
              
              <div className="flex items-center justify-center gap-3 mb-5 opacity-70">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]"></div>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
              </div>

              <p className="text-[11px] text-[#e8d08c]/70 leading-relaxed font-light italic max-w-[240px] mx-auto">
                "Kehormatan abadi bagi sang penguasa rasio. Warisan mahkota bertahta emas murni."
              </p>
            </div>

            {/* Price Footer */}
            <div className="w-full pt-5 border-t border-[#d4af37]/20 flex items-center justify-between">
              <span className="text-[9px] tracking-[0.2em] text-[#d4af37]/60 uppercase font-medium">
                Nilai Akuisisi
              </span>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#gold-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v12"></path>
                  <path d="M8 12h8"></path>
                </svg>
                <span className="text-sm font-semibold tracking-wider text-[#e8d08c] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  12.000
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
