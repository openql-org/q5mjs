/**
 * TypeScript declaration file for q5m.js Plugin System
 * 
 * Provides comprehensive type definitions for plugin developers to ensure
 * type safety and enable IntelliSense support for the plugin framework.
 * 
 * @version 1.0.0
 * @stability stable
 */

declare module 'q5m/plugins' {
  // ===== Core Plugin Types =====

  /**
   * Plugin identifier string
   */
  export type PluginId = string;

  /**
   * Version string format (semantic versioning)
   */
  export type VersionString = string;

  /**
   * Plugin metadata interface
   */
  export interface PluginMetadata {
    readonly name: string;
    readonly version: VersionString;
    readonly description?: string;
    readonly author?: string;
    readonly license?: string;
    readonly homepage?: string;
    readonly repository?: string;
    readonly keywords?: readonly string[];
  }

  /**
   * Plugin dependency specification
   */
  export interface PluginDependency {
    readonly id: PluginId;
    readonly version: VersionString;
    readonly optional?: boolean;
  }

  /**
   * Plugin state enumeration
   */
  export enum PluginState {
    UNLOADED = 'unloaded',
    LOADING = 'loading', 
    INITIALIZED = 'initialized',
    ACTIVATING = 'activating',
    ACTIVE = 'active',
    DEACTIVATING = 'deactivating',
    DESTROYING = 'destroying',
    ERROR = 'error'
  }

  /**
   * Plugin error types
   */
  export enum PluginErrorType {
    INITIALIZATION_FAILED = 'initialization_failed',
    ACTIVATION_FAILED = 'activation_failed',
    DEACTIVATION_FAILED = 'deactivation_failed',
    DESTRUCTION_FAILED = 'destruction_failed',
    DEPENDENCY_NOT_FOUND = 'dependency_not_found',
    VERSION_MISMATCH = 'version_mismatch',
    INVALID_CONFIGURATION = 'invalid_configuration',
    API_ERROR = 'api_error'
  }

  /**
   * Plugin error class
   */
  export class PluginError extends Error {
    readonly type: PluginErrorType;
    readonly pluginId: PluginId;
    readonly details?: Readonly<Record<string, unknown>>;

    constructor(
      type: PluginErrorType,
      pluginId: PluginId,
      message: string,
      details?: Readonly<Record<string, unknown>>
    );
  }

  // ===== Plugin Context Types =====

  /**
   * Plugin configuration interface
   */
  export interface PluginConfig {
    /**
     * Get configuration value
     * @param key Configuration key
     * @returns Configuration value or undefined
     */
    get<T = unknown>(key: string): T | undefined;

    /**
     * Set configuration value
     * @param key Configuration key
     * @param value Configuration value
     */
    set<T = unknown>(key: string, value: T): void;

    /**
     * Check if configuration key exists
     * @param key Configuration key
     * @returns True if key exists
     */
    has(key: string): boolean;

    /**
     * Delete configuration key
     * @param key Configuration key
     * @returns True if key was deleted
     */
    delete(key: string): boolean;
  }


  /**
   * Plugin event system interface
   */
  export interface PluginEventSystem {
    /**
     * Register event listener
     * @param event Event name
     * @param handler Event handler
     */
    on<T = unknown>(event: string, handler: (data: T) => void | Promise<void>): void;

    /**
     * Remove event listener
     * @param event Event name
     * @param handler Optional specific handler to remove
     */
    off(event: string, handler?: (...args: unknown[]) => unknown): void;

    /**
     * Emit event
     * @param event Event name
     * @param data Event data
     */
    emit<T = unknown>(event: string, data: T): Promise<void>;

    /**
     * Register one-time event listener
     * @param event Event name
     * @param handler Event handler
     */
    once<T = unknown>(event: string, handler: (data: T) => void | Promise<void>): void;
  }

  /**
   * Plugin context provided to plugins
   */
  export interface PluginContext {
    /** Plugin manager instance */
    readonly pluginManager: PluginManagerInterface;
    /** Plugin configuration */
    readonly config: PluginConfig;
    /** Event system for inter-plugin communication */
    readonly events: PluginEventSystem;
  }

  // ===== Plugin Interface =====

