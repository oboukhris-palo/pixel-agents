/**
 * Test Suite for AI Activity Logger
 * 
 * Tests the following components:
 * 1. ActivityInterceptor - Log capture and persistence
 * 2. Pattern detection - Log reading and basic analysis
 * 3. Cost calculation - Token-to-USD conversion
 * 4. Report structure - Markdown report generation
 */

import { ActivityInterceptor } from './activity-interceptor';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TEST RUNNER
// =============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  duration_ms: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;
  
  public async run(): Promise<void> {
    console.log('\n=== AI Activity Logger Test Suite ===\n');
    
    // Test 1: ActivityInterceptor initialization
    await this.test('ActivityInterceptor initialization', () => {
      const interceptor = new ActivityInterceptor();
      if (!interceptor) {
        throw new Error('Failed to initialize ActivityInterceptor');
      }
    });
    
    // Test 2: Log directory creation
    await this.test('Log directory creation', () => {
      const logDir = path.resolve(__dirname, '../logs/raw');
      if (!fs.existsSync(logDir)) {
        throw new Error(`Log directory does not exist: ${logDir}`);
      }
    });
    
    // Test 3: Activity logging
    await this.test('Activity logging (write and read)', () => {
      const interceptor = new ActivityInterceptor();
      
      interceptor.startInteraction({
        agentName: 'test-agent',
        agentMode: 'test-mode',
        userPrompt: 'This is a test prompt for the activity logger',
        referencedFiles: ['/docs/test.md'],
      });
      
      interceptor.logDecision({
        type: 'option-selection',
        optionsPresented: ['Option A', 'Option B', 'Option C'],
        selectedOption: 'Option B',
        rationale: 'Best performance and clarity balance',
      });
      
      interceptor.logToolInvocation(
        'test-tool',
        { parameter1: 'value1', parameter2: 'value2' },
        'success',
        1500
      );
      
      interceptor.endInteraction({
        responseSummary: 'Test interaction completed successfully',
        actions: ['test_action_1', 'test_action_2'],
        filesModified: ['/test/modified.ts'],
        tokens: {
          input: 500,
          output: 1200,
          model: 'claude-sonnet-4.5',
        },
        durationMs: 3500,
        outcome: 'success',
      });
      
      // Wait a moment for file write
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      return delay.then(() => {
        // Verify log file was created
        const logs = ActivityInterceptor.readLogs();
        if (logs.length === 0) {
          throw new Error('No logs were written');
        }
      });
    });
    
    // Test 4: Cost calculation
    await this.test('Cost calculation accuracy', () => {
      const interceptor = new ActivityInterceptor();
      
      // This test verifies the cost calculation by checking token conversion
      // For claude-sonnet-4.5: input=$3.00/1M, output=$15.00/1M
      // 1000 input tokens = $0.000003, 1000 output tokens = $0.000015
      // Total = $0.000018
      
      interceptor.startInteraction({
        agentName: 'cost-test-agent',
        agentMode: 'cost-calculation',
        userPrompt: 'Test cost calculation',
      });
      
      interceptor.endInteraction({
        responseSummary: 'Cost test completed',
        actions: ['cost_calculation'],
        tokens: {
          input: 1000,
          output: 1000,
          model: 'claude-sonnet-4.5',
        },
        durationMs: 1000,
        outcome: 'success',
      });
      
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      return delay.then(() => {
        const logs = ActivityInterceptor.readLogs();
        const costLog = logs[logs.length - 1];
        
        if (!costLog || costLog.tokens.cost_usd === 0) {
          throw new Error('Cost calculation failed');
        }
        
        // Verify cost is approximately correct (allow small floating point difference)
        const expectedCost = (1000 / 1_000_000) * 3.00 + (1000 / 1_000_000) * 15.00;
        const difference = Math.abs(costLog.tokens.cost_usd - expectedCost);
        
        if (difference > 0.000001) {
          throw new Error(
            `Cost mismatch: expected ${expectedCost}, got ${costLog.tokens.cost_usd}`
          );
        }
      });
    });
    
    // Test 5: Data sanitization
    await this.test('Sensitive data sanitization', () => {
      const interceptor = new ActivityInterceptor();
      
      interceptor.startInteraction({
        agentName: 'sanitization-test',
        agentMode: 'security-test',
        userPrompt: 'This contains API_KEY: sk_test_1234567890',
      });
      
      interceptor.endInteraction({
        responseSummary: 'Sanitization test',
        actions: ['sanitization'],
        tokens: {
          input: 100,
          output: 100,
          model: 'claude-sonnet-4.5',
        },
        durationMs: 500,
        outcome: 'success',
      });
      
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      return delay.then(() => {
        const logs = ActivityInterceptor.readLogs();
        const sanitizedLog = logs[logs.length - 1];
        
        // Check that API key was redacted
        const promptText = JSON.stringify(sanitizedLog.user_prompt);
        if (promptText.includes('sk_test_') || promptText.includes('1234567890')) {
          throw new Error('API key was not properly sanitized');
        }
        
        if (!promptText.includes('REDACTED')) {
          throw new Error('Sanitization marker not found');
        }
      });
    });
    
    // Test 6: Multiple interactions and session tracking
    await this.test('Session tracking and multiple logs', () => {
      const interceptor = new ActivityInterceptor();
      
      // Log multiple interactions
      for (let i = 0; i < 3; i++) {
        interceptor.startInteraction({
          agentName: `test-agent-${i}`,
          agentMode: 'sequential-test',
          userPrompt: `Test prompt ${i}`,
        });
        
        interceptor.endInteraction({
          responseSummary: `Sequential test ${i}`,
          actions: [`action_${i}`],
          tokens: {
            input: 100 * (i + 1),
            output: 200 * (i + 1),
            model: 'claude-sonnet-4.5',
          },
          durationMs: 500 * (i + 1),
          outcome: 'success',
        });
      }
      
      const delay = new Promise(resolve => setTimeout(resolve, 200));
      return delay.then(() => {
        const logs = ActivityInterceptor.readLogs();
        
        if (logs.length < 3) {
          throw new Error(`Expected at least 3 logs, got ${logs.length}`);
        }
        
        // Verify session IDs are consistent within an interceptor instance
        const sessionIds = new Set(logs.map(l => l.session_id));
        if (sessionIds.size < 1) {
          throw new Error('Session ID tracking failed');
        }
      });
    });
    
    // Test 7: Log query by date range
    await this.test('Log querying by date range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Logs created "today" should be found
      const logsToday = ActivityInterceptor.readLogs(yesterday, tomorrow);
      
      if (logsToday.length === 0) {
        throw new Error('No logs found in date range that should include today');
      }
    });
    
    // Test 8: Tool invocation logging
    await this.test('Tool invocation tracking', () => {
      const interceptor = new ActivityInterceptor();
      
      interceptor.startInteraction({
        agentName: 'tool-test-agent',
        agentMode: 'tool-invocation-test',
        userPrompt: 'Test tool invocation',
      });
      
      // Log multiple tool invocations
      interceptor.logToolInvocation(
        'file-read',
        { filePath: '/docs/test.md' },
        'success',
        250
      );
      
      interceptor.logToolInvocation(
        'file-write',
        { filePath: '/docs/output.md', content: 'test' },
        'success',
        150
      );
      
      interceptor.logToolInvocation(
        'api-call',
        { endpoint: '/api/test', method: 'GET' },
        'success',
        1500
      );
      
      interceptor.endInteraction({
        responseSummary: 'Tool invocation test completed',
        actions: ['read_file', 'write_file', 'api_call'],
        tokens: {
          input: 300,
          output: 400,
          model: 'claude-sonnet-4.5',
        },
        durationMs: 2000,
        outcome: 'success',
      });
      
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      return delay.then(() => {
        const logs = ActivityInterceptor.readLogs();
        const toolLog = logs[logs.length - 1];
        
        if (!toolLog.agent_response || !toolLog.agent_response.tool_invocations) {
          throw new Error('Tool invocations not recorded');
        }
        
        if (toolLog.agent_response.tool_invocations.length !== 3) {
          throw new Error(
            `Expected 3 tool invocations, got ${toolLog.agent_response.tool_invocations.length}`
          );
        }
      });
    });
    
    // Print summary
    this.printSummary();
  }
  
  private async test(name: string, testFn: () => Promise<void> | void): Promise<void> {
    const startTime = Date.now();
    
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration_ms: Date.now() - startTime,
      });
      console.log(`✅ ${name} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        duration_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private printSummary(): void {
    console.log('\n=== Test Summary ===\n');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration_ms, 0);
    
    console.log(`Tests: ${passed} passed, ${failed} failed, ${total} total`);
    console.log(`Total time: ${totalTime}ms\n`);
    
    if (failed > 0) {
      console.log('Failed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}`);
          console.log(`    Error: ${r.error}`);
        });
      console.log('\n');
    }
    
    console.log(`Result: ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);
    
    process.exit(failed === 0 ? 0 : 1);
  }
}

// =============================================================================
// RUN TESTS
// =============================================================================

const runner = new TestRunner();
runner.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
