/**
 * itzTikTok Optimizer - Notification & Toast Eradication Module
 * 
 * Complete Notification Elimination:
 * 1. Permanently disables Web Notifications API (Notification.requestPermission = denied).
 * 2. Intercepts notice polling streams (/api/notice/) so TikTok Web never receives notification data.
 * 3. Sanitizes document.title to permanently eliminate [99+] tab flashing.
 * 4. Completely destroys all floating toast popups from the bottom-right corner.
 * 5. Removes all red notification badges (99+, unread dots, counts) across sidebar and header.
 * 6. Hides the Activity navigation button from the sidebar.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';
import { cleanTitle, isDirtyTitle } from '../../shared/sanitizer.js';

const TOAST_HIDE_CLASS = 'itz-hidden-notification-toast';
const BADGE_HIDE_CLASS = 'itz-hidden-badge';

export class NotificationsModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.NOTIFICATIONS, 'Notification Optimization');
    this.observer = null;
  }

  async onEnable(settings) {
    this.syncPageInterceptor(true);
    this.applyNotificationStyles();
    this.eradicateNotificationToasts();
    this.eradicateBadges();
    this.sanitizeDocumentTitle();
    this.setupNotificationObserver();
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

  syncPageInterceptor(blocked) {
    if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
      window.postMessage({
        source: 'itz-optimizer-content',
        notificationsBlocked: blocked
      }, '*');
    }
  }

  sanitizeDocumentTitle() {
    if (typeof document === 'undefined' || !document.title) return;
    if (isDirtyTitle(document.title)) {
      const cleaned = cleanTitle(document.title);
      if (document.title !== cleaned) {
        document.title = cleaned;
      }
    }
  }

  applyNotificationStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Complete eradication of all floating notification toast cards and container lines */
      div[class*="Toast"],
      div[class*="toast"],
      div[class*="NoticeToast"],
      div[class*="PushNotice"],
      div[class*="PushNotification"],
      div[class*="NotificationToast"],
      div[class*="DivToastWrapper"],
      div[class*="FloatingNotice"],
      div[data-e2e*="toast"],
      div[data-e2e*="push-notification"],
      div[data-e2e*="notice-popup"],
      div[data-e2e*="floating-notice"],
      div[role="alert"],
      div[style*="fixed"][style*="bottom"][style*="right"],
      div[style*="fixed"][style*="right"][style*="bottom"],
      .${TOAST_HIDE_CLASS} {
        all: unset !important;
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        overflow: hidden !important;
      }

      /* 2. Hide Activity button from left sidebar navigation */
      a[href*="/activity"],
      li:has(a[href*="/activity"]),
      div:has(> a[href*="/activity"]),
      div[data-e2e*="activity"],
      span[data-e2e*="activity"] {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      /* 3. Complete eradication of all red notification badges (99+, red dots, counters) */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      div[data-e2e="inbox-badge"],
      div[data-e2e="messages-badge"],
      a[href*="/messages"] sup,
      a[href*="/activity"] sup,
      header sup,
      nav sup,
      div[data-e2e="side-nav"] sup,
      span[class*="RedDot"],
      div[class*="RedDot"],
      span[class*="pulse"],
      .${BADGE_HIDE_CLASS} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }

      /* SAFEGUARD: Strictly preserve sidebar icons, photo carousel swap buttons, pagination dots & counters */
      div[data-e2e="side-nav"] svg,
      nav svg,
      header svg,
      div[data-e2e="side-nav"] a svg,
      button[aria-label*="Previous" i],
      button[aria-label*="Next" i],
      div[class*="ArrowButton"],
      div[class*="ButtonArrow"],
      div[class*="SlideControl"],
      div[class*="PhotoCounter"],
      div[class*="Pagination"],
      span[class*="PhotoCounter"] {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }

      /* 4. Notification flyout panel dormant containment when closed */
      div[data-e2e="inbox-panel"]:not([data-opened="true"]),
      div[class*="NotificationPopover"]:not([class*="show"]) {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }

  /**
   * Scans document for floating notification toasts and destroys them directly
   */
  eradicateNotificationToasts(root = document) {
    if (!root || !root.querySelectorAll) return;

    // Search for any elements matching notification toast text or structure
    const candidates = root.querySelectorAll(
      '[role="alert"], div[class*="toast" i], div[class*="Toast"], div[class*="Notice"], div[class*="Notification"], div[data-e2e*="toast"], div[data-e2e*="notice"], div[style*="fixed"]'
    );
    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      const text = (el.textContent || '').toLowerCase();

      const isToastText =
        text.includes('reposted the same video') ||
        text.includes('reposted your video') ||
        text.includes('liked a video you reposted') ||
        text.includes('liked your video') ||
        text.includes('commented on your') ||
        text.includes('started following you');

      if (isToastText) {
        const toastCard = el.closest('[role="alert"], div[class*="Toast"], div[class*="toast"], div[style*="fixed"]') || el;
        // Destroy the node directly so no lingering lines or close buttons remain
        if (typeof toastCard.remove === 'function') {
          toastCard.remove();
        } else {
          toastCard.classList.add(TOAST_HIDE_CLASS);
          if (toastCard.style && toastCard.style.setProperty) {
            toastCard.style.setProperty('display', 'none', 'important');
          }
        }
      }
    }
  }

  /**
   * Scans sidebar and header for notification badges and hides them
   */
  eradicateBadges(root = document) {
    if (!root || !root.querySelectorAll) return;

    // Target semantic notification badges strictly (never touch icons or feed elements)
    const badges = root.querySelectorAll(
      'header sup, nav sup, div[data-e2e="side-nav"] sup, a[href*="/messages"] sup, a[href*="/activity"] sup, [data-e2e="inbox-badge"], [data-e2e="messages-badge"], span[class*="RedDot"], div[class*="RedDot"]'
    );
    for (let i = 0; i < badges.length; i++) {
      const el = badges[i];
      // Never hide elements that contain an SVG icon or image
      if (el.querySelector && el.querySelector('svg, img')) continue;
      el.classList.add(BADGE_HIDE_CLASS);
      if (el.style && el.style.setProperty) {
        el.style.setProperty('display', 'none', 'important');
      }
    }

    // Also look for unread count text nodes ("99+", etc.) strictly inside sidebar, header, or message buttons
    const allBadges = root.querySelectorAll(
      'a[href*="/messages"] span, a[href*="/activity"] span, div[data-e2e="side-nav"] sup, header sup'
    );
    for (let i = 0; i < allBadges.length; i++) {
      const el = allBadges[i];
      if (el.querySelector && el.querySelector('svg, img')) continue;
      const t = (el.textContent || '').trim();
      if (t === '99+' || t === '99' || (/^\d+$/.test(t) && el.children.length === 0)) {
        el.classList.add(BADGE_HIDE_CLASS);
        if (el.style && el.style.setProperty) {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  setupNotificationObserver() {
    if (this.observer) return;

    this.observer = createBatchedObserver({
      target: typeof document !== 'undefined' ? (document.body || document.documentElement || document) : null,
      config: { childList: true, subtree: true },
      debounceMs: 50,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
        this.sanitizeDocumentTitle();
        for (let i = 0; i < mutations.length; i++) {
          const mut = mutations[i];
          for (let j = 0; j < mut.addedNodes.length; j++) {
            const added = mut.addedNodes[j];
            if (added.nodeType === 1) {
              this.eradicateNotificationToasts(added);
              this.eradicateBadges(added);
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

    const toasts = document.querySelectorAll(`.${TOAST_HIDE_CLASS}`);
    for (let i = 0; i < toasts.length; i++) {
      toasts[i].classList.remove(TOAST_HIDE_CLASS);
      toasts[i].style.removeProperty('display');
    }

    const badges = document.querySelectorAll(`.${BADGE_HIDE_CLASS}`);
    for (let i = 0; i < badges.length; i++) {
      badges[i].classList.remove(BADGE_HIDE_CLASS);
      badges[i].style.removeProperty('display');
    }
  }
}
