# Implementation Plan: US-002-003 - Gamification Mechanics System

**Story**: US-002-003 - Gamification Mechanics System  
**Epic**: EPIC-002 - Context & Task Management  
**Total Estimated Effort**: 5 story points (~16-20 hours over 3 days)  
**TDD Cycles**: Estimated 8 cycles (2 per layer)  
**Plan Version**: v1  
**Created**: 2026-04-23  
**Status**: ⏳ Awaiting Approval

---

## Architecture Overview

**4-Layer Implementation** (Foundation → Communication → Presentation):
1. **Layer 1**: Achievement types, badge definitions, streak logic (domain model)
2. **Layer 2**: Achievement engine service (event subscriptions)
3. **Layer 3**: Message protocol and React hook (communication)
4. **Layer 4**: Achievement notification component + leaderboard (UI)

**Dependencies**:
- US-002-002 (Completeness Meter) ✅ Provides completion events
- Data source: `/docs/05-implementation/user-stories.md` (story completion tracking)

---

## Layer 1: Achievement Types & Badge Definitions (Domain Model)

**Purpose**: Define achievement types, badge metadata, streak logic, and PRU calculations

**Files to Create** (~100-150 lines total):
- `src/achievementTypes.ts` - Achievement type definitions, badge registry
- `src/achievementTypes.test.ts` - Type validation and logic tests

**BDD Coverage**:
- Scenario 1: Award achievement badge on milestone
- Scenario 2: Track consecutive task completion streak
- Scenario 3: Calculate PRU efficiency score

**Key Types & Functions**:
```typescript
interface Achievement {
  id: string;                    // 'tdd-master', 'project-victory', etc.
  name: string;                  // Display name
  description: string;           // Achievement criteria
  badge: BadgeDefinition;
  unlockedAt?: Date;
  category: 'milestone' | 'streak' | 'efficiency' | 'quality';
}

interface BadgeDefinition {
  icon: string;                  // Emoji or icon name
  color: 'bronze' | 'silver' | 'gold' | 'platinum';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface StreakData {
  current: number;               // Current consecutive completions
  longest: number;               // All-time best
  lastCompletionDate: Date;
}

interface PRUScore {
  totalPRUUsed: number;
  totalStoryPoints: number;
  efficiency: number;            // PRU per story point
  rank: 'novice' | 'intermediate' | 'expert' | 'master';
}

function calculateStreakStatus(lastDate: Date, currentDate: Date): 'active' | 'broken';
function calculatePRUEfficiency(pruUsed: number, storyPoints: number): number;
function checkAchievementUnlocked(metrics: ProjectMetrics, achievements: Achievement[]): Achievement | null;
```

**Predefined Achievements**:
```typescript
const ACHIEVEMENT_REGISTRY = [
  { id: 'first-story', name: 'First Steps', description: 'Complete your first story', badge: { icon: '🎯', color: 'bronze' } },
  { id: 'tdd-master', name: 'TDD Master', description: 'Complete 10 stories with TDD', badge: { icon: '🧪', color: 'gold' } },
  { id: 'milestone-25', name: 'Quarter Mark', description: 'Reach 25% project completion', badge: { icon: '🏅', color: 'bronze' } },
  { id: 'milestone-50', name: 'Halfway There', description: 'Reach 50% project completion', badge: { icon: '🏅', color: 'silver' } },
  { id: 'milestone-75', name: 'Almost Done', description: 'Reach 75% project completion', badge: { icon: '⭐', color: 'gold' } },
  { id: 'project-victory', name: 'Project Victory', description: 'Complete 100% of project', badge: { icon: '🏆', color: 'platinum' } },
  { id: 'streak-3', name: '3-Day Streak', description: 'Complete tasks 3 days in a row', badge: { icon: '🔥', color: 'bronze' } },
  { id: 'streak-7', name: 'Week Warrior', description: 'Complete tasks 7 days in a row', badge: { icon: '🔥', color: 'silver' } },
  { id: 'pru-efficiency', name: 'PRU Optimizer', description: 'Achieve <2000 PRU per story point', badge: { icon: '💎', color: 'gold' } },
];
```

**Testing Strategy**:
- ✅ RED: Test streak calculation (active vs. broken)
- ✅ RED: Test PRU efficiency calculation
- ✅ RED: Test achievement unlock logic (various criteria)
- ✅ RED: Test badge color and rarity assignments
- ✅ GREEN: Implement achievement logic
- ✅ REFACTOR: Extract achievement registry, add validation

**Acceptance Criteria Covered**:
- [x] AC1: Achievement system with badge definitions
- [x] AC2: Streak counter logic
- [x] AC3: PRU scoring calculation

**Estimated Time**: 3-4 hours (1-2 TDD cycles)

---

## Layer 2: Achievement Engine Service (Backend)

