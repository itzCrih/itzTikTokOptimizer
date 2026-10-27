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
