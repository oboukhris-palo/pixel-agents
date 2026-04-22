# Architecture Design: Pixel Agents Dashboard

**Document Version**: 1.0.0  
**Created**: 2026-04-22  
**Author**: Solution Architect (David)  
**Status**: In Review  
**Phase**: Phases 3-4 (Architecture & Technical Design)  

---

## Executive Summary

Pixel Agents transforms into a **Visual AI Orchestration Dashboard** that brings the gene2 framework to life through real-time agent monitoring, gamified workflow visualization, and context-aware task management.

**Recommended Architecture**: **Modular Monolith** (VS Code Extension + Webview)
- Unified codebase with clear separation of concerns
- Scalable from single-user to multi-project workflows
- Maintains development velocity while preserving extensibility

---

## 1. Architecture Context

### 1.1 Scope & Constraints

**What We're Building**:
- VS Code extension providing real-time PDLC workflow visualization
- 5-component dashboard: Task Progression Bar, Context Window Bar, Completeness Meter, Agent Office (canvas), Gamification
- Real-time message protocol connecting backend monitors to animated frontend
- Support for multi-project switching and parallel agent workflows

**Key Constraints**:
- ✅ Must maintain 60fps animations on typical dev hardware
- ✅ Must respond within 100ms (message protocol SLA)
- ✅ Zero external telemetry (all data local to VS Code)
- ✅ Must support GitHub Copilot, Cursor, Claude, and future frameworks
- ✅ Cannot require external services or cloud infrastructure

### 1.2 Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| **Performance** | Canvas FPS | 60fps sustained |
| **Responsiveness** | Message latency | <100ms p95 |
| **Engagement** | Daily active users | 75%+ |
| **Completeness** | Project tracking accuracy | 100% of file changes |
| **Scalability** | Multi-project support | 5+ projects simultaneously |

---

## 2. Architecture Decision: Three Options

### Option A: Monolithic with Client-Side State ❌ NOT RECOMMENDED

**Architecture**:
```
VS Code Extension (TypeScript)
├── Backend Monitors (single process)
│   ├── AgentActivityMonitor
│   ├── ContextWindowAnalyzer
│   └── CompletenessCalculator
└── Webview Frontend (React)
    ├── Message subscription
    └── State management (local)
```

**Pros**:
- Simplest to implement
- Minimal message passing
- Fast startup

**Cons**:
- ❌ Single thread blocks UI during heavy calculations
- ❌ No isolation between monitors and UI
- ❌ Difficult to test components independently
- ❌ Memory leaks from long-running watchers
- ❌ No horizontal scalability for multi-project scenarios

**Cost**: $320K-400K  
**Timeline**: 8-10 weeks  
**Risk**: HIGH (performance ceiling reached at 2-3 projects)

---

### Option B: Microservices Architecture ❌ OVER-ENGINEERED

**Architecture**:
```
Backend Services (separate processes):
├── Agent Activity Service (Node.js)
├── Context Window Service (Node.js)
├── Completeness Service (Node.js)
├── Message Bus (Redis/RabbitMQ)
└── API Layer (Express)

Webview Frontend (React)
├── WebSocket connection to API
└── Real-time subscription
```

**Pros**:
- Perfect separation of concerns
- Easy to scale individual services
- Straightforward testing

**Cons**:
- ❌ Massive operational overhead for VS Code extension
- ❌ Requires external message broker
- ❌ Network communication latency (defeats <100ms requirement)
- ❌ Violates "no external services" constraint
- ❌ Over-engineered for single-user extension

**Cost**: $800K-1.2M  
**Timeline**: 16-20 weeks  
**Risk**: CRITICAL (violates requirements, adds complexity)

---

### Option C: Modular Monolith ✅ RECOMMENDED

