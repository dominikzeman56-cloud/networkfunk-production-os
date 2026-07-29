#!/usr/bin/env node
// NPOS Startup — launches API server and Web frontend concurrently
// Used by `npm start` at the project root

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function launch(name, cmd, args, cwd) {
  const proc = spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  proc.on('error', (err) => console.error(`[${name}] failed to start:`, err.message));
  proc.on('exit', (code) => {
    if (code !== 0) console.error(`[${name}] exited with code ${code}`);
  });
  return proc;
}

console.log('Starting Neurofunk Production OS...\n');

const server = launch('API',  'node', ['api.js'],   join(__dirname, 'server'));
const web    = launch('Web',  'npm',  ['run', 'dev'], join(__dirname, 'web'));

function shutdown() {
  console.log('\nShutting down NPOS...');
  server.kill();
  web.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
