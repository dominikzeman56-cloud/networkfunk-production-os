/**
 * NPOS Phase 1 — data layer smoke tests (no server required)
 * Run: npm run test:data-layer
 */
import { existsSync, unlinkSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createDataLayer } from './data-layer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const TMP = join(PROJECT_ROOT, 'Data', '_test_tmp');
const DB = join(TMP, 'test.sqlite');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

// clean slate
if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const paths = {
  data: TMP,
  sessions: join(TMP, 'sessions'),
  sessionFile: join(TMP, 'session.json'),
  buildSheets: join(TMP, 'build-sheets'),
  knowledge: join(PROJECT_ROOT, 'Knowledge'),
  framework: join(PROJECT_ROOT, 'Framework'),
  producerKnowledge: join(PROJECT_ROOT, 'Producer-Knowledge'),
  presets: join(PROJECT_ROOT, 'Presets'),
  caseStudies: join(PROJECT_ROOT, 'Case-Studies'),
  sessionManagement: join(PROJECT_ROOT, 'Session-Management'),
  templates: join(PROJECT_ROOT, 'Templates'),
  troubleshooting: join(PROJECT_ROOT, 'Troubleshooting'),
  references: join(PROJECT_ROOT, 'References'),
};

mkdirSync(paths.sessions, { recursive: true });
mkdirSync(paths.buildSheets, { recursive: true });

// seed a tiny session.json for migrate
const seedSession = {
  $schema: 'session',
  version: 1,
  currentProject: 'test-track',
  projects: {
    'test-track': {
      name: 'Test Track',
      artist: 'NPOS',
      version: 'v1',
      tempo: 174,
      key: 'Fm',
      stage: 'Mixing',
      stageIdx: 2,
      totalStages: 5,
      stages: ['Sound Design', 'Arrangement', 'Mixing', 'Mastering', 'Export'],
      goal: 'Fix low end',
      problem: 'Muddy bass',
      reference: { track: 'Static', artist: 'Burr Oak' },
      sessionFocus: 'MIX',
      lastStep: 'EQ pass',
      nextStep: 'Sidechain kick',
      notes: [{ type: 'issue', text: 'Kick/bass clash' }],
      priorities: [{ done: false, text: 'Check mono low end' }],
      createdAt: '2026-07-28',
      updatedAt: '2026-07-28',
    },
  },
};
writeFileSync(paths.sessionFile, JSON.stringify(seedSession, null, 2));
writeFileSync(
  join(paths.buildSheets, 'sheet-1.json'),
  JSON.stringify({ title: 'Sheet One', goal: 'Drop energy' }, null, 2)
);
writeFileSync(
  join(paths.sessions, 'log-1.json'),
  JSON.stringify({ title: 'Log One', notes: 'worked on reese' }, null, 2)
);

console.log('\nNPOS data-layer smoke tests\n');

const layer = createDataLayer({
  dbPath: DB,
  paths,
  projectRoot: PROJECT_ROOT,
});

// 1. migrate
const mig = layer.migrateFromJson({ force: true });
assert(mig.ok === true, 'migrateFromJson ok');
assert(mig.report?.session === true, 'migrated session.json');
assert(mig.report?.buildSheets >= 1, 'migrated build sheets');
assert(mig.report?.logs >= 1, 'migrated logs');
assert(mig.report?.knowledge?.count > 0, `knowledge indexed (${mig.report?.knowledge?.count})`);

// 2. session roundtrip
const session = layer.getSession();
assert(session.currentProject === 'test-track', 'currentProject preserved');
assert(session.projects['test-track']?.name === 'Test Track', 'project name preserved');
assert(session.projects['test-track']?.tempo === 174, 'tempo preserved');

session.projects['test-track'].nextStep = 'Bus compression';
const save = layer.saveSession(session);
assert(save.ok === true, 'saveSession ok');
const again = layer.getSession();
assert(again.projects['test-track'].nextStep === 'Bus compression', 'session update persisted');

// 3. build sheet
const sheetRes = layer.saveBuildSheet('sheet-new', { title: 'New Sheet', concept: 'Reese' });
assert(sheetRes.ok === true, 'saveBuildSheet ok');
const sheets = layer.listBuildSheets();
assert(sheets.some((s) => s.id === 'sheet-new'), 'listBuildSheets includes new');
assert(layer.getBuildSheet('sheet-new')?.title === 'New Sheet', 'getBuildSheet works');

// 4. log
const logRes = layer.saveLog('log-new', { title: 'New Log', goal: 'Finish drop' });
assert(logRes.ok === true, 'saveLog ok');
assert(layer.listLogs(10).some((l) => l.id === 'log-new'), 'listLogs includes new');

// 5. knowledge index
const idx = layer.getKnowledgeIndex();
assert(idx.count > 10, `knowledge index has docs (${idx.count})`);
assert(Array.isArray(idx.categories) && idx.categories.length > 0, 'knowledge categories present');
const first = idx.items[0];
if (first) {
  const doc = layer.getKnowledgeDoc(first.id);
  assert(!!doc && !!doc.title, `getKnowledgeDoc(${first.id})`);
}

// 6. search
const search = layer.searchAll('bass', { limit: 10 });
assert(search.count > 0, `search "bass" returns results (${search.count})`);
assert(search.results.every((r) => r.score > 0), 'search results scored');

// 7. dashboard push
const dash = layer.writeDashboardFromSession(layer.getSession());
assert(dash.ok === true, 'writeDashboardFromSession ok');
assert(existsSync(dash.path), 'Dashboard.md written');

// 8. stats
const stats = layer.getStats();
assert(stats.projects >= 1, `stats.projects=${stats.projects}`);
assert(stats.knowledge > 0, `stats.knowledge=${stats.knowledge}`);

// 9. skip re-migrate
const skip = layer.migrateFromJson({ force: false });
assert(skip.skipped === true, 'second migrate skipped');

layer.close();

// cleanup test db dir (keep Dashboard.md at vault root — do not delete)
try {
  if (existsSync(DB)) unlinkSync(DB);
  if (existsSync(DB + '-wal')) unlinkSync(DB + '-wal');
  if (existsSync(DB + '-shm')) unlinkSync(DB + '-shm');
  rmSync(TMP, { recursive: true, force: true });
} catch (err) {
  console.warn('cleanup warning:', err.message);
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exitCode = failed > 0 ? 1 : 0;
