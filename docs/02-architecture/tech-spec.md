# Technical Specification: Pixel Agents Dashboard

**Document Version**: 1.0.0  
**Created**: 2026-04-22  
**Author**: Solution Architect (David)  
**Phase**: Phases 3-4 (Architecture & Technical Design)  
**Tied to Architecture**: `architecture-design.md` (Modular Monolith, Option C)  

---

## Executive Summary

This technical specification provides **implementation-ready contracts** for the Pixel Agents extension. It bridges architecture design and code generation, defining:
- ✅ API message contracts (strongly-typed TypeScript interfaces)
- ✅ State management models (in-memory data structures)
- ✅ Backend monitor specifications (behavior, inputs, outputs)
- ✅ Frontend component specifications (props, state, lifecycle)
- ✅ Performance characteristics and optimization strategies

---

## 1. Technical Stack Summary

### Backend (Main Process)
- **Runtime**: Node.js (VS Code built-in, v18+)
- **Language**: TypeScript
- **Package Manager**: npm
- **Key Dependencies**: `yaml`, `chokidar`, `zod` (validation)

### Frontend (Webview)
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Canvas**: Phaser 3
- **Build Tool**: Vite (ESBuild)
- **Key Dependencies**: `react`, `phaser`, `zustand` (state), `tailwindcss`

### Shared
- **Type Definition**: TypeScript interfaces (single source of truth)
- **Testing**: Jest, Vitest, React Testing Library
- **Linting**: ESLint, TypeScript strict mode

---

## 2. API Message Contracts (Complete Specification)

### 2.1 AgentActivityMessage

**Purpose**: Real-time notification of agent actions and task progression.

**Message Shape**:
```typescript
interface AgentActivityMessage {
  // Message metadata
  type: 'agent-activity';
  timestamp: string;                    // ISO8601, server time
  messageId: string;                    // UUID v4 for deduplication
  
  // Agent identification
  agentName: string;                    // 'dev-tdd-red', 'orchestrator', 'ux-designer'
  agentType: 'dev' | 'orchestrator' | 'ux' | 'qa' | 'pm' | 'architect' | 'other';
  agentMetadata: {
    displayName: string;                // "TDD RED Phase"
    spriteColor: string;                // Hex color #FF5500
    spriteShape: 'circle' | 'square' | 'triangle' | 'star';
    icon: string;                       // Emoji or SVG reference
  };
  
  // Task information
  currentTask: {
    storyId: string;                    // US-045
    epicId: string;                     // EPIC-001
    layer: string;                      // "Layer 1: DB & Domain"
    tddPhase?: 'RED' | 'GREEN' | 'REFACTOR';
    description: string;                // "Write failing test for email validation"
    estimatedCompletion?: string;       // ISO8601 time
  };
  
  // Code snapshot
  codeSnippet?: {
    content: string;                    // First 200 chars of code being written
    language: 'typescript' | 'rust' | 'javascript' | 'other';
    lineNumber?: number;                // File location context
    fileName?: string;                  // Short name (src/auth/validator.ts)
  };
  
  // Status tracking
  status: 'active' | 'thinking' | 'complete' | 'error' | 'blocked';
  progress: number;                     // 0-100 percent complete
  
  // Error context (if applicable)
  error?: {
    type: string;                       // 'compilation_error', 'test_failure', 'blocker'
    message: string;                    // Error description
    actionRequired?: boolean;           // Does developer need to intervene?
  };
}

// Example payload:
const example: AgentActivityMessage = {
  type: 'agent-activity',
  timestamp: '2026-04-22T14:35:22Z',
  messageId: '550e8400-e29b-41d4-a716-446655440000',
  agentName: 'dev-tdd-red',
  agentType: 'dev',
  agentMetadata: {
    displayName: 'TDD RED Phase',
    spriteColor: '#FF5500',
    spriteShape: 'circle',
    icon: '🔴'
  },
  currentTask: {
    storyId: 'US-045',
    epicId: 'EPIC-001',
    layer: 'Layer 1: Domain Model',
    tddPhase: 'RED',
    description: 'Write failing test for email validation',
    estimatedCompletion: '2026-04-22T14:40:22Z'
  },
  codeSnippet: {
    content: 'test("should reject invalid email", () => {\n  expect(validator.isValid("bad")).toBe(false);',
    language: 'typescript',
    lineNumber: 45,
    fileName: 'auth.test.ts'
  },
  status: 'active',
  progress: 65,
};
```

