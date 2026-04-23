/**
 * Layer 3: Agent Activity Hook (US-001-002)
 * 
 * Purpose: Subscribe to ActionBubbleMessage updates and expose AgentActivityState
 * BDD Mapping:
 *   - AC4: Message arrives in <500ms, hook updates state immediately
 *   - AC5: Integration point with useExtensionMessages
 */

import { useExtensionMessages, type AgentActivityState } from './useExtensionMessages.js';

export type { AgentActivityState };

/**
 * Custom hook that provides real-time agent activity state.
 * Returns the latest AgentActivityState from the backend monitor,
 * or null if no update has been received yet.
 */
export function useAgentActivity(): AgentActivityState | null {
  const messages = useExtensionMessages();
  return messages.agentActivityState ?? null;
}
