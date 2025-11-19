#!/usr/bin/env node

/**
 * Automated test script for chat-v2 API endpoint
 * Tests basic streaming functionality without tool calling
 */

const BASE_URL = 'http://localhost:3000';

async function testChatAPI() {
  console.log('🧪 Testing chat-v2 API endpoint...\n');

  const testCases = [
    {
      name: 'FREIRE FAST (Cerebras)',
      model: 'cerebras/gpt-oss-120b',
      message: 'Say "Hello from Cerebras" and nothing else.',
    },
    {
      name: 'FREIRE LITE (DeepInfra)',
      model: 'openai/gpt-oss-20b',
      message: 'Say "Hello from DeepInfra" and nothing else.',
    },
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Model: ${testCase.model}`);
    console.log(`   Message: "${testCase.message}"\n`);

    try {
      const response = await fetch(`${BASE_URL}/api/chat-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: testCase.message,
            },
          ],
          model: testCase.model,
          conversationId: null, // No conversation ID for testing
        }),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   ❌ FAILED: ${errorText}`);
        failedTests++;
        continue;
      }

      // Check if response is a stream
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/')) {
        console.log(`   ❌ FAILED: Expected streaming response, got ${contentType}`);
        failedTests++;
        continue;
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        chunkCount++;
      }

      console.log(`   Chunks received: ${chunkCount}`);
      console.log(`   Response length: ${fullResponse.length} bytes`);
      console.log(`   First 200 chars: ${fullResponse.substring(0, 200)}...`);

      if (fullResponse.length > 0) {
        console.log(`   ✅ PASSED: Received streaming response`);
        passedTests++;
      } else {
        console.log(`   ❌ FAILED: Empty response`);
        failedTests++;
      }

    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log(`   Error stack: ${error.stack}`);
      failedTests++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   Total: ${passedTests + failedTests}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
testChatAPI().catch((error) => {
  console.error('💥 Test script crashed:', error);
  process.exit(1);
});
