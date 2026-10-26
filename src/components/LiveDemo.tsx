import { useState, useEffect, useRef } from 'react';
import { Activity, BrainCircuit, Eye, Gauge, ScanLine } from 'lucide-react';

type Tab = 'SYSTEM' | 'VISION' | 'MOTION' | 'NEURAL';

const tabIcons = {
  SYSTEM: Gauge,
  VISION: Eye,
  MOTION: Activity,
  NEURAL: BrainCircuit,
};

const tabContent: Record<Tab, React.ReactNode> = {
  SYSTEM: (
    <>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">CORE STATUS</span> <span className="text-white">ONLINE</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">SYNC</span> <span className="text-white">98.2%</span></div>
      <div className="mt-8 text-[10px] text-gray-600 font-mono flex items-center gap-2">
        <span className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        INITIALIZING SEQUENCE... OK
      </div>
    </>
  ),
  VISION: (
    <>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">LIGHT</span> <span className="text-white">LOW</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">DEPTH</span> <span className="text-white">12.4M</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">OBJECTS</span> <span className="text-white">07</span></div>
    </>
  ),
  MOTION: (
    <>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">VELOCITY</span> <span className="text-white">1.8M/S</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">BALANCE</span> <span className="text-white">98%</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">RESPONSE</span> <span className="text-white">14MS</span></div>
    </>
  ),
  NEURAL: (
    <>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">FOCUS</span> <span className="text-white">94%</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">LOAD</span> <span className="text-white">32%</span></div>
      <div className="mb-4"><span className="text-gray-500 mr-4 text-xs">SYNC</span> <span className="text-white">97%</span></div>
    </>
  )
};

export const LiveDemo = () => {
  const [activeTab, setActiveTab] = useState<Tab>('SYSTEM');
  const containerRef = useRef<HTMLDivElement>(null);
  const interfaceRef = useRef<HTMLDivElement>(null);

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

  // Subtle Parallax Effect for Interface
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interfaceRef.current) return;
      
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      
      interfaceRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    
    // Only add effect on desktop
    if (window.innerWidth > 768) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section id="live-demo" className="min-h-screen bg-[#030303] text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden" ref={containerRef}>
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col h-full">
        
        <div className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 ease-out mb-12 text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-5">
            <span className="w-8 h-px bg-red-700" />
            03 / LIVE SYSTEM
            <span className="w-8 h-px bg-red-700" />
          </div>
          <h2 className="text-3xl md:text-5xl tracking-[-0.04em] font-medium text-center">
            EXPERIENCE THE INTERFACE
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto mt-5 leading-relaxed">
            Move through the live telemetry layer. Each module reacts to a different part of the human environment.
          </p>
        </div>

        {/* Demo Interface Container */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          
            <div 
              ref={interfaceRef}
              className="reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-300 ease-out w-full max-w-4xl aspect-video min-h-[390px] bg-[#0a0a0a] border border-white/10 relative overflow-hidden flex flex-col shadow-[0_0_80px_rgba(127,29,29,0.08)]"
            >
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            {/* Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-white/10 blur-[2px] animate-[scan_3s_ease-in-out_infinite]" style={{
              top: '0%', 
            }} />
            
            <style>{`
              @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `}</style>

            {/* Interface Header */}
              <div className="flex justify-between items-center px-5 md:px-6 py-4 border-b border-white/5 bg-white/[0.01] relative z-10">
                <div className="flex items-center gap-3">
                 <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                 <span className="text-[10px] tracking-widest text-gray-400">SYSTEM / AUGMENT OS</span>
                </div>
               <div className="flex items-center gap-3 text-[10px] tracking-widest text-gray-500">
                 <span className="hidden sm:inline">SECURE LINK</span>
                 <span>v2.0.4</span>
               </div>
            </div>

            {/* Interface Body */}
            <div className="flex-1 flex flex-col md:flex-row p-6 md:p-10 relative z-10">
              
              {/* Main Content Area */}
              <div className="flex-1 relative">
                <div className="transition-opacity duration-300">
                  <div className="flex items-center gap-3 mb-8 text-gray-500">
                    <ScanLine size={18} className="text-red-400" />
                    <span className="text-[10px] tracking-[0.2em]">{activeTab} CHANNEL / ACTIVE</span>
                  </div>
                  {tabContent[activeTab]}
                  <div className="mt-10 max-w-sm">
                    <div className="flex items-center justify-between text-[9px] tracking-widest text-gray-600 mb-2">
                      <span>PROCESSING LOAD</span><span className="text-gray-400">64%</span>
                    </div>
                    <div className="h-1 bg-white/10 overflow-hidden"><div className="h-full w-[64%] bg-red-400 animate-[loadPulse_2.5s_ease-in-out_infinite]" /></div>
                  </div>
                </div>
              </div>
              
              {/* Telemetry Sidebar */}
              <div className="hidden md:flex flex-col justify-end w-40 border-l border-white/5 pl-6 gap-5">
                <div>
                  <span className="text-[8px] text-gray-500 block mb-1">STATUS</span>
                  <span className="text-xs">ONLINE</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 block mb-1">BIOMETRICS</span>
                  <span className="text-xs">72 BPM</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 block mb-1">FOCUS</span>
                  <span className="text-xs">94%</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 block mb-1">ENVIRONMENT</span>
                  <span className="text-xs">LOW LIGHT</span>
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 block mb-1">SYNC</span>
                   <span className="text-xs text-red-300">98.2%</span>
                </div>
              </div>

            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 md:gap-4 reveal-element opacity-0 translate-y-8 blur-sm transition-all duration-1000 delay-500 ease-out z-20">
            {(['SYSTEM', 'VISION', 'MOTION', 'NEURAL'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs tracking-widest border rounded-full transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab 
                    ? 'border-white/50 bg-white/10 text-white' 
                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {(() => { const Icon = tabIcons[tab]; return <Icon size={14} />; })()}
                {tab}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
