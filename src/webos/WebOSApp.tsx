import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Boxes, ChevronRight, CircleHelp, Copy, Cpu, Database, ExternalLink, HardDrive, Info, Laptop, LockKeyhole, Plus, Power, ShieldCheck, Trash2, Upload, X } from 'lucide-react';
import { DEFAULT_SETTINGS, OS_LABELS, type BootState, type DesktopSettings, type MachineConfig, type MachineExport, type OperatingSystem, type StorageMode } from './types';
import { VirtualFileSystem } from './filesystem';
import { createMachine, deleteMachine, loadFilesystem, readMachineExport, readMachines, readSettings, saveFilesystem, updateMachine, writeSettings } from './persistence';
import { VirtualLaptop } from './components/VirtualLaptop';
import { VirtualMachineToolbar } from './components/VirtualMachineToolbar';
import { VirtualDesktop } from './components/VirtualDesktop';
import { OfficialMediaPanel, type StagedMedia } from './components/OfficialMediaPanel';
import './webos.css';

const osOrder: OperatingSystem[] = ['windows', 'macos', 'linux'];

const machineDefaults: Record<OperatingSystem, { name: string; tagline: string; description: string; features: string[]; color: string }> = {
  windows: { name: 'Windows', tagline: 'Familiar, focused, ready.', description: 'A Windows-inspired desktop with a Start menu, taskbar, file tools, and a familiar productivity rhythm.', features: ['Start menu & taskbar', 'File Explorer workspace', 'Terminal & editor'], color: 'blue' },
  macos: { name: 'macOS', tagline: 'A calm desktop for deep work.', description: 'A Mac-inspired experience with a menu bar, Dock, Finder-style files, and polished system controls.', features: ['Menu bar & Dock', 'Finder-style files', 'Spotlight-ready search'], color: 'silver' },
  linux: { name: 'Linux', tagline: 'Open, capable, transparent.', description: 'A Linux-inspired desktop with terminal-first tools, an application dock, and an optional detailed boot log.', features: ['Activities launcher', 'Virtual terminal', 'Transparent system monitor'], color: 'orange' },
};

const osIcon = (os: OperatingSystem) => {
  if (os === 'windows') return <span className="selection-windows-logo"><i /><i /><i /><i /></span>;
  if (os === 'macos') return <span className="selection-macos-logo"><i /><b /></span>;
  return <span className="selection-linux-logo"><i /><b /><b /><b /></span>;
};

const formatStorage = (bytes: number) => bytes >= 1024 * 1024 * 1024 ? `${bytes / (1024 * 1024 * 1024)} GB` : `${bytes / (1024 * 1024)} MB`;

