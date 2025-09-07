// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Implements the Quantum Phase Estimation algorithm.
 *
 * This module provides functions for implementing Quantum Phase Estimation (QPE),
 * a fundamental quantum algorithm used to estimate the phase (eigenvalue) of a
 * unitary operator for a given eigenstate. QPE is a crucial subroutine in many
 * important quantum algorithms, including Shor's algorithm and quantum simulation.
 *
 * **Algorithm Overview:**
 * 1. Prepare control qubits in superposition using Hadamard gates
 * 2. Apply controlled powers of the unitary operator U
 * 3. Apply inverse Quantum Fourier Transform (QFT) to extract the phase
 * 4. Measure to obtain phase estimate with precision 2^(-n)
 *
 * **Mathematical Foundation:**
 * For a unitary operator U with eigenvalue e^(2πiφ) for eigenstate |ψ⟩:
 * U|ψ⟩ = e^(2πiφ)|ψ⟩
 *
 * QPE estimates φ with n bits of precision using n control qubits.
 *
 * @packageDocumentation
 */

import { Circuit } from '../core/Circuit';
import { quantumFourierTransform } from './qft';

/**
 * Applies Quantum Phase Estimation to estimate the phase of a unitary operator.
 *
 * This is the core implementation of QPE that estimates the phase φ such that
 * U|ψ⟩ = e^(2πiφ)|ψ⟩, where U is a unitary operator and |ψ⟩ is an eigenstate.
 *
 * **Algorithm Steps:**
 * 1. Initialize n control qubits in |+⟩ state (superposition)
 * 2. Prepare target qubits in the eigenstate |ψ⟩
 * 3. Apply controlled-U^(2^j) for j = 0, 1, ..., n-1
 * 4. Apply inverse QFT to control register
 * 5. Measure control qubits to read out phase estimate
 *
 * **Precision and Success Probability:**
 * - With n control qubits, achieves precision 2^(-n)
 * - Success probability depends on how close φ is to a n-bit fraction
 * - For exact n-bit phases, success probability is 1
 * - For arbitrary phases, success probability ≥ 4/π² ≈ 40.5%
 *
 * @param circuit The quantum circuit to which QPE will be applied
 * @param controlStart Starting index of control qubits
 * @param numControl Number of control qubits (determines precision)
 * @param targetStart Starting index of target qubits (eigenstate register)
 * @param numTarget Number of target qubits
 * @param unitaryName Name of the unitary operator for controlled applications
 * @param unitaryParams Optional parameters for the unitary operator
 * @throws {Error} If qubit ranges are invalid or overlap
 *
 *
 * @category Algorithms
 */
function quantumPhaseEstimation(
  circuit: Circuit,
  controlStart: number = 0,
  numControl: number = 3,
  targetStart?: number,
  numTarget: number = 1,
  unitaryName: string = 'rz',
  unitaryParams?: { angle?: number; [key: string]: unknown },
): void {
  // Default target starts after control qubits
  if (targetStart === undefined) {
    targetStart = controlStart + numControl;
  }

  // Validation
  validateQPEParameters(circuit, controlStart, numControl, targetStart, numTarget);

  // Step 1: Initialize control qubits in superposition |+⟩^⊗n
  for (let i = 0; i < numControl; i++) {
    circuit.h(controlStart + i);
  }

  // Step 2: Apply controlled powers of U: controlled-U^(2^j)
  // The jth control qubit applies U^(2^j) to the target register
  for (let j = 0; j < numControl; j++) {
    const controlQubit = controlStart + j;
    const power = Math.pow(2, j);

    // Apply controlled-U^(2^j)
    applyControlledUnitaryPowers(
      circuit,
      controlQubit,
      targetStart,
      numTarget,
      unitaryName,
      power,
      unitaryParams,
    );
  }

  // Step 3: Apply inverse QFT to control register to extract phase
  quantumFourierTransform(circuit, controlStart, numControl, true);
}

