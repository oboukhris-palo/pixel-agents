/**
 * Layer 3: Agent Activity Hook (US-001-002)
 * 
 * Purpose: Subscribe to ActionBubbleMessage updates and expose AgentActivityState
 * BDD Mapping:
 *   - AC4: Message arrives in <500ms, hook updates state immediately
 *   - AC5: Integration point with useExtensionMessages
 */

import { useExtensionMessages, type AgentActivityState, type FileOperation } from './useExtensionMessages.js';

export type { AgentActivityState, FileOperation };

export interface UseAgentActivityResult {
  activity: AgentActivityState | null;
  fileOperations: FileOperation[];
}

/**
 * Custom hook that provides real-time agent activity state.
 * Returns the latest AgentActivityState from the backend monitor,
 * or null if no update has been received yet.
 * Also exposes recent file operations tracked by the backend.
 */
export function useAgentActivity(): UseAgentActivityResult {
  const messages = useExtensionMessages();
  const activity = messages.agentActivityState ?? null;
  return {
    activity,
    fileOperations: activity?.fileOperations ?? [],
  };
}
