import test from 'node:test';
import assert from 'node:assert/strict';
import { MessagingModule } from '../src/content/modules/messaging.js';
import { MockDocument, MockElement } from './setup.js';
import { ROUTES } from '../src/shared/constants.js';

test('MessagingModule suppresses DMs, hides sidebar button and redirects /messages', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;
  let replacedUrl = null;
  globalThis.window = {
    location: {
      pathname: '/foryou',
      replace: (u) => { replacedUrl = u; }
    }
  };

  const mod = new MessagingModule();
  await mod.init({});
  await mod.enable({});

  assert.equal(mod.enabled, true);

  // Check injected stylesheet exists and contains rules to hide Messages
  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl, 'Messaging stylesheet must be injected');
  assert.ok(styleEl.textContent.includes('a[href*="/messages"]'), 'Must hide Messages navigation link');
  assert.ok(styleEl.textContent.includes('div[data-e2e="message-panel"]'), 'Must hide message panels');

  // Test redirect if navigating to /messages
  mod.onNavigate({ route: ROUTES.MESSAGES, pathname: '/messages' });
  assert.equal(replacedUrl, '/');

  // Disable module
  await mod.disable();
  assert.equal(mod.enabled, false);
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null, 'Stylesheet must be removed on disable');
});
