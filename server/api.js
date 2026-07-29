// NPOS API Server — Phase 1 Unified Data Layer
// SQLite-backed session/build-sheets/logs + knowledge index + search + WebSocket
// Run alongside `npm run dev` in /Web
// Usage: npm start (or node --watch api.js)
// Requires ANTHROPIC_API_KEY env var for AI features
// Config: loads npos.config.json from project root (paths, port, AI, analyzer)

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createDataLayer } from './data-layer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ──────── CONFIG ────────

function loadNposConfig() {
  const configPath = join(PROJECT_ROOT, 'npos.config.json');
  const defaults = {
    paths: {
      data: './Data',
      sessions: './Data/sessions',
      sessionFile: './Data/session.json',
      buildSheets: './Data/build-sheets',
      knowledge: './Knowledge',
      framework: './Framework',
      producerKnowledge: './Producer-Knowledge',
      presets: './Presets',
      caseStudies: './Case-Studies',
      sessionManagement: './Session-Management',
      templates: './Templates',
      troubleshooting: './Troubleshooting',
      references: './References',
      database: './Data/npos.sqlite',
    },
    server: { port: 3099, host: 'localhost' },
    ai: { provider: 'anthropic', model: 'claude-sonnet-4-20250514', maxTokens: 300 },
    audioAnalyzer: { binPath: '', timeoutMs: 30000 },
    ableton: { mcpPackage: '@xiaolaa2/ableton-copilot-mcp' },
  };
  try {
    if (!existsSync(configPath)) {
      console.warn(`[NPOS] npos.config.json not found at ${configPath} — using defaults`);
      return defaults;
    }
    const parsed = JSON.parse(readFileSync(configPath, 'utf8'));
    return {
      ...defaults,
      ...parsed,
      paths: { ...defaults.paths, ...(parsed.paths || {}) },
      server: { ...defaults.server, ...(parsed.server || {}) },
      ai: { ...defaults.ai, ...(parsed.ai || {}) },
      audioAnalyzer: { ...defaults.audioAnalyzer, ...(parsed.audioAnalyzer || {}) },
      ableton: { ...defaults.ableton, ...(parsed.ableton || {}) },
    };
  } catch (err) {
    console.error(`[NPOS] Failed to load config:`, err.message);
    return defaults;
  }
}

function resolvePath(p) {
  if (!p) return '';
  if (isAbsolute(p)) return p;
  return resolve(PROJECT_ROOT, p);
}

const cfg = loadNposConfig();
const DATA = resolvePath(cfg.paths.data);
const SESSIONS_DIR = resolvePath(cfg.paths.sessions || join(cfg.paths.data, 'sessions'));
const BUILD_SHEETS_DIR = resolvePath(cfg.paths.buildSheets || join(cfg.paths.data, 'build-sheets'));
const SESSION_FILE = resolvePath(cfg.paths.sessionFile || join(cfg.paths.data, 'session.json'));
const DB_PATH = resolvePath(cfg.paths.database || join(cfg.paths.data, 'npos.sqlite'));
const PORT = Number(process.env.NPORT || process.env.PORT || cfg.server.port || 3099);
const HOST = cfg.server.host || 'localhost';
const AI_MODEL = process.env.NPOS_AI_MODEL || cfg.ai.model || 'claude-sonnet-4-20250514';
const AI_MAX_TOKENS = Number(cfg.ai.maxTokens || 300);
const ANALYZER_BIN =
  process.env.AUDIO_ANALYZER_BIN ||
  cfg.audioAnalyzer.binPath ||
  '';
const ANALYZER_TIMEOUT = Number(cfg.audioAnalyzer.timeoutMs || 30000);
const ABLETON_MCP = cfg.ableton?.mcpPackage || '@xiaolaa2/ableton-copilot-mcp';

