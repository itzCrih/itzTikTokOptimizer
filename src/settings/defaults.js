/**
 * itzTikTok Optimizer - Settings Defaults
 * Engineered for high-speed TikTok browsing with zero intrusive footprint.
 */

export const DEFAULT_SETTINGS = Object.freeze({
  // Master Switch
  masterEnabled: true,

  // A. Messaging Optimization
  // Reduces heavy conversation rendering, offscreen preview recalculations, and layout thrashing
  messagingOptimization: true,
  messagingOptions: {
    virtualizeList: true,         // Apply content-visibility: auto to conversation list items
    deferInboxInit: true,         // Defer expensive DOM layout when not on /messages
    reducePreviewProcessing: true // Prevent forced synchronous layout on message previews
  },

  // B. Notification Optimization
  // Suppresses unrendered notification flyout overhead and continuous badge keyframe animations
  notificationOptimization: true,
  notificationOptions: {
    deferPopoverRender: true,     // Keep closed notification dropdowns lightweight
    suppressBadgeAnimation: true  // Disable continuous pulsing animations on notification badges
  },

  // C. Feed Optimization
  // Accelerates FYP scrolling via CSS containment and virtualized offscreen card management
  feedOptimization: true,
  feedOptions: {
    virtualizeFeed: true,         // content-visibility: auto for offscreen feed items
    containLayout: true,          // contain: layout style paint for feed video containers
    throttleScrollWork: true      // Batch layout reads and prevent scroll hitching
  },

  // D. Live Content Removal
  // Removes LIVE navigation entry, stream cards in FYP, and floating live stream promos
  liveRemoval: true,
  liveOptions: {
    hideNavEntry: true,           // Remove LIVE link in sidebar/header
    suppressFeedCards: true,      // Filter LIVE broadcast cards from feed
    suppressPromos: true          // Hide promotional LIVE carousels and badges
  },

  // E. Short Drama Removal
  // Suppresses promotional short dramas, mini-series hubs, and series feed cards
  dramaRemoval: true,
  dramaOptions: {
    hideSeriesCards: true,        // Suppress mini-drama / short series cards in feed
    hideSeriesNav: true,          // Hide series and drama navigation links
    hideDramaPromos: true         // Suppress promotional drama banners and hubs
  },

  // F. Media Optimization
  // Pauses offscreen video decoding, prevents autoplay on promotional preview elements
  mediaOptimization: true,
  mediaOptions: {
    pauseOffscreenVideo: true,    // Pause decoding of auxiliary videos scrolled out of viewport
    suppressPromoAutoplay: true   // Do not autoplay background promotional previews
  },

  // G. Animation Reduction
  // Eliminates continuous GPU layer animations (floating hearts, spinning discs, glow effects)
  animationReduction: true,
  animationOptions: {
    reduceDecorative: true,       // Stop spinning discs, ambient glows, canvas hearts
    respectReducedMotion: true    // Honor OS accessibility prefers-reduced-motion
  },

  // H. Interface Cleanup
  // Removes "Get App" desktop banner, QR code app install flyouts, and floating feedback dialogs
  interfaceCleanup: true,
  interfaceOptions: {
    hideAppDownloadBanner: true,  // "Get TikTok for Windows" / app download banner
    hideFloatingFeedback: true,   // Floating feedback and survey widgets
    hideQrCodePrompts: true       // Desktop app QR code popups
  },

  // I. Background Activity Optimization
  // Throttles animations and non-essential DOM processing when TikTok tab is in background
  backgroundActivityOptimization: true,
  backgroundOptions: {
    throttleWhenHidden: true,     // Pause heavy rendering loops when tab is hidden
    pauseMediaOnHidden: false     // Optional: user can enable to pause video on tab switch
  },

  // J. Performance Diagnostics
  // Real-time local metrics on DOM nodes, mutation overhead, and memory (100% private)
  performanceDiagnostics: false,
  diagnosticsOptions: {
    measureMutations: true,
    measureDomNodes: true,
    logToConsole: false
  }
});

/**
 * Returns a deep copy of default settings
 */
export function getDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}
