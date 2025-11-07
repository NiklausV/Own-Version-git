// cli-tool/src/core/refs.js
import fs from 'fs/promises';
import path from 'path';
import { HEAD_FILE, REFS_DIR } from './constants.js';

export async function getCurrentBranch() {
  const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
  const match = headContent.match(/ref: refs\/heads\/(.+)/);
  return match ? match[1].trim() : null;
}

export async function getCurrentCommit() {
  const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
  const refMatch = headContent.match(/ref: (.+)/);
  
  if (refMatch) {
    // HEAD points to a branch
    const refPath = path.join(process.cwd(), '.mygit', refMatch[1].trim());
    try {
      return (await fs.readFile(refPath, 'utf-8')).trim();
    } catch {
      return null;
    }
  } else {
    // Detached HEAD - directly points to commit
    return headContent.trim();
  }
}

export async function updateRef(ref, commitHash) {
  const refPath = path.join(process.cwd(), '.mygit', ref);
  await fs.mkdir(path.dirname(refPath), { recursive: true });
  await fs.writeFile(refPath, commitHash + '\n');
}

export async function listBranches() {
  const headsDir = path.join(REFS_DIR, 'heads');
  
  try {
    const branches = await fs.readdir(headsDir);
    const currentBranch = await getCurrentBranch();
    
    return branches.map(branch => ({
      name: branch,
      current: branch === currentBranch
    }));
  } catch (error) {
    return [];
  }
}

export async function createBranch(branchName, commitHash) {
  const branchPath = path.join(REFS_DIR, 'heads', branchName);
  
  // Check if branch exists
  try {
    await fs.access(branchPath);
    throw new Error(`Branch '${branchName}' already exists`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  
  // Create branch
  await fs.mkdir(path.dirname(branchPath), { recursive: true });
  await fs.writeFile(branchPath, commitHash + '\n');
}

export async function deleteBranch(branchName) {
  const currentBranch = await getCurrentBranch();
  
  if (branchName === currentBranch) {
    throw new Error(`Cannot delete current branch '${branchName}'`);
  }
  
  const branchPath = path.join(REFS_DIR, 'heads', branchName);
  
  try {
    await fs.unlink(branchPath);
  } catch (error) {
    throw new Error(`Branch '${branchName}' not found`);
  }
}

export async function isDetached() {
  const headContent = await fs.readFile(HEAD_FILE, 'utf-8');
  return !headContent.startsWith('ref:');
}