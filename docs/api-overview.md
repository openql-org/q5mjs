# q5m.js API Reference

## Overview

q5m.js provides a comprehensive TypeScript API for quantum computing simulations, featuring automatic performance optimization, multiple entry points, and excellent IDE support. This reference covers all public APIs and their usage patterns.

## Package Entry Points

### Core Entry (`q5m/core`)
Lightweight bundle with essential quantum computing primitives:
```typescript
import { Circuit, QubitState, Q5mState } from '@q5m/q5m/core';
import { complex, createUnitary } from '@q5m/q5m/core';
```

### Full Entry (`q5m`)
Complete library with all features:
```typescript
import { 
  Circuit, 
  QubitState, 
  groverSearch, 
  quantumFourierTransform,
  exportToQiskit 
} from '@q5m/q5m';
```

### Algorithm-only Entry (`q5m/packages`)
Algorithms and converters without core:
```typescript
import { groverSearch, exportToQiskit } from '@q5m/q5m/packages';
```

## Core Classes

### Circuit

Primary interface for quantum circuit construction and execution.

#### Constructor
```typescript
class Circuit {
  constructor(numQubits: number, initialState?: QubitState);
}
```

**Parameters:**
- `numQubits: number` - Number of qubits in the circuit
- `initialState?: QubitState` - Optional custom initial quantum state

**Example:**
```typescript
// Default |0...0⟩ initial state
const circuit = new Circuit(3);

// Custom initial state
const customState = new QubitState(2, [
  complex(0.6, 0), complex(0, 0.8), complex(0, 0), complex(0, 0)
]);
const circuitWithCustomState = new Circuit(2, customState);
```

#### Single-Qubit Gates

```typescript
// Pauli gates
h(qubit: number): Circuit;        // Hadamard
x(qubit: number): Circuit;        // Pauli-X (NOT)
y(qubit: number): Circuit;        // Pauli-Y  
z(qubit: number): Circuit;        // Pauli-Z

// Phase gates
s(qubit: number): Circuit;        // S gate (√Z)
t(qubit: number): Circuit;        // T gate (√S)
phase(angle: number, qubit: number): Circuit;  // Arbitrary phase

// Rotation gates  
rx(angle: number, qubit: number): Circuit;     // X rotation
ry(angle: number, qubit: number): Circuit;     // Y rotation
rz(angle: number, qubit: number): Circuit;     // Z rotation
```

**Example:**
```typescript
const circuit = new Circuit(2);
circuit
  .h(0)                          // Superposition on qubit 0
  .rz(Math.PI / 4, 1)           // π/4 Z rotation on qubit 1  
  .phase(Math.PI / 8, 0);       // π/8 phase on qubit 0
```

#### Two-Qubit Gates

```typescript
// CNOT variants
cnot(control: number, target: number): Circuit;
cx(control: number, target: number): Circuit;    // Alias for cnot

// Other controlled gates
cz(control: number, target: number): Circuit;    // Controlled-Z
cy(control: number, target: number): Circuit;    // Controlled-Y  
ch(control: number, target: number): Circuit;    // Controlled-Hadamard

// SWAP gate
swap(qubit1: number, qubit2: number): Circuit;

// Controlled phase
cp(angle: number, control: number, target: number): Circuit;
```

**Example:**
```typescript
const circuit = new Circuit(3);
circuit
  .h(0).h(1)                    // Superposition on qubits 0,1
  .cnot(0, 1)                   // Entangle 0 and 1
  .cz(1, 2)                     // Controlled-Z from 1 to 2
  .swap(0, 2);                  // Swap qubits 0 and 2
```

#### Multi-Qubit Gates

```typescript
// Multi-Hadamard (parallel Hadamard gates)
hh(qubits: number[]): Circuit;

// Controlled unitary  
cu(matrix: Matrix, control: number, target: number): Circuit;
```

