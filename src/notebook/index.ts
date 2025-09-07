// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Notebook integration module for Jupyter environments
 * @packageDocumentation
 */

export { NotebookRenderer } from './NotebookRenderer';
export { NotebookOutput } from './types';
export {
  extendCircuitForNotebook,
  extendQubitStateForNotebook,
  enableNotebookMode,
} from './notebook-extensions';
export type {
  MimeBundle,
  JupyterDisplayObject,
  NotebookRenderOptions,
  JupyterWindow,
} from './types';
