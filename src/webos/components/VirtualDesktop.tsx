import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ChevronDown, CircleHelp, FileText, FolderOpen, Grid2X2, Monitor, RefreshCw, Search, Settings2, TerminalSquare, Volume2, Wifi, X } from 'lucide-react';
import { AppIcon, desktopAppIds, getApp } from '../appRegistry';
import type { VirtualFileSystem } from '../filesystem';
import type { AppId, DesktopSettings, MachineConfig, OperatingSystem, WindowState } from '../types';
import {
  BrowserApp,
  CalculatorApp,
  CalendarApp,
  EditorApp,
  FileManagerApp,
  MonitorApp,
  NotesApp,
  ResearchApp,
  SettingsApp,
  StoreApp,
  TerminalApp,
  type ApplicationProps,
} from './Applications';

type DesktopProps = {
  os: OperatingSystem;
  machine: MachineConfig;
  filesystem: VirtualFileSystem;
  settings: DesktopSettings;
  onSettingsChange: (settings: DesktopSettings) => void;
  onFilesystemChange: () => void;
  onReset: () => void;
  onImportMachine: ApplicationProps['onImportMachine'];
  onShutdown: () => void;
  sessionStartedAt: number;
  settingsRequest?: number;
};

type ContextMenu = { x: number; y: number } | null;

const desktopShortcuts: Array<{ id: string; label: string; type: 'app' | 'folder'; appId?: AppId; path?: string }> = [
  { id: 'computer', label: 'This Computer', type: 'app', appId: 'file-manager' },
  { id: 'documents', label: 'Documents', type: 'folder', path: '/Documents' },
  { id: 'projects', label: 'Projects', type: 'folder', path: '/Projects' },
  { id: 'terminal', label: 'Terminal', type: 'app', appId: 'terminal' },
  { id: 'trash', label: 'Trash', type: 'folder', path: '/Trash' },
];

const initialWindowSize: Record<AppId, { width: number; height: number }> = {
  'file-manager': { width: 650, height: 450 },
  terminal: { width: 610, height: 390 },
  editor: { width: 670, height: 480 },
  browser: { width: 700, height: 500 },
  calculator: { width: 330, height: 510 },
  notes: { width: 420, height: 390 },
  calendar: { width: 480, height: 460 },
  monitor: { width: 650, height: 470 },
  settings: { width: 690, height: 500 },
  store: { width: 700, height: 520 },
  research: { width: 840, height: 610 },
};

const initialPosition = (index: number, size: { width: number; height: number }) => ({
  x: 54 + (index % 3) * 34,
  y: 52 + (index % 4) * 28,
  width: size.width,
  height: size.height,
});

const appTitle = (appId: AppId, payload?: string) => appId === 'editor' && payload ? `Text Editor — ${payload.split('/').pop()}` : getApp(appId).title;

const desktopClock = (clock24Hour: boolean) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: !clock24Hour }).format(new Date());

const WindowFrame = ({ windowState, children, onFocus, onClose, onMinimize, onMaximize, onMove, onResize }: { windowState: WindowState; children: ReactNode; onFocus: () => void; onClose: () => void; onMinimize: () => void; onMaximize: () => void; onMove: (x: number, y: number) => void; onResize: (width: number, height: number) => void }) => {
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resize = useRef<{ startX: number; startY: number; originWidth: number; originHeight: number } | null>(null);
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (drag.current) onMove(Math.max(4, drag.current.originX + event.clientX - drag.current.startX), Math.max(30, drag.current.originY + event.clientY - drag.current.startY));
      if (resize.current) onResize(Math.max(280, resize.current.originWidth + event.clientX - resize.current.startX), Math.max(180, resize.current.originHeight + event.clientY - resize.current.startY));
    };
    const up = () => { drag.current = null; resize.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [onMove, onResize]);
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || windowState.maximized) return;
    onFocus();
    drag.current = { startX: event.clientX, startY: event.clientY, originX: windowState.x, originY: windowState.y };
  };
  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (windowState.maximized) return;
    event.stopPropagation();
    onFocus();
    resize.current = { startX: event.clientX, startY: event.clientY, originWidth: windowState.width, originHeight: windowState.height };
  };
  return <section className={`desktop-window ${windowState.maximized ? 'maximized' : ''} ${windowState.minimized ? 'minimized' : ''}`} style={windowState.maximized ? { zIndex: windowState.zIndex } : { left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height, zIndex: windowState.zIndex }} onMouseDown={onFocus}><header className="window-titlebar" onPointerDown={startDrag}><span className="window-title-icon"><AppIcon appId={windowState.appId} size={14} /></span><span className="window-title">{windowState.title}</span><div className="window-controls"><button type="button" onClick={(event) => { event.stopPropagation(); onMinimize(); }} aria-label="Minimize"><i className="window-minimize" /></button><button type="button" onClick={(event) => { event.stopPropagation(); onMaximize(); }} aria-label={windowState.maximized ? 'Restore' : 'Maximize'}><i className="window-maximize" /></button><button type="button" onClick={(event) => { event.stopPropagation(); onClose(); }} aria-label="Close"><X size={12} /></button></div></header><div className="window-body">{children}</div><div className="window-resize-handle" onPointerDown={startResize} /></section>;
};

