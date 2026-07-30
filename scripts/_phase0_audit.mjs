/**
 * Phase 0 — audit for hardcoded absolute paths in Web sources.
 * Run from project root: node scripts/_phase0_audit.mjs
 *
 * Scans Web/src for any D:/ObsidianVault or D:\ObsidianVault references
 * and reports files that still contain them.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const skipDirs = new Set(['node_modules', '.git', 'dist', '.astro']);

function walk(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (skipDirs.has(e.name)) continue;
      walk(p, acc);
    } else if (/\.(astro|ts|js|mjs|tsx|json)$/i.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

// Match any D:/ObsidianVault or D:\ObsidianVault reference
const reHardcoded = /D:[\\/]ObsidianVault/;

const skipName = (f) =>
  /package-lock|_phase0|Blueprint|AGENTS-HANDOFF|node_modules/.test(path.basename(f));

const webSrc = path.join(root, 'Web', 'src');
const hits = [];

if (fs.existsSync(webSrc)) {
  const files = walk(webSrc);
  for (const f of files) {
    if (skipName(f)) continue;
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    if (reHardcoded.test(content)) {
      hits.push(path.relative(root, f));
    }
  }
}

console.log('=== Phase 0 Audit: Hardcoded Path Scan ===\n');

if (hits.length === 0) {
  console.log('✅ No hardcoded D:/ObsidianVault paths found in Web/src');
} else {
  console.log(`❌ Found ${hits.length} file(s) with hardcoded paths:`);
  hits.forEach((h) => console.log(`  - ${h}`));
}

// Also check for other absolute Windows paths (e.g., C:\Users\...)
const reWinAbs = /[A-Z]:\\[^\\]/;
const winHits = [];
if (fs.existsSync(webSrc)) {
  const files = walk(webSrc);
  for (const f of files) {
    if (skipName(f)) continue;
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    // Look for absolute paths that aren't in comments or strings
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      // Skip comment lines
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) return;
      if (reWinAbs.test(line) && !line.includes('process.env') && !line.includes('import.meta.env')) {
        winHits.push(`${path.relative(root, f)}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    });
  }
}

if (winHits.length > 0) {
  console.log(`\n⚠️  Other absolute paths found:`);
  winHits.forEach((h) => console.log(`  - ${h}`));
}

// Check .env.example for required vars
const envExample = path.join(root, '.env.example');
if (fs.existsSync(envExample)) {
  const envContent = fs.readFileSync(envExample, 'utf8');
  const required = ['ANTHROPIC_API_KEY', 'PORT', 'PUBLIC_API_URL'];
  const missing = required.filter((v) => !envContent.includes(v));
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing env vars in .env.example: ${missing.join(', ')}`);
  } else {
    console.log('\n✅ All required env vars documented in .env.example');
  }
}

// Check .gitignore for .env
const gitignore = path.join(root, '.gitignore');
if (fs.existsSync(gitignore)) {
  const gi = fs.readFileSync(gitignore, 'utf8');
  if (gi.includes('.env')) {
    console.log('✅ .env is in .gitignore');
  } else {
    console.log('❌ .env is NOT in .gitignore');
  }
}

console.log('\n=== Audit Complete ===');
