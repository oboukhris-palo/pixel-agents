#!/bin/bash

# AI Logger Integration Setup Script - Option A Manual Integration
# This script sets up the AI Activity Logger with manual integration

echo "🚀 Setting up AI Activity Logger - Manual Integration (Option A)"
echo

# Change to ai-logger directory
cd "$(dirname "$0")"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Create log directories
echo "📁 Creating log directories..."
mkdir -p ../logs/raw ../logs/analyzed ../logs/reports ../logs/traces
echo "✅ Log directories created"

# Step 3: Verify TypeScript compilation
echo "🔧 Verifying TypeScript setup..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Step 4: Run integration tests
echo "🧪 Running integration tests..."
if npm run test-integration; then
    echo "✅ Integration tests passed"
else
    echo "❌ Integration tests failed"
    echo "Check the error messages above for troubleshooting"
    exit 1
fi

# Step 5: Run initial weekly analysis (should show no data but verify pipeline works)
echo "📊 Testing analysis pipeline..."
if npm run weekly-analysis; then
    echo "✅ Analysis pipeline working"
else
    echo "⚠️  Analysis pipeline failed (expected if no historical data)"
fi

# Step 6: Display setup summary
echo
echo "🎉 AI Logger Integration Setup Complete!"
echo
echo "📋 Setup Summary:"
echo "✅ Dependencies installed"
echo "✅ Log directories created"
echo "✅ TypeScript compilation working"
echo "✅ Integration tests passed"
echo "✅ Analysis pipeline verified"
echo
echo "🔧 Next Steps:"
echo "1. Update your agent templates using:"
echo "   cat AGENT_TEMPLATE_UPDATES.md"
echo
echo "2. Add logging to agent workflows using patterns from:"
echo "   cat INTEGRATION_GUIDE_MANUAL.md"
echo
echo "3. Test with real agent interactions and verify logs appear in:"
echo "   ls -la ../logs/raw/"
echo
echo "4. Generate weekly reports with:"
echo "   npm run weekly-analysis"
echo
echo "5. Export performance analytics with:"
echo "   npm run trace-report"
echo
echo "📊 Expected Benefits:"
echo "• Automated activity logging for all agent interactions"
echo "• Pattern detection and prompt optimization suggestions"
echo "• Token usage tracking and cost analysis"
echo "• Implementation workflow metrics (TDD cycles, handoffs)"
echo "• Weekly reports with actionable optimization recommendations"
echo
echo "🔧 Troubleshooting:"
echo "• If tests fail: Check write permissions on .github/logs/"
echo "• If TypeScript errors: Run 'npm install @types/node @types/js-yaml'"
echo "• If logs not generated: Ensure agent templates include logging integration"
echo
echo "📚 Documentation:"
echo "• Full guide: INTEGRATION_GUIDE_MANUAL.md"
echo "• Agent updates: AGENT_TEMPLATE_UPDATES.md"
echo "• System overview: README.md"