# Plugin System

q5m.js features a comprehensive plugin architecture designed for extensibility and modularity. The plugin system provides event-driven management, dependency resolution, and a powerful hook system for customizing quantum computations.

## Overview

The plugin system consists of several key components:

- **Plugin Manager**: Central registry and lifecycle management
- **Base Plugin Classes**: Abstract base classes for easy plugin development  
- **Event System**: Event-driven communication between plugins
- **Hook System**: Processing intervention points for data transformation
- **Dependency Management**: Automatic plugin dependency resolution

## Core Concepts

### Plugin Lifecycle

Plugins follow a well-defined lifecycle:

1. **Registration** - Plugin is registered with the manager
2. **Initialization** - Plugin receives context and resources
3. **Activation** - Plugin becomes active and ready for use
4. **Deactivation** - Plugin is temporarily disabled
5. **Destruction** - Plugin is permanently removed and cleaned up

### Plugin States

```typescript
enum PluginState {
  UNLOADED = 'unloaded',     // Plugin is not loaded
  LOADED = 'loaded',         // Plugin is loaded but not initialized
  INITIALIZING = 'initializing', // Plugin is initializing
  ACTIVE = 'active',         // Plugin is active and ready
  DESTROYING = 'destroying', // Plugin is being destroyed
  ERROR = 'error'           // Plugin encountered an error
}
```

## Basic Plugin Development

### Using BasePlugin

The simplest way to create a plugin is by extending `BasePlugin`:

```typescript
import { BasePlugin } from 'q5m/plugins';
import type { PluginMetadata } from 'q5m/plugins';

class MyQuantumPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'quantum-extensions',
    name: 'Quantum Extensions',
    version: '1.0.0',
    description: 'Additional quantum algorithms and utilities',
    apiVersion: '1.0.0',
    dependencies: [],
    author: 'Your Name',
    license: 'MIT'
  };

  async initialize(): Promise<void> {
    console.log('Initializing quantum extensions...');
    
    // Register plugin APIs
    this.registerAPI('algorithms', {
      groverSearch: this.groverSearch.bind(this),
      quantumFourierTransform: this.quantumFourierTransform.bind(this)
    });
  }

  async activate(): Promise<void> {
    console.log('Quantum extensions activated');
    
    // Start background processes or set up event listeners
    this.on('circuit:created', this.onCircuitCreated.bind(this));
  }

  async deactivate(): Promise<void> {
    console.log('Quantum extensions deactivated');
    
    // Stop background processes
    this.removeAllListeners();
  }

  async destroy(): Promise<void> {
    console.log('Cleaning up quantum extensions');
    // Perform cleanup
    this.unregisterAllAPIs();
  }
  
  private groverSearch(oracle: Function, qubits: number) {
    // Implementation
    return `Grover search on ${qubits} qubits`;
  }
  
  private quantumFourierTransform(qubits: number) {
    // Implementation
    return `QFT on ${qubits} qubits`;
  }
  
  private onCircuitCreated(data: any) {
    console.log('New circuit created:', data);
  }
```

### Plugin Factory Function

For simple plugins, use the factory function:

```typescript
import { createPlugin } from 'q5m';

const utilsPlugin = createPlugin(
  'quantum-utils',
  {
    name: 'Quantum Utilities',
    version: '1.0.0',
    description: 'Utility functions for quantum computing'
  },
  {
    onInitialize: async (context) => {
      context.logger.info('Utils plugin initialized');
    },
    onActivate: async () => {
      console.log('Quantum utilities now available');
    }
  },
  [] // No dependencies
);
```

## Plugin Registration and Management

### Registering Plugins

```typescript
import { pluginManager } from 'q5m';

// Register with default options
await pluginManager.register('my-plugin', new MyQuantumPlugin());

// Register with custom options
await pluginManager.register('my-plugin', new MyQuantumPlugin(), {
  autoInitialize: true,
  autoActivate: true,
  initTimeout: 10000,
  config: {
    algorithms: ['grover', 'qft'],
    debug: true
  }
});
```

### Plugin Discovery and Access

```typescript
// Check if plugin is registered
if (pluginManager.has('my-plugin')) {
  const plugin = pluginManager.get('my-plugin');
  console.log('Plugin state:', plugin.state);
}

// Access plugin API
const algorithms = pluginManager.getAPI('my-plugin', 'getCustomAlgorithms');
if (algorithms) {
  console.log('Available algorithms:', algorithms());
}

// List all plugins
const allPlugins = pluginManager.list();
console.log('Registered plugins:', allPlugins);
```

## Event System

### Listening to Plugin Events

