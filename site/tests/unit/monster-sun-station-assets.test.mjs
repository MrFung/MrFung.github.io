import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ASSET_DIRECTORY = new URL('../../public/assets/img/monster-sun-station-design/', import.meta.url);
const ASSET_PATH = fileURLToPath(ASSET_DIRECTORY);
const DRAWING_NAMES = Array.from({ length: 13 }, (_, index) => `drawing-${String(index + 1).padStart(2, '0')}`);
const RENDER_NAMES = [
  'render-cafe',
  'render-overall',
  'render-lounge',
  'render-exhibition',
  'render-project-office',
  'render-door-a',
  'render-door-b',
  'render-front-hall',
  'render-meeting-room',
  'render-office-street',
  'render-office-balcony',
  'render-facade-arches',
  'render-facade-main',
];

test('final design responsive image set is complete', async () => {
  const files = new Set(await readdir(ASSET_DIRECTORY));

  for (const name of DRAWING_NAMES) {
    assert(files.has(`${name}-640.webp`), `${name} 缺少640像素预览`);
    assert(files.has(`${name}-1200.webp`), `${name} 缺少1200像素预览`);
    assert(files.has(`${name}-640.avif`), `${name} 缺少640像素AVIF预览`);
    assert(files.has(`${name}-1200.avif`), `${name} 缺少1200像素AVIF预览`);
    assert(files.has(`${name}-full.png`), `${name} 缺少原尺寸图纸`);
  }

  for (const name of RENDER_NAMES) {
    assert(files.has(`${name}-640.webp`), `${name} 缺少640像素预览`);
    assert(files.has(`${name}-1200.webp`), `${name} 缺少1200像素预览`);
    assert(files.has(`${name}-1800.webp`), `${name} 缺少大图`);
    assert(files.has(`${name}-640.avif`), `${name} 缺少640像素AVIF预览`);
    assert(files.has(`${name}-1200.avif`), `${name} 缺少1200像素AVIF预览`);
    assert(files.has(`${name}-1800.avif`), `${name} 缺少1800像素AVIF预览`);
  }
});

test('responsive previews stay within the page image budget', async () => {
  const files = (await readdir(ASSET_DIRECTORY)).filter((file) => file.endsWith('.webp'));
  let totalBytes = 0;

  for (const file of files) {
    const fileSize = (await stat(join(ASSET_PATH, file))).size;
    totalBytes += fileSize;
    assert(fileSize < 450_000, `${file} 超过450KB：${fileSize}`);
  }

  assert(totalBytes < 8_000_000, `WebP资源总量超过8MB：${totalBytes}`);
});

test('AVIF preview set is smaller than the WebP fallback set', async () => {
  const files = await readdir(ASSET_DIRECTORY);
  const responsiveFiles = files.filter((file) => /-(640|1200|1800)\.(avif|webp)$/.test(file));
  let avifBytes = 0;
  let webpBytes = 0;

  for (const file of responsiveFiles) {
    const fileSize = (await stat(join(ASSET_PATH, file))).size;
    if (file.endsWith('.avif')) avifBytes += fileSize;
    if (file.endsWith('.webp')) webpBytes += fileSize;
  }

  assert(avifBytes < webpBytes, `AVIF资源未小于WebP回退资源：${avifBytes} >= ${webpBytes}`);
});
