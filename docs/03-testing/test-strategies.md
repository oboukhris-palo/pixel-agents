# Testing Strategy: Pixel Agents Dashboard

**Document Version**: 1.0.0  
**Created**: 2026-04-22  
**Author**: QA Lead with Solution Architect Input  
**Phase**: Phase 5 (Testing Strategy)  
**Tied to Architecture**: `02-architecture/architecture-design.md`, `02-architecture/tech-spec.md`  

---

## Executive Summary

This testing strategy ensures **Pixel Agents delivers a robust, performant, and accessible AI orchestration dashboard** through comprehensive test coverage across all layers. The strategy balances:

- ✅ **BDD-driven acceptance testing** — Verify user stories meet requirements
- ✅ **Unit testing** — Validate component behavior in isolation
- ✅ **Integration testing** — Ensure monitors and UI communicate correctly
- ✅ **E2E testing** — Validate complete workflows
- ✅ **Performance testing** — Guarantee 60fps + <100ms latency
- ✅ **Accessibility testing** — Ensure WCAG 2.1 AA compliance

**Test Coverage Target**: **>80%** code coverage across all layers

---

## 1. Testing Philosophy

### 1.1 Core Principles

**BDD First**: Every user story has corresponding Gherkin scenarios before implementation

**Test Pyramid**: Balance unit tests (fast, many) with E2E tests (slow, few)

**Shift Left**: Test early in development cycle, not just at the end

**Continuous Testing**: All tests run in CI/CD on every commit

**Quality Gates**: No PR merge without passing tests + coverage threshold

### 1.2 Testing Mindset

```
┌─────────────────────────────────────┐
│  E2E Tests (Slow, Comprehensive)    │  10-15%
├─────────────────────────────────────┤
│  Integration Tests (Medium Speed)   │  20-30%
├─────────────────────────────────────┤
│  Unit Tests (Fast, Focused)         │  55-70%
└─────────────────────────────────────┘
```

**Rationale**:
- Unit tests verify individual components (monitors, React components)
- Integration tests verify message protocol and state management
- E2E tests verify complete user workflows

---

## 2. BDD (Behavior-Driven Development) Strategy

### 2.1 BDD Scenario Coverage

**Existing BDD Scenarios** (Generated from Phase 1-2):
- ✅ **EPIC-001**: Workflow Visualization (9 scenarios)
- ✅ **EPIC-002**: Context & Task Management (7 scenarios)
- ✅ **EPIC-003**: Agent Customization (planned)
- ✅ **EPIC-004**: Multi-Project Coordination (planned)
- ✅ **EPIC-005**: Platform Extensibility (planned)

**Location**: `/docs/03-testing/scenarios/`

### 2.2 BDD Execution Strategy

**Tools**:
- **Cucumber.js** (Gherkin parser)
- **Playwright** (E2E automation)
- **Jest** (test runner)

**Workflow**:
1. **Before Implementation**: BA writes Gherkin scenarios for user story
2. **Dev-Lead Reviews**: Ensure scenarios testable
3. **RED Phase**: Implement step definitions (tests fail)
4. **GREEN Phase**: Implement functionality (tests pass)
5. **CI/CD**: Run all BDD scenarios on every commit

**Example BDD Scenario Execution**:
```gherkin
Feature: Task Progression Bar Implementation
  
  Scenario: Display task progression bar with three sections
    When I open the Pixel Agents dashboard
    Then I should see the Task Progression Bar at the top
    And the bar shows three sections: "Previous", "Current", and "Next"
```

**Step Definition** (TypeScript):
```typescript
// tests/bdd/steps/task-progression-bar.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I open the Pixel Agents dashboard', async function () {
  await this.page.goto('vscode://pixel-agents/dashboard');
  await this.page.waitForSelector('[data-testid="pixel-agents-dashboard"]');
});

Then('I should see the Task Progression Bar at the top', async function () {
  const bar = await this.page.locator('[data-testid="task-progression-bar"]');
  await expect(bar).toBeVisible();
  const position = await bar.boundingBox();
  expect(position?.y).toBeLessThan(100); // Top of screen
});

Then('the bar shows three sections: {string}, {string}, and {string}', 
  async function (prev: string, curr: string, next: string) {
    await expect(this.page.locator('[data-testid="previous-task"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="current-task"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="next-task"]')).toBeVisible();
  }
);
```

