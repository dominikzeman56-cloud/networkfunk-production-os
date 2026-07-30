/**
 * NPOS Unified Data Layer (Phase 1)
 * Dual-backend: SQLite (default) or JSON file-based (fallback for testing).
 * Backend selected via opts.backend ('sqlite' | 'json') or DATA_LAYER_BACKEND env.
 *
 * Usage:
 *   import { createDataLayer } from './data-layer.js';
 *   const db = createDataLayer({ dbPath, paths, projectRoot });              // SQLite
 *   const db = createDataLayer({ backend: 'json', dbPath, paths, projectRoot }); // JSON
 */

import Database from 'better-sqlite3';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join, dirname, basename, extname, relative } from 'path';

// ──────── SCHEMA ────────

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  artist        TEXT,
  version       TEXT,
  tempo         INTEGER,
  key_sig       TEXT,
  stage         TEXT,
  stage_idx     INTEGER DEFAULT 0,
  total_stages  INTEGER DEFAULT 5,
  stages_json   TEXT,          -- JSON array of stage names
  goal          TEXT,
  problem       TEXT,
  reference_json TEXT,         -- { track, artist }
  session_focus TEXT,
  last_step     TEXT,
  next_step     TEXT,
  notes_json    TEXT,          -- JSON array
  priorities_json TEXT,        -- JSON array
  created_at    TEXT,
  updated_at    TEXT,
  data_json     TEXT           -- full project blob for forward-compat
);

CREATE TABLE IF NOT EXISTS session_state (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  current_project TEXT,
  version         INTEGER DEFAULT 1,
  raw_json        TEXT,        -- full session.json mirror
  updated_at      TEXT
);

