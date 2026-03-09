/**
 * AI Activity Logger Simulation
 * 
 * Simulates a week of AI agent interactions to test:
 * - Pattern detection
 * - Cost tracking
 * - Report generation
 */

import { ActivityInterceptor } from './activity-interceptor';

const AGENTS = ['orchestrator', 'po-agent', 'ba-agent', 'architect', 'dev-lead', 'tdd-agent'];
const PROMPTS = [
  'Review the requirements document and provide feedback',
  'Create user story acceptance criteria based on requirements',
  'Design the database schema for user authentication',
  'Implement the authentication API endpoints',
  'Write unit tests for the login endpoint',
  'Optimize the query performance for user lookups',
  'Design the frontend login component',
  'Review code for security vulnerabilities',
  'Refactor the authentication service for clarity',
  'Generate documentation for the API',
];

async function simulateWeekOfActivity(): Promise<void> {
  console.log('\n=== AI Activity Logger - Simulation ===\n');
  console.log('Simulating a week of agent interactions...\n');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  let logCount = 0;
  
  // Simulate 50 interactions over the week
  for (let day = 0; day < 7; day++) {
    for (let interaction = 0; interaction < 8; interaction++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      currentDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
      const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
      const inputTokens = 200 + Math.floor(Math.random() * 3000);
      const outputTokens = 500 + Math.floor(Math.random() * 4000);
      
      // Create interceptor for this interaction
      const interceptor = new ActivityInterceptor();
      
      interceptor.startInteraction({
        agentName: agent,
        agentMode: 'development',
        userPrompt: prompt,
        referencedFiles: [
          '/docs/prd/requirements.md',
          '/docs/prd/tech-spec.md',
          '/src/auth/login.ts',
        ],
      });
      
      // Log a decision (70% chance)
      if (Math.random() < 0.7) {
        interceptor.logDecision({
          type: 'option-selection',
          optionsPresented: [
            'Conservative approach',
            'Balanced approach',
            'Aggressive approach',
          ],
          selectedOption: 'Balanced approach',
          rationale: 'Best risk/benefit tradeoff for this task',
        });
      }
      
      // Log tool invocations (variable count)
      const toolCount = Math.floor(Math.random() * 4);
      for (let i = 0; i < toolCount; i++) {
        const tools = [
          'read_file',
          'write_file',
          'grep_search',
          'run_in_terminal',
          'replace_string_in_file',
        ];
        interceptor.logToolInvocation(
          tools[Math.floor(Math.random() * tools.length)],
          { filePath: '/src/example.ts', action: 'operation' },
          'success',
          Math.floor(Math.random() * 2000)
        );
      }
      
      // End interaction
      const duration = 500 + Math.floor(Math.random() * 5000);
      interceptor.endInteraction({
        responseSummary: `Completed ${agent} task: ${prompt}`,
        actions: ['analysis', 'planning', 'implementation', 'review'],
        filesModified: ['/src/auth/login.ts', '/tests/auth.test.ts'],
        tokens: {
          input: inputTokens,
          output: outputTokens,
          model: 'claude-sonnet-4.5',
        },
        durationMs: duration,
        outcome: Math.random() < 0.95 ? 'success' : 'error',
      });
      
      logCount++;
      if (logCount % 10 === 0) {
        process.stdout.write(`\rLogged ${logCount}/56 interactions...`);
      }
    }
  }
  
  console.log(`\n✅ Simulated ${logCount} interactions\n`);
  
  // Give file system time to sync
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Read and analyze logs
  const logs = ActivityInterceptor.readLogs();
  console.log(`📊 Total logs in system: ${logs.length}`);
  console.log(`📈 Logs written today: ${logs.filter(l => {
    const logDate = new Date(l.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length}`);
  
  // Calculate statistics
  const totalTokens = logs.reduce((sum, log) => sum + log.tokens.total, 0);
  const totalCost = logs.reduce((sum, log) => sum + log.tokens.cost_usd, 0);
  const avgDuration = logs.reduce((sum, log) => sum + log.duration_ms, 0) / logs.length;
  
  console.log(`\n📊 Statistics:
  - Total Tokens: ${totalTokens.toLocaleString()}
  - Total Cost: $${totalCost.toFixed(4)}
  - Avg Duration: ${avgDuration.toFixed(0)}ms
  - Error Rate: ${((logs.filter(l => l.outcome === 'error').length / logs.length) * 100).toFixed(1)}%`);
  
  // Agent breakdown
  const agentStats: Record<string, { count: number; tokens: number; cost: number }> = {};
  
  logs.forEach(log => {
    const agentName = log.agent?.name || 'unknown';
    if (!agentStats[agentName]) {
      agentStats[agentName] = { count: 0, tokens: 0, cost: 0 };
    }
    agentStats[agentName].count++;
    agentStats[agentName].tokens += log.tokens.total;
    agentStats[agentName].cost += log.tokens.cost_usd;
  });
  
  console.log(`\n📈 Agent Breakdown:`);
  Object.entries(agentStats)
    .sort(([, a], [, b]) => b.cost - a.cost)
    .slice(0, 5)
    .forEach(([agent, stats]) => {
      console.log(`  - ${agent}: ${stats.count} interactions, ${stats.tokens.toLocaleString()} tokens, $${stats.cost.toFixed(4)}`);
    });
  
  console.log(`\n✅ Simulation complete! Logs ready for analysis.\n`);
}

simulateWeekOfActivity().catch(error => {
  console.error('Error during simulation:', error);
  process.exit(1);
});
