import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  ExternalLink,
  FileCode2,
  FilePlus2,
  FolderPlus,
  Globe2,
  HardDrive,
  LayoutGrid,
  MonitorCog,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { APP_REGISTRY, AppIcon, getApp } from '../appRegistry';
import { buildMachineExport, downloadJson, readMachineExport } from '../persistence';
import { normalizePath, type VirtualFileSystem } from '../filesystem';
import type { AppId, DesktopSettings, FileMetadata, MachineConfig, MachineExport } from '../types';
import { MissionWorkspace } from '../../components/MissionWorkspace';

export type ApplicationProps = {
  filesystem: VirtualFileSystem;
  onFilesystemChange: () => void;
  machine: MachineConfig;
  settings: DesktopSettings;
  onSettingsChange: (settings: DesktopSettings) => void;
  onReset: () => void;
  onImportMachine: (machineExport: MachineExport) => void;
  openApp: (appId: AppId, payload?: string) => void;
  runningApps: AppId[];
  sessionStartedAt: number;
};

const fileType = (file: FileMetadata) => file.type === 'directory' ? 'Folder' : file.mime === 'text/markdown' ? 'Markdown' : file.mime.startsWith('text/') ? 'Text file' : 'File';
const fileIcon = (file: FileMetadata) => file.type === 'directory' ? 'folder' : file.mime.startsWith('text/') ? 'text' : 'file';
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const joinPath = (path: string, name: string) => path === '/' ? `/${name}` : `${path}/${name}`;

const ErrorMessage = ({ message }: { message: string }) => message ? <p className="webos-inline-error" role="alert">{message}</p> : null;

export const FileManagerApp = ({ filesystem, onFilesystemChange, openApp, initialPath }: ApplicationProps & { initialPath?: string }) => {
  const [currentPath, setCurrentPath] = useState(initialPath || '/');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'name' | 'type' | 'size' | 'modified'>('name');
  const [error, setError] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPath && filesystem.exists(initialPath)) setCurrentPath(initialPath);
  }, [filesystem, initialPath]);

  const entries = (() => {
    try {
      const result = query.trim() ? filesystem.search(query, currentPath) : filesystem.listDirectory(currentPath);
      return [...result].sort((left, right) => {
        if (left.type !== right.type) return left.type === 'directory' ? -1 : 1;
        if (sort === 'size') return right.size - left.size;
        if (sort === 'type') return fileType(left).localeCompare(fileType(right));
        if (sort === 'modified') return right.modifiedAt.localeCompare(left.modifiedAt);
        return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
      });
    } catch {
      return [];
    }
  })();

  const runAction = (action: () => void) => {
    try {
      setError('');
      action();
      onFilesystemChange();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'The filesystem operation failed.');
    }
  };

  const createFolder = () => {
    const name = window.prompt('Folder name', 'New folder')?.trim();
    if (name) runAction(() => filesystem.createDirectory(joinPath(currentPath, name)));
  };

  const createFile = () => {
    const name = window.prompt('File name', 'untitled.txt')?.trim();
    if (name) runAction(() => filesystem.createFile(joinPath(currentPath, name)));
  };

  const selected = selectedPath && filesystem.exists(selectedPath) ? filesystem.getMetadata(selectedPath) : null;
  const renameSelected = () => {
    if (!selected) return;
    const name = window.prompt('Rename item', selected.name)?.trim();
    if (name && name !== selected.name) runAction(() => filesystem.rename(selected.path, name));
  };

  const deleteSelected = () => {
    if (!selected) return;
    if (!window.confirm(`Move “${selected.name}” to Trash?`)) return;
    runAction(() => filesystem.delete(selected.path));
    setSelectedPath(null);
  };

  const restoreSelected = () => {
    if (selected) runAction(() => filesystem.restore(selected.path));
  };

  const downloadSelected = () => {
    if (!selected || selected.type !== 'file') return;
    const content = filesystem.readFile(selected.path);
    const url = URL.createObjectURL(new Blob([content], { type: selected.mime || 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = selected.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const content = await file.text();
      runAction(() => filesystem.createFile(joinPath(currentPath, file.name), content, file.type || 'text/plain'));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'The host file could not be imported.');
    }
  };

  const openEntry = (entry: FileMetadata) => {
    if (entry.type === 'directory') setCurrentPath(entry.path);
    else if (entry.mime.startsWith('text/') || entry.name.match(/\.(md|json|ts|tsx|js|jsx|css|html|py|sh)$/i)) openApp('editor', entry.path);
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);
  return (
    <div className="file-manager-app">
      <div className="app-toolbar file-toolbar">
        <div className="file-toolbar-nav"><button type="button" onClick={() => setCurrentPath((path) => { const parts = path.split('/').filter(Boolean); parts.pop(); return parts.length ? `/${parts.join('/')}` : '/'; })} title="Back"><ArrowLeft size={15} /></button><button type="button" onClick={() => setCurrentPath('/')} title="Home"><HardDrive size={15} /></button><span className="file-breadcrumb"><button type="button" onClick={() => setCurrentPath('/')}>Virtual disk</button>{breadcrumbs.map((part, index) => <span key={`${part}-${index}`}><ChevronRight size={12} /><button type="button" onClick={() => setCurrentPath(`/${breadcrumbs.slice(0, index + 1).join('/')}`)}>{part}</button></span>)}</span></div>
        <div className="file-toolbar-actions"><button type="button" onClick={createFolder} title="New folder"><FolderPlus size={15} /></button><button type="button" onClick={createFile} title="New file"><FilePlus2 size={15} /></button><button type="button" onClick={() => uploadRef.current?.click()} title="Import host file"><Upload size={15} /></button><input ref={uploadRef} type="file" hidden onChange={importFiles} /><button type="button" onClick={downloadSelected} disabled={!selected || selected.type === 'directory'} title="Download selected file"><CloudDownload size={15} /></button><button type="button" onClick={() => setCurrentPath('/Trash')} title="Open Trash"><Trash2 size={15} /></button></div>
      </div>
      <div className="file-subtoolbar"><label className="app-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this folder" /><kbd>⌘ F</kbd></label><div className="file-selection-actions"><button type="button" onClick={renameSelected} disabled={!selected}>Rename</button><button type="button" onClick={currentPath === '/Trash' ? restoreSelected : deleteSelected} disabled={!selected}>{currentPath === '/Trash' ? 'Restore' : 'Move to Trash'}</button><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="name">Name</option><option value="type">Type</option><option value="size">Size</option><option value="modified">Modified</option></select></label></div></div>
      <ErrorMessage message={error} />
      <div className="file-table-wrap"><table className="file-table"><thead><tr><th>Name</th><th>Kind</th><th>Size</th><th>Modified</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.path} className={selectedPath === entry.path ? 'selected' : ''} onClick={() => setSelectedPath(entry.path)} onDoubleClick={() => openEntry(entry)}><td><span className={`file-type-icon file-type-${fileIcon(entry)}`}>{entry.type === 'directory' ? '▰' : entry.mime.startsWith('text/') ? '▤' : '•'}</span>{entry.name}{entry.originalPath && <small className="file-trashed-label">TRASHED</small>}</td><td>{fileType(entry)}</td><td>{entry.type === 'directory' ? '—' : filesystem.formatBytes(entry.size)}</td><td>{formatDate(entry.modifiedAt)}</td></tr>)}{entries.length === 0 && <tr><td colSpan={4} className="file-empty"><FolderPlus size={24} /><p>{query ? 'No matching files.' : 'This folder is empty.'}</p><button type="button" onClick={createFile}>Create a file</button></td></tr>}</tbody></table></div>
      <footer className="file-statusbar"><span>{entries.length} item{entries.length === 1 ? '' : 's'}</span><span>{filesystem.formatBytes(filesystem.getStorageUsage().used)} used · isolated virtual disk</span></footer>
    </div>
  );
};