// Resolved paths bag for data layer
const paths = {
  data: DATA,
  sessions: SESSIONS_DIR,
  sessionFile: SESSION_FILE,
  buildSheets: BUILD_SHEETS_DIR,
  knowledge: resolvePath(cfg.paths.knowledge),
  framework: resolvePath(cfg.paths.framework),
  producerKnowledge: resolvePath(cfg.paths.producerKnowledge),
  presets: resolvePath(cfg.paths.presets),
  caseStudies: resolvePath(cfg.paths.caseStudies),
  sessionManagement: resolvePath(cfg.paths.sessionManagement),
  templates: resolvePath(cfg.paths.templates),
  troubleshooting: resolvePath(cfg.paths.troubleshooting),
  references: resolvePath(cfg.paths.references),
};

// ──────── WEBSOCKET BROADCAST ────────

/** @type {Set<import('ws').WebSocket>} */
const wsClients = new Set();

function broadcast(event) {
  const msg = JSON.stringify(event);
  for (const client of wsClients) {
    if (client.readyState === 1) {
      try {
        client.send(msg);
      } catch {
        /* ignore dead sockets */
      }
    }
  }
}

// ──────── DATA LAYER ────────

const layer = createDataLayer({
  dbPath: DB_PATH,
  paths,
  projectRoot: PROJECT_ROOT,
  onChange: (evt) => {
    broadcast({ channel: 'npos', ...evt });
  },
});

// Auto-migrate JSON → SQLite on first boot (no-op if already migrated)
try {
  const mig = layer.migrateFromJson({ force: false });
  if (mig.skipped) {
    console.log(`[NPOS] SQLite already migrated (${mig.at})`);
  } else {
    console.log(`[NPOS] Migrated JSON → SQLite:`, mig.report);
  }
} catch (err) {
  console.error('[NPOS] Migration on boot failed:', err.message);
}

// ──────── EXPRESS ────────

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ──────── HEALTH ────────

app.get('/api/health', (_req, res) => {
  let stats = null;
  try {
    stats = layer.getStats();
  } catch {
    /* ignore */
  }
  res.json({
    status: 'ok',
    live: true,
    port: PORT,
    data: DATA,
    database: DB_PATH,
    phase: 1,
    websocket: true,
    stats,
  });
});

// ──────── SESSION DATA (via data layer) ────────

app.get('/api/session', (_req, res) => {
  try {
    const session = layer.getSession();
    if (!session || !session.projects || Object.keys(session.projects).length === 0) {
      // empty is still valid — return structure
      return res.json(session || { $schema: 'session', version: 1, currentProject: null, projects: {} });
    }
    res.json(session);
  } catch (err) {
    console.error('GET /api/session:', err.message);
    res.status(500).json({ error: 'Failed to load session' });
  }
});

app.post('/api/session', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'session body required' });
    }
    const result = layer.saveSession(req.body, { syncDashboard: true, syncJsonFile: true });
    res.json(result);
  } catch (err) {
    console.error('POST /api/session:', err.message);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// ──────── BUILD SHEETS ────────

app.get('/api/build-sheets', (_req, res) => {
  try {
    res.json(layer.listBuildSheets());
  } catch (err) {
    console.error('GET /api/build-sheets:', err.message);
    res.status(500).json({ error: 'Failed to list build sheets' });
  }
});

app.get('/api/build-sheets/:id', (req, res) => {
  try {
    const sheet = layer.getBuildSheet(req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Not found' });
    res.json(sheet);
  } catch (err) {
    console.error('GET /api/build-sheets/:id:', err.message);
    res.status(500).json({ error: 'Failed to load build sheet' });
  }
});

app.post('/api/build-sheets', (req, res) => {
  try {
    const { id, ...data } = req.body || {};
    const result = layer.saveBuildSheet(id, data);
    res.json(result);
  } catch (err) {
    console.error('POST /api/build-sheets:', err.message);
    res.status(500).json({ error: 'Failed to save build sheet' });
  }
});

// ──────── SESSION LOGS ────────

app.get('/api/logs', (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 500);
    res.json(layer.listLogs(limit));
  } catch (err) {
    console.error('GET /api/logs:', err.message);
    res.status(500).json({ error: 'Failed to list logs' });
  }
});

