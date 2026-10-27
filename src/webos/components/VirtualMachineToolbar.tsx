import { Expand, Minimize2, Power, RefreshCw, Settings2, ShieldCheck } from 'lucide-react';
import { OS_LABELS, type BootState, type MachineConfig } from '../types';

export const VirtualMachineToolbar = ({ machine, status, isFullscreen, onRestart, onShutdown, onFullscreen, onManager, onSettings }: {
  machine: MachineConfig;
  status: BootState;
  isFullscreen: boolean;
  onRestart: () => void;
  onShutdown: () => void;
  onFullscreen: () => void;
  onManager: () => void;
  onSettings: () => void;
}) => {
  const statusLabel = status === 'ready' ? 'RUNNING' : status === 'stopped' ? 'STOPPED' : status === 'error' ? 'ERROR' : status === 'shuttingDown' ? 'SHUTTING DOWN' : 'STARTING';
  return (
    <header className="vm-toolbar">
      <button type="button" className="vm-brand" onClick={onManager} aria-label="Return to WebOS machine manager"><span className="vm-brand-mark"><i /><i /><i /><i /></span><span><strong>WebOS</strong><small>VIRTUAL COMPUTER LAB</small></span></button>
      <div className="vm-machine-summary"><span className="vm-machine-name">{machine.name}</span><span className="vm-machine-os">{OS_LABELS[machine.os]} <b>·</b> {machine.storageMode === 'persistent' ? 'LOCAL DISK' : 'TEMPORARY DISK'}</span></div>
      <div className="vm-toolbar-actions">
        <span className={`vm-status vm-status-${status}`}><i /> {statusLabel}</span>
        <span className="vm-toolbar-divider" />
        <span className="vm-honest-badge"><ShieldCheck size={13} /> SIMULATED</span>
        <button type="button" onClick={onSettings} title="Open virtual machine settings"><Settings2 size={15} /></button>
        <button type="button" onClick={onRestart} title="Restart virtual computer" disabled={status !== 'ready'}><RefreshCw size={15} /></button>
        <button type="button" onClick={onShutdown} title="Shut down virtual computer" disabled={status === 'stopped' || status === 'shuttingDown'}><Power size={15} /></button>
        <button type="button" onClick={onFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>{isFullscreen ? <Minimize2 size={15} /> : <Expand size={15} />}</button>
      </div>
    </header>
  );
};