**Broadcast Frequency**: Every file change or 5-second heartbeat (whichever is more frequent)

**Consumption**: 
- **TaskProgressionBar** subscribes to `currentTask` updates
- **ActionBubble** subscribes to `codeSnippet` updates
- **OfficeCanvas** subscribes to `status` and `progress` for sprite animation

---

### 2.2 ContextWindowMessage

**Purpose**: Real-time Copilot Chat context window usage tracking.

**Message Shape**:
```typescript
interface ContextWindowMessage {
  // Message metadata
  type: 'context-window';
  timestamp: string;                    // ISO8601
  messageId: string;                    // UUID v4
  
  // Token usage
  tokenUsage: {
    current: number;                    // Tokens used now
    limit: number;                      // Model context window (200K for GPT-4)
    percentage: number;                 // 0-100
    percentageThreshold: {
      warning: number;                  // 70%
      critical: number;                 // 90%
    };
  };
  
  // Breakdown by source
  breakdown: {
    githubInstructions: {
      tokens: number;
      percentage: number;
      color: '#3B82F6';                 // Blue
    };
    projectCode: {
      tokens: number;
      percentage: number;
      color: '#10B981';                 // Green
    };
    chatHistory: {
      tokens: number;
      percentage: number;
      color: '#F59E0B';                 // Yellow
    };
  };
  
  // Status indicator
  warningLevel: 'green' | 'yellow' | 'red';  // Based on percentage
  
  // Recommended action (if warning level > green)
  recommendation?: {
    action: 'summarize' | 'new_session' | 'reduce_context' | 'none';
    description: string;                // "Consider summarizing chat history"
  };
}

// Example payload:
const example: ContextWindowMessage = {
  type: 'context-window',
  timestamp: '2026-04-22T14:35:25Z',
  messageId: '550e8400-e29b-41d4-a716-446655440000',
  tokenUsage: {
    current: 174000,
    limit: 200000,
    percentage: 87,
    percentageThreshold: {
      warning: 70,
      critical: 90
    }
  },
  breakdown: {
    githubInstructions: {
      tokens: 45000,
      percentage: 26,
      color: '#3B82F6'
    },
    projectCode: {
      tokens: 78000,
      percentage: 45,
      color: '#10B981'
    },
    chatHistory: {
      tokens: 51000,
      percentage: 29,
      color: '#F59E0B'
    }
  },
  warningLevel: 'yellow',
  recommendation: {
    action: 'summarize',
    description: 'Consider creating a checkpoint: summarize chat history to reduce tokens'
  }
};
```

**Broadcast Frequency**: Every 2-5 seconds (Copilot Chat activity detected)

**Consumption**:
- **ContextWindowBar** subscribes to `tokenUsage` and `warningLevel`
- **Notification System** alerts at `warning` and `critical` levels
- **ParallelZonesMessage** may trigger if context too high for multi-agent work

---

### 2.3 CompletenessMetricsMessage

**Purpose**: Project progress tracking and gamification milestone detection.

