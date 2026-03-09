import { createHash } from 'crypto';

export interface HandoffTrace {
  traceId: string;
  spanId: string;
  storyRef: string;
  fromAgent: string;
  toAgent: string;
  layer?: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  status: 'started' | 'completed' | 'failed' | 'escalated';
  contextSize: number;
  validationErrors: string[];
  metadata: Record<string, unknown>;
}

/**
 * Distributed trace system for handoffs
 * Enables end-to-end visibility into agent workflows
 */
export class HandoffTracer {
  private traces: Map<string, HandoffTrace> = new Map();
  private activeSpans: Map<string, string> = new Map(); // storyRef -> spanId
  
  /**
   * Start a new handoff trace
   */
  startHandoff(
    storyRef: string, 
    fromAgent: string, 
    toAgent: string, 
    layer?: string, 
    metadata: Record<string, unknown> = {}
  ): HandoffTrace {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    
    const trace: HandoffTrace = {
      traceId,
      spanId,
      storyRef,
      fromAgent,
      toAgent,
      layer,
      startTime: new Date(),
      status: 'started',
      contextSize: JSON.stringify(metadata).length,
      validationErrors: [],
      metadata
    };
    
    this.traces.set(spanId, trace);
    this.activeSpans.set(storyRef, spanId);
    
    return trace;
  }
  
  /**
   * Complete a handoff trace successfully
   */
  completeHandoff(spanId: string, metadata: Record<string, unknown> = {}): void {
    const trace = this.traces.get(spanId);
    if (!trace) {
      console.warn(`Trace not found for spanId: ${spanId}`);
      return;
    }
    
    trace.endTime = new Date();
    trace.durationMs = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = 'completed';
    trace.metadata = { ...trace.metadata, ...metadata };
    
    this.activeSpans.delete(trace.storyRef);
  }
  
  /**
   * Mark handoff as failed with validation errors
   */
  failHandoff(spanId: string, errors: string[], metadata: Record<string, unknown> = {}): void {
    const trace = this.traces.get(spanId);
    if (!trace) {
      console.warn(`Trace not found for spanId: ${spanId}`);
      return;
    }
    
    trace.endTime = new Date();
    trace.durationMs = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = 'failed';
    trace.validationErrors = errors;
    trace.metadata = { ...trace.metadata, ...metadata };
    
    this.activeSpans.delete(trace.storyRef);
  }
  
  /**
   * Escalate handoff due to quality issues
   */
  escalateHandoff(spanId: string, reason: string, metadata: Record<string, unknown> = {}): void {
    const trace = this.traces.get(spanId);
    if (!trace) {
      console.warn(`Trace not found for spanId: ${spanId}`);
      return;
    }
    
    trace.endTime = new Date();
    trace.durationMs = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = 'escalated';
    trace.metadata = { ...trace.metadata, escalation_reason: reason, ...metadata };
    
    this.activeSpans.delete(trace.storyRef);
  }
  
  /**
   * Get trace by span ID
   */
  getTrace(spanId: string): HandoffTrace | undefined {
    return this.traces.get(spanId);
  }
  
  /**
   * Get active trace for story
   */
  getActiveTrace(storyRef: string): HandoffTrace | undefined {
    const spanId = this.activeSpans.get(storyRef);
    return spanId ? this.traces.get(spanId) : undefined;
  }
  
  /**
   * Get all traces for a story
   */
  getStoryTraces(storyRef: string): HandoffTrace[] {
    return Array.from(this.traces.values())
      .filter(trace => trace.storyRef === storyRef)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  /**
   * Get all traces in time range
   */
  getTracesInRange(startTime: Date, endTime: Date): HandoffTrace[] {
    return Array.from(this.traces.values())
      .filter(trace => trace.startTime >= startTime && trace.startTime <= endTime)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalHandoffs: number;
    successRate: number;
    avgDurationMs: number;
    failureRate: number;
    escalationRate: number;
  } {
    const traces = Array.from(this.traces.values());
    const completed = traces.filter(t => t.status === 'completed');
    const failed = traces.filter(t => t.status === 'failed');
    const escalated = traces.filter(t => t.status === 'escalated');
    
    const totalDuration = completed.reduce((sum, t) => sum + (t.durationMs || 0), 0);
    
    return {
      totalHandoffs: traces.length,
      successRate: traces.length > 0 ? completed.length / traces.length : 0,
      avgDurationMs: completed.length > 0 ? totalDuration / completed.length : 0,
      failureRate: traces.length > 0 ? failed.length / traces.length : 0,
      escalationRate: traces.length > 0 ? escalated.length / traces.length : 0
    };
  }
  
  /**
   * Export traces in JSON format
   */
  exportTraces(): HandoffTrace[] {
    return Array.from(this.traces.values())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  /**
   * Clear all traces (for testing/cleanup)
   */
  clear(): void {
    this.traces.clear();
    this.activeSpans.clear();
  }
  
  private generateTraceId(): string {
    return createHash('sha256')
      .update(`${Date.now()}-${Math.random()}-${process.pid}`)
      .digest('hex')
      .substring(0, 16);
  }
  
  private generateSpanId(): string {
    return createHash('sha256')
      .update(`span-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 12);
  }
}

// Global singleton
export const tracer = new HandoffTracer();