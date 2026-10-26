import { useEffect, useRef, useState } from 'react';

const BG_IMAGE_1 = "/car_base.jpg";
const BG_IMAGE_2 = "/car_reveal.jpg";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef({ x: -999, y: -999 });
  const targetCursorRef = useRef({ x: -999, y: -999 });
  const gridOffsetRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | undefined>(undefined);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetCursorRef.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      const { innerWidth, innerHeight } = window;
      const target = targetCursorRef.current;
      const current = cursorRef.current;
      
      // Cursor smoothing
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      
      // Grid parallax
      const normalizedX = target.x / innerWidth;
      const normalizedY = target.y / innerHeight;
      const gridTargetX = (normalizedX - 0.5) * 16;
      const gridTargetY = (normalizedY - 0.5) * 16;
      
      gridOffsetRef.current.x += (gridTargetX - gridOffsetRef.current.x) * 0.06;
      gridOffsetRef.current.y += (gridTargetY - gridOffsetRef.current.y) * 0.06;
      
      if (containerRef.current) {
        containerRef.current.style.setProperty('--grid-x', `${gridOffsetRef.current.x}px`);
        containerRef.current.style.setProperty('--grid-y', `${gridOffsetRef.current.y}px`);
      }
      
      // Custom cursor update
      if (containerRef.current) {
        containerRef.current.style.setProperty('--cursor-x', `${current.x}px`);
        containerRef.current.style.setProperty('--cursor-y', `${current.y}px`);
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Compute arc SVG lengths
  const getArcLength = (r: number, startDeg: number, endDeg: number) => {
    const deltaRad = Math.abs(endDeg - startDeg) * (Math.PI / 180);
    return r * deltaRad;
  };
  
  const arc1Len = getArcLength(330, -92, 16);
  const arc2Len = getArcLength(395, -56, 60);
  const arc3Len = getArcLength(460, -14, 72);

  // Helper for polar coords
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  const cX = -110;
  const cY = 300;
  
  const dot1 = polarToCartesian(cX, cY, 330, -46);
  const dot2 = polarToCartesian(cX, cY, 395, 2);
  const dot3 = polarToCartesian(cX, cY, 460, 44);

  return (
    <section id="module" className="h-[100dvh] relative overflow-hidden bg-black" ref={containerRef}>
      {/* Layer 1: Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-10"
        style={{ transform: 'translate(var(--grid-x, 0px), var(--grid-y, 0px))' }}
      >
        <svg width="100%" height="100%">
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Layer 2: Base Image with Ken Burns */}
      <div 
        className="absolute inset-0 z-10 bg-center bg-cover origin-center opacity-70"
        style={{ 
          backgroundImage: `url(${BG_IMAGE_1})`,
          animation: 'kenBurns 2.4s cubic-bezier(0.22,1,0.36,1) forwards'
        }}
      />

      {/* Layer 3: Cursor Spotlight Reveal */}
      <div 
        className="absolute inset-0 z-30 bg-center bg-cover reveal-layer"
        style={{ 
          backgroundImage: `url(${BG_IMAGE_2})`,
          maskImage: 'radial-gradient(260px circle at var(--cursor-x, -999px) var(--cursor-y, -999px), rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.40) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'radial-gradient(260px circle at var(--cursor-x, -999px) var(--cursor-y, -999px), rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.40) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)',
        }}
      />
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 z-40 bg-gradient-to-t from-black/80 via-black/30 to-black/40 pointer-events-none" />

      {/* Layer 4: Stats Circular Arc */}
      <div className="absolute inset-y-0 right-0 pointer-events-none z-50 hidden sm:block">
        <svg viewBox="0 0 380 700" preserveAspectRatio="xMaxYMid meet" className="h-full w-auto">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="22%" stopColor="white" stopOpacity="0.5" />
              <stop offset="55%" stopColor="white" stopOpacity="0.5" />
              <stop offset="85%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="22%" stopColor="white" stopOpacity="0.5" />
              <stop offset="55%" stopColor="white" stopOpacity="0.5" />
              <stop offset="85%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="22%" stopColor="white" stopOpacity="0.5" />
              <stop offset="55%" stopColor="white" stopOpacity="0.5" />
              <stop offset="85%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Arc 1 */}
          <g>
            <path d={describeArc(cX, cY, 330, -92, 16)} fill="none" stroke="url(#grad1)" strokeWidth="1.1" className="arc-line" style={{ '--len': arc1Len, animationDelay: '0.4s' } as React.CSSProperties} />
            <g style={{ transform: `translate(${dot1.x}px, ${dot1.y}px)` }}>
              <circle cx="0" cy="0" r="7" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.1" className="arc-ring" style={{ animationDelay: '0.7s' }} />
              <circle cx="0" cy="0" r="3.4" fill="white" className="arc-dot" style={{ animationDelay: '1.3s' }} />
              <text x="16" y="4" fill="white" fontSize="32" className="arc-text" style={{ animationDelay: '1.45s' }}>
                10<tspan fontSize="19" dy="-10" letterSpacing="-1px">+</tspan>
              </text>
              <text x="18" y="22" fill="white" fontSize="8.5" fontWeight="600" letterSpacing="2px" opacity="0.8" className="arc-text" style={{ animationDelay: '1.6s' }}>YEARS REAL</text>
            </g>
          </g>

          {/* Arc 2 */}
          <g>
            <path d={describeArc(cX, cY, 395, -56, 60)} fill="none" stroke="url(#grad2)" strokeWidth="1.1" className="arc-line" style={{ '--len': arc2Len, animationDelay: '0.62s' } as React.CSSProperties} />
            <g style={{ transform: `translate(${dot2.x}px, ${dot2.y}px)` }}>
              <circle cx="0" cy="0" r="7" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.1" className="arc-ring" style={{ animationDelay: '0.92s' }} />
              <circle cx="0" cy="0" r="3.4" fill="white" className="arc-dot" style={{ animationDelay: '1.52s' }} />
              <text x="16" y="4" fill="white" fontSize="32" className="arc-text" style={{ animationDelay: '1.67s' }}>
                40<tspan fontSize="19" dy="-10" letterSpacing="-1px">+</tspan>
              </text>
              <text x="18" y="22" fill="white" fontSize="8.5" fontWeight="600" letterSpacing="2px" opacity="0.8" className="arc-text" style={{ animationDelay: '1.82s' }}>USE FORMS</text>
            </g>
          </g>

          {/* Arc 3 */}
          <g>
            <path d={describeArc(cX, cY, 460, -14, 72)} fill="none" stroke="url(#grad3)" strokeWidth="1.1" className="arc-line" style={{ '--len': arc3Len, animationDelay: '0.84s' } as React.CSSProperties} />
            <g style={{ transform: `translate(${dot3.x}px, ${dot3.y}px)` }}>
              <circle cx="0" cy="0" r="7" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.1" className="arc-ring" style={{ animationDelay: '1.14s' }} />
              <circle cx="0" cy="0" r="3.4" fill="white" className="arc-dot" style={{ animationDelay: '1.74s' }} />
              <text x="16" y="4" fill="white" fontSize="32" className="arc-text" style={{ animationDelay: '1.89s' }}>
                95<tspan fontSize="19" dy="-10" letterSpacing="-1px">%</tspan>
              </text>
              <text x="18" y="22" fill="white" fontSize="8.5" fontWeight="600" letterSpacing="2px" opacity="0.8" className="arc-text" style={{ animationDelay: '2.04s' }}>REPEAT MEMBERS</text>
            </g>
          </g>
        </svg>
      </div>

      {/* Layer 5: Hero Text Block */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-24 left-5 sm:left-8 md:left-12 max-w-[300px] sm:max-w-md z-50">
        <p className="text-[11px] sm:text-xs font-semibold tracking-[0.12em] text-white/90 hero-rise mb-4 uppercase" style={{ animationDelay: '0.15s' }}>
          Gateway to your <span className="italic">augmented self</span>
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-[-0.08em] text-white hero-rise mb-6 font-helvetica-neue" style={{ animationDelay: '0.3s' }}>
          A window<br/>of coming<br/>enhancements
        </h1>
        <p className="text-sm sm:text-base text-white/90 leading-relaxed hero-rise mb-8" style={{ animationDelay: '0.5s' }}>
          A future where carbon fiber, titanium, and human instinct align. Not machine. Not human. Something wonderfully poised between.
        </p>
        
        <div className="inline-block opacity-100 relative z-20" style={{ animationDelay: '0.7s' }}>
          <a
            href="#workspace"
            className="group relative inline-flex items-center justify-center px-7 sm:px-8 py-3 sm:py-3.5 bg-white text-black font-semibold rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:scale-[1.04] active:scale-95 transition-transform overflow-hidden"
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
          >
            <span className="relative z-10 block">Reserve Now</span>
            <span className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/60 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-700 ease-in-out" />
          </a>
        </div>
      </div>

      {/* Custom Cursor (Desktop only) */}
      <div 
        className="hidden md:block pointer-events-none fixed z-[100] rounded-full border border-white/50 backdrop-blur-[2px] transition-transform duration-200"
        style={{ 
          width: '18px', 
          height: '18px', 
          top: 'var(--cursor-y, -999px)', 
          left: 'var(--cursor-x, -999px)',
          transform: `translate(-50%, -50%) scale(${isHoveringButton ? 1.5 : 1})`
        }}
      />
    </section>
  );
};
