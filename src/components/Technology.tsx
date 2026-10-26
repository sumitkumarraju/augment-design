import { useEffect, useRef } from 'react';
import { ArrowUpRight, BrainCircuit, Eye, Move3d } from 'lucide-react';

const techModules = [
  {
    id: "01",
    title: "NEURAL",
    subtitle: "Cognitive interface",
    desc: "Intelligent systems that adapt to intent rather than forcing humans to adapt to machines.",
    detail: "Intent mapping / 14ms response",
    icon: BrainCircuit
  },
  {
    id: "02",
    title: "VISION",
    subtitle: "Augmented perception",
    desc: "Environmental information becomes contextual, immediate, and quietly available.",
    detail: "Spatial awareness / 12.4m depth",
    icon: Eye
  },
  {
    id: "03",
    title: "MOTION",
    subtitle: "Adaptive response",
    desc: "Interfaces designed around natural movement, gesture, and physical interaction.",
    detail: "Gesture control / 98% balance",
    icon: Move3d
  }
];

export const Technology = () => {
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
    <section id="technology" className="min-h-screen bg-[#050505] text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-14">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-5">
            <span className="w-8 h-px bg-red-700" />
            01 / TECHNOLOGY
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-[-0.04em] font-light mb-6">
            THE HUMAN / <br /> MACHINE INTERFACE
          </h2>
          <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
            AUGMENT creates an adaptive layer between human instinct and machine intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {techModules.map((module, idx) => (
            <div 
              key={module.id}
              className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out group relative border border-white/5 hover:border-white/20 hover:bg-white/[0.02] p-8 lg:p-10 flex flex-col justify-between overflow-hidden cursor-pointer min-h-[320px]"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="flex justify-between items-start mb-12">
                <span className="text-5xl font-light text-white/10 group-hover:-translate-y-1 transition-transform duration-500 ease-out">{module.id}</span>
                <div className="flex items-center gap-3">
                  <module.icon size={20} strokeWidth={1.2} className="text-gray-500 group-hover:text-white transition-colors" />
                  <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-red-500 group-hover:animate-pulse transition-colors" />
                </div>
              </div>
              
              <div className="relative z-10 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform duration-500 ease-out">
                <h3 className="text-xl md:text-2xl tracking-wide mb-1 font-medium">{module.title}</h3>
                <h4 className="text-xs tracking-widest text-red-400/80 uppercase mb-4">{module.subtitle}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{module.desc}</p>
                <div className="mt-6 flex items-center justify-between gap-3 text-[10px] tracking-widest uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
                  <span>{module.detail}</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>

              {/* Technical animated lines on hover */}
              <div className="absolute right-0 bottom-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                  <path d="M 100 100 L 50 100 L 50 50 L 100 50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" className="animate-[dash_2s_linear_infinite]" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
