import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationsModule } from '../src/content/modules/notifications.js';
import { MockDocument, MockElement } from './setup.js';

test('NotificationsModule completely suppresses toasts, badges and injects interceptor', async () => {
  const mockDoc = new MockDocument();
  mockDoc.addEventListener = () => {};
  mockDoc.removeEventListener = () => {};
  globalThis.document = mockDoc;

  const mod = new NotificationsModule();
  await mod.init({});
  await mod.enable({});

  assert.equal(mod.enabled, true);

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl, 'Notification stylesheet must be injected');
  assert.ok(styleEl.textContent.includes('Toast'), 'Must include toast suppression rules');
  assert.ok(styleEl.textContent.includes('badge'), 'Must include badge suppression rules');
  assert.ok(styleEl.textContent.includes('display: none !important'), 'Must hide completely');

  // Test toast eradication
  const toastCard = new MockElement('div', { role: 'alert' });
  toastCard.textContent = 'b3har.vffx reposted the same video. 3m ago';
  mockDoc.body.appendChild(toastCard);

  mod.eradicateNotificationToasts(mockDoc);
  assert.equal(toastCard.classList.has('itz-hidden-notification-toast'), true);

  // Test badge eradication
  const badgeEl = new MockElement('sup', { 'data-e2e': 'inbox-badge' });
  badgeEl.textContent = '99+';
  mockDoc.body.appendChild(badgeEl);

  mod.eradicateBadges(mockDoc);
  assert.equal(badgeEl.classList.has('itz-hidden-badge'), true);

  // Test disable and cleanup
  await mod.disable();
  assert.equal(mod.enabled, false);
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null);
});
