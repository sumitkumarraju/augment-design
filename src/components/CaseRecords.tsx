import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CircleDot, Timer } from 'lucide-react';

const cases = [
  {
    id: "014",
    title: "ATHLETIC PERFORMANCE",
    userType: "Professional Athlete",
    mode: "Motion / Neural",
    responseTime: "12ms",
    adaptation: "High",
    status: "Optimal"
  },
  {
    id: "027",
    title: "ENVIRONMENTAL NAVIGATION",
    userType: "Urban Explorer",
    mode: "Vision / Sensor",
    responseTime: "18ms",
    adaptation: "Moderate",
    status: "Active"
  },
  {
    id: "041",
    title: "CREATIVE WORKFLOW",
    userType: "Digital Architect",
    mode: "Neural / Vision",
    responseTime: "8ms",
    adaptation: "Very High",
    status: "Synchronized"
  }
];

export const CaseRecords = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);

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
    <section id="case-records" className="min-h-screen bg-black text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-[-0.04em] font-light mb-6">
            CASE RECORDS
          </h2>
          <p className="text-gray-400 max-w-md text-sm md:text-base leading-relaxed tracking-widest uppercase">
            EVERY INTERFACE LEARNS FROM ITS USER.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-[10px] tracking-widest text-gray-600 uppercase">
            <span className="flex items-center gap-2"><CircleDot size={13} className="text-red-400" /> 03 ACTIVE RECORDS</span>
            <span className="flex items-center gap-2"><Timer size={13} /> LIVE RESPONSE DATA</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 relative">
          {cases.map((c, idx) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              aria-expanded={activeCase === c.id || hoveredCase === c.id}
              className={`reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-700 ease-out border border-white/10 overflow-hidden cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] ${activeCase === c.id || hoveredCase === c.id ? 'bg-white/[0.04]' : ''}`}
              style={{ transitionDelay: `${200 + idx * 150}ms` }}
              onMouseEnter={() => setHoveredCase(c.id)}
              onMouseLeave={() => setHoveredCase(null)}
              onClick={() => setActiveCase(activeCase === c.id ? null : c.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveCase(activeCase === c.id ? null : c.id);
                }
              }}
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <span className="text-gray-500 text-sm font-medium w-16">CASE {c.id}</span>
                  <span className="text-lg md:text-xl tracking-wide">{c.title}</span>
                </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                   <span>EXPAND</span>
                   <ChevronDown size={15} className={`transition-transform duration-300 ${activeCase === c.id || hoveredCase === c.id ? 'rotate-180 text-white' : ''}`} />
                 </div>
              </div>

              {/* Expandable Details */}
              <div 
                    className={`grid transition-all duration-500 ease-in-out ${activeCase === c.id || hoveredCase === c.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 md:p-8 pt-0 grid grid-cols-2 md:grid-cols-5 gap-6 text-xs text-gray-400">
                    <div>
                      <span className="block text-[10px] text-gray-600 mb-1">USER TYPE</span>
                      <span className="text-white">{c.userType}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-600 mb-1">MODE</span>
                      <span className="text-white">{c.mode}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-600 mb-1">RESPONSE</span>
                      <span className="text-white">{c.responseTime}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-600 mb-1">ADAPTATION</span>
                      <span className="text-white">{c.adaptation}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-600 mb-1">SYSTEM STATUS</span>
                      <span className="text-red-900/80">{c.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-700 ease-out">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase">FICTIONAL CONCEPT</p>
        </div>
      </div>
    </section>
  );
};