type TerminalLine = { type: 'input' | 'output' | 'error' | 'system'; text: string };
const terminalHelp = ['pwd  print current directory', 'ls   list files', 'cd   change directory', 'mkdir create a directory', 'touch create an empty file', 'cat  print a file', 'echo print text or redirect with >', 'cp / mv copy or move paths', 'rm / rmdir remove files or empty folders', 'find search the virtual disk', 'grep search text in a file', 'tree show a directory tree', 'df / free show simulated resource data', 'ps / kill show or stop simulated processes', 'clear clear the terminal', 'history show command history', 'neofetch show WebOS information'];

const tokenize = (line: string) => {
  const tokens: string[] = [];
  let token = '';
  let quote = '';
  for (const character of line.trim()) {
    if ((character === '"' || character === "'") && !quote) quote = character;
    else if (character === quote) quote = '';
    else if (/\s/.test(character) && !quote) {
      if (token) tokens.push(token);
      token = '';
    } else token += character;
  }
  if (token) tokens.push(token);
  return tokens;
};

const treeLines = (filesystem: VirtualFileSystem, path: string, indent = ''): string[] => {
  const lines: string[] = [];
  for (const entry of filesystem.listDirectory(path)) {
    lines.push(`${indent}${entry.type === 'directory' ? '▾' : '·'} ${entry.name}${entry.type === 'directory' ? '/' : ''}`);
    if (entry.type === 'directory') lines.push(...treeLines(filesystem, entry.path, `${indent}  `));
  }
  return lines;
};

