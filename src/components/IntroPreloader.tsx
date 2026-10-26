import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Cpu, LockKeyhole } from 'lucide-react';

type IntroPreloaderProps = {
  onOpen: () => void;
};

export const IntroPreloader = ({ onOpen }: IntroPreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const isReady = progress >= 100;
  const reducedMotion = useReducedMotion();
  const bootPhase = useMemo(() => {
    if (progress < 25) return 'POWERING CONTEXT CORE';
    if (progress < 55) return 'MOUNTING SOURCE LAYER';
    if (progress < 85) return 'CALIBRATING MISSION CONTROL';
    return isReady ? 'WORKSPACE READY' : 'OPENING AUGMENT';
  }, [isReady, progress]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + (current < 70 ? 4 : 2), 100));
    }, 65);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
        className="augment-boot-light fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(14px)' }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="augment-boot-grid absolute inset-0" />
        <motion.div
          className="augment-boot-glow absolute w-[38rem] h-[38rem] rounded-full blur-[120px]"
          animate={reducedMotion ? undefined : { scale: [0.9, 1.08, 0.9], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="boot-device boot-device-light"
          initial={{ opacity: 0, y: 28, rotateX: 12 }}
          animate={{ opacity: 0.28, y: 0, rotateX: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <div className="boot-device-lid"><div className="boot-device-screen"><span>AUGMENT</span><i style={{ width: `${progress}%` }} /><small>{bootPhase}</small></div></div>
          <div className="boot-device-base" />
        </motion.div>

        <div className="relative z-10 w-full max-w-xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="augment-boot-mark w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8"
              animate={isReady ? { rotateY: [0, 180, 360], scale: [1, 1.04, 1] } : { rotateY: [0, 8, 0] }}
              transition={isReady ? { duration: 1.2, ease: [0.2, 0, 0, 1] } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Cpu size={30} strokeWidth={1.2} className="text-red-500" />
            </motion.div>
            <p className="augment-boot-kicker text-[10px] tracking-[0.35em] mb-5">AUGMENT / CONTEXT OS</p>
            <h1 className="augment-boot-title text-4xl sm:text-6xl tracking-[-0.08em] font-light mb-5">SYSTEM BOOT</h1>
            <p className="augment-boot-description text-xs sm:text-sm max-w-sm leading-relaxed mb-10">
              Preparing your adaptive workspace. Context, sources, and intent will be waiting inside.
            </p>
          </motion.div>

          <div className="max-w-xs mx-auto mb-7" aria-live="polite">
            <div className="augment-boot-progress-label flex justify-between text-[9px] tracking-widest mb-3"><span>{bootPhase}</span><span>{progress}%</span></div>
            <div className="augment-boot-progress relative h-[2px] overflow-hidden"><motion.div className="augment-boot-progress-fill h-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.2, ease: 'easeOut' }} /><motion.div className="augment-boot-progress-sheen absolute top-0 bottom-0 w-16 blur-sm" animate={reducedMotion ? undefined : { left: ['-20%', '120%'] }} transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }} /></div>
            <div className="augment-boot-progress-meta flex justify-between mt-3 text-[8px] tracking-[0.18em]"><span>BOOT SEQUENCE</span><span>{isReady ? 'HANDSHAKE OK' : 'LIVE'}</span></div>
          </div>

          <div className="augment-boot-privacy flex items-center justify-center gap-2 text-[9px] tracking-widest mb-9"><LockKeyhole size={12} className="text-red-500" /> LOCAL SESSION / PRIVATE BY DESIGN</div>

          <motion.button
            type="button"
            onClick={onOpen}
            disabled={!isReady}
            className="augment-boot-button group inline-flex items-center justify-center gap-3 px-7 py-4 text-xs tracking-[0.2em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isReady ? 1 : 0.3, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Click to open workspace <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </motion.div>
  );
};
