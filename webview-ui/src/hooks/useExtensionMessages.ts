import { useState, useEffect, useRef } from 'react'
import type { OfficeState } from '../office/engine/officeState.js'
import type { OfficeLayout, ToolActivity } from '../office/types.js'
import { extractToolName } from '../office/toolUtils.js'
import { migrateLayoutColors } from '../office/layout/layoutSerializer.js'
import { buildDynamicCatalog } from '../office/layout/furnitureCatalog.js'
import { setFloorSprites } from '../office/floorTiles.js'
import { setWallSprites } from '../office/wallTiles.js'
import { setCharacterTemplates } from '../office/sprites/spriteData.js'
import { vscode } from '../vscodeApi.js'
import { playDoneSound, setSoundEnabled } from '../notificationSound.js'

export interface SubagentCharacter {
  id: number
  parentAgentId: number
  parentToolId: string
  label: string
}

export interface FurnitureAsset {
  id: string
  name: string
  label: string
  category: string
  file: string
  width: number
  height: number
  footprintW: number
  footprintH: number
  isDesk: boolean
  canPlaceOnWalls: boolean
  partOfGroup?: boolean
  groupId?: string
  canPlaceOnSurfaces?: boolean
  backgroundTiles?: number
}

export interface WorkspaceFolder {
  name: string
  path: string
}

export interface AgentMetadata {
  id: string
  name: string
  description: string
  argumentHint?: string
}

export interface WorkflowState {
  workflow: 'PDLC' | 'Implementation' | 'CI/CD' | 'None'
  pdlcStage?: number
  pdlcTotal?: number
  pdlcProgress?: number
  prdDocuments?: {
    'requirements': boolean
    'personas': boolean
    'architecture-design': boolean
    'user-stories': boolean
    'tech-spec': boolean
    'test-strategies': boolean
    'deployment-plan': boolean
    'release-notes': boolean
  }
  maturityScore?: number
  missingDocuments?: string[]
  readyForImplementation?: boolean
  implementationPhase?: 'Planning' | 'TDD-RED' | 'TDD-GREEN' | 'TDD-REFACTOR' | 'Validation'
  activeUserStory?: string
  activeTddLayer?: string
  activeDocuments?: string[]
  projectCompletion?: number
  totalStories?: number
  completedStories?: number
  currentSprint?: string
  epicProgress?: Array<{ name: string; completion: number }>
  lastUpdate?: number
}

/**
 * LAYER 3: Task Progression Bar - Frontend Types
 * Mirror of backend types from src/types.ts for task progression feature
 */

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'implemented' | 'delivered'

export interface TaskInfo {
  storyId: string
  title: string
  status: TaskStatus
  epic: string
  layer?: string
  cycle?: string
}

/** Plan checkpoint data: implementation-plan.md checkbox state for the current story */
export interface PlanCheckpoint {
  planPath: string
  currentCheckbox: {
    layerNumber: 1 | 2 | 3 | 4
    phase: 'RED' | 'GREEN' | 'REFACTOR'
    cycleNumber: number
    description: string
    completed: boolean
    lineNumber: number
  } | null
  nextCheckbox: {
    layerNumber: 1 | 2 | 3 | 4
    phase: 'RED' | 'GREEN' | 'REFACTOR'
    cycleNumber: number
    description: string
    completed: boolean
    lineNumber: number
  } | null
  totalCheckboxes: number
  completedCheckboxes: number
}

export interface TaskProgressionState {
  previous: TaskInfo | null
  current: TaskInfo | null
  next: TaskInfo | null
  /** Enhanced: implementation-plan.md checkpoint data for the current story */
  planCheckpoint?: PlanCheckpoint | null
}

export interface TaskProgressionMessage {
  type: 'taskProgression'
  previous: TaskInfo | null
  current: TaskInfo | null
  next: TaskInfo | null
}

// ── Agent Activity Types (US-001-002) ─────────────────────────────────────────

