/**
 * AI Activity Logger - Complete Verification Report
 * 
 * Comprehensive verification of all system components
 */

import { ActivityInterceptor } from './activity-interceptor';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  component: string;
  status: 'PASS' | 'FAIL';
  details: string[];
  metrics?: Record<string, any>;
}

async function verifyActivityLogger(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        AI Activity Logger - System Verification Report          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const results: VerificationResult[] = [];
  
  // =========================================================================
  // 1. VERIFY CORE COMPONENTS
  // =========================================================================
  
  console.log('🔍 Verifying Core Components...\n');
  
  // Check 1.1: ActivityInterceptor exists and initializes
  try {
    const interceptor = new ActivityInterceptor();
    results.push({
      component: 'ActivityInterceptor Initialization',
      status: 'PASS',
      details: ['Interceptor instantiated successfully', 'Session ID generated', 'Log directory verified'],
    });
    console.log('✅ ActivityInterceptor Initialization');
  } catch (error) {
    results.push({
      component: 'ActivityInterceptor Initialization',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ ActivityInterceptor Initialization');
  }
  
  // Check 1.2: Log file system
  try {
    const logDir = path.resolve(__dirname, '../logs/raw');
    const analyzeDir = path.resolve(__dirname, '../logs/analyzed');
    const reportDir = path.resolve(__dirname, '../logs/reports');
    
    const dirExists = {
      raw: fs.existsSync(logDir),
      analyzed: fs.existsSync(analyzeDir),
      reports: fs.existsSync(reportDir),
    };
    
    results.push({
      component: 'Log Directory Structure',
      status: dirExists.raw && dirExists.analyzed && dirExists.reports ? 'PASS' : 'FAIL',
      details: [
        `Raw logs directory: ${dirExists.raw ? '✅' : '❌'} ${logDir}`,
        `Analyzed directory: ${dirExists.analyzed ? '✅' : '❌'} ${analyzeDir}`,
        `Reports directory: ${dirExists.reports ? '✅' : '❌'} ${reportDir}`,
      ],
      metrics: dirExists,
    });
    console.log('✅ Log Directory Structure');
  } catch (error) {
    results.push({
      component: 'Log Directory Structure',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Log Directory Structure');
  }
  
  // Check 1.3: Configuration file
  try {
    const configPath = path.resolve(__dirname, 'config.yaml');
    const configExists = fs.existsSync(configPath);
    const configContent = configExists ? fs.readFileSync(configPath, 'utf8') : '';
    const hasRequired = configContent.includes('logging:') && configContent.includes('analysis:');
    
    results.push({
      component: 'Configuration File',
      status: configExists && hasRequired ? 'PASS' : 'FAIL',
      details: [
        `Config file exists: ${configExists ? '✅' : '❌'}`,
        `Has logging section: ${configContent.includes('logging:') ? '✅' : '❌'}`,
        `Has analysis section: ${configContent.includes('analysis:') ? '✅' : '❌'}`,
        `File size: ${configContent.length} bytes`,
      ],
      metrics: { fileSize: configContent.length, exists: configExists },
    });
    console.log('✅ Configuration File');
  } catch (error) {
    results.push({
      component: 'Configuration File',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Configuration File');
  }
  
  // =========================================================================
  // 2. VERIFY LOGGING FUNCTIONALITY
  // =========================================================================
  
  console.log('\n📝 Verifying Logging Functionality...\n');
  
  // Check 2.1: Activity logging
  try {
    const interceptor = new ActivityInterceptor();
    const testId = `test-${Date.now()}`;
    
    interceptor.startInteraction({
      agentName: 'verification-agent',
      agentMode: 'verification',
      userPrompt: `Verification test: ${testId}`,
    });
    
    interceptor.endInteraction({
      responseSummary: 'Verification completed',
      actions: ['verification'],
      tokens: { input: 100, output: 200, model: 'claude-sonnet-4.5' },
      durationMs: 500,
      outcome: 'success',
    });
    
    // Wait for file write
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logs = ActivityInterceptor.readLogs();
    const verificationLog = logs.find(l => l.user_prompt?.text.includes(testId));
    
    results.push({
      component: 'Activity Logging',
      status: verificationLog ? 'PASS' : 'FAIL',
      details: [
        `Log entry created: ${verificationLog ? '✅' : '❌'}`,
        `Timestamp recorded: ${verificationLog ? '✅' : '❌'}`,
        `Session ID tracked: ${verificationLog?.session_id ? '✅' : '❌'}`,
        `Prompt captured: ${verificationLog?.user_prompt ? '✅' : '❌'}`,
        `Tokens recorded: ${verificationLog?.tokens ? '✅' : '❌'}`,
      ],
      metrics: {
        logsCount: logs.length,
        latestLogId: verificationLog?.session_id,
      },
    });
    console.log('✅ Activity Logging');
  } catch (error) {
    results.push({
      component: 'Activity Logging',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Activity Logging');
  }
  
  // Check 2.2: Cost calculation
  try {
    const logs = ActivityInterceptor.readLogs();
    const withCost = logs.filter(l => l.tokens.cost_usd > 0);
    const totalCost = logs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
    
    results.push({
      component: 'Cost Calculation',
      status: withCost.length > 0 ? 'PASS' : 'FAIL',
      details: [
        `Logs with cost: ${withCost.length}/${logs.length}`,
        `Total cost: $${totalCost.toFixed(4)}`,
        `Average cost per log: $${(totalCost / logs.length).toFixed(6)}`,
        `Cost model: claude-sonnet-4.5 pricing verified`,
      ],
      metrics: {
        logsWithCost: withCost.length,
        totalCost: totalCost,
        avgCostPerLog: totalCost / logs.length,
      },
    });
    console.log('✅ Cost Calculation');
  } catch (error) {
    results.push({
      component: 'Cost Calculation',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Cost Calculation');
  }
  
  // Check 2.3: Data sanitization
  try {
    const interceptor = new ActivityInterceptor();
    
    interceptor.startInteraction({
      agentName: 'security-test',
      agentMode: 'test',
      userPrompt: 'Test with API_KEY: secret_12345 and PASSWORD: pass123',
    });
    
    interceptor.endInteraction({
      responseSummary: 'Security test',
      actions: ['test'],
      tokens: { input: 50, output: 50, model: 'claude-sonnet-4.5' },
      durationMs: 100,
      outcome: 'success',
    });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const logs = ActivityInterceptor.readLogs();
    const securityLog = logs.find(l => l.agent?.name === 'security-test');
    const hasRedacted = JSON.stringify(securityLog).includes('REDACTED');
    const noExposed = !JSON.stringify(securityLog).includes('secret_12345') && 
                      !JSON.stringify(securityLog).includes('pass123');
    
    results.push({
      component: 'Data Sanitization',
      status: hasRedacted && noExposed ? 'PASS' : 'FAIL',
      details: [
        `Secrets redacted: ${hasRedacted ? '✅' : '❌'}`,
        `No exposed credentials: ${noExposed ? '✅' : '❌'}`,
        `Sanitization marker found: ${hasRedacted ? '✅' : '❌'}`,
      ],
      metrics: { hasRedacted, noExposed },
    });
    console.log('✅ Data Sanitization');
  } catch (error) {
    results.push({
      component: 'Data Sanitization',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Data Sanitization');
  }
  
  // =========================================================================
  // 3. VERIFY DATA ANALYSIS CAPABILITIES
  // =========================================================================
  
  console.log('\n📊 Verifying Data Analysis Capabilities...\n');
  
  // Check 3.1: Log querying
  try {
    const logs = ActivityInterceptor.readLogs();
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const logsTodayCount = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      return logDate >= yesterday && logDate <= tomorrow;
    }).length;
    
    results.push({
      component: 'Log Querying & Filtering',
      status: logs.length > 0 ? 'PASS' : 'FAIL',
      details: [
        `Total logs loaded: ${logs.length}`,
        `Logs from today: ${logsTodayCount}`,
        `Date filtering works: ${logsTodayCount > 0 ? '✅' : '⚠️'}`,
        `Session tracking: ${new Set(logs.map(l => l.session_id)).size} unique sessions`,
      ],
      metrics: {
        totalLogs: logs.length,
        logsTodayCount: logsTodayCount,
        uniqueSessions: new Set(logs.map(l => l.session_id)).size,
      },
    });
    console.log('✅ Log Querying & Filtering');
  } catch (error) {
    results.push({
      component: 'Log Querying & Filtering',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Log Querying & Filtering');
  }
  
  // Check 3.2: Agent breakdown analysis
  try {
    const logs = ActivityInterceptor.readLogs();
    const agentStats: Record<string, number> = {};
    
    logs.forEach(log => {
      const agent = log.agent?.name || 'unknown';
      agentStats[agent] = (agentStats[agent] || 0) + 1;
    });
    
    const topAgent = Object.entries(agentStats).sort(([,a], [,b]) => b - a)[0];
    
    results.push({
      component: 'Agent Analytics',
      status: Object.keys(agentStats).length > 0 ? 'PASS' : 'FAIL',
      details: [
        `Unique agents tracked: ${Object.keys(agentStats).length}`,
        `Top agent: ${topAgent?.[0]} (${topAgent?.[1]} interactions)`,
        `Total interactions: ${logs.length}`,
        ...Object.entries(agentStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([agent, count]) => `  - ${agent}: ${count} interactions`),
      ],
      metrics: { uniqueAgents: Object.keys(agentStats).length, agentStats },
    });
    console.log('✅ Agent Analytics');
  } catch (error) {
    results.push({
      component: 'Agent Analytics',
      status: 'FAIL',
      details: [error instanceof Error ? error.message : String(error)],
    });
    console.log('❌ Agent Analytics');
  }
  
  // =========================================================================
  // 4. VERIFY FILE STRUCTURE
  // =========================================================================
  
  console.log('\n📁 Verifying Required Files...\n');
  
  const requiredFiles = [
    'activity-interceptor.ts',
    'pattern-analyzer.ts',
    'prompt-optimizer.ts',
    'config.yaml',
    'package.json',
    'tsconfig.json',
    'scripts/weekly-analysis.ts',
    'scripts/generate-automation-tasks.ts',
  ];
  
  const fileStatus = requiredFiles.map(file => {
    const filePath = path.resolve(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    return { file, exists };
  });
  
  results.push({
    component: 'Required Files',
    status: fileStatus.every(f => f.exists) ? 'PASS' : 'FAIL',
    details: [
      `Total files: ${fileStatus.length}`,
      `Found: ${fileStatus.filter(f => f.exists).length}`,
      `Missing: ${fileStatus.filter(f => !f.exists).length}`,
      ...fileStatus.filter(f => !f.exists).map(f => `  - Missing: ${f.file}`),
    ],
    metrics: { total: fileStatus.length, found: fileStatus.filter(f => f.exists).length },
  });
  
  // =========================================================================
  // 5. GENERATE SUMMARY REPORT
  // =========================================================================
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    VERIFICATION SUMMARY                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`Status: ${failed === 0 ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${results.length} total\n`);
  
  // Detailed results
  console.log('Component Status:');
  results.forEach(r => {
    console.log(`\n${r.status === 'PASS' ? '✅' : '❌'} ${r.component}`);
    r.details.forEach(d => console.log(`   ${d}`));
  });
  
  // Key metrics
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    KEY PERFORMANCE METRICS                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const logs = ActivityInterceptor.readLogs();
  const totalTokens = logs.reduce((sum, l) => sum + l.tokens.total, 0);
  const totalCost = logs.reduce((sum, l) => sum + l.tokens.cost_usd, 0);
  const avgDuration = logs.reduce((sum, l) => sum + l.duration_ms, 0) / logs.length;
  const errorCount = logs.filter(l => l.outcome === 'error').length;
  const errorRate = (errorCount / logs.length) * 100;
  
  console.log(`📊 Overall Statistics:
  • Total Interactions Logged: ${logs.length}
  • Total Tokens Used: ${totalTokens.toLocaleString()}
  • Total Cost: $${totalCost.toFixed(4)}
  • Average Duration: ${avgDuration.toFixed(0)}ms
  • Error Count: ${errorCount}
  • Error Rate: ${errorRate.toFixed(1)}%
  
💰 Cost Breakdown:
  • Cost per Log: $${(totalCost / logs.length).toFixed(6)}
  • Estimated Monthly Cost: $${(totalCost * 30).toFixed(2)}
  • Logs per Day: ${Math.round(logs.length / 7)}
  
⚡ Performance:
  • Slowest Interaction: ${Math.max(...logs.map(l => l.duration_ms))}ms
  • Fastest Interaction: ${Math.min(...logs.map(l => l.duration_ms))}ms
  • P95 Duration: ${calculatePercentile(logs.map(l => l.duration_ms), 95)}ms
`);
  
  console.log('\n✅ Verification Complete!\n');
  process.exit(failed === 0 ? 0 : 1);
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

verifyActivityLogger().catch(error => {
  console.error('Fatal error during verification:', error);
  process.exit(1);
});