  /**
   * Core plugin interface that all plugins must implement
   */
  export interface Plugin {
    /** Unique plugin identifier */
    readonly id: PluginId;
    /** Plugin metadata */
    readonly metadata: PluginMetadata;
    /** Plugin dependencies */
    readonly dependencies: readonly PluginDependency[];
    /** Current plugin state */
    readonly state: PluginState;

    /**
     * Initialize the plugin
     * Called once when the plugin is first loaded
     * @param context Plugin context
     */
    initialize(context: PluginContext): Promise<void>;

    /**
     * Activate the plugin
     * Called when the plugin should become active
     */
    activate(): Promise<void>;

    /**
     * Deactivate the plugin
     * Called when the plugin should become inactive
     */
    deactivate(): Promise<void>;

    /**
     * Destroy the plugin
     * Called when the plugin is being removed
     */
    destroy(): Promise<void>;

    /**
     * Get plugin API by name
     * @param apiName API name
     * @returns API object or undefined
     */
    getAPI(apiName: string): unknown;

    /**
     * Check if plugin provides specific API
     * @param apiName API name
     * @returns True if API is provided
     */
    hasAPI(apiName: string): boolean;
  }

  // ===== Base Plugin Class =====

  /**
   * Abstract base plugin class providing common functionality
   */
  export abstract class BasePlugin implements Plugin {
    readonly id: PluginId;
    readonly metadata: PluginMetadata;
    readonly dependencies: readonly PluginDependency[];
    readonly state: PluginState;

    protected context?: PluginContext;
    protected config?: PluginConfig;
    protected events?: PluginEventSystem;

    /**
     * Create new base plugin
     * @param id Plugin identifier
     * @param metadata Plugin metadata
     * @param dependencies Plugin dependencies
     */
    constructor(
      id: PluginId,
      metadata: PluginMetadata,
      dependencies?: readonly PluginDependency[]
    );

    // Plugin lifecycle methods (implement in subclasses)
    
    /**
     * Plugin initialization hook
     * Override this method to perform plugin-specific initialization
     */
    protected abstract onInitialize(): Promise<void>;

    /**
     * Plugin activation hook
     * Override this method to perform plugin-specific activation
     */
    protected abstract onActivate(): Promise<void>;

    /**
     * Plugin deactivation hook
     * Override this method to perform plugin-specific deactivation
     */
    protected abstract onDeactivate(): Promise<void>;

    /**
     * Plugin destruction hook
     * Override this method to perform plugin-specific cleanup
     */
    protected abstract onDestroy(): Promise<void>;

    // Plugin interface implementation
    initialize(context: PluginContext): Promise<void>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    destroy(): Promise<void>;
    getAPI(apiName: string): unknown;
    hasAPI(apiName: string): boolean;

    /**
     * Register an API for this plugin
     * @param apiName API name
     * @param api API object
     */
    protected registerAPI(apiName: string, api: unknown): void;

    /**
     * Unregister an API for this plugin
     * @param apiName API name
     * @returns True if API was unregistered
     */
    protected unregisterAPI(apiName: string): boolean;
  }

  // ===== Plugin Factory Types =====

  /**
   * Plugin factory function type
   */
  export type PluginFactory = () => Plugin;

  /**
   * Plugin registration information
   */
  export interface PluginRegistration {
    readonly plugin: Plugin;
    readonly factory?: PluginFactory;
    readonly options: PluginRegistrationOptions;
    readonly registeredAt: Date;
    readonly initializedAt?: Date;
    readonly activatedAt?: Date;
  }

  /**
   * Plugin registration options
   */
  export interface PluginRegistrationOptions {
    /** Whether to automatically initialize the plugin */
    readonly autoInitialize?: boolean;
    /** Whether to automatically activate the plugin */
    readonly autoActivate?: boolean;
    /** Custom initialization timeout in milliseconds */
    readonly initTimeout?: number;
    /** Custom configuration for the plugin */
    readonly config?: Readonly<Record<string, unknown>>;
  }

  // ===== Plugin Manager Types =====

  /**
   * Plugin manager events
   */
  export interface PluginManagerEvents {
    /** Emitted when a plugin is registered */
    'plugin:registered': { pluginId: PluginId; plugin: Plugin };
    /** Emitted when a plugin is unregistered */
    'plugin:unregistered': { pluginId: PluginId };
    /** Emitted when a plugin is initialized */
    'plugin:initialized': { pluginId: PluginId };
    /** Emitted when a plugin is activated */
    'plugin:activated': { pluginId: PluginId };
    /** Emitted when a plugin is deactivated */
    'plugin:deactivated': { pluginId: PluginId };
    /** Emitted when a plugin is destroyed */
    'plugin:destroyed': { pluginId: PluginId };
    /** Emitted when a plugin encounters an error */
    'plugin:error': { pluginId: PluginId; error: Error };
  }

