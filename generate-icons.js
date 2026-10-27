/**
 * Generator for itzTikTok Optimizer PNG & SVG icons
 * Builds authentic itzCrih branded gold & dark obsidian icons.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(len + 12);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, len + 8));
  buf.writeUInt32BE(crc, len + 8);
  return buf;
}

/**
 * Creates a valid RGBA PNG buffer of size x size
 */
function generateBrandedPNG(size) {
  // 1. PNG Header
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // 3. Raw RGBA Pixels
  // Width * 4 channels + 1 filter byte per scanline
  const rowSize = size * 4 + 1;
  const rawData = Buffer.alloc(rowSize * size);

  const radius = size * 0.22;
  const center = size / 2;

  // Colors:
  // Background: #0e1218 (14, 18, 24)
  // Gold accent: #e6b422 (230, 180, 34)
  // Gold bright: #ffdf8c (255, 223, 140)
  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < size; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Rounded rect boundary check
      let inBounds = true;
      const cornerX = Math.min(x, size - 1 - x);
      const cornerY = Math.min(y, size - 1 - y);
      if (cornerX < radius && cornerY < radius) {
        const dx = radius - cornerX;
        const dy = radius - cornerY;
        if (dx * dx + dy * dy > radius * radius) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        // Transparent outside rounded corners
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Draw Chevron pattern (itzCrih signature velocity double chevrons)
      const nx = x / size;
      const ny = y / size;

      // Primary chevron 1: (0.35, 0.25) -> (0.55, 0.5) -> (0.35, 0.75)
      const dist1 = Math.abs(ny - 0.5) - (nx - 0.35);
      const isChevron1 = Math.abs(dist1) < 0.12 && nx >= 0.25 && nx <= 0.65;

      // Chevron 2: (0.55, 0.25) -> (0.75, 0.5) -> (0.55, 0.75)
      const dist2 = Math.abs(ny - 0.5) - (nx - 0.55);
      const isChevron2 = Math.abs(dist2) < 0.08 && nx >= 0.45 && nx <= 0.85;

      if (isChevron2) {
        // Bright secondary gold
        rawData[pixelOffset] = 255;
        rawData[pixelOffset + 1] = 223;
        rawData[pixelOffset + 2] = 140;
        rawData[pixelOffset + 3] = 255;
      } else if (isChevron1) {
        // Primary itzCrih Gold
        rawData[pixelOffset] = 230;
        rawData[pixelOffset + 1] = 180;
        rawData[pixelOffset + 2] = 34;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Dark obsidian background (#0e1218)
        rawData[pixelOffset] = 14;
        rawData[pixelOffset + 1] = 18;
        rawData[pixelOffset + 2] = 24;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  // 4. IDAT Chunk (Deflated)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // 5. IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(process.cwd(), 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG sizes
const sizes = [16, 32, 48, 128];
for (const s of sizes) {
  const buf = generateBrandedPNG(s);
  fs.writeFileSync(path.join(iconsDir, `icon${s}.png`), buf);
  console.log(`Generated icon${s}.png (${buf.length} bytes)`);
}

// Generate SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#0e1218"/>
  <rect x="2" y="2" width="124" height="124" rx="26" fill="none" stroke="#222a35" stroke-width="2"/>
  <path d="M40 32 L72 64 L40 96" stroke="#e6b422" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M68 32 L100 64 L68 96" stroke="#ffdf8c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  <circle cx="72" cy="64" r="5" fill="#ffdf8c"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('Generated icon.svg');
