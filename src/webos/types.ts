export type OperatingSystem = 'windows' | 'macos' | 'linux';
export type StorageMode = 'temporary' | 'persistent';
export type BootState = 'stopped' | 'starting' | 'booting' | 'ready' | 'shuttingDown' | 'error';
export type FileEntryType = 'file' | 'directory';

export type AppId =
  | 'file-manager'
  | 'terminal'
  | 'editor'
  | 'browser'
  | 'calculator'
  | 'notes'
  | 'calendar'
  | 'monitor'
  | 'settings'
  | 'store'
  | 'research';

export interface MachineConfig {
  id: string;
  name: string;
  os: OperatingSystem;
  storageMode: StorageMode;
  storageLimit: number;
  createdAt: string;
  lastStartedAt?: string;
}

export interface DesktopSettings {
  theme: 'light' | 'dark' | 'system';
  wallpaper: 'aurora' | 'midnight' | 'desert' | 'graphite';
  accent: string;
  scale: number;
  clock24Hour: boolean;
  soundEnabled: boolean;
  detailedBoot: boolean;
}

export interface FileRecord {
  id: string;
  name: string;
  type: FileEntryType;
  content: string;
  mime: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  originalPath?: string;
  children?: Record<string, FileRecord>;
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  type: FileEntryType;
  mime: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  originalPath?: string;
}

export interface FileSystemSnapshot {
  version: 1;
  root: FileRecord;
}

export interface MachineExport {
  format: 'webos-machine';
  version: 1;
  machine: MachineConfig;
  settings: DesktopSettings;
  filesystem: FileSystemSnapshot;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  payload?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
}

export const DEFAULT_SETTINGS: DesktopSettings = {
  theme: 'dark',
  wallpaper: 'aurora',
  accent: '#65d8ff',
  scale: 1,
  clock24Hour: false,
  soundEnabled: true,
  detailedBoot: true,
};

export const OS_LABELS: Record<OperatingSystem, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};
