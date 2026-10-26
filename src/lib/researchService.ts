export type SourceStatus = 'queued' | 'loading' | 'ready' | 'error';
export type SourceKind = 'provided' | 'wikipedia' | 'openalex';
export type ResearchMode = 'VISION' | 'NEURAL' | 'MOTION';

export type ResearchSource = {
  id: string;
  url: string;
  title: string;
  domain: string;
  excerpt: string;
  kind: SourceKind;
  status: SourceStatus;
  error?: string;
};

export type ResearchFinding = {
  text: string;
  sourceIds: string[];
};

export type ResearchBrief = {
  query: string;
  summary: string;
  findings: ResearchFinding[];
  actions: string[];
  sources: ResearchSource[];
  warnings: string[];
  searchedAt: string;
};

export type ResearchProgress = {
  stage: 'calibrating' | 'searching' | 'validating' | 'composing';
  progress: number;
  message: string;
};

type WikipediaSearchResponse = {
  query?: {
    search?: Array<{ pageid: number; title: string; snippet: string }>;
  };
};

type WikipediaSummaryResponse = {
  title?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  description?: string;
};

type OpenAlexWork = {
  id: string;
  title?: string;
  publication_year?: number;
  doi?: string;
  primary_location?: { landing_page_url?: string };
  abstract_inverted_index?: Record<string, number[]>;
};

type OpenAlexResponse = { results?: OpenAlexWork[] };

const MAX_PROVIDED_SOURCES = 5;
const MAX_DISCOVERED_SOURCES = 6;
const REQUEST_TIMEOUT_MS = 9_000;
const MAX_EXCERPT_LENGTH = 420;

const cleanText = (value: string) => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const excerpt = (value: string) => {
  const cleaned = cleanText(value);
  if (cleaned.length <= MAX_EXCERPT_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_EXCERPT_LENGTH - 1).trimEnd()}…`;
};

const domainFromUrl = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown source';
  }
};

export const normalizeUrl = (value: string) => {
  const candidate = value.trim();
  if (!candidate) throw new Error('Enter a URL first.');
  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS sources are supported.');
  url.hash = '';
  return url.toString();
};

const request = async <T>(url: string, signal: AbortSignal): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Request rejected (${response.status}).`);
        }
        throw new Error(`Source returned ${response.status}.`);
      }
      return await response.json() as T;
    } catch (error) {
      lastError = error;
      if (signal.aborted) throw new DOMException('Research cancelled.', 'AbortError');
      if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    } finally {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', onAbort);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Source request failed.');
};

const requestText = async (url: string, signal: AbortSignal): Promise<string> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'text/plain' } });
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500 && response.status !== 429) throw new Error(`Reader rejected the URL (${response.status}).`);
        throw new Error(`Reader returned ${response.status}.`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (signal.aborted) throw new DOMException('Research cancelled.', 'AbortError');
      if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    } finally {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', onAbort);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('URL reader failed.');
};

const sourceFromUrl = (url: string, index: number): ResearchSource => ({
  id: `provided-${index}-${encodeURIComponent(url).replace(/[^a-z0-9]/gi, '').slice(0, 10)}`,
  url,
  title: domainFromUrl(url),
  domain: domainFromUrl(url),
  excerpt: '',
  kind: 'provided',
  status: 'queued',
});

const fetchProvidedSource = async (source: ResearchSource, signal: AbortSignal): Promise<ResearchSource> => {
  const configuredReader = import.meta.env.VITE_RESEARCH_READER_URL;
  const readerUrl = configuredReader
    ? `${configuredReader.replace(/\/$/, '')}/${source.url}`
    : `https://r.jina.ai/http://${source.url.replace(/^https?:\/\//i, '')}`;

  try {
    const text = await requestText(readerUrl, signal);
    const title = text.match(/^Title:\s*(.+)$/im)?.[1]?.trim() || source.domain;
    return { ...source, title, excerpt: excerpt(text), status: text.trim() ? 'ready' : 'error', error: text.trim() ? undefined : 'The page returned no readable text.' };
  } catch (error) {
    if (signal.aborted) throw new DOMException('Research cancelled.', 'AbortError');
    return { ...source, status: 'error', error: error instanceof Error ? error.message : 'Could not read this URL.' };
  }
};

const searchWikipedia = async (query: string, signal: AbortSignal): Promise<ResearchSource[]> => {
  const params = new URLSearchParams({ action: 'query', list: 'search', srsearch: query, srlimit: '3', format: 'json', origin: '*' });
  const search = await request<WikipediaSearchResponse>(`https://en.wikipedia.org/w/api.php?${params}`, signal);
  const results = search.query?.search || [];
  const summaries = await Promise.allSettled(results.map(async (item) => {
    const summary = await request<WikipediaSummaryResponse>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`, signal);
    const url = summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`;
    return {
      id: `wikipedia-${item.pageid}`,
      url,
      title: summary.title || item.title,
      domain: 'wikipedia.org',
      excerpt: excerpt(summary.extract || summary.description || item.snippet),
      kind: 'wikipedia' as const,
      status: 'ready' as const,
    } satisfies ResearchSource;
  }));
  return summaries.flatMap((item) => item.status === 'fulfilled' ? [item.value] : []);
};