### 2.3 BDD Coverage Matrix

| Epic | Story | BDD Scenarios | Status |
|------|-------|---------------|--------|
| EPIC-001 | US-001-001 | 9 scenarios (task progression) | ✅ Written |
| EPIC-001 | US-001-002 | 7 scenarios (workflow status) | ✅ Written |
| EPIC-001 | US-001-003 | 6 scenarios (document monitoring) | ✅ Written |
| EPIC-002 | US-002-001 | 7 scenarios (context window) | ✅ Written |
| EPIC-002 | US-002-002 | 6 scenarios (completeness meter) | ✅ Written |
| EPIC-002 | US-002-003 | 5 scenarios (gamification) | ⏳ Planned |
| EPIC-003+ | All stories | TBD | ⏳ Planned |

**Total BDD Scenarios**: 40+ scenarios (covering MVP stories)

---

## 3. Unit Testing Strategy

### 3.1 Backend Unit Tests (Monitors)

**Coverage Target**: **90%+** for all monitors

**Test Framework**: **Jest** with TypeScript

**What to Test**:
- ✅ Each monitor in isolation
- ✅ State management (AgentRegistry, ProjectRegistry, WorkflowState)
- ✅ Message construction (all 5 message types)
- ✅ File parsing logic
- ✅ Error handling and edge cases

**Example: AgentActivityMonitor Tests**:
```typescript
// src/agentActivityMonitor.test.ts
describe('AgentActivityMonitor', () => {
  let monitor: AgentActivityMonitor;
  let mockWorkspace: MockWorkspace;

  beforeEach(() => {
    mockWorkspace = createMockWorkspace();
    monitor = new AgentActivityMonitor(mockWorkspace);
  });

  describe('start()', () => {
    it('should initialize file watchers for implementation folders', async () => {
      await monitor.start('/test/workspace');
      expect(mockWorkspace.watchFiles).toHaveBeenCalledWith(
        '/test/workspace/docs/05-implementation/**'
      );
    });

    it('should emit activity message within 300ms of file change', async () => {
      const activitySpy = jest.fn();
      monitor.on('activity', activitySpy);

      await monitor.start('/test/workspace');
      mockWorkspace.emitFileChange('implementation-plan.md');

      await waitFor(() => expect(activitySpy).toHaveBeenCalled(), { timeout: 500 });
      expect(activitySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'agent-activity',
          timestamp: expect.any(String),
          agentName: expect.any(String)
        })
      );
    });
  });

  describe('detectAgent()', () => {
    it('should identify agent from file path pattern', () => {
      const agent = monitor.detectAgent('/docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md');
      expect(agent).toBe('dev-lead');
    });

    it('should return null for unknown file patterns', () => {
      const agent = monitor.detectAgent('/unknown/path.txt');
      expect(agent).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should gracefully handle EMFILE errors and retry', async () => {
      mockWorkspace.watchFiles.mockRejectedValueOnce(new Error('EMFILE'));
      const errorSpy = jest.fn();
      monitor.on('error', errorSpy);

      await monitor.start('/test/workspace');

      expect(errorSpy).toHaveBeenCalled();
      expect(monitor.isRunning).toBe(true); // Recovered
    });
  });
});
```

**Key Test Patterns**:
- **Mocking**: Mock file system, VS Code API, Copilot events
- **Async Testing**: Use `async/await` and `waitFor()` helpers
- **Error Simulation**: Test all error paths (EMFILE, parse errors, null checks)
- **Performance**: Measure debounce timing, ensure <300ms response

### 3.2 Frontend Unit Tests (React Components)

**Coverage Target**: **85%+** for all React components

**Test Framework**: **Vitest** + **React Testing Library**

**What to Test**:
- ✅ Component rendering (props → UI)
- ✅ User interactions (clicks, hovers, keyboard)
- ✅ State updates (message subscription)
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Error boundaries

