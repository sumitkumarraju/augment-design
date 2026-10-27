import type { FileMetadata, FileRecord, FileSystemSnapshot } from './types';

const MAX_NAME_LENGTH = 120;

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const now = () => new Date().toISOString();

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const cloneWithNewIds = (entry: FileRecord): FileRecord => {
  const copied = clone(entry);
  copied.id = createId();
  if (isDirectory(copied)) {
    copied.children = Object.fromEntries(Object.entries(copied.children).map(([name, child]) => [name, cloneWithNewIds(child)]));
  }
  return copied;
};

const emptyDirectory = (name: string): FileRecord => ({
  id: createId(),
  name,
  type: 'directory',
  content: '',
  mime: 'inode/directory',
  size: 0,
  createdAt: now(),
  modifiedAt: now(),
  children: {},
});

const fileRecord = (name: string, content = '', mime = 'text/plain'): FileRecord => ({
  id: createId(),
  name,
  type: 'file',
  content,
  mime,
  size: content.length,
  createdAt: now(),
  modifiedAt: now(),
});

const pathParts = (path: string, cwd = '/') => {
  if (typeof path !== 'string' || path.trim() === '') throw new Error('A path is required.');
  const raw = path.replaceAll('\\', '/');
  const combined = raw.startsWith('/') ? raw : `${cwd.replace(/\/$/, '')}/${raw}`;
  const parts: string[] = [];
  for (const part of combined.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      parts.pop();
      continue;
    }
    if (part.includes('\0')) throw new Error('Invalid path.');
    parts.push(part);
  }
  return parts;
};

export const normalizePath = (path: string, cwd = '/') => {
  const parts = pathParts(path, cwd);
  return parts.length ? `/${parts.join('/')}` : '/';
};

