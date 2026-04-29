import { memo } from 'react';
import styles from './AgentSidebar.module.css';

export interface AgentInfo {
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'waiting' | 'error' | 'disabled';
  isCurrent: boolean;
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

export const AgentSidebar = memo(({ agents, onAgentClick }: AgentSidebarProps) => {
  if (agents.length === 0) {
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
        {agents.map((agent) => {
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
    </div>
  );
});

AgentSidebar.displayName = 'AgentSidebar';
