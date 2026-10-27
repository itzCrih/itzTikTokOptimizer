import test from 'node:test';
import assert from 'node:assert/strict';
import { LiveRemovalModule } from '../src/content/modules/live-removal.js';
import { DramaRemovalModule } from '../src/content/modules/drama-removal.js';
import { DiagnosticsModule } from '../src/content/modules/diagnostics.js';
import { LifecycleManager } from '../src/content/lifecycle.js';
import {
  injectStylesheet,
  removeStylesheet,
  markElementOptimized,
  isElementOptimized
} from '../src/content/dom-utils.js';
import { MockDocument, MockElement } from './setup.js';

test('DOM Utilities stylesheet injection and removal', () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  // 1. Inject stylesheet
  const styleEl = injectStylesheet('test-mod', 'body { color: red; }');
  assert.ok(styleEl);
  assert.equal(styleEl.textContent, 'body { color: red; }');
  assert.ok(mockDoc.getElementById('itz-opt-style-test-mod'));

  // 2. Remove stylesheet
  const removed = removeStylesheet('test-mod');
  assert.equal(removed, true);
  assert.equal(mockDoc.getElementById('itz-opt-style-test-mod'), null);
});

test('Element optimization tagging', () => {
  const el = new MockElement('div');
  assert.equal(isElementOptimized(el, 'tag1'), false);

  markElementOptimized(el, 'tag1');
  assert.equal(isElementOptimized(el, 'tag1'), true);
  assert.equal(isElementOptimized(el, 'tag2'), false);

  markElementOptimized(el, 'tag2');
  assert.equal(isElementOptimized(el, 'tag1'), true);
  assert.equal(isElementOptimized(el, 'tag2'), true);
});

test('LiveRemovalModule correctly identifies LIVE stream elements and preserves ordinary videos', () => {
  const liveMod = new LiveRemovalModule();

  // Test 1: Live stream card with data-e2e="live-card"
  const liveCard1 = new MockElement('div', { 'data-e2e': 'live-card' });
  assert.equal(liveMod.isLiveElement(liveCard1), true);

  // Test 2: Card containing a live link
  const liveCard2 = new MockElement('div');
  const liveLink = new MockElement('a', { href: 'https://www.tiktok.com/@streamer/live' });
  liveCard2.appendChild(liveLink);
  assert.equal(liveMod.isLiveElement(liveCard2), true);

  // Test 3: Ordinary video item - MUST NOT be flagged as live!
  const normalVideo = new MockElement('div', { 'data-e2e': 'recommend-list-item-container' });
  const videoLink = new MockElement('a', { href: 'https://www.tiktok.com/@creator/video/12345678' });
  normalVideo.appendChild(videoLink);
  assert.equal(liveMod.isLiveElement(normalVideo), false);
});

test('DramaRemovalModule correctly identifies short drama series elements and preserves regular videos', () => {
  const dramaMod = new DramaRemovalModule();

  // Test 1: Series card attribute
  const dramaCard1 = new MockElement('div', { 'data-e2e': 'series-card' });
  assert.equal(dramaMod.isDramaElement(dramaCard1), true);

  // Test 2: Card containing a /series/ link
  const dramaCard2 = new MockElement('div');
  const dramaLink = new MockElement('a', { href: '/series/revenge-drama-ep1' });
  dramaCard2.appendChild(dramaLink);
  assert.equal(dramaMod.isDramaElement(dramaCard2), true);

  // Test 3: Ordinary video item - MUST NOT be flagged as drama!
  const normalCard = new MockElement('div', { 'data-e2e': 'recommend-list-item-container' });
  const userLink = new MockElement('a', { href: '/@creator' });
  normalCard.appendChild(userLink);
  assert.equal(dramaMod.isDramaElement(normalCard), false);
});

test('DiagnosticsModule collects snapshot safely without telemetry', () => {
  const mockDoc = new MockDocument();
  // Add some mock elements
  mockDoc.body.appendChild(new MockElement('div'));
  mockDoc.body.appendChild(new MockElement('div'));
  globalThis.document = mockDoc;
  globalThis.window = { location: { pathname: '/messages' } };
  globalThis.performance = {
    memory: {
      usedJSHeapSize: 45 * 1024 * 1024,
      totalJSHeapSize: 60 * 1024 * 1024,
      jsHeapSizeLimit: 2048 * 1024 * 1024
    },
    getEntriesByType: () => [
      { name: 'first-contentful-paint', startTime: 142 }
    ]
  };

  const lifecycle = new LifecycleManager();
  const diagMod = new DiagnosticsModule(lifecycle);

  const snapshot = diagMod.collectSnapshot();

  assert.ok(snapshot.timestamp);
  assert.equal(snapshot.url, '/messages');
  assert.ok(snapshot.dom.totalNodes > 0);
  assert.equal(snapshot.memory.usedHeapMB, '45.00');
  assert.equal(snapshot.memory.totalHeapMB, '60.00');
  assert.equal(snapshot.paintMilestones['first-contentful-paint'], '142ms');
});
