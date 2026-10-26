import { useEffect, useRef } from 'react';
import { Cpu, Fingerprint, Radio, ScanLine, Waves } from 'lucide-react';

const concepts = [
  {
    title: "MATERIAL",
    desc: "Carbon composites",
    detail: "Lightweight structure with a resilient memory.",
    icon: Cpu
  },
  {
    title: "SIGNAL",
    desc: "Biometric context",
    detail: "A quiet layer of feedback tuned to your state.",
    icon: Fingerprint
  },
  {
    title: "SENSORY",
    desc: "Environmental awareness",
    detail: "The world translated into useful, immediate cues.",
    icon: ScanLine
  },
  {
    title: "ADAPTATION",
    desc: "Real-time intelligence",
    detail: "A system that gets better by staying out of the way.",
    icon: Waves
  }
];

export const Biotech = () => {
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
    <section id="biotech" className="min-h-screen bg-[#050505] text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-24">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-5">
            <span className="w-8 h-px bg-red-700" />
            04 / BIOLOGY + TECHNOLOGY
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-[-0.04em] font-light mb-6 leading-tight">
            BIOLOGY IS NOT THE LIMIT. <br/>
            <span className="text-gray-400">IT'S THE INTERFACE.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
            AUGMENT explores materials, sensors, adaptive systems, and human-machine interfaces designed around natural human behavior.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[10px] tracking-widest uppercase text-gray-500">
            <Radio size={15} className="text-red-400" />
            <span>Research protocol / 2026</span>
            <span className="w-12 h-px bg-white/10" />
            <span>Human first</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {concepts.map((concept, idx) => (
            <div 
              key={idx}
              className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out group relative border border-white/10 p-8 h-64 md:h-80 flex flex-col justify-end bg-gradient-to-t from-white/[0.03] to-transparent hover:border-white/30"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
                <span className="text-red-400/70 text-xs tracking-widest font-medium">0{idx + 1}</span>
                <concept.icon size={20} strokeWidth={1.2} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
              
              <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                <h3 className="text-xl tracking-wider font-medium mb-2">{concept.title}</h3>
                <p className="text-sm text-gray-300">{concept.desc}</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-3 max-w-[18rem] group-hover:text-gray-500 transition-colors">{concept.detail}</p>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
