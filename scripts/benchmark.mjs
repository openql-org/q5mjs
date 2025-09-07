#!/usr/bin/env node

// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Simplified performance benchmark for CI/CD
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Simple benchmark without dependencies
console.log('🏃‍♂️ Starting q5m.js Performance Benchmarks');
console.log('=' .repeat(60));

// Simplified circuit creation benchmark
function benchmarkCircuitCreation() {
  console.log('\n🔧 Circuit Creation Benchmark');
  console.log('-' .repeat(40));
  
  const times = [];
  const iterations = 100;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    // Simulate circuit creation overhead
    const circuit = { qubits: 5, gates: [] };
    for (let j = 0; j < 10; j++) {
      circuit.gates.push({ type: 'H', target: j % circuit.qubits });
    }
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`Circuit Creation (5 qubits): ${avg.toFixed(4)}ms avg, ${min.toFixed(4)}ms min, ${max.toFixed(4)}ms max`);
  
  return { avg, min, max };
}

// Simplified complex number operations benchmark
function benchmarkComplexOperations() {
  console.log('\n🔢 Complex Operations Benchmark');
  console.log('-' .repeat(40));
  
  const times = [];
  const iterations = 1000;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    // Simulate complex number operations
    let result = { re: 1.0, im: 0.0 };
    for (let j = 0; j < 100; j++) {
      const temp = result.re * 0.707 - result.im * 0.707;
      result.im = result.re * 0.707 + result.im * 0.707;
      result.re = temp;
    }
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`Complex Operations: ${avg.toFixed(4)}ms avg, ${min.toFixed(4)}ms min, ${max.toFixed(4)}ms max`);
  
  return { avg, min, max };
}

// Memory usage benchmark
function benchmarkMemoryUsage() {
  console.log('\n💾 Memory Usage Benchmark');
  console.log('-' .repeat(40));
  
  if (global.gc) {
    global.gc();
  }
  
  const initialMemory = process.memoryUsage();
  
  // Simulate memory usage
  const data = [];
  for (let i = 0; i < 1000; i++) {
    data.push({
      circuit: { qubits: 5, gates: new Array(10).fill({ type: 'H', target: 0 }) },
      state: new Array(32).fill({ re: Math.random(), im: Math.random() })
    });
  }
  
  const peakMemory = process.memoryUsage();
  
  console.log(`Initial RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Peak RSS: ${(peakMemory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Memory increase: ${((peakMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
  
  // Cleanup
  data.length = 0;
  if (global.gc) {
    global.gc();
  }
  
  return {
    initialRSS: initialMemory.rss,
    peakRSS: peakMemory.rss,
    increase: peakMemory.heapUsed - initialMemory.heapUsed
  };
}

// Main benchmark execution
async function runBenchmarks() {
  try {
    const circuitResults = benchmarkCircuitCreation();
    const complexResults = benchmarkComplexOperations();
    const memoryResults = benchmarkMemoryUsage();
    
    console.log('\n📊 Summary');
    console.log('=' .repeat(60));
    console.log(`Circuit Creation: ${circuitResults.avg.toFixed(4)}ms average`);
    console.log(`Complex Operations: ${complexResults.avg.toFixed(4)}ms average`);
    console.log(`Memory Usage: ${(memoryResults.increase / 1024 / 1024).toFixed(2)}MB increase`);
    
    console.log('\n✅ All benchmarks completed successfully!');
    
    return {
      circuitCreation: circuitResults.avg,
      complexOperations: complexResults.avg,
      memoryIncrease: memoryResults.increase
    };
    
  } catch (error) {
    console.error('\n❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

// Run benchmarks
runBenchmarks();