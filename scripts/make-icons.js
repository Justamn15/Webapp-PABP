import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const toCrc = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(toCrc), 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw RGBA scanlines: 1 filter byte + width*4 bytes per scanline
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const rCorner = isMaskable ? 0 : width * 0.22;

  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // filter byte: none

    for (let x = 0; x < width; x++) {
      // Rounded rect check if not maskable
      let inCard = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - rCorner));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - rCorner));
        if (dx * dx + dy * dy > rCorner * rCorner) {
          inCard = false;
        }
      }

      if (!inCard) {
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        scanlines[offset++] = 0;
        continue;
      }

      // Base background gradient: Indigo #4338ca to #312e81
      const gradT = (x + y) / (width + height);
      let r = Math.round(67 * (1 - gradT) + 49 * gradT);
      let g = Math.round(56 * (1 - gradT) + 46 * gradT);
      let b = Math.round(202 * (1 - gradT) + 129 * gradT);
      let a = 255;

      // Draw stylized Graduation Cap in center
      // Mortarboard polygon: top peak (cx, cy - 0.2*h), right (cx + 0.3*w, cy - 0.08*h), bottom (cx, cy + 0.05*h), left (cx - 0.3*w, cy - 0.08*h)
      const topY = cy - height * 0.22;
      const botY = cy + height * 0.03;
      const leftX = cx - width * 0.32;
      const rightX = cx + width * 0.32;
      const midY = (topY + botY) / 2;

      // Inside mortarboard rhombus check
      const d1 = Math.abs(x - cx) / (width * 0.32);
      const d2 = Math.abs(y - midY) / ((botY - topY) / 2);
      if (d1 + d2 <= 1.0) {
        // White mortarboard
        r = 255; g = 255; b = 255;
      }

      // Skull cap underneath
      if (x >= cx - width * 0.16 && x <= cx + width * 0.16 && y >= midY && y <= cy + height * 0.18) {
        r = 224; g = 231; b = 255;
      }

      // Open book in lower half
      const bookY = cy + height * 0.20;
      const bookH = height * 0.14;
      if (y >= bookY && y <= bookY + bookH) {
        if ((x >= cx - width * 0.28 && x <= cx - width * 0.02) || (x >= cx + width * 0.02 && x <= cx + width * 0.28)) {
          r = 255; g = 255; b = 255;
        }
      }

      // Gold center star / tassel button
      const distFromCenter = Math.hypot(x - cx, y - (midY - height * 0.02));
      if (distFromCenter <= width * 0.035) {
        r = 251; g = 191; b = 36; // Amber gold #fbbf24
      }

      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', generatePNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePNG(180, 180, false));

console.log('Successfully generated all PWA PNG icons in public/ directory!');
