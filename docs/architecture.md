# q5m.js Architecture Overview

## Design Philosophy

q5m.js is built on four core principles:

1. **Performance First** - Hybrid sparse/dense state representation with automatic optimization
2. **Type Safety** - Strict TypeScript with comprehensive type coverage
3. **Memory Efficiency** - CSR format and intelligent state switching for large systems
4. **Developer Experience** - Intuitive APIs with multiple entry points and excellent tooling

## System Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      User API Layer                         │
│              Circuit (Fluent API Interface)                 │
├─────────────────────────────────────────────────────────────┤
│                    Execution Layer                          │
│            CircuitExecutor + Gate Registry                  │  
├─────────────────────────────────────────────────────────────┤
│                 Quantum State Layer                         │
│     QubitState ← Q5mState (Hybrid Representation)          │
├─────────────────────────────────────────────────────────────┤
│                    Gate System                              │
│   Single │ Two │ Multi │ Measure │ Controlled Gates        │
├─────────────────────────────────────────────────────────────┤
│              Mathematical Foundation                        │
│    Complex Numbers │ Matrix Ops │ Vector Operations        │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Circuit System (`src/core/Circuit.ts`)

The `Circuit` class serves as the primary user interface and orchestrates all quantum operations:

```typescript
class Circuit {
  constructor(numQubits: number, initialState?: QubitState);
  
  // Gate operations (fluent interface)
  h(qubit: number): Circuit;
  cnot(control: number, target: number): Circuit;
  measure(qubits: number | number[]): Circuit;
  
  // Execution
  execute(): QubitState;
  
  // Utilities  
  toString(): string;
  clone(): Circuit;
}
```

**Key Features**:
- Lazy evaluation with instruction queueing
- Automatic state optimization
- Comprehensive gate library integration
- Built-in validation and error handling

### 2. Quantum State System

#### Base Abstraction (`src/core/Q5mState.ts`)
```typescript
abstract class Q5mState<TMaterial> {
  protected stateCount: number;
  protected numQuantum: number;
  protected rep: RepType; // DENSE | SPARSE | CSR
  
  abstract apply(operator: Q5mOperator<Unitary>): Q5mState;
  abstract normalize(): Q5mState;
  
  // State access
  amplitudes(): Amplitude[];
  amplitude(index: number): Amplitude;
  probabilities(): Probability[];
  
  // Performance
  memoryUsage(): number;
  chooseSparseRepresentation(stateVector: Amplitude[]): void;
}
```

#### QubitState Implementation (`src/core/QubitState.ts`)
```typescript
class QubitState extends Q5mState<Q5mMaterial<StateVector>> {
  constructor(numQubits: number, amplitudes?: Amplitude[], enableSparse?: boolean);
  
  // Optimized operations
  apply(operator: Q5mOperator<Unitary>): QubitState;
  measure(qubits: number[]): MeasurementResult;
  
  // State representation optimization
  private selectRepType(size: number, nonZeroCount: number): RepType;
  private createCSRFromSparse(sparseMap: Map<number, Complex>): CSRFormat;
}
```

### 3. State Representation Optimization

#### Automatic Representation Selection
```typescript
enum RepType {
  DENSE = 'dense',    // Traditional full state vector
  SPARSE = 'sparse',  // Map-based sparse representation  
  CSR = 'csr'         // Compressed Sparse Row format
}
```

**Optimization Strategy**:
- **Small systems (≤16 qubits)**: Dense for cache efficiency
- **Medium systems (16-64 qubits)**: Automatic sparse/dense switching  
- **Large systems (64+ qubits)**: CSR format with TypedArrays

#### Performance Characteristics
```typescript
// Thresholds for representation switching
const DEFAULT_SPARSE_CONFIG = {
  denseToSparseThreshold: 0.15,  // 15% sparsity → sparse
  sparseToCSRThreshold: 0.12,    // 12% sparsity → CSR  
  csrSizeThreshold: 1024,        // Minimum size for CSR
  autoOptimize: true
};
```

### 4. Gate System Architecture

#### Gate Hierarchy
```
Q5mGate (Abstract Base)
├── SingleQubitGate
│   ├── HadamardGate, PauliXGate, PauliYGate, PauliZGate
│   ├── PhaseGate, SGate, TGate  
│   └── RotationXGate, RotationYGate, RotationZGate
├── TwoQubitGate
│   ├── CNOTGate, ControlledZGate, ControlledYGate
│   ├── SWAPGate, ControlledHGate
│   └── ControlledPhaseGate  
├── MultiQubitGate
│   ├── MultiHadamardGate
│   └── ControlledUnitaryGate
└── MeasurementGate
    ├── MeasureZGate, MeasureXGate, MeasureYGate
    └── MeasurePhaseGate
```

#### Gate Implementation Pattern
```typescript
abstract class Q5mGate {
  abstract get name(): string;
  abstract get qubits(): number[];
  abstract get matrix(): UnitaryOperator;
  
  apply(state: Q5mState): Q5mState;
  toString(): string;
}

// Example implementation
class CNOTGate extends TwoQubitGate {
  constructor(control: number, target: number) {
    super([control, target]);
  }
  
  get matrix(): UnitaryOperator {
    return createCNOTMatrix();
  }
}
```

### 5. Mathematical Foundation

#### Complex Number System (`src/math/complex.ts`)
```typescript
class Complex {
  constructor(public re: number, public im: number);
  
  // Operations
  add(other: Complex): Complex;
  mul(other: Complex): Complex;
  conjugate(): Complex;
  abs(): number;
  
  // Optimizations
  static readonly ZERO = new Complex(0, 0);
  static readonly ONE = new Complex(1, 0);
}
```