**Message Shape**:
```typescript
interface CompletenessMetricsMessage {
  // Message metadata
  type: 'completeness-metrics';
  timestamp: string;
  messageId: string;
  
  // Project context
  projectPath: string;                  // /Users/.../pixel-agents
  projectName: string;                  // "Pixel Agents"
  
  // Overall progress
  completion: {
    percentage: number;                 // 0-100
    previousPercentage: number;         // For delta calculation
    deltaThisCycle: number;             // Percentage gained
  };
  
  // Detailed metrics (components of completion)
  metrics: {
    stories: {
      total: number;
      completed: number;
      inProgress: number;
      blocked: number;
    };
    tests: {
      total: number;
      passing: number;
      failing: number;
      coverage: number;                 // 0-100 percent
    };
    documentation: {
      prDComplete: boolean;
      architectureComplete: boolean;
      testStrategyComplete: boolean;
      implementationPlansComplete: number; // Count
    };
    code: {
      linesOfCode: number;
      linesOfTest: number;
      cyclomatic: number;               // Max complexity in codebase
    };
  };
  
  // Gamification triggers
  gamification: {
    currentMilestone: 'quarter' | 'halfway' | 'three-quarters' | 'complete' | 'none';
    milestoneAchieved: boolean;         // Did we just cross a milestone?
    milestoneName?: string;             // "50% Complete - Halfway There!"
    
    streak: {
      count: number;                    // Consecutive completions
      tasksInStreak: string[];          // [US-044, US-045, US-046]
      lastCompletedAt: string;          // ISO8601
    };
    
    achievements: Array<{
      id: string;                       // 'tdd-master', 'project-victory'
      name: string;                     // "TDD Master"
      description: string;              // "Completed 10 TDD cycles"
      unlockedAt: string;               // ISO8601 when unlocked
      icon: string;                     // 🏆
    }>;
    
    pruScore: {
      efficiency: number;               // 0-100 (lower tokens per test)
      tasksPerDay: number;
      estimatedCost: number;            // Dollars
    };
  };
}

// Example payload:
const example: CompletenessMetricsMessage = {
  type: 'completeness-metrics',
  timestamp: '2026-04-22T14:35:30Z',
  messageId: '550e8400-e29b-41d4-a716-446655440000',
  projectPath: '/Users/me/workspace/pixel-agents',
  projectName: 'Pixel Agents',
  completion: {
    percentage: 52,
    previousPercentage: 51,
    deltaThisCycle: 1
  },
  metrics: {
    stories: {
      total: 14,
      completed: 7,
      inProgress: 1,
      blocked: 0
    },
    tests: {
      total: 156,
      passing: 143,
      failing: 13,
      coverage: 82
    },
    documentation: {
      prDComplete: true,
      architectureComplete: true,
      testStrategyComplete: true,
      implementationPlansComplete: 2
    },
    code: {
      linesOfCode: 4250,
      linesOfTest: 6100,
      cyclomatic: 8
    }
  },
  gamification: {
    currentMilestone: 'halfway',
    milestoneAchieved: true,           // Just hit 50%!
    milestoneName: '50% Complete - Halfway There!',
    streak: {
      count: 3,
      tasksInStreak: ['US-043', 'US-044', 'US-045'],
      lastCompletedAt: '2026-04-22T14:00:00Z'
    },
    achievements: [
      {
        id: 'tdd-master',
        name: 'TDD Master',
        description: 'Completed 10 TDD cycles',
        unlockedAt: '2026-04-22T13:45:00Z',
        icon: '🔴🟢'
      }
    ],
    pruScore: {
      efficiency: 78,
      tasksPerDay: 2.5,
      estimatedCost: 1240
    }
  }
};
```

**Broadcast Frequency**: Every file change in `/docs/05-implementation/` or test execution

**Consumption**:
- **CompletenessBar** subscribes to `completion.percentage`
- **Notification System** alerts on milestone achievements
- **OfficeCanvas** triggers celebration animations on milestones
- **Sidebar** shows streak counter and achievements

---

### 2.4 TaskProgressionMessage

**Purpose**: Workflow context for task navigation and PDLC phase tracking.

