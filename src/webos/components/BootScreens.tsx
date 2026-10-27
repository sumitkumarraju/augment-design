import { useEffect, useState } from 'react';
import { ChevronRight, CircleDot, SkipForward, Terminal } from 'lucide-react';
import type { OperatingSystem } from '../types';

type BootScreenProps = {
  onSkip: () => void;
  detailed?: boolean;
};

const WindowsMark = () => <div className="boot-windows-mark" aria-label="Windows-inspired WebOS startup mark"><i /><i /><i /><i /></div>;

const MacOSMark = () => <div className="boot-macos-mark" aria-label="Mac-inspired WebOS startup mark"><span /><i /></div>;

const LinuxMark = () => <div className="boot-linux-mark" aria-label="Linux-inspired WebOS startup mark"><CircleDot size={58} strokeWidth={1.1} /><span>∿</span></div>;

export const WindowsBootScreen = ({ onSkip }: BootScreenProps) => (
  <div className="boot-screen boot-screen-windows">
    <div className="boot-screen-center">
      <WindowsMark />
      <p className="boot-screen-kicker">WEBOS / WINDOWS EXPERIENCE</p>
      <div className="boot-dots" aria-label="Starting simulated Windows desktop"><i /><i /><i /><i /></div>
      <p className="boot-screen-note">Starting a browser-native desktop</p>
    </div>
    <button type="button" className="boot-skip" onClick={onSkip}><SkipForward size={13} /> Skip startup</button>
  </div>
);

export const MacOSBootScreen = ({ onSkip }: BootScreenProps) => {
  const [progress, setProgress] = useState(3);
  useEffect(() => {
    const timer = window.setInterval(() => setProgress((current) => Math.min(100, current + (current < 70 ? 2.2 : 1.2))), 85);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="boot-screen boot-screen-macos">
      <div className="boot-screen-center">
        <MacOSMark />
        <p className="boot-screen-kicker">WEBOS / MAC DESKTOP EXPERIENCE</p>
        <div className="macos-boot-progress" aria-label="Starting simulated Mac desktop"><span style={{ width: `${progress}%` }} /></div>
        <p className="boot-screen-note">Preparing the local user session</p>
      </div>
      <button type="button" className="boot-skip" onClick={onSkip}><SkipForward size={13} /> Skip startup</button>
    </div>
  );
};

const linuxMessages = ['initializing virtual kernel', 'mounting isolated home volume', 'starting desktop services', 'network boundary ready', 'session manager online'];

export const LinuxBootScreen = ({ onSkip, detailed = true }: BootScreenProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    if (!detailed) return undefined;
    const timer = window.setInterval(() => setMessageIndex((current) => Math.min(linuxMessages.length - 1, current + 1)), 560);
    return () => window.clearInterval(timer);
  }, [detailed]);
  return (
    <div className="boot-screen boot-screen-linux">
      <div className="boot-screen-center">
        <LinuxMark />
        <p className="boot-screen-kicker">WEBOS / LINUX DESKTOP EXPERIENCE</p>
        {detailed ? <div className="linux-boot-log" aria-live="polite">{linuxMessages.slice(0, messageIndex + 1).map((message) => <p key={message}><span>[  OK  ]</span> {message}</p>)}</div> : <div className="linux-boot-pulse"><i /><i /><i /></div>}
        <p className="boot-screen-note">A Linux-inspired interface running in the browser</p>
      </div>
      <button type="button" className="boot-skip" onClick={onSkip}><SkipForward size={13} /> Skip startup</button>
    </div>
  );
};

export const OperatingSystemBootScreen = ({ os, onSkip, detailed }: { os: OperatingSystem; onSkip: () => void; detailed?: boolean }) => {
  if (os === 'windows') return <WindowsBootScreen onSkip={onSkip} />;
  if (os === 'macos') return <MacOSBootScreen onSkip={onSkip} />;
  return <LinuxBootScreen onSkip={onSkip} detailed={detailed} />;
};

export const BootFailureScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="boot-screen boot-screen-error">
    <div className="boot-screen-center">
      <Terminal size={30} />
      <p className="boot-screen-kicker">STARTUP INTERRUPTED</p>
      <h2>Virtual session could not start.</h2>
      <p className="boot-screen-note">The local filesystem was not ready. Your host computer was not touched.</p>
      <button type="button" className="boot-retry" onClick={onRetry}>Retry startup <ChevronRight size={14} /></button>
    </div>
  </div>
);

export const bootDuration = (os: OperatingSystem, detailed: boolean) => {
  if (os === 'linux' && detailed) return 5100;
  return 4300;
};
