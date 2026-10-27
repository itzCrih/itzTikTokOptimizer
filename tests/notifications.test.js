import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationsModule } from '../src/content/modules/notifications.js';
import { MockDocument, MockElement } from './setup.js';

test('NotificationsModule defers closed flyouts and suppresses badge keyframe pulses', async () => {
  const mockDoc = new MockDocument();
  // Mock addEventListener on document
  mockDoc.addEventListener = () => {};
  mockDoc.removeEventListener = () => {};
  globalThis.document = mockDoc;

  const mod = new NotificationsModule();
  await mod.init({ notificationOptions: { deferPopoverRender: true, suppressBadgeAnimation: true } });
  await mod.enable({ notificationOptions: { deferPopoverRender: true, suppressBadgeAnimation: true } });

  assert.equal(mod.enabled, true);

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl, 'Notification stylesheet must be injected');
  assert.ok(styleEl.textContent.includes('data-e2e="inbox-item"'), 'Must virtualize inbox items');
  assert.ok(styleEl.textContent.includes('animation: none !important'), 'Must disable badge continuous pulse');
  assert.ok(styleEl.textContent.includes('content-visibility: hidden'), 'Must defer closed notification flyouts');

  await mod.disable();
  assert.equal(mod.enabled, false);
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null);
});
