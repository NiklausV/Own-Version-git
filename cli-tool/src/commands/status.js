// cli-tool/src/commands/status.js
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { INDEX_FILE, HEAD_FILE } from '../core/constants.js';
import { hashContent } from '../core/hash.js';

export async function statusCommand() {
  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
  
  console.log(chalk.bold('On branch main'));
  console.log();
  
  if (Object.keys(index.files).length > 0) {
    console.log(chalk.green('Changes to be committed:'));
    console.log(chalk.gray('  (use "mygit reset" to unstage)'));
    console.log();
    
    for (const file of Object.keys(index.files)) {
      console.log(chalk.green(`\tmodified:   ${file}`));
    }
    console.log();
  }
  
  // Check for untracked/modified files
  const allFiles = await getWorkingTreeFiles();
  const untracked = [];
  
  for (const file of allFiles) {
    if (!index.files[file]) {
      untracked.push(file);
    }
  }
  
  if (untracked.length > 0) {
    console.log(chalk.red('Untracked files:'));
    console.log(chalk.gray('  (use "mygit add <file>..." to track)'));
    console.log();
    
    for (const file of untracked) {
      console.log(chalk.red(`\t${file}`));
    }
  }
}

async function getWorkingTreeFiles(dir = '.', files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name === '.mygit' || entry.name === 'node_modules') continue;
    
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await getWorkingTreeFiles(fullPath, files);
    } else {
      files.push(fullPath.replace(/^\.\//, ''));
    }
  }
  
  return files;
}