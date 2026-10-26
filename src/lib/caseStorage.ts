import type { ResearchBrief } from './researchService';

export const CASES_STORAGE_KEY = 'augment-cases';
export const CASES_CHANGED_EVENT = 'augment-cases-changed';

export type SavedCase = {
  id: string;
  mission: string;
  brief: ResearchBrief;
  savedAt: string;
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const announceChange = () => window.dispatchEvent(new Event(CASES_CHANGED_EVENT));

export const readSavedCases = (): SavedCase[] => {
  if (typeof window === 'undefined') return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CASES_STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is SavedCase => Boolean(item && typeof item === 'object' && 'brief' in item && 'savedAt' in item))
      .map((item, index) => ({ ...item, id: item.id || `legacy-${item.savedAt}-${index}`, mission: item.mission || item.brief.query }));
  } catch {
    return [];
  }
};

export const saveCase = (brief: ResearchBrief, existingId?: string): SavedCase => {
  const savedCase: SavedCase = { id: existingId || createId(), mission: brief.query, brief, savedAt: new Date().toISOString() };
  const current = readSavedCases().filter((item) => item.id !== savedCase.id);
  window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify([savedCase, ...current].slice(0, 20)));
  announceChange();
  return savedCase;
};

export const deleteCase = (id: string) => {
  window.localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(readSavedCases().filter((item) => item.id !== id)));
  announceChange();
};

export const storageIsAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    const key = '__augment_storage_test__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const downloadCase = (savedCase: SavedCase) => {
  const { brief } = savedCase;
  const markdown = [
    `# ${brief.query}`,
    '',
    `Generated: ${new Date(brief.searchedAt).toLocaleString()}`,
    '',
    '## Summary',
    brief.summary,
    '',
    '## Findings',
    ...brief.findings.map((finding, index) => `${index + 1}. ${finding.text}`),
    '',
    '## Next actions',
    ...brief.actions.map((action) => `- ${action}`),
    '',
    '## Sources',
    ...brief.sources.map((source) => `- [${source.title}](${source.url}) — ${source.status}${source.error ? `: ${source.error}` : ''}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${brief.query.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'augment-case'}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
};
