// Design Token System v2.0.0 - Palo IT Branding
import './styles/tokens.css'

import { useState, useCallback, useRef, useEffect } from 'react'
import { OfficeState } from './office/engine/officeState.js'
import { OfficeCanvas } from './office/components/OfficeCanvas.js'
import { ToolOverlay } from './office/components/ToolOverlay.js'
import { EditorToolbar } from './office/editor/EditorToolbar.js'
import { EditorState } from './office/editor/editorState.js'
import { EditTool } from './office/types.js'
import { isRotatable } from './office/layout/furnitureCatalog.js'
import { vscode } from './vscodeApi.js'
import { useExtensionMessages } from './hooks/useExtensionMessages.js'
import { PULSE_ANIMATION_DURATION_SEC } from './constants.js'
import { useEditorActions } from './hooks/useEditorActions.js'
import { useEditorKeyboard } from './hooks/useEditorKeyboard.js'
// import { ZoomControls } from './components/ZoomControls.js' // Hidden per user request
import { WorkflowStatusBar } from './components/WorkflowStatusBar.js'
import { TaskProgressionBar } from './components/TaskProgressionBar.js'
import { DocumentWatcherIndicator } from './components/DocumentWatcherIndicator.js'
import { ContextWindowBar } from './components/ContextWindowBar.js'
import { CompletenessMeter } from './components/CompletenessMeter.js'
import { AgentSidebar } from './components/AgentSidebar.js'
import { useContextWindow } from './hooks/useContextWindow.js'
import { spawnPlaceholderAgents, PLACEHOLDER_AGENTS } from './office/engine/placeholderAgents.js'
import { useAgentActivity } from './hooks/useAgentActivity.js'

// Game state lives outside React — updated imperatively by message handlers
const officeStateRef = { current: null as OfficeState | null }
const editorState = new EditorState()

function getOfficeState(): OfficeState {
  if (!officeStateRef.current) {
    officeStateRef.current = new OfficeState()
  }
  return officeStateRef.current
}

const actionBarBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  fontSize: '22px',
  background: 'var(--pixel-btn-bg)',
  color: 'var(--pixel-text-dim)',
  border: '2px solid transparent',
  borderRadius: 0,
  cursor: 'pointer',
}

const actionBarBtnDisabled: React.CSSProperties = {
  ...actionBarBtnStyle,
  opacity: 'var(--pixel-btn-disabled-opacity)',
  cursor: 'default',
}

function EditActionBar({ editor, editorState: es }: { editor: ReturnType<typeof useEditorActions>; editorState: EditorState }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const undoDisabled = es.undoStack.length === 0
  const redoDisabled = es.redoStack.length === 0

  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--pixel-controls-z)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        background: 'var(--pixel-bg)',
        border: '2px solid var(--pixel-border)',
        borderRadius: 0,
        padding: '4px 8px',
        boxShadow: 'var(--pixel-shadow)',
      }}
    >
      <button
        style={undoDisabled ? actionBarBtnDisabled : actionBarBtnStyle}
        onClick={undoDisabled ? undefined : editor.handleUndo}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>
      <button
        style={redoDisabled ? actionBarBtnDisabled : actionBarBtnStyle}
        onClick={redoDisabled ? undefined : editor.handleRedo}
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>
      <button
        style={actionBarBtnStyle}
        onClick={editor.handleSave}
        title="Save layout"
      >
        Save
      </button>
      {!showResetConfirm ? (
        <button
          style={actionBarBtnStyle}
          onClick={() => setShowResetConfirm(true)}
          title="Reset to last saved layout"
        >
          Reset
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: '22px', color: 'var(--pixel-reset-text)' }}>Reset?</span>
          <button
            style={{ ...actionBarBtnStyle, background: 'var(--pixel-danger-bg)', color: '#fff' }}
            onClick={() => { setShowResetConfirm(false); editor.handleReset() }}
          >
            Yes
          </button>
          <button
            style={actionBarBtnStyle}
            onClick={() => setShowResetConfirm(false)}
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}