const WindowsChrome = ({ onStart, startOpen, onApp, windows, settings, onShutdown }: { onStart: () => void; startOpen: boolean; onApp: (appId: AppId) => void; windows: WindowState[]; settings: DesktopSettings; onShutdown: () => void }) => <div className="desktop-shell-chrome" onClick={(event) => event.stopPropagation()}><div className="desktop-taskbar desktop-taskbar-windows"><button type="button" className="start-button" onClick={onStart}><span className="start-logo"><i /><i /><i /><i /></span></button><button type="button" className="taskbar-search" onClick={onStart}><Search size={13} /> Type here to search</button><div className="taskbar-apps">{desktopAppIds.map((appId) => <button type="button" key={appId} className={windows.some((item) => item.appId === appId && !item.minimized) ? 'active' : ''} onClick={() => onApp(appId)} title={getApp(appId).title}><AppIcon appId={appId} size={16} /></button>)}</div><div className="taskbar-tray"><Wifi size={13} /><Volume2 size={13} /><span>{desktopClock(settings.clock24Hour)}</span><button type="button" onClick={onShutdown} title="Shut down"><PowerIcon /></button></div></div>{startOpen && <StartMenu onApp={onApp} onShutdown={onShutdown} />}</div>;

const PowerIcon = () => <span className="power-icon">⏻</span>;

const StartMenu = ({ onApp, onShutdown }: { onApp: (appId: AppId) => void; onShutdown: () => void }) => <div className="start-menu"><div className="start-menu-head"><div className="user-avatar">W</div><div><strong>WebOS user</strong><span>Local session</span></div><button type="button" onClick={onShutdown}><PowerIcon /></button></div><label className="start-menu-search"><Search size={14} /><input placeholder="Search apps and files" /></label><div className="start-menu-label">Pinned</div><div className="start-menu-grid">{['file-manager', 'terminal', 'editor', 'browser', 'settings', 'store'].map((appId) => <button type="button" key={appId} onClick={() => onApp(appId as AppId)}><span><AppIcon appId={appId as AppId} size={18} /></span>{getApp(appId as AppId).shortTitle}</button>)}</div><div className="start-menu-footer"><span><CircleHelp size={13} /> Help & tips</span><span>WebOS 1.0</span></div></div>;

const MacChrome = ({ onApp, windows, settings, onShutdown }: { onApp: (appId: AppId) => void; windows: WindowState[]; settings: DesktopSettings; onShutdown: () => void }) => <div className="desktop-shell-chrome" onClick={(event) => event.stopPropagation()}><div className="desktop-menubar desktop-menubar-macos"><button type="button" className="mac-menu-logo" onClick={() => onApp('store')}><span className="mac-logo-small" /></button><button type="button" onClick={() => onApp('research')}>WebOS</button><button type="button" onClick={() => onApp('file-manager')}>File</button><button type="button" onClick={() => onApp('editor')}>Edit</button><button type="button" onClick={() => onApp('browser')}>View</button><span className="mac-menu-spacer" /><Wifi size={12} /><Volume2 size={12} /><button type="button" onClick={() => onApp('monitor')}><Monitor size={12} /></button><span>{desktopClock(settings.clock24Hour)}</span><button type="button" className="mac-user" onClick={onShutdown}>A</button></div><div className="desktop-dock desktop-dock-macos">{['file-manager', 'browser', 'terminal', 'editor', 'calendar', 'notes', 'store'].map((appId) => <button type="button" key={appId} className={windows.some((item) => item.appId === appId && !item.minimized) ? 'active' : ''} onClick={() => onApp(appId as AppId)} title={getApp(appId as AppId).title}><AppIcon appId={appId as AppId} size={20} /></button>)}<span className="dock-divider" /><button type="button" onClick={onShutdown} title="Shut down"><PowerIcon /></button></div></div>;

