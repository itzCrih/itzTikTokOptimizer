/**
 * itzTikTok Optimizer - Interface Cleanup Module
 * 
 * Target Content:
 * 1. Top-right header promos: "Get Coins", "Get App", and the vertical divider (leaving ONLY the profile button).
 * 2. Floating "Get TikTok App" and desktop download banner guides.
 * 3. Floating feedback and survey widgets, QR code app install popovers.
 * 
 * Navigation Preservation:
 * - Keeps profile button, feed navigation, and essential interaction tools completely intact.
 * - Reversible CSS overrides and batched DOM verification.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

const PROMO_HIDE_CLASS = 'itz-hidden-header-promo';

export class InterfaceCleanupModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.INTERFACE_CLEANUP, 'Interface Cleanup');
    this.observer = null;
  }

  async onEnable(settings) {
    this.applyCleanupStyles();
    this.cleanHeaderPromos();
    this.setupCleanupObserver();
  }

  async onDisable() {
    this.removeCSS();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.restoreSuppressedElements();
  }

  onNavigate(routeInfo) {
    if (!this.enabled) return;
    this.cleanHeaderPromos();
  }

  applyCleanupStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Header Capsule: Remove "Get Coins", "Get App" and Divider - leave ONLY Profile */
      header a[href*="/coin"],
      header a[href*="/download"],
      div[data-e2e="header-right"] a[href*="/coin"],
      div[data-e2e="header-right"] a[href*="/download"],
      div[data-e2e="header-right"] [data-e2e*="coin"],
      div[data-e2e="header-right"] [data-e2e*="download"],
      div[class*="HeaderRight"] a[href*="/coin"],
      div[class*="HeaderRight"] a[href*="/download"],
      div[class*="HeaderRight"] div:has(> a[href*="/coin"]),
      div[class*="HeaderRight"] div:has(> a[href*="/download"]),
      div[class*="HeaderRight"] span[class*="Divider"],
      div[class*="HeaderRight"] div[class*="Divider"],
      div[class*="HeaderRight"] span[class*="Splitter"],
      div[class*="HeaderRight"] div[class*="Splitter"],
      div[class*="HeaderRight"] span[class*="Line"],
      header span[class*="Divider"],
      header div[class*="Divider"],
      header span[class*="Splitter"],
      .${PROMO_HIDE_CLASS} {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 0 !important;
        min-width: 0 !important;
        border: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }

      /* Cleanly shrink the header capsule background around the profile avatar */
      div[data-e2e="header-right"] div[class*="Capsule"]:not(:has(a[href*="/coin"]):not(:has(a[href*="/download"]))),
      div[class*="HeaderRight"] div[class*="Container"]:has(a[href*="/@"]) {
        background: transparent !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* 2. Desktop App Download Banners & Sticky Floating Guides */
      div[data-e2e="download-guide-container"],
      div[data-e2e="download-app-banner"],
      div[class*="DivDownloadGuide"],
      div[class*="DivAppDownloadBanner"],
      div[class*="DownloadButtonContainer"],
      a[href*="/download-app"],
      a[data-e2e="nav-download"] {
        display: none !important;
      }

      /* 3. Floating Feedback & Survey Widgets */
      div[data-e2e="feedback-bubble"],
      div[class*="DivFeedbackContainer"],
      div[class*="DivSurveyPrompt"],
      button[aria-label*="Feedback" i] {
        display: none !important;
      }

      /* 4. QR Code Download Modals and Flyouts */
      div[data-e2e="qr-code-container"],
      div[class*="DivQrCodeContainer"],
      div[class*="AppQrCodeModal"] {
        display: none !important;
      }

      /* 5. Non-essential promotional banners */
      div[data-e2e="banner-container"],
      div[class*="DivBannerWrapper"] {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }

  /**
   * Scans the header to remove "Get Coins" and "Get App" and any divider, leaving only profile
   */
  cleanHeaderPromos(root = document) {
    if (!root || !root.querySelectorAll) return;

    // Search links and buttons in header or root
    const candidates = root.querySelectorAll('a, button, [role="button"], [role="link"]');
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      const text = (el.textContent || '').trim().toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();

      const isPromo =
        text.includes('get coins') ||
        text.includes('get app') ||
        href.includes('/coin') ||
        href.includes('/download') ||
        (el.getAttribute('data-e2e') && (el.getAttribute('data-e2e').includes('coin') || el.getAttribute('data-e2e').includes('download')));

      if (isPromo) {
        el.classList.add(PROMO_HIDE_CLASS);

        // Also check if wrapped in a dedicated div
        if (el.parentElement && el.parentElement.children.length === 1) {
          el.parentElement.classList.add(PROMO_HIDE_CLASS);
        }

        // Check if there is an adjacent vertical divider line
        const next = el.nextElementSibling;
        if (next && (next.tagName === 'SPAN' || next.tagName === 'DIV' || next.matches('span, div[class*="Divider"], div[class*="Splitter"], div[class*="Line"]'))) {
          const nextText = (next.textContent || '').trim();
          if (!nextText || nextText === '|' || next.offsetWidth <= 2) {
            next.classList.add(PROMO_HIDE_CLASS);
          }
        }
      }
    }
  }

  setupCleanupObserver() {
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
              this.cleanHeaderPromos(added);
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
    const elements = document.querySelectorAll(`.${PROMO_HIDE_CLASS}`);
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove(PROMO_HIDE_CLASS);
    }
  }
}