**Example: TaskProgressionBar Tests**:
```typescript
// webview-ui/src/components/TaskProgressionBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskProgressionBar } from './TaskProgressionBar';
import { describe, it, expect, vi } from 'vitest';

describe('TaskProgressionBar', () => {
  const mockProps = {
    previousTask: { storyId: 'US-044', status: 'complete' },
    currentTask: { storyId: 'US-045', layer: 'Layer 2', tddPhase: 'RED' },
    nextTask: { storyId: 'US-046' },
    onTaskClick: vi.fn(),
  };

  it('should render three task sections', () => {
    render(<TaskProgressionBar {...mockProps} />);
    
    expect(screen.getByTestId('previous-task')).toBeInTheDocument();
    expect(screen.getByTestId('current-task')).toBeInTheDocument();
    expect(screen.getByTestId('next-task')).toBeInTheDocument();
  });

  it('should show checkmark icon for completed previous task', () => {
    render(<TaskProgressionBar {...mockProps} />);
    
    const previousTask = screen.getByTestId('previous-task');
    expect(previousTask).toHaveTextContent('✅');
    expect(previousTask).toHaveTextContent('US-044');
  });

  it('should apply RED phase color to current task', () => {
    render(<TaskProgressionBar {...mockProps} />);
    
    const currentTask = screen.getByTestId('current-task');
    expect(currentTask).toHaveStyle({ borderColor: '#FF5500' }); // RED color
  });

  it('should call onTaskClick when task is clicked', () => {
    render(<TaskProgressionBar {...mockProps} />);
    
    fireEvent.click(screen.getByTestId('current-task'));
    
    expect(mockProps.onTaskClick).toHaveBeenCalledWith('US-045');
  });

  it('should handle missing next task gracefully', () => {
    const propsWithoutNext = { ...mockProps, nextTask: undefined };
    render(<TaskProgressionBar {...propsWithoutNext} />);
    
    expect(screen.queryByTestId('next-task')).not.toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TaskProgressionBar {...mockProps} />);
      
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Task progression: Previous completed, current in progress, next planned'
      );
    });

    it('should be keyboard navigable', () => {
      render(<TaskProgressionBar {...mockProps} />);
      
      const currentTask = screen.getByTestId('current-task');
      currentTask.focus();
      
      expect(document.activeElement).toBe(currentTask);
      
      fireEvent.keyDown(currentTask, { key: 'Enter' });
      expect(mockProps.onTaskClick).toHaveBeenCalled();
    });
  });
});
```

### 3.3 Canvas Unit Tests (Phaser 3)

**Coverage Target**: **70%+** (visual components harder to test)

**Test Framework**: **Jest** with Phaser mocks

**What to Test**:
- ✅ Sprite creation and positioning
- ✅ Animation state transitions
- ✅ Zone rendering logic
- ✅ Collision detection (if applicable)
- ✅ Input handling (clicks on sprites)

**Example: OfficeScene Tests**:
```typescript
// webview-ui/src/office/OfficeScene.test.ts
import { OfficeScene } from './OfficeScene';
import Phaser from 'phaser';

describe('OfficeScene', () => {
  let scene: OfficeScene;
  let mockGame: Phaser.Game;

  beforeEach(() => {
    mockGame = createMockPhaserGame();
    scene = new OfficeScene();
    scene.game = mockGame;
    scene.create();
  });

  it('should create office zones on initialization', () => {
    expect(scene.zones).toHaveLength(3); // RED, GREEN, REFACTOR
    expect(scene.zones[0].zoneType).toBe('RED');
    expect(scene.zones[1].zoneType).toBe('GREEN');
    expect(scene.zones[2].zoneType).toBe('REFACTOR');
  });

  it('should spawn agent sprite with correct color', () => {
    const agent = { name: 'dev-tdd-red', spriteColor: '#FF5500', spriteShape: 'circle' };
    
    const sprite = scene.spawnAgent(agent);
    
    expect(sprite.tint).toBe(0xFF5500); // Hex to color
    expect(sprite.x).toBeGreaterThan(0);
    expect(sprite.y).toBeGreaterThan(0);
  });

  it('should animate sprite movement between zones', () => {
    const sprite = scene.agentSprites.get('dev-tdd-red');
    const targetZone = scene.zones.find(z => z.zoneType === 'GREEN');
    
    scene.moveAgentToZone('dev-tdd-red', targetZone);
    
    expect(scene.tweens.active).toHaveLength(1); // Movement tween active
  });

  it('should maintain 60fps update loop', () => {
    const startTime = Date.now();
    const frames = 60;
    
    for (let i = 0; i < frames; i++) {
      scene.update(16.67); // 60fps = ~16.67ms per frame
    }
    
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(1200); // Should complete in <1.2s (with overhead)
  });
});
```

---

## 4. Integration Testing Strategy

### 4.1 Backend Integration Tests

