/**
 * itzTikTok Optimizer - Production Build Script
 * Bundles ES modules via esbuild and outputs a clean, installable unpacked Chrome extension to dist/.
 */

import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const isWatch = process.argv.includes('--watch');
const distDir = path.join(process.cwd(), 'dist');

// Clean and recreate dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'content'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'background'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'popup'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'icons'), { recursive: true });

// Copy icons
const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png', 'icon.svg'];
for (const icon of iconFiles) {
  const srcIcon = path.join(process.cwd(), 'icons', icon);
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, path.join(distDir, 'icons', icon));
  }
}

// Copy HTML and CSS
fs.copyFileSync(
  path.join(process.cwd(), 'src', 'popup', 'popup.html'),
  path.join(distDir, 'popup', 'popup.html')
);
fs.copyFileSync(
  path.join(process.cwd(), 'src', 'popup', 'popup.css'),
  path.join(distDir, 'popup', 'popup.css')
);

// Copy Manifest
fs.copyFileSync(
  path.join(process.cwd(), 'src', 'manifest.json'),
  path.join(distDir, 'manifest.json')
);
// Also copy to root for developers who load the root directory directly
fs.copyFileSync(
  path.join(process.cwd(), 'src', 'manifest.json'),
  path.join(process.cwd(), 'manifest.json')
);

const buildConfigs = [
  // 1. Page Interceptor Bundle (runs in MAIN world at document_start for zero-flicker title and request interception)
  {
    entryPoints: [path.join(process.cwd(), 'src', 'content', 'page-interceptor.js')],
    outfile: path.join(distDir, 'content', 'page-interceptor.bundle.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome110'],
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    logLevel: 'info'
  },
  // 2. Content Script Bundle (IIFE format for universal MV3 content script compatibility)
  {
    entryPoints: [path.join(process.cwd(), 'src', 'content', 'entry.js')],
    outfile: path.join(distDir, 'content', 'content.bundle.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome110'],
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    logLevel: 'info'
  },
  // 3. Background Service Worker (ESM format for MV3 background module)
  {
    entryPoints: [path.join(process.cwd(), 'src', 'background', 'service-worker.js')],
    outfile: path.join(distDir, 'background', 'service-worker.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['chrome110'],
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    logLevel: 'info'
  },
  // 4. Popup Controller Bundle
  {
    entryPoints: [path.join(process.cwd(), 'src', 'popup', 'popup.js')],
    outfile: path.join(distDir, 'popup', 'popup.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['chrome110'],
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    logLevel: 'info'
  }
];

async function runBuild() {
  console.log('Building itzTikTok Optimizer for Chrome Manifest V3...');
  try {
    for (const config of buildConfigs) {
      if (isWatch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
      } else {
        await esbuild.build(config);
      }
    }
    console.log('Extension build completed successfully. Artifacts placed in /dist.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

runBuild();
