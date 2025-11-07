// cli-tool/src/commands/commit.js
import fs from 'fs/promises';
import path from 'path';
import { INDEX_FILE, HEAD_FILE, CONFIG_FILE, MYGIT_DIR } from '../core/constants.js';
import { createTree, createCommit } from '../core/objects.js';

export async function commitCommand(message) {
  // Read staging area
  let index;
  try {
    const indexContent = await fs.readFile(INDEX_FILE, 'utf-8');
    index = JSON.parse(indexContent);
  } catch (error) {
    throw new Error('Cannot read index file. Make sure you\'re in a mygit repository.');
  }
  
  if (!index.files || Object.keys(index.files).length === 0) {
    throw new Error('Nothing to commit');
  }
  
  // Read config for author info
  let config;
  try {
    const configContent = await fs.readFile(CONFIG_FILE, 'utf-8');
    config = JSON.parse(configContent);
  } catch (error) {
    throw new Error('Cannot read config file.');
  }
  
  // Create tree from staged files
  const treeEntries = Object.entries(index.files).map(([name, info]) => ({
    mode: info.mode,
    name,
    hash: info.hash
  }));
  
  const treeHash = await createTree(treeEntries);
  
  // Get parent commit (if exists)
  let parentHash = null;
  try {
    const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
    const refMatch = headContent.match(/ref: (.+)/);
    
    if (refMatch) {
      const refPath = path.join(MYGIT_DIR, refMatch[1].trim());
      try {
        parentHash = (await fs.readFile(refPath, 'utf-8')).trim();
      } catch (error) {
        // First commit on this branch - parentHash stays null
      }
    }
  } catch (error) {
    // No HEAD file yet
  }
  
  // Create commit object
  const commitHash = await createCommit(
    treeHash,
    parentHash,
    message,
    config.user
  );
  
  // Update branch ref
  try {
    const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
    const refMatch = headContent.match(/ref: (.+)/);
    
    if (refMatch) {
      const refPath = path.join(MYGIT_DIR, refMatch[1].trim());
      await fs.mkdir(path.dirname(refPath), { recursive: true });
      await fs.writeFile(refPath, commitHash + '\n');
    }
  } catch (error) {
    throw new Error(`Failed to update HEAD: ${error.message}`);
  }
  
  // Clear staging area
  await fs.writeFile(INDEX_FILE, JSON.stringify({ files: {} }, null, 2));
  
  return commitHash;
}