**Coverage Target**: **80%+** for integration points

**What to Test**:
- ✅ Monitor → Message Protocol → ViewProvider flow
- ✅ State synchronization between monitors
- ✅ File watcher → Activity detection → Message emission
- ✅ Error propagation and recovery

**Example: Message Protocol Integration Test**:
```typescript
// tests/integration/message-protocol.test.ts
describe('Message Protocol Integration', () => {
  let monitors: MonitorSet;
  let viewProvider: PixelAgentsViewProvider;
  let receivedMessages: any[];

  beforeEach(() => {
    monitors = createMonitorSet();
    viewProvider = new PixelAgentsViewProvider();
    receivedMessages = [];
    
    viewProvider.onMessage((msg) => receivedMessages.push(msg));
  });

  it('should emit AgentActivityMessage when file changes', async () => {
    await monitors.agentActivity.start('/test/workspace');
    
    // Simulate file change
    simulateFileChange('/test/workspace/docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md');
    
    await waitFor(() => receivedMessages.length > 0, { timeout: 1000 });
    
    const message = receivedMessages[0];
    expect(message.type).toBe('agent-activity');
    expect(message.agentName).toBe('dev-lead');
    expect(message.timestamp).toBeDefined();
  });

  it('should batch multiple monitor updates into single webview message', async () => {
    await monitors.agentActivity.start('/test/workspace');
    await monitors.completeness.start('/test/workspace');
    
    // Trigger multiple events simultaneously
    simulateFileChange('implementation-plan.md');
    simulateTestExecution({ passing: 10, failing: 0 });
    
    await waitFor(() => receivedMessages.length > 0, { timeout: 500 });
    
    // Should receive batched message (1 message, multiple types)
    expect(receivedMessages.length).toBe(1);
    expect(receivedMessages[0].batchedMessages).toHaveLength(2);
  });

  it('should recover from monitor crash without losing state', async () => {
    await monitors.agentActivity.start('/test/workspace');
    
    // Simulate monitor crash
    monitors.agentActivity.crash();
    
    // Should auto-restart
    await waitFor(() => monitors.agentActivity.isRunning, { timeout: 2000 });
    
    // Should still emit messages
    simulateFileChange('implementation-plan.md');
    await waitFor(() => receivedMessages.length > 0);
    expect(receivedMessages[0].type).toBe('agent-activity');
  });
});
```

### 4.2 Frontend Integration Tests

**What to Test**:
- ✅ Message subscription → State update → UI render
- ✅ User interaction → Backend command → UI update
- ✅ Canvas + React component coordination

**Example: Dashboard Integration Test**:
```typescript
// webview-ui/tests/integration/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { mockMessageChannel } from '../mocks/vscode';

describe('Dashboard Integration', () => {
  it('should update all components when receiving AgentActivityMessage', async () => {
    render(<App />);
    
    // Simulate backend message
    mockMessageChannel.postMessage({
      type: 'agent-activity',
      timestamp: '2026-04-22T14:00:00Z',
      agentName: 'dev-tdd-red',
      currentTask: {
        storyId: 'US-045',
        epicId: 'EPIC-001',
        layer: 'Layer 2',
        tddPhase: 'RED'
      },
      codeSnippet: {
        content: 'test("should validate email")',
        language: 'typescript'
      },
      status: 'active',
      progress: 65
    });
    
    // Verify UI updates
    await waitFor(() => {
      expect(screen.getByTestId('current-task')).toHaveTextContent('US-045');
      expect(screen.getByTestId('action-bubble')).toHaveTextContent('test("should validate email")');
      expect(screen.getByTestId('agent-sprite-dev-tdd-red')).toHaveAttribute('data-status', 'active');
    });
  });
});
```

---

## 5. End-to-End (E2E) Testing Strategy

### 5.1 E2E Test Coverage

**Tool**: **Playwright** (VS Code extension testing)

**Coverage**: **All critical user workflows**

**What to Test**:
- ✅ Extension activation and dashboard load
- ✅ Complete TDD workflow (RED → GREEN → REFACTOR)
- ✅ Multi-project switching
- ✅ Milestone achievements and celebrations
- ✅ Context window warnings and mitigation

### 5.2 E2E Test Examples