**Purpose**: Subscribe to project events and trigger achievement unlocks

**Files to Create** (~200-300 lines total):
- `src/achievementEngine.ts` - Service class with event subscriptions
- `src/achievementEngine.test.ts` - Service integration tests

**BDD Coverage**:
- Scenario 1: Award achievement on milestone
- Scenario 4: Display achievement notification
- Scenario 5: Persist achievement history across sessions

**Service Architecture**:
```typescript
class AchievementEngine {
  private unlockedAchievements: Achievement[] = [];
  private streakData: StreakData;
  private pruScore: PRUScore;
  
  constructor(
    private context: vscode.ExtensionContext,  // For persistence
    private outputChannel?: vscode.OutputChannel
  ) {
    this.loadState();
  }
  
  subscribeToEvents(completenessCallback: (metrics: ProjectMetrics) => void): void;
  private checkForNewAchievements(metrics: ProjectMetrics): Achievement[];
  private updateStreak(completed: boolean): StreakData;
  private updatePRUScore(pruUsed: number, storyPoints: number): PRUScore;
  
  getUnlockedAchievements(): Achievement[];
  getStreakData(): StreakData;
  getPRUScore(): PRUScore;
  
  private saveState(): void;
  private loadState(): void;
}
```

**Event Integration**:
```typescript
// Subscribe to completeness meter events
completenessCalculator.on('metrics-updated', (metrics) => {
  const newAchievements = achievementEngine.checkForNewAchievements(metrics);
  if (newAchievements.length > 0) {
    // Broadcast achievement unlocked event
    messageBus.send({ type: 'achievement.unlocked', data: newAchievements });
  }
});

// Subscribe to story completion events
storyCompletionTracker.on('story-completed', (story) => {
  achievementEngine.updateStreak(true);
  achievementEngine.updatePRUScore(story.pruUsed, story.storyPoints);
});
```

**Testing Strategy**:
- ✅ RED: Test event subscription triggers achievement checks
- ✅ RED: Test milestone achievements unlock correctly
- ✅ RED: Test streak updates on task completion
- ✅ RED: Test PRU score updates
- ✅ RED: Test achievement persistence (localStorage/ExtensionContext)
- ✅ RED: Test achievement deduplication (no repeat unlocks)
- ✅ GREEN: Implement achievement engine service
- ✅ REFACTOR: Extract event handlers, optimize state management

**Key Implementation Details**:
- **Persistence**: Use `vscode.ExtensionContext.globalState` for cross-session storage
- **Event Debouncing**: Prevent multiple achievement checks per second
- **Achievement Deduplication**: Track `unlockedAt` date to prevent re-unlocking
- **Error Handling**: Graceful degradation if state corrupted

**Acceptance Criteria Covered**:
- [x] AC1: Achievement system unlocks badges
- [x] AC2: Streak tracking across sessions
- [x] AC3: PRU scoring updates
- [x] AC4: Notification triggers
- [x] AC5: Persistent history (localStorage)

**Estimated Time**: 5-6 hours (2-3 TDD cycles)

---

## Layer 3: Message Protocol & React Hook (Communication)

**Purpose**: Bridge backend achievement engine to frontend components

**Files to Create** (~100-150 lines total):
- `src/achievementMessageHandler.ts` - Message protocol for achievement events
- `webview-ui/src/hooks/useAchievements.ts` - React hook for achievement state
- `src/achievementMessageHandler.test.ts` - Integration tests

**BDD Coverage**:
- Scenario 4: Display achievement notification
- Scenario 6: Show leaderboard (if team mode)

**Message Protocol**:
```typescript
interface AchievementUnlockedMessage {
  type: 'achievement.unlocked';
  data: {
    achievements: Achievement[];
    timestamp: string;
  };
}

interface AchievementStateMessage {
  type: 'achievement.state';
  data: {
    unlocked: Achievement[];
    streak: StreakData;
    pruScore: PRUScore;
  };
}

// React Hook
function useAchievements() {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  
  return { unlocked, newAchievement, streak };
}
```

**Testing Strategy**:
- ✅ RED: Test message handler receives unlock events
- ✅ RED: Test React hook subscribes to achievement updates
- ✅ RED: Test notification state management (show/dismiss)
- ✅ RED: Test leaderboard data fetching (if team mode)
- ✅ GREEN: Implement message handler and hook
- ✅ REFACTOR: Optimize re-renders, add cleanup logic

**Acceptance Criteria Covered**:
- [x] AC4: Notification system (message protocol)
- [x] AC6: Leaderboard (data structure)

**Estimated Time**: 2-3 hours (1 TDD cycle)

---

## Layer 4: Achievement Notification + Leaderboard Component (UI)

**Purpose**: Visual components displaying achievement notifications and leaderboard