```typescript
import { pluginManager } from 'q5m';

// Listen to plugin lifecycle events
pluginManager.on('plugin:registered', ({ pluginId, plugin }) => {
  console.log(`Plugin ${pluginId} was registered`);
});

pluginManager.on('plugin:activated', ({ pluginId, plugin }) => {
  console.log(`Plugin ${pluginId} is now active`);
});

pluginManager.on('plugin:error', ({ pluginId, error }) => {
  console.error(`Plugin ${pluginId} encountered error:`, error);
});
```

### Custom Events

Plugins can emit custom events through the event system:

```typescript
class EventfulPlugin extends BasePlugin {
  async onActivate(): Promise<void> {
    // Emit custom events
    this.events.emit('computation:started', { 
      algorithm: 'grover',
      qubits: 4 
    });
    
    // Listen to events from other plugins
    this.events.on('data:ready', (data) => {
      console.log('Received data:', data);
    });
  }
}
```

## Hook System

The hook system allows plugins to intercept and modify data at specific processing points.

### Registering Hooks

```typescript
import { pluginManager } from 'q5m';

// Register global hooks
pluginManager.registerGlobalHook('circuit:before-execute', (circuit, pluginId) => {
  console.log(`Circuit from ${pluginId} about to execute`);
  
  // Optionally modify the circuit
  circuit.addMetadata('processed-by', pluginId);
  return circuit;
});

pluginManager.registerGlobalHook('state:after-measurement', (result, pluginId) => {
  console.log(`Measurement completed by ${pluginId}:`, result);
  return result;
});
```

### Plugin-Specific Hooks

```typescript
class HookPlugin extends BasePlugin {
  async onActivate(): Promise<void> {
    // Register plugin-specific hooks
    this.events.hook('algorithm:optimize', (algorithm) => {
      // Apply plugin-specific optimizations
      return this.optimizeAlgorithm(algorithm);
    });
  }

  private optimizeAlgorithm(algorithm: any) {
    // Custom optimization logic
    return algorithm;
  }
}
```

### Applying Hooks

```typescript
// Apply hooks with context
const optimizedCircuit = await pluginManager.applyGlobalHooks(
  'circuit:optimize',
  circuit,
  'my-plugin-id',
  { level: 'advanced' }
);
```

## Dependency Management

### Declaring Dependencies

```typescript
class DependentPlugin extends BasePlugin {
  constructor() {
    super('dependent-plugin', {
      name: 'Dependent Plugin',
      version: '1.0.0'
    }, [
      {
        name: 'base-algorithms',
        version: '1.0.0',
        optional: false
      },
      {
        name: 'visualization-utils',
        version: '2.0.0',
        optional: true
      }
    ]);
  }
}
```

### Dependency Resolution

The plugin manager automatically resolves dependencies:

```typescript
// Dependencies are initialized in the correct order
await pluginManager.initializeAll();

// Get dependency graph
const graph = pluginManager.getDependencyGraph();
console.log('Dependency relationships:', graph);
```

## Advanced Features

### Cross-Plugin Communication

Plugins can communicate with each other through the API system:

```typescript
class CollaborativePlugin extends BasePlugin {
  async initialize(): Promise<void> {
    // Register services for other plugins
    this.registerAPI('optimizer', {
      optimizeCircuit: this.optimizeCircuit.bind(this),
      analyzeComplexity: this.analyzeComplexity.bind(this)
    });

    // Request APIs from other plugins
    this.requestAPI('visualization', 'renderer')
      .then(renderer => {
        this.renderer = renderer;
        console.log('Visualization renderer available');
      })
      .catch(err => {
        console.warn('Visualization plugin not available:', err.message);
      });
  }

  private optimizeCircuit(circuit: any): any {
    // Optimization logic
    const optimized = { ...circuit, optimized: true };
    
    // Notify other plugins
    this.emit('optimization:complete', {
      original: circuit,
      optimized: optimized
    });
    
    return optimized;
  }
  
  private analyzeComplexity(circuit: any): number {
    return circuit.gates?.length || 0;
  }
}
```

### Plugin Configuration

```typescript
class ConfigurablePlugin extends BasePlugin {
  async onInitialize(context: PluginContext): Promise<void> {
    // Access configuration
    const algorithms = this.config.get<string[]>('enabledAlgorithms');
    const debugMode = this.config.get<boolean>('debug') ?? false;
    
    if (algorithms) {
      this.enableAlgorithms(algorithms);
    }
    
    if (debugMode) {
      this.logger.info('Debug mode enabled');
    }
  }
}
```

### Plugin Metadata and Versioning

```typescript
class VersionedPlugin extends BasePlugin {
  constructor() {
    super('versioned-plugin', {
      name: 'Versioned Plugin',
      version: '2.1.0',
      description: 'Plugin with version tracking',
      author: 'Quantum Developer',
      license: 'MIT',
      homepage: 'https://github.com/example/quantum-plugin',
      keywords: ['quantum', 'algorithms', 'optimization'],
      minCoreVersion: '1.0.0'
    });
  }
}
```

