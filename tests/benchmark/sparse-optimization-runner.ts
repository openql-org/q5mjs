// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Standalone performance benchmarks for sparse representation optimizations.
 *
 * This module provides comprehensive benchmarks for the new CSR (Compressed Sparse Row)
 * format and hybrid representation system implemented in Q5mState and QubitState.
 */

import { QubitState } from '../../src/core/QubitState';
import { UnitaryOperator } from '../../src/core/Q5mOperator';
import { complex, ZERO, ONE } from '../../src/math/complex';
import type { Amplitude, Unitary } from '../../src/math/math-utils';

/**
 * Enhanced benchmark result with representation-specific metrics
 */
export interface SparseOptimizationBenchmarkResult {
  name: string;
  numQubits: number;
  representation: string;
  executionTime: number; // milliseconds
  memoryUsage: number; // bytes
  sparsityRatio: number; // 0-1 where 0 = fully sparse, 1 = fully dense
  nonZeroElements: number;
  totalElements: number;
  operationsPerSecond: number;
  memoryEfficiency: number; // bytes per non-zero element
}

/**
 * Benchmark runner for sparse optimization features
 */
export class SparseOptimizationBenchmark {
  private results: SparseOptimizationBenchmarkResult[] = [];

  /**
   * Benchmark QubitState creation with different initialization patterns
   */
  benchmarkStateCreation(numQubits: number, pattern: 'dense' | 'sparse' | 'basis', iterations: number = 100): SparseOptimizationBenchmarkResult {
    const stateCount = Math.pow(2, numQubits);
    let totalTime = 0;
    let totalMemory = 0;
    let nonZeroElements = 0;

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const initialMemory = this.getMemoryUsage();
      
      let state: QubitState;
      
      switch (pattern) {
        case 'dense':
          // Create a nearly dense state (random amplitudes)
          const denseVector = Array.from({ length: stateCount }, () => 
            complex(Math.random(), Math.random()));
          state = new QubitState(numQubits, denseVector, false); // Force dense
          nonZeroElements = stateCount;
          break;
          
        case 'sparse':
          // Create a sparse state (few non-zero amplitudes)
          const sparseVector = new Array(stateCount).fill(ZERO);
          const numNonZero = Math.min(10, stateCount / 4);
          for (let j = 0; j < numNonZero; j++) {
            const idx = Math.floor(Math.random() * stateCount);
            sparseVector[idx] = complex(Math.random(), Math.random());
          }
          state = new QubitState(numQubits, sparseVector, true); // Enable optimization
          nonZeroElements = numNonZero;
          break;
          
        case 'basis':
          // Create a computational basis state (maximally sparse)
          const basisIndex = Math.floor(Math.random() * stateCount);
          state = QubitState.fromBasisState(numQubits, basisIndex);
          nonZeroElements = 1;
          break;
          
        default:
          throw new Error(`Unknown pattern: ${pattern}`);
      }
      
      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();
      
      totalTime += endTime - startTime;
      totalMemory += Math.max(0, finalMemory - initialMemory);
    }

    const avgTime = totalTime / iterations;
    const avgMemory = totalMemory / iterations;
    const sparsityRatio = nonZeroElements / stateCount;

