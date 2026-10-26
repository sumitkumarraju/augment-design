import { lazy, Suspense, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Bell, ChevronRight, Command, FileText, FolderKanban, LayoutGrid, Search, Settings2, Sparkles, Wifi } from 'lucide-react';
import { MissionWorkspace } from './MissionWorkspace';

const AugmentCore = lazy(() => import('./MacBookExperience').then((module) => ({ default: module.AugmentCore })));

type Panel = 'workspace' | 'cases' | 'system';

const sidebarItems: Array<{ id: Panel; label: string; icon: typeof LayoutGrid }> = [
  { id: 'workspace', label: 'Mission workspace', icon: LayoutGrid },
  { id: 'cases', label: 'Case records', icon: FolderKanban },
  { id: 'system', label: 'System status', icon: Settings2 },
];

export const MacBookSurface = () => {
  const [activePanel, setActivePanel] = useState<Panel>('workspace');
  const reducedMotion = useReducedMotion();

  return (
    <section id="module" className="os-page min-h-screen px-3 sm:px-6 lg:px-10 py-4 sm:py-8 lg:py-12">
      <motion.div
        className="macbook-surface"
        initial={{ opacity: 0, y: 30, rotateX: 3, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        whileHover={reducedMotion ? undefined : { y: -3 }}
      >
        <div className="macbook-surface-bar">
          <div className="macbook-traffic-lights"><span className="traffic-red" /><span className="traffic-yellow" /><span className="traffic-green" /></div>
          <div className="macbook-window-title"><Sparkles size={13} /> AUGMENT — Context OS</div>
          <div className="macbook-window-actions"><Wifi size={13} /><span className="hidden sm:inline">LOCAL SESSION</span><Bell size={13} /></div>
        </div>

        <div className="macbook-surface-screen">
          <div className="os-menubar">
            <div className="flex items-center gap-5"><span className="font-semibold text-slate-900">AUGMENT</span><span className="hidden sm:inline">File</span><span className="hidden sm:inline">Edit</span><span className="hidden sm:inline">View</span><span className="hidden sm:inline">Window</span><span className="hidden sm:inline">Help</span></div>
            <div className="flex items-center gap-4"><span className="hidden sm:inline">Mon 10:42 AM</span><Command size={14} /><span className="os-avatar">A</span></div>
          </div>

          <div className="os-layout">
            <aside className="os-sidebar">
              <div className="os-brand"><div className="os-brand-mark"><Sparkles size={15} /></div><div><p className="font-semibold text-slate-900">AUGMENT</p><p className="text-[10px] text-slate-500">Context OS</p></div></div>
              <div className="os-search"><Search size={14} /><span>Search workspace</span><kbd>⌘ K</kbd></div>
              <p className="os-side-label">WORKSPACE</p>
              <nav className="space-y-1">{sidebarItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setActivePanel(id)} className={`os-nav-item ${activePanel === id ? 'active' : ''}`}><Icon size={16} /><span>{label}</span>{activePanel === id && <ChevronRight size={14} className="ml-auto" />}</button>)}</nav>
              <div className="os-sidebar-spacer" />
              <div className="os-plan-card"><div className="flex items-center justify-between mb-3"><span className="text-[10px] font-semibold text-slate-700">CORE PLAN</span><span className="os-live-dot" /></div><p className="text-[11px] text-slate-500 leading-relaxed">Your local workspace is ready for its next mission.</p><div className="os-progress"><span /></div><p className="text-[9px] text-slate-400 mt-2">3 / 5 missions this month</p></div>
              <div className="os-user"><span className="os-avatar large">A</span><div className="min-w-0"><p className="text-xs font-medium text-slate-800 truncate">Alex Morgan</p><p className="text-[10px] text-slate-500 truncate">Personal workspace</p></div><Settings2 size={14} className="ml-auto text-slate-400" /></div>
            </aside>

            <main className="os-main">
              <div className="os-main-header"><div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">{activePanel === 'workspace' ? 'MISSION CONTROL' : activePanel === 'cases' ? 'CASE RECORDS' : 'SYSTEM STATUS'}</p><h1 className="text-2xl sm:text-3xl tracking-[-0.05em] font-semibold text-slate-900">{activePanel === 'workspace' ? 'Make the next move clear.' : activePanel === 'cases' ? 'Your working memory.' : 'Everything is in context.'}</h1></div><div className="os-main-status"><span className="os-live-dot" /> SYNCED</div></div>
              {activePanel === 'workspace' && <MissionWorkspace />}
              {activePanel === 'cases' && <CaseRecordsPanel />}
              {activePanel === 'system' && <SystemPanel />}
            </main>
          </div>
        </div>
        <div className="macbook-surface-base"><div className="surface-trackpad" /><span className="surface-base-line" /></div>
      </motion.div>
      <p className="text-center text-[10px] tracking-[0.18em] text-slate-400 uppercase mt-5">AUGMENT / A CALM INTERFACE FOR COMPLEX WORK</p>
    </section>
  );
};

const CaseRecordsPanel = () => (
  <div className="os-panel-grid">
    {[
      ['014', 'Product direction', '3 findings / 2 open actions', 'UPDATED 4M AGO'],
      ['027', 'Market research', '8 sources / 1 decision', 'UPDATED YESTERDAY'],
      ['041', 'Launch system', '5 actions / 92% complete', 'UPDATED 3D AGO'],
    ].map(([id, title, detail, updated]) => <div key={id} className="os-case-card"><div className="flex items-start justify-between"><span className="os-case-id">CASE {id}</span><FileText size={16} className="text-slate-400" /></div><h3 className="text-lg font-semibold text-slate-800 mt-8">{title}</h3><p className="text-xs text-slate-500 mt-2">{detail}</p><div className="flex items-center justify-between mt-8 text-[9px] tracking-widest text-slate-400"><span>{updated}</span><ChevronRight size={13} /></div></div>)}
  </div>
);

const SystemPanel = () => (
  <div className="os-system-panel">
    <div className="os-system-core"><div className="os-core-canvas"><Suspense fallback={<div className="w-full h-full animate-pulse bg-red-100/70" />}><AugmentCore /></Suspense></div><div><p className="text-[10px] tracking-widest text-slate-400">AUGMENT CORE</p><h2 className="text-2xl font-semibold text-slate-900 mt-2">Operating normally.</h2><p className="text-sm text-slate-500 mt-3 max-w-sm leading-relaxed">Your context layer is ready to collect, connect, and move work forward.</p></div></div>
    <div className="os-health-grid">{[['CONTEXT INDEX', '98.2%', 'green'], ['SOURCE LINK', 'STABLE', 'green'], ['ACTIVE MEMORY', '24 ITEMS', 'blue'], ['NEXT SYNC', 'NOW', 'purple']].map(([label, value, color]) => <div className="os-health-card" key={label}><span className={`health-icon ${color}`} /><p className="text-[10px] tracking-widest text-slate-400">{label}</p><p className="text-lg font-semibold text-slate-800 mt-3">{value}</p></div>)}</div>
  </div>
);