**Example:**
```typescript
const circuit = new Circuit(4);

// Apply Hadamard to multiple qubits simultaneously
circuit.hh([0, 1, 2]);

// Custom controlled unitary
const customUnitary = [
  [complex(0.8, 0), complex(0.6, 0)],
  [complex(0.6, 0), complex(-0.8, 0)]
];
circuit.cu(customUnitary, 0, 3);
```

#### Measurement Operations

```typescript
// Basis measurements
mz(qubit: number): Circuit;           // Z-basis measurement
mx(qubit: number): Circuit;           // X-basis measurement  
my(qubit: number): Circuit;           // Y-basis measurement
mp(phase: number, qubit: number): Circuit;  // Phase measurement

// Multi-qubit measurements
measure(qubits: number | number[]): Circuit;
```

**Example:**
```typescript
const circuit = new Circuit(3);
circuit
  .h(0).cnot(0, 1).cnot(1, 2)      // GHZ state preparation
  .measure([0, 1, 2]);             // Measure all qubits

// Different basis measurements
circuit
  .mz(0)                           // Z-basis measurement
  .mx(1)                           // X-basis measurement
  .mp(Math.PI / 4, 2);            // Phase measurement with π/4
```

#### Advanced Gate Manipulation

Advanced methods for precise circuit construction with position-based gate operations:

```typescript
// Insert gate at specific instruction index
insertGate(index: number, gateName: string, wire: Q5mIndex | Q5mIndex[], options?: GateOptions): Circuit;

// Remove gate by instruction index  
removeGate(index: number): Circuit;

// Replace gate at specific position
replaceGate(index: number, gateName: string, wire: Q5mIndex | Q5mIndex[], options?: GateOptions): Circuit;

// Add gate at specific column position
addGate(gateName: string, wire: Q5mIndex | Q5mIndex[], column: number, options?: GateOptions): Circuit;

// Delete gate by column and wire position  
deleteGate(wire: Q5mIndex | Q5mIndex[], column: number): Circuit;
```

**Example:**
```typescript
const circuit = new Circuit(3);

// Build initial circuit
circuit.h(0).cnot(0, 1).x(2);

// Advanced manipulation
circuit
  .insertGate(1, 'Y', 1)          // Insert Y gate at position 1
  .addGate('Z', 0, 1)            // Add Z gate at wire 0, column 1
  .replaceGate(0, 'H', 2)        // Replace first gate with H on qubit 2
  .deleteGate(0, 1);             // Delete gate at wire 0, column 1

console.log('Modified circuit:', circuit.toString());
```

#### Circuit Execution & Utilities

```typescript
// Execute circuit and return final state
execute(): QubitState;

// Circuit inspection
toString(): string;
clone(): Circuit;

// Properties  
get numQubits(): number;
get depth(): number;
```

**Example:**
```typescript
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

// Execute and get results
const finalState = circuit.execute();
console.log('Final probabilities:', finalState.probabilities());

// Circuit information
console.log('Circuit depth:', circuit.depth);
console.log('ASCII representation:\n', circuit.toString());

// Clone for modifications
const modifiedCircuit = circuit.clone();
modifiedCircuit.z(0);
```

### QubitState

Quantum state representation with automatic sparse/dense optimization.

#### Constructor
```typescript
class QubitState extends Q5mState {
  constructor(
    numQubits: number, 
    amplitudes?: Amplitude[], 
    enableSparse?: boolean
  );
}
```

**Parameters:**
- `numQubits: number` - Number of qubits
- `amplitudes?: Amplitude[]` - Optional initial state vector
- `enableSparse?: boolean` - Force sparse representation

**Example:**
```typescript
// Default |000...⟩ state
const state = new QubitState(5);

// Custom amplitudes (normalized automatically)
const bellState = new QubitState(2, [
  complex(1/Math.sqrt(2), 0),  // |00⟩
  complex(0, 0),               // |01⟩
  complex(0, 0),               // |10⟩ 
  complex(1/Math.sqrt(2), 0)   // |11⟩
]);

// Force sparse representation for large systems
const largeState = new QubitState(20, undefined, true);
```

#### State Access Methods

