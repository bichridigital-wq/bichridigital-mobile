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

test('known cover resolves to the existing local image asset', () => {
  const getCover = loadHelper((path) => {
    const bytes = readFileSync(new URL(path, helperUrl));
    const isJpeg = bytes.readUInt16BE(0) === 0xffd8;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    assert.ok(isJpeg || isPng, 'Cover must contain a JPEG or PNG image');
    return 42; // Metro asset registry ID on native.
  });
  assert.equal(getCover('li-ci-biir-ndiagne'), 42);
});

test('uncovered and unknown slugs keep the fallback, including object keys', () => {
  const getCover = loadHelper(() => 42);
  for (const slug of ['jotaayu-bichri', 'unknown', '', 'constructor', '__proto__']) {
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
