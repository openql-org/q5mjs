// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Circuit Format Converters
 *
 * @description
 * This module provides tools for converting q5m.js quantum circuits into formats
 * compatible with other major quantum computing frameworks. This enables
 * interoperability and allows users to leverage tools from different ecosystems.
 *
 * Currently supported frameworks:
 * - **Qiskit**: For IBM Quantum hardware and simulators.
 * - **OpenQASM**: A widely used quantum assembly language.
 * - **Cirq**: For Google Quantum AI hardware and simulators.
 *
 * @packageDocumentation
 */

/**
 * Converters for Qiskit (IBM Quantum).
 * @see https://qiskit.org/
 */
export { exportToQiskit, type QiskitExportOptions, type QiskitExporterType } from './qiskit';

/**
 * Converters for OpenQASM (Quantum Assembly Language).
 * @see https://openqasm.com/
 */
export {
  exportToOpenQASM,
  exportToOpenQASM3,
  type OpenQASMExportOptions,
  type OpenQASMExporterType,
} from './openqasm';

/**
 * Converters for Cirq (Google Quantum AI).
 * @see https://quantumai.google/cirq
 */
export {
  exportToCirq,
  exportToCirqJSON,
  type CirqExportOptions,
  type CirqExporterType,
  type CirqJSONExporterType,
} from './cirq';
