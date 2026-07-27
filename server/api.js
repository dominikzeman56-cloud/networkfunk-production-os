// NPOS API Server — AI assistant + file persistence
// Run alongside `npm run dev` in /web
// Usage: npm start (or node --watch api.js)
// Requires ANTHROPIC_API_KEY env var for AI features

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');
const PORT = process.env.NPORT || 3099;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ──────── HEALTH ────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', live: existsSync(join(DATA, 'session.json')) });
});

// ──────── SESSION DATA ────────

app.get('/api/session', (_req, res) => {
  const p = join(DATA, 'session.json');
  if (!existsSync(p)) return res.status(404).json({ error: 'No session' });
  res.json(JSON.parse(readFileSync(p, 'utf8')));
});

app.post('/api/session', (req, res) => {
  const p = join(DATA, 'session.json');
  writeFileSync(p, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

// ──────── BUILD SHEETS ────────

app.get('/api/build-sheets', (_req, res) => {
  const dir = join(DATA, 'build-sheets');
  if (!existsSync(dir)) return res.json([]);
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  const sheets = files.map(f => {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    return { id: f.replace('.json', ''), ...d };
  });
  res.json(sheets);
});

app.post('/api/build-sheets', (req, res) => {
  const dir = join(DATA, 'build-sheets');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const { id, ...data } = req.body;
  const slug = id || `sheet-${Date.now()}`;
  writeFileSync(join(dir, `${slug}.json`), JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2));
  res.json({ ok: true, id: slug });
});

// ──────── SESSION LOGS ────────

app.get('/api/logs', (_req, res) => {
  const dir = join(DATA, 'sessions');
  if (!existsSync(dir)) return res.json([]);
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, 20);
  const logs = files.map(f => {
    const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    return { id: f.replace('.json', ''), ...d };
  });
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const dir = join(DATA, 'sessions');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const { id, ...data } = req.body;
  const slug = id || `session-${Date.now()}`;
  writeFileSync(join(dir, `${slug}.json`), JSON.stringify({ ...data, createdAt: new Date().toISOString() }, null, 2));
  res.json({ ok: true, id: slug });
});

// ──────── AI ASSISTANT ────────

app.post('/api/ai-next-step', async (req, res) => {
  const { project, problem, stage, goal, notes } = req.body;

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
      model: 'claude-sonnet-5-20250610',
      max_tokens: 300,
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

import { spawn } from 'child_process';

const ANALYZER_BIN = 'C:/Users/domin/AppData/Local/audio-analyzer-mcp/server/mcp-server.exe';

function callAnalyzer(tool, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ANALYZER_BIN, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill();
      reject(new Error('Analyzer timed out after 30s'));
    }, 30000);

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
            resolve(msg.result);
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
  const { filePath, tool = 'full_analysis', resolution = 'low' } = req.body;
  if (!filePath) return res.status(400).json({ error: 'filePath required' });
  if (!existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    const result = await callAnalyzer(tool, { path: filePath, resolution });
    const content = result?.content?.[0]?.text;
    let data = content;
    if (content) {
      try { data = JSON.parse(content); } catch { data = { text: content }; }
    }
    res.json({ ok: true, data });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────── ABLETON BRIDGE ────────
// Spawns ableton-copilot-mcp to communicate with Ableton Live

let _mcpClient = null;

async function initMcp() {
  if (_mcpClient) return _mcpClient;
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@xiaolaa2/ableton-copilot-mcp'],
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

// Song info
app.get('/api/ableton/song', wrapAbleton('get_song_info'));

// Transport
app.post('/api/ableton/play', wrapAbleton('start_playback'));
app.post('/api/ableton/stop', wrapAbleton('stop_playback'));
app.post('/api/ableton/set-tempo', wrapAbleton('set_tempo', (b) => ({ bpm: b.tempo })));

// Tracks
app.get('/api/ableton/tracks', wrapAbleton('list_tracks'));
app.post('/api/ableton/tracks/create-midi', wrapAbleton('create_midi_track', (b) => ({ name: b.name })));
app.post('/api/ableton/tracks/create-audio', wrapAbleton('create_audio_track', (b) => ({ name: b.name })));

// Clips
app.get('/api/ableton/clips', wrapAbleton('list_clips', (b) => ({ track_index: b.trackIndex })));
app.post('/api/ableton/clips/create', wrapAbleton('create_clip', (b) => ({ track_index: b.trackIndex, name: b.name, length: b.length || 4 })));

// Scales / key
app.get('/api/ableton/scale', wrapAbleton('get_scale_info'));

// Duplicate
app.post('/api/ableton/tracks/duplicate', wrapAbleton('duplicate_track', (b) => ({ track_index: b.trackIndex })));

// Delete
app.post('/api/ableton/tracks/delete', wrapAbleton('delete_track', (b) => ({ track_index: b.trackIndex })));

// ──────── START ────────

app.listen(PORT, () => {
  console.log(`\n  NPOS API Server running at http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/session`);
  console.log(`    POST /api/session`);
  console.log(`    GET  /api/build-sheets`);
  console.log(`    POST /api/build-sheets`);
  console.log(`    GET  /api/logs`);
  console.log(`    POST /api/logs`);
  console.log(`    POST /api/ai-next-step  (requires ANTHROPIC_API_KEY)\n`);
});
