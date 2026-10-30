/**
 * itzTikTok Optimizer - Page-World Request & DOM Interceptor
 * Runs in Manifest V3 MAIN world at document_start.
 * 
 * Capabilities:
 * 1. Synchronously hooks Document.prototype.title and HTMLTitleElement prototype to permanently
 *    strip [99+], (99+), [1] notification counts before render without any millisecond flicker.
 * 2. Neutralizes Web Notifications API so TikTok cannot prompt or push notifications.
 * 3. Intercepts fetch and XMLHttpRequest for all notice and Direct Messaging (IM) endpoints,
 *    returning empty success responses instantly to prevent data loading and eliminate network lag.
 * 4. Permits user-initiated sharing requests so friends appear in the "Share to" popup when sending posts.
 * 5. Intercepts FYP feed responses at the network level to filter out LIVE stream recommendations before render.
 * 6. Silences IM / frontier WebSockets so chat streams and unread event counters never enter the page.
 */

import {
  cleanTitle,
  isDirtyTitle,
  isNoticeUrl,
  isImUrl,
  isShareUrl,
  isFeedRecommendUrl,
  filterOutLiveFeedItems,
  isBlockedTelemetryUrl
} from '../shared/sanitizer.js';

(function initItzPageInterceptor() {
  'use strict';

  // State flags: active by default from the earliest microsecond of page start
  let notificationsBlocked = true;
  let dmsBlocked = true;
  let liveRemovalActive = true;

  // Listen for sync messages from extension content script
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      if (!event || !event.data || event.data.source !== 'itz-optimizer-content') return;
      if (typeof event.data.notificationsBlocked === 'boolean') {
        notificationsBlocked = event.data.notificationsBlocked;
      }
      if (typeof event.data.dmsBlocked === 'boolean') {
        dmsBlocked = event.data.dmsBlocked;
      }
      if (typeof event.data.liveRemovalActive === 'boolean') {
        liveRemovalActive = event.data.liveRemovalActive;
      }
    });
  }

  // --- 1. TITLE SANITIZATION & FLICKER ERADICATION ---
  function enforceCleanTitle() {
    if (typeof document === 'undefined') return;
    if (notificationsBlocked && document.title && isDirtyTitle(document.title)) {
      const sanitized = cleanTitle(document.title);
      if (document.title !== sanitized) {
        document.title = sanitized;
      }
    }
  }

  try {
    // 1A. Patch Document.prototype.title
    const docProto = (typeof Document !== 'undefined' && Document.prototype) || null;
    const titleDesc = docProto
      ? Object.getOwnPropertyDescriptor(docProto, 'title') ||
        (typeof HTMLDocument !== 'undefined' && Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title'))
      : null;

    if (titleDesc && titleDesc.set) {
      const originalSet = titleDesc.set;
      const originalGet = titleDesc.get;

      const titlePropertyDefinition = {
        configurable: true,
        enumerable: true,
        get: function() {
          return originalGet.call(this);
        },
        set: function(val) {
          const finalVal = notificationsBlocked ? cleanTitle(val) : val;
          originalSet.call(this, finalVal);
        }
      };

      try {
        Object.defineProperty(docProto, 'title', titlePropertyDefinition);
      } catch (e) {}

      if (typeof document !== 'undefined') {
        try {
          Object.defineProperty(document, 'title', titlePropertyDefinition);
        } catch (e) {}
      }
    }

    // 1B. Patch HTMLTitleElement.prototype.text
    if (typeof HTMLTitleElement !== 'undefined' && HTMLTitleElement.prototype) {
      const titleElProto = HTMLTitleElement.prototype;
      const textDesc = Object.getOwnPropertyDescriptor(titleElProto, 'text');
      if (textDesc && textDesc.set) {
        const origTextSet = textDesc.set;
        const origTextGet = textDesc.get;
        Object.defineProperty(titleElProto, 'text', {
          configurable: true,
          enumerable: true,
          get: function() {
            return origTextGet.call(this);
          },
          set: function(val) {
            origTextSet.call(this, notificationsBlocked ? cleanTitle(val) : val);
          }
        });
      }
    }

    // 1C. Patch Node.prototype.textContent to sanitize direct <title> updates
    if (typeof Node !== 'undefined' && Node.prototype) {
      const nodeProto = Node.prototype;
      const textContentDesc = Object.getOwnPropertyDescriptor(nodeProto, 'textContent');
      if (textContentDesc && textContentDesc.set) {
        const origTextContentSet = textContentDesc.set;
        const origTextContentGet = textContentDesc.get;
        Object.defineProperty(nodeProto, 'textContent', {
          configurable: true,
          enumerable: true,
          get: function() {
            return origTextContentGet.call(this);
          },
          set: function(val) {
            if (notificationsBlocked && this && this.nodeName === 'TITLE') {
              origTextContentSet.call(this, cleanTitle(val));
            } else {
              origTextContentSet.call(this, val);
            }
          }
        });
      }
    }

    // 1D. Synchronous MutationObserver on document.documentElement
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      const titleObserver = new MutationObserver(() => {
        enforceCleanTitle();
      });

      const root = document.documentElement || document;
      if (root) {
        titleObserver.observe(root, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }

      // Check current title immediately at document_start
      enforceCleanTitle();
    }
  } catch (err) {}

  // --- 2. NOTIFICATION API NEUTRALIZATION ---
  try {
    if (typeof window !== 'undefined' && window.Notification) {
      Object.defineProperty(window.Notification, 'permission', {
        get: function() { return notificationsBlocked ? 'denied' : 'default'; },
        set: function() {},
        configurable: true
      });
      window.Notification.requestPermission = function() {
        return Promise.resolve(notificationsBlocked ? 'denied' : 'default');
      };
    }
    if (typeof window !== 'undefined' && window.ServiceWorkerRegistration && window.ServiceWorkerRegistration.prototype) {
      window.ServiceWorkerRegistration.prototype.showNotification = function() {
        return notificationsBlocked ? Promise.resolve() : Promise.reject();
      };
    }
  } catch (err) {}

  // --- 3. SHARE POPUP STATE TRACKING ---
  // Tracks whether a share dialog is currently open via click detection and DOM checks.
  // Using a state flag avoids expensive full-page DOM scans on every intercepted fetch/XHR.
  let sharePopupActive = false;
  let sharePopupTimer = null;

  function activateShareMode() {
    sharePopupActive = true;
    if (sharePopupTimer) clearTimeout(sharePopupTimer);
    // Allow IM requests for 30 seconds after share interaction
    sharePopupTimer = setTimeout(() => { sharePopupActive = false; }, 30000);
  }

  // Listen for clicks or hover on share-related buttons (capture phase for earliest detection)
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      if (!dmsBlocked) return;
      const t = e.target;
      if (!t || !t.closest) return;
      try {
        const shareBtn = t.closest(
          'button[data-e2e*="share"], [data-e2e*="share-btn"], [data-e2e="video-share"],' +
          ' [aria-label*="Share" i], [aria-label*="condividi" i], button[class*="Share"], div[data-e2e="share-icon"],' +
          ' span[data-e2e*="share"], [data-e2e="arrow-right"], div[data-e2e="feed-action-item"]'
        );
        if (shareBtn) activateShareMode();
      } catch (_) {}
    }, true);

    document.addEventListener('mouseover', (e) => {
      if (!dmsBlocked) return;
      const t = e.target;
      if (!t || !t.closest) return;
      try {
        const shareBtn = t.closest(
          'button[data-e2e*="share"], [data-e2e*="share-btn"], [data-e2e="video-share"],' +
          ' [aria-label*="Share" i], [aria-label*="condividi" i], div[data-e2e="share-icon"],' +
          ' span[data-e2e*="share"]'
        );
        if (shareBtn) activateShareMode();
      } catch (_) {}
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sharePopupActive) {
        sharePopupActive = false;
        if (sharePopupTimer) clearTimeout(sharePopupTimer);
      }
    }, true);
  }

  function isSharePopupOpen() {
    // Fast path: check cached state from click detection
    if (sharePopupActive) return true;

    if (typeof document === 'undefined') return false;
    try {
      // Targeted selector-only check (no expensive text scanning)
      return !!document.querySelector(
        'div[data-e2e*="share-panel"], div[data-e2e="send-to"], div[data-e2e*="share-modal"],' +
        ' div[class*="ShareModal"], div[class*="DivShareWrapper"],' +
        ' div[class*="ShareContainer"], div[class*="SendToPanel"],' +
        ' div[role="dialog"][class*="Share"], div[class*="ShareBottomSheet"],' +
        ' div[class*="ShareWrapper"], div[class*="ShareActionContainer"]'
      );
    } catch (_) {}
    return false;
  }

  // --- 4. FETCH INTERCEPTION FOR NOTICES, DMS, SHARE, TELEMETRY & LIVE REMOVAL ---
  try {
    if (typeof window !== 'undefined' && window.fetch) {
      const origFetch = window.fetch;
      window.fetch = function(...args) {
        const rawUrl = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');

        // A. Blocked / CSP-violating third-party telemetry monitors (e.g. CapCut PNS runtime)
        // Resolving immediately with mock 200 prevents browser CSP errors and fetch rejections
        if (isBlockedTelemetryUrl(rawUrl)) {
          return Promise.resolve(new Response(JSON.stringify({ status_code: 0, message: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // B. Notices & Notification Streams
        if (notificationsBlocked && isNoticeUrl(rawUrl)) {
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

        // C. Direct Messaging (IM) - with Share Popup Exemption
        if (dmsBlocked && isImUrl(rawUrl)) {
          // If the user is currently sharing a post to friends, allow the share contact query / send request
          if (isShareUrl(rawUrl) || isSharePopupOpen()) {
            return origFetch.apply(this, args);
          }

          // Otherwise, block incoming background chat syncing and DM conversations
          return Promise.resolve(new Response(JSON.stringify({
            status_code: 0,
            status_msg: '',
            data: [],
            messages: [],
            conversations: [],
            user_list: [],
            has_more: false,
            next_cursor: 0
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // D. FYP Feed Recommendations: Filter out recommended LIVE streams
        if (liveRemovalActive && isFeedRecommendUrl(rawUrl)) {
          try {
            return origFetch.apply(this, args).then((response) => {
              try {
                return response.clone().json().then((json) => {
                  if (json && Array.isArray(json.itemList)) {
                    json.itemList = filterOutLiveFeedItems(json.itemList);
                    return new Response(JSON.stringify(json), {
                      status: response.status,
                      statusText: response.statusText,
                      headers: response.headers
                    });
                  }
                  return response;
                }).catch(() => response);
              } catch (_) {
                return response;
              }
            });
          } catch (_) {
            return origFetch.apply(this, args);
          }
        }

        return origFetch.apply(this, args);
      };
    }
  } catch (err) {}

  // --- 5. XMLHTTPREQUEST INTERCEPTION ---
  try {
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype) {
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._itzInterceptUrl = typeof url === 'string' ? url : '';
        return origOpen.call(this, method, url, ...rest);
      };

      XMLHttpRequest.prototype.send = function(...args) {
        const u = this._itzInterceptUrl;

        // Telemetry interception (e.g. CapCut PNS monitor)
        if (isBlockedTelemetryUrl(u)) {
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(this, 'status', { value: 200, configurable: true });
          const dummy = JSON.stringify({ status_code: 0, message: 'ok' });
          Object.defineProperty(this, 'responseText', { value: dummy, configurable: true });
          Object.defineProperty(this, 'response', { value: dummy, configurable: true });
          setTimeout(() => {
            if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
            if (typeof this.onload === 'function') this.onload();
          }, 0);
          return;
        }

        const blockNotice = notificationsBlocked && isNoticeUrl(u);
        const isIm = dmsBlocked && isImUrl(u);
        const allowForShare = isIm && (isShareUrl(u) || isSharePopupOpen());

        if (blockNotice || (isIm && !allowForShare)) {
          Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
          Object.defineProperty(this, 'status', { value: 200, configurable: true });
          const emptyBody = JSON.stringify({
            status_code: 0,
            status_msg: '',
            notice_count: 0,
            data: [],
            messages: [],
            conversations: [],
            data_count: 0,
            has_more: false
          });
          Object.defineProperty(this, 'responseText', { value: emptyBody, configurable: true });
          Object.defineProperty(this, 'response', { value: emptyBody, configurable: true });
          setTimeout(() => {
            if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
            if (typeof this.onload === 'function') this.onload();
          }, 0);
          return;
        }

        // Filter LIVE items on XMLHttpRequest feed recommendations if applicable
        if (liveRemovalActive && isFeedRecommendUrl(u)) {
          const originalOnLoad = this.onload;
          this.onload = function(...evArgs) {
            try {
              if (this.responseText) {
                const data = JSON.parse(this.responseText);
                if (data && Array.isArray(data.itemList)) {
                  data.itemList = filterOutLiveFeedItems(data.itemList);
                  const cleanedText = JSON.stringify(data);
                  Object.defineProperty(this, 'responseText', { value: cleanedText, configurable: true });
                  Object.defineProperty(this, 'response', { value: cleanedText, configurable: true });
                }
              }
            } catch (e) {}
            if (typeof originalOnLoad === 'function') {
              originalOnLoad.apply(this, evArgs);
            }
          };
        }

        return origSend.apply(this, args);
      };
    }
  } catch (err) {}

  // --- 6. WEBSOCKET INTERCEPTION ---
  try {
    if (typeof window !== 'undefined' && window.WebSocket) {
      const OriginalWS = window.WebSocket;

      const MockWebSocket = function(url, protocols) {
        const lowerUrl = (typeof url === 'string' ? url : '').toLowerCase();
        const isImSocket = dmsBlocked && (lowerUrl.includes('im') || lowerUrl.includes('frontier') || lowerUrl.includes('message-ws'));

        if (isImSocket) {
          const mock = Object.create(OriginalWS.prototype);
          Object.defineProperties(mock, {
            readyState: { value: 3, writable: true }, // CLOSED
            url: { value: url, writable: false },
            bufferedAmount: { value: 0, writable: false },
            protocol: { value: '', writable: false },
            extensions: { value: '', writable: false },
            binaryType: { value: 'blob', writable: true },
            send: { value: function() {}, writable: true },
            close: { value: function() {}, writable: true },
            addEventListener: { value: function() {}, writable: true },
            removeEventListener: { value: function() {}, writable: true },
            dispatchEvent: { value: function() { return false; }, writable: true },
            onopen: { value: null, writable: true },
            onmessage: { value: null, writable: true },
            onerror: { value: null, writable: true },
            onclose: { value: null, writable: true }
          });
          return mock;
        }

        if (typeof protocols !== 'undefined') {
          return new OriginalWS(url, protocols);
        }
        return new OriginalWS(url);
      };

      MockWebSocket.prototype = OriginalWS.prototype;
      MockWebSocket.CONNECTING = 0;
      MockWebSocket.OPEN = 1;
      MockWebSocket.CLOSING = 2;
      MockWebSocket.CLOSED = 3;

      window.WebSocket = MockWebSocket;
    }
  } catch (err) {}

  // --- 7. BEACON INTERCEPTION FOR CSP-VIOLATING TELEMETRY ---
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const origSendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function(url, data) {
        if (isBlockedTelemetryUrl(url)) {
          return true;
        }
        return origSendBeacon.call(this, url, data);
      };
    }
  } catch (err) {}

  // --- 8. UNHANDLED REJECTION SAFEGUARD FOR TELEMETRY ---
  try {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = event && event.reason;
          const message = String((reason && reason.message) || reason || '');
          const stack = String((reason && reason.stack) || '');
          if (
            message.includes('capcutapi.com') ||
            stack.includes('capcutapi.com') ||
            message.includes('capcut_pns') ||
            stack.includes('capcut_pns') ||
            (message.includes('Failed to fetch') && (stack.includes('capcut') || stack.includes('monitor_browser')))
          ) {
            event.preventDefault();
          }
        } catch (_) {}
      });
    }
  } catch (err) {}
})();
