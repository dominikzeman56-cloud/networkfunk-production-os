#!/usr/bin/env node
/**
 * NPOS Phase 1 — Migrate JSON file store to SQLite
 *
 * Usage:
 *   node migrate-json-to-sqlite.js
 *   node migrate-json-to-sqlite.js --force
 *   node migrate-json-to-sqlite.js --reindex-only
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { createDataLayer } from './data-layer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function loadConfig() {
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
  };
  if (!existsSync(configPath)) return defaults;
  try {
    const parsed = JSON.parse(readFileSync(configPath, 'utf8'));
    return {
      ...defaults,
      ...parsed,
      paths: { ...defaults.paths, ...(parsed.paths || {}) },
    };
  } catch {
    return defaults;
  }
}

function resolvePath(p) {
  if (!p) return '';
  if (isAbsolute(p)) return p;
  return resolve(PROJECT_ROOT, p);
}

const force = process.argv.includes('--force');
const reindexOnly = process.argv.includes('--reindex-only');

const cfg = loadConfig();
const paths = {
  data: resolvePath(cfg.paths.data),
  sessions: resolvePath(cfg.paths.sessions),
  sessionFile: resolvePath(cfg.paths.sessionFile),
  buildSheets: resolvePath(cfg.paths.buildSheets),
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

const dbPath = resolvePath(cfg.paths.database || join(cfg.paths.data, 'npos.sqlite'));

console.log('NPOS JSON -> SQLite migration');
console.log('  project root:', PROJECT_ROOT);
console.log('  database:    ', dbPath);

const layer = createDataLayer({ dbPath, paths, projectRoot: PROJECT_ROOT });

try {
  if (reindexOnly) {
    const result = layer.reindexKnowledge();
    console.log('Knowledge reindex:', result);
  } else {
    const result = layer.migrateFromJson({ force });
    console.log(JSON.stringify(result, null, 2));
  }
  console.log('Stats:', layer.getStats());
  process.exitCode = 0;
} catch (err) {
  console.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  layer.close();
}
