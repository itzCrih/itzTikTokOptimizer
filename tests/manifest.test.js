import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Manifest V3 Compliance & Integrity', () => {
  const manifestPath = path.join(process.cwd(), 'dist', 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'dist/manifest.json must exist');

  const content = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(content);

  // 1. Manifest version
  assert.equal(manifest.manifest_version, 3, 'Must be Manifest V3');

  // 2. Name & Version
  assert.equal(manifest.name, 'itzTikTok Optimizer');
  assert.ok(manifest.version, 'Must define a version string');

  // 3. Minimum permissions
  assert.deepEqual(manifest.permissions, ['storage'], 'Must only request minimal storage permission');
  assert.deepEqual(
    manifest.host_permissions,
    ['*://*.tiktok.com/*'],
    'Must scope host permissions strictly to tiktok.com'
  );

  // 4. Icons verification on disk
  for (const [size, iconPath] of Object.entries(manifest.icons)) {
    const fullPath = path.join(process.cwd(), 'dist', iconPath);
    assert.ok(fs.existsSync(fullPath), `Icon ${size} (${iconPath}) must exist in dist`);
  }

  // 5. Background Service Worker verification
  assert.ok(manifest.background, 'Background configuration must exist');
  assert.equal(manifest.background.type, 'module');
  const swPath = path.join(process.cwd(), 'dist', manifest.background.service_worker);
  assert.ok(fs.existsSync(swPath), `Service worker ${manifest.background.service_worker} must exist in dist`);

  // 6. Content Script verification
  assert.ok(manifest.content_scripts && manifest.content_scripts.length > 0);
  const cs = manifest.content_scripts[0];
  assert.deepEqual(cs.matches, ['*://*.tiktok.com/*']);
  assert.equal(cs.run_at, 'document_start');
  for (const script of cs.js) {
    const csPath = path.join(process.cwd(), 'dist', script);
    assert.ok(fs.existsSync(csPath), `Content script ${script} must exist in dist`);
  }

  // 7. Popup files verification
  assert.ok(manifest.action && manifest.action.default_popup);
  const popupHtmlPath = path.join(process.cwd(), 'dist', manifest.action.default_popup);
  assert.ok(fs.existsSync(popupHtmlPath), 'Popup HTML must exist in dist');
});
