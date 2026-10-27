import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanTitle, isDirtyTitle, isNoticeUrl, isImUrl } from '../src/shared/sanitizer.js';
import { MockDocument } from './setup.js';

test('Title Sanitizer permanently removes notification numbers and badges', () => {
  // Test variations of unread notification counters in page title
  assert.equal(cleanTitle('[99+] TikTok - Make Your Day'), 'TikTok - Make Your Day');
  assert.equal(cleanTitle('(99+) TikTok - Make Your Day'), 'TikTok - Make Your Day');
  assert.equal(cleanTitle('(1) TikTok'), 'TikTok');
  assert.equal(cleanTitle('[1] TikTok'), 'TikTok');
  assert.equal(cleanTitle('(99+) · TikTok'), 'TikTok');
  assert.equal(cleanTitle('· [99+] TikTok'), 'TikTok');
  assert.equal(cleanTitle('TikTok · (99+)'), 'TikTok');
  assert.equal(cleanTitle('TikTok [99+]'), 'TikTok');
  assert.equal(cleanTitle('(12) TikTok - Trends Start Here'), 'TikTok - Trends Start Here');

  // Must preserve legitimate content titles
  assert.equal(cleanTitle('TikTok - Make Your Day'), 'TikTok - Make Your Day');
  assert.equal(cleanTitle('Funny Cat Video on TikTok'), 'Funny Cat Video on TikTok');
  assert.equal(cleanTitle(''), '');
  assert.equal(cleanTitle(null), null);
});

test('isDirtyTitle correctly detects presence of notification counters', () => {
  assert.equal(isDirtyTitle('[99+] TikTok'), true);
  assert.equal(isDirtyTitle('(99+) TikTok'), true);
  assert.equal(isDirtyTitle('(1) TikTok'), true);
  assert.equal(isDirtyTitle('TikTok · (5)'), true);
  assert.equal(isDirtyTitle('TikTok - Make Your Day'), false);
  assert.equal(isDirtyTitle('Video title without badge'), false);
});

test('isNoticeUrl correctly detects TikTok notice and polling endpoints', () => {
  assert.equal(isNoticeUrl('https://www.tiktok.com/api/notice/multi/'), true);
  assert.equal(isNoticeUrl('https://www.tiktok.com/api/v1/notice/count/'), true);
  assert.equal(isNoticeUrl('https://www.tiktok.com/passport/web/account/notice/'), true);
  assert.equal(isNoticeUrl('https://www.tiktok.com/notification/list'), true);

  // Non-notice endpoints must return false
  assert.equal(isNoticeUrl('https://www.tiktok.com/api/item/list/'), false);
  assert.equal(isNoticeUrl('https://www.tiktok.com/api/feed/item/'), false);
});

test('isImUrl correctly detects Direct Messaging and IM endpoints', () => {
  assert.equal(isImUrl('https://www.tiktok.com/web/im/chat/list/'), true);
  assert.equal(isImUrl('https://www.tiktok.com/api/v1/web/im/message/send/'), true);
  assert.equal(isImUrl('https://www.tiktok.com/v1/im/conversation/get/'), true);
  assert.equal(isImUrl('https://www.tiktok.com/api/im/sync/'), true);

  // Non-IM endpoints must return false
  assert.equal(isImUrl('https://www.tiktok.com/api/recommend/item_list/'), false);
  assert.equal(isImUrl('https://www.tiktok.com/@creator/video/12345'), false);
});