### Error Handling

```typescript
class RobustPlugin extends BasePlugin {
  async onActivate(): Promise<void> {
    try {
      await this.initializeAlgorithms();
    } catch (error) {
      this.logger.error('Failed to initialize algorithms:', error);
      
      // Plugin can decide how to handle errors
      // Could fall back to basic functionality or throw to prevent activation
      throw new PluginError(
        PluginErrorType.ACTIVATION_ERROR,
        this.id,
        'Critical algorithms failed to initialize',
        error
      );
    }
  }
  
  private async initializeAlgorithms(): Promise<void> {
    // Algorithm initialization logic
  }
}
```

## Best Practices

### Plugin Design

1. **Single Responsibility**: Each plugin should have a clear, focused purpose
2. **Loose Coupling**: Minimize dependencies between plugins
3. **Error Resilience**: Handle errors gracefully without affecting other plugins
4. **Resource Cleanup**: Always clean up resources in the `onDestroy` method
5. **Semantic Versioning**: Follow semantic versioning for plugin versions

### Performance Considerations

1. **Lazy Loading**: Initialize expensive resources only when needed
2. **Asynchronous Operations**: Use async/await for non-blocking operations
3. **Memory Management**: Avoid memory leaks by cleaning up event listeners
4. **Hook Performance**: Keep hook functions lightweight and fast

### Security

1. **Input Validation**: Validate all inputs and configurations
2. **Safe APIs**: Expose only necessary APIs to other plugins
3. **Error Messages**: Avoid exposing sensitive information in error messages
4. **Resource Limits**: Implement reasonable resource usage limits

## Examples

### Quantum Algorithm Plugin

```typescript
class QuantumAlgorithmPlugin extends BasePlugin {
  private algorithms: Map<string, Function> = new Map();

  constructor() {
    super('quantum-algorithms', {
      name: 'Advanced Quantum Algorithms',
      version: '1.0.0',
      description: 'Collection of advanced quantum algorithms'
    });
  }

  async onActivate(): Promise<void> {
    this.registerAlgorithms();
    this.setupHooks();
  }

  private registerAlgorithms(): void {
    this.algorithms.set('advanced-grover', this.advancedGrover);
    this.algorithms.set('optimized-qft', this.optimizedQFT);
    
    this.setAPI('getAlgorithm', (name: string) => this.algorithms.get(name));
    this.setAPI('listAlgorithms', () => Array.from(this.algorithms.keys()));
  }

  private setupHooks(): void {
    this.events.hook('algorithm:execute', (params) => {
      this.logger.info(`Executing algorithm: ${params.name}`);
      return params;
    });
  }

  private advancedGrover = (oracle: Function, items: number) => {
    // Advanced Grover implementation
    return { iterations: Math.floor(Math.PI * Math.sqrt(items) / 4) };
  };

  private optimizedQFT = (qubits: number) => {
    // Optimized QFT implementation
    return { gates: qubits * (qubits + 1) / 2 };
  };
}
```

### Visualization Plugin

```typescript
class VisualizationPlugin extends BasePlugin {
  constructor() {
    super('visualization', {
      name: 'Quantum Visualization',
      version: '1.0.0',
      description: 'Advanced visualization tools for quantum states and circuits'
    });
  }

  async onActivate(): Promise<void> {
    // Hook into state measurements for automatic visualization
    this.events.hook('state:measured', (result) => {
      this.visualizeState(result);
      return result;
    });

    // Provide visualization APIs
    this.setAPI('renderCircuit', this.renderCircuit);
    this.setAPI('animateEvolution', this.animateEvolution);
  }

  private visualizeState = (state: any) => {
    console.log('Visualizing quantum state:', state);
    // Visualization logic
  };

  private renderCircuit = (circuit: any) => {
    return `Circuit with ${circuit.numQubits} qubits`;
  };

  private animateEvolution = (states: any[]) => {
    return `Animation of ${states.length} states`;
  };
}
```

## API Reference

For complete API documentation, see the [TypeDoc generated documentation](./api/index.html) which includes detailed information about all plugin system interfaces, classes, and methods.

Key interfaces:
- [`Plugin`](./api/interfaces/Plugin.html) - Main plugin interface
- [`PluginManager`](./api/classes/PluginManager.html) - Plugin management
- [`BasePlugin`](./api/classes/BasePlugin.html) - Abstract base class
- [`EventSystem`](./api/interfaces/EventSystem.html) - Event management
- [`HookSystem`](./api/interfaces/HookSystem.html) - Hook management