export const TerminalApp = ({ filesystem, onFilesystemChange, machine }: ApplicationProps) => {
  const [cwd, setCwd] = useState('/');
  const [lines, setLines] = useState<TerminalLine[]>([{ type: 'system', text: `WebOS Terminal · ${machine.name}` }, { type: 'system', text: 'Commands run inside the virtual filesystem only. Type help for available commands.' }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [processes, setProcesses] = useState(['desktop-session', 'window-manager', 'filesystem-sync', 'terminal']);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [lines]);

  const print = (next: TerminalLine[]) => setLines((current) => [...current, ...next]);
  const execute = (rawCommand: string) => {
    const command = rawCommand.trim();
    if (!command) return;
    setHistory((current) => [...current, command]);
    setHistoryIndex(-1);
    const output: TerminalLine[] = [{ type: 'input', text: `${cwd === '/' ? '/' : `~${cwd}`} $ ${command}` }];
    const redirection = command.match(/\s+(>>?)\s+(.+)$/);
    const commandPart = redirection ? command.slice(0, redirection.index ?? command.length).trim() : command;
    const redirectPath = redirection ? tokenize(redirection[2])[0] : undefined;
    const redirectMode = redirection?.[1];
    const args = tokenize(commandPart);
    const name = args.shift()?.toLowerCase() || '';
    const out = (text: string | string[]) => (Array.isArray(text) ? text : [text]).forEach((textLine) => output.push({ type: 'output', text: textLine }));
    const fail = (text: string) => output.push({ type: 'error', text });
    let changed = false;
    try {
      if (name === 'pwd') out(cwd);
      else if (name === 'help') out(terminalHelp);
      else if (name === 'clear') { setLines([]); return; }
      else if (name === 'whoami') out('webos-user');
      else if (name === 'date') out(new Date().toString());
      else if (name === 'uname') out('WebOS browser-kernel 1.0.0 virtual x86_64');
      else if (name === 'ls') {
        const target = args[0] ? normalizePath(args[0], cwd) : cwd;
        out(filesystem.listDirectory(target).map((entry) => `${entry.name}${entry.type === 'directory' ? '/' : ''}`));
      } else if (name === 'cd') {
        const target = normalizePath(args[0] || '/', cwd);
        if (filesystem.getMetadata(target).type !== 'directory') fail(`cd: not a directory: ${args[0]}`);
        else setCwd(target);
      } else if (name === 'mkdir') {
        if (!args.length) fail('mkdir: missing operand');
        else {
          const parents = args.includes('-p');
          args.filter((arg) => arg !== '-p').forEach((arg) => {
            const target = normalizePath(arg, cwd);
            if (parents) {
              const parts = target.split('/').filter(Boolean);
              let current = '';
              parts.forEach((part) => { current += `/${part}`; if (!filesystem.exists(current)) filesystem.createDirectory(current); });
            } else filesystem.createDirectory(target);
            changed = true;
          });
        }
      } else if (name === 'touch') {
        if (!args.length) fail('touch: missing file operand');
        args.forEach((arg) => { const path = normalizePath(arg, cwd); if (!filesystem.exists(path)) filesystem.createFile(path); changed = true; });
      } else if (name === 'cat') {
        if (!args.length) fail('cat: missing file operand');
        args.forEach((arg) => out(filesystem.readFile(arg, cwd).split('\n')));
      } else if (name === 'echo') {
        const text = args.join(' ');
        if (redirectPath) {
          const path = normalizePath(redirectPath, cwd);
          if (filesystem.exists(path)) filesystem.writeFile(path, redirectMode === '>>' ? `${filesystem.readFile(path)}${text}` : text);
          else filesystem.createFile(path, text);
          changed = true;
        } else out(text);
      } else if (name === 'cp' || name === 'mv') {
        if (args.length < 2) fail(`${name}: source and destination are required`);
        else { (name === 'cp' ? filesystem.copy : filesystem.move)(normalizePath(args[0], cwd), normalizePath(args[1], cwd)); changed = true; }
      } else if (name === 'rm') {
        const paths = args.filter((arg) => arg !== '-r' && arg !== '-f');
        if (!paths.length) fail('rm: missing operand');
        paths.forEach((arg) => { filesystem.delete(normalizePath(arg, cwd)); changed = true; });
      } else if (name === 'rmdir') {
        if (!args.length) fail('rmdir: missing operand');
        args.forEach((arg) => { const path = normalizePath(arg, cwd); if (filesystem.listDirectory(path).length) throw new Error(`rmdir: directory not empty: ${arg}`); filesystem.delete(path); changed = true; });
      } else if (name === 'find') {
        const firstPath = args[0] && !args[0].startsWith('-') ? normalizePath(args[0], cwd) : cwd;
        const target = args[0] && filesystem.exists(firstPath) ? firstPath : cwd;
        const nameIndex = args.indexOf('-name');
        const pattern = nameIndex >= 0 ? args[nameIndex + 1] || '' : target === cwd ? args[0] || '' : '';
        out(filesystem.search(pattern.replaceAll('*', ''), target).filter((entry) => entry.path !== target).map((entry) => entry.path));
      } else if (name === 'grep') {
        if (args.length < 2) fail('grep: pattern and file are required');
        else out(filesystem.readFile(args[1], cwd).split('\n').filter((line) => line.toLowerCase().includes(args[0].toLowerCase())));
      } else if (name === 'tree') out([cwd === '/' ? '/' : cwd, ...treeLines(filesystem, cwd)]);
      else if (name === 'df') { const usage = filesystem.getStorageUsage(); out(`virtual-disk  ${filesystem.formatBytes(usage.used)} used / ${filesystem.formatBytes(usage.limit)} total`); }
      else if (name === 'free') out(['              total       used       free', `virtual RAM   4.0 GB      1.3 GB      2.7 GB`, `simulated CPU  ${Math.round(18 + Math.random() * 44)}%`]);
      else if (name === 'ps') out(['PID  STATUS  PROCESS', ...processes.map((process, index) => `${String(index + 1).padStart(3, '0')}  RUNNING ${process}`)]);
      else if (name === 'kill') { const target = args[0]; if (!target) fail('kill: process id required'); else { setProcesses((current) => current.filter((_, index) => String(index + 1) !== target)); out(`process ${target} stopped (simulated)`); } }
      else if (name === 'neofetch') out(['        _       WebOS', '   __  / \      browser-native desktop', '  / / / _ \     OS: simulated', ' /_/ /_/ \_\    Kernel: virtual 1.0', `                 Shell: WebOS Terminal`, `                 Disk: ${filesystem.formatBytes(filesystem.getStorageUsage().used)} used`]);
      else fail(`${name}: command not found. Type help for supported commands.`);
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Command failed.');
    }
    print(output);
    if (changed) onFilesystemChange();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { execute(input); setInput(''); }
    if (event.key === 'ArrowUp') { event.preventDefault(); const next = history[Math.max(0, history.length - 1 - Math.max(0, historyIndex + 1))] || ''; setHistoryIndex((index) => Math.min(history.length - 1, index + 1)); setInput(next); }
    if (event.key === 'ArrowDown') { event.preventDefault(); const nextIndex = Math.max(-1, historyIndex - 1); setHistoryIndex(nextIndex); setInput(nextIndex < 0 ? '' : history[history.length - 1 - nextIndex] || ''); }
    if (event.key === 'Tab') { event.preventDefault(); const matches = filesystem.listDirectory(cwd).map((entry) => entry.name).filter((name) => name.startsWith(input)); if (matches.length === 1) setInput(matches[0]); }
  };

  return <div className="terminal-app"><div className="terminal-header"><span className="terminal-led" /> webos-terminal <span className="terminal-path">{cwd}</span><button type="button" onClick={() => setLines([])} title="Clear terminal"><Trash2 size={13} /></button></div><div className="terminal-output" onClick={() => document.querySelector<HTMLInputElement>('.terminal-input')?.focus()}>{lines.map((line, index) => <p key={`${index}-${line.text}`} className={`terminal-line terminal-line-${line.type}`}>{line.text}</p>)}<div ref={endRef} /></div><div className="terminal-prompt"><span>{cwd === '/' ? '~' : cwd} $</span><input className="terminal-input" autoFocus value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} aria-label="Terminal command" /></div></div>;
};