**Architecture**:
```
VS Code Extension (TypeScript)
├── Backend Layer (Main Process)
│   ├── 7 Independent Monitors (modules)
│   │   ├── AgentActivityMonitor (workspaceWatcher)
│   │   ├── ContextWindowAnalyzer (Copilot event listener)
│   │   ├── CompletenessCalculator (file stats)
│   │   ├── TaskProgressionTracker (state machine)
│   │   ├── AgentInitializer (config loader)
│   │   ├── WorkflowDetector (phase classifier)
│   │   └── PixelAgentsViewProvider (webview bridge)
│   ├── Message Protocol Layer (strongly-typed)
│   │   ├── AgentActivityMessage
│   │   ├── ContextWindowMessage
│   │   ├── CompletenessMetricsMessage
│   │   ├── TaskProgressionMessage
│   │   └── ParallelZonesMessage
│   ├── State Management (in-memory)
│   │   ├── AgentRegistry
│   │   ├── ProjectRegistry
│   │   └── WorkflowState
│   └── File System Abstraction
│       ├── VS Code FS API
│       └── Real-time watchers
│
├── Webview Layer (React, isolated)
│   ├── Message Parser (validates incoming messages)
│   ├── Components
│   │   ├── TaskProgressionBar
│   │   ├── ContextWindowBar
│   │   ├── CompletenessBar
│   │   ├── AgentRegistry (sidebar)
│   │   ├── ActionBubble
│   │   ├── OfficeCanvas (Phaser 3 game engine)
│   │   └── GameLoop (60fps animation)
│   ├── Hooks
│   │   ├── useMessageListener (WebSocket subscription)
│   │   ├── useGameState (animation state)
│   │   ├── useAgentPosition (sprite movement)
│   │   └── useCompletenessTracking (metrics)
│   └── Styles (Tailwind + CSS modules for canvas)
│
└── Shared Layer
    ├── TypeScript type definitions
    ├── Message protocol interfaces
    ├── Constants (colors, sizes, animations)
    └── Utilities (calculations, formatting)
```

**Pros**:
- ✅ Clear module boundaries with single responsibility
- ✅ Monitors run independently without blocking each other
- ✅ All state local to VS Code (no external services)
- ✅ Testable at module level
- ✅ Scales to multi-project by spinning up monitor sets per project
- ✅ Message protocol ensures loose coupling
- ✅ Frontend and backend can evolve independently

**Cons**:
- Requires careful state synchronization
- More initial setup complexity

**Cost**: $450K-550K  
**Timeline**: 12-14 weeks  
**Risk**: LOW (well-understood patterns, proven approach)

---

## 3. Recommended Architecture: Modular Monolith

### 3.1 High-Level Architecture (C4 Context)

```
┌─────────────────────────────────────────────────────────┐
│                    Developer                           │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Interacts with
                         ▼
┌──────────────────────────────────────────────────────────┐
│           VS Code with Pixel Agents                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Pixel Agents Webview Dashboard                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ Task Bar │ │ Context  │ │ Office Canvas    │  │ │
│  │  │          │ │ Window   │ │ (Gamification)   │  │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                         ▲                               │
│                         │ Message Protocol              │
│                         ▼                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Backend Monitors (Main Process)                   │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ 7 Independent Monitor Modules               │  │ │
│  │  │ • Activity | Context | Completeness | Task  │  │ │
│  │  │ • Workflow | Init | ViewProvider            │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
    Monitors                         Publishes to
    Workspace                        Webview
```

### 3.2 Component Architecture (C4 Container)

**Backend Monitors** (TypeScript, main process):

