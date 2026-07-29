#!/usr/bin/env node
/**
 * NPOS Phase 1 Test Suite
 * Tests all Phase 1 API endpoints and functionality
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';
import WebSocket from 'ws';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const API_URL = 'http://localhost:3099';
const WS_URL = 'ws://localhost:3099/ws';

// Test data
const testSession = {
  $schema: "session",
  version: 1,
  currentProject: "test-neurofunk",
  projects: {
    "test-neurofunk": {
      name: "Test Neurofunk Track",
      artist: "Test Artist",
      version: "0.1.0",
      tempo: 174,
      key: "D# minor",
      stage: "Sound Design",
      stageIdx: 0,
      totalStages: 5,
      stages: ["Sound Design", "Arrangement", "Mixing", "Mastering", "Export"],
      goal: "Create initial bass patch",
      problem: "Need to find the right wavetable",
      reference: {
        track: "The Approach",
        artist: "Noisia"
      },
      sessionFocus: "Bass sound design",
      lastStep: "Loaded Serum",
      nextStep: "Design initial wavetable",
      notes: [
        { type: "breakthrough", text: "Found a good starting wavetable" },
        { type: "issue", text: "Need to adjust filter envelope" }
      ],
      priorities: [
        { done: false, text: "Design initial bass patch" },
        { done: false, text: "Set up project structure" },
        { done: true, text: "Load reference track" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
};

const testBuildSheet = {
  title: "Test Build Sheet",
  projectId: "test-neurofunk",
  concept: "Initial bass design",
  steps: [
    "Load Serum",
    "Select wavetable",
    "Adjust filter",
    "Set up envelope"
  ]
};

const testLog = {
  title: "Test Session Log",
  projectId: "test-neurofunk",
  notes: "Started working on bass sound design"
};

const testPreset = {
  name: "Test Bass Preset",
  category: "bass",
  source: "Serum",
  parameters: {
    wavetable: "Basic Shapes",
    filter: "Lowpass 24"
  }
};

class NposTester {
  constructor() {
    this.serverProcess = null;
    this.ws = null;
    this.wsEvents = [];
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting NPOS server...');
      this.serverProcess = spawn('node', ['--watch', 'api.js'], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('NPOS API Server (Phase 1) running')) {
          console.log('Server started successfully');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error(`Server error: ${data}`);
      });

      this.serverProcess.on('error', (err) => {
        reject(err);
      });

      // Wait up to 10 seconds for server to start
      setTimeout(() => {
        if (!this.serverStarted) {
          reject(new Error('Server failed to start within 10 seconds'));
        }
      }, 10000);
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      console.log('Stopping NPOS server...');
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async testHealthEndpoint() {
    console.log('\n=== Testing Health Endpoint ===');
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ Health endpoint working');
        console.log(`   Status: ${data.status}`);
        console.log(`   Database: ${data.database}`);
        console.log(`   Phase: ${data.phase}`);
        console.log(`   WebSocket: ${data.websocket}`);
        return true;
      } else {
        console.error('❌ Health endpoint failed:', data);
        return false;
      }
    } catch (err) {
      console.error('❌ Health endpoint error:', err.message);
      return false;
    }
  }

  async testSessionEndpoints() {
    console.log('\n=== Testing Session Endpoints ===');

    // Test GET /api/session (should return empty or default session)
    try {
      const getResponse = await fetch(`${API_URL}/api/session`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/session working');
        console.log(`   Current project: ${getData.currentProject || 'none'}`);
      } else {
        console.error('❌ GET /api/session failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/session error:', err.message);
      return false;
    }

    // Test POST /api/session
    try {
      const postResponse = await fetch(`${API_URL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testSession)
      });
      const postData = await postResponse.json();

      if (postResponse.ok) {
        console.log('✅ POST /api/session working');
        console.log(`   Updated at: ${postData.updatedAt}`);

        // Verify the session was saved
        const verifyResponse = await fetch(`${API_URL}/api/session`);
        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok && verifyData.currentProject === testSession.currentProject) {
          console.log('✅ Session verification successful');
          return true;
        } else {
          console.error('❌ Session verification failed:', verifyData);
          return false;
        }
      } else {
        console.error('❌ POST /api/session failed:', postData);
        return false;
      }
    } catch (err) {
      console.error('❌ POST /api/session error:', err.message);
      return false;
    }
  }

  async testBuildSheetsEndpoints() {
    console.log('\n=== Testing Build Sheets Endpoints ===');

    // Test GET /api/build-sheets (should return empty array initially)
    try {
      const getResponse = await fetch(`${API_URL}/api/build-sheets`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/build-sheets working');
        console.log(`   Found ${getData.length} build sheets`);
      } else {
        console.error('❌ GET /api/build-sheets failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/build-sheets error:', err.message);
      return false;
    }

    // Test POST /api/build-sheets
    try {
      const postResponse = await fetch(`${API_URL}/api/build-sheets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testBuildSheet)
      });
      const postData = await postResponse.json();

      if (postResponse.ok) {
        console.log('✅ POST /api/build-sheets working');
        console.log(`   Created build sheet with ID: ${postData.id}`);

        // Test GET /api/build-sheets/:id
        const getSingleResponse = await fetch(`${API_URL}/api/build-sheets/${postData.id}`);
        const getSingleData = await getSingleResponse.json();

        if (getSingleResponse.ok) {
          console.log('✅ GET /api/build-sheets/:id working');
          console.log(`   Retrieved build sheet: ${getSingleData.title}`);
          return true;
        } else {
          console.error('❌ GET /api/build-sheets/:id failed:', getSingleData);
          return false;
        }
      } else {
        console.error('❌ POST /api/build-sheets failed:', postData);
        return false;
      }
    } catch (err) {
      console.error('❌ POST /api/build-sheets error:', err.message);
      return false;
    }
  }

  async testLogsEndpoints() {
    console.log('\n=== Testing Logs Endpoints ===');

    // Test GET /api/logs (should return empty array initially)
    try {
      const getResponse = await fetch(`${API_URL}/api/logs`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/logs working');
        console.log(`   Found ${getData.length} logs`);
      } else {
        console.error('❌ GET /api/logs failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/logs error:', err.message);
      return false;
    }

    // Test POST /api/logs
    try {
      const postResponse = await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLog)
      });
      const postData = await postResponse.json();

      if (postResponse.ok) {
        console.log('✅ POST /api/logs working');
        console.log(`   Created log with ID: ${postData.id}`);
        return true;
      } else {
        console.error('❌ POST /api/logs failed:', postData);
        return false;
      }
    } catch (err) {
      console.error('❌ POST /api/logs error:', err.message);
      return false;
    }
  }

  async testPresetsEndpoints() {
    console.log('\n=== Testing Presets Endpoints ===');

    // Test GET /api/presets (should return empty array initially)
    try {
      const getResponse = await fetch(`${API_URL}/api/presets`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/presets working');
        console.log(`   Found ${getData.length} presets`);
      } else {
        console.error('❌ GET /api/presets failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/presets error:', err.message);
      return false;
    }

    // Test POST /api/presets
    try {
      const postResponse = await fetch(`${API_URL}/api/presets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPreset)
      });
      const postData = await postResponse.json();

      if (postResponse.ok) {
        console.log('✅ POST /api/presets working');
        console.log(`   Created preset with ID: ${postData.id}`);
        return true;
      } else {
        console.error('❌ POST /api/presets failed:', postData);
        return false;
      }
    } catch (err) {
      console.error('❌ POST /api/presets error:', err.message);
      return false;
    }
  }

  async testKnowledgeEndpoints() {
    console.log('\n=== Testing Knowledge Endpoints ===');

    // Test GET /api/knowledge-index
    try {
      const getResponse = await fetch(`${API_URL}/api/knowledge-index`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/knowledge-index working');
        console.log(`   Found ${getData.count} knowledge items`);
        console.log(`   Categories: ${getData.categories.join(', ')}`);

        if (getData.count > 0) {
          // Test GET /api/knowledge/:id with first item
          const firstItem = getData.items[0];
          const getDocResponse = await fetch(`${API_URL}/api/knowledge/${firstItem.id}`);
          const getDocData = await getDocResponse.json();

          if (getDocResponse.ok) {
            console.log('✅ GET /api/knowledge/:id working');
            console.log(`   Retrieved document: ${getDocData.title}`);
          } else {
            console.error('❌ GET /api/knowledge/:id failed:', getDocData);
            return false;
          }
        }
        return true;
      } else {
        console.error('❌ GET /api/knowledge-index failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/knowledge-index error:', err.message);
      return false;
    }
  }

  async testSearchEndpoint() {
    console.log('\n=== Testing Search Endpoint ===');

    try {
      const response = await fetch(`${API_URL}/api/search?q=bass&limit=5`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ GET /api/search working');
        console.log(`   Found ${data.count} results for "bass"`);
        if (data.results.length > 0) {
          console.log(`   Top result: ${data.results[0].title} (${data.results[0].type})`);
        }
        return true;
      } else {
        console.error('❌ GET /api/search failed:', data);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/search error:', err.message);
      return false;
    }
  }

  async testDashboardEndpoints() {
    console.log('\n=== Testing Dashboard Endpoints ===');

    // Test GET /api/dashboard
    try {
      const getResponse = await fetch(`${API_URL}/api/dashboard`);
      const getData = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ GET /api/dashboard working');
        console.log(`   Dashboard path: ${getData.path}`);
        console.log(`   Dashboard exists: ${getData.exists}`);
      } else {
        console.error('❌ GET /api/dashboard failed:', getData);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/dashboard error:', err.message);
      return false;
    }

    // Test POST /api/dashboard/push
    try {
      const postResponse = await fetch(`${API_URL}/api/dashboard/push`, {
        method: 'POST'
      });
      const postData = await postResponse.json();

      if (postResponse.ok) {
        console.log('✅ POST /api/dashboard/push working');
        console.log(`   Dashboard written to: ${postData.path}`);

        // Verify the dashboard file exists
        if (existsSync(postData.path)) {
          console.log('✅ Dashboard file verification successful');
          return true;
        } else {
          console.error('❌ Dashboard file verification failed');
          return false;
        }
      } else {
        console.error('❌ POST /api/dashboard/push failed:', postData);
        return false;
      }
    } catch (err) {
      console.error('❌ POST /api/dashboard/push error:', err.message);
      return false;
    }
  }

  async testStatsEndpoint() {
    console.log('\n=== Testing Stats Endpoint ===');

    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();

      if (response.ok) {
        console.log('✅ GET /api/stats working');
        console.log(`   Projects: ${data.projects}`);
        console.log(`   Build sheets: ${data.buildSheets}`);
        console.log(`   Logs: ${data.logs}`);
        console.log(`   Presets: ${data.presets}`);
        console.log(`   Knowledge items: ${data.knowledge}`);
        return true;
      } else {
        console.error('❌ GET /api/stats failed:', data);
        return false;
      }
    } catch (err) {
      console.error('❌ GET /api/stats error:', err.message);
      return false;
    }
  }

  async testWebSocket() {
    console.log('\n=== Testing WebSocket ===');

    return new Promise((resolve) => {
      this.ws = new WebSocket(WS_URL);

      this.ws.on('open', () => {
        console.log('✅ WebSocket connection established');

        // Test ping
        this.ws.send(JSON.stringify({ type: 'ping' }));

        // Test get-session
        this.ws.send(JSON.stringify({ type: 'get-session' }));
      });

      this.ws.on('message', (data) => {
        try {
          const event = JSON.parse(data);
          this.wsEvents.push(event);

          if (event.type === 'pong') {
            console.log('✅ WebSocket ping/pong working');
          }

          if (event.type === 'session') {
            console.log('✅ WebSocket session event received');
            console.log(`   Current project: ${event.payload.currentProject}`);
            resolve(true);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      this.ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err.message);
        resolve(false);
      });

      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.wsEvents.some(e => e.type === 'session')) {
          console.error('❌ WebSocket session event not received within timeout');
          resolve(false);
        }
      }, 10000);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting NPOS Phase 1 Test Suite\n');

    try {
      // Start the server
      await this.startServer();

      // Wait a moment for server to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Run all tests
      const results = await Promise.all([
        this.testHealthEndpoint(),
        this.testSessionEndpoints(),
        this.testBuildSheetsEndpoints(),
        this.testLogsEndpoints(),
        this.testPresetsEndpoints(),
        this.testKnowledgeEndpoints(),
        this.testSearchEndpoint(),
        this.testDashboardEndpoints(),
        this.testStatsEndpoint(),
        this.testWebSocket()
      ]);

      // Stop the server
      await this.stopServer();

      // Summary
      console.log('\n=== Test Summary ===');
      const passed = results.filter(r => r).length;
      const total = results.length;
      console.log(`✅ ${passed}/${total} test groups passed`);

      if (passed === total) {
        console.log('🎉 All Phase 1 tests passed!');
        return true;
      } else {
        console.log('⚠️  Some tests failed. See above for details.');
        return false;
      }

    } catch (err) {
      console.error('❌ Test suite error:', err);
      await this.stopServer();
      return false;
    }
  }
}

// Run the tests
const tester = new NposTester();
tester.runAllTests().then(success => {
  process.exit(success ? 0 : 1);
});