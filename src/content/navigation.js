/**
 * itzTikTok Optimizer - SPA Navigation Tracker
 * Monitors Next.js client-side route transitions without heavy polling.
 */

import { ROUTES } from '../shared/constants.js';

let currentRoute = ROUTES.UNKNOWN;
let currentPath = '';
const listeners = new Set();
let initialized = false;

/**
 * Parses pathname to determine semantic TikTok route
 */
export function parseRoute(pathname) {
  if (!pathname || pathname === '/' || pathname === '/foryou' || pathname === '/following') {
    return ROUTES.FEED;
  }
  if (pathname.startsWith('/messages')) {
    return ROUTES.MESSAGES;
  }
  if (pathname.startsWith('/live')) {
    return ROUTES.LIVE;
  }
  if (pathname.startsWith('/series') || pathname.startsWith('/drama')) {
    return ROUTES.SERIES;
  }
  if (pathname.startsWith('/explore')) {
    return ROUTES.EXPLORE;
  }
  if (pathname.startsWith('/@') && !pathname.includes('/video/')) {
    return ROUTES.PROFILE;
  }
  if (pathname.includes('/video/')) {
    return ROUTES.VIDEO;
  }
  return ROUTES.FEED; // default fallback for main experience
}

function handleLocationChange() {
  const newPath = window.location.pathname;
  if (newPath === currentPath) return;

  currentPath = newPath;
  const newRoute = parseRoute(newPath);
  const oldRoute = currentRoute;
  currentRoute = newRoute;

  for (const cb of listeners) {
    try {
      cb({
        route: newRoute,
        previousRoute: oldRoute,
        pathname: newPath
      });
    } catch (err) {
      console.warn('[itzTikTokOptimizer] Route listener error:', err);
    }
  }
}

/**
 * Initializes SPA history monkey-patching safely.
 */
export function initNavigationTracker() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  currentPath = window.location.pathname;
  currentRoute = parseRoute(currentPath);

  // Safely wrap history.pushState
  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = originalPushState.apply(this, args);
    setTimeout(handleLocationChange, 0);
    return res;
  };

  // Safely wrap history.replaceState
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = originalReplaceState.apply(this, args);
    setTimeout(handleLocationChange, 0);
    return res;
  };

  // Listen to popstate (back/forward)
  window.addEventListener('popstate', handleLocationChange);
  window.addEventListener('hashchange', handleLocationChange);
}

/**
 * Registers a route change listener.
 */
export function onRouteChanged(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Returns current route info
 */
export function getCurrentRoute() {
  if (!initialized) {
    currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    currentRoute = parseRoute(currentPath);
  }
  return {
    route: currentRoute,
    pathname: currentPath
  };
}
