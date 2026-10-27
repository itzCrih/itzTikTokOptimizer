/**
 * itzTikTok Optimizer - Cross-component Messaging
 * Clean abstraction over chrome.runtime.sendMessage and chrome.tabs.sendMessage.
 */

import { MESSAGE_TYPES } from './constants.js';

/**
 * Sends a message to the active TikTok tab's content script.
 */
export async function sendToActiveTikTokTab(message) {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
    return { success: false, error: 'Tabs API unavailable' };
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      return { success: false, error: 'No active tab found' };
    }

    const activeTab = tabs[0];
    if (!activeTab.url || !activeTab.url.includes('tiktok.com')) {
      return { success: false, isTikTok: false, error: 'Active tab is not TikTok' };
    }

    const response = await chrome.tabs.sendMessage(activeTab.id, message);
    return { success: true, isTikTok: true, tabId: activeTab.id, response };
  } catch (err) {
    // Tab might not have content script loaded yet (e.g. before refresh)
    return { success: false, error: err.message };
  }
}

/**
 * Broadcasts a message to all open TikTok tabs.
 */
export async function broadcastToTikTokTabs(message) {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
    return [];
  }

  try {
    const tabs = await chrome.tabs.query({ url: '*://*.tiktok.com/*' });
    const results = [];
    for (const tab of tabs) {
      try {
        const resp = await chrome.tabs.sendMessage(tab.id, message);
        results.push({ tabId: tab.id, success: true, response: resp });
      } catch (e) {
        results.push({ tabId: tab.id, success: false, error: e.message });
      }
    }
    return results;
  } catch (err) {
    console.warn('[itzTikTokOptimizer] Broadcast error:', err);
    return [];
  }
}

/**
 * Sends a message to runtime (service worker or popup).
 */
export async function sendToRuntime(message) {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (err) {
    // Listener may not exist in background worker if not needed
    return null;
  }
}