**Example: Complete User Story Workflow**:
```typescript
// tests/e2e/user-story-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('Complete TDD workflow for US-045', async ({ page }) => {
  // 1. Activate extension
  await page.goto('vscode://extension/pixel-agents');
  await expect(page.locator('[data-testid="pixel-agents-dashboard"]')).toBeVisible();
  
  // 2. Verify initial state
  const currentTask = page.locator('[data-testid="current-task"]');
  await expect(currentTask).toHaveText('US-045');
  await expect(currentTask).toHaveStyle({ borderColor: '#FF5500' }); // RED phase
  
  // 3. Simulate TDD RED phase completion
  await page.evaluate(() => {
    // Simulate file change via VS Code API
    vscode.workspace.fs.writeFile(
      vscode.Uri.file('/docs/05-implementation/epics/EPIC-001/user-stories/US-045/implementation-plan.md'),
      Buffer.from('Layer 1: [x] Write failing test')
    );
  });
  
  // 4. Verify dashboard updates
  await expect(page.locator('[data-testid="agent-sprite-dev-tdd-red"]')).toHaveAttribute('data-status', 'complete');
  await expect(currentTask).toHaveStyle({ borderColor: '#10B981' }); // GREEN phase
  
  // 5. Complete GREEN phase
  await page.evaluate(() => {
    vscode.workspace.fs.writeFile(
      vscode.Uri.file('/docs/05-implementation/epics/EPIC-001/user-stories/US-045/implementation-plan.md'),
      Buffer.from('Layer 1: [x] Write failing test\nLayer 1: [x] Implement code')
    );
  });
  
  // 6. Verify completeness meter updated
  const completenessMeter = page.locator('[data-testid="completeness-meter"]');
  const completionText = await completenessMeter.textContent();
  expect(parseInt(completionText!)).toBeGreaterThan(50); // Progress increased
  
  // 7. Verify achievement notification
  await expect(page.locator('[data-testid="achievement-tdd-master"]')).toBeVisible();
});

test('Context window warning at 90%', async ({ page }) => {
  await page.goto('vscode://extension/pixel-agents');
  
  // Simulate high token usage
  await page.evaluate(() => {
    window.postMessage({
      type: 'context-window',
      tokenUsage: { current: 180000, limit: 200000, percentage: 90 },
      warningLevel: 'red'
    });
  });
  
  // Verify warning displayed
  await expect(page.locator('[data-testid="context-warning"]')).toBeVisible();
  await expect(page.locator('[data-testid="context-warning"]')).toHaveText(/Critical overflow risk/);
  
  // Verify recommendation shown
  await page.click('[data-testid="view-recommendations"]');
  await expect(page.locator('[data-testid="recommendation-summarize"]')).toBeVisible();
});
```

---

## 6. Performance Testing Strategy

### 6.1 Performance Targets (from Architecture)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Canvas FPS** | 60fps sustained | Lighthouse, DevTools Performance |
| **Message Latency** | <100ms p95 | Custom instrumentation |
| **Monitor Startup** | <500ms | Extension activation timing |
| **Memory Usage** | <150MB | VS Code memory profiler |
| **File Watch Response** | <500ms | Debounce timing tests |

### 6.2 Performance Test Implementation

**Tool**: **Lighthouse** (Chromium-based), **Custom Metrics**

**Example: Canvas FPS Test**:
```typescript
// tests/performance/canvas-fps.test.ts
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

test('Canvas maintains 60fps during agent animations', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('vscode://extension/pixel-agents');
  
  // Start performance recording
  await page.evaluate(() => {
    window.fpsTracker = [];
    let lastTime = performance.now();
    
    function trackFPS() {
      const now = performance.now();
      const fps = 1000 / (now - lastTime);
      window.fpsTracker.push(fps);
      lastTime = now;
      
      if (window.fpsTracker.length < 600) { // 10 seconds @ 60fps
        requestAnimationFrame(trackFPS);
      }
    }
    
    requestAnimationFrame(trackFPS);
  });
  
  // Simulate heavy load (5 agents animating)
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) {
      window.postMessage({
        type: 'agent-activity',
        agentName: `dev-tdd-${i}`,
        status: 'active'
      });
    }
  });
  
  // Wait for tracking to complete
  await page.waitForTimeout(11000);
  
  // Analyze FPS
  const fpsData = await page.evaluate(() => window.fpsTracker);
  const avgFps = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
  const minFps = Math.min(...fpsData);
  
  expect(avgFps).toBeGreaterThan(58); // Allow small variance
  expect(minFps).toBeGreaterThan(50); // No severe drops
});
```

