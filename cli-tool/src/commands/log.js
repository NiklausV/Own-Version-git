// cli-tool/src/commands/log.js
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { HEAD_FILE } from '../core/constants.js';
import { readObject } from '../core/objects.js';

export async function logCommand(count = 10) {
  // Get current commit
  const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
  const refMatch = headContent.match(/ref: (.+)/);
  
  if (!refMatch) {
    console.log('No commits yet');
    return;
  }
  
  const refPath = path.join(process.cwd(), '.mygit', refMatch[1].trim());
  let currentHash;
  
  try {
    currentHash = (await fs.readFile(refPath, 'utf-8')).trim();
  } catch (error) {
    console.log('No commits yet');
    return;
  }
  
  let shown = 0;
  while (currentHash && shown < count) {
    const commit = await readObject(currentHash);
    
    // Parse commit
    const lines = commit.content.split('\n');
    const tree = lines[0].split(' ')[1];
    const parent = lines[1]?.startsWith('parent') ? lines[1].split(' ')[1] : null;
    const author = lines.find(l => l.startsWith('author'))?.substring(7);
    const messageStart = lines.findIndex(l => l === '') + 1;
    const message = lines.slice(messageStart).join('\n');
    
    // Display commit
    console.log(chalk.yellow(`commit ${currentHash}`));
    console.log(chalk.gray(`Author: ${author}`));
    console.log(chalk.gray(`Date:   ${new Date(parseInt(author.split(' ').pop()) * 1000).toLocaleString()}`));
    console.log();
    console.log(`    ${message}`);
    console.log();
    
    currentHash = parent;
    shown++;
  }
}
