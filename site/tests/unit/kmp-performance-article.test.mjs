import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dataUrl = new URL(
  '../../src/content/kmpThreePlatformPerformance.mjs',
  import.meta.url
);

test('KMP article publishes the verified three-platform dataset', async () => {
  const source = await readFile(dataUrl, 'utf8').catch(() => '');

  assert.match(source, /KMP_ARTICLE_META/);
  assert.match(source, /83\.39/);
  assert.match(source, /148\.53/);
  assert.match(source, /137\.43/);
});

test('verified values and final selections stay locked', async () => {
  const article = await import(
    '../../src/content/kmpThreePlatformPerformance.mjs'
  );

  assert.equal(
    article.IOS_RESULTS.find(({ id }) => id === 'c-abi').peakMemoryMiB,
    136.7
  );
  assert.equal(
    article.ANDROID_RESULTS.find(({ id }) => id === 'kmp-jvm').peakPssMiB,
    137.43
  );
  assert.equal(article.HARMONY_RESULTS.cpf.peakPssMiB, 83.39);
  assert.equal(article.HARMONY_RESULTS.cpf.recoveryPssMiB, 45.58);
  assert.equal(article.HARMONY_RESULTS.cpf.maximumBacklog, 0);
  assert.deepEqual(
    article.PLATFORM_SELECTIONS.map(({ platform }) => platform),
    ['Android', 'iOS', 'HarmonyOS']
  );
});

test('bar widths are bounded', async () => {
  const { barPercent } = await import(
    '../../src/content/kmpThreePlatformPerformance.mjs'
  );

  assert.equal(barPercent(25, 100), 25);
  assert.equal(barPercent(150, 100), 100);
  assert.equal(barPercent(-1, 100), 0);
  assert.equal(barPercent(1, 0), 0);
});
