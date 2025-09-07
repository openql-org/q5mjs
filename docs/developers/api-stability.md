# Extension API Stability

This document defines the stability guarantees for the q5m.js extension API.

## Versioning

The extension API follows **Semantic Versioning 2.0.0** (SemVer):

- **MAJOR**: Breaking changes that require code updates
- **MINOR**: New features, backward compatible  
- **PATCH**: Bug fixes, backward compatible

## Stability Promise

- Core classes (QubitState, Circuit, Complex) maintain compatibility within major versions
- Plugin system APIs are stable within major versions
- Extension API version is clearly indicated

## Breaking Changes

Breaking changes require a major version bump and include:
- Removing public methods or properties
- Changing method signatures
- Changing behavior of existing methods

## Migration

When major versions change:
1. Review the changelog for breaking changes
2. Update your extension code accordingly
3. Test thoroughly with the new version

## Current Version: 1.0.0

The extension API provides direct access to core classes without abstraction layers, ensuring simplicity and performance.