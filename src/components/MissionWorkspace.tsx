import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Link2,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  normalizeUrl,
  runResearch,
  type ResearchBrief,
  type ResearchProgress,
  type ResearchSource,
} from '../lib/researchService';
import { saveCase as persistCase, type SavedCase } from '../lib/caseStorage';

type Mode = 'VISION' | 'NEURAL' | 'MOTION';
type RunState = 'idle' | 'running' | 'complete' | 'error';

const modes: Array<{ id: Mode; title: string; description: string }> = [
  { id: 'VISION', title: 'Research', description: 'Extract facts and compare sources.' },
  { id: 'NEURAL', title: 'Reason', description: 'Connect context and surface tradeoffs.' },
  { id: 'MOTION', title: 'Execute', description: 'Turn conclusions into next actions.' },
];

const demoSources = ['https://developer.mozilla.org/en-US/docs/Web/HTTP', 'https://www.w3.org/standards/webdesign/'];

const getSourceTitle = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'NEW SOURCE';
  }
};

const newInputSource = (url: string): ResearchSource => ({
  id: `input-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  url,
  title: getSourceTitle(url),
  domain: getSourceTitle(url),
  excerpt: '',
  kind: 'provided',
  status: 'queued',
});

type MissionWorkspaceProps = { loadedCase?: SavedCase | null };

export const MissionWorkspace = ({ loadedCase = null }: MissionWorkspaceProps) => {
  const [mission, setMission] = useState(loadedCase?.brief.query || '');
  const [sourceInput, setSourceInput] = useState('');
  const [sources, setSources] = useState<ResearchSource[]>(loadedCase?.brief.sources.filter((source) => source.kind === 'provided') || []);
  const [mode, setMode] = useState<Mode>('VISION');
  const [runState, setRunState] = useState<RunState>(loadedCase ? 'complete' : 'idle');
  const [progress, setProgress] = useState<ResearchProgress>(loadedCase ? { stage: 'composing', progress: 100, message: 'SAVED CASE LOADED' } : { stage: 'calibrating', progress: 0, message: 'AWAITING MISSION' });
  const [result, setResult] = useState<ResearchBrief | null>(loadedCase?.brief || null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [saved, setSaved] = useState(Boolean(loadedCase));
  const [inputError, setInputError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  const canRun = mission.trim().length > 8 && runState !== 'running';
  const progressLabel = useMemo(() => {
    if (runState === 'error') return 'RESEARCH STOPPED';
    return progress.message;
  }, [progress.message, runState]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const addSource = () => {
    try {
      const url = normalizeUrl(sourceInput);
      if (sources.some((source) => source.url === url)) {
        setInputError('This source is already attached.');
        return;
      }
      if (sources.length >= 5) {
        setInputError('Add up to five provided sources per mission.');
        return;
      }
      setSources((current) => [...current, newInputSource(url)]);
      setSourceInput('');
      setInputError('');
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Enter a valid HTTP or HTTPS URL.');
    }
  };

  const loadDemo = () => {
    setMission('Compare the most reliable web platform standards for a new product workflow.');
    setSources(demoSources.map(newInputSource));
    setMode('VISION');
    setResult(null);
    setRunState('idle');
    setProgress({ stage: 'calibrating', progress: 0, message: 'AWAITING MISSION' });
    setSaved(false);
    setErrorMessage('');
  };

  const resetMission = () => {
    controllerRef.current?.abort();
    setMission('');
    setSourceInput('');
    setSources([]);
    setResult(null);
    setRunState('idle');
    setProgress({ stage: 'calibrating', progress: 0, message: 'AWAITING MISSION' });
    setCompletedActions([]);
    setSaved(false);
    setInputError('');
    setErrorMessage('');
  };

  const runMission = async () => {
    if (!canRun) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setRunState('running');
    setResult(null);
    setSaved(false);
    setErrorMessage('');
    setProgress({ stage: 'calibrating', progress: 8, message: 'CALIBRATING MISSION' });

    try {
      const brief = await runResearch(mission, sources.map((source) => source.url), controller.signal, setProgress, mode);
      setResult(brief);
      setSources(brief.sources.filter((source) => source.kind === 'provided'));
      setRunState('complete');
    } catch (error) {
      if (controller.signal.aborted) return;
      setErrorMessage(error instanceof Error ? error.message : 'The research run could not be completed.');
      setRunState('error');
    }
  };

  const toggleAction = (index: number) => {
    setCompletedActions((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  };

  const saveCase = () => {
    if (!result) return;
    persistCase(result, loadedCase?.id);
    setSaved(true);
  };

  const cancelRun = () => {
    controllerRef.current?.abort();
    setRunState('idle');
    setProgress({ stage: 'calibrating', progress: 0, message: 'RESEARCH CANCELLED' });
  };

  return (
    <section id="workspace" className="mission-workspace-light bg-[#080808] text-white py-24 px-5 sm:px-8 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(127,29,29,0.22), transparent 30%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.05), transparent 28%)' }} />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-gray-500 mb-5"><span className="w-8 h-px bg-red-700" />00 / WORKSPACE</div>
            <h2 className="text-4xl md:text-6xl tracking-[-0.05em] font-medium max-w-2xl leading-[0.98]">START WITH A<br /><span className="text-gray-500">MISSION.</span></h2>
            <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed mt-6">Give AUGMENT a question, a decision, or a messy idea. Build a brief you can trust, then move it forward.</p>
          </div>
          <button type="button" onClick={loadDemo} className="self-start lg:self-end text-[10px] tracking-widest uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2"><Sparkles size={14} className="text-red-400" /> Load sample mission</button>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] gap-6 items-start">
          <div className="border border-white/10 bg-black/40 p-5 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6"><div className="flex items-center gap-3"><div className="w-8 h-8 border border-red-400/30 flex items-center justify-center"><Search size={15} className="text-red-300" /></div><div><p className="text-xs tracking-widest">MISSION BUILDER</p><p className="text-[10px] text-gray-600 tracking-widest mt-1">LIVE SOURCES / CITED OUTPUT</p></div></div><span className="text-[9px] tracking-widest text-gray-600">SOURCE PIPELINE</span></div>

            <label htmlFor="mission" className="block text-[10px] tracking-widest text-gray-500 mb-3">WHAT ARE YOU TRYING TO MOVE FORWARD?</label>
            <textarea id="mission" value={mission} onChange={(event) => setMission(event.target.value)} placeholder="e.g. Compare the best stack for launching my research product..." rows={4} className="w-full resize-none bg-white/[0.04] border border-white/10 p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-red-400/60 transition-colors" />

            <div className="mt-6"><label htmlFor="source" className="block text-[10px] tracking-widest text-gray-500 mb-3">ADD CONTEXT / SOURCES</label><div className="flex gap-2"><div className="relative flex-1"><Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" /><input id="source" value={sourceInput} onChange={(event) => { setSourceInput(event.target.value); setInputError(''); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSource(); } }} placeholder="Paste a URL or source link" className="w-full bg-white/[0.04] border border-white/10 py-3 pl-10 pr-3 text-xs text-white placeholder:text-gray-700 outline-none focus:border-red-400/60 transition-colors" /><span className="sr-only" role="status">{inputError}</span></div><button type="button" onClick={addSource} aria-label="Add source" className="w-12 border border-white/10 flex items-center justify-center text-gray-400 hover:border-white/40 hover:text-white transition-colors"><Plus size={17} /></button></div>{inputError && <p className="text-[10px] text-red-500 mt-2" role="alert">{inputError}</p>}{sources.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{sources.map((source) => <span key={source.id} className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] text-gray-400"><FileText size={12} className={source.status === 'error' ? 'text-red-500' : 'text-red-300'} />{source.title}<button type="button" onClick={() => setSources((current) => current.filter((item) => item.id !== source.id))} aria-label={`Remove ${source.title}`}><X size={12} className="text-gray-600 hover:text-white" /></button></span>)}</div>}{sources.length === 0 && <p className="text-[10px] text-gray-700 mt-3">No sources added. AUGMENT will search public reference sources from your mission.</p>}</div>

            <div className="mt-8"><p className="text-[10px] tracking-widest text-gray-500 mb-3">CHOOSE AN OPERATING MODE</p><div className="grid sm:grid-cols-3 gap-2">{modes.map((item) => <button type="button" key={item.id} onClick={() => setMode(item.id)} className={`text-left p-3 border transition-all ${mode === item.id ? 'border-red-400/50 bg-red-950/20' : 'border-white/10 bg-white/[0.02] hover:border-white/30'}`}><span className={`block text-[10px] tracking-widest mb-2 ${mode === item.id ? 'text-red-300' : 'text-gray-400'}`}>{item.id}</span><span className="block text-xs text-white mb-1">{item.title}</span><span className="block text-[10px] leading-relaxed text-gray-600">{item.description}</span></button>)}</div></div>

             <div className="mt-8 flex flex-col sm:flex-row gap-3"><button type="button" onClick={runMission} disabled={!canRun} className="flex-1 inline-flex items-center justify-center gap-3 bg-white text-black py-4 text-xs font-bold tracking-widest uppercase disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-gray-600 hover:bg-gray-200 transition-colors">{runState === 'running' ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}{runState === 'running' ? 'Researching sources' : 'Run research'}</button>{runState === 'running' ? <button type="button" onClick={cancelRun} className="sm:w-32 border border-red-400/30 flex items-center justify-center py-3 text-[10px] tracking-widest text-red-300 hover:border-red-300/60 transition-colors">CANCEL</button> : <button type="button" onClick={resetMission} className="sm:w-14 border border-white/10 flex items-center justify-center py-3 text-gray-500 hover:text-white hover:border-white/30 transition-colors" aria-label="Reset mission"><RotateCcw size={16} /></button>}</div>
          </div>

          <div className="border border-white/10 bg-[#0d0d0d] min-h-[520px] relative overflow-hidden"><div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-red-500 via-white/30 to-transparent" /><div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-white/10"><div className="flex items-center gap-3"><BookOpen size={16} className="text-red-300" /><span className="text-xs tracking-widest">AUGMENT BRIEF</span></div><span className="flex items-center gap-2 text-[9px] tracking-widest text-gray-600"><span className={`w-1.5 h-1.5 rounded-full ${runState === 'complete' ? 'bg-green-400' : runState === 'running' ? 'bg-amber-300 animate-pulse' : runState === 'error' ? 'bg-red-500' : 'bg-gray-600'}`} />{runState === 'complete' ? 'READY' : runState === 'running' ? 'PROCESSING' : runState === 'error' ? 'NEEDS INPUT' : 'AWAITING INPUT'}</span></div>

            {runState === 'idle' && <div className="min-h-[440px] flex flex-col items-center justify-center text-center p-8"><div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-6"><ClipboardList size={24} className="text-gray-600" /></div><p className="text-sm text-gray-400 mb-2">Your cited brief will appear here.</p><p className="text-xs text-gray-600 max-w-xs leading-relaxed">AUGMENT searches Wikipedia and OpenAlex, then reads any URLs you attach.</p><div className="mt-8 flex items-center gap-2 text-[9px] tracking-widest text-gray-700"><span className="w-6 h-px bg-white/10" /> SOURCE-GROUNDED / HUMAN-APPROVED <span className="w-6 h-px bg-white/10" /></div></div>}
            {runState === 'running' && <div className="min-h-[440px] flex flex-col justify-center p-8"><div className="flex items-center gap-3 text-xs tracking-widest mb-8"><LoaderCircle size={18} className="text-red-300 animate-spin" />{progressLabel}</div><div className="h-1 bg-white/10 mb-3"><div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${progress.progress}%` }} /></div><div className="flex justify-between text-[9px] tracking-widest text-gray-600"><span>MISSION / {mode}</span><span>{progress.progress}%</span></div><div className="mt-12 grid grid-cols-3 gap-2">{['INGEST', 'VALIDATE', 'RETURN'].map((step, index) => <div key={step} className={`border p-3 text-[9px] tracking-widest ${progress.progress >= (index + 1) * 30 ? 'border-red-400/30 text-red-300' : 'border-white/10 text-gray-700'}`}>{step}</div>)}</div></div>}
            {runState === 'error' && <div className="min-h-[440px] flex flex-col items-center justify-center text-center p-8"><div className="w-16 h-16 border border-red-400/30 rounded-full flex items-center justify-center mb-6 text-red-400">!</div><p className="text-sm text-gray-300 mb-2">Research could not finish.</p><p className="text-xs text-gray-600 max-w-xs leading-relaxed">{errorMessage}</p><button type="button" onClick={runMission} className="mt-7 border border-white/15 px-4 py-3 text-[10px] tracking-widest text-gray-400 hover:text-white hover:border-white/40">TRY AGAIN</button></div>}

            {runState === 'complete' && result && <div className="p-5 sm:p-7"><div className="mb-7"><p className="text-[9px] tracking-widest text-red-300 mb-3">MISSION SUMMARY</p><p className="text-sm text-gray-300 leading-relaxed">{result.summary}</p><p className="text-[9px] text-gray-600 mt-3">RESEARCHED {new Date(result.searchedAt).toLocaleString()}</p>{result.warnings.length > 0 && <div className="mt-4 border border-amber-400/20 bg-amber-950/10 px-3 py-3 text-[10px] text-amber-200/70">PARTIAL RUN: {result.warnings.join(' ')}</div>}</div><div className="mb-7"><p className="text-[9px] tracking-widest text-gray-500 mb-3">KEY FINDINGS</p>{result.findings.length ? <div className="space-y-3">{result.findings.map((finding, index) => <div key={finding.sourceIds.join('-')} className="flex gap-3 text-xs text-gray-400 leading-relaxed"><span className="text-red-300 shrink-0">0{index + 1}</span><span>{finding.text}<span className="block text-[9px] text-red-300/80 mt-2">CITED: {finding.sourceIds.map((sourceId) => result.sources.find((source) => source.id === sourceId)?.title).filter(Boolean).join(', ')}</span></span></div>)}</div> : <p className="text-xs text-gray-600">No readable evidence was returned. Add a source URL and try again.</p>}</div><div className="border-t border-white/10 pt-6 mb-6"><p className="text-[9px] tracking-widest text-gray-500 mb-3">SOURCE TRAIL / {result.sources.length}</p><div className="space-y-2">{result.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id} className="flex items-center justify-between border border-white/10 px-3 py-2 text-[10px] text-gray-400 hover:text-white hover:border-white/30 transition-colors"><span className="flex items-center gap-2 min-w-0"><Link2 size={12} className={source.status === 'error' ? 'text-red-500 shrink-0' : 'text-red-300 shrink-0'} /><span className="truncate">{source.title}</span><span className="text-[9px] text-gray-600 shrink-0">{source.status === 'error' ? 'UNREADABLE' : source.kind.toUpperCase()}</span></span><ExternalLink size={12} className="shrink-0" /></a>)}</div></div><div className="border-t border-white/10 pt-6"><div className="flex items-center justify-between mb-3"><p className="text-[9px] tracking-widest text-gray-500">NEXT ACTIONS</p><button type="button" onClick={saveCase} className="text-[9px] tracking-widest text-gray-500 hover:text-white flex items-center gap-2">{saved ? <CheckCircle2 size={13} className="text-green-400" /> : <Save size={13} />} {saved ? 'SAVED' : 'SAVE CASE'}</button></div><div className="space-y-2">{result.actions.map((action, index) => <button type="button" key={action} onClick={() => toggleAction(index)} className={`w-full flex items-center gap-3 text-left border px-3 py-3 text-xs transition-colors ${completedActions.includes(index) ? 'border-green-400/30 text-gray-600 line-through' : 'border-white/10 text-gray-300 hover:border-white/30'}`}><span className={`w-4 h-4 border flex items-center justify-center shrink-0 ${completedActions.includes(index) ? 'border-green-400/50 bg-green-400/10' : 'border-white/20'}`}>{completedActions.includes(index) && <Check size={11} className="text-green-400" />}</span>{action}</button>)}</div></div></div>}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-[9px] tracking-widest text-gray-700"><span>OUTPUTS ARE CITED AND REVIEWED BEFORE ACTION</span><span className="hidden sm:block">AUGMENT / CONTEXT OS / 0.2</span></div>
      </div>
    </section>
  );
};
