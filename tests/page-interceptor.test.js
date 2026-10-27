import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanTitle,
  isDirtyTitle,
  isNoticeUrl,
  isImUrl,
  isShareUrl,
  isFeedRecommendUrl,
  filterOutLiveFeedItems,
  isBlockedTelemetryUrl
} from '../src/shared/sanitizer.js';
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

test('isShareUrl correctly permits post sharing requests so friends appear in Share dialog', () => {
  assert.equal(isShareUrl('https://www.tiktok.com/api/im/share/user_list/'), true);
  assert.equal(isShareUrl('https://www.tiktok.com/api/v1/web/im/user/?scene=share'), true);
  assert.equal(isShareUrl('https://www.tiktok.com/api/im/message/send/?action=share'), true);
  assert.equal(isShareUrl('https://www.tiktok.com/web/im/share/list/'), true);

  // Normal background chat polling must not be identified as share
  assert.equal(isShareUrl('https://www.tiktok.com/web/im/chat/list/'), false);
  assert.equal(isShareUrl('https://www.tiktok.com/api/im/sync/'), false);
});

test('filterOutLiveFeedItems completely removes LIVE streams from FYP feed recommendations', () => {
  const sampleFeed = [
    { id: '1', desc: 'Normal cool video 1', video: { duration: 15 } },
    { id: '2', desc: 'Streamer is LIVE right now!', live_room: { room_id: '999' }, media_type: 2 },
    { id: '3', desc: 'Normal cool video 2', video: { duration: 30 } },
    { id: '4', desc: 'Another LIVE recommendation', is_live: true },
    { id: '5', desc: 'Normal photo carousel post', image_post_info: { images: [] } }
  ];

  const cleaned = filterOutLiveFeedItems(sampleFeed);
  assert.equal(cleaned.length, 3);
  assert.equal(cleaned[0].id, '1');
  assert.equal(cleaned[1].id, '3');
  assert.equal(cleaned[2].id, '5');
  assert.ok(!cleaned.some(item => item.live_room || item.is_live));
});

test('isBlockedTelemetryUrl correctly detects CapCut and broken third-party telemetry monitors', () => {
  assert.equal(
    isBlockedTelemetryUrl('https://mon-sg.capcutapi.com/monitor_browser/collect/batch/?bid=capcut_pns_web_runtime'),
    true
  );
  assert.equal(
    isBlockedTelemetryUrl('https://mon-va.capcutapi.com/monitor_browser/collect/'),
    true
  );
  assert.equal(
    isBlockedTelemetryUrl('https://example.com/monitor_browser/collect/batch/'),
    true
  );
  assert.equal(
    isBlockedTelemetryUrl('https://mon.byteintl.com/monitor_browser/collect/?bid=capcut_pns_web_runtime'),
    true
  );
  assert.equal(
    isBlockedTelemetryUrl('https://www.tiktok.com/api/item/list/'),
    false
  );
  assert.equal(
    isBlockedTelemetryUrl('https://www.tiktok.com/api/recommend/item_list/'),
    false
  );
});

