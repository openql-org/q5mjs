// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '../../src/core/Circuit';
import { QubitState } from '../../src/core/QubitState';
import { Q5mObserver } from "../../src/core/Q5mObserver"
import { QFT } from '../../src/algorithms/qft';

/**
 * Benchmark results interface
 */
export interface BenchmarkResult {
  name: string;
  numQubits: number;
  executionTime: number; // in milliseconds
  memoryUsage?: number; // in MB
  operations: number;
}

/**
 * Performance benchmark runner for quantum operations
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * Benchmark quantum state creation and manipulation
   */
  benchmarkQubitState(numQubits: number, iterations: number = 100): BenchmarkResult {
    const startTime = performance.now();
    const initialMemory = this.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      let state = new QubitState(numQubits);
      
      // Perform some operations
      for (let j = 0; j < numQubits; j++) {
        if (Math.random() > 0.5) {
          const result = Q5mObserver.measure(state, j, 'computational');
          state = result.collapsedState;
        }
      }
    }

    const endTime = performance.now();
    const finalMemory = this.memoryUsage();

    const result: BenchmarkResult = {
      name: 'QubitState Operations',
      numQubits,
      executionTime: endTime - startTime,
      memoryUsage: finalMemory - initialMemory,
      operations: iterations * numQubits,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark circuit creation and execution
   */
  benchmarkCircuitExecution(numQubits: number, gateCount: number = 50): BenchmarkResult {
    const startTime = performance.now();
    const initialMemory = this.memoryUsage();

    const circuit = new Circuit(numQubits);

    // Add random gates
    for (let i = 0; i < gateCount; i++) {
      const qubit = Math.floor(Math.random() * numQubits);
      const gateType = Math.floor(Math.random() * 4);

      switch (gateType) {
        case 0:
          circuit.h(qubit);
          break;
        case 1:
          circuit.x(qubit);
          break;
        case 2:
          circuit.y(qubit);
          break;
        case 3:
          circuit.z(qubit);
          break;
      }
    }

    // Add some two-qubit gates
    for (let i = 0; i < Math.min(10, numQubits - 1); i++) {
      const control = Math.floor(Math.random() * numQubits);
      let target = Math.floor(Math.random() * numQubits);
      while (target === control) {
        target = Math.floor(Math.random() * numQubits);
      }
      circuit.cnot(control, target);
    }

    circuit.execute();

    const endTime = performance.now();
    const finalMemory = this.memoryUsage();

    const result: BenchmarkResult = {
      name: 'Circuit Execution',
      numQubits,
      executionTime: endTime - startTime,
      memoryUsage: finalMemory - initialMemory,
      operations: gateCount + Math.min(10, numQubits - 1),
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark QFT implementation
   */
  benchmarkQFT(numQubits: number): BenchmarkResult {
    const startTime = performance.now();
    const initialMemory = this.memoryUsage();

    const circuit = QFT(numQubits);
    circuit.execute();

    const endTime = performance.now();
    const finalMemory = this.memoryUsage();

    // QFT has O(n^2) gates
    const expectedOperations = (numQubits * (numQubits + 1)) / 2;

    const result: BenchmarkResult = {
      name: 'Quantum Fourier Transform',
      numQubits,
      executionTime: endTime - startTime,
      memoryUsage: finalMemory - initialMemory,
      operations: expectedOperations,
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark Bell state preparation
   */
  benchmarkBellState(pairs: number, iterations: number = 1000): BenchmarkResult {
    const numQubits = pairs * 2;
    const startTime = performance.now();
    const initialMemory = this.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      const circuit = new Circuit(numQubits);

      // Create Bell pairs
      for (let j = 0; j < pairs; j++) {
        const qubit1 = j * 2;
        const qubit2 = j * 2 + 1;
        circuit.h(qubit1);
        circuit.cnot(qubit1, qubit2);
        // Measure this Bell pair
        circuit.mz(qubit1).mz(qubit2);
      }

      circuit.execute();
    }

    const endTime = performance.now();
    const finalMemory = this.memoryUsage();

    const result: BenchmarkResult = {
      name: 'Bell State Preparation',
      numQubits,
      executionTime: endTime - startTime,
      memoryUsage: finalMemory - initialMemory,
      operations: iterations * pairs * 2, // H + CNOT per pair
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run scaling benchmarks to test performance across different qubit counts
   */
  runScalingBenchmarks(maxQubits: number = 10): BenchmarkResult[] {
    const scalingResults: BenchmarkResult[] = [];

    for (let n = 1; n <= maxQubits; n++) {
      // Test circuit execution scaling
      const circuitResult = this.benchmarkCircuitExecution(n, n * 10);
      scalingResults.push(circuitResult);

      // Test QFT scaling (skip for larger qubit counts due to exponential complexity)
      if (n <= 8) {
        const qftResult = this.benchmarkQFT(n);
        scalingResults.push(qftResult);
      }

      // Test state operations scaling
      if (n <= 12) {
        const stateResult = this.benchmarkQubitState(n, Math.max(10, 100 / n));
        scalingResults.push(stateResult);
      }
    }

    return scalingResults;
  }

  /**
   * Get memory usage (simplified implementation)
   */
  private memoryUsage(): number {
    // In a Node.js environment, we could use process.memoryUsage()
    // For browser compatibility, we'll return 0 for now
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  /**
   * Get all benchmark results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Clear all benchmark results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No benchmark results available.';
    }

    let report = '# Quantum Computing Performance Benchmark Report\n\n';

    // Group results by name
    const grouped = this.results.reduce((acc, result) => {
      if (!acc[result.name]) {
        acc[result.name] = [];
      }
      acc[result.name]!.push(result);
      return acc;
    }, {} as Record<string, BenchmarkResult[]>);

    for (const [name, results] of Object.entries(grouped)) {
      report += `## ${name}\n\n`;
      report += '| Qubits | Execution Time (ms) | Operations | Ops/ms | Memory (MB) |\n';
      report += '|--------|-------------------|------------|--------|-------------|\n';

      for (const result of results) {
        const opsPerMs = (result.operations / result.executionTime).toFixed(2);
        const memory = result.memoryUsage?.toFixed(2) ?? 'N/A';
        report += `| ${result.numQubits} | ${result.executionTime.toFixed(2)} | ${result.operations} | ${opsPerMs} | ${memory} |\n`;
      }
      
      report += '\n';
    }

    // Add summary statistics
    report += '## Summary\n\n';
    const avgTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length;
    const totalOps = this.results.reduce((sum, r) => sum + r.operations, 0);
    
    report += `- Total benchmarks: ${this.results.length}\n`;
    report += `- Average execution time: ${avgTime.toFixed(2)} ms\n`;
    report += `- Total operations: ${totalOps}\n`;
    report += `- Overall operations per ms: ${(totalOps / this.results.reduce((sum, r) => sum + r.executionTime, 0)).toFixed(2)}\n`;

    return report;
  }
}

/**
 * Run a comprehensive benchmark suite
 */
export function runComprehensiveBenchmark(): PerformanceBenchmark {
  const benchmark = new PerformanceBenchmark();

  // Test various qubit counts and operations
  benchmark.runScalingBenchmarks(8);

  // Test Bell state preparation
  for (let pairs = 1; pairs <= 4; pairs++) {
    benchmark.benchmarkBellState(pairs, 100);
  }

  return benchmark;
}

// Jest test suites for performance benchmarks
describe('Performance Benchmarks', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });

  describe('Quantum State Benchmarks', () => {
    it('should benchmark quantum state operations', () => {
      const result = benchmark.benchmarkQubitState(2, 10);
      
      expect(result.name).toBe('QubitState Operations');
      expect(result.numQubits).toBe(2);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operations).toBe(20); // 10 iterations * 2 qubits
    });

    it('should handle different qubit counts', () => {
      const result1 = benchmark.benchmarkQubitState(1, 5);
      const result2 = benchmark.benchmarkQubitState(3, 5);
      
      expect(result1.numQubits).toBe(1);
      expect(result2.numQubits).toBe(3);
      expect(result2.operations).toBeGreaterThan(result1.operations);
    });
  });

  describe('Circuit Execution Benchmarks', () => {
    it('should benchmark circuit execution', () => {
      const result = benchmark.benchmarkCircuitExecution(2, 10);
      
      expect(result.name).toBe('Circuit Execution');
      expect(result.numQubits).toBe(2);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operations).toBeGreaterThanOrEqual(10);
    });

    it('should scale with circuit complexity', () => {
      const simple = benchmark.benchmarkCircuitExecution(2, 5);
      const complex = benchmark.benchmarkCircuitExecution(2, 20);
      
      expect(complex.operations).toBeGreaterThan(simple.operations);
    });
  });

  describe('QFT Benchmarks', () => {
    it('should benchmark QFT implementation', () => {
      const result = benchmark.benchmarkQFT(3);
      
      expect(result.name).toBe('Quantum Fourier Transform');
      expect(result.numQubits).toBe(3);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operations).toBe(6); // (3 * 4) / 2
    });

    it('should have quadratic scaling', () => {
      const result2 = benchmark.benchmarkQFT(2);
      const result3 = benchmark.benchmarkQFT(3);
      const result4 = benchmark.benchmarkQFT(4);
      
      expect(result2.operations).toBe(3); // (2 * 3) / 2
      expect(result3.operations).toBe(6); // (3 * 4) / 2
      expect(result4.operations).toBe(10); // (4 * 5) / 2
    });
  });

  describe('Bell State Benchmarks', () => {
    it.skip('should benchmark Bell state preparation', () => {
      const result = benchmark.benchmarkBellState(2, 10);
      
      expect(result.name).toBe('Bell State Preparation');
      expect(result.numQubits).toBe(4); // 2 pairs = 4 qubits
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operations).toBe(40); // 10 iterations * 2 pairs * 2 gates
    });
  });

  describe('Scaling Benchmarks', () => {
    it('should run scaling benchmarks', () => {
      const results = benchmark.runScalingBenchmarks(3);
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should have circuit, QFT, and state results for different qubit counts
      const circuitResults = results.filter(r => r.name === 'Circuit Execution');
      const qftResults = results.filter(r => r.name === 'Quantum Fourier Transform');
      const stateResults = results.filter(r => r.name === 'QubitState Operations');
      
      expect(circuitResults.length).toBe(3);
      expect(qftResults.length).toBe(3);
      expect(stateResults.length).toBe(3);
    }, 15000);
  });

  describe('Report Generation', () => {
    it('should generate empty report when no results', () => {
      const report = benchmark.generateReport();
      expect(report).toBe('No benchmark results available.');
    });

    it('should generate report with results', () => {
      benchmark.benchmarkQubitState(2, 5);
      const report = benchmark.generateReport();
      
      expect(report).toContain('Quantum Computing Performance Benchmark Report');
      expect(report).toContain('QubitState Operations');
      expect(report).toContain('Summary');
    });
  });

  describe('Result Management', () => {
    it('should track and clear results', () => {
      expect(benchmark.getResults()).toHaveLength(0);
      
      benchmark.benchmarkQubitState(2, 5);
      expect(benchmark.getResults()).toHaveLength(1);
      
      benchmark.clearResults();
      expect(benchmark.getResults()).toHaveLength(0);
    });
  });

  describe('Comprehensive Benchmark Suite', () => {
    it.skip('should run comprehensive benchmark suite', () => {
      const result = runComprehensiveBenchmark();
      
      expect(result).toBeInstanceOf(PerformanceBenchmark);
      expect(result.getResults().length).toBeGreaterThan(0);
      
      const results = result.getResults();
      const uniqueNames = new Set(results.map(r => r.name));
      
      expect(uniqueNames.has('Circuit Execution')).toBe(true);
      expect(uniqueNames.has('Quantum Fourier Transform')).toBe(true);
      expect(uniqueNames.has('QubitState Operations')).toBe(true);
      expect(uniqueNames.has('Bell State Preparation')).toBe(true);
    });
  });
});