const inferMime = (path: string) => {
  if (path.endsWith('.md')) return 'text/markdown';
  if (path.endsWith('.json')) return 'application/json';
  if (path.match(/\.(ts|tsx|js|jsx|css|html|py|sh)$/i)) return 'text/plain';
  return 'text/plain';
};

export const EditorApp = ({ filesystem, onFilesystemChange, openApp, initialPath }: ApplicationProps & { initialPath?: string }) => {
  const [path, setPath] = useState(initialPath || '/Documents/Readme.md');
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [error, setError] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  useEffect(() => {
    if (initialPath) setPath(initialPath);
  }, [initialPath]);

  useEffect(() => {
    try {
      const loaded = filesystem.readFile(path);
      setContent(loaded);
      setSavedContent(loaded);
      setError('');
    } catch (loadError) {
      setContent('');
      setSavedContent('');
      setError(loadError instanceof Error ? loadError.message : 'File could not be opened.');
    }
  }, [filesystem, path]);

  const save = () => {
    try {
      if (filesystem.exists(path)) filesystem.writeFile(path, content);
      else filesystem.createFile(path, content, inferMime(path));
      setSavedContent(content);
      setError('');
      onFilesystemChange();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'File could not be saved.');
    }
  };

  const replaceAll = () => {
    if (!find) return;
    setContent((current) => current.split(find).join(replace));
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([content], { type: inferMime(path) }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = path.split('/').pop() || 'untitled.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const onEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); setShowReplace(true); }
    if (event.key === 'Tab') { event.preventDefault(); const target = event.currentTarget; const start = target.selectionStart; const end = target.selectionEnd; setContent((current) => `${current.slice(0, start)}  ${current.slice(end)}`); window.setTimeout(() => { target.selectionStart = start + 2; target.selectionEnd = start + 2; }, 0); }
  };

  const lines = content.split('\n');
  return <div className="editor-app"><div className="editor-toolbar"><div className="editor-path"><FileCode2 size={15} /><input value={path} onChange={(event) => setPath(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /><span className={content !== savedContent ? 'editor-unsaved' : 'editor-saved'}>{content !== savedContent ? 'UNSAVED' : 'SAVED'}</span></div><div className="editor-actions"><button type="button" onClick={() => setShowReplace((value) => !value)} title="Find and replace"><Search size={14} /></button><button type="button" onClick={download} title="Download file"><CloudDownload size={14} /></button><button type="button" className="editor-save" onClick={save}><Save size={14} /> Save</button></div></div>{showReplace && <div className="editor-findbar"><Search size={13} /><input value={find} onChange={(event) => setFind(event.target.value)} placeholder="Find" /><input value={replace} onChange={(event) => setReplace(event.target.value)} placeholder="Replace with" /><button type="button" onClick={replaceAll}>Replace all</button><button type="button" onClick={() => setShowReplace(false)} aria-label="Close find bar"><X size={13} /></button></div>}<ErrorMessage message={error} /><div className="editor-body"><div className="editor-line-numbers">{lines.map((_, index) => <span key={index}>{index + 1}</span>)}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={onEditorKeyDown} spellCheck={false} aria-label="Text editor" /></div><footer className="editor-statusbar"><span>{path.split('.').pop()?.toUpperCase() || 'TEXT'} · {lines.length} lines</span><span>Ctrl/⌘ S to save</span></footer><div className="editor-quick-files"><span>OPEN RECENT</span>{['/Documents/Readme.md', '/Desktop/Welcome.txt', '/System/Kernel.info'].map((filePath) => <button type="button" key={filePath} onClick={() => setPath(filePath)}>{filePath.split('/').pop()}</button>)}<button type="button" onClick={() => openApp('file-manager')}><LayoutGrid size={12} /> Files</button></div></div>;
};

const calculateExpression = (expression: string) => {
  const tokens = expression.replaceAll('×', '*').replaceAll('÷', '/').match(/(?:\d*\.\d+|\d+\.?\d*)|[+\-*/()%]/g);
  if (!tokens || tokens.join('') !== expression.replaceAll(' ', '').replaceAll('×', '*').replaceAll('÷', '/')) throw new Error('Invalid expression');
  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const apply = () => {
    const operator = operators.pop();
    if (!operator || operator === '(') return;
    const right = values.pop();
    const left = values.pop();
    if (left === undefined || right === undefined) throw new Error('Invalid expression');
    if (operator === '+') values.push(left + right);
    if (operator === '-') values.push(left - right);
    if (operator === '*') values.push(left * right);
    if (operator === '/') values.push(right === 0 ? 0 : left / right);
  };
  tokens.forEach((token, index) => {
    if (!Number.isNaN(Number(token))) values.push(Number(token));
    else if (token === '(') operators.push(token);
    else if (token === ')') { while (operators.at(-1) !== '(' && operators.length) apply(); operators.pop(); }
    else if (token && Object.hasOwn(precedence, token)) { const tokenPrecedence = precedence[token]; if (token === '-' && (index === 0 || ['+', '-', '*', '/', '('].includes(tokens[index - 1] || ''))) values.push(0); while (operators.length) { const top = operators.at(-1); if (!top || top === '(' || precedence[top] < tokenPrecedence) break; apply(); } operators.push(token); }
  });
  while (operators.length) apply();
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error('Invalid expression');
  return Number(values[0].toFixed(10));
};

export const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<Array<{ expression: string; result: string }>>([]);
  const [expression, setExpression] = useState('');

  const press = (value: string) => {
    if (value === 'C') { setDisplay('0'); setExpression(''); return; }
    if (value === 'DEL') { setExpression((current) => current.slice(0, -1)); setDisplay((current) => current.length > 1 ? current.slice(0, -1) : '0'); return; }
    if (value === '%') {
      try {
        const result = String(calculateExpression(expression || display) / 100);
        setDisplay(result);
        setExpression(result);
      } catch {
        setDisplay('Error');
      }
      return;
    }
    if (value === '=') {
      try { const result = String(calculateExpression(expression || display)); setHistory((current) => [{ expression: expression || display, result }, ...current].slice(0, 8)); setDisplay(result); setExpression(result); } catch { setDisplay('Error'); }
      return;
    }
    const next = expression === '' && display !== '0' && !['+', '-', '*', '/', '.', '×', '÷'].includes(value) ? value : expression + value;
    setExpression(next);
    setDisplay(next || '0');
  };

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (/^[0-9+\-*/().]$/.test(event.key)) { event.preventDefault(); press(event.key); }
      if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); press('='); }
      if (event.key === 'Backspace') press('DEL');
      if (event.key.toLowerCase() === 'escape') press('C');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  const keys = ['C', 'DEL', '%', '/', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
  return <div className="calculator-app"><div className="calculator-display"><small>{expression || 'READY'}</small><strong>{display}</strong></div><div className="calculator-keypad">{keys.map((key) => <button type="button" key={key} onClick={() => press(key)} className={['/', '×', '-', '+', '='].includes(key) ? 'operator' : key === 'C' ? 'clear' : ''}>{key}</button>)}</div><div className="calculator-history"><span>HISTORY</span>{history.length ? history.map((item) => <button type="button" key={`${item.expression}-${item.result}`} onClick={() => { setExpression(item.result); setDisplay(item.result); }}><span>{item.expression}</span><b>{item.result}</b></button>) : <p>No calculations yet</p>}</div></div>;
};