```
┌─────────────────────────────────────────────────────┐
│         Extension Activation                         │
│  • Load agent metadata from .github/agents/         │
│  • Initialize all 7 monitors                        │
│  • Register message listeners                       │
└──────────────┬──────────────────────────────────────┘
               │
       ┌───────┴───────────────────────────────┐
       │                                       │
       ▼                                       ▼
┌──────────────────────────┐         ┌────────────────────────┐
│  AgentActivityMonitor    │         │ ContextWindowAnalyzer  │
│  • Workspace watcher     │         │ • Copilot event hook   │
│  • File change tracking  │         │ • Token calculation    │
│  • Current agent detect  │         │ • Usage breakdown      │
└──────────────────────────┘         └────────────────────────┘
       │                                      │
       ├──────────────┬──────────────────────┤
       │              │                      │
       ▼              ▼                      ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐
│Completeness │ │TaskProgression│ │AgentInitializer      │
│Calculator   │ │Tracker        │ │• Load metadata       │
│• File stats │ │• State machine│ │• Parse .github/      │
│• Metrics    │ │• Task history │ │• Cache agents        │
└─────────────┘ └──────────────┘ └──────────────────────┘
       │              │                      │
       ├──────────────┼──────────────────────┤
       │              │                      │
       ▼              ▼                      ▼
┌──────────────────────────┐    ┌─────────────────────┐
│ WorkflowDetector         │    │PixelAgentsViewProvider
│ • Phase classification   │    │ • Webview bridge    │
│ • Folder structure check │    │ • Message protocol  │
│ • Phase tracking         │    │ • Dispatch messages │
└──────────────────────────┘    └─────────────────────┘
       │
       └─────────────────────────────┬─────────────────┐
                                     │                 │
                    All monitors publish to shared     │
                    state manager, which broadcasts   │
                    to webview via message protocol    │
                                     │                 │
                                     ▼                 ▼
                          ┌────────────────────────────────┐
                          │  Message Protocol Dispatcher    │
                          │  • AgentActivityMessage         │
                          │  • ContextWindowMessage         │
                          │  • CompletenessMetricsMessage   │
                          │  • TaskProgressionMessage       │
                          │  • ParallelZonesMessage         │
                          └────────────────────────────────┘
```

**Frontend Components** (React, Webview):

```
┌──────────────────────────────────────────────────┐
│  Pixel Agents Dashboard (React App)              │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Task Progression Bar (Top)              │   │
│  │  [✅ US-001] [🔄 US-002] [⏭ US-003]    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌────────┐  ┌─────────────────────────────────┬─────┐
│  │Context │  │                                 │     │
│  │Window  │  │     Agent Office Canvas         │Comp │
│  │Bar     │  │     (Phaser 3 Game Engine)      │letus │
│  │        │  │     • Animated sprites          │Bar  │
│  │(L)     │  │     • Work zones                │(R)  │
│  │        │  │     • Action bubbles            │     │
│  │        │  │     • 60fps GameLoop            │     │
│  │        │  │     • Zone transitions          │     │
│  │        │  │                                 │     │
│  │        │  │  Sidebar (Left Nav):            │     │
│  │        │  │  • Agent Registry               │     │
│  │        │  │  • Multi-project switcher       │     │
│  │        │  │  • Settings                     │     │
│  └────────┘  └─────────────────────────────────┴─────┘
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Notification Panel (Bottom)             │   │
│  │  Achievements | Milestones | Streaks     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Message Listeners:                            │
│  • useMessageListener() - WebSocket subscribe   │
│  • useGameState() - Animation loop state       │
│  • useAgentPosition() - Sprite tracking        │
│  • useCompletenessTracking() - Progress meter  │
└──────────────────────────────────────────────────┘
```

### 3.3 Message Protocol (API Contracts)