const LinuxChrome = ({ onApp, windows, settings }: { onApp: (appId: AppId) => void; windows: WindowState[]; settings: DesktopSettings }) => <div className="desktop-shell-chrome" onClick={(event) => event.stopPropagation()}><div className="desktop-topbar-linux"><button type="button" className="linux-activities" onClick={() => onApp('store')}><Grid2X2 size={14} /> Activities</button><span className="linux-topbar-title">{windows.find((windowState) => !windowState.minimized)?.title || 'WebOS Linux'}</span><div><Wifi size={13} /><Volume2 size={13} /><span>{desktopClock(settings.clock24Hour)}</span><button type="button" onClick={() => onApp('monitor')}><ChevronDown size={13} /></button></div></div><div className="desktop-dock desktop-dock-linux">{['store', 'file-manager', 'terminal', 'editor', 'browser', 'settings'].map((appId) => <button type="button" key={appId} className={windows.some((item) => item.appId === appId && !item.minimized) ? 'active' : ''} onClick={() => onApp(appId as AppId)} title={getApp(appId as AppId).title}><AppIcon appId={appId as AppId} size={19} /></button>)}</div></div>;

const DesktopContextMenu = ({ position, onAction, onClose }: { position: ContextMenu; onAction: (action: 'new-folder' | 'new-file' | 'terminal' | 'refresh') => void; onClose: () => void }) => {
  if (!position) return null;
  return <div className="desktop-context-menu" style={{ left: position.x, top: position.y }} onMouseLeave={onClose}><button type="button" onClick={() => onAction('new-folder')}><FolderOpen size={14} /> New folder</button><button type="button" onClick={() => onAction('new-file')}><FileText size={14} /> New text file</button><span /><button type="button" onClick={() => onAction('terminal')}><TerminalSquare size={14} /> Open Terminal here</button><button type="button" onClick={() => onAction('refresh')}><RefreshCw size={14} /> Refresh desktop</button></div>;
};

const appContent = (appId: AppId, props: ApplicationProps, payload?: string) => {
  if (appId === 'file-manager') return <FileManagerApp {...props} initialPath={payload} />;
  if (appId === 'terminal') return <TerminalApp {...props} />;
  if (appId === 'editor') return <EditorApp {...props} initialPath={payload} />;
  if (appId === 'browser') return <BrowserApp />;
  if (appId === 'calculator') return <CalculatorApp />;
  if (appId === 'notes') return <NotesApp {...props} />;
  if (appId === 'calendar') return <CalendarApp />;
  if (appId === 'monitor') return <MonitorApp {...props} />;
  if (appId === 'settings') return <SettingsApp {...props} />;
  if (appId === 'store') return <StoreApp {...props} />;
  return <ResearchApp />;
};

