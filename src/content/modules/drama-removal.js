/**
 * itzTikTok Optimizer - Short Drama & Mini-Series Removal Module
 * 
 * Target Content:
 * 1. "Short dramas" navigation button in TikTok desktop sidebar.
 * 2. Entire Short Drama landing hub (/shortdrama, /series, /drama) - prevents page from loading.
 * 3. Feed cards, sponsored series, carousels, and promotional drama banners.
 * 
 * Layout Organization:
 * - Completely collapses the Short Dramas button and its wrapper container (0px height, 0px margin).
 * - Organizes surviving navigation buttons (For You, Explore, Following, Friends) so no
 *   awkward gap or "missed button" empty slot appears in the sidebar.
 * - Reversible: full restoration on toggle without page reload.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';
import { createBatchedObserver } from '../dom-utils.js';

const DRAMA_HIDE_CLASS = 'itz-hidden-drama-content';
const DRAMA_BUTTON_HIDE_CLASS = 'itz-hidden-drama-button';

export class DramaRemovalModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.DRAMA_REMOVAL, 'Short Drama Removal');
    this.observer = null;
  }

  async onEnable(settings) {
    // 1. If currently on /shortdrama, completely stop it from loading and redirect to feed
    if (this.isDramaUrl()) {
      this.preventDramaPageLoading();
      return;
    }

    this.applyDramaStyles();
    this.suppressSidebarButton();
    this.compactSidebarNavigation();
    this.scanAndSuppressDramaElements();
    this.setupDramaObserver();
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

    if (this.isDramaUrl(routeInfo.pathname)) {
      this.preventDramaPageLoading();
      return;
    }

    this.suppressSidebarButton();
    this.compactSidebarNavigation();
    this.scanAndSuppressDramaElements();
  }

  isDramaUrl(pathname) {
    const path = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '')).toLowerCase();
    return (
      path.startsWith('/shortdrama') ||
      path.startsWith('/short-drama') ||
      path.startsWith('/series') ||
      path.startsWith('/drama')
    );
  }

  preventDramaPageLoading() {
    if (typeof window === 'undefined') return;
    if (document && document.documentElement) {
      document.documentElement.style.display = 'none';
    }
    window.location.replace('/');
  }

  applyDramaStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Complete suppression of Short Drama Button and its wrapper container */
      a[href*="/shortdrama"],
      a[href*="/short-drama"],
      a[href*="/series"],
      a[href*="/drama"],
      li:has(a[href*="/shortdrama"]),
      li:has(a[href*="/short-drama"]),
      li:has(a[href*="/series"]),
      li:has(a[href*="/drama"]),
      div:has(> a[href*="/shortdrama"]),
      div:has(> a[href*="/short-drama"]),
      div:has(> a[href*="/series"]),
      div:has(> a[href*="/drama"]),
      div:has(> div > a[href*="/shortdrama"]),
      div:has(> div > a[href*="/short-drama"]),
      [data-e2e*="shortdrama"],
      [data-e2e*="short-drama"],
      [data-e2e*="drama"],
      [data-e2e*="series"],
      .${DRAMA_BUTTON_HIDE_CLASS} {
        display: none !important;
        margin: 0 !important;
        padding: 0 !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        line-height: 0 !important;
        border: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        overflow: hidden !important;
      }

      /* 2. Seamless scaling, elimination of void & layout organization */
      /* Normalizes flex spacing so no empty hole or "missed button" gap exists */
      nav ul,
      div[data-e2e="side-nav"] ul,
      div[class*="SideNav"] ul,
      div[class*="MainNav"] ul,
      div[class*="NavWrapper"] {
        display: flex !important;
        flex-direction: column !important;
        row-gap: 4px !important;
      }

      /* Eliminate void between upper nav (Friends) and lower nav (Messages) */
      div[data-e2e="side-nav"] > div,
      div[class*="SideNav"] > div,
      div[class*="MainNav"] > div,
      div[class*="NavWrapper"] > div,
      div[data-e2e="side-nav"] ul,
      div[class*="SideNav"] ul {
        min-height: 0 !important;
        flex-grow: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      /* Pull lower navigation group (Upload, Profile, Messages) directly below Friends */
      div[data-e2e="side-nav"] ul:has(a[href*="/upload"]),
      div[data-e2e="side-nav"] div:has(> a[href*="/upload"]),
      div[data-e2e="side-nav"] ul:has(a[href*="/@"]),
      div[data-e2e="side-nav"] ul:has(a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> a[href*="/messages"]),
      div[data-e2e="side-nav"] div:has(> div > a[href*="/messages"]),
      div[class*="SideNav"] ul:has(a[href*="/upload"]),
      div[class*="SideNav"] div:has(a[href*="/upload"]),
      div[class*="SideNav"] ul:has(a[href*="/messages"]),
      div[class*="SideNav"] div:has(a[href*="/messages"]) {
        margin-top: 4px !important;
        padding-top: 0 !important;
      }

      /* Collapse large spacers between upper and lower nav */
      div[data-e2e="side-nav"] div[class*="Spacer"],
      div[data-e2e="side-nav"] div[class*="Divider"],
      div[class*="SideNav"] div[class*="Spacer"],
      div[class*="SideNav"] div[class*="Divider"] {
        height: 1px !important;
        min-height: 0 !important;
        margin: 4px 0 !important;
      }

      /* Ensure surviving navigation items (For You, Explore, Following, Friends) scale cleanly */
      div[data-e2e="side-nav"] a,
      nav a[href],
      div[class*="SideNav"] a[href],
      div[class*="MainNav"] a[href] {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      /* 3. Feed cards, series hubs, and drama promo banners */
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/shortdrama"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/short-drama"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/series"]),
      div[data-e2e="recommend-list-item-container"]:has(a[href*="/drama"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e*="series"]),
      div[data-e2e="recommend-list-item-container"]:has([data-e2e*="drama"]),
      div[data-e2e="series-card"],
      div[data-e2e="drama-card"],
      div[data-e2e="shortdrama-card"],
      div[data-e2e="series-side-nav"],
      div[data-e2e="drama-banner"],
      div[class*="SeriesPromoContainer"],
      div[class*="DramaBanner"],
      div[class*="ShortDrama"] {
        display: none !important;
      }

      /* 4. Class-based fallback */
      .${DRAMA_HIDE_CLASS} {
        display: none !important;
      }
    `;

    this.injectCSS(css);
  }

  /**
   * Scans sidebar links to eliminate the "Short dramas" button and collapse its wrapper
   */
  suppressSidebarButton(root = document) {
    if (!root || !root.querySelectorAll) return;

    const links = root.querySelectorAll('a, button, [role="button"], [role="link"]');
    for (let i = 0; i < links.length; i++) {
      const el = links[i];
      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = (el.textContent || '').trim().toLowerCase();
      const dataE2e = (el.getAttribute('data-e2e') || '').toLowerCase();

      const isShortDramaBtn =
        href.includes('/shortdrama') ||
        href.includes('/short-drama') ||
        href.includes('/series') ||
        href.includes('/drama') ||
        dataE2e.includes('shortdrama') ||
        dataE2e.includes('short-drama') ||
        text === 'short dramas' ||
        text === 'short drama' ||
        text.startsWith('short drama');

      if (isShortDramaBtn) {
        el.classList.add(DRAMA_BUTTON_HIDE_CLASS);

        // Find parent list item or immediate wrapper to prevent any empty slot
        const parentWrapper = el.closest('li, [role="listitem"]');
        if (parentWrapper) {
          parentWrapper.classList.add(DRAMA_BUTTON_HIDE_CLASS);
        } else if (el.parentElement && el.parentElement !== document.body) {
          // If parent is a dedicated item container
          const p = el.parentElement;
          if (p.children.length === 1 || p.textContent.trim().toLowerCase() === text) {
            p.classList.add(DRAMA_BUTTON_HIDE_CLASS);
          }
        }
      }
    }
  }

  /**
   * Eliminates the void between upper navigation (Friends) and lower navigation (Upload, Profile, Messages)
   */
  compactSidebarNavigation(root = document) {
    if (!root || !root.querySelectorAll) return;

    const lowerLink = root.querySelector ? root.querySelector('a[href*="/upload"], a[href*="/@"], a[href*="/profile"], a[href*="/messages"]') : null;
    if (lowerLink) {
      const lowerGroup = lowerLink.closest('ul, div[class*="NavSection"], div[class*="List"]');
      if (lowerGroup && lowerGroup.style) {
        lowerGroup.style.setProperty('margin-top', '4px', 'important');
        lowerGroup.style.setProperty('padding-top', '0px', 'important');

        let prev = lowerGroup.previousElementSibling;
        while (prev) {
          const text = (prev.textContent || '').trim();
          if (!text || (prev.matches && prev.matches('hr, div[class*="Divider"], div[class*="Spacer"], div[class*="Line"]'))) {
            if (prev.style) {
              prev.style.setProperty('margin', '2px 0', 'important');
              prev.style.setProperty('height', '1px', 'important');
              prev.style.setProperty('min-height', '0px', 'important');
            }
          } else {
            if (prev.style) {
              prev.style.setProperty('min-height', '0px', 'important');
              prev.style.setProperty('margin-bottom', '2px', 'important');
              prev.style.setProperty('padding-bottom', '0px', 'important');
            }
            break;
          }
          prev = prev.previousElementSibling;
        }
      }
    }

    const friendsLink = root.querySelector ? root.querySelector('a[href*="/friends"]') : null;
    if (friendsLink) {
      const friendsGroup = friendsLink.closest('ul, div[class*="NavSection"], div[class*="List"]');
      if (friendsGroup && friendsGroup.style) {
        friendsGroup.style.setProperty('min-height', '0px', 'important');
        friendsGroup.style.setProperty('margin-bottom', '2px', 'important');
      }
    }
  }

  isDramaElement(node) {
    if (!node || node.nodeType !== 1) return false;

    const dramaAttr = node.getAttribute && (
      node.getAttribute('data-e2e') === 'series-card' ||
      node.getAttribute('data-e2e') === 'drama-card' ||
      node.getAttribute('data-e2e') === 'shortdrama-card' ||
      (node.getAttribute('data-e2e') && node.getAttribute('data-e2e').includes('shortdrama'))
    );
    if (dramaAttr) return true;

    const dramaLink = node.querySelector && node.querySelector(
      'a[href*="/shortdrama"], a[href*="/short-drama"], a[href*="/series/"], a[href*="/drama/"]'
    );
    if (dramaLink) return true;

    return false;
  }

  scanAndSuppressDramaElements(root = document) {
    if (!root || !root.querySelectorAll) return;
    const candidates = root.querySelectorAll(
      'div[data-e2e="recommend-list-item-container"], div[data-e2e="feed-item"]'
    );

    for (let i = 0; i < candidates.length; i++) {
      const card = candidates[i];
      if (this.isDramaElement(card)) {
        card.classList.add(DRAMA_HIDE_CLASS);
      }
    }
  }

  setupDramaObserver() {
    if (this.observer) return;

    this.observer = createBatchedObserver({
      target: document.body,
      config: { childList: true, subtree: true },
      debounceMs: 60,
      filter: (mut) => mut.addedNodes.length > 0,
      onBatch: (mutations) => {
        for (let i = 0; i < mutations.length; i++) {
          const mut = mutations[i];
          for (let j = 0; j < mut.addedNodes.length; j++) {
            const added = mut.addedNodes[j];
            if (added.nodeType === 1) {
              this.suppressSidebarButton(added);
              this.compactSidebarNavigation(added);
              this.scanAndSuppressDramaElements(added);
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

    if (document.documentElement && document.documentElement.style.display === 'none') {
      document.documentElement.style.display = '';
    }

    const dramaElements = document.querySelectorAll(`.${DRAMA_HIDE_CLASS}`);
    for (let i = 0; i < dramaElements.length; i++) {
      dramaElements[i].classList.remove(DRAMA_HIDE_CLASS);
    }

    const buttonElements = document.querySelectorAll(`.${DRAMA_BUTTON_HIDE_CLASS}`);
    for (let i = 0; i < buttonElements.length; i++) {
      buttonElements[i].classList.remove(DRAMA_BUTTON_HIDE_CLASS);
    }
  }
}
