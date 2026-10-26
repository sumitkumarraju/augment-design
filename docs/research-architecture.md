# AUGMENT research architecture

## User-visible contract

1. A user enters a mission and optional URLs.
2. AUGMENT searches public source adapters and reads provided URLs.
3. Every returned finding links to a source; failed sources remain visible with an error state.
4. A partial provider outage still produces a brief when another provider returns evidence.
5. No external action is executed automatically.

## Runtime flow

```text
MissionWorkspace
  -> runResearch(query, urls, AbortSignal)
      -> input validation + URL normalization
      -> source adapters (Wikipedia, OpenAlex, provided URL reader)
      -> normalized ResearchSource records
      -> extractive brief composer with sourceIds
  -> cited brief + source statuses + next actions
```

The UI owns interaction state. `src/lib/researchService.ts` owns provider calls and normalization. This keeps provider failures out of rendering code and makes adapters replaceable with a server-side queue later.

## Reliability rules

- Every request has a timeout, retry budget, and cancellation signal.
- A 4xx response fails fast; transient failures retry twice.
- URL input is normalized and limited to five provided sources per run.
- Provider failures degrade to an empty provider result instead of fabricating evidence.
- A brief is only marked ready after the source records are normalized.
- `localStorage` stores case history only; it never stores credentials or raw source payloads.

## Production evolution

The current browser adapters are a working MVP boundary. For production deployment, move `runResearch` behind an authenticated API/worker that owns provider credentials, rate limits, SSRF protection for URL ingestion, durable run events, caching, and a database-backed case record. Keep the `ResearchSource`, `ResearchBrief`, and progress event contracts stable so the UI does not change when the backend moves.

## Provider configuration

`VITE_RESEARCH_READER_URL` can point to a first-party URL extraction endpoint. Without it, the MVP uses the public Jina reader as a browser-compatible fallback. A first-party endpoint should return readable text and replace the fallback before high-volume use.
