import { lazy, Suspense, useEffect, useState } from 'react';
import { Bell, ChevronRight, Command, Download, FileText, FolderKanban, LayoutGrid, Search, Settings2, Sparkles, Trash2, Wifi, X } from 'lucide-react';
import { MissionWorkspace } from './MissionWorkspace';
import { CASES_CHANGED_EVENT, deleteCase, downloadCase, readSavedCases, storageIsAvailable, type SavedCase } from '../lib/caseStorage';

const AugmentCore = lazy(() => import('./MacBookExperience').then((module) => ({ default: module.AugmentCore })));

type Panel = 'workspace' | 'cases' | 'system';
const sidebarItems: Array<{ id: Panel; label: string; icon: typeof LayoutGrid }> = [
  { id: 'workspace', label: 'Mission workspace', icon: LayoutGrid },
  { id: 'cases', label: 'Case records', icon: FolderKanban },
  { id: 'system', label: 'System status', icon: Settings2 },
];

const useSavedCases = () => {
  const [cases, setCases] = useState<SavedCase[]>([]);
  useEffect(() => {
    const refresh = () => setCases(readSavedCases());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(CASES_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(CASES_CHANGED_EVENT, refresh);
    };
  }, []);
  return cases;
};

export const MacBookSurface = () => {
  const [activePanel, setActivePanel] = useState<Panel>('workspace');
  const [selectedCase, setSelectedCase] = useState<SavedCase | null>(null);
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const cases = useSavedCases();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openCase = (savedCase: SavedCase) => {
    setSelectedCase(savedCase);
    setWorkspaceRevision((current) => current + 1);
    setActivePanel('workspace');
    setSearchOpen(false);
  };

  const startNewMission = () => {
    setSelectedCase(null);
    setWorkspaceRevision((current) => current + 1);
    setActivePanel('workspace');
  };

  return (
    <section id="module" className="os-page min-h-screen px-3 sm:px-6 lg:px-10 py-4 sm:py-8 lg:py-12">
      <div className="macbook-surface">
        <div className="macbook-surface-bar">
          <div className="macbook-traffic-lights"><span className="traffic-red" /><span className="traffic-yellow" /><span className="traffic-green" /></div>
          <div className="macbook-window-title"><Sparkles size={13} /> AUGMENT — Context OS</div>
          <div className="macbook-window-actions"><button type="button" title="Open system status" onClick={() => setActivePanel('system')}><Wifi size={13} /></button><span className="hidden sm:inline">LOCAL SESSION</span><button type="button" title="Open case records" onClick={() => setActivePanel('cases')}><Bell size={13} /></button></div>
        </div>

        <div className="macbook-surface-screen">
          <div className="os-menubar">
            <div className="flex items-center gap-3 sm:gap-5"><button type="button" onClick={startNewMission} className="font-semibold text-slate-900">AUGMENT</button><button type="button" onClick={startNewMission} className="hidden sm:inline">File</button><button type="button" onClick={() => setActivePanel('cases')} className="hidden sm:inline">View cases</button><button type="button" onClick={() => setActivePanel('system')} className="hidden sm:inline">System</button></div>
            <div className="flex items-center gap-4"><span className="hidden sm:inline">LOCAL ONLY</span><Command size={14} /><button type="button" title="Open system status" onClick={() => setActivePanel('system')} className="os-avatar">A</button></div>
          </div>

          <div className="os-layout">
            <aside className="os-sidebar">
              <button type="button" onClick={startNewMission} className="os-brand text-left"><div className="os-brand-mark"><Sparkles size={15} /></div><div><p className="font-semibold text-slate-900">AUGMENT</p><p className="text-[10px] text-slate-500">Context OS</p></div></button>
              <button type="button" onClick={() => setSearchOpen(true)} className="os-search text-left"><Search size={14} /><span>Search workspace</span><kbd>⌘ K</kbd></button>
              <p className="os-side-label">WORKSPACE</p>
              <nav className="space-y-1">{sidebarItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setActivePanel(id)} className={`os-nav-item ${activePanel === id ? 'active' : ''}`}><Icon size={16} /><span>{label}</span>{activePanel === id && <ChevronRight size={14} className="ml-auto" />}</button>)}</nav>
              <div className="os-sidebar-spacer" />
              <div className="os-plan-card"><div className="flex items-center justify-between mb-3"><span className="text-[10px] font-semibold text-slate-700">LOCAL WORKSPACE</span><span className="os-live-dot" /></div><p className="text-[11px] text-slate-500 leading-relaxed">Your research stays in this browser until you export it.</p><div className="os-progress"><span style={{ width: `${Math.min(cases.length * 5, 100)}%` }} /></div><p className="text-[9px] text-slate-400 mt-2">{cases.length} saved {cases.length === 1 ? 'case' : 'cases'}</p></div>
              <button type="button" onClick={() => setActivePanel('system')} className="os-user text-left"><span className="os-avatar large">A</span><div className="min-w-0"><p className="text-xs font-medium text-slate-800 truncate">Local workspace</p><p className="text-[10px] text-slate-500 truncate">No account required</p></div><Settings2 size={14} className="ml-auto text-slate-400" /></button>
            </aside>

            <main className="os-main">
              <div className="os-main-header"><div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">{activePanel === 'workspace' ? 'MISSION CONTROL' : activePanel === 'cases' ? 'CASE RECORDS' : 'SYSTEM STATUS'}</p><h1 className="text-2xl sm:text-3xl tracking-[-0.05em] font-semibold text-slate-900">{activePanel === 'workspace' ? 'Make the next move clear.' : activePanel === 'cases' ? 'Your working memory.' : 'Everything is in context.'}</h1></div><div className="os-main-status"><span className="os-live-dot" /> {navigator.onLine ? 'ONLINE' : 'OFFLINE'}</div></div>
              {activePanel === 'workspace' && <MissionWorkspace key={`${selectedCase?.id || 'new-mission'}-${workspaceRevision}`} loadedCase={selectedCase} />}
              {activePanel === 'cases' && <CaseRecordsPanel cases={cases} onOpen={openCase} />}
              {activePanel === 'system' && <SystemPanel cases={cases} />}
            </main>
          </div>
        </div>
        <div className="macbook-surface-base"><div className="surface-trackpad" /><span className="surface-base-line" /></div>
      </div>
      <p className="text-center text-[10px] tracking-[0.18em] text-slate-400 uppercase mt-5">AUGMENT / A CALM INTERFACE FOR COMPLEX WORK</p>
      {searchOpen && <SearchOverlay query={query} setQuery={setQuery} cases={cases} onOpen={openCase} onClose={() => { setSearchOpen(false); setQuery(''); }} />}
    </section>
  );
};

