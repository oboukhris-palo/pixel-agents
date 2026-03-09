#!/usr/bin/env node
/**
 * Test AI Logger Integration - Option A Manual Integration
 * 
 * This script tests the AI Activity Logger integration to ensure
 * it captures agent interactions correctly.
 */

const { startAgentLogging, logAgentWork, logImplementationWork } = require('./agent-integration');
const fs = require('fs');
const path = require('path');

async function testBasicLogging() {
  console.log('🧪 Testing basic agent logging...');
  
  try {
    await logAgentWork(
      'test-agent',
      'Test user prompt for basic logging',
      async (logger) => {
        // Simulate decision gate
        logger.logDecision('option-selection', {
          optionsPresented: ['Option A', 'Option B', 'Option C'],
          selectedOption: 'Option B',
          rationale: 'Testing decision logging'
        });
        
        // Simulate tool usage
        logger.logTool('create_file', { filePath: '/test/file.md' }, 'success');
        
        return { status: 'success', action: 'basic-logging-test' };
      },
      { referencedFiles: ['/docs/test/file.md'] }
    );
    
    console.log('✅ Basic logging test passed');
  } catch (error) {
    console.error('❌ Basic logging test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testImplementationLogging() {
  console.log('🧪 Testing implementation workflow logging...');
  
  try {
    await logImplementationWork(
      'test-dev-lead',
      'Create implementation plan for US-TEST-001',
      'US-TEST-001',
      'implementation_planning',
      async (logger) => {
        // Simulate document update
        logger.logDocumentUpdate('implementation_plan', '/docs/user-stories/US-TEST-001/plan.md', 'US-TEST-001', 'create');
        
        // Simulate handoff
        logger.logHandoff('tdd-orchestrator', {
          documentsUpdated: ['/docs/user-stories/US-TEST-001/plan.md'],
          userStoryRef: 'US-TEST-001',
          nextActions: ['Execute TDD cycles']
        });
        
        return { planCreated: true };
      },
      { referencedFiles: ['/docs/user-stories/US-TEST-001/US-TEST-001.md'] }
    );
    
    console.log('✅ Implementation logging test passed');
  } catch (error) {
    console.error('❌ Implementation logging test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testTDDLogging() {
  console.log('🧪 Testing TDD cycle logging...');
  
  try {
    const logger = startAgentLogging('test-tdd-red');
    
    logger.startWork('Writing failing tests for database layer', {
      userStoryRef: 'US-TEST-001',
      phase: 'red'
    });
    
    // Simulate TDD cycle
    logger.logTDDCycle('database', 'red', {
      testsWritten: ['UserModel.test.ts', 'UserRepository.test.ts'],
      testsPassingCount: 0,
      testsTotalCount: 2,
      filesModified: ['tests/UserModel.test.ts', 'tests/UserRepository.test.ts']
    });
    
    logger.endWork('Failing tests written for database layer', {
      actions: ['created_tests', 'verified_failures'],
      filesModified: ['tests/UserModel.test.ts', 'tests/UserRepository.test.ts']
    });
    
    console.log('✅ TDD logging test passed');
  } catch (error) {
    console.error('❌ TDD logging test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testSprintLogging() {
  console.log('🧪 Testing sprint planning logging...');
  
  try {
    const logger = startAgentLogging('test-pm');
    
    logger.startWork('Planning Sprint 1 with 8 available stories', {
      userStoryRef: 'SPRINT_PLANNING',
      phase: 'sprint_planning'
    });
    
    // Simulate sprint decision
    logger.logSprintDecision(1, 'balanced', {
      storyCount: 5,
      totalStoryPoints: 21,
      selectedStories: ['US-001', 'US-002', 'US-003', 'US-004', 'US-005'],
      rationale: 'Balanced approach with good velocity'
    });
    
    logger.endWork('Sprint planning complete', {
      actions: ['selected_stories', 'created_sprint_plan'],
      filesModified: ['/docs/user-stories/current-sprint.md']
    });
    
    console.log('✅ Sprint logging test passed');
  } catch (error) {
    console.error('❌ Sprint logging test failed:', error.message);
    return false;
  }
  
  return true;
}

function checkLogFiles() {
  console.log('📁 Checking generated log files...');
  
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(__dirname, '../logs/raw', `activity-${today}.jsonl`);
  
  if (!fs.existsSync(logFile)) {
    console.error('❌ No log file generated:', logFile);
    return false;
  }
  
  const logContent = fs.readFileSync(logFile, 'utf8');
  const logLines = logContent.trim().split('\n').filter(line => line.trim());
  
  console.log(`📊 Generated ${logLines.length} log entries`);
  
  if (logLines.length === 0) {
    console.error('❌ Log file is empty');
    return false;
  }
  
  // Validate log format
  try {
    for (const line of logLines) {
      const entry = JSON.parse(line);
      if (!entry.timestamp || !entry.agent || !entry.user_prompt) {
        throw new Error('Invalid log entry format');
      }
    }
    console.log('✅ All log entries have valid format');
  } catch (error) {
    console.error('❌ Invalid log format:', error.message);
    return false;
  }
  
  return true;
}

async function runAllTests() {
  console.log('🚀 Starting AI Logger Integration Tests\n');
  
  const tests = [
    testBasicLogging,
    testImplementationLogging,
    testTDDLogging,
    testSprintLogging
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Add spacing between tests
  }
  
  // Check log files
  const logCheck = checkLogFiles();
  if (logCheck) {
    passed++;
  } else {
    failed++;
  }
  
  console.log('\n📋 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! AI Logger integration is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Update your agent templates with the logging integration');
    console.log('2. Run npm run weekly-analysis to see activity reports');
    console.log('3. Check .github/logs/raw/ for generated log files');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
    console.log('\nTroubleshooting:');
    console.log('1. Ensure npm install was run in .github/ai-logger/');
    console.log('2. Check write permissions on .github/logs/ directory');
    console.log('3. Verify TypeScript compilation works: npm run build');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});