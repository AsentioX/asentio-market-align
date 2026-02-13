import { Sparkles } from 'lucide-react';
import DirectoryFloatingElements from './DirectoryFloatingElements';

const DirectoryHeader = () => {
  return (
    <section className="relative bg-gradient-to-br from-asentio-blue via-asentio-blue/95 to-asentio-blue/90 text-white pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Floating XR & AI Elements */}
      <DirectoryFloatingElements />
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-cyan-400/30 blur-3xl animate-[orb-pulse-1_6s_ease-in-out_infinite]" />
        <div className="absolute top-[60%] left-[15%] w-20 h-20 rounded-full bg-blue-300/35 blur-2xl animate-[orb-pulse-2_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[10%] w-48 h-48 rounded-full bg-indigo-400/25 blur-3xl animate-[orb-pulse-3_7s_ease-in-out_infinite]" />
        <div className="absolute top-[70%] right-[20%] w-24 h-24 rounded-full bg-cyan-300/30 blur-2xl animate-[orb-pulse-1_9s_ease-in-out_1s_infinite]" />
        <div className="absolute top-[40%] left-[40%] w-40 h-40 rounded-full bg-blue-400/25 blur-3xl animate-[orb-pulse-2_10s_ease-in-out_2s_infinite]" />
        <div className="absolute top-[5%] left-[60%] w-16 h-16 rounded-full bg-purple-400/30 blur-2xl animate-[orb-pulse-3_5s_ease-in-out_0.5s_infinite]" />
        <div className="absolute top-[80%] left-[70%] w-36 h-36 rounded-full bg-cyan-500/25 blur-3xl animate-[orb-pulse-1_11s_ease-in-out_3s_infinite]" />
        <div className="absolute top-[30%] left-[85%] w-12 h-12 rounded-full bg-blue-200/35 blur-xl animate-[orb-pulse-2_6s_ease-in-out_1.5s_infinite]" />
      </div>

      <style>{`
        @keyframes orb-pulse-1 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes orb-pulse-2 {
          0%, 100% { opacity: 0.7; transform: scale(1.2); }
          50% { opacity: 0.2; transform: scale(0.8); }
        }
        @keyframes orb-pulse-3 {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          40% { opacity: 0.7; transform: scale(1.15); }
          70% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Curated XR & AI Products</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Global{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              XR & AI
            </span>{' '}
            Smartglasses
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            This directory tracks the leading-edge of XR and AI-powered experiences, the agencies creating these experiences, and XR enabled use cases.
          </p>
          
        </div>
      </div>
    </section>);

};

export default DirectoryHeader;