**Message Shape**:
```typescript
interface TaskProgressionMessage {
  // Message metadata
  type: 'task-progression';
  timestamp: string;
  messageId: string;
  
  // Task window (3 tasks)
  taskWindow: {
    previous?: {
      storyId: string;
      epicId: string;
      layer: string;
      status: 'complete' | 'blocked' | 'abandoned';
      completedAt: string;              // ISO8601
      duration: number;                 // Seconds
    };
    
    current: {
      storyId: string;
      epicId: string;
      layer: string;
      tddPhase: 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENT';
      agent: string;
      description: string;
      startedAt: string;
      estimatedCompletion: string;
      progressPercent: number;          // 0-100
    };
    
    next?: {
      storyId: string;
      epicId: string;
      layer: string;
      tddPhase?: string;
      agent?: string;
      predictedStart: string;           // ISO8601 estimated time
      dependencies?: string[];          // Other tasks blocking this
    };
  };
  
  // PDLC phase context
  phase: {
    current: string;                    // "Phase 8: Implementation"
    path: string;                       // "/docs/05-implementation/..."
    agents: string[];                   // All agents active in phase
  };
  
  // Navigation metadata
  navigation: {
    filePath: string;                   // Link to current story implementation-plan.md
    docsPath: string;                   // Link to current phase docs
    isClickable: boolean;               // Can user navigate?
  };
}

// Example payload:
const example: TaskProgressionMessage = {
  type: 'task-progression',
  timestamp: '2026-04-22T14:35:35Z',
  messageId: '550e8400-e29b-41d4-a716-446655440000',
  taskWindow: {
    previous: {
      storyId: 'US-044',
      epicId: 'EPIC-001',
      layer: 'Layer 1: Domain Model',
      status: 'complete',
      completedAt: '2026-04-22T14:10:00Z',
      duration: 1800
    },
    current: {
      storyId: 'US-045',
      epicId: 'EPIC-001',
      layer: 'Layer 2: Service Layer',
      tddPhase: 'RED',
      agent: 'dev-tdd-red',
      description: 'Write failing test for EmailValidator service',
      startedAt: '2026-04-22T14:15:00Z',
      estimatedCompletion: '2026-04-22T14:40:00Z',
      progressPercent: 65
    },
    next: {
      storyId: 'US-046',
      epicId: 'EPIC-001',
      layer: 'Layer 2: Service Layer',
      tddPhase: 'RED',
      agent: 'dev-tdd-red',
      predictedStart: '2026-04-22T14:40:00Z',
      dependencies: ['US-045']
    }
  },
  phase: {
    current: 'Phase 8: Implementation (TDD)',
    path: '/docs/05-implementation/epics/EPIC-001/user-stories/US-045/',
    agents: ['dev-tdd-red', 'dev-tdd-green', 'dev-tdd-refactor', 'dev-lead', 'qa']
  },
  navigation: {
    filePath: '/docs/05-implementation/epics/EPIC-001/user-stories/US-045/implementation-plan.md',
    docsPath: '/docs/05-implementation/',
    isClickable: true
  }
};
```

**Broadcast Frequency**: Every task change, every 10 seconds (heartbeat)

**Consumption**:
- **TaskProgressionBar** subscribes to `taskWindow` (previous, current, next)
- **OfficeCanvas** updates agent positions based on `current.tddPhase`
- **Sidebar** shows task history

---

### 2.5 ParallelZonesMessage

**Purpose**: Visualize multi-agent, multi-TDD-phase concurrent work.

