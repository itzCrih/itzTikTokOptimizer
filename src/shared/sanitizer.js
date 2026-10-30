/**
 * itzTikTok Optimizer - String & Title Sanitization Utilities
 */

/**
 * Strips [99+], (99+), [1], etc. notification count badges from document title.
 * Also cleans decorative leading/trailing bullets, dashes, or dots.
 */
export function cleanTitle(title) {
  if (!title || typeof title !== 'string') return title;
  return title
    .replace(/^[\s·•\-–—]*[\(\[]\s*\d+\+?\s*[\)\]][\s·•\-–—]*/i, '')
    .replace(/[\s·•\-–—]*[\(\[]\s*\d+\+?\s*[\)\]][\s·•\-–—]*$/i, '')
    .trim();
}

/**
 * Checks if a title string contains unread notification numbers.
 */
export function isDirtyTitle(title) {
  if (!title || typeof title !== 'string') return false;
  return /[\(\[]\s*\d+\+?\s*[\)\]]/.test(title);
}

/**
 * Checks if a URL points to TikTok notice / notification endpoints.
 */
export function isNoticeUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes('/api/notice/') ||
    u.includes('/api/v1/notice/') ||
    u.includes('/notice/multi/') ||
    u.includes('/notice/count/') ||
    u.includes('/passport/web/account/notice/') ||
    u.includes('/passport/web/notice/') ||
    u.includes('/notification/')
  );
}

/**
 * Checks if a URL points to TikTok Direct Messaging (IM) endpoints.
 */
export function isImUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes('/web/im/') ||
    u.includes('/api/v1/web/im/') ||
    u.includes('/v1/im/') ||
    u.includes('/api/im/') ||
    u.includes('/im/message/') ||
    u.includes('/im/conversation/') ||
    u.includes('/im/chat/') ||
    u.includes('/im/batch/') ||
    u.includes('/im/user/') ||
    u.includes('/im/sync/') ||
    u.includes('/message/list/') ||
    u.includes('/chat/list/')
  );
}

/**
 * Checks if a request URL or query specifically belongs to video/post sharing.
 * When the user opens the "Share to" popup to send a video to friends,
 * these requests must be allowed so friends appear in the popup.
 * Uses path-segment and query-parameter matching instead of broad substring checks
 * to prevent false positives (e.g. URLs with "share" in usernames or descriptions).
 */
export function isShareUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes('/share/user_list') ||
    u.includes('/share/list') ||
    u.includes('/share/send') ||
    u.includes('/share/recent') ||
    u.includes('scene=share') ||
    u.includes('type=share') ||
    u.includes('share_type=') ||
    u.includes('action=share') ||
    u.includes('enter_from=share') ||
    u.includes('msg_type=share') ||
    u.includes('share_to=') ||
    u.includes('/im/share/') ||
    u.includes('is_share=')
  );
}

/**
 * Checks if a URL points to TikTok FYP feed recommendations.
 */
export function isFeedRecommendUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes('/api/recommend/item_list/') ||
    u.includes('/api/feed/item/') ||
    u.includes('/api/item/list/')
  );
}

/**
 * Filters out recommended LIVE stream cards from feed item lists.
 * Eliminates LIVE streams before they reach TikTok's React application,
 * preventing empty/black screens in the FYP feed.
 */
export function filterOutLiveFeedItems(itemList) {
  if (!Array.isArray(itemList)) return itemList;
  return itemList.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    // Check if the item represents a LIVE stream or live room recommendation
    if (item.live_room || item.live_info || item.live_reason || item.is_live) {
      return false;
    }
    if (item.media_type === 2 || item.item_type === 2) {
      return false;
    }
    if (item.cell_type === 'live' || item.cell_type === 2) {
      return false;
    }
    return true;
  });
}

/**
 * Checks if a URL points to third-party telemetry, monitors, or analytics
 * that violate TikTok's CSP directives or trigger network fetch rejections.
 * Examples: CapCut PNS web runtime (mon-sg.capcutapi.com).
 * Intercepting these requests eliminates unhandled fetch errors in the browser.
 */
export function isBlockedTelemetryUrl(url) {
  if (!url) return false;
  const u = String(url).toLowerCase();
  return (
    u.includes('capcutapi.com') ||
    (u.includes('/monitor_browser/collect/') && !u.includes('tiktok.com')) ||
    u.includes('bid=capcut_pns_web_runtime')
  );
}

