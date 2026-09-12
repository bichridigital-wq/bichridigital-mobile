import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const helperUrl = new URL('../constants/emission-covers.ts', import.meta.url);
const source = readFileSync(helperUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function loadHelper(requireAsset) {
  const exports = {};
  runInNewContext(compiled, { exports, require: requireAsset });
  return exports.getEmissionCoverSource;
}

test('all nine catalogue slugs resolve to their corresponding local image assets', () => {
  const catalogueSource = readFileSync(new URL('../constants/emissions-content.ts', import.meta.url), 'utf8');
  const catalogue = {};
  runInNewContext(ts.transpileModule(catalogueSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports: catalogue });
  const expectedCovers = {
    'li-ci-biir-ndiagne': 'li-ci-biir-ndiagne.png',
    'jotaayu-bichri': 'jotaayu-bichri.png',
    'talaatay-cheikh-ibra': 'talaatay-cheikh-ibra.png',
    'firi-gent': 'firi-gent.png',
    'ettu-jigeen-ni': 'ettu-jigeen-ni.png',
    'seen-wergu-yaram': 'seen-wer-gu-yaram.png',
    'xam-ndiagne-jotna': 'xam-ndiagne-jotna.png',
    'ettu-sport': 'ettu-sport.png',
    'gattandu-magal': 'gattandu-maggal.png',
  };
  const assetIds = new Map();
  const getCover = loadHelper((path) => {
    const bytes = readFileSync(new URL(path, helperUrl));
    const isJpeg = bytes.readUInt16BE(0) === 0xffd8;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    assert.ok(isJpeg || isPng, 'Cover must contain a JPEG or PNG image');
    const assetId = assetIds.size + 1; // Metro asset registry ID on native.
    assetIds.set(path, assetId);
    return assetId;
  });
  assert.equal(assetIds.size, Object.keys(expectedCovers).length);
  for (const [slug, filename] of Object.entries(expectedCovers)) {
    assert.ok(catalogue.getEmissionBySlug(slug), `${slug} must exist in the catalogue`);
    const assetId = assetIds.get(`../assets/images/program-covers/${filename}`);
    assert.ok(assetId, `${filename} must be bundled`);
    assert.equal(getCover(slug), assetId, `${slug} must resolve to ${filename}`);
  }
  for (const emission of catalogue.emissions) {
    if (!Object.hasOwn(expectedCovers, emission.slug)) {
      assert.equal(getCover(emission.slug), undefined, `${emission.slug} must keep its fallback`);
    }
  }
});

test('uncovered and unknown slugs keep the fallback, including object keys', () => {
  const getCover = loadHelper(() => 42);
  for (const slug of ['apres-ndogou', 'unknown', '', 'constructor', '__proto__']) {
    assert.equal(getCover(slug), undefined);
  }
});

test('missing static asset raises a resolution error instead of hiding it', () => {
  const resolve = createRequire(helperUrl).resolve;
  assert.throws(
    () => loadHelper((path) => resolve(`${path}.missing`)),
    { code: 'MODULE_NOT_FOUND', message: /li-ci-biir-ndiagne\.png/ },
  );
});
