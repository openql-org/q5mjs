// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Quantum algorithms module for q5m.js
 *
 * This module provides implementations of fundamental quantum algorithms
 * that form the building blocks of quantum computing applications.
 *
 * **Available Algorithms:**
 * - **Amplitude Amplification**: General framework for amplitude manipulation
 * - **Grover's Algorithm**: Quantum search with quadratic speedup (built on Amplitude Amplification)
 * - **Quantum Fourier Transform**: Basis transformation for periodicity problems
 * - **Phase Estimation**: Eigenvalue estimation for unitary operators
 *
 * @packageDocumentation
 */

// Amplitude manipulation algorithms (foundation)
export * from './QAA';

// Quantum search algorithms (built on Amplitude Amplification)
export * from './grover';

// Quantum Fourier Transform and related algorithms
export * from './qft';

// Phase estimation and eigenvalue problems
export * from './QPE';

// Re-export specific frequently used functions for convenience
export {
  groverSearch,
  grover,
  groverSearchForMultipleItems,
  groverIter,
  groverProb,
} from './grover';

export { quantumFourierTransform, QFT, qftEncode } from './qft';

export { QPE, estimatePhase, decodePhaseEstimate } from './QPE';

export {
  QAA,
  findOptimalIterations,
  estimateSuccessProbability,
  createUniformSuperposition,
} from './QAA';