```typescript
// Get all amplitudes
amplitudes(): Amplitude[];

// Get specific amplitude
amplitude(basisIndex: number): Amplitude;

// Get all probabilities  
probabilities(): Probability[];

// Get specific probability
probability(basisIndex: number): number;

// Get quantum properties
quantumCount(): number;
stateCount(): number;
```

**Example:**
```typescript
const state = new QubitState(2);
// ... apply some operations ...

// Access state information
const amps = state.amplitudes();
console.log('State vector:', amps);

// Specific amplitude (using binary notation)
const amp01 = state.amplitude(0b01);  // |01⟩ amplitude
const prob11 = state.probability(0b11);  // |11⟩ probability

console.log('Amplitude of |01⟩:', amp01.toString());
console.log('Probability of |11⟩:', prob11);
```

#### State Operations

```typescript
// Apply unitary operator
apply(operator: Q5mOperator<Unitary>): QubitState;

// Normalize state
normalize(): QubitState;

// Create new state with different amplitudes
withAmplitudes(newAmplitudes: Amplitude[]): QubitState;

// State comparisons
innerProduct(other: QubitState): Amplitude;
```

**Example:**
```typescript
const state1 = new QubitState(2);
const state2 = new QubitState(2, [
  complex(0, 0), complex(1, 0), complex(0, 0), complex(0, 0)
]);

// Compute inner product ⟨state1|state2⟩
const overlap = state1.innerProduct(state2);
console.log('States overlap:', overlap.abs());

// Normalize (usually done automatically)
const normalizedState = state1.normalize();
```

#### Performance Methods

```typescript
// Memory usage information
memoryUsage(): number;

// Representation information  
get isDense(): boolean;
get sparsity(): number;
```

**Example:**
```typescript
const largeState = new QubitState(15);
// ... apply sparse operations ...

console.log('Memory usage:', largeState.memoryUsage(), 'bytes');
console.log('Is dense representation:', largeState.isDense);
console.log('Sparsity level:', largeState.sparsity);
```

### Q5mState (Base Class)

Abstract base class providing common quantum state functionality.

```typescript
abstract class Q5mState<TMaterial> {
  // Abstract methods (implemented by subclasses)
  abstract apply(operator: Q5mOperator<Unitary>): Q5mState;
  abstract normalize(): Q5mState;
  abstract withAmplitudes(newAmplitudes: Amplitude[]): Q5mState;
  
  // Common functionality
  amplitudes(): Amplitude[];
  amplitude(index: number): Amplitude;
  probabilities(): Probability[];
  probability(index: number): number;
  innerProduct(other: Q5mState): Amplitude;
  quantumCount(): number;
  memoryUsage(): number;
}
```

## Mathematical Types & Utilities

### Complex Numbers

```typescript
class Complex {
  constructor(public re: number, public im: number);
  
  // Arithmetic operations
  add(other: Complex): Complex;
  sub(other: Complex): Complex;
  mul(other: Complex): Complex;
  div(other: Complex): Complex;
  
  // Unary operations
  conjugate(): Complex;
  abs(): number;
  arg(): number;
  
  // Utility
  toString(): string;
  equals(other: Complex, tolerance?: number): boolean;
  
  // Constants
  static readonly ZERO: Complex;
  static readonly ONE: Complex;
  static readonly I: Complex;
}

// Factory function
function complex(re: number, im: number = 0): Complex;
```

**Example:**
```typescript
import { complex, Complex } from '@q5m/q5m';

const z1 = complex(3, 4);        // 3 + 4i
const z2 = complex(1, -2);       // 1 - 2i

const sum = z1.add(z2);          // 4 + 2i
const product = z1.mul(z2);      // 11 - 2i
const magnitude = z1.abs();      // 5

console.log('Sum:', sum.toString());
console.log('Product:', product.toString()); 
console.log('|z1|:', magnitude);
```

### Matrix Types & Operations