export const VirtualDesktop = ({ os, machine, filesystem, settings, onSettingsChange, onFilesystemChange, onReset, onImportMachine, onShutdown, sessionStartedAt, settingsRequest = 0 }: DesktopProps) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(() => desktopClock(settings.clock24Hour));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(desktopClock(settings.clock24Hour)), 30000);
    return () => window.clearInterval(timer);
  }, [settings.clock24Hour]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const focusWindow = useCallback((id: string) => {
    setWindows((current) => {
      const nextZ = Math.max(10, ...current.map((windowState) => windowState.zIndex)) + 1;
      return current.map((windowState) => windowState.id === id ? { ...windowState, minimized: false, zIndex: nextZ } : windowState);
    });
  }, []);

  const openApp = useCallback((appId: AppId, payload?: string) => {
    setStartOpen(false);
    setContextMenu(null);
    setWindows((current) => {
      const existing = current.find((windowState) => windowState.appId === appId && (appId !== 'editor' || windowState.payload === payload));
      const nextZ = Math.max(10, ...current.map((windowState) => windowState.zIndex)) + 1;
      if (existing) return current.map((windowState) => windowState.id === existing.id ? { ...windowState, minimized: false, zIndex: nextZ } : windowState);
      const size = initialWindowSize[appId];
      const position = initialPosition(current.length, size);
      const next: WindowState = { id: `${appId}-${Date.now()}`, appId, payload, title: appTitle(appId, payload), ...position, zIndex: nextZ, minimized: false, maximized: false };
      return [...current, next];
    });
    setToast(`${getApp(appId).title} opened`);
  }, []);

  useEffect(() => {
    if (settingsRequest > 0) openApp('settings');
  }, [openApp, settingsRequest]);

  const closeWindow = useCallback((id: string) => setWindows((current) => current.filter((windowState) => windowState.id !== id)), []);
  const minimizeWindow = useCallback((id: string) => setWindows((current) => current.map((windowState) => windowState.id === id ? { ...windowState, minimized: true } : windowState)), []);
  const maximizeWindow = useCallback((id: string) => setWindows((current) => current.map((windowState) => windowState.id === id ? { ...windowState, maximized: !windowState.maximized, minimized: false } : windowState)), []);
  const moveWindow = useCallback((id: string, x: number, y: number) => setWindows((current) => current.map((windowState) => windowState.id === id ? { ...windowState, x, y } : windowState)), []);
  const resizeWindow = useCallback((id: string, width: number, height: number) => setWindows((current) => current.map((windowState) => windowState.id === id ? { ...windowState, width, height } : windowState)), []);

  const appProps: ApplicationProps = { filesystem, onFilesystemChange, machine, settings, onSettingsChange, onReset, onImportMachine, openApp, runningApps: windows.map((windowState) => windowState.appId), sessionStartedAt };
  const handleShortcut = (shortcut: typeof desktopShortcuts[number]) => {
    if (shortcut.type === 'app' && shortcut.appId) openApp(shortcut.appId);
    if (shortcut.type === 'folder' && shortcut.path) openApp('file-manager', shortcut.path);
  };
  const handleContextAction = (action: 'new-folder' | 'new-file' | 'terminal' | 'refresh') => {
    setContextMenu(null);
    try {
      if (action === 'new-folder') { const name = window.prompt('Folder name', 'New folder'); if (name) { filesystem.createDirectory(`/Desktop/${name}`); onFilesystemChange(); } }
      if (action === 'new-file') { const name = window.prompt('File name', 'new-file.txt'); if (name) { filesystem.createFile(`/Desktop/${name}`); onFilesystemChange(); } }
      if (action === 'terminal') openApp('terminal');
      if (action === 'refresh') setToast('Desktop refreshed');
    } catch (error) { setToast(error instanceof Error ? error.message : 'Desktop action failed'); }
  };

  return <div ref={desktopRef} className={`virtual-desktop virtual-desktop-${os} wallpaper-${settings.wallpaper} theme-${settings.theme}`} style={{ '--webos-accent': settings.accent, '--desktop-scale': settings.scale } as CSSProperties} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY }); }} onClick={() => { setContextMenu(null); setStartOpen(false); }}>
    <div className="desktop-atmosphere" />
    {os === 'windows' && <WindowsChrome onStart={() => setStartOpen((value) => !value)} startOpen={startOpen} onApp={openApp} windows={windows} settings={settings} onShutdown={onShutdown} />}
    {os === 'macos' && <MacChrome onApp={openApp} windows={windows} settings={settings} onShutdown={onShutdown} />}
    {os === 'linux' && <LinuxChrome onApp={openApp} windows={windows} settings={settings} />}
    <div className="desktop-brand-mark"><span className="vm-brand-mark"><i /><i /><i /><i /></span><strong>WebOS</strong><small>LOCAL COMPUTER</small></div>
    <div className="desktop-clock-mobile">{clock}</div>
    <div className="desktop-shortcuts">{desktopShortcuts.map((shortcut) => <button type="button" key={shortcut.id} className={selectedShortcut === shortcut.id ? 'selected' : ''} onClick={(event) => { event.stopPropagation(); setSelectedShortcut(shortcut.id); }} onDoubleClick={(event) => { event.stopPropagation(); handleShortcut(shortcut); }} title={`Open ${shortcut.label}`}><span className={`desktop-icon desktop-icon-${shortcut.id}`}>{shortcut.type === 'app' && shortcut.appId ? <AppIcon appId={shortcut.appId} size={20} /> : shortcut.id === 'trash' ? <TrashIcon /> : <FolderOpen size={20} />}</span><b>{shortcut.label}</b></button>)}</div>
    <div className="desktop-windows-layer">{windows.map((windowState) => <WindowFrame key={windowState.id} windowState={windowState} onFocus={() => focusWindow(windowState.id)} onClose={() => closeWindow(windowState.id)} onMinimize={() => minimizeWindow(windowState.id)} onMaximize={() => maximizeWindow(windowState.id)} onMove={(x, y) => moveWindow(windowState.id, x, y)} onResize={(width, height) => resizeWindow(windowState.id, width, height)}>{appContent(windowState.appId, appProps, windowState.payload)}</WindowFrame>)}</div>
    <DesktopContextMenu position={contextMenu} onAction={handleContextAction} onClose={() => setContextMenu(null)} />
    {os !== 'windows' && <div className="desktop-time-readout">{clock}</div>}
    {toast && <div className="desktop-toast"><span /><span>{toast}</span></div>}
    <button type="button" className="desktop-settings-hotspot" onClick={() => openApp('settings')} aria-label="Open virtual machine settings"><SettingsIcon /></button>
  </div>;
};

const TrashIcon = () => <span className="trash-icon">▥</span>;
const SettingsIcon = () => <Settings2 size={13} />;
