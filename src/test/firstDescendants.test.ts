import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { pruneToFirstDescendants } from '../firstDescendants';

test('empty input yields empty output', () => {
  assert.deepEqual(pruneToFirstDescendants([]), []);
});

test('single direct child is kept as-is', () => {
  assert.deepEqual(
    pruneToFirstDescendants(['CMakeLists.txt']),
    ['CMakeLists.txt'],
  );
});

test('three-level pruning keeps only the shallowest', () => {
  assert.deepEqual(
    pruneToFirstDescendants(['a/F', 'a/b/F', 'a/b/c/F']),
    ['a/F'],
  );
});

test('brief example: subdirA is kept and prunes subdirA/subdirAA', () => {
  assert.deepEqual(
    pruneToFirstDescendants([
      'subdirA/README.md',
      'subdirA/subdirAA/README.md',
      'subdirB/subdirBA/README.md',
    ]),
    ['subdirA/README.md', 'subdirB/subdirBA/README.md'],
  );
});

test('two independent branches are each pruned', () => {
  assert.deepEqual(
    pruneToFirstDescendants(['a/F', 'a/b/F', 'c/d/F', 'c/d/e/F']),
    ['a/F', 'c/d/F'],
  );
});

test('sibling directories do not prune each other', () => {
  assert.deepEqual(
    pruneToFirstDescendants(['a/b/F', 'a/c/F']),
    ['a/b/F', 'a/c/F'],
  );
});

test('depth-1 sibling does not prune deeper matches in other branches', () => {
  assert.deepEqual(
    pruneToFirstDescendants(['CMakeLists.txt', 'a/b/CMakeLists.txt']),
    ['CMakeLists.txt', 'a/b/CMakeLists.txt'],
  );
});

test('output is sorted by depth ASC, then lexicographically', () => {
  assert.deepEqual(
    pruneToFirstDescendants([
      'z/x/README.md',
      'a/README.md',
      'm/README.md',
    ]),
    ['a/README.md', 'm/README.md', 'z/x/README.md'],
  );
});