  /**
   * Plugin manager interface
   */
  export interface PluginManagerInterface {
    /**
     * Register a plugin
     * @param pluginId Plugin identifier
     * @param plugin Plugin instance or factory
     * @param options Registration options
     */
    register(
      pluginId: PluginId,
      plugin: Plugin | PluginFactory,
      options?: PluginRegistrationOptions
    ): Promise<void>;

    /**
     * Unregister a plugin
     * @param pluginId Plugin identifier
     */
    unregister(pluginId: PluginId): Promise<void>;

    /**
     * Get plugin by ID
     * @param pluginId Plugin identifier
     * @returns Plugin instance or undefined
     */
    getPlugin(pluginId: PluginId): Plugin | undefined;

    /**
     * Get all registered plugin IDs
     * @returns Array of plugin IDs
     */
    getPluginIds(): readonly PluginId[];

    /**
     * Get plugin state
     * @param pluginId Plugin identifier
     * @returns Plugin state or undefined
     */
    getPluginStatus(pluginId: PluginId): PluginState | undefined;

    /**
     * Initialize a plugin
     * @param pluginId Plugin identifier
     */
    initialize(pluginId: PluginId): Promise<void>;

    /**
     * Initialize all registered plugins
     */
    initializeAll(): Promise<void>;

    /**
     * Activate a plugin
     * @param pluginId Plugin identifier
     */
    activate(pluginId: PluginId): Promise<void>;

    /**
     * Activate all initialized plugins
     */
    activateAll(): Promise<void>;

    /**
     * Deactivate a plugin
     * @param pluginId Plugin identifier
     */
    deactivate(pluginId: PluginId): Promise<void>;

    /**
     * Deactivate all active plugins
     */
    deactivateAll(): Promise<void>;

    /**
     * Destroy a plugin
     * @param pluginId Plugin identifier
     */
    destroy(pluginId: PluginId): Promise<void>;

    /**
     * Destroy all plugins
     */
    destroyAll(): Promise<void>;

    /**
     * Get API from a plugin
     * @param pluginId Plugin identifier
     * @param apiName API name
     * @returns API object or undefined
     */
    getAPI(pluginId: PluginId, apiName: string): unknown;

    /**
     * Check if plugin provides API
     * @param pluginId Plugin identifier
     * @param apiName API name
     * @returns True if API is provided
     */
    hasAPI(pluginId: PluginId, apiName: string): boolean;

    /**
     * Set global configuration
     * @param config Configuration object
     */
    setGlobalConfig(config: Readonly<Record<string, unknown>>): void;

    /**
     * Get global configuration value
     * @param key Configuration key
     * @returns Configuration value or undefined
     */
    getGlobalConfig<T = unknown>(key: string): T | undefined;

    /**
     * Register event listener
     * @param event Event name
     * @param handler Event handler
     */
    on<K extends keyof PluginManagerEvents>(
      event: K,
      handler: (data: PluginManagerEvents[K]) => void | Promise<void>
    ): void;

    /**
     * Remove event listener
     * @param event Event name
     * @param handler Optional specific handler to remove
     */
    off<K extends keyof PluginManagerEvents>(
      event: K,
      handler?: (...args: unknown[]) => unknown
    ): void;
  }

  // ===== Simple Plugin Utilities =====

  /**
   * Simple plugin implementation for basic use cases
   */
  export class SimplePlugin extends BasePlugin {
    private initializeFn?: () => Promise<void>;
    private activateFn?: () => Promise<void>;
    private deactivateFn?: () => Promise<void>;
    private destroyFn?: () => Promise<void>;

    /**
     * Create simple plugin with callback functions
     * @param id Plugin identifier
     * @param metadata Plugin metadata
     * @param callbacks Plugin lifecycle callbacks
     */
    constructor(
      id: PluginId,
      metadata: PluginMetadata,
      callbacks?: {
        initialize?: () => Promise<void>;
        activate?: () => Promise<void>;
        deactivate?: () => Promise<void>;
        destroy?: () => Promise<void>;
      }
    );