**Message Shape**:
```typescript
interface ParallelZonesMessage {
  // Message metadata
  type: 'parallel-zones';
  timestamp: string;
  messageId: string;
  
  // Layout configuration
  layout: {
    type: 'horizontal' | 'vertical' | 'grid';
    zonesCount: number;                 // How many zones active
    spacing: number;                    // Pixels between zones
  };
  
  // Active zones (one per TDD phase or epic)
  zones: Array<{
    zoneId: string;                     // 'red-zone-1', 'green-zone-1'
    zoneName: string;                   // "RED Phase - Layer 1"
    zoneType: 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENT';
    color: string;                      // Hex color (#FF5500 for RED)
    
    // Agents in zone
    agents: Array<{
      agentName: string;                // 'dev-tdd-red'
      spriteColor: string;
      spritePosition: {
        x: number;
        y: number;
      };
      taskDescription: string;
      progressPercent: number;
      status: 'active' | 'thinking' | 'complete';
    }>;
    
    // Zone progression
    completionPercent: number;           // 0-100
    estimatedCompletion: string;        // ISO8601
  }>;
}

// Example payload:
const example: ParallelZonesMessage = {
  type: 'parallel-zones',
  timestamp: '2026-04-22T14:35:40Z',
  messageId: '550e8400-e29b-41d4-a716-446655440000',
  layout: {
    type: 'horizontal',
    zonesCount: 3,
    spacing: 64
  },
  zones: [
    {
      zoneId: 'red-zone-1',
      zoneName: 'RED Phase - Layer 1: Writing Tests',
      zoneType: 'RED',
      color: '#FF5500',
      agents: [
        {
          agentName: 'dev-tdd-red',
          spriteColor: '#FF5500',
          spritePosition: { x: 50, y: 150 },
          taskDescription: 'Write test for validator',
          progressPercent: 65,
          status: 'active'
        }
      ],
      completionPercent: 65,
      estimatedCompletion: '2026-04-22T14:40:00Z'
    },
    {
      zoneId: 'green-zone-1',
      zoneName: 'GREEN Phase - Layer 1: Implementation',
      zoneType: 'GREEN',
      color: '#10B981',
      agents: [
        {
          agentName: 'dev-tdd-green',
          spriteColor: '#10B981',
          spritePosition: { x: 350, y: 150 },
          taskDescription: 'Implement validator function',
          progressPercent: 40,
          status: 'thinking'
        }
      ],
      completionPercent: 40,
      estimatedCompletion: '2026-04-22T15:10:00Z'
    }
  ]
};
```

**Broadcast Frequency**: When zones change (agents added/removed), or every 5 seconds

**Consumption**:
- **OfficeCanvas** renders zones and agent sprites
- **ParallelZonesManager** controls zone layout and animations

---

## 3. State Management (Backend)

### 3.1 AgentRegistry (In-Memory Store)

```typescript
interface Agent {
  id: string;                           // 'orchestrator', 'dev-tdd-red'
  name: string;                         // Display name
  type: string;                         // 'dev', 'orchestrator', etc.
  spriteColor: string;                  // Hex color
  spriteShape: 'circle' | 'square' | 'triangle' | 'star';
  icon: string;                         // Emoji
  isActive: boolean;
  currentTask?: string;                 // US-XXX
  lastSeen: Date;
  metadata: Record<string, any>;        // From .github/agents/*.md
}

interface AgentRegistry {
  agents: Map<string, Agent>;           // By agent ID
  activeAgents: Set<string>;            // Currently working
  
  // Methods
  getAgent(id: string): Agent | undefined;
  registerAgent(agent: Agent): void;
  updateAgentStatus(id: string, status: Partial<Agent>): void;
  getAllActive(): Agent[];
}
```

### 3.2 ProjectRegistry (In-Memory Store)

```typescript
interface ProjectMetadata {
  path: string;
  name: string;
  phase: string;                        // Phase 0-8
  phasePath: string;                    // /docs/XX-phase-name
  epics: EpicMetadata[];
  currentStory?: StoryMetadata;
  lastUpdated: Date;
}

interface ProjectRegistry {
  projects: Map<string, ProjectMetadata>; // By path
  activeProject: string;                 // Current project path
  
  // Methods
  registerProject(metadata: ProjectMetadata): void;
  getCurrentPhase(): string;
  getActiveStory(): StoryMetadata | undefined;
}
```

