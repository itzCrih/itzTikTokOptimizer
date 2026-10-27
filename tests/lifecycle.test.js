import test from 'node:test';
import assert from 'node:assert/strict';
import { BaseModule, LifecycleManager } from '../src/content/lifecycle.js';

class TestModule extends BaseModule {
  constructor(id, name) {
    super(id, name);
    this.enabledCount = 0;
    this.disabledCount = 0;
    this.lastRoute = null;
  }

  async onEnable(settings) {
    this.enabledCount++;
  }

  async onDisable() {
    this.disabledCount++;
  }

  onNavigate(routeInfo) {
    this.lastRoute = routeInfo.route;
  }
}

class FaultyModule extends BaseModule {
  constructor() {
    super('faultyMod', 'Faulty Module');
  }

  async onEnable() {
    throw new Error('Simulated module initialization error');
  }
}

test('LifecycleManager registration and enable/disable flow', async () => {
  const manager = new LifecycleManager();
  const modA = new TestModule('modA', 'Module A');
  const modB = new TestModule('modB', 'Module B');

  manager.register(modA).register(modB);

  // 1. Initial settings: modA is true, modB is false
  const initialSettings = {
    masterEnabled: true,
    modA: true,
    modB: false
  };

  await manager.initAll(initialSettings);
  assert.equal(modA.enabled, true);
  assert.equal(modA.enabledCount, 1);
  assert.equal(modB.enabled, false);
  assert.equal(modB.enabledCount, 0);

  // 2. Navigation dispatch
  manager.notifyNavigation({ route: 'messages', pathname: '/messages' });
  assert.equal(modA.lastRoute, 'messages');
  assert.equal(modB.lastRoute, null); // Disabled modules don't receive nav events

  // 3. Disable Master Switch
  await manager.syncSettings({
    masterEnabled: false,
    modA: true,
    modB: true
  });
  assert.equal(modA.enabled, false);
  assert.equal(modA.disabledCount, 1);
  assert.equal(modB.enabled, false);

  // 4. Re-enable Master Switch
  await manager.syncSettings({
    masterEnabled: true,
    modA: true,
    modB: true
  });
  assert.equal(modA.enabled, true);
  assert.equal(modA.enabledCount, 2);
  assert.equal(modB.enabled, true);
  assert.equal(modB.enabledCount, 1);
});

test('LifecycleManager error boundary isolates individual module failure', async () => {
  const manager = new LifecycleManager();
  const faulty = new FaultyModule();
  const stable = new TestModule('stable', 'Stable Module');

  manager.register(faulty).register(stable);

  // Faulty module throws, but stable module must still enable properly!
  await manager.initAll({
    masterEnabled: true,
    faultyMod: true,
    stable: true
  });

  assert.equal(stable.enabled, true);
  assert.equal(stable.enabledCount, 1);
});