type BrowserTab = { id: string; address: string; title: string };
const internalPages: Record<string, { title: string; eyebrow: string; body: string; links: Array<{ label: string; address: string }> }> = {
  'webos://home': { title: 'The browser inside your computer.', eyebrow: 'WEBOS START PAGE', body: 'This browser respects the web platform. Internal pages work here; sites that disallow embedding open in a new browser tab instead.', links: [{ label: 'About WebOS', address: 'webos://about' }, { label: 'Web standards', address: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' }] },
  'webos://about': { title: 'A simulated computer, honestly presented.', eyebrow: 'ABOUT THIS SESSION', body: 'Windows, macOS, and Linux experiences in WebOS are browser-native simulations. The virtual disk is isolated from your host computer, and terminal commands never execute on the host.', links: [{ label: 'Back to start', address: 'webos://home' }] },
};

export const BrowserApp = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([{ id: 'tab-1', address: 'webos://home', title: 'WebOS Start' }]);
  const [activeId, setActiveId] = useState('tab-1');
  const [address, setAddress] = useState('webos://home');
  const [history, setHistory] = useState<string[]>(['webos://home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const activeTab = tabs.find((tab) => tab.id === activeId) || tabs[0];
  const page = internalPages[activeTab.address];
  const navigate = (destination: string, addHistory = true) => {
    const next = destination.trim() || 'webos://home';
    if (!next.startsWith('webos://')) {
      const url = next.match(/^https?:\/\//) ? next : `https://${next}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setAddress(url);
      return;
    }
    setTabs((current) => current.map((tab) => tab.id === activeId ? { ...tab, address: next, title: internalPages[next]?.title || 'WebOS page' } : tab));
    setAddress(next);
    if (addHistory) { setHistory((current) => [...current.slice(0, historyIndex + 1), next]); setHistoryIndex((current) => current + 1); }
  };
  const newTab = () => { const id = `tab-${Date.now()}`; setTabs((current) => [...current, { id, address: 'webos://home', title: 'New tab' }]); setActiveId(id); setAddress('webos://home'); };
  const closeTab = (id: string) => { if (tabs.length === 1) return; const remaining = tabs.filter((tab) => tab.id !== id); setTabs(remaining); if (id === activeId) { const next = remaining.at(-1)!; setActiveId(next.id); setAddress(next.address); } };
  const goHistory = (delta: number) => { const index = Math.max(0, Math.min(history.length - 1, historyIndex + delta)); if (index === historyIndex) return; setHistoryIndex(index); navigate(history[index], false); };
  return <div className="browser-app"><div className="browser-tabs">{tabs.map((tab) => <button type="button" key={tab.id} className={tab.id === activeId ? 'active' : ''} onClick={() => { setActiveId(tab.id); setAddress(tab.address); }}><Globe2 size={12} /> {tab.title}<X size={12} onClick={(event) => { event.stopPropagation(); closeTab(tab.id); }} /></button>)}<button type="button" className="browser-new-tab" onClick={newTab}><Plus size={14} /></button></div><div className="browser-nav"><button type="button" onClick={() => goHistory(-1)} disabled={historyIndex === 0}><ArrowLeft size={14} /></button><button type="button" onClick={() => goHistory(1)} disabled={historyIndex >= history.length - 1}><ArrowRight size={14} /></button><button type="button" onClick={() => navigate(activeTab.address, false)}><RefreshCw size={13} /></button><label><Search size={13} /><input value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(address); }} /><span>⌘L</span></label><button type="button" onClick={() => window.open(activeTab.address.startsWith('http') ? activeTab.address : 'https://developer.mozilla.org/', '_blank', 'noopener,noreferrer')} title="Open in browser"><ExternalLink size={14} /></button></div><div className="browser-page">{page ? <div className="browser-home"><div className="browser-orb"><Globe2 size={25} /></div><p className="browser-eyebrow">{page.eyebrow}</p><h2>{page.title}</h2><p>{page.body}</p><div className="browser-links">{page.links.map((link) => <button type="button" key={link.address} onClick={() => navigate(link.address)}><span>{link.label}</span><ChevronRight size={14} /></button>)}</div><div className="browser-security"><span /> EMBEDDING POLICY HONORED · EXTERNAL SITES OPEN IN A NEW TAB</div></div> : <div className="browser-blocked"><Globe2 size={28} /><h2>External site opened safely</h2><p>This internal browser does not bypass cross-origin or iframe restrictions. Use the new browser tab to continue at <b>{activeTab.address}</b>.</p><button type="button" onClick={() => window.open(activeTab.address, '_blank', 'noopener,noreferrer')}>Open external page <ExternalLink size={14} /></button></div>}</div></div>;
};

export const NotesApp = ({ filesystem, onFilesystemChange }: ApplicationProps) => {
  const path = '/Documents/Notes.txt';
  const [content, setContent] = useState(() => filesystem.exists(path) ? filesystem.readFile(path) : '');
  const [saved, setSaved] = useState(content);
  const save = () => { if (filesystem.exists(path)) filesystem.writeFile(path, content); else filesystem.createFile(path, content); setSaved(content); onFilesystemChange(); };
  return <div className="notes-app"><div className="notes-header"><div><span className="notes-pin" /><strong>Notes</strong></div><span>{content !== saved ? 'Unsaved' : 'Saved locally'}</span></div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Start writing a note…" /><div className="notes-footer"><span>{content.length} characters</span><button type="button" onClick={save}><Save size={13} /> Save note</button></div></div>;
};

export const CalendarApp = () => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  return <div className="calendar-app"><div className="calendar-header"><div><span className="calendar-eyebrow">VIRTUAL CALENDAR</span><h2>{viewDate.toLocaleString(undefined, { month: 'long' })} <b>{year}</b></h2></div><div><button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}><ChevronLeft size={15} /></button><button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}><ChevronRight size={15} /></button></div></div><div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: firstDay }, (_, index) => <span className="calendar-day muted" key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => { const day = index + 1; const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear(); return <button type="button" key={day} className={isToday ? 'today' : ''}>{day}{isToday && <i />}</button>; })}</div><div className="calendar-note"><span className="calendar-dot" /> No synced accounts · local session calendar</div></div>;
};