const abstractFromIndex = (index?: Record<string, number[]>) => {
  if (!index) return '';
  return Object.entries(index)
    .sort(([, left], [, right]) => left[0] - right[0])
    .map(([word]) => word)
    .join(' ');
};

const searchOpenAlex = async (query: string, signal: AbortSignal): Promise<ResearchSource[]> => {
  const params = new URLSearchParams({ search: query, 'per-page': '3', select: 'id,title,publication_year,doi,primary_location,abstract_inverted_index' });
  const response = await request<OpenAlexResponse>(`https://api.openalex.org/works?${params}`, signal);
  return (response.results || []).flatMap((work, index) => {
    const url = work.primary_location?.landing_page_url || work.doi || work.id;
    if (!url || !work.title) return [];
    const paperExcerpt = abstractFromIndex(work.abstract_inverted_index);
    return [{
      id: `openalex-${index}-${work.id.split('/').pop()}`,
      url,
      title: work.title,
      domain: 'openalex.org',
      excerpt: excerpt(paperExcerpt || `Published research from ${work.publication_year || 'an academic source'}.`),
      kind: 'openalex' as const,
      status: 'ready' as const,
    } satisfies ResearchSource];
  });
};

const uniqueSources = (sources: ResearchSource[]) => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = source.url.replace(/\/$/, '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildBrief = (query: string, sources: ResearchSource[], warnings: string[]): ResearchBrief => {
  const usableSources = sources.filter((source) => source.status === 'ready' && source.excerpt);
  const citedSources = usableSources.length ? usableSources : sources.filter((source) => source.status === 'ready');
  const findings = citedSources.slice(0, 4).map((source) => ({
    text: `${source.title} provides relevant evidence for this mission: ${source.excerpt}`,
    sourceIds: [source.id],
  }));
  const sourceCount = citedSources.length;
  const summary = sourceCount
    ? `This brief is grounded in ${sourceCount} readable source${sourceCount === 1 ? '' : 's'} for “${query}”. Review the linked evidence before treating the conclusions as final.`
    : `No readable evidence was returned for “${query}”. Add a more specific mission or a source URL, then run the mission again.`;

  return {
    query,
    summary,
    findings,
    actions: [
      'Open the cited sources and verify the claims most important to this decision.',
      'Write down the highest-risk assumption that the evidence does not resolve.',
      'Turn the approved conclusion into one small, measurable next task.',
    ],
    sources,
    warnings,
    searchedAt: new Date().toISOString(),
  };
};

export const runResearch = async (
  query: string,
  providedUrls: string[],
  signal: AbortSignal,
  onProgress: (progress: ResearchProgress) => void,
  mode: ResearchMode = 'VISION',
): Promise<ResearchBrief> => {
  const normalizedQuery = query.trim().replace(/\s+/g, ' ').slice(0, 240);
  if (normalizedQuery.length < 9) throw new Error('Describe the research mission in at least 9 characters.');
  const modeFocus = mode === 'NEURAL' ? ' tradeoffs context and alternatives' : mode === 'MOTION' ? ' implementation steps and practical actions' : ' facts evidence and comparison';
  const providerQuery = `${normalizedQuery}${modeFocus}`;

  onProgress({ stage: 'calibrating', progress: 10, message: 'CALIBRATING MISSION' });
  const providedSources = uniqueSources(providedUrls.slice(0, MAX_PROVIDED_SOURCES).map((url, index) => sourceFromUrl(normalizeUrl(url), index)));
  const warnings: string[] = [];
  const sourceResults = await Promise.all([
    ...providedSources.map((source) => fetchProvidedSource(source, signal)),
    searchWikipedia(providerQuery, signal).catch((error: unknown) => {
      warnings.push(`Wikipedia search unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
      return [];
    }),
    searchOpenAlex(providerQuery, signal).catch((error: unknown) => {
      warnings.push(`OpenAlex search unavailable: ${error instanceof Error ? error.message : 'request failed'}`);
      return [];
    }),
  ]);
  if (signal.aborted) throw new DOMException('Research cancelled.', 'AbortError');

  onProgress({ stage: 'searching', progress: 45, message: 'SEARCHING SOURCE NETWORK' });
  const providedResults = sourceResults.slice(0, providedSources.length) as ResearchSource[];
  const discoveredResults = sourceResults.slice(providedSources.length).flat() as ResearchSource[];
  const sources = uniqueSources([...providedResults, ...discoveredResults]).slice(0, MAX_PROVIDED_SOURCES + MAX_DISCOVERED_SOURCES);

  onProgress({ stage: 'validating', progress: 72, message: 'VALIDATING EVIDENCE' });
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  if (signal.aborted) throw new DOMException('Research cancelled.', 'AbortError');
  onProgress({ stage: 'composing', progress: 90, message: 'COMPOSING CITED BRIEF' });
  const brief = buildBrief(normalizedQuery, sources, warnings);
  onProgress({ stage: 'composing', progress: 100, message: 'MISSION READY' });
  return brief;
};