const MachineForm = ({ onCreate, onCancel }: { onCreate: (name: string, os: OperatingSystem, mode: StorageMode) => void; onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [os, setOs] = useState<OperatingSystem>('windows');
  const [mode, setMode] = useState<StorageMode>('temporary');
  return <div className="machine-modal-backdrop" onMouseDown={onCancel}><form className="machine-modal" onSubmit={(event) => { event.preventDefault(); onCreate(name, os, mode); }} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={onCancel}><X size={15} /></button><span className="app-eyebrow">NEW VIRTUAL COMPUTER</span><h2>Create a machine.</h2><p>Choose a simulated desktop and give its isolated session a name.</p><label>Machine name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="My WebOS computer" /></label><label>Operating system<select value={os} onChange={(event) => setOs(event.target.value as OperatingSystem)}>{osOrder.map((item) => <option value={item} key={item}>{OS_LABELS[item]}</option>)}</select></label><div className="storage-choice"><button type="button" className={mode === 'temporary' ? 'active' : ''} onClick={() => setMode('temporary')}><span><Power size={15} /></span><strong>Temporary session</strong><small>In-memory disk. Cleared when the session ends.</small></button><button type="button" className={mode === 'persistent' ? 'active' : ''} onClick={() => setMode('persistent')}><span><Database size={15} /></span><strong>Persistent local session</strong><small>Saved locally in this browser with IndexedDB.</small></button></div><button type="submit" className="primary-button"><Laptop size={15} /> Create & start</button></form></div>;
};

const MachineCard = ({ machine, onStart, onDelete, onDuplicate }: { machine: MachineConfig; onStart: () => void; onDelete: () => void; onDuplicate: () => void }) => <article className={`machine-list-card machine-list-card-${machine.os}`}><div className="machine-list-icon">{osIcon(machine.os)}</div><div className="machine-list-info"><div className="machine-list-heading"><div><h3>{machine.name}</h3><span>{OS_LABELS[machine.os]} · {machine.storageMode === 'persistent' ? 'Persistent disk' : 'Temporary session'}</span></div><span className="machine-list-status"><i /> {machine.lastStartedAt ? 'READY TO START' : 'NEW'}</span></div><div className="machine-list-meta"><span><HardDrive size={12} /> {formatStorage(machine.storageLimit)}</span><span><Info size={12} /> Simulated</span>{machine.lastStartedAt && <span>Last used {new Date(machine.lastStartedAt).toLocaleDateString()}</span>}</div></div><div className="machine-list-actions"><button type="button" onClick={onStart} className="machine-start-button">Start <ChevronRight size={14} /></button><button type="button" onClick={onDuplicate} title="Duplicate configuration"><Copy size={14} /></button><button type="button" onClick={onDelete} title="Delete machine"><Trash2 size={14} /></button></div></article>;

const OsCard = ({ os, mode, onLaunch }: { os: OperatingSystem; mode: StorageMode; onLaunch: () => void }) => {
  const item = machineDefaults[os];
  return <article className={`os-selection-card os-selection-card-${item.color}`}><div className="os-card-top"><div className="os-card-logo">{osIcon(os)}</div><span className="os-card-type">SIMULATED DESKTOP</span></div><div className="os-card-copy"><h2>{item.name}</h2><p className="os-card-tagline">{item.tagline}</p><p>{item.description}</p></div><ul>{item.features.map((feature) => <li key={feature}><span />{feature}</li>)}</ul><button type="button" onClick={onLaunch} className="os-launch-button"><span>Launch {item.name}</span><ChevronRight size={15} /></button><div className="os-card-footer"><span>{mode === 'persistent' ? 'LOCAL DISK' : 'TEMPORARY SESSION'}</span><span>WEBOS 1.0</span></div></article>;
};

const ManagerHeader = ({ onCreate, onImport }: { onCreate: () => void; onImport: () => void }) => <header className="manager-header"><div className="manager-brand"><span className="vm-brand-mark"><i /><i /><i /><i /></span><div><strong>WebOS</strong><small>VIRTUAL COMPUTER LAB</small></div></div><div className="manager-header-note"><span className="manager-live-dot" /> Browser-native · local-first</div><div className="manager-header-actions"><button type="button" onClick={onImport}><Upload size={14} /> Import</button><button type="button" onClick={onCreate} className="header-create"><Plus size={14} /> New computer</button><button type="button" title="About WebOS"><CircleHelp size={15} /></button></div></header>;

const ManagerFooter = () => <footer className="manager-footer"><span><ShieldCheck size={14} /> Your virtual files stay isolated from the host computer.</span><span>WebOS simulates desktop behavior in the browser · no host shell access</span></footer>;

export const WebOSApp = () => {
  const [machines, setMachines] = useState<MachineConfig[]>(() => readMachines());
  const [screen, setScreen] = useState<'manager' | 'computer'>('manager');
  const [machine, setMachine] = useState<MachineConfig | null>(null);
  const [filesystem, setFilesystem] = useState<VirtualFileSystem | null>(null);
  const [settings, setSettings] = useState<DesktopSettings>(DEFAULT_SETTINGS);
  const [bootState, setBootState] = useState<BootState>('stopped');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('temporary');
  const [sessionStartedAt, setSessionStartedAt] = useState(Date.now());
  const [settingsRequest, setSettingsRequest] = useState(0);
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const [managerNotice, setManagerNotice] = useState('');
  const [, setFilesystemRevision] = useState(0);
  const lifecycleRef = useRef(0);
  const [stagedMedia, setStagedMedia] = useState<StagedMedia | null>(null);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const startMachine = useCallback(async (nextMachine: MachineConfig, importedFilesystem?: VirtualFileSystem, importedSettings?: DesktopSettings) => {
    const lifecycle = ++lifecycleRef.current;
    setMachine(nextMachine);
    setSettings(importedSettings || readSettings(nextMachine.id));
    setFilesystem(importedFilesystem || null);
    setSessionStartedAt(Date.now());
    setSettingsRequest(0);
    setBootState('starting');
    setScreen('computer');
    updateMachine({ ...nextMachine, lastStartedAt: new Date().toISOString() });
    setMachines(readMachines());
    try {
      const loaded = importedFilesystem || await loadFilesystem(nextMachine);
      if (lifecycle !== lifecycleRef.current) return;
      setFilesystem(loaded);
      setBootState('booting');
    } catch {
      if (lifecycle !== lifecycleRef.current) return;
      setBootState('error');
    }
  }, []);

  const createAndStart = (os: OperatingSystem, mode: StorageMode, name?: string) => {
    const nextMachine = createMachine({ name: name || `${OS_LABELS[os]} Lab`, os, storageMode: mode });
    setMachines(readMachines());
    void startMachine(nextMachine);
  };

  const handleCreate = (name: string, os: OperatingSystem, mode: StorageMode) => {
    setShowMachineForm(false);
    createAndStart(os, mode, name || `${OS_LABELS[os]} Lab`);
  };

  const completeBoot = useCallback(() => {
    if (filesystem) setBootState('ready');
    else setBootState('error');
  }, [filesystem]);

  const restart = useCallback(() => {
    if (!machine || bootState !== 'ready') return;
    setSessionStartedAt(Date.now());
    setBootState('starting');
  }, [bootState, machine]);

  const shutdown = useCallback(() => {
    if (!machine || bootState === 'stopped' || bootState === 'shuttingDown') return;
    const lifecycle = ++lifecycleRef.current;
    setBootState('shuttingDown');
    const finishShutdown = async () => {
      if (filesystem) await saveFilesystem(machine, filesystem);
      if (lifecycle !== lifecycleRef.current) return;
      await new Promise<void>((resolve) => window.setTimeout(resolve, 750));
      if (lifecycle !== lifecycleRef.current) return;
      setBootState('stopped');
      setFilesystem(null);
      setScreen('manager');
      setIsFullscreen(false);
    };
    void finishShutdown();
    if (document.fullscreenElement) void document.exitFullscreen();
  }, [bootState, filesystem, machine]);

  const resetMachine = () => {
    if (!filesystem || !machine) return;
    filesystem.reset();
    const nextSettings = { ...DEFAULT_SETTINGS };
    setSettings(nextSettings);
    writeSettings(machine.id, nextSettings);
    void saveFilesystem(machine, filesystem);
    setManagerNotice('Virtual computer reset to its starter state.');
  };

  const updateSettings = (nextSettings: DesktopSettings) => {
    setSettings(nextSettings);
    if (machine) writeSettings(machine.id, nextSettings);
  };

  const filesystemChanged = () => {
    setFilesystemRevision((revision) => revision + 1);
    if (machine && filesystem) void saveFilesystem(machine, filesystem);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  const importMachineExport = (machineExport: MachineExport) => {
    const importedMachine = createMachine({ name: `${machineExport.machine.name} copy`, os: machineExport.machine.os, storageMode: machineExport.machine.storageMode, storageLimit: machineExport.machine.storageLimit });
    const importedFs = new VirtualFileSystem(machineExport.filesystem, importedMachine.storageLimit);
    writeSettings(importedMachine.id, machineExport.settings);
    setMachines(readMachines());
    void saveFilesystem(importedMachine, importedFs);
    void startMachine(importedMachine, importedFs, machineExport.settings);
  };

  const importFromManager = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try { importMachineExport(readMachineExport(await file.text())); } catch (error) { setManagerNotice(error instanceof Error ? error.message : 'The machine export could not be imported.'); }
  };

  const openMachineSettings = () => setSettingsRequest((value) => value + 1);
  const goManager = () => {
    if (bootState === 'ready') shutdown();
    else {
      lifecycleRef.current += 1;
      setScreen('manager');
      setMachine(null);
      setFilesystem(null);
      setBootState('stopped');
    }
  };

  const persistentMachines = useMemo(() => machines.filter((item) => item.storageMode === 'persistent').length, [machines]);

  if (screen === 'computer' && machine) return <div className={`webos-computer-shell ${isFullscreen ? 'webos-shell-fullscreen' : ''}`}><VirtualMachineToolbar machine={machine} status={bootState} isFullscreen={isFullscreen} onRestart={restart} onShutdown={shutdown} onFullscreen={() => { void toggleFullscreen(); }} onManager={goManager} onSettings={openMachineSettings} /><main className="computer-stage"><VirtualLaptop os={machine.os} machineName={machine.name} bootState={bootState} detailedBoot={settings.detailedBoot} isFullscreen={isFullscreen} onBootComplete={completeBoot} onRestart={restart} onShutdown={shutdown} onRetry={() => { void startMachine(machine); }} desktop={filesystem ? <VirtualDesktop os={machine.os} machine={machine} filesystem={filesystem} settings={settings} onSettingsChange={updateSettings} onFilesystemChange={filesystemChanged} onReset={resetMachine} onImportMachine={importMachineExport} onShutdown={shutdown} sessionStartedAt={sessionStartedAt} settingsRequest={settingsRequest} /> : <div className="desktop-initializing"><span className="initializing-spinner" /><p>Mounting the isolated virtual disk</p></div>} /></main></div>;

  return <div className="webos-manager"><ManagerHeader onCreate={() => setShowMachineForm(true)} onImport={() => importInput?.click()} /><input ref={setImportInput} type="file" accept=".json,.webos.json,application/json" hidden onChange={importFromManager} /><main className="manager-main"><section className="manager-hero"><div><span className="manager-eyebrow"><span className="manager-live-dot" /> CHOOSE YOUR VIRTUAL COMPUTER</span><h1>Open a computer<br /><em>inside your browser.</em></h1><p>WebOS gives you a polished, honest simulation of familiar desktop environments. Pick a system, choose how its virtual disk should live, and start a local session.</p></div><div className="manager-hero-aside"><div><Cpu size={16} /><span>Browser-native<br /><strong>SIMULATED</strong></span></div><div><LockKeyhole size={16} /><span>Host isolated<br /><strong>LOCAL-FIRST</strong></span></div></div></section><section className="mode-panel"><div><span className="app-eyebrow">STORAGE MODE</span><strong>{storageMode === 'temporary' ? 'Temporary session' : 'Persistent local session'}</strong><small>{storageMode === 'temporary' ? 'Cleared when you shut down. No files are written for this session.' : 'Supported files and settings return when you reopen this browser.'}</small></div><div className="mode-switch"><button type="button" className={storageMode === 'temporary' ? 'active' : ''} onClick={() => setStorageMode('temporary')}><Power size={14} /> Temporary</button><button type="button" className={storageMode === 'persistent' ? 'active' : ''} onClick={() => setStorageMode('persistent')}><Database size={14} /> Persistent</button></div><span className="mode-usage"><Database size={13} /> {persistentMachines} saved machine{persistentMachines === 1 ? '' : 's'}</span></section><section className="os-selection-grid">{osOrder.map((os) => <OsCard key={os} os={os} mode={storageMode} onLaunch={() => createAndStart(os, storageMode)} />)}</section>{managerNotice && <div className="manager-notice"><Info size={14} />{managerNotice}<button type="button" onClick={() => setManagerNotice('')}><X size={13} /></button></div>}<section className="machines-section"><div className="section-heading"><div><span className="app-eyebrow">MACHINE MANAGER</span><h2>Your virtual computers.</h2></div><button type="button" onClick={() => setShowMachineForm(true)}><Plus size={14} /> Create computer</button></div>{machines.length ? <div className="machine-list">{machines.map((item) => <MachineCard key={item.id} machine={item} onStart={() => void startMachine(item)} onDelete={() => { if (window.confirm(`Delete ${item.name} and its local files?`)) { deleteMachine(item.id); setMachines(readMachines()); setManagerNotice(`${item.name} deleted.`); } }} onDuplicate={() => { const duplicate = createMachine({ name: `${item.name} copy`, os: item.os, storageMode: item.storageMode, storageLimit: item.storageLimit }); setMachines(readMachines()); setManagerNotice(`${duplicate.name} created.`); }} />)}</div> : <div className="machines-empty"><Boxes size={20} /><span>No saved machines yet.</span><small>Start a persistent session to see it here.</small></div>}</section><OfficialMediaPanel stagedMedia={stagedMedia} onStage={(media) => { setStagedMedia(media); setManagerNotice(`${media.name} staged for this browser session. It is not booted or uploaded.`); }} /><section className="advanced-panel"><div className="advanced-icon"><Laptop size={17} /></div><div><span className="app-eyebrow">ADVANCED MODE</span><h3>Actual OS emulation</h3><p>Windows 11 and modern macOS require hardware or firmware features that browser emulators do not provide reliably. Staged media is retained as metadata only; use a licensed native VM or compatible emulator outside this simulation.</p></div><span className="advanced-status">NOT CONFIGURED <ExternalLink size={12} /></span></section></main><ManagerFooter />{showMachineForm && <MachineForm onCreate={handleCreate} onCancel={() => setShowMachineForm(false)} />}</div>;
};
