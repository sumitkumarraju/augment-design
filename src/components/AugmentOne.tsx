import { useEffect, useRef } from 'react';
import { Activity, Fingerprint, ScanLine, Sparkles, Wifi } from 'lucide-react';

const features = [
  { label: "ADAPTIVE INTELLIGENCE", detail: "Learns your rhythm without interrupting it.", icon: Sparkles },
  { label: "BIOMETRIC CONTEXT", detail: "Reads signals as context, never as commands.", icon: Fingerprint },
  { label: "ENVIRONMENTAL AWARENESS", detail: "Turns the space around you into useful signal.", icon: ScanLine },
  { label: "GESTURE CONTROL", detail: "Responds to natural movement in real time.", icon: Activity }
];

export const AugmentOne = () => {
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
    <section id="augment-one" className="min-h-screen bg-black text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-16 text-center md:text-left">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-4">
            <span className="w-8 h-px bg-red-700" />
            02 / PRODUCT
          </div>
          <h2 className="text-4xl md:text-6xl tracking-[-0.04em] font-medium mb-4">
            AUGMENT ONE
          </h2>
            <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase">
              The first interface built around the human.
            </p>
            <div className="flex flex-wrap gap-3 mt-7 text-[10px] tracking-widest uppercase text-gray-500">
              <span className="border border-white/10 px-3 py-2">CALIBRATED FOR HUMANS</span>
              <span className="border border-white/10 px-3 py-2">ALWAYS LEARNING</span>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          {/* Product Visualization (CSS based as requested) */}
          <div className="w-full lg:w-3/5 aspect-square md:aspect-video lg:aspect-square relative flex items-center justify-center reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-300 ease-out border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            {/* Technical annotation lines */}
            <div className="absolute inset-4 border border-white/[0.03] pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.03] pointer-events-none" />
            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/[0.03] pointer-events-none" />
            
            {/* Central Silhouete / Ring */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-red-900/20 scale-[1.15] animate-[pulseRing_4s_ease-in-out_infinite]" />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[spin_8s_linear_infinite]" />
                <span className="text-white/80 tracking-[0.2em] text-[10px] z-10 text-center">
                  SYSTEM<br/>ONLINE
                </span>
              </div>
            </div>

            {/* Fictional Interface Data Overlays */}
            <div className="absolute top-8 left-8 text-[10px] sm:text-xs">
              <span className="text-gray-500 block mb-1">BIO</span>
              <span className="text-white font-medium tracking-wider">72 BPM</span>
            </div>
            
            <div className="absolute top-8 right-8 text-[10px] sm:text-xs text-right">
              <span className="text-gray-500 block mb-1">FOCUS</span>
              <span className="text-white font-medium tracking-wider">94%</span>
            </div>

            <div className="absolute bottom-8 left-8 text-[10px] sm:text-xs">
              <span className="text-gray-500 block mb-1">ENV</span>
              <span className="text-white font-medium tracking-wider">23.4°C</span>
            </div>

            <div className="absolute bottom-8 right-8 text-[10px] sm:text-xs text-right">
              <span className="text-gray-500 block mb-1">SYNC</span>
              <span className="text-white font-medium tracking-wider text-red-900/80">98.2%</span>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] text-gray-500 tracking-widest whitespace-nowrap">
              <Wifi size={12} className="text-red-400" />
              LINK STABLE
            </div>
          </div>

          {/* Features */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-700 ease-out border-b border-white/10 pb-6 group cursor-default"
                style={{ transitionDelay: `${400 + idx * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 text-gray-600 text-xs tracking-widest group-hover:text-red-400/80 transition-colors">
                    <feature.icon size={15} strokeWidth={1.5} />
                    0{idx + 1}
                  </div>
                  <span className="text-[9px] tracking-widest text-gray-700">ACTIVE</span>
                </div>
                <div className="text-lg sm:text-xl tracking-wide group-hover:pl-2 transition-all duration-300">
                  {feature.label}
                </div>
                <p className="text-xs text-gray-500 mt-2 max-w-sm">{feature.detail}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
