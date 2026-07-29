# NPOS Phase 1 — API Contract (Frontend Handoff)

**Base URL:** `http://localhost:3099`  
**WebSocket:** `ws://localhost:3099/ws`  
**Owner:** Backend (Cline) — data layer + these endpoints  
**Consumer:** Frontend (Claude Code) — stop reading filesystem; fetch from API

---

## Breaking change for Web

Do **not** use `fs.readFileSync` on `Data/session.json` or vault markdown from Astro pages.  
All session/project/knowledge listing goes through HTTP below.

Config still lives in `npos.config.json` for ports only if needed client-side; data comes from API.

---

## Endpoints

### Health
```
GET /api/health
→ {
  status: "ok",
  live: true,
  port: 3099,
  data: "<abs path>",
  database: "<abs path to npos.sqlite>",
  phase: 1,
  websocket: true,
  stats: { projects, buildSheets, logs, presets, knowledge, currentProject, ... }
}
```

### Session (same shape as Data/session.json)
```
GET  /api/session
→ {
  $schema: "session",
  version: 1,
  currentProject: "neonlight-reflux",
  projects: {
    "neonlight-reflux": {
      name, artist, version, tempo, key, stage, stageIdx, totalStages, stages[],
      goal, problem, reference: { track, artist },
      sessionFocus, lastStep, nextStep,
      notes: [{ type, text }],
      priorities: [{ done, text }],
      createdAt, updatedAt
    }
  }
}

POST /api/session
body: full session object (same shape)
→ { ok: true, updatedAt: ISO }
```
Side effects on POST: writes SQLite + mirrors `Data/session.json` + regenerates root `Dashboard.md` + WS broadcast `{ type: "session", payload }`.

### Build sheets
```
GET  /api/build-sheets          → BuildSheet[]
GET  /api/build-sheets/:id      → BuildSheet | 404
POST /api/build-sheets
body: { id?: string, title?, projectId?, ...any }
→ { ok: true, id, sheet }
```

### Logs
```
GET  /api/logs?limit=20         → Log[]
POST /api/logs
body: { id?: string, title?, projectId?, ...any }
→ { ok: true, id }
```

### Presets
```
GET  /api/presets
POST /api/presets  body: { id?, name?, category?, source?, ... }
```

### Knowledge index (P1.5)
```
GET /api/knowledge-index
GET /api/knowledge-index?category=knowledge
GET /api/knowledge-index?reindex=1   // force re-scan vault md

→ {
  count: number,
  indexedAt: ISO | null,
  categories: string[],
  byCategory: { [category]: KnowledgeItem[] },
  items: KnowledgeItem[]
}

KnowledgeItem = {
  id: "knowledge/eq",          // category/slug
  path: "Knowledge/EQ.md",     // vault-relative
  category: "knowledge" | "framework" | "producer" | "presets" | "case-studies" | "session" | "templates" | "troubleshooting" | "references" | "ai",
  title: string,
  slug: string,
  summary: string,
  tags: string[],
  mtimeMs, sizeBytes, indexedAt
}

GET  /api/knowledge/:id        // id may contain slash, e.g. knowledge/eq
→ { ...KnowledgeItem, content: "<full markdown>" }

POST /api/knowledge/reindex
→ { ok: true, count, indexedAt }
```

### Unified search (P1.8)
```
GET /api/search?q=bass&limit=30&types=knowledge,project,log,build-sheet,preset
→ {
  query: string,
  count: number,           // returned
  totalMatched: number,
  results: [{
    type: "knowledge" | "project" | "log" | "build-sheet" | "preset",
    id, title, category, path, snippet, score
  }]
}
```

### Dashboard sync (P1.6)
```
GET  /api/dashboard
→ { path, exists, session }

POST /api/dashboard/push   // session store → Dashboard.md
→ { ok: true, path }

POST /api/dashboard/pull   // Dashboard.md → session store (+ session.json)
→ { ok: true, session, path }
```
Normal `POST /api/session` already pushes Dashboard.md. Use pull when user edited Obsidian Dashboard manually.

### Stats / migrate
```
GET  /api/stats
POST /api/migrate  body: { force?: boolean }
```

### Existing (unchanged)
```
POST /api/ai-next-step
POST /api/analyze
*    /api/ableton/*
```

---

## WebSocket (P1.7)

```
ws://localhost:3099/ws
```

**Server → client events** (JSON):
```json
{ "channel": "npos", "type": "hello" | "session" | "build-sheet" | "log" | "preset" | "knowledge-index" | "dashboard" | "migrate", "payload": ..., "at": "ISO" }
```

**Client → server:**
```json
{ "type": "ping" }           → { "type": "pong", "at": "..." }
{ "type": "get-session" }    → session event
```

Suggested frontend pattern:
```ts
const API = import.meta.env.PUBLIC_NPOS_API || 'http://localhost:3099';
const WS  = API.replace(/^http/, 'ws') + '/ws';

export async function getSession() {
  const r = await fetch(`${API}/api/session`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function connectNposWs(onEvent: (e: any) => void) {
  const ws = new WebSocket(WS);
  ws.onmessage = (ev) => {
    try { onEvent(JSON.parse(ev.data)); } catch {}
  };
  return ws;
}
```

On `type === 'session'`, refresh dashboard state from `payload` (full session object).

---

## CORS

Enabled for all origins in dev (`cors()`). Fine for localhost:4321 → :3099.

---

## Data ownership

| Data | Source of truth | Mirror |
|------|-----------------|--------|
| Session / projects | SQLite (`Data/npos.sqlite`) | `Data/session.json`, `Dashboard.md` |
| Build sheets / logs | SQLite | JSON files under `Data/` |
| Knowledge content | Obsidian markdown files | Indexed copy in SQLite (reindex to refresh) |

Frontend should treat API as sole read path. Never write SQLite or session.json from the browser.

---

## Quick smoke (after `cd Server && npm start`)

```bash
curl http://localhost:3099/api/health
curl http://localhost:3099/api/session
curl "http://localhost:3099/api/search?q=bass"
curl http://localhost:3099/api/knowledge-index
curl -X POST http://localhost:3099/api/dashboard/push
``
