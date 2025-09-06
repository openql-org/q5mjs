// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Quantum amplitude operations for quantum computing.
 *
 * @description
 * This module provides specialized operations for quantum amplitudes, which are
 * complex numbers that describe the probability weight of basis states in quantum
 * mechanics. Amplitudes are fundamental to quantum state representation.
 *
 * @packageDocumentation
 */

import type { Complex } from './complex';
import { complex } from './complex';
import { normalize } from './vector-matrix';

/**
 * Represents a quantum amplitude, a complex number describing the probability weight of a basis state.
 * The squared magnitude of an amplitude, |α|², gives the probability of measuring that basis state.
 * For a valid quantum state, the sum of squared magnitudes of all amplitudes must equal 1.
 *
 */
type Amplitude = Complex;

/**
 * Formats a complex number into a human-readable string.
 *
 * @param c The complex number to format.
 * @param precision The number of decimal places for the real and imaginary parts. Defaults to 3.
 * @returns A formatted string representation (e.g., "3.000 - 4.000i").
 * @category Math
 */
const formatAmplitude = (c: Amplitude, precision: number = 3): string => {
  const real = c.re;
  const imag = c.im;

  if (Math.abs(imag) < Math.pow(10, -precision)) {
    return real.toFixed(precision);
  }

  if (Math.abs(real) < Math.pow(10, -precision)) {
    if (Math.abs(imag - 1) < Math.pow(10, -precision)) {
      return 'i';
    }
    if (Math.abs(imag + 1) < Math.pow(10, -precision)) {
      return '-i';
    }
    return `${imag.toFixed(precision)}i`;
  }

  const imagStr = imag >= 0 ? `+${imag.toFixed(precision)}i` : `${imag.toFixed(precision)}i`;

  return `${real.toFixed(precision)}${imagStr}`;
};

/**
 * Type guard to check if a Complex value is a valid amplitude (magnitude ≤ 1).
 *
 * @param value - Complex value to check
 * @returns True if the magnitude is ≤ 1
 *
 */
function isValidAmplitude(value: Complex): value is Amplitude {
  const magnitude = Math.sqrt(value.re * value.re + value.im * value.im);
  return magnitude <= 1.0 + 1e-10; // Allow small numerical errors
}

/**
 * Creates a validated amplitude from real and imaginary components.
 * Throws if the magnitude is greater than 1.
 *
 * @param real - Real component
 * @param imag - Imaginary component (default: 0)
 * @returns Valid quantum amplitude
 * @throws Error if magnitude > 1
 *
 */
function createAmplitude(real: number, imag: number = 0): Amplitude {
  const value = complex(real, imag);
  if (!isValidAmplitude(value)) {
    const magnitude = Math.sqrt(real * real + imag * imag);
    throw new Error(`Invalid amplitude: magnitude ${magnitude} > 1`);
  }
  return value;
}

/**
 * Normalizes an array of complex numbers to ensure they form valid quantum amplitudes.
 * The normalized amplitudes will satisfy Σ|αᵢ|² = 1.
 * Optionally skips normalization if the norm is below a threshold.
 *
 * @param values - Array of complex numbers to normalize
 * @param tolerance - Minimum norm threshold below which the vector is considered zero (default: 1e-12)
 * @param tolerant - Optional minimum norm threshold. If provided, normalization is skipped if norm <= threshold.
 * @returns Normalized amplitude array, or unchanged if below tolerant threshold
 * @throws Error if input is zero vector (norm below tolerance and tolerant not provided)
 *
 */
function normalizeAmplitudes(
  values: Amplitude[],
  tolerance: number = 1e-12,
  tolerant?: number,
): Amplitude[] {
  return normalize(values, tolerance, tolerant) as Amplitude[];
}

/**
 * Checks if a complex number is approximately zero within a given tolerance.
 *
 * @param c The complex number to check.
 * @param tolerance The numerical tolerance for the check. Defaults to 1e-10.
 * @returns `true` if the absolute value of the complex number is less than the tolerance.
 * @category Math
 */
const isZero = (c: Amplitude, tolerance: number = 1e-10): boolean => {
  return c.abs() < tolerance;
};

/**
 * Checks if two complex numbers are approximately equal within a given tolerance.
 *
 * @param a The first complex number.
 * @param b The second complex number.
 * @param tolerance The numerical tolerance for the comparison. Defaults to 1e-10.
 * @returns `true` if the absolute difference between the numbers is less than the tolerance.
 * @category Math
 */
const areEqual = (a: Amplitude, b: Complex, tolerance: number = 1e-10): boolean => {
  return a.sub(b).abs() < tolerance;
};

export type { Amplitude };

export {
  formatAmplitude,
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isZero,
  areEqual,
};