**Example: Message Latency Test**:
```typescript
// tests/performance/message-latency.test.ts
test('Message protocol responds within 100ms', async () => {
  const monitor = new AgentActivityMonitor();
  await monitor.start('/test/workspace');
  
  const latencies: number[] = [];
  
  monitor.on('activity', (message: AgentActivityMessage) => {
    const sentTime = Date.parse(message.timestamp);
    const receivedTime = Date.now();
    latencies.push(receivedTime - sentTime);
  });
  
  // Simulate 100 file changes
  for (let i = 0; i < 100; i++) {
    simulateFileChange('implementation-plan.md');
    await new Promise(resolve => setTimeout(resolve, 10)); // Space out changes
  }
  
  await waitFor(() => latencies.length === 100, { timeout: 15000 });
  
  // Calculate p95
  const sorted = latencies.sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  
  expect(p95).toBeLessThan(100); // p95 < 100ms
});
```

---

## 7. Accessibility Testing Strategy

### 7.1 WCAG 2.1 AA Compliance

**Target**: **100% WCAG 2.1 AA compliance**

**Tools**:
- **axe-core** (automated scanning)
- **WAVE** (manual verification)
- **Lighthouse** (accessibility audit)
- **Manual screen reader testing** (NVDA, VoiceOver)

### 7.2 Accessibility Test Checklist

| Category | Requirement | Test Method |
|----------|-------------|-------------|
| **Keyboard Navigation** | All interactive elements focusable | Manual + automated |
| **Focus Indicators** | 3px outline visible | Visual inspection |
| **Color Contrast** | 4.5:1 for text, 3:1 for UI | axe-core |
| **Screen Readers** | ARIA labels present | Manual testing |
| **Font Sizing** | Zoomable to 200% | Manual testing |
| **Alternative Text** | Images/icons described | axe-core |

### 7.3 Accessibility Test Implementation

**Automated Tests** (axe-core):
```typescript
// tests/accessibility/dashboard.a11y.test.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('Dashboard passes WCAG 2.1 AA standards', async ({ page }) => {
  await page.goto('vscode://extension/pixel-agents');
  await injectAxe(page);
  
  // Run axe accessibility scan
  const violations = await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
  
  expect(violations).toHaveLength(0);
});

test('Task Progression Bar is keyboard navigable', async ({ page }) => {
  await page.goto('vscode://extension/pixel-agents');
  
  // Focus first task
  await page.keyboard.press('Tab');
  let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focusedElement).toBe('previous-task');
  
  // Navigate to current task
  await page.keyboard.press('Tab');
  focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  expect(focusedElement).toBe('current-task');
  
  // Activate with Enter
  await page.keyboard.press('Enter');
  // Should navigate to story details
});
```

**Manual Screen Reader Test Protocol**:
1. Activate NVDA (Windows) or VoiceOver (macOS)
2. Navigate through entire dashboard using Tab key
3. Verify all elements announced correctly
4. Test form inputs and buttons with screen reader
5. Verify landmark regions (`<main>`, `<nav>`, `<aside>`)

---

## 8. Test Data Management

### 8.1 Test Data Strategy

**Approach**: **Fixture-based test data** with realistic project structures

**Test Fixtures**:
```
tests/fixtures/
├── minimal-project/           # 1 epic, 2 stories
│   └── docs/
│       ├── 01-requirements/
│       ├── 02-architecture/
│       └── 05-implementation/
│           └── epics/
│               └── EPIC-001/
│                   └── user-stories/
│                       ├── US-001/
│                       └── US-002/
├── multi-epic-project/        # 3 epics, 10 stories
├── large-project/             # 5 epics, 50 stories
└── edge-cases/
    ├── empty-project/
    ├── malformed-yaml/
    └── missing-files/
```

### 8.2 Test Data Factory

**Pattern**: Builder pattern for creating test data

