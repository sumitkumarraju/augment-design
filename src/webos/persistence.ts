import { createDefaultFilesystem, isValidFilesystemSnapshot, VirtualFileSystem } from './filesystem';
import { DEFAULT_SETTINGS, type DesktopSettings, type FileSystemSnapshot, type MachineConfig, type MachineExport } from './types';

export const MACHINES_STORAGE_KEY = 'webos-machines-v1';
export const SETTINGS_STORAGE_KEY = 'webos-settings-v1';

const DB_NAME = 'webos-local-v1';
const STORE_NAME = 'filesystems';
const MIN_STORAGE_LIMIT = 64 * 1024 * 1024;
const MAX_STORAGE_LIMIT = 8 * 1024 * 1024 * 1024;
const saveQueues = new Map<string, Promise<void>>();

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const isStorageAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const key = '__webos_storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const parseJson = <T,>(value: string | null, fallback: T): T => {
  try {
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

export const readMachines = (): MachineConfig[] => {
  if (!isStorageAvailable()) return [];
  const machines = parseJson<unknown>(window.localStorage.getItem(MACHINES_STORAGE_KEY), []);
  if (!Array.isArray(machines)) return [];
  return machines.filter((machine): machine is MachineConfig => Boolean(
    machine
    && typeof machine === 'object'
    && typeof (machine as MachineConfig).id === 'string'
    && typeof (machine as MachineConfig).name === 'string'
    && ['windows', 'macos', 'linux'].includes((machine as MachineConfig).os)
    && ['temporary', 'persistent'].includes((machine as MachineConfig).storageMode)
    && Number.isFinite((machine as MachineConfig).storageLimit)
    && (machine as MachineConfig).storageLimit >= MIN_STORAGE_LIMIT
    && (machine as MachineConfig).storageLimit <= MAX_STORAGE_LIMIT,
  ));
};

export const writeMachines = (machines: MachineConfig[]) => {
  try {
    if (isStorageAvailable()) window.localStorage.setItem(MACHINES_STORAGE_KEY, JSON.stringify(machines));
  } catch {
    // The active session can still run when browser preference storage is full or blocked.
  }
};

export const createMachine = (input: Pick<MachineConfig, 'name' | 'os' | 'storageMode'> & Partial<Pick<MachineConfig, 'storageLimit'>>): MachineConfig => {
  const machine: MachineConfig = {
    id: createId(),
    name: input.name.trim() || 'WebOS computer',
    os: input.os,
    storageMode: input.storageMode,
    storageLimit: Math.min(MAX_STORAGE_LIMIT, Math.max(MIN_STORAGE_LIMIT, input.storageLimit || 512 * 1024 * 1024)),
    createdAt: new Date().toISOString(),
  };
  writeMachines([machine, ...readMachines()]);
  return machine;
};

export const updateMachine = (machine: MachineConfig) => {
  writeMachines(readMachines().map((item) => item.id === machine.id ? machine : item));
};

export const deleteMachine = (machineId: string) => {
  writeMachines(readMachines().filter((machine) => machine.id !== machineId));
  void clearPersistedFilesystem(machineId);
  if (isStorageAvailable()) {
    try {
      const settings = parseJson<Record<string, DesktopSettings>>(window.localStorage.getItem(SETTINGS_STORAGE_KEY), {});
      delete settings[machineId];
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Deleting a machine should not be blocked by an unavailable preference store.
    }
  }
};

export const readSettings = (machineId: string): DesktopSettings => {
  if (!isStorageAvailable()) return { ...DEFAULT_SETTINGS };
  const all = parseJson<Record<string, Partial<DesktopSettings>>>(window.localStorage.getItem(SETTINGS_STORAGE_KEY), {});
  return { ...DEFAULT_SETTINGS, ...(all[machineId] || {}) };
};

export const writeSettings = (machineId: string, settings: DesktopSettings) => {
  if (!isStorageAvailable()) return;
  try {
    const all = parseJson<Record<string, DesktopSettings>>(window.localStorage.getItem(SETTINGS_STORAGE_KEY), {});
    all[machineId] = settings;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Preferences remain active for the current session even when persistence is unavailable.
  }
};

const openDatabase = (): Promise<IDBDatabase | null> => new Promise((resolve) => {
  if (typeof indexedDB === 'undefined') {
    resolve(null);
    return;
  }
  try {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'machineId' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  } catch {
    resolve(null);
  }
});

const requestResult = <T,>(request: IDBRequest<T>) => new Promise<T | null>((resolve) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => resolve(null);
});

const fallbackKey = (machineId: string) => `webos-filesystem-${machineId}`;

