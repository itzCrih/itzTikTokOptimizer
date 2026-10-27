import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, getDefaultSettings } from '../src/settings/defaults.js';
import {
  mergeSettings,
  getSettings,
  saveSettings,
  setMasterEnabled,
  setModuleEnabled,
  enableAllModules,
  disableAllModules,
  resetToDefaults
} from '../src/settings/storage.js';
import { MODULE_IDS } from '../src/shared/constants.js';
import { createMockChromeStorage } from './setup.js';

test('Settings Defaults Integrity', () => {
  const defaults = getDefaultSettings();
  assert.equal(defaults.masterEnabled, true);

  // All 10 modules must have defined default toggles
  for (const modId of Object.values(MODULE_IDS)) {
    assert.ok(defaults[modId] !== undefined, `Module ${modId} must have default setting`);
  }
});

test('mergeSettings deep merge handles corrupt or partial states', () => {
  const defaults = getDefaultSettings();

  // Test empty loaded state
  const merged1 = mergeSettings(defaults, null);
  assert.equal(merged1.masterEnabled, true);
  assert.equal(merged1.messagingOptimization, true);

  // Test partial override
  const partial = {
    masterEnabled: false,
    messagingOptions: {
      virtualizeList: false
    }
  };
  const merged2 = mergeSettings(defaults, partial);
  assert.equal(merged2.masterEnabled, false);
  assert.equal(merged2.messagingOptions.virtualizeList, false);
  // Unset sub-options must retain default values
  assert.equal(merged2.messagingOptions.deferInboxInit, true);
  assert.equal(merged2.liveRemoval, true);
});

test('Storage Operations with Chrome Mock', async () => {
  // Setup global mock
  globalThis.chrome = {
    storage: createMockChromeStorage()
  };

  // 1. Initial getSettings returns defaults
  const s1 = await getSettings();
  assert.equal(s1.masterEnabled, true);

  // 2. Set master disabled
  const s2 = await setMasterEnabled(false);
  assert.equal(s2.masterEnabled, false);
  // Verify individual modules are still true in user config
  assert.equal(s2.messagingOptimization, true);

  // 3. Set individual module toggle
  const s3 = await setModuleEnabled(MODULE_IDS.LIVE_REMOVAL, false);
  assert.equal(s3[MODULE_IDS.LIVE_REMOVAL], false);

  // 4. Enable All
  const s4 = await enableAllModules();
  assert.equal(s4.masterEnabled, true);
  assert.equal(s4[MODULE_IDS.MESSAGING], true);
  assert.equal(s4[MODULE_IDS.FEED], true);
  assert.equal(s4[MODULE_IDS.LIVE_REMOVAL], true);

  // 5. Disable All
  const s5 = await disableAllModules();
  for (const modId of Object.values(MODULE_IDS)) {
    assert.equal(s5[modId], false, `Module ${modId} should be disabled`);
  }

  // 6. Reset to Defaults
  const s6 = await resetToDefaults();
  assert.equal(s6.masterEnabled, true);
  assert.equal(s6[MODULE_IDS.LIVE_REMOVAL], true);
});
