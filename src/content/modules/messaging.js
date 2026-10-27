/**
 * itzTikTok Optimizer - Direct Message & Group Chat Optimization Module
 * 
 * Target Bottlenecks:
 * 1. Heavy DOM trees created by large conversation lists and active group chats.
 * 2. Continuous layout recalculations and forced reflows during chat scrolling.
 * 3. Eager background rendering of messaging components when user is not viewing messages.
 * 
 * Strategy:
 * - Apply browser-native CSS virtualization (content-visibility: auto) to conversation items.
 * - Enforce layout containment on conversation lists and chat message bubbles.
 * - Dormancy: Keep messaging DOM structures dormant when user is on feed/profile pages.
 * - Zero network blocking: Preserves unread counters, authentication, and normal message sending.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS, ROUTES } from '../../shared/constants.js';
import { markElementOptimized, isElementOptimized, createBatchedObserver } from '../dom-utils.js';

export class MessagingModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.MESSAGING, 'Messaging Optimization');
    this.isChatRoute = false;
    this.listObserver = null;
  }

  async onEnable(settings) {
    this.applyMessagingStyles();
    this.updateRouteState(window.location.pathname.startsWith('/messages'));
  }

  async onDisable() {
    this.removeCSS();
    if (this.listObserver) {
      this.listObserver.disconnect();
      this.listObserver = null;
    }
  }

  onNavigate(routeInfo) {
    if (!this.enabled) return;
    const isNowChat = routeInfo.route === ROUTES.MESSAGES || routeInfo.pathname.startsWith('/messages');
    this.updateRouteState(isNowChat);
  }

  updateRouteState(isChatRoute) {
    this.isChatRoute = isChatRoute;
    this.applyMessagingStyles();

    if (isChatRoute) {
      this.attachScopedChatObserver();
    } else {
      if (this.listObserver) {
        this.listObserver.disconnect();
        this.listObserver = null;
      }
    }
  }

  applyMessagingStyles() {
    if (!this.enabled) return;

    // CSS optimizations targeted at TikTok's messaging architecture:
    // 1. Virtualization of conversation list items
    // 2. Layout containment on chat message threads
    // 3. Dormancy containment when off-route
    let css = `
      /* 1. Conversation List Item Virtualization */
      /* Blazing-fast scrolling for 100+ conversations & large group chats */
      div[data-e2e="chat-item"],
      div[class*="ConversationItem"],
      div[class*="ChatListItem"],
      div[class*="chat-item"] {
        content-visibility: auto;
        contain-intrinsic-size: 72px;
        contain: layout style;
      }

      /* 2. Message Bubbles layout containment */
      div[data-e2e="message-item"],
      div[class*="MessageItem"],
      div[class*="ChatMessage"] {
        contain: layout style;
      }

      /* 3. Conversation avatar and status badge containment */
      div[data-e2e="chat-avatar"],
      div[class*="AvatarContainer"] {
        contain: paint layout;
      }
    `;

    // When the user is NOT on /messages, keep any background messaging popovers/drawers dormant
    if (!this.isChatRoute && this.options.deferInboxInit !== false) {
      css += `
        /* Background messaging drawer dormancy */
        div[data-e2e="message-panel"]:not([data-active="true"]),
        div[class*="MessagePanel"]:not([class*="active"]),
        div[class*="ChatDrawerContainer"]:not([class*="open"]) {
          content-visibility: hidden;
          contain: strict;
        }
      `;
    }

    this.injectCSS(css);
  }

  attachScopedChatObserver() {
    if (this.listObserver) return;

    // Look for chat list container
    const chatContainer = document.querySelector(
      'div[data-e2e="chat-list"], div[class*="ChatList"], div[class*="ConversationList"]'
    );

    if (chatContainer) {
      this.listObserver = createBatchedObserver({
        target: chatContainer,
        config: { childList: true, subtree: false },
        debounceMs: 100,
        onBatch: (mutations) => {
          // Verify items are tagged to avoid reflow thrashing
          const items = chatContainer.querySelectorAll('div[data-e2e="chat-item"]');
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!isElementOptimized(item, 'msg-opt')) {
              markElementOptimized(item, 'msg-opt');
            }
          }
        }
      });
      if (this.listObserver) {
        this.registerObserver(this.listObserver);
      }
    } else {
      // If container not yet mounted, wait for it gently without aggressive polling
      const bodyObserver = createBatchedObserver({
        target: document.body,
        config: { childList: true, subtree: true },
        debounceMs: 200,
        filter: (mut) => mut.addedNodes.length > 0,
        onBatch: () => {
          if (!this.isChatRoute || this.listObserver) return;
          const found = document.querySelector('div[data-e2e="chat-list"], div[class*="ChatList"]');
          if (found) {
            bodyObserver.disconnect();
            this.attachScopedChatObserver();
          }
        }
      });
      if (bodyObserver) {
        this.registerObserver(bodyObserver);
      }
    }
  }
}
