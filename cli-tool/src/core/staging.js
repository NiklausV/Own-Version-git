// cli-tool/src/core/staging.js
import fs from 'fs/promises';
import { INDEX_FILE } from './constants.js';

export async function readIndex() {
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { files: {} };
  }
}

export async function writeIndex(index) {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}

export async function addToIndex(filename, hash, mode = '100644') {
  const index = await readIndex();
  const stats = await fs.stat(filename);
  
  index.files[filename] = {
    hash,
    mode,
    size: stats.size,
    mtime: stats.mtime.getTime()
  };
  
  await writeIndex(index);
}

export async function removeFromIndex(filename) {
  const index = await readIndex();
  delete index.files[filename];
  await writeIndex(index);
}

export async function clearIndex() {
  await writeIndex({ files: {} });
}

export async function getStagedFiles() {
  const index = await readIndex();
  return Object.keys(index.files);
}

export async function isFileStaged(filename) {
  const index = await readIndex();
  return filename in index.files;
}

export async function getFileFromIndex(filename) {
  const index = await readIndex();
  return index.files[filename] || null;
}