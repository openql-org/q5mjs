// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  groverSearch,
  groverIter
} from '@/algorithms/grover';

import {
  quantumFourierTransform,
  QFT
} from '@/algorithms/qft';

import {
  estimateControlQubits
} from '@/algorithms/QPE';

import { Circuit } from '@/core/Circuit';

describe('Algorithm Integration', () => {
  it('should combine multiple algorithms', () => {
    // Create a circuit with QFT
    const circuit = new Circuit(2);
    quantumFourierTransform(circuit, [0, 1]);
    
    // Execute and get state
    const state = circuit.execute();
    expect(state).toBeDefined();
    
    // Use state in Grover search (simple non-conflicting oracle)
    const oracle = (input: string) => input === '00';
    const groverResult = groverSearch(2, oracle, { iterations: 1 });
    expect(groverResult).toBeDefined();
    
    const groverState = groverResult.execute();
    expect(groverState).toBeDefined();
  });
  
  it('should handle various qubit counts', () => {
    // Test with different numbers of qubits
    for (let n = 1; n <= 4; n++) {
      const circuit = QFT(n);
      const result = circuit.execute();
      expect(result.state.amplitudes()).toHaveLength(Math.pow(2, n));
    }
  });
  
  it('should handle edge cases', () => {
    // Test with minimal parameters
    const iterations = groverIter(2, 1);
    expect(iterations).toBeGreaterThanOrEqual(1);
    
    const controlQubits = estimateControlQubits(0.1);
    expect(controlQubits).toBeGreaterThanOrEqual(1);
  });
});