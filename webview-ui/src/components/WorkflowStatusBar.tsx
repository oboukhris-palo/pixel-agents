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

  // Palo IT color scheme
  const PALO_GREEN = '#00C853'
  const PALO_YELLOW = '#FFD600'
  const PALO_ORANGE = '#FF6D00'
  const PALO_BLUE = '#3B82F6'
  const RED = '#FF5500'
  const TDD_GREEN = '#10B981'
  const REFACTOR_PURPLE = '#8B5CF6'

  // Determine stage text and color
  let stageText = ''
  let stageColor = PALO_BLUE
  
  if (workflow === 'PDLC' && pdlcStage) {
    stageText = `Stage ${pdlcStage}/8`
    stageColor = PALO_BLUE
  } else if (workflow === 'Implementation' && implementationPhase) {
    stageText = implementationPhase
    if (implementationPhase.includes('RED')) stageColor = RED
    else if (implementationPhase.includes('GREEN')) stageColor = TDD_GREEN
    else if (implementationPhase.includes('REFACTOR')) stageColor = REFACTOR_PURPLE
    else stageColor = PALO_BLUE
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
    <div className="workflow-status-bar" style={{ background: 'transparent', borderTop: 'none', fontFamily: 'monospace', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Main Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0', gap: '0', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
        {/* Workflow label */}
        <span style={{ fontSize: '11px', color: PALO_GREEN, fontWeight: 600, marginRight: '4px' }}>{workflow}</span>
        {stageText && (
          <>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginRight: '4px' }}>›</span>
            <span style={{ fontSize: '11px', color: stageColor, marginRight: '8px' }}>{stageText}</span>
          </>
        )}
        {activeTddLayer && (
          <span style={{ fontSize: '11px', color: '#808080', marginRight: '8px' }}>({activeTddLayer})</span>
        )}
        {/* PRD Maturity (PDLC workflow only) */}
        {workflow === 'PDLC' && maturityScore !== undefined && (
          <>
            <span style={{ fontSize: '11px', color: '#808080', marginRight: '4px' }}>Maturity:</span>
            <span style={{ fontSize: '11px', color: maturityScore >= 75 ? PALO_GREEN : maturityScore >= 50 ? PALO_YELLOW : PALO_ORANGE, fontWeight: 600, marginRight: '4px' }}>{maturityScore}%</span>
            {readyForImplementation && (
              <span style={{ fontSize: '11px', color: PALO_GREEN, marginRight: '4px' }}>✓ Ready</span>
            )}
            <button
              onClick={() => setPrdExpanded(!prdExpanded)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#808080', padding: '0 4px 0 0', lineHeight: 1 }}
              title="Toggle PRD checklist"
            >
              {prdExpanded ? '▼' : '▶'}
            </button>
          </>
        )}
        {/* Separator */}
        {(currentSprint || activeUserStory) && (
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 8px' }}>|</span>
        )}
        {/* Sprint */}
        {currentSprint && (
          <>
            <span style={{ fontSize: '11px', color: '#808080', marginRight: '4px' }}>Sprint:</span>
            <span style={{ fontSize: '11px', color: '#d4d4d4', marginRight: '8px' }}>{currentSprint}</span>
          </>
        )}
        {/* Story */}
        {activeUserStory && (
          <>
            <span style={{ fontSize: '11px', color: '#808080', marginRight: '4px' }}>Story:</span>
            <span style={{ fontSize: '11px', color: PALO_YELLOW, marginRight: '4px' }}>{activeUserStory}</span>
          </>
        )}
        {/* Progress — pushed right */}
        {progressLabel && (
          <span style={{ fontSize: '11px', color: '#808080', marginLeft: 'auto', marginRight: '6px' }}>{progressLabel}</span>
        )}
        <div style={{ width: '60px', height: '4px', background: '#3e3e42', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: `${progressValue}%`, height: '100%', background: PALO_GREEN, transition: 'width 0.3s' }} />
        </div>
        {progressValue > 0 && (
          <span style={{ fontSize: '11px', color: '#808080', marginLeft: '4px' }}>{Math.round(progressValue)}%</span>
        )}
      </div>

      {/* PRD Checklist (Expandable) */}
      {workflow === 'PDLC' && prdExpanded && prdDocuments && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#808080', marginBottom: '6px', fontWeight: 600 }}>
              PRD Documents ({Object.values(prdDocuments).filter(Boolean).length}/8)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
              {Object.entries(prdDocLabels).map(([key, label]) => {
                const docKey = key as keyof typeof prdDocuments
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: prdDocuments[docKey] ? PALO_GREEN : 'rgba(255,255,255,0.35)' }}>{prdDocuments[docKey] ? '✓' : '○'}</span>
                    <span style={{ color: prdDocuments[docKey] ? '#d4d4d4' : '#666' }}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          {missingDocuments && missingDocuments.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: PALO_YELLOW, marginBottom: '6px', fontWeight: 600 }}>Missing</div>
              {missingDocuments.slice(0, 4).map((doc) => (
                <div key={doc} style={{ fontSize: '11px', color: '#808080' }}>• {prdDocLabels[doc] || doc}</div>
              ))}
              {missingDocuments.length > 4 && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>+{missingDocuments.length - 4} more</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
