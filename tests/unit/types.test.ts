// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import * as Types from '@/types';

describe('Types Export', () => {
  describe('Core Circuit Types', () => {
    it('should export CURRENT_VERSION and SUPPORTED_VERSIONS', () => {
      expect(Types.CURRENT_VERSION).toBeDefined();
      expect(Types.SUPPORTED_VERSIONS).toBeDefined();
      expect(Array.isArray(Types.SUPPORTED_VERSIONS)).toBe(true);
    });
  });

  describe('Core Classes', () => {
    it('should export Circuit class', () => {
      expect(Types.Circuit).toBeDefined();
      expect(typeof Types.Circuit).toBe('function');
    });

    it('should export QubitState class', () => {
      expect(Types.QubitState).toBeDefined();
      expect(typeof Types.QubitState).toBe('function');
    });
  });

  describe('Core System Types', () => {
    it('should export RepType enum', () => {
      expect(Types.RepType).toBeDefined();
      expect(typeof Types.RepType).toBe('object');
    });
  });

  describe('Visualization', () => {
    it('should export CircuitRenderer class', () => {
      expect(Types.CircuitRenderer).toBeDefined();
      expect(typeof Types.CircuitRenderer).toBe('function');
    });

    it('should export StateRenderer class', () => {
      expect(Types.StateRenderer).toBeDefined();
      expect(typeof Types.StateRenderer).toBe('function');
    });
  });

  describe('Notebook Integration', () => {
    it('should export NotebookOutput enum', () => {
      expect(Types.NotebookOutput).toBeDefined();
      expect(typeof Types.NotebookOutput).toBe('function');
    });
  });

  describe('Mathematical Types', () => {
    it('should export complex number utilities', () => {
      expect(Types.complex).toBeDefined();
      expect(Types.ZERO).toBeDefined();
      expect(Types.ONE).toBeDefined();
      expect(Types.I).toBeDefined();
      expect(typeof Types.complex).toBe('function');
    });

    it('should export math utilities', () => {
      expect(Types.isValidAmplitude).toBeDefined();
      expect(Types.createAmplitude).toBeDefined();
      expect(Types.normalizeAmplitudes).toBeDefined();
      expect(Types.isUnitary).toBeDefined();
      expect(Types.createUnitary).toBeDefined();
      expect(Types.isHermitian).toBeDefined();
      expect(Types.createHermitian).toBeDefined();
      expect(Types.parseAngle).toBeDefined();
      expect(Types.formatAmplitude).toBeDefined();
      expect(Types.normalize).toBeDefined();
      expect(Types.innerP).toBeDefined();
      expect(Types.tensorP).toBeDefined();
      expect(Types.matXvec).toBeDefined();
      expect(Types.matXmat).toBeDefined();
      expect(Types.dagger).toBeDefined();
      
      expect(typeof Types.isValidAmplitude).toBe('function');
      expect(typeof Types.createAmplitude).toBe('function');
    });
  });

  describe('All Exports Comprehensive Test', () => {
    it('should have all major exports available', () => {
      // This test ensures that importing all exports actually executes the export statements
      const exportKeys = Object.keys(Types);
      expect(exportKeys.length).toBeGreaterThan(0);
      
      // Test a few key exports to ensure they're properly accessible
      expect(Types.Circuit).toBeDefined();
      expect(Types.QubitState).toBeDefined();
      expect(Types.complex).toBeDefined();
    });
  });
});
