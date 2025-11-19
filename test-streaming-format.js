#!/usr/bin/env node

/**
 * Test stream format - verify AI SDK data stream format
 */

const BASE_URL = 'http://localhost:3000';

async function testStreamFormat() {
  console.log('🧪 Testing stream format...\n');

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
            content: 'Say exactly: "test 1 2 3"',
          },
        ],
        model: 'cerebras/gpt-oss-120b',
        conversationId: null,
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ FAILED: ${errorText}`);
      process.exit(1);
    }

    // Read raw stream bytes
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    console.log('📦 Raw chunks received:\n');

    let chunkNum = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      chunkNum++;

      console.log(`Chunk ${chunkNum}:`);
      console.log(`  Length: ${chunk.length} bytes`);
      console.log(`  Content: ${JSON.stringify(chunk)}`);
      console.log(`  First 100 chars: ${chunk.substring(0, 100)}`);
      console.log('');

      // Check if it matches AI SDK format (starts with "0:")
      if (chunk.includes('0:')) {
        console.log('  ✅ Contains AI SDK format marker (0:)');
      }
    }

    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testStreamFormat();
