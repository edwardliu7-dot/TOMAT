import React from 'react';
import { Sparkles, Orbit } from 'lucide-react';

export function CelestiaRelic() {
  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center p-8 font-sans antialiased">
      {/* Outer Card Container */}
      <div className="relative w-[340px] h-[520px] rounded-2xl group perspective-1000">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-2xl transition-opacity duration-700 opacity-0 group-hover:opacity-100"></div>

        {/* Card Surface */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#030712] border border-blue-900/30 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          {/* Card Top: Edition & Category */}
          <div className="relative z-10 flex justify-between items-center px-6 pt-6 text-[10px] tracking-widest font-medium text-blue-200/50 uppercase">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Orbit className="w-3 h-3" />
              Spanduk Profil
            </span>
            <span className="bg-blue-950/50 border border-blue-800/30 px-2 py-0.5 rounded-full text-blue-100/80">
              Edisi 07 / 12
            </span>
          </div>

          {/* Card Art / Visual Representation */}
          <div className="relative h-[260px] w-full flex items-center justify-center mt-2">
            {/* Museum Display Pedestal */}
            <div className="absolute bottom-4 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-[1px]"></div>
            
            {/* Orbital Rings */}
            <div className="absolute w-[200px] h-[200px] rounded-full border border-blue-400/10 rotate-45 transition-transform duration-1000 group-hover:rotate-90 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]"></div>
            <div className="absolute w-[140px] h-[140px] rounded-full border border-blue-300/20 -rotate-12 transition-transform duration-700 group-hover:rotate-45"></div>
            <div className="absolute w-[80px] h-[80px] rounded-full border border-indigo-200/30 rotate-90 transition-transform duration-1000 group-hover:-rotate-90"></div>

            {/* The Relic: Cosmic Singularity */}
            <div className="relative z-10 w-4 h-4 bg-white rounded-full shadow-[0_0_40px_10px_rgba(96,165,250,0.4),0_0_80px_20px_rgba(56,189,248,0.2)] animate-pulse">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-[2px]"></div>
            </div>

            {/* Orbiting element */}
            <div className="absolute w-[140px] h-[140px] animate-spin" style={{ animationDuration: '8s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
            </div>
          </div>

          {/* Card Bottom: Content & Prestige Copy */}
          <div className="relative z-10 px-6 pb-6 flex flex-col justify-end h-[180px]">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-light text-white tracking-wide mb-1.5 font-serif" style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                  Pijar Bintang Kerdil
                </h3>
                <p className="text-xs text-blue-200/60 leading-relaxed font-light">
                  Sisa ledakan kosmis purba. Museum-grade artifact yang membekukan waktu dan menundukkan gravitasi.
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-blue-900/0 via-blue-800/40 to-blue-900/0 my-4"></div>

              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400/50 uppercase tracking-widest mb-1">Nilai Akuisisi</span>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-lg text-blue-50 font-medium tracking-tight">22.000</span>
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 rounded text-xs text-blue-100 transition-colors backdrop-blur-sm">
                  Inspeksi
                </button>
              </div>
            </div>
          </div>
          
          {/* Edge Highlights */}
          <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