export const MonitorApp = ({ filesystem, runningApps, sessionStartedAt }: ApplicationProps) => {
  const [cpu, setCpu] = useState(34);
  const [memory, setMemory] = useState(31);
  useEffect(() => {
    const timer = window.setInterval(() => { setCpu(20 + Math.round(Math.random() * 45)); setMemory(28 + Math.round(Math.random() * 10)); }, 1600);
    return () => window.clearInterval(timer);
  }, []);
  const storage = filesystem.getStorageUsage();
  const sessionMinutes = Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000));
  const processes = ['desktop-shell', 'window-manager', 'virtual-filesystem', ...runningApps.map((app) => getApp(app).shortTitle.toLowerCase())];
  return <div className="monitor-app"><div className="monitor-heading"><div><span className="app-eyebrow">VIRTUAL TELEMETRY</span><h2>System Monitor</h2></div><span className="monitor-simulated"><i /> SIMULATED METRICS</span></div><div className="monitor-metrics"><article><span>CPU</span><strong>{cpu}<small>%</small></strong><div><i style={{ width: `${cpu}%` }} /></div><small>Browser workload estimate</small></article><article><span>MEMORY</span><strong>{memory}<small>%</small></strong><div><i style={{ width: `${memory}%` }} /></div><small>Virtual allocation view</small></article><article><span>STORAGE</span><strong>{Math.round((storage.used / storage.limit) * 100)}<small>%</small></strong><div><i style={{ width: `${Math.min(100, (storage.used / storage.limit) * 100)}%` }} /></div><small>{filesystem.formatBytes(storage.used)} of {filesystem.formatBytes(storage.limit)}</small></article></div><div className="monitor-columns"><div><div className="monitor-section-title"><span>RUNNING PROCESSES</span><span>{processes.length}</span></div>{processes.map((process, index) => <div className="process-row" key={`${process}-${index}`}><span className="process-dot" /><span>{process}</span><small>{(3 + index * 2).toString().padStart(2, '0')}%</small></div>)}</div><div><div className="monitor-section-title"><span>SESSION</span><span>LOCAL</span></div><div className="monitor-session-card"><MonitorCog size={19} /><div><strong>{sessionMinutes} min</strong><span>Session duration</span></div></div><div className="monitor-session-card"><HardDrive size={19} /><div><strong>{filesystem.formatBytes(storage.available)}</strong><span>Virtual disk free</span></div></div></div></div></div>;
};