export type CodeLanguage = 'typescript' | 'javascript' | 'css' | 'html'
export type TDDPhase = 'RED' | 'GREEN' | 'REFACTOR' | 'DOCUMENTATION'
export type AgentActivityStatus = 'in-progress' | 'success' | 'failed' | 'idle'

export interface CodeSnippetInfo {
  language: CodeLanguage
  content: string
  lineNumbers?: number[]
}

export interface AgentActivityMetadata {
  id: string
  name: string
  description: string
  spriteColor?: string
  icon?: string
}

export interface AgentAction {
  type: TDDPhase
  cycle: number
  description: string
}

/** A single tracked file system operation (inferred from VS Code editor events) */
export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'rename'
  filePath: string
  timestamp: number
}

export interface AgentActivityState {
  activeAgent: AgentActivityMetadata | null
  currentAction: AgentAction
  codeSnippet: CodeSnippetInfo | null
  status: AgentActivityStatus
  timestamp: string
  /** Enhanced: recent file operations for display in the action bubble */
  fileOperations?: FileOperation[]
}

export interface ActionBubbleMessage {
  type: 'agent-activity-update'
  payload: AgentActivityState
}

// ── Document Watcher Types (US-001-003) ───────────────────────────────────────

/** Mirrors DocumentChange from backend documentChangeTypes.ts */
export interface DocumentChange {
  path: string
  changeType: 'added' | 'modified' | 'deleted' | 'all'
  timestamp: number
  isMarkdown: boolean
  isYaml: boolean
  isFeature: boolean
}

/** Mirrors ParsedMetrics from backend documentChangeTypes.ts */
export interface ParsedMetrics {
  storyCount: number
  epicsCount: number
  completionPercent: number
  lastUpdated: string
}

/** Message received when /docs/ files change */
export interface DocumentWatcherMessage {
  type: 'document-changed'
  changes: DocumentChange[]
  metrics: ParsedMetrics
  timestamp: number
  debounceDelayMs: number
}

/** Watcher state exposed by useExtensionMessages */
export interface DocumentWatcherState {
  changes: DocumentChange[]
  metrics: ParsedMetrics
  lastUpdateTime: number
  isWatching: boolean
  error?: string
}

export interface ExtensionMessageState {
  agents: number[]
  selectedAgent: number | null
  agentTools: Record<number, ToolActivity[]>
  agentStatuses: Record<number, string>
  subagentTools: Record<number, Record<string, ToolActivity[]>>
  subagentCharacters: SubagentCharacter[]
  layoutReady: boolean
  loadedAssets?: { catalog: FurnitureAsset[]; sprites: Record<string, string[][]> }
  workspaceFolders: WorkspaceFolder[]
  agentMetadata: AgentMetadata[]
  githubFileAccess: Record<number, { filePath: string; timestamp: number } | null>
  workflowState: WorkflowState | null
  taskProgression: TaskProgressionState | null
  agentActivityState: AgentActivityState | null
  documentWatcherState: DocumentWatcherState | null
}

function saveAgentSeats(os: OfficeState): void {
  const seats: Record<number, { palette: number; hueShift: number; seatId: string | null }> = {}
  for (const ch of os.characters.values()) {
    if (ch.isSubagent) continue
    seats[ch.id] = { palette: ch.palette, hueShift: ch.hueShift, seatId: ch.seatId }
  }
  vscode.postMessage({ type: 'saveAgentSeats', seats })
}