    protected onInitialize(): Promise<void>;
    protected onActivate(): Promise<void>;
    protected onDeactivate(): Promise<void>;
    protected onDestroy(): Promise<void>;
  }

  /**
   * Create a plugin using builder pattern
   * @param id Plugin identifier
   * @returns Plugin builder
   */
  export function createPlugin(id: PluginId): PluginBuilder;

  /**
   * Plugin builder interface
   */
  export interface PluginBuilder {
    /**
     * Set plugin metadata
     * @param metadata Plugin metadata
     * @returns Plugin builder
     */
    metadata(metadata: PluginMetadata): PluginBuilder;

    /**
     * Add plugin dependency
     * @param dependency Plugin dependency
     * @returns Plugin builder
     */
    dependency(dependency: PluginDependency): PluginBuilder;

    /**
     * Add plugin dependencies
     * @param dependencies Plugin dependencies
     * @returns Plugin builder
     */
    dependencies(dependencies: readonly PluginDependency[]): PluginBuilder;

    /**
     * Set initialization callback
     * @param callback Initialization callback
     * @returns Plugin builder
     */
    initialize(callback: () => Promise<void>): PluginBuilder;

    /**
     * Set activation callback
     * @param callback Activation callback
     * @returns Plugin builder
     */
    activate(callback: () => Promise<void>): PluginBuilder;

    /**
     * Set deactivation callback
     * @param callback Deactivation callback
     * @returns Plugin builder
     */
    deactivate(callback: () => Promise<void>): PluginBuilder;

    /**
     * Set destruction callback
     * @param callback Destruction callback
     * @returns Plugin builder
     */
    destroy(callback: () => Promise<void>): PluginBuilder;

    /**
     * Register an API
     * @param apiName API name
     * @param api API object
     * @returns Plugin builder
     */
    api(apiName: string, api: unknown): PluginBuilder;

    /**
     * Build the plugin
     * @returns Plugin instance
     */
    build(): Plugin;
  }

  // ===== Event System Types =====

  /**
   * Event handler function type
   */
  export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

  /**
   * Hook function type for processing intervention
   */
  export type HookFunction<T = unknown> = (...args: unknown[]) => T | Promise<T>;

  /**
   * Event listener with metadata
   */
  export interface EventListener<T = unknown> {
    readonly handler: EventHandler<T>;
    readonly once?: boolean;
    readonly priority?: number;
  }

  /**
   * Hook registration with metadata
   */
  export interface Hook<T = unknown> {
    readonly name: string;
    readonly function: HookFunction<T>;
    readonly priority?: number;
    readonly context?: unknown;
  }

  /**
   * Event cancellation token
   */
  export interface EventCancellationToken {
    cancelled: boolean;
    cancel(): void;
    reason?: string;
  }

  /**
   * Event context with cancellation and propagation control
   */
  export interface EventContext<T = unknown> {
    readonly data: T;
    readonly event: string;
    readonly timestamp: number;
    readonly source?: string;
    readonly cancellation?: EventCancellationToken;
    stopPropagation?: boolean;
  }

  // ===== Global Plugin Manager =====

  /**
   * Global plugin manager instance
   */
  export const pluginManager: PluginManagerInterface;

  // ===== Module Exports =====

  export {
    PluginId,
    VersionString,
    PluginMetadata,
    PluginDependency,
    PluginState,
    PluginErrorType,
    PluginError,
    PluginConfig,
    PluginEventSystem,
    PluginContext,
    Plugin,
    BasePlugin,
    SimplePlugin,
    PluginFactory,
    PluginRegistration,
    PluginRegistrationOptions,
    PluginManagerEvents,
    PluginManagerInterface,
    PluginBuilder,
    EventHandler,
    HookFunction,
    EventListener,
    Hook,
    EventCancellationToken,
    EventContext
  };
}

/**
 * Plugin testing utilities
 */
declare module 'q5m/plugins/testing' {
  import { PluginManagerInterface } from 'q5m/plugins';

  /**
   * Create a test plugin manager for testing purposes
   * @returns Test plugin manager instance
   */
  export function createTestPluginManager(): PluginManagerInterface;

  /**
   * Mock plugin implementation for testing
   */
  export class MockPlugin {
    constructor(id: string, metadata: any);
    // Mock implementation details
  }
}

export {};