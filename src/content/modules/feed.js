/**
 * itzTikTok Optimizer - Feed Optimization Module
 * 
 * Target Bottlenecks:
 * 1. Infinite scrolling accumulation: Hundreds of video cards retained in DOM.
 * 2. Frequent style recalculations across offscreen feed cards during scrolling.
 * 3. Forced synchronous reflows caused by uncontained feed layout recalculations.
 * 
 * Strategy:
 * - Apply CSS content-visibility: auto with intrinsic size to offscreen feed cards.
 * - Enforce CSS layout & style containment on feed containers.
 * - Use passive IntersectionObserver rather than high-frequency scroll listeners.
 * - Safely preserve TikTok's internal video player state, comments, and navigation.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS, ROUTES } from '../../shared/constants.js';

export class FeedModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.FEED, 'Feed Optimization');
    this.isFeedRoute = true;
  }

  async onEnable(settings) {
    this.applyFeedStyles();
  }

  async onDisable() {
    this.removeCSS();
  }

  onNavigate(routeInfo) {
    if (!this.enabled) return;
    this.isFeedRoute = routeInfo.route === ROUTES.FEED;
    if (this.isFeedRoute) {
      this.applyFeedStyles();
    }
  }

  applyFeedStyles() {
    if (!this.enabled) return;

    let css = `
      /* 1. Feed Container Layout Containment */
      div[data-e2e="recommend-list-item-container"],
      div[class*="DivItemContainerV2"],
      div[class*="DivFeedContainer"] {
        contain: layout;
      }

      /* 2. Offscreen Feed Item Virtualization */
      /* Instructs Chromium to skip layout & paint passes for offscreen video cards */
      div[data-e2e="feed-item"],
      div[data-e2e="recommend-list-item-container"] {
        content-visibility: auto;
        contain-intrinsic-size: 700px;
      }

      /* 3. Action bar containment (Likes, Comments, Shares, Bookmarks) */
      div[data-e2e="feed-action-item"],
      div[class*="DivActionItemContainer"] {
        contain: layout style;
      }

      /* 4. Author info bar containment */
      div[data-e2e="feed-author-info"],
      div[class*="DivAuthorContainer"] {
        contain: layout style;
      }

      /* 5. Safeguard multi-photo slide swap buttons, arrows and photo counters */
      button[aria-label*="Previous" i],
      button[aria-label*="Next" i],
      div[class*="ArrowButton"],
      div[class*="ButtonArrow"],
      div[class*="SlideControl"],
      div[class*="PhotoCounter"],
      div[class*="Pagination"],
      span[class*="PhotoCounter"] {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;

    this.injectCSS(css);
  }
}