export function useExtensionMessages(
  getOfficeState?: () => OfficeState,
  onLayoutLoaded?: (layout: OfficeLayout) => void,
  isEditDirty?: () => boolean,
): ExtensionMessageState {
  const [agents, setAgents] = useState<number[]>([])
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [agentTools, setAgentTools] = useState<Record<number, ToolActivity[]>>({})
  const [agentStatuses, setAgentStatuses] = useState<Record<number, string>>({})
  const [subagentTools, setSubagentTools] = useState<Record<number, Record<string, ToolActivity[]>>>({})
  const [subagentCharacters, setSubagentCharacters] = useState<SubagentCharacter[]>([])
  const [layoutReady, setLayoutReady] = useState(false)
  const [loadedAssets, setLoadedAssets] = useState<{ catalog: FurnitureAsset[]; sprites: Record<string, string[][]> } | undefined>()
  const [workspaceFolders, setWorkspaceFolders] = useState<WorkspaceFolder[]>([])
  const [agentMetadata, setAgentMetadata] = useState<AgentMetadata[]>([])
  const [githubFileAccess, setGithubFileAccess] = useState<Record<number, { filePath: string; timestamp: number } | null>>({})
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)
  const [taskProgression, setTaskProgression] = useState<TaskProgressionState | null>(null)
  const [agentActivityState, setAgentActivityState] = useState<AgentActivityState | null>(null)
  const [documentWatcherState, setDocumentWatcherState] = useState<DocumentWatcherState | null>(null)

  // Track whether initial layout has been loaded (ref to avoid re-render)
  const layoutReadyRef = useRef(false)

  useEffect(() => {
    // Buffer agents from existingAgents until layout is loaded
    let pendingAgents: Array<{ id: number; palette?: number; hueShift?: number; seatId?: string; folderName?: string }> = []

    const handler = (e: MessageEvent) => {
      const msg = e.data
      const os = getOfficeState?.()

      if (msg.type === 'layoutLoaded') {
        // Skip external layout updates while editor has unsaved changes
        if (layoutReadyRef.current && isEditDirty?.()) {
          console.log('[Webview] Skipping external layout update — editor has unsaved changes')
          return
        }
        if (!os) return // Office state required for layout messages
        const rawLayout = msg.layout as OfficeLayout | null
        const layout = rawLayout && rawLayout.version === 1 ? migrateLayoutColors(rawLayout) : null
        if (layout) {
          os.rebuildFromLayout(layout)
          onLayoutLoaded?.(layout)
        } else {
          // Default layout — snapshot whatever OfficeState built
          onLayoutLoaded?.(os.getLayout())
        }
        // Add buffered agents now that layout (and seats) are correct
        for (const p of pendingAgents) {
          os.addAgent(p.id, p.palette, p.hueShift, p.seatId, true, p.folderName)
        }
        pendingAgents = []
        layoutReadyRef.current = true
        setLayoutReady(true)
        if (os.characters.size > 0) {
          saveAgentSeats(os)
        }
      } else if (msg.type === 'agentCreated') {
        const id = msg.id as number
        const folderName = msg.folderName as string | undefined
        setAgents((prev) => (prev.includes(id) ? prev : [...prev, id]))
        setSelectedAgent(id)
        if (os) {
          os.addAgent(id, undefined, undefined, undefined, undefined, folderName)
          saveAgentSeats(os)
        }
      } else if (msg.type === 'agentClosed') {
        const id = msg.id as number
        setAgents((prev) => prev.filter((a) => a !== id))
        setSelectedAgent((prev) => (prev === id ? null : prev))
        setAgentTools((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
        setAgentStatuses((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
        setSubagentTools((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
        // Remove all sub-agent characters belonging to this agent
        if (os) {
          os.removeAllSubagents(id)
          os.removeAgent(id)
        }
        setSubagentCharacters((prev) => prev.filter((s) => s.parentAgentId !== id))
      } else if (msg.type === 'existingAgents') {
        const incoming = msg.agents as number[]
        const meta = (msg.agentMeta || {}) as Record<number, { palette?: number; hueShift?: number; seatId?: string }>
        const folderNames = (msg.folderNames || {}) as Record<number, string>
        // Buffer agents — they'll be added in layoutLoaded after seats are built
        for (const id of incoming) {
          const m = meta[id]
          pendingAgents.push({ id, palette: m?.palette, hueShift: m?.hueShift, seatId: m?.seatId, folderName: folderNames[id] })
        }
        setAgents((prev) => {
          const ids = new Set(prev)
          const merged = [...prev]
          for (const id of incoming) {
            if (!ids.has(id)) {
              merged.push(id)
            }
          }
          return merged.sort((a, b) => a - b)
        })
      } else if (msg.type === 'agentToolStart') {
        const id = msg.id as number
        const toolId = msg.toolId as string
        const status = msg.status as string
        const filePath = msg.filePath as string | undefined
        const isGithubFile = msg.isGithubFile as boolean | undefined
        
        // Track .github file access
        if (isGithubFile && filePath) {
          setGithubFileAccess((prev) => ({
            ...prev,
            [id]: { filePath, timestamp: Date.now() }
          }))
          // Clear after 5 seconds
          setTimeout(() => {
            setGithubFileAccess((prev) => {
              const next = { ...prev }
              if (next[id]?.filePath === filePath) {
                next[id] = null
              }
              return next
            })
          }, 5000)
        }
        
        setAgentTools((prev) => {
          const list = prev[id] || []
          if (list.some((t) => t.toolId === toolId)) return prev
          return { ...prev, [id]: [...list, { toolId, status, done: false }] }
        })
        if (!os) return // Office state required for agent tool updates
        const toolName = extractToolName(status)
        os.setAgentTool(id, toolName)
        os.setAgentActive(id, true)
        os.clearPermissionBubble(id)
        // Create sub-agent character for Task tool subtasks
        if (status.startsWith('Subtask:')) {
          const label = status.slice('Subtask:'.length).trim()
          const subId = os.addSubagent(id, toolId)
          setSubagentCharacters((prev) => {
            if (prev.some((s) => s.id === subId)) return prev
            return [...prev, { id: subId, parentAgentId: id, parentToolId: toolId, label }]
          })
        }
      } else if (msg.type === 'agentToolDone') {
        const id = msg.id as number
        const toolId = msg.toolId as string
        setAgentTools((prev) => {
          const list = prev[id]
          if (!list) return prev
          return {
            ...prev,
            [id]: list.map((t) => (t.toolId === toolId ? { ...t, done: true } : t)),
          }
        })
      } else if (msg.type === 'initiateHandoff') {
        // Trigger handoff animation between agents
        if (!os) return // Office state required for handoff messages
        const fromRole = msg.from as string
        const toRole = msg.to as string
        console.log(`[Pixel Agents] Handoff: ${fromRole} → ${toRole}`)
        
        // Find agent IDs by role (check both active and placeholder agents)
        const characters = Array.from(os.characters.entries())
        const fromAgent = characters.find(([_, ch]) => ch.agentRole === fromRole)
        const toAgent = characters.find(([_, ch]) => ch.agentRole === toRole)
        
        if (fromAgent && toAgent) {
          const [fromId] = fromAgent
          const [toId] = toAgent
          console.log(`[Pixel Agents] Handoff IDs: ${fromId} → ${toId}`)
          os.initiateHandoff(fromId, toId)
          
          // Play handoff sound effect
          import('../notificationSound.js').then(({ playDoneSound }) => {
            playDoneSound().catch(() => {
              // Audio may not be available, ignore
            })
          })
        } else {
          console.warn(`[Pixel Agents] Handoff failed — agents not found: from=${fromRole} (${fromAgent ? 'found' : 'missing'}), to=${toRole} (${toAgent ? 'found' : 'missing'})`)
        }
      } else if (msg.type === 'agentToolsClear') {
        const id = msg.id as number
        setAgentTools((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
        setSubagentTools((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        })
        // Remove all sub-agent characters belonging to this agent
        if (!os) return // Office state required for clearing tools
        os.removeAllSubagents(id)
        setSubagentCharacters((prev) => prev.filter((s) => s.parentAgentId !== id))
        os.setAgentTool(id, null)
        os.clearPermissionBubble(id)
      } else if (msg.type === 'agentSelected') {
        const id = msg.id as number
        setSelectedAgent(id)
      } else if (msg.type === 'agentStatus') {
        const id = msg.id as number
        const status = msg.status as string
        setAgentStatuses((prev) => {
          if (status === 'active') {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
          }
          return { ...prev, [id]: status }
        })
        if (!os) return // Office state required for status updates
        os.setAgentActive(id, status === 'active')
        if (status === 'waiting') {
          os.showWaitingBubble(id)
          playDoneSound()
        }
      } else if (msg.type === 'agentToolPermission') {
        const id = msg.id as number
        setAgentTools((prev) => {
          const list = prev[id]
          if (!list) return prev
          return {
            ...prev,
            [id]: list.map((t) => (t.done ? t : { ...t, permissionWait: true })),
          }
        })
        if (!os) return // Office state required for permission bubble
        os.showPermissionBubble(id)
      } else if (msg.type === 'subagentToolPermission') {
        const id = msg.id as number
        const parentToolId = msg.parentToolId as string
        if (!os) return // Office state required for permission bubble
        // Show permission bubble on the sub-agent character
        const subId = os.getSubagentId(id, parentToolId)
        if (subId !== null) {
          os.showPermissionBubble(subId)
        }
      } else if (msg.type === 'agentToolPermissionClear') {
        const id = msg.id as number
        setAgentTools((prev) => {
          const list = prev[id]
          if (!list) return prev
          const hasPermission = list.some((t) => t.permissionWait)
          if (!hasPermission) return prev
          return {
            ...prev,
            [id]: list.map((t) => (t.permissionWait ? { ...t, permissionWait: false } : t)),
          }
        })
        if (!os) return // Office state required for clearing permission bubble
        os.clearPermissionBubble(id)
        // Also clear permission bubbles on all sub-agent characters of this parent
        for (const [subId, meta] of os.subagentMeta) {
          if (meta.parentAgentId === id) {
            os.clearPermissionBubble(subId)
          }
        }
      } else if (msg.type === 'subagentToolStart') {
        const id = msg.id as number
        const parentToolId = msg.parentToolId as string
        const toolId = msg.toolId as string
        const status = msg.status as string
        setSubagentTools((prev) => {
          const agentSubs = prev[id] || {}
          const list = agentSubs[parentToolId] || []
          if (list.some((t) => t.toolId === toolId)) return prev
          return { ...prev, [id]: { ...agentSubs, [parentToolId]: [...list, { toolId, status, done: false }] } }
        })
        if (!os) return // Office state required for subagent tool start
        // Update sub-agent character's tool and active state
        const subId = os.getSubagentId(id, parentToolId)
        if (subId !== null) {
          const subToolName = extractToolName(status)
          os.setAgentTool(subId, subToolName)
          os.setAgentActive(subId, true)
        }
      } else if (msg.type === 'subagentToolDone') {
        const id = msg.id as number
        const parentToolId = msg.parentToolId as string
        const toolId = msg.toolId as string
        setSubagentTools((prev) => {
          const agentSubs = prev[id]
          if (!agentSubs) return prev
          const list = agentSubs[parentToolId]
          if (!list) return prev
          return {
            ...prev,
            [id]: { ...agentSubs, [parentToolId]: list.map((t) => (t.toolId === toolId ? { ...t, done: true } : t)) },
          }
        })
      } else if (msg.type === 'subagentClear') {
        const id = msg.id as number
        const parentToolId = msg.parentToolId as string
        setSubagentTools((prev) => {
          const agentSubs = prev[id]
          if (!agentSubs || !(parentToolId in agentSubs)) return prev
          const next = { ...agentSubs }
          delete next[parentToolId]
          if (Object.keys(next).length === 0) {
            const outer = { ...prev }
            delete outer[id]
            return outer
          }
          return { ...prev, [id]: next }
        })
        if (!os) return // Office state required for removing subagent
        // Remove sub-agent character
        os.removeSubagent(id, parentToolId)
        setSubagentCharacters((prev) => prev.filter((s) => !(s.parentAgentId === id && s.parentToolId === parentToolId)))
      } else if (msg.type === 'characterSpritesLoaded') {
        const characters = msg.characters as Array<{ down: string[][][]; up: string[][][]; right: string[][][] }>
        console.log(`[Webview] Received ${characters.length} pre-colored character sprites`)
        setCharacterTemplates(characters)
      } else if (msg.type === 'floorTilesLoaded') {
        const sprites = msg.sprites as string[][][]
        console.log(`[Webview] Received ${sprites.length} floor tile patterns`)
        setFloorSprites(sprites)
      } else if (msg.type === 'wallTilesLoaded') {
        const sprites = msg.sprites as string[][][]
        console.log(`[Webview] Received ${sprites.length} wall tile sprites`)
        setWallSprites(sprites)
      } else if (msg.type === 'workspaceFolders') {
        const folders = msg.folders as WorkspaceFolder[]
        setWorkspaceFolders(folders)
      } else if (msg.type === 'settingsLoaded') {
        const soundOn = msg.soundEnabled as boolean
        setSoundEnabled(soundOn)
      } else if (msg.type === 'agentMetadataLoaded') {
        const metadata = msg.metadata as AgentMetadata[]
        console.log(`[Webview] Loaded ${metadata.length} agent definitions from .github/agents/`)
        setAgentMetadata(metadata)
      } else if (msg.type === 'furnitureAssetsLoaded') {
        try {
          const catalog = msg.catalog as FurnitureAsset[]
          const sprites = msg.sprites as Record<string, string[][]>
          console.log(`📦 Webview: Loaded ${catalog.length} furniture assets`)
          // Build dynamic catalog immediately so getCatalogEntry() works when layoutLoaded arrives next
          buildDynamicCatalog({ catalog, sprites })
          setLoadedAssets({ catalog, sprites })
        } catch (err) {
          console.error(`❌ Webview: Error processing furnitureAssetsLoaded:`, err)
        }
      } else if (msg.type === 'workflowUpdated') {
        const state = msg.state as WorkflowState
        console.log(`[Webview] Workflow state updated:`, state)
        setWorkflowState(state)
      } else if (msg.type === 'taskProgression') {
        const progressionMsg = msg as TaskProgressionMessage
        console.log(`[Webview] Task progression updated:`, progressionMsg)
        setTaskProgression({
          previous: progressionMsg.previous,
          current: progressionMsg.current,
          next: progressionMsg.next,
          planCheckpoint: progressionMsg.planCheckpoint ?? null,
        })
      } else if (msg.type === 'plan.checkpoint') {
        // Enhanced: implementation-plan.md checkpoint message
        const checkpoint = msg.data as PlanCheckpoint
        setTaskProgression(prev => prev ? { ...prev, planCheckpoint: checkpoint } : {
          previous: null,
          current: null,
          next: null,
          planCheckpoint: checkpoint,
        })
      } else if (msg.type === 'agent-activity-update') {
        const activityMsg = msg as ActionBubbleMessage
        console.log(`[Webview] Agent activity updated:`, activityMsg.payload)
        setAgentActivityState({
          ...activityMsg.payload,
          fileOperations: activityMsg.payload.fileOperations ?? [],
        })
      } else if (msg.type === 'document-changed') {
        // US-001-003: Real-Time Document Monitoring Engine
        const docMsg = msg as DocumentWatcherMessage
        console.log(`[Webview] Document changes detected:`, docMsg.changes.length, 'files')
        setDocumentWatcherState({
          changes: docMsg.changes,
          metrics: docMsg.metrics,
          lastUpdateTime: docMsg.timestamp,
          isWatching: true,
          error: undefined,
        })
      } else if (msg.type === 'agentHandoff') {
        const fromId = msg.fromId as number
        const toId = msg.toId as number
        console.log(`[Webview] Agent handoff requested: ${fromId} → ${toId}`)
        if (!os) return // Office state required for handoff
        os.initiateHandoff(fromId, toId)
      }
    }
    window.addEventListener('message', handler)
    vscode.postMessage({ type: 'webviewReady' })
    return () => window.removeEventListener('message', handler)
  }, [getOfficeState])

  return { agents, selectedAgent, agentTools, agentStatuses, subagentTools, subagentCharacters, layoutReady, loadedAssets, workspaceFolders, agentMetadata, githubFileAccess, workflowState, taskProgression, agentActivityState, documentWatcherState }
}