export const loadFilesystem = async (machine: MachineConfig) => {
  if (machine.storageMode === 'temporary') return createDefaultFilesystem(machine.storageLimit);
  const database = await openDatabase();
  if (database) {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const record = await requestResult<{ machineId: string; snapshot: FileSystemSnapshot }>(transaction.objectStore(STORE_NAME).get(machine.id));
    database.close();
    if (record?.snapshot) return new VirtualFileSystem(record.snapshot, machine.storageLimit);
  }
  if (isStorageAvailable()) {
    const snapshot = parseJson<FileSystemSnapshot | null>(window.localStorage.getItem(fallbackKey(machine.id)), null);
    if (snapshot) return new VirtualFileSystem(snapshot, machine.storageLimit);
  }
  return createDefaultFilesystem(machine.storageLimit);
};

export const saveFilesystem = async (machine: MachineConfig, filesystem: VirtualFileSystem) => {
  if (machine.storageMode === 'temporary') return;
  const previous = saveQueues.get(machine.id) || Promise.resolve();
  const next = previous.catch(() => undefined).then(async () => {
    const snapshot = filesystem.exportFilesystem();
    const database = await openDatabase();
    if (database) {
      await new Promise<void>((resolve) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put({ machineId: machine.id, snapshot, updatedAt: new Date().toISOString() });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
      database.close();
      return;
    }
    if (isStorageAvailable()) window.localStorage.setItem(fallbackKey(machine.id), JSON.stringify(snapshot));
  }).catch(() => undefined);
  saveQueues.set(machine.id, next);
  void next.then(() => undefined, () => undefined).then(() => {
    if (saveQueues.get(machine.id) === next) saveQueues.delete(machine.id);
  });
  await next;
};

export const clearPersistedFilesystem = async (machineId: string) => {
  const pending = saveQueues.get(machineId);
  if (pending) await pending.catch(() => undefined);
  const database = await openDatabase();
  if (database) {
    await new Promise<void>((resolve) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(machineId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
    database.close();
  }
  if (isStorageAvailable()) window.localStorage.removeItem(fallbackKey(machineId));
};

export const buildMachineExport = (machine: MachineConfig, settings: DesktopSettings, filesystem: VirtualFileSystem): MachineExport => ({
  format: 'webos-machine',
  version: 1,
  machine,
  settings,
  filesystem: filesystem.exportFilesystem(),
});

export const readMachineExport = (raw: string): MachineExport => {
  const value: unknown = parseJson<unknown>(raw, null);
  if (!value || typeof value !== 'object') throw new Error('The selected file is not a WebOS machine export.');
  const candidate = value as Partial<MachineExport>;
  if (candidate.format !== 'webos-machine' || candidate.version !== 1 || !candidate.machine || !candidate.filesystem || !candidate.settings) {
    throw new Error('The selected file is not a compatible WebOS machine export.');
  }
  const machine = candidate.machine as MachineConfig;
  if (!machine.id || !machine.name || machine.name.length > 120 || !['windows', 'macos', 'linux'].includes(machine.os) || !['temporary', 'persistent'].includes(machine.storageMode) || !Number.isFinite(machine.storageLimit) || machine.storageLimit < MIN_STORAGE_LIMIT || machine.storageLimit > MAX_STORAGE_LIMIT) {
    throw new Error('The machine export contains invalid configuration.');
  }
  if (!isValidFilesystemSnapshot(candidate.filesystem)) throw new Error('The machine export contains a corrupted filesystem.');
  const settings = candidate.settings as Partial<DesktopSettings>;
  if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) throw new Error('The machine export contains invalid theme settings.');
  if (settings.wallpaper && !['aurora', 'midnight', 'desert', 'graphite'].includes(settings.wallpaper)) throw new Error('The machine export contains invalid wallpaper settings.');
  if (settings.accent && !/^#[0-9a-f]{6}$/i.test(settings.accent)) throw new Error('The machine export contains an invalid accent color.');
  if (settings.scale !== undefined && (!Number.isFinite(settings.scale) || settings.scale < 0.8 || settings.scale > 1.4)) throw new Error('The machine export contains an invalid display scale.');
  if (settings.clock24Hour !== undefined && typeof settings.clock24Hour !== 'boolean') throw new Error('The machine export contains invalid clock settings.');
  if (settings.soundEnabled !== undefined && typeof settings.soundEnabled !== 'boolean') throw new Error('The machine export contains invalid sound settings.');
  if (settings.detailedBoot !== undefined && typeof settings.detailedBoot !== 'boolean') throw new Error('The machine export contains invalid boot settings.');
  return { format: 'webos-machine', version: 1, machine, settings: { ...DEFAULT_SETTINGS, ...settings }, filesystem: candidate.filesystem };
};

export const downloadJson = (filename: string, value: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
