/**
 * itzTikTok Optimizer - Popup Interface Controller
 * High-performance, zero-framework reactive UI for extension configuration.
 */

import {
  getSettings,
  setMasterEnabled,
  setModuleEnabled,
  enableAllModules,
  disableAllModules,
  onSettingsChanged
} from '../settings/storage.js';
import { MODULE_IDS, MESSAGE_TYPES } from '../shared/constants.js';
import { sendToActiveTikTokTab, broadcastToTikTokTabs } from '../shared/messaging.js';

let currentSettings = null;
let lastDiagnosticsReport = null;

// DOM Elements
const masterToggle = document.getElementById('masterToggle');
const masterCard = document.getElementById('masterCard');
const masterDesc = document.getElementById('masterDesc');
const btnEnableAll = document.getElementById('btnEnableAll');
const btnDisableAll = document.getElementById('btnDisableAll');
const btnToggleDiagnostics = document.getElementById('btnToggleDiagnostics');
const tabModules = document.getElementById('tabModules');
const tabDiagnostics = document.getElementById('tabDiagnostics');
const modulesView = document.getElementById('modulesView');
const diagnosticsView = document.getElementById('diagnosticsView');
const pageStatusBadge = document.getElementById('pageStatusBadge');
const statusLabelText = document.getElementById('statusLabelText');

// Diagnostics elements
const diagDomNodes = document.getElementById('diagDomNodes');
const diagDomStatus = document.getElementById('diagDomStatus');
const diagHeapMemory = document.getElementById('diagHeapMemory');
const diagHeapLimit = document.getElementById('diagHeapLimit');
const diagActiveObservers = document.getElementById('diagActiveObservers');
const diagActiveListeners = document.getElementById('diagActiveListeners');
const diagActiveRoute = document.getElementById('diagActiveRoute');
const diagRawLog = document.getElementById('diagRawLog');
const btnRefreshDiagnostics = document.getElementById('btnRefreshDiagnostics');
const btnCopyDiagnostics = document.getElementById('btnCopyDiagnostics');

async function init() {
  currentSettings = await getSettings();
  renderSettings(currentSettings);
  checkActivePage();
  setupEventListeners();

  // Listen for storage changes from background or other tabs
  onSettingsChanged((newSettings) => {
    currentSettings = newSettings;
    renderSettings(newSettings);
  });
}

/**
 * Checks whether current active tab is TikTok
 */
async function checkActivePage() {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.query) {
    updatePageStatus(false, 'Local Test');
    return;
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0] && tabs[0].url) {
      const isTikTok = tabs[0].url.includes('tiktok.com');
      if (isTikTok) {
        updatePageStatus(true, 'TikTok Active');
      } else {
        updatePageStatus(false, 'Inactive (Not TikTok)');
      }
    }
  } catch (e) {
    updatePageStatus(false, 'Ready');
  }
}

function updatePageStatus(isActive, label) {
  if (isActive) {
    pageStatusBadge.className = 'page-status active';
  } else {
    pageStatusBadge.className = 'page-status inactive';
  }
  statusLabelText.textContent = label;
}

/**
 * Renders settings state onto all UI switches
 */
function renderSettings(settings) {
  if (!settings) return;

  const isMaster = !!settings.masterEnabled;
  masterToggle.checked = isMaster;

  if (isMaster) {
    masterCard.classList.remove('disabled');
    masterDesc.textContent = 'Engine active: Enhancing TikTok responsiveness';
  } else {
    masterCard.classList.add('disabled');
    masterDesc.textContent = 'All optimizations paused (Default TikTok behavior)';
  }

  // Update module toggles and cards
  for (const modId of Object.values(MODULE_IDS)) {
    const toggleEl = document.getElementById(`toggle-${modId}`);
    const cardEl = document.querySelector(`.module-card[data-module="${modId}"]`);

    if (toggleEl) {
      toggleEl.checked = !!settings[modId];
    }

    if (cardEl) {
      if (!isMaster) {
        cardEl.classList.add('disabled');
      } else {
        cardEl.classList.remove('disabled');
        if (settings[modId]) {
          cardEl.classList.add('active');
        } else {
          cardEl.classList.remove('active');
        }
      }
    }
  }
}

/**
 * Broadcasts settings update to open TikTok tabs
 */
async function notifyTabs() {
  await broadcastToTikTokTabs({
    type: MESSAGE_TYPES.SETTINGS_UPDATED,
    settings: currentSettings
  });
}

