import { useEffect, useRef } from 'react';
import { ArrowRight, Check, Crown, Layers3, Sparkles } from 'lucide-react';

const tiers = [
  {
    name: "CORE",
    subtitle: "FOUNDATIONAL AUGMENTATION",
    detail: "A considered first step into the system.",
    icon: Layers3,
    features: [
      "Adaptive interface",
      "Environmental awareness",
      "Basic biometrics"
    ],
    highlight: false
  },
  {
    name: "ADVANCE",
    subtitle: "EXPANDED AUGMENTATION",
    detail: "The balance of awareness, control, and response.",
    icon: Sparkles,
    features: [
      "Adaptive intelligence",
      "Gesture control",
      "Advanced biometrics",
      "Context engine"
    ],
    highlight: true
  },
  {
    name: "PRIME",
    subtitle: "FULL-SPECTRUM AUGMENTATION",
    detail: "The complete interface for a life in motion.",
    icon: Crown,
    features: [
      "Neural interface",
      "Advanced perception",
      "Adaptive intelligence",
      "Priority access"
    ],
    highlight: false
  }
];

export const Tiers = () => {
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
    <section id="tiers" className="min-h-screen bg-black text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-20 text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-5">
            <span className="w-8 h-px bg-red-700" />
            05 / ACCESS
            <span className="w-8 h-px bg-red-700" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl tracking-[-0.04em] font-medium mb-4">
            CHOOSE YOUR INTERFACE
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Every tier is built on the same principle: technology should feel less like another device and more like an extension of your attention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => (
            <div 
              key={idx}
              className={`reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out group relative flex flex-col p-8 lg:p-10 border ${
                tier.highlight ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 bg-white/[0.01]'
              } hover:-translate-y-2 hover:bg-white/[0.05] hover:border-white/40 cursor-default`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              
              <div className="mb-10">
                <div className="flex items-start justify-between mb-7">
                  <span className={`p-3 border ${tier.highlight ? 'border-red-400/30 text-red-300' : 'border-white/10 text-gray-500'}`}>
                    <tier.icon size={18} strokeWidth={1.4} />
                  </span>
                  {tier.highlight && <span className="text-[9px] border border-red-400/30 text-red-300 px-3 py-2 tracking-widest">RECOMMENDED</span>}
                </div>
                <h3 className="text-2xl md:text-3xl tracking-wide font-medium mb-2">{tier.name}</h3>
                <p className={`text-xs tracking-widest uppercase ${tier.highlight ? 'text-red-300/80' : 'text-gray-500'}`}>
                  {tier.subtitle}
                </p>
                <p className="text-xs text-gray-500 mt-5 leading-relaxed">{tier.detail}</p>
              </div>

              <ul className="flex-1 space-y-4 mb-16">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    <Check size={14} className="text-red-400/80 mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <a href="#workspace" className={`w-full py-4 text-sm font-semibold tracking-widest uppercase transition-colors text-center block ${
                  tier.highlight 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                  ACCESS / REQUEST <ArrowRight size={15} className="inline-block ml-2 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                </a>
              </div>

              {/* Technical animated lines on hover */}
              <div className="absolute right-0 top-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                <div className="absolute right-0 top-0 w-[1px] h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-y-full group-hover:translate-y-[500px] transition-transform duration-1000 ease-in-out" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
