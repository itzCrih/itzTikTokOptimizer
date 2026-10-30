/**
 * itzTikTok Optimizer - Media & Video Optimization Module
 * 
 * Target Bottlenecks:
 * 1. Offscreen video elements continuing hardware decode loops when scrolled away.
 * 2. Unnecessary media decoding in thumbnail grids and explore cards.
 * 
 * Safety Critical:
 * - NEVER interferes with active FYP video playback, audio controls, seeking, or fullscreen.
 * - Respects user play/pause actions.
 * - Uses native IntersectionObserver with zero layout thrashing.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

export class MediaModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.MEDIA, 'Media Optimization');
    this.mediaObserver = null;
    this.domObserver = null;
    this.trackedVideos = new WeakSet();
  }

  async onEnable(settings) {
    this.applyMediaStyles();
    this.setupVideoObserver();
    this.setupDomObserver();
  }

  async onDisable() {
    this.removeCSS();
    if (this.mediaObserver) {
      this.mediaObserver.disconnect();
      this.mediaObserver = null;
    }
    if (this.domObserver) {
      this.domObserver.disconnect();
      this.domObserver = null;
    }
  }

  applyMediaStyles() {
    if (!this.enabled) return;

    // Apply paint & layout containment to video containers and thumbnail cards
    const css = `
      /* Video Player Container Containment */
      div[data-e2e="feed-video"],
      div[class*="DivVideoPlayerContainer"],
      div[class*="DivBasicPlayerWrapper"] {
        contain: layout;
      }
    `;

    this.injectCSS(css);
  }

  setupVideoObserver() {
    if (this.mediaObserver || typeof IntersectionObserver === 'undefined') return;

    if (this.options.pauseOffscreenVideo === false) return;

    this.mediaObserver = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const video = entry.target;

        // Never interfere if video is in fullscreen
        if (document.fullscreenElement === video || video.closest(':fullscreen')) {
          continue;
        }

        // If completely offscreen (< 5% visible) and currently playing, pause decoding
        if (!entry.isIntersecting || entry.intersectionRatio < 0.05) {
          if (!video.paused && !video.ended) {
            // Mark that optimizer paused it so we know it's offscreen
            video.dataset.itzOffscreenPaused = 'true';
            video.pause();
          }
        } else if (entry.intersectionRatio >= 0.5) {
          // If scrolled back into view and was paused by optimizer, resume
          if (video.dataset.itzOffscreenPaused === 'true') {
            delete video.dataset.itzOffscreenPaused;
            video.play().catch(() => {});
          }
        }
      }
    }, {
      threshold: [0, 0.5]
    });

    this.registerObserver(this.mediaObserver);
    this.observeExistingVideos();
  }

  observeExistingVideos() {
    if (!this.mediaObserver) return;
    const videos = document.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      this.observeVideo(videos[i]);
    }
  }

  observeVideo(video) {
    if (!this.mediaObserver || !video || this.trackedVideos.has(video)) return;
    this.trackedVideos.add(video);
    this.mediaObserver.observe(video);
  }

  setupDomObserver() {
    if (this.domObserver || typeof document === 'undefined') return;

    this.domObserver = createBatchedObserver({
      target: document.body || document.documentElement || document,
      config: { childList: true, subtree: true },
      debounceMs: 120,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
        if (!this.mediaObserver) return;
        for (let i = 0; i < mutations.length; i++) {
          const addedNodes = mutations[i].addedNodes;
          for (let j = 0; j < addedNodes.length; j++) {
            const node = addedNodes[j];
            if (node.nodeType !== 1) continue;
            if (node.tagName === 'VIDEO') {
              this.observeVideo(node);
            } else if (node.querySelectorAll) {
              const vids = node.querySelectorAll('video');
              for (let k = 0; k < vids.length; k++) {
                this.observeVideo(vids[k]);
              }
            }
          }
        }
      }
    });

    if (this.domObserver) {
      this.registerObserver(this.domObserver);
    }
  }
}
