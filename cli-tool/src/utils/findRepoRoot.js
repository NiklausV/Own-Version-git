// cli-tool/src/utils/findRepoRoot.js
import fs from 'fs';
import path from 'path';

export function findRepoRoot(startDir = process.cwd()) {
  function search(dir) {
    const possibleRepo = path.join(dir, '.mygit');
    if (fs.existsSync(possibleRepo)) return possibleRepo;

    // Search inside subdirectories (one level deep)
    for (const sub of fs.readdirSync(dir)) {
      const subPath = path.join(dir, sub);
      if (fs.statSync(subPath).isDirectory()) {
        const found = search(subPath);
        if (found) return found;
      }
    }
    return null;
  }

  const result = search(startDir);
  if (!result) throw new Error('No .mygit repository found in this directory or any parent directory');
  return result;
}
