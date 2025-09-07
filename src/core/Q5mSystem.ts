// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Abstract quantum system base interface for q5m.js.
 *
 * This module provides the fundamental abstraction for all quantum systems
 * in the q5m.js framework, enabling extensibility to:
 *
 * - **Pure States**: Traditional quantum state vectors (QubitState)
 * - **Mixed States**: Density matrix representations (future: MixedState)
 * - **N-Level Systems**: Qudits beyond qubits (future: QuditState)
 * - **Composite Systems**: Multi-particle quantum systems
 *
 * The Q5mSystem abstraction provides a unified interface for quantum
 * state manipulation, measurement, and evolution while maintaining
 * flexibility for different quantum system representations.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

/**
 * Base interface for all quantum systems in q5m.js.
 *
 * This interface defines the fundamental contract that all quantum systems must implement,
 * providing a unified interface for quantum state manipulation regardless of the
 * underlying representation (pure states, mixed states, qudits, etc.).
 *
 * **Design Principles:**
 * - **Abstraction**: Hide implementation details behind uniform interface
 * - **Extensibility**: Enable future quantum system types without breaking changes
 * - **Performance**: Allow specialized implementations for different system sizes
 * - **Type Safety**: Provide compile-time guarantees for quantum operations
 *
 * **Quantum System Types:**
 * - Pure states: |ψ⟩ represented as state vectors
 * - Mixed states: ρ represented as density matrices
 * - N-level systems: qudits with arbitrary dimension per particle
 * - Composite systems: tensor products of subsystems
 *
 * @category Core Classes
 *
 */
interface Q5mSystem {
  /**
   * Returns the dimension of the Hilbert space for this quantum system.
   *
   * For pure qubit states: dimension = 2^numQubits
   * For qudits: dimension = levels^numQudits
   * For mixed states: same as underlying pure state dimension
   *
   * @returns The total number of basis states in the system
   *
   */
  dimension(): number;

  /**
   * Creates a deep copy of this quantum system.
   *
   * The cloned system is completely independent and can be modified
   * without affecting the original. All internal state representations
   * (state vectors, density matrices, etc.) are copied.
   *
   * @returns New quantum system with identical quantum state
   *
   */
  clone(): Q5mSystem;

  /**
   * Computes the tensor product with another quantum system.
   *
   * Creates a composite quantum system by combining this system with another.
   * The resulting system has dimension equal to the product of individual
   * system dimensions.
   *
   * For pure states: |ψ₁⟩ ⊗ |ψ₂⟩
   * For mixed states: ρ₁ ⊗ ρ₂
   *
   * @param other - Quantum system to tensor with this one
   * @returns New quantum system representing the composite system
   *
   */
  tensor(other: Q5mSystem): Q5mSystem;

  /**
   * Returns a string representation of the quantum state.
   *
   * The format depends on the specific quantum system type:
   * - Pure states: amplitude-basis notation (e.g., "0.707|00⟩ + 0.707|11⟩")
   * - Mixed states: density matrix or statistical mixture notation
   *
   * @param precision - Number of decimal places for amplitude display (default: 3)
   * @param threshold - Minimum amplitude magnitude to display (default: 1e-10)
   * @returns Human-readable representation of the quantum state
   *
   */
  toString(precision?: number, threshold?: number): string;

  /**
   * Calculates the purity of the quantum state.
   *
   * Purity is defined as Tr(ρ²) where ρ is the density matrix.
   * - Pure states: purity = 1
   * - Maximally mixed states: purity = 1/dimension
   * - Partially mixed states: 1/dimension < purity < 1
   *
   * @returns Purity value between 1/dimension and 1
   *
   */
  purity(): number;

  /**
   * Checks if this quantum system represents a pure state.
   *
   * A quantum state is pure if it can be written as |ψ⟩⟨ψ| for some
   * state vector |ψ⟩. Mathematically, this is equivalent to purity = 1.
   *
   * @returns True if the state is pure, false if mixed
   *
   */
  isPure(): boolean;

  /**
   * Computes the von Neumann entropy of the quantum state.
   *
   * Entropy is defined as S = -Tr(ρ log₂ ρ) where ρ is the density matrix.
   * - Pure states: entropy = 0
   * - Maximally mixed states: entropy = log₂(dimension)
   * - Mixed states: 0 < entropy < log₂(dimension)
   *
   * @returns Von Neumann entropy in bits
   *
   */
  entropy(): number;

  /**
   * Computes the fidelity between this and another quantum system.
   *
   * Fidelity is a measure of similarity between two quantum states:
   * - For pure states: F(|ψ₁⟩, |ψ₂⟩) = |⟨ψ₁|ψ₂⟩|²
   * - For mixed states: F(ρ₁, ρ₂) = Tr(√(√ρ₁ρ₂√ρ₁))²
   * - Pure-mixed: F(|ψ⟩, ρ) = ⟨ψ|ρ|ψ⟩
   *
   * Fidelity ranges from 0 (orthogonal states) to 1 (identical states).
   *
   * @param other - The other quantum system to compare with
   * @returns Fidelity value between 0 and 1
   *
   *
   */
  fidelity(other: Q5mSystem): number;
}

export type { Q5mSystem };
