// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Complex number implementation and constants.
 *
 * @description
 * This module provides a native TypeScript implementation for handling
 * complex numbers, which are fundamental to quantum mechanics.
 * It includes a cached factory function for performance and exports common
 * mathematical constants as complex numbers.
 *
 * **Implementation:**
 * - Native TypeScript implementation of complex number operations
 * - Provides cached factory function for performance optimization
 * - Exports commonly used complex number constants for quantum computing
 *
 * @packageDocumentation
 */

/**
 * Native implementation of a complex number class.
 * Represents a complex number with real and imaginary parts.
 * @category Math
 */
class Complex {
  public readonly re: number;
  public readonly im: number;

  constructor(re: number, im: number = 0) {
    this.re = re;
    this.im = im;
  }

  /**
   * Adds another complex number to this one.
   *
   * @param other The complex number to add
   * @returns A new complex number representing the sum
   *
   */
  add(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re + other, this.im);
    }
    return new Complex(this.re + other.re, this.im + other.im);
  }

  /**
   * Subtracts another complex number from this one.
   * @param other The complex number to subtract
   * @returns A new complex number representing the difference
   */
  sub(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re - other, this.im);
    }
    return new Complex(this.re - other.re, this.im - other.im);
  }

  /**
   * Multiplies this complex number by another.
   *
   * @param other The complex number to multiply by
   * @returns A new complex number representing the product
   *
   *
   */
  mul(other: Complex | number): Complex {
    if (typeof other === 'number') {
      return new Complex(this.re * other, this.im * other);
    }
    const re = this.re * other.re - this.im * other.im;
    const im = this.re * other.im + this.im * other.re;
    return new Complex(re, im);
  }

  /**
   * Divides this complex number by another.
   * @param other The complex number to divide by
   * @returns A new complex number representing the quotient
   * @throws {Error} If dividing by zero
   */
  div(other: Complex | number): Complex {
    if (typeof other === 'number') {
      if (other === 0) {
        throw new Error('Division by zero');
      }
      return new Complex(this.re / other, this.im / other);
    }
    const denominator = other.re * other.re + other.im * other.im;
    if (denominator === 0) {
      throw new Error('Division by zero');
    }
    const re = (this.re * other.re + this.im * other.im) / denominator;
    const im = (this.im * other.re - this.re * other.im) / denominator;
    return new Complex(re, im);
  }

  /**
   * Returns the complex conjugate of this number.
   * @returns A new complex number representing the conjugate
   */
  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  /**
   * Returns the magnitude (absolute value) of this complex number.
   * @returns The magnitude as a real number
   */
  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  /**
   * Returns the argument (phase angle) of this complex number in radians.
   * @returns The argument as a real number
   */
  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  /**
   * Returns the exponential of this complex number.
   * @returns A new complex number representing e^(this)
   */
  exp(): Complex {
    const expRe = Math.exp(this.re);
    return new Complex(expRe * Math.cos(this.im), expRe * Math.sin(this.im));
  }

  /**
   * Returns the square root of this complex number.
   * @returns A new complex number representing the square root
   */
  sqrt(): Complex {
    const magnitude = this.abs();
    const angle = this.arg() / 2;
    const sqrtMag = Math.sqrt(magnitude);
    return new Complex(sqrtMag * Math.cos(angle), sqrtMag * Math.sin(angle));
  }

  /**
   * Raises this complex number to the given power.
   * @param exponent The exponent (real number)
   * @returns A new complex number representing this^exponent
   */
  pow(exponent: number): Complex {
    if (exponent === 0) return new Complex(1, 0);
    if (exponent === 1) return new Complex(this.re, this.im);

    const magnitude = Math.pow(this.abs(), exponent);
    const angle = this.arg() * exponent;
    return new Complex(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }

  /**
   * Negates this complex number.
   * @returns A new complex number representing -this
   */
  neg(): Complex {
    return new Complex(-this.re, -this.im);
  }

  /**
   * Checks if this complex number equals another.
   * @param other The complex number to compare to
   * @param tolerance Optional tolerance for floating point comparison
   * @returns True if the numbers are equal within tolerance
   */
  equals(other: Complex, tolerance: number = 1e-10): boolean {
    return Math.abs(this.re - other.re) < tolerance && Math.abs(this.im - other.im) < tolerance;
  }

  /**
   * Returns a string representation of this complex number.
   * @returns String representation in the form "a + bi"
   */
  toString(): string {
    if (this.im === 0) return this.re.toString();
    if (this.re === 0) return this.im === 1 ? 'i' : this.im === -1 ? '-i' : `${this.im}i`;

    const sign = this.im >= 0 ? '+' : '-';
    const absIm = Math.abs(this.im);
    const imPart = absIm === 1 ? 'i' : `${absIm}i`;
    return `${this.re} ${sign} ${imPart}`;
  }
}

const _commonValues: Complex[] = [];

const _initCommonValues = (): void => {
  for (let re = -2; re <= 2; re++) {
    for (let im = -2; im <= 2; im++) {
      const index = ((re + 2) << 3) | (im + 2);
      _commonValues[index] = new Complex(re, im);
    }
  }
};

const _stringCache = new Map<string, Complex>();

/**
 * Creates a complex number from its real and imaginary parts.
 * Uses caching for performance optimization.
 *
 * @param re The real part of the complex number.
 * @param im The imaginary part of the complex number. Defaults to 0.
 * @returns A `Complex` number instance.
 * @category Math
 *
 *
 *
 */
const complex = (re: number, im: number = 0): Complex => {
  // Fast path for common integer values
  if (Number.isInteger(re) && Number.isInteger(im) && re >= -2 && re <= 2 && im >= -2 && im <= 2) {
    const index = ((re + 2) << 3) | (im + 2);
    return _commonValues[index]!;
  }

  // Cache other values to avoid repeated object creation
  const key = `${re.toPrecision(15)},${im.toPrecision(15)}`;
  let cached = _stringCache.get(key);
  if (!cached) {
    cached = new Complex(re, im);
    if (_stringCache.size < 5000) {
      _stringCache.set(key, cached);
    }
  }
  return cached;
};

_initCommonValues();

/** The complex number zero (0 + 0i). */
const ZERO = complex(0, 0);

/** The complex number one (1 + 0i). */
const ONE = complex(1, 0);

/** The imaginary unit `i` (0 + 1i). */
const I = complex(0, 1);

/** The complex number minus one (-1 + 0i). */
const MINUS_ONE = complex(-1, 0);

/** The negative imaginary unit `-i` (0 - 1i). */
const MINUS_I = complex(0, -1);

/** The square root of 2 (≈ 1.414). */
const SQRT2 = Math.sqrt(2);

/** The inverse square root of 2 (1/√2 ≈ 0.707), common in quantum gates. */
const INV_SQRT2 = 1 / Math.sqrt(2);

/** A complex number representing 1/√2. */
const INV_SQRT2_COMPLEX = complex(INV_SQRT2, 0);

/** A complex number representing 0.5. */
const HALF = complex(0.5, 0);

/** The mathematical constant π (Pi). */
const PI = Math.PI;

export { Complex };

export { complex };

export { ZERO, ONE, I, MINUS_ONE, MINUS_I, SQRT2, INV_SQRT2, INV_SQRT2_COMPLEX, HALF, PI };

export { Complex as ComplexConstructor };
