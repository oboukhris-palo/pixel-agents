import { useState } from 'react'
import type { AgentMetadata } from '../hooks/useExtensionMessages.js'

interface AgentRegistryProps {
  agents: number[]
  agentMetadata: AgentMetadata[]
  agentStatuses: Record<number, string>
  githubFileAccess: Record<number, { filePath: string; timestamp: number } | null>
  onSelectAgent: (id: number) => void
  selectedAgent: number | null
}

/**
 * Displays all available agents from .github/agents/ directory
 * Shows their current status and highlights .github file access
 */
export function AgentRegistry({
  agents,
  agentMetadata,
  agentStatuses,
  githubFileAccess,
  onSelectAgent,
  selectedAgent,
}: AgentRegistryProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Create a map for quick lookup
  const metadataMap = new Map<string, AgentMetadata>()
  for (const meta of agentMetadata) {
    metadataMap.set(meta.id, meta)
  }

  // Show active agents first, then available agents
  const activeAgents = agents.map((id) => ({ id, active: true }))
  const allAgentIds = new Set(agents)
  const availableAgents = agentMetadata
    .filter((meta) => !allAgentIds.has(parseInt(meta.id, 10)))
    .map((meta) => ({ id: meta.id, active: false }))

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: isExpanded ? 320 : 'auto',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto',
    background: 'var(--pixel-bg)',
    border: '2px solid var(--pixel-border)',
    borderRadius: 0,
    boxShadow: 'var(--pixel-shadow)',
    zIndex: 'var(--pixel-controls-z)',
    padding: 8,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isExpanded ? 8 : 0,
    paddingBottom: isExpanded ? 8 : 0,
    borderBottom: isExpanded ? '2px solid var(--pixel-border)' : 'none',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--pixel-text)',
    margin: 0,
  }

  const toggleBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'var(--pixel-text-dim)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '2px 4px',
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: 12,
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--pixel-accent)',
    marginBottom: 6,
  }

  const agentItemStyle = (isActive: boolean, isSelected: boolean, hasGithubAccess: boolean): React.CSSProperties => ({
    padding: '6px 8px',
    marginBottom: 4,
    background: isSelected
      ? 'var(--pixel-accent)'
      : isActive
        ? 'var(--pixel-btn-bg)'
        : 'transparent',
    border: hasGithubAccess ? '2px solid #ff6b6b' : '2px solid transparent',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: hasGithubAccess ? '0 0 8px rgba(255, 107, 107, 0.5)' : 'none',
  })

  const agentNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--pixel-text)',
    marginBottom: 2,
  }

  const agentDescStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--pixel-text-dim)',
    marginBottom: 2,
  }

  const agentStatusStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4ade80',
    fontStyle: 'italic',
  }

  const githubIndicatorStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 6px',
    background: '#ff6b6b',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: 0,
    marginLeft: 6,
  }

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>AI Agents</h3>
        <button
          style={toggleBtnStyle}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Active Agents */}
          {activeAgents.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Active ({activeAgents.length})</div>
              {activeAgents.map((item) => {
                const agentId = item.id
                const status = agentStatuses[agentId] || 'Idle'
                const githubAccess = githubFileAccess[agentId]
                const hasGithubAccess = !!githubAccess
                const isSelected = selectedAgent === agentId

                // Try to find metadata for this agent
                const meta = metadataMap.get(agentId.toString())

                return (
                  <div
                    key={agentId}
                    style={agentItemStyle(true, isSelected, hasGithubAccess)}
                    onClick={() => onSelectAgent(agentId)}
                  >
                    <div style={agentNameStyle}>
                      Agent #{agentId}
                      {hasGithubAccess && (
                        <span style={githubIndicatorStyle}>.github</span>
                      )}
                    </div>
                    {meta && (
                      <div style={agentDescStyle}>
                        {meta.name}
                      </div>
                    )}
                    <div style={agentStatusStyle}>
                      {status}
                      {hasGithubAccess && githubAccess && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#ff6b6b' }}>
                          → {githubAccess.filePath.split('/').pop()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Available Agents */}
          {availableAgents.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Available ({availableAgents.length})</div>
              {availableAgents.map((item) => {
                const meta = metadataMap.get(item.id)
                if (!meta) return null

                return (
                  <div
                    key={item.id}
                    style={agentItemStyle(false, false, false)}
                    title={`${meta.name}\n${meta.description || ''}`}
                  >
                    <div style={agentNameStyle}>{meta.name}</div>
                    {meta.description && (
                      <div style={agentDescStyle}>{meta.description}</div>
                    )}
                    {meta.argumentHint && (
                      <div style={{ fontSize: '11px', color: 'var(--pixel-text-dim)', fontStyle: 'italic' }}>
                        {meta.argumentHint}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {activeAgents.length === 0 && availableAgents.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--pixel-text-dim)', padding: '16px 0' }}>
              No agents found in .github/agents/
            </div>
          )}
        </>
      )}
    </div>
  )
}
