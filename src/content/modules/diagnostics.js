/**
 * itzTikTok Optimizer - Performance Diagnostics Module
 * 
 * Provides local, zero-telemetry diagnostics to measure:
 * 1. DOM tree size (node count).
 * 2. Active extension observers & listeners.
 * 3. Page load & navigation milestones.
 * 4. Chrome JS Heap memory usage (if supported).
 * 5. Current SPA route context.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';

export class DiagnosticsModule extends BaseModule {
  /**
   * @param {import('../lifecycle.js').LifecycleManager} lifecycleManager
   */
  constructor(lifecycleManager) {
    super(MODULE_IDS.DIAGNOSTICS, 'Performance Diagnostics');
    this.lifecycleManager = lifecycleManager;
    this.startTime = Date.now();
  }

  async onEnable(settings) {
    // Diagnostics runs passively on request
  }

  async onDisable() {
    // No-op
  }

  /**
   * Collects current performance diagnostics snapshot
   */
  collectSnapshot() {
    const domNodeCount = typeof document !== 'undefined'
      ? document.getElementsByTagName('*').length
      : 0;

    const memoryInfo = typeof performance !== 'undefined' && performance.memory
      ? {
          usedHeapMB: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
          totalHeapMB: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
          heapLimitMB: (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
        }
      : null;

    let paintMilestones = null;
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      if (paintEntries && paintEntries.length > 0) {
        paintMilestones = {};
        for (const entry of paintEntries) {
          paintMilestones[entry.name] = `${Math.round(entry.startTime)}ms`;
        }
      }
    }

    const modulesSummary = this.lifecycleManager
      ? this.lifecycleManager.getDiagnosticsSummary()
      : {};

    let totalObservers = 0;
    let totalListeners = 0;
    for (const info of Object.values(modulesSummary)) {
      totalObservers += info.activeObservers || 0;
      totalListeners += info.activeListeners || 0;
    }

    return {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      dom: {
        totalNodes: domNodeCount,
        status: domNodeCount > 3000 ? 'High (>3000 nodes)' : domNodeCount > 1500 ? 'Moderate' : 'Optimal'
      },
      memory: memoryInfo,
      paintMilestones,
      optimizerStats: {
        totalActiveObservers: totalObservers,
        totalActiveListeners: totalListeners,
        modules: modulesSummary
      }
    };
  }
}
