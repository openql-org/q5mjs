#!/usr/bin/env node

/**
 * Performance Profiling Script for q5m.js
 * Identifies bottlenecks and optimization opportunities
 */

import { performance } from 'perf_hooks';
import { Circuit } from '../dist/index.mjs';

/**
 * Measure execution time of a function
 */
function benchmark(name, fn, iterations = 1) {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  
  console.log(`${name.padEnd(40)} | ${avgTime.toFixed(4)}ms avg | ${totalTime.toFixed(4)}ms total (${iterations} iter)`);
  
  return { avgTime, totalTime };
}

/**
 * Memory usage tracking
 */
function measureMemory(name, fn) {
  const memBefore = process.memoryUsage();
  const result = fn();
  const memAfter = process.memoryUsage();
  
  const heapUsed = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024; // MB
  const heapTotal = (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024; // MB
  
  console.log(`${name.padEnd(40)} | Heap: ${heapUsed.toFixed(2)}MB | Total: ${heapTotal.toFixed(2)}MB`);
  
  return { result, heapUsed, heapTotal };
}

console.log('🔍 q5m.js Performance Profile');
console.log('=' .repeat(70));
console.log();

// 1. Circuit Creation Performance
console.log('📊 Circuit Creation Performance');
console.log('-'.repeat(70));

for (const qubits of [4, 8, 12, 16, 20]) {
  benchmark(`Create ${qubits}-qubit circuit`, () => {
    const circuit = new Circuit(qubits);
  }, 1000);
}

console.log();

// 2. Gate Application Performance
console.log('⚡ Gate Application Performance');
console.log('-'.repeat(70));

const testCircuit = new Circuit(16);

benchmark('Single H gate', () => {
  const circuit = new Circuit(16);
  circuit.h(0);
}, 1000);

benchmark('Single CNOT gate', () => {
  const circuit = new Circuit(16);
  circuit.cnot(0, 1);
}, 1000);

benchmark('100 H gates', () => {
  const circuit = new Circuit(16);
  for (let i = 0; i < 100; i++) {
    circuit.h(i % 16);
  }
}, 100);

benchmark('100 CNOT gates', () => {
  const circuit = new Circuit(16);
  for (let i = 0; i < 100; i++) {
    circuit.cnot(i % 16, (i + 1) % 16);
  }
}, 100);

console.log();

// 3. Circuit Execution Performance
console.log('🚀 Circuit Execution Performance');
console.log('-'.repeat(70));

for (const qubits of [8, 12, 16, 20]) {
  benchmark(`Execute ${qubits}-qubit circuit`, () => {
    const circuit = new Circuit(qubits);
    circuit.h(0).cnot(0, 1).x(2);
    circuit.execute();
  }, qubits <= 16 ? 100 : 10);
}

console.log();

// 4. State Vector Operations
console.log('📈 State Vector Operations');
console.log('-'.repeat(70));

for (const qubits of [8, 12, 16, 18]) {
  const circuit = new Circuit(qubits);
  circuit.h(0).cnot(0, 1);
  const state = circuit.execute().state;
  
  benchmark(`Get probabilities (${qubits} qubits)`, () => {
    state.probabilities();
  }, 100);
  
  benchmark(`Get state vector (${qubits} qubits)`, () => {
    state.amplitudes();
  }, 100);
}

console.log();

// 5. Measurement Performance
console.log('🎯 Measurement Performance');
console.log('-'.repeat(70));

for (const qubits of [8, 12, 16]) {
  benchmark(`Measure all qubits (${qubits} qubits)`, () => {
    const circuit = new Circuit(qubits);
    circuit.h(0).cnot(0, 1);
    const state = circuit.execute().state;
    // Measure all qubits individually
    for (let i = 0; i < qubits; i++) {
      circuit.measure(i);
    }
  }, 100);
}

console.log();

// 6. Memory Usage Analysis
console.log('💾 Memory Usage Analysis');
console.log('-'.repeat(70));

for (const qubits of [8, 12, 16, 20]) {
  measureMemory(`${qubits}-qubit circuit creation`, () => {
    const circuit = new Circuit(qubits);
    circuit.h(0).cnot(0, 1).x(2);
    const state = circuit.execute().state;
    // Return the state object size as an estimate
    return { 
      stateSize: state.amplitudes ? state.amplitudes().length : Math.pow(2, qubits),
      qubits: qubits
    };
  });
}

console.log();

// 7. Converter Performance
console.log('🔄 Converter Performance');
console.log('-'.repeat(70));

try {
  const { exportToQiskit } = await import('../dist/index.mjs');
  
  const testCircuit12 = new Circuit(12);
  testCircuit12.h(0).cnot(0, 1).x(2).cnot(1, 2);
  testCircuit12.execute();
  
  benchmark('Export to Qiskit (12 qubits)', () => {
    exportToQiskit(testCircuit12);
  }, 100);
  
} catch (error) {
  console.log('⚠️  Converter benchmarks skipped (module not found)');
}

console.log();

// 8. Optimization Comparison
console.log('⚙️  Optimization Impact Analysis');
console.log('-'.repeat(70));

// Dense vs Sparse comparison - simplified since we cannot force mode
for (const qubits of [12, 16, 20]) {
  // Run same circuit twice to compare performance
  const result1 = benchmark(`Execution 1 (${qubits} qubits)`, () => {
    const circuit = new Circuit(qubits);
    circuit.h(0).cnot(0, 1);
    circuit.execute();
  }, 10);
  
  const result2 = benchmark(`Execution 2 (${qubits} qubits)`, () => {
    const circuit = new Circuit(qubits);
    circuit.h(0).cnot(0, 1);
    circuit.execute();
  }, 10);
  
  const variance = Math.abs(result1.avgTime - result2.avgTime) / result1.avgTime;
  console.log(`${'Performance variance'.padEnd(40)} | ${(variance * 100).toFixed(2)}%`);
}

console.log();
console.log('✅ Performance profiling complete!');
console.log();
console.log('🔍 Key Metrics to Monitor:');
console.log('  - Circuit creation time should be O(1)');
console.log('  - Gate application should scale linearly');
console.log('  - Memory usage should be optimal for sparse states');
console.log('  - Execution time should benefit from optimizations');
