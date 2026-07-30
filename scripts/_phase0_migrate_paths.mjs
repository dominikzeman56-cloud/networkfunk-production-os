/**
 * Phase 0 — strip hardcoded D:/ObsidianVault paths from Web sources.
 * Run once from project root: node _phase0_migrate_paths.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content, 'utf8');
  console.log('WROTE', rel);
}
function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

// ── config.ts: fix PROJECT_ROOT fallback ──────────────────────────
{
  let s = read('Web/src/lib/config.ts');
  const bad = `const fromCwd = path.resolve(process.cwd(), '.');
  if (fs.existsSync(path.join(fromCwd, 'npos.config.json'))) return fromCwd;
  if (fs.existsSync(path.join(process.cwd(), 'npos.config.json'))) return process.cwd();
  return fromCwd;`;
  const good = `const parentOfCwd = path.resolve(process.cwd(), '..');
  if (fs.existsSync(path.join(parentOfCwd, 'npos.config.json'))) return parentOfCwd;
  if (fs.existsSync(path.join(process.cwd(), 'npos.config.json'))) return process.cwd();
  return parentOfCwd;`;
  if (s.includes(bad)) {
    s = s.replace(bad, good);
    write('Web/src/lib/config.ts', s);
  } else if (s.includes("path.resolve(process.cwd(), '..')")) {
    console.log('SKIP config.ts already good');
  } else {
    // broader replace
    s = s.replace(
      /const fromCwd = path\.resolve\(process\.cwd\(\), ['"]\.['"]\);[\s\S]*?return fromCwd;/,
      good
    );
    write('Web/src/lib/config.ts', s);
  }
}

function ensureImport(src, importLine) {
  if (src.includes("from '../lib/config'") || src.includes("from '../../lib/config'") || src.includes('from "../lib/config"') || src.includes('from "../../lib/config"')) {
    return src;
  }
  // insert after last import in frontmatter
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) {
    // plain ts
    if (src.startsWith('import ')) {
      const lines = src.split('\n');
      let lastImport = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) lastImport = i;
      }
      lines.splice(lastImport + 1, 0, importLine);
      return lines.join('\n');
    }
    return importLine + '\n' + src;
  }
  const body = m[1];
  const newBody = body.trimEnd() + '\n' + importLine;
  return src.replace(m[0], `---\n${newBody}\n---`);
}

function stripHardcoded(src) {
  return src
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/data\/session\.json['"]/g, 'paths.sessionFile')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/data\/sessions['"]/g, 'paths.sessions')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Data\/session\.json['"]/g, 'paths.sessionFile')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Data\/sessions['"]/g, 'paths.sessions')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Knowledge['"]/g, 'paths.knowledge')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Framework['"]/g, 'paths.framework')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Producer-Knowledge['"]/g, 'paths.producerKnowledge')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Session-Management['"]/g, 'paths.sessionManagement')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Presets['"]/g, 'paths.presets')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/Case-Studies['"]/g, 'paths.caseStudies')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os\/session\.json['"]/g, 'paths.sessionFile')
    .replace(/['"]D:\/ObsidianVault\/networkfunk-production-os['"]/g, 'projectRoot');
}

// Fix broken relative imports like '././layouts'
function fixBrokenImports(src) {
  return src
    .replace(/from ['"]\.\/\.\/layouts\//g, "from '../../layouts/")
    .replace(/from ['"]\.\/\.\/lib\//g, "from '../../lib/")
    .replace(/from ['"]\.\.\/\.\.\/\.\.\/layouts\//g, "from '../../layouts/")
    .replace(/from ['"]\.\.\/\.\.\/\.\.\/lib\//g, "from '../../lib/");
}

const pageSpecs = [
  { file: 'Web/src/pages/index.astro', importLine: "import { paths } from '../lib/config';" },
  { file: 'Web/src/pages/knowledge/index.astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/knowledge/[slug].astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/framework/index.astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/framework/[slug].astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/producer/index.astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/producer/[slug].astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/session/index.astro', importLine: "import { paths } from '../../lib/config';" },
  { file: 'Web/src/pages/session/[slug].astro', importLine: "import { paths } from '../../lib/config';" },
];

for (const { file, importLine } of pageSpecs) {
  if (!exists(file)) {
    console.log('MISSING', file);
    continue;
  }
  let s = read(file);
  s = fixBrokenImports(s);
  const before = s;
  s = stripHardcoded(s);
  if (s.includes('paths.') || s !== before) {
    s = ensureImport(s, importLine);
  }
  if (s !== before || s.includes("from '../../lib/config'") || s.includes("from '../lib/config'")) {
    write(file, s);
  } else {
    console.log('UNCH', file);
  }
}

// SearchModal
{
  const file = 'Web/src/components/SearchModal.astro';
  if (exists(file)) {
    let s = read(file);
    s = ensureImport(s, "import { paths, projectRoot } from '../lib/config';");
    s = s.replace(
      /const base = ['"]D:\/ObsidianVault\/networkfunk-production-os['"];?/,
      'const base = projectRoot;'
    );
    // also if already partially migrated
    s = stripHardcoded(s);
    write(file, s);
  }
}

// collections.ts
{
  const file = 'Web/src/content/collections.ts';
  if (exists(file)) {
    let s = read(file);
    if (!s.includes("from '../lib/config'")) {
      s = `import { paths } from '../lib/config';\n` + s;
    }
    s = s
      .replace(/base:\s*['"]D:\/ObsidianVault\/networkfunk-production-os\/Framework['"]/g, 'base: paths.framework')
      .replace(/base:\s*['"]D:\/ObsidianVault\/networkfunk-production-os\/Knowledge['"]/g, 'base: paths.knowledge')
      .replace(/base:\s*['"]D:\/ObsidianVault\/networkfunk-production-os\/Presets['"]/g, 'base: paths.presets');
    // fix missing z import if needed
    if (s.includes('z.string') && !s.includes("from 'zod'") && !s.includes('from "zod"')) {
      s = `import { z } from 'zod';\n` + s;
    }
    write(file, s);
  }
}

// producer-pal.ts demo path
{
  const file = 'Web/src/lib/producer-pal.ts';
  if (exists(file)) {
    let s = read(file);
    if (s.includes('D:/ObsidianVault')) {
      if (!s.includes("from './config'") && !s.includes('from "./config"')) {
        // add import near top after existing imports
        const lines = s.split('\n');
        let lastImport = -1;
        for (let i = 0; i < lines.length; i++) {
          if (/^import\s/.test(lines[i])) lastImport = i;
        }
        if (lastImport >= 0) {
          lines.splice(lastImport + 1, 0, "import { paths } from './config';");
          s = lines.join('\n');
        }
      }
      s = s.replace(
        /['"]D:\/ObsidianVault\/networkfunk-production-os\/session\.json['"]/g,
        'paths.sessionFile'
      );
      write(file, s);
    } else {
      console.log('SKIP producer-pal already clean');
    }
  }
}

// presets/index.astro — serum paths via external config (keep placeholder empty-safe)
{
  const file = 'Web/src/pages/presets/index.astro';
  if (exists(file)) {
    let s = read(file);
    if (s.includes('D:/VST') || s.includes('D:/ObsidianVault')) {
      s = ensureImport(s, "import { external } from '../../lib/config';");
      s = s
        .replace(/const serum1Path = ['"]D:\/VST\/Xfer\/Serum Presets\/Presets['"];?/, "const serum1Path = external.serum1Presets || '';")
        .replace(/const serum2Path = ['"]D:\/VST\/Xfer\/Serum 2 Presets\/Presets['"];?/, "const serum2Path = external.serum2Presets || '';");
      write(file, s);
    }
  }
}

console.log('\nDone. Remaining hardcoded scan:');
function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(ts|astro|js|mjs|tsx)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}
const hits = [];
for (const f of walk(path.join(root, 'Web/src'))) {
  const t = fs.readFileSync(f, 'utf8');
  if (/D:\/ObsidianVault|D:\\\\ObsidianVault/.test(t)) {
    hits.push(path.relative(root, f));
  }
}
console.log(hits.length ? hits.join('\n') : 'NONE in Web/src');