**Files to Create** (~250-350 lines total):
- `webview-ui/src/components/AchievementNotification.tsx` - Toast notification
- `webview-ui/src/components/AchievementLeaderboard.tsx` - Leaderboard (optional)
- `webview-ui/src/components/AchievementNotification.test.tsx` - Component tests
- `webview-ui/src/components/AchievementNotification.module.css` - Styles

**BDD Coverage**:
- Scenario 1-3: Achievement unlock display
- Scenario 4: Notification with animation
- Scenario 6: Leaderboard display
- Scenario 7: Difficulty settings (affects thresholds)

**Component Architecture**:
```tsx
interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  // Visual: Toast notification (top-right corner)
  // Animation: Slide-in from right, fade-out after 5 seconds
  // Badge: Icon + color based on badge definition
  // Sound: Optional chime (user-configurable)
}

interface AchievementLeaderboardProps {
  achievements: Achievement[];
  streak: StreakData;
  pruScore: PRUScore;
  teamMode?: boolean;  // If enabled, shows team stats
}

export function AchievementLeaderboard({ achievements, streak, pruScore, teamMode }: AchievementLeaderboardProps) {
  // Display: List of unlocked achievements
  // Filters: By category, rarity
  // Team Mode: Compare with team members (deferred if not implemented)
}
```

**Testing Strategy** (80+ tests):
- ✅ RED: Test notification renders with achievement data
- ✅ RED: Test badge icon and color display
- ✅ RED: Test notification auto-dismisses after 5 seconds
- ✅ RED: Test manual dismiss via click
- ✅ RED: Test leaderboard displays unlocked achievements
- ✅ RED: Test streak display
- ✅ RED: Test PRU score display
- ✅ RED: Test accessibility (ARIA labels, keyboard nav)
- ✅ RED: Test edge cases (no achievements, null data)
- ✅ GREEN: Implement notification + leaderboard components
- ✅ REFACTOR: Extract sub-components, optimize animations

**Accessibility Requirements**:
- WCAG 2.1 AA compliant
- ARIA role="alert" for notifications
- Keyboard navigation for dismiss
- Screen reader announces achievement unlocks
- Reduced motion support (disable animations if user preference set)

**Acceptance Criteria Covered**:
- [x] AC1: Achievement badges display
- [x] AC2: Streak counter visible
- [x] AC3: PRU score displayed
- [x] AC4: Notification with celebration animation
- [x] AC6: Leaderboard (basic implementation)
- [x] AC7: Difficulty settings (affects thresholds in achievement engine)

**Estimated Time**: 6-7 hours (3 TDD cycles)

---

## TDD Cycle Summary

| Layer | RED Cycles | GREEN Cycles | REFACTOR Cycles | Total Hours |
|-------|-----------|-------------|-----------------|-------------|
| Layer 1 (Types) | 1 | 1 | 1 | 3-4h |
| Layer 2 (Backend) | 2 | 1 | 1 | 5-6h |
| Layer 3 (Protocol) | 1 | 1 | 1 | 2-3h |
| Layer 4 (UI) | 3 | 1 | 1 | 6-7h |
| **TOTAL** | **7** | **4** | **4** | **16-20h** |

**Expected Timeline**: 3 days (Day 1: L1-2, Day 2: L2-3, Day 3: L4 + code review)

---

## Quality Gates

### Per-Layer Validation
- ✅ All BDD scenarios covered by unit tests
- ✅ Test coverage ≥85% per layer
- ✅ No linting errors (ESLint, Prettier)
- ✅ TypeScript strict mode passing

### Story Completion
- ✅ All 7 acceptance criteria validated
- ✅ Code review approved (13-point checklist)
- ✅ Performance validated (notifications <100ms)
- ✅ Accessibility tested (WCAG 2.1 AA)
- ✅ No regressions (all existing tests passing)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Team mode not implemented | Defer leaderboard to Phase 3, keep single-player achievements |
| Achievement spam (too many notifications) | Rate limiting (max 1 notification per 5 seconds) |
| Notification animations block UI | CSS-only animations, non-blocking execution |
| PRU tracking inaccurate | Start with simple estimates, refine with user feedback |

---

## Implementation Notes for TDD Agents

### For dev-tdd-red
- Start with Layer 1 achievement definitions (clear, testable)
- Write failing tests for all streak and PRU logic
- Include edge cases (first task, streak broken, negative PRU)

### For dev-tdd-green
- Implement minimal achievement unlock logic
- Use simple event subscriptions first
- Defer advanced features (leaderboard, team mode) until later

### For dev-tdd-refactor
- Extract achievement registry into separate file
- Add input validation and error handling
- Optimize persistence (debouncing state saves)
- Add JSDoc comments for public APIs

---

**Approval Required**: dev-lead must review and approve before TDD execution begins  
**Plan Status**: ⏳ Awaiting Approval → See `plan-approval.yaml`
