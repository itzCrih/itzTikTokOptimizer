/**
 * itzTikTok Optimizer - Background Activity Optimization Module
 * 
 * Target Bottlenecks:
 * 1. CPU, GPU, and RAM drain when TikTok is left in a background tab.
 * 2. Continuous animations running in inactive tabs.
 * 
 * Strategy:
 * - Detects document.visibilitychange events.
 * - Pauses CSS animation play-states when tab is hidden.
 * - Restores full animation states instantly upon tab reactivation.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';

export class BackgroundActivityModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.BACKGROUND_ACTIVITY, 'Background Activity Optimization');
    this.visibilityHandler = null;
  }

  async onEnable(settings) {
    this.setupVisibilityListener();
    if (document.hidden) {
      this.handleTabHidden();
    }
  }

  async onDisable() {
    this.removeCSS();
    this.handleTabVisible();
  }

  setupVisibilityListener() {
    this.visibilityHandler = () => {
      if (!this.enabled) return;

      if (document.hidden) {
        this.handleTabHidden();
      } else {
        this.handleTabVisible();
      }
    };

    this.registerListener(document, 'visibilitychange', this.visibilityHandler);
  }

  handleTabHidden() {
    if (this.options.throttleWhenHidden === false) return;

    // Freeze CSS animations in background
    const css = `
      * {
        animation-play-state: paused !important;
      }
    `;
    this.injectCSS(css);

    // Optional: Pause video playback in background if configured
    if (this.options.pauseMediaOnHidden) {
      const videos = document.querySelectorAll('video');
      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        if (!v.paused && !v.ended) {
          v.dataset.itzBgPaused = 'true';
          v.pause();
        }
      }
    }
  }

  handleTabVisible() {
    this.removeCSS();

    if (this.options.pauseMediaOnHidden) {
      const pausedVideos = document.querySelectorAll('video[data-itz-bg-paused="true"]');
      for (let i = 0; i < pausedVideos.length; i++) {
        const v = pausedVideos[i];
        delete v.dataset.itzBgPaused;
        v.play().catch(() => {});
      }
    }
  }
}
