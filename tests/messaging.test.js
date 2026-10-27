import test from 'node:test';
import assert from 'node:assert/strict';
import { MessagingModule } from '../src/content/modules/messaging.js';
import { MockDocument, MockElement } from './setup.js';
import { ROUTES } from '../src/shared/constants.js';

test('MessagingModule applies CSS virtualization and containment', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;
  globalThis.window = {
    location: { pathname: '/messages' }
  };

  const mod = new MessagingModule();
  await mod.init({ messagingOptions: { virtualizeList: true, deferInboxInit: true } });
  await mod.enable({ messagingOptions: { virtualizeList: true, deferInboxInit: true } });

  assert.equal(mod.enabled, true);

  // Check injected stylesheet exists and contains virtualization rules
  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl, 'Messaging stylesheet must be injected');
  assert.ok(styleEl.textContent.includes('content-visibility: auto'), 'Must contain content-visibility virtualization');
  assert.ok(styleEl.textContent.includes('data-e2e="chat-item"'), 'Must target chat items');

  // Navigate away to feed
  mod.onNavigate({ route: ROUTES.FEED, pathname: '/' });
  assert.ok(styleEl.textContent.includes('content-visibility: hidden'), 'Must apply dormancy when viewing feed');

  // Disable module
  await mod.disable();
  assert.equal(mod.enabled, false);
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null, 'Stylesheet must be removed on disable');
});
