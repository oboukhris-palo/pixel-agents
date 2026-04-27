/**
 * Layer 4: ActionBubble Component (US-001-002)
 * 
 * Purpose: Display active agent code snippets with syntax highlighting, status,
 *          and copy-to-clipboard functionality.
 * BDD Mapping: All AC1–AC10 scenarios
 */

import { memo, useState, useCallback } from 'react';
import { useAgentActivity } from '../hooks/useAgentActivity.js';
import type { AgentActivityState, AgentActivityStatus, TDDPhase } from '../hooks/useExtensionMessages.js';
// Styles applied via Tailwind CSS and inline styles

// ── Status icon lookup (OCP: add new status without changing logic) ──────────
const STATUS_ICONS: Record<AgentActivityStatus, string> = {
  'in-progress': '🔄',
  'success': '✅',
  'failed': '❌',
  'idle': '⏸️',
};

const STATUS_LABELS: Record<AgentActivityStatus, string> = {
  'in-progress': 'In progress',
  'success': 'Completed successfully',
  'failed': 'Failed',
  'idle': 'Idle',
};

// ── Phase color lookup (design-systems.md v2.0.0 - Palo IT branding) ─────────
const PHASE_COLORS: Record<TDDPhase, string> = {
  RED: '#FF5500',          // TDD RED Phase - Test Writing
  GREEN: '#10B981',        // TDD GREEN Phase - Implementation
  REFACTOR: '#8B5CF6',     // TDD REFACTOR Phase - Code Cleanup
  DOCUMENTATION: '#06B6D4', // Documentation Phase
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface AgentHeaderProps {
  activity: AgentActivityState;
}

function AgentHeader({ activity }: AgentHeaderProps) {
  const { activeAgent, status } = activity;
  if (!activeAgent) return null;

  const icon = activeAgent.icon ?? '🤖';
  const statusIcon = STATUS_ICONS[status] ?? '⏸️';
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <div className="flex items-center gap-2">
      <span data-testid="agent-icon" aria-hidden="true" className="text-lg">
        {icon}
      </span>
      <span data-testid="agent-name" className="font-mono text-sm font-semibold flex-1">
        {activeAgent.id}
      </span>
      <span
        data-testid="status-indicator"
        aria-label={statusLabel}
        className="text-base"
      >
        {statusIcon}
      </span>
    </div>
  );
}

interface ActionMetadataProps {
  activity: AgentActivityState;
}

function ActionMetadata({ activity }: ActionMetadataProps) {
  const { currentAction, timestamp } = activity;
  const cycleStr = String(currentAction.cycle).padStart(2, '0');
  const label = `[${currentAction.type}-${cycleStr}]`;
  const phaseColor = PHASE_COLORS[currentAction.type] ?? '#CCCCCC';

  // Extract HH:MM:SSZ from ISO8601 timestamp
  const timeStr = timestamp.slice(11); // 'HH:MM:SSZ'

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      <span data-testid="action-label" className="font-bold font-mono" style={{ color: phaseColor }}>
        {label}
      </span>
      {currentAction.description ? (
        <span data-testid="action-description" className="text-gray-400 truncate flex-1">
          {currentAction.description}
        </span>
      ) : null}
      <span data-testid="action-timestamp" className="text-gray-500 font-mono">
        @ {timeStr}
      </span>
    </div>
  );
}

interface CodeSnippetDisplayProps {
  content: string;
  language: string;
  onCopy: () => void;
  copyState: 'idle' | 'success' | 'error';
}

function CodeSnippetDisplay({ content, language, onCopy, copyState }: CodeSnippetDisplayProps) {
  const toastText = copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Failed to copy' : null;

  return (
    <div data-testid="code-snippet-display" className="relative rounded bg-black bg-opacity-40 overflow-hidden fade-in">
      <div className="flex justify-between items-center px-2 py-1 bg-white bg-opacity-5">
        <span data-testid="code-language" className="text-xs uppercase tracking-wider text-gray-500">
          {language}
        </span>
        <button
          data-testid="copy-button"
          aria-label="Copy code to clipboard"
          onClick={onCopy}
          className="text-sm opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer px-1 rounded"
        >
          📋
        </button>
      </div>
      <code
        data-testid="code-content"
        className="block px-2 py-2 font-mono text-xs text-gray-300 whitespace-pre overflow-x-auto leading-relaxed"
      >
        {content}
      </code>
      {toastText && (
        <div
          data-testid="copy-toast"
          role="status"
          aria-live="polite"
          className="absolute bottom-1.5 right-2 text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded pointer-events-none"
        >
          {toastText}
        </div>
      )}
    </div>
  );
}

// ── Main ActionBubble ─────────────────────────────────────────────────────────

/**
 * ActionBubble
 * 
 * Displays active agent's real-time code snippets with status, action metadata,
 * syntax highlighting, and copy-to-clipboard. Returns null when no agent is active.
 * Wrapped in React.memo to prevent unnecessary re-renders from sibling updates.
 */
export const ActionBubble = memo(function ActionBubble() {
  const activity = useAgentActivity();
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = useCallback(async () => {
    if (!activity?.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(activity.codeSnippet.content);
      setCopyState('success');
    } catch {
      setCopyState('error');
    }
    // Auto-dismiss toast after 2.5 seconds
    setTimeout(() => setCopyState('idle'), 2500);
  }, [activity?.codeSnippet]);

  // AC10: unmount when no active agent
  if (!activity || !activity.activeAgent) return null;

  return (
    <section
      data-testid="action-bubble"
      className="flex flex-col gap-2 p-3 bg-vscode-editor-background border border-vscode-panel-border rounded-md min-w-[280px] max-w-[480px]"
      aria-label="Agent activity monitor"
      role="region"
    >
      <AgentHeader activity={activity} />
      <ActionMetadata activity={activity} />

      {activity.codeSnippet ? (
        <CodeSnippetDisplay
          content={activity.codeSnippet.content}
          language={activity.codeSnippet.language}
          onCopy={handleCopy}
          copyState={copyState}
        />
      ) : (
        <div data-testid="code-placeholder" className="py-3 text-center text-sm italic text-gray-500">
          Waiting for code...
        </div>
      )}
    </section>
  );
});
