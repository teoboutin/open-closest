import * as path from 'path';
import * as fs from 'fs';

export function findClosest(startDir: string, filename: string, stopAt: string | undefined, excludePath?: string): string | undefined {
  let dir = path.resolve(startDir);
  const fsRoot = path.parse(dir).root;
  const stopAtNorm = stopAt ? path.resolve(stopAt) : undefined;

  while (true) {
    const candidate = path.join(dir, filename);
    try {
      if (fs.statSync(candidate).isFile() && candidate !== excludePath) return candidate;
    } catch { /* not present, keep walking */ }

    if (stopAtNorm && dir === stopAtNorm) return undefined;
    if (dir === fsRoot) return undefined;
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}
