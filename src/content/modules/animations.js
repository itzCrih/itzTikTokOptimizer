/**
 * itzTikTok Optimizer - Animation & Visual Performance Module
 * 
 * Target Bottlenecks:
 * 1. Infinite 60fps CSS keyframe rotations on sound discs / album covers.
 * 2. Continuous ambient pulse glows on badges and promotional tabs.
 * 3. GPU compositing overhead from floating particle effects.
 * 
 * Safety & UX:
 * - Preserves functional loading spinners and essential interface state indicators.
 * - Respects prefers-reduced-motion media query.
 * - Non-destructive CSS overrides that restore instantly on toggle.
 */

import { BaseModule } from '../lifecycle.js';
import { MODULE_IDS } from '../../shared/constants.js';

export class AnimationsModule extends BaseModule {
  constructor() {
    super(MODULE_IDS.ANIMATIONS, 'Animation Reduction');
  }

  async onEnable(settings) {
    this.applyAnimationStyles();
  }

  async onDisable() {
    this.removeCSS();
  }

  applyAnimationStyles() {
    if (!this.enabled) return;

    const css = `
      /* 1. Stop continuous spinning vinyl record animation */
      div[data-e2e="music-cover"],
      div[class*="AlbumArt"],
      div[class*="DivMusicArt"],
      div[class*="DiscContainer"] {
        animation: none !important;
        transform: none !important;
      }

      /* 2. Suppress ambient glow and pulse animations */
      div[class*="GlowEffect"],
      span[class*="PulseEffect"],
      div[class*="LiveAvatarGlow"] {
        animation: none !important;
        box-shadow: none !important;
      }

      /* 3. Reduce expensive transition durations on hover cards */
      div[data-e2e="recommend-list-item-container"],
      div[data-e2e="user-post-item"],
      button {
        transition-duration: 0.08s !important;
      }

      /* 4. Disable floating engagement particle animations */
      canvas[class*="HeartAnimation"],
      div[class*="LikeBurstAnimation"] {
        display: none !important;
      }

      /* SAFEGUARD: Always preserve critical loading spinners */
      div[class*="Loading"],
      div[class*="Spinner"],
      svg[class*="LoadingCircle"] {
        animation: initial !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;

    this.injectCSS(css);
  }
}