CREATE TABLE IF NOT EXISTS build_sheets (
  id         TEXT PRIMARY KEY,
  title      TEXT,
  project_id TEXT,
  data_json  TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS session_logs (
  id         TEXT PRIMARY KEY,
  project_id TEXT,
  title      TEXT,
  data_json  TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS presets (
  id         TEXT PRIMARY KEY,
  name       TEXT,
  category   TEXT,
  source     TEXT,
  data_json  TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_docs (
  id          TEXT PRIMARY KEY,   -- relative path slug e.g. knowledge/eq
  path        TEXT NOT NULL,      -- absolute or vault-relative path
  category    TEXT NOT NULL,      -- knowledge|framework|producer|presets|case-studies|session|templates|troubleshooting|references|ai
  title       TEXT NOT NULL,
  slug        TEXT,
  summary     TEXT,
  tags_json   TEXT,
  mtime_ms    INTEGER,
  size_bytes  INTEGER,
  content     TEXT,               -- full markdown (for search)
  indexed_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_logs_created ON session_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sheets_updated ON build_sheets(updated_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_docs(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge_docs(title);
`;

// ──────── HELPERS ────────

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(str, fallback = null) {
  if (str == null || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function safeJsonStringify(val) {
  if (val === undefined) return null;
  return JSON.stringify(val);
}

function titleFromMarkdown(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return fallback;
}

function summaryFromMarkdown(content, maxLen = 180) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('---') && !l.startsWith('|'));
  const text = lines.join(' ').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/[*_`]/g, '');
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}

function slugify(name) {
  return name
    .replace(/\.md$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .toLowerCase();
}

function walkMarkdownFiles(dir, files = []) {
  if (!dir || !existsSync(dir)) return files;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
      walkMarkdownFiles(full, files);
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// ──────── PROJECT MAPPING ────────

function projectToRow(id, p) {
  const updated = p.updatedAt || nowIso();
  return {
    id,
    name: p.name || id,
    artist: p.artist ?? null,
    version: p.version ?? null,
    tempo: p.tempo ?? null,
    key_sig: p.key ?? null,
    stage: p.stage ?? null,
    stage_idx: p.stageIdx ?? 0,
    total_stages: p.totalStages ?? 5,
    stages_json: safeJsonStringify(p.stages ?? null),
    goal: p.goal ?? null,
    problem: p.problem ?? null,
    reference_json: safeJsonStringify(p.reference ?? null),
    session_focus: p.sessionFocus ?? null,
    last_step: p.lastStep ?? null,
    next_step: p.nextStep ?? null,
    notes_json: safeJsonStringify(p.notes ?? null),
    priorities_json: safeJsonStringify(p.priorities ?? null),
    created_at: p.createdAt ?? null,
    updated_at: updated,
    data_json: safeJsonStringify(p),
  };
}

function rowToProject(row) {
  if (!row) return null;
  const fromBlob = safeJsonParse(row.data_json, null);
  if (fromBlob && typeof fromBlob === 'object') {
    return { ...fromBlob, id: row.id };
  }
  return {
    id: row.id,
    name: row.name,
    artist: row.artist,
    version: row.version,
    tempo: row.tempo,
    key: row.key_sig,
    stage: row.stage,
    stageIdx: row.stage_idx,
    totalStages: row.total_stages,
    stages: safeJsonParse(row.stages_json, []),
    goal: row.goal,
    problem: row.problem,
    reference: safeJsonParse(row.reference_json, null),
    sessionFocus: row.session_focus,
    lastStep: row.last_step,
    nextStep: row.next_step,
    notes: safeJsonParse(row.notes_json, []),
    priorities: safeJsonParse(row.priorities_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ──────── DASHBOARD.md SYNC ────────

function checkboxLine(done, text) {
  return `- [${done ? 'x' : ' '}] ${text}`;
}

function renderDashboardMarkdown(session) {
  const pid = session.currentProject;
  const p = (session.projects && session.projects[pid]) || {};
  const stages = p.stages || ['Sound Design', 'Arrangement', 'Mixing', 'Mastering', 'Export'];
  const stageChecks = stages
    .map((s) => {
      const on = s === p.stage;
      return `[${on ? 'x' : ' '}] ${s}`;
    })
    .join(' ');

  const notes = Array.isArray(p.notes) ? p.notes : [];
  const breakthrough = notes.find((n) => n.type === 'breakthrough')?.text || '';
  const issue = notes.find((n) => n.type === 'issue')?.text || '';
  const priorities = Array.isArray(p.priorities) ? p.priorities : [];

  const priorityBlock =
    priorities.length > 0
      ? priorities.map((pr) => checkboxLine(!!pr.done, pr.text || '')).join('\n')
      : [
          checkboxLine(false, "Review yesterday's progress"),
          checkboxLine(false, 'Set one session objective'),
          checkboxLine(false, 'Load reference track'),
          checkboxLine(false, 'Define the next concrete step'),
          checkboxLine(false, 'Save progress before leaving'),
        ].join('\n');

  const refTrack = p.reference?.track || '';
  const refArtist = p.reference?.artist || '';

  return `# Dashboard

> NPOS production home page. Otevři to jako první každou session.
> _Auto-synced from session store · ${nowIso()}_

Za pár sekund musí odpovědět na čtyři otázky:
- Co dělám?
- Co je cíl dneska?
- Co blokuje postup?
- Jakou referenci mám na stole?

---

## Current Track
- Track: ${p.name || ''}
- Artist: ${p.artist || ''}
- Version: ${p.version || ''}
- Current Stage: ${p.stage || ''}
- Tempo: ${p.tempo ?? ''}
- Key: ${p.key || ''}
- Project ID: ${pid || ''}

## Today
- Today's Goal: ${p.goal || ''}
- Current Problem: ${p.problem || ''}
- Reference Track: ${refTrack}${refArtist ? ` — ${refArtist}` : ''}
- Session Focus: ${p.sessionFocus || ''}

## Session Status
- Session Type: ${stageChecks}
- Last completed step: ${p.lastStep || ''}
- Next action: ${p.nextStep || ''}

## Recent Notes
- Last breakthrough: ${breakthrough}
- Last issue: ${issue}
- Next action: ${p.nextStep || ''}

---

## Daily Priorities
${priorityBlock}

---

## Fast Actions
1. Start a new project: [[Session-Management/Build-Sheet]]
2. Plan the session: [[Session-Management/Session-Planner]]
3. Track progress: [[Session-Management/Project-Tracker]]
4. Review the week: [[Session-Management/Weekly-Review]]
5. When stuck: [[Framework/Decision-Tree]]
6. Analyse reference: [[Framework/Reference-Analysis-Framework]]
7. Open the knowledge base: [[Knowledge/Index]]
8. Producer philosophy: [[Producer-Knowledge/Index]]
9. Templates: [[Templates/Index]]
10. Ask AI for the next step: [[AI/AI-Production-Prompts]]
`;
}

function parseDashboardField(md, label) {
  const re = new RegExp(`^-\\s*${label}:\\s*(.*)$`, 'mi');
  const m = md.match(re);
  return m ? m[1].trim() : null;
}

function parseDashboardPriorities(md) {
  const section = md.split(/##\s*Daily Priorities/i)[1];
  if (!section) return null;
  const body = section.split(/\n##\s+/)[0] || '';
  const items = [];
  for (const line of body.split(/\r?\n/)) {
    const m = line.match(/^- \[(x|X| )\]\s+(.+)$/);
    if (m) items.push({ done: m[1].toLowerCase() === 'x', text: m[2].trim() });
  }
  return items.length ? items : null;
}

function parseDashboardIntoSession(md, existingSession) {
  const session = existingSession && typeof existingSession === 'object'
    ? JSON.parse(JSON.stringify(existingSession))
    : { $schema: 'session', version: 1, currentProject: null, projects: {} };

  if (!session.projects) session.projects = {};

  const projectId =
    parseDashboardField(md, 'Project ID') ||
    session.currentProject ||
    'default-project';

  session.currentProject = projectId;
  const prev = session.projects[projectId] || {};
  const name = parseDashboardField(md, 'Track') || prev.name || projectId;
  const artist = parseDashboardField(md, 'Artist') ?? prev.artist ?? '';
  const version = parseDashboardField(md, 'Version') ?? prev.version ?? '';
  const stage = parseDashboardField(md, 'Current Stage') || prev.stage || '';
  const tempoRaw = parseDashboardField(md, 'Tempo');
  const tempo = tempoRaw && !Number.isNaN(Number(tempoRaw)) ? Number(tempoRaw) : prev.tempo;
  const key = parseDashboardField(md, 'Key') || prev.key || '';
  const goal = parseDashboardField(md, "Today's Goal") ?? prev.goal ?? '';
  const problem = parseDashboardField(md, 'Current Problem') ?? prev.problem ?? '';
  const focus = parseDashboardField(md, 'Session Focus') ?? prev.sessionFocus ?? '';
  const lastStep = parseDashboardField(md, 'Last completed step') ?? prev.lastStep ?? '';
  const nextStep =
    parseDashboardField(md, 'Next action') ??
    prev.nextStep ??
    '';

  let reference = prev.reference || { track: '', artist: '' };
  const refRaw = parseDashboardField(md, 'Reference Track');
  if (refRaw) {
    const parts = refRaw.split(/\s+[—–-]\s+/);
    reference = {
      track: (parts[0] || '').trim(),
      artist: (parts[1] || reference.artist || '').trim(),
    };
  }

  const breakthrough = parseDashboardField(md, 'Last breakthrough');
  const issue = parseDashboardField(md, 'Last issue');
  let notes = Array.isArray(prev.notes) ? [...prev.notes] : [];
  if (breakthrough != null && breakthrough !== '') {
    const idx = notes.findIndex((n) => n.type === 'breakthrough');
    const entry = { type: 'breakthrough', text: breakthrough };
    if (idx >= 0) notes[idx] = entry;
    else notes.unshift(entry);
  }
  if (issue != null && issue !== '') {
    const idx = notes.findIndex((n) => n.type === 'issue');
    const entry = { type: 'issue', text: issue };
    if (idx >= 0) notes[idx] = entry;
    else notes.unshift(entry);
  }

  const priorities = parseDashboardPriorities(md) || prev.priorities || [];

  const stages = prev.stages || ['Sound Design', 'Arrangement', 'Mixing', 'Mastering', 'Export'];
  let stageIdx = typeof prev.stageIdx === 'number' ? prev.stageIdx : 0;
  if (stage) {
    const found = stages.findIndex((s) => s.toLowerCase() === stage.toLowerCase());
    if (found >= 0) stageIdx = found;
  }

  session.projects[projectId] = {
    ...prev,
    name,
    artist,
    version,
    tempo,
    key,
    stage,
    stageIdx,
    totalStages: prev.totalStages || stages.length,
    stages,
    goal,
    problem,
    reference,
    sessionFocus: focus,
    lastStep,
    nextStep,
    notes,
    priorities,
    updatedAt: nowIso().slice(0, 10),
  };

  return session;
}

// ──────── DATA LAYER FACTORY ────────

/**
 * @param {object} opts
 * @param {string} opts.dbPath - absolute path to SQLite file
 * @param {object} opts.paths - resolved absolute paths from npos.config
 * @param {string} opts.projectRoot
 * @param {function} [opts.onChange] - event emitter callback ({ type, payload })
 */
export function createSqliteDataLayer(opts) {
  const { dbPath, paths, projectRoot, onChange } = opts;

  const dbDir = dirname(dbPath);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

  const db = new Database(dbPath);
  db.exec(SCHEMA_SQL);

  const emit = (type, payload) => {
    if (typeof onChange === 'function') {
      try {
        onChange({ type, payload, at: nowIso() });
      } catch (err) {
        console.error('[data-layer] onChange error:', err.message);
      }
    }
  };

  // prepared statements
  const stmts = {
    upsertProject: db.prepare(`
      INSERT INTO projects (
        id, name, artist, version, tempo, key_sig, stage, stage_idx, total_stages,
        stages_json, goal, problem, reference_json, session_focus, last_step, next_step,
        notes_json, priorities_json, created_at, updated_at, data_json
      ) VALUES (
        @id, @name, @artist, @version, @tempo, @key_sig, @stage, @stage_idx, @total_stages,
        @stages_json, @goal, @problem, @reference_json, @session_focus, @last_step, @next_step,
        @notes_json, @priorities_json, @created_at, @updated_at, @data_json
      )
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, artist=excluded.artist, version=excluded.version,
        tempo=excluded.tempo, key_sig=excluded.key_sig, stage=excluded.stage,
        stage_idx=excluded.stage_idx, total_stages=excluded.total_stages,
        stages_json=excluded.stages_json, goal=excluded.goal, problem=excluded.problem,
        reference_json=excluded.reference_json, session_focus=excluded.session_focus,
        last_step=excluded.last_step, next_step=excluded.next_step,
        notes_json=excluded.notes_json, priorities_json=excluded.priorities_json,
        created_at=COALESCE(projects.created_at, excluded.created_at),
        updated_at=excluded.updated_at, data_json=excluded.data_json
    `),
    getProject: db.prepare(`SELECT * FROM projects WHERE id = ?`),
    listProjects: db.prepare(`SELECT * FROM projects ORDER BY updated_at DESC`),
    deleteProject: db.prepare(`DELETE FROM projects WHERE id = ?`),

    getSessionState: db.prepare(`SELECT * FROM session_state WHERE id = 1`),
    upsertSessionState: db.prepare(`
      INSERT INTO session_state (id, current_project, version, raw_json, updated_at)
      VALUES (1, @current_project, @version, @raw_json, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        current_project=excluded.current_project,
        version=excluded.version,
        raw_json=excluded.raw_json,
        updated_at=excluded.updated_at
    `),

    upsertSheet: db.prepare(`
      INSERT INTO build_sheets (id, title, project_id, data_json, created_at, updated_at)
      VALUES (@id, @title, @project_id, @data_json, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title, project_id=excluded.project_id,
        data_json=excluded.data_json, updated_at=excluded.updated_at
    `),
    getSheet: db.prepare(`SELECT * FROM build_sheets WHERE id = ?`),
    listSheets: db.prepare(`SELECT * FROM build_sheets ORDER BY updated_at DESC`),
    deleteSheet: db.prepare(`DELETE FROM build_sheets WHERE id = ?`),

    upsertLog: db.prepare(`
      INSERT INTO session_logs (id, project_id, title, data_json, created_at, updated_at)
      VALUES (@id, @project_id, @title, @data_json, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        project_id=excluded.project_id, title=excluded.title,
        data_json=excluded.data_json, updated_at=excluded.updated_at
    `),
    getLog: db.prepare(`SELECT * FROM session_logs WHERE id = ?`),
    listLogs: db.prepare(`SELECT * FROM session_logs ORDER BY created_at DESC LIMIT ?`),
    deleteLog: db.prepare(`DELETE FROM session_logs WHERE id = ?`),

    upsertPreset: db.prepare(`
      INSERT INTO presets (id, name, category, source, data_json, created_at, updated_at)
      VALUES (@id, @name, @category, @source, @data_json, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, category=excluded.category, source=excluded.source,
        data_json=excluded.data_json, updated_at=excluded.updated_at
    `),
    getPreset: db.prepare(`SELECT * FROM presets WHERE id = ?`),
    listPresets: db.prepare(`SELECT * FROM presets ORDER BY updated_at DESC`),

    upsertKnowledge: db.prepare(`
      INSERT INTO knowledge_docs (
        id, path, category, title, slug, summary, tags_json, mtime_ms, size_bytes, content, indexed_at
      ) VALUES (
        @id, @path, @category, @title, @slug, @summary, @tags_json, @mtime_ms, @size_bytes, @content, @indexed_at
      )
      ON CONFLICT(id) DO UPDATE SET
        path=excluded.path, category=excluded.category, title=excluded.title,
        slug=excluded.slug, summary=excluded.summary, tags_json=excluded.tags_json,
        mtime_ms=excluded.mtime_ms, size_bytes=excluded.size_bytes,
        content=excluded.content, indexed_at=excluded.indexed_at
    `),
    listKnowledge: db.prepare(`SELECT id, path, category, title, slug, summary, tags_json, mtime_ms, size_bytes, indexed_at FROM knowledge_docs ORDER BY category, title`),
    listKnowledgeByCategory: db.prepare(`SELECT id, path, category, title, slug, summary, tags_json, mtime_ms, size_bytes, indexed_at FROM knowledge_docs WHERE category = ? ORDER BY title`),
    getKnowledge: db.prepare(`SELECT * FROM knowledge_docs WHERE id = ?`),
    clearKnowledge: db.prepare(`DELETE FROM knowledge_docs`),

    getMeta: db.prepare(`SELECT value FROM meta WHERE key = ?`),
    setMeta: db.prepare(`
      INSERT INTO meta (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `),
  };

  // ── Session API (compatible shape with session.json) ──

  function getSession() {
    const row = stmts.getSessionState.get();
    if (row?.raw_json) {
      const parsed = safeJsonParse(row.raw_json, null);
      if (parsed) return parsed;
    }
    // rebuild from projects table
    const projects = {};
    for (const r of stmts.listProjects.all()) {
      projects[r.id] = rowToProject(r);
    }
    return {
      $schema: 'session',
      version: row?.version || 1,
      currentProject: row?.current_project || Object.keys(projects)[0] || null,
      projects,
    };
  }

  function saveSession(session, { syncDashboard = true, syncJsonFile = true } = {}) {
    if (!session || typeof session !== 'object') {
      throw new Error('session must be an object');
    }
    const ts = nowIso();
    const projects = session.projects || {};

    const tx = db.transaction(() => {
      for (const [id, p] of Object.entries(projects)) {
        stmts.upsertProject.run(projectToRow(id, p));
      }
      stmts.upsertSessionState.run({
        current_project: session.currentProject || null,
        version: session.version || 1,
        raw_json: safeJsonStringify(session),
        updated_at: ts,
      });
      stmts.setMeta.run('session_updated_at', ts);
    });
    tx();

    if (syncJsonFile && paths.sessionFile) {
      try {
        const dir = dirname(paths.sessionFile);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(paths.sessionFile, JSON.stringify(session, null, 2), 'utf8');
      } catch (err) {
        console.error('[data-layer] failed to write session.json:', err.message);
      }
    }

    if (syncDashboard) {
      try {
        writeDashboardFromSession(session);
      } catch (err) {
        console.error('[data-layer] dashboard sync failed:', err.message);
      }
    }

    emit('session', session);
    return { ok: true, updatedAt: ts };
  }

  // ── Build sheets ──

  function listBuildSheets() {
    return stmts.listSheets.all().map((r) => {
      const data = safeJsonParse(r.data_json, {});
      return {
        id: r.id,
        title: r.title,
        projectId: r.project_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        ...data,
      };
    });
  }

  function getBuildSheet(id) {
    const r = stmts.getSheet.get(id);
    if (!r) return null;
    const data = safeJsonParse(r.data_json, {});
    return {
      id: r.id,
      title: r.title,
      projectId: r.project_id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      ...data,
    };
  }

  function saveBuildSheet(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `sheet-${Date.now()}`;
    const existing = stmts.getSheet.get(slug);
    const payload = { ...data };
    delete payload.id;
    stmts.upsertSheet.run({
      id: slug,
      title: data.title || data.name || slug,
      project_id: data.projectId || data.project_id || null,
      data_json: safeJsonStringify(payload),
      created_at: existing?.created_at || data.createdAt || ts,
      updated_at: ts,
    });
    // also mirror to JSON file for backward compat
    if (paths.buildSheets) {
      try {
        if (!existsSync(paths.buildSheets)) mkdirSync(paths.buildSheets, { recursive: true });
        writeFileSync(
          join(paths.buildSheets, `${slug}.json`),
          JSON.stringify({ ...payload, updatedAt: ts }, null, 2),
          'utf8'
        );
      } catch (err) {
        console.error('[data-layer] build-sheet file mirror failed:', err.message);
      }
    }
    const sheet = getBuildSheet(slug);
    emit('build-sheet', sheet);
    return { ok: true, id: slug, sheet };
  }

  // ── Session logs ──

  function listLogs(limit = 20) {
    return stmts.listLogs.all(limit).map((r) => {
      const data = safeJsonParse(r.data_json, {});
      return {
        id: r.id,
        projectId: r.project_id,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        ...data,
      };
    });
  }

  function saveLog(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `session-${Date.now()}`;
    const existing = stmts.getLog.get(slug);
    const payload = { ...data };
    delete payload.id;
    stmts.upsertLog.run({
      id: slug,
      project_id: data.projectId || data.project_id || null,
      title: data.title || data.name || slug,
      data_json: safeJsonStringify(payload),
      created_at: existing?.created_at || data.createdAt || ts,
      updated_at: ts,
    });
    if (paths.sessions) {
      try {
        if (!existsSync(paths.sessions)) mkdirSync(paths.sessions, { recursive: true });
        writeFileSync(
          join(paths.sessions, `${slug}.json`),
          JSON.stringify({ ...payload, createdAt: existing?.created_at || ts }, null, 2),
          'utf8'
        );
      } catch (err) {
        console.error('[data-layer] log file mirror failed:', err.message);
      }
    }
    emit('log', { id: slug, ...payload });
    return { ok: true, id: slug };
  }

  // ── Presets ──

  function listPresets() {
    return stmts.listPresets.all().map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      source: r.source,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      ...safeJsonParse(r.data_json, {}),
    }));
  }

  function savePreset(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `preset-${Date.now()}`;
    const existing = stmts.getPreset.get(slug);
    const payload = { ...data };
    delete payload.id;
    stmts.upsertPreset.run({
      id: slug,
      name: data.name || slug,
      category: data.category || null,
      source: data.source || null,
      data_json: safeJsonStringify(payload),
      created_at: existing?.created_at || ts,
      updated_at: ts,
    });
    emit('preset', { id: slug, ...payload });
    return { ok: true, id: slug };
  }

  // ── Knowledge index ──

  const KNOWLEDGE_SOURCES = [
    { key: 'knowledge', category: 'knowledge', pathKey: 'knowledge' },
    { key: 'framework', category: 'framework', pathKey: 'framework' },
    { key: 'producer', category: 'producer', pathKey: 'producerKnowledge' },
    { key: 'presets', category: 'presets', pathKey: 'presets' },
    { key: 'case-studies', category: 'case-studies', pathKey: 'caseStudies' },
    { key: 'session', category: 'session', pathKey: 'sessionManagement' },
    { key: 'templates', category: 'templates', pathKey: 'templates' },
    { key: 'troubleshooting', category: 'troubleshooting', pathKey: 'troubleshooting' },
    { key: 'references', category: 'references', pathKey: 'references' },
    { key: 'ai', category: 'ai', pathKey: null, fallback: 'AI' },
  ];

  function resolveSourceDir(src) {
    if (src.pathKey && paths[src.pathKey]) return paths[src.pathKey];
    if (src.fallback) return join(projectRoot, src.fallback);
    return null;
  }

  function reindexKnowledge({ includeContent = true } = {}) {
    const ts = nowIso();
    let count = 0;

    const tx = db.transaction(() => {
      stmts.clearKnowledge.run();
      for (const src of KNOWLEDGE_SOURCES) {
        const dir = resolveSourceDir(src);
        if (!dir || !existsSync(dir)) continue;
        const files = walkMarkdownFiles(dir);
        for (const filePath of files) {
          let content = '';
          let st;
          try {
            st = statSync(filePath);
            content = readFileSync(filePath, 'utf8');
          } catch {
            continue;
          }
          const rel = relative(projectRoot, filePath).replace(/\\/g, '/');
          const base = basename(filePath, extname(filePath));
          const title = titleFromMarkdown(content, base.replace(/-/g, ' '));
          const slug = slugify(base);
          const id = `${src.category}/${slug}`;
          const tags = [];
          const tagMatch = content.match(/tags:\s*\[([^\]]+)\]/i);
          if (tagMatch) {
            tagMatch[1].split(',').forEach((t) => tags.push(t.trim().replace(/['"]/g, '')));
          }
          stmts.upsertKnowledge.run({
            id,
            path: rel,
            category: src.category,
            title,
            slug,
            summary: summaryFromMarkdown(content),
            tags_json: safeJsonStringify(tags),
            mtime_ms: st.mtimeMs,
            size_bytes: st.size,
            content: includeContent ? content : null,
            indexed_at: ts,
          });
          count += 1;
        }
      }
      stmts.setMeta.run('knowledge_indexed_at', ts);
      stmts.setMeta.run('knowledge_count', String(count));
    });
    tx();

    emit('knowledge-index', { count, indexedAt: ts });
    return { ok: true, count, indexedAt: ts };
  }

  function getKnowledgeIndex({ category } = {}) {
    const metaCount = stmts.getMeta.get('knowledge_count');
    if (!metaCount) {
      reindexKnowledge();
    }
    const rows = category
      ? stmts.listKnowledgeByCategory.all(category)
      : stmts.listKnowledge.all();

    const byCategory = {};
    const items = rows.map((r) => {
      const item = {
        id: r.id,
        path: r.path,
        category: r.category,
        title: r.title,
        slug: r.slug,
        summary: r.summary,
        tags: safeJsonParse(r.tags_json, []),
        mtimeMs: r.mtime_ms,
        sizeBytes: r.size_bytes,
        indexedAt: r.indexed_at,
      };
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(item);
      return item;
    });

    return {
      count: items.length,
      indexedAt: stmts.getMeta.get('knowledge_indexed_at')?.value || null,
      categories: Object.keys(byCategory).sort(),
      byCategory,
      items,
    };
  }

  function getKnowledgeDoc(id) {
    const row = stmts.getKnowledge.get(id);
    if (!row) return null;
    return {
      id: row.id,
      path: row.path,
      category: row.category,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      tags: safeJsonParse(row.tags_json, []),
      content: row.content,
      mtimeMs: row.mtime_ms,
      indexedAt: row.indexed_at,
    };
  }

  // ── Unified search ──

  function searchAll(query, { limit = 30, types = null } = {}) {
    const q = String(query || '').trim();
    if (!q) return { query: q, count: 0, results: [] };

    const terms = tokenize(q);
    const results = [];
    const want = (t) => !types || types.includes(t);

    // knowledge
    if (want('knowledge')) {
      const docs = stmts.listKnowledge.all();
      // need content — fetch full rows when scoring
      for (const light of docs) {
        const full = stmts.getKnowledge.get(light.id);
        if (!full) continue;
        const hay = `${full.title} ${full.summary || ''} ${full.content || ''}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (full.title.toLowerCase().includes(t)) score += 5;
          if ((full.summary || '').toLowerCase().includes(t)) score += 2;
          if (hay.includes(t)) score += 1;
        }
        // phrase boost
        if (hay.includes(q.toLowerCase())) score += 8;
        if (score > 0) {
          results.push({
            type: 'knowledge',
            id: full.id,
            title: full.title,
            category: full.category,
            path: full.path,
            snippet: full.summary || '',
            score,
          });
        }
      }
    }

    // sessions / projects
    if (want('session') || want('project')) {
      const session = getSession();
      for (const [id, p] of Object.entries(session.projects || {})) {
        const hay = [
          p.name,
          p.artist,
          p.goal,
          p.problem,
          p.stage,
          p.sessionFocus,
          p.lastStep,
          p.nextStep,
          JSON.stringify(p.notes || []),
        ]
          .join(' ')
          .toLowerCase();
        let score = 0;
        for (const t of terms) {
          if ((p.name || '').toLowerCase().includes(t)) score += 5;
          if (hay.includes(t)) score += 1;
        }
        if (score > 0) {
          results.push({
            type: 'project',
            id,
            title: p.name || id,
            category: 'project',
            path: `session://${id}`,
            snippet: p.goal || p.problem || '',
            score,
          });
        }
      }
    }

    // logs
    if (want('log') || want('session')) {
      for (const log of listLogs(100)) {
        const hay = JSON.stringify(log).toLowerCase();
        let score = 0;
        for (const t of terms) {
          if ((log.title || log.id || '').toLowerCase().includes(t)) score += 4;
          if (hay.includes(t)) score += 1;
        }
        if (score > 0) {
          results.push({
            type: 'log',
            id: log.id,
            title: log.title || log.id,
            category: 'log',
            path: `log://${log.id}`,
            snippet: log.goal || log.notes || log.summary || '',
            score,
          });
        }
      }
    }

    // build sheets
    if (want('build-sheet') || want('sheet')) {
      for (const sheet of listBuildSheets()) {
        const hay = JSON.stringify(sheet).toLowerCase();
        let score = 0;
        for (const t of terms) {
          if ((sheet.title || sheet.id || '').toLowerCase().includes(t)) score += 4;
          if (hay.includes(t)) score += 1;
        }
        if (score > 0) {
          results.push({
            type: 'build-sheet',
            id: sheet.id,
            title: sheet.title || sheet.id,
            category: 'build-sheet',
            path: `build-sheet://${sheet.id}`,
            snippet: sheet.goal || sheet.concept || '',
            score,
          });
        }
      }
    }

    // presets
    if (want('preset')) {
      for (const preset of listPresets()) {
        const hay = JSON.stringify(preset).toLowerCase();
        let score = 0;
        for (const t of terms) {
          if ((preset.name || preset.id || '').toLowerCase().includes(t)) score += 4;
          if (hay.includes(t)) score += 1;
        }
        if (score > 0) {
          results.push({
            type: 'preset',
            id: preset.id,
            title: preset.name || preset.id,
            category: preset.category || 'preset',
            path: `preset://${preset.id}`,
            snippet: preset.source || '',
            score,
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const trimmed = results.slice(0, limit);
    return { query: q, count: trimmed.length, totalMatched: results.length, results: trimmed };
  }

  // ── Dashboard sync ──

  function dashboardPath() {
    // Prefer vault root Dashboard.md; fallback Session-Management/Dashboard.md
    const rootDash = join(projectRoot, 'Dashboard.md');
    if (existsSync(rootDash) || true) return rootDash;
    return join(paths.sessionManagement || join(projectRoot, 'Session-Management'), 'Dashboard.md');
  }

  function writeDashboardFromSession(session) {
    const md = renderDashboardMarkdown(session || getSession());
    const target = dashboardPath();
    const dir = dirname(target);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(target, md, 'utf8');
    emit('dashboard', { path: target });
    return { ok: true, path: target };
  }

  function pullDashboardIntoSession() {
    const target = dashboardPath();
    if (!existsSync(target)) {
      return { ok: false, error: 'Dashboard.md not found', path: target };
    }
    const md = readFileSync(target, 'utf8');
    const existing = getSession();
    const merged = parseDashboardIntoSession(md, existing);
    saveSession(merged, { syncDashboard: false, syncJsonFile: true });
    return { ok: true, session: merged, path: target };
  }

  // ── Migration from JSON files ──

  function migrateFromJson({ force = false } = {}) {
    const already = stmts.getMeta.get('migrated_from_json');
    if (already && !force) {
      return { ok: true, skipped: true, at: already.value };
    }

    const report = {
      session: false,
      buildSheets: 0,
      logs: 0,
      presets: 0,
      errors: [],
    };

    // session.json
    if (paths.sessionFile && existsSync(paths.sessionFile)) {
      try {
        const session = JSON.parse(readFileSync(paths.sessionFile, 'utf8'));
        saveSession(session, { syncDashboard: true, syncJsonFile: false });
        report.session = true;
      } catch (err) {
        report.errors.push(`session.json: ${err.message}`);
      }
    }

    // build sheets
    if (paths.buildSheets && existsSync(paths.buildSheets)) {
      try {
        const files = readdirSync(paths.buildSheets).filter((f) => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(paths.buildSheets, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            saveBuildSheet(id, data);
            report.buildSheets += 1;
          } catch (err) {
            report.errors.push(`build-sheet ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`build-sheets dir: ${err.message}`);
      }
    }

    // session logs
    if (paths.sessions && existsSync(paths.sessions)) {
      try {
        const files = readdirSync(paths.sessions).filter((f) => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(paths.sessions, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            saveLog(id, data);
            report.logs += 1;
          } catch (err) {
            report.errors.push(`log ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`sessions dir: ${err.message}`);
      }
    }

    // optional preset json under Data/presets
    const presetDir = join(paths.data || join(projectRoot, 'Data'), 'presets');
    if (existsSync(presetDir)) {
      try {
        const files = readdirSync(presetDir).filter((f) => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(presetDir, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            savePreset(id, data);
            report.presets += 1;
          } catch (err) {
            report.errors.push(`preset ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`presets dir: ${err.message}`);
      }
    }

    // knowledge index
    try {
      report.knowledge = reindexKnowledge();
    } catch (err) {
      report.errors.push(`knowledge: ${err.message}`);
    }

    const ts = nowIso();
    stmts.setMeta.run('migrated_from_json', ts);
    stmts.setMeta.run('migration_report', safeJsonStringify(report));
    emit('migrate', report);
    return { ok: true, skipped: false, at: ts, report };
  }

  function getStats() {
    const session = getSession();
    return {
      dbPath,
      projects: stmts.listProjects.all().length,
      buildSheets: stmts.listSheets.all().length,
      logs: stmts.listLogs.all(10000).length,
      presets: stmts.listPresets.all().length,
      knowledge: Number(stmts.getMeta.get('knowledge_count')?.value || 0),
      currentProject: session.currentProject || null,
      migratedAt: stmts.getMeta.get('migrated_from_json')?.value || null,
      knowledgeIndexedAt: stmts.getMeta.get('knowledge_indexed_at')?.value || null,
    };
  }

  function close() {
    try {
      db.close();
    } catch {
      /* ignore */
    }
  }

  return {
    db,
    // session
    getSession,
    saveSession,
    // sheets
    listBuildSheets,
    getBuildSheet,
    saveBuildSheet,
    // logs
    listLogs,
    saveLog,
    // presets
    listPresets,
    savePreset,
    // knowledge
    reindexKnowledge,
    getKnowledgeIndex,
    getKnowledgeDoc,
    // search
    searchAll,
    // dashboard
    writeDashboardFromSession,
    pullDashboardIntoSession,
    dashboardPath,
    // migration
    migrateFromJson,
    getStats,
    close,
  };
}

// ──────── JSON FILE STORAGE ────────

class JsonStorage {
  constructor(baseDir) {
    this.baseDir = baseDir;
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
  }

  getPath(type, id) {
    return join(this.baseDir, `${type}_${id}.json`);
  }

  read(type, id) {
    const path = this.getPath(type, id);
    if (!existsSync(path)) return null;
    try {
      return safeJsonParse(readFileSync(path, 'utf8'), null);
    } catch {
      return null;
    }
  }

  write(type, id, data) {
    const path = this.getPath(type, id);
    writeFileSync(path, safeJsonStringify(data), 'utf8');
    return data;
  }

  list(type) {
    const prefix = `${type}_`;
    const suffix = '.json';
    try {
      const files = readdirSync(this.baseDir);
      return files
        .filter(f => f.startsWith(prefix) && f.endsWith(suffix))
        .map(f => {
          const id = f.slice(prefix.length, -suffix.length);
          return this.read(type, id);
        })
        .filter(item => item !== null);
    } catch {
      return [];
    }
  }

  delete(type, id) {
    const path = this.getPath(type, id);
    if (existsSync(path)) {
      try {
        unlinkSync(path);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// ──────── JSON-BACKED DATA LAYER ────────

/**
 * @param {object} opts
 * @param {string} opts.dbPath - path to storage directory
 * @param {object} opts.paths - resolved absolute paths from npos.config
 * @param {string} opts.projectRoot
 * @param {function} [opts.onChange] - event emitter callback ({ type, payload })
 */
function createJsonDataLayer(opts) {
  const { dbPath, paths, projectRoot, onChange } = opts;

  // Create storage directory
  if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
  }

  const storage = new JsonStorage(dbPath);

  const emit = (type, payload) => {
    if (typeof onChange === 'function') {
      try {
        onChange({ type, payload, at: nowIso() });
      } catch (err) {
        console.error('[data-layer] onChange error:', err.message);
      }
    }
  };

  // ──────── SESSION API ────────

  function getSession() {
    if (paths.sessionFile && existsSync(paths.sessionFile)) {
      try {
        const session = safeJsonParse(readFileSync(paths.sessionFile, 'utf8'), null);
        if (session) return session;
      } catch {
        // fall through to rebuild
      }
    }
    const projects = {};
    const projectList = storage.list('project');
    for (const p of projectList) {
      projects[p.id] = p;
    }
    return {
      $schema: 'session',
      version: 1,
      currentProject: Object.keys(projects)[0] || null,
      projects,
    };
  }

  function saveSession(session) {
    if (!session || typeof session !== 'object') throw new Error('session must be an object');
    const curr = safeJsonParse(session.currentProject, null);
    if (curr && session.projects && session.projects[curr]) {
      storage.write('project', curr, session.projects[curr]);
    }
    if (session.projects) {
      for (const [id, proj] of Object.entries(session.projects)) {
        storage.write('project', id, proj);
      }
    }
    // mirror to session.json
    if (paths.sessionFile) {
      const dir = dirname(paths.sessionFile);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      try {
        writeFileSync(paths.sessionFile, safeJsonStringify(session), 'utf8');
      } catch (err) {
        console.error('[data-layer] failed to write session.json:', err.message);
      }
    }
    emit('session', { projectId: curr || 'unknown' });
  }

  // ──────── BUILD SHEETS ────────

  function listBuildSheets() { return storage.list('build_sheet'); }

  function getBuildSheet(id) { return storage.read('build_sheet', id); }

  function saveBuildSheet(id, data) {
    const saved = storage.write('build_sheet', id, { id, ...data, updatedAt: nowIso() });
    // mirror to file
    const dir = join(paths.buildSheets || join(projectRoot, 'Data', 'build-sheets'));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    try {
      writeFileSync(join(dir, `${id}.json`), safeJsonStringify(saved), 'utf8');
    } catch (err) {
      console.error('[data-layer] build-sheet file mirror failed:', err.message);
    }
    emit('buildSheet', { id });
    return saved;
  }

  // ──────── LOGS ────────

  function listLogs() { return storage.list('log'); }

  function saveLog(id, data) {
    const saved = storage.write('log', id, { id, ...data, createdAt: nowIso() });
    const dir = join(paths.sessions || join(projectRoot, 'Data', 'sessions'));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    try {
      writeFileSync(join(dir, `${id}.json`), safeJsonStringify(saved), 'utf8');
    } catch (err) {
      console.error('[data-layer] log file mirror failed:', err.message);
    }
    emit('log', { id });
    return saved;
  }

  // ──────── PRESETS ────────

  function listPresets() { return storage.list('preset'); }

  function savePreset(id, data) {
    return storage.write('preset', id, { id, ...data, updatedAt: nowIso() });
  }

  // ──────── KNOWLEDGE INDEX ────────

  function reindexKnowledge() {
    const sources = [
      { dir: paths.knowledge, cat: 'knowledge' },
      { dir: paths.framework, cat: 'framework' },
      { dir: paths.producerKnowledge || join(projectRoot, 'Producer-Knowledge'), cat: 'producer' },
      { dir: paths.presets, cat: 'presets' },
      { dir: paths.caseStudies || join(projectRoot, 'Case-Studies'), cat: 'case-studies' },
      { dir: paths.sessionManagement || join(projectRoot, 'Session-Management'), cat: 'session' },
      { dir: paths.templates || join(projectRoot, 'Templates'), cat: 'templates' },
      { dir: paths.troubleshooting || join(projectRoot, 'Troubleshooting'), cat: 'troubleshooting' },
      { dir: paths.references || join(projectRoot, 'References'), cat: 'references' },
      { dir: join(projectRoot, 'AI'), cat: 'ai' },
    ];

    let count = 0;
    for (const source of sources) {
      const files = walkMarkdownFiles(source.dir);
      for (const filepath of files) {
        const relativePath = relative(projectRoot, filepath);
        const slug = slugify(basename(filepath));
        const content = readFileSync(filepath, 'utf8');
        const title = titleFromMarkdown(content, basename(filepath).replace(/\.md$/i, ''));
        const summary = summaryFromMarkdown(content, 280);
        const stat = statSync(filepath);
        const doc = {
          id: slug,
          path: relativePath,
          category: source.cat,
          title,
          slug,
          summary,
          tags: [],
          content,
          mtimeMs: stat.mtimeMs,
          sizeBytes: stat.size,
          indexedAt: nowIso(),
        };
        storage.write('knowledge_doc', slug, doc);
        count++;
      }
    }
    emit('reindex', { count });
    return count;
  }

  function getKnowledgeIndex() {
    const docs = storage.list('knowledge_doc');
    return docs.map(d => ({
      id: d.id,
      path: d.path,
      category: d.category,
      title: d.title,
      slug: d.slug,
      summary: d.summary,
      tags: d.tags || [],
      indexedAt: d.indexedAt,
    }));
  }

  function getKnowledgeDoc(id) {
    const doc = storage.read('knowledge_doc', id);
    if (!doc) return null;
    return {
      id: doc.id,
      path: doc.path,
      category: doc.category,
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary,
      tags: doc.tags || [],
      content: doc.content,
      mtimeMs: doc.mtimeMs,
      indexedAt: doc.indexedAt,
    };
  }

  // ──────── UNIFIED SEARCH ────────

  function searchAll(query, { limit = 30, types = null } = {}) {
    const q = String(query || '').trim();
    if (!q) return { query: q, count: 0, results: [] };

    const terms = tokenize(q);
    const results = [];
    const want = (t) => !types || types.includes(t);

    // knowledge
    if (want('knowledge')) {
      const docs = storage.list('knowledge_doc');
      for (const doc of docs) {
        const hay = `${doc.title} ${doc.summary || ''} ${doc.content || ''}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (doc.title.toLowerCase().includes(t)) score += 5;
          if ((doc.summary || '').toLowerCase().includes(t)) score += 2;
          if (hay.includes(t)) score += 1;
        }
        if (hay.includes(q.toLowerCase())) score += 8;
        if (score > 0) {
          results.push({
            type: 'knowledge',
            id: doc.id,
            title: doc.title,
            category: doc.category,
            path: doc.path,
            snippet: doc.summary || doc.content?.slice(0, 200) || '',
            score,
          });
        }
      }
    }

    // presets
    if (want('preset')) {
      const presets = storage.list('preset');
      for (const preset of presets) {
        const hay = `${preset.name || ''} ${preset.category || ''} ${preset.source || ''} ${preset.data_json || ''}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if ((preset.name || '').toLowerCase().includes(t)) score += 5;
          if ((preset.category || '').toLowerCase().includes(t)) score += 3;
          if (hay.includes(t)) score += 1;
        }
        if (hay.includes(q.toLowerCase())) score += 8;
        if (score > 0) {
          results.push({
            type: 'preset',
            id: preset.id,
            title: preset.name || preset.id,
            category: preset.category || 'preset',
            path: `preset://${preset.id}`,
            snippet: preset.source || '',
            score,
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const trimmed = results.slice(0, limit);
    return { query: q, count: trimmed.length, totalMatched: results.length, results: trimmed };
  }

  // ── Dashboard sync ──

  function dashboardPath() {
    const rootDash = join(projectRoot, 'Dashboard.md');
    if (existsSync(rootDash) || true) return rootDash;
    return join(paths.sessionManagement || join(projectRoot, 'Session-Management'), 'Dashboard.md');
  }

  function writeDashboardFromSession(session) {
    const md = renderDashboardMarkdown(session || getSession());
    const target = dashboardPath();
    try {
      writeFileSync(target, md, 'utf8');
      emit('dashboard', { action: 'write', path: target });
      return { ok: true, path: target };
    } catch (err) {
      return { ok: false, error: err.message, path: target };
    }
  }

  function pullDashboardIntoSession() {
    const target = dashboardPath();
    if (!existsSync(target)) return { ok: false, error: 'Dashboard.md not found', path: target };
    try {
      const md = readFileSync(target, 'utf8');
      const existing = getSession();
      const merged = parseDashboardIntoSession(md, existing);
      saveSession(merged);
      emit('dashboard', { action: 'pull', path: target });
      return { ok: true, path: target, session: merged };
    } catch (err) {
      return { ok: false, error: err.message, path: target };
    }
  }

  // ──────── MIGRATION ────────

  function migrateFromJson() {
    const report = { projects: 0, buildSheets: 0, logs: 0, presets: 0, knowledge: 0, errors: [] };

    // migrate projects from session.json
    const sessionFile = paths.sessionFile;
    if (sessionFile && existsSync(sessionFile)) {
      try {
        const session = safeJsonParse(readFileSync(sessionFile, 'utf8'), null);
        if (session && session.projects) {
          for (const [id, proj] of Object.entries(session.projects)) {
            storage.write('project', id, proj);
            report.projects++;
          }
        }
      } catch (err) {
        report.errors.push(`session.json: ${err.message}`);
      }
    }

    // migrate build-sheets from Data/build-sheets
    const sheetDir = join(paths.buildSheets || join(projectRoot, 'Data', 'build-sheets'));
    if (existsSync(sheetDir)) {
      try {
        const files = readdirSync(sheetDir).filter(f => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(sheetDir, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            storage.write('build_sheet', id, { id, ...data });
            report.buildSheets++;
          } catch (err) {
            report.errors.push(`build-sheet ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`build-sheets dir: ${err.message}`);
      }
    }

    // migrate logs from Data/sessions
    const logDir = join(paths.sessions || join(projectRoot, 'Data', 'sessions'));
    if (existsSync(logDir)) {
      try {
        const files = readdirSync(logDir).filter(f => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(logDir, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            storage.write('log', id, { id, ...data });
            report.logs++;
          } catch (err) {
            report.errors.push(`log ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`sessions dir: ${err.message}`);
      }
    }

    // migrate presets from Presets/
    const presetDir = join(paths.presets || join(projectRoot, 'Presets'));
    if (existsSync(presetDir)) {
      try {
        const files = readdirSync(presetDir).filter(f => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(readFileSync(join(presetDir, f), 'utf8'));
            const id = f.replace(/\.json$/i, '');
            storage.write('preset', id, { id, ...data });
            report.presets++;
          } catch (err) {
            report.errors.push(`preset ${f}: ${err.message}`);
          }
        }
      } catch (err) {
        report.errors.push(`presets dir: ${err.message}`);
      }
    }

    // migrate knowledge (reindex)
    try {
      report.knowledge = reindexKnowledge();
    } catch (err) {
      report.errors.push(`knowledge: ${err.message}`);
    }

    return report;
  }

  function getStats() {
    return {
      projects: storage.list('project').length,
      buildSheets: storage.list('build_sheet').length,
      logs: storage.list('log').length,
      presets: storage.list('preset').length,
      knowledge: storage.list('knowledge_doc').length,
    };
  }

  function close() {
    // no-op for JSON storage
  }

  // auto-migrate on boot (idempotent)
  try {
    migrateFromJson();
  } catch (err) {
    console.error('[data-layer] Migration on boot failed:', err.message);
  }

  return {
    // session
    getSession,
    saveSession,
    // sheets
    listBuildSheets,
    getBuildSheet,
    saveBuildSheet,
    // logs
    listLogs,
    saveLog,
    // presets
    listPresets,
    savePreset,
    // knowledge
    reindexKnowledge,
    getKnowledgeIndex,
    getKnowledgeDoc,
    // search
    searchAll,
    // dashboard
    writeDashboardFromSession,
    pullDashboardIntoSession,
    dashboardPath,
    // migration
    migrateFromJson,
    getStats,
    close,
  };
}

// ──────── UNIFIED FACTORY ────────

/**
 * @param {object} opts
 * @param {'sqlite'|'json'} [opts.backend] - backend driver ('sqlite' or 'json')
 * @param {string} opts.dbPath - path to SQLite file (sqlite) or storage dir (json)
 * @param {object} opts.paths - resolved absolute paths from npos.config
 * @param {string} opts.projectRoot
 * @param {function} [opts.onChange] - event emitter callback ({ type, payload })
 */
export default function createDataLayer(opts) {
  const backend = opts.backend || process.env.DATA_LAYER_BACKEND || 'sqlite';
  if (backend === 'json') {
    return createJsonDataLayer(opts);
  }
  return createSqliteDataLayer(opts);
}
