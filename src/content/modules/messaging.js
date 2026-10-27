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

export class MessagingModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.MESSAGING, 'Messaging Optimization');
  }

  async onEnable(settings) {
    if (this.isMessagesRoute()) {
      window.location.replace('/');
      return;
    }

    this.syncPageInterceptor(true);
    this.applyMessagingStyles();
  }

  async onDisable() {
    this.removeCSS();
    this.syncPageInterceptor(false);
  }

  syncPageInterceptor(blocked) {
    if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
      window.postMessage({
        source: 'itz-optimizer-content',
        dmsBlocked: blocked
      }, '*');
    }
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
