// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Angle utilities for quantum gate operations.
 *
 * @description
 * This module provides utilities for handling angles in quantum computing,
 * including parsing mathematical expressions and type definitions for radians.
 *
 * @packageDocumentation
 */

/**
 * Represents an angle in radians, typically used for rotation and phase gates.
 *
 */
type Radians = number;

/**
 * Parses a string expression representing an angle into a number.
 * Supports mathematical constants (pi) and functions (sin, cos).
 *
 * @param angle The angle expression (e.g., "pi/2", "0.785") or a number.
 * @returns The parsed angle in radians.
 * @throws {Error} If the angle parameter is missing or the expression is invalid.
 * @category Math
 */
function parseAngle(angle: string | number | undefined): number {
  if (angle === undefined) {
    throw new Error(`angle parameter is required for parseAngle`);
  }
  // If already a number, return as-is
  if (typeof angle === 'number') {
    return angle;
  }

  // Handle string expressions
  try {
    const parser = new MathParser(angle);
    return parser.parse();
  } catch (error) {
    // All errors thrown by MathParser are Error instances
    throw new Error(`Invalid angle expression "${angle}": ${(error as Error).message}`);
  }
}

/**
 * Defines the mathematical constants available in the expression parser.
 * @category Math
 */
interface MathConstants {
  /** The mathematical constant Pi (π). */
  readonly pi: number;
  /** The mathematical constant e (Euler's number). */
  readonly e: number;
  /** The square root of 2. */
  readonly sqrt2: number;
  /** The inverse of the square root of 2 (1/√2). */
  readonly inv_sqrt2: number;
}

/**
 * An object containing supported mathematical constants.
 * @internal
 */
const MATH_CONSTANTS: MathConstants = {
  pi: Math.PI,
  e: Math.E,
  sqrt2: Math.sqrt(2),
  inv_sqrt2: 1 / Math.sqrt(2),
} as const;

/**
 * Enumerates the token types for the mathematical expression parser.
 * @internal
 */
enum TokenType {
  NUMBER = 'NUMBER',
  CONSTANT = 'CONSTANT',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  EOF = 'EOF',
}

/**
 * Type-safe token representations using discriminated unions.
 * @internal
 */
interface NumberToken {
  type: TokenType.NUMBER;
  value: number;
}

interface ConstantToken {
  type: TokenType.CONSTANT;
  value: keyof MathConstants;
}

interface FunctionToken {
  type: TokenType.FUNCTION;
  value: string;
}

interface OperatorToken {
  type: TokenType.OPERATOR;
  value: string;
}

interface LParenToken {
  type: TokenType.LPAREN;
  value: '(';
}

interface RParenToken {
  type: TokenType.RPAREN;
  value: ')';
}

interface EOFToken {
  type: TokenType.EOF;
  value: '';
}

/**
 * Discriminated union of all possible token types.
 * @internal
 */
type Token =
  | NumberToken
  | ConstantToken
  | FunctionToken
  | OperatorToken
  | LParenToken
  | RParenToken
  | EOFToken;

/**
 * A lexer for tokenizing mathematical expressions.
 * @internal
 */
class MathLexer {
  private input: string;
  private position: number = 0;
  private currentChar: string | null;

  constructor(input: string) {
    this.input = input.replace(/\s+/g, ''); // Remove whitespace
    this.currentChar = this.input[0] ?? null;
  }

  getNextToken(): Token {
    while (this.currentChar) {
      // Numbers
      if (/\d/.test(this.currentChar)) {
        return { type: TokenType.NUMBER, value: this.readNumber() };
      }

      // Constants and functions
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        const identifier = this.readIdentifier();

        // Check for constants
        if (identifier in MATH_CONSTANTS) {
          return { type: TokenType.CONSTANT, value: identifier as keyof MathConstants };
        }

        // Check for functions
        const validFunctions = ['sin', 'cos', 'tan', 'sqrt', 'abs', 'ln', 'log'];
        if (validFunctions.includes(identifier)) {
          return { type: TokenType.FUNCTION, value: identifier };
        }

        throw new Error(`Unknown identifier: ${identifier}`);
      }

      // Operators
      if ('+-*/^'.includes(this.currentChar)) {
        const op = this.currentChar;
        this.advance();
        return { type: TokenType.OPERATOR, value: op };
      }

      // Parentheses
      if (this.currentChar === '(') {
        this.advance();
        return { type: TokenType.LPAREN, value: '(' };
      }

      if (this.currentChar === ')') {
        this.advance();
        return { type: TokenType.RPAREN, value: ')' };
      }

      throw new Error(`Invalid character: ${this.currentChar}`);
    }