function App() {
  const editor = useEditorActions(getOfficeState, editorState)

  const isEditDirty = useCallback(() => editor.isEditMode && editor.isDirty, [editor.isEditMode, editor.isDirty])

  const { agents, agentTools, subagentCharacters, layoutReady, loadedAssets, agentMetadata, workflowState, taskProgression, documentWatcherState } = useExtensionMessages(getOfficeState, editor.setLastSavedLayout, isEditDirty)

  // Context Window tracking (US-002-001)
  const { tokenUsage } = useContextWindow()
  
  // Agent Activity tracking (US-001-002) - for real-time bubble updates
  const { activity: agentActivity } = useAgentActivity()
  
  // Debug logging for context window data
  useEffect(() => {
    console.log('[App] Token usage update:', tokenUsage)
  }, [tokenUsage])
  
  // Track selected agent for sidebar highlighting (synced with officeState.selectedAgentId)
  const [selectedAgentIdForSidebar, setSelectedAgentIdForSidebar] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const [editorTickForKeyboard, setEditorTickForKeyboard] = useState(0)
  useEditorKeyboard(
    editor.isEditMode,
    editorState,
    editor.handleDeleteSelected,
    editor.handleRotateSelected,
    editor.handleToggleState,
    editor.handleUndo,
    editor.handleRedo,
    useCallback(() => setEditorTickForKeyboard((n) => n + 1), []),
    editor.handleToggleEditMode,
  )

  const handleCloseAgent = useCallback((id: number) => {
    vscode.postMessage({ type: 'closeAgent', id })
  }, [])

  const handleTaskClick = useCallback((task: import('./hooks/useExtensionMessages.js').TaskInfo) => {
    vscode.postMessage({ type: 'openTaskFile', storyId: task.storyId, epic: task.epic })
  }, [])

  const handleClick = useCallback((agentId: number) => {
    // If clicked agent is a sub-agent, focus the parent's terminal instead
    const os = getOfficeState()
    const meta = os.subagentMeta.get(agentId)
    const focusId = meta ? meta.parentAgentId : agentId
    vscode.postMessage({ type: 'focusAgent', id: focusId })
    
    // Also show action bubble on clicked character
    const char = os.characters.get(agentId)
    if (char) {
      // Select the character
      os.selectedAgentId = agentId
      setSelectedAgentIdForSidebar(agentId) // Update state to trigger sidebar re-render
      
      // Show action bubble persistently (v1.0.5: No auto-dismiss)
      char.bubbleType = 'waiting'
      char.bubbleTimer = 999999 // Persist until user dismisses (per plan Section 4.3)
      
      // Get real-time activity for this agent
      let bubbleContent = 'Idle'
      if (agentActivity && agentActivity.activeAgent?.id === char.agentRole) {
        // Agent is currently active - show real activity
        const action = agentActivity.currentAction.description || 'Working...'
        const status = agentActivity.status
        
        // Format: action (status)
        bubbleContent = action
        if (status === 'in-progress') {
          bubbleContent += ' ⏳'
        } else if (status === 'success') {
          bubbleContent += ' ✓'
        } else if (status === 'failed') {
          bubbleContent += ' ✗'
        }
        
        // Add code snippet if available (first line only)
        if (agentActivity.codeSnippet && agentActivity.codeSnippet.content) {
          const firstLine = agentActivity.codeSnippet.content.split('\n')[0]
          bubbleContent += `\n${firstLine}`
        }
      } else if (char.isActive) {
        // Character marked active but no current activity
        bubbleContent = 'Working...'
      }
      
      char.bubbleText = bubbleContent
      console.log(`[Canvas] Clicked character ${agentId} (${char.agentRole}), showing persistent bubble: "${bubbleContent}"`)
    }
  }, [agentActivity])

  const officeState = getOfficeState()

  // Spawn placeholder agents as soon as layout is ready (seats exist)
  // Fix #4: Also re-spawn when agentMetadata arrives to use real agent info
  useEffect(() => {
    console.log('[App] useEffect triggered - layoutReady:', layoutReady, 'agentMetadata:', agentMetadata.length)
    if (layoutReady) {
      console.log('[App] Layout ready, spawning placeholder agents...')
      console.log('[App] Office layout:', {
        cols: officeState.getLayout().cols,
        rows: officeState.getLayout().rows,
        furniture: officeState.getLayout().furniture.length,
        seats: officeState.seats.size,
        existingCharacters: officeState.characters.size
      })
      
      // Clear existing placeholder characters before respawning
      // (avoids duplicates when agentMetadata arrives after initial spawn)
      const placeholdersToRemove: number[] = []
      for (const [id, ch] of officeState.characters.entries()) {
        if ((ch as { isPlaceholder?: boolean }).isPlaceholder) {
          placeholdersToRemove.push(id)
        }
      }
      for (const id of placeholdersToRemove) {
        const ch = officeState.characters.get(id)
        if (ch && ch.seatId) {
          const seat = officeState.seats.get(ch.seatId)
          if (seat) seat.assigned = false
        }
        officeState.characters.delete(id)
      }
      if (placeholdersToRemove.length > 0) {
        console.log('[App] Cleared', placeholdersToRemove.length, 'placeholder characters before respawn')
      }
      
      spawnPlaceholderAgents(officeState, agentMetadata, agents)
      console.log('[App] Spawn complete, characters now:', officeState.characters.size)
    }
    // Re-run when layoutReady OR agentMetadata changes (to update with real agent info)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutReady, agentMetadata])

  // Force dependency on editorTickForKeyboard to propagate keyboard-triggered re-renders
  void editorTickForKeyboard

  // Show "Press R to rotate" hint when a rotatable item is selected or being placed
  const showRotateHint = editor.isEditMode && (() => {
    if (editorState.selectedFurnitureUid) {
      const item = officeState.getLayout().furniture.find((f) => f.uid === editorState.selectedFurnitureUid)
      if (item && isRotatable(item.type)) return true
    }
    if (editorState.activeTool === EditTool.FURNITURE_PLACE && isRotatable(editorState.selectedFurnitureType)) {
      return true
    }
    return false
  })()

  if (!layoutReady) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vscode-foreground)' }}>
        Loading...
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--vscode-bg)',
    }}>
      <style>{`
        @keyframes pixel-agents-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pixel-agents-pulse { animation: pixel-agents-pulse ${PULSE_ANIMATION_DURATION_SEC}s ease-in-out infinite; }
      `}</style>

      {/* Task Progression Bar (36px) - Top - Always visible */}
      <TaskProgressionBar
        taskProgression={taskProgression || { previous: null, current: null, next: null }}
        onTaskClick={handleTaskClick}
        workflowPhase={workflowState?.pdlcStage}
      />

      {/* Content Area (flex) - Middle: Sidebar + Canvas + Metrics */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '1px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Agent Sidebar (180px) - Left: shows agents from .github/agents/ or PLACEHOLDER_AGENTS fallback */}
        <AgentSidebar 
          agents={
            agentMetadata.length > 0
              ? agentMetadata.map(meta => {
                  // Check if this agent is currently selected
                  const selectedChar = selectedAgentIdForSidebar !== null 
                    ? officeState.characters.get(selectedAgentIdForSidebar) 
                    : null
                  const isCurrent = selectedChar?.agentRole === meta.id
                  
                  // Mark TDD sub-agents as disabled (they're orchestrated by tdd-orchestrator)
                  const isTDDSubAgent = ['dev-tdd-red', 'dev-tdd-green', 'dev-tdd-refactor'].includes(meta.id)
                  
                  return {
                    name: meta.id,
                    description: `${meta.name}${meta.description ? ': ' + meta.description : ''}`,
                    status: isTDDSubAgent ? ('disabled' as const) : ('idle' as const),
                    isCurrent,
                  }
                })
              : PLACEHOLDER_AGENTS.map(p => {
                  const selectedChar = selectedAgentIdForSidebar !== null 
                    ? officeState.characters.get(selectedAgentIdForSidebar) 
                    : null
                  const isCurrent = selectedChar?.agentRole === p.role
                  
                  return {
                    name: p.role,
                    status: 'idle' as const,
                    isCurrent,
                  }
                })
          }
          onAgentClick={(agentName: string) => {
            // Find character by agentRole and select it in office canvas
            const os = getOfficeState()
            let foundCharacter = null
            for (const [id, char] of os.characters.entries()) {
              if (char.agentRole === agentName) {
                foundCharacter = { id, char }
                break
              }
            }
            
            if (foundCharacter) {
              // Select the character in office state
              os.selectedAgentId = foundCharacter.id
              setSelectedAgentIdForSidebar(foundCharacter.id) // Update state to trigger sidebar re-render
              
              // Show action bubble persistently (v1.0.5: No auto-dismiss)
              const char = foundCharacter.char
              char.bubbleType = 'waiting'
              char.bubbleTimer = 999999 // Persist until user dismisses (per plan Section 4.3)
              
              // Get real-time activity for this agent
              let bubbleContent = 'Idle'
              if (agentActivity && agentActivity.activeAgent?.id === char.agentRole) {
                // Agent is currently active - show real activity
                const action = agentActivity.currentAction.description || 'Working...'
                const status = agentActivity.status
                
                // Format: action (status)
                bubbleContent = action
                if (status === 'in-progress') {
                  bubbleContent += ' ⏳'
                } else if (status === 'success') {
                  bubbleContent += ' ✓'
                } else if (status === 'failed') {
                  bubbleContent += ' ✗'
                }
                
                // Add code snippet if available (first line only)
                if (agentActivity.codeSnippet && agentActivity.codeSnippet.content) {
                  const firstLine = agentActivity.codeSnippet.content.split('\n')[0]
                  bubbleContent += `\n${firstLine}`
                }
              } else if (char.isActive) {
                // Character marked active but no current activity
                bubbleContent = 'Working...'
              }
              
              char.bubbleText = bubbleContent
              
              // Focus camera on selected character (optional)
              os.cameraFollowId = foundCharacter.id
              
              console.log(`[AgentSidebar] Selected agent ${agentName} (character ID: ${foundCharacter.id}), persistent bubble: "${bubbleContent}"`)
              
              // Force re-render to show bubble (trigger canvas update)
              const canvasEvent = new CustomEvent('agent-selected', { detail: { agentId: foundCharacter.id } })
              window.dispatchEvent(canvasEvent)
            } else {
              console.warn(`[AgentSidebar] No character found for agent role: ${agentName}`)
            }
          }}
        />

        {/* Main canvas */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <OfficeCanvas
            officeState={officeState}
            onClick={handleClick}
            isEditMode={editor.isEditMode}
            editorState={editorState}
            onEditorTileAction={editor.handleEditorTileAction}
            onEditorEraseAction={editor.handleEditorEraseAction}
            onEditorSelectionChange={editor.handleEditorSelectionChange}
            onDeleteSelected={editor.handleDeleteSelected}
            onRotateSelected={editor.handleRotateSelected}
            onDragMove={editor.handleDragMove}
            editorTick={editor.editorTick}
            zoom={editor.zoom}
            onZoomChange={editor.handleZoomChange}
            panRef={editor.panRef}
          />
        </div>

        {/* Right Metrics Panel (220px) - CTX left + Completeness right */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          background: '#252526',
          borderLeft: '1px solid #3e3e42',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}>
          {/* CTX section - left ~58px */}
          <div style={{
            width: '58px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', /* Center horizontally */
            justifyContent: 'flex-start', /* Start from top */
            padding: '6px 4px 6px 8px',
            borderRight: '1px solid #3e3e42',
          }}>
            <ContextWindowBar tokenUsage={tokenUsage} />
          </div>
          {/* Completeness section - right ~242px */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CompletenessMeter />
          </div>
        </div>
      </div>

      {/* Status Bar (28px) - Bottom */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        background: '#007ACC',
        color: '#fff',
        height: '28px',
        minHeight: '28px',
        flexShrink: 0,
        zIndex: 1000,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Workflow Status */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <WorkflowStatusBar workflowState={workflowState} />
        </div>
      </div>

      {/* Document Watcher Indicator - Overlay */}
      <DocumentWatcherIndicator watcherState={documentWatcherState} />

      {/* Zoom Controls - Hidden per user request for simplicity */}
      {/* <ZoomControls 
        zoom={editor.zoom} 
        onZoomChange={editor.handleZoomChange}
        layoutWidth={officeState.getLayout().cols}
        layoutHeight={officeState.getLayout().rows}
      /> */}

      {/* Vignette overlay - Removed for simplicity */}
      {/* <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--pixel-vignette)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      /> */}

      {editor.isEditMode && editor.isDirty && (
        <EditActionBar editor={editor} editorState={editorState} />
      )}

      {showRotateHint && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: editor.isDirty ? 'translateX(calc(-50% + 100px))' : 'translateX(-50%)',
            zIndex: 49,
            background: 'var(--pixel-hint-bg)',
            color: '#fff',
            fontSize: '20px',
            padding: '3px 8px',
            borderRadius: 0,
            border: '2px solid var(--pixel-accent)',
            boxShadow: 'var(--pixel-shadow)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Press <b>R</b> to rotate
        </div>
      )}

      {editor.isEditMode && (() => {
        // Compute selected furniture color from current layout
        const selUid = editorState.selectedFurnitureUid
        const selColor = selUid
          ? officeState.getLayout().furniture.find((f) => f.uid === selUid)?.color ?? null
          : null
        return (
          <EditorToolbar
            activeTool={editorState.activeTool}
            selectedTileType={editorState.selectedTileType}
            selectedFurnitureType={editorState.selectedFurnitureType}
            selectedFurnitureUid={selUid}
            selectedFurnitureColor={selColor}
            floorColor={editorState.floorColor}
            wallColor={editorState.wallColor}
            onToolChange={editor.handleToolChange}
            onTileTypeChange={editor.handleTileTypeChange}
            onFloorColorChange={editor.handleFloorColorChange}
            onWallColorChange={editor.handleWallColorChange}
            onSelectedFurnitureColorChange={editor.handleSelectedFurnitureColorChange}
            onFurnitureTypeChange={editor.handleFurnitureTypeChange}
            loadedAssets={loadedAssets}
          />
        )
      })()}

      <ToolOverlay
        officeState={officeState}
        agents={agents}
        agentTools={agentTools}
        subagentCharacters={subagentCharacters}
        containerRef={containerRef}
        zoom={editor.zoom}
        panRef={editor.panRef}
        onCloseAgent={handleCloseAgent}
      />
    </div>
  )
}

export default App
