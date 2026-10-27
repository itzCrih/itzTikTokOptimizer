/**
 * itzTikTok Optimizer - Notification Eradication Module
 * 
 * Complete Notification Suppression:
 * 1. Permanently neuters browser-level Web Notifications API (Notification.requestPermission = denied).
 * 2. Neutralizes notice polling endpoints (/api/notice/count, /notice/multi) so TikTok never receives notification events.
 * 3. Completely wipes out all floating toast popups from the bottom-right corner.
 * 4. Eradicates all red notification badges (99+, unread dots, counts) from sidebar and header.
 * 5. Prevents UI lag, layout thrashing, and audio pings caused by incoming notification streams.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

const TOAST_HIDE_CLASS = 'itz-hidden-notification-toast';
const BADGE_HIDE_CLASS = 'itz-hidden-badge';
const INTERCEPT_SCRIPT_ID = 'itz-intercept-notifications';

export class NotificationsModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.NOTIFICATIONS, 'Notification Optimization');
    this.observer = null;
  }

  async onEnable(settings) {
    this.injectPageNotificationInterceptor();
    this.applyNotificationStyles();
    this.eradicateNotificationToasts();
    this.eradicateBadges();
    this.setupNotificationObserver();
  }

  async onDisable() {
    this.removeCSS();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.removePageNotificationInterceptor();
    this.restoreSuppressedElements();
  }

  /**
   * Injects script into page context to intercept Web Notifications API and notice polling
   */
  injectPageNotificationInterceptor() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(INTERCEPT_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = INTERCEPT_SCRIPT_ID;
    script.setAttribute('data-itz-source', 'itzTikTokOptimizer');
    script.textContent = `
      (function() {
        // 1. Neuter Web Notifications API
        try {
          if (window.Notification) {
            Object.defineProperty(window.Notification, 'permission', {
              get: function() { return 'denied'; },
              set: function() {},
              configurable: true
            });
            window.Notification.requestPermission = function() {
              return Promise.resolve('denied');
            };
          }
          if (window.ServiceWorkerRegistration && window.ServiceWorkerRegistration.prototype) {
            window.ServiceWorkerRegistration.prototype.showNotification = function() {
              return Promise.resolve();
            };
          }
        } catch (e) {}

        // 2. Intercept fetch notice polling
        try {
          const originalFetch = window.fetch;
          if (originalFetch) {
            window.fetch = function(...args) {
              const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
              if (url && (
                url.includes('/api/notice/') ||
                url.includes('/api/v1/notice/') ||
                url.includes('/notice/multi/') ||
                url.includes('/notice/count/') ||
                url.includes('/passport/web/account/notice/')
              )) {
                return Promise.resolve(new Response(JSON.stringify({
                  status_code: 0,
                  status_msg: '',
                  notice_count: 0,
                  data: [],
                  data_count: 0,
                  has_more: false,
                  user_list: [],
                  total: 0
                }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                }));
              }
              return originalFetch.apply(this, args);
            };
          }
        } catch (e) {}

        // 3. Intercept XMLHttpRequest notice polling
        try {
          const originalOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._itzUrl = typeof url === 'string' ? url : '';
            return originalOpen.call(this, method, url, ...rest);
          };

          const originalSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._itzUrl && (
              this._itzUrl.includes('/api/notice/') ||
              this._itzUrl.includes('/notice/multi/') ||
              this._itzUrl.includes('/notice/count/')
            )) {
              Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
              Object.defineProperty(this, 'status', { value: 200, configurable: true });
              Object.defineProperty(this, 'responseText', {
                value: JSON.stringify({ status_code: 0, notice_count: 0, data: [], data_count: 0 }),
                configurable: true
              });
              Object.defineProperty(this, 'response', {
                value: JSON.stringify({ status_code: 0, notice_count: 0, data: [], data_count: 0 }),
                configurable: true
              });
              setTimeout(() => {
                if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
                if (typeof this.onload === 'function') this.onload();
              }, 0);
              return;
            }
            return originalSend.apply(this, args);
          };
        } catch (e) {}
      })();
    `;

    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(script);
    }
  }

  removePageNotificationInterceptor() {
    if (typeof document === 'undefined') return;
    const script = document.getElementById(INTERCEPT_SCRIPT_ID);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  applyNotificationStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Complete eradication of all floating notification toast cards (bottom-right popups) */
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
      div[role="alert"]:has(img),
      div[role="alert"]:has(button),
      div[style*="fixed"][style*="bottom"][style*="right"],
      div[style*="fixed"][style*="right"][style*="bottom"],
      .${TOAST_HIDE_CLASS} {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      /* 2. Complete eradication of all red notification badges (99+, dots, counters) */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      div[data-e2e="inbox-badge"],
      div[data-e2e="messages-badge"],
      span[data-e2e*="badge"],
      div[data-e2e*="badge"],
      sup,
      span[class*="Badge"],
      div[class*="Badge"],
      span[class*="badge"],
      div[class*="badge"],
      span[class*="Dot"],
      div[class*="Dot"],
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

      /* 3. Notification flyout panel dormant containment when closed */
      div[data-e2e="inbox-panel"]:not([data-opened="true"]),
      div[class*="NotificationPopover"]:not([class*="show"]) {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }

  /**
   * Scans document for floating notification toasts and destroys them
   */
  eradicateNotificationToasts(root = document) {
    if (!root || !root.querySelectorAll) return;

    // Search for any elements matching notification toast text or structure
    const candidates = root.querySelectorAll('div, [role="alert"], [class*="toast"], [class*="Toast"]');
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
        // Find top-level floating card container
        const toastCard = el.closest('[role="alert"], div[class*="Toast"], div[class*="toast"], div[style*="fixed"]') || el;
        toastCard.classList.add(TOAST_HIDE_CLASS);
        if (toastCard.style && toastCard.style.setProperty) {
          toastCard.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  /**
   * Scans sidebar and header for notification badges and hides them
   */
  eradicateBadges(root = document) {
    if (!root || !root.querySelectorAll) return;

    const badges = root.querySelectorAll('sup, span[class*="Badge"], span[class*="badge"], div[class*="Badge"], div[class*="badge"]');
    for (let i = 0; i < badges.length; i++) {
      badges[i].classList.add(BADGE_HIDE_CLASS);
      if (badges[i].style && badges[i].style.setProperty) {
        badges[i].style.setProperty('display', 'none', 'important');
      }
    }

    // Also look for elements with text "99+"
    const allBadges = root.querySelectorAll('span, div, sup');
    for (let i = 0; i < allBadges.length; i++) {
      const el = allBadges[i];
      const t = (el.textContent || '').trim();
      if (t === '99+' || t === '99' || (/^\d+$/.test(t) && el.children.length === 0)) {
        if (el.closest('a[href*="/messages"], div[data-e2e="side-nav"], header, nav')) {
          el.classList.add(BADGE_HIDE_CLASS);
          if (el.style && el.style.setProperty) {
            el.style.setProperty('display', 'none', 'important');
          }
        }
      }
    }
  }

  setupNotificationObserver() {
    if (this.observer) return;

    this.observer = createBatchedObserver({
      target: document.body,
      config: { childList: true, subtree: true },
      debounceMs: 50,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
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
