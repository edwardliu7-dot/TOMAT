import{j as e}from"./index-C-WYxDut.js";function r(){return e.jsxs("div",{className:"min-h-screen flex items-center justify-center bg-[#020306] p-4 sm:p-8",style:{fontFamily:'"Playfair Display", serif'},children:[e.jsx("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        
        .royal-card-container {
          background: linear-gradient(135deg, #0d1222 0%, #05070c 100%);
          box-shadow: 
            0 40px 80px -20px rgba(0,0,0,0.9), 
            inset 0 0 0 1px rgba(212, 175, 55, 0.15), 
            inset 0 0 30px rgba(212, 175, 55, 0.03);
          position: relative;
          overflow: hidden;
        }
        
        .royal-card-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08' mix-blend-mode='overlay'/%3E%3C/svg%3E");
          opacity: 0.6;
          pointer-events: none;
          z-index: 1;
        }

        .gold-text {
          background: linear-gradient(180deg, #fdf8e1 0%, #d4af37 50%, #8a6513 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        
        .royal-seal {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 180px;
          height: 180px;
        }
        
        .royal-seal-ring-1 {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(212, 175, 55, 0.5);
          border-radius: 50%;
          border-top-color: transparent;
          border-bottom-color: transparent;
          animation: spin-slow 24s linear infinite;
        }

        .royal-seal-ring-2 {
          position: absolute;
          inset: 12px;
          border: 1px dashed rgba(212, 175, 55, 0.3);
          border-radius: 50%;
          animation: spin-slow-reverse 32s linear infinite;
        }

        .royal-seal-ring-3 {
          position: absolute;
          inset: 24px;
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 50%;
        }

        .royal-seal-center {
          width: 86px;
          height: 86px;
          background: linear-gradient(135deg, #d4af37 0%, #9b7822 50%, #5c450c 100%);
          transform: rotate(45deg);
          box-shadow: 
            0 0 30px rgba(212, 175, 55, 0.2),
            inset 0 0 10px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        
        .royal-seal-center::after {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(13, 18, 34, 0.8);
        }
        
        .royal-seal-inner {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(13, 18, 34, 0.6);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 3;
        }

        @keyframes spin-slow {
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          100% { transform: rotate(-360deg); }
        }

        .font-cinzel {
          font-family: 'Cinzel', serif;
        }
        
        .glass-panel {
          background: rgba(10, 14, 26, 0.8);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(212, 175, 55, 0.15);
          position: relative;
          z-index: 10;
        }
        
        .parchment-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
          z-index: 0;
        }
      `}),e.jsxs("div",{className:"royal-card-container w-full max-w-[380px] aspect-[3/4] sm:aspect-[4/5] rounded-sm flex flex-col pt-8 pb-0 text-center transform transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]",children:[e.jsx("div",{className:"absolute top-4 left-4 w-6 h-6 border-t border-l border-[rgba(212,175,55,0.4)] z-10 pointer-events-none"}),e.jsx("div",{className:"absolute top-4 right-4 w-6 h-6 border-t border-r border-[rgba(212,175,55,0.4)] z-10 pointer-events-none"}),e.jsxs("div",{className:"flex justify-between items-center w-full z-10 px-8 font-cinzel text-[10px] sm:text-xs tracking-[0.2em] uppercase",children:[e.jsx("span",{className:"text-[#8994b6] font-medium",children:"Spanduk Profil"}),e.jsx("span",{className:"text-[#d4af37] font-bold",children:"Edisi 02 / 20"})]}),e.jsxs("div",{className:"flex-1 flex items-center justify-center z-10 py-12 relative",children:[e.jsx("div",{className:"parchment-glow"}),e.jsxs("div",{className:"royal-seal",children:[e.jsx("div",{className:"royal-seal-ring-1"}),e.jsx("div",{className:"royal-seal-ring-2"}),e.jsx("div",{className:"royal-seal-ring-3"}),e.jsx("div",{className:"royal-seal-center",children:e.jsx("div",{className:"royal-seal-inner",children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M12 2L22 12L12 22L2 12L12 2Z",stroke:"#0d1222",strokeWidth:"1.5"}),e.jsx("circle",{cx:"12",cy:"12",r:"3",fill:"#0d1222"}),e.jsx("path",{d:"M12 5V19",stroke:"#0d1222",strokeWidth:"1",strokeDasharray:"2 2"}),e.jsx("path",{d:"M5 12H19",stroke:"#0d1222",strokeWidth:"1",strokeDasharray:"2 2"})]})})}),e.jsxs("svg",{className:"absolute inset-0 w-full h-full opacity-20 pointer-events-none",viewBox:"0 0 100 100",children:[e.jsx("line",{x1:"50",y1:"5",x2:"50",y2:"95",stroke:"#d4af37",strokeWidth:"0.25"}),e.jsx("line",{x1:"5",y1:"50",x2:"95",y2:"50",stroke:"#d4af37",strokeWidth:"0.25"}),e.jsx("circle",{cx:"50",cy:"50",r:"40",fill:"none",stroke:"#d4af37",strokeWidth:"0.25",strokeDasharray:"1,3"}),e.jsx("circle",{cx:"50",cy:"50",r:"28",fill:"none",stroke:"#d4af37",strokeWidth:"0.25",strokeDasharray:"1,2"})]})]})]}),e.jsxs("div",{className:"z-10 flex flex-col items-center mt-auto",children:[e.jsxs("div",{className:"flex items-center justify-center w-full mb-6 opacity-60",children:[e.jsx("div",{className:"w-16 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]"}),e.jsx("div",{className:"w-1.5 h-1.5 rotate-45 border border-[#d4af37] mx-2"}),e.jsx("div",{className:"w-16 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]"})]}),e.jsx("h2",{className:"font-cinzel text-2xl sm:text-3xl font-bold gold-text mb-4 tracking-wider px-6",children:"Dekrit Mahaguru"}),e.jsx("p",{className:"text-[#a4b1d6] text-xs sm:text-sm italic mb-10 px-8 leading-relaxed opacity-90 max-w-[280px]",children:'"Sebuah pengakuan tertinggi. Hanya untuk mereka yang telah membedah anatomi semesta angka."'}),e.jsxs("div",{className:"glass-panel w-full py-5 px-8 flex justify-between items-center group cursor-pointer transition-colors hover:bg-[rgba(15,20,38,0.9)]",children:[e.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.05)] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"}),e.jsxs("div",{className:"flex flex-col items-start z-10",children:[e.jsx("span",{className:"text-[9px] uppercase tracking-[0.2em] text-[#717b9c] font-cinzel mb-1.5",children:"Mahar Tebusan"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("svg",{className:"w-4 h-4 text-[#d4af37]",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M12 1L2 12l10 11 10-11L12 1zm0 3.5l6.5 7.5-6.5 7.5-6.5-7.5L12 4.5z"})}),e.jsx("span",{className:"font-cinzel font-bold text-lg sm:text-xl text-white tracking-wide",children:"15.000"})]})]}),e.jsxs("div",{className:"flex items-center gap-2 z-10 transition-transform group-hover:translate-x-1",children:[e.jsx("span",{className:"font-cinzel text-[11px] tracking-[0.15em] text-[#d4af37] font-bold",children:"AKUISISI"}),e.jsx("svg",{className:"w-4 h-4 text-[#d4af37]",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"square",strokeLinejoin:"miter",strokeWidth:"2",d:"M5 12h14M12 5l7 7-7 7"})})]})]})]})]})]})}export{r as RoyalMathematician};
