import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  SNOW_FULL_TOWER_COPYRIGHT,
  SNOW_FULL_TOWER_INTERPRETATION,
  SNOW_FULL_TOWER_META,
  SNOW_FULL_TOWER_STANZAS,
} from '../../src/content/snowFullTower.mjs';

const expectedStanzas = [
  [
    '木楼，',
    '独倚栏杆；',
    '远望，',
    '天清地阔，',
    '雪山成片；',
    '仿似世间唯一人，',
    '单手可揽天下。',
  ],
  [
    '蓦然飘雪，',
    '沾了衣，',
    '惹了楼，',
    '白地三千里，',
    '不及念你一缕思绪。',
  ],
  [
    '雪已满楼，',
    '披衣离去，',
    '来日为你再登楼。',
  ],
];
const stylesheetUrl = new URL(
  '../../src/styles/snowFullTower.css',
  import.meta.url
);
const modesStylesheetUrl = new URL(
  '../../src/styles/snowFullTowerModes.css',
  import.meta.url
);

test('锁定雪满楼原诗、署名和日期', () => {
  assert.equal(SNOW_FULL_TOWER_META.title, '雪满楼');
  assert.equal(SNOW_FULL_TOWER_META.author, '郭清枫');
  assert.equal(SNOW_FULL_TOWER_META.createdAt, '2016.12.7');
  assert.equal(
    SNOW_FULL_TOWER_META.path,
    '/writing/snow-full-tower/'
  );
  assert.deepEqual(SNOW_FULL_TOWER_STANZAS, expectedStanzas);
});

test('作品解读保持中性语气', () => {
  const copy = JSON.stringify(SNOW_FULL_TOWER_INTERPRETATION);

  assert.doesNotMatch(
    copy,
    /我的理解|我认为|在我看来|我的推荐/
  );
  assert.equal(SNOW_FULL_TOWER_INTERPRETATION.sections.length, 3);
  assert.equal(
    SNOW_FULL_TOWER_INTERPRETATION.closing,
    '雪满的既是楼，也是一个人的心。'
  );
});

test('版权条款锁定作者权利与授权方式', () => {
  assert.equal(
    SNOW_FULL_TOWER_COPYRIGHT.notice,
    '© 郭清枫。保留所有权利。'
  );
  assert.match(
    SNOW_FULL_TOWER_COPYRIGHT.terms,
    /未经作者事先书面授权/
  );
  assert.match(
    SNOW_FULL_TOWER_COPYRIGHT.terms,
    /人工智能模型训练、语料库或数据集/
  );
  assert.equal(
    SNOW_FULL_TOWER_COPYRIGHT.email,
    'MrFung1231@icloud.com'
  );
});

test('雪花样式包含减少动态效果与打印回退', async () => {
  const stylesheets = await Promise.all([
    readFile(stylesheetUrl, 'utf8'),
    readFile(modesStylesheetUrl, 'utf8'),
  ]);
  const css = stylesheets.join('\n');

  assert.match(
    css,
    /@keyframes snow-full-tower-drift/
  );
  assert.match(
    css,
    /prefers-reduced-motion:\s*reduce/
  );
  assert.match(
    css,
    /\.snow-full-tower__flake\s*\{\s*animation:\s*none/
  );
  assert.match(css, /@media print/);
  assert.doesNotMatch(css, /https?:\/\//);
});