### 3.3 WorkflowState (Central State Bus)

```typescript
interface WorkflowState {
  // Current execution context
  activeAgent: Agent | null;
  activeTask: TaskMetadata | null;
  taskHistory: TaskMetadata[];          // Last 10 tasks
  
  // Metrics snapshots
  completeness: CompletenessSnapshot;
  contextWindow: ContextWindowSnapshot;
  
  // Zones (for parallel work)
  parallelZones: Zone[];
  
  // Listeners for state changes
  onStateChange(listener: (state: WorkflowState) => void): () => void;
}

interface CompletenessSnapshot {
  percentage: number;
  metrics: CompletenessMetricsMessage['metrics'];
  gamification: CompletenessMetricsMessage['gamification'];
  timestamp: Date;
}

interface ContextWindowSnapshot {
  tokenUsage: ContextWindowMessage['tokenUsage'];
  breakdown: ContextWindowMessage['breakdown'];
  warningLevel: ContextWindowMessage['warningLevel'];
  timestamp: Date;
}
```

---

## 4. Backend Monitor Specifications

### 4.1 AgentActivityMonitor

**Responsibilities**:
- Watch workspace for `/docs/05-implementation/` file changes
- Detect which agent is working (by file ownership, timestamps)
- Extract code snippets from modified files
- Emit `AgentActivityMessage` for every change

**Interface**:
```typescript
interface AgentActivityMonitor {
  // Start monitoring
  start(workspacePath: string): Promise<void>;
  stop(): Promise<void>;
  
  // Event emitters
  on('activity', (message: AgentActivityMessage) => void): void;
  
  // State
  currentAgent: Agent | null;
  currentTask: TaskMetadata | null;
  
  // For testing
  simulateActivity(agent: Agent, task: TaskMetadata, snippet: string): void;
}
```

**Triggers**:
- `.md` file change in implementation-plan.md (task progress)
- `.ts` file change in src/ directory (code written)
- Git commit in implementation branch (checkpoint)

**Message Frequency**: Debounced 300ms

---

### 4.2 ContextWindowAnalyzer

**Responsibilities**:
- Hook into VS Code Copilot Chat to capture token events
- Estimate token usage breakdown by file category
- Emit `ContextWindowMessage` with usage and recommendations

**Interface**:
```typescript
interface ContextWindowAnalyzer {
  start(): Promise<void>;
  stop(): Promise<void>;
  
  on('context-update', (message: ContextWindowMessage) => void): void;
  
  currentUsage: number;
  estimatedRemaining: number;
}
```

**Challenges**:
- Copilot Chat doesn't expose token counts directly
- Fallback: Estimate based on model + prompt + response lengths
- Formula: `tokens ≈ (instructions_length + project_code_length + chat_length) / 4`

---

### 4.3 CompletenessCalculator

**Responsibilities**:
- Scan `/docs/` and `src/` for project completeness signals
- Count completed stories, passing tests, documentation
- Detect milestone crossings
- Emit `CompletenessMetricsMessage`

**Interface**:
```typescript
interface CompletenessCalculator {
  calculateMetrics(projectPath: string): CompletenessMetrics;
  
  on('metrics-update', (message: CompletenessMetricsMessage) => void): void;
}
```

**Calculation Formula**:
```
completion% = (
  stories_complete: 25% +
  tests_passing: 25% +
  coverage: 25% +
  docs_complete: 25%
) / 4
```

---

### 4.4 TaskProgressionTracker

**Responsibilities**:
- Maintain state machine of current task progression
- Track previous → current → next task window
- Detect PDLC phase changes
- Emit `TaskProgressionMessage`

**State Machine**:
```
[Task Not Started]
      ↓
[Task RED Phase (test writing)]
      ↓
[Task GREEN Phase (implementation)]
      ↓
[Task REFACTOR Phase (cleanup)]
      ↓
[Task DOCUMENT Phase (if needed)]
      ↓
[Task Complete]
```

