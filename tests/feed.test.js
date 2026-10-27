import test from 'node:test';
import assert from 'node:assert/strict';
import { FeedModule } from '../src/content/modules/feed.js';
import { MockDocument } from './setup.js';

test('FeedModule injects containment and virtualization for feed scrolling', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const mod = new FeedModule();
  await mod.init({});
  await mod.enable({});

  assert.equal(mod.enabled, true);

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl);
  assert.ok(styleEl.textContent.includes('data-e2e="recommend-list-item-container"'));
  assert.ok(styleEl.textContent.includes('content-visibility: auto'));
  assert.ok(styleEl.textContent.includes('contain: layout'));

  await mod.disable();
  assert.equal(mod.enabled, false);
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null);
});