app.post('/api/logs', (req, res) => {
  try {
    const { id, ...data } = req.body || {};
    const result = layer.saveLog(id, data);
    res.json(result);
  } catch (err) {
    console.error('POST /api/logs:', err.message);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

// ──────── PRESETS ────────

app.get('/api/presets', (_req, res) => {
  try {
    res.json(layer.listPresets());
  } catch (err) {
    console.error('GET /api/presets:', err.message);
    res.status(500).json({ error: 'Failed to list presets' });
  }
});

app.post('/api/presets', (req, res) => {
  try {
    const { id, ...data } = req.body || {};
    res.json(layer.savePreset(id, data));
  } catch (err) {
    console.error('POST /api/presets:', err.message);
    res.status(500).json({ error: 'Failed to save preset' });
  }
});

// ──────── KNOWLEDGE INDEX (P1.5) ────────

app.get('/api/knowledge-index', (req, res) => {
  try {
    const category = req.query.category || undefined;
    const reindex = req.query.reindex === '1' || req.query.reindex === 'true';
    if (reindex) layer.reindexKnowledge();
    res.json(layer.getKnowledgeIndex({ category }));
  } catch (err) {
    console.error('GET /api/knowledge-index:', err.message);
    res.status(500).json({ error: 'Failed to load knowledge index' });
  }
});

app.get('/api/knowledge/:id(*)', (req, res) => {
  try {
    const id = req.params.id;
    const doc = layer.getKnowledgeDoc(id);
    if (!doc) return res.status(404).json({ error: 'Knowledge doc not found', id });
    res.json(doc);
  } catch (err) {
    console.error('GET /api/knowledge/:id:', err.message);
    res.status(500).json({ error: 'Failed to load knowledge doc' });
  }
});

app.post('/api/knowledge/reindex', (_req, res) => {
  try {
    res.json(layer.reindexKnowledge());
  } catch (err) {
    console.error('POST /api/knowledge/reindex:', err.message);
    res.status(500).json({ error: 'Failed to reindex knowledge' });
  }
});

// ──────── UNIFIED SEARCH (P1.8) ────────

app.get('/api/search', (req, res) => {
  try {
    const q = req.query.q || req.query.query || '';
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    let types = null;
    if (req.query.types) {
      types = String(req.query.types)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    res.json(layer.searchAll(q, { limit, types }));
  } catch (err) {
    console.error('GET /api/search:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ──────── DASHBOARD SYNC (P1.6) ────────

app.get('/api/dashboard', (_req, res) => {
  try {
    const path = layer.dashboardPath();
    res.json({
      path,
      exists: existsSync(path),
      session: layer.getSession(),
    });
  } catch (err) {
    console.error('GET /api/dashboard:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.post('/api/dashboard/push', (_req, res) => {
  try {
    // session store → Dashboard.md
    const result = layer.writeDashboardFromSession(layer.getSession());
    res.json(result);
  } catch (err) {
    console.error('POST /api/dashboard/push:', err.message);
    res.status(500).json({ error: 'Failed to push dashboard' });
  }
});

app.post('/api/dashboard/pull', (_req, res) => {
  try {
    // Dashboard.md → session store
    const result = layer.pullDashboardIntoSession();
    res.json(result);
  } catch (err) {
    console.error('POST /api/dashboard/pull:', err.message);
    res.status(500).json({ error: 'Failed to pull dashboard' });
  }
});

// ──────── STATS / MIGRATE ────────

app.get('/api/stats', (_req, res) => {
  try {
    res.json(layer.getStats());
  } catch (err) {
    console.error('GET /api/stats:', err.message);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

app.post('/api/migrate', (req, res) => {
  try {
    const force = !!(req.body && req.body.force);
    res.json(layer.migrateFromJson({ force }));
  } catch (err) {
    console.error('POST /api/migrate:', err.message);
    res.status(500).json({ error: 'Migration failed' });
  }
});

// ──────── AI ASSISTANT ────────

app.post('/api/ai-next-step', async (req, res) => {
  const { project, problem, stage, goal, notes } = req.body || {};

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'ANTHROPIC_API_KEY not set',
      hint: 'Add it to your env vars: $env:ANTHROPIC_API_KEY = "sk-ant-..."',
    });
  }

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: `You are a neurofunk production mentor. Be concise and actionable.
The user gives you their project context. Respond with ONE specific next step.
Format:
STEP: <one action>
WHY: <why this matters now>
HOW: <how to do it in 1-2 sentences>`,
      messages: [{
        role: 'user',
        content: `Current project: ${project || 'Unknown'}
Production stage: ${stage || 'Unknown'} (${goal || 'No goal set'})
Current problem: ${problem || 'None'}
Recent notes: ${notes?.join('; ') || 'None'}

What should I do next?`,
      }],
    });

    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    res.json({ step: text });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────── AUDIO ANALYSIS ────────

function callAnalyzer(tool, args) {
  return new Promise((resolvePromise, reject) => {
    if (!ANALYZER_BIN) {
      return reject(new Error(
        'Audio analyzer not configured. Set audioAnalyzer.binPath in npos.config.json or AUDIO_ANALYZER_BIN env var.'
      ));
    }
    if (!existsSync(ANALYZER_BIN)) {
      return reject(new Error(`Analyzer binary not found: ${ANALYZER_BIN}`));
    }

    const proc = spawn(ANALYZER_BIN, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill();
      reject(new Error(`Analyzer timed out after ${ANALYZER_TIMEOUT}ms`));
    }, ANALYZER_TIMEOUT);

    const done = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      proc.kill();
      fn();
    };

    proc.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('{')) continue;
        let msg;
        try { msg = JSON.parse(trimmed); } catch { continue; }
        if (msg.id === 1) {
          done(() => {
            if (msg.error) return reject(new Error(msg.error.message || 'Analyzer error'));
            resolvePromise(msg.result);
          });
          return;
        }
      }
    });

    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', (err) => done(() => reject(err)));
    proc.on('close', () => done(() => reject(new Error(stderr || 'Analyzer exited with no response'))));

    const init = JSON.stringify({
      jsonrpc: '2.0', id: 0, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'npos', version: '1.0.0' } }
    });
    const initialized = JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' });
    const call = JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: tool, arguments: args }
    });

    proc.stdin.write(init + '\n');
    proc.stdin.write(initialized + '\n');
    proc.stdin.write(call + '\n');
  });
}