---

### 4.5 AgentInitializer

**Responsibilities**:
- Load agent metadata from `.github/agents/` directory
- Parse YAML frontmatter for sprite colors, shapes, icons
- Cache agent registry for quick lookups

**Interface**:
```typescript
interface AgentInitializer {
  loadAgents(baseDir: string): Promise<Agent[]>;
  watchForChanges(): void;
  getAgent(name: string): Agent | undefined;
}
```

---

### 4.6 WorkflowDetector

**Responsibilities**:
- Detect current PDLC phase from `/docs/` folder structure
- Map phase → agents responsible for phase
- Identify current epic and story IDs

**Detection Logic**:
```
IF /docs/05-implementation/epics/<EPIC>/user-stories/<STORY>/implementation-plan.md exists
  AND has [x] checkboxes in Layer 1
  THEN phase = 8 (Implementation)
  
IF /docs/04-planning/ has active planning files
  THEN phase = 6-7 (Planning)
  
... (similar for phases 0-5)
```

---

### 4.7 PixelAgentsViewProvider

**Responsibilities**:
- Bridge between backend monitors and React webview
- Batch messages for efficient delivery
- Manage webview lifecycle and message routing

**Interface**:
```typescript
interface PixelAgentsViewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void>;
  
  sendMessage(message: Message): void;
  onMessage(listener: (message: any) => void): void;
}
```

**Message Batching Strategy**:
- Collect all monitor updates in 16ms window
- Send single batch to webview on next animation frame
- Deduplicate identical messages

---

## 5. Frontend Component Specifications

### 5.1 TaskProgressionBar Component

**Location**: `webview-ui/src/components/TaskProgressionBar.tsx`

**Props**:
```typescript
interface TaskProgressionBarProps {
  previousTask?: TaskMetadata;
  currentTask: TaskMetadata;
  nextTask?: TaskMetadata;
  onTaskClick?: (taskId: string) => void;
}
```