const SearchOverlay = ({ query, setQuery, cases, onOpen, onClose }: { query: string; setQuery: (value: string) => void; cases: SavedCase[]; onOpen: (savedCase: SavedCase) => void; onClose: () => void }) => {
  const matches = cases.filter((item) => item.mission.toLowerCase().includes(query.toLowerCase()));
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/20 p-5 pt-[18vh]" onMouseDown={onClose}><div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center gap-3 border-b border-slate-200 pb-3"><Search size={18} className="text-slate-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }} placeholder="Search saved missions" className="flex-1 outline-none text-sm text-slate-800" /><button type="button" onClick={onClose} aria-label="Close search"><X size={17} className="text-slate-400" /></button></div><div className="max-h-72 overflow-auto pt-2">{matches.length ? matches.map((item) => <button type="button" key={item.id} onClick={() => onOpen(item)} className="w-full rounded-lg px-3 py-3 text-left hover:bg-slate-100"><span className="block text-sm text-slate-800 truncate">{item.mission}</span><span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-400">{item.brief.sources.length} sources · {new Date(item.savedAt).toLocaleDateString()}</span></button>) : <p className="px-3 py-6 text-center text-xs text-slate-400">No saved cases match this search.</p>}</div></div></div>;
};

const CaseRecordsPanel = ({ cases, onOpen }: { cases: SavedCase[]; onOpen: (savedCase: SavedCase) => void }) => (
  <div className="os-panel-grid">
    {cases.length === 0 && <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center"><FolderKanban size={28} className="mx-auto text-slate-300" /><p className="mt-4 text-sm text-slate-600">No saved cases yet.</p><p className="mt-2 text-xs text-slate-400">Run a mission and choose SAVE CASE to build your local working memory.</p></div>}
    {cases.map((savedCase) => <article key={savedCase.id} className="os-case-card"><div className="flex items-start justify-between"><span className="os-case-id">SAVED CASE</span><FileText size={16} className="text-slate-400" /></div><h3 className="text-lg font-semibold text-slate-800 mt-8 line-clamp-3">{savedCase.mission}</h3><p className="text-xs text-slate-500 mt-2">{savedCase.brief.findings.length} findings · {savedCase.brief.sources.length} sources</p><p className="text-[9px] tracking-widest text-slate-400 mt-5">SAVED {new Date(savedCase.savedAt).toLocaleDateString()}</p><div className="flex gap-2 mt-5"><button type="button" onClick={() => onOpen(savedCase)} className="flex-1 rounded border border-slate-300 px-3 py-2 text-[10px] tracking-widest text-slate-600 hover:border-slate-500">OPEN</button><button type="button" onClick={() => downloadCase(savedCase)} title="Export case" className="rounded border border-slate-200 px-3 py-2 text-slate-500 hover:border-slate-400"><Download size={13} /></button><button type="button" onClick={() => deleteCase(savedCase.id)} title="Delete case" className="rounded border border-red-100 px-3 py-2 text-red-400 hover:border-red-300"><Trash2 size={13} /></button></div></article>)}
  </div>
);

const SystemPanel = ({ cases }: { cases: SavedCase[] }) => {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => { const onlineChange = () => setOnline(true); const offlineChange = () => setOnline(false); window.addEventListener('online', onlineChange); window.addEventListener('offline', offlineChange); return () => { window.removeEventListener('online', onlineChange); window.removeEventListener('offline', offlineChange); }; }, []);
  const health = [
    ['NETWORK', online ? 'AVAILABLE' : 'OFFLINE', online ? 'green' : 'red'],
    ['LOCAL STORAGE', storageIsAvailable() ? 'AVAILABLE' : 'BLOCKED', storageIsAvailable() ? 'green' : 'red'],
    ['SAVED CASES', `${cases.length}`, 'blue'],
    ['URL READER', import.meta.env.VITE_RESEARCH_READER_URL ? 'CUSTOM' : 'JINA FALLBACK', 'purple'],
  ];
  return <div className="os-system-panel"><div className="os-system-core"><div className="os-core-canvas"><Suspense fallback={<div className="w-full h-full animate-pulse bg-red-100/70" />}><AugmentCore /></Suspense></div><div><p className="text-[10px] tracking-widest text-slate-400">AUGMENT CORE</p><h2 className="text-2xl font-semibold text-slate-900 mt-2">{online ? 'Ready for research.' : 'Offline mode.'}</h2><p className="text-sm text-slate-500 mt-3 max-w-sm leading-relaxed">Research providers need network access. Saved cases remain available locally.</p></div></div><div className="os-health-grid">{health.map(([label, value, color]) => <div className="os-health-card" key={label}><span className={`health-icon ${color}`} /><p className="text-[10px] tracking-widest text-slate-400">{label}</p><p className="text-lg font-semibold text-slate-800 mt-3">{value}</p></div>)}</div></div>;
};