const wallpaperOptions: Array<{ id: DesktopSettings['wallpaper']; name: string; className: string }> = [
  { id: 'aurora', name: 'Aurora', className: 'wallpaper-preview-aurora' },
  { id: 'midnight', name: 'Midnight', className: 'wallpaper-preview-midnight' },
  { id: 'desert', name: 'Desert', className: 'wallpaper-preview-desert' },
  { id: 'graphite', name: 'Graphite', className: 'wallpaper-preview-graphite' },
];

export const SettingsApp = ({ machine, filesystem, settings, onSettingsChange, onReset, onImportMachine }: ApplicationProps) => {
  const [section, setSection] = useState<'appearance' | 'system' | 'storage'>('appearance');
  const importRef = useRef<HTMLInputElement>(null);
  const usage = filesystem.getStorageUsage();
  const update = (change: Partial<DesktopSettings>) => onSettingsChange({ ...settings, ...change });
  const importMachine = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try { onImportMachine(readMachineExport(await file.text())); } catch (error) { window.alert(error instanceof Error ? error.message : 'Import failed.'); }
  };
  const sections = [{ id: 'appearance' as const, label: 'Appearance', icon: LayoutGrid }, { id: 'system' as const, label: 'System', icon: Settings2 }, { id: 'storage' as const, label: 'Storage', icon: HardDrive }];
  return <div className="settings-app"><aside className="settings-sidebar"><div className="settings-title"><Settings2 size={17} /><span>Settings</span></div>{sections.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}><Icon size={15} />{label}</button>)}</aside><div className="settings-content">{section === 'appearance' && <><div className="settings-heading"><span className="app-eyebrow">PERSONALIZE</span><h2>Make it yours.</h2><p>These preferences belong to this virtual machine.</p></div><div className="settings-block"><label className="settings-label">WALLPAPER</label><div className="wallpaper-options">{wallpaperOptions.map((option) => <button type="button" key={option.id} className={settings.wallpaper === option.id ? 'active' : ''} onClick={() => update({ wallpaper: option.id })}><span className={option.className} /><span>{option.name}</span>{settings.wallpaper === option.id && <Check size={13} />}</button>)}</div></div><div className="settings-block"><label className="settings-label">THEME</label><div className="segmented-control">{(['dark', 'light', 'system'] as const).map((theme) => <button type="button" key={theme} className={settings.theme === theme ? 'active' : ''} onClick={() => update({ theme })}>{theme}</button>)}</div></div><div className="settings-block"><label className="settings-label">ACCENT COLOR</label><div className="accent-options">{['#65d8ff', '#a78bfa', '#fb7185', '#fbbf24', '#4ade80'].map((accent) => <button type="button" key={accent} aria-label={`Use ${accent} accent`} className={settings.accent === accent ? 'active' : ''} style={{ background: accent }} onClick={() => update({ accent })} />)}</div></div></>}{section === 'system' && <><div className="settings-heading"><span className="app-eyebrow">SYSTEM BEHAVIOR</span><h2>Session controls.</h2><p>{machine.name} is a browser-native simulation. It has no host shell access.</p></div><div className="settings-toggle-row"><div><strong>Detailed Linux boot messages</strong><span>Show the short terminal-inspired startup log.</span></div><button type="button" className={`toggle ${settings.detailedBoot ? 'on' : ''}`} onClick={() => update({ detailedBoot: !settings.detailedBoot })}><i /></button></div><div className="settings-toggle-row"><div><strong>24-hour clock</strong><span>Use a 24-hour clock in the desktop chrome.</span></div><button type="button" className={`toggle ${settings.clock24Hour ? 'on' : ''}`} onClick={() => update({ clock24Hour: !settings.clock24Hour })}><i /></button></div><div className="settings-toggle-row"><div><strong>Interface sounds</strong><span>Reserved for future local sound cues.</span></div><button type="button" className={`toggle ${settings.soundEnabled ? 'on' : ''}`} onClick={() => update({ soundEnabled: !settings.soundEnabled })}><i /></button></div><div className="settings-danger-zone"><div><strong>Reset virtual computer</strong><span>Restore the starter filesystem and settings. This cannot be undone.</span></div><button type="button" onClick={() => { if (window.confirm('Reset this virtual computer and erase its files?')) onReset(); }}><RotateCcw size={13} /> Reset</button></div></>}{section === 'storage' && <><div className="settings-heading"><span className="app-eyebrow">LOCAL DISK</span><h2>Storage & portability.</h2><p>{machine.storageMode === 'persistent' ? 'This machine is saved in IndexedDB on this browser.' : 'Temporary mode stays in memory and is cleared when this session ends.'}</p></div><div className="storage-meter"><div><span>USED</span><strong>{filesystem.formatBytes(usage.used)}</strong></div><div><span>AVAILABLE</span><strong>{filesystem.formatBytes(usage.available)}</strong></div><div><span>LIMIT</span><strong>{filesystem.formatBytes(usage.limit)}</strong></div><div className="storage-meter-bar"><i style={{ width: `${Math.min(100, usage.used / usage.limit * 100)}%` }} /></div></div><div className="settings-portability"><div><strong>Export machine data</strong><span>Download files, settings, and supported configuration as JSON.</span></div><button type="button" onClick={() => downloadJson(`${machine.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'webos-machine'}.webos.json`, buildMachineExport(machine, settings, filesystem))}><CloudDownload size={13} /> Export</button><div><strong>Import machine data</strong><span>Validate and restore a compatible WebOS export.</span></div><button type="button" onClick={() => importRef.current?.click()}><Upload size={13} /> Import</button><input ref={importRef} type="file" accept=".json,.webos.json,application/json" hidden onChange={importMachine} /></div></>}</div></div>;
};

export const StoreApp = ({ openApp }: ApplicationProps) => {
  const [query, setQuery] = useState('');
  const apps = APP_REGISTRY.filter((app) => app.title.toLowerCase().includes(query.toLowerCase()));
  return <div className="store-app"><div className="store-hero"><div><span className="app-eyebrow">WEBOS SOFTWARE CENTER</span><h2>Tools for your virtual desk.</h2><p>Everything here runs inside the browser sandbox and shares one isolated filesystem.</p></div><div className="store-count"><strong>{APP_REGISTRY.length}</strong><span>available apps</span></div></div><label className="app-search store-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" /></label><div className="store-grid">{apps.map((app) => <article key={app.id} className="store-card"><div className="store-card-icon"><AppIcon appId={app.id} size={20} /></div><div><h3>{app.title}</h3><p>{app.description}</p><span>{app.category}</span></div><button type="button" onClick={() => openApp(app.id)}><Play size={12} /> Open</button></article>)}</div></div>;
};

export const ResearchApp = () => <div className="webos-research-app"><MissionWorkspace /></div>;