#### Optimized Matrix Operations (`src/math/vector-matrix.ts`)
```typescript
// Dense matrix-vector multiplication
function matXvec(matrix: Matrix, vector: StateVector): StateVector;

// Sparse matrix-vector multiplication  
function matXvecSparse(
  matrix: Matrix, 
  sparseVector: Map<number, Complex>,
  dimension: number
): StateVector;

// CSR-optimized operations
function matXvecCSR(matrix: Matrix, csr: CSRFormat): StateVector;
```

### 6. Algorithm Integration

#### Algorithm Module Structure (`src/algorithms/`)
```
algorithms/
├── grover.ts           # Grover's search algorithm
├── qft.ts              # Quantum Fourier Transform  
├── phase-estimation.ts # Quantum phase estimation
├── amplitude-amplification.ts # Generalized amplitude amplification
└── index.ts            # Unified exports
```

#### Algorithm Implementation Pattern
```typescript
export function groverSearch(
  numQubits: number,
  oracle: (bitString: string) => boolean,
  iterations?: number
): QubitState {
  const circuit = new Circuit(numQubits);
  
  // Initialize superposition
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
  
  const optimalIterations = iterations ?? groverOptimalIterations(numQubits);
  
  for (let i = 0; i < optimalIterations; i++) {
    // Oracle application
    applyOracle(circuit, oracle, numQubits);
    // Diffusion operator  
    applyDiffusion(circuit, numQubits);
  }
  
  return circuit.execute();
}
```

## Performance Optimizations

### 1. Memory Management

#### Sparse State Optimization
- **Threshold-based switching**: Automatic dense→sparse→CSR transitions
- **Memory pooling**: Reuse of complex number objects
- **TypedArray usage**: Float64Array for CSR format values

#### Memory Usage Patterns
```typescript
// Memory usage by representation type
const memoryUsage = {
  dense: stateCount * 16,           // Complex number = 16 bytes
  sparse: nonZeroCount * 24,        // Complex + Map overhead  
  csr: nonZeroCount * 16 + indices * 4  // Values + indices
};
```

### 2. Computational Optimizations

#### Gate Application Strategies
```typescript
// Representation-aware gate application
protected applyUnitaryOptimized(matrix: Matrix): Amplitude[] {
  switch (this.rep) {
    case RepType.DENSE:
      return matXvec(matrix, this.stateVector);
    case RepType.SPARSE:  
      return matXvecSparse(matrix, this.sparseAmplitudes, this.stateCount);
    case RepType.CSR:
      return matXvecCSR(matrix, this.csrData);
  }
}
```

#### Specialized Gate Optimizations
- **Single-qubit gates**: Direct amplitude manipulation
- **Controlled gates**: Conditional application patterns
- **Measurement operations**: Probability calculation shortcuts

### 3. Cache Efficiency

#### State Caching
```typescript
class Q5mState {
  private _memoizedAmplitudes?: Amplitude[];
  private _amplitudesVersion: number = 0;
  
  amplitudes(): Amplitude[] {
    if (this._memoizedAmplitudes && this._amplitudesVersion > 0) {
      return this._memoizedAmplitudes;
    }
    // Compute and cache...
  }
}
```

## Entry Points & Module System

### 1. Multi-Entry Architecture

```typescript
// Core entry point (minimal bundle)
// src/core-entry.ts → q5m/core
export { Circuit, QubitState, Q5mState } from './core';
export * from './math';

// Full entry point (complete features)  
// src/index.ts → q5m
export * from './core-entry';
export * from './algorithms';
export * from './converters'; 
export * from './visualization';
export * from './plugins';

// Package-specific entry
// src/packages-entry.ts → q5m/packages
export * from './algorithms';
export * from './converters';
```

### 2. Bundle Optimization

#### Size Targets
- **Core bundle**: ~45KB minified (essential quantum operations)
- **Full bundle**: ~95KB minified (all features)
- **Algorithm-only**: ~25KB minified (algorithms without core)

#### Tree Shaking Support
```typescript
// Enables dead code elimination
export { Circuit } from './core/Circuit';
export { QubitState } from './core/QubitState';
export { groverSearch } from './algorithms/grover';
// ... individual exports for optimal tree shaking
```

## Quality Assurance

### 1. Type Safety
- **Strict TypeScript**: All `strict` compiler options enabled
- **Exact types**: No `any` usage in public APIs
- **Runtime validation**: Type guards for critical operations

### 2. Testing Strategy
- **Unit tests**: 90%+ coverage with Jest
- **Integration tests**: Cross-module functionality
- **E2E tests**: Multi-framework compatibility (Cypress)
- **Performance tests**: Regression prevention

### 3. Performance Monitoring
- **Benchmarks**: Automated performance tracking
- **Memory profiling**: Leak detection and usage optimization
- **Bundle analysis**: Size regression prevention

## Future Architecture Considerations

### 1. WebAssembly Integration
- **SIMD operations**: Vectorized complex arithmetic
- **Memory management**: Direct memory access for large states
- **Cross-platform**: Consistent performance across environments

### 2. Web Workers
- **Parallel execution**: Multi-threaded quantum simulations
- **Background processing**: Non-blocking large circuit execution
- **State streaming**: Incremental state updates

### 3. GPU Acceleration
- **WebGL compute**: Parallel matrix operations
- **State vector operations**: Massively parallel amplitude calculations
- **Memory bandwidth**: Optimized GPU memory usage patterns

---

*This architecture balances performance, usability, and maintainability while providing a foundation for quantum computing simulations that scale from educational examples to research-level computations.*
