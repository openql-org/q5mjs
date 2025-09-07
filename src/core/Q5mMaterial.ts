// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Quantum material representation for q5m.js quantum computing.
 *
 * This module provides the Q5mMaterial class, which represents quantum materials
 * and their properties in quantum systems.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import type { Amplitude, Hermitian } from '../math/math-utils';

type DensityMatrix = Hermitian;
type StateVector = Amplitude[];

/**
 * Represents the index of a quantum element (qubit) in a quantum circuit or state.
 * It is a non-negative integer, with 0 being the index of the first quantum element.
 *
 */
type Q5mIndex = number;

/**
 * Type guard to check if a value is a valid Q5m index.
 *
 * @param value - Value to check
 * @returns True if value is a non-negative integer
 *
 */
function isValidQ5mIndex(value: unknown): value is Q5mIndex {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Validates that a Q5m index is within the valid range for a given system size.
 *
 * @param index - The Q5m index to validate
 * @param maxSize - The maximum valid index (exclusive)
 * @throws {Error} If index is out of range
 *
 */
function validateQ5mIndex(index: Q5mIndex, maxSize: number): void {
  if (index < 0 || index >= maxSize) {
    throw new Error(`Qubit index ${index} out of range`);
  }
}

/**
 * Represents a quantum material with its properties and characteristics.
 *
 * Q5mMaterial serves as the base class for defining quantum materials
 * used in quantum computing simulations and calculations. It maintains
 * an array of material states and tracks the number of quantum states.
 *
 * Type parameter T must be either Amplitude[] or DensityMatrix.
 *
 * @category Core Classes
 */
class Q5mMaterial<T extends StateVector | DensityMatrix = StateVector> {
  /**
   * Number of quantum states.
   */
  private stateNum: number;

  /**
   * The material state of type T.
   */
  protected material: T;

  /**
   * Creates a new Q5mMaterial instance.
   *
   * @param stateNum Number of quantum states
   * @param material The material state. If not provided, creates default based on type T.
   */
  constructor(stateNum: number, material?: T) {
    this.stateNum = stateNum;
    if (material !== undefined) {
      this.material = material;
    } else {
      this.material = [] as unknown as T;
    }
  }

  /**
   * Gets the material.
   *
   * @returns The material of type T
   */
  getMaterial(): T {
    return this.material;
  }

  /**
   * Sets the material.
   *
   * @param material New material of type T
   */
  setMaterial(material: T): void {
    this.material = material;
  }

  /**
   * Gets the number of quantum states.
   *
   */
  getStateNum(): number {
    return this.stateNum;
  }

  /**
   * Sets the number of quantum states.
   *
   * @param stateNum New number of quantum states
   */
  setStateNum(stateNum: number): void {
    this.stateNum = stateNum;
  }
}

export type { DensityMatrix, StateVector, Q5mIndex };
export { Q5mMaterial, isValidQ5mIndex, validateQ5mIndex };
