import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, BrainCircuit, CheckCircle2, Eye, Move3d } from 'lucide-react';
import * as THREE from 'three';

const modeCards = [
  { label: 'VISION', text: 'Source mapping', icon: Eye },
  { label: 'NEURAL', text: 'Context graph', icon: BrainCircuit },
  { label: 'MOTION', text: 'Next actions', icon: Move3d },
];

export const AugmentCore = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.z = 5.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const core = new THREE.Group();
    scene.add(core);

    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 2),
      new THREE.MeshBasicMaterial({ color: 0xff6b6b, wireframe: true, transparent: true, opacity: 0.72 }),
    );
    core.add(orb);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.34 }),
    );
    core.add(inner);

    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(180 * 3);
    for (let index = 0; index < particlePositions.length; index += 3) {
      const radius = 1.7 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      particlePositions[index] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[index + 2] = radius * Math.cos(phi);
    }
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.7 });
    const particleField = new THREE.Points(particles, particleMaterial);
    scene.add(particleField);

    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!reducedMotion) {
        core.rotation.y += 0.0035;
        core.rotation.x += 0.0012;
        particleField.rotation.y -= 0.0008;
        particleField.rotation.x += 0.0004;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      orb.geometry.dispose();
      (orb.material as THREE.Material).dispose();
      inner.geometry.dispose();
      (inner.material as THREE.Material).dispose();
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-label="Animated AUGMENT core visualization" />;
};

export const MacBookExperience = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section id="module" className="macbook-hero min-h-[calc(100dvh-1px)] bg-[#030303] text-white relative overflow-hidden flex items-center px-5 sm:px-8 md:px-12 py-28 lg:py-32">
      <div className="absolute inset-0 pointer-events-none macbook-hero-grid" />
      <motion.div className="absolute top-24 left-[15%] w-2 h-2 bg-red-400 rounded-full" animate={reducedMotion ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.25, 0.8] }} transition={{ duration: 2.8, repeat: Infinity }} />
      <motion.div className="absolute bottom-24 right-[18%] w-1.5 h-1.5 bg-white rounded-full" animate={reducedMotion ? undefined : { opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 3.4, repeat: Infinity, delay: 0.8 }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0, 0, 1] }}>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-6"><span className="w-8 h-px bg-red-700" /> A NEW WORK SURFACE</div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-[-0.08em] leading-[0.9] font-light mb-7">Your work,<br /><span className="text-gray-500">in context.</span></h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-md mb-8">AUGMENT is a research-to-action workspace. It reads the signal, holds the context, and gives you the next useful move.</p>
          <div className="flex flex-wrap gap-3 mb-10"><a href="#workspace" className="inline-flex items-center gap-3 bg-white text-black px-5 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">Open workspace <ArrowUpRight size={15} /></a><a href="#technology" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-xs tracking-widest uppercase text-gray-400 hover:text-white hover:border-white/40 transition-colors">Explore system</a></div>
          <div className="flex items-center gap-3 text-[9px] tracking-widest text-gray-600"><CheckCircle2 size={13} className="text-green-400" /> LOCAL SESSION READY <span className="w-8 h-px bg-white/10" /> 0.1 ALPHA</div>
        </motion.div>

        <motion.div className="macbook-perspective" initial={{ opacity: 0, y: 60, rotateX: 12, scale: 0.88 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} transition={{ duration: 1.1, delay: 0.35, ease: [0.2, 0, 0, 1] }}>
          <motion.div className="macbook" whileHover={reducedMotion ? undefined : { rotateY: -3, rotateX: 2, y: -6 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}>
            <div className="macbook-lid">
              <div className="macbook-bezel">
                <div className="macbook-camera" />
                <div className="macbook-screen-content">
                  <AugmentCore />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.42)_74%)]" />
                  <div className="relative z-10 h-full p-4 sm:p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[8px] tracking-widest text-gray-400"><span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> AUGMENT / CONTEXT OS</span><span>LOCAL / 0.1</span></div>
                    <div className="text-center"><p className="text-[8px] tracking-[0.3em] text-gray-500 mb-3">MISSION CONTROL</p><p className="text-xl sm:text-3xl tracking-[-0.06em] font-light">MAKE THE NEXT<br />MOVE CLEAR.</p></div>
                    <div className="grid grid-cols-3 gap-2">{modeCards.map(({ label, text, icon: Icon }, index) => <div key={label} className={`border p-2 sm:p-3 backdrop-blur-sm ${index === 0 ? 'border-red-400/40 bg-red-950/20' : 'border-white/10 bg-black/20'}`}><Icon size={13} className={index === 0 ? 'text-red-300 mb-2' : 'text-gray-500 mb-2'} /><p className="text-[8px] tracking-widest text-gray-300">{label}</p><p className="text-[8px] text-gray-600 mt-1 hidden sm:block">{text}</p></div>)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="macbook-base"><div className="macbook-trackpad" /><div className="macbook-notch" /></div>
          </motion.div>
          <motion.div className="macbook-shadow" animate={reducedMotion ? undefined : { scaleX: [1, 0.94, 1], opacity: [0.38, 0.25, 0.38] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.div>
      </div>
      <motion.a href="#workspace" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[9px] tracking-widest text-gray-600 hover:text-white transition-colors" animate={reducedMotion ? undefined : { y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>SCROLL TO ENTER <ArrowDown size={14} /></motion.a>
    </section>
  );
};
