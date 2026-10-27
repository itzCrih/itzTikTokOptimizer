/**
 * itzTikTok Optimizer - Shared Constants
 * Visual identity and engineering standard: https://itzcrih.it
 */

export const EXTENSION_NAME = 'itzTikTok Optimizer';
export const EXTENSION_VERSION = '1.0.1';
export const AUTHOR_URL = 'https://itzcrih.it';

export const STORAGE_KEY_SETTINGS = 'itz_tiktok_optimizer_settings';
export const STORAGE_KEY_DIAGNOSTICS = 'itz_tiktok_optimizer_diagnostics';

export const MESSAGE_TYPES = {
  GET_SETTINGS: 'GET_SETTINGS',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  TOGGLE_MODULE: 'TOGGLE_MODULE',
  TOGGLE_MASTER: 'TOGGLE_MASTER',
  ENABLE_ALL: 'ENABLE_ALL',
  DISABLE_ALL: 'DISABLE_ALL',
  RESET_DEFAULTS: 'RESET_DEFAULTS',
  GET_DIAGNOSTICS: 'GET_DIAGNOSTICS',
  DIAGNOSTICS_RESPONSE: 'DIAGNOSTICS_RESPONSE',
  PAGE_NAVIGATED: 'PAGE_NAVIGATED'
};

export const ROUTES = {
  FEED: 'feed',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  LIVE: 'live',
  SERIES: 'series',
  PROFILE: 'profile',
  VIDEO: 'video',
  EXPLORE: 'explore',
  UNKNOWN: 'unknown'
};

export const MODULE_IDS = {
  MESSAGING: 'messagingOptimization',
  NOTIFICATIONS: 'notificationOptimization',
  FEED: 'feedOptimization',
  LIVE_REMOVAL: 'liveRemoval',
  DRAMA_REMOVAL: 'dramaRemoval',
  MEDIA: 'mediaOptimization',
  ANIMATIONS: 'animationReduction',
  INTERFACE_CLEANUP: 'interfaceCleanup',
  BACKGROUND_ACTIVITY: 'backgroundActivityOptimization',
  DIAGNOSTICS: 'performanceDiagnostics'
};
