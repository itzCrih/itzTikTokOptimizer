/**
 * itzTikTok Optimizer - Interface Cleanup Module
 * 
 * Target Bottlenecks:
 * 1. Intrusive "Get TikTok App" and "Download Desktop App" banners.
 * 2. Floating feedback / survey modals and QR code download popovers.
 * 3. Promotional banners taking up viewport and GPU compositing memory.
 * 
 * Navigation Preservation:
 * - Keeps Home, Following, Explore, Friends, Messages, Inbox, and Profile completely untouched.
 * - Reversible CSS-based cleanup with zero JavaScript mutation overhead.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';

export class InterfaceCleanupModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.INTERFACE_CLEANUP, 'Interface Cleanup');
  }

  async onEnable(settings) {
    this.applyCleanupStyles();
  }

  async onDisable() {
    this.removeCSS();
  }

  applyCleanupStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. "Get App" / Desktop Download Banners & Sticky Bars */
      div[data-e2e="download-guide-container"],
      div[data-e2e="download-app-banner"],
      div[class*="DivDownloadGuide"],
      div[class*="DivAppDownloadBanner"],
      div[class*="DownloadButtonContainer"],
      a[href*="/download-app"],
      a[data-e2e="nav-download"] {
        display: none !important;
      }

      /* 2. Floating Feedback & Survey Widgets */
      div[data-e2e="feedback-bubble"],
      div[class*="DivFeedbackContainer"],
      div[class*="DivSurveyPrompt"],
      button[aria-label*="Feedback" i] {
        display: none !important;
      }

      /* 3. QR Code Download Modals and Flyouts */
      div[data-e2e="qr-code-container"],
      div[class*="DivQrCodeContainer"],
      div[class*="AppQrCodeModal"] {
        display: none !important;
      }

      /* 4. Non-essential promotional banners */
      div[data-e2e="banner-container"],
      div[class*="DivBannerWrapper"] {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }
}
