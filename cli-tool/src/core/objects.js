// cli-tool/src/core/objects.js
import fs from 'fs/promises';
import path from 'path';
import { OBJECTS_DIR } from './constants.js';
import { hashContent } from './hash.js';

/**
 * Create a blob object from content
 * @param {string} content - The file content
 * @returns {Promise<string>} The hash of the blob
 */
export async function createBlob(content) {
  const blob = `blob ${content.length}\0${content}`;
  const hash = hashContent(blob);
  
  // Store in objects directory
  const dir = path.join(OBJECTS_DIR, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, blob);
  
  return hash;
}

/**
 * Create a tree object from entries
 * @param {Array} entries - Array of {mode, name, hash}
 * @returns {Promise<string>} The hash of the tree
 */
export async function createTree(entries) {
  // Sort entries by name
  entries.sort((a, b) => a.name.localeCompare(b.name));
  
  // Build tree content
  let content = '';
  for (const entry of entries) {
    content += `${entry.mode} ${entry.name}\0${entry.hash}\n`;
  }
  
  const tree = `tree ${content.length}\0${content}`;
  const hash = hashContent(tree);
  
  // Store in objects directory
  const dir = path.join(OBJECTS_DIR, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, tree);
  
  return hash;
}

/**
 * Create a commit object
 * @param {string} treeHash - Hash of the tree
 * @param {string|null} parentHash - Hash of parent commit
 * @param {string} message - Commit message
 * @param {object} author - Author info {name, email}
 * @returns {Promise<string>} The hash of the commit
 */
export async function createCommit(treeHash, parentHash, message, author) {
  const timestamp = Math.floor(Date.now() / 1000);
  const timezone = '+0000';
  
  let content = `tree ${treeHash}\n`;
  if (parentHash) {
    content += `parent ${parentHash}\n`;
  }
  content += `author ${author.name} <${author.email}> ${timestamp} ${timezone}\n`;
  content += `committer ${author.name} <${author.email}> ${timestamp} ${timezone}\n`;
  content += `\n${message}\n`;
  
  const commit = `commit ${content.length}\0${content}`;
  const hash = hashContent(commit);
  
  // Store in objects directory
  const dir = path.join(OBJECTS_DIR, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, commit);
  
  return hash;
}

/**
 * Read an object from the objects directory
 * @param {string} hash - Object hash
 * @returns {Promise<{type: string, content: string}>}
 */
export async function readObject(hash) {
  const dir = path.join(OBJECTS_DIR, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  const data = await fs.readFile(file, 'utf-8');
  const nullIndex = data.indexOf('\0');
  const header = data.substring(0, nullIndex);
  const content = data.substring(nullIndex + 1);
  
  const [type] = header.split(' ');
  
  return { type, content };
}