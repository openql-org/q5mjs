// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Jest tests for sparse representation optimization benchmarks.
 *
 * This module provides Jest test cases for the new CSR (Compressed Sparse Row)
 * format and hybrid representation system implemented in Q5mState and QubitState.
 * These benchmarks measure memory usage, execution time, and scaling behavior
 * across different representation types.
 */

import { 
  SparseOptimizationBenchmark, 
  runSparseOptimizationBenchmarks,
  type SparseOptimizationBenchmarkResult 
} from './sparse-optimization-runner';

// Re-export for convenience
export { SparseOptimizationBenchmark, runSparseOptimizationBenchmarks, type SparseOptimizationBenchmarkResult };

/**
 * Jest test suite for sparse optimization benchmarks
 */
describe('Sparse Optimization Benchmarks', () => {
  let benchmark: SparseOptimizationBenchmark;

  beforeEach(() => {
    benchmark = new SparseOptimizationBenchmark();
  });

  describe('State Creation Benchmarks', () => {
    it('should benchmark dense state creation', () => {
      const result = benchmark.benchmarkStateCreation(4, 'dense', 5);
      
      expect(result.name).toBe('State Creation (dense)');
      expect(result.numQubits).toBe(4);
      expect(result.representation).toBe('DENSE');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.sparsityRatio).toBe(1.0); // Dense = 100% filled
    });

    it('should benchmark sparse state creation', () => {
      const result = benchmark.benchmarkStateCreation(6, 'sparse', 5);
      
      expect(result.name).toBe('State Creation (sparse)');
      expect(result.numQubits).toBe(6);
      expect(result.representation).toBe('AUTO');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.sparsityRatio).toBeLessThan(1.0); // Sparse < 100% filled
    });

    it('should benchmark basis state creation', () => {
      const result = benchmark.benchmarkStateCreation(8, 'basis', 5);
      
      expect(result.name).toBe('State Creation (basis)');
      expect(result.numQubits).toBe(8);
      expect(result.representation).toBe('AUTO');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.nonZeroElements).toBe(1); // Basis state has exactly 1 non-zero element
    });
  });

  describe('Unitary Application Benchmarks', () => {
    it('should benchmark single-qubit gate on dense state', () => {
      const result = benchmark.benchmarkUnitaryApplication(4, 'single', 'dense', 3);
      
      expect(result.name).toBe('Unitary Application (single, dense)');
      expect(result.numQubits).toBe(4);
      expect(result.representation).toBe('DENSE');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should benchmark controlled gate on sparse state', () => {
      const result = benchmark.benchmarkUnitaryApplication(5, 'controlled', 'sparse', 3);
      
      expect(result.name).toBe('Unitary Application (controlled, sparse)');
      expect(result.numQubits).toBe(5);
      expect(result.representation).toBe('SPARSE/CSR');
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Amplitude Access Benchmarks', () => {
    it('should benchmark sequential access on dense state', () => {
      const result = benchmark.benchmarkAmplitudeAccess(4, 'sequential', 'dense', 50);
      
      expect(result.name).toBe('Amplitude Access (sequential, dense)');
      expect(result.numQubits).toBe(4);
      expect(result.representation).toBe('DENSE');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
    });

    it('should benchmark sparse-only access on sparse state', () => {
      const result = benchmark.benchmarkAmplitudeAccess(6, 'sparse_only', 'sparse', 30);
      
      expect(result.name).toBe('Amplitude Access (sparse_only, sparse)');
      expect(result.numQubits).toBe(6);
      expect(result.representation).toBe('SPARSE/CSR');
      expect(result.operationsPerSecond).toBeGreaterThan(0);
    });
  });

  describe('Representation Comparison', () => {
    it('should compare different representations for same operations', () => {
      const results = benchmark.benchmarkRepresentationComparison(4);
      
      expect(results.length).toBeGreaterThan(3); // At least creation benchmarks
      
      const denseResults = results.filter(r => r.representation === 'DENSE');
      const sparseResults = results.filter(r => r.representation !== 'DENSE');
      
      expect(denseResults.length).toBeGreaterThan(0);
      expect(sparseResults.length).toBeGreaterThan(0);
      
      // All results should be for the same number of qubits
      results.forEach(r => expect(r.numQubits).toBe(4));
    });
  });

  describe('Scaling Analysis', () => {
    it('should run scaling benchmarks across different qubit counts', () => {
      // Use a smaller range for faster testing
      const originalFn = benchmark.benchmarkRepresentationComparison;
      benchmark.benchmarkRepresentationComparison = function(numQubits: number) {
        const results: SparseOptimizationBenchmarkResult[] = [];
        results.push(this.benchmarkStateCreation(numQubits, 'sparse', 2));
        results.push(this.benchmarkStateCreation(numQubits, 'basis', 2));
        return results;
      }.bind(benchmark);
      
      const results: SparseOptimizationBenchmarkResult[] = [];
      for (let qubits = 4; qubits <= 6; qubits += 2) {
        results.push(...benchmark.benchmarkRepresentationComparison(qubits));
      }
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should have results for different qubit counts
      const qubitCounts = new Set(results.map(r => r.numQubits));
      expect(qubitCounts.size).toBeGreaterThan(1);
      
      // Restore original function
      benchmark.benchmarkRepresentationComparison = originalFn;
    }, 10000);
  });

  describe('Report Generation', () => {
    it('should generate empty report when no results', () => {
      const report = benchmark.generateReport();
      expect(report).toBe('No sparse optimization benchmark results available.');
    });

    it('should generate detailed report with analysis', () => {
      // Add some benchmark results
      benchmark.benchmarkStateCreation(4, 'dense', 2);
      benchmark.benchmarkStateCreation(4, 'sparse', 2);
      
      const report = benchmark.generateReport();
      
      expect(report).toContain('Sparse Optimization Performance Report');
      expect(report).toContain('State Creation');
      expect(report).toContain('Performance Analysis');
      expect(report).toContain('Time Improvement');
      expect(report).toContain('Memory Improvement');
    });
  });

  describe('Result Management', () => {
    it('should track and clear results properly', () => {
      expect(benchmark.getResults()).toHaveLength(0);
      
      benchmark.benchmarkStateCreation(3, 'basis', 2);
      expect(benchmark.getResults()).toHaveLength(1);
      
      benchmark.benchmarkAmplitudeAccess(3, 'random', 'sparse', 10);
      expect(benchmark.getResults()).toHaveLength(2);
      
      benchmark.clearResults();
      expect(benchmark.getResults()).toHaveLength(0);
    });
  });
});