#!/usr/bin/env ts-node

/**
 * Export Traces Script
 * Exports handoff traces to various formats for analysis
 */

import * as fs from 'fs';
import * as path from 'path';

interface TraceEvent {
  timestamp: string;
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  agent_from: string;
  agent_to: string;
  handoff_type: string;
  context_summary: string;
  quality_score?: number;
  duration_ms?: number;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  outputPath: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minQualityScore?: number;
}

class TraceExporter {
  private tracesDir: string;

  constructor() {
    this.tracesDir = path.join(__dirname, '../traces');
  }

  async exportTraces(options: ExportOptions): Promise<void> {
    console.log(`📊 Exporting traces in ${options.format} format...`);

    const traces = this.loadTraces(options);
    
    switch (options.format) {
      case 'json':
        this.exportAsJSON(traces, options.outputPath);
        break;
      case 'csv':
        this.exportAsCSV(traces, options.outputPath);
        break;
      case 'markdown':
        this.exportAsMarkdown(traces, options.outputPath);
        break;
    }

    console.log(`✅ Exported ${traces.length} traces to ${options.outputPath}`);
  }

  private loadTraces(options: ExportOptions): TraceEvent[] {
    if (!fs.existsSync(this.tracesDir)) {
      console.warn('⚠️  No traces directory found');
      return [];
    }

    const files = fs.readdirSync(this.tracesDir)
      .filter(f => f.endsWith('.json'));

    const allTraces: TraceEvent[] = [];

    for (const file of files) {
      const filePath = path.join(this.tracesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const trace = JSON.parse(content) as TraceEvent;

      // Apply filters
      if (options.dateRange) {
        const traceDate = new Date(trace.timestamp);
        if (traceDate < options.dateRange.start || traceDate > options.dateRange.end) {
          continue;
        }
      }

      if (options.minQualityScore && trace.quality_score) {
        if (trace.quality_score < options.minQualityScore) {
          continue;
        }
      }

      allTraces.push(trace);
    }

    return allTraces.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private exportAsJSON(traces: TraceEvent[], outputPath: string): void {
    const output = {
      exported_at: new Date().toISOString(),
      total_traces: traces.length,
      traces: traces
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  }

  private exportAsCSV(traces: TraceEvent[], outputPath: string): void {
    const headers = [
      'timestamp',
      'trace_id',
      'span_id',
      'agent_from',
      'agent_to',
      'handoff_type',
      'quality_score',
      'duration_ms',
      'context_summary'
    ];

    const rows = traces.map(t => [
      t.timestamp,
      t.trace_id,
      t.span_id,
      t.agent_from,
      t.agent_to,
      t.handoff_type,
      t.quality_score?.toString() || '',
      t.duration_ms?.toString() || '',
      `"${t.context_summary.replace(/"/g, '""')}"`
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    fs.writeFileSync(outputPath, csv);
  }

  private exportAsMarkdown(traces: TraceEvent[], outputPath: string): void {
    const lines = [
      '# Handoff Trace Report',
      '',
      `**Generated**: ${new Date().toISOString()}`,
      `**Total Traces**: ${traces.length}`,
      '',
      '## Trace Summary',
      ''
    ];

    // Group by agent handoff pairs
    const handoffPairs = new Map<string, TraceEvent[]>();
    for (const trace of traces) {
      const key = `${trace.agent_from} → ${trace.agent_to}`;
      if (!handoffPairs.has(key)) {
        handoffPairs.set(key, []);
      }
      handoffPairs.get(key)!.push(trace);
    }

    lines.push('| Handoff | Count | Avg Quality | Avg Duration |');
    lines.push('|---------|-------|-------------|--------------|');

    for (const [pair, pairTraces] of handoffPairs.entries()) {
      const avgQuality = pairTraces
        .filter(t => t.quality_score !== undefined)
        .reduce((sum, t) => sum + (t.quality_score || 0), 0) / pairTraces.length;
      
      const avgDuration = pairTraces
        .filter(t => t.duration_ms !== undefined)
        .reduce((sum, t) => sum + (t.duration_ms || 0), 0) / pairTraces.length;

      lines.push(`| ${pair} | ${pairTraces.length} | ${avgQuality.toFixed(2)} | ${avgDuration.toFixed(0)}ms |`);
    }

    lines.push('', '## Detailed Traces', '');

    for (const trace of traces) {
      lines.push(`### ${trace.agent_from} → ${trace.agent_to}`);
      lines.push(`- **Timestamp**: ${trace.timestamp}`);
      lines.push(`- **Trace ID**: ${trace.trace_id}`);
      lines.push(`- **Quality Score**: ${trace.quality_score?.toFixed(2) || 'N/A'}`);
      lines.push(`- **Duration**: ${trace.duration_ms || 'N/A'}ms`);
      lines.push(`- **Context**: ${trace.context_summary}`);
      lines.push('');
    }

    fs.writeFileSync(outputPath, lines.join('\n'));
  }
}

// CLI Interface
const args = process.argv.slice(2);
const format = (args.find(a => a.startsWith('--format='))?.split('=')[1] || 'json') as 'json' | 'csv' | 'markdown';
const output = args.find(a => a.startsWith('--output='))?.split('=')[1] || `traces-export.${format}`;
const minQuality = args.find(a => a.startsWith('--min-quality='))?.split('=')[1];

const exporter = new TraceExporter();
exporter.exportTraces({
  format,
  outputPath: output,
  minQualityScore: minQuality ? parseFloat(minQuality) : undefined
}).catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
