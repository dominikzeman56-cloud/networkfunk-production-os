# NPOS Development Blueprint
## Strategic Development Plan — Executive Level

**Project:** Neurofunk Production OS (NPOS)
**Date:** 2026-07-28
**Status:** Active Development
**Classification:** Internal Strategic Document

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Gap Analysis](#3-gap-analysis)
4. [Strategic Architecture](#4-strategic-architecture)
5. [Development Phases](#5-development-phases)
6. [Resource Allocation & AI Strategy](#6-resource-allocation--ai-strategy)
7. [Risk Assessment & Mitigation](#7-risk-assessment--mitigation)
8. [KPIs & Success Metrics](#8-kpis--success-metrics)
9. [Feedback Loops & Continuous Improvement](#9-feedback-loops--continuous-improvement)
10. [Appendices](#10-appendices)

---

## 1. Executive Summary

NPOS is a multi-layered production operating system for Neurofunk/Drum & Bass music production, consisting of four interconnected systems: an **Obsidian Knowledge Base** (Markdown-based, 25+ files), a **Python Orchestrator** (Neuroman — async LLM routing), a **Node.js API Server** (Express, with AI/audio/Ableton integrations), and an **Astro+React Web Frontend** (HUD-style dark dashboard).

### The "Unattainable" Goal

Create the **best private production operating system for modern Neurofunk** — seamlessly combining Ableton workflow, AI mentoring, knowledge base, reference analysis, preset analysis, producer philosophy, case studies, templates, checklists, and decision trees into one coherent environment used during **every** music production session.

### Strategic Approach

The plan leverages a **dual-track development model**:
- **Claude Code + Qwen 3.7** (running in terminal): All visual/UI implementation, frontend components, CSS/HUD design system, page layouts, responsive design
- **Cline (this agent)**: Architecture, backend logic, API design, data layer, integration pipelines, testing, knowledge system expansion, orchestration

This maximizes output by parallelizing visual polish with system engineering.

---

## 2. Current State Assessment

### 2.1 Component Inventory

| Component | Location | Tech Stack | Maturity | Status |
|-----------|----------|------------|----------|--------|
| **Knowledge Base** | `/Knowledge/`, `/Framework/`, `/Case-Studies/`, `/Producer-Knowledge/`, `/Presets/` | Markdown + Obsidian wikilinks | V1 Complete | 🟢 Production-ready |
| **Session Management** | `/Session-Management/` | Markdown templates | V1 Complete | 🟢 Production-ready |
| **Web Dashboard** | `/Web/` | Astro 5.18, React 19, Tailwind, shadcn/ui | Functional | 🟡 Core pages working |
| **API Server** | `/Server/` | Node.js, Express, Anthropic SDK, MCP | Functional | 🟡 Core endpoints working |
| **Neuroman** | `/Neuroman/` | Python 3.11+, asyncio, Rich CLI, OpenAI SDK | Architecture Complete | 🟡 Core routing works, tools empty |
| **Streamlit Apps** | `/Server/apps/` | Python, Streamlit, Plotly, Matplotlib | Partial | 🟡 Calculators working, hub partial |
| **Data Layer** | `/Data/` | JSON file-based | Minimal | 🔴 No abstraction, hardcoded paths |
| **Templates** | `/Templates/` | Markdown + Python generators | Partial | 🟡 Structure exists, content partial |
| **Integrations** | `/Integrations/` | Documentation only | Planning | 🔴 Not implemented |
| **Tests** | `/Sanity_test.py`, `/Server/test_*.py` | Python unittest | Minimal | 🔴 No CI, no coverage |

### 2.2 What Works Today

1. **Obsidian vault** with complete daily-use knowledge system (Dashboard → Build Sheet → Session Planner → Decision Tree)
2. **Web dashboard** reading from JSON data files, displaying session/project state with AI mentor button
3. **API server** with session CRUD, AI next-step endpoint (Claude Sonnet), audio analysis bridge (MCP), Ableton Live bridge (MCP)
4. **Streamlit calculators** for BPM-sync delays, harmonic overtones, Reese bass notches, and basic preset analysis
5. **Neuroman** classifying user intent (CODE/ABLETON/MUSIC/GENERAL) with fallback heuristics

### 2.3 Architecture Diagram (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER WORKFLOWS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Obsidian   │  │  Web Browser │  │  Terminal (Rich) │  │
│  │   Vault      │  │  Dashboard   │  │  Neuroman CLI    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         │  wikilinks      │  HTTP/REST         │  async     │
│         ▼                 ▼                    ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Knowledge   │  │  API Server  │  │  OmniRoute       │  │
│  │  (Markdown)  │  │  (Express)   │  │  (LLM Gateway)   │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘  │
│                           │                                 │
│              ┌────────────┼────────────┐                    │
│              ▼            ▼            ▼                    │
│     ┌──────────────┐ ┌────────┐ ┌───────────┐              │
│     │ Anthropic AI  │ │ Audio  │ │  Ableton  │              │
│     │ (Claude)      │ │ MCP    │ │  MCP      │              │
│     └──────────────┘ └────────┘ └───────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Gap Analysis

### 3.1 Critical Gaps (Blocking Daily Use)

| ID | Gap | Impact | Priority |
|----|-----|--------|----------|
| **G1** | Hardcoded absolute paths (`D:/ObsidianVault/...`) in Web and API | Breaks portability, blocks deployment | **P0** |
| **G2** | No unified data abstraction layer | Web reads filesystem directly in some places, API in others; state inconsistency | **P0** |
| **G3** | Neuroman `/tools/` directory is empty | Orchestrator has no actual tools to dispatch to | **P1** |
| **G4** | No automated testing pipeline | Regressions undetected, fragile refactoring | **P1** |
| **G5** | Knowledge base ↔ Web dashboard not connected | Users must choose: Obsidian OR Web, not both | **P1** |

### 3.2 Significant Gaps (Limiting Vision)

| ID | Gap | Impact | Priority |
|----|-----|--------|----------|
| **G6** | Only 2 case studies | Insufficient pattern library for decision-making | **P2** |
| **G7** | Only 6 producer profiles, varying depth | Limited philosophical diversity | **P2** |
| **G8** | Preset analysis framework exists but content is minimal | No real-world data to extract patterns from | **P2** |
| **G9** | No session intelligence / pattern recognition | AI mentor has no historical context | **P2** |
| **G10** | Web subpages (knowledge/, framework/, presets/) partially built | Incomplete browsing experience | **P2** |
| **G11** | No video workshop pipeline implementation | Integration listed but not built | **P3** |
| **G12** | No Ableton template automation | Template docs exist but no generation code | **P3** |

### 3.3 Technical Debt

| ID | Issue | Location |
|----|-------|----------|
| **T1** | `fs.readFileSync` with absolute paths | `Web/src/Pages/index.astro` |
| **T2** | Mixed ESM/CJS concerns in API | `Server/api.js` |
| **T3** | No error boundaries in React components | `Web/src/Components/` |
| **T4** | Streamlit apps and Express server are separate processes with no coordination | `Server/` |
| **T5** | No environment variable management (.env) | Project root |
| **T6** | Neuroman auth.py likely has hardcoded API keys | `Neuroman/auth.py` |

---

## 4. Strategic Architecture

### 4.1 Target Architecture

The end state unifies all four layers through a **shared data bus** pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                      UNIFIED DATA LAYER                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Session Store (JSON → SQLite)  │  Knowledge Index (MD)  │  │
│  │  Build Sheets  │  Logs  │  Presets  │  Analytics         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ▲                                  │
│              ┌───────────────┼───────────────┐                  │
│              │               │               │                  │
│  ┌───────────▼──┐  ┌────────▼─────┐  ┌──────▼────────────┐    │
│  │ API Server   │  │  Neuroman    │  │  Obsidian Vault   │    │
│  │ (Express)    │  │  (Python)    │  │  (Markdown)       │    │
│  │              │  │              │  │                    │    │
│  │ Session CRUD │  │ LLM Routing  │  │ Knowledge Docs   │    │
│  │ AI Mentor    │  │ Tool Dispatch│  │ Frameworks        │    │
│  │ Audio MCP    │  │ Session Intel│  │ Templates         │    │
│  │ Ableton MCP  │  │ Code Assist  │  │ Case Studies      │    │
│  └───────┬──────┘  └──────┬───────┘  └───────────────────┘    │
│          │                │                                     │
│          └────────┬───────┘                                     │
│                   ▼                                              │
│  ┌──────────────────────────────────────┐                       │
│  │  Web Frontend (Astro + React)        │                       │
│  │  Dashboard │ Knowledge │ Live │ Presets│                      │
│  └──────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Keep Obsidian as primary knowledge authoring tool** | It's where the producer works daily; Web is a read-view |
| **Migrate JSON → SQLite for session data** | ACID transactions, query capability, no file-locking issues |
| **Single config file at project root** | Eliminate all hardcoded paths; `.env` + `npos.config.json` |
| **Neuroman becomes the "brain"** | All AI routing, session intelligence, and tool dispatch flows through it |
| **API Server becomes thin CRUD + MCP bridge** | Business logic moves to Neuroman; Server handles HTTP + persistence |
| **Web is a presentation layer** | Reads data from API, never from filesystem directly |
| **Streamlit apps become optional dev tools** | Not part of the main production flow; useful for deep analysis |

---

## 5. Development Phases

### Phase 0: Foundation & Cleanup
**Duration:** 3–5 days
**Goal:** Eliminate blocking issues, establish clean development environment

#### Deliverables:
- [ ] **P0.1** — Create `npos.config.json` at project root with all configurable paths
- [ ] **P0.2** — Create `.env.example` with required environment variables
- [ ] **P0.3** — Replace all hardcoded paths in `Web/src/Pages/index.astro` and other files
- [ ] **P0.4** — Create unified `npm run dev` script that starts API + Web concurrently
- [ ] **P0.5** — Create `start-npos.bat` / `start-npos.ps1` that launches all services
- [ ] **P0.6** — Add `.env` to `.gitignore`, create proper secret management
- [ ] **P0.7** — Audit and fix all TypeScript errors in Web frontend

#### Success Criteria:
- `npm run dev` starts Web + API with zero errors
- No absolute paths remain in source code
- All env vars documented in `.env.example`

**Owner:** Cline handles config + backend; Claude Code handles frontend path fixes

---

### Phase 1: Unified Data Layer
**Duration:** 1–2 weeks
**Goal:** Single source of truth for all session/project data

#### Deliverables:
- [ ] **P1.1** — Design and implement SQLite schema for sessions, build sheets, logs, presets
- [ ] **P1.2** — Create `Server/data-layer.js` abstraction (CRUD interface over SQLite)
- [ ] **P1.3** — Migrate API endpoints from file-based JSON to data layer
- [ ] **P1.4** — Add data migration script (JSON → SQLite)
- [ ] **P1.5** — Create API endpoint: `GET /api/knowledge-index` (returns structured knowledge metadata from Obsidian vault)
- [ ] **P1.6** — Implement bidirectional sync: Obsidian Dashboard.md ↔ session.json ↔ API
- [ ] **P1.7** — Add WebSocket support for real-time dashboard updates
- [ ] **P1.8** — Implement `GET /api/search` — unified search across knowledge + sessions + presets

#### Success Criteria:
- Web frontend reads 100% from API, never from filesystem
- Session data persists in SQLite with proper transactions
- Dashboard reflects real-time state from any data source

**Owner:** Cline (data layer, API); Claude Code (frontend data fetching refactor)

---

### Phase 2: Web Frontend Completion
**Duration:** 2–3 weeks (parallel with Phase 1)
**Goal:** Complete all web pages, establish the visual design system permanently

#### Deliverables:
- [ ] **P2.1** — **Knowledge Browser** (`/knowledge/[topic].astro`) — render all 25+ Knowledge markdown files with proper styling
- [ ] **P2.2** — **Framework Viewer** (`/framework/[tool].astro`) — decision trees, checklists, workflows as interactive pages
- [ ] **P2.3** — **Producer Profiles** (`/producer/[name].astro`) — styled producer philosophy pages
- [ ] **P2.4** — **Case Study Viewer** (`/case-studies/[track].astro`) — structured case study display
- [ ] **P2.5** — **Preset Analyzer UI** (`/presets/[preset].astro`) — connect to existing Streamlit analyzer or port to React
- [ ] **P2.6** — **Global Search** — search modal across all content types (knowledge, sessions, presets, producers)
- [ ] **P2.7** — **Session Log** page enhancement — timeline view of past sessions with trends
- [ ] **P2.8** — **Build Sheet** interactive form — connect to API for CRUD
- [ ] **P2.9** — **Ableton Live Control** page polish — transport, tracks, clips, tempo
- [ ] **P2.10** — **Responsive design pass** — ensure all pages work on tablet (for studio use)
- [ ] **P2.11** — **HUD Design System** documentation — extract all design tokens into a reference

#### Success Criteria:
- Every Obsidian knowledge page has a web equivalent
- Search returns results across all content types
- Build Sheet form saves/loads from API
- Mobile/tablet layout is usable

**Owner:** Claude Code (primary — all visual work); Cline (API endpoints for new pages)

---

### Phase 3: Knowledge System Expansion
**Duration:** Ongoing (2–4 weeks for initial batch)
**Goal:** Expand content to reach critical mass for daily production decisions

#### Deliverables:
- [ ] **P3.1** — **10+ Case Studies** — analyze tracks from: Noisia, Mefjus, Audio, Black Sun Empire, Phace, Current Value, Emperor, Halogenix, Synergy, Insideinfo
- [ ] **P3.2** — **8+ Producer Profiles** — complete profiles for all listed producers + add new ones
- [ ] **P3.3** — **20+ Serum Preset Analyses** — extract patterns from real preset packs
- [ ] **P3.4** — **Knowledge cross-reference map** — validate all wikilinks, create visual graph
- [ ] **P3.5** — **Troubleshooting tree expansion** — add 10+ common production problems with decision trees
- [ ] **P3.6** — **Reference analysis entries** — 5+ fully analyzed reference tracks
- [ ] **P3.7** — **Preset pattern archetypes** — build first production archetype library from preset analysis

#### Success Criteria:
- Case study library covers 10+ distinct tracks
- Every producer profile has "What to Learn" actionable section
- Preset analysis yields at least 5 reusable production archetypes
- No broken wikilinks in the knowledge base

**Owner:** Cline (content generation, analysis, cross-referencing)

---

### Phase 4: Intelligence Layer (Neuroman Maturation)
**Duration:** 2–3 weeks
**Goal:** Transform Neuroman from routing skeleton into a production intelligence system

#### Deliverables:
- [ ] **P4.1** — Implement `Neuroman/tools/` modules:
  - `session_analyzer.py` — analyze session logs for patterns, suggest improvements
  - `knowledge_search.py` — semantic search across Obsidian knowledge base
  - `reference_comparator.py` — compare current project against reference analysis
  - `preset_explorer.py` — query preset database, suggest archetypes
  - `ableton_controller.py` — direct Ableton control through Neuroman
  - `code_agent.py` — route coding tasks to Claude Code / OpenCode
- [ ] **P4.2** — Implement session intelligence:
  - Track production time patterns (when most productive, common bottlenecks)
  - Identify recurring problems across sessions
  - Suggest workflow optimizations based on historical data
- [ ] **P4.3** — Enhance AI mentor with knowledge base context:
  - Feed relevant knowledge articles into AI prompt
  - Include recent case study insights
  - Reference producer philosophy for style-specific advice
- [ ] **P4.4** — Implement session memory:
  - Neuroman remembers previous conversations
  - Builds project-specific context over time
  - Tracks decisions made and their outcomes
- [ ] **P4.5** — Create Neuroman CLI commands:
  - `/session start` — begin tracked production session
  - `/session end` — end session, auto-log summary
  - `/analyze [topic]` — deep analysis using knowledge base
  - `/suggest` — get next-step recommendation
  - `/search [query]` — semantic search across all knowledge

#### Success Criteria:
- Neuroman can answer "What should I work on?" with context-aware recommendations
- Session patterns are identified after 5+ logged sessions
- AI mentor references specific knowledge articles in its advice
- All tool dispatches work end-to-end

**Owner:** Cline (primary — Python backend); Claude Code (CLI UI polish if needed)

---

### Phase 5: Integration & Automation
**Duration:** 2–3 weeks
**Goal:** Connect all systems into a seamless production environment

#### Deliverables:
- [ ] **P5.1** — **Ableton Template Generator** — Python script that generates `.als` template from NPOS config
- [ ] **P5.2** — **Session Auto-Tracking** — Neuroman detects Ableton session start/stop, auto-logs
- [ ] **P5.3** — **Reference Comparison Pipeline** — automated audio analysis of reference vs current mix
- [ ] **P5.4** — **Video Workshop Pipeline** — process production tutorial videos, extract knowledge
- [ ] **P5.5** — **Producer Pal Deep Integration** — full MIDI/DSP feedback loop between Ableton and NPOS
- [ ] **P5.6** — **Obsidian Plugin** (optional) — custom Obsidian plugin that connects vault to API
- [ ] **P5.7** — **Dashboard Widget System** — modular widgets that can be rearranged per session type
- [ ] **P5.8** — **Export Pipeline** — export session summary as formatted report (PDF/Markdown)

#### Success Criteria:
- One command starts full NPOS environment (API + Web + Neuroman)
- Ableton session automatically tracked without manual logging
- Reference comparison produces actionable EQ/dynamics suggestions

**Owner:** Cline (automation, pipelines); Claude Code (dashboard widgets)

---

### Phase 6: Production Hardening
**Duration:** 1–2 weeks
**Goal:** Make the system reliable for daily use

#### Deliverables:
- [ ] **P6.1** — Comprehensive test suite:
  - Unit tests for all API endpoints
  - Integration tests for data layer
  - E2E tests for critical Web flows
  - Neuroman tool tests
- [ ] **P6.2** — Performance optimization:
  - Web frontend bundle analysis and optimization
  - API response time targets (<200ms for CRUD, <2s for AI)
  - Knowledge index caching
- [ ] **P6.3** — Error handling and resilience:
  - Graceful degradation when API is offline
  - Offline mode for Web dashboard (cached data)
  - Circuit breakers for external services (Anthropic, Ableton MCP)
- [ ] **P6.4** — Documentation:
  - Developer setup guide
  - API documentation (OpenAPI/Swagger)
  - Architecture Decision Records (ADRs)
  - Contributing guide for knowledge base expansion
- [ ] **P6.5** — Deployment:
  - `docker-compose.yml` for full stack
  - One-command setup script
  - Backup/restore procedures for SQLite data

#### Success Criteria:
- Test coverage > 70% for API and data layer
- Full stack starts with single command
- All failures produce helpful error messages
- Documentation enables re-setup from scratch in <30 minutes

**Owner:** Cline (testing, docs, Docker); Claude Code (performance optimization)

---

## 6. Resource Allocation & AI Strategy

### 6.1 Dual-Track Development Model

```
┌─────────────────────────────────────────────────────────┐
│                DEVELOPMENT TRACKS                        │
│                                                         │
│  TRACK A: Claude Code + Qwen 3.7     TRACK B: Cline    │
│  ┌─────────────────────────────┐  ┌──────────────────┐ │
│  │ Visual / UI / Frontend      │  │ Backend / Logic  │ │
│  │                             │  │                  │ │
│  │ • Astro page templates      │  │ • API design     │ │
│  │ • React components          │  │ • Data layer     │ │
│  │ • CSS / HUD design system   │  │ • Neuroman tools │ │
│  │ • Responsive layouts        │  │ • Knowledge gen  │ │
│  │ • Interactive elements      │  │ • Case studies   │ │
│  │ • Chart visualizations      │  │ • Preset analysis│ │
│  │ • Animation / transitions   │  │ • Testing        │ │
│  │ • shadcn/ui components      │  │ • CI/CD          │ │
│  └─────────────────────────────┘  └──────────────────┘ │
│                                                         │
│  SHARED: Architecture decisions, data contracts, schema │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Parallel Execution Strategy

| Phase | Cline Tasks (Simultaneous) | Claude Code Tasks (Simultaneous) |
|-------|---------------------------|----------------------------------|
| 0 | Config files, env setup, path fixes | Frontend path fixes, TypeScript audit |
| 1 | SQLite schema, data layer, API migration | Frontend data fetching refactor, loading states |
| 2 | New API endpoints for content | Knowledge/Producer/CaseStudy page layouts |
| 3 | Content generation (case studies, presets) | Visual refinements, search UI |
| 4 | Neuroman tools, session intelligence | Dashboard widgets, CLI UI |
| 5 | Automation pipelines, integrations | Dashboard polish, export UI |
| 6 | Testing, Docker, docs | Performance optimization, responsive pass |

### 6.3 Context Handoff Protocol

When Cline needs visual work done:
1. Create a detailed component specification (props, data shape, behavior)
2. Include example JSON data that the component will render
3. Reference existing design tokens from `/Web/src/Styles/nocturne.css`
4. Hand off to Claude Code with: "Implement [component] following spec in [file]"

When Claude Code needs backend work done:
1. Specify required API endpoint shape (request/response)
2. Reference existing patterns in `Server/api.js`
3. Hand off to Cline with: "Create endpoint [path] returning [shape]"

---

## 7. Risk Assessment & Mitigation

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **SQLite migration corrupts existing data** | Medium | High | Keep JSON files as backup; migration script with rollback |
| **Ableton MCP bridge breaks with Ableton updates** | Medium | Medium | Pin MCP version; abstract Ableton calls behind interface |
| **Anthropic API rate limits / cost explosion** | Low | High | Cache AI responses; implement request throttling; use cheaper models for simple routing |
| **Obsidian vault becomes inconsistent with Web state** | Medium | Medium | Obsidian is source of truth for knowledge; Web is source of truth for session data; clear ownership |
| **Qwen 3.7 context window limits for large components** | Low | Medium | Break components into smaller files; use composition pattern |
| **Neuroman LLM classification accuracy too low** | Medium | Medium | Always maintain heuristic fallback; classify confidence scores |

### 7.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope creep delays Phase 0-1** | High | High | Strict phase gates; "workflow over completeness" principle |
| **Content generation bottleneck (case studies)** | Medium | Medium | Use AI-assisted analysis; template-driven generation |
| **Developer fatigue from dual-track coordination** | Medium | Medium | Clear interfaces; minimal coordination overhead; async communication |
| **Over-engineering data layer** | Medium | Medium | Start with SQLite + simple abstraction; upgrade only if needed |

### 7.3 Mitigation Strategies (Detailed)

**For scope creep:** Each phase has explicit "Definition of Done" criteria. No work begins on Phase N+1 until Phase N meets its success criteria. The principle "workflow over completeness" applies — if a phase's deliverable is "good enough for daily use," ship it.

**For content generation:** Develop a "Case Study Factory" — a template + AI prompt pipeline that takes a track name and produces a structured first draft. Producer knowledge can be bootstrapped from interview transcripts, forum posts, and production breakdowns.

**For coordination overhead:** Use `NPOS-Development-Blueprint.md` (this document) as the single source of truth. Track progress with checkboxes. Each component has a clear contract (API schema, component spec) so tracks can work independently.

---

## 8. KPIs & Success Metrics

### 8.1 Efficiency KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to first productive action** (opening NPOS → starting work) | < 60 seconds | Timer from dashboard load to first session action |
| **API response time (CRUD)** | < 200ms p95 | Server-side logging |
| **AI mentor response time** | < 5s p95 | Server-side logging |
| **Build Sheet creation time** | < 2 minutes | User report |
| **Session logging time** | < 30 seconds | User report |
| **Search results time** | < 1s | Client-side measurement |

### 8.2 Quality KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Knowledge base completeness** | 25+ topics, 10+ case studies, 8+ producers | File count |
| **Test coverage** | > 70% API, > 50% data layer | Coverage reports |
| **Zero-error dashboard load** | 100% success rate | Error boundary catches |
| **AI mentor relevance** | > 80% actionable responses | User rating (👍/👎) |
| **Cross-reference integrity** | 0 broken wikilinks | Automated link checker |

### 8.3 Production Impact KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Sessions per week using NPOS** | > 4 | Session log count |
| **Decision tree usage** | > 2 per session | Interaction tracking |
| **Reference analysis per track** | 100% of new tracks | Build sheet → reference link ratio |
| **Time from idea to finished arrangement** | < 40% of baseline | Self-reported comparison |

### 8.4 Phase Gate KPIs

| Phase | Gate Criteria |
|-------|--------------|
| **Phase 0** | `npm run dev` succeeds; 0 hardcoded paths; `.env.example` complete |
| **Phase 1** | All API endpoints use data layer; Web reads 100% from API; SQLite operational |
| **Phase 2** | All knowledge pages render in Web; search works; build sheet saves via API |
| **Phase 3** | 10+ case studies; 8+ producers; 20+ preset analyses; 0 broken links |
| **Phase 4** | Neuroman dispatches to all tools; session patterns detected; AI uses KB context |
| **Phase 5** | One-command startup; auto-tracking works; reference comparison pipeline operational |
| **Phase 6** | Tests pass; <200ms CRUD; Docker works; docs complete |

---

## 9. Feedback Loops & Continuous Improvement

### 9.1 Development Feedback Loops

```
┌────────────────────────────────────────────────────────────┐
│                    FEEDBACK CYCLE                           │
│                                                            │
│   ┌──────────┐    ┌──────────┐    ┌──────────────────┐    │
│   │  BUILD   │───▶│  USE IN  │───▶│  OBSERVE &       │    │
│   │  Feature │    │  SESSION │    │  COLLECT DATA    │    │
│   └──────────┘    └──────────┘    └────────┬─────────┘    │
│        ▲                                     │             │
│        │           ┌──────────┐              │             │
│        └───────────│  ITERATE │◀─────────────┘             │
│                    │  or DROP │                             │
│                    └──────────┘                             │
└────────────────────────────────────────────────────────────┘
```

### 9.2 Feedback Mechanisms

| Mechanism | Frequency | Purpose |
|-----------|-----------|---------|
| **Daily session self-report** | Every production session | Track if NPOS was used, what was useful, what was friction |
| **Weekly review** | Weekly | Assess which modules are getting used, which are ignored |
| **AI mentor rating** | Every AI interaction | 👍/👎 on AI suggestions to tune prompt engineering |
| **Session log analysis** | Bi-weekly | Neuroman analyzes session patterns, identifies bottlenecks |
| **Knowledge gap identification** | Monthly | When AI can't answer a question, log it as a knowledge gap |
| **Architecture review** | Per phase gate | Review if architecture decisions are holding up or need revision |

### 9.3 Iteration Protocol

1. **After each production session:** Log whether NPOS was used (Dashboard.md checkbox)
2. **After each week:** Review session logs for patterns. If a module isn't being used, diagnose why.
3. **After each phase:** Full retrospective. What worked? What didn't? Adjust next phase accordingly.
4. **After each month:** Review KPIs. Is the system measurably improving production quality/speed?

### 9.4 Adaptive Planning

This blueprint is a **living document**. Phase priorities and deliverables may shift based on:
- Real production session feedback
- New tools/integrations becoming available
- Changes in the producer's workflow
- Technology updates (Astro, React, Python ecosystem)

The principle remains: **workflow over completeness**. If a planned deliverable doesn't serve the daily production workflow, it gets deprioritized.

---

## 10. Appendices

### Appendix A: Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Knowledge Base | Obsidian | Latest | Markdown authoring, wikilinks, graph view |
| Frontend | Astro | 5.18 | Static site generation with islands |
| Frontend | React | 19 | Interactive components |
| Frontend | Tailwind CSS | 3.4 | Utility-first styling |
| Frontend | shadcn/ui | Latest | Component primitives (Radix UI) |
| Backend API | Node.js + Express | 20+ / 4.x | REST API, MCP bridges |
| AI | Anthropic Claude | Sonnet 5 | AI mentor, production advice |
| Orchestrator | Python | 3.11+ | Async intent classification and routing |
| CLI UI | Rich | Latest | Terminal formatting for Neuroman |
| Database | SQLite | 3.x | Session/build/log persistence |
| Audio Analysis | MCP Server | Custom | WAV analysis, spectrum, loudness |
| DAW Bridge | Ableton Copilot MCP | Latest | Ableton Live control |
| Dev Tools | Claude Code + Qwen 3.7 | Latest | Visual implementation, UI components |
| Dev Tools | Cline | Current | Architecture, backend, knowledge generation |

### Appendix B: File Structure (Target State)

```
NPOS/
├── npos.config.json          # NEW: Central configuration
├── .env.example              # NEW: Environment variable template
├── .env                      # Git-ignored secrets
├── start-npos.bat            # NEW: One-command launcher
│
├── Web/                      # Frontend (Astro + React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro           # Dashboard
│   │   │   ├── build-sheet.astro     # Build sheet form
│   │   │   ├── live.astro            # Ableton control
│   │   │   ├── log.astro             # Session logger
│   │   │   ├── knowledge/            # Knowledge browser (NEW pages)
│   │   │   ├── framework/            # Framework viewer (NEW pages)
│   │   │   ├── producer/             # Producer profiles (NEW pages)
│   │   │   ├── presets/              # Preset analyzer (NEW pages)
│   │   │   ├── session/              # Session management (ENHANCED)
│   │   │   └── search.astro          # Global search (NEW)
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── lib/
│   │   └── styles/
│   └── package.json
│
├── Server/                   # Backend API
│   ├── api.js                # Express server
│   ├── data-layer.js         # NEW: SQLite abstraction
│   ├── data/                 # SQLite DB + migrations
│   ├── apps/                 # Streamlit apps (dev tools)
│   └── package.json
│
├── Neuroman/                 # Python orchestrator
│   ├── main.py
│   ├── core.py
│   ├── router.py
│   ├── session.py
│   ├── tools/                # NEW: Tool implementations
│   │   ├── session_analyzer.py
│   │   ├── knowledge_search.py
│   │   ├── reference_comparator.py
│   │   ├── preset_explorer.py
│   │   ├── ableton_controller.py
│   │   └── code_agent.py
│   └── requirements.txt
│
├── Knowledge/                # Obsidian knowledge base
├── Framework/
├── Case-Studies/
├── Producer-Knowledge/
├── Presets/
├── Session-Management/
├── Templates/
├── AI/
├── Troubleshooting/
├── Workflows/
├── Data/
└── References/
```

### Appendix C: API Endpoint Map (Target State)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/api/health` | Server health check | ✅ Exists |
| GET | `/api/session` | Get current session data | ✅ Exists |
| POST | `/api/session` | Update session data | ✅ Exists |
| GET | `/api/build-sheets` | List build sheets | ✅ Exists |
| POST | `/api/build-sheets` | Create/update build sheet | ✅ Exists |
| GET | `/api/logs` | List session logs | ✅ Exists |
| POST | `/api/logs` | Create session log | ✅ Exists |
| POST | `/api/ai-next-step` | AI mentor next step | ✅ Exists |
| POST | `/api/analyze` | Audio file analysis | ✅ Exists |
| GET | `/api/ableton/*` | Ableton bridge endpoints | ✅ Exists |
| GET | `/api/knowledge-index` | Knowledge base metadata | Phase 1 |
| GET | `/api/knowledge/:topic` | Knowledge article content | Phase 1 |
| GET | `/api/search` | Unified search | Phase 1 |
| GET | `/api/producers` | Producer profiles list | Phase 1 |
| GET | `/api/producers/:name` | Single producer profile | Phase 1 |
| GET | `/api/case-studies` | Case studies list | Phase 1 |
| GET | `/api/case-studies/:track` | Single case study | Phase 1 |
| GET | `/api/presets` | Preset analyses list | Phase 1 |
| GET | `/api/presets/:id` | Single preset analysis | Phase 1 |
| GET | `/api/framework/:tool` | Framework content (decision tree, checklist) | Phase 1 |
| POST | `/api/session/start` | Start tracked session | Phase 4 |
| POST | `/api/session/end` | End tracked session | Phase 4 |
| GET | `/api/session/patterns` | Session pattern analysis | Phase 4 |
| POST | `/api/reference-compare` | Compare against reference | Phase 5 |

### Appendix D: Immediate Next Actions (Phase 0 Sprint)

**Priority order for immediate execution:**

1. Create `npos.config.json` with path configuration
2. Create `.env.example` with all required variables
3. Fix `Web/src/Pages/index.astro` — replace hardcoded path with config-based path
4. Audit all files for hardcoded paths (`D:/ObsidianVault/...`)
5. Create `Server/data-layer.js` stub (SQLite connection, basic CRUD)
6. Create `start-npos.bat` that launches API + Web
7. Fix any TypeScript errors in Web build
8. Commit and tag as `v0.9.0-foundation`

---

*This document should be reviewed and updated at each phase gate. Next review: after Phase 0 completion.*