**Features**:
- Displays 3 sections: [✅ Previous] [🔄 Current] [⏭️ Next]
- Color-coded by PDLC phase (RED=#FF5500, GREEN=#10B981, etc.)
- Updates within 100ms of message arrival
- Clickable to navigate to story details

---

### 5.2 ContextWindowBar Component

**Location**: `webview-ui/src/components/ContextWindowBar.tsx`

**Props**:
```typescript
interface ContextWindowBarProps {
  percentage: number;                   // 0-100
  breakdown: ContextWindowMessage['breakdown'];
  warningLevel: 'green' | 'yellow' | 'red';
  recommendation?: string;
}
```

**Features**:
- Vertical progress bar on left side
- Color-coded: green (0-70%) → yellow (71-89%) → red (90%+)
- Stacked bars showing .github / project / chat breakdowns
- Tooltip with exact token counts

---

### 5.3 CompletenessBar Component

**Location**: `webview-ui/src/components/CompletenessBar.tsx`

**Props**:
```typescript
interface CompletenessBarProps {
  percentage: number;
  metrics: CompletenessMetricsMessage['metrics'];
  milestoneAchieved: boolean;
  milestoneName?: string;
  achievements: Achievement[];
}
```

**Features**:
- Horizontal progress bar on right side
- Milestone markers at 25%, 50%, 75%, 100%
- Celebration animation on milestone crossing
- Achievement badges displayed

---

### 5.4 OfficeCanvas Component (Phaser 3)

**Location**: `webview-ui/src/components/OfficeCanvas.tsx`

**Initialization**:
```typescript
export function OfficeCanvas() {
  const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      }
    },
    scene: OfficeScene,
    render: {
      pixelArt: true,
      antialias: false,
    }
  };
  
  const game = new Phaser.Game(config);
  return <div id="office-canvas" style={{ width: '100%', height: '100%' }} />;
}
```

**OfficeScene Responsibilities**:
- Render office environment (walls, desks, zones)
- Spawn agent sprites with unique colors/shapes
- Animate sprites moving between zones
- Display action bubbles with code snippets
- Handle zone transitions (RED → GREEN → REFACTOR)

**Zone Rendering**:
```
┌──────────────────────────────────────────────────────┐
│                    OFFICE LAYOUT                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [RED Zone]          [GREEN Zone]      [REFACTOR]   │
│  🔴 dev-tdd-red      🟢 dev-tdd-green  🟣 refactor  │
│  "Writing test"      "Making green"    "Clean code" │
│  ████████░░ 80%      ██████░░░░ 60%    ██░░░░░░░░50%│
│                                                      │
├──────────────────────────────────────────────────────┤
```

---

## 6. Performance Optimization Strategies

### 6.1 Rendering (60fps Target)

- **Canvas**: Phaser's built-in optimization (dirty rect culling)
- **React**: useCallback + useMemo for expensive computations
- **Message Batching**: Collect 16ms worth of updates before rendering
- **Virtualization**: Large lists (task history) use virtualization

### 6.2 Memory Management

- **Event Cleanup**: Unsubscribe from monitors on unmount
- **Debouncing**: File watchers debounced 500ms
- **Caching**: Agent metadata cached after initial load
- **Memory Limits**: Cap task history at 100 items

### 6.3 Network (Message Protocol)

- **Compression**: Duplicate messages deduplicated before sending
- **Throttling**: Context window updates throttled to max 5/sec
- **Lazy Loading**: Agent sprites loaded on-demand

---

## 7. Database/State Persistence

**Note**: Pixel Agents is client-side only, no server database. State persisted via:

- **VS Code GlobalStorage**: User preferences (theme, layout)
- **Workspace Storage**: Project-specific settings
- **localStorage (Webview)**: React component state cache

**Persistence Schema**:
```typescript
interface PixelAgentsStorage {
  preferences: {
    theme: 'light' | 'dark';
    animationSpeed: 'slow' | 'normal' | 'fast';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  layout: {
    zoneType: 'horizontal' | 'vertical' | 'grid';
    selectedAgents: string[];
  };
  projects: Map<string, ProjectPreferences>;
}
```

---

## 8. API Integration Points

**Note**: Pixel Agents has NO external API calls. All data from:

1. **VS Code Extension API** - Workspace, files, configuration
2. **GitHub Copilot Events** - Token usage, agent activity (via event hooks)
3. **File System** - Reading `/docs/` and `src/` structure
4. **Git** - Commit history (if available)

---

## 9. Error Handling & Resilience

### 9.1 Monitor Failures

- **Watcher EMFILE**: Auto-restart watcher, reduce file watch limit
- **Copilot Hook Unavailable**: Gracefully degrade (show "unknown" for context)
- **File Parse Errors**: Log error, continue with previous state

### 9.2 UI Errors

- **React Error Boundary**: Catch component rendering errors, show fallback UI
- **Message Validation**: Zod schemas validate all incoming messages
- **Type Errors**: TypeScript strict mode prevents runtime surprises

---

## 10. Quality Assurance Checklist (Phase 4)

Before proceeding to Phase 5 (Testing), validate:

- ✅ All 5 message protocol types defined with examples
- ✅ Backend monitor specifications complete
- ✅ Frontend component props documented
- ✅ Performance targets quantified (60fps, <100ms latency)
- ✅ Error handling strategies for all failure modes
- ✅ State persistence approach documented
- ✅ Code generation templates prepared (from this spec)
- ✅ Dev team reviewed and confirms implementability

---

**Sign-Off Required By**: Tech Lead, Dev-Lead, QA Lead

**Next Document**: `design-systems.md` (UI components, tokens, accessibility)

**Phase 5 Handoff**: Architecture + Tech Spec → Testing Strategy
