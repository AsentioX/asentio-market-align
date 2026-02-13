import { Sparkles } from 'lucide-react';
import DirectoryFloatingElements from './DirectoryFloatingElements';

const DirectoryHeader = () => {
  return (
    <section className="relative bg-gradient-to-br from-asentio-blue via-asentio-blue/95 to-asentio-blue/90 text-white pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Floating XR & AI Elements */}
      <DirectoryFloatingElements />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Curated XR & AI Products</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Discover the World's Most Innovative{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              XR & AI
            </span>{' '}
            Consumer Products
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Curated by Asentio's strategic team, this directory tracks the leading-edge of immersive technology 
            and AI-powered experiences—from smart glasses and spatial AI apps to mixed reality platforms and lifestyle services.
          </p>
          
        </div>
      </div>
    </section>);

};

export default DirectoryHeader;