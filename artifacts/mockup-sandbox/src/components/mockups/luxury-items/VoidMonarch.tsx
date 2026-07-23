import React from 'react';

export function VoidMonarch() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#030303] p-8 font-sans">
      {/* Container - Outer thin border acting like a metallic edge */}
      <div className="group relative w-[320px] rounded-sm bg-[#08080a] border border-[#16161c] p-[1px] transition-all duration-700 hover:border-[#2a2a36] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.15)] cursor-pointer">
        
        {/* Inner Card - Deep obsidian core */}
        <div className="relative w-full h-full bg-[#040406] rounded-sm overflow-hidden flex flex-col">
          
          {/* Subtle Void Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(49,46,129,0.12),_transparent_50%)] pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(0,0,0,1),_transparent_100%)] pointer-events-none"></div>

          {/* Top Bar */}
          <div className="relative z-10 flex justify-between items-start p-6 pb-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#4f46e5]/80">
                Bingkai Avatar
              </span>
            </div>
            <div className="px-2 py-1 bg-[#0a0a0f] border border-[#2a2a3a] rounded-sm backdrop-blur-md">
              <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-[#818cf8]/90 shadow-[#818cf8]">
                Edisi 03 / 13
              </span>
            </div>
          </div>

          {/* Center Visual - The Void Singularity */}
          <div className="relative z-10 w-full h-64 flex items-center justify-center mt-2 mb-2">
            
            {/* Concentric orbital rings */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-[#4f46e5]/10 animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute w-[140px] h-[140px] rounded-full border border-[#4f46e5]/20 animate-[spin_20s_linear_infinite_reverse] opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Singularity core glow */}
            <div className="absolute w-20 h-20 rounded-full bg-[#4f46e5]/10 blur-[30px] group-hover:bg-[#4f46e5]/20 transition-all duration-700"></div>
            
            {/* The Void Monarch Crown / Eye Artifact */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-[#a5b4fc] drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(99,102,241,0.8)] transition-all duration-700" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Geometrical dark fantasy shapes */}
                <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]" />
                <path d="M12 7v10" strokeDasharray="1 1" opacity="0.5" />
              </svg>
            </div>
            
            {/* Particles representing void dust */}
            <div className="absolute top-16 left-20 w-[1px] h-[1px] bg-white rounded-full blur-[0.5px] opacity-20"></div>
            <div className="absolute bottom-20 right-24 w-0.5 h-0.5 bg-[#818cf8] rounded-full blur-[1px] opacity-40"></div>
            <div className="absolute top-28 right-16 w-[1.5px] h-[1.5px] bg-[#c7d2fe] rounded-full blur-[0.5px] opacity-30"></div>
          </div>

          {/* Bottom Details */}
          <div className="relative z-10 px-7 pb-7 text-center flex flex-col items-center">
            <h2 className="text-lg font-light tracking-[0.25em] text-[#e0e7ff] mb-2 uppercase drop-shadow-[0_0_10px_rgba(224,231,255,0.1)]">
              Monarki Hampa
            </h2>
            <p className="text-[9px] leading-[1.6] text-[#6b7280] font-mono uppercase tracking-widest max-w-[240px]">
              Kekuasaan tertinggi lahir dari keheningan absolut.
            </p>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4f46e5]/15 to-transparent my-7"></div>

            <div className="w-full flex justify-between items-end">
              <div className="flex flex-col items-start gap-1.5">
                <span className="text-[7.5px] text-[#4b5563] uppercase tracking-[0.2em] font-medium">Mahar</span>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#818cf8] drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v10M9 12h6"/>
                  </svg>
                  <span className="text-sm font-medium tracking-wider text-[#d1d5db]">18.000</span>
                </div>
              </div>
              
              <button className="px-6 py-2 bg-transparent border border-[#3730a3] text-[#818cf8] text-[8px] uppercase tracking-[0.3em] font-semibold transition-all duration-500 hover:bg-[#3730a3]/20 hover:border-[#4f46e5] hover:text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Akuisisi
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