app.post('/api/analyze', async (req, res) => {
  const { filePath, tool = 'full_analysis', resolution = 'low' } = req.body || {};
  if (!filePath) return res.status(400).json({ error: 'filePath required' });

  // Security: constrain filePath to project root
  const resolved = resolvePath(filePath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    console.error(`[SECURITY] Blocked path traversal attempt: ${filePath}`);
    return res.status(403).json({ error: 'Access denied: path must be within project root' });
  }
  if (!existsSync(resolved)) return res.status(404).json({ error: 'File not found' });

  try {
    const result = await callAnalyzer(tool, { path: resolved, resolution });
    const content = result?.content?.[0]?.text;
    let data = content;
    if (content) {
      try { data = JSON.parse(content); } catch { data = { text: content }; }
    }
    res.json({ ok: true, data });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// ──────── ABLETON BRIDGE ────────

let _mcpClient = null;

async function initMcp() {
  if (_mcpClient) return _mcpClient;
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', ABLETON_MCP],
  });

  const client = new Client({ name: 'npos-bridge', version: '0.1.0' });
  await client.connect(transport);
  _mcpClient = { client, transport };
  return _mcpClient;
}

async function callAbletonTool(tool, args = {}) {
  const { client } = await initMcp();
  const result = await client.callTool({ name: tool, arguments: args });
  return result.content?.[0]?.text || JSON.stringify(result);
}

function wrapAbleton(tool, reqMapper = (b) => b, resMapper = (r) => r) {
  return async (req, res) => {
    try {
      const args = reqMapper(Object.keys(req.body || {}).length ? req.body : req.query || {});
      const raw = await callAbletonTool(tool, args);
      res.json({ ok: true, data: resMapper(raw) });
    } catch (err) {
      console.error(`Ableton error [${tool}]:`, err.message);
      res.status(500).json({ error: err.message, hint: 'Is Ableton Live running with AbletonJS control surface enabled?' });
    }
  };
}

app.get('/api/ableton/song', wrapAbleton('get_song_info'));
app.post('/api/ableton/play', wrapAbleton('start_playback'));
app.post('/api/ableton/stop', wrapAbleton('stop_playback'));
app.post('/api/ableton/set-tempo', wrapAbleton('set_tempo', (b) => ({ bpm: b.tempo })));
app.get('/api/ableton/tracks', wrapAbleton('list_tracks'));
app.post('/api/ableton/tracks/create-midi', wrapAbleton('create_midi_track', (b) => ({ name: b.name })));
app.post('/api/ableton/tracks/create-audio', wrapAbleton('create_audio_track', (b) => ({ name: b.name })));
app.get('/api/ableton/clips', wrapAbleton('list_clips', (b) => ({ track_index: b.trackIndex })));
app.post('/api/ableton/clips/create', wrapAbleton('create_clip', (b) => ({ track_index: b.trackIndex, name: b.name, length: b.length || 4 })));
app.get('/api/ableton/scale', wrapAbleton('get_scale_info'));
app.post('/api/ableton/tracks/duplicate', wrapAbleton('duplicate_track', (b) => ({ track_index: b.trackIndex })));
app.post('/api/ableton/tracks/delete', wrapAbleton('delete_track', (b) => ({ track_index: b.trackIndex })));

// ──────── HTTP + WEBSOCKET SERVER ────────

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  wsClients.add(socket);
  try {
    socket.send(JSON.stringify({
      channel: 'npos',
      type: 'hello',
      payload: { stats: layer.getStats() },
      at: new Date().toISOString(),
    }));
  } catch {
    /* ignore */
  }

  socket.on('message', (raw) => {
    // optional client ping / subscribe
    try {
      const msg = JSON.parse(String(raw));
      if (msg?.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', at: new Date().toISOString() }));
      }
      if (msg?.type === 'get-session') {
        socket.send(JSON.stringify({
          channel: 'npos',
          type: 'session',
          payload: layer.getSession(),
          at: new Date().toISOString(),
        }));
      }
    } catch {
      /* ignore bad frames */
    }
  });

  socket.on('close', () => {
    wsClients.delete(socket);
  });
});

