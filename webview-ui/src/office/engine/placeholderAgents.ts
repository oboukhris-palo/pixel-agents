/**
 * Placeholder agent system for showing all available agents on layout
 * even when they're not actively running.
 */

export interface PlaceholderAgentDefinition {
  /** Agent role (matches agentMetadata.id) */
  role: string
  /** Display label */
  label: string
  /** Desk UID from layout (e.g., "orchestrator-desk") */
  deskUid: string
  /** Palette index for character coloring */
  palette: number
  /** Hue shift for palette variation */
  hueShift: number
}

/**
 * Core agent-to-desk mapping based on agent-team-layout.json and agentMetadata
 * These are the primary agents that should always be visible
 */
export const PLACEHOLDER_AGENTS: PlaceholderAgentDefinition[] = [
  {
    role: 'orchestrator',
    label: 'Orchestrator',
    deskUid: 'orchestrator-desk',
    palette: 0,
    hueShift: 0,
  },
  {
    role: 'ai-eng',
    label: 'AI Engineer',
    deskUid: 'ai-eng-desk',
    palette: 1,
    hueShift: 0,
  },
  {
    role: 'architect',
    label: 'Architect',
    deskUid: 'architect-desk',
    palette: 2,
    hueShift: 0,
  },
  {
    role: 'po',
    label: 'Product Owner',
    deskUid: 'po-desk',
    palette: 3,
    hueShift: 0,
  },
  {
    role: 'ba',
    label: 'Business Analyst',
    deskUid: 'ba-desk',
    palette: 4,
    hueShift: 0,
  },
  {
    role: 'pm',
    label: 'Project Manager',
    deskUid: 'pm-desk',
    palette: 5,
    hueShift: 0,
  },
  {
    role: 'dev-lead',
    label: 'Dev Lead',
    deskUid: 'dev-lead-desk',
    palette: 0,
    hueShift: 45,
  },
  {
    role: 'dev-tdd-red',
    label: 'TDD RED',
    deskUid: 'tdd-red-desk',
    palette: 1,
    hueShift: 45,
  },
]

/**
 * Get next available placeholder ID (use negative numbers to avoid collision)
 * Runtime agent IDs are positive (1, 2, 3...)
 * Placeholder IDs are negative (-1, -2, -3...)
 */
let nextPlaceholderId = -1
export function getNextPlaceholderId(): number {
  return nextPlaceholderId--
}

/**
 * Check if an agent ID is a placeholder
 */
export function isPlaceholderId(id: number): boolean {
  return id < 0
}

/**
 * Spawn placeholder agents for all available agents that aren't currently running.
 * This shows the full team on the layout with idle/placeholder characters.
 * 
 * @param officeState - The office state instance
 * @param _agentMetadata - Array of all available agents from .github/agents (reserved for future use)
 * @param _activeAgentIds - Array of currently active agent IDs (reserved for future use)
 */
export function spawnPlaceholderAgents(
  officeState: any,
  _agentMetadata: Array<{ id: string; name: string; description: string }>,
  _activeAgentIds: number[]
): void {
  // Delegate to built-in office state method
  officeState.spawnPlaceholderAgents()
}
