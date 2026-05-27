import { memo, useState } from 'react';
import styles from './AgentSidebar.module.css';

export interface AgentInfo {
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'waiting' | 'error' | 'disabled';
  isCurrent: boolean;
  category?: string; // For grouping in accordion
}

interface AgentSidebarProps {
  agents: AgentInfo[];
  onAgentClick?: (agentName: string) => void;
}

const STATUS_COLORS: Record<AgentInfo['status'], string> = {
  active: '#2ecc71', // Green (working) - exact from Penpot
  idle: '#6b7280', // Gray (idle) - exact from Penpot
  waiting: '#f39c12', // Orange (waiting for input) - exact from Penpot
  error: '#f39c12', // Orange (error) - exact from Penpot
  disabled: '#4b4b4b', // Dark gray (disabled/not selectable)
} as const;

// TDD sub-agents to filter out (show only tdd-orchestrator)
const HIDDEN_TDD_AGENTS = ['dev-tdd-red', 'dev-tdd-green', 'dev-tdd-refactor'];

// Agent categories for accordion grouping
const AGENT_CATEGORIES: Record<string, string[]> = {
  'Orchestration': ['orchestrator', 'project-manager'],
  'Requirements': ['product-owner', 'ba'],
  'Design & Architecture': ['ux', 'architect', 'ai-engineering'],
  'Development': ['dev-lead', 'tdd-orchestrator', 'dev-tdd'],
  'Quality': ['qa'],
  'Support': ['meeting-assistant'],
};

function categorizeAgent(agentName: string): string {
  for (const [category, agents] of Object.entries(AGENT_CATEGORIES)) {
    if (agents.some(a => agentName.includes(a))) {
      return category;
    }
  }
  return 'Other';
}

export const AgentSidebar = memo(({ agents, onAgentClick }: AgentSidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(AGENT_CATEGORIES)) // All expanded by default
  );

  // Filter out TDD sub-agents and categorize
  const filteredAgents = agents
    .filter(agent => !HIDDEN_TDD_AGENTS.includes(agent.name))
    .map(agent => ({
      ...agent,
      category: agent.category || categorizeAgent(agent.name),
    }));

  // Group agents by category
  const groupedAgents = filteredAgents.reduce((acc, agent) => {
    const category = agent.category!;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(agent);
    return acc;
  }, {} as Record<string, AgentInfo[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (filteredAgents.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>AGENTS</div>
        <div className={styles.emptyState}>No agents active</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>AGENTS</div>
      <div className={styles.agentList}>
        {Object.entries(groupedAgents).map(([category, categoryAgents]) => {
          const isExpanded = expandedCategories.has(category);
          const hasActive = categoryAgents.some(a => a.status === 'active');
          
          return (
            <div key={category} className={styles.category}>
              <button
                className={styles.categoryHeader}
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                data-testid={`category-${category}`}
              >
                <span className={styles.categoryIcon}>
                  {isExpanded ? '▼' : '▶'}
                </span>
                <span className={styles.categoryName}>{category}</span>
                {hasActive && (
                  <div
                    className={styles.categoryIndicator}
                    style={{ backgroundColor: STATUS_COLORS.active }}
                    title="Active agent in this category"
                  />
                )}
              </button>
              
              {isExpanded && (
                <div className={styles.categoryAgents}>
                  {categoryAgents.map((agent) => {
                    const isDisabled = agent.status === 'disabled';
                    return (
                      <div
                        key={agent.name}
                        data-testid={`agent-row-${agent.name}`}
                        className={`${styles.agentRow} ${agent.isCurrent ? styles.agentRowCurrent : ''} ${isDisabled ? styles.agentRowDisabled : ''}`}
                        onClick={isDisabled ? undefined : () => onAgentClick?.(agent.name)}
                        role={isDisabled ? undefined : 'button'}
                        tabIndex={isDisabled ? -1 : 0}
                        title={agent.description ? `${agent.name}\n${agent.description}` : agent.name}
                        aria-label={`Agent ${agent.name}, status: ${agent.status}${agent.isCurrent ? ', currently active' : ''}`}
                        aria-disabled={isDisabled || undefined}
                      >
                        {isDisabled ? (
                          <span
                            data-testid={`agent-disabled-icon-${agent.name}`}
                            className={styles.disabledIcon}
                            aria-hidden="true"
                          >⛔</span>
                        ) : (
                          <div
                            className={styles.statusDot}
                            style={{ backgroundColor: STATUS_COLORS[agent.status] }}
                            aria-hidden="true"
                          />
                        )}
                        <span className={styles.agentName}>{agent.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

AgentSidebar.displayName = 'AgentSidebar';