```typescript
// Type aliases
type Matrix = Complex[][];
type Unitary = Matrix;
type Hermitian = Matrix;
type StateVector = Complex[];

// Matrix creation utilities
function createUnitary(matrix: number[][]): Unitary;
function createHermitian(matrix: number[][]): Hermitian;

// Matrix validation
function isUnitary(matrix: Matrix): boolean;
function isHermitian(matrix: Matrix): boolean;

// Matrix operations
function matXvec(matrix: Matrix, vector: StateVector): StateVector;
function matXmat(matrix1: Matrix, matrix2: Matrix): Matrix;
function tensorP(matrix1: Matrix, matrix2: Matrix): Matrix;
```

**Example:**
```typescript
import { createUnitary, isUnitary, matXvec } from '@q5m/q5m';

// Create Pauli-X matrix
const pauliX = createUnitary([
  [0, 1],
  [1, 0]
]);

console.log('Is unitary:', isUnitary(pauliX));

// Apply to state vector
const state = [complex(1, 0), complex(0, 0)];
const newState = matXvec(pauliX, state);
console.log('After X gate:', newState);
```

## Quantum Algorithms

### Grover's Search Algorithm

```typescript
// Search for specific bit pattern
function groverSearchForItem(numQubits: number, targetItem: string): QubitState;

// Custom oracle search
function groverSearch(
  numQubits: number, 
  oracle: (bitString: string) => boolean,
  iterations?: number
): QubitState;

// Utility functions
function groverOptimalIterations(numQubits: number): number;
function groverSuccessProbability(numQubits: number, iterations: number): number;
```

**Example:**
```typescript
import { groverSearchForItem, groverSearch } from '@q5m/q5m';

// Search for specific item
const result1 = groverSearchForItem(4, '1010');
const targetProb = result1.probability(0b1010);
console.log('Found target with probability:', targetProb);

// Custom oracle: find numbers with exactly 3 ones
const oracle = (bits: string) => {
  return (bits.match(/1/g) || []).length === 3;
};

const result2 = groverSearch(5, oracle);
console.log('Search results:', result2.probabilities());
```

### Quantum Fourier Transform

```typescript
// Apply QFT to circuit
function quantumFourierTransform(circuit: Circuit): Circuit;

// Encode classical data with QFT
function qftEncode(data: number[]): Circuit;

// Create QFT circuit for specific number of qubits
function createQFTCircuit(numQubits: number): Circuit;
```

**Example:**
```typescript
import { quantumFourierTransform, qftEncode } from '@q5m/q5m';

// Apply QFT to existing circuit
const circuit = new Circuit(3);
circuit.h(0).h(1).h(2);  // Uniform superposition

const qftCircuit = quantumFourierTransform(circuit);
const result = qftCircuit.execute();

// Encode classical data
const data = [1, 0, 1, 1];
const encodedCircuit = qftEncode(data);
const encodedState = encodedCircuit.execute();
```

### Quantum Phase Estimation

```typescript
// Estimate eigenphase of unitary operator
function estimateEigenstatePhase(
  unitary: Unitary,
  eigenstate: StateVector, 
  precision: number
): number;

// Full phase estimation circuit
function quantumPhaseEstimation(
  unitary: Unitary,
  eigenstate: StateVector,
  precisionQubits: number
): Circuit;
```

**Example:**
```typescript
import { estimateEigenstatePhase } from '@q5m/q5m';

// Z rotation matrix
const angle = 0.3;
const zRotation = [
  [complex(Math.cos(angle), -Math.sin(angle)), complex(0, 0)],
  [complex(0, 0), complex(Math.cos(angle), Math.sin(angle))]
];

const eigenstate = [complex(1, 0), complex(0, 0)];  // |0⟩
const phase = estimateEigenstatePhase(zRotation, eigenstate, 4);

console.log('Estimated phase:', phase);
console.log('Actual phase:', angle / (2 * Math.PI));
```

### Amplitude Amplification

```typescript
// Generalized amplitude amplification
function amplitudeAmplification(
  circuit: Circuit,
  oracle: (bitString: string) => boolean,
  iterations: number
): Circuit;

// Utility functions
function estimateSuccessProbability(
  numQubits: number,
  oracle: (bitString: string) => boolean
): number;
```