    const result: SparseOptimizationBenchmarkResult = {
      name: `State Creation (${pattern})`,
      numQubits,
      representation: pattern === 'dense' ? 'DENSE' : 'AUTO',
      executionTime: avgTime,
      memoryUsage: avgMemory,
      sparsityRatio,
      nonZeroElements,
      totalElements: stateCount,
      operationsPerSecond: iterations / (totalTime / 1000),
      memoryEfficiency: avgMemory / nonZeroElements
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark unitary operator application with different gate types
   */
  benchmarkUnitaryApplication(
    numQubits: number, 
    gateType: 'single' | 'controlled' | 'random',
    statePattern: 'dense' | 'sparse',
    iterations: number = 50
  ): SparseOptimizationBenchmarkResult {
    const stateCount = Math.pow(2, numQubits);
    
    // Prepare initial state
    let initialState: QubitState;
    let nonZeroElements: number;
    
    if (statePattern === 'sparse') {
      // Create sparse state with ~10% non-zero elements
      const sparseVector = new Array(stateCount).fill(ZERO);
      nonZeroElements = Math.max(1, Math.floor(stateCount * 0.1));
      for (let i = 0; i < nonZeroElements; i++) {
        const idx = Math.floor(Math.random() * stateCount);
        sparseVector[idx] = complex(Math.random(), Math.random());
      }
      initialState = new QubitState(numQubits, sparseVector, true);
    } else {
      // Create dense state
      const denseVector = Array.from({ length: stateCount }, () => 
        complex(Math.random() * 0.1, Math.random() * 0.1)); // Small amplitudes to avoid overflow
      initialState = new QubitState(numQubits, denseVector, false);
      nonZeroElements = stateCount;
    }

    // Prepare unitary operator
    let unitary: UnitaryOperator;
    
    switch (gateType) {
      case 'single':
        // Single-qubit Hadamard gate extended to full space
        unitary = this.createSingleQubitGate(numQubits, 0, 'H');
        break;
        
      case 'controlled':
        // CNOT gate or multi-controlled gate
        if (numQubits >= 2) {
          unitary = this.createCNOTGate(numQubits, 0, 1);
        } else {
          unitary = this.createSingleQubitGate(numQubits, 0, 'H');
        }
        break;
        
      case 'random':
        // Random sparse unitary (harder to optimize)
        unitary = this.createRandomSparseUnitary(stateCount, 0.3);
        break;
        
      default:
        throw new Error(`Unknown gate type: ${gateType}`);
    }

    // Benchmark the application
    let totalTime = 0;
    let totalMemory = 0;
    
    for (let i = 0; i < iterations; i++) {
      const state = initialState.clone();
      
      const startTime = performance.now();
      const initialMemory = this.getMemoryUsage();
      
      const resultState = state.apply(unitary);
      
      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();
      
      totalTime += endTime - startTime;
      totalMemory += Math.max(0, finalMemory - initialMemory);
      
      // Use result to prevent optimization
      resultState.amplitude(0);
    }

    const avgTime = totalTime / iterations;
    const avgMemory = totalMemory / iterations;
    const sparsityRatio = nonZeroElements / stateCount;

    const result: SparseOptimizationBenchmarkResult = {
      name: `Unitary Application (${gateType}, ${statePattern})`,
      numQubits,
      representation: statePattern === 'sparse' ? 'SPARSE/CSR' : 'DENSE',
      executionTime: avgTime,
      memoryUsage: avgMemory,
      sparsityRatio,
      nonZeroElements,
      totalElements: stateCount,
      operationsPerSecond: iterations / (totalTime / 1000),
      memoryEfficiency: avgMemory / Math.max(1, nonZeroElements)
    };

    this.results.push(result);
    return result;
  }

  /**
   * Benchmark amplitude access patterns
   */
  benchmarkAmplitudeAccess(
    numQubits: number,
    accessPattern: 'sequential' | 'random' | 'sparse_only',
    statePattern: 'dense' | 'sparse',
    accessCount: number = 1000
  ): SparseOptimizationBenchmarkResult {
    const stateCount = Math.pow(2, numQubits);
    
    // Create state
    let state: QubitState;
    let nonZeroElements: number;
    
    if (statePattern === 'sparse') {
      const sparseVector = new Array(stateCount).fill(ZERO);
      nonZeroElements = Math.max(1, Math.floor(stateCount * 0.05)); // 5% sparse
      const nonZeroIndices = new Set<number>();
      
      for (let i = 0; i < nonZeroElements; i++) {
        let idx: number;
        do {
          idx = Math.floor(Math.random() * stateCount);
        } while (nonZeroIndices.has(idx));
        
        nonZeroIndices.add(idx);
        sparseVector[idx] = complex(Math.random(), Math.random());
      }
      
      state = new QubitState(numQubits, sparseVector, true);
    } else {
      const denseVector = Array.from({ length: stateCount }, () => 
        complex(Math.random(), Math.random()));
      state = new QubitState(numQubits, denseVector, false);
      nonZeroElements = stateCount;
    }

    // Generate access indices
    const accessIndices: number[] = [];
    
    switch (accessPattern) {
      case 'sequential':
        for (let i = 0; i < accessCount; i++) {
          accessIndices.push(i % stateCount);
        }
        break;
        
      case 'random':
        for (let i = 0; i < accessCount; i++) {
          accessIndices.push(Math.floor(Math.random() * stateCount));
        }
        break;
        
      case 'sparse_only':
        // Only access known non-zero elements (best case for sparse)
        const nonZeroIndices = [];
        for (let i = 0; i < stateCount; i++) {
          if (state.amplitude(i).abs() > 1e-15) {
            nonZeroIndices.push(i);
          }
        }
        for (let i = 0; i < accessCount; i++) {
          accessIndices.push(nonZeroIndices[i % nonZeroIndices.length]!);
        }
        break;
    }

    // Benchmark access
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();
    
    let sum = ZERO;
    for (const index of accessIndices) {
      sum = sum.add(state.amplitude(index));
    }
    
    const endTime = performance.now();
    const finalMemory = this.getMemoryUsage();
    
    // Use sum to prevent optimization
    sum.abs();
    
    const totalTime = endTime - startTime;
    const memoryUsed = Math.max(0, finalMemory - initialMemory);
    const sparsityRatio = nonZeroElements / stateCount;

    const result: SparseOptimizationBenchmarkResult = {
      name: `Amplitude Access (${accessPattern}, ${statePattern})`,
      numQubits,
      representation: statePattern === 'sparse' ? 'SPARSE/CSR' : 'DENSE',
      executionTime: totalTime,
      memoryUsage: memoryUsed,
      sparsityRatio,
      nonZeroElements,
      totalElements: stateCount,
      operationsPerSecond: accessCount / (totalTime / 1000),
      memoryEfficiency: memoryUsed / Math.max(1, nonZeroElements)
    };

    this.results.push(result);
    return result;
  }

  /**
   * Compare performance across different representation types for the same operation
   */
  benchmarkRepresentationComparison(numQubits: number): SparseOptimizationBenchmarkResult[] {
    const results: SparseOptimizationBenchmarkResult[] = [];
    
    // Test 1: State creation
    results.push(this.benchmarkStateCreation(numQubits, 'dense', 20));
    results.push(this.benchmarkStateCreation(numQubits, 'sparse', 20));
    results.push(this.benchmarkStateCreation(numQubits, 'basis', 20));
    
    // Test 2: Unitary application
    if (numQubits <= 12) { // Avoid memory issues for large systems
      results.push(this.benchmarkUnitaryApplication(numQubits, 'single', 'dense', 10));
      results.push(this.benchmarkUnitaryApplication(numQubits, 'single', 'sparse', 10));
      
      if (numQubits >= 2) {
        results.push(this.benchmarkUnitaryApplication(numQubits, 'controlled', 'dense', 10));
        results.push(this.benchmarkUnitaryApplication(numQubits, 'controlled', 'sparse', 10));
      }
    }
    
    // Test 3: Amplitude access
    results.push(this.benchmarkAmplitudeAccess(numQubits, 'random', 'dense', 500));
    results.push(this.benchmarkAmplitudeAccess(numQubits, 'random', 'sparse', 500));
    
    return results;
  }

  /**
   * Helper: Create single-qubit gate extended to full Hilbert space
   */
  private createSingleQubitGate(numQubits: number, targetQubit: number, gateType: 'H' | 'X' | 'Y' | 'Z'): UnitaryOperator {
    const dim = Math.pow(2, numQubits);
    const matrix: Unitary = [] as Unitary;
    
    // Initialize as identity
    for (let i = 0; i < dim; i++) {
      matrix[i] = [];
      for (let j = 0; j < dim; j++) {
        matrix[i]![j] = i === j ? ONE : ZERO;
      }
    }
    
    // Apply single-qubit gate
    const singleQubitMatrix = this.getSingleQubitMatrix(gateType);
    
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        // Check if this transformation applies
        const iBit = (i >> (numQubits - 1 - targetQubit)) & 1;
        const jBit = (j >> (numQubits - 1 - targetQubit)) & 1;
        
        // If other bits don't match, this is zero
        const iOther = i & ~(1 << (numQubits - 1 - targetQubit));
        const jOther = j & ~(1 << (numQubits - 1 - targetQubit));
        
        if (iOther === jOther) {
          matrix[i]![j] = singleQubitMatrix[iBit]![jBit]!;
        } else {
          matrix[i]![j] = ZERO;
        }
      }
    }
    
