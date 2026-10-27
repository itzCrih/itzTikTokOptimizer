/**
 * itzTikTok Optimizer - Short Drama & Mini-Series Removal Module
 * 
 * Target Content:
 * 1. Promotional mini-drama / series hubs and carousels.
 * 2. Sponsored short drama feed cards.
 * 3. Series navigation links and promotional explore banners.
 * 
 * Strategy:
 * - Precise semantic identification: href containing '/series/' or '/drama/', data-e2e markers.
 * - CSS :has() suppression for instant zero-flicker filtering.
 * - Batched dynamic observer for scroll-loaded cards.
 * - Reversible: full restoration on module disable without page reload.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

const DRAMA_HIDE_CLASS = 'itz-hidden-drama-content';

export class DramaRemovalModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.DRAMA_REMOVAL, 'Short Drama Removal');
    this.observer = null;
  }

  async onEnable(settings) {
    this.applyDramaStyles();
    this.scanAndSuppressDramaElements();
    this.setupDramaObserver();
  }

  async onDisable() {
    this.removeCSS();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.restoreSuppressedElements();
  }

  applyDramaStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Series/Drama Navigation & Banners */
      a[href*="/series/"],
      a[href*="/drama/"],
      div[data-e2e="series-side-nav"],
      div[data-e2e="drama-banner"],
      div[class*="SeriesPromoContainer"],
      div[class*="DramaBanner"] {
        display: none !important;
      }

      /* 2. Feed cards with drama / series links via :has() */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/series/"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/drama/"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="series-card"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="drama-card"]),
      div[data-e2e="series-card"],
      div[data-e2e="drama-card"] {
        display: none !important;
      }

      /* 3. Class-based fallback */
      .${DRAMA_HIDE_CLASS} {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }

  isDramaElement(node) {
    if (!node || node.nodeType !== 1) return false;

    const dramaAttr = node.getAttribute && (
      node.getAttribute('data-e2e') === 'series-card' ||
      node.getAttribute('data-e2e') === 'drama-card'
    );
    if (dramaAttr) return true;

    const dramaLink = node.querySelector && node.querySelector('a[href*="/series/"], a[href*="/drama/"]');
    if (dramaLink) return true;

    return false;
  }

  scanAndSuppressDramaElements(root = document) {
    if (!root || !root.querySelectorAll) return;
    const candidates = root.querySelectorAll(
      'div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]'
    );

    for (let i = 0; i < candidates.length; i++) {
      const card = candidates[i];
      if (this.isDramaElement(card)) {
        card.classList.add(DRAMA_HIDE_CLASS);
      }
    }
  }

  setupDramaObserver() {
    if (this.observer) return;

    this.observer = createBatchedObserver({
      target: document.body,
      config: { childList: true, subtree: true },
      debounceMs: 80,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          const mut = mutations[i];
          for (let j = 0; j < mut.addedNodes.length; j++) {
            const added = mut.addedNodes[j];
            if (added.nodeType === 1) {
              this.scanAndSuppressDramaElements(added);
            }
          }
        }
      }
    });

    if (this.observer) {
      this.registerObserver(this.observer);
    }
  }

  restoreSuppressedElements() {
    const elements = document.querySelectorAll(`.${DRAMA_HIDE_CLASS}`);
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove(DRAMA_HIDE_CLASS);
    }
  }
}
