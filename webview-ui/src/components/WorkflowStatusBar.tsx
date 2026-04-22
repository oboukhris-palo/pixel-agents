import { useState } from 'react'
import type { WorkflowState } from '../hooks/useExtensionMessages'

interface WorkflowStatusBarProps {
  workflowState: WorkflowState | null
}

export function WorkflowStatusBar({ workflowState }: WorkflowStatusBarProps) {
  const [prdExpanded, setPrdExpanded] = useState(false)

  if (!workflowState || workflowState.workflow === 'None') {
    return null
  }

  const { 
    workflow, 
    pdlcStage, 
    pdlcProgress, 
    implementationPhase, 
    activeUserStory, 
    projectCompletion, 
    totalStories, 
    completedStories, 
    currentSprint, 
    activeTddLayer,
    prdDocuments,
    maturityScore,
    missingDocuments,
    readyForImplementation
  } = workflowState

  // Color scheme based on workflow type
  const getWorkflowColor = (): string => {
    if (workflow === 'PDLC') return 'bg-blue-600'
    if (workflow === 'Implementation') return 'bg-green-600'
    if (workflow === 'CI/CD') return 'bg-purple-600'
    return 'bg-gray-600'
  }

  const getPhaseColor = (phase: string | undefined): string => {
    if (!phase) return 'bg-gray-600'
    if (phase.includes('RED')) return 'bg-red-600'
    if (phase.includes('GREEN')) return 'bg-green-600'
    if (phase.includes('REFACTOR')) return 'bg-yellow-600'
    if (phase === 'Planning') return 'bg-blue-600'
    if (phase === 'Validation') return 'bg-purple-600'
    return 'bg-gray-600'
  }

  // Determine stage text
  let stageText = ''
  let stageColor = 'bg-gray-600'
  
  if (workflow === 'PDLC' && pdlcStage) {
    stageText = `Stage ${pdlcStage}/8`
    stageColor = getWorkflowColor()
  } else if (workflow === 'Implementation' && implementationPhase) {
    stageText = implementationPhase
    stageColor = getPhaseColor(implementationPhase)
  }

  // Determine progress
  let progressValue = 0
  let progressLabel = ''
  
  if (workflow === 'PDLC' && pdlcProgress !== undefined) {
    progressValue = pdlcProgress
    progressLabel = `${pdlcProgress}%`
  } else if (workflow === 'Implementation' && projectCompletion !== undefined) {
    progressValue = projectCompletion
    progressLabel = `${completedStories || 0}/${totalStories || 0}`
  }

  // PRD document labels
  const prdDocLabels: Record<string, string> = {
    'requirements': '001 Requirements',
    'personas': '002 Personas',
    'architecture-design': '003 Architecture',
    'user-stories': '004 User Stories',
    'tech-spec': '005 Tech Spec',
    'test-strategies': '006 Test Strategy',
    'deployment-plan': '007 Deployment',
    'release-notes': '008 Release Notes'
  }

  return (
    <div className="workflow-status-bar bg-[var(--vscode-panel-background)] border-b border-[var(--vscode-panel-border)] text-sm font-mono">
      {/* Main Status Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Workflow and Stage */}
        <div className="flex items-center gap-3">
          <span className="text-[var(--vscode-foreground)] opacity-70">📋</span>
          <span className="text-[var(--vscode-foreground)] font-semibold">{workflow}</span>
          {stageText && (
            <>
              <span className="text-[var(--vscode-foreground)] opacity-50">›</span>
              <span className={`px-2 py-0.5 rounded text-xs ${stageColor} text-white`}>
                {stageText}
              </span>
            </>
          )}
          {activeTddLayer && (
            <span className="text-[var(--vscode-foreground)] opacity-70 text-xs">
              ({activeTddLayer})
            </span>
          )}
          
          {/* PRD Maturity Badge (PDLC workflow only) */}
          {workflow === 'PDLC' && maturityScore !== undefined && (
            <button
              onClick={() => setPrdExpanded(!prdExpanded)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--vscode-button-hoverBackground)] cursor-pointer transition-colors"
              title="Click to expand PRD checklist"
            >
              <span className="text-[var(--vscode-foreground)] opacity-70 text-xs">Maturity:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                maturityScore >= 75 ? 'bg-green-600 text-white' :
                maturityScore >= 50 ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {maturityScore}%
              </span>
              {readyForImplementation && (
                <span className="text-green-400 text-xs">✓ Ready</span>
              )}
              <span className="text-[var(--vscode-foreground)] opacity-50 text-xs">
                {prdExpanded ? '▼' : '▶'}
              </span>
            </button>
          )}
        </div>

        {/* Middle: Current Sprint and Story */}
        <div className="flex items-center gap-4">
          {currentSprint && (
            <div className="flex items-center gap-1">
              <span className="text-[var(--vscode-foreground)] opacity-70">Sprint:</span>
              <span className="text-[var(--vscode-foreground)]">{currentSprint}</span>
            </div>
          )}
          {activeUserStory && (
            <div className="flex items-center gap-1">
              <span className="text-[var(--vscode-foreground)] opacity-70">Story:</span>
              <span className="text-[var(--vscode-foreground)]">{activeUserStory}</span>
              <span className="text-yellow-400 ml-1">●</span>
            </div>
          )}
        </div>

        {/* Right: Progress */}
        <div className="flex items-center gap-2">
          {progressLabel && (
            <div className="flex items-center gap-1 text-[var(--vscode-foreground)] opacity-70 text-xs">
              <span>{progressLabel}</span>
            </div>
          )}
          <div className="w-24 h-2 bg-[var(--vscode-input-background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--vscode-progressBar-background)] transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <span className="text-[var(--vscode-foreground)] opacity-70 text-xs">
            {Math.round(progressValue)}%
          </span>
        </div>
      </div>

      {/* PRD Checklist (Expandable) */}
      {workflow === 'PDLC' && prdExpanded && prdDocuments && (
        <div className="px-4 pb-3 pt-1 border-t border-[var(--vscode-panel-border)]">
          <div className="flex items-start gap-6">
            {/* PRD Documents Checklist */}
            <div className="flex-1">
              <div className="text-[var(--vscode-foreground)] opacity-70 text-xs mb-2 font-semibold">
                📄 PRD Documents ({Object.values(prdDocuments).filter(Boolean).length}/8)
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {Object.entries(prdDocLabels).map(([key, label]) => {
                  const docKey = key as keyof typeof prdDocuments
                  return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className={prdDocuments[docKey] ? 'text-green-400' : 'text-[var(--vscode-foreground)] opacity-30'}>
                        {prdDocuments[docKey] ? '✅' : '⬜'}
                      </span>
                      <span className={`${prdDocuments[docKey] ? 'text-[var(--vscode-foreground)]' : 'text-[var(--vscode-foreground)] opacity-50'}`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Missing Documents Warning */}
            {missingDocuments && missingDocuments.length > 0 && (
              <div className="flex-1">
                <div className="text-yellow-500 text-xs mb-2 font-semibold">
                  ⚠️ Missing Documents
                </div>
                <ul className="text-xs space-y-1">
                  {missingDocuments.slice(0, 4).map((doc) => (
                    <li key={doc} className="text-[var(--vscode-foreground)] opacity-70">
                      • {prdDocLabels[doc] || doc}
                    </li>
                  ))}
                  {missingDocuments.length > 4 && (
                    <li className="text-[var(--vscode-foreground)] opacity-50">
                      ... and {missingDocuments.length - 4} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Readiness Status */}
            <div className="flex items-center justify-center px-4">
              {readyForImplementation ? (
                <div className="text-center">
                  <div className="text-green-400 text-2xl mb-1">✓</div>
                  <div className="text-green-400 text-xs font-semibold">Ready to</div>
                  <div className="text-green-400 text-xs font-semibold">Implement</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-yellow-500 text-2xl mb-1">⏳</div>
                  <div className="text-yellow-500 text-xs">In Progress</div>
                  <div className="text-[var(--vscode-foreground)] opacity-50 text-xs">
                    ({maturityScore}% / 75%)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
