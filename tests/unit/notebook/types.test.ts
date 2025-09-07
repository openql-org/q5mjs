// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { NotebookOutput } from '@/notebook/types';
import type { MimeBundle, JupyterWindow } from '@/notebook/types';

describe('Notebook Types', () => {
  describe('NotebookOutput', () => {
    const mockMimeBundle: MimeBundle = {
      'text/plain': 'Plain text representation',
      'text/html': '<div>HTML representation</div>',
      'text/latex': '$$\\LaTeX$$ representation',
      'image/svg+xml': '<svg>SVG representation</svg>',
      'application/json': { data: 'json' },
    };

    let notebookOutput: NotebookOutput;

    beforeEach(() => {
      notebookOutput = new NotebookOutput(mockMimeBundle);
    });

    it('should create NotebookOutput with MIME bundle', () => {
      expect(notebookOutput).toBeInstanceOf(NotebookOutput);
    });

    it('should return complete MIME bundle', () => {
      const result = notebookOutput.toMimeBundle();
      expect(result).toEqual(mockMimeBundle);
    });

    it('should return HTML representation', () => {
      const result = notebookOutput.toHTML();
      expect(result).toBe('<div>HTML representation</div>');
    });

    it('should return plain text when HTML not available', () => {
      const bundleWithoutHTML: MimeBundle = {
        'text/plain': 'Plain text only',
      };
      const output = new NotebookOutput(bundleWithoutHTML);
      const result = output.toHTML();
      expect(result).toBe('Plain text only');
    });

    it('should return SVG representation', () => {
      const result = notebookOutput.toSVG();
      expect(result).toBe('<svg>SVG representation</svg>');
    });

    it('should return undefined when SVG not available', () => {
      const bundleWithoutSVG: MimeBundle = {
        'text/plain': 'Plain text only',
      };
      const output = new NotebookOutput(bundleWithoutSVG);
      const result = output.toSVG();
      expect(result).toBeUndefined();
    });

    it('should return LaTeX representation', () => {
      const result = notebookOutput.toLaTeX();
      expect(result).toBe('$$\\LaTeX$$ representation');
    });

    it('should return undefined when LaTeX not available', () => {
      const bundleWithoutLaTeX: MimeBundle = {
        'text/plain': 'Plain text only',
      };
      const output = new NotebookOutput(bundleWithoutLaTeX);
      const result = output.toLaTeX();
      expect(result).toBeUndefined();
    });

    it('should return plain text representation', () => {
      const result = notebookOutput.toText();
      expect(result).toBe('Plain text representation');
    });

    it('should handle minimal MIME bundle', () => {
      const minimalBundle: MimeBundle = {
        'text/plain': 'Minimal output',
      };
      const output = new NotebookOutput(minimalBundle);

      expect(output.toText()).toBe('Minimal output');
      expect(output.toHTML()).toBe('Minimal output');
      expect(output.toSVG()).toBeUndefined();
      expect(output.toLaTeX()).toBeUndefined();
    });

    it('should handle empty bundle gracefully', () => {
      const emptyBundle: MimeBundle = {
        'text/plain': '',
      };
      const output = new NotebookOutput(emptyBundle);

      expect(output.toText()).toBe('');
      expect(output.toHTML()).toBe('');
      expect(output.toSVG()).toBeUndefined();
      expect(output.toLaTeX()).toBeUndefined();
    });
  });

  describe('Type Interfaces', () => {
    it('should properly type MimeBundle', () => {
      const mimeBundle: MimeBundle = {
        'text/plain': 'text',
        'text/html': '<div>html</div>',
        'text/latex': '$$latex$$',
        'image/svg+xml': '<svg></svg>',
        'application/javascript': 'console.log("js");',
        'application/json': { key: 'value' },
      };

      expect(typeof mimeBundle['text/plain']).toBe('string');
      expect(typeof mimeBundle['text/html']).toBe('string');
      expect(typeof mimeBundle['text/latex']).toBe('string');
      expect(typeof mimeBundle['image/svg+xml']).toBe('string');
      expect(typeof mimeBundle['application/javascript']).toBe('string');
      expect(typeof mimeBundle['application/json']).toBe('object');
    });

    it('should properly type JupyterWindow', () => {
      const mockJupyterWindow: JupyterWindow = {
        Jupyter: {
          notebook: {
            kernel: {},
          },
        },
      };

      expect(mockJupyterWindow.Jupyter).toBeDefined();
      expect(mockJupyterWindow.Jupyter?.notebook).toBeDefined();
      expect(mockJupyterWindow.Jupyter?.notebook?.kernel).toBeDefined();
    });

    it('should handle JupyterWindow with IPython', () => {
      const mockIPythonWindow: JupyterWindow = {
        IPython: {
          notebook: {
            kernel: {},
          },
        },
      };

      expect(mockIPythonWindow.IPython).toBeDefined();
      expect(mockIPythonWindow.IPython?.notebook).toBeDefined();
      expect(mockIPythonWindow.IPython?.notebook?.kernel).toBeDefined();
    });

    it('should handle minimal JupyterWindow', () => {
      const minimalWindow: JupyterWindow = {};

      expect(minimalWindow.Jupyter).toBeUndefined();
      expect(minimalWindow.IPython).toBeUndefined();
    });
  });

  describe('NotebookRenderOptions type compliance', () => {
    it('should accept valid render options', () => {
      // This test verifies TypeScript compilation - no runtime assertions needed
      const options = {
        interactive: true,
        showMeasurements: true,
        showStateVector: false,
        theme: 'dark' as const,
        maxQubitDisplay: 5,
      };

      expect(options.interactive).toBe(true);
      expect(options.showMeasurements).toBe(true);
      expect(options.showStateVector).toBe(false);
      expect(options.theme).toBe('dark');
      expect(options.maxQubitDisplay).toBe(5);
    });

    it('should accept partial options', () => {
      const partialOptions = {
        theme: 'light' as const,
      };

      expect(partialOptions.theme).toBe('light');
    });

    it('should accept empty options', () => {
      const emptyOptions = {};
      expect(emptyOptions).toEqual({});
    });
  });
});