    return { type: TokenType.EOF, value: '' };
  }

  // ===== Private Methods =====

  private advance(): void {
    this.position++;
    this.currentChar = this.position < this.input.length ? this.input[this.position]! : null;
  }

  private readNumber(): number {
    let numStr = '';
    while (this.currentChar && (/\d/.test(this.currentChar) || this.currentChar === '.')) {
      numStr += this.currentChar;
      this.advance();
    }
    return parseFloat(numStr);
  }

  private readIdentifier(): string {
    let identifier = '';
    while (this.currentChar && /[a-zA-Z_]/.test(this.currentChar)) {
      identifier += this.currentChar;
      this.advance();
    }
    return identifier;
  }
}

/**
 * A parser for evaluating mathematical expressions with operator precedence.
 * @internal
 */
class MathParser {
  private lexer: MathLexer;
  private currentToken: Token;

  constructor(input: string) {
    this.lexer = new MathLexer(input);
    this.currentToken = this.lexer.getNextToken();
  }

  parse(): number {
    const result = this.expression();

    if (this.currentToken.type !== TokenType.EOF) {
      throw new Error('Unexpected tokens after expression');
    }

    return result;
  }

  // ===== Private Methods =====

  private consume(expectedType: TokenType): void {
    if (this.currentToken.type !== expectedType) {
      throw new Error(`Expected ${expectedType}, got ${this.currentToken.type}`);
    }
    this.currentToken = this.lexer.getNextToken();
  }

  private factor(): number {
    let result: number;

    if (this.currentToken.type === TokenType.NUMBER) {
      result = this.currentToken.value; // Now type-safe: value is number
      this.consume(TokenType.NUMBER);
      return result;
    }

    if (this.currentToken.type === TokenType.CONSTANT) {
      const constName = this.currentToken.value; // Now type-safe: value is keyof MathConstants
      result = MATH_CONSTANTS[constName];
      this.consume(TokenType.CONSTANT);
      return result;
    }

    if (this.currentToken.type === TokenType.FUNCTION) {
      const funcName = this.currentToken.value; // Now type-safe: value is string
      this.consume(TokenType.FUNCTION);
      this.consume(TokenType.LPAREN);
      const arg = this.expression();
      this.consume(TokenType.RPAREN);

      switch (funcName) {
        case 'sin':
          return Math.sin(arg);
        case 'cos':
          return Math.cos(arg);
        case 'tan':
          return Math.tan(arg);
        case 'sqrt':
          return Math.sqrt(arg);
        case 'abs':
          return Math.abs(arg);
        case 'ln':
          return Math.log(arg);
        case 'log':
          return Math.log10(arg);
      }
      // Note: default case removed as unknown functions are caught by lexer
    }

    if (this.currentToken.type === TokenType.OPERATOR && this.currentToken.value === '-') {
      this.consume(TokenType.OPERATOR);
      return -this.factor();
    }

    if (this.currentToken.type === TokenType.OPERATOR && this.currentToken.value === '+') {
      this.consume(TokenType.OPERATOR);
      return this.factor();
    }

    if (this.currentToken.type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      result = this.expression();
      this.consume(TokenType.RPAREN);
      return result;
    }

    throw new Error(`Unexpected token: ${this.currentToken.type}`);
  }

  private power(): number {
    let result = this.factor();

    while (this.currentToken.type === TokenType.OPERATOR && this.currentToken.value === '^') {
      this.consume(TokenType.OPERATOR);
      result = Math.pow(result, this.factor());
    }

    return result;
  }

  private term(): number {
    let result = this.power();

    while (
      this.currentToken.type === TokenType.OPERATOR &&
      (this.currentToken.value === '*' || this.currentToken.value === '/')
    ) {
      const op = this.currentToken.value;
      this.consume(TokenType.OPERATOR);

      if (op === '*') {
        result *= this.power();
      } else {
        const divisor = this.power();
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        result /= divisor;
      }
    }

    return result;
  }

  private expression(): number {
    let result = this.term();

    while (
      this.currentToken.type === TokenType.OPERATOR &&
      (this.currentToken.value === '+' || this.currentToken.value === '-')
    ) {
      const op = this.currentToken.value;
      this.consume(TokenType.OPERATOR);

      if (op === '+') {
        result += this.term();
      } else {
        result -= this.term();
      }
    }

    return result;
  }
}

// Exports

// Type exports
export type { Radians, MathConstants };

// Function exports
export { parseAngle };