const parentPath = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split('/').filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join('/')}` : '/';
};

const basename = (path: string) => {
  const normalized = normalizePath(path);
  return normalized.split('/').filter(Boolean).pop() || '/';
};

const validateName = (name: string) => {
  if (!name || name === '.' || name === '..' || name.includes('/') || name.includes('\\') || name.includes('\0')) {
    throw new Error('Names cannot contain path separators or traversal segments.');
  }
  if (name.length > MAX_NAME_LENGTH) throw new Error(`Names must be ${MAX_NAME_LENGTH} characters or fewer.`);
};

const isDirectory = (entry: FileRecord): entry is FileRecord & { children: Record<string, FileRecord> } => entry.type === 'directory' && Boolean(entry.children);

const toMetadata = (entry: FileRecord, path: string): FileMetadata => ({
  id: entry.id,
  name: entry.name,
  path,
  type: entry.type,
  mime: entry.mime,
  size: entry.size,
  createdAt: entry.createdAt,
  modifiedAt: entry.modifiedAt,
  originalPath: entry.originalPath,
});

const validateRecord = (entry: unknown, isRoot = false): entry is FileRecord => {
  if (!entry || typeof entry !== 'object') return false;
  const candidate = entry as Partial<FileRecord>;
  if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || typeof candidate.type !== 'string') return false;
  if (candidate.type !== 'file' && candidate.type !== 'directory') return false;
  try {
    if (!isRoot) validateName(candidate.name);
  } catch {
    return false;
  }
  if (typeof candidate.content !== 'string' || typeof candidate.mime !== 'string' || typeof candidate.size !== 'number' || !Number.isSafeInteger(candidate.size) || candidate.size < 0) return false;
  if (typeof candidate.createdAt !== 'string' || typeof candidate.modifiedAt !== 'string') return false;
  if (candidate.type === 'directory') {
    if (!candidate.children || typeof candidate.children !== 'object') return false;
    return candidate.size === 0 && Object.entries(candidate.children).every(([name, child]) => name === (child as Partial<FileRecord>).name && validateRecord(child));
  }
  return !candidate.children && candidate.size === candidate.content.length;
};

export const isValidFilesystemSnapshot = (snapshot: unknown): snapshot is FileSystemSnapshot => {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const candidate = snapshot as Partial<FileSystemSnapshot>;
  return candidate.version === 1 && validateRecord(candidate.root, true);
};

export class VirtualFileSystem {
  private root: FileRecord;

  readonly storageLimit: number;

  constructor(snapshot?: FileSystemSnapshot, storageLimit = 512 * 1024 * 1024) {
    this.storageLimit = storageLimit;
    if (snapshot && validateRecord(snapshot.root, true)) {
      this.root = clone(snapshot.root);
      this.root.name = '';
    } else {
      this.root = emptyDirectory('');
      this.seed();
    }
  }

  private seed() {
    for (const name of ['Desktop', 'Documents', 'Downloads', 'Pictures', 'Projects', 'Applications', 'System', 'Temporary', 'Trash']) {
      this.root.children![name] = emptyDirectory(name);
    }
    this.root.children!.Desktop.children!['Welcome.txt'] = fileRecord('Welcome.txt', 'Welcome to WebOS.\n\nThis is a local, simulated computer environment. Your files stay inside this virtual machine.\n');
    this.root.children!.Documents.children!['Readme.md'] = fileRecord('Readme.md', '# Documents\n\nCreate, edit, and move files with the WebOS file manager.\n', 'text/markdown');
    this.root.children!.Projects.children!.Workspace = emptyDirectory('Workspace');
    this.root.children!.System.children!['Kernel.info'] = fileRecord('Kernel.info', 'WebOS simulated kernel\nArchitecture: browser-native\nExecution: sandboxed virtual commands\n');
  }

  private getNode(path: string, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    if (normalized === '/') return this.root;
    let current = this.root;
    for (const part of normalized.split('/').filter(Boolean)) {
      if (!isDirectory(current) || !current.children[part]) throw new Error(`Path not found: ${normalized}`);
      current = current.children[part];
    }
    return current;
  }

  private getParent(path: string, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    const parent = this.getNode(parentPath(normalized));
    if (!isDirectory(parent)) throw new Error('The destination parent is not a directory.');
    return { normalized, parent, name: basename(normalized) };
  }

  private assertCapacity(nextSize: number) {
    if (nextSize > this.storageLimit) throw new Error(`Storage limit reached (${this.formatBytes(this.storageLimit)}).`);
  }

  private uniquePath(path: string) {
    const normalized = normalizePath(path);
    if (!this.exists(normalized)) return normalized;
    const parent = parentPath(normalized);
    const name = basename(normalized);
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const extension = dot > 0 ? name.slice(dot) : '';
    let index = 2;
    let candidate = `${parent}/${stem} (${index})${extension}`;
    while (this.exists(candidate)) {
      index += 1;
      candidate = `${parent}/${stem} (${index})${extension}`;
    }
    return candidate;
  }

  exists(path: string, cwd = '/') {
    try {
      this.getNode(path, cwd);
      return true;
    } catch {
      return false;
    }
  }

  getMetadata(path: string, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    return toMetadata(this.getNode(normalized), normalized);
  }

  listDirectory(path = '/', cwd = '/') {
    const normalized = normalizePath(path, cwd);
    const directory = this.getNode(normalized);
    if (!isDirectory(directory)) throw new Error(`${normalized} is not a directory.`);
    return Object.values(directory.children).sort((left, right) => {
      if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
      return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
    }).map((entry) => toMetadata(entry, normalized === '/' ? `/${entry.name}` : `${normalized}/${entry.name}`));
  }

  readFile(path: string, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    const entry = this.getNode(normalized);
    if (entry.type !== 'file') throw new Error(`${normalized} is a directory.`);
    return entry.content;
  }

  createDirectory(path: string, cwd = '/') {
    const { parent, name, normalized } = this.getParent(path, cwd);
    validateName(name);
    if (parent.children[name]) throw new Error(`A file or folder named “${name}” already exists.`);
    parent.children[name] = emptyDirectory(name);
    parent.modifiedAt = now();
    return this.getMetadata(normalized);
  }

  createFile(path: string, content = '', mime = 'text/plain', cwd = '/') {
    const { parent, name, normalized } = this.getParent(path, cwd);
    validateName(name);
    if (parent.children[name]) throw new Error(`A file or folder named “${name}” already exists.`);
    this.assertCapacity(this.getStorageUsage().used + content.length);
    parent.children[name] = fileRecord(name, content, mime);
    parent.modifiedAt = now();
    return this.getMetadata(normalized);
  }

  writeFile(path: string, content: string, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    const entry = this.getNode(normalized);
    if (entry.type !== 'file') throw new Error(`${normalized} is a directory.`);
    const usage = this.getStorageUsage().used - entry.size + content.length;
    this.assertCapacity(usage);
    entry.content = content;
    entry.size = content.length;
    entry.modifiedAt = now();
    return this.getMetadata(normalized);
  }

  rename(path: string, destination: string, cwd = '/') {
    const source = normalizePath(path, cwd);
    if (source === '/') throw new Error('The root folder cannot be renamed.');
    const entry = this.getNode(source);
    const destinationPath = destination.startsWith('/') ? normalizePath(destination) : `${parentPath(source)}/${destination}`;
    const { parent, name, normalized } = this.getParent(destinationPath);
    validateName(name);
    if (this.exists(normalized)) throw new Error(`A file or folder named “${name}” already exists.`);
    if (entry.type === 'directory' && `${normalized}/`.startsWith(`${source}/`)) throw new Error('A folder cannot be moved into itself.');
    const sourceParent = this.getParent(source).parent;
    delete sourceParent.children[basename(source)];
    entry.name = name;
    parent.children[name] = entry;
    sourceParent.modifiedAt = now();
    parent.modifiedAt = now();
    return this.getMetadata(normalized);
  }

  copy(sourcePath: string, destinationPath: string, cwd = '/') {
    const source = normalizePath(sourcePath, cwd);
    const sourceEntry = this.getNode(source);
    const destination = normalizePath(destinationPath, cwd);
    const destinationEntry = this.exists(destination) ? this.getNode(destination) : null;
    const target = destinationEntry?.type === 'directory' ? `${destination}/${sourceEntry.name}` : destination;
    const { parent, name, normalized } = this.getParent(target);
    validateName(name);
    if (parent.children[name]) throw new Error(`A file or folder named “${name}” already exists.`);
    const copied = cloneWithNewIds(sourceEntry);
    copied.name = name;
    const size = this.getEntrySize(copied);
    this.assertCapacity(this.getStorageUsage().used + size);
    parent.children[name] = copied;
    parent.modifiedAt = now();
    return this.getMetadata(normalized);
  }

  move(sourcePath: string, destinationPath: string, cwd = '/') {
    const source = normalizePath(sourcePath, cwd);
    const sourceEntry = this.getNode(source);
    const destination = normalizePath(destinationPath, cwd);
    const destinationEntry = this.exists(destination) ? this.getNode(destination) : null;
    const target = destinationEntry?.type === 'directory' ? `${destination}/${sourceEntry.name}` : destination;
    return this.rename(source, target);
  }

  delete(path: string, permanent = false, cwd = '/') {
    const normalized = normalizePath(path, cwd);
    if (normalized === '/' || normalized === '/Trash') throw new Error('This protected folder cannot be deleted.');
    const { parent, name } = this.getParent(normalized);
    const entry = parent.children[name];
    if (!entry) throw new Error(`Path not found: ${normalized}`);
    if (permanent || normalized.startsWith('/Trash/')) {
      delete parent.children[name];
      parent.modifiedAt = now();
      return;
    }
    const trashPath = this.uniquePath(`/Trash/${entry.name}`);
    entry.originalPath = normalized;
    delete parent.children[name];
    const trashParent = this.getNode('/Trash');
    if (!isDirectory(trashParent)) throw new Error('Trash is unavailable.');
    entry.name = basename(trashPath);
    trashParent.children[entry.name] = entry;
    parent.modifiedAt = now();
    trashParent.modifiedAt = now();
  }

  restore(path: string) {
    const normalized = normalizePath(path);
    const entry = this.getNode(normalized);
    if (!entry.originalPath || !normalized.startsWith('/Trash/')) throw new Error('This item cannot be restored.');
    const target = this.uniquePath(entry.originalPath);
    const targetParent = this.getNode(parentPath(target));
    if (!isDirectory(targetParent)) throw new Error('The original folder no longer exists.');
    const sourceParent = this.getParent(normalized).parent;
    delete sourceParent.children[basename(normalized)];
    entry.name = basename(target);
    delete entry.originalPath;
    targetParent.children[entry.name] = entry;
    sourceParent.modifiedAt = now();
    targetParent.modifiedAt = now();
    return this.getMetadata(target);
  }

  search(query: string, startingPath = '/') {
    const normalized = normalizePath(startingPath);
    const result: FileMetadata[] = [];
    const needle = query.trim().toLowerCase();
    const visit = (path: string, entry: FileRecord) => {
      if (!needle || entry.name.toLowerCase().includes(needle)) result.push(toMetadata(entry, path));
      if (isDirectory(entry)) Object.values(entry.children).forEach((child) => visit(path === '/' ? `/${child.name}` : `${path}/${child.name}`, child));
    };
    visit(normalized, this.getNode(normalized));
    return result;
  }

  getStorageUsage() {
    let used = 0;
    const walk = (entry: FileRecord) => {
      if (entry.type === 'file') used += entry.size;
      if (isDirectory(entry)) Object.values(entry.children).forEach(walk);
    };
    walk(this.root);
    return { used, limit: this.storageLimit, available: Math.max(0, this.storageLimit - used) };
  }

  exportFilesystem(): FileSystemSnapshot {
    return { version: 1, root: clone(this.root) };
  }

  importFilesystem(snapshot: FileSystemSnapshot) {
    if (!isValidFilesystemSnapshot(snapshot)) throw new Error('This file is not a valid WebOS filesystem export.');
    const next = clone(snapshot.root);
    next.name = '';
    const nextSize = this.getEntrySize(next);
    this.assertCapacity(nextSize);
    this.root = next;
  }

  reset() {
    this.root = emptyDirectory('');
    this.seed();
  }

  getTree(path = '/') {
    return clone(this.getNode(path));
  }

  formatBytes(value: number) {
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  private getEntrySize(entry: FileRecord): number {
    if (entry.type === 'file') return entry.size;
    return Object.values(entry.children || {}).reduce((total, child) => total + this.getEntrySize(child), 0);
  }
}

export const createDefaultFilesystem = (storageLimit?: number) => new VirtualFileSystem(undefined, storageLimit);
