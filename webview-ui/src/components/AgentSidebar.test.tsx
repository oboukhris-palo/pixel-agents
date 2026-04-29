/**
 * Layer 4: AgentSidebar Component Tests (v1.0.5)
 *
 * RED Phase — these tests define the new 'disabled' behavior.
 * They will FAIL until GREEN phase implements the feature.
 *
 * New ACs:
 * - AC-S1: AgentInfo supports 'disabled' status
 * - AC-S2: Disabled agents render with ⛔ icon and greyed-out text
 * - AC-S3: Disabled agents are not clickable
 * - AC-S4: dev-tdd-red, dev-tdd-green, dev-tdd-refactor render as disabled
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgentSidebar } from './AgentSidebar';
import type { AgentInfo } from './AgentSidebar';

const ACTIVE_AGENT: AgentInfo = {
  name: 'orchestrator',
  status: 'active',
  isCurrent: false,
};

const IDLE_AGENT: AgentInfo = {
  name: 'architect',
  status: 'idle',
  isCurrent: false,
};

// AC-S1: AgentInfo should accept 'disabled' status
const DISABLED_AGENT: AgentInfo = {
  name: 'dev-tdd-red',
  status: 'disabled' as AgentInfo['status'],
  isCurrent: false,
};

describe('AgentSidebar Component (v1.0.5 enhancements)', () => {
  describe('AC-S1: Disabled status type', () => {
    it('accepts disabled status without TypeScript error', () => {
      const agent: AgentInfo = {
        name: 'dev-tdd-red',
        status: 'disabled' as AgentInfo['status'],
        isCurrent: false,
      };
      expect(agent.status).toBe('disabled');
    });
  });

  describe('AC-S2: Disabled agent visual rendering', () => {
    it('renders ⛔ icon for disabled agent', () => {
      render(<AgentSidebar agents={[DISABLED_AGENT]} />);
      expect(screen.getByTestId('agent-disabled-icon-dev-tdd-red')).toBeInTheDocument();
      expect(screen.getByTestId('agent-disabled-icon-dev-tdd-red')).toHaveTextContent('⛔');
    });

    it('applies disabled CSS class to disabled agent row', () => {
      render(<AgentSidebar agents={[DISABLED_AGENT]} />);
      const row = screen.getByTestId('agent-row-dev-tdd-red');
      expect(row.className).toMatch(/disabled/);
    });

    it('does not apply disabled class to active agent', () => {
      render(<AgentSidebar agents={[ACTIVE_AGENT]} />);
      const row = screen.getByTestId('agent-row-orchestrator');
      expect(row.className).not.toMatch(/disabled/);
    });
  });

  describe('AC-S3: Disabled agent not clickable', () => {
    it('does not call onAgentClick when disabled agent is clicked', () => {
      const onClickMock = jest.fn();
      render(<AgentSidebar agents={[DISABLED_AGENT]} onAgentClick={onClickMock} />);
      const row = screen.getByTestId('agent-row-dev-tdd-red');
      fireEvent.click(row);
      expect(onClickMock).not.toHaveBeenCalled();
    });

    it('calls onAgentClick for non-disabled agents', () => {
      const onClickMock = jest.fn();
      render(<AgentSidebar agents={[ACTIVE_AGENT]} onAgentClick={onClickMock} />);
      const row = screen.getByTestId('agent-row-orchestrator');
      fireEvent.click(row);
      expect(onClickMock).toHaveBeenCalledWith('orchestrator');
    });
  });

  describe('AC-S4: TDD agent identification', () => {
    it('renders multiple agents with correct disabled states', () => {
      const agents: AgentInfo[] = [
        ACTIVE_AGENT,
        IDLE_AGENT,
        { name: 'dev-tdd-red', status: 'disabled' as AgentInfo['status'], isCurrent: false },
        { name: 'dev-tdd-green', status: 'disabled' as AgentInfo['status'], isCurrent: false },
        { name: 'dev-tdd-refactor', status: 'disabled' as AgentInfo['status'], isCurrent: false },
      ];
      render(<AgentSidebar agents={agents} />);

      // Active/idle should NOT be disabled
      expect(screen.getByTestId('agent-row-orchestrator').className).not.toMatch(/disabled/);
      expect(screen.getByTestId('agent-row-architect').className).not.toMatch(/disabled/);

      // TDD sub-agents should be disabled
      expect(screen.getByTestId('agent-row-dev-tdd-red').className).toMatch(/disabled/);
      expect(screen.getByTestId('agent-row-dev-tdd-green').className).toMatch(/disabled/);
      expect(screen.getByTestId('agent-row-dev-tdd-refactor').className).toMatch(/disabled/);
    });

    it('shows ⛔ icon only for disabled agents', () => {
      const agents: AgentInfo[] = [
        ACTIVE_AGENT,
        { name: 'dev-tdd-red', status: 'disabled' as AgentInfo['status'], isCurrent: false },
      ];
      render(<AgentSidebar agents={agents} />);

      expect(screen.queryByTestId('agent-disabled-icon-orchestrator')).not.toBeInTheDocument();
      expect(screen.getByTestId('agent-disabled-icon-dev-tdd-red')).toBeInTheDocument();
    });
  });

  describe('Existing behavior preserved', () => {
    it('renders agent names', () => {
      render(<AgentSidebar agents={[ACTIVE_AGENT, IDLE_AGENT]} />);
      expect(screen.getByText('orchestrator')).toBeInTheDocument();
      expect(screen.getByText('architect')).toBeInTheDocument();
    });

    it('shows empty state when no agents', () => {
      render(<AgentSidebar agents={[]} />);
      expect(screen.getByText('No agents active')).toBeInTheDocument();
    });
  });
});

// ── Layer 4: TaskProgressionBar checkbox badge (RED phase) ───────────────────

import { TaskProgressionBar } from './TaskProgressionBar';
import type { TaskProgressionState } from '../hooks/useExtensionMessages';

// Mock useTaskProgression
jest.mock('../hooks/useTaskProgression', () => ({
  useTaskProgression: jest.fn(),
}));
import { useTaskProgression } from '../hooks/useTaskProgression';
const mockUseTaskProgression = useTaskProgression as jest.MockedFunction<typeof useTaskProgression>;

const makePlanCheckpoint = (total: number, completed: number) => ({
  planPath: '/ws/docs/05-implementation/epics/EPIC-001/user-stories/US-001/implementation-plan.md',
  currentCheckbox: {
    layerNumber: 2 as const,
    phase: 'GREEN' as const,
    cycleNumber: 2,
    description: 'Implement validation',
    completed: false,
    lineNumber: 42,
  },
  nextCheckbox: null,
  totalCheckboxes: total,
  completedCheckboxes: completed,
});

const makeTaskProgression = (planCheckpoint = makePlanCheckpoint(12, 4)) => ({
  taskProgression: {
    previous: { storyId: 'US-000', title: 'Setup', status: 'completed' as const, epic: 'EPIC-001' },
    current: { storyId: 'US-001', title: 'Activity Monitor', status: 'in-progress' as const, epic: 'EPIC-001', cycle: 'GREEN-02' },
    next: { storyId: 'US-002', title: 'Context Window', status: 'not-started' as const, epic: 'EPIC-001' },
    planCheckpoint,
  } as TaskProgressionState,
  currentTask: { storyId: 'US-001', title: 'Activity Monitor', status: 'in-progress' as const, epic: 'EPIC-001', cycle: 'GREEN-02' },
  previousTask: { storyId: 'US-000', title: 'Setup', status: 'completed' as const, epic: 'EPIC-001' },
  nextTask: { storyId: 'US-002', title: 'Context Window', status: 'not-started' as const, epic: 'EPIC-001' },
  currentPhase: 'GREEN' as const,
  planCheckpoint,
  isLoading: false,
  error: undefined,
});

describe('TaskProgressionBar Component — Checkbox Badge (v1.0.5)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskProgression.mockReturnValue(makeTaskProgression());
  });

  describe('AC-TPB1: Checkbox count badge', () => {
    it('renders checkpoint badge when planCheckpoint is present', () => {
      render(<TaskProgressionBar />);
      expect(screen.getByTestId('checkpoint-badge')).toBeInTheDocument();
    });

    it('displays completedCheckboxes/totalCheckboxes format (4/12)', () => {
      render(<TaskProgressionBar />);
      expect(screen.getByTestId('checkpoint-badge')).toHaveTextContent('4/12');
    });

    it('does not render badge when planCheckpoint is null', () => {
      mockUseTaskProgression.mockReturnValue({
        ...makeTaskProgression(),
        planCheckpoint: null,
        taskProgression: {
          previous: null,
          current: null,
          next: null,
          planCheckpoint: null,
        },
      });
      render(<TaskProgressionBar />);
      expect(screen.queryByTestId('checkpoint-badge')).not.toBeInTheDocument();
    });

    it('shows 0/0 when no checkboxes exist', () => {
      mockUseTaskProgression.mockReturnValue(makeTaskProgression(makePlanCheckpoint(0, 0)));
      render(<TaskProgressionBar />);
      expect(screen.getByTestId('checkpoint-badge')).toHaveTextContent('0/0');
    });

    it('shows 12/12 when all checkboxes complete', () => {
      mockUseTaskProgression.mockReturnValue(makeTaskProgression(makePlanCheckpoint(12, 12)));
      render(<TaskProgressionBar />);
      expect(screen.getByTestId('checkpoint-badge')).toHaveTextContent('12/12');
    });
  });

  describe('AC-TPB2: Current checkpoint description in title', () => {
    it('shows current checkbox description in current task section', () => {
      render(<TaskProgressionBar />);
      expect(screen.getByTestId('current-checkpoint-desc')).toHaveTextContent('Implement validation');
    });
  });
});
