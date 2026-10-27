/**
 * itzTikTok Optimizer - Content Script Main Entry Point
 * Orchestrates modules, listens for runtime settings updates, and tracks SPA route changes.
 */

import { LifecycleManager } from './lifecycle.js';
import { initNavigationTracker, onRouteChanged } from './navigation.js';
import { getSettings, onSettingsChanged } from '../settings/storage.js';
import { MESSAGE_TYPES } from '../shared/constants.js';

// Module Imports
import { MessagingModule } from './modules/messaging.js';
import { NotificationsModule } from './modules/notifications.js';
import { FeedModule } from './modules/feed.js';
import { LiveRemovalModule } from './modules/live-removal.js';
import { DramaRemovalModule } from './modules/drama-removal.js';
import { MediaModule } from './modules/media.js';
import { AnimationsModule } from './modules/animations.js';
import { InterfaceCleanupModule } from './modules/interface-cleanup.js';
import { BackgroundActivityModule } from './modules/background-activity.js';
import { DiagnosticsModule } from './modules/diagnostics.js';

async function bootstrap() {
  const lifecycle = new LifecycleManager();

  // Register all 10 optimization modules
  lifecycle.register(new MessagingModule());
  lifecycle.register(new NotificationsModule());
  lifecycle.register(new FeedModule());
  lifecycle.register(new LiveRemovalModule());
  lifecycle.register(new DramaRemovalModule());
  lifecycle.register(new MediaModule());
  lifecycle.register(new AnimationsModule());
  lifecycle.register(new InterfaceCleanupModule());
  lifecycle.register(new BackgroundActivityModule());

  const diagnostics = new DiagnosticsModule(lifecycle);
  lifecycle.register(diagnostics);

  // Initialize SPA Navigation Tracker
  initNavigationTracker();
  onRouteChanged((routeInfo) => {
    lifecycle.notifyNavigation(routeInfo);
  });

  // Load and apply persistent settings
  const settings = await getSettings();
  await lifecycle.initAll(settings);

  // Synchronize on settings changes
  onSettingsChanged((newSettings) => {
    lifecycle.syncSettings(newSettings);
  });

  // Handle messages from popup or background worker
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || !message.type) return false;

      if (message.type === MESSAGE_TYPES.GET_DIAGNOSTICS) {
        const report = diagnostics.collectSnapshot();
        sendResponse({ success: true, diagnostics: report });
        return true;
      }

      if (message.type === MESSAGE_TYPES.SETTINGS_UPDATED) {
        lifecycle.syncSettings(message.settings);
        sendResponse({ success: true });
        return true;
      }

      return false;
    });
  }

  console.log(
    '%c itzTikTok Optimizer %c Active & Performance Engine Running %c https://itzcrih.it ',
    'background: #e6b422; color: #090b0e; font-weight: bold; padding: 2px 6px; border-radius: 3px 0 0 3px;',
    'background: #121720; color: #eef2ff; padding: 2px 6px;',
    'background: #090b0e; color: #8292a8; font-size: 10px; padding: 2px 6px; border-radius: 0 3px 3px 0;'
  );
}

// Start execution once document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
