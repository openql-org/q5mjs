#!/usr/bin/env node

/**
 * Memory usage test for q5m.js
 * Tests memory consumption for various quantum circuit sizes
 */

import { Circuit } from '../dist/index.mjs';

// Helper to format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to get current memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  };
}

// Test memory usage for different circuit sizes
async function testMemoryUsage() {
  console.log('='.repeat(60));
  console.log('Q5M.js Memory Usage Test');
  console.log('='.repeat(60));
  console.log();

  const testCases = [
    { qubits: 1, gates: 10 },
    { qubits: 2, gates: 20 },
    { qubits: 3, gates: 30 },
    { qubits: 4, gates: 40 },
    { qubits: 5, gates: 50 },
    { qubits: 6, gates: 60 },
    { qubits: 7, gates: 70 },
    { qubits: 8, gates: 80 },
    { qubits: 10, gates: 100 },
    { qubits: 12, gates: 120 },
    { qubits: 14, gates: 140 },
    { qubits: 16, gates: 160 }
  ];

  console.log('Initial Memory Usage:');
  const initialMemory = getMemoryUsage();
  console.log(`  RSS: ${formatBytes(initialMemory.rss)}`);
  console.log(`  Heap Used: ${formatBytes(initialMemory.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(initialMemory.heapTotal)}`);
  console.log();

  const results = [];

  for (const testCase of testCases) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const beforeMemory = getMemoryUsage();
    
    try {
      // Create and execute circuit
      const startTime = Date.now();
      const circuit = new Circuit(testCase.qubits);
      
      // Add random gates
      for (let i = 0; i < testCase.gates; i++) {
        const gateType = Math.floor(Math.random() * 4);
        const qubit = Math.floor(Math.random() * testCase.qubits);
        
        switch (gateType) {
          case 0:
            circuit.h(qubit);
            break;
          case 1:
            circuit.x(qubit);
            break;
          case 2:
            circuit.z(qubit);
            break;
          case 3:
            if (testCase.qubits > 1) {
              const target = (qubit + 1) % testCase.qubits;
              circuit.cnot(qubit, target);
            } else {
              circuit.y(qubit);
            }
            break;
        }
      }
      
      // Execute the circuit
      const result = circuit.execute();
      const executionTime = Date.now() - startTime;
      
      const afterMemory = getMemoryUsage();
      
      const memoryDelta = {
        rss: afterMemory.rss - beforeMemory.rss,
        heapUsed: afterMemory.heapUsed - beforeMemory.heapUsed,
        heapTotal: afterMemory.heapTotal - beforeMemory.heapTotal
      };
      
      // Calculate state vector size
      const stateVectorSize = Math.pow(2, testCase.qubits) * 16; // Complex number = 16 bytes
      
      results.push({
        qubits: testCase.qubits,
        gates: testCase.gates,
        stateVectorSize: stateVectorSize,
        memoryDelta: memoryDelta,
        executionTime: executionTime,
        success: true
      });
      
      console.log(`Test Case: ${testCase.qubits} qubits, ${testCase.gates} gates`);
      console.log(`  State Vector Size (theoretical): ${formatBytes(stateVectorSize)}`);
      console.log(`  Memory Delta (RSS): ${formatBytes(memoryDelta.rss)}`);
      console.log(`  Memory Delta (Heap): ${formatBytes(memoryDelta.heapUsed)}`);
      console.log(`  Execution Time: ${executionTime}ms`);
      console.log();
      
    } catch (error) {
      console.log(`Test Case: ${testCase.qubits} qubits, ${testCase.gates} gates`);
      console.log(`  Error: ${error.message}`);
      console.log();
      
      results.push({
        qubits: testCase.qubits,
        gates: testCase.gates,
        success: false,
        error: error.message
      });
    }
    
    // Small delay to allow memory to settle
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  console.log(`Successful Tests: ${successfulTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const maxQubits = Math.max(...successfulTests.map(r => r.qubits));
    console.log(`Maximum Qubits Tested: ${maxQubits}`);
    
    const avgExecutionTime = successfulTests.reduce((sum, r) => sum + r.executionTime, 0) / successfulTests.length;
    console.log(`Average Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
  }
  
  console.log();
  console.log('Final Memory Usage:');
  const finalMemory = getMemoryUsage();
  console.log(`  RSS: ${formatBytes(finalMemory.rss)}`);
  console.log(`  Heap Used: ${formatBytes(finalMemory.heapUsed)}`);
  console.log(`  Heap Total: ${formatBytes(finalMemory.heapTotal)}`);
  console.log();
  
  const totalMemoryIncrease = finalMemory.rss - initialMemory.rss;
  console.log(`Total Memory Increase: ${formatBytes(totalMemoryIncrease)}`);
  process.exit(0);
}

// Run the test
testMemoryUsage().catch(console.error);