```typescript
// AgentActivityMessage - Real-time agent action tracking
interface AgentActivityMessage {
  type: 'agent-activity';
  timestamp: ISO8601String;
  agentName: string;           // 'dev-tdd-red', 'orchestrator', etc.
  agentType: AgentType;         // Role-based classification
  spriteColor: HexColor;        // Unique agent color (#FF5500)
  spriteShape: 'circle' | 'square' | 'triangle' | 'star';
  currentTask: string;          // Brief action description
  codeSnippet?: string;         // Code being written (100 chars max)
  layer?: string;               // Implementation layer context
  cycle?: number;               // TDD cycle counter
  status: 'active' | 'thinking' | 'complete' | 'error';
}

// ContextWindowMessage - Token budget tracking
interface ContextWindowMessage {
  type: 'context-window';
  timestamp: ISO8601String;
  totalTokens: number;          // Current usage
  maxTokens: number;            // 200K or model-specific
  usagePercentage: number;      // 0-100
  breakdown: {
    githubInstructions: number; // Blue segment
    projectCode: number;         // Green segment
    chatHistory: number;         // Yellow segment
  };
  warningLevel: 'green' | 'yellow' | 'red'; // 0-70% | 71-89% | 90%+
  recommendedAction?: string;   // "Summarize chat" or "Create new session"
}

// CompletenessMetricsMessage - Project progress tracking
interface CompletenessMetricsMessage {
  type: 'completeness-metrics';
  timestamp: ISO8601String;
  projectPath: string;
  completionPercentage: number; // 0-100
  metrics: {
    totalStories: number;
    completedStories: number;
    totalTests: number;
    passingTests: number;
    testCoverage: number;        // Percentage
    linesOfCode: number;
    documentationCompleteness: number;
  };
  currentMilestone: 'quarter' | 'halfway' | 'three-quarters' | 'complete';
  milestonesAchieved: Milestone[];
  achievements: Achievement[];
  streak: {
    count: number;
    lastTaskAt: ISO8601String;
  };
}

// TaskProgressionMessage - Workflow context tracking
interface TaskProgressionMessage {
  type: 'task-progression';
  timestamp: ISO8601String;
  previousTask?: {
    storyId: string;
    status: 'complete' | 'blocked';
    completedAt: ISO8601String;
  };
  currentTask: {
    storyId: string;
    layer: string;
    tddPhase: 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENT';
    agent: string;
    startedAt: ISO8601String;
    estimatedCompletion: ISO8601String;
  };
  nextTask?: {
    storyId: string;
    layer: string;
    tddPhase: string;
    agent: string;
    predictedStart: ISO8601String;
  };
  phaseContext: {
    currentPhase: string;        // 'Phase 0: Assessment', 'Phase 8: Implementation'
    phasePath: string;           // '/docs/05-implementation/...'
  };
}

// ParallelZonesMessage - Multi-agent workflow visualization
interface ParallelZonesMessage {
  type: 'parallel-zones';
  timestamp: ISO8601String;
  zones: Array<{
    zoneId: string;             // 'red-zone-1', 'green-zone-1'
    zoneType: 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENT';
    agents: Array<{
      agentName: string;
      spriteColor: HexColor;
      currentPosition: { x: number; y: number };
      task: string;
      percentComplete: number;
    }>;
    layout: 'horizontal' | 'vertical' | 'grid';
  }>;
}
```

### 3.4 Data Flow: Task Execution → Dashboard Update

```
Developer invokes agent via Copilot Chat
         │
         ▼
Orchestrator Workflow Detected
         │
         ▼
File changes: /docs/05-implementation/epics/<EPIC>/user-stories/<US>/
         │
         ├─── AgentActivityMonitor detects ──────────────┐
         │                                               │
         ├─── WorkflowDetector classifies phase ─────────┤
         │                                               │
         ├─── CompletenessCalculator updates metrics ────┤
         │                                               │
         ├─── TaskProgressionTracker updates state ──────┤
         │                                               │
         └──────────────────────────────────────────────┤
                                                        │
                      PixelAgentsViewProvider          │
                      Batches 5 messages               │
                                                        │
                      ┌───────────────────────────────┤
                      │                               │
        AgentActivityMessage ──────────────────────────┼──┐
        ContextWindowMessage ──────────────────────────┼──├→ Webview
        CompletenessMetricsMessage ───────────────────┼──├   Message
        TaskProgressionMessage ──────────────────────┼──├   Channel
        ParallelZonesMessage ─────────────────────────┼──┘
                      │                               │
                      └───────────────────────────────┘
                                 │
                                 ▼
                    Webview Receives & Validates
                                 │
         ┌───────────┬─────────────┬──────────┬──────────┐
         │           │             │          │          │
         ▼           ▼             ▼          ▼          ▼
    Task Bar   Context Window  Completeness  Office    Achievements
    updates    updates color  updates meter   sprites   notifications
    (React)    (React)        (React)        animate   
                                            (Phaser)
                                 │
                                 ▼
                    UI Renders Updated State
                    (60fps animation loop)
```