function shutdown() {
  console.log('\n[NPOS] Shutting down…');
  try { layer.close(); } catch { /* ignore */ }
  wss.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, HOST === 'localhost' ? undefined : HOST, () => {
  console.log(`\n  NPOS API Server (Phase 1) running at http://${HOST}:${PORT}`);
  console.log(`  WebSocket:     ws://${HOST}:${PORT}/ws`);
  console.log(`  Project root:  ${PROJECT_ROOT}`);
  console.log(`  Data dir:      ${DATA}`);
  console.log(`  Database:      ${DB_PATH}`);
  console.log(`  AI model:      ${AI_MODEL}`);
  console.log(`  Analyzer:      ${ANALYZER_BIN || '(not configured)'}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/session          POST /api/session`);
  console.log(`    GET  /api/build-sheets     POST /api/build-sheets`);
  console.log(`    GET  /api/logs             POST /api/logs`);
  console.log(`    GET  /api/presets          POST /api/presets`);
  console.log(`    GET  /api/knowledge-index  GET  /api/knowledge/:id`);
  console.log(`    GET  /api/search?q=`);
  console.log(`    GET  /api/dashboard        POST /api/dashboard/push|pull`);
  console.log(`    GET  /api/stats            POST /api/migrate`);
  console.log(`    POST /api/ai-next-step     POST /api/analyze`);
  console.log(`    *    /api/ableton/*`);
  console.log(`    WS   /ws\n`);
});

export { app, layer, server };