/**
 * Creates a standalone circuit for Quantum Phase Estimation.
 *
 * This factory function creates a complete QPE circuit with the specified
 * precision and target register size. The circuit is ready for execution
 * after preparing the eigenstate in the target register.
 *
 * @param numControl Number of control qubits (precision bits)
 * @param numTarget Number of target qubits for eigenstate
 * @param unitaryName Name of the unitary operator to analyze
 * @param unitaryParams Optional parameters for the unitary operator
 * @returns New Circuit with QPE applied
 * @throws {Error} If parameters are invalid
 *
 *
 * @category Algorithms
 */
function QPE(
  numControl: number,
  numTarget: number,
  unitaryName: string = 'rz',
  unitaryParams?: { angle?: number; [key: string]: unknown },
): Circuit {
  if (numControl < 1) {
    throw new Error('Number of control qubits must be at least 1');
  }
  if (numTarget < 1) {
    throw new Error('Number of target qubits must be at least 1');
  }

  const totalQubits = numControl + numTarget;
  const circuit = new Circuit(totalQubits);

  quantumPhaseEstimation(circuit, 0, numControl, numControl, numTarget, unitaryName, unitaryParams);

  return circuit;
}

/**
 * Estimates the phase of a specific eigenstate preparation.
 *
 * This convenience function combines eigenstate preparation with phase estimation
 * for common use cases. It automatically prepares known eigenstates and applies QPE.
 *
 * @param numControl Number of control qubits (precision)
 * @param unitaryName Unitary operator to analyze
 * @param eigenstateType Type of eigenstate to prepare
 * @param unitaryParams Optional unitary parameters
 * @returns Circuit ready for phase estimation measurement
 *
 *
 * @category Algorithms
 */
function estimatePhase(
  numControl: number,
  unitaryName: string,
  eigenstateType: '0' | '1' | '+' | '-' | 'i' | '-i' = '0',
  unitaryParams?: { angle?: number; [key: string]: unknown },
): Circuit {
  const circuit = QPE(numControl, 1, unitaryName, unitaryParams);
  const targetQubit = numControl; // First target qubit

  // Prepare the specified eigenstate
  prepareEigenstate(circuit, targetQubit, eigenstateType);

  return circuit;
}

/**
 * Decodes a QPE measurement result into a phase estimate.
 *
 * Converts the binary measurement outcome from the control register
 * into the corresponding phase estimate φ ∈ [0, 1).
 *
 * @param measurement Measurement result as integer (0 to 2^n - 1)
 * @param numBits Number of control qubits used (precision bits)
 * @returns Phase estimate φ where 0 ≤ φ < 1
 *
 *
 * @category Algorithms
 */
function decodePhaseEstimate(measurement: number, numBits: number): number {
  if (measurement < 0 || measurement >= Math.pow(2, numBits)) {
    throw new Error(`Measurement ${measurement} is out of range for ${numBits} bits`);
  }

  return measurement / Math.pow(2, numBits);
}

/**
 * Estimates the required number of control qubits for desired precision.
 *
 * Calculates the minimum number of control qubits needed to distinguish
 * phases with the specified precision δ with high success probability.
 *
 * @param precision Desired precision δ (phase resolution)
 * @param successProbability Minimum success probability (default: 0.9)
 * @returns Minimum number of control qubits needed
 *
 *
 * @category Algorithms
 */
function estimateControlQubits(precision: number, successProbability: number = 0.9): number {
  if (precision <= 0 || precision >= 1) {
    throw new Error('Precision must be between 0 and 1');
  }
  if (successProbability <= 0 || successProbability >= 1) {
    throw new Error('Success probability must be between 0 and 1');
  }

  // Theoretical minimum for precision
  const minForPrecision = Math.ceil(-Math.log2(precision));

  // Additional qubits for high success probability
  // Based on analysis of QPE success probability bounds
  const additionalBits = Math.ceil(-Math.log2(1 - successProbability) / 2);

  return minForPrecision + additionalBits;
}

/**
 * Validates QPE parameters for correctness.
 * @internal
 */