function setupEventListeners() {
  // Master Switch
  masterToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    currentSettings = await setMasterEnabled(enabled);
    renderSettings(currentSettings);
    await notifyTabs();
  });

  // Module switches
  for (const modId of Object.values(MODULE_IDS)) {
    const toggleEl = document.getElementById(`toggle-${modId}`);
    if (toggleEl) {
      toggleEl.addEventListener('change', async (e) => {
        const checked = e.target.checked;
        currentSettings = await setModuleEnabled(modId, checked);
        renderSettings(currentSettings);
        await notifyTabs();
      });
    }
  }

  // Global Enable All
  btnEnableAll.addEventListener('click', async () => {
    currentSettings = await enableAllModules();
    renderSettings(currentSettings);
    await notifyTabs();
  });

  // Global Disable All
  btnDisableAll.addEventListener('click', async () => {
    currentSettings = await disableAllModules();
    renderSettings(currentSettings);
    await notifyTabs();
  });

  // Tab Navigation
  tabModules.addEventListener('click', () => {
    tabModules.classList.add('active');
    tabDiagnostics.classList.remove('active');
    modulesView.classList.remove('hidden');
    diagnosticsView.classList.add('hidden');
  });

  tabDiagnostics.addEventListener('click', () => {
    tabDiagnostics.classList.add('active');
    tabModules.classList.remove('active');
    diagnosticsView.classList.remove('hidden');
    modulesView.classList.add('hidden');
    fetchLiveDiagnostics();
  });

  btnToggleDiagnostics.addEventListener('click', () => {
    tabDiagnostics.click();
  });

  // Diagnostics actions
  btnRefreshDiagnostics.addEventListener('click', fetchLiveDiagnostics);

  btnCopyDiagnostics.addEventListener('click', () => {
    if (!lastDiagnosticsReport) return;
    navigator.clipboard.writeText(JSON.stringify(lastDiagnosticsReport, null, 2))
      .then(() => {
        const origText = btnCopyDiagnostics.textContent;
        btnCopyDiagnostics.textContent = 'Copied!';
        setTimeout(() => {
          btnCopyDiagnostics.textContent = origText;
        }, 1500);
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
      });
  });
}

/**
 * Fetches live performance report from the active TikTok tab
 */
async function fetchLiveDiagnostics() {
  diagRawLog.textContent = 'Querying active TikTok tab for diagnostics telemetry...';

  const result = await sendToActiveTikTokTab({ type: MESSAGE_TYPES.GET_DIAGNOSTICS });

  if (result.success && result.response && result.response.diagnostics) {
    const diag = result.response.diagnostics;
    lastDiagnosticsReport = diag;

    // Render Metrics
    diagDomNodes.textContent = diag.dom.totalNodes;
    diagDomStatus.textContent = diag.dom.status;

    if (diag.memory) {
      diagHeapMemory.textContent = `${diag.memory.usedHeapMB} MB`;
      diagHeapLimit.textContent = `${diag.memory.heapLimitMB} MB limit`;
    } else {
      diagHeapMemory.textContent = 'N/A';
      diagHeapLimit.textContent = 'Not exposed by engine';
    }

    diagActiveObservers.textContent = diag.optimizerStats.totalActiveObservers;
    diagActiveListeners.textContent = diag.optimizerStats.totalActiveListeners;
    diagActiveRoute.textContent = diag.url || 'Home Feed (/)';

    diagRawLog.textContent = JSON.stringify(diag, null, 2);
  } else {
    // If not on TikTok or content script not yet injected
    diagDomNodes.textContent = '--';
    diagDomStatus.textContent = result.isTikTok === false ? 'Not on TikTok' : 'Content script connecting...';
    diagHeapMemory.textContent = '--';
    diagHeapLimit.textContent = '--';
    diagActiveObservers.textContent = '--';
    diagActiveListeners.textContent = '--';
    diagActiveRoute.textContent = '--';

    const fallbackReport = {
      note: 'Diagnostics telemetry is accessible while viewing a TikTok tab.',
      status: result.error || 'Open TikTok and click Refresh to view live metrics.'
    };
    lastDiagnosticsReport = fallbackReport;
    diagRawLog.textContent = JSON.stringify(fallbackReport, null, 2);
  }
}

document.addEventListener('DOMContentLoaded', init);
