/**
 * Placeholder agent system for showing all available agents on layout
 * even when they're not actively running.
 */

import { createCharacter } from './characters.js'
import type { CharacterState } from '../types.js'

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
 * Core agent-to-desk mapping — hardcoded definitions for all standard team agents.
 * Desk/chair UIDs must match the furniture UIDs in the office layout.
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
    role: 'tdd-orchestrator',
    label: 'TDD Orchestrator',
    deskUid: 'tdd-orchestrator-desk',
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
 * Map agent ID to desk UID based on role
 * Only first 8 agents get desks (limited by physical layout)
 */
function getAgentDeskMapping(agentId: string, index: number): string | null {
  // Predefined desk mapping for known agents
  const knownMappings: Record<string, string> = {
    'orchestrator': 'orchestrator-desk',
    'ai-eng': 'ai-eng-desk',
    'ai-engineering': 'ai-eng-desk',
    'architect': 'architect-desk',
    'po': 'po-desk',
    'product-owner': 'po-desk',
    'ba': 'ba-desk',
    'pm': 'pm-desk',
    'project-manager': 'pm-desk',
    'ux': 'ux-desk',
    'dev-lead': 'dev-lead-desk',
    'dev-tdd': 'tdd-orchestrator-desk',
    'tdd-orchestrator': 'tdd-orchestrator-desk',
    'tdd': 'tdd-orch-desk',
    'qa': 'meeting-desk',
  }

  if (knownMappings[agentId]) {
    return knownMappings[agentId]
  }

  // For unknown agents, assign to first 8 desks in order
  const desks = ['orchestrator-desk', 'ai-eng-desk', 'architect-desk', 'po-desk', 'ba-desk', 'pm-desk', 'dev-lead-desk', 'tdd-orchestrator-desk']
  if (index < desks.length) {
    return desks[index]
  }

  return null // No desk available
}

/**
 * Spawn placeholder agents for all available agents that aren't currently running.
 * This shows the full team on the layout with idle/placeholder characters.
 * 
 * @param officeState - The office state instance
 * @param agentMetadata - Array of all available agents from .github/agents
 * @param _activeAgentIds - Array of currently active agent IDs (reserved for future use)
 */
export function spawnPlaceholderAgents(
  officeState: any,
  agentMetadata: Array<{ id: string; name: string; description: string }>,
  _activeAgentIds: number[]
): void {
  console.log('[PlaceholderAgents] ========== SPAWN START ==========')
  console.log('[PlaceholderAgents] Metadata count:', agentMetadata.length)
  console.log('[PlaceholderAgents] Metadata:', agentMetadata.map(m => m.id).join(', '))
  console.log('[PlaceholderAgents] Available seats:', Array.from(officeState.seats.keys()).join(', '))
  console.log('[PlaceholderAgents] Existing characters:', officeState.characters.size)
  
  // Filter out dev-tdd-red, dev-tdd-green, dev-tdd-refactor (hide TDD team, keep only orchestrator)
  const hiddenAgents = ['dev-tdd-red', 'dev-tdd-green', 'dev-tdd-refactor']
  const filteredMetadata = agentMetadata.filter(m => !hiddenAgents.includes(m.id))
  console.log('[PlaceholderAgents] After filtering TDD team:', filteredMetadata.map(m => m.id).join(', '))
  
  // If we have real agent metadata, use it; otherwise fallback to PLACEHOLDER_AGENTS
  if (filteredMetadata.length > 0) {
    // Spawn real agents from metadata
    let spawnedCount = 0
    let failedCount = 0
    
    for (let i = 0; i < filteredMetadata.length; i++) {
      const meta = filteredMetadata[i]
      console.log(`[PlaceholderAgents] Processing agent ${i + 1}/${filteredMetadata.length}: ${meta.id}`)
      
      const deskUid = getAgentDeskMapping(meta.id, i)
      
      if (!deskUid) {
        console.error('[PlaceholderAgents] [X] No desk mapping for agent:', meta.id)
        failedCount++
        continue
      }
      console.log(`[PlaceholderAgents] Desk mapping: ${meta.id} -> ${deskUid}`)

      // Try named chair first
      const chairUid = deskUid.replace('-desk', '-chair')
      let seat = officeState.seats.get(chairUid)
      let seatId = chairUid
      
      // Fix #2: Fallback to any available seat if named seat not found
      if (!seat || seat.assigned) {
        console.warn('[PlaceholderAgents] [!] Named seat unavailable, finding free seat:', chairUid)
        // Find any free seat
        for (const [uid, s] of officeState.seats.entries()) {
          if (!s.assigned) {
            seatId = uid
            seat = s
            break
          }
        }
      }
      
      if (!seat) {
        console.error('[PlaceholderAgents] [X] No seat available for agent:', meta.id)
        failedCount++
        continue
      }
      
      if (seat.assigned) {
        console.warn('[PlaceholderAgents] [!] Seat already assigned:', seatId)
        failedCount++
        continue
      }

      const placeholderId = getNextPlaceholderId()
      seat.assigned = true
      
      const ch = createCharacter(placeholderId, i % 6, seatId, seat, (i > 5 ? 45 : 0))
      
      ch.isPlaceholder = true
      ch.agentRole = meta.id
      ch.isActive = false
      ch.state = 'idle' as CharacterState
      ch.frame = 0
      
      officeState.characters.set(placeholderId, ch)
      spawnedCount++
      console.log(`[PlaceholderAgents] [OK] Spawned ${meta.name} (${meta.id}) at ${seatId}, character ID: ${placeholderId}`)
    }
    
    console.log('[PlaceholderAgents] ========== SPAWN COMPLETE ==========')
    console.log('[PlaceholderAgents] Success:', spawnedCount, 'Failed:', failedCount)
    console.log('[PlaceholderAgents] Total characters now:', officeState.characters.size)
  } else {
    // Fallback to hardcoded PLACEHOLDER_AGENTS
    console.warn('[PlaceholderAgents] No metadata provided, using fallback PLACEHOLDER_AGENTS')
    officeState.spawnPlaceholderAgents()
  }
}
