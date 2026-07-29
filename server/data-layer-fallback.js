/**
 * NPOS Fallback Data Layer (for testing without SQLite)
 * JSON file-based CRUD for sessions, projects, build sheets, logs, presets.
 * Also: knowledge index, full-text search, Dashboard.md bidirectional sync.
 *
 * Usage:
 *   import { createDataLayer } from './data-layer-fallback.js';
 *   const db = createDataLayer({ dbPath: './fallback.sqlite', paths, projectRoot });
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'fs';
import { join, dirname, basename, extname, relative } from 'path';

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
  return JSON.stringify(val, null, 2);
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

// ──────── DATA LAYER FACTORY ────────

/**
 * @param {object} opts
 * @param {string} opts.dbPath - path to storage directory
 * @param {object} opts.paths - resolved absolute paths from npos.config
 * @param {string} opts.projectRoot
 * @param {function} [opts.onChange] - event emitter callback ({ type, payload })
 */
export function createDataLayer(opts) {
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
    // Try to load from session.json first
    if (paths.sessionFile && existsSync(paths.sessionFile)) {
      try {
        const session = safeJsonParse(readFileSync(paths.sessionFile, 'utf8'), null);
        if (session) return session;
      } catch {
        // Fall through to rebuild
      }
    }

    // Rebuild from projects
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

  function saveSession(session, { syncDashboard = true, syncJsonFile = true } = {}) {
    if (!session || typeof session !== 'object') {
      throw new Error('session must be an object');
    }
    const ts = nowIso();
    const projects = session.projects || {};

    // Save all projects
    for (const [id, p] of Object.entries(projects)) {
      const row = projectToRow(id, p);
      const projectData = rowToProject(row);
      storage.write('project', id, projectData);
    }

    // Save session state
    storage.write('session_state', '1', {
      current_project: session.currentProject || null,
      version: session.version || 1,
      updated_at: ts,
    });

    if (syncJsonFile && paths.sessionFile) {
      try {
        const dir = dirname(paths.sessionFile);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(paths.sessionFile, safeJsonStringify(session), 'utf8');
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

  // ──────── BUILD SHEETS ────────

  function listBuildSheets() {
    return storage.list('build_sheet');
  }

  function getBuildSheet(id) {
    return storage.read('build_sheet', id);
  }

  function saveBuildSheet(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `sheet-${Date.now()}`;
    const existing = storage.read('build_sheet', slug);
    const payload = { ...data, id: slug };
    delete payload.id;

    const sheetData = {
      id: slug,
      title: data.title || data.name || slug,
      projectId: data.projectId || data.project_id || null,
      createdAt: existing?.createdAt || data.createdAt || ts,
      updatedAt: ts,
      ...payload,
    };

    storage.write('build_sheet', slug, sheetData);

    // Mirror to JSON file for backward compat
    if (paths.buildSheets) {
      try {
        if (!existsSync(paths.buildSheets)) mkdirSync(paths.buildSheets, { recursive: true });
        writeFileSync(
          join(paths.buildSheets, `${slug}.json`),
          safeJsonStringify({ ...payload, updatedAt: ts }),
          'utf8'
        );
      } catch (err) {
        console.error('[data-layer] build-sheet file mirror failed:', err.message);
      }
    }

    emit('build-sheet', sheetData);
    return { ok: true, id: slug, sheet: sheetData };
  }

  // ──────── SESSION LOGS ────────

  function listLogs(limit = 20) {
    const logs = storage.list('session_log');
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  }

  function saveLog(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `session-${Date.now()}`;
    const existing = storage.read('session_log', slug);
    const payload = { ...data, id: slug };
    delete payload.id;

    const logData = {
      id: slug,
      projectId: data.projectId || data.project_id || null,
      title: data.title || data.name || slug,
      createdAt: existing?.createdAt || data.createdAt || ts,
      updatedAt: ts,
      ...payload,
    };

    storage.write('session_log', slug, logData);

    if (paths.sessions) {
      try {
        if (!existsSync(paths.sessions)) mkdirSync(paths.sessions, { recursive: true });
        writeFileSync(
          join(paths.sessions, `${slug}.json`),
          safeJsonStringify({ ...payload, createdAt: existing?.createdAt || ts }),
          'utf8'
        );
      } catch (err) {
        console.error('[data-layer] log file mirror failed:', err.message);
      }
    }

    emit('log', logData);
    return { ok: true, id: slug };
  }

  // ──────── PRESETS ────────

  function listPresets() {
    return storage.list('preset');
  }

  function savePreset(id, data = {}) {
    const ts = nowIso();
    const slug = id || data.id || `preset-${Date.now()}`;
    const existing = storage.read('preset', slug);
    const payload = { ...data, id: slug };
    delete payload.id;

    const presetData = {
      id: slug,
      name: data.name || slug,
      category: data.category || null,
      source: data.source || null,
      createdAt: existing?.createdAt || ts,
      updatedAt: ts,
      ...payload,
    };

    storage.write('preset', slug, presetData);
    emit('preset', presetData);
    return { ok: true, id: slug };
  }

  // ──────── KNOWLEDGE INDEX ────────

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

    // Clear existing knowledge
    const existing = storage.list('knowledge_doc');
    for (const doc of existing) {
      storage.delete('knowledge_doc', doc.id);
    }

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

        const docData = {
          id,
          path: rel,
          category: src.category,
          title,
          slug,
          summary: summaryFromMarkdown(content),
          tags,
          mtimeMs: st.mtimeMs,
          sizeBytes: st.size,
          content: includeContent ? content : null,
          indexedAt: ts,
        };

        storage.write('knowledge_doc', id, docData);
        count += 1;
      }
    }

    emit('knowledge-index', { count, indexedAt: ts });
    return { ok: true, count, indexedAt: ts };
  }

  function getKnowledgeIndex({ category } = {}) {
    const docs = storage.list('knowledge_doc');

    const byCategory = {};
    const items = docs
      .filter(doc => !category || doc.category === category)
      .map((doc) => {
        const item = {
          id: doc.id,
          path: doc.path,
          category: doc.category,
          title: doc.title,
          slug: doc.slug,
          summary: doc.summary,
          tags: doc.tags || [],
          mtimeMs: doc.mtimeMs,
          sizeBytes: doc.sizeBytes,
          indexedAt: doc.indexedAt,
        };
        if (!byCategory[doc.category]) byCategory[doc.category] = [];
        byCategory[doc.category].push(item);
        return item;
      });

    return {
      count: items.length,
      indexedAt: items.length > 0 ? items[0].indexedAt : null,
      categories: Object.keys(byCategory).sort(),
      byCategory,
      items,
    };
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
        // phrase boost
        if (hay.includes(q.toLowerCase())) score += 8;
        if (score > 0) {
          results.push({
            type: 'knowledge',
            id: doc.id,
            title: doc.title,
            category: doc.category,
            path: doc.path,
            snippet: doc.summary || '',
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

  // ──────── DASHBOARD SYNC ────────

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

  // ──────── MIGRATION FROM JSON FILES ────────

  function migrateFromJson({ force = false } = {}) {
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

    // knowledge index
    try {
      report.knowledge = reindexKnowledge();
    } catch (err) {
      report.errors.push(`knowledge: ${err.message}`);
    }

    const ts = nowIso();
    emit('migrate', report);
    return { ok: true, skipped: false, at: ts, report };
  }

  function getStats() {
    const session = getSession();
    return {
      dbPath,
      projects: storage.list('project').length,
      buildSheets: storage.list('build_sheet').length,
      logs: storage.list('session_log').length,
      presets: storage.list('preset').length,
      knowledge: storage.list('knowledge_doc').length,
      currentProject: session.currentProject || null,
      migratedAt: null,
      knowledgeIndexedAt: null,
    };
  }

  function close() {
    // No-op for JSON storage
  }

  // Auto-migrate on first boot
  try {
    migrateFromJson({ force: false });
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

export default createDataLayer;