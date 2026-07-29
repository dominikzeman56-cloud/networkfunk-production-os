// NPOS Central Configuration
// Reads npos.config.json from project root and resolves all paths

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve project root robustly:
// 1) Prefer npos.config.json walking up from this file
// 2) Fallback: Astro cwd is Web/ → parent is project root
function findProjectRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  let dir = here;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'npos.config.json');
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Astro dev/build usually runs with cwd = Web/
  const fromCwd = path.resolve(process.cwd(), '..');
  if (fs.existsSync(path.join(fromCwd, 'npos.config.json'))) return fromCwd;
  if (fs.existsSync(path.join(process.cwd(), 'npos.config.json'))) return process.cwd();
  return fromCwd;
}

const PROJECT_ROOT = findProjectRoot();
const CONFIG_PATH = path.join(PROJECT_ROOT, 'npos.config.json');

interface NposConfig {
  paths: {
    data: string;
    sessions: string;
    sessionFile: string;
    buildSheets: string;
    knowledge: string;
    framework: string;
    producerKnowledge: string;
    presets: string;
    caseStudies: string;
    sessionManagement: string;
    templates: string;
    troubleshooting: string;
    references: string;
    webFrontend?: string;
    apiServer?: string;
  };
  external?: {
    serum1Presets?: string;
    serum2Presets?: string;
    obsidianVault?: string;
    neuromanPath?: string;
  };
  server: { port: number; host: string };
  web: { port: number; host: string };
  neuroman: { port: number };
  ai: { provider: string; model: string; maxTokens: number };
  audioAnalyzer: { binPath: string; timeoutMs: number };
  ableton: { mcpPackage: string };
}

const DEFAULTS: NposConfig = {
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
  },
  external: {
    serum1Presets: '',
    serum2Presets: '',
    obsidianVault: '',
    neuromanPath: '',
  },
  server: { port: 3099, host: 'localhost' },
  web: { port: 4321, host: 'localhost' },
  neuroman: { port: 5000 },
  ai: { provider: 'anthropic', model: 'claude-sonnet-4-20250514', maxTokens: 300 },
  audioAnalyzer: { binPath: '', timeoutMs: 30000 },
  ableton: { mcpPackage: '@xiaolaa2/ableton-copilot-mcp' },
};

function loadConfig(): NposConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      paths: { ...DEFAULTS.paths, ...(parsed.paths || {}) },
      external: { ...DEFAULTS.external, ...(parsed.external || {}) },
      server: { ...DEFAULTS.server, ...(parsed.server || {}) },
      web: { ...DEFAULTS.web, ...(parsed.web || {}) },
      neuroman: { ...DEFAULTS.neuroman, ...(parsed.neuroman || {}) },
      ai: { ...DEFAULTS.ai, ...(parsed.ai || {}) },
      audioAnalyzer: { ...DEFAULTS.audioAnalyzer, ...(parsed.audioAnalyzer || {}) },
      ableton: { ...DEFAULTS.ableton, ...(parsed.ableton || {}) },
    };
  } catch (err) {
    console.error(`[NPOS] Failed to load config from ${CONFIG_PATH}:`, err);
    return DEFAULTS;
  }
}

const config = loadConfig();

/** Resolve a relative path from npos.config.json against the project root */
function resolve(relativePath: string): string {
  if (!relativePath) return '';
  if (path.isAbsolute(relativePath)) return relativePath;
  return path.resolve(PROJECT_ROOT, relativePath);
}

/** Project root absolute path */
export const projectRoot = PROJECT_ROOT;

/** All resolved absolute paths */
export const paths = {
  data: resolve(config.paths.data),
  sessions: resolve(config.paths.sessions),
  sessionFile: resolve(config.paths.sessionFile),
  buildSheets: resolve(config.paths.buildSheets),
  knowledge: resolve(config.paths.knowledge),
  framework: resolve(config.paths.framework),
  producerKnowledge: resolve(config.paths.producerKnowledge),
  presets: resolve(config.paths.presets),
  caseStudies: resolve(config.paths.caseStudies),
  sessionManagement: resolve(config.paths.sessionManagement),
  templates: resolve(config.paths.templates),
  troubleshooting: resolve(config.paths.troubleshooting),
  references: resolve(config.paths.references),
} as const;

/** Optional external paths (may be empty strings) */
export const external = {
  serum1Presets: resolve(config.external?.serum1Presets || ''),
  serum2Presets: resolve(config.external?.serum2Presets || ''),
  obsidianVault: resolve(config.external?.obsidianVault || ''),
  neuromanPath: resolve(config.external?.neuromanPath || ''),
} as const;

export const server = config.server;
export const web = config.web;
export const neuroman = config.neuroman;
export const ai = config.ai;
export const audioAnalyzer = config.audioAnalyzer;
export const ableton = config.ableton;

/** API base URL for browser-side fetch calls */
export const apiBase =
  process.env.PUBLIC_API_URL ||
  `http://${server.host || 'localhost'}:${server.port || 3099}`;

export default config;