function validateQPEParameters(
  circuit: Circuit,
  controlStart: number,
  numControl: number,
  targetStart: number,
  numTarget: number,
): void {
  const totalQubits = circuit.quantumCount();

  if (numControl < 1) {
    throw new Error('Number of control qubits must be at least 1');
  }
  if (numTarget < 1) {
    throw new Error('Number of target qubits must be at least 1');
  }

  if (controlStart < 0 || controlStart >= totalQubits) {
    throw new Error(`Control start ${controlStart} out of range`);
  }
  if (targetStart < 0 || targetStart >= totalQubits) {
    throw new Error(`Target start ${targetStart} out of range`);
  }

  if (controlStart + numControl > totalQubits) {
    throw new Error(`Control qubits exceed circuit size`);
  }
  if (targetStart + numTarget > totalQubits) {
    throw new Error(`Target qubits exceed circuit size`);
  }

  // Check for overlap between control and target registers
  const controlEnd = controlStart + numControl;
  const targetEnd = targetStart + numTarget;

  if (controlStart < targetEnd && controlEnd > targetStart) {
    throw new Error('Control and target qubit ranges cannot overlap');
  }
}

/**
 * Applies controlled powers of a unitary operator.
 * @internal
 */
function applyControlledUnitaryPowers(
  circuit: Circuit,
  controlQubit: number,
  targetStart: number,
  numTarget: number,
  unitaryName: string,
  power: number,
  unitaryParams?: { angle?: number; [key: string]: unknown },
): void {
  // Apply U^power with controlQubit as control
  for (let rep = 0; rep < power; rep++) {
    for (let t = 0; t < numTarget; t++) {
      const targetQubit = targetStart + t;
      applyControlledUnitary(circuit, controlQubit, targetQubit, unitaryName, unitaryParams);
    }
  }
}

/**
 * Applies a controlled unitary gate.
 * @internal
 */
function applyControlledUnitary(
  circuit: Circuit,
  control: number,
  target: number,
  unitaryName: string,
  params?: { angle?: number; [key: string]: unknown },
): void {
  const name = unitaryName.toLowerCase();

  switch (name) {
    case 'z':
      circuit.cz(control, target);
      break;
    case 'x':
      circuit.cnot(control, target);
      break;
    case 'y':
      circuit.cy(control, target);
      break;
    case 'h':
      circuit.ch(control, target);
      break;
    case 's':
      // Controlled-S: decompose as controlled-phase(π/2)
      circuit.cp(control, target, Math.PI / 2);
      break;
    case 't':
      // Controlled-T: decompose as controlled-phase(π/4)
      circuit.cp(control, target, Math.PI / 4);
      break;
    case 'rz':
      if (params?.angle !== undefined) {
        // Controlled-RZ: decompose as controlled-phase
        circuit.cp(control, target, params.angle);
      } else {
        throw new Error('RZ gate requires angle parameter');
      }
      break;
    case 'ry':
      if (params?.angle !== undefined) {
        // Controlled-RY: more complex decomposition needed
        // RY(θ) can be decomposed using Pauli gates and controlled phases
        // For now, we'll use a simplified approximation using controlled phase
        circuit.cp(control, target, params.angle / 2);
      } else {
        throw new Error('RY gate requires angle parameter');
      }
      break;
    case 'rx':
      if (params?.angle !== undefined) {
        // Controlled-RX: similar to RY, simplified using controlled phase
        circuit.cp(control, target, params.angle / 2);
      } else {
        throw new Error('RX gate requires angle parameter');
      }
      break;
    default:
      throw new Error(`Unsupported unitary for controlled application: ${unitaryName}`);
  }
}

/**
 * Prepares specific eigenstate on a target qubit.
 * @internal
 */
function prepareEigenstate(circuit: Circuit, qubit: number, eigenstateType: string): void {
  switch (eigenstateType) {
    case '0':
      // |0⟩ is the default state, no preparation needed
      break;
    case '1':
      circuit.x(qubit);
      break;
    case '+':
      circuit.h(qubit);
      break;
    case '-':
      circuit.x(qubit);
      circuit.h(qubit);
      break;
    case 'i':
      circuit.h(qubit);
      circuit.s(qubit);
      break;
    case '-i':
      circuit.h(qubit);
      circuit.s(qubit);
      circuit.z(qubit);
      break;
    default:
      throw new Error(`Unknown eigenstate type: ${eigenstateType}`);
  }
}

// Exports

// Function exports
export { quantumPhaseEstimation, QPE, estimatePhase, decodePhaseEstimate, estimateControlQubits };
