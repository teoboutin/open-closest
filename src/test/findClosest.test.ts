import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { findClosest } from '../findClosest';

function makeTree(spec: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'open-closest-test-'));
  for (const [rel, content] of Object.entries(spec)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return fs.realpathSync(root);
}

function cleanup(root: string): void {
  fs.rmSync(root, { recursive: true, force: true });
}

test('returns the file in the start directory when present', (t) => {
  const root = makeTree({ 'a/b/README.md': 'leaf' });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b'), 'README.md', root);
  assert.equal(result, path.join(root, 'a/b/README.md'));
});

test('walks up to the closest ancestor match', (t) => {
  const root = makeTree({
    'README.md': 'top',
    'a/b/c/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b/c'), 'README.md', root);
  assert.equal(result, path.join(root, 'README.md'));
});

test('returns the nearest match when several ancestors have one', (t) => {
  const root = makeTree({
    'README.md': 'top',
    'a/README.md': 'mid',
    'a/b/c/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b/c'), 'README.md', root);
  assert.equal(result, path.join(root, 'a/README.md'));
});

test('returns undefined when no match exists at or below stopAt', (t) => {
  const root = makeTree({ 'a/b/file.ts': 'leaf' });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b'), 'README.md', root);
  assert.equal(result, undefined);
});

test('does not search above stopAt even when a match exists higher', (t) => {
  const root = makeTree({
    'README.md': 'top',
    'a/b/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b'), 'README.md', path.join(root, 'a'));
  assert.equal(result, undefined);
});

test('matches at stopAt itself are returned', (t) => {
  const root = makeTree({
    'a/README.md': 'mid',
    'a/b/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a/b'), 'README.md', path.join(root, 'a'));
  assert.equal(result, path.join(root, 'a/README.md'));
});

test('excludePath skips a match in the start directory and walks up', (t) => {
  const root = makeTree({
    'README.md': 'top',
    'a/README.md': 'mid',
  });
  t.after(() => cleanup(root));

  const result = findClosest(
    path.join(root, 'a'),
    'README.md',
    root,
    path.join(root, 'a/README.md'),
  );
  assert.equal(result, path.join(root, 'README.md'));
});

test('excludePath returns undefined when the only match is excluded and stopAt blocks further walk', (t) => {
  const root = makeTree({ 'a/README.md': 'mid' });
  t.after(() => cleanup(root));

  const result = findClosest(
    path.join(root, 'a'),
    'README.md',
    root,
    path.join(root, 'a/README.md'),
  );
  assert.equal(result, undefined);
});

test('excludePath has no effect when it does not match any candidate', (t) => {
  const root = makeTree({
    'README.md': 'top',
    'a/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(
    path.join(root, 'a'),
    'README.md',
    root,
    path.join(root, 'a/file.ts'),
  );
  assert.equal(result, path.join(root, 'README.md'));
});

test('directories matching the filename are not returned', (t) => {
  const root = makeTree({
    'README.md/.keep': 'directory-not-file',
    'a/file.ts': 'leaf',
  });
  t.after(() => cleanup(root));

  const result = findClosest(path.join(root, 'a'), 'README.md', root);
  assert.equal(result, undefined);
});
