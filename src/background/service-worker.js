/**
 * itzTikTok Optimizer - Background Service Worker (Manifest V3)
 * Lightweight, event-driven service worker for installation initialization and badge state.
 */

import { STORAGE_KEY_SETTINGS, MESSAGE_TYPES } from '../shared/constants.js';
import { DEFAULT_SETTINGS, getDefaultSettings } from '../settings/defaults.js';
import { getSettings, mergeSettings } from '../settings/storage.js';

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    const existing = await chrome.storage.local.get([STORAGE_KEY_SETTINGS]);
    if (!existing[STORAGE_KEY_SETTINGS]) {
      await chrome.storage.local.set({
        [STORAGE_KEY_SETTINGS]: getDefaultSettings()
      });
      console.log('[itzTikTokOptimizer] Initialized default settings.');
    } else {
      // Merge in any new fields on update
      const merged = mergeSettings(DEFAULT_SETTINGS, existing[STORAGE_KEY_SETTINGS]);
      await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: merged });
      console.log('[itzTikTokOptimizer] Settings updated & merged.');
    }
  } catch (err) {
    console.error('[itzTikTokOptimizer] Install error:', err);
  }
});

// Update badge or title when tabs change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url) {
    try {
      if (tab.url.includes('tiktok.com')) {
        chrome.action.setBadgeText({ tabId, text: 'ON' }).catch(() => {});
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#e6b422' }).catch(() => {});
        chrome.action.setTitle({
          tabId,
          title: 'itzTikTok Optimizer: Active on this page'
        }).catch(() => {});
      } else {
        chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
        chrome.action.setTitle({
          tabId,
          title: 'itzTikTok Optimizer: Inactive (Open TikTok to optimize)'
        }).catch(() => {});
      }
    } catch (e) {}
  }
});

// Respond to messages from popup or content scripts if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.GET_SETTINGS) {
    getSettings().then(settings => sendResponse({ settings }));
    return true; // Keep channel open for async response
  }
  return false;
});
