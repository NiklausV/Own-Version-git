// cli-tool/src/commands/checkout.js
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { HEAD_FILE, INDEX_FILE, REFS_DIR } from '../core/constants.js';
import { readObject } from '../core/objects.js';
import { updateRef, getCurrentBranch } from '../core/refs.js';
import { getWorkingTreeFiles } from '../utils/fileSystem.js';

export async function checkoutCommand(target, options = {}) {
  const currentBranch = await getCurrentBranch();
  
  // Check if target is a branch or commit hash
  const isBranch = await isBranchName(target);
  
  if (isBranch && !options.create) {
    await checkoutBranch(target);
  } else if (options.create) {
    await createAndCheckoutBranch(target);
  } else {
    // Assume it's a commit hash
    await checkoutCommit(target);
  }
}

async function isBranchName(name) {
  try {
    const branchPath = path.join(REFS_DIR, 'heads', name);
    await fs.access(branchPath);
    return true;
  } catch {
    return false;
  }
}

async function checkoutBranch(branchName) {
  const branchPath = path.join(REFS_DIR, 'heads', branchName);
  
  try {
    const commitHash = (await fs.readFile(branchPath, 'utf-8')).trim();
    
    // Update working tree
    await updateWorkingTree(commitHash);
    
    // Update HEAD to point to branch
    await fs.writeFile(HEAD_FILE, `ref: refs/heads/${branchName}\n`);
    
    console.log(chalk.green(`✓ Switched to branch '${branchName}'`));
  } catch (error) {
    throw new Error(`Branch '${branchName}' not found`);
  }
}

async function createAndCheckoutBranch(branchName) {
  const branchPath = path.join(REFS_DIR, 'heads', branchName);
  
  // Check if branch already exists
  try {
    await fs.access(branchPath);
    throw new Error(`Branch '${branchName}' already exists`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  // Get current commit
  const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
  const refMatch = headContent.match(/ref: (.+)/);
  
  let currentHash;
  if (refMatch) {
    const refPath = path.join(process.cwd(), '.mygit', refMatch[1].trim());
    try {
      currentHash = (await fs.readFile(refPath, 'utf-8')).trim();
    } catch {
      throw new Error('No commits yet to branch from');
    }
  } else {
    currentHash = headContent.trim();
  }
  
  // Create new branch pointing to current commit
  await fs.mkdir(path.dirname(branchPath), { recursive: true });
  await fs.writeFile(branchPath, currentHash + '\n');
  
  // Update HEAD to point to new branch
  await fs.writeFile(HEAD_FILE, `ref: refs/heads/${branchName}\n`);
  
  console.log(chalk.green(`✓ Created and switched to new branch '${branchName}'`));
}

async function checkoutCommit(commitHash) {
  // Verify commit exists
  const commit = await readObject(commitHash);
  if (!commit || commit.type !== 'commit') {
    throw new Error(`Commit '${commitHash}' not found`);
  }
  
  // Update working tree
  await updateWorkingTree(commitHash);
  
  // Update HEAD to point directly to commit (detached HEAD)
  await fs.writeFile(HEAD_FILE, commitHash + '\n');
  
  console.log(chalk.yellow('⚠ You are in \'detached HEAD\' state'));
  console.log(chalk.gray('  You can create a new branch with: mygit checkout -b <branch-name>'));
  console.log(chalk.green(`✓ HEAD is now at ${commitHash.substring(0, 7)}`));
}

async function updateWorkingTree(commitHash) {
  // Parse commit to get tree
  const commit = await readObject(commitHash);
  const parsed = parseCommit(commit.content);
  const tree = await readObject(parsed.tree);
  
  // Get current working tree files
  const workingFiles = await getWorkingTreeFiles();
  
  // Parse tree entries
  const treeEntries = parseTreeEntries(tree.content);
  
  // Remove files not in target commit
  for (const file of workingFiles) {
    if (!treeEntries[file]) {
      try {
        await fs.unlink(file);
        console.log(chalk.gray(`  Removed ${file}`));
      } catch (error) {
        console.log(chalk.yellow(`  Warning: Could not remove ${file}`));
      }
    }
  }
  
  // Write files from target commit
  for (const [filename, entry] of Object.entries(treeEntries)) {
    const blob = await readObject(entry.hash);
    
    // Create directory if needed
    const dir = path.dirname(filename);
    if (dir !== '.') {
      await fs.mkdir(dir, { recursive: true });
    }
    
    await fs.writeFile(filename, blob.content);
    console.log(chalk.gray(`  Updated ${filename}`));
  }
  
  // Clear staging area
  await fs.writeFile(INDEX_FILE, JSON.stringify({ files: {} }, null, 2));
}

function parseCommit(content) {
  const lines = content.split('\n');
  const tree = lines[0].split(' ')[1];
  const parent = lines[1]?.startsWith('parent') ? lines[1].split(' ')[1] : null;
  
  return { tree, parent };
}

function parseTreeEntries(treeContent) {
  const entries = {};
  const lines = treeContent.split('\n').filter(Boolean);
  
  for (const line of lines) {
    const [mode, rest] = line.split(' ');
    const [name, hash] = rest.split('\0');
    entries[name] = { mode, hash };
  }
  
  return entries;
}