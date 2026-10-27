import test from 'node:test';
import assert from 'node:assert/strict';
import { MediaModule } from '../src/content/modules/media.js';
import { AnimationsModule } from '../src/content/modules/animations.js';
import { InterfaceCleanupModule } from '../src/content/modules/interface-cleanup.js';
import { BackgroundActivityModule } from '../src/content/modules/background-activity.js';
import { MockDocument, MockElement } from './setup.js';

test('MediaModule applies player containment and safe intersection handling', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const mod = new MediaModule();
  await mod.init({});
  await mod.enable({});

  assert.equal(mod.enabled, true);
  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl.textContent.includes('data-e2e="feed-video"'));
  assert.ok(styleEl.textContent.includes('contain: layout'));

  await mod.disable();
  assert.equal(mod.enabled, false);
});

test('AnimationsModule disables spinning vinyl and engagement bursts while safeguarding spinners', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const mod = new AnimationsModule();
  await mod.init({});
  await mod.enable({});

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl.textContent.includes('AlbumArt'), 'Must stop vinyl spin');
  assert.ok(styleEl.textContent.includes('HeartAnimation'), 'Must suppress particle animations');
  assert.ok(styleEl.textContent.includes('Spinner'), 'Must preserve loading spinners');

  await mod.disable();
  assert.equal(mod.enabled, false);
});

test('InterfaceCleanupModule hides download app banner, QR code flyouts and header promos', async () => {
  const mockDoc = new MockDocument();
  globalThis.document = mockDoc;

  const mod = new InterfaceCleanupModule();
  await mod.init({});
  await mod.enable({});

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl.textContent.includes('download-guide-container'));
  assert.ok(styleEl.textContent.includes('qr-code-container'));
  assert.ok(styleEl.textContent.includes('header a[href*="/coin"]'), 'Must include Get Coins cleanup');

  // Test header promo cleanup
  const headerRight = new MockElement('div', { class: 'HeaderRight' });
  const getCoinsBtn = new MockElement('a', { href: '/coin' });
  getCoinsBtn.textContent = 'Get Coins';
  const getAppBtn = new MockElement('a', { href: '/download' });
  getAppBtn.textContent = 'Get App';
  const profileBtn = new MockElement('a', { href: '/@user' });
  profileBtn.textContent = 'Profile';

  headerRight.appendChild(getCoinsBtn);
  headerRight.appendChild(getAppBtn);
  headerRight.appendChild(profileBtn);

  mod.cleanHeaderPromos(headerRight);
  assert.equal(getCoinsBtn.classList.has('itz-hidden-header-promo'), true);
  assert.equal(getAppBtn.classList.has('itz-hidden-header-promo'), true);
  assert.equal(profileBtn.classList.has('itz-hidden-header-promo'), false, 'Profile must NOT be hidden');

  await mod.disable();
  assert.equal(mod.enabled, false);
});

test('BackgroundActivityModule pauses CSS animations when tab is hidden', async () => {
  const mockDoc = new MockDocument();
  mockDoc.addEventListener = () => {};
  mockDoc.removeEventListener = () => {};
  globalThis.document = mockDoc;
  globalThis.document.hidden = true;

  const mod = new BackgroundActivityModule();
  await mod.init({ backgroundOptions: { throttleWhenHidden: true } });
  await mod.enable({ backgroundOptions: { throttleWhenHidden: true } });

  const styleEl = mockDoc.getElementById(`itz-opt-style-${mod.styleId}`);
  assert.ok(styleEl);
  assert.ok(styleEl.textContent.includes('animation-play-state: paused'));

  // When tab is visible
  globalThis.document.hidden = false;
  mod.handleTabVisible();
  assert.equal(mockDoc.getElementById(`itz-opt-style-${mod.styleId}`), null);

  await mod.disable();
  assert.equal(mod.enabled, false);
});