---

## 4. Technology Stack

### 4.1 Backend (Main Process)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js (built-in) | VS Code extension native, no installation |
| **Language** | TypeScript | Type safety for complex state management |
| **Async** | Promises + async/await | Native ES2020 support, better than callbacks |
| **File Monitoring** | VS Code FS API + chokidar | VS Code native with fallback for edge cases |
| **Event System** | EventEmitter (built-in) | Pub/sub between monitors without external dependency |
| **State** | In-memory + Map/Set | Fast access, no serialization overhead |
| **Parsing** | yaml (npm) | For .github/agents/ metadata |

### 4.2 Frontend (Webview)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 18 + Vite | Fast dev experience, hot reload |
| **Language** | TypeScript | Type-safe props and state |
| **Styling** | Tailwind CSS + CSS Modules | Rapid UI development with canvas isolation |
| **Canvas** | Phaser 3 | Industry-standard 2D game engine (60fps guaranteed) |
| **Build** | Vite (ESBuild) | Sub-second rebuild, optimized for webview |
| **Testing** | Vitest + React Testing Library | Fast unit testing with DOM testing |

### 4.3 Shared/Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Types** | TypeScript interfaces (shared) | Single source of truth for message protocol |
| **Constants** | Enums + objects (shared) | Agent colors, animation speeds, thresholds |
| **Utilities** | Pure functions (shared) | Calculations, formatting (no side effects) |
| **Testing** | Jest + ts-jest | Comprehensive unit/integration coverage |
| **Linting** | ESLint + TypeScript Plugin | Code consistency, type-checking |

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance Requirements

| Requirement | Target | Monitoring |
|-------------|--------|-----------|
| Canvas FPS | 60fps sustained | WebGL profiling in DevTools |
| Message Latency | <100ms p95 | Timestamp deltas in messages |
| Monitor Startup | <500ms | Extension.activate() timing |
| Memory Usage | <150MB | VS Code memory monitor |
| File Watch Debounce | 500ms | User-imperceptible delay |
| State Update Batch | <16ms | React render time budget |

### 5.2 Scalability

| Dimension | Target | Design |
|-----------|--------|--------|
| Multi-project Support | 5-10 projects | Monitor sets per project, project switching |
| Agent Count | 15-20 agents | AgentRegistry with lazy loading |
| Story Count | 200+ stories | Pagination in task bar, virtualization |
| File Watch Scale | 1000+ files | Chokidar recursive with debounce |

### 5.3 Reliability

| Requirement | Implementation |
|-------------|-----------------|
| **Error Boundary** | React Error Boundary for UI crashes, graceful degradation |
| **Watcher Recovery** | Auto-restart on EMFILE errors (file descriptor limits) |
| **State Persistence** | localStorage for user preferences (tasks, agents, layout) |
| **Telemetry** | None (explicit constraint: local data only) |

---

## 6. Security Architecture

### 6.1 Data Protection

- ✅ **No Network Calls**: All data stays in VS Code process
- ✅ **No External APIs**: File system local, Copilot events local
- ✅ **User Data**: Project paths stored in workspace-scoped storage
- ✅ **Credentials**: Never stored or transmitted (Copilot handles auth)

### 6.2 Code Execution

- ✅ No `eval()` or dynamic code execution
- ✅ Parsed YAML/JSON validated with Zod schemas
- ✅ All user input sanitized before DOM insertion (React XSS prevention)

---

## 7. Deployment & Extensibility