## Export Functions

### Qiskit Export

```typescript
function exportToQiskit(circuit: Circuit, options?: QiskitExportOptions): string;

interface QiskitExportOptions {
  circuitName?: string;
  includeImports?: boolean;
  includeExecution?: boolean;
}
```

**Example:**
```typescript
import { exportToQiskit } from '@q5m/q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1).measure([0, 1]);

const qiskitCode = exportToQiskit(circuit, {
  circuitName: 'bell_state',
  includeImports: true,
  includeExecution: true
});

console.log(qiskitCode);
// Output: Complete Qiskit Python code
```

### OpenQASM Export

```typescript
function exportToOpenQASM(circuit: Circuit, version?: '2.0' | '3.0'): string;
```

**Example:**
```typescript
import { exportToOpenQASM } from '@q5m/q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

const qasmCode = exportToOpenQASM(circuit);
console.log(qasmCode);
// Output: OpenQASM 2.0 code
```

### Cirq Export

```typescript
function exportToCirq(circuit: Circuit, options?: CirqExportOptions): string;

interface CirqExportOptions {
  circuitName?: string;
  includeImports?: boolean;
}
```

## Visualization (Optional Module)

### Circuit Rendering

```typescript
class CircuitRenderer {
  constructor(circuit: Circuit);
  
  // Render methods
  toASCII(): string;
  toSVG(): SVGElement;          // Browser only
  toConsole(): void;
}
```

### State Rendering

```typescript
class StateRenderer {
  constructor(state: QubitState);
  
  // Visualization methods
  renderAmplitudes(): string;
  renderProbabilities(): string; 
  renderBlochSphere(): string;   // Single qubit only
}
```

**Example:**
```typescript
import { Circuit, CircuitRenderer } from '@q5m/q5m';

const circuit = new Circuit(3);
circuit.h(0).cnot(0, 1).cnot(1, 2);

const renderer = new CircuitRenderer(circuit);
console.log(renderer.toASCII());

// In browser
if (typeof window !== 'undefined') {
  const svgElement = renderer.toSVG();
  document.body.appendChild(svgElement);
}
```

## Type Guards & Validation

```typescript
// Type validation functions
function isValidAmplitude(value: any): value is Amplitude;
function isValidQ5mIndex(value: any): value is Q5mIndex;
function isProbability(value: any): value is Probability;
function isZeroOne(value: any): value is ZeroOne;

// Result type guards
function isExecutionResult(value: any): value is ExecutionResult;
function isMeasurementResult(value: any): value is MeasurementResult;
```

## Error Handling

q5m.js throws specific error types for different failure modes:

```typescript
// Common error scenarios
try {
  const circuit = new Circuit(-1);  // Invalid qubit count
} catch (error) {
  console.error('Invalid circuit:', error.message);
}

try {
  const state = new QubitState(2);
  state.amplitude(5);  // Index out of range
} catch (error) {
  console.error('Invalid amplitude index:', error.message);
}
```

## Performance Considerations

### Memory Usage
- Small systems (≤16 qubits): Dense representation
- Medium systems (16-64 qubits): Automatic optimization
- Large systems (64+ qubits): Sparse/CSR representation

### Execution Time
- Single-qubit gates: O(2^n) time complexity
- Two-qubit gates: O(2^n) time complexity  
- Multi-qubit gates: O(2^n) time complexity
- Measurements: O(2^n) for probability calculation

### Best Practices
```typescript
// Prefer batch operations
circuit.hh([0, 1, 2, 3]);  // Better than individual h() calls

// Reuse circuits when possible
const baseCircuit = new Circuit(5);
const circuit1 = baseCircuit.clone().h(0);
const circuit2 = baseCircuit.clone().x(0);

// Monitor memory for large systems  
const state = circuit.execute();
if (state.memoryUsage() > 1e8) {  // 100MB
  console.warn('Large memory usage detected');
}
```

---

*This API reference covers all public interfaces in q5m.js. For implementation details and advanced usage, see the architecture documentation and source code.*