    return new UnitaryOperator(matrix, gateType, true);
  }

  /**
   * Helper: Create CNOT gate for full Hilbert space
   */
  private createCNOTGate(numQubits: number, control: number, target: number): UnitaryOperator {
    const dim = Math.pow(2, numQubits);
    const matrix: Unitary = [] as Unitary;
    
    // Initialize as identity
    for (let i = 0; i < dim; i++) {
      matrix[i] = [];
      for (let j = 0; j < dim; j++) {
        matrix[i]![j] = ZERO;
      }
    }
    
    // Apply CNOT logic
    for (let i = 0; i < dim; i++) {
      const controlBit = (i >> (numQubits - 1 - control)) & 1;
      
      if (controlBit === 0) {
        // Control is 0, identity
        matrix[i]![i] = ONE;
      } else {
        // Control is 1, flip target
        const flipped = i ^ (1 << (numQubits - 1 - target));
        matrix[i]![flipped] = ONE;
      }
    }
    
    return new UnitaryOperator(matrix, 'CNOT', true);
  }

  /**
   * Helper: Create random sparse unitary matrix
   */
  private createRandomSparseUnitary(dim: number, sparsity: number): UnitaryOperator {
    // For simplicity, create a permutation matrix (always unitary and can be sparse)
    const matrix: Unitary = [] as Unitary;
    
    // Initialize as zero
    for (let i = 0; i < dim; i++) {
      matrix[i] = [];
      for (let j = 0; j < dim; j++) {
        matrix[i]![j] = ZERO;
      }
    }
    
    // Create random permutation that respects sparsity
    const used = new Set<number>();
    const elementsToFill = Math.max(dim, Math.floor(dim * sparsity));
    
    for (let i = 0; i < elementsToFill && i < dim; i++) {
      let j: number;
      do {
        j = Math.floor(Math.random() * dim);
      } while (used.has(j));
      
      used.add(j);
      matrix[i]![j] = ONE;
    }
    
    // Fill remaining diagonal elements to ensure unitarity
    for (let i = elementsToFill; i < dim; i++) {
      matrix[i]![i] = ONE;
    }
    
    return new UnitaryOperator(matrix, 'RandomSparse', true);
  }

  /**
   * Helper: Get single-qubit gate matrix
   */
  private getSingleQubitMatrix(gateType: 'H' | 'X' | 'Y' | 'Z'): Amplitude[][] {
    switch (gateType) {
      case 'H':
        const h = 1 / Math.sqrt(2);
        return [
          [complex(h, 0), complex(h, 0)],
          [complex(h, 0), complex(-h, 0)]
        ];
      case 'X':
        return [
          [ZERO, ONE],
          [ONE, ZERO]
        ];
      case 'Y':
        return [
          [ZERO, complex(0, -1)],
          [complex(0, 1), ZERO]
        ];
      case 'Z':
        return [
          [ONE, ZERO],
          [ZERO, complex(-1, 0)]
        ];
      default:
        throw new Error(`Unknown gate type: ${gateType}`);
    }
  }

  /**
   * Helper: Get memory usage (simplified)
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Get all benchmark results
   */
  getResults(): SparseOptimizationBenchmarkResult[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Generate detailed performance report
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No sparse optimization benchmark results available.';
    }

    let report = '# Sparse Optimization Performance Report\n\n';
    
    // Group by test type
    const grouped = this.results.reduce((acc, result) => {
      const testType = result.name.split('(')[0]!.trim();
      if (!acc[testType]) {
        acc[testType] = [];
      }
      acc[testType]!.push(result);
      return acc;
    }, {} as Record<string, SparseOptimizationBenchmarkResult[]>);

    for (const [testType, results] of Object.entries(grouped)) {
      report += `## ${testType}\n\n`;
      report += '| Qubits | Representation | Time (ms) | Memory (KB) | Sparsity | Ops/sec | Efficiency |\n';
      report += '|--------|---------------|-----------|-------------|----------|---------|------------|\n';
      
      for (const result of results) {
        report += `| ${result.numQubits} | ${result.representation} | `;
        report += `${result.executionTime.toFixed(2)} | `;
        report += `${(result.memoryUsage / 1024).toFixed(1)} | `;
        report += `${(result.sparsityRatio * 100).toFixed(1)}% | `;
        report += `${result.operationsPerSecond.toFixed(0)} | `;
        report += `${result.memoryEfficiency.toFixed(1)} |\n`;
      }
      
      report += '\n';
    }

    // Add analysis section
    report += '## Performance Analysis\n\n';
    
    const denseResults = this.results.filter(r => r.representation.includes('DENSE'));
    const sparseResults = this.results.filter(r => r.representation.includes('SPARSE') || r.representation.includes('CSR'));
    
    if (denseResults.length > 0 && sparseResults.length > 0) {
      const avgDenseTime = denseResults.reduce((sum, r) => sum + r.executionTime, 0) / denseResults.length;
      const avgSparseTime = sparseResults.reduce((sum, r) => sum + r.executionTime, 0) / sparseResults.length;
      const avgDenseMemory = denseResults.reduce((sum, r) => sum + r.memoryUsage, 0) / denseResults.length;
      const avgSparseMemory = sparseResults.reduce((sum, r) => sum + r.memoryUsage, 0) / sparseResults.length;
      
      report += `- Average Dense Execution Time: ${avgDenseTime.toFixed(2)} ms\n`;
      report += `- Average Sparse Execution Time: ${avgSparseTime.toFixed(2)} ms\n`;
      report += `- **Time Improvement**: ${((avgDenseTime - avgSparseTime) / avgDenseTime * 100).toFixed(1)}%\n\n`;
      
      report += `- Average Dense Memory Usage: ${(avgDenseMemory / 1024).toFixed(1)} KB\n`;
      report += `- Average Sparse Memory Usage: ${(avgSparseMemory / 1024).toFixed(1)} KB\n`;
      report += `- **Memory Improvement**: ${((avgDenseMemory - avgSparseMemory) / avgDenseMemory * 100).toFixed(1)}%\n\n`;
    } else {
      report += `- Only ${denseResults.length} dense and ${sparseResults.length} sparse results available\n`;
      report += `- **Time Improvement**: Cannot calculate with insufficient data\n`;
      report += `- **Memory Improvement**: Cannot calculate with insufficient data\n\n`;
    }

    return report;
  }
}

/**
 * Export benchmark runner for external use
 */
export function runSparseOptimizationBenchmarks(maxQubits: number = 8): SparseOptimizationBenchmark {
  const benchmark = new SparseOptimizationBenchmark();
  
  console.log('Running sparse optimization benchmarks...');
  
  // Run comprehensive benchmarks up to specified qubit count
  for (let qubits = 4; qubits <= maxQubits; qubits += 2) {
    console.log(`Testing ${qubits} qubits...`);
    
    if (qubits <= 8) {
      // Full comparison for smaller systems
      benchmark.benchmarkRepresentationComparison(qubits);
    } else {
      // Limited testing for larger systems
      benchmark.benchmarkStateCreation(qubits, 'sparse', 3);
      benchmark.benchmarkStateCreation(qubits, 'basis', 3);
      benchmark.benchmarkAmplitudeAccess(qubits, 'sparse_only', 'sparse', 50);
    }
  }
  
  console.log('Benchmarks complete.');
  
  return benchmark;
}