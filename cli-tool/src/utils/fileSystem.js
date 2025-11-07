// cli-tool/src/utils/fileSystem.js
import fs from 'fs/promises';
import path from 'path';

/**
 * Get all files in the working tree (excluding .mygit and node_modules)
 */
export async function getWorkingTreeFiles(dir = '.', files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip .mygit directory and node_modules
    if (entry.name === '.mygit' || entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await getWorkingTreeFiles(fullPath, files);
    } else if (entry.isFile()) {
      // Normalize path (remove leading ./)
      const normalizedPath = fullPath.replace(/^\.\//, '');
      files.push(normalizedPath);
    }
  }
  
  return files;
}

/**
 * Check if a path exists
 */
export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively create directory
 */
export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Read file content safely
 */
export async function readFileSafe(filePath, encoding = 'utf-8') {
  try {
    return await fs.readFile(filePath, encoding);
  } catch (error) {
    return null;
  }
}

/**
 * Write file with directory creation
 */
export async function writeFileSafe(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

/**
 * Get file stats
 */
export async function getFileStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * Check if path is a directory
 */
export async function isDirectory(filePath) {
  const stats = await getFileStats(filePath);
  return stats?.isDirectory() || false;
}

/**
 * Get relative path from cwd
 */
export function getRelativePath(filePath) {
  return path.relative(process.cwd(), filePath);
}

/**
 * Normalize file paths (consistent forward slashes)
 */
export function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * Get all files matching a pattern
 */
export async function glob(pattern, dir = '.') {
  const files = await getWorkingTreeFiles(dir);
  
  if (pattern === '.') {
    return files;
  }
  
  // Simple glob matching (supports * wildcard)
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  
  return files.filter(file => regex.test(file));
}

/**
 * Compare two file contents
 */
export async function filesAreEqual(path1, path2) {
  try {
    const content1 = await fs.readFile(path1, 'utf-8');
    const content2 = await fs.readFile(path2, 'utf-8');
    return content1 === content2;
  } catch {
    return false;
  }
}

/**
 * Copy file
 */
export async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

/**
 * Remove file or directory
 */
export async function remove(targetPath) {
  const stats = await getFileStats(targetPath);
  
  if (!stats) return;
  
  if (stats.isDirectory()) {
    await fs.rm(targetPath, { recursive: true, force: true });
  } else {
    await fs.unlink(targetPath);
  }
}