/**
 * itzTikTok Optimizer - High Performance DOM Utilities
 * Engineered for minimal layout recalculations, scoped queries, and zero-cost stylesheet overrides.
 */

const STYLE_PREFIX = 'itz-opt-style-';
const EXTENSION_DATA_ATTR = 'data-itz-optimized';

/**
 * Injects or updates a scoped stylesheet in the document head.
 * Highly performant way to hide/contain elements without DOM thrashing.
 */
export function injectStylesheet(id, cssContent) {
  if (typeof document === 'undefined') return null;
  const fullId = id.startsWith(STYLE_PREFIX) ? id : `${STYLE_PREFIX}${id}`;
  let styleEl = document.getElementById(fullId);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = fullId;
    styleEl.setAttribute('type', 'text/css');
    styleEl.setAttribute('data-itz-source', 'itzTikTokOptimizer');
    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(styleEl);
    }
  }

  if (styleEl.textContent !== cssContent) {
    styleEl.textContent = cssContent;
  }

  return styleEl;
}

/**
 * Cleanly removes an injected stylesheet.
 */
export function removeStylesheet(id) {
  if (typeof document === 'undefined') return false;
  const fullId = id.startsWith(STYLE_PREFIX) ? id : `${STYLE_PREFIX}${id}`;
  const styleEl = document.getElementById(fullId);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
    return true;
  }
  return false;
}

/**
 * Tags an element to prevent redundant processing.
 */
export function markElementOptimized(el, moduleTag) {
  if (!el || !el.dataset) return;
  const current = el.getAttribute(EXTENSION_DATA_ATTR) || '';
  if (!current.includes(moduleTag)) {
    el.setAttribute(EXTENSION_DATA_ATTR, current ? `${current} ${moduleTag}` : moduleTag);
  }
}

/**
 * Checks if an element was already processed by this module.
 */
export function isElementOptimized(el, moduleTag) {
  if (!el || !el.getAttribute) return false;
  const current = el.getAttribute(EXTENSION_DATA_ATTR);
  return !!(current && current.includes(moduleTag));
}

/**
 * Safe, batched MutationObserver wrapper.
 * Prevents recursive loops, filters noise, and batches callbacks via requestAnimationFrame.
 */
export function createBatchedObserver(options) {
  if (typeof MutationObserver === 'undefined') return null;
  const {
    target = typeof document !== 'undefined' ? (document.body || document.documentElement || document) : null,
    config = { childList: true, subtree: true },
    filter = null,
    onBatch = () => {},
    debounceMs = 60
  } = options;

  if (!target) return null;

  let batchedMutations = [];
  let rafId = null;
  let timerId = null;
  let isProcessing = false;

  const processBatch = () => {
    if (batchedMutations.length === 0) return;
    const current = batchedMutations;
    batchedMutations = [];
    isProcessing = true;

    try {
      onBatch(current);
    } catch (err) {
      console.warn('[itzTikTokOptimizer] Batched observer error:', err);
    } finally {
      isProcessing = false;
    }
  };

  const observer = new MutationObserver((mutations) => {
    // Prevent recursive self-triggering
    if (isProcessing) return;

    for (let i = 0; i < mutations.length; i++) {
      const mut = mutations[i];

      // Ignore mutations originating from extension's injected style elements
      if (mut.target && mut.target.id && mut.target.id.startsWith(STYLE_PREFIX)) {
        continue;
      }
      if (mut.target && mut.target.getAttribute && mut.target.getAttribute('data-itz-source')) {
        continue;
      }

      if (filter && !filter(mut)) {
        continue;
      }

      batchedMutations.push(mut);
    }

    if (batchedMutations.length > 0) {
      if (debounceMs > 0) {
        if (!timerId) {
          timerId = setTimeout(() => {
            timerId = null;
            processBatch();
          }, debounceMs);
        }
      } else {
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            processBatch();
          });
        }
      }
    }
  });

  observer.observe(target, config);

  return {
    observer,
    disconnect: () => {
      if (timerId) clearTimeout(timerId);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      batchedMutations = [];
    }
  };
}

/**
 * Safely queries elements matching any selector in a list of resilient fallback selectors.
 */
export function queryResilient(selectors, root = document) {
  if (!root || !root.querySelectorAll) return [];
  for (const sel of selectors) {
    try {
      const results = root.querySelectorAll(sel);
      if (results && results.length > 0) {
        return Array.from(results);
      }
    } catch (e) {
      // Ignore invalid or unsupported CSS selector
    }
  }
  return [];
}
