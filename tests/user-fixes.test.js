import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationsModule } from '../src/content/modules/notifications.js';
import { FeedModule } from '../src/content/modules/feed.js';
import { DramaRemovalModule } from '../src/content/modules/drama-removal.js';
import { LiveRemovalModule } from '../src/content/modules/live-removal.js';
import { filterOutLiveFeedItems, isShareUrl, isBlockedTelemetryUrl } from '../src/shared/sanitizer.js';
import { MockDocument, MockElement } from './setup.js';

test('1. Sidebar icons are never hidden by notification badge eradication', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const notifMod = new NotificationsModule();
  await notifMod.init({});
  await notifMod.enable({});

  // Construct a sidebar navigation link with an SVG icon
  const nav = new MockElement('nav');
  const forYouLink = new MockElement('a', { href: '/foryou' });
  const iconWrapper = new MockElement('div', { class: 'e1cg30q1 DivSideNavIcon' });
  const svgIcon = new MockElement('svg');
  iconWrapper.appendChild(svgIcon);
  const textSpan = new MockElement('span');
  textSpan.textContent = 'For You';
  forYouLink.appendChild(iconWrapper);
  forYouLink.appendChild(textSpan);
  nav.appendChild(forYouLink);
  mockDoc.body.appendChild(nav);

  notifMod.eradicateBadges(mockDoc);

  // Assert iconWrapper and svgIcon were NOT hidden
  assert.equal(iconWrapper.classList.has('itz-hidden-badge'), false, 'Icon wrapper must not have hidden badge class');
  assert.equal(iconWrapper.style.getPropertyValue('display'), '', 'Icon wrapper display must not be none');
});

test('2. Photo carousel slide buttons and photo counter are preserved on FYP', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const feedMod = new FeedModule();
  await feedMod.init({});
  await feedMod.enable({});

  const styleEl = mockDoc.getElementById(`itz-opt-style-${feedMod.styleId}`);
  assert.ok(styleEl);
  // Verify safeguard rules for photo controls
  assert.ok(styleEl.textContent.includes('ArrowButton'));
  assert.ok(styleEl.textContent.includes('PhotoCounter'));
  assert.ok(styleEl.textContent.includes('display: flex !important'));
  // Ensure virtualization is NOT applied to inner children (> div) of feed card
  assert.ok(!styleEl.textContent.includes('recommend-list-item-container"] > div'));
});

test('3. Profile clips with drama/series words are preserved and not suppressed', () => {
  const dramaMod = new DramaRemovalModule();

  // Test URL paths: normal TV series clips and playlists must NOT be flagged as Short dramas
  assert.equal(dramaMod.isDramaUrl('/@kyrnx.aep'), false);
  assert.equal(dramaMod.isDramaUrl('/@kyrnx.aep/video/7699937495613525270'), false);
  assert.equal(dramaMod.isDramaUrl('/series/dexter-clips-123'), false);
  assert.equal(dramaMod.isDramaUrl('/drama/patrick-jane-789'), false);

  // Test elements: video post containing playlist/series link must NOT be suppressed
  const videoCard = new MockElement('div', { 'data-e2e': 'user-post-item' });
  const seriesPlaylistLink = new MockElement('a', { href: '/series/dexter-season-1' });
  videoCard.appendChild(seriesPlaylistLink);
  assert.equal(dramaMod.isDramaElement(videoCard), false, 'Normal series/drama post must not be hidden');

  // Short drama promotional card MUST be suppressed
  const shortDramaCard = new MockElement('div', { 'data-e2e': 'shortdrama-card' });
  assert.equal(dramaMod.isDramaElement(shortDramaCard), true, 'Short drama card must be hidden');
});

test('4. LIVE streams are filtered out from FYP recommendations before render', () => {
  const incomingFeed = [
    { id: 'vid1', desc: 'Dexter edit', video: { id: 'v1' } },
    { id: 'live1', desc: 'Gaming LIVE', live_room: { room_id: '123' }, is_live: true },
    { id: 'vid2', desc: 'Patrick Jane clip', video: { id: 'v2' } }
  ];

  const filtered = filterOutLiveFeedItems(incomingFeed);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].id, 'vid1');
  assert.equal(filtered[1].id, 'vid2');
  assert.ok(!filtered.some(i => i.id === 'live1'));
});

test('5. Share popup URLs are exempted from Direct Messaging suppression', () => {
  // Share dialog contact queries must be allowed
  assert.equal(isShareUrl('https://www.tiktok.com/api/im/share/user_list/'), true);
  assert.equal(isShareUrl('https://www.tiktok.com/api/v1/web/im/user/?scene=share'), true);
  assert.equal(isShareUrl('https://www.tiktok.com/api/im/message/send/?action=share'), true);

  // Background inbox sync and unread polls must still be blocked
  assert.equal(isShareUrl('https://www.tiktok.com/web/im/sync/'), false);
  assert.equal(isShareUrl('https://www.tiktok.com/web/im/chat/list/'), false);
});

test('6. Big gap in sidebar is collapsed cleanly', () => {
  const mockDoc = new MockDocument();
  const dramaMod = new DramaRemovalModule();

  const sideNav = new MockElement('div', { 'data-e2e': 'side-nav' });
  const spacer = new MockElement('div', { class: 'DivSpacer' });
  const navList = new MockElement('ul');

  sideNav.appendChild(spacer);
  sideNav.appendChild(navList);
  mockDoc.body.appendChild(sideNav);

  dramaMod.compactSidebarNavigation(mockDoc);

  assert.equal(spacer.style.getPropertyValue('height'), '1px');
  assert.equal(spacer.style.getPropertyValue('margin'), '2px 0');
  assert.equal(navList.style.getPropertyValue('row-gap'), '4px');
});

test('7. CSP-violating CapCut PNS monitor and telemetry requests are intercepted', () => {
  const capcutUrl = 'https://mon-sg.capcutapi.com/monitor_browser/collect/batch/?bid=capcut_pns_web_runtime';
  assert.equal(isBlockedTelemetryUrl(capcutUrl), true, 'CapCut PNS telemetry monitor must be blocked');

  // Verify normal TikTok endpoints are not blocked
  assert.equal(isBlockedTelemetryUrl('https://www.tiktok.com/@user/video/12345'), false);
  assert.equal(isBlockedTelemetryUrl('https://www.tiktok.com/api/recommend/item_list/'), false);
});