```typescript
// tests/factories/projectFactory.ts
export class ProjectFactory {
  static createMinimalProject(path: string): void {
    fs.mkdirSync(`${path}/docs/05-implementation/epics/EPIC-001/user-stories/US-001`, { recursive: true });
    fs.writeFileSync(
      `${path}/docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md`,
      `## Layer 1: Database\n[ ] Create User table\n`
    );
  }

  static createStoryWithProgress(path: string, epicId: string, storyId: string, layer: number, completed: boolean): void {
    const checkbox = completed ? '[x]' : '[ ]';
    fs.writeFileSync(
      `${path}/docs/05-implementation/epics/${epicId}/user-stories/${storyId}/implementation-plan.md`,
      `## Layer ${layer}\n${checkbox} Task 1\n`
    );
  }
}
```

---

## 9. CI/CD Integration

### 9.1 CI Pipeline (GitHub Actions)

**Workflow**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
  
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Run accessibility tests
        run: npm run test:a11y
      
      - name: Upload axe report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: axe-report
          path: accessibility-report/
  
  coverage-gate:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    steps:
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi
```

### 9.2 Pre-Commit Hooks

**Tool**: **Husky** + **lint-staged**

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:changed"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.test.{ts,tsx}": [
      "npm run test:unit -- --findRelatedTests"
    ]
  }
}
```

---

## 10. Test Execution Plan

### 10.1 Local Development

**Developer Workflow**:
1. Write BDD scenario (or use existing)
2. Run `npm run test:watch` (auto-run on file save)
3. Implement RED → GREEN → REFACTOR
4. Run `npm run test:all` before committing
5. Verify coverage with `npm run test:coverage`

### 10.2 PR Workflow

**Required Checks** (before merge):
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ Coverage ≥80%
- ✅ No accessibility violations
- ✅ Performance targets met

### 10.3 Release Workflow

**Before Release**:
1. Run full test suite (unit + integration + E2E + a11y + performance)
2. Generate coverage report
3. Run smoke tests in production-like environment
4. Manual QA sign-off
5. Tag release with version number

---

## 11. Quality Gates & Metrics

### 11.1 Quality Gate Thresholds

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| **Unit Test Coverage** | ≥85% | CI/CD blocks merge |
| **Integration Coverage** | ≥80% | CI/CD blocks merge |
| **E2E Coverage** | All critical flows | Manual review |
| **BDD Scenarios Passing** | 100% | CI/CD blocks merge |
| **Accessibility Violations** | 0 | CI/CD blocks merge |
| **Performance (60fps)** | ≥58fps avg | Manual review |
| **Message Latency** | <100ms p95 | Automated test |

### 11.2 Test Metrics Dashboard

**Track**:
- Test execution time trends
- Flaky test detection
- Coverage trends over time
- Performance regression alerts

---

## 12. Test Maintenance Strategy

### 12.1 Test Health

**Regular Review** (monthly):
- Identify flaky tests (>5% failure rate)
- Remove obsolete tests
- Update test data fixtures
- Refactor brittle tests

### 12.2 Test Documentation

**Required Documentation**:
- ✅ README in `/tests/` with setup instructions
- ✅ Comment complex test scenarios
- ✅ Document test data factories
- ✅ Maintain BDD scenario catalog

---

## 13. Quality Assurance Checklist (Phase 5)

**Before Phase 6-7 (Planning), validate**:

- ✅ All BDD scenarios written for MVP stories
- ✅ Unit test templates created
- ✅ Integration test strategy documented
- ✅ E2E test plan complete
- ✅ Performance test scripts ready
- ✅ Accessibility test suite configured
- ✅ CI/CD pipeline configured
- ✅ Test data fixtures created
- ✅ Coverage thresholds defined
- ✅ Quality gates approved by QA Lead

**Sign-Off Required By**: QA Lead, Dev-Lead, Product Owner

---

## 14. Next Phase: Planning (Phases 6-7)

**Handoff to Planning Phase**:
- Testing strategy (this document)
- BDD scenario catalog
- Test coverage requirements
- Performance targets
- Quality gates

**Planning Phase Will**:
- Define sprint schedules
- Allocate stories to sprints
- Estimate testing effort per story
- Create deployment plan with test validation stages

---

**Status**: ACTIVE | **Version**: 1.0.0 | **Last Updated**: 2026-04-22  
**Phase Gate**: ✅ READY FOR SIGN-OFF  
**Next Gate**: Phase 6-7 Planning (→ 04-planning.workflows.md)

**Related Documents**:
- Architecture Design: `02-architecture/architecture-design.md`
- Technical Specification: `02-architecture/tech-spec.md`
- BDD Scenarios: `03-testing/scenarios/`
- Test Implementation: `tests/` (to be created in Phase 8)
