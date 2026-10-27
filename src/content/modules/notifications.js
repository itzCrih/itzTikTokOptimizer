/**
 * itzTikTok Optimizer - Notification Optimization Module
 * 
 * Target Bottlenecks:
 * 1. Notification flyouts mounted in the DOM consuming layout/style memory when closed.
 * 2. Continuous badge pulsing keyframe animations causing constant repaints.
 * 3. Inefficient DOM trees in notification history lists.
 * 
 * Strategy:
 * - Content-visibility containment for closed notification dropdowns.
 * - Virtualization on notification list items for stutter-free scrolling.
 * - Stop infinite badge pulsing animations while keeping unread counts accurate.
 * - Clean restoration when user opens the notification panel.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';

export class NotificationsModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.NOTIFICATIONS, 'Notification Optimization');
    this.isPanelOpen = false;
  }

  async onEnable(settings) {
    this.applyNotificationStyles();
    this.setupPanelListeners();
  }

  async onDisable() {
    this.removeCSS();
  }

  setupPanelListeners() {
    // Listen for clicks on the inbox/notification icon to ensure immediate responsiveness
    const handleInboxClick = (e) => {
      const target = e.target.closest(
        'div[data-e2e="inbox-icon"], button[aria-label*="Inbox" i], button[aria-label*="Notification" i]'
      );
      if (target) {
        this.isPanelOpen = !this.isPanelOpen;
        this.applyNotificationStyles();
      }
    };

    this.registerListener(document, 'click', handleInboxClick, { capture: true, passive: true });
  }

  applyNotificationStyles() {
    if (!this.enabled) return;

    let css = `
      /* 1. Notification Items Layout Containment & Virtualization */
      div[data-e2e="inbox-item"],
      div[class*="InboxItem"],
      div[class*="NotificationItem"] {
        content-visibility: auto;
        contain-intrinsic-size: 64px;
        contain: layout style;
      }

      /* 2. Badge keyframe animation suppression */
      /* Keeps the count and red dot visible, but removes the 60fps continuous pulse */
      sup[data-e2e="inbox-badge"],
      div[data-e2e="inbox-icon"] sup,
      span[class*="BadgePulse"],
      div[class*="BadgeWrapper"] span[class*="pulse"] {
        animation: none !important;
        transition: none !important;
      }
    `;

    // If popover deferral is enabled and panel is not actively open
    if (this.options.deferPopoverRender !== false && !this.isPanelOpen) {
      css += `
        /* Defer closed notification popover rendering until opened */
        div[data-e2e="inbox-panel"]:not([data-opened="true"]):not(:hover),
        div[class*="NotificationPopover"]:not([class*="show"]):not([class*="open"]):not(:hover) {
          content-visibility: hidden;
          contain: strict;
        }
      `;
    }

    this.injectCSS(css);
  }
}
