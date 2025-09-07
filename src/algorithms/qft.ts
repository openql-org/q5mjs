// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Implements the Quantum Fourier Transform (QFT) algorithm.
 *
 * This module provides functions for constructing circuits that perform the
 * Quantum Fourier Transform (QFT) and its inverse. The QFT is a fundamental
 * building block in many important quantum algorithms, such as Shor's algorithm
 * for factoring and quantum phase estimation.
 *
 * @packageDocumentation
 */

import { Circuit } from '../core/Circuit';

/**
 * Applies the Quantum Fourier Transform (QFT) or its inverse to a set of qubits
 * within a circuit.
 *
 * The QFT is a linear transformation on quantum bits, and is the quantum analogue
 * of the discrete Fourier transform.
 *
 * @param circuit The quantum circuit to which the QFT will be applied.
 * @param startQubit The index of the first qubit in the register to apply QFT to. Defaults to 0.
 * @param numQubits The number of qubits to include in the QFT. Defaults to all qubits from `startQubit`.
 * @param inverse If true, applies the inverse QFT. Defaults to false.
 * @throws {Error} If the specified qubit range is invalid.
 * @category Algorithms
 */
function quantumFourierTransform(
  circuit: Circuit,
  startQubit: number = 0,
  numQubits?: number,
  inverse: boolean = false,
): void {
  const totalQubits = circuit.quantumCount();

  if (numQubits === undefined) {
    numQubits = totalQubits - startQubit;
  }

  if (startQubit < 0 || startQubit >= totalQubits) {
    throw new Error(`Invalid start qubit: ${startQubit}`);
  }

  if (startQubit + numQubits > totalQubits) {
    throw new Error(`QFT range exceeds circuit size`);
  }

  if (inverse) {
    // Apply inverse QFT
    applyInverseQFT(circuit, startQubit, numQubits);
  } else {
    // Apply forward QFT
    applyForwardQFT(circuit, startQubit, numQubits);
  }
}

/**
 * Applies the forward Quantum Fourier Transform.
 * @param circuit The circuit to modify.
 * @param startQubit The starting qubit index.
 * @param numQubits The number of qubits in the transform.
 * @internal
 */
function applyForwardQFT(circuit: Circuit, startQubit: number, numQubits: number): void {
  for (let i = 0; i < numQubits; i++) {
    const targetQubit = startQubit + i;

    // Apply Hadamard to current qubit
    circuit.h(targetQubit);

    // Apply controlled rotations
    for (let j = i + 1; j < numQubits; j++) {
      const controlQubit = startQubit + j;
      const angle = Math.PI / Math.pow(2, j - i);
      circuit.cp(controlQubit, targetQubit, angle);
    }
  }

  // Swap qubits to get correct order
  for (let i = 0; i < Math.floor(numQubits / 2); i++) {
    circuit.swap(startQubit + i, startQubit + numQubits - 1 - i);
  }
}

/**
 * Applies the inverse Quantum Fourier Transform.
 * @param circuit The circuit to modify.
 * @param startQubit The starting qubit index.
 * @param numQubits The number of qubits in the transform.
 * @internal
 */
function applyInverseQFT(circuit: Circuit, startQubit: number, numQubits: number): void {
  // Swap qubits first (reverse of forward QFT)
  for (let i = 0; i < Math.floor(numQubits / 2); i++) {
    circuit.swap(startQubit + i, startQubit + numQubits - 1 - i);
  }

  // Apply inverse rotations and Hadamards in reverse order
  for (let i = numQubits - 1; i >= 0; i--) {
    const targetQubit = startQubit + i;

    // Apply controlled rotations with negative angles
    for (let j = numQubits - 1; j > i; j--) {
      const controlQubit = startQubit + j;
      const angle = -Math.PI / Math.pow(2, j - i);
      circuit.cp(controlQubit, targetQubit, angle);
    }

    // Apply Hadamard
    circuit.h(targetQubit);
  }
}

/**
 * Creates a new circuit that implements the QFT or its inverse.
 *
 * @param numQubits The number of qubits for the QFT circuit.
 * @param inverse If true, creates an inverse QFT circuit. Defaults to false.
 * @returns A new `Circuit` object with the QFT applied.
 * @throws {Error} If numQubits is less than 1.
 * @category Algorithms
 */
function QFT(numQubits: number, inverse: boolean = false): Circuit {
  if (numQubits < 1) {
    throw new Error('Number of targets must be at least 1');
  }

  const circuit = new Circuit(numQubits);
  quantumFourierTransform(circuit, 0, numQubits, inverse);
  return circuit;
}

/**
 * Encodes a classical value using Quantum Fourier Transform.
 * This function prepares a quantum state corresponding to the given value
 * and then applies QFT to it.
 *
 * @param value The classical value to encode (should be < 2^numQubits)
 * @param numQubits The number of qubits to use for encoding
 * @returns A Circuit with the value encoded using QFT
 * @throws {Error} If value is out of range for the given number of qubits
 * @category Algorithms
 *
 */
function qftEncode(value: number, numQubits: number): Circuit {
  if (numQubits < 1) {
    throw new Error('Number of qubits must be at least 1');
  }

  const maxValue = Math.pow(2, numQubits) - 1;
  if (value < 0 || value > maxValue || !Number.isInteger(value)) {
    throw new Error(`Value must be an integer between 0 and ${maxValue}`);
  }

  const circuit = new Circuit(numQubits);

  // Prepare computational basis state corresponding to the value
  const binaryString = value.toString(2).padStart(numQubits, '0');
  for (let i = 0; i < numQubits; i++) {
    if (binaryString[i] === '1') {
      circuit.x(i);
    }
  }

  // Apply QFT to encode the value in the frequency domain
  quantumFourierTransform(circuit, 0, numQubits, false);

  return circuit;
}

// Exports

// Function exports
export { quantumFourierTransform, QFT, qftEncode };
