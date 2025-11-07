// cli-tool/src/commands/init.js
import fs from 'fs/promises';
import path from 'path';
import { MYGIT_DIR, OBJECTS_DIR, REFS_DIR } from '../core/constants.js';

export async function initCommand() {
  // Check if already initialized
  try {
    await fs.access(MYGIT_DIR);
    throw new Error('Repository already initialized');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  // Create directory structure
  await fs.mkdir(MYGIT_DIR, { recursive: true });
  await fs.mkdir(OBJECTS_DIR, { recursive: true });
  await fs.mkdir(path.join(REFS_DIR, 'heads'), { recursive: true });
  
  // Initialize HEAD to point to main branch
  await fs.writeFile(
    path.join(MYGIT_DIR, 'HEAD'),
    'ref: refs/heads/main\n'
  );
  
  // Create empty index (staging area)
  await fs.writeFile(
  path.join(MYGIT_DIR, 'index.json'),
  JSON.stringify({ files: {} }, null, 2)
);
  
  // Create config file
  await fs.writeFile(
    path.join(MYGIT_DIR, 'config'),
    JSON.stringify({
      user: {
        name: process.env.USER || 'Unknown',
        email: 'user@example.com'
      }
    }, null, 2)
  );
}