/**
 * itzTikTok Optimizer - Direct Message Eradication Module
 * 
 * Complete Direct Message Suppression:
 * 1. Blocks all TikTok Direct Messaging / IM API requests at the network level.
 * 2. Silences IM WebSockets so chat streams and group chat updates never reach the browser.
 * 3. Hides the "Messages" navigation button from the sidebar.
 * 4. Completely suppresses message panels, conversation drawers, and chat lists.
 * 5. Prevents navigation to /messages (redirects to clean feed).
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS, ROUTES } from '../../shared/constants.js';

const IM_INTERCEPT_SCRIPT_ID = 'itz-intercept-messaging';

export class MessagingModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.MESSAGING, 'Messaging Optimization');
  }

  async onEnable(settings) {
    if (this.isMessagesRoute()) {
      window.location.replace('/');
      return;
    }

    this.injectPageMessagingInterceptor();
    this.applyMessagingStyles();
  }

  async onDisable() {
    this.removeCSS();
    this.removePageMessagingInterceptor();
  }

  onNavigate(routeInfo) {
    if (!this.enabled) return;
    if (routeInfo.pathname && routeInfo.pathname.startsWith('/messages')) {
      window.location.replace('/');
    }
  }

  isMessagesRoute() {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/messages');
  }

  injectPageMessagingInterceptor() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(IM_INTERCEPT_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = IM_INTERCEPT_SCRIPT_ID;
    script.setAttribute('data-itz-source', 'itzTikTokOptimizer');
    script.textContent = `
      (function() {
        // 1. Intercept fetch for all Direct Messaging / IM / Chat endpoints
        try {
          var origFetch = window.fetch;
          if (origFetch) {
            window.fetch = function(...args) {
              var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
              var lowerUrl = (url || '').toLowerCase();

              if (
                lowerUrl.includes('/web/im/') ||
                lowerUrl.includes('/api/v1/web/im/') ||
                lowerUrl.includes('/v1/im/') ||
                lowerUrl.includes('/api/im/') ||
                lowerUrl.includes('/im/message/') ||
                lowerUrl.includes('/im/conversation/') ||
                lowerUrl.includes('/im/chat/') ||
                lowerUrl.includes('/im/batch/') ||
                lowerUrl.includes('/im/user/') ||
                lowerUrl.includes('/im/sync/') ||
                lowerUrl.includes('/message/list/') ||
                lowerUrl.includes('/chat/list/')
              ) {
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
              return origFetch.apply(this, args);
            };
          }
        } catch (e) {}

        // 2. Intercept XMLHttpRequest for Direct Messaging / IM
        try {
          var origOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._itzImUrl = (typeof url === 'string' ? url : '').toLowerCase();
            return origOpen.call(this, method, url, ...rest);
          };

          var origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.send = function(...args) {
            if (this._itzImUrl && (
              this._itzImUrl.includes('/web/im/') ||
              this._itzImUrl.includes('/v1/im/') ||
              this._itzImUrl.includes('/api/im/') ||
              this._itzImUrl.includes('/im/message/') ||
              this._itzImUrl.includes('/im/conversation/')
            )) {
              Object.defineProperty(this, 'readyState', { value: 4, configurable: true });
              Object.defineProperty(this, 'status', { value: 200, configurable: true });
              var emptyData = JSON.stringify({
                status_code: 0,
                data: [],
                messages: [],
                conversations: []
              });
              Object.defineProperty(this, 'responseText', { value: emptyData, configurable: true });
              Object.defineProperty(this, 'response', { value: emptyData, configurable: true });
              setTimeout(() => {
                if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
                if (typeof this.onload === 'function') this.onload();
              }, 0);
              return;
            }
            return origSend.apply(this, args);
          };
        } catch (e) {}

        // 3. Neuter WebSockets connecting to IM gateways
        try {
          var OriginalWS = window.WebSocket;
          if (OriginalWS) {
            window.WebSocket = function(url, protocols) {
              var lowerUrl = (typeof url === 'string' ? url : '').toLowerCase();
              if (lowerUrl.includes('im') || lowerUrl.includes('frontier')) {
                var mockSocket = {
                  url: url,
                  readyState: 3, // CLOSED
                  bufferedAmount: 0,
                  send: function() {},
                  close: function() {},
                  addEventListener: function() {},
                  removeEventListener: function() {},
                  dispatchEvent: function() { return false; },
                  onopen: null,
                  onmessage: null,
                  onerror: null,
                  onclose: null
                };
                return mockSocket;
              }
              return new OriginalWS(url, protocols);
            };
            window.WebSocket.prototype = OriginalWS.prototype;
            window.WebSocket.CONNECTING = 0;
            window.WebSocket.OPEN = 1;
            window.WebSocket.CLOSING = 2;
            window.WebSocket.CLOSED = 3;
          }
        } catch (e) {}
      })();
    `;

    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(script);
    }
  }

  removePageMessagingInterceptor() {
    if (typeof document === 'undefined') return;
    const script = document.getElementById(IM_INTERCEPT_SCRIPT_ID);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }
  }

  applyMessagingStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Hide Messages button from left sidebar navigation */
      a[href*="/messages"],
      li:has(a[href*="/messages"]),
      div:has(> a[href*="/messages"]),
      div:has(> div > a[href*="/messages"]),
      div[data-e2e*="messages"] {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      /* 2. Completely destroy all messaging panels, chat lists, and message drawers */
      div[data-e2e="message-panel"],
      div[data-e2e="chat-list"],
      div[data-e2e="message-list"],
      div[class*="MessagePanel"],
      div[class*="ChatList"],
      div[class*="ConversationList"],
      div[class*="ChatDrawer"],
      div[class*="DivConversationList"] {
        display: none !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }
    `;

    this.injectCSS(css);
  }
}
