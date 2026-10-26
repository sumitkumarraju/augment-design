import { useEffect, useRef } from 'react';
import { ArrowUpRight, Mail, ScanFace, ShieldCheck } from 'lucide-react';

const Logo = () => (
  <svg width="44" height="44" viewBox="0 0 256 256" fill="white" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
    <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
  </svg>
);

export const FinalCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0', 'blur-none');
          entry.target.classList.remove('opacity-0', 'translate-y-8', 'blur-sm');
        }
      });
    }, { threshold: 0.1 });

    const elements = containerRef.current?.querySelectorAll('.reveal-element');
    elements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section id="connect" className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-24 px-5 relative overflow-hidden" ref={containerRef}>
        
        {/* Subtle radial glow */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-[pulseRing_8s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          
          <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-10">
            <Logo />
          </div>

          <p className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-100 ease-out text-[10px] sm:text-xs font-medium tracking-[0.2em] text-gray-500 mb-6 uppercase">
            SYSTEM / READY
          </p>

          <h2 className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-200 ease-out text-4xl sm:text-6xl md:text-7xl font-medium tracking-[-0.04em] mb-8 leading-tight">
            READY TO CROSS <br/> THE LINE?
          </h2>

          <p className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-300 ease-out text-base sm:text-lg text-gray-400 max-w-lg mx-auto mb-16 leading-relaxed">
            The next interface isn't somewhere ahead. It's waiting for you to enter it.
          </p>

          <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-300 ease-out grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-12 text-left">
            <div className="border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
              <ScanFace size={18} className="text-red-300" />
              <div><span className="block text-[9px] tracking-widest text-gray-600">IDENTITY</span><span className="text-xs text-gray-300">HUMAN FIRST</span></div>
            </div>
            <div className="border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
              <ShieldCheck size={18} className="text-red-300" />
              <div><span className="block text-[9px] tracking-widest text-gray-600">PROTOCOL</span><span className="text-xs text-gray-300">PRIVATE BY DESIGN</span></div>
            </div>
            <div className="border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
              <Mail size={18} className="text-red-300" />
              <div><span className="block text-[9px] tracking-widest text-gray-600">ACCESS</span><span className="text-xs text-gray-300">REQUEST OPEN</span></div>
            </div>
          </div>

          <div className="relative z-20 opacity-100 translate-y-0 blur-none">
            <a
              href="#module"
              className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white text-black text-sm font-bold tracking-widest uppercase rounded-full shadow-[0_12px_40px_rgba(255,255,255,0.18)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden"
            >
              <span className="relative z-10 block">RETURN TO THE MODULE <ArrowUpRight size={16} className="inline-block ml-2" /></span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030303] text-white py-12 px-5 sm:px-8 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          
          <div>
            <h3 className="text-xl font-medium mb-2 tracking-wide">AUGMENT</h3>
            <p className="text-xs text-gray-500 tracking-wide">Gateway to your augmented self.</p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium tracking-widest text-gray-400">
            <a href="#module" className="hover:text-white transition-colors">MODULE</a>
            <a href="#workspace" className="hover:text-white transition-colors">WORKSPACE</a>
            <a href="#case-records" className="hover:text-white transition-colors">CASE RECORDS</a>
            <a href="#biotech" className="hover:text-white transition-colors">BIOTECH</a>
            <a href="#tiers" className="hover:text-white transition-colors">TIERS</a>
            <a href="#live-demo" className="hover:text-white transition-colors">LIVE DEMO</a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] tracking-widest text-gray-600">
          <p>© 2026 AUGMENT / CONCEPT EXPERIENCE</p>
          <p>FICTIONAL CONCEPT</p>
        </div>
      </footer>
    </>
  );
};
