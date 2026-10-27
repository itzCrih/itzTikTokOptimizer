/**
 * itzTikTok Optimizer - Module Lifecycle Management
 * Enforces clean initialization, runtime state management, isolation, and teardown.
 */

import { injectStylesheet, removeStylesheet } from './dom-utils.js';

export class BaseModule {
  /**
   * @param {string} id - Unique module identifier
   * @param {string} name - Human readable name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.enabled = false;
    this.initialized = false;
    this.options = {};
    this.styleId = `itz-mod-${id}`;
    this.observers = [];
    this.eventListeners = [];
    this.cleanupTasks = [];
  }

  /**
   * Called once during extension bootstrapping
   */
  async init(settings) {
    this.initialized = true;
    this.options = settings[this.id.replace('Optimization', 'Options')] || {};
  }

  /**
   * Called when module is toggled ON
   */
  async enable(settings) {
    if (this.enabled) return;
    this.enabled = true;
    this.options = settings[this.id.replace('Optimization', 'Options')] || {};
    try {
      await this.onEnable(settings);
    } catch (err) {
      console.error(`[itzTikTokOptimizer] Error enabling module ${this.name}:`, err);
    }
  }

  /**
   * Called when module is toggled OFF
   */
  async disable() {
    if (!this.enabled) return;
    this.enabled = false;
    try {
      await this.onDisable();
    } catch (err) {
      console.error(`[itzTikTokOptimizer] Error disabling module ${this.name}:`, err);
    } finally {
      this.teardownResources();
    }
  }

  /**
   * Called when module sub-options change while enabled
   */
  async updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (this.enabled) {
      await this.onOptionsUpdated(this.options);
    }
  }

  /**
   * Subclasses override these hooks
   */
  async onEnable(settings) {}
  async onDisable() {}
  async onOptionsUpdated(options) {}
  onNavigate(routeInfo) {}

  /**
   * Helper: injects scoped CSS managed by this module
   */
  injectCSS(css) {
    return injectStylesheet(this.styleId, css);
  }

  /**
   * Helper: removes scoped CSS managed by this module
   */
  removeCSS() {
    return removeStylesheet(this.styleId);
  }

  /**
   * Helper: registers an observer for automatic teardown
   */
  registerObserver(observerOrWrapper) {
    if (observerOrWrapper) {
      this.observers.push(observerOrWrapper);
    }
    return observerOrWrapper;
  }

  /**
   * Helper: registers a DOM event listener for automatic teardown
   */
  registerListener(target, type, handler, options = false) {
    if (target && target.addEventListener) {
      target.addEventListener(type, handler, options);
      this.eventListeners.push({ target, type, handler, options });
    }
  }

  /**
   * Helper: registers arbitrary cleanup callback
   */
  registerCleanup(fn) {
    if (typeof fn === 'function') {
      this.cleanupTasks.push(fn);
    }
  }

  /**
   * Cleans up all resources safely
   */
  teardownResources() {
    // 1. Disconnect observers
    for (const obs of this.observers) {
      try {
        if (typeof obs.disconnect === 'function') {
          obs.disconnect();
        }
      } catch (e) {
        console.warn(`[itzTikTokOptimizer] Observer cleanup error in ${this.id}:`, e);
      }
    }
    this.observers = [];

    // 2. Remove event listeners
    for (const item of this.eventListeners) {
      try {
        item.target.removeEventListener(item.type, item.handler, item.options);
      } catch (e) {
        console.warn(`[itzTikTokOptimizer] Listener cleanup error in ${this.id}:`, e);
      }
    }
    this.eventListeners = [];

    // 3. Remove CSS
    this.removeCSS();

    // 4. Run cleanup tasks
    for (const task of this.cleanupTasks) {
      try {
        task();
      } catch (e) {
        console.warn(`[itzTikTokOptimizer] Cleanup task error in ${this.id}:`, e);
      }
    }
    this.cleanupTasks = [];
  }

  /**
   * Destroys module permanently
   */
  destroy() {
    this.disable();
    this.initialized = false;
  }
}

/**
 * Orchestrates all modules and handles settings changes
 */
export class LifecycleManager {
  constructor() {
    this.modules = new Map();
    this.currentSettings = null;
    this.isMasterActive = true;
  }

  register(moduleInstance) {
    this.modules.set(moduleInstance.id, moduleInstance);
    return this;
  }

  getModule(id) {
    return this.modules.get(id);
  }

  getAllModules() {
    return Array.from(this.modules.values());
  }

  async initAll(settings) {
    this.currentSettings = settings;
    this.isMasterActive = !!settings.masterEnabled;

    for (const mod of this.modules.values()) {
      try {
        await mod.init(settings);
        if (this.isMasterActive && settings[mod.id]) {
          await mod.enable(settings);
        }
      } catch (err) {
        console.error(`[itzTikTokOptimizer] Failed initializing module ${mod.id}:`, err);
      }
    }
  }

  async syncSettings(newSettings) {
    const prevSettings = this.currentSettings || {};
    this.currentSettings = newSettings;
    const masterChanged = prevSettings.masterEnabled !== newSettings.masterEnabled;
    this.isMasterActive = !!newSettings.masterEnabled;

    if (!this.isMasterActive) {
      // Master is turned OFF: disable all active modules
      for (const mod of this.modules.values()) {
        if (mod.enabled) {
          await mod.disable();
        }
      }
      return;
    }

    // Master is ON: reconcile individual modules
    for (const mod of this.modules.values()) {
      const shouldBeEnabled = !!newSettings[mod.id];

      if (masterChanged && shouldBeEnabled && !mod.enabled) {
        await mod.enable(newSettings);
      } else if (!masterChanged) {
        if (shouldBeEnabled && !mod.enabled) {
          await mod.enable(newSettings);
        } else if (!shouldBeEnabled && mod.enabled) {
          await mod.disable();
        } else if (shouldBeEnabled && mod.enabled) {
          // Check if module options changed
          const optKey = mod.id.replace('Optimization', 'Options');
          const oldOpts = JSON.stringify(prevSettings[optKey] || {});
          const newOpts = JSON.stringify(newSettings[optKey] || {});
          if (oldOpts !== newOpts) {
            await mod.updateOptions(newSettings[optKey] || {});
          }
        }
      }
    }
  }

  notifyNavigation(routeInfo) {
    if (!this.isMasterActive) return;

    for (const mod of this.modules.values()) {
      if (mod.enabled && typeof mod.onNavigate === 'function') {
        try {
          mod.onNavigate(routeInfo);
        } catch (err) {
          console.warn(`[itzTikTokOptimizer] Navigation handler error in ${mod.id}:`, err);
        }
      }
    }
  }

  getDiagnosticsSummary() {
    const summary = {};
    for (const mod of this.modules.values()) {
      summary[mod.id] = {
        name: mod.name,
        enabled: mod.enabled,
        activeObservers: mod.observers.length,
        activeListeners: mod.eventListeners.length
      };
    }
    return summary;
  }
}
