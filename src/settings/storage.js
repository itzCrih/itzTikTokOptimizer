/**
 * itzTikTok Optimizer - Storage & Settings Manager
 * Provides reliable, synchronized persistence across popup, background worker, and content scripts.
 */

import { STORAGE_KEY_SETTINGS, MODULE_IDS } from '../shared/constants.js';
import { getDefaultSettings } from './defaults.js';

let inMemoryStorage = null;

/**
 * Deep merge utility to ensure loaded settings always have all keys defined in defaults.
 */
export function mergeSettings(defaults, loaded) {
  if (!loaded || typeof loaded !== 'object') {
    return JSON.parse(JSON.stringify(defaults));
  }

  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (loaded[key] === undefined) {
      result[key] = JSON.parse(JSON.stringify(defaults[key]));
    } else if (
      typeof defaults[key] === 'object' &&
      defaults[key] !== null &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = {
        ...defaults[key],
        ...(typeof loaded[key] === 'object' && loaded[key] !== null ? loaded[key] : {})
      };
    } else {
      result[key] = loaded[key];
    }
  }
  return result;
}

/**
 * Retrieves the current settings from chrome.storage.local (or memory cache).
 */
export async function getSettings() {
  const defaults = getDefaultSettings();

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const data = await chrome.storage.local.get([STORAGE_KEY_SETTINGS]);
      const stored = data[STORAGE_KEY_SETTINGS];
      return mergeSettings(defaults, stored);
    } catch (err) {
      console.warn('[itzTikTokOptimizer] Error reading chrome.storage:', err);
    }
  }

  if (inMemoryStorage) {
    return mergeSettings(defaults, inMemoryStorage);
  }

  inMemoryStorage = defaults;
  return defaults;
}

/**
 * Saves full or partial settings to storage.
 */
export async function saveSettings(settings) {
  const defaults = getDefaultSettings();
  const current = await getSettings();
  const merged = mergeSettings(defaults, { ...current, ...settings });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: merged });
    } catch (err) {
      console.error('[itzTikTokOptimizer] Error saving to chrome.storage:', err);
    }
  }

  inMemoryStorage = merged;
  return merged;
}

/**
 * Toggles the master switch without losing individual module configurations.
 */
export async function setMasterEnabled(enabled) {
  return await saveSettings({ masterEnabled: !!enabled });
}

/**
 * Sets an individual module's enabled state.
 */
export async function setModuleEnabled(moduleId, enabled) {
  const patch = { [moduleId]: !!enabled };
  return await saveSettings(patch);
}

/**
 * Sets module-specific options.
 */
export async function setModuleOptions(optionsKey, newOptions) {
  const current = await getSettings();
  const existingOptions = current[optionsKey] || {};
  const updated = {
    ...existingOptions,
    ...newOptions
  };
  return await saveSettings({ [optionsKey]: updated });
}

/**
 * Enables all optimization modules (and master switch).
 */
export async function enableAllModules() {
  const patch = {
    masterEnabled: true
  };
  for (const modId of Object.values(MODULE_IDS)) {
    // Keep diagnostics optional, but enable all optimization modules
    if (modId !== MODULE_IDS.DIAGNOSTICS) {
      patch[modId] = true;
    }
  }
  return await saveSettings(patch);
}

/**
 * Disables all optimization modules.
 */
export async function disableAllModules() {
  const patch = {};
  for (const modId of Object.values(MODULE_IDS)) {
    patch[modId] = false;
  }
  return await saveSettings(patch);
}

/**
 * Resets settings to defaults.
 */
export async function resetToDefaults() {
  const defaults = getDefaultSettings();
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: defaults });
    } catch (err) {
      console.error('[itzTikTokOptimizer] Error resetting chrome.storage:', err);
    }
  }
  inMemoryStorage = defaults;
  return defaults;
}

/**
 * Subscribes to storage changes.
 */
export function onSettingsChanged(callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    const listener = (changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_KEY_SETTINGS]) {
        callback(changes[STORAGE_KEY_SETTINGS].newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
  return () => {};
}
