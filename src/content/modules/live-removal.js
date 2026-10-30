/**
 * itzTikTok Optimizer - Live Content Removal Module
 * 
 * Target Content:
 * 1. LIVE navigation links in desktop sidebar and header.
 * 2. LIVE stream cards embedded within the For You Page and Following feeds.
 * 3. LIVE promotional banners, previews, and floating badges.
 * 
 * Strategy:
 * - Semantic attribute matching (data-e2e, href*="/live", aria-labels).
 * - High-speed CSS :has() suppression combined with lightweight batched DOM verification.
 * - 100% reversible: removing the stylesheet and class restores all LIVE elements instantly.
 * - Strict verification to never touch standard user video posts.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

const LIVE_HIDE_CLASS = 'itz-hidden-live-content';

export class LiveRemovalModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.LIVE_REMOVAL, 'Live Content Removal');
    this.observer = null;
  }

  async onEnable(settings) {
    this.syncPageInterceptor(true);
    this.applyLiveStyles();
    this.scanAndSuppressLiveElements();
    this.setupLiveObserver();
  }

  async onDisable() {
    this.removeCSS();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.syncPageInterceptor(false);
    this.restoreSuppressedElements();
  }

  syncPageInterceptor(active) {
    if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
      window.postMessage({
        source: 'itz-optimizer-content',
        liveRemovalActive: active
      }, '*');
    }
  }

  applyLiveStyles() {
    if (!this.enabled) return;

    // Use CSS :has() for instant, zero-delay suppression before layout paint
    const css = `
      /* 1. Main Navigation LIVE link (Sidebar & Header) and all wrapper containers */
      a[href*="/live"],
      a[data-e2e="nav-live"],
      a[data-e2e*="live"],
      div[data-e2e="live-side-nav"],
      div[data-e2e*="live-side"],
      li:has(a[href*="/live"]),
      li:has([data-e2e="nav-live"]),
      div:has(> a[href*="/live"]),
      div:has(> div > a[href*="/live"]),
      div[role="listitem"]:has(a[href*="/live"]),
      div[role="listitem"]:has([data-e2e="nav-live"]) {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        line-height: 0 !important;
        border: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }

      /* 2. Normalize sidebar navigation layout and eliminate gap from removed LIVE button */
      div[data-e2e="side-nav"],
      aside[class*="SideNav"],
      div[class*="SideNav"],
      div[class*="MainNav"] {
        justify-content: flex-start !important;
      }

      div[data-e2e="side-nav"] ul,
      aside[class*="SideNav"] ul,
      div[class*="SideNav"] ul {
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        row-gap: 4px !important;
      }

      div[data-e2e="side-nav"] li:empty,
      div[data-e2e="side-nav"] div[role="listitem"]:empty,
      aside[class*="SideNav"] li:empty {
        display: none !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* 3. LIVE Cards in Feed via semantic :has() selectors */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/live"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="live-badge"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e="live-card"]),
      div[data-e2e="feed-item"]:has(a[href*="/live"]),
      div[data-e2e="live-card"],
      div[class*="DivLiveContainer"],
      div[class*="LiveCardContainer"],
      .${LIVE_HIDE_CLASS} {
        display: none !important;
        height: 0px !important;
        min-height: 0px !important;
        max-height: 0px !important;
        margin: 0px !important;
        padding: 0px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    this.injectCSS(css);
  }

  /**
   * Scans container for LIVE feed elements using stable semantic signals
   */
  isLiveElement(node) {
    if (!node || node.nodeType !== 1) return false;

    // Direct match
    if (node.getAttribute && node.getAttribute('data-e2e') === 'live-card') {
      return true;
    }

    // Check for LIVE badge or link inside
    const liveLink = node.querySelector && node.querySelector('a[href*="/live"]');
    if (liveLink) return true;

    const liveBadge = node.querySelector && node.querySelector('[data-e2e="live-badge"], span[class*="LiveBadge"]');
    if (liveBadge) return true;

    return false;
  }

  scanAndSuppressLiveElements(root = document) {
    if (!root || !root.querySelectorAll) return;
    const candidates = root.querySelectorAll(
      'div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]'
    );

    for (let i = 0; i < candidates.length; i++) {
      const card = candidates[i];
      if (this.isLiveElement(card)) {
        card.classList.add(LIVE_HIDE_CLASS);
        if (card.style && card.style.setProperty) {
          card.style.setProperty('height', '0px', 'important');
          card.style.setProperty('min-height', '0px', 'important');
          card.style.setProperty('margin', '0px', 'important');
          card.style.setProperty('overflow', 'hidden', 'important');
          card.style.setProperty('display', 'none', 'important');
        }

        // If this LIVE card is currently in viewport in FYP, auto-advance to next video so no black screen appears
        try {
          const rect = card.getBoundingClientRect ? card.getBoundingClientRect() : null;
          if (rect && rect.top >= -50 && rect.top <= (typeof window !== 'undefined' ? window.innerHeight : 800) / 2) {
            const nextCard = card.nextElementSibling;
            if (nextCard && typeof nextCard.scrollIntoView === 'function') {
              nextCard.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          }
        } catch (e) {}
      }
    }
  }

  setupLiveObserver() {
    if (this.observer) return;

    this.observer = createBatchedObserver({
      target: typeof document !== 'undefined' ? (document.body || document.documentElement || document) : null,
      config: { childList: true, subtree: true },
      debounceMs: 80,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          const mut = mutations[i];
          for (let j = 0; j < mut.addedNodes.length; j++) {
            const added = mut.addedNodes[j];
            if (added.nodeType === 1) {
              this.scanAndSuppressLiveElements(added);
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
    if (typeof document === 'undefined') return;
    const elements = document.querySelectorAll(`.${LIVE_HIDE_CLASS}`);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      el.classList.remove(LIVE_HIDE_CLASS);
      if (el.style) {
        el.style.removeProperty('height');
        el.style.removeProperty('min-height');
        el.style.removeProperty('margin');
        el.style.removeProperty('overflow');
        el.style.removeProperty('display');
      }
    }
  }
}