### 7.1 VS Code Marketplace

- **Package Format**: .vsix (VS Code extension package)
- **Versioning**: SemVer with git tags
- **Marketplace**: Microsoft VS Code Marketplace + Cursor plugin registry
- **CI/CD**: GitHub Actions (build, test, publish)

### 7.2 Framework Support

**Extensibility Points**:
```
VS Code Extension (abstraction layer)
├── GitHub Copilot Channel (native)
├── Cursor Framework Adapter
├── Claude Desktop Adapter
├── Future Framework Adapter (plugin system)
└── Local LLM Adapter (dev mode)
```

---

## 8. Implementation Roadmap (Tier 1)

| Phase | Timeline | Epic | Deliverables | Blockers |
|-------|----------|------|--------------|----------|
| **Tier 1: MVP** | 12 weeks | EPIC-001-002 | Task Bar, Context, Meter, Basic Canvas | None |
| **Tier 2: Gamification** | 2 weeks | EPIC-002 | Achievements, streaks, PRU scoring | Tier 1 |
| **Tier 3: Multi-Project** | 2 weeks | EPIC-004 | Project switcher, parallel zones | Tier 1 |
| **Tier 4: Extensibility** | 2 weeks | EPIC-005 | Plugin system, framework adapters | All tiers |

---

## 9. Architectural Decision Records (ADRs)

### ADR-001: Modular Monolith Over Microservices

**Decision**: Use modular monolith architecture (Option C) instead of distributed services

**Rationale**:
- VS Code extension constraint: single-user, local execution
- Performance requirement (<100ms latency) incompatible with network overhead
- "No external services" requirement eliminates Option B
- Clear module boundaries allow future decomposition if needed

**Consequences**:
- ✅ Simpler operations, better performance
- ⚠️ Shared memory means careful state management
- Mitigation: Event-driven communication between monitors

---

### ADR-002: Phaser 3 for Canvas Animation

**Decision**: Use Phaser 3 game engine for 60fps office canvas rendering

**Rationale**:
- Guarantees 60fps with built-in optimization
- Proven for interactive 2D graphics (used in 10K+ games)
- WebGL fallback for older hardware
- Built-in sprites, animations, tween system
- Active community and excellent documentation

**Consequences**:
- ✅ Meets 60fps requirement with confidence
- ⚠️ 650KB bundle size (acceptable for local extension)
- Mitigation: Tree-shaking unused Phaser modules

---

### ADR-003: Message Protocol Over Direct State Access

**Decision**: Use strictly-typed message protocol instead of exposing shared state to webview

**Rationale**:
- Loose coupling between monitors and UI
- Type safety prevents schema mismatches
- Clear separation of concerns
- Easier to version and evolve independently
- Enables testing without real webview

**Consequences**:
- ✅ Maintainability, testability, extensibility
- ⚠️ Small performance overhead (serialization)
- Mitigation: Batch messages into single update cycle

---

## 10. Quality Gates (Phase 3-4 Checkpoint)

**Before proceeding to Phase 5 (Testing)**, validate:

- ✅ Architecture diagrams (C4 models) complete and reviewed
- ✅ Tech stack selected with rationale documented
- ✅ Message protocol interfaces fully defined
- ✅ Database schema (if any) designed
- ✅ API contracts finalized
- ✅ Deployment strategy documented
- ✅ Scalability analysis completed
- ✅ Security architecture validated
- ✅ All team members understand architecture
- ✅ No blocking concerns from dev teams

**Sign-Off Required By**: Product Owner, Tech Lead, Dev-Lead

---

**Next Phase**: Phase 5 (Testing Strategy) - See `03-testing.workflows.md`

**Related Documents**:
- Technical Specification: `tech-spec.md` (API, database, code generation)
- Design Systems: `design-systems.md` (UI components, tokens, accessibility)
- Implementation Plan: `05-implementation/epics/EPIC-001/user-stories/US-001-001/implementation-plan.md`
