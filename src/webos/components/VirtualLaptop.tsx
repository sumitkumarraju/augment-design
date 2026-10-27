import { useEffect, useState, type ReactNode } from 'react';
import { BootFailureScreen, OperatingSystemBootScreen, bootDuration } from './BootScreens';
import type { BootState, OperatingSystem } from '../types';

export type VirtualLaptopProps = {
  os: OperatingSystem;
  machineName: string;
  bootState: BootState;
  detailedBoot: boolean;
  isFullscreen: boolean;
  desktop: ReactNode;
  onBootComplete: () => void;
  onRestart: () => void;
  onShutdown: () => void;
  onRetry: () => void;
};

export const LaptopScreen = ({ children, os, isFullscreen }: { children: ReactNode; os: OperatingSystem; isFullscreen: boolean }) => (
  <div className={`laptop-screen laptop-screen-${os} ${isFullscreen ? 'laptop-screen-fullscreen' : ''}`}>
    <div className="laptop-screen-inner">{children}</div>
  </div>
);

export const LaptopChassis = ({ os }: { os: OperatingSystem }) => (
  <div className={`laptop-chassis laptop-chassis-${os}`} aria-hidden="true">
    <div className="laptop-keyboard">
      <div className="laptop-key-row laptop-key-row-wide">{Array.from({ length: 13 }, (_, index) => <i key={`wide-${index}`} />)}</div>
      <div className="laptop-key-row">{Array.from({ length: 12 }, (_, index) => <i key={`mid-${index}`} />)}</div>
      <div className="laptop-key-row">{Array.from({ length: 11 }, (_, index) => <i key={`short-${index}`} />)}</div>
      <div className="laptop-key-row laptop-key-row-bottom">{Array.from({ length: 8 }, (_, index) => <i key={`bottom-${index}`} />)}</div>
    </div>
    <div className="laptop-trackpad" />
    <div className="laptop-front-notch" />
  </div>
);

export const VirtualLaptop = ({ os, machineName, bootState, detailedBoot, isFullscreen, desktop, onBootComplete, onRestart, onShutdown, onRetry }: VirtualLaptopProps) => {
  const [bootVisible, setBootVisible] = useState(false);

  useEffect(() => {
    if (bootState !== 'starting' && bootState !== 'booting') return undefined;
    setBootVisible(true);
    const timer = window.setTimeout(() => {
      setBootVisible(false);
      onBootComplete();
    }, bootDuration(os, detailedBoot));
    return () => window.clearTimeout(timer);
  }, [bootState, detailedBoot, onBootComplete, os]);

  const showBoot = bootVisible && (bootState === 'starting' || bootState === 'booting');
  const showError = bootState === 'error';
  const showDesktop = bootState === 'ready' && !showBoot;

  return (
    <div className={`virtual-laptop virtual-laptop-${os} ${isFullscreen ? 'virtual-laptop-fullscreen' : ''}`} data-machine={machineName}>
      <div className="laptop-lid">
        <div className="laptop-bezel">
          <div className="laptop-webcam"><span /></div>
          <LaptopScreen os={os} isFullscreen={isFullscreen}>
            {showBoot && <OperatingSystemBootScreen os={os} detailed={detailedBoot} onSkip={() => { setBootVisible(false); onBootComplete(); }} />}
            {showError && <BootFailureScreen onRetry={onRetry} />}
            {showDesktop && desktop}
            {bootState === 'shuttingDown' && <div className="shutdown-screen"><span>Shutting down {machineName}</span><i /></div>}
            {bootState === 'stopped' && <div className="stopped-screen"><span>Session stopped</span><small>Start this virtual computer from the manager.</small></div>}
          </LaptopScreen>
        </div>
      </div>
      {!isFullscreen && <LaptopChassis os={os} />}
      {!isFullscreen && <div className="laptop-shadow" />}
      {!isFullscreen && <div className="laptop-status"><span className="laptop-status-dot" /> {showDesktop ? 'SIMULATED SESSION READY' : 'LOCAL VIRTUAL COMPUTER'}</div>}
      <div className="sr-only">
        <button type="button" onClick={onRestart}>Restart {machineName}</button>
        <button type="button" onClick={onShutdown}>Shut down {machineName}</button>
      </div>
    </div>
  );
};
