// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  NotebookRenderer,
  NotebookOutput,
  extendCircuitForNotebook,
  extendQubitStateForNotebook,
  enableNotebookMode,
} from '@/notebook/index';
import type {
  MimeBundle,
  JupyterDisplayObject,
  NotebookRenderOptions,
  JupyterWindow,
} from '@/notebook/index';

describe('Notebook Module Index', () => {
  describe('Exports', () => {
    it('should export NotebookRenderer class', () => {
      expect(NotebookRenderer).toBeDefined();
      expect(typeof NotebookRenderer).toBe('function');
      expect(NotebookRenderer.prototype).toBeDefined();
    });

    it('should export NotebookOutput class', () => {
      expect(NotebookOutput).toBeDefined();
      expect(typeof NotebookOutput).toBe('function');
      expect(NotebookOutput.prototype).toBeDefined();
    });

    it('should export extension functions', () => {
      expect(extendCircuitForNotebook).toBeDefined();
      expect(typeof extendCircuitForNotebook).toBe('function');

      expect(extendQubitStateForNotebook).toBeDefined();
      expect(typeof extendQubitStateForNotebook).toBe('function');

      expect(enableNotebookMode).toBeDefined();
      expect(typeof enableNotebookMode).toBe('function');
    });

    it('should export type definitions', () => {
      // These are compile-time checks - ensuring types are properly exported
      const mimeBundle: MimeBundle = {
        'text/plain': 'test',
      };
      expect(mimeBundle).toBeDefined();

      const jupyterWindow: JupyterWindow = {
        Jupyter: {
          notebook: {
            kernel: {},
          },
        },
      };
      expect(jupyterWindow).toBeDefined();

      const options: NotebookRenderOptions = {
        interactive: true,
        theme: 'dark',
      };
      expect(options).toBeDefined();
    });

    it('should have JupyterDisplayObject interface available', () => {
      // Test that the interface can be implemented
      class TestDisplayObject implements JupyterDisplayObject {
        _repr_html_(): string {
          return '<div>test</div>';
        }

        _repr_svg_(): string {
          return '<svg></svg>';
        }

        _repr_latex_(): string {
          return '$$test$$';
        }

        _repr_json_(): any {
          return { test: true };
        }

        _repr_mimebundle_(): MimeBundle {
          return {
            'text/plain': 'test',
            'text/html': '<div>test</div>',
          };
        }
      }

      const obj = new TestDisplayObject();
      expect(obj._repr_html_()).toBe('<div>test</div>');
      expect(obj._repr_svg_()).toBe('<svg></svg>');
      expect(obj._repr_latex_()).toBe('$$test$$');
      expect(obj._repr_json_()).toEqual({ test: true });
      expect(obj._repr_mimebundle_()).toEqual({
        'text/plain': 'test',
        'text/html': '<div>test</div>',
      });
    });
  });

  describe('Module Integration', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockImplementation();
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create NotebookOutput instances', () => {
      const mimeBundle: MimeBundle = {
        'text/plain': 'Test output',
        'text/html': '<div>Test HTML</div>',
      };

      const output = new NotebookOutput(mimeBundle);
      expect(output).toBeInstanceOf(NotebookOutput);
      expect(output.toText()).toBe('Test output');
      expect(output.toHTML()).toBe('<div>Test HTML</div>');
    });

    it('should use NotebookRenderer static methods', () => {
      expect(typeof NotebookRenderer.isJupyterEnvironment).toBe('function');
      expect(typeof NotebookRenderer.enableNotebookMode).toBe('function');
      expect(typeof NotebookRenderer.renderCircuit).toBe('function');
      expect(typeof NotebookRenderer.renderState).toBe('function');
    });

    it('should provide working extension functions', () => {
      // Mock classes with proper prototype setup
      function MockCircuit() {}
      MockCircuit.prototype = {};
      
      function MockQubitState() {}
      MockQubitState.prototype = {};

      // Test extensions
      expect(() => extendCircuitForNotebook(MockCircuit as any)).not.toThrow();
      expect(() => extendQubitStateForNotebook(MockQubitState as any)).not.toThrow();
      expect(() => enableNotebookMode()).not.toThrow();
    });

    it('should handle complex type scenarios', () => {
      // Test complex MimeBundle
      const complexBundle: MimeBundle = {
        'text/plain': 'Complex output',
        'text/html': '<div><span>Complex HTML</span></div>',
        'text/latex': '$$\\sum_{i=0}^{n} x_i$$',
        'image/svg+xml': '<svg><circle r="10"/></svg>',
        'application/javascript': 'console.log("test");',
        'application/json': {
          complex: true,
          data: [1, 2, 3],
          nested: {
            value: 'test',
          },
        },
      };

      const output = new NotebookOutput(complexBundle);
      expect(output.toMimeBundle()).toEqual(complexBundle);
    });

    it('should handle NotebookRenderOptions variations', () => {
      const minimalOptions: NotebookRenderOptions = {};
      const fullOptions: NotebookRenderOptions = {
        interactive: true,
        showMeasurements: false,
        showStateVector: true,
        theme: 'light',
        maxQubitDisplay: 8,
      };

      expect(minimalOptions).toEqual({});
      expect(fullOptions.interactive).toBe(true);
      expect(fullOptions.theme).toBe('light');
      expect(fullOptions.maxQubitDisplay).toBe(8);
    });

    it('should handle JupyterWindow variations', () => {
      const jupyterOnly: JupyterWindow = {
        Jupyter: {
          notebook: {
            kernel: { test: true },
          },
        },
      };

      const ipythonOnly: JupyterWindow = {
        IPython: {
          notebook: {
            kernel: { version: '1.0' },
          },
        },
      };

      const both: JupyterWindow = {
        Jupyter: {
          notebook: {
            kernel: {},
          },
        },
        IPython: {
          notebook: {
            kernel: {},
          },
        },
      };

      const neither: JupyterWindow = {};

      expect(jupyterOnly.Jupyter).toBeDefined();
      expect(ipythonOnly.IPython).toBeDefined();
      expect(both.Jupyter).toBeDefined();
      expect(both.IPython).toBeDefined();
      expect(neither.Jupyter).toBeUndefined();
      expect(neither.IPython).toBeUndefined();
    });
  });

  describe('Type Safety', () => {
    it('should enforce MimeBundle structure', () => {
      // Valid MimeBundle
      const validBundle: MimeBundle = {
        'text/plain': 'required field',
      };
      expect(validBundle['text/plain']).toBe('required field');

      // Bundle with optional fields
      const fullBundle: MimeBundle = {
        'text/plain': 'text',
        'text/html': '<div>html</div>',
        'text/latex': '$$latex$$',
        'image/svg+xml': '<svg></svg>',
        'application/javascript': 'js code',
        'application/json': { key: 'value' },
      };
      expect(Object.keys(fullBundle)).toHaveLength(6);
    });

    it('should enforce NotebookRenderOptions type safety', () => {
      // Valid options
      const validOptions: NotebookRenderOptions = {
        interactive: true,
        showMeasurements: false,
        showStateVector: true,
        theme: 'dark',
        maxQubitDisplay: 10,
      };

      expect(typeof validOptions.interactive).toBe('boolean');
      expect(typeof validOptions.showMeasurements).toBe('boolean');
      expect(typeof validOptions.showStateVector).toBe('boolean');
      expect(validOptions.theme).toBe('dark');
      expect(typeof validOptions.maxQubitDisplay).toBe('number');
    });

    it('should support JupyterDisplayObject implementation', () => {
      class CustomDisplayObject implements JupyterDisplayObject {
        data: string;

        constructor(data: string) {
          this.data = data;
        }

        _repr_html_(): string {
          return `<div>${this.data}</div>`;
        }

        _repr_svg_(): string {
          return `<svg><text>${this.data}</text></svg>`;
        }

        _repr_latex_(): string {
          return `$$\\text{${this.data}}$$`;
        }

        _repr_json_(): any {
          return { data: this.data, type: 'custom' };
        }

        _repr_mimebundle_(): MimeBundle {
          return {
            'text/plain': this.data,
            'text/html': this._repr_html_(),
            'text/latex': this._repr_latex_(),
            'application/json': this._repr_json_(),
          };
        }
      }

      const obj = new CustomDisplayObject('test data');
      expect(obj._repr_html_()).toBe('<div>test data</div>');
      expect(obj._repr_json_()).toEqual({ data: 'test data', type: 'custom' });

      const bundle = obj._repr_mimebundle_();
      expect(bundle['text/plain']).toBe('test data');
      expect(bundle['text/html']).toBe('<div>test data</div>');
    });
  });

  describe('Module Completeness', () => {
    it('should provide all expected exports', () => {
      const notebookModule = require('../../../src/notebook/index');

      // Check all exports are present
      const expectedExports = [
        'NotebookRenderer',
        'NotebookOutput',
        'extendCircuitForNotebook',
        'extendQubitStateForNotebook',
        'enableNotebookMode',
      ];

      expectedExports.forEach(exportName => {
        expect(notebookModule).toHaveProperty(exportName);
        expect(notebookModule[exportName]).toBeDefined();
      });
    });

    it('should not export unexpected items', () => {
      const notebookModule = require('../../../src/notebook/index');
      const exports = Object.keys(notebookModule);

      // Should not have internal/private exports
      const internalNames = ['__esModule', 'default'];
      const unexpectedExports = exports.filter(name => 
        !['NotebookRenderer', 'NotebookOutput', 'extendCircuitForNotebook', 
          'extendQubitStateForNotebook', 'enableNotebookMode', ...internalNames].includes(name)
      );

      expect(unexpectedExports).toEqual([]);
    });

    it('should maintain consistency across imports', () => {
      // Test that multiple imports of the same module return the same references
      const import1 = require('../../../src/notebook/index');
      const import2 = require('../../../src/notebook/index');

      expect(import1.NotebookRenderer).toBe(import2.NotebookRenderer);
      expect(import1.NotebookOutput).toBe(import2.NotebookOutput);
      expect(import1.enableNotebookMode).toBe(import2.enableNotebookMode);
    });
  });
});
