function depth(rel: string): number {
  return rel.split('/').length;
}

function parentDir(rel: string): string {
  const i = rel.lastIndexOf('/');
  return i === -1 ? '' : rel.slice(0, i);
}

function isPrefixDir(prefix: string, dir: string): boolean {
  if (prefix === '') return false;
  if (prefix === dir) return true;
  return dir.startsWith(prefix + '/');
}

export function pruneToFirstDescendants(relPaths: string[]): string[] {
  if (relPaths.length === 0) return [];

  const sorted = [...relPaths].sort((a, b) => {
    const da = depth(a);
    const db = depth(b);
    if (da !== db) return da - db;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  const keptParents: string[] = [];
  const result: string[] = [];

  for (const rel of sorted) {
    const parent = parentDir(rel);
    const pruned = keptParents.some((kp) => isPrefixDir(kp, parent));
    if (pruned) continue;
    result.push(rel);
    keptParents.push(parent);
  }

  return result;
}
