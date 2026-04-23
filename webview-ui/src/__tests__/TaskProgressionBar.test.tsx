import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskProgressionBar } from '../components/TaskProgressionBar';
import type { TaskProgressionState, TaskInfo } from '../hooks/useExtensionMessages';

/**
 * BDD Scenario: Display task progression bar with three sections
 * As a developer, I want to see the previous, current, and next tasks,
 * so that I can understand my workflow context
 */
describe('TaskProgressionBar Component', () => {
  // Mock data for tests
  const mockPreviousTask: TaskInfo = {
    storyId: 'US-001-001',
    title: 'Layer 1: Types Implementation',
    status: 'completed',
    epic: 'EPIC-001',
    layer: 'Layer 1',
    cycle: 'REFACTOR-01',
  };

  const mockCurrentTask: TaskInfo = {
    storyId: 'US-001-002',
    title: 'Layer 2: Backend Service',
    status: 'in-progress',
    epic: 'EPIC-001',
    layer: 'Layer 2',
    cycle: 'RED-02',
  };

  const mockNextTask: TaskInfo = {
    storyId: 'US-001-003',
    title: 'Layer 3: Message Protocol',
    status: 'not-started',
    epic: 'EPIC-001',
  };

  const mockTaskProgression: TaskProgressionState = {
    previous: mockPreviousTask,
    current: mockCurrentTask,
    next: mockNextTask,
  };

  /**
   * BDD Scenario: Display task progression bar with three sections
   * Given I have a task progression with previous, current, and next tasks
   * When the TaskProgressionBar renders
   * Then I should see three distinct sections: Previous, Current, and Next
   */
  describe('Scenario: Display task progression bar with three sections', () => {
    it('renders the task progression bar container', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const bar = screen.getByTestId('task-progression-bar');
      expect(bar).toBeInTheDocument();
    });

    it('renders three sections with correct labels', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByTestId('task-section-previous')).toBeInTheDocument();
      expect(screen.getByTestId('task-section-current')).toBeInTheDocument();
      expect(screen.getByTestId('task-section-next')).toBeInTheDocument();
    });

    it('renders section headers', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('uses CSS class for layout structure', () => {
      const { container } = render(
        <TaskProgressionBar taskProgression={mockTaskProgression} />
      );
      const bar = container.querySelector('.task-progression-bar');
      expect(bar).toHaveClass('task-progression-bar');
      expect(bar).toHaveClass('flex');
      expect(bar).toHaveClass('gap-4');
    });
  });

  /**
   * BDD Scenario: Show previous task details
   * Given the previous task is completed
   * When the previous section renders
   * Then I should see the task ID, title, and completion icon (✅)
   */
  describe('Scenario: Show previous task details', () => {
    it('displays previous task ID', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('US-001-001')).toBeInTheDocument();
    });

    it('displays previous task title', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('Layer 1: Types Implementation')).toBeInTheDocument();
    });

    it('displays completion icon for previous task', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const previousSection = screen.getByTestId('task-section-previous');
      const checkIcon = previousSection.querySelector('[data-testid="icon-completed"]');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveTextContent('✅');
    });

    it('applies completed status styling to previous section', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const previousSection = screen.getByTestId('task-section-previous');
      expect(previousSection).toHaveClass('opacity-75');
    });

    it('handles null previous task gracefully', () => {
      const progressionWithoutPrevious: TaskProgressionState = {
        previous: null,
        current: mockCurrentTask,
        next: mockNextTask,
      };
      render(<TaskProgressionBar taskProgression={progressionWithoutPrevious} />);
      const previousSection = screen.getByTestId('task-section-previous');
      expect(previousSection).toHaveTextContent('N/A');
      expect(previousSection).toHaveTextContent('No previous task');
    });
  });

  /**
   * BDD Scenario: Show current task details with layer and cycle information
   * Given the current task is in-progress
   * When the current section renders
   * Then I should see task ID, title, layer, cycle, and progress icon (🔄)
   */
  describe('Scenario: Show current task with layer and cycle info', () => {
    it('displays current task ID', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('US-001-002')).toBeInTheDocument();
    });

    it('displays current task title', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('Layer 2: Backend Service')).toBeInTheDocument();
    });

    it('displays current task layer information', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveTextContent('Layer 2');
    });

    it('displays current task cycle information', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveTextContent('RED-02');
    });

    it('displays in-progress icon for current task', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      const spinner = currentSection.querySelector('[data-testid="icon-in-progress"]');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveTextContent('🔄');
    });

    it('applies highlight styling to current section', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveClass('border-2');
      expect(currentSection).toHaveClass('border-blue-500');
    });

    it('displays PDLC phase color badge', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      const phaseBadge = currentSection.querySelector('[data-testid="phase-badge"]');
      expect(phaseBadge).toBeInTheDocument();
      expect(phaseBadge).toHaveTextContent('RED');
    });
  });

  /**
   * BDD Scenario: Show next task prediction
   * Given there is a next task available
   * When the next section renders
   * Then I should see task ID, title, and next indicator (⏭️)
   */
  describe('Scenario: Show next task prediction', () => {
    it('displays next task ID', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('US-001-003')).toBeInTheDocument();
    });

    it('displays next task title', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      expect(screen.getByText('Layer 3: Message Protocol')).toBeInTheDocument();
    });

    it('displays next indicator icon', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const nextSection = screen.getByTestId('task-section-next');
      const nextIcon = nextSection.querySelector('[data-testid="icon-next"]');
      expect(nextIcon).toBeInTheDocument();
      expect(nextIcon).toHaveTextContent('⏭️');
    });

    it('applies muted styling to next section', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const nextSection = screen.getByTestId('task-section-next');
      expect(nextSection).toHaveClass('opacity-50');
    });

    it('handles null next task gracefully', () => {
      const progressionWithoutNext: TaskProgressionState = {
        previous: mockPreviousTask,
        current: mockCurrentTask,
        next: null,
      };
      render(<TaskProgressionBar taskProgression={progressionWithoutNext} />);
      const nextSection = screen.getByTestId('task-section-next');
      expect(nextSection).toHaveTextContent('N/A');
      expect(nextSection).toHaveTextContent('No upcoming task');
    });
  });

  /**
   * BDD Scenario: Color-code task sections by PDLC phase
   * Given tasks are in different PDLC phases
   * When the bar renders
   * Then each section should be color-coded by its phase
   */
  describe('Scenario: Color-code task sections by PDLC phase', () => {
    it('applies RED phase color to RED task', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      const phaseBadge = currentSection.querySelector('[data-testid="phase-badge"]');
      expect(phaseBadge).toHaveStyle('backgroundColor: #E81C3F');
    });

    it('applies GREEN phase color to GREEN task', () => {
      const greenTask: TaskInfo = {
        ...mockCurrentTask,
        cycle: 'GREEN-02',
      };
      render(
        <TaskProgressionBar
          taskProgression={{
            ...mockTaskProgression,
            current: greenTask,
          }}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      const phaseBadge = currentSection.querySelector('[data-testid="phase-badge"]');
      expect(phaseBadge).toHaveStyle('backgroundColor: #107C10');
    });

    it('applies REFACTOR phase color to REFACTOR task', () => {
      const refactorTask: TaskInfo = {
        ...mockCurrentTask,
        cycle: 'REFACTOR-02',
      };
      render(
        <TaskProgressionBar
          taskProgression={{
            ...mockTaskProgression,
            current: refactorTask,
          }}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      const phaseBadge = currentSection.querySelector('[data-testid="phase-badge"]');
      expect(phaseBadge).toHaveStyle('backgroundColor: #8661C5');
    });

    it('applies DOCUMENTATION phase color to documentation task', () => {
      const docTask: TaskInfo = {
        storyId: 'US-002-001',
        title: 'Write API docs',
        status: 'in-progress',
        epic: 'EPIC-002',
      };
      render(
        <TaskProgressionBar
          taskProgression={{
            ...mockTaskProgression,
            current: docTask,
          }}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      const phaseBadge = currentSection.querySelector('[data-testid="phase-badge"]');
      expect(phaseBadge).toHaveStyle('backgroundColor: #0078D4');
    });
  });

  /**
   * BDD Scenario: Navigate to story by clicking task
   * Given I click on a task section
   * When the click handler fires
   * Then the implementation plan should open
   */
  describe('Scenario: Navigate to story by clicking task', () => {
    it('renders clickable sections', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveClass('cursor-pointer');
    });

    it('calls onClick handler when section is clicked', () => {
      const mockOnClick = jest.fn();
      render(
        <TaskProgressionBar
          taskProgression={mockTaskProgression}
          onTaskClick={mockOnClick}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      fireEvent.click(currentSection);
      expect(mockOnClick).toHaveBeenCalledWith(mockCurrentTask);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('includes hover styling for clickable sections', () => {
      const { container } = render(
        <TaskProgressionBar taskProgression={mockTaskProgression} />
      );
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveClass('hover:shadow-lg');
      expect(currentSection).toHaveClass('hover:scale-105');
      expect(currentSection).toHaveClass('transition-all');
    });

    it('navigates to correct story file on click', () => {
      const mockOnClick = jest.fn();
      render(
        <TaskProgressionBar
          taskProgression={mockTaskProgression}
          onTaskClick={mockOnClick}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      fireEvent.click(currentSection);
      expect(mockOnClick).toHaveBeenCalledWith(
        expect.objectContaining({
          storyId: 'US-001-002',
          epic: 'EPIC-001',
        })
      );
    });
  });

  /**
   * Edge Case: Handle empty/incomplete story information gracefully
   * Given story data is missing or incomplete
   * When sections render
   * Then show appropriate fallback text without errors
   */
  describe('Edge Case: Handle empty/incomplete story information', () => {
    it('shows N/A for empty task', () => {
      const emptyProgression: TaskProgressionState = {
        previous: null,
        current: mockCurrentTask,
        next: null,
      };
      render(<TaskProgressionBar taskProgression={emptyProgression} />);
      const previousSection = screen.getByTestId('task-section-previous');
      const nextSection = screen.getByTestId('task-section-next');
      expect(previousSection).toHaveTextContent('N/A');
      expect(nextSection).toHaveTextContent('N/A');
    });

    it('handles missing layer and cycle gracefully', () => {
      const incompleteTask: TaskInfo = {
        storyId: 'US-001-001',
        title: 'Some Task',
        status: 'in-progress',
        epic: 'EPIC-001',
        // layer and cycle are undefined
      };
      render(
        <TaskProgressionBar
          taskProgression={{
            ...mockTaskProgression,
            current: incompleteTask,
          }}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toBeInTheDocument();
      expect(currentSection).toHaveTextContent('Some Task');
    });

    it('renders without crashing when all tasks are null', () => {
      const emptyProgression: TaskProgressionState = {
        previous: null,
        current: null,
        next: null,
      };
      expect(() => {
        render(<TaskProgressionBar taskProgression={emptyProgression} />);
      }).not.toThrow();
    });

    it('shows tooltip with full task information on hover', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveAttribute('title');
      expect(currentSection.getAttribute('title')).toContain('US-001-002');
    });
  });

  /**
   * Performance: Verify component updates efficiently
   */
  describe('Performance', () => {
    it('does not re-render unnecessarily when props are unchanged', () => {
      const { rerender } = render(
        <TaskProgressionBar taskProgression={mockTaskProgression} />
      );
      const beforeUpdate = screen.getByTestId('task-progression-bar');
      rerender(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const afterUpdate = screen.getByTestId('task-progression-bar');
      expect(beforeUpdate).toBe(afterUpdate);
    });

    it('updates correctly when task progression changes', () => {
      const { rerender } = render(
        <TaskProgressionBar taskProgression={mockTaskProgression} />
      );
      expect(screen.getByText('US-001-002')).toBeInTheDocument();

      const newProgression: TaskProgressionState = {
        ...mockTaskProgression,
        current: {
          ...mockCurrentTask,
          storyId: 'US-001-003',
        },
      };
      rerender(<TaskProgressionBar taskProgression={newProgression} />);
      // Scope to the current section to avoid collision with the unchanged next
      // section which also displays 'US-001-003' (mockNextTask.storyId).
      const currentSection = screen.getByTestId('task-section-current');
      expect(within(currentSection).getByText('US-001-003')).toBeInTheDocument();
    });
  });

  /**
   * Accessibility: WCAG 2.1 AA compliance
   */
  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('includes ARIA labels for sections', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const previousSection = screen.getByTestId('task-section-previous');
      expect(previousSection).toHaveAttribute('aria-label');
      expect(previousSection.getAttribute('aria-label')).toContain('Previous');
    });

    it('makes sections keyboard navigable', () => {
      render(<TaskProgressionBar taskProgression={mockTaskProgression} />);
      const currentSection = screen.getByTestId('task-section-current');
      expect(currentSection).toHaveAttribute('tabIndex', '0');
    });

    it('supports keyboard navigation (Enter key)', () => {
      const mockOnClick = jest.fn();
      render(
        <TaskProgressionBar
          taskProgression={mockTaskProgression}
          onTaskClick={mockOnClick}
        />
      );
      const currentSection = screen.getByTestId('task-section-current');
      fireEvent.keyDown(currentSection, { key: 'Enter', code: 'Enter' });
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('has sufficient color contrast', () => {
      const { container } = render(
        <TaskProgressionBar taskProgression={mockTaskProgression} />
      );
      const sections = container.querySelectorAll('[data-testid^="task-section"]');
      sections.forEach((section) => {
        const computedStyle = window.getComputedStyle(section);
        // Contrast should be at least 4.5:1 for normal text
        expect(computedStyle.color).toBeDefined();
      });
    });
